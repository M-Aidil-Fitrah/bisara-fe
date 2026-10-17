import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import logoFull from '../../assets/logo-full.png'

const FOOTER_SECTIONS = [
  {
    title: 'Layanan',
    links: [
      { label: 'Sesi Skrining', to: '/session' },
      { label: 'Kamus Isyarat', to: '/dictionary' },
      { label: 'Panduan', to: '/guide' },
    ],
  },
  {
    title: 'Informasi',
    links: [
      { label: 'Beranda', to: '/' },
      { label: 'Privasi & Data', to: '/about' },
    ],
  },
  {
    title: 'Teknologi',
    external: [
      { label: 'Three.js WebGL', href: 'https://threejs.org/' },
      { label: 'WebRTC', href: 'https://webrtc.org/' },
      { label: 'PeerJS', href: 'https://peerjs.com/' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block h-8 w-[90px] overflow-hidden">
              <img src={logoFull} alt="BISARA" className="size-full scale-[1.9] object-contain" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Sistem komunikasi dua arah BISINDO untuk layanan kesehatan mental inklusif. Menghubungkan Teman Tuli dengan psikolog secara aman dan privat.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold text-ink">{section.title}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {section.links?.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-brand transition hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
                {section.external?.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-muted transition hover:text-ink"
                    >
                      {item.label} <ArrowUpRight className="size-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-end justify-between gap-6 border-t border-line/60 pt-8">
          <img src="/favicon.svg" alt="" className="h-16 w-auto opacity-20 sm:h-24" />
          <p className="text-xs text-muted text-right">
            © 2026 BISARA · Sistem Komunikasi Dua Arah BISINDO · Bukan alat diagnosis pengganti tenaga medis.
          </p>
        </div>
      </div>
    </footer>
  )
}
