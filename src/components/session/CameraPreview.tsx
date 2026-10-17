import { useEffect, useRef, useState } from 'react'
import { Camera, VideoOff } from 'lucide-react'

export interface CameraPreviewProps {
  active: boolean
  small?: boolean
}

export default function CameraPreview({ active, small }: CameraPreviewProps) {
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
