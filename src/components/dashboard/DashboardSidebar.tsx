import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import logoFull from '../../assets/logo-full.png'
import { logout } from '../../lib/auth'
import type { Account } from '../../types'

export type TabKey = 'overview' | 'history' | 'users' | 'psikolog' | 'vocab'

interface DashboardSidebarProps {
  tab: TabKey
  setTab: (t: TabKey) => void
  user: Account
  navOpen: boolean
  setNavOpen: (open: boolean) => void
}

const TABS: [TabKey, string][] = [
  ['overview', 'Ringkasan'],
  ['history', 'Riwayat sesi'],
  ['users', 'Pengguna'],
  ['psikolog', 'Psikolog'],
  ['vocab', 'Kosakata'],
]

export default function DashboardSidebar({
  tab,
  setTab,
  user,
  navOpen,
  setNavOpen,
}: DashboardSidebarProps) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink p-6 text-paper transition-transform lg:static lg:translate-x-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-20 overflow-hidden">
              <img src={logoFull} alt="BISARA" className="size-full scale-[1.9] object-contain brightness-0 invert" />
            </div>
            <p className="mt-1 text-xs text-brand-soft">Konsol admin</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1 text-xs text-paper/70 hover:text-paper"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="size-3.5" /> Beranda
          </Link>
        </div>

        <nav className="mt-10 flex flex-col gap-1">
          {TABS.map(([k, l]) => (
            <button
              key={k}
              onClick={() => {
                setTab(k)
                setNavOpen(false)
              }}
              className={`rounded-lg px-3 py-2.5 text-left text-sm transition ${
                tab === k ? 'bg-brand text-white font-medium' : 'text-paper/70 hover:bg-ink-2 hover:text-paper'
              }`}
            >
              {l}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-lg bg-ink-2 p-4">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-paper/50">{user.email}</p>
          <button
            onClick={() => {
              void logout()
                .then(() => { window.location.href = '/' })
                .catch((error) => { window.alert(error instanceof Error ? error.message : 'Gagal keluar dari server') })
            }}
            className="mt-3 text-sm text-brand-soft hover:text-paper"
          >
            Keluar
          </button>
        </div>
      </aside>

      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}
    </>
  )
}
