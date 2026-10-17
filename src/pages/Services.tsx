import { Link } from 'react-router-dom'
import { ArrowRight, Bot, Building2, HeartPulse } from 'lucide-react'
import ritzLogo from '../assets/logo_ritz.png'

const cards = [
  {
    title: 'Layanan Psikolog',
    desc: 'Komunikasi dua arah bersama mitra Ritz Konsultan Psikologi. Konsultasi kesehatan mental dengan dukungan BISINDO dan WebRTC.',
    to: '/two-way/layanan-psikolog',
    action: 'Lihat Layanan Psikolog',
    icon: HeartPulse,
    badge: 'Tersedia',
    partnerLogo: ritzLogo,
  },
  {
    title: 'Layanan Resepsionis',
    desc: 'Layanan interaksi front-desk publik ramah Tuli untuk instansi pemerintah, rumah sakit, dan perhotelan.',
    action: 'Segera Hadir',
    icon: Building2,
    badge: 'Dalam Pengembangan',
  },
  {
    title: 'Layanan Publik Lainnya',
    desc: 'Integrasi loket pelayanan terpadu satu pintu (PTSP) dan customer service berbagai sektor pelayanan masyarakat.',
    action: 'Segera Hadir',
    icon: Bot,
    badge: 'Dalam Pengembangan',
  },
]

export default function Services() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-36">
      <div className="max-w-3xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          Two-way Service
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Layanan publik yang terhubung secara langsung.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Pilih modul layanan dua arah yang Anda butuhkan. Setiap layanan dirancang dengan aksesibilitas penuh,
          transparansi status antrean, dan tanpa dependensi data klinis privat.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          const isAvailable = Boolean(card.to)

          return (
            <article
              key={card.title}
              className={`flex min-h-[340px] flex-col justify-between rounded-2xl border p-6 transition shadow-sm ${
                isAvailable
                  ? 'border-brand/40 bg-surface hover:border-brand shadow-md'
                  : 'border-line bg-surface/60 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  {card.partnerLogo ? (
                    <img
                      src={card.partnerLogo}
                      alt={card.title}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <div className="size-10 rounded-xl bg-paper flex items-center justify-center border border-line">
                      <Icon className="size-5 text-muted" />
                    </div>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      isAvailable
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-paper text-muted border-line'
                    }`}
                  >
                    {card.badge}
                  </span>
                </div>

                <h2 className="mt-5 text-2xl font-semibold text-ink">{card.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{card.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-line">
                {card.to ? (
                  <Link
                    to={card.to}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <span>{card.action}</span>
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="block rounded-xl bg-paper px-4 py-2.5 text-center text-sm font-semibold text-muted border border-line"
                  >
                    {card.action}
                  </span>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
