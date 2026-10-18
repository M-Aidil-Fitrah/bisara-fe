import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { Phrase } from '../../api/client'
import { buildSignSequence, type AnimationClipTiming, type SignStep } from '../../lib/signSequence'

const Avatar = lazy(() => import('../Avatar'))

type SignSequencePlayerProps = {
  text: string
  phrases: Phrase[]
  className?: string
  emptyText?: string
  showSpeedControls?: boolean
}

type SequencePlaybackProps = {
  sequence: SignStep[]
  onRestart: () => void
  onAnimationsLoaded: (clips: AnimationClipTiming[]) => void
  playbackSpeed: number
}

type SpeedControlsProps = {
  playbackSpeed: number
  onChange: (speed: number) => void
}

function SpeedControls({ playbackSpeed, onChange }: SpeedControlsProps) {
  return <div className="absolute right-3 top-3 z-30 flex items-center gap-1 rounded-lg border border-white/10 bg-ink/80 p-1 text-xs text-paper/75 backdrop-blur-md" aria-label="Kecepatan avatar">
    {[0.75, 1, 1.25, 1.5].map((speed) => <button
      key={speed}
      type="button"
      onClick={() => onChange(speed)}
      aria-pressed={playbackSpeed === speed}
      className={`h-8 rounded-md px-2 font-mono transition ${playbackSpeed === speed ? 'bg-paper font-semibold text-ink' : 'hover:bg-paper/10 hover:text-paper'}`}
    >{speed}×</button>)}
  </div>
}

function SequencePlayback({ sequence, onRestart, onAnimationsLoaded, playbackSpeed }: SequencePlaybackProps) {
  const [index, setIndex] = useState(0)
  const current = sequence[index] ?? sequence[0]

  useEffect(() => {
    if (sequence.length < 2 || !current) return
    const timer = window.setTimeout(() => setIndex((value) => (value + 1) % sequence.length), current.durationMs / playbackSpeed)
    return () => window.clearTimeout(timer)
  }, [current, playbackSpeed, sequence.length])

  if (!current) return null

  return <>
    <Suspense fallback={<p className="grid h-full min-h-80 place-items-center text-sm text-paper/60">Memuat avatar…</p>}>
      <Avatar key={current.modelUrl} signing={current.hasAnimation} modelUrl={current.modelUrl} actionName={current.actionName} animationStartOffsetMs={current.startOffsetMs} animationEndOffsetMs={current.endOffsetMs} actionKey={`${current.id}-${index}`} animationSpeed={playbackSpeed} onAnimationsLoaded={current.modelUrl === '/models/avatar.glb' ? onAnimationsLoaded : undefined} framing="thigh-up" className="absolute inset-0 size-full" />
    </Suspense>
    <div className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-4 text-paper">
        <div className="max-w-[75%] rounded-xl border border-white/10 bg-ink/85 px-4 py-3 shadow-xl backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-soft">{current.kind === 'word' ? 'Gerakan kata' : 'Ejaan huruf'}</p>
          <p data-testid="sign-step-label" data-start-offset-ms={Math.round(current.startOffsetMs)} data-end-offset-ms={Math.round(current.endOffsetMs)} data-duration-ms={Math.round(current.durationMs)} className="mt-1 text-3xl font-semibold">{current.label}</p>
          {!current.hasAnimation && <p className="mt-1 text-xs text-paper/60">Clip alfabet belum tersedia; huruf tetap ditampilkan berurutan.</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-xl bg-ink/75 p-2 text-xs text-paper/70 backdrop-blur-md"><span>{index + 1}/{sequence.length}</span><button type="button" onClick={onRestart} className="grid size-9 place-items-center rounded-lg border border-paper/20 hover:bg-paper/10" aria-label="Ulangi terjemahan"><RotateCcw className="size-4" /></button></div>
    </div>
  </>
}

export default function SignSequencePlayer({ text, phrases, className = '', emptyText = 'Mulai mengetik untuk menampilkan avatar.', showSpeedControls = false }: SignSequencePlayerProps) {
  const [animationClips, setAnimationClips] = useState<AnimationClipTiming[]>([])
  const [restartKey, setRestartKey] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const sequence = useMemo(() => buildSignSequence(text, phrases, animationClips), [animationClips, phrases, text])
  const signature = sequence.map((step) => step.id).join('|')
  const handleAnimationsLoaded = useCallback((clips: AnimationClipTiming[]) => {
    setAnimationClips((previous) => previous.map((clip) => `${clip.name}:${clip.durationMs}:${clip.activeStartMs}:${clip.activeEndMs}`).join('|') === clips.map((clip) => `${clip.name}:${clip.durationMs}:${clip.activeStartMs}:${clip.activeEndMs}`).join('|') ? previous : clips)
  }, [])

  if (sequence.length === 0) {
    return <div className={`relative grid min-h-80 place-items-center rounded-2xl border border-white/10 bg-ink px-6 text-center text-paper/60 ${className}`}>
      {emptyText}
      {showSpeedControls && <SpeedControls playbackSpeed={playbackSpeed} onChange={setPlaybackSpeed} />}
    </div>
  }

  return <div className={`relative min-h-80 overflow-hidden rounded-2xl border border-white/10 bg-ink ${className}`}>
    <SequencePlayback key={`${signature}-${restartKey}`} sequence={sequence} playbackSpeed={playbackSpeed} onRestart={() => setRestartKey((value) => value + 1)} onAnimationsLoaded={handleAnimationsLoaded} />
    {showSpeedControls && <SpeedControls playbackSpeed={playbackSpeed} onChange={setPlaybackSpeed} />}
  </div>
}
