export interface AuthHeroProps {
  imageSrc: string
  imageAlt?: string
  eyebrow: string
  title: string
  desc: string
  imageOpacityClass?: string
  onBack?: () => void
}

export default function AuthHero({
  imageSrc,
  imageAlt = '',
  eyebrow,
  title,
  desc,
  imageOpacityClass = '',
  onBack,
}: AuthHeroProps) {
  return (
    <div className="relative hidden h-full overflow-hidden bg-ink lg:block">
      <img
        src={imageSrc}
        alt={imageAlt}
        data-hero-bg
        className={`absolute inset-0 size-full object-cover ${imageOpacityClass}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
      {onBack && <button type="button" onClick={onBack} className="absolute left-8 top-8 text-sm text-paper/80 transition hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-paper">← Beranda</button>}
      <div data-hero className="absolute inset-x-0 bottom-0 p-12">
        <p className="text-xs uppercase tracking-[0.14em] text-brand-soft">{eyebrow}</p>
        <p className="mt-4 max-w-md text-5xl font-normal leading-[1.05] tracking-tight text-paper">
          {title}
        </p>
        <p className="mt-4 max-w-sm text-paper/70">{desc}</p>
      </div>
    </div>
  )
}
