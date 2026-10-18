import AvatarCanvas from '../three/AvatarCanvas'

type Props = {
  signing?: boolean
  className?: string
  modelUrl: string
  actionName: string
  onAnimationsLoaded?: ((names: string[]) => void) | undefined
  framing?: 'upper-body' | 'thigh-up'
}

export default function Avatar({
  signing = false,
  className = '',
  modelUrl,
  actionName,
  onAnimationsLoaded,
  framing = 'upper-body',
}: Props) {
  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl ${className}`}>
      <AvatarCanvas signing={signing} modelUrl={modelUrl} actionName={actionName} onAnimationsLoaded={onAnimationsLoaded} framing={framing} className="size-full" />
    </div>
  )
}
