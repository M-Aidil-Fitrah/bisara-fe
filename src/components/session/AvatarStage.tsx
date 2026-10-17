import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Avatar from '../Avatar'

export interface AvatarStageProps {
  signing: boolean
  caption: React.ReactNode
  big?: boolean
  setBig?: (b: boolean) => void
  speed?: number
  setSpeed?: (n: number) => void
  onReplay?: () => void
  className?: string
}

export default function AvatarStage({
  signing,
  caption,
  big,
  setBig,
  speed,
  setSpeed,
  onReplay,
  className = '',
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
