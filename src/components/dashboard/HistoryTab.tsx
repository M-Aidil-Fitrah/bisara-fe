import { useState } from 'react'
import { Search } from 'lucide-react'
import type { SessionRecord } from '../../types'

interface HistoryTabProps {
  data: SessionRecord[]
  onOpen: (s: SessionRecord) => void
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
const pct = (n: number) => `${Math.round(n * 100)}%`
const level = (s: number) => (s <= 13 ? 'Rendah' : s <= 26 ? 'Sedang' : 'Tinggi')

export default function HistoryTab({ data, onOpen }: HistoryTabProps) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('Semua')
  const [lvl, setLvl] = useState('Semua')

  const rows = data.filter(
    (d) =>
      (status === 'Semua' || d.status === status) &&
      (lvl === 'Semua' || (d.score !== null && level(d.score) === lvl)) &&
      `${d.id} ${d.klien} ${d.psikolog}`.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <>
      <div data-dash className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-normal tracking-tight">Riwayat Sesi</h1>
          <p className="mt-2 text-muted">
            Hingga 50 sesi terbaru yang tercatat, termasuk transkrip dan catatan psikolog.
          </p>
        </div>
      </div>

      <div data-dash className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari ID, klien, atau psikolog..."
            aria-label="Cari sesi"
            className="h-11 w-full rounded-lg bg-surface pl-10 pr-4 outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-brand"
          />
          <Search className="absolute left-3.5 top-3.5 size-4 text-muted" />
        </div>
        <div className="flex overflow-x-auto rounded-lg bg-surface p-1 text-sm">
          {['Semua', 'Selesai', 'Dibatalkan'].map((o) => (
            <button
              key={o}
              onClick={() => setStatus(o)}
              className={`h-9 shrink-0 rounded-md px-3 transition ${
                status === o ? 'bg-brand text-white' : 'text-ink hover:bg-paper'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
        <div className="flex overflow-x-auto rounded-lg bg-surface p-1 text-sm">
          {['Semua', 'Rendah', 'Sedang', 'Tinggi'].map((o) => (
            <button
              key={o}
              onClick={() => setLvl(o)}
              className={`h-9 shrink-0 rounded-md px-3 transition ${
                lvl === o ? 'bg-brand text-white' : 'text-ink hover:bg-paper'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div data-dash className="rounded-xl bg-surface p-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="px-3 py-3 font-normal">Sesi</th>
                <th className="px-3 py-3 font-normal">Klien</th>
                <th className="px-3 py-3 font-normal">Psikolog</th>
                <th className="px-3 py-3 font-normal">Durasi</th>
                <th className="px-3 py-3 font-normal">Akurasi</th>
                <th className="px-3 py-3 font-normal">PSS-10</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const l = r.score !== null ? level(r.score) : ''
                return (
                  <tr
                    key={r.id}
                    onClick={() => onOpen(r)}
                    className="cursor-pointer border-b border-line last:border-0 hover:bg-paper/70"
                  >
                    <td className="px-3 py-3.5">
                      <p className="font-medium text-ink">{r.id}</p>
                      <p className="text-xs text-muted">
                        {fmtDate(r.date)} · {fmtTime(r.date)}
                      </p>
                    </td>
                    <td className="px-3 py-3.5">{r.klien}</td>
                    <td className="px-3 py-3.5 text-muted">{r.psikolog}</td>
                    <td className="px-3 py-3.5 text-muted">{r.durationMin === null ? '—' : `${r.durationMin} mnt`}</td>
                    <td className="px-3 py-3.5 text-muted">
                      {r.accuracy === null ? 'Belum tersedia' : pct(r.accuracy)}
                    </td>
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
          {rows.length === 0 && (
            <p className="p-10 text-center text-muted">Tidak ada sesi yang cocok dengan filter.</p>
          )}
        </div>
      </div>
    </>
  )
}
