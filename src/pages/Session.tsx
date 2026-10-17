import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Mic, Play, Pause, PhoneOff, Camera, VideoOff } from 'lucide-react'
import Avatar from '../components/Avatar'
import { Button, img } from '../components/ui'
import { useAppointments, usePsychologists } from '../lib/appointments'
import { TuliLobby, PsikologLobby } from './Lobby'
import { ANSWERS, OPENING } from '../data'
import { useAuth } from '../lib/auth'
import { useLiveSession, STEPS, SIGN_MS, speak } from '../lib/live'
import { saveSession, scorePss, level } from '../lib/history'
import type { Appt, Msg } from '../types'

export default function Session() {
  const user = useAuth()
  const { setStatus, release } = useAppointments()
  const [appt, setAppt] = useState<Appt | null>(null)
  if (!user?.kind) return null
  const leave = () => {
    if (appt && user.kind === 'psikolog') release(appt.id)
    setAppt(null)
    window.scrollTo({ top: 0 })
  }
  if (!appt) {
    return user.kind === 'tuli' ? (
      <TuliLobby
        name={user.name}
        onJoin={(a) => {
          setAppt(a)
          window.scrollTo({ top: 0 })
        }}
      />
    ) : (
      <PsikologLobby
        name={user.name}
        onStart={(a) => {
          setStatus(a.id, 'live')
          setAppt(a)
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }
  return user.kind === 'tuli' ? (
    <TuliView appt={appt} onLeave={leave} />
  ) : (
    <PsikologView appt={appt} onLeave={leave} onSaved={() => setStatus(appt.id, 'done')} />
  )
}

/* ------------------------------------------------------------------ */

function Band({
  role,
  step,
  partner,
  onLeave,
  onReset,
}: {
  role: React.ReactNode
  step: number
  partner: boolean
  onLeave: () => void
  onReset: () => void
}) {
  const done = step >= STEPS.length
  const qNo = step - OPENING.length + 1
  const cur = STEPS[step]
  const isOpening = cur ? cur.opening : false

  return (
    <div className="bg-ink pb-6 pt-28 text-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-brand-soft">
              <span className={`size-1.5 rounded-full ${partner ? 'bg-[#7fd1a8]' : 'bg-[#e8c27a]'}`} />
              {role} · {partner ? 'Terhubung' : 'Mode simulasi'}
            </p>
            <p className="mt-2 flex items-baseline gap-3 text-4xl font-light tracking-tight">
              {done ? 'Selesai' : isOpening ? 'Pembuka' : `Butir ${String(qNo).padStart(2, '0')}`}
              {!done && !isOpening && <span className="text-lg text-paper/40">/ 10</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onReset}
              className="h-10 rounded-lg px-4 text-sm text-paper/70 ring-1 ring-paper/20 hover:text-paper"
            >
              Ulang
            </button>
            <button
              onClick={onLeave}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#b8483e] px-4 text-sm text-white hover:bg-[#a03d34]"
            >
              <PhoneOff className="size-4" /> Keluar
            </button>
          </div>
        </div>
        <div className="mt-6 flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                s.opening ? 'w-6' : 'flex-1'
              } ${i < step ? 'bg-brand-soft' : i === step ? 'bg-paper' : 'bg-paper/15'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Stage({
  signing,
  caption,
  big,
  setBig,
  speed,
  setSpeed,
  onReplay,
  className = '',
}: {
  signing: boolean
  caption: React.ReactNode
  big?: boolean
  setBig?: (b: boolean) => void
  speed?: number
  setSpeed?: (n: number) => void
  onReplay?: () => void
  className?: string
}) {
  const cap = useRef<HTMLParagraphElement>(null)
  useLayoutEffect(() => {
    if (cap.current) gsap.fromTo(cap.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' })
  }, [caption])
  return (
    <div className={`relative overflow-hidden rounded-xl bg-ink ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_40%,#2a5c8c_0%,transparent_70%)] opacity-70" />
      <div className="absolute inset-x-0 top-[7%] mx-auto h-[62%] w-fit">
        <Avatar signing={signing} className="h-full w-auto" />
      </div>
      <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 rounded-md bg-ink/60 px-2.5 py-1.5 text-xs text-paper/80 backdrop-blur">
          <span className={`size-1.5 rounded-full ${signing ? 'animate-pulse bg-[#7fd1a8]' : 'bg-paper/40'}`} />
          {signing ? 'Berisyarat' : 'Avatar BISINDO'}
        </span>
        {setSpeed && (
          <div className="flex items-center gap-1 rounded-md bg-ink/60 p-1 text-xs text-paper/80 backdrop-blur">
            {[0.5, 0.75, 1].map((v) => (
              <button
                key={v}
                onClick={() => setSpeed(v)}
                aria-pressed={speed === v}
                className={`h-7 rounded px-2 ${speed === v ? 'bg-paper text-ink' : 'hover:text-paper'}`}
              >
                {v}×
              </button>
            ))}
            <span className="mx-0.5 h-4 w-px bg-paper/20" />
            <button
              onClick={() => setBig?.(!big)}
              aria-pressed={big}
              aria-label="Perbesar teks"
              className={`h-7 rounded px-2 ${big ? 'bg-paper text-ink' : 'hover:text-paper'}`}
            >
              Aa
            </button>
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/90 to-transparent px-5 pb-5 pt-16">
        <p ref={cap} className={`${big ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'} leading-snug text-paper`}>
          {caption}
        </p>
        {onReplay && (
          <button onClick={onReplay} className="mt-2 text-sm text-brand-soft underline-offset-4 hover:underline">
            Ulangi isyarat
          </button>
        )}
      </div>
    </div>
  )
}

function useScrollBottom(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  }, [dep])
  return ref
}

const time = (t: number) =>
  new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

/* ------------------------------ TULI ------------------------------ */

type TPhase = 'wait' | 'signing' | 'ready' | 'detecting' | 'confirm' | 'manual'

function TuliView({ appt, onLeave }: { appt: Appt; onLeave: () => void }) {
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
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.05 },
      )
    }
  }, [phase])

  const record = () => {
    setPhase('detecting')
    t.current = window.setTimeout(() => {
      const conf = 0.55 + Math.random() * 0.43
      const curStep = STEPS[s.step]
      const isOpening = curStep ? curStep.opening : false
      const a = s.options[Math.floor(Math.random() * (isOpening ? 1 : s.options.length))] ?? s.options[0]
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
      <Band role={`Bersama ${appt.psikolog}`} step={s.step} partner={s.partnerOnline} onLeave={onLeave} onReset={s.reset} />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-2">
        {/* Left: call + chat */}
        <div className="flex flex-col gap-5">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-ink">
            <img
              src={img(psi?.photo ?? 'photo-1573495804664-b1c0849525af', 1200)}
              alt={`Video ${appt.psikolog}`}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <p className="absolute bottom-3 left-4 text-sm text-paper">{appt.psikolog}</p>
            <div className="absolute bottom-3 right-3 w-28 overflow-hidden rounded-lg ring-2 ring-paper/80 sm:w-36">
              <Cam active={phase === 'detecting'} small />
            </div>
          </div>

          <div className="flex min-h-[280px] flex-1 flex-col rounded-xl bg-surface">
            <p className="border-b border-line px-5 py-3 text-xs uppercase tracking-[0.14em] text-brand">Percakapan</p>
            <div ref={chat} className="max-h-[360px] flex-1 space-y-3 overflow-y-auto p-5">
              {s.msgs.length === 0 && <p className="text-muted">Menunggu psikolog memulai sesi…</p>}
              {s.msgs.map((m) => (
                <Bubble key={m.id} m={m} mine={m.from === 'tuli'} big={big} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: avatar + respond */}
        <div className="flex flex-col gap-5">
          <Stage
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
                    {det && det.conf < 0.65 && <p className="text-sm text-warn">Isyarat kurang jelas, silakan pilih.</p>}
                  </div>
                  <div className={`mt-4 grid gap-2 ${isOpening ? 'grid-cols-2' : 'sm:grid-cols-5'}`}>
                    {s.options.map((o, i) => (
                      <button
                        key={o}
                        onClick={() => send(o)}
                        className="group flex items-center gap-4 rounded-lg bg-paper px-4 py-3.5 text-left transition hover:bg-brand hover:text-white sm:flex-col sm:items-start sm:gap-4"
                      >
                        {!isOpening && (
                          <span className="text-2xl font-light text-brand group-hover:text-brand-soft">{i}</span>
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

function Bubble({ m, mine, big }: { m: Msg; mine: boolean; big?: boolean }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-xl px-4 py-3 ${mine ? 'bg-brand text-white' : 'bg-paper'}`}>
        <p className={`${big ? 'text-lg' : 'text-[15px]'} leading-snug`}>{m.text}</p>
        <p className={`mt-1 text-[11px] ${mine ? 'text-white/60' : 'text-muted'}`}>
          {time(m.at)}
          {m.from === 'tuli' && (m.manual ? ' · manual' : ` · isyarat ${Math.round((m.conf ?? 0) * 100)}%`)}
        </p>
      </div>
    </div>
  )
}

/* ---------------------------- PSIKOLOG ---------------------------- */

function PsikologView({
  appt,
  onLeave,
  onSaved,
}: {
  appt: Appt
  onLeave: () => void
  onSaved: () => void
}) {
  const s = useLiveSession('psikolog', appt.id)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [signing, setSigning] = useState(false)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [playing, setPlaying] = useState<number | null>(null)
  const timers = useRef<number[]>([])
  const chat = useScrollBottom(s.msgs.length)
  const lastAns = useRef(s.answers.length)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  // Partner answers arrive from another tab: voice them.
  useEffect(() => {
    if (s.answers.length > lastAns.current && s.partnerOnline) {
      const lastItem = s.answers.at(-1)
      if (lastItem) speak(lastItem.text)
    }
    lastAns.current = s.answers.length
  }, [s.answers.length, s.partnerOnline, s.answers])

  const startSpeak = () => {
    const curStep = STEPS[s.step]
    if (!curStep) return
    const text = curStep.t
    setListening(true)
    setTranscript('')
    const words = text.split(' ')
    words.forEach((_, i) =>
      timers.current.push(
        window.setTimeout(() => setTranscript(words.slice(0, i + 1).join(' ')), 80 * (i + 1)),
      ),
    )
    timers.current.push(
      window.setTimeout(() => {
        setListening(false)
        s.push({ from: 'psikolog', text, step: s.step })
        setSigning(true)
        timers.current.push(window.setTimeout(() => setSigning(false), SIGN_MS))
      }, 80 * words.length + 400),
    )
  }

  const pssAns = s.answers.filter((a) => ANSWERS.includes(a.text)).map((a) => a.text)
  const score = scorePss(pssAns)
  const canSpeak = !listening && !s.pendingQuestion && !s.done

  const save = () => {
    const confAnswers = s.answers.filter((a) => typeof a.conf === 'number')
    const avgAccuracy = confAnswers.length
      ? confAnswers.reduce((x, a) => x + (a.conf ?? 0), 0) / confAnswers.length
      : 0.82

    saveSession({
      id: `BSR-${String(461 + Math.floor(Math.random() * 400)).padStart(4, '0')}`,
      date: new Date().toISOString(),
      psikolog: appt.psikolog,
      klien: appt.klien,
      durationMin: Math.max(
        1,
        Math.round(((s.msgs.at(-1)?.at ?? Date.now()) - (s.msgs[0]?.at ?? Date.now())) / 60000),
      ),
      score: pssAns.length ? score : null,
      accuracy: avgAccuracy,
      manual: s.answers.filter((a) => a.manual).length,
      status: s.done ? 'Selesai' : 'Dibatalkan',
      notes: notes || '—',
      lines: s.msgs.map(({ from, text, conf, manual }) => ({ from, text, conf, manual })),
    })
    setSaved(true)
    onSaved()
  }

  const playVoice = (m: Msg) => {
    setPlaying(m.id)
    speak(m.text)
    timers.current.push(window.setTimeout(() => setPlaying(null), 1800))
  }

  const lastQ = [...s.msgs].reverse().find((m) => m.from === 'psikolog')
  const curStep = STEPS[s.step]

  return (
    <div>
      <Band
        role={`Klien: ${appt.klien}`}
        step={s.step}
        partner={s.partnerOnline}
        onLeave={onLeave}
        onReset={() => {
          s.reset()
          setSaved(false)
        }}
      />
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          <Stage
            className="aspect-[4/3] lg:aspect-auto lg:min-h-[520px]"
            signing={signing}
            caption={
              lastQ ? lastQ.text : <span className="text-paper/50">Avatar akan memperagakan ucapan Anda.</span>
            }
          />

          {/* Chat with voice replies */}
          <div className="flex min-h-[420px] flex-col rounded-xl bg-surface">
            <p className="border-b border-line px-5 py-3 text-xs uppercase tracking-[0.14em] text-brand">
              Percakapan
            </p>
            <div ref={chat} className="max-h-[420px] flex-1 space-y-3 overflow-y-auto p-5">
              {s.msgs.length === 0 && <p className="text-muted">Tekan mikrofon dan bacakan pertanyaan pertama.</p>}
              {s.msgs.map((m) =>
                m.from === 'psikolog' ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl bg-brand px-4 py-3 text-white">
                      <p className="text-[15px] leading-snug">{m.text}</p>
                      <p className="mt-1 text-[11px] text-white/60">{time(m.at)} · terkirim ke avatar</p>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-start">
                    <div className="w-full max-w-[85%] rounded-xl bg-paper px-3 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => playVoice(m)}
                          aria-label="Putar suara"
                          className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-paper"
                        >
                          {playing === m.id ? (
                            <Pause className="size-4" />
                          ) : (
                            <Play className="size-4 translate-x-px" />
                          )}
                        </button>
                        <Voice active={playing === m.id} seed={m.id} />
                        <span className="text-xs text-muted">0:0{2 + (m.text.length % 3)}</span>
                      </div>
                      <p className="mt-2 px-1 text-[15px]">{m.text}</p>
                      <p className="mt-0.5 px-1 text-[11px] text-muted">
                        {time(m.at)} ·{' '}
                        {m.manual ? 'dipilih manual' : `isyarat ${Math.round((m.conf ?? 0) * 100)}%`}
                      </p>
                    </div>
                  </div>
                ),
              )}
              {s.pendingQuestion && !listening && <p className="text-sm text-muted">Klien sedang menjawab…</p>}
            </div>

            <div className="border-t border-line p-4">
              {s.done ? (
                <p className="text-sm text-muted">Semua butir telah dijawab. Lengkapi catatan lalu simpan sesi.</p>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={startSpeak}
                    disabled={!canSpeak}
                    aria-label="Bicara"
                    className={`relative grid size-14 shrink-0 place-items-center rounded-full transition ${
                      listening
                        ? 'bg-ink text-paper'
                        : canSpeak
                          ? 'bg-brand text-white hover:bg-brand-strong'
                          : 'bg-line text-muted'
                    }`}
                  >
                    {listening && <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />}
                    <Mic className="relative size-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    {listening ? (
                      <>
                        <Voice active seed={3} />
                        <p className="mt-1 truncate text-sm">{transcript}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-muted">{canSpeak ? 'Berikutnya, bacakan:' : 'Menunggu jawaban'}</p>
                        <p className="truncate text-[15px]">{curStep?.t ?? ''}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Consultation notes */}
        <div className="grid gap-5 rounded-xl bg-surface p-5 sm:p-7 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-[0.14em] text-brand">Catatan konsultasi</p>
              <span className="text-xs text-muted">Hanya terlihat oleh Anda</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                setSaved(false)
              }}
              rows={6}
              placeholder="Observasi, ekspresi klien, rencana tindak lanjut…"
              className="mt-4 w-full resize-y rounded-lg bg-paper p-4 leading-relaxed outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-brand"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-[0.14em] text-brand">PSS-10</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-light tracking-tight">{score}</span>
              <span className="text-muted">
                / 40 · {pssAns.length}/10 butir{pssAns.length === 10 && ` · ${level(score)}`}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  title={pssAns[i] ?? `Butir ${i + 1}`}
                  className={`flex h-10 items-end justify-center rounded text-[11px] ${
                    pssAns[i] ? 'bg-brand text-white' : 'bg-paper text-muted'
                  }`}
                >
                  <span className="pb-1">{pssAns[i] ? ANSWERS.indexOf(pssAns[i]) : i + 1}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Butir 4, 5, 7, 8 diskor terbalik. Bukan diagnosis.</p>
            <div className="mt-auto flex items-center gap-3 pt-6">
              <Button onClick={save} disabled={saved}>
                {saved ? 'Tersimpan' : 'Simpan sesi'}
              </Button>
              {saved && <span className="text-sm text-ok">Masuk ke riwayat admin.</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Voice({ active, seed }: { active: boolean; seed: number }) {
  return (
    <div className="flex h-7 flex-1 items-center gap-[3px]">
      {Array.from({ length: 28 }).map((_, i) => {
        const h = 25 + ((i * 37 + seed * 13) % 75)
        return (
          <span
            key={i}
            className={`w-[3px] rounded-full ${active ? 'bg-brand' : 'bg-ink/30'}`}
            style={{
              height: `${h}%`,
              animation: active ? `wave ${0.5 + (i % 5) * 0.12}s ease-in-out infinite` : undefined,
            }}
          />
        )
      })}
    </div>
  )
}

function Cam({ active, small }: { active: boolean; small?: boolean }) {
  const [streamActive, setStreamActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggleCamera = async () => {
    if (streamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      setStreamActive(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setStreamActive(true)
      } catch {
        // Fallback gracefully to simulated landmark feed
        setStreamActive(false)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const pts = [
    [48, 30],
    [40, 52],
    [56, 52],
    [30, 70],
    [66, 66],
    [26, 46],
    [72, 44],
    [50, 20],
  ]

  return (
    <div className="relative aspect-video overflow-hidden bg-ink-2">
      {streamActive ? (
        <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover -scale-x-100" />
      ) : (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <ellipse cx="48" cy="34" rx="10" ry="13" fill="#ffffff14" />
          <path d="M24 100 Q48 50 72 100" fill="#ffffff14" />
          {active && pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="#a9c5e0" />)}
          {active && (
            <polyline points="26,46 40,52 48,30 56,52 72,44" fill="none" stroke="#a9c5e0" strokeWidth=".6" />
          )}
        </svg>
      )}

      {active && (
        <div
          className="absolute inset-x-0 h-px bg-brand-soft shadow-[0_0_10px_#a9c5e0]"
          style={{ animation: 'scan 1.6s linear infinite' }}
        />
      )}

      <div className="absolute inset-x-1.5 top-1.5 flex items-center justify-between">
        <span className={`flex items-center gap-1 text-paper/80 ${small ? 'text-[10px]' : 'text-xs'}`}>
          <span className={`size-1.5 rounded-full ${active ? 'animate-pulse bg-red-400' : 'bg-paper/40'}`} /> Anda
        </span>
        <button
          onClick={toggleCamera}
          title={streamActive ? 'Matikan webcam' : 'Gunakan webcam asli'}
          className="rounded bg-ink/60 p-1 text-paper/70 hover:text-white"
        >
          {streamActive ? <VideoOff className="size-3" /> : <Camera className="size-3" />}
        </button>
      </div>
    </div>
  )
}
