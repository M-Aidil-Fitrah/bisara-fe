import type { ComponentProps, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

type BtnProps = ComponentProps<'button'> & { variant?: 'primary' | 'light' | 'outline' | 'ghost'; arrow?: boolean }

const V = {
  primary: 'bg-brand text-white hover:bg-brand-strong',
  light: 'bg-brand-soft text-ink hover:bg-white',
  outline: 'text-ink ring-1 ring-ink/70 hover:bg-ink hover:text-paper',
  ghost: 'text-muted hover:text-ink',
}

/** Pill button; `arrow` appends an inline arrow. */
export function Button({ variant = 'primary', arrow, className = '', children, ...p }: BtnProps) {
  const pill = `inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium transition disabled:opacity-50 ${V[variant]}`
  return (
    <button {...p} className={`group ${pill} ${arrow ? 'gap-2 pr-4' : ''} ${className}`}>
      {children}
      {arrow && <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />}
    </button>
  )
}

export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${light ? 'text-brand-soft' : 'text-brand'}`}>{children}</p>
}

export function SectionHeader({ eyebrow, title, desc, align = 'left', light }: { eyebrow: string; title: ReactNode; desc?: string; align?: 'left' | 'center'; light?: boolean }) {
  return (
    <div data-reveal className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2 className={`mt-4 text-4xl font-normal leading-[1.1] tracking-tight sm:text-5xl ${light ? 'text-paper' : 'text-ink'}`}>{title}</h2>
      {desc && <p className={`mt-5 text-lg leading-relaxed ${light ? 'text-paper/75' : 'text-muted'}`}>{desc}</p>}
    </div>
  )
}

/** Full-bleed photographic header used by every inner page (navbar floats above it). */
export function PageHeader({ eyebrow, title, desc, image }: { eyebrow: string; title: string; desc: string; image: string }) {
  return (
    <header className="relative overflow-hidden bg-ink">
      <img src={image} alt="" data-hero-bg className="absolute inset-0 size-full object-cover opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
      <div data-hero className="relative mx-auto max-w-6xl px-6 pb-16 pt-40">
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-2xl text-5xl font-normal leading-[1.05] tracking-tight text-paper sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/75">{desc}</p>
      </div>
    </header>
  )
}

export const img = (id: string, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const IMG = {
  hero: img('photo-1758691461935-202e2ef6b69f', 2000),
  consult: img('photo-1714976694810-85add1a29c96'),
  signing: img('photo-1691929739553-3bb05b093744'),
  hands: img('photo-1655720358097-673f2a952cb7'),
  psikolog: img('photo-1573495804664-b1c0849525af', 900),
  group: img('photo-1737567425973-bf7b6369d08a', 900),
  clinic: img('photo-1714976694525-71eb29a7c500', 900),
  device: img('photo-1612832164313-ac0d7e07b5ce'),
  laptop: img('photo-1664575196044-195f135295df'),
  light: img('photo-1598312276291-6cb6c0a70cc7', 900),
  smile: img('photo-1747264464438-ff4188b1678a', 900),
}
