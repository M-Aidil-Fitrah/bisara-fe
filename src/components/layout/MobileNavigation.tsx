import { ChevronDown, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Account } from '../../types'
import type { FeatureLink } from './FeatureMenu'

type NavLink = { path: string; label: string }

type MobileNavigationProps = {
  user: Account | null | undefined
  open: boolean
  featuresOpen: boolean
  loggingOut: boolean
  links: NavLink[]
  twoWayLinks: FeatureLink[]
  onToggleFeatures: () => void
  onNavigate: () => void
  onLogout: () => void
}

export default function MobileNavigation({
  user,
  open,
  featuresOpen,
  loggingOut,
  links,
  twoWayLinks,
  onToggleFeatures,
  onNavigate,
  onLogout,
}: MobileNavigationProps) {
  if (!open) return null

  return (
    <div id="menu-mobile" className="absolute inset-x-0 top-16 origin-top rounded-xl border border-line bg-surface p-3 shadow-xl animate-[menu-in_180ms_ease-out] md:hidden">
      <div className="space-y-1">
        <button type="button" onClick={onToggleFeatures} aria-expanded={featuresOpen} aria-controls="menu-mobile-fitur" className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
          Fitur <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
        </button>
        <div id="menu-mobile-fitur" className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${featuresOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="ml-3 space-y-1 border-l border-line py-1 pl-2">
              <Link to="/one-way" onClick={onNavigate} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">One-way Service</Link>
              <Link to="/two-way" onClick={onNavigate} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">Two-way Service</Link>
              <div className="ml-3 border-l border-line pl-2">
                {twoWayLinks.map((feature) => <Link key={feature.path} to={feature.path} onClick={onNavigate} className="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-brand/10 hover:text-brand">{feature.title}</Link>)}
              </div>
            </div>
          </div>
        </div>
        {links.map(({ path, label }) => <Link key={path} to={path} onClick={onNavigate} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-brand/10 hover:text-brand">{label}</Link>)}
        {user ? (
          <div className="rounded-lg border border-line p-3">
            <p className="text-sm font-semibold text-ink">{user.name}</p>
            <p className="mt-1 truncate text-xs text-muted">{user.email}</p>
            <button type="button" disabled={loggingOut} onClick={onLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2.5 text-sm font-medium text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
              <LogOut aria-hidden="true" className="size-4" /> {loggingOut ? 'Keluar…' : 'Keluar'}
            </button>
          </div>
        ) : <Link to="/login" onClick={onNavigate} className="mt-2 block rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-brand-strong">Masuk</Link>}
      </div>
    </div>
  )
}
