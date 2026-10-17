import AvatarCanvas from '../three/AvatarCanvas'

type Props = {
  signing?: boolean
  className?: string
  modelUrl: string
  actionName: string
}

export default function Avatar({
  signing = false,
  className = '',
  modelUrl,
  actionName,
}: Props) {
  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl ${className}`}>
      <AvatarCanvas signing={signing} modelUrl={modelUrl} actionName={actionName} className="size-full" />
    </div>
  )
}
