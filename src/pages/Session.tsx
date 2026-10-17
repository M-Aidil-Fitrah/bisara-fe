import { useState } from 'react'
import { useAuthState } from '../lib/auth'
import type { Appt } from '../types'
import SessionLoginPrompt from '../components/session/SessionLoginPrompt'
import TuliLobby from '../components/session/TuliLobby'
import PsikologLobby from '../components/session/PsikologLobby'
import TuliConsultationView from '../components/session/TuliConsultationView'
import PsikologConsultationView from '../components/session/PsikologConsultationView'
import { api, ApiError } from '../api/client'

export default function Session() {
  const { user, loading: authLoading, error: authError } = useAuthState()
  const [appt, setAppt] = useState<Appt | null>(null)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  if (authLoading) return <div className="grid min-h-screen place-items-center text-muted">Memeriksa sesi login…</div>
  if (authError) return <div role="alert" className="grid min-h-screen place-items-center p-6 text-center text-[#b8483e]">{authError}</div>
  if (!user?.kind) return <SessionLoginPrompt />

  const leave = () => {
    setAppt(null)
    window.scrollTo({ top: 0 })
  }

  const join = async (appointment: Appt) => {
    setJoining(true)
    setJoinError(null)
    try {
      const session = await api.sessions.create(appointment.id)
      setAppt({ ...appointment, sessionId: session.id, status: 'live' })
      window.scrollTo({ top: 0 })
    } catch (cause) {
      setJoinError(cause instanceof ApiError ? cause.message : 'Tidak dapat membuka sesi')
    } finally {
      setJoining(false)
    }
  }

  if (joining) return <div className="min-h-screen grid place-items-center">Membuka sesi aman…</div>
  if (joinError) return (
    <div className="min-h-screen grid place-items-center gap-4 text-center">
      <p role="alert" className="text-[#b8483e]">{joinError}</p>
      <button className="text-brand underline" onClick={() => setJoinError(null)}>Kembali ke jadwal</button>
    </div>
  )

  if (!appt) {
    return user.kind === 'tuli' ? (
      <TuliLobby
        name={user.name}
        onJoin={(a) => void join(a)}
      />
    ) : (
      <PsikologLobby
        name={user.name}
        onStart={(a) => void join(a)}
      />
    )
  }

  if (!appt.sessionId) {
    return <div role="alert" className="min-h-screen grid place-items-center">ID sesi tidak tersedia.</div>
  }
  const activeAppt = { ...appt, sessionId: appt.sessionId }

  return user.kind === 'tuli' ? (
    <TuliConsultationView appt={activeAppt} onLeave={leave} />
  ) : (
    <PsikologConsultationView
      appt={activeAppt}
      onLeave={leave}
      onSaved={() => setAppt((current) => current ? { ...current, status: 'done' } : current)}
    />
  )
}
