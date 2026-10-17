import { useCallback, useEffect, useState } from 'react'
import type { Appt } from '../types'
import { api, ApiError } from '../api/client'

export type Psychologist = {
  id: string
  userId: string
  name: string
  focus: string
  photo: string | null
  sippNumber: string | null
}

export function usePsychologists(): { list: Psychologist[]; loading: boolean; error: string | null } {
  const [list, setList] = useState<Psychologist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    const load = () => {
      if (!active) return
      setLoading(true)
      void api.psychologists.list().then((values) => {
        if (!active) return
        setList(values.map((value) => ({
          id: value.id,
          userId: value.userId,
          name: value.name,
          focus: value.title ?? 'Gelar belum dicantumkan',
          photo: value.avatarUrl ?? null,
          sippNumber: value.sippNumber ?? null,
        })))
        setError(null)
      }).catch((cause) => {
        if (!active) return
        setList([])
        setError(cause instanceof ApiError ? cause.message : 'Gagal memuat psikolog')
      }).finally(() => { if (active) setLoading(false) })
    }
    queueMicrotask(load)
    window.addEventListener('bisara-psychologists', load)
    return () => {
      active = false
      window.removeEventListener('bisara-psychologists', load)
    }
  }, [])
  return { list, loading, error }
}

export function useAppointments(options?: { refreshIntervalMs?: number }) {
  const [list, setList] = useState<Appt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      setList(await api.appointments.list())
      setError(null)
    } catch (cause) {
      setList([])
      setError(cause instanceof ApiError ? cause.message : 'Gagal memuat jadwal')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    queueMicrotask(() => { if (active) void refetch() })
    const intervalId = options?.refreshIntervalMs
      ? window.setInterval(() => { if (active) void refetch() }, options.refreshIntervalMs)
      : null
    return () => {
      active = false
      if (intervalId !== null) window.clearInterval(intervalId)
    }
  }, [options?.refreshIntervalMs, refetch])

  const request = useCallback(async (psychologistUserId: string): Promise<Appt> => {
    const created = await api.appointments.create(
      psychologistUserId,
      new Date(Date.now() + 60_000),
      'Permintaan konsultasi BISARA',
    )
    setList((current) => [created, ...current.filter((item) => item.id !== created.id)])
    return created
  }, [])

  const setStatus = useCallback(async (id: string, status: Appt['status']): Promise<void> => {
    if (status !== 'waiting' && status !== 'cancelled') {
      await refetch()
      return
    }
    const updated = await api.appointments.updateStatus(id, status === 'waiting' ? 'WAITING' : 'CANCELLED')
    setList((current) => current.map((item) => item.id === id ? updated : item))
  }, [refetch])

  const cancel = useCallback(async (id: string): Promise<void> => {
    await setStatus(id, 'cancelled')
  }, [setStatus])

  return {
    list,
    loading,
    error,
    request,
    setStatus,
    release: refetch,
    cancel,
    refetch,
  }
}
