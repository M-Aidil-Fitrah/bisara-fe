import { z } from 'zod'
import {
  SessionRecordSchema,
  SignPredictionResponseSchema,
  type SessionRecord,
  type SignPredictionResponse,
} from '../schemas'

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

export const api = {
  async getSessions(): Promise<SessionRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`)
      if (!res.ok) {
        throw new ApiError(res.status, 'FETCH_FAILED', 'Gagal memuat daftar sesi')
      }
      const data = await res.json()
      return z.array(SessionRecordSchema).parse(data)
    } catch (err) {
      if (err instanceof ApiError) throw err
      // Return local fallback gracefully if backend is not running yet
      return []
    }
  },

  async predictSign(landmarks: number[][]): Promise<SignPredictionResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sign/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landmarks }),
      })
      if (!res.ok) {
        throw new ApiError(res.status, 'PREDICT_FAILED', 'Gagal mengenali isyarat')
      }
      const data = await res.json()
      return SignPredictionResponseSchema.parse(data)
    } catch (err) {
      if (err instanceof ApiError) throw err
      return null
    }
  },
}
