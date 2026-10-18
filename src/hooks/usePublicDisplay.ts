import { useEffect, useState } from 'react'
import { z } from 'zod'
import { api, ApiError, WS_BASE_URL, type Display } from '../api/client'

const DisplayEventSchema = z.object({ type: z.literal('DISPLAY_UPDATED') })
const MAX_RECONNECT_DELAY_MS = 10_000

export function usePublicDisplay(token: string | undefined) {
  const [display, setDisplay] = useState<Display | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(token))
  const [realtimeConnected, setRealtimeConnected] = useState(false)

  useEffect(() => {
    if (!token) return
    let disposed = false
    let socket: WebSocket | null = null
    let reconnectTimer: number | undefined
    let attempt = 0
    let hasDisplay = false
    let isRealtimeConnected = false
    const refresh = async () => {
      try {
        const next = await api.displays.get(token)
        if (!disposed) {
          setDisplay(next)
          hasDisplay = true
          setError(null)
          setLoading(false)
        }
      } catch (cause) {
        if (!disposed) {
          if (!hasDisplay) setError(cause instanceof ApiError ? cause.message : 'Layar tidak tersedia')
          setLoading(false)
        }
      }
    }
    const scheduleReconnect = () => {
      if (disposed || reconnectTimer !== undefined) return
      const delay = Math.min(1_000 * (2 ** attempt), MAX_RECONNECT_DELAY_MS)
      attempt += 1
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = undefined
        connect()
      }, delay)
    }
    const connect = () => {
      socket = new WebSocket(WS_BASE_URL)
      socket.onopen = () => {
        attempt = 0
        isRealtimeConnected = true
        setRealtimeConnected(true)
        socket?.send(JSON.stringify({ type: 'JOIN_DISPLAY', payload: { token } }))
      }
      socket.onmessage = (event) => {
        try {
          const parsed = DisplayEventSchema.safeParse(JSON.parse(String(event.data)))
          if (parsed.success) void refresh()
        } catch {
          if (!disposed && !hasDisplay) setError('Update realtime layar tidak valid')
        }
      }
      socket.onerror = () => {
        isRealtimeConnected = false
        setRealtimeConnected(false)
      }
      socket.onclose = () => {
        isRealtimeConnected = false
        setRealtimeConnected(false)
        scheduleReconnect()
      }
    }
    void refresh()
    connect()
    const pollingTimer = window.setInterval(() => {
      if (!isRealtimeConnected) void refresh()
    }, 5_000)
    return () => {
      disposed = true
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer)
      window.clearInterval(pollingTimer)
      socket?.close()
    }
  }, [token])

  return { display, loading, realtimeConnected, error: token ? error : 'Token layar tidak valid' }
}
