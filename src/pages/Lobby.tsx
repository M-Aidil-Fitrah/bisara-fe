import { useMemo, useState } from 'react'
import { Button, img } from '../components/ui'
import { useAppointments, usePsychologists } from '../lib/appointments'
import { getHistory, level } from '../lib/history'
import type { Appt, SessionRecord } from '../types'

export const shortName = (n: string) => {
  const [a, b] = n.split(' ')
  return b ? `${a} ${b[0]}.` : (a ?? n)
}
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

function Hero({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="bg-ink pb-14 pt-32 text-paper">
      <div data-hero className="mx-auto max-w-6xl px-6">
        <p className="text-xs uppercase tracking-[0.14em] text-brand-soft">{eyebrow}</p>
        <h1 className="mt-4 text-5xl font-normal tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-xl text-paper/70">{desc}</p>
      </div>
    </div>
  )
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs uppercase tracking-[0.14em] text-brand">{children}</p>
)

/* ============================ TEMAN TULI ============================ */

export function TuliLobby({ name, onJoin }: { name: string; onJoin: (a: Appt) => void }) {
  const klien = shortName(name)
  const psychologists = usePsychologists()
  const { list, request, cancel } = useAppointments()
  const active = list.find((a) => a.klien === klien && a.status !== 'done')
  const history = useMemo(() => getHistory().filter((h) => h.klien === klien), [klien, list])

  return (
    <>
      <Hero
        eyebrow="Sesi"
        title={`Halo, ${name.split(' ')[0] ?? name}`}
        desc="Pilih psikolog untuk memulai skrining. Pertanyaan akan tampil dalam avatar BISINDO, dan Anda menjawab dengan isyarat."
      />
      <div className="mx-auto max-w-6xl space-y-16 px-6 py-12">
        {active && (
          <div data-reveal className="grid overflow-hidden rounded-xl bg-surface md:grid-cols-[280px_1fr]">
            <img
              src={img(psychologists.find((p) => p.name === active.psikolog)?.photo ?? '', 600)}
              alt=""
              className="h-full min-h-[200px] w-full object-cover"
            />
            <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
              <div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-brand">
                  <span className="size-1.5 animate-pulse rounded-full bg-[#d79a2b]" /> Ruang tunggu · {active.time}
                </p>
                <p className="mt-3 text-3xl font-normal">{active.psikolog}</p>
                <p className="mt-2 text-muted">Psikolog sudah diberi tahu. Masuk ke ruang sesi dan siapkan kamera Anda.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button arrow onClick={() => onJoin(active)}>Masuk ruang sesi</Button>
                <button onClick={() => cancel(active.id)} className="px-2 text-sm text-muted hover:text-ink">Batalkan</button>
              </div>
            </div>
          </div>
        )}

        <section>
          <div data-reveal className="flex items-end justify-between gap-4">
            <div><Label>Psikolog</Label><h2 className="mt-3 text-3xl font-normal">Pilih yang paling sesuai</h2></div>
            <p className="hidden text-sm text-muted sm:block">{psychologists.length} psikolog di klinik Anda</p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {psychologists.map((p, i) => {
              const available = i < 3
              const chosen = active?.psikolog === p.name
              return (
                <article data-reveal key={p.name} className={`flex flex-col rounded-xl bg-surface p-3 ${chosen ? 'ring-2 ring-brand' : ''}`}>
                  <img src={img(p.photo, 600)} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
                  <div className="flex flex-1 flex-col p-3 pt-5">
                    <p className={`text-xs ${available ? 'text-ok' : 'text-muted'}`}>{available ? 'Tersedia sekarang' : 'Mulai pukul 14.00'}</p>
                    <h3 className="mt-2 text-xl font-normal leading-tight">{p.name}</h3>
                    <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
                      <div className="flex justify-between"><dt className="text-muted">Fokus</dt><dd>{p.focus}</dd></div>
                      <div className="flex justify-between"><dt className="text-muted">BISINDO</dt><dd>{p.bisindo}</dd></div>
                    </dl>
                    <div className="mt-auto pt-5">
                      {chosen ? (
                        <p className="text-sm text-brand">Sudah diminta</p>
                      ) : (
                        <Button
                          variant={available ? 'primary' : 'outline'}
                          disabled={!available}
                          className="w-full"
                          onClick={() => request(klien, p.name)}
                        >
                          {available ? 'Minta sesi' : 'Belum tersedia'}
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section>
          <div data-reveal><Label>Riwayat saya</Label><h2 className="mt-3 text-3xl font-normal">Sesi sebelumnya</h2></div>
          {history.length === 0 ? (
            <p className="mt-6 text-muted">Belum ada sesi.</p>
          ) : (
            <ul className="mt-8 border-t border-ink/80">
              {history.map((h) => (
                <li data-reveal key={h.id} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[160px_1fr_auto] sm:items-center sm:gap-6">
                  <span className="text-sm text-muted">{fmtDate(h.date)}</span>
                  <span className="text-lg">{h.psikolog}</span>
                  <span className="text-sm text-muted">{h.status === 'Selesai' ? `${h.durationMin} menit · hasil dibahas bersama psikolog` : 'Dibatalkan'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

/* ============================= PSIKOLOG ============================= */

export function PsikologLobby({ name, onStart }: { name: string; onStart: (a: Appt) => void }) {
  const { list } = useAppointments()
  const all = useMemo(getHistory, [list])
  const queue = list
    .filter((a) => a.psikolog === name && a.status !== 'done')
    .sort((a, b) => (a.status === 'waiting' ? -1 : 0) - (b.status === 'waiting' ? -1 : 0) || a.time.localeCompare(b.time))
  const [sel, setSel] = useState<string | null>(null)
  const current = queue.find((a) => a.id === sel) ?? queue[0]
  const clientHist = current ? all.filter((h) => h.klien === current.klien) : []
  const mine = all.filter((h) => h.psikolog === name).slice(0, 8)
  const waiting = queue.filter((a) => a.status === 'waiting').length
  const hour = new Date().getHours()
  const greet = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : 'Selamat sore'

  return (
    <>
      <Hero
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
              <div className="px-4 pb-2 pt-4"><Label>Antrean</Label></div>
              <ul>
                {queue.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => setSel(a.id)}
                      className={`flex w-full items-center gap-4 rounded-lg p-4 text-left transition ${current?.id === a.id ? 'bg-paper' : 'hover:bg-paper/60'}`}
                    >
                      <span className="w-12 shrink-0 text-sm text-muted">{a.time}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-lg">{a.klien}</span>
                        <span className="block truncate text-xs text-muted">{a.note}</span>
                      </span>
                      {a.status === 'waiting' ? (
                        <span className="flex items-center gap-1.5 rounded-md bg-[#f3e2c2] px-2 py-1 text-xs text-warn">
                          <span className="size-1.5 animate-pulse rounded-full bg-[#d79a2b]" />Menunggu
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
          <div data-reveal><Label>Riwayat sesi saya</Label><h2 className="mt-3 text-3xl font-normal">Terakhir ditangani</h2></div>
          <ul className="mt-8 border-t border-ink/80">
            {mine.map((h) => (
              <li data-reveal key={h.id} className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[140px_1fr_1.4fr_auto]">
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

function ScoreTag({ h }: { h: SessionRecord }) {
  if (h.score === null) return <span className="text-xs text-muted">Dibatalkan</span>
  const l = level(h.score)
  return (
    <span className={`justify-self-end rounded-md px-2 py-1 text-xs ${l === 'Tinggi' ? 'bg-ink text-paper' : l === 'Sedang' ? 'bg-brand text-white' : 'bg-brand-tint text-brand'}`}>
      {h.score} · {l}
    </span>
  )
}

function ClientPanel({ appt, hist, onStart }: { appt: Appt; hist: SessionRecord[]; onStart: () => void }) {
  const scored = hist.filter((h) => h.score !== null).slice(0, 6).reverse()
  const last = hist[0]
  return (
    <div data-reveal className="flex flex-col rounded-xl bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Label>{appt.status === 'waiting' ? 'Di ruang tunggu' : `Terjadwal ${appt.time}`}</Label>
          <p className="mt-3 text-4xl font-normal">{appt.klien}</p>
          <p className="mt-1 text-muted">{appt.note} · Teman Tuli, BISINDO</p>
        </div>
        <Button arrow onClick={onStart}>{appt.status === 'waiting' ? 'Mulai sesi' : 'Mulai lebih awal'}</Button>
      </div>

      <dl className="mt-8 grid grid-cols-3 border-y border-line py-5">
        <div><dt className="text-xs text-muted">Kunjungan</dt><dd className="mt-1 text-3xl font-light">{hist.length}</dd></div>
        <div><dt className="text-xs text-muted">Skor terakhir</dt><dd className="mt-1 text-3xl font-light">{last?.score ?? '—'}</dd></div>
        <div><dt className="text-xs text-muted">Terakhir</dt><dd className="mt-1 text-lg">{last ? fmtDate(last.date) : 'Klien baru'}</dd></div>
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
