import { Plus } from 'lucide-react'
import { usePsychologists } from '../../lib/appointments'
import type { SessionRecord } from '../../types'

interface PsychologistsTabProps {
  data: SessionRecord[]
  onOpenAddPsy: () => void
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export default function PsychologistsTab({ data, onOpenAddPsy }: PsychologistsTabProps) {
  const { list: psychologists, loading, error } = usePsychologists()

  return (
    <>
      <div data-dash className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-normal tracking-tight">Daftar Psikolog & Dokter</h1>
          <p className="mt-2 text-muted">
            Tenaga profesional yang terdaftar untuk mendampingi klien di klinik ini.
          </p>
        </div>
        <button
          onClick={onOpenAddPsy}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-strong"
        >
          <Plus className="size-4" /> Tambah Psikolog / Dokter
        </button>
      </div>

      {loading && <p className="rounded-xl bg-surface p-8 text-muted">Memuat psikolog dari server…</p>}
      {error && <p role="alert" className="rounded-xl bg-surface p-8 text-[#b8483e]">{error}</p>}
      {!loading && !error && <div className="grid gap-4 md:grid-cols-2">
        {psychologists.map((p) => {
          const mine = data.filter((d) => d.psychologistId === p.userId)
          const measuredDurations = mine.flatMap((session) => session.durationMin === null ? [] : [session.durationMin])
          const initials = p.name
            .replace(/^dr\. /, '')
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0] ?? '')
            .join('')
          const lastDate = mine[0]?.date ? fmtDate(mine[0].date) : 'Baru'
          const metrics: ReadonlyArray<{ label: string; value: string | number }> = [
            { label: 'Sesi ditangani', value: mine.length },
            {
              label: 'Rata-rata durasi',
              value: measuredDurations.length
                ? `${Math.round(measuredDurations.reduce((sum, value) => sum + value, 0) / measuredDurations.length)} mnt`
                : '—',
            },
            { label: 'Terakhir aktif', value: lastDate },
          ]

          return (
            <div key={p.name} data-dash className="rounded-xl bg-surface p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {p.photo ? (
                    <img
                      src={p.photo}
                      alt={p.name}
                      className="size-14 rounded-full object-cover ring-2 ring-line"
                    />
                  ) : (
                    <div className="grid size-14 place-items-center rounded-full bg-ink text-paper text-lg font-light">
                      {initials}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.focus}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand">
                  Aktif
                </span>
              </div>
              <dl className="mt-6 grid grid-cols-3 border-t border-line pt-5">
                {metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt className="text-xs text-muted">{metric.label}</dt>
                    <dd className="mt-1 text-xl font-light">{metric.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
      </div>}
    </>
  )
}
