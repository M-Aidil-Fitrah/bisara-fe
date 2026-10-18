import React, { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

const Avatar = lazy(() => import('../Avatar'))

export interface AvatarStageProps {
  signing: boolean
  caption: React.ReactNode
  big?: boolean | undefined
  setBig?: ((b: boolean) => void) | undefined
  speed?: number | undefined
  setSpeed?: ((n: number) => void) | undefined
  onReplay?: (() => void) | undefined
  className?: string | undefined
  modelUrl?: string | undefined
  actionName?: string | undefined
}

export default function AvatarStage({
  signing,
  caption,
  big,
  setBig,
  speed = 1,
  setSpeed,
  onReplay,
  className = '',
  modelUrl,
  actionName,
}: AvatarStageProps) {
  const cap = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    if (cap.current) {
      gsap.fromTo(
        cap.current,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
      )
    }
  }, [caption])

  return (
    <div className={`relative min-h-[260px] overflow-hidden rounded-2xl border border-line/20 bg-ink shadow-xl ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_40%,#2a5c8c_0%,transparent_70%)] opacity-70" />
      {modelUrl ? (
        <div className="absolute inset-x-0 top-[6%] mx-auto h-[62%] w-full flex items-center justify-center">
          <Suspense fallback={<p className="text-sm text-paper/60">Memuat avatar 3D…</p>}>
            <Avatar signing={signing} modelUrl={modelUrl} actionName={actionName ?? ''} className="h-full w-auto" />
          </Suspense>
        </div>
      ) : (
        <div className="absolute inset-x-6 top-1/3 text-center text-sm text-paper/60">
          Animasi BISINDO tervalidasi belum tersedia untuk frasa ini. Teks tetap ditampilkan.
        </div>
      )}

      {/* Top Controls Badge */}
      <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2 z-10">
        <span className="flex items-center gap-2 rounded-lg bg-ink/70 px-2.5 py-1.5 text-xs text-paper/85 backdrop-blur-md border border-white/10 shadow-md">
          <span className={`size-1.5 rounded-full ${signing ? 'animate-pulse bg-emerald-400' : 'bg-paper/40'}`} />
          {modelUrl ? (signing ? 'Berisyarat' : 'Avatar BISINDO') : 'Teks saja'}
        </span>
        {setSpeed && (
          <div className="flex items-center gap-1 rounded-lg bg-ink/70 p-1 text-xs text-paper/80 backdrop-blur-md border border-white/10 shadow-md">
            {[0.5, 0.75, 1].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSpeed(v)}
                aria-pressed={speed === v}
                className={`h-7 rounded-md px-2 font-mono transition ${speed === v ? 'bg-paper text-ink font-semibold' : 'hover:text-paper text-paper/70'}`}
              >
                {v}×
              </button>
            ))}
            <span className="mx-0.5 h-4 w-px bg-paper/20" />
            <button
              type="button"
              onClick={() => setBig?.(!big)}
              aria-pressed={big}
              aria-label="Perbesar teks"
              className={`h-7 rounded-md px-2 font-mono transition ${big ? 'bg-paper text-ink font-semibold' : 'hover:text-paper text-paper/70'}`}
            >
              Aa
            </button>
          </div>
        )}
      </div>

      {/* Bottom Caption Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/90 to-transparent px-6 pb-6 pt-16 z-10">
        <p ref={cap} className={`${big ? 'text-2xl sm:text-3xl font-medium' : 'text-lg sm:text-xl font-normal'} leading-snug text-paper tracking-tight`}>
          {caption}
        </p>
        {onReplay && modelUrl && (
          <button
            type="button"
            onClick={onReplay}
            className="mt-2 text-xs font-medium text-brand-soft underline-offset-4 hover:underline"
          >
            Ulangi isyarat
          </button>
        )}
      </div>
    </div>
  )
}
