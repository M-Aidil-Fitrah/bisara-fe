import { useCallback, useEffect, useState } from 'react'
import { api, ApiError, type CatalogPhrase } from '../api/client'

export function usePhraseCatalog(): {
  phrases: CatalogPhrase[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [phrases, setPhrases] = useState<CatalogPhrase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      setPhrases(await api.catalog.phrases())
      setError(null)
    } catch (cause) {
      setPhrases([])
      setError(cause instanceof ApiError ? cause.message : 'Katalog gagal dimuat')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    queueMicrotask(() => { if (active) void refetch() })
    return () => { active = false }
  }, [refetch])
  return { phrases, loading, error, refetch }
}
