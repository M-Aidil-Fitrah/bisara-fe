import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useDashboardStats, useSessionHistory } from '../lib/history'
import { useAuthState } from '../lib/auth'
import type { Account, SessionRecord } from '../types'
import DashboardSidebar, { type TabKey } from '../components/dashboard/DashboardSidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import OverviewTab from '../components/dashboard/OverviewTab'
import HistoryTab from '../components/dashboard/HistoryTab'
import UsersTab from '../components/dashboard/UsersTab'
import PsychologistsTab from '../components/dashboard/PsychologistsTab'
import VocabTab from '../components/dashboard/VocabTab'
import AddPsychologistModal from '../components/dashboard/AddPsychologistModal'
import SessionDetailDrawer from '../components/dashboard/SessionDetailDrawer'

interface DashboardProps {
  user?: Account | null
  onGoHome?: () => void
}

function isTabKey(value: string | null): value is TabKey {
  return value === 'overview' || value === 'history' || value === 'users' || value === 'psikolog' || value === 'vocab'
}

export default function Dashboard({ user: propUser }: DashboardProps) {
  const { user: authUser, loading: authLoading, error: authError } = useAuthState()
  const user = propUser !== undefined ? propUser : authUser
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab')
  const tab: TabKey = isTabKey(tabParam) ? tabParam : 'overview'
  const [navOpen, setNavOpen] = useState(false)
  const [openSession, setOpenSession] = useState<SessionRecord | null>(null)
  const [showAddPsy, setShowAddPsy] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const historyRequired = ['overview', 'history', 'psikolog'].includes(tab)
  const {
    history: data,
    loading: historyLoading,
    error: historyError,
    loadMore: loadMoreHistory,
    hasMore: hasMoreHistory,
    loadingMore: loadingMoreHistory,
  } = useSessionHistory(historyRequired)
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats(tab === 'overview')

  const setTab = (t: TabKey) => {
    setSearchParams({ tab: t })
  }

  useEffect(() => {
    if (mainRef.current) {
      const items = mainRef.current.querySelectorAll('[data-dash]')
      if (items.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' },
        )
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [tab])

  if (propUser === undefined && authLoading) {
    return <div className="grid min-h-screen place-items-center text-muted">Memeriksa hak akses…</div>
  }

  if (propUser === undefined && authError) {
    return <div role="alert" className="grid min-h-screen place-items-center p-6 text-center text-[#b8483e]">{authError}</div>
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-normal">Akses Terbatas</h1>
        <p className="mt-2 text-muted">Hanya administrator klinik yang dapat mengakses halaman konsol.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
        >
          Masuk sebagai Admin
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <DashboardSidebar
        tab={tab}
        setTab={setTab}
        user={user}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
      />

      <div className="flex flex-1 flex-col overflow-x-hidden">
        <DashboardHeader
          onToggleMobileNav={() => setNavOpen(!navOpen)}
          onOpenAddPsy={() => setShowAddPsy(true)}
        />

        <main ref={mainRef} className="px-4 py-8 sm:px-8 sm:py-10">
          {['overview', 'history', 'psikolog'].includes(tab) && historyLoading && <p className="mb-6 rounded-xl bg-surface p-6 text-muted">Memuat data sesi dari server…</p>}
          {['overview', 'history', 'psikolog'].includes(tab) && historyError && <p role="alert" className="mb-6 rounded-xl bg-surface p-6 text-[#b8483e]">{historyError}</p>}
          {tab === 'overview' && statsLoading && <p className="mb-6 rounded-xl bg-surface p-6 text-muted">Memuat statistik dari server…</p>}
          {tab === 'overview' && statsError && <p role="alert" className="mb-6 rounded-xl bg-surface p-6 text-[#b8483e]">{statsError}</p>}
          {!historyLoading && !historyError && !statsLoading && !statsError && stats && tab === 'overview' && (
            <OverviewTab
              data={data}
              stats={stats}
              onOpen={setOpenSession}
              goHistory={() => setTab('history')}
            />
          )}
          {!historyLoading && !historyError && tab === 'history' && (
            <HistoryTab
              data={data}
              onOpen={setOpenSession}
              onLoadMore={() => void loadMoreHistory()}
              hasMore={hasMoreHistory}
              loadingMore={loadingMoreHistory}
            />
          )}
          {tab === 'users' && (
            <UsersTab
              onOpenAddPsy={() => setShowAddPsy(true)}
            />
          )}
          {!historyLoading && !historyError && tab === 'psikolog' && (
            <PsychologistsTab
              data={data}
              onOpenAddPsy={() => setShowAddPsy(true)}
            />
          )}
          {tab === 'vocab' && <VocabTab />}
        </main>
      </div>

      {openSession && (
        <SessionDetailDrawer
          session={openSession}
          onClose={() => setOpenSession(null)}
        />
      )}

      {showAddPsy && (
        <AddPsychologistModal
          onClose={() => setShowAddPsy(false)}
        />
      )}
    </div>
  )
}
