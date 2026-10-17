import { useEffect, useRef, useState } from 'react'
import { Menu, X, ArrowUpRight, LogIn, LayoutDashboard } from 'lucide-react'
import logoFull from './assets/logo-full.png'
import logoMark from './assets/logo-mark.png'
import Home from './pages/Home'
import Session from './pages/Session'
import Dictionary from './pages/Dictionary'
import Guide from './pages/Guide'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import { Button, IMG } from './components/ui'
import { usePageMotion } from './lib/motion'
import { useAuth, logout } from './lib/auth'

export type Page = 'home' | 'session' | 'dictionary' | 'guide' | 'about' | 'login' | 'register' | 'dashboard'
type Item = { page: Page; label: string; desc: string }

const FEATURES: Item[] = [
  { page: 'session', label: 'Sesi skrining', desc: 'Percakapan dua arah dengan avatar BISINDO' },
  { page: 'dictionary', label: 'Kamus isyarat', desc: 'Kosakata yang dikenali sistem' },
  { page: 'guide', label: 'Panduan', desc: 'Persiapan sebelum sesi dimulai' },
]
const LINKS: [Page, string][] = [
  ['dictionary', 'Kamus'],
  ['guide', 'Panduan'],
  ['about', 'Privasi'],
]

export default function App() {
  const user = useAuth()
  const [page, setPage] = useState<Page>('home')
  const [open, setOpen] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  const go = (p: Page) => {
    setPage(p)
    setOpen(null)
    setMobile(false)
    window.scrollTo({ top: 0 })
  }
  usePageMotion(page)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  // If user navigated to login or register, show full screen without navbar & footer
  if (page === 'login') {
    return (
      <Login
        onGoRegister={() => go('register')}
        onGoHome={() => go('home')}
        onSuccess={() => {
          if (user?.role === 'admin') go('dashboard')
          else go('session')
        }}
      />
    )
  }

  if (page === 'register') {
    return (
      <Register
        onGoLogin={() => go('login')}
        onGoHome={() => go('home')}
        onSuccess={() => go('session')}
      />
    )
  }

  if (page === 'dashboard' && user?.role === 'admin') {
    return <Dashboard user={user} onGoHome={() => go('home')} />
  }

  const initialLetter = user ? user.name.replace(/^dr\. /, '')[0] ?? 'B' : 'B'

  return (
    <div className="flex min-h-screen flex-col">
      {/* Floating navbar */}
      <div
        ref={navRef}
        className="fixed inset-x-0 top-4 z-50 px-4"
        onMouseLeave={() => setOpen(null)}
      >
        <div className="relative mx-auto max-w-6xl">
          <nav
            aria-label="Utama"
            className="flex h-14 items-center justify-between rounded-xl bg-surface px-3 pl-4 shadow-[0_1px_0_rgba(16,38,59,0.06)]"
          >
            <button
              onClick={() => go('home')}
              aria-label="BISARA, ke beranda"
              className="h-9 w-[100px] overflow-hidden"
            >
              <img src={logoFull} alt="BISARA" className="size-full scale-[1.9] object-contain" />
            </button>
            <div className="hidden items-center gap-1 md:flex">
              <button
                onMouseEnter={() => setOpen('fitur')}
                onClick={() => setOpen(open ? null : 'fitur')}
                aria-expanded={open === 'fitur'}
                className={`h-9 rounded-md px-3 text-[15px] transition ${
                  open === 'fitur' || page === 'session'
                    ? 'bg-brand text-white'
                    : 'text-ink hover:bg-paper'
                }`}
              >
                Fitur
              </button>
              {LINKS.map(([k, l]) => (
                <button
                  key={k}
                  onMouseEnter={() => setOpen(null)}
                  onClick={() => go(k)}
                  aria-current={page === k ? 'page' : undefined}
                  className={`h-9 rounded-md px-3 text-[15px] transition ${
                    page === k ? 'bg-brand text-white' : 'text-ink hover:bg-paper'
                  }`}
                >
                  {l}
                </button>
              ))}

              <span className="mx-2 h-5 w-px bg-line" />

              {user ? (
                <>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => go('dashboard')}
                      className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm text-brand transition hover:bg-paper"
                    >
                      <LayoutDashboard className="size-4" /> Konsol Admin
                    </button>
                  )}
                  <Button
                    onClick={() => go('session')}
                    className="!h-9 !rounded-md !px-4"
                  >
                    Mulai sesi
                  </Button>
                  <div className="relative ml-1">
                    <button
                      onMouseEnter={() => setOpen('akun')}
                      onClick={() => setOpen(open === 'akun' ? null : 'akun')}
                      aria-label="Akun"
                      className="grid size-9 place-items-center rounded-md bg-ink text-sm text-paper"
                    >
                      {initialLetter}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => go('login')}
                    className="flex h-9 items-center gap-1.5 rounded-md px-3 text-[15px] text-ink transition hover:bg-paper"
                  >
                    <LogIn className="size-4" /> Masuk
                  </button>
                  <Button
                    onClick={() => go('session')}
                    className="!h-9 !rounded-md !px-4"
                  >
                    Mulai sesi
                  </Button>
                </>
              )}
            </div>

            <button
              onClick={() => setMobile((m) => !m)}
              className="grid size-10 place-items-center rounded-md md:hidden"
              aria-label="Menu"
              aria-expanded={mobile}
            >
              {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </nav>

          {/* User popup dropdown */}
          {open === 'akun' && user && (
            <div className="absolute right-0 top-[64px] hidden w-[260px] rounded-xl bg-surface p-5 shadow-lg ring-1 ring-line md:block">
              <p className="text-sm text-muted">{user.title ?? 'Pengguna'}</p>
              <p className="mt-1 text-lg font-medium">{user.name}</p>
              <p className="text-xs text-muted mt-0.5">{user.email}</p>
              <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm">
                {user.role === 'admin' && (
                  <button
                    onClick={() => go('dashboard')}
                    className="text-left text-brand hover:underline"
                  >
                    Buka Dashboard Admin
                  </button>
                )}
                <button
                  onClick={() => {
                    logout()
                    setOpen(null)
                  }}
                  className="text-left text-[#b8483e] hover:underline"
                >
                  Keluar
                </button>
              </div>
            </div>
          )}

          {/* Features mega menu */}
          {open === 'fitur' && (
            <div className="absolute right-0 top-[64px] hidden w-[600px] gap-6 rounded-xl bg-surface p-5 shadow-lg ring-1 ring-line md:flex">
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-semibold text-ink">Fitur Utama</p>
                <ul className="mt-4 space-y-4">
                  {FEATURES.map((it) => (
                    <li key={it.page}>
                      <button onClick={() => go(it.page)} className="group text-left">
                        <span
                          className={`block text-lg ${
                            page === it.page ? 'text-ink font-medium' : 'text-brand group-hover:text-ink'
                          }`}
                        >
                          {it.label}
                        </span>
                        <span className="block text-sm text-muted">{it.desc}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => go('about')}
                  className="mt-auto pt-6 text-left text-sm text-brand hover:text-ink"
                >
                  Privasi & perlindungan data
                </button>
              </div>
              <img src={IMG.signing} alt="" className="h-64 w-52 rounded-lg object-cover" />
            </div>
          )}

          {/* Mobile slideout */}
          {mobile && (
            <div className="mt-2 max-h-[80vh] overflow-y-auto rounded-xl bg-surface p-5 shadow-xl ring-1 ring-line md:hidden">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Fitur</p>
              {FEATURES.map((it) => (
                <button
                  key={it.page}
                  onClick={() => go(it.page)}
                  className="block w-full border-b border-line py-3 text-left"
                >
                  <span className={`block text-lg ${page === it.page ? 'text-ink font-medium' : 'text-brand'}`}>
                    {it.label}
                  </span>
                  <span className="block text-sm text-muted">{it.desc}</span>
                </button>
              ))}
              <button onClick={() => go('about')} className="block py-3 text-lg text-brand">
                Privasi
              </button>

              {user ? (
                <>
                  <Button onClick={() => go('session')} className="mt-2 w-full">
                    Mulai sesi
                  </Button>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted">{user.title}</p>
                    </div>
                    <button onClick={logout} className="text-[#b8483e]">
                      Keluar
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
                  <Button onClick={() => go('login')} variant="outline" className="w-full">
                    Masuk
                  </Button>
                  <Button onClick={() => go('register')} className="w-full">
                    Daftar Akun
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="flex-1">
        {page === 'home' && <Home go={go} />}
        {page === 'session' && (
          user ? (
            <Session />
          ) : (
            <SessionLoginPrompt onGoLogin={() => go('login')} onGoRegister={() => go('register')} />
          )
        )}
        {page === 'dictionary' && <Dictionary />}
        {page === 'guide' && <Guide go={go} />}
        {page === 'about' && <About />}
      </main>

      {/* Footer */}
      <footer className="bg-ink px-4 pb-4 pt-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-normal leading-tight text-paper sm:text-4xl">
            Saling paham, sana sini.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-paper/70">
            Coba sesi demo skrining PSS-10 langsung di browser. Tanpa instalasi perangkat lunak khusus.
          </p>
          <div className="mt-8 flex justify-center">
            <Button variant="light" arrow onClick={() => go('session')}>
              Mulai sesi skrining
            </Button>
          </div>
        </div>
        <div className="relative mx-auto mt-20 max-w-6xl overflow-hidden rounded-xl bg-surface p-8 md:p-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className="text-sm font-semibold">BISARA</p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                Komunikasi dua arah BISINDO untuk layanan kesehatan mental yang inklusif.
              </p>
            </div>
            {[
              [
                'Produk',
                [
                  ['Sesi skrining', 'session'],
                  ['Kamus Isyarat', 'dictionary'],
                  ['Panduan', 'guide'],
                ],
              ],
              [
                'Informasi',
                [
                  ['Beranda', 'home'],
                  ['Privasi & data', 'about'],
                ],
              ],
              [
                'Teknologi',
                [['Whisper AI'], ['MediaPipe'], ['Three.js']],
              ],
            ].map(([t, links]) => (
              <div key={t as string}>
                <p className="text-sm font-semibold">{t as string}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {(links as string[][]).map(([l, p]) => (
                    <li key={l}>
                      {p ? (
                        <button onClick={() => go(p as Page)} className="text-brand hover:text-ink">
                          {l}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted">
                          {l} <ArrowUpRight className="size-3" />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 flex items-end justify-between gap-6">
            <img src={logoMark} alt="" className="h-24 w-auto opacity-25 sm:h-32" />
            <p className="text-xs text-muted">
              © 2026 BISARA · Sistem Komunikasi Dua Arah BISINDO · Bukan alat diagnosis
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SessionLoginPrompt({
  onGoLogin,
  onGoRegister,
}: {
  onGoLogin: () => void
  onGoRegister: () => void
}) {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center px-6 py-32 text-center">
      <span className="rounded-full bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
        Akses Sesi Konsultasi
      </span>
      <h1 className="mt-6 text-4xl font-normal tracking-tight sm:text-5xl">
        Silakan masuk untuk memulai sesi
      </h1>
      <p className="mt-4 max-w-lg leading-relaxed text-muted">
        Untuk menghubungkan ruang tunggu klien dengan psikolog yang bertugas, silakan masuk dengan akun Teman Tuli atau Psikolog Anda.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onGoLogin} arrow>
          Masuk Sekarang
        </Button>
        <Button onClick={onGoRegister} variant="outline">
          Daftar Akun Baru
        </Button>
      </div>
    </div>
  )
}
