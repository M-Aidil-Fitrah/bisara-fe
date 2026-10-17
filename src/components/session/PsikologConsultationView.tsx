import { useEffect, useRef, useState } from 'react'
import {
  Mic,
  Play,
  Pause,
  Video,
  Bot,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Send,
  Edit3,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '../ui'
import { ANSWERS } from '../../data'
import { useLiveSession, STEPS, SIGN_MS, speak } from '../../lib/live'
import { saveSession, scorePss, level } from '../../lib/history'
import type { Appt, Msg } from '../../types'
import SessionHeader from './SessionHeader'
import AvatarStage from './AvatarStage'
import VideoCallStage from './VideoCallStage'
import VoiceWave from './VoiceWave'
import { formatMsgTime } from './MessageBubble'
import { useScrollBottom } from './useScrollBottom'

export interface PsikologConsultationViewProps {
  appt: Appt
  onLeave: () => void
  onSaved: () => void
}

export default function PsikologConsultationView({
  appt,
  onLeave,
  onSaved,
}: PsikologConsultationViewProps) {
  const s = useLiveSession('psikolog', appt.id)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [reviewState, setReviewState] = useState<'idle' | 'listening' | 'review'>('idle')
  const [editableTranscript, setEditableTranscript] = useState('')
  const [signing, setSigning] = useState(false)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [playing, setPlaying] = useState<number | null>(null)
  const [leftTab, setLeftTab] = useState<'video' | 'avatar'>('video')
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

  const curStep = STEPS[s.step]

  const startSpeak = () => {
    if (!curStep) return
    const text = curStep.t
    setListening(true)
    setReviewState('listening')
    setTranscript('')
    setEditableTranscript(text)
    const words = text.split(' ')
    words.forEach((_, i) =>
      timers.current.push(
        window.setTimeout(() => setTranscript(words.slice(0, i + 1).join(' ')), 60 * (i + 1))
      )
    )
    timers.current.push(
      window.setTimeout(() => {
        setListening(false)
        setReviewState('review')
        setEditableTranscript(text)
      }, 60 * words.length + 300)
    )
  }

  const isPhraseInCatalog = Boolean(
    curStep &&
      STEPS.some((step) => step.t.trim().toLowerCase() === editableTranscript.trim().toLowerCase())
  )

  const confirmAndSend = () => {
    if (!editableTranscript.trim()) return
    const finalText = editableTranscript.trim()
    s.push({
      from: 'psikolog',
      text: finalText,
      step: s.step,
      status: 'CONFIRMED',
      phraseMatched: isPhraseInCatalog,
    })
    setSigning(true)
    setReviewState('idle')
    setEditableTranscript('')
    setTranscript('')
    timers.current.push(window.setTimeout(() => setSigning(false), SIGN_MS))
  }

  const cancelReview = () => {
    setReviewState('idle')
    setTranscript('')
    setEditableTranscript('')
    setListening(false)
  }

  const applyStandardPhrase = () => {
    if (curStep) {
      setEditableTranscript(curStep.t)
    }
  }

  const pssAns = s.answers.filter((a) => ANSWERS.includes(a.text)).map((a) => a.text)
  const score = scorePss(pssAns)
  const canSpeak = reviewState === 'idle' && !s.pendingQuestion && !s.done

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
        Math.round(((s.msgs.at(-1)?.at ?? Date.now()) - (s.msgs[0]?.at ?? Date.now())) / 60000)
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

  return (
    <div>
      <SessionHeader
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
          {/* Left Column: Client Live Video Call or 3D Avatar Preview */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl bg-surface p-1.5 border border-line">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLeftTab('video')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    leftTab === 'video'
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <Video className="size-3.5" />
                  Video Tatap Muka Klien
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab('avatar')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    leftTab === 'avatar'
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <Bot className="size-3.5" />
                  Pratinjau Avatar 3D
                </button>
              </div>
              <span className="hidden sm:inline-block text-[11px] font-mono text-muted pr-2">
                P2P Real-time
              </span>
            </div>

            {leftTab === 'video' ? (
              <VideoCallStage
                sessionId={appt.id}
                role="psikolog"
                partnerName={`Klien: ${appt.klien}`}
                className="aspect-[4/3] lg:aspect-auto lg:min-h-[460px] lg:flex-1"
              />
            ) : (
              <AvatarStage
                className="aspect-[4/3] lg:aspect-auto lg:min-h-[460px] lg:flex-1"
                signing={signing}
                caption={
                  lastQ ? lastQ.text : <span className="text-paper/50">Avatar akan memperagakan ucapan Anda.</span>
                }
              />
            )}
          </div>

          {/* Chat with voice replies */}
          <div className="flex min-h-[420px] flex-col rounded-xl bg-surface">
            <p className="border-b border-line px-5 py-3 text-xs uppercase tracking-[0.14em] text-brand">
              Percakapan
            </p>
            <div ref={chat} className="max-h-[420px] flex-1 space-y-3 overflow-y-auto p-5">
              {s.msgs.length === 0 && (
                <p className="text-muted">Tekan mikrofon dan bacakan pertanyaan pertama.</p>
              )}
              {s.msgs.map((m) =>
                m.from === 'psikolog' ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl bg-brand px-4 py-3 text-white shadow-sm">
                      <p className="text-[15px] leading-snug">{m.text}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white/80">
                        <CheckCircle2 className="size-3 text-emerald-300" />
                        <span>
                          {formatMsgTime(m.at)} · Terkonfirmasi {m.phraseMatched !== false ? '(Animasi Aktif)' : '(Teks Saja)'}
                        </span>
                      </div>
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
                        <VoiceWave active={playing === m.id} seed={m.id} />
                        <span className="text-xs text-muted">0:0{2 + (m.text.length % 3)}</span>
                      </div>
                      <p className="mt-2 px-1 text-[15px]">{m.text}</p>
                      <p className="mt-0.5 px-1 text-[11px] text-muted">
                        {formatMsgTime(m.at)} ·{' '}
                        {m.manual ? 'dipilih manual' : `isyarat ${Math.round((m.conf ?? 0) * 100)}%`}
                      </p>
                    </div>
                  </div>
                )
              )}
              {s.pendingQuestion && !listening && reviewState === 'idle' && (
                <p className="text-sm text-muted">Klien sedang menjawab…</p>
              )}
            </div>

            <div className="border-t border-line p-4">
              {s.done ? (
                <p className="text-sm text-muted">
                  Semua butir telah dijawab. Lengkapi catatan lalu simpan sesi.
                </p>
              ) : reviewState === 'review' ? (
                <div className="space-y-3 rounded-xl border border-brand/20 bg-brand/5 p-4 transition">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-300">
                        Pemeriksaan Pesan (Review Required)
                      </span>
                    </div>
                    {isPhraseInCatalog ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        <ShieldCheck className="size-3" />
                        Frasa Terverifikasi BISINDO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        <AlertCircle className="size-3" />
                        Variasi Teks Bebas
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-muted block mb-1 flex items-center justify-between">
                      <span>Hasil Transkripsi Suara (Dapat dikoreksi langsung):</span>
                      {!isPhraseInCatalog && curStep && (
                        <button
                          type="button"
                          onClick={applyStandardPhrase}
                          className="text-[11px] font-medium text-brand hover:underline"
                        >
                          Gunakan frasa resmi PSS-10
                        </button>
                      )}
                    </label>
                    <textarea
                      value={editableTranscript}
                      onChange={(e) => setEditableTranscript(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm leading-relaxed text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={startSpeak}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface transition"
                      >
                        <RotateCcw className="size-3.5 text-muted" />
                        Ulangi Bicara
                      </button>
                      <button
                        type="button"
                        onClick={cancelReview}
                        className="rounded-lg px-2.5 py-1.5 text-xs text-muted hover:text-ink transition"
                      >
                        Batal
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={confirmAndSend}
                      disabled={!editableTranscript.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-strong disabled:opacity-50 transition"
                    >
                      <Send className="size-3.5" />
                      Konfirmasi & Kirim ke Avatar
                    </button>
                  </div>
                </div>
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
                    {listening && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />
                    )}
                    <Mic className="relative size-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    {listening ? (
                      <>
                        <VoiceWave active seed={3} />
                        <p className="mt-1 truncate text-sm">{transcript}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-muted">
                          {canSpeak ? 'Berikutnya, bacakan:' : 'Menunggu jawaban'}
                        </p>
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
