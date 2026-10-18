import { useEffect, useState } from 'react'
import { z } from 'zod'
import { api, ApiError, WS_BASE_URL, type Display } from '../api/client'

const DisplayEventSchema = z.object({ type: z.literal('DISPLAY_UPDATED') })
const MAX_RECONNECT_DELAY_MS = 10_000

export function usePublicDisplay(token: string | undefined) {
  const [display, setDisplay] = useState<Display | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let disposed = false
    let socket: WebSocket | null = null
    let reconnectTimer: number | undefined
    let attempt = 0
    const refresh = async () => {
      try {
        const next = await api.displays.get(token)
        if (!disposed) {
          setDisplay(next)
          setError(null)
        }
      } catch (cause) {
        if (!disposed) setError(cause instanceof ApiError ? cause.message : 'Layar tidak tersedia')
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
        socket?.send(JSON.stringify({ type: 'JOIN_DISPLAY', payload: { token } }))
      }
      socket.onmessage = (event) => {
        try {
          const parsed = DisplayEventSchema.safeParse(JSON.parse(String(event.data)))
          if (parsed.success) void refresh()
        } catch {
          setError('Update realtime layar tidak valid')
        }
      }
      socket.onerror = () => setError('Koneksi realtime layar terganggu; mencoba menghubungkan ulang.')
      socket.onclose = scheduleReconnect
    }
    void refresh()
    connect()
    return () => {
      disposed = true
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [token])

  return { display, error: token ? error : 'Token layar tidak valid' }
}
