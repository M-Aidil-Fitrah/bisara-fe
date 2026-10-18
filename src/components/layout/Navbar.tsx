import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logoFull from '../../assets/logo-full.png'
import { logout, useAuth } from '../../lib/auth'
import { triggerVisualToast } from '../../lib/a11y'
import ProfileMenu from './ProfileMenu'
import FeatureMenu, { type FeatureLink } from './FeatureMenu'
import MobileNavigation from './MobileNavigation'

const links = [
  { path: '/dictionary', label: 'Kamus' },
  { path: '/guide', label: 'Panduan' },
  { path: '/about', label: 'Privasi' },
]

const twoWayLinks: FeatureLink[] = [
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
            <FeatureMenu active={isFeatureActive} open={features} twoWayLinks={twoWayLinks} onToggle={() => { setFeatures((open) => !open); setProfile(false) }} onNavigate={closeMenus} onBlur={() => setFeatures(false)} />
            {links.map(({ path, label }) => <Link key={path} to={path} onClick={closeMenus} className={itemClass(location.pathname === path)}>{label}</Link>)}
            <span className="mx-2 h-5 w-px bg-line" />
            {user ? <ProfileMenu user={user} open={profile} loggingOut={loggingOut} onToggle={() => { setProfile((open) => !open); setFeatures(false) }} onClose={() => setProfile(false)} onLogout={signOut} /> : <Link to="/login" className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">Masuk</Link>}
          </div>

          <button type="button" onClick={() => { setMobile((open) => !open); setMobileFeatures(false) }} aria-expanded={mobile} aria-controls="menu-mobile" aria-label={mobile ? 'Tutup menu' : 'Buka menu'} className="grid size-10 place-items-center rounded-lg text-ink transition hover:bg-brand/10 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand md:hidden">
            {mobile ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </nav>

        <MobileNavigation user={user} open={mobile} featuresOpen={mobileFeatures} loggingOut={loggingOut} links={links} twoWayLinks={twoWayLinks} onToggleFeatures={() => setMobileFeatures((open) => !open)} onNavigate={closeMenus} onLogout={signOut} />
      </div>
    </div>
  )
}
