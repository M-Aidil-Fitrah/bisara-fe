import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { api, ApiError, WS_BASE_URL, type Meeting, type PssRoom } from '../api/client'
import { useAuth } from '../lib/auth'
import { useVideoCall } from '../lib/videoCall'
import { useAiAssistance } from '../hooks/useAiAssistance'
import { useSpeechCaption } from '../hooks/useSpeechCaption'
import { formatMsgTime } from '../lib/time'
import SessionHeader from '../components/session/SessionHeader'
import VideoCallStage from '../components/session/VideoCallStage'
import AvatarStage from '../components/session/AvatarStage'
import type { ChatMessage } from '../components/session/MessageBubble'
import ChatPanel from '../components/session/ChatPanel'
import PssResponseCard from '../components/session/PssResponseCard'
import WaitingRoom from '../components/session/WaitingRoom'
import ConsultationGuide from '../components/session/ConsultationGuide'
import PssSummary from '../components/session/PssSummary'
import AiSignComposer from '../components/session/AiSignComposer'

const CONSENT_MESSAGE = 'Bersedia, mulai.'

const ChatEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('CHAT'), payload: z.object({ text: z.string(), sender: z.object({ name: z.string(), role: z.enum(['USER', 'ADMIN']) }) }) }),
  z.object({ type: z.literal('CAPTION'), payload: z.object({ text: z.string(), isFinal: z.boolean(), sender: z.object({ name: z.string(), role: z.enum(['USER', 'ADMIN']) }) }) }),
  z.object({ type: z.literal('ERROR'), error: z.object({ message: z.string() }) }),
  z.object({ type: z.literal('MEETING_ENDED'), payload: z.object({ roomId: z.string() }) }),
  z.object({ type: z.literal('MEETING_JOINED'), payload: z.object({ roomId: z.string(), memberCount: z.number().optional() }) }),
  z.object({ type: z.literal('MEMBER_JOINED'), payload: z.object({ name: z.string(), role: z.enum(['USER', 'ADMIN']), memberCount: z.number().optional() }) }),
  z.object({ type: z.literal('MEMBER_LEFT'), payload: z.object({ name: z.string(), role: z.enum(['USER', 'ADMIN']), memberCount: z.number().optional() }) }),
  z.object({ type: z.literal('PEER_READY'), payload: z.object({ peerId: z.string().uuid(), role: z.enum(['USER', 'ADMIN']) }) }),
  z.object({ type: z.literal('PEER_LEFT'), payload: z.object({ peerId: z.string().uuid() }).optional() }),
])

export default function Meet() {
  const { partner } = useParams()
  const user = useAuth()
  const navigate = useNavigate()

  const [room, setRoom] = useState<Meeting | null>(null)
  const [pss, setPss] = useState<PssRoom | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [partnerOnline, setPartnerOnline] = useState(false)
  const [remoteCaption, setRemoteCaption] = useState('')
  const [consultationStarted, setConsultationStarted] = useState(false)

  // Avatar stage controls
  const [speed, setSpeed] = useState(1)
  const [big, setBig] = useState(false)
  const [signing, setSigning] = useState(false)

  // Realtime Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatStatus, setChatStatus] = useState('Menyambungkan chat…')
  const [socketJoined, setSocketJoined] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const role: 'USER' | 'ADMIN' = user?.role === 'admin' ? 'ADMIN' : 'USER'

  // Video Call integration
  const videoCall = useVideoCall({
    roomId: room?.id ?? '',
    socket,
    socketJoined,
  })
  const aiAssist = useAiAssistance(room?.id ?? '', videoCall.localStream, videoCall.playTts)
  const sendCaption = useCallback((text: string, isFinal: boolean) => {
    if (role !== 'ADMIN' || !room || !socket || socket.readyState !== WebSocket.OPEN) return
    setChatInput(text)
    socket.send(JSON.stringify({ type: 'CAPTION', payload: { roomId: room.id, text, isFinal } }))
  }, [role, room, socket])
  const speechCaption = useSpeechCaption(sendCaption)

  const videoCallRef = useRef(videoCall)
  useEffect(() => {
    videoCallRef.current = videoCall
  })

  // Poll only while matching. An active room has its own WebSocket lifecycle.
  useEffect(() => {
    if (!partner || !user || room?.status === 'ACTIVE') return
    let alive = true
    let fetching = false

    const refresh = async () => {
      if (fetching) return
      fetching = true
      try {
        const next = await api.meetings.match(partner)
        if (!alive) return
        setRoom(next)
        setError(null)
      } catch (cause) {
        if (alive) setError(cause instanceof ApiError ? cause.message : 'Antrean tidak tersedia')
      } finally {
        fetching = false
      }
    }

    void refresh()
    const interval = window.setInterval(() => void refresh(), 3_000)
    return () => {
      alive = false
      window.clearInterval(interval)
    }
  }, [partner, user, room?.status])

  // Load the participant's questions after the room lifecycle has settled on ACTIVE.
  useEffect(() => {
    if (role !== 'USER' || room?.status !== 'ACTIVE') return
    let alive = true
    void api.pss.get(room.id).then((next) => {
      if (alive) setPss(next)
    }).catch((cause: ApiError) => {
      if (alive) setError(cause.message)
    })
    return () => { alive = false }
  }, [role, room?.id, room?.status])

  // Single WebSocket connection for active room
  useEffect(() => {
    if (room?.status !== 'ACTIVE') return

    const ws = new WebSocket(WS_BASE_URL)

    ws.onopen = () => {
      setSocket(ws)
      ws.send(JSON.stringify({ type: 'JOIN_MEETING', payload: { roomId: room.id } }))
    }

    ws.onmessage = (event) => {
      try {
        const parsed = ChatEventSchema.safeParse(JSON.parse(String(event.data)))
        if (!parsed.success) return

        const msg = parsed.data
        if (msg.type === 'MEETING_JOINED') {
          setSocketJoined(true)
          setChatStatus('Chat sementara aktif')
          if ((msg.payload.memberCount ?? 1) > 1) {
            setPartnerOnline(true)
          }
        } else if (msg.type === 'MEMBER_JOINED') {
          setPartnerOnline(true)
        } else if (msg.type === 'MEMBER_LEFT') {
          setPartnerOnline(false)
          videoCallRef.current.handleRemotePeerLeft()
        } else if (msg.type === 'PEER_READY') {
          setPartnerOnline(true)
          videoCallRef.current.handleRemotePeerReady(msg.payload.peerId)
        } else if (msg.type === 'PEER_LEFT') {
          videoCallRef.current.handleRemotePeerLeft()
        } else if (msg.type === 'CHAT') {
          const { text, sender } = msg.payload
          if (text === CONSENT_MESSAGE) setConsultationStarted(true)
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              text,
              name: sender.name,
              role: sender.role,
              time: formatMsgTime(Date.now()),
            },
          ])
        } else if (msg.type === 'CAPTION') {
          setRemoteCaption(msg.payload.text)
        } else if (msg.type === 'ERROR') {
          setChatStatus(msg.error.message)
        } else if (msg.type === 'MEETING_ENDED') {
          navigate('/ritz')
        }
      } catch {
        // ignore parse error
      }
    }

    ws.onerror = () => {
      setChatStatus('Chat realtime tidak tersedia')
    }

    ws.onclose = () => {
      setSocketJoined(false)
      setPartnerOnline(false)
      setSocket(null)
    }

    return () => {
      ws.close()
      setSocket(null)
      setSocketJoined(false)
    }
  }, [room?.id, room?.status, navigate])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  // Keep the psychologist's PSS-10 recap current while the participant answers.
  useEffect(() => {
    if (role !== 'ADMIN' || room?.status !== 'ACTIVE') return
    let alive = true

    const refresh = async () => {
      try {
        const next = await api.pss.get(room.id)
        if (alive) setPss(next)
      } catch {
        // The primary meeting connection remains usable if this background refresh fails.
      }
    }

    void refresh()
    const interval = window.setInterval(() => void refresh(), 2_000)
    return () => {
      alive = false
      window.clearInterval(interval)
    }
  }, [role, room?.id, room?.status])

  // Current PSS Question & Asset
  const current = pss?.items.find((item) => !pss.answers.some((answer) => answer.itemId === item.id))
  const asset = current?.phrase.animations[0]
  const isDone = Boolean(pss && !current)
  const itemNumber = current ? current.itemNumber : 10
  const totalItems = pss?.items.length || 10
  const screeningActive = consultationStarted || (pss?.answers.length ?? 0) > 0 || isDone

  // Trigger signing when new question loads
  useEffect(() => {
    if (!asset) {
      return undefined
    }
    const timer = window.setTimeout(() => setSigning(false), (asset.durationMs || 3000) / speed)
    return () => {
      window.clearTimeout(timer)
    }
  }, [asset, speed])

  const submitAnswer = async (value: number) => {
    if (!room || !current) return
    setBusy(true)
    try {
      const nextPss = await api.pss.answer(room.id, current.id, value)
      setPss(nextPss)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Jawaban gagal disimpan')
    } finally {
      setBusy(false)
    }
  }

  const sendChat = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = chatInput.trim()
    if (!value || !socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify({
      type: 'CHAT',
      payload: { roomId: room?.id, text: value },
    }))
    setChatInput('')
  }

  const sendAiMessage = () => {
    const value = aiAssist.text.trim()
    if (!value || !socket || socket.readyState !== WebSocket.OPEN || !room) return
    socket.send(JSON.stringify({ type: 'CHAT', payload: { roomId: room.id, text: value, source: 'AI' } }))
    aiAssist.reset()
  }

  const consentToScreening = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !room) return
    socket.send(JSON.stringify({ type: 'CHAT', payload: { roomId: room.id, text: CONSENT_MESSAGE } }))
    setConsultationStarted(true)
  }

  const speakMessage = async (text: string) => {
    if (!room) return
    try { await videoCall.playTts(await api.ai.tts(room.id, text)) } catch { setError('Pesan belum dapat dibacakan.') }
  }

  const endSession = async () => {
    if (room) {
      try {
        await api.meetings.end(room.id)
      } catch {
        // ignore
      }
    }
    navigate('/ritz')
  }

  if (user === undefined) {
    return <p className="grid min-h-screen place-items-center text-muted" role="status">Memeriksa akun…</p>
  }
  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const partnerDisplayName = room?.partner.name || 'Ritz Konsultan Psikologi'
  const partnerPeerName = role === 'ADMIN'
    ? (room?.user.name || 'Pengguna Layanan')
    : (room?.admin?.name || 'Pendamping Ritz')

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink lg:h-screen lg:overflow-hidden">
      {/* 1. Header with Partner & Status Bar */}
      <SessionHeader
        partnerName={partnerDisplayName}
        partnerOnline={partnerOnline}
        itemNumber={itemNumber}
        totalItems={totalItems}
        isDone={isDone}
        onLeave={endSession}
        role={role}
      />

      <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col px-3 py-3 sm:px-4 lg:overflow-hidden">
        {error && (
          <div role="alert" className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2. Waiting Room State */}
        {!room && !error && (
          <div className="my-16 rounded-2xl bg-surface p-12 text-center border border-line" role="status">
            <p className="text-muted text-lg">Mencari pendamping Ritz…</p>
          </div>
        )}

        {room?.status === 'WAITING' && <WaitingRoom partnerName={room.partner.name} onCancel={endSession} />}

        {/* Role-aware consultation workspace */}
        {room?.status === 'ACTIVE' && (
          <div className={`grid min-h-0 flex-1 gap-3 lg:h-[calc(100vh-5.5rem)] ${role === 'ADMIN' ? 'lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.75fr)_minmax(260px,.6fr)]' : 'lg:grid-cols-[minmax(0,1.35fr)_minmax(330px,.8fr)]'}`}>
            <div className="flex min-h-0 flex-col gap-3">
              <VideoCallStage
                partnerName={partnerPeerName}
                callStatus={videoCall.callStatus}
                isCameraOn={videoCall.isCameraOn}
                isMicOn={videoCall.isMicOn}
                errorMsg={videoCall.errorMsg}
                localVideoRef={videoCall.localVideoRef}
                remoteVideoRef={videoCall.remoteVideoRef}
                toggleCamera={videoCall.toggleCamera}
                toggleMic={videoCall.toggleMic}
                callPartner={videoCall.callPartner}
                caption={remoteCaption}
                className="min-h-[260px] flex-1"
              />
              <ConsultationGuide role={role} started={screeningActive} canConsent={socketJoined} onConsent={consentToScreening} />
              {role === 'USER' && <AiSignComposer status={aiAssist.status} seconds={aiAssist.seconds} text={aiAssist.text} confidence={aiAssist.prediction?.confidence ?? 0} error={aiAssist.error} onTextChange={aiAssist.setText} onStart={aiAssist.start} onReset={aiAssist.reset} onSend={sendAiMessage} />}
              {role === 'USER' && <ChatPanel messages={messages} input={chatInput} status={chatStatus} big={big} mineRole={role} scrollRef={chatScrollRef} onInputChange={setChatInput} onSubmit={sendChat} className="h-56 shrink-0" />}
            </div>

            <div className="flex min-h-0 flex-col gap-3">
              <AvatarStage
                signing={signing}
                caption={isDone
                  ? 'Terima kasih sudah mau berbagi.'
                  : role === 'ADMIN'
                    ? messages.findLast((message) => message.role === 'ADMIN')?.text ?? 'Pratinjau avatar penerjemah untuk pesan psikolog.'
                    : messages.findLast((message) => message.role === 'ADMIN')?.text ?? (screeningActive ? current?.questionText : undefined) ?? 'Pesan psikolog akan diterjemahkan di sini.'}
                speed={speed}
                setSpeed={setSpeed}
                big={big}
                setBig={setBig}
                onReplay={asset ? () => setSigning(true) : undefined}
                modelUrl={asset?.glbUrl ?? '/models/avatar.glb'}
                actionName={asset?.animationName}
              />
              {role === 'ADMIN' ? (
                <ChatPanel messages={messages} input={chatInput} status={chatStatus} big={big} mineRole={role} scrollRef={chatScrollRef} onInputChange={setChatInput} onSubmit={sendChat} listening={speechCaption.listening} speechSupported={speechCaption.supported} speechError={speechCaption.error} onToggleSpeech={speechCaption.listening ? speechCaption.stop : speechCaption.start} onSpeakMessage={(text) => void speakMessage(text)} className="flex-1" />
              ) : screeningActive ? (
                <PssResponseCard current={current} isDone={isDone} totalItems={totalItems} busy={busy} big={big} score={pss?.score} onAnswer={(value) => void submitAnswer(value)} onEnd={endSession} />
              ) : (
                <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">Setelah Anda menekan <strong className="text-ink">Bersedia, mulai</strong>, sepuluh pertanyaan PSS-10 akan tampil di sini.</div>
              )}
            </div>
            {role === 'ADMIN' && <PssSummary pss={pss} />}
          </div>
        )}

      </main>
    </div>
  )
}
