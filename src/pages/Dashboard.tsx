import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { X, Menu } from 'lucide-react'
import logoMark from '../assets/logo-mark.png'
import { SIGNS } from '../data'
import { logout } from '../lib/auth'
import { getHistory, level } from '../lib/history'
import type { Account, SessionRecord } from '../types'

type Tab = 'overview' | 'history' | 'psikolog' | 'vocab'
const TABS: [Tab, string][] = [
  ['overview', 'Ringkasan'],
  ['history', 'Riwayat sesi'],
  ['psikolog', 'Psikolog'],
  ['vocab', 'Kosakata'],
]

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
const pct = (n: number) => `${Math.round(n * 100)}%`

export default function Dashboard({ user, onGoHome }: { user: Account; onGoHome?: () => void }) {
  const [tab, setTab] = useState<Tab>('overview')
  const [nav, setNav] = useState(false)
  const [open, setOpen] = useState<SessionRecord | null>(null)
  const data = useMemo(getHistory, [])
  const main = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!main.current) return
    const ctx = gsap.context(() => {
      if (main.current?.querySelector('[data-dash]')) {
        gsap.from('[data-dash]', {
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.06,
        })
      }
    }, main)
    return () => ctx.revert()
  }, [tab])

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink p-5 text-paper transition-transform lg:translate-x-0 ${
          nav ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <img src={logoMark} alt="" className="size-8 object-contain" />
            <div>
              <p className="font-semibold">BISARA</p>
              <p className="text-xs text-paper/50">Konsol admin</p>
            </div>
          </div>
          {onGoHome && (
            <button
              onClick={onGoHome}
              title="Ke Beranda Utama"
              className="text-xs text-brand-soft hover:text-white"
            >
              Beranda
            </button>
          )}
        </div>
        <nav className="mt-10 space-y-1">
          {TABS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => {
                setTab(k)
                setNav(false)
              }}
              className={`flex h-10 w-full items-center rounded-md px-3 text-left text-[15px] transition ${
                tab === k ? 'bg-brand text-white' : 'text-paper/70 hover:bg-ink-2 hover:text-paper'
              }`}
            >
              {l}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-lg bg-ink-2 p-4">
          <p className="text-sm">{user.name}</p>
          <p className="text-xs text-paper/50">{user.email}</p>
          <button onClick={logout} className="mt-3 text-sm text-brand-soft hover:text-paper">
            Keluar
          </button>
        </div>
      </aside>
      {nav && <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setNav(false)} />}

      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNav(true)}
            className="grid size-10 place-items-center rounded-md lg:hidden"
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </button>
          <p className="text-sm text-muted">Klinik Psikologi Harapan · Banda Aceh</p>
        </div>
        <p className="hidden text-sm text-muted sm:block">
          {new Date(2026, 9, 28).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </header>

      <main ref={main} className="px-4 py-8 sm:px-8 sm:py-10">
        {tab === 'overview' && <Overview data={data} onOpen={setOpen} goHistory={() => setTab('history')} />}
        {tab === 'history' && <History data={data} onOpen={setOpen} />}
        {tab === 'psikolog' && <Psychologists data={data} />}
        {tab === 'vocab' && <Vocab />}
      </main>

      {open && <Drawer s={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function Title({ t, d }: { t: string; d: string }) {
  return (
    <div data-dash className="mb-8">
      <h1 className="text-4xl font-normal tracking-tight">{t}</h1>
      <p className="mt-2 text-muted">{d}</p>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div data-dash className={`rounded-xl bg-surface p-6 ${className}`}>{children}</div>
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.14em] text-brand">{children}</p>
}

/* ---------------------------- Overview ---------------------------- */

function Overview({
  data,
  onOpen,
  goHistory,
}: {
  data: SessionRecord[]
  onOpen: (s: SessionRecord) => void
  goHistory: () => void
}) {
  const done = data.filter((d) => d.status === 'Selesai')
  const avg = done.reduce((s, d) => s + (d.score ?? 0), 0) / Math.max(1, done.length)
  const acc = data.reduce((s, d) => s + d.accuracy, 0) / Math.max(1, data.length)
  const manual = data.reduce((s, d) => s + d.manual, 0) / Math.max(1, done.length * 12)
  const dist = ['Rendah', 'Sedang', 'Tinggi'].map(
    (l) => done.filter((d) => level(d.score ?? 0) === l).length,
  )

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = new Date(2026, 9, 29)
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
      <Title t="Ringkasan" d="Aktivitas layanan BISARA dalam 8 minggu terakhir." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Sesi selesai', String(done.length), `${data.length - done.length} dibatalkan`],
          ['Rata-rata skor PSS-10', avg.toFixed(1), `Kategori ${level(avg).toLowerCase()}`],
          ['Akurasi pengenalan isyarat', pct(acc), 'Rata-rata keyakinan model'],
          ['Jawaban manual', pct(manual), 'Dari seluruh jawaban'],
        ].map(([l, v, h]) => (
          <Card key={l}>
            <p className="text-sm text-muted">{l}</p>
            <p className="mt-3 text-5xl font-light tracking-tight">{v}</p>
            <p className="mt-2 text-xs text-muted">{h}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-baseline justify-between">
            <Label>Sesi per minggu</Label>
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
        </Card>
        <Card>
          <Label>Tingkat stres klien</Label>
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
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-baseline justify-between">
            <Label>Sesi terbaru</Label>
            <button onClick={goHistory} className="text-sm text-brand hover:text-ink">
              Lihat semua
            </button>
          </div>
          <SessionTable rows={data.slice(0, 6)} onOpen={onOpen} compact />
        </Card>
        <Card>
          <Label>Perlu ditambah ke kosakata</Label>
          <p className="mt-2 text-sm text-muted">Kata yang sering muncul tetapi masih memakai alfabet jari.</p>
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {[
              ['Yakin', 31],
              ['Hari ini', 24],
              ['Masalah', 19],
              ['Keluarga', 12],
              ['Tidur', 9],
            ].map(([w, n]) => (
              <li key={w} className="flex items-center justify-between py-3 text-sm">
                <span>{w}</span>
                <span className="text-muted">{n}× diminta</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}

/* ----------------------------- History ---------------------------- */

function History({
  data,
  onOpen,
}: {
  data: SessionRecord[]
  onOpen: (s: SessionRecord) => void
}) {
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
      <Title t="Riwayat sesi" d="Seluruh sesi yang tercatat, termasuk transkrip dan catatan psikolog." />
      <div data-dash className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari ID, klien, atau psikolog"
          aria-label="Cari sesi"
          className="h-11 flex-1 rounded-lg bg-surface px-4 outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-brand"
        />
        <Seg value={status} set={setStatus} opts={['Semua', 'Selesai', 'Dibatalkan']} />
        <Seg value={lvl} set={setLvl} opts={['Semua', 'Rendah', 'Sedang', 'Tinggi']} />
      </div>
      <Card className="!p-0 sm:!p-2">
        <SessionTable rows={rows} onOpen={onOpen} />
        {rows.length === 0 && <p className="p-10 text-center text-muted">Tidak ada sesi yang cocok.</p>}
      </Card>
    </>
  )
}

function Seg({ value, set, opts }: { value: string; set: (v: string) => void; opts: string[] }) {
  return (
    <div className="flex overflow-x-auto rounded-lg bg-surface p-1 text-sm">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => set(o)}
          className={`h-9 shrink-0 rounded-md px-3 transition ${
            value === o ? 'bg-brand text-white' : 'text-ink hover:bg-paper'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function Pill({ s }: { s: SessionRecord }) {
  if (s.status === 'Dibatalkan' || s.score === null) {
    return <span className="rounded-md bg-paper px-2 py-1 text-xs text-muted">Dibatalkan</span>
  }
  const l = level(s.score)
  return (
    <span
      className={`rounded-md px-2 py-1 text-xs ${
        l === 'Tinggi'
          ? 'bg-ink text-paper'
          : l === 'Sedang'
            ? 'bg-brand text-white'
            : 'bg-brand-tint text-brand'
      }`}
    >
      {s.score} · {l}
    </span>
  )
}

function SessionTable({
  rows,
  onOpen,
  compact,
}: {
  rows: SessionRecord[]
  onOpen: (s: SessionRecord) => void
  compact?: boolean
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-line">
            <th className="px-3 py-3 font-normal">Sesi</th>
            <th className="px-3 py-3 font-normal">Klien</th>
            {!compact && <th className="px-3 py-3 font-normal">Psikolog</th>}
            <th className="px-3 py-3 font-normal">Durasi</th>
            {!compact && <th className="px-3 py-3 font-normal">Akurasi</th>}
            <th className="px-3 py-3 font-normal">PSS-10</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              onClick={() => onOpen(r)}
              className="cursor-pointer border-b border-line last:border-0 hover:bg-paper/70"
            >
              <td className="px-3 py-3.5">
                <p>{r.id}</p>
                <p className="text-xs text-muted">
                  {fmtDate(r.date)} · {fmtTime(r.date)}
                </p>
              </td>
              <td className="px-3 py-3.5">{r.klien}</td>
              {!compact && <td className="px-3 py-3.5 text-muted">{r.psikolog}</td>}
              <td className="px-3 py-3.5 text-muted">{r.durationMin} mnt</td>
              {!compact && <td className="px-3 py-3.5 text-muted">{pct(r.accuracy)}</td>}
              <td className="px-3 py-3.5">
                <Pill s={r} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Drawer({ s, onClose }: { s: SessionRecord; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (ref.current) gsap.from(ref.current, { x: 60, opacity: 0, duration: 0.45, ease: 'power3.out' })
  }, [s.id])

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-ink/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detail ${s.id}`}
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-paper"
      >
        <div className="flex items-start justify-between bg-ink p-6 text-paper">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-brand-soft">{s.status}</p>
            <p className="mt-2 text-3xl font-light">{s.id}</p>
            <p className="mt-1 text-sm text-paper/60">
              {fmtDate(s.date)} · {fmtTime(s.date)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="grid size-9 place-items-center rounded-md hover:bg-ink-2"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-6 p-6">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line text-sm">
            {[
              ['Klien', s.klien],
              ['Psikolog', s.psikolog],
              ['Durasi', `${s.durationMin} menit`],
              ['Akurasi isyarat', pct(s.accuracy)],
              ['Jawaban manual', String(s.manual)],
              [
                'Skor PSS-10',
                s.score === null ? '—' : `${s.score} / 40 · ${level(s.score)}`,
              ],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface p-4">
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
          <div>
            <Label>Catatan psikolog</Label>
            <p className="mt-3 rounded-xl bg-surface p-4 leading-relaxed">{s.notes}</p>
          </div>
          <div>
            <Label>Transkrip</Label>
            {s.lines.length === 0 ? (
              <p className="mt-3 text-muted">Tidak ada transkrip.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {s.lines.map((l, i) => (
                  <li key={i} className={`flex ${l.from === 'tuli' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                        l.from === 'tuli' ? 'bg-surface' : 'bg-brand text-white'
                      }`}
                    >
                      {l.text}
                      {l.from === 'tuli' && (
                        <span className="ml-2 text-[11px] text-muted">
                          {l.manual ? 'manual' : l.conf ? pct(l.conf) : ''}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- Psychologists --------------------------- */

function Psychologists({ data }: { data: SessionRecord[] }) {
  const names = Array.from(new Set(data.map((d) => d.psikolog)))
  return (
    <>
      <Title t="Psikolog" d="Tenaga profesional yang memakai BISARA di klinik ini." />
      <div className="grid gap-4 md:grid-cols-2">
        {names.map((n) => {
          const mine = data.filter((d) => d.psikolog === n)
          const done = mine.filter((d) => d.status === 'Selesai')
          const initials = n
            .replace(/^dr\. /, '')
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0] ?? '')
            .join('')
          const lastDate = mine[0]?.date ? fmtDate(mine[0].date) : '-'
          return (
            <Card key={n}>
              <div className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-ink text-paper">{initials}</div>
                <div>
                  <p className="text-lg">{n}</p>
                  <p className="text-sm text-muted">Aktif · terakhir {lastDate}</p>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-3 border-t border-line pt-5">
                {[
                  ['Sesi', mine.length],
                  [
                    'Rata-rata durasi',
                    `${Math.round(mine.reduce((s, d) => s + d.durationMin, 0) / Math.max(1, mine.length))} mnt`,
                  ],
                  [
                    'Rata-rata skor',
                    (done.reduce((s, d) => s + (d.score ?? 0), 0) / Math.max(1, done.length)).toFixed(1),
                  ],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="mt-1 text-2xl font-light">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )
        })}
      </div>
    </>
  )
}

/* ------------------------------ Vocab ------------------------------ */

function Vocab() {
  const rows = SIGNS.map((s, i) => ({
    ...s,
    acc: s.hasClip ? 0.78 + ((i * 17) % 20) / 100 : 0,
    uses: 40 + ((i * 53) % 180),
  }))
  const ready = rows.filter((r) => r.hasClip).length
  return (
    <>
      <Title t="Kosakata" d="Status animasi avatar dan akurasi pengenalan untuk setiap kata." />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {[
          ['Total kata', rows.length],
          ['Animasi 3D siap', ready],
          ['Masih alfabet jari', rows.length - ready],
        ].map(([k, v]) => (
          <Card key={k as string}>
            <p className="text-sm text-muted">{k}</p>
            <p className="mt-3 text-5xl font-light">{v}</p>
          </Card>
        ))}
      </div>
      <Card className="!p-0 sm:!p-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-normal">Kata</th>
                <th className="px-4 py-3 font-normal">Kategori</th>
                <th className="px-4 py-3 font-normal">Avatar</th>
                <th className="px-4 py-3 font-normal">Akurasi pengenalan</th>
                <th className="px-4 py-3 font-normal">Dipakai</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.word} className="border-b border-line last:border-0">
                  <td className="px-4 py-3.5">{r.word}</td>
                  <td className="px-4 py-3.5 text-muted">{r.category}</td>
                  <td className="px-4 py-3.5">
                    {r.hasClip ? (
                      <span className="rounded-md bg-brand-tint px-2 py-1 text-xs text-brand">Animasi 3D</span>
                    ) : (
                      <span className="rounded-md bg-paper px-2 py-1 text-xs text-warn">Alfabet jari</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {r.hasClip ? (
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-24 overflow-hidden rounded-full bg-line">
                          <div className="h-full bg-brand" style={{ width: pct(r.acc) }} />
                        </div>
                        <span className="text-muted">{pct(r.acc)}</span>
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-muted">{r.uses}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
