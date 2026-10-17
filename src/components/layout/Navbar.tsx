import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
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
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) setFeatures(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFeatures(false)
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
  }

  const signOut = () => {
    void logout().then(() => navigate('/')).catch(() => triggerVisualToast('Gagal keluar', 'Silakan coba lagi.', 'alert'))
  }

  const isFeatureActive = ['/one-way', '/two-way', '/ritz', '/meet'].some((path) => location.pathname.startsWith(path))
  const itemClass = (active: boolean) => `rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${active ? 'bg-brand text-white' : 'text-ink hover:bg-brand/10 hover:text-brand'}`

  return (
    <div ref={ref} className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="relative mx-auto max-w-6xl">
        <nav aria-label="Navigasi utama" className="flex h-14 items-center justify-between rounded-xl border border-line bg-surface px-3 pl-4 shadow-sm">
          <Link to="/" aria-label="BISARA, ke beranda" className="h-9 w-[100px] overflow-hidden">
            <img src={logoFull} alt="BISARA" className="size-full scale-[1.9] object-contain" />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <div
              className="relative"
              onMouseEnter={() => setFeatures(true)}
              onMouseLeave={() => setFeatures(false)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFeatures(false)
              }}
            >
              <button type="button" onFocus={() => setFeatures(true)} aria-expanded={features} aria-controls="menu-fitur" className={`${itemClass(isFeatureActive)} inline-flex items-center gap-1`}>
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
            {user ? <button onClick={signOut} className={itemClass(false)}>Keluar</button> : <Link to="/login" className={itemClass(location.pathname === '/login')}>Masuk</Link>}
          </div>

          <button type="button" onClick={() => setMobile((open) => !open)} aria-expanded={mobile} className="rounded-md px-3 py-2 text-sm font-medium transition hover:bg-brand/10 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand md:hidden">
            {mobile ? 'Tutup' : 'Menu'}
          </button>
        </nav>

        {mobile && (
          <div className="absolute inset-x-0 top-16 rounded-xl border border-line bg-surface p-3 shadow-xl md:hidden">
            <div className="space-y-1">
              <Link to="/one-way" onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">One-way Service</Link>
              <Link to="/two-way" onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">Two-way Service</Link>
              {twoWayLinks.map((feature) => <Link key={feature.path} to={feature.path} onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">{feature.title}</Link>)}
              <div className="my-2 border-t border-line" />
              {links.map(({ path, label }) => <Link key={path} to={path} onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">{label}</Link>)}
              <div className="my-2 border-t border-line" />
              {user ? <button onClick={signOut} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">Keluar</button> : <Link to="/login" onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">Masuk</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
