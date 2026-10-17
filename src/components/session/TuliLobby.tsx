import { useMemo } from 'react'
import { Button } from '../ui'
import { img } from '../../lib/images'
import { useAppointments, usePsychologists } from '../../lib/appointments'
import { getHistory } from '../../lib/history'
import type { Appt } from '../../types'
import { LobbyHero, LobbyLabel } from './LobbyShared'
import { fmtDate, shortName } from '../../lib/format'

export interface TuliLobbyProps {
  name: string
  onJoin: (a: Appt) => void
}

export default function TuliLobby({ name, onJoin }: TuliLobbyProps) {
  const klien = shortName(name)
  const psychologists = usePsychologists()
  const { list, request, cancel } = useAppointments()
  const active = list.find((a) => a.klien === klien && a.status !== 'done')
  const history = useMemo(() => getHistory().filter((h) => h.klien === klien), [klien])

  return (
    <>
      <LobbyHero
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
            <div><LobbyLabel>Psikolog</LobbyLabel><h2 className="mt-3 text-3xl font-normal">Pilih yang paling sesuai</h2></div>
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
          <div data-reveal><LobbyLabel>Riwayat saya</LobbyLabel><h2 className="mt-3 text-3xl font-normal">Sesi sebelumnya</h2></div>
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
