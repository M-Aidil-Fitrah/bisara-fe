import type { SessionRecord } from '../../types'

interface OverviewTabProps {
  data: SessionRecord[]
  onOpen: (s: SessionRecord) => void
  goHistory: () => void
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
const pct = (n: number) => `${Math.round(n * 100)}%`
const level = (s: number) => (s <= 13 ? 'Rendah' : s <= 26 ? 'Sedang' : 'Tinggi')

export default function OverviewTab({ data, onOpen, goHistory }: OverviewTabProps) {
  const done = data.filter((d) => d.status === 'Selesai')
  const scored = done.filter((item): item is SessionRecord & { score: number } => item.score !== null)
  const avg = scored.length ? scored.reduce((sum, item) => sum + item.score, 0) / scored.length : null
  const measuredAccuracy = data.filter(
    (item): item is SessionRecord & { accuracy: number } => item.accuracy !== null,
  )
  const acc = measuredAccuracy.length
    ? measuredAccuracy.reduce((sum, item) => sum + item.accuracy, 0) / measuredAccuracy.length
    : null
  const manual = done.length ? done.reduce((sum, item) => sum + item.manual, 0) / (done.length * 10) : null
  const dist = ['Rendah', 'Sedang', 'Tinggi'].map(
    (l) => done.filter((d) => level(d.score ?? 0) === l).length,
  )

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = new Date()
    end.setDate(end.getDate() - (7 - i) * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 7)
    return {
      label: end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      n: data.filter((d) => {
        const t = new Date(d.date)
        return t > start && t <= end
      }).length,
    }
  })
  const maxW = Math.max(...weeks.map((w) => w.n), 1)

  return (
    <>
      <div data-dash className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-normal tracking-tight">Ringkasan</h1>
          <p className="mt-2 text-muted">Aktivitas layanan BISARA dalam 8 minggu terakhir.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Sesi selesai', String(done.length), `${data.filter((item) => item.status === 'Dibatalkan').length} dibatalkan`],
          ['Rata-rata skor PSS-10', avg === null ? '—' : avg.toFixed(1), avg === null ? 'Belum ada skor' : `Kategori ${level(avg).toLowerCase()}`],
          ['Akurasi pengenalan isyarat', acc === null ? '—' : pct(acc), acc === null ? 'Belum ada hasil model' : 'Rata-rata keyakinan model'],
          ['Jawaban manual', manual === null ? '—' : pct(manual), manual === null ? 'Belum ada sesi selesai' : 'Dari sepuluh jawaban PSS-10'],
        ].map(([l, v, h]) => (
          <div key={l} data-dash className="rounded-xl bg-surface p-6">
            <p className="text-sm text-muted">{l}</p>
            <p className="mt-3 text-5xl font-light tracking-tight">{v}</p>
            <p className="mt-2 text-xs text-muted">{h}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div data-dash className="rounded-xl bg-surface p-6 xl:col-span-2">
          <div className="flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-[0.14em] text-brand">Sesi per minggu</p>
            <span className="text-xs text-muted">{data.length} total</span>
          </div>
          <div className="mt-8 flex h-52 items-end gap-2 sm:gap-4">
            {weeks.map((w, i) => (
              <div key={i} className="flex h-full flex-1 flex-col justify-end text-center">
                <span className="mb-2 text-xs text-muted">{w.n}</span>
                <div
                  className={`rounded-t-md ${i === weeks.length - 1 ? 'bg-brand' : 'bg-brand-soft'}`}
                  style={{ height: `${(w.n / maxW) * 100}%` }}
                />
                <span className="mt-2 truncate text-[11px] text-muted">{w.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div data-dash className="rounded-xl bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-brand">Tingkat stres klien</p>
          <div className="mt-6 flex h-3 overflow-hidden rounded-full">
            {dist.map((n, i) => (
              <div
                key={i}
                className={['bg-brand-soft', 'bg-brand', 'bg-ink'][i]}
                style={{ width: `${(n / Math.max(1, done.length)) * 100}%` }}
              />
            ))}
          </div>
          <ul className="mt-6 divide-y divide-line border-t border-line">
            {['Rendah · 0–13', 'Sedang · 14–26', 'Tinggi · 27–40'].map((l, i) => (
              <li key={l} className="flex items-center justify-between py-3 text-sm">
                <span className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${['bg-brand-soft', 'bg-brand', 'bg-ink'][i]}`} />
                  {l}
                </span>
                <span>
                  {dist[i] ?? 0}{' '}
                  <span className="text-muted">· {pct((dist[i] ?? 0) / Math.max(1, done.length))}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">Hanya bahan pertimbangan, bukan diagnosis.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div data-dash className="rounded-xl bg-surface p-6 xl:col-span-2">
          <div className="flex items-baseline justify-between">
            <p className="text-xs uppercase tracking-[0.14em] text-brand">Sesi terbaru</p>
            <button onClick={goHistory} className="text-sm text-brand hover:text-ink">
              Lihat semua
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="px-3 py-3 font-normal">Sesi</th>
                  <th className="px-3 py-3 font-normal">Klien</th>
                  <th className="px-3 py-3 font-normal">Durasi</th>
                  <th className="px-3 py-3 font-normal">PSS-10</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 6).map((r) => {
                  const l = r.score !== null ? level(r.score) : ''
                  return (
                    <tr
                      key={r.id}
                      onClick={() => onOpen(r)}
                      className="cursor-pointer border-b border-line last:border-0 hover:bg-paper/70"
                    >
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-ink">{r.id}</p>
                        <p className="text-xs text-muted">{fmtDate(r.date)} · {fmtTime(r.date)}</p>
                      </td>
                      <td className="px-3 py-3.5">{r.klien}</td>
                      <td className="px-3 py-3.5 text-muted">{r.durationMin === null ? '—' : `${r.durationMin} mnt`}</td>
                      <td className="px-3 py-3.5">
                        {r.status === 'Dibatalkan' || r.score === null ? (
                          <span className="rounded-md bg-paper px-2 py-1 text-xs text-muted">Dibatalkan</span>
                        ) : (
                          <span
                            className={`rounded-md px-2 py-1 text-xs ${
                              l === 'Tinggi'
                                ? 'bg-ink text-paper'
                                : l === 'Sedang'
                                  ? 'bg-brand text-white'
                                  : 'bg-brand-tint text-brand'
                            }`}
                          >
                            {r.score} · {l}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div data-dash className="rounded-xl bg-surface p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-brand">Kualitas data sesi</p>
          <p className="mt-2 text-sm text-muted">Ringkasan berdasarkan rekaman sesi dari backend.</p>
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {[
              ['Sesi dengan skor PSS-10', scored.length],
              ['Sesi dengan akurasi model', measuredAccuracy.length],
              ['Sesi tanpa akurasi model', data.filter((item) => item.accuracy === null).length],
            ].map(([label, value]) => (
              <li key={label} className="flex items-center justify-between py-3 text-sm">
                <span>{label}</span>
                <span className="text-muted">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
