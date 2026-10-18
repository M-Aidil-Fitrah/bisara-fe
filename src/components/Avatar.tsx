import AvatarCanvas from '../three/AvatarCanvas'
import type { AnimationClipTiming } from '../lib/signSequence'

type Props = {
  signing?: boolean
  className?: string
  modelUrl: string
  actionName: string
  onAnimationsLoaded?: ((clips: AnimationClipTiming[]) => void) | undefined
  framing?: 'upper-body' | 'thigh-up'
  animationStartOffsetMs?: number
  animationEndOffsetMs?: number
  playbackState?: 'playing' | 'paused' | 'stopped'
  playbackSpeed?: number
  actionKey?: string
}

export default function Avatar({
  signing = false,
  className = '',
  modelUrl,
  actionName,
  onAnimationsLoaded,
  framing = 'upper-body',
  animationStartOffsetMs = 0,
  animationEndOffsetMs,
  playbackState = 'playing',
  playbackSpeed = 1,
  actionKey = '',
}: Props) {
  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl ${className}`}>
      <AvatarCanvas signing={signing} modelUrl={modelUrl} actionName={actionName} onAnimationsLoaded={onAnimationsLoaded} framing={framing} animationStartOffsetMs={animationStartOffsetMs} animationEndOffsetMs={animationEndOffsetMs} playbackState={playbackState} playbackSpeed={playbackSpeed} actionKey={actionKey} className="size-full" />
    </div>
  )
}
