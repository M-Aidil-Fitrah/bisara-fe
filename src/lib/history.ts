import { useCallback, useEffect, useState } from 'react'
import { ANSWERS } from '../data'
import type { SessionRecord } from '../types'
import { api, ApiError } from '../api/client'

export const REVERSED = [3, 4, 6, 7]
export const scorePss = (answers: string[]): number =>
  answers.reduce((score, answer, index) => {
    const value = Math.max(0, ANSWERS.indexOf(answer))
    return score + (REVERSED.includes(index) ? 4 - value : value)
  }, 0)

export const level = (score: number): 'Rendah' | 'Sedang' | 'Tinggi' =>
  score <= 13 ? 'Rendah' : score <= 26 ? 'Sedang' : 'Tinggi'

export function useSessionHistory(enabled = true): {
  history: SessionRecord[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [history, setHistory] = useState<SessionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      setHistory(await api.history.list())
      setError(null)
    } catch (cause) {
      setHistory([])
      setError(cause instanceof ApiError ? cause.message : 'Gagal memuat riwayat')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    if (!enabled) return
    let active = true
    queueMicrotask(() => { if (active) void refetch() })
    return () => { active = false }
  }, [enabled, refetch])
  return { history, loading: enabled && loading, error: enabled ? error : null, refetch }
}
