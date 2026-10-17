import React from 'react'
import { PhoneOff } from 'lucide-react'
import type { SessionStep } from '../../lib/live'
import { OPENING } from '../../data'

export interface SessionHeaderProps {
  role: React.ReactNode
  step: number
  partner: boolean
  onLeave: () => void
  steps: SessionStep[]
}

export default function SessionHeader({
  role,
  step,
  partner,
  onLeave,
  steps,
}: SessionHeaderProps) {
  const done = steps.length > 0 && step >= steps.length
  const qNo = step - OPENING.length + 1
  const cur = steps[step]
  const isOpening = cur ? cur.opening : false

  return (
    <div className="bg-ink pb-6 pt-28 text-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-brand-soft">
              <span className={`size-1.5 rounded-full ${partner ? 'bg-[#7fd1a8]' : 'bg-[#e8c27a]'}`} />
              {role} · {partner ? 'Terhubung' : 'Menunggu peserta lain'}
            </p>
            <p className="mt-2 flex items-baseline gap-3 text-4xl font-light tracking-tight">
              {done ? 'Selesai' : isOpening ? 'Pembuka' : `Butir ${String(qNo).padStart(2, '0')}`}
              {!done && !isOpening && <span className="text-lg text-paper/40">/ 10</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onLeave}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#b8483e] px-4 text-sm text-white hover:bg-[#a03d34]"
            >
              <PhoneOff className="size-4" /> Keluar
            </button>
          </div>
        </div>
        <div className="mt-6 flex gap-1">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                s.opening ? 'w-6' : 'flex-1'
              } ${i < step ? 'bg-brand-soft' : i === step ? 'bg-paper' : 'bg-paper/15'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
