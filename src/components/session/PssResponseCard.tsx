import type { PssRoom } from '../../api/client'

const ANSWERS = ['Tidak pernah', 'Hampir tidak pernah', 'Kadang-kadang', 'Cukup sering', 'Sangat sering']

type PssResponseCardProps = {
  current: PssRoom['items'][number] | undefined
  isDone: boolean
  totalItems: number
  busy: boolean
  big: boolean
  score: number | null | undefined
  onAnswer: (value: number) => void
  onEnd: () => void
}

export default function PssResponseCard({
  current,
  isDone,
  totalItems,
  busy,
  big,
  score,
  onAnswer,
  onEnd,
}: PssResponseCardProps) {
  if (isDone) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4 text-center shadow-sm">
        <span className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">✓</span>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Skrining selesai</h2>
        <p className="mt-2 text-sm text-muted">Seluruh 10 pertanyaan PSS-10 telah dijawab.</p>
        <div className="mt-5 inline-flex items-baseline gap-2 rounded-2xl border border-line bg-paper px-6 py-4">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">Skor PSS-10:</span>
          <span className="text-4xl font-light tracking-tight text-brand">{score ?? '…'}</span>
          <span className="text-xs text-muted">/ 40</span>
        </div>
        <div className="mt-6">
          <button type="button" onClick={onEnd} className="rounded-xl bg-[#b8483e] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#a03d34]">
            Akhiri layanan
          </button>
        </div>
      </div>
    )
  }

  if (!current) {
    return <div className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted shadow-sm" role="status">Memuat pertanyaan PSS-10…</div>
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="mb-3 border-b border-line pb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">PSS-10 · Pertanyaan {current.itemNumber} dari {totalItems}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">Pilih jawaban Anda</h2>
        <p className="mt-1 text-xs text-muted">Jawaban Anda tersinkronisasi langsung ke pasangan room dan dihapus setelah sesi berakhir.</p>
      </div>
      <div className="grid gap-2">
        {ANSWERS.map((label, index) => (
          <button
            key={label}
            type="button"
            disabled={busy}
            onClick={() => onAnswer(index)}
            className="group flex items-center gap-3 rounded-xl border border-line bg-paper px-3 py-2 text-left shadow-sm transition hover:border-brand hover:bg-brand hover:text-white disabled:opacity-50"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-xs font-bold text-brand transition group-hover:bg-white/20 group-hover:text-white">{index}</span>
            <span className={`${big ? 'text-base font-semibold' : 'text-sm font-medium'} leading-snug`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
