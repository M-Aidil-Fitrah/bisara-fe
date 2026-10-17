import { PhoneOff } from 'lucide-react'

export interface SessionHeaderProps {
  partnerName: string
  partnerOnline: boolean
  itemNumber: number
  totalItems: number
  isDone: boolean
  onLeave: () => void
}

export default function SessionHeader({
  partnerName,
  partnerOnline,
  itemNumber,
  totalItems,
  isDone,
  onLeave,
}: SessionHeaderProps) {
  return (
    <header className="bg-ink pb-6 pt-24 text-paper border-b border-white/10 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-brand-soft">
              <span className={`size-2 rounded-full ${partnerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {partnerName} · {partnerOnline ? 'Terhubung' : 'Menunggu lawan bicara'}
            </p>
            <p className="mt-2 flex items-baseline gap-3 text-3xl sm:text-4xl font-light tracking-tight">
              {isDone ? 'Skrining Selesai' : `Pertanyaan ${String(itemNumber).padStart(2, '0')}`}
              {!isDone && <span className="text-lg text-paper/40">/ {totalItems}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onLeave}
              aria-label="Akhiri layanan"
              className="flex h-10 items-center gap-2 rounded-xl bg-[#b8483e] px-4 text-sm font-medium text-white hover:bg-[#a03d34] transition shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b8483e]"
            >
              <PhoneOff className="size-4" />
              <span>Akhiri layanan</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Ticks */}
        <div className="mt-6 flex gap-1.5">
          {Array.from({ length: totalItems }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                isDone || i < itemNumber - 1
                  ? 'bg-brand-soft'
                  : i === itemNumber - 1
                    ? 'bg-paper'
                    : 'bg-paper/15'
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  )
}
