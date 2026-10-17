import { useEffect, useState } from 'react'
import type { Account, Kind } from '../types'

interface RegisteredAccount extends Account {
  password: string
}

// Akun bawaan sistem untuk pengujian berbagai role
export const INITIAL_ACCOUNTS: RegisteredAccount[] = [
  {
    email: 'tuli@bisara.id',
    password: 'bisara123',
    name: 'Rafi Akbar',
    role: 'user',
    kind: 'tuli',
    title: 'Teman Tuli',
  },
  {
    email: 'psikolog@bisara.id',
    password: 'bisara123',
    name: 'dr. Nadia Putri, M.Psi',
    role: 'user',
    kind: 'psikolog',
    title: 'Psikolog',
  },
  {
    email: 'admin@bisara.id',
    password: 'admin123',
    name: 'Admin Klinik',
    role: 'admin',
    title: 'Administrator',
  },
]

const KEY_AUTH = 'bisara-auth'
const KEY_USERS = 'bisara-registered-users'
const listeners = new Set<(a: Account | null) => void>()

function getStoredUsers(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(KEY_USERS)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RegisteredAccount[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function getAllAccounts(): RegisteredAccount[] {
  return [...INITIAL_ACCOUNTS, ...getStoredUsers()]
}

function readAuth(): Account | null {
  try {
    const raw = localStorage.getItem(KEY_AUTH)
    if (!raw) return null
    return JSON.parse(raw) as Account
  } catch {
    return null
  }
}

export function login(email: string, password: string): Account | null {
  const all = getAllAccounts()
  const hit = all.find(
    (a) => a.email.trim().toLowerCase() === email.trim().toLowerCase() && a.password === password,
  )
  if (!hit) return null
  const { password: _, ...acc } = hit
  localStorage.setItem(KEY_AUTH, JSON.stringify(acc))
  listeners.forEach((l) => l(acc))
  return acc
}

export function register(params: {
  name: string
  email: string
  password: string
  kind: Kind
}): Account | { error: string } {
  const all = getAllAccounts()
  const exists = all.some(
    (a) => a.email.trim().toLowerCase() === params.email.trim().toLowerCase(),
  )
  if (exists) {
    return { error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.' }
  }

  const newAcc: RegisteredAccount = {
    email: params.email.trim().toLowerCase(),
    password: params.password,
    name: params.name.trim(),
    role: 'user',
    kind: params.kind,
    title: params.kind === 'psikolog' ? 'Psikolog' : 'Teman Tuli',
  }

  const custom = getStoredUsers()
  localStorage.setItem(KEY_USERS, JSON.stringify([...custom, newAcc]))

  const { password: _, ...cleanAcc } = newAcc
  localStorage.setItem(KEY_AUTH, JSON.stringify(cleanAcc))
  listeners.forEach((l) => l(cleanAcc))
  return cleanAcc
}

export function logout() {
  localStorage.removeItem(KEY_AUTH)
  listeners.forEach((l) => l(null))
}

export function useAuth(): Account | null {
  const [user, setUser] = useState<Account | null>(readAuth)
  useEffect(() => {
    listeners.add(setUser)
    return () => {
      listeners.delete(setUser)
    }
  }, [])
  return user
}
