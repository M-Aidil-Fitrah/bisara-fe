import { useEffect, useState } from 'react'
import type { Appt } from '../types'

export type Psychologist = {
  name: string
  focus: string
  bisindo: string
  photo: string
  email?: string
}

export const INITIAL_PSYCHOLOGISTS: Psychologist[] = [
  {
    name: 'dr. Nadia Putri, M.Psi',
    focus: 'Stres & kecemasan',
    bisindo: 'Dasar',
    photo: 'photo-1573495804664-b1c0849525af',
    email: 'psikolog@bisara.id',
  },
  {
    name: 'Rizky Hanafi, M.Psi',
    focus: 'Remaja & mahasiswa',
    bisindo: 'Belum',
    photo: 'photo-1612832164313-ac0d7e07b5ce',
  },
  {
    name: 'Sarah Mutia, M.Psi',
    focus: 'Keluarga & relasi',
    bisindo: 'Menengah',
    photo: 'photo-1551847677-dc82d764e1eb',
  },
  {
    name: 'dr. Teuku Fadli, Sp.KJ',
    focus: 'Psikiatri umum',
    bisindo: 'Belum',
    photo: 'photo-1758691462477-976f771224d8',
  },
]

const KEY_PSY = 'bisara-psychologists'

export function getPsychologists(): Psychologist[] {
  try {
    const raw = localStorage.getItem(KEY_PSY)
    if (!raw) return INITIAL_PSYCHOLOGISTS
    const parsed = JSON.parse(raw) as Psychologist[]
    return Array.isArray(parsed) && parsed.length ? parsed : INITIAL_PSYCHOLOGISTS
  } catch {
    return INITIAL_PSYCHOLOGISTS
  }
}

export function savePsychologists(list: Psychologist[]) {
  localStorage.setItem(KEY_PSY, JSON.stringify(list))
  window.dispatchEvent(new Event('bisara-psychologists'))
}

export function addPsychologistToRoster(psy: Psychologist) {
  const cur = getPsychologists()
  const exists = cur.some((p) => p.name.toLowerCase() === psy.name.toLowerCase() || (psy.email && p.email === psy.email))
  if (!exists) {
    savePsychologists([psy, ...cur])
  }
}

export function usePsychologists(): Psychologist[] {
  const [list, setList] = useState<Psychologist[]>(getPsychologists)
  useEffect(() => {
    const sync = () => setList(getPsychologists())
    window.addEventListener('storage', sync)
    window.addEventListener('bisara-psychologists', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('bisara-psychologists', sync)
    }
  }, [])
  return list
}

export const PSYCHOLOGISTS = INITIAL_PSYCHOLOGISTS

const KEY = 'bisara-appts'
const SEED: Appt[] = [
  { id: 'APT-201', klien: 'Intan M.', psikolog: INITIAL_PSYCHOLOGISTS[0].name, time: '10:30', status: 'scheduled', note: 'Kontrol lanjutan' },
  { id: 'APT-202', klien: 'Dimas P.', psikolog: INITIAL_PSYCHOLOGISTS[0].name, time: '13:00', status: 'scheduled', note: 'Skrining awal' },
  { id: 'APT-203', klien: 'Aulia R.', psikolog: INITIAL_PSYCHOLOGISTS[0].name, time: '15:30', status: 'scheduled', note: 'Skrining awal' },
]

const read = (): Appt[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return SEED
    const v = JSON.parse(raw) as Appt[]
    return Array.isArray(v) ? v : SEED
  } catch {
    return SEED
  }
}

const write = (v: Appt[]) => {
  localStorage.setItem(KEY, JSON.stringify(v))
  window.dispatchEvent(new Event('bisara-appts'))
}

/** Appointment list shared between tabs (storage event) and within a tab (custom event). */
export function useAppointments() {
  const [list, setList] = useState<Appt[]>(read)
  useEffect(() => {
    const sync = () => setList(read())
    window.addEventListener('storage', sync)
    window.addEventListener('bisara-appts', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('bisara-appts', sync)
    }
  }, [])
  const request = (klien: string, psikolog: string): Appt => {
    const cur = read().filter((a) => !(a.klien === klien && a.status !== 'done'))
    const now = new Date()
    const a: Appt = {
      id: `APT-${Date.now().toString().slice(-4)}`,
      klien,
      psikolog,
      time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'waiting',
      note: 'Skrining awal · permintaan langsung',
    }
    write([a, ...cur])
    return a
  }
  const setStatus = (id: string, status: Appt['status']) => write(read().map((a) => (a.id === id ? { ...a, status } : a)))
  /** Psychologist left without saving: put the client back in the waiting room. */
  const release = (id: string) => write(read().map((a) => (a.id === id && a.status === 'live' ? { ...a, status: 'waiting' } : a)))
  const cancel = (id: string) => write(read().filter((a) => a.id !== id))
  return { list, request, setStatus, release, cancel }
}
