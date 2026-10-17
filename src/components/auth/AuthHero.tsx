export interface AuthHeroProps {
  imageSrc: string
  imageAlt?: string
  eyebrow: string
  title: string
  desc: string
  imageOpacityClass?: string
}

export default function AuthHero({
  imageSrc,
  imageAlt = '',
  eyebrow,
  title,
  desc,
  imageOpacityClass = '',
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
