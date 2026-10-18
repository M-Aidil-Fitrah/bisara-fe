import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

export type FeatureLink = {
  path: string
  title: string
}

type FeatureMenuProps = {
  active: boolean
  open: boolean
  twoWayLinks: FeatureLink[]
  onToggle: () => void
  onNavigate: () => void
  onBlur: () => void
}

const linkClass = 'rounded-lg px-3 py-2 text-sm transition hover:bg-brand/10 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand'

export default function FeatureMenu({ active, open, twoWayLinks, onToggle, onNavigate, onBlur }: FeatureMenuProps) {
  return (
    <div className="relative" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onBlur()
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="menu-fitur"
        className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${active ? 'bg-brand text-white' : open ? 'bg-brand/10 text-brand' : 'text-ink hover:bg-brand/10 hover:text-brand'}`}
      >
        Fitur <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id="menu-fitur" className="absolute left-0 top-full mt-4 w-96 rounded-xl border border-line bg-surface p-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            <Link to="/one-way" onClick={onNavigate} className={`${linkClass} font-medium text-ink`}>One-way Service</Link>
            <div className="border-l border-line pl-2">
              <Link to="/two-way" onClick={onNavigate} className={`${linkClass} block font-medium text-ink`}>Two-way Service</Link>
              <div className="mt-1 space-y-1 border-t border-line pt-2">
                {twoWayLinks.map((feature) => (
                  <Link key={feature.path} to={feature.path} onClick={onNavigate} className={`${linkClass} block text-muted`}>
                    {feature.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
