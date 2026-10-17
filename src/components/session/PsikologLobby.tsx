import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '../ui'
import { useAppointments } from '../../lib/appointments'
import { getHistory } from '../../lib/history'
import type { Appt, SessionRecord } from '../../types'
import { LobbyHero, LobbyLabel, ScoreTag, fmtDate } from './LobbyShared'

export interface PsikologLobbyProps {
  name: string
  onStart: (a: Appt) => void
}

function ClientPanel({
  appt,
  hist,
  onStart,
}: {
  appt: Appt
  hist: SessionRecord[]
  onStart: () => void
}) {
  const scored = hist.filter((h) => h.score !== null).slice(0, 6).reverse()
  const last = hist[0]

  return (
    <div data-reveal className="flex flex-col rounded-xl bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <LobbyLabel>{appt.status === 'waiting' ? 'Di ruang tunggu' : `Terjadwal ${appt.time}`}</LobbyLabel>
          <p className="mt-3 text-4xl font-normal">{appt.klien}</p>
          <p className="mt-1 text-muted">{appt.note} · Teman Tuli, BISINDO</p>
        </div>
        <Button arrow onClick={onStart}>
          {appt.status === 'waiting' ? 'Mulai sesi' : 'Mulai lebih awal'}
        </Button>
      </div>

      <dl className="mt-8 grid grid-cols-3 border-y border-line py-5">
        <div>
          <dt className="text-xs text-muted">Kunjungan</dt>
          <dd className="mt-1 text-3xl font-light">{hist.length}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Skor terakhir</dt>
          <dd className="mt-1 text-3xl font-light">{last?.score ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Terakhir</dt>
          <dd className="mt-1 text-lg">{last ? fmtDate(last.date) : 'Klien baru'}</dd>
        </div>
      </dl>

      {scored.length > 1 && (
        <div className="mt-6">
          <p className="text-xs text-muted">Tren skor PSS-10</p>
          <div className="mt-3 flex h-24 items-end gap-2">
            {scored.map((h) => {
              const val = h.score ?? 0
              return (
                <div key={h.id} className="flex h-full flex-1 flex-col justify-end text-center">
                  <span className="mb-1 text-[11px] text-muted">{val}</span>
                  <div className="rounded-t bg-brand-soft" style={{ height: `${(val / 40) * 100}%` }} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="text-xs text-muted">Catatan terakhir</p>
        <p className="mt-2 leading-relaxed">{last?.notes ?? 'Belum ada catatan. Ini sesi pertama klien.'}</p>
      </div>

      {hist.length > 0 && (
        <ul className="mt-6 divide-y divide-line border-t border-line text-sm">
          {hist.slice(0, 4).map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-4 py-3">
              <span className="text-muted">{fmtDate(h.date)}</span>
              <span className="flex-1 truncate">{h.psikolog}</span>
              <ScoreTag h={h} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function PsikologLobby({ name, onStart }: PsikologLobbyProps) {
  const { list, resetToDefault } = useAppointments()
  const all = useMemo(getHistory, [list])
  const queue = list
    .filter((a) => a.psikolog === name && a.status !== 'done')
    .sort(
      (a, b) =>
        (a.status === 'waiting' ? -1 : 0) - (b.status === 'waiting' ? -1 : 0) ||
        a.time.localeCompare(b.time)
    )
  const [sel, setSel] = useState<string | null>(null)
  const current = queue.find((a) => a.id === sel) ?? queue[0]
  const clientHist = current ? all.filter((h) => h.klien === current.klien) : []
  const mine = all.filter((h) => h.psikolog === name).slice(0, 8)
  const waiting = queue.filter((a) => a.status === 'waiting').length
  const hour = new Date().getHours()
  const greet = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : 'Selamat sore'

  return (
    <>
      <LobbyHero
        eyebrow="Jadwal hari ini"
        title={`${greet}, ${name.split(',')[0] ?? name}`}
        desc={`${queue.length} klien terjadwal${waiting ? ` · ${waiting} sedang di ruang tunggu` : ''}. Pilih klien untuk melihat riwayatnya sebelum memulai sesi.`}
      />
      <div className="mx-auto max-w-6xl space-y-16 px-6 py-12">
        {queue.length === 0 ? (
          <p className="text-muted">Tidak ada jadwal tersisa hari ini.</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            {/* Queue */}
            <div data-reveal className="rounded-xl bg-surface p-2">
              <div className="flex items-center justify-between px-4 pb-2 pt-4">
                <LobbyLabel>Antrean</LobbyLabel>
                <button
                  type="button"
                  onClick={resetToDefault}
                  title="Sinkronkan / reset ke antrean bawaan (Rafi Akbar)"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-muted hover:text-brand transition cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  Reset Antrean
                </button>
              </div>
              <ul>
                {queue.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => setSel(a.id)}
                      className={`flex w-full items-center gap-4 rounded-lg p-4 text-left transition ${
                        current?.id === a.id ? 'bg-paper' : 'hover:bg-paper/60'
                      }`}
                    >
                      <span className="w-12 shrink-0 text-sm text-muted">{a.time}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-lg">{a.klien}</span>
                        <span className="block truncate text-xs text-muted">{a.note}</span>
                      </span>
                      {a.status === 'waiting' ? (
                        <span className="flex items-center gap-1.5 rounded-md bg-[#f3e2c2] px-2 py-1 text-xs text-warn">
                          <span className="size-1.5 animate-pulse rounded-full bg-[#d79a2b]" />
                          Menunggu
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Terjadwal</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Client detail */}
            {current && <ClientPanel appt={current} hist={clientHist} onStart={() => onStart(current)} />}
          </div>
        )}

        <section>
          <div data-reveal>
            <LobbyLabel>Riwayat sesi saya</LobbyLabel>
            <h2 className="mt-3 text-3xl font-normal">Terakhir ditangani</h2>
          </div>
          <ul className="mt-8 border-t border-ink/80">
            {mine.map((h) => (
              <li
                data-reveal
                key={h.id}
                className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[140px_1fr_1.4fr_auto]"
              >
                <span className="text-sm text-muted">{fmtDate(h.date)}</span>
                <span className="text-lg sm:order-none">{h.klien}</span>
                <span className="col-span-2 truncate text-sm text-muted sm:col-span-1">{h.notes}</span>
                <ScoreTag h={h} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
