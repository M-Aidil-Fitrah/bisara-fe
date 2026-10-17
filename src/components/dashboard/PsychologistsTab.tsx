import { Plus } from 'lucide-react'
import { img } from '../../lib/images'
import { usePsychologists } from '../../lib/appointments'
import type { SessionRecord } from '../../types'

interface PsychologistsTabProps {
  data: SessionRecord[]
  onOpenAddPsy: () => void
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export default function PsychologistsTab({ data, onOpenAddPsy }: PsychologistsTabProps) {
  const psychologists = usePsychologists()

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

      <div className="grid gap-4 md:grid-cols-2">
        {psychologists.map((p) => {
          const mine = data.filter((d) => d.psikolog === p.name)
          const initials = p.name
            .replace(/^dr\. /, '')
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0] ?? '')
            .join('')
          const lastDate = mine[0]?.date ? fmtDate(mine[0].date) : 'Baru'

          return (
            <div key={p.name} data-dash className="rounded-xl bg-surface p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {p.photo ? (
                    <img
                      src={img(p.photo, 200)}
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
                      {p.focus} · BISINDO {p.bisindo}
                    </p>
                    {p.email && <p className="text-xs text-brand mt-0.5">{p.email}</p>}
                  </div>
                </div>
                <span className="rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand">
                  Aktif
                </span>
              </div>
              <dl className="mt-6 grid grid-cols-3 border-t border-line pt-5">
                {[
                  ['Sesi ditangani', mine.length],
                  [
                    'Rata-rata durasi',
                    mine.length
                      ? `${Math.round(mine.reduce((s, d) => s + d.durationMin, 0) / mine.length)} mnt`
                      : '—',
                  ],
                  [
                    'Terakhir aktif',
                    lastDate,
                  ],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="mt-1 text-xl font-light">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
      </div>
    </>
  )
}
