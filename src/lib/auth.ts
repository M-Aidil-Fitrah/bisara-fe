import { useEffect, useState } from 'react'
import { api, ApiError, type AuthUser } from '../api/client'
import type { Account } from '../types'

export interface AuthState { user: Account | null | undefined; loading: boolean; error: string | null }
const listeners = new Set<(state: AuthState) => void>()
let current: Account | null | undefined
let loaded = false
let failure: string | null = null
let initial: Promise<void> | null = null

function mapUser(user: AuthUser): Account { return { id: user.id, email: user.email, name: user.profile?.name ?? user.email, role: user.role === 'ADMIN' ? 'admin' : 'user' } }
function state(): AuthState { return { user: current, loading: !loaded, error: failure } }
function publish(user: Account | null | undefined, error: string | null = null): void { current = user; failure = error; loaded = true; listeners.forEach((listener) => listener(state())) }
function bootstrap(): Promise<void> {
  if (!initial) initial = api.auth.getMe().then((user) => publish(user ? mapUser(user) : null)).catch((cause) => publish(undefined, cause instanceof Error ? cause.message : 'Status login gagal diperiksa'))
  return initial
}
export async function login(email: string, password: string): Promise<Account | null> { try { const user = mapUser(await api.auth.login(email, password)); publish(user); return user } catch (cause) { if (cause instanceof ApiError && (cause.statusCode === 400 || cause.statusCode === 401)) return null; throw cause } }
export async function register(input: { name: string; email: string; password: string }): Promise<Account | { error: string }> { try { const user = mapUser(await api.auth.register(input)); publish(user); return user } catch (cause) { return { error: cause instanceof ApiError ? cause.message : 'Pendaftaran gagal' } } }
export async function logout(): Promise<void> { await api.auth.logout(); publish(null) }
export function useAuthState(): AuthState { const [value, setValue] = useState<AuthState>(state); useEffect(() => { listeners.add(setValue); if (!loaded) void bootstrap(); return () => { listeners.delete(setValue) } }, []); return value }
export function useAuth(): Account | null | undefined { return useAuthState().user }
