import { useCallback, useEffect, useRef, useState } from 'react'
import { ANSWERS, OPENING, PSS10 } from '../data'
import type { Kind, Msg } from '../types'

export const STEPS: { t: string; opening: boolean }[] = [
  ...OPENING.map((t) => ({ t, opening: true })),
  ...PSS10.map((t) => ({ t, opening: false })),
]

export const OPEN_ANSWERS = ['Saya mengerti', 'Mohon diulang']
export const SIGN_MS = 2600

const keyOf = (id: string) => `bisara-live-${id}`

export function speak(text: string) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'id-ID'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch {}
}

/**
 * Shared session state for the two devices. Tabs on the same browser sync through
 * BroadcastChannel; when no partner is detected the other side is simulated.
 */
export function useLiveSession(me: Kind, id: string) {
  const KEY = keyOf(id)
  const load = useCallback((): Msg[] => {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return []
      return JSON.parse(raw) as Msg[]
    } catch {
      return []
    }
  }, [KEY])

  const [msgs, setMsgs] = useState<Msg[]>(load)
  const [partnerAt, setPartnerAt] = useState(0)
  const [now, setNow] = useState(Date.now())
  const ch = useRef<BroadcastChannel | null>(null)
  const sim = useRef<number | null>(null)

  useEffect(() => {
    const c = new BroadcastChannel(KEY)
    ch.current = c
    c.onmessage = (e: MessageEvent<{ type: string; role?: Kind }>) => {
      if (e.data.type === 'hello' && e.data.role !== me) setPartnerAt(Date.now())
      if (e.data.type === 'sync') setMsgs(load())
    }
    const beat = () => {
      c.postMessage({ type: 'hello', role: me })
      setNow(Date.now())
    }
    beat()
    const t = setInterval(beat, 1500)
    return () => {
      clearInterval(t)
      c.close()
    }
  }, [me, KEY, load])

  const partnerOnline = now - partnerAt < 4000
  const write = useCallback(
    (next: Msg[]) => {
      localStorage.setItem(KEY, JSON.stringify(next))
      setMsgs(next)
      ch.current?.postMessage({ type: 'sync' })
    },
    [KEY],
  )

  const push = useCallback(
    (m: Omit<Msg, 'id' | 'at'>) => {
      const cur = load()
      const lastItem = cur.at(-1)
      const nextId = (lastItem ? lastItem.id : 0) + 1
      write([...cur, { ...m, id: nextId, at: Date.now() }])
    },
    [write, load],
  )

  const reset = useCallback(() => write([]), [write])

  const answers = msgs.filter((m) => m.from === 'tuli')
  const step = answers.filter((a) => a.text !== 'Mohon diulang').length
  const last = msgs.at(-1)
  const pendingQuestion = last?.from === 'psikolog' ? last : null
  const done = step >= STEPS.length
  const currentStep = STEPS[step]
  const options = currentStep?.opening ? OPEN_ANSWERS : ANSWERS

  // Simulate the missing device.
  useEffect(() => {
    if (partnerOnline || done || !currentStep) return
    if (sim.current !== null) clearTimeout(sim.current)

    if (me === 'tuli' && !pendingQuestion) {
      sim.current = window.setTimeout(
        () => push({ from: 'psikolog', text: currentStep.t, step, status: 'CONFIRMED', phraseMatched: true }),
        msgs.length ? 2200 : 1200,
      )
    }
    if (me === 'psikolog' && pendingQuestion) {
      sim.current = window.setTimeout(() => {
        const opts = currentStep.opening ? ['Saya mengerti'] : ANSWERS
        const a = opts[Math.floor(Math.random() * opts.length)] ?? opts[0]
        const conf = 0.7 + Math.random() * 0.28
        push({ from: 'tuli', text: a, step, status: 'CONFIRMED', conf })
        speak(a)
      }, SIGN_MS + 2600)
    }
    return () => {
      if (sim.current !== null) clearTimeout(sim.current)
    }
  }, [me, partnerOnline, pendingQuestion?.id, step, done, msgs.length, push, currentStep])

  return { msgs, push, reset, step, done, pendingQuestion, options, partnerOnline, answers }
}
