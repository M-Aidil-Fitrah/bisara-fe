import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Volume2,
  Sparkles,
} from 'lucide-react'
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
    s.push({
      from: 'tuli',
      text: a,
      step: s.step,
      status: 'CONFIRMED',
      conf,
      manual: conf === undefined,
    })
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
          <div className="rounded-xl bg-surface p-5 sm:p-6 border border-line">
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
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        Status: REVIEW_REQUIRED (Pemeriksaan Jawaban)
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand border border-brand/20">
                      <Sparkles className="size-3" />
                      Keyakinan AI: {Math.round(det.conf * 100)}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-ink">
                      Apakah teks ini sudah sesuai dengan jawabanmu?
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      Pesan belum dikirim ke psikolog. Anda dapat memeriksa hasil pengenalan kamera terlebih dahulu.
                    </p>
                  </div>

                  <div className="rounded-xl border border-line bg-paper/60 p-4">
                    <p className="text-xs text-muted uppercase tracking-wider">Hasil Pengenalan Isyarat:</p>
                    <p className={`${big ? 'text-4xl' : 'text-3xl'} mt-1 font-semibold text-brand tracking-tight`}>
                      "{det.a}"
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => send(det.a, det.conf)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                      <CheckCircle2 className="size-4" />
                      <span>Benar, Konfirmasi & Kirim</span>
                      <Volume2 className="size-3.5 opacity-80" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhase('manual')}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 transition"
                    >
                      <AlertTriangle className="size-4 text-amber-600" />
                      Koreksi Jawaban
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhase('ready')}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-3 text-sm text-muted hover:text-ink transition"
                    >
                      <RotateCcw className="size-4" />
                      Rekam Ulang
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                    <div>
                      <h3 className="text-xl font-medium">Koreksi Jawaban (Pilih Jawaban Resmi)</h3>
                      <p className="mt-0.5 text-xs text-muted">
                        Pilih frasa jawaban resmi BISARA berikut yang sesuai dengan kondisi Anda:
                      </p>
                    </div>
                    {det && (
                      <button
                        type="button"
                        onClick={() => setPhase('confirm')}
                        className="text-xs text-brand hover:underline"
                      >
                        Kembali ke hasil isyarat ("{det.a}")
                      </button>
                    )}
                  </div>
                  <div className={`mt-2 grid gap-2.5 ${isOpening ? 'grid-cols-2' : 'sm:grid-cols-5'}`}>
                    {s.options.map((o, i) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => send(o)}
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
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setPhase('ready')}
                      className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition"
                    >
                      <RotateCcw className="size-3.5" />
                      Batal koreksi, peragakan isyarat kembali
                    </button>
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
