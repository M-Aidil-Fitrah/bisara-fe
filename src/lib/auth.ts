import { useCallback, useEffect, useState } from 'react'
import type { Account } from '../types'
import { api, ApiError, mapBackendUserToAccount, type AdminUser } from '../api/client'

export interface RegisteredAccount extends Account {
  createdAt?: string
}

export interface AuthState {
  user: Account | null | undefined
  loading: boolean
  error: string | null
}

const listeners = new Set<(state: AuthState) => void>()
let currentAccount: Account | null | undefined
let authLoaded = false
let authError: string | null = null
let bootstrapPromise: Promise<void> | null = null

function getAuthState(): AuthState {
  return { user: currentAccount, loading: !authLoaded, error: authError }
}

function publish(account: Account | null | undefined, error: string | null = null): void {
  currentAccount = account
  authError = error
  authLoaded = true
  const state = getAuthState()
  listeners.forEach((listener) => listener(state))
}

function bootstrapAuth(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise
  bootstrapPromise = api.auth.getMe()
    .then((user) => publish(user ? mapBackendUserToAccount(user) : null))
    .catch((error) => publish(undefined, error instanceof Error ? error.message : 'Status login gagal diperiksa'))
  return bootstrapPromise
}

export async function login(email: string, password: string): Promise<Account | null> {
  try {
    const account = mapBackendUserToAccount(await api.auth.login(email, password))
    publish(account)
    return account
  } catch (error) {
    if (error instanceof ApiError && (error.statusCode === 400 || error.statusCode === 401)) return null
    throw error
  }
}

export async function register(params: {
  name: string
  email: string
  password: string
}): Promise<Account | { error: string }> {
  try {
    const account = mapBackendUserToAccount(await api.auth.register({ ...params, role: 'TULI' }))
    publish(account)
    return account
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : 'Pendaftaran gagal' }
  }
}

function mapAdminUser(user: AdminUser): RegisteredAccount {
  return {
    id: user.id,
    email: user.email,
    name: user.profile?.name ?? user.email,
    role: user.role === 'ADMIN' ? 'admin' : 'user',
    kind: user.role === 'PSIKOLOG' ? 'psikolog' : user.role === 'TULI' ? 'tuli' : undefined,
    title: user.profile?.title ?? undefined,
    createdAt: new Date(user.createdAt).toISOString(),
  }
}

export async function addPsychologistAccount(params: {
  name: string
  email: string
  password: string
  title: string
  sippNumber: string
  bio?: string
  avatarUrl?: string
}): Promise<{ success: true; user: RegisteredAccount } | { error: string }> {
  try {
    const user = mapAdminUser(await api.admin.createPsychologist(params))
    window.dispatchEvent(new Event('bisara-users-changed'))
    window.dispatchEvent(new Event('bisara-psychologists'))
    return { success: true, user }
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : 'Gagal membuat akun psikolog' }
  }
}

export async function deleteUser(id: string): Promise<void> {
  await api.admin.deleteUser(id)
  window.dispatchEvent(new Event('bisara-users-changed'))
  window.dispatchEvent(new Event('bisara-psychologists'))
}

export function useUsers(): { users: RegisteredAccount[]; loading: boolean; error: string | null } {
  const [users, setUsers] = useState<RegisteredAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refresh = useCallback(() => {
    setLoading(true)
    void api.admin.users()
      .then((data) => {
        setUsers(data.map(mapAdminUser))
        setError(null)
      })
      .catch((cause) => {
        setUsers([])
        setError(cause instanceof ApiError ? cause.message : 'Gagal memuat pengguna')
      })
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => {
    queueMicrotask(refresh)
    window.addEventListener('bisara-users-changed', refresh)
    return () => window.removeEventListener('bisara-users-changed', refresh)
  }, [refresh])
  return { users, loading, error }
}

export async function logout(): Promise<void> {
  await api.auth.logout()
  publish(null)
}

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>(getAuthState)
  useEffect(() => {
    listeners.add(setState)
    if (!authLoaded) void bootstrapAuth()
    return () => { listeners.delete(setState) }
  }, [])
  return state
}

export function useAuth(): Account | null | undefined {
  return useAuthState().user
}
