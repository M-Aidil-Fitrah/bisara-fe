import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logoFull from '../../assets/logo-full.png'
import { logout, useAuth } from '../../lib/auth'
import { triggerVisualToast } from '../../lib/a11y'

const links = [
  { path: '/dictionary', label: 'Kamus' },
  { path: '/guide', label: 'Panduan' },
  { path: '/about', label: 'Privasi' },
]

const featureLinks = [
  { path: '/one-way', title: 'One-way Service', description: 'Editor dan layar privat untuk pesan publik.' },
  { path: '/two-way/layanan-psikolog', title: 'Layanan Psikolog', description: 'Layanan dua arah bersama mitra yang tersedia.' },
  { path: '/two-way/resepsionis', title: 'Layanan Resepsionis', description: 'Segera hadir.' },
  { path: '/two-way/layanan-lainnya', title: 'Layanan Publik Lainnya', description: 'Segera hadir.' },
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
  const itemClass = (active: boolean) => `rounded-md px-3 py-2 text-sm font-medium transition hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${active ? 'bg-brand text-white' : 'text-ink'}`

  return (
    <div ref={ref} className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="relative mx-auto max-w-6xl">
        <nav aria-label="Navigasi utama" className="flex h-14 items-center justify-between rounded-xl border border-line bg-surface px-3 pl-4 shadow-sm">
          <Link to="/" aria-label="BISARA, ke beranda" className="h-9 w-[100px] overflow-hidden">
            <img src={logoFull} alt="BISARA" className="size-full scale-[1.9] object-contain" />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <div className="relative">
              <button type="button" onClick={() => setFeatures((open) => !open)} aria-expanded={features} aria-controls="menu-fitur" className={itemClass(features || isFeatureActive)}>
                Fitur
              </button>
              {features && (
                <div id="menu-fitur" className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-line bg-surface p-2 shadow-xl">
                  <p className="px-2 py-2 text-xs font-medium uppercase tracking-wider text-muted">Layanan</p>
                  {featureLinks.map((feature) => (
                    <Link key={feature.path} to={feature.path} onClick={closeMenus} className="block rounded-lg px-3 py-2.5 transition hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
                      <span className="block text-sm font-medium text-ink">{feature.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">{feature.description}</span>
                    </Link>
                  ))}
                  <Link to="/two-way" onClick={closeMenus} className="mt-1 block border-t border-line px-3 pt-3 text-sm font-medium text-brand hover:underline">Semua layanan dua arah</Link>
                </div>
              )}
            </div>
            {links.map(({ path, label }) => <Link key={path} to={path} onClick={closeMenus} className={itemClass(location.pathname === path)}>{label}</Link>)}
            <span className="mx-2 h-5 w-px bg-line" />
            {user ? <button onClick={signOut} className={itemClass(false)}>Keluar</button> : <Link to="/login" className={itemClass(location.pathname === '/login')}>Masuk</Link>}
          </div>

          <button type="button" onClick={() => setMobile((open) => !open)} aria-expanded={mobile} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand md:hidden">
            {mobile ? 'Tutup' : 'Menu'}
          </button>
        </nav>

        {mobile && (
          <div className="absolute inset-x-0 top-16 rounded-xl border border-line bg-surface p-3 shadow-xl md:hidden">
            <div className="space-y-1">
              {featureLinks.map((feature) => <Link key={feature.path} to={feature.path} onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper">{feature.title}</Link>)}
              <div className="my-2 border-t border-line" />
              {links.map(({ path, label }) => <Link key={path} to={path} onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper">{label}</Link>)}
              <div className="my-2 border-t border-line" />
              {user ? <button onClick={signOut} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-paper">Keluar</button> : <Link to="/login" onClick={closeMenus} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-paper">Masuk</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
