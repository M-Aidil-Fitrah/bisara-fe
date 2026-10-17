import { useCallback, useEffect, useState } from 'react'
import { ANSWERS } from '../data'
import type { SessionRecord } from '../types'
import { api, ApiError, type DashboardStats } from '../api/client'

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
  loadMore: () => Promise<void>
  hasMore: boolean
  loadingMore: boolean
} {
  const [history, setHistory] = useState<SessionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const page = await api.history.list()
      setHistory(page.items)
      setNextCursor(page.nextCursor)
      setError(null)
    } catch (cause) {
      setHistory([])
      setError(cause instanceof ApiError ? cause.message : 'Gagal memuat riwayat')
    } finally {
      setLoading(false)
    }
  }, [])
  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await api.history.list(nextCursor)
      setHistory((current) => [
        ...current,
        ...page.items.filter((item) => !current.some((existing) => existing.id === item.id)),
      ])
      setNextCursor(page.nextCursor)
      setError(null)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Gagal memuat halaman riwayat berikutnya')
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, nextCursor])
  useEffect(() => {
    if (!enabled) return
    let active = true
    queueMicrotask(() => { if (active) void refetch() })
    return () => { active = false }
  }, [enabled, refetch])
  return {
    history,
    loading: enabled && loading,
    error: enabled ? error : null,
    refetch,
    loadMore,
    hasMore: nextCursor !== null,
    loadingMore,
  }
}

export function useDashboardStats(enabled = true): {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
} {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return undefined
    let active = true
    queueMicrotask(() => {
      if (!active) return
      setLoading(true)
      void api.history.stats()
        .then((value) => {
          if (!active) return
          setStats(value)
          setError(null)
        })
        .catch((cause) => {
          if (!active) return
          setStats(null)
          setError(cause instanceof ApiError ? cause.message : 'Gagal memuat statistik')
        })
        .finally(() => { if (active) setLoading(false) })
    })
    return () => { active = false }
  }, [enabled])

  return { stats, loading: enabled && loading, error: enabled ? error : null }
}
