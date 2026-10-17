import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  Building2,
  ChevronDown,
  HeartPulse,
  LogIn,
  Menu,
  Monitor,
  X,
} from 'lucide-react'
import logoFull from '../../assets/logo-full.png'
import { logout, useAuth } from '../../lib/auth'
import { triggerVisualToast } from '../../lib/a11y'

const links = [
  { path: '/dictionary', label: 'Kamus' },
  { path: '/guide', label: 'Panduan' },
  { path: '/about', label: 'Privasi' },
]

export default function Navbar() {
  const user = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [features, setFeatures] = useState(false)
  const [mobile, setMobile] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) {
        setFeatures(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFeatures(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const closeMenus = () => {
    setFeatures(false)
    setMobile(false)
  }

  const signOut = () => {
    void logout()
      .then(() => navigate('/'))
      .catch(() => triggerVisualToast('Gagal keluar', 'Silakan coba lagi.', 'alert'))
  }

  const isFeatureActive =
    location.pathname.startsWith('/one-way') ||
    location.pathname.startsWith('/two-way') ||
    location.pathname.startsWith('/ritz') ||
    location.pathname.startsWith('/meet')

  const navItem = (path: string, label: string) => (
    <Link
      key={path}
      to={path}
      onClick={closeMenus}
      className={`rounded-md px-3 py-2 text-sm font-medium transition hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${
        location.pathname === path ? 'bg-brand text-white' : 'text-ink'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <div ref={ref} className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="relative mx-auto max-w-6xl">
        <nav
          aria-label="Navigasi utama"
          className="flex h-14 items-center justify-between rounded-xl bg-surface px-3 pl-4 shadow-sm border border-line"
        >
          {/* Logo */}
          <Link to="/" aria-label="BISARA, ke beranda" className="h-9 w-[100px] overflow-hidden">
            <img src={logoFull} alt="BISARA" className="size-full scale-[1.9] object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {/* Features Dropdown Button */}
            <button
              type="button"
              onClick={() => setFeatures((open) => !open)}
              aria-expanded={features}
              aria-controls="menu-fitur"
              className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${
                features || isFeatureActive ? 'bg-brand text-white' : 'text-ink'
              }`}
            >
              <span>Fitur</span>
              <ChevronDown
                className={`size-4 transition-transform duration-200 ${
                  features ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Standard Links */}
            {links.map(({ path, label }) => navItem(path, label))}

            <span className="mx-2 h-5 w-px bg-line" />

            {/* User Profile or Login */}
            {user ? (
              <button
                onClick={signOut}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink transition hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
              >
                Profile · Keluar
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink transition hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
              >
                <LogIn className="size-4" />
                <span>Masuk</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobile((open) => !open)}
            aria-expanded={mobile}
            aria-label={mobile ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="rounded-md p-2 transition hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand md:hidden"
          >
            {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {/* Compact Proportional Dropdown Popover for "Fitur" */}
        {features && (
          <div
            id="menu-fitur"
            className="absolute left-28 top-16 hidden w-[360px] sm:w-[400px] rounded-2xl bg-surface p-3 shadow-2xl ring-1 ring-line border border-line/40 md:block animate-in fade-in slide-in-from-top-2 duration-150 z-50"
          >
            {/* Section 1: One-way */}
            <div className="px-3 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Layanan Satu Arah (One-Way)
            </div>
            <Link
              to="/one-way"
              onClick={closeMenus}
              className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand group"
            >
              <div className="size-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 mt-0.5 text-brand group-hover:bg-brand group-hover:text-white transition">
                <Monitor className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink group-hover:text-brand transition">
                  One-way Service
                </p>
                <p className="mt-0.5 text-xs text-muted leading-snug">
                  Editor teks dan layar avatar privat.
                </p>
              </div>
            </Link>

            <hr className="my-2.5 border-line" />

            {/* Section 2: Two-way Services */}
            <div className="px-3 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Layanan Dua Arah (Two-Way)
            </div>

            {/* Layanan Psikolog (Active with Ritz) */}
            <Link
              to="/two-way/layanan-psikolog"
              onClick={closeMenus}
              className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand group"
            >
              <div className="size-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 mt-0.5 text-brand group-hover:bg-brand group-hover:text-white transition">
                <HeartPulse className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink group-hover:text-brand transition">
                    Layanan Psikolog
                  </p>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                    Mitra Ritz
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted leading-snug">
                  Konsultasi dua arah tatap muka BISINDO bersama mitra Ritz.
                </p>
              </div>
            </Link>

            {/* Layanan Resepsionis (Upcoming) */}
            <div className="flex items-start gap-3 rounded-xl p-2.5 opacity-60 cursor-not-allowed">
              <div className="size-8 rounded-lg bg-paper flex items-center justify-center shrink-0 mt-0.5 text-muted border border-line">
                <Building2 className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">Layanan Resepsionis</p>
                  <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium text-muted border border-line">
                    Segera Hadir
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted leading-snug">
                  Pelayanan front-desk publik ramah Tuli untuk instansi.
                </p>
              </div>
            </div>

            {/* Layanan Lainnya (Upcoming) */}
            <div className="flex items-start gap-3 rounded-xl p-2.5 opacity-60 cursor-not-allowed">
              <div className="size-8 rounded-lg bg-paper flex items-center justify-center shrink-0 mt-0.5 text-muted border border-line">
                <Bot className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">Layanan Publik Lainnya</p>
                  <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium text-muted border border-line">
                    Segera Hadir
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted leading-snug">
                  Integrasi loket pelayanan terpadu satu pintu.
                </p>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-line px-2">
              <Link
                to="/two-way"
                onClick={closeMenus}
                className="flex items-center justify-between text-xs font-semibold text-brand hover:underline p-1"
              >
                <span>Lihat seluruh layanan dua arah</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobile && (
          <div className="absolute inset-x-0 top-16 rounded-xl bg-surface p-4 shadow-xl ring-1 ring-line md:hidden border border-line">
            <div className="flex flex-col gap-1.5">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Fitur Layanan
              </div>
              <Link
                to="/one-way"
                onClick={closeMenus}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-paper"
              >
                One-way Service (Editor & Layar)
              </Link>
              <Link
                to="/two-way/layanan-psikolog"
                onClick={closeMenus}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-paper flex items-center justify-between"
              >
                <span>Layanan Psikolog (Mitra Ritz)</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  Aktif
                </span>
              </Link>
              <Link
                to="/two-way"
                onClick={closeMenus}
                className="rounded-lg px-3 py-2 text-sm font-medium text-brand hover:bg-paper"
              >
                Semua Layanan Dua Arah →
              </Link>

              <hr className="my-2 border-line" />

              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Halaman Utama
              </div>
              {links.map(({ path, label }) => navItem(path, label))}

              <hr className="my-2 border-line" />

              {user ? (
                <button
                  onClick={signOut}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-ink hover:bg-paper"
                >
                  Profile · Keluar
                </button>
              ) : (
                navItem('/login', 'Masuk ke Akun')
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
