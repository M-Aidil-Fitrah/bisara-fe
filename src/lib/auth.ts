import { useEffect, useState } from 'react'
import type { Account } from '../types'

// Demo-only credential list.
const ACCOUNTS: (Account & { password: string })[] = [
  { email: 'tuli@bisara.id', password: 'bisara123', name: 'Rafi Akbar', role: 'user', kind: 'tuli', title: 'Teman Tuli' },
  { email: 'psikolog@bisara.id', password: 'bisara123', name: 'dr. Nadia Putri, M.Psi', role: 'user', kind: 'psikolog', title: 'Psikolog' },
  { email: 'admin@bisara.id', password: 'admin123', name: 'Admin Klinik', role: 'admin', title: 'Administrator' },
]

export const DEMO = ACCOUNTS.map(({ email, password, title }) => ({
  email,
  password,
  title: title ?? '',
}))

const KEY = 'bisara-auth'
const listeners = new Set<(a: Account | null) => void>()

function read(): Account | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as Account
  } catch {
    return null
  }
}

export function login(email: string, password: string): Account | null {
  const hit = ACCOUNTS.find((a) => a.email === email.trim().toLowerCase() && a.password === password)
  if (!hit) return null
  const { password: _, ...acc } = hit
  localStorage.setItem(KEY, JSON.stringify(acc))
  listeners.forEach((l) => l(acc))
  return acc
}

export function logout() {
  localStorage.removeItem(KEY)
  listeners.forEach((l) => l(null))
}

export function useAuth(): Account | null {
  const [user, setUser] = useState<Account | null>(read)
  useEffect(() => {
    listeners.add(setUser)
    return () => {
      listeners.delete(setUser)
    }
  }, [])
  return user
}
