import { useState } from 'react'
import AvatarCanvas from '../three/AvatarCanvas'
import { Box, Sparkles } from 'lucide-react'

type Props = {
  signing?: boolean
  className?: string
  modelUrl?: string
  actionName?: string
  allowToggle?: boolean
}

/** BISINDO Avatar with Three.js GLB 3D renderer and stylized 2D fallback toggle */
export default function Avatar({
  signing = false,
  className = '',
  modelUrl = '/models/avatar.glb',
  actionName,
  allowToggle = true,
}: Props) {
  const [mode, setMode] = useState<'3d' | '2d'>('3d')

  if (mode === '3d') {
    return (
      <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl ${className}`}>
        <AvatarCanvas
          signing={signing}
          modelUrl={modelUrl}
          actionName={actionName}
          className="size-full"
        />
        {allowToggle && (
          <button
            type="button"
            onClick={() => setMode('2d')}
            title="Klik untuk beralih ke tampilan 2D"
            className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 rounded-lg bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink shadow-sm ring-1 ring-line/50 backdrop-blur transition hover:bg-surface hover:ring-brand/40"
          >
            <Box className="size-3.5 text-brand" /> 3D GLB Aktif
          </button>
        )}
      </div>
    )
  }

  const a = signing ? 'sign 1.1s ease-in-out infinite' : 'none'
  const b = signing ? 'sign2 1.3s ease-in-out infinite' : 'none'

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl ${className}`}>
      <svg viewBox="0 0 240 240" className="size-full max-h-[320px]" aria-label="Avatar 3D BISINDO" role="img">
        <defs>
          <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c6aa5" />
            <stop offset="1" stopColor="#22568a" />
          </linearGradient>
          <radialGradient id="skin" cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#f3d6c0" />
            <stop offset="1" stopColor="#d9ab8c" />
          </radialGradient>
        </defs>
        <ellipse cx="120" cy="232" rx="70" ry="6" fill="#0f1b2a" opacity=".07" />
        <path d="M48 240c4-52 32-80 72-80s68 28 72 80z" fill="url(#body)" />
        <path d="M104 160h32l-16 22z" fill="#7ea4c8" />
        <rect x="110" y="132" width="20" height="30" rx="8" fill="url(#skin)" />
        <ellipse cx="120" cy="100" rx="36" ry="42" fill="url(#skin)" />
        <path d="M84 96c0-30 16-46 38-46 22 0 36 16 34 42-8-14-22-22-40-22-14 0-24 10-32 26z" fill="#1d2b3a" />
        <circle cx="106" cy="104" r="3.2" fill="#1d2b3a" />
        <circle cx="134" cy="104" r="3.2" fill="#1d2b3a" />
        <path d="M110 122q10 7 20 0" stroke="#9c6450" strokeWidth="3" fill="none" strokeLinecap="round" />
        <g style={{ transformOrigin: '70px 190px', animation: a }}>
          <path d="M66 196 l14 -54" stroke="#2a64a0" strokeWidth="18" strokeLinecap="round" />
          <circle cx="82" cy="136" r="12" fill="url(#skin)" />
        </g>
        <g style={{ transformOrigin: '170px 190px', animation: b }}>
          <path d="M174 196 l-10 -48" stroke="#2a64a0" strokeWidth="18" strokeLinecap="round" />
          <circle cx="162" cy="142" r="12" fill="url(#skin)" />
        </g>
      </svg>
      {allowToggle && (
        <button
          type="button"
          onClick={() => setMode('3d')}
          title="Klik untuk kembali ke tampilan 3D GLB"
          className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 rounded-lg bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink shadow-sm ring-1 ring-line/50 backdrop-blur transition hover:bg-surface hover:ring-brand/40"
        >
          <Sparkles className="size-3.5 text-brand" /> Mode 2D Aktif (Ganti ke 3D)
        </button>
      )}
    </div>
  )
}
