import { Menu, UserPlus } from 'lucide-react'

interface DashboardHeaderProps {
  onToggleMobileNav: () => void
  onOpenAddPsy: () => void
}

export default function DashboardHeader({
  onToggleMobileNav,
  onOpenAddPsy,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="grid size-10 place-items-center rounded-md lg:hidden hover:bg-surface"
          aria-label="Buka navigasi"
        >
          <Menu className="size-5 text-ink" />
        </button>
        <p className="text-sm font-medium text-muted">Konsol Administrator BISARA</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenAddPsy}
          className="hidden items-center gap-2 rounded-lg bg-brand px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-brand-strong sm:flex"
        >
          <UserPlus className="size-3.5" /> Tambah Psikolog
        </button>
        <p className="hidden text-sm text-muted md:block">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
    </header>
  )
}
