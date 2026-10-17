import { useLayoutEffect, useRef } from 'react'
import { X } from 'lucide-react'
import gsap from 'gsap'
import type { SessionRecord } from '../../types'

interface SessionDetailDrawerProps {
  session: SessionRecord
  onClose: () => void
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
const pct = (n: number) => `${Math.round(n * 100)}%`
const level = (s: number) => (s <= 13 ? 'Rendah' : s <= 26 ? 'Sedang' : 'Tinggi')

export default function SessionDetailDrawer({ session: s, onClose }: SessionDetailDrawerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (ref.current) {
      gsap.from(ref.current, { x: 60, opacity: 0, duration: 0.45, ease: 'power3.out' })
    }
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
              ['Durasi', s.durationMin === null ? 'Belum tersedia' : `${s.durationMin} menit`],
              ['Akurasi isyarat', s.accuracy === null ? 'Belum tersedia' : pct(s.accuracy)],
              ['Jawaban manual', String(s.manual)],
              [
                'Skor PSS-10',
                s.score === null ? '—' : `${s.score} / 40 · ${level(s.score)}`,
              ],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface p-4">
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="mt-1 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-brand">Catatan psikolog</p>
            <p className="mt-3 rounded-xl bg-surface p-4 leading-relaxed">{s.notes ?? 'Tidak ada catatan tersimpan.'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-brand">Transkrip Percakapan</p>
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
