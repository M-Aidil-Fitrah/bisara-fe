import { PhoneOff } from 'lucide-react'

export interface SessionHeaderProps {
  partnerName: string
  partnerOnline: boolean
  itemNumber: number
  totalItems: number
  isDone: boolean
  onLeave: () => void
  role: 'USER' | 'ADMIN'
}

export default function SessionHeader({
  partnerName,
  partnerOnline,
  itemNumber,
  totalItems,
  isDone,
  onLeave,
  role,
}: SessionHeaderProps) {
  return (
    <header className="shrink-0 border-b border-white/10 bg-ink text-paper shadow-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 truncate text-[11px] font-medium uppercase tracking-[0.12em] text-brand-soft">
              <span className={`size-2 rounded-full ${partnerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {partnerName} · {partnerOnline ? 'Terhubung' : 'Menunggu lawan bicara'}
            </p>
            <p className="mt-0.5 flex items-baseline gap-2 text-sm font-medium tracking-tight">
              {role === 'ADMIN' ? 'Ruang psikolog' : 'Ruang konsultasi'}
              <span className="text-xs font-normal text-paper/45">{isDone ? 'PSS-10 selesai' : `Pertanyaan ${itemNumber} / ${totalItems}`}</span>
            </p>
          </div>
            <button
              type="button"
              onClick={onLeave}
              aria-label="Akhiri layanan"
              className="flex h-8 shrink-0 items-center gap-2 rounded-lg bg-[#b8483e] px-3 text-xs font-semibold text-white transition hover:bg-[#a03d34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b8483e]"
            >
              <PhoneOff className="size-4" />
              <span>Akhiri layanan</span>
            </button>
        </div>
        <div className="hidden w-48 gap-1 sm:flex">
          {Array.from({ length: totalItems }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all duration-500 ${
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
