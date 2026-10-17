import { useEffect, useState } from 'react'
import type { Account } from '../types'
import { addPsychologistToRoster } from './appointments'

export interface RegisteredAccount extends Account {
  password: string
  createdAt?: string
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
    createdAt: '2026-10-01T08:00:00.000Z',
  },
  {
    email: 'intan@bisara.id',
    password: 'bisara123',
    name: 'Intan Maharani',
    role: 'user',
    kind: 'tuli',
    title: 'Teman Tuli',
    createdAt: '2026-10-05T09:30:00.000Z',
  },
  {
    email: 'psikolog@bisara.id',
    password: 'bisara123',
    name: 'dr. Nadia Putri, M.Psi',
    role: 'user',
    kind: 'psikolog',
    title: 'Psikolog',
    createdAt: '2026-09-15T10:00:00.000Z',
  },
  {
    email: 'rizky@bisara.id',
    password: 'bisara123',
    name: 'Rizky Hanafi, M.Psi',
    role: 'user',
    kind: 'psikolog',
    title: 'Psikolog',
    createdAt: '2026-09-20T11:00:00.000Z',
  },
  {
    email: 'admin@bisara.id',
    password: 'admin123',
    name: 'Admin Klinik',
    role: 'admin',
    title: 'Administrator',
    createdAt: '2026-09-01T07:00:00.000Z',
  },
]

const KEY_AUTH = 'bisara-auth'
const KEY_USERS = 'bisara-registered-users'
const listeners = new Set<(a: Account | null) => void>()

export function getStoredUsers(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(KEY_USERS)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RegisteredAccount[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getAllAccounts(): RegisteredAccount[] {
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
  const acc: Account = {
    email: hit.email,
    name: hit.name,
    role: hit.role,
    kind: hit.kind,
    title: hit.title,
  }
  localStorage.setItem(KEY_AUTH, JSON.stringify(acc))
  listeners.forEach((l) => l(acc))
  return acc
}


/**
 * Register khusus untuk Teman Tuli (klien).
 * Psikolog didaftarkan melalui panel Admin.
 */
export function register(params: {
  name: string
  email: string
  password: string
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
    kind: 'tuli',
    title: 'Teman Tuli',
    createdAt: new Date().toISOString(),
  }

  const custom = getStoredUsers()
  localStorage.setItem(KEY_USERS, JSON.stringify([...custom, newAcc]))
  window.dispatchEvent(new Event('bisara-users-changed'))

  const cleanAcc: Account = {
    email: newAcc.email,
    name: newAcc.name,
    role: newAcc.role,
    kind: newAcc.kind,
    title: newAcc.title,
  }
  localStorage.setItem(KEY_AUTH, JSON.stringify(cleanAcc))
  listeners.forEach((l) => l(cleanAcc))
  return cleanAcc
}


/**
 * Tambah akun Psikolog / Dokter dari Panel Dashboard Admin.
 */
export function addPsychologistAccount(params: {
  name: string
  email: string
  password: string
  focus?: string
  bisindo?: string
  photo?: string
}): { success: true; user: Account } | { error: string } {
  const all = getAllAccounts()
  const exists = all.some(
    (a) => a.email.trim().toLowerCase() === params.email.trim().toLowerCase(),
  )
  if (exists) {
    return { error: 'Email sudah terdaftar untuk pengguna lain.' }
  }

  const newAcc: RegisteredAccount = {
    email: params.email.trim().toLowerCase(),
    password: params.password,
    name: params.name.trim(),
    role: 'user',
    kind: 'psikolog',
    title: 'Psikolog',
    createdAt: new Date().toISOString(),
  }

  const custom = getStoredUsers()
  localStorage.setItem(KEY_USERS, JSON.stringify([...custom, newAcc]))

  // Tambahkan juga ke daftar psikolog aktif klinik
  addPsychologistToRoster({
    name: params.name.trim(),
    email: params.email.trim().toLowerCase(),
    focus: params.focus?.trim() || 'Konseling umum',
    bisindo: params.bisindo || 'Dasar',
    photo: params.photo || 'photo-1573495804664-b1c0849525af',
  })

  window.dispatchEvent(new Event('bisara-users-changed'))

  const cleanAcc: Account = {
    email: newAcc.email,
    name: newAcc.name,
    role: newAcc.role,
    kind: newAcc.kind,
    title: newAcc.title,
  }
  return { success: true, user: cleanAcc }

}

export function deleteUser(email: string): boolean {
  const currentAuth = readAuth()
  if (currentAuth && currentAuth.email.toLowerCase() === email.toLowerCase()) {
    return false // Tidak bisa menghapus akun yang sedang aktif digunakan
  }
  const custom = getStoredUsers().filter(
    (u) => u.email.toLowerCase() !== email.toLowerCase(),
  )
  localStorage.setItem(KEY_USERS, JSON.stringify(custom))
  window.dispatchEvent(new Event('bisara-users-changed'))
  return true
}

export function useUsers(): RegisteredAccount[] {
  const [users, setUsers] = useState<RegisteredAccount[]>(getAllAccounts)
  useEffect(() => {
    const sync = () => setUsers(getAllAccounts())
    window.addEventListener('storage', sync)
    window.addEventListener('bisara-users-changed', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('bisara-users-changed', sync)
    }
  }, [])
  return users
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
