import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Button, img } from '../ui'
import { usePsychologists } from '../../lib/appointments'
import { useLiveSession, STEPS, SIGN_MS } from '../../lib/live'
import type { Appt } from '../../types'
import SessionHeader from './SessionHeader'
import AvatarStage from './AvatarStage'
import VideoCallStage from './VideoCallStage'
import MessageBubble from './MessageBubble'
import { useScrollBottom } from './useScrollBottom'

export type TPhase = 'wait' | 'signing' | 'ready' | 'detecting' | 'confirm' | 'manual'

export interface TuliConsultationViewProps {
  appt: Appt
  onLeave: () => void
}

export default function TuliConsultationView({ appt, onLeave }: TuliConsultationViewProps) {
  const s = useLiveSession('tuli', appt.id)
  const psychologists = usePsychologists()
  const psi = psychologists.find((p) => p.name === appt.psikolog)
  const [phase, setPhase] = useState<TPhase>('wait')
  const [speed, setSpeed] = useState(1)
  const [big, setBig] = useState(false)
  const [det, setDet] = useState<{ a: string; conf: number } | null>(null)
  const t = useRef<number>(0)
  const chat = useScrollBottom(s.msgs.length)
  const resp = useRef<HTMLDivElement>(null)

  const play = () => {
    clearTimeout(t.current)
    setPhase('signing')
    t.current = window.setTimeout(() => setPhase('ready'), SIGN_MS / speed)
  }

  useEffect(() => {
    if (s.pendingQuestion) play()
    else setPhase('wait')
  }, [s.pendingQuestion?.id])

  useEffect(() => () => clearTimeout(t.current), [])

  useLayoutEffect(() => {
    if (resp.current?.children.length) {
      gsap.fromTo(
        resp.current.children,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.05 }
      )
    }
  }, [phase])

  const record = () => {
    setPhase('detecting')
    t.current = window.setTimeout(() => {
      const conf = 0.55 + Math.random() * 0.43
      const curStep = STEPS[s.step]
      const isOpening = curStep ? curStep.opening : false
      const a =
        s.options[Math.floor(Math.random() * (isOpening ? 1 : s.options.length))] ?? s.options[0]
      setDet({ a, conf })
      setPhase(conf < 0.65 ? 'manual' : 'confirm')
    }, 2200)
  }

  const send = (a: string, conf?: number) => {
    s.push({ from: 'tuli', text: a, step: s.step, conf, manual: conf === undefined })
    setDet(null)
  }

  const q = s.pendingQuestion
  const curStep = STEPS[s.step]
  const isOpening = curStep ? curStep.opening : false

  return (
    <div>
      <SessionHeader
        role={`Bersama ${appt.psikolog}`}
        step={s.step}
        partner={s.partnerOnline}
        onLeave={onLeave}
        onReset={s.reset}
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-2">
        {/* Left: call + chat */}
        <div className="flex flex-col gap-5">
          <VideoCallStage
            sessionId={appt.id}
            role="tuli"
            partnerName={appt.psikolog}
            partnerPhoto={img(psi?.photo ?? 'photo-1573495804664-b1c0849525af', 1200)}
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
            speed={speed}
            setSpeed={setSpeed}
            big={big}
            setBig={setBig}
            onReplay={q && phase !== 'signing' ? play : undefined}
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
          <div className="rounded-xl bg-surface p-5 sm:p-6">
            <div ref={resp}>
              {s.done ? (
                <p className="text-xl">Semua jawaban terkirim. Anda dapat keluar dari sesi.</p>
              ) : phase === 'wait' || phase === 'signing' ? (
                <p className="text-muted">Jawaban dapat diberikan setelah avatar selesai berisyarat.</p>
              ) : phase === 'ready' || phase === 'detecting' ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-normal">
                      {phase === 'detecting' ? 'Membaca isyarat…' : 'Peragakan jawaban Anda'}
                    </h3>
                    <p className="mt-1 text-sm text-muted">Kamera Anda tampil di pojok video.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPhase('manual')} className="text-sm text-brand hover:text-ink">
                      Pilih manual
                    </button>
                    <Button onClick={record} disabled={phase === 'detecting'}>
                      {phase === 'detecting' ? 'Merekam' : 'Mulai rekam'}
                    </Button>
                  </div>
                </div>
              ) : phase === 'confirm' && det ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-brand">
                    Terbaca sebagai · {Math.round(det.conf * 100)}%
                  </p>
                  <p className={`${big ? 'text-5xl' : 'text-4xl'} mt-2 font-light tracking-tight`}>{det.a}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button arrow onClick={() => send(det.a, det.conf)}>
                      Benar, kirim
                    </Button>
                    <Button variant="outline" onClick={() => setPhase('manual')}>
                      Ubah
                    </Button>
                    <button onClick={() => setPhase('ready')} className="px-2 text-sm text-muted hover:text-ink">
                      Rekam ulang
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-2xl font-normal">Pilih jawaban</h3>
                    {det && det.conf < 0.65 && (
                      <p className="text-sm text-warn">Isyarat kurang jelas, silakan pilih.</p>
                    )}
                  </div>
                  <div className={`mt-4 grid gap-2 ${isOpening ? 'grid-cols-2' : 'sm:grid-cols-5'}`}>
                    {s.options.map((o, i) => (
                      <button
                        key={o}
                        onClick={() => send(o)}
                        className="group flex items-center gap-4 rounded-lg bg-paper px-4 py-3.5 text-left transition hover:bg-brand hover:text-white sm:flex-col sm:items-start sm:gap-4"
                      >
                        {!isOpening && (
                          <span className="text-2xl font-light text-brand group-hover:text-brand-soft">
                            {i}
                          </span>
                        )}
                        <span className={`${big ? 'text-lg' : 'text-sm'} leading-tight`}>{o}</span>
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
