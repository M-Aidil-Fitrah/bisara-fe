import type { ReactNode } from 'react'
import logoFull from '../../assets/logo-full.png'
import AuthHero, { type AuthHeroProps } from './AuthHero'

type AuthPageLayoutProps = {
  hero: Omit<AuthHeroProps, 'onBack'>
  onBack: () => void
  children: ReactNode
  footer: ReactNode
}

export default function AuthPageLayout({ hero, onBack, children, footer }: AuthPageLayoutProps) {
  return (
    <div className="grid h-screen max-h-screen w-full overflow-hidden lg:grid-cols-2">
      <AuthHero {...hero} onBack={onBack} />
      <div className="flex h-full flex-col justify-between overflow-y-auto px-6 py-6 sm:px-12 sm:py-8">
        <div>
          <button onClick={onBack} aria-label="Kembali ke Beranda" className="h-9 w-[100px] overflow-hidden">
            <img src={logoFull} alt="BISARA" className="size-full scale-[1.9] object-contain" />
          </button>
          <button onClick={onBack} className="mt-4 text-xs text-muted transition hover:text-ink lg:hidden">← Beranda</button>
        </div>
        {children}
        <div className="text-center sm:text-left">{footer}</div>
      </div>
    </div>
  )
}
