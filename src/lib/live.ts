import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ANSWERS, OPENING } from '../data'
import type { Kind, Msg } from '../types'
import {
  api,
  ApiError,
  WS_BASE_URL,
  type BackendPss10Item,
  type BackendSessionMessage,
} from '../api/client'
import { WebSocketServerEventSchema } from '../schemas/websocket'

export interface SessionStep {
  text: string
  opening: boolean
  phraseId?: string
  animation?: {
    glbUrl: string
    animationName: string
    durationMs: number
  }
}

export const OPEN_ANSWERS = ['Saya mengerti', 'Mohon diulang']

export function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'id-ID'
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

function mapMessage(message: BackendSessionMessage): Msg {
  return {
    id: message.id,
    from: message.senderRole === 'TULI' ? 'tuli' : 'psikolog',
    text: message.text,
    step: message.step,
    status: message.status,
    phraseMatched: message.phraseMatched,
    conf: message.confidence ?? undefined,
    manual: message.isManualCorrection,
    at: new Date(message.createdAt).getTime(),
  }
}

function buildSteps(items: BackendPss10Item[]): SessionStep[] {
  return [
    ...OPENING.map((text) => ({ text, opening: true })),
    ...items
      .sort((a, b) => a.itemNumber - b.itemNumber)
      .map((item) => {
        const phrase = item.phrases.find((candidate) => candidate.indonesianText === item.questionText)
        const animation = phrase?.animations[0]
        return {
          text: item.questionText,
          opening: false,
          phraseId: phrase?.id,
          animation: animation ? {
            glbUrl: animation.glbUrl,
            animationName: animation.animationName,
            durationMs: animation.durationMs,
          } : undefined,
        }
      }),
  ]
}

export function useLiveSession(me: Kind, sessionId: string) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [steps, setSteps] = useState<SessionStep[]>([])
  const [partnerOnline, setPartnerOnline] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const append = useCallback((message: Msg) => {
    setMsgs((current) => current.some((item) => item.id === message.id) ? current : [...current, message])
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [session, pssItems] = await Promise.all([api.sessions.get(sessionId), api.pss10.items()])
      setMsgs(session.messages.map(mapMessage))
      setSteps(buildSteps(pssItems))
      setError(null)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Sesi tidak dapat dimuat')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    let active = true
    queueMicrotask(() => { if (active) void reload() })
    return () => { active = false }
  }, [reload])

  useEffect(() => {
    const ws = new WebSocket(WS_BASE_URL)
    wsRef.current = ws
    ws.onopen = () => ws.send(JSON.stringify({ type: 'JOIN_ROOM', payload: { sessionId } }))
    ws.onmessage = (event) => {
      try {
        const parsed = WebSocketServerEventSchema.safeParse(JSON.parse(String(event.data)))
        if (!parsed.success) {
          setError('Server realtime mengirim data tidak valid')
          return
        }
        const data = parsed.data
        if (data.type === 'ROOM_JOINED') {
          setPartnerOnline(data.payload.memberCount > 1)
        } else if (data.type === 'MEMBER_JOINED' || data.type === 'MEMBER_LEFT') {
          setPartnerOnline(data.payload.memberCount > 1)
        } else if (data.type === 'MESSAGE_SENT') {
          append(mapMessage(data.payload))
        } else if (data.type === 'ERROR') {
          setError(data.error.message)
        }
      } catch {
        setError('Server realtime mengirim data tidak valid')
      }
    }
    ws.onerror = () => setError('Koneksi realtime tidak tersedia')
    ws.onclose = () => setPartnerOnline(false)
    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [append, sessionId])

  const answers = useMemo(() => msgs.filter((message) => message.from === 'tuli'), [msgs])
  const step = answers.filter((answer) => answer.text !== 'Mohon diulang').length
  const currentStep = steps[step]
  const last = msgs.at(-1)
  const pendingQuestion = last?.from === 'psikolog' ? last : null
  const done = steps.length > 0 && step >= steps.length
  const options = currentStep?.opening ? OPEN_ANSWERS : ANSWERS

  const push = useCallback(async (message: Omit<Msg, 'id' | 'at'>): Promise<void> => {
    const relatedStep = steps[message.step]
    const phraseId = message.from === 'psikolog' && relatedStep?.text === message.text
      ? relatedStep.phraseId
      : undefined
    const persisted = await api.sessions.addMessage(sessionId, {
      text: message.text,
      step: message.step,
      ...(phraseId ? { phraseId } : {}),
    })
    append(mapMessage(persisted))
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'MESSAGE_SENT',
        payload: { sessionId, messageId: persisted.id },
      }))
    }
  }, [append, sessionId, steps])

  return {
    msgs,
    push,
    reload,
    step,
    steps,
    currentStep,
    done,
    pendingQuestion,
    options,
    partnerOnline,
    answers,
    loading,
    error,
    me,
  }
}
