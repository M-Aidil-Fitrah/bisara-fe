import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useAppointments } from '../lib/appointments'
import type { Appt } from '../types'
import SessionLoginPrompt from '../components/session/SessionLoginPrompt'
import TuliLobby from '../components/session/TuliLobby'
import PsikologLobby from '../components/session/PsikologLobby'
import TuliConsultationView from '../components/session/TuliConsultationView'
import PsikologConsultationView from '../components/session/PsikologConsultationView'

export default function Session() {
  const user = useAuth()
  const { setStatus, release } = useAppointments()
  const [appt, setAppt] = useState<Appt | null>(null)

  if (!user?.kind) return <SessionLoginPrompt />

  const leave = () => {
    if (appt && user.kind === 'psikolog') release(appt.id)
    setAppt(null)
    window.scrollTo({ top: 0 })
  }

  if (!appt) {
    return user.kind === 'tuli' ? (
      <TuliLobby
        name={user.name}
        onJoin={(a) => {
          setAppt(a)
          window.scrollTo({ top: 0 })
        }}
      />
    ) : (
      <PsikologLobby
        name={user.name}
        onStart={(a) => {
          setStatus(a.id, 'live')
          setAppt(a)
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  return user.kind === 'tuli' ? (
    <TuliConsultationView appt={appt} onLeave={leave} />
  ) : (
    <PsikologConsultationView
      appt={appt}
      onLeave={leave}
      onSaved={() => setStatus(appt.id, 'done')}
    />
  )
}
