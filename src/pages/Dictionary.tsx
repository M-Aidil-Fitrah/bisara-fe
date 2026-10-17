import { useMemo, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import Avatar from '../components/Avatar'
import { PageHeader } from '../components/ui'
import { IMG } from '../lib/images'
import { SIGNS } from '../data'
import type { Sign } from '../types'

export default function Dictionary() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Semua')
  const [open, setOpen] = useState<Sign | null>(null)
  const cats = ['Semua', ...Array.from(new Set(SIGNS.map((s) => s.category)))]
  const list = useMemo(
    () =>
      SIGNS.filter(
        (s) =>
          (cat === 'Semua' || s.category === cat) &&
          s.word.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, cat],
  )

  return (
    <>
      <PageHeader
        image={IMG.signing}
        eyebrow="Kamus"
        title="Kamus isyarat BISINDO"
        desc="Kosakata yang dikenali dalam sesi. Pelajari sebelum sesi agar percakapan lebih lancar."
      />
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kata, mis. stres"
            aria-label="Cari kata"
            className="w-full border-b border-ink/80 bg-transparent pb-3 text-2xl outline-none placeholder:text-muted/60 md:max-w-sm"
          />
          <div className="flex gap-1 overflow-x-auto">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`h-9 shrink-0 rounded-md px-3 text-sm transition ${
                  cat === c ? 'bg-brand text-white' : 'text-ink hover:bg-surface'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-10 text-sm text-muted">{list.length} kata</p>
        <ul className="mt-3 grid border-t border-ink/80 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <li data-reveal key={s.word} className="border-b border-line">
              <button
                onClick={() => setOpen(s)}
                className="group flex w-full items-center justify-between gap-4 py-5 pr-4 text-left"
              >
                <span>
                  <span className="block text-xl group-hover:text-brand">{s.word}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {s.category} · {s.hasClip ? 'Animasi 3D' : 'Alfabet jari'}
                  </span>
                </span>
                <ArrowUpRight className="size-4 text-muted transition group-hover:text-brand" />
              </button>
            </li>
          ))}
        </ul>
        {list.length === 0 && (
          <p className="py-16 text-center text-muted">
            Kata “{q}” belum tersedia. Kosakata terus bertambah bersama komunitas Tuli.
          </p>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.word}
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="grid w-full max-w-2xl overflow-hidden rounded-xl bg-surface sm:grid-cols-2"
          >
            <div className="bg-brand-tint p-6">
              <Avatar signing className="mx-auto w-full max-w-[240px]" />
            </div>
            <div className="relative flex flex-col p-8">
              <button
                onClick={() => setOpen(null)}
                aria-label="Tutup"
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-md hover:bg-paper"
              >
                <X className="size-4" />
              </button>
              <p className="text-xs uppercase tracking-[0.14em] text-brand">{open.category}</p>
              <p className="mt-3 text-4xl">{open.word}</p>
              <p className="mt-4 leading-relaxed text-muted">{open.desc}</p>
              {!open.hasClip && (
                <p className="mt-auto pt-6 text-sm text-warn">
                  Animasi khusus belum tersedia, ditampilkan dengan alfabet jari.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
