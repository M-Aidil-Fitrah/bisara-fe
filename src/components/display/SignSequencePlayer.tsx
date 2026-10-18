import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, Square } from 'lucide-react'
import type { Phrase } from '../../api/client'
import { buildSignSequence, type AnimationClipTiming, type SignStep } from '../../lib/signSequence'

const Avatar = lazy(() => import('../Avatar'))

type PlaybackState = 'playing' | 'paused' | 'stopped'

type SignSequencePlayerProps = {
  text: string
  phrases: Phrase[]
  className?: string
  emptyText?: string
  showSpeedControls?: boolean
}

type SequencePlaybackProps = {
  sequence: SignStep[]
  playbackState: PlaybackState
  speed: number
  showSpeedControls: boolean
  onPlaybackStateChange: (state: PlaybackState) => void
  onStop: () => void
  onSpeedChange: (speed: number) => void
  onAnimationsLoaded: (clips: AnimationClipTiming[]) => void
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5] as const

function SequencePlayback({ sequence, playbackState, speed, showSpeedControls, onPlaybackStateChange, onStop, onSpeedChange, onAnimationsLoaded }: SequencePlaybackProps) {
  const [index, setIndex] = useState(0)
  const elapsedMsRef = useRef(0)
  const previousTimestampRef = useRef<number | null>(null)
  const current = sequence[index] ?? sequence[0]

  useEffect(() => {
    elapsedMsRef.current = 0
    previousTimestampRef.current = null
  }, [current?.id])

  useEffect(() => {
    if (playbackState !== 'playing' || sequence.length < 2 || !current) {
      previousTimestampRef.current = null
      return
    }
    let frameId = 0
    const tick = (timestamp: number) => {
      const previousTimestamp = previousTimestampRef.current
      previousTimestampRef.current = timestamp
      if (previousTimestamp !== null) elapsedMsRef.current += (timestamp - previousTimestamp) * speed
      if (elapsedMsRef.current >= current.durationMs) {
        elapsedMsRef.current = 0
        previousTimestampRef.current = timestamp
        setIndex((value) => (value + 1) % sequence.length)
      }
      frameId = window.requestAnimationFrame(tick)
    }
    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [current, playbackState, sequence.length, speed])

  if (!current) return null

  return <>
    <Suspense fallback={<p className="grid h-full min-h-80 place-items-center text-sm text-paper/60">Memuat avatar…</p>}>
      <Avatar key={current.modelUrl} signing={current.hasAnimation} modelUrl={current.modelUrl} actionName={current.actionName} animationStartOffsetMs={current.startOffsetMs} animationEndOffsetMs={current.endOffsetMs} playbackState={playbackState} playbackSpeed={speed} actionKey={`${current.id}-${index}`} onAnimationsLoaded={current.modelUrl === '/models/avatar.glb' ? onAnimationsLoaded : undefined} framing="thigh-up" className="absolute inset-0 size-full" />
    </Suspense>
    <div className="absolute inset-x-3 bottom-3 z-10 flex flex-col items-stretch gap-2 text-paper sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="max-w-full rounded-xl border border-white/10 bg-ink/85 px-4 py-3 shadow-xl backdrop-blur-md sm:max-w-[65%]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-soft">{current.kind === 'word' ? 'Gerakan kata' : 'Ejaan huruf'}</p>
        <p data-testid="sign-step-label" data-start-offset-ms={Math.round(current.startOffsetMs)} data-end-offset-ms={Math.round(current.endOffsetMs)} data-duration-ms={Math.round(current.durationMs)} className="mt-1 text-3xl font-semibold">{current.label}</p>
        {!current.hasAnimation && <p className="mt-1 text-xs text-paper/60">Clip alfabet belum tersedia; huruf tetap ditampilkan berurutan.</p>}
      </div>
      {showSpeedControls && <div className="flex w-full shrink-0 items-center justify-between gap-2 rounded-xl bg-ink/80 p-2 text-xs text-paper/70 backdrop-blur-md sm:w-auto sm:flex-col sm:items-end">
        <div role="group" aria-label="Kecepatan animasi" className="flex items-center gap-1">
          {PLAYBACK_SPEEDS.map((value) => <button key={value} type="button" aria-label={`Kecepatan ${value}x`} aria-pressed={speed === value} onClick={() => onSpeedChange(value)} className={`h-8 rounded-lg px-2 font-mono transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-soft ${speed === value ? 'bg-paper text-ink' : 'hover:bg-paper/10 hover:text-paper'}`}>{value}x</button>)}
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-1 tabular-nums">{index + 1}/{sequence.length}</span>
          <button type="button" onClick={() => onPlaybackStateChange(playbackState === 'playing' ? 'paused' : 'playing')} className="grid size-9 place-items-center rounded-lg border border-paper/20 transition hover:bg-paper/10 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-soft" aria-label={playbackState === 'playing' ? 'Jeda animasi' : 'Putar animasi'}>{playbackState === 'playing' ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}</button>
          <button type="button" onClick={onStop} disabled={playbackState === 'stopped'} className="grid size-9 place-items-center rounded-lg border border-paper/20 transition hover:bg-paper/10 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-soft disabled:cursor-not-allowed disabled:opacity-40" aria-label="Hentikan animasi"><Square aria-hidden="true" className="size-3.5 fill-current" /></button>
        </div>
      </div>}
    </div>
  </>
}

export default function SignSequencePlayer({ text, phrases, className = '', emptyText = 'Mulai mengetik untuk menampilkan avatar.', showSpeedControls = true }: SignSequencePlayerProps) {
  const [animationClips, setAnimationClips] = useState<AnimationClipTiming[]>([])
  const [restartKey, setRestartKey] = useState(0)
  const [playbackState, setPlaybackState] = useState<PlaybackState>('playing')
  const [speed, setSpeed] = useState(1)
  const sequence = useMemo(() => buildSignSequence(text, phrases, animationClips), [animationClips, phrases, text])
  const signature = sequence.map((step) => step.id).join('|')
  const handleAnimationsLoaded = useCallback((clips: AnimationClipTiming[]) => {
    setAnimationClips((previous) => previous.map((clip) => `${clip.name}:${clip.durationMs}:${clip.activeStartMs}:${clip.activeEndMs}`).join('|') === clips.map((clip) => `${clip.name}:${clip.durationMs}:${clip.activeStartMs}:${clip.activeEndMs}`).join('|') ? previous : clips)
  }, [])

  const stop = () => {
    setPlaybackState('stopped')
    setRestartKey((value) => value + 1)
  }

  if (sequence.length === 0) {
    return <div className={`grid min-h-80 place-items-center rounded-2xl border border-white/10 bg-ink px-6 text-center text-paper/60 ${className}`}>{emptyText}</div>
  }

  return <div className={`relative min-h-80 overflow-hidden rounded-2xl border border-white/10 bg-ink ${className}`}>
    <SequencePlayback key={`${signature}-${restartKey}`} sequence={sequence} playbackState={playbackState} speed={speed} showSpeedControls={showSpeedControls} onPlaybackStateChange={setPlaybackState} onStop={stop} onSpeedChange={setSpeed} onAnimationsLoaded={handleAnimationsLoaded} />
  </div>
}
