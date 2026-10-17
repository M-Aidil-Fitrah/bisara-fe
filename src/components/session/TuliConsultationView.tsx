import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { usePsychologists } from '../../lib/appointments'
import { useLiveSession } from '../../lib/live'
import type { Appt } from '../../types'
import SessionHeader from './SessionHeader'
import AvatarStage from './AvatarStage'
import VideoCallStage from './VideoCallStage'
import MessageBubble from './MessageBubble'
import { useScrollBottom } from './useScrollBottom'

export type TPhase = 'wait' | 'signing' | 'ready'

export interface TuliConsultationViewProps {
  appt: Appt & { sessionId: string }
  onLeave: () => void
}

export default function TuliConsultationView({ appt, onLeave }: TuliConsultationViewProps) {
  const s = useLiveSession('tuli', appt.sessionId)
  const { list: psychologists } = usePsychologists()
  const psi = psychologists.find((p) => p.name === appt.psikolog)
  const [phase, setPhase] = useState<TPhase>('wait')
  const [speed, setSpeed] = useState(1)
  const [big, setBig] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const chat = useScrollBottom(s.msgs.length)
  const resp = useRef<HTMLDivElement>(null)

  const [prevQId, setPrevQId] = useState<string | undefined>(s.pendingQuestion?.id)
  useEffect(() => {
    if (prevQId === s.pendingQuestion?.id) return
    const timer = window.setTimeout(() => {
      setPrevQId(s.pendingQuestion?.id)
      setPhase(s.pendingQuestion ? (s.currentStep?.animation ? 'signing' : 'ready') : 'wait')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [prevQId, s.pendingQuestion, s.currentStep?.animation])

  useEffect(() => {
    if (phase === 'signing') {
      const timer = window.setTimeout(
        () => setPhase('ready'),
        (s.currentStep?.animation?.durationMs ?? 0) / speed,
      )
      return () => clearTimeout(timer)
    }
    return undefined
  }, [phase, speed, s.currentStep?.animation?.durationMs])

  useLayoutEffect(() => {
    if (resp.current?.children.length) {
      gsap.fromTo(
        resp.current.children,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.05 }
      )
    }
  }, [phase])

  const send = async (answer: string) => {
    setSendError(null)
    try {
      await s.push({
      from: 'tuli',
      text: answer,
      step: s.step,
      status: 'SENT',
      manual: true,
      })
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Jawaban gagal dikirim')
    }
  }

  const q = s.pendingQuestion
  const curStep = s.currentStep
  const isOpening = curStep ? curStep.opening : false

  return (
    <div>
      <SessionHeader
        role={`Bersama ${appt.psikolog}`}
        step={s.step}
        partner={s.partnerOnline}
        onLeave={onLeave}
        steps={s.steps}
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-2">
        {/* Left: call + chat */}
        <div className="flex flex-col gap-5">
          <VideoCallStage
            sessionId={appt.sessionId}
            role="tuli"
            partnerName={appt.psikolog}
            {...(psi?.photo ? { partnerPhoto: psi.photo } : {})}
          />

          <div className="flex min-h-[280px] flex-1 flex-col rounded-xl bg-surface">
            <p className="border-b border-line px-5 py-3 text-xs uppercase tracking-[0.14em] text-brand">
              Percakapan
            </p>
            <div ref={chat} className="max-h-[360px] flex-1 space-y-3 overflow-y-auto p-5">
              {s.msgs.length === 0 && <p className="text-muted">Menunggu psikolog memulai sesi…</p>}
              {s.msgs.map((m) => (
                <MessageBubble key={m.id} m={m} mine={m.from === 'tuli'} big={big} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: avatar + respond */}
        <div className="flex flex-col gap-5">
          <AvatarStage
            className="aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto lg:min-h-[440px] lg:flex-1"
            signing={phase === 'signing'}
            {...(curStep?.animation ? {
              modelUrl: curStep.animation.glbUrl,
              actionName: curStep.animation.animationName,
            } : {})}
            speed={speed}
            setSpeed={setSpeed}
            big={big}
            setBig={setBig}
            {...(q && curStep?.animation && phase !== 'signing'
              ? { onReplay: () => setPhase('signing') }
              : {})}
            caption={
              s.done ? (
                'Sesi selesai. Terima kasih.'
              ) : q ? (
                q.text
              ) : (
                <span className="text-paper/50">Menunggu pertanyaan…</span>
              )
            }
          />
          <div className="rounded-xl bg-surface p-5 sm:p-6 border border-line">
            <div ref={resp}>
              {s.loading ? (
                <p className="text-muted">Memuat sesi dari server…</p>
              ) : s.done ? (
                <p className="text-xl">Semua jawaban terkirim. Anda dapat keluar dari sesi.</p>
              ) : phase === 'wait' || phase === 'signing' ? (
                <p className="text-muted">
                  {phase === 'signing' ? 'Jawaban dapat diberikan setelah animasi selesai.' : 'Menunggu pertanyaan psikolog.'}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                    <div>
                      <h3 className="text-xl font-medium">Pilih jawaban yang sesuai</h3>
                      <p className="mt-0.5 text-xs text-muted">
                        Pengenalan isyarat otomatis belum diaktifkan karena model tervalidasi belum tersedia. Jawaban dikirim langsung ke server setelah Anda memilih.
                      </p>
                    </div>
                  </div>
                  {(s.error || sendError) && <p role="alert" className="text-sm text-[#b8483e]">{sendError ?? s.error}</p>}
                  <div className={`mt-2 grid gap-2.5 ${isOpening ? 'grid-cols-2' : 'sm:grid-cols-5'}`}>
                    {s.options.map((o, i) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => void send(o)}
                        className="group flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3 text-left transition hover:border-brand hover:bg-brand hover:text-white sm:flex-col sm:items-start sm:gap-2.5 shadow-sm"
                      >
                        {!isOpening && (
                          <span className="flex size-6 items-center justify-center rounded-md bg-brand/10 text-xs font-semibold text-brand group-hover:bg-white/20 group-hover:text-white">
                            {i}
                          </span>
                        )}
                        <span className={`${big ? 'text-base font-semibold' : 'text-sm font-medium'} leading-snug`}>
                          {o}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
