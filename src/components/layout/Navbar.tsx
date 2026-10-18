import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logoFull from '../../assets/logo-full.png'
import { logout, useAuth } from '../../lib/auth'
import { triggerVisualToast } from '../../lib/a11y'

const links = [
  { path: '/dictionary', label: 'Kamus' },
  { path: '/guide', label: 'Panduan' },
  { path: '/about', label: 'Privasi' },
]

const twoWayLinks = [
  { path: '/two-way/layanan-psikolog', title: 'Layanan Psikolog' },
  { path: '/two-way/resepsionis', title: 'Layanan Resepsionis' },
  { path: '/two-way/layanan-lainnya', title: 'Layanan Publik Lainnya' },
]

export default function Navbar() {
  const user = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [features, setFeatures] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [mobileFeatures, setMobileFeatures] = useState(false)
  const [profile, setProfile] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) {
        setFeatures(false)
        setProfile(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFeatures(false)
        setProfile(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const closeMenus = () => {
    setFeatures(false)
    setMobile(false)
    setMobileFeatures(false)
    setProfile(false)
  }

  const signOut = () => {
    setLoggingOut(true)
    void logout()
      .then(() => {
        closeMenus()
        navigate('/')
      })
      .catch(() => triggerVisualToast('Gagal keluar', 'Silakan coba lagi.', 'alert'))
      .finally(() => setLoggingOut(false))
  }

  const isFeatureActive = ['/one-way', '/two-way', '/ritz', '/meet'].some((path) => location.pathname.startsWith(path))
  const itemClass = (active: boolean) => `rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${active ? 'bg-brand text-white' : 'text-ink hover:bg-brand/10 hover:text-brand'}`

  return (
    <div ref={ref} className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="relative mx-auto max-w-7xl">
        <nav aria-label="Navigasi utama" className="flex h-14 items-center justify-between rounded-xl border border-line bg-surface px-3 pl-4 shadow-sm">
          <Link to="/" aria-label="BISARA, ke beranda" className="h-9 w-[100px] overflow-hidden">
            <img src={logoFull} alt="BISARA" className="size-full scale-[1.9] object-contain" />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <div className="relative" onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFeatures(false)
            }}>
              <button type="button" onClick={() => { setFeatures((open) => !open); setProfile(false) }} aria-expanded={features} aria-controls="menu-fitur" className={`${itemClass(isFeatureActive)} ${features && !isFeatureActive ? 'bg-brand/10 text-brand' : ''} inline-flex items-center gap-1`}>
                Fitur <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${features ? 'rotate-180' : ''}`} />
              </button>
              {features && (
                <div id="menu-fitur" className="absolute left-0 top-full mt-4 w-96 rounded-xl border border-line bg-surface p-3 shadow-xl">
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/one-way" onClick={closeMenus} className="rounded-lg px-3 py-2 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
                      One-way Service
                    </Link>
                    <div className="border-l border-line pl-2">
                      <Link to="/two-way" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">Two-way Service</Link>
                      <div className="mt-1 space-y-1 border-t border-line pt-2">
                      {twoWayLinks.map((feature) => (
                        <Link key={feature.path} to={feature.path} onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-brand/10 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
                          {feature.title}
                        </Link>
                      ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {links.map(({ path, label }) => <Link key={path} to={path} onClick={closeMenus} className={itemClass(location.pathname === path)}>{label}</Link>)}
            <span className="mx-2 h-5 w-px bg-line" />
            {user ? (
              <div className="relative" onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setProfile(false)
              }}>
                <button type="button" onClick={() => { setProfile((open) => !open); setFeatures(false) }} aria-expanded={profile} aria-controls="menu-profil" aria-label="Buka profil" className={`grid size-9 place-items-center rounded-full text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${profile ? 'bg-brand text-white' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}>
                  {user.name.charAt(0).toLocaleUpperCase('id-ID')}
                </button>
                {profile && (
                  <div id="menu-profil" className="absolute right-0 top-full mt-4 w-72 rounded-xl border border-line bg-surface p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-semibold text-brand">{user.name.charAt(0).toLocaleUpperCase('id-ID')}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      </div>
                    </div>
                    <div className="my-4 border-t border-line" />
                    <button type="button" disabled={loggingOut} onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2.5 text-sm font-medium text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
                      <LogOut aria-hidden="true" className="size-4" /> {loggingOut ? 'Keluar…' : 'Keluar'}
                    </button>
                  </div>
                )}
              </div>
            ) : <Link to="/login" className={itemClass(location.pathname === '/login')}>Masuk</Link>}
          </div>

          <button type="button" onClick={() => { setMobile((open) => !open); setMobileFeatures(false) }} aria-expanded={mobile} aria-controls="menu-mobile" aria-label={mobile ? 'Tutup menu' : 'Buka menu'} className="grid size-10 place-items-center rounded-lg text-ink transition hover:bg-brand/10 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand md:hidden">
            {mobile ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </nav>

        {mobile && (
          <div id="menu-mobile" className="absolute inset-x-0 top-16 origin-top rounded-xl border border-line bg-surface p-3 shadow-xl animate-[menu-in_180ms_ease-out] md:hidden">
            <div className="space-y-1">
              <button type="button" onClick={() => setMobileFeatures((open) => !open)} aria-expanded={mobileFeatures} aria-controls="menu-mobile-fitur" className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">Fitur <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${mobileFeatures ? 'rotate-180' : ''}`} /></button>
              <div id="menu-mobile-fitur" className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${mobileFeatures ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="ml-3 space-y-1 border-l border-line py-1 pl-2">
                    <Link to="/one-way" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">One-way Service</Link>
                    <Link to="/two-way" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">Two-way Service</Link>
                    <div className="ml-3 border-l border-line pl-2">{twoWayLinks.map((feature) => <Link key={feature.path} to={feature.path} onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-brand/10 hover:text-brand">{feature.title}</Link>)}</div>
                  </div>
                </div>
              </div>
              <div className="my-2 border-t border-line" />
              {links.map(({ path, label }) => <Link key={path} to={path} onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">{label}</Link>)}
              <div className="my-2 border-t border-line" />
              {user ? (
                <div className="rounded-lg border border-line p-3">
                  <p className="text-sm font-semibold text-ink">{user.name}</p>
                  <p className="mt-1 truncate text-xs text-muted">{user.email}</p>
                  <button type="button" disabled={loggingOut} onClick={signOut} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2.5 text-sm font-medium text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"><LogOut aria-hidden="true" className="size-4" /> {loggingOut ? 'Keluar…' : 'Keluar'}</button>
                </div>
              ) : <Link to="/login" onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">Masuk</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
