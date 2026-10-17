import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogIn, Menu, X } from 'lucide-react'
import logoFull from '../../assets/logo-full.png'
import { Button } from '../ui'
import { useAuth, logout } from '../../lib/auth'

interface Item {
  path: string
  label: string
  desc: string
}

const FEATURES: Item[] = [
  { path: '/session', label: 'Sesi skrining', desc: 'Percakapan dua arah dengan avatar BISINDO' },
  { path: '/dictionary', label: 'Kamus isyarat', desc: 'Kosakata yang dikenali sistem' },
  { path: '/guide', label: 'Panduan', desc: 'Persiapan sebelum sesi dimulai' },
]

const NAV_LINKS = [
  { path: '/dictionary', label: 'Kamus' },
  { path: '/guide', label: 'Panduan' },
  { path: '/about', label: 'Privasi' },
]

export default function Navbar() {
  const user = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  const currentPath = location.pathname

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menus on path change
  useEffect(() => {
    setOpen(null)
    setMobile(false)
  }, [currentPath])

  const initialLetter = user ? user.name.replace(/^dr\. /, '')[0] ?? 'B' : 'B'

  return (
    <div
      ref={navRef}
      className="fixed inset-x-0 top-4 z-50 px-4"
      onMouseLeave={() => setOpen(null)}
    >
      <div className="relative mx-auto max-w-6xl">
        <nav
          aria-label="Navigasi Utama"
          className="flex h-14 items-center justify-between rounded-xl bg-surface px-3 pl-4 shadow-[0_1px_0_rgba(16,38,59,0.06)]"
        >
          <Link
            to="/"
            aria-label="BISARA, ke beranda"
            className="h-9 w-[100px] overflow-hidden"
          >
            <img src={logoFull} alt="BISARA" className="size-full scale-[1.9] object-contain" />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {/* Fitur Dropdown Toggle */}
            <button
              onMouseEnter={() => setOpen('fitur')}
              onClick={() => setOpen(open === 'fitur' ? null : 'fitur')}
              aria-expanded={open === 'fitur'}
              className={`h-9 rounded-md px-3 text-[15px] font-medium transition ${
                open === 'fitur' || currentPath === '/session'
                  ? 'bg-brand text-white'
                  : 'text-ink hover:bg-paper'
              }`}
            >
              Fitur
            </button>

            {/* Standard Navigation Links */}
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onMouseEnter={() => setOpen(null)}
                aria-current={currentPath === path ? 'page' : undefined}
                className={`flex h-9 items-center rounded-md px-3 text-[15px] font-medium transition ${
                  currentPath === path ? 'bg-brand text-white' : 'text-ink hover:bg-paper'
                }`}
              >
                {label}
              </Link>
            ))}

            <span className="mx-2 h-5 w-px bg-line" />

            {/* Authenticated user menu or Login button */}
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/dashboard"
                    className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-brand transition hover:bg-paper"
                  >
                    <LayoutDashboard className="size-4" /> Konsol Admin
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setOpen(open === 'user' ? null : 'user')}
                    className="flex size-9 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper"
                    aria-label="Menu akun"
                  >
                    {initialLetter}
                  </button>
                  {open === 'user' && (
                    <div className="absolute right-0 top-12 w-56 rounded-xl bg-surface p-2 shadow-xl ring-1 ring-line">
                      <div className="border-b border-line px-3 py-2">
                        <p className="truncate text-xs font-semibold text-ink">{user.name}</p>
                        <p className="truncate text-[11px] text-muted">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/dashboard"
                          onClick={() => setOpen(null)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-ink hover:bg-paper"
                        >
                          <LayoutDashboard className="size-3.5" /> Buka konsol admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout()
                          setOpen(null)
                          navigate('/')
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[#b8483e] hover:bg-paper"
                      >
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium text-ink transition hover:bg-paper"
              >
                <LogIn className="size-4 text-brand" /> Masuk
              </Link>
            )}

            <Button
              className="ml-1 !h-9 !px-3.5 !text-sm"
              onClick={() => navigate('/session')}
            >
              Mulai sesi
            </Button>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobile(!mobile)}
            aria-label="Buka menu"
            className="grid size-9 place-items-center rounded-md md:hidden hover:bg-paper"
          >
            {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {/* Fitur desktop dropdown card */}
        {open === 'fitur' && (
          <div className="absolute inset-x-0 top-16 hidden rounded-xl bg-surface p-3 shadow-xl ring-1 ring-line md:block">
            <div className="grid gap-2 sm:grid-cols-3">
              {FEATURES.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(null)}
                  className="rounded-lg p-3 text-left transition hover:bg-paper"
                >
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="mt-1 text-xs text-muted">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile menu dropdown */}
        {mobile && (
          <div className="absolute inset-x-0 top-16 rounded-xl bg-surface p-4 shadow-xl ring-1 ring-line md:hidden">
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                onClick={() => setMobile(false)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                  currentPath === '/' ? 'bg-brand text-white' : 'text-ink hover:bg-paper'
                }`}
              >
                Beranda
              </Link>
              <Link
                to="/session"
                onClick={() => setMobile(false)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                  currentPath === '/session' ? 'bg-brand text-white' : 'text-ink hover:bg-paper'
                }`}
              >
                Sesi Skrining
              </Link>
              {NAV_LINKS.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobile(false)}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${
                    currentPath === path ? 'bg-brand text-white' : 'text-ink hover:bg-paper'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobile(false)}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-brand hover:bg-paper"
                >
                  Konsol Admin
                </Link>
              )}
              <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                {user ? (
                  <button
                    onClick={() => {
                      logout()
                      setMobile(false)
                      navigate('/')
                    }}
                    className="w-full rounded-lg bg-paper px-3 py-2 text-center text-sm font-medium text-[#b8483e]"
                  >
                    Keluar ({user.name})
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobile(false)}
                    className="w-full rounded-lg bg-paper px-3 py-2 text-center text-sm font-medium text-ink"
                  >
                    Masuk
                  </Link>
                )}
                <Button
                  className="w-full !h-10"
                  onClick={() => {
                    setMobile(false)
                    navigate('/session')
                  }}
                >
                  Mulai sesi
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
