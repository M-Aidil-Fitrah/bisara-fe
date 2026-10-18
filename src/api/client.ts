import { z } from 'zod'
import { frontendEnv } from '../config/env'

export class ApiError extends Error {
  constructor(public readonly statusCode: number, public readonly code: string, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const ErrorSchema = z.object({ success: z.literal(false), error: z.object({ code: z.string(), message: z.string() }) })
const AssetSchema = z.object({ id: z.string(), glbUrl: z.string(), animationName: z.string(), durationMs: z.number().int() })
export const PhraseSchema = z.object({ id: z.string(), text: z.string(), category: z.string(), animations: z.array(AssetSchema) })
export const PartnerSchema = z.object({ slug: z.string(), name: z.string(), description: z.string(), logoUrl: z.string() })
export const AuthUserSchema = z.object({ id: z.string(), email: z.string().email(), role: z.enum(['USER', 'ADMIN']), profile: z.object({ name: z.string(), avatarUrl: z.string().nullable().optional() }).nullable() })
export const MeetingSchema = z.object({
  id: z.string(), status: z.enum(['WAITING', 'ACTIVE', 'ENDED', 'CANCELLED', 'EXPIRED']), expiresAt: z.string().or(z.date()),
  partner: PartnerSchema, user: z.object({ id: z.string(), name: z.string() }), admin: z.object({ id: z.string().nullable(), name: z.string() }).nullable(),
})
export const DisplaySchema = z.object({ token: z.string(), text: z.string(), expiresAt: z.string().or(z.date()), phrase: PhraseSchema.nullable() })
export const PssRoomSchema = z.object({ items: z.array(z.object({ id: z.string(), itemNumber: z.number().int(), questionText: z.string(), isReversed: z.boolean(), phrase: z.object({ id: z.string(), text: z.string(), animations: z.array(AssetSchema) }) })), answers: z.array(z.object({ itemId: z.string(), value: z.number().int() })), score: z.number().int().nullable() })
export const AiPredictionSchema = z.object({ prediction: z.string(), confidence: z.number().min(0).max(1), alternatives: z.array(z.object({ label: z.string(), confidence: z.number().min(0).max(1) })), quality: z.object({ frames: z.number().int().positive(), shoulder_rate: z.number().min(0).max(1), hand_rate: z.number().min(0).max(1) }) })
export type Phrase = z.infer<typeof PhraseSchema>
export type CatalogPhrase = Phrase
export type Partner = z.infer<typeof PartnerSchema>
export type AuthUser = z.infer<typeof AuthUserSchema>
export type Meeting = z.infer<typeof MeetingSchema>
export type Display = z.infer<typeof DisplaySchema>
export type PssRoom = z.infer<typeof PssRoomSchema>
export type AiPrediction = z.infer<typeof AiPredictionSchema>
export const WS_BASE_URL = frontendEnv.VITE_WS_URL

const AI_REQUEST_TIMEOUT_MS = 135_000

async function request<T>(path: string, schema: z.ZodType<T>, init?: RequestInit, allowNoContent?: false, timeoutMs?: number): Promise<T>
async function request<T>(path: string, schema: z.ZodType<T>, init: RequestInit, allowNoContent: true): Promise<T | undefined>
async function request<T>(path: string, schema: z.ZodType<T>, init: RequestInit = {}, allowNoContent = false, timeoutMs = 12_000): Promise<T | undefined> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${frontendEnv.VITE_API_URL}${path}`, { ...init, credentials: 'include', signal: controller.signal, headers: { ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...init.headers } })
    if (!response.ok) {
      const parsed = ErrorSchema.safeParse(await response.json().catch(() => null))
      throw new ApiError(response.status, parsed.success ? parsed.data.error.code : 'REQUEST_FAILED', parsed.success ? parsed.data.error.message : `Permintaan gagal (${response.status})`)
    }
    if (response.status === 204) return allowNoContent ? undefined : schema.parse(undefined)
    return schema.parse(await response.json())
  } catch (cause) {
    if (cause instanceof ApiError || cause instanceof z.ZodError) throw cause
    if (cause instanceof DOMException && cause.name === 'AbortError') throw new ApiError(408, 'REQUEST_TIMEOUT', 'Server tidak merespons tepat waktu')
    throw new ApiError(0, 'NETWORK_ERROR', 'Tidak dapat terhubung ke server BISARA')
  } finally { window.clearTimeout(timeout) }
}

const AuthEnvelope = z.object({ success: z.literal(true), data: z.object({ user: AuthUserSchema }) })
const Envelope = <T>(schema: z.ZodType<T>) => z.object({ success: z.literal(true), data: schema })

export const api = {
  auth: {
    login: async (email: string, password: string) => (await request('/auth/login', AuthEnvelope, { method: 'POST', body: JSON.stringify({ email, password }) })).data.user,
    register: async (input: { name: string; email: string; password: string }) => (await request('/auth/register', AuthEnvelope, { method: 'POST', body: JSON.stringify({ ...input, role: 'USER' }) })).data.user,
    getMe: async (): Promise<AuthUser | null> => { try { return (await request('/auth/me', Envelope(AuthUserSchema))).data } catch (cause) { if (cause instanceof ApiError && cause.statusCode === 401) return null; throw cause } },
    logout: () => request('/auth/logout', z.undefined(), { method: 'POST' }),
  },
  catalog: { phrases: async () => (await request('/catalog/phrases', Envelope(z.array(PhraseSchema)))).data },
  partners: { list: async () => (await request('/partners', Envelope(z.array(PartnerSchema)))).data },
  displays: {
    create: async () => (await request('/displays', Envelope(DisplaySchema.extend({ editorToken: z.string() })), { method: 'POST', body: '{}' })).data,
    get: async (token: string) => (await request(`/displays/${token}`, Envelope(DisplaySchema))).data,
    update: async (token: string, editorToken: string, input: { text: string; phraseId: string | null }) => (await request(`/displays/${token}`, Envelope(DisplaySchema), { method: 'PATCH', headers: { 'x-display-editor-token': editorToken }, body: JSON.stringify(input) })).data,
  },
  meetings: {
    match: async (slug: string): Promise<Meeting | null> => {
      const response = await request(`/meetings/partners/${slug}/match`, Envelope(MeetingSchema), { method: 'POST' }, true)
      return response?.data ?? null
    },
    get: async (id: string) => (await request(`/meetings/${id}`, Envelope(MeetingSchema))).data,
    end: (id: string) => request(`/meetings/${id}/end`, z.undefined(), { method: 'POST' }),
  },
  pss: {
    get: async (roomId: string) => (await request(`/pss/rooms/${roomId}`, Envelope(PssRoomSchema))).data,
    answer: async (roomId: string, itemId: string, value: number) => (await request(`/pss/rooms/${roomId}/answers`, Envelope(PssRoomSchema), { method: 'PUT', body: JSON.stringify({ itemId, value }) })).data,
  },
  ai: {
    predict: async (roomId: string, video: Blob): Promise<AiPrediction> => {
      const form = new FormData()
      form.append('video', video, video.type.startsWith('video/mp4') ? 'bisara-sign.mp4' : 'bisara-sign.webm')
      return (await request(`/ai/rooms/${roomId}/predict`, Envelope(AiPredictionSchema), { method: 'POST', body: form }, false, AI_REQUEST_TIMEOUT_MS)).data
    },
    tts: async (roomId: string, text: string): Promise<Blob> => {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS)
      try {
        const response = await fetch(`${frontendEnv.VITE_API_URL}/ai/rooms/${roomId}/tts`, { method: 'POST', credentials: 'include', signal: controller.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
        if (!response.ok) {
          const parsed = ErrorSchema.safeParse(await response.json().catch(() => null))
          throw new ApiError(response.status, parsed.success ? parsed.data.error.code : 'REQUEST_FAILED', parsed.success ? parsed.data.error.message : 'Sintesis suara gagal')
        }
        if (!response.headers.get('content-type')?.startsWith('audio/wav')) throw new ApiError(502, 'INVALID_AUDIO', 'Respons suara tidak valid')
        return await response.blob()
      } catch (cause) {
        if (cause instanceof ApiError) throw cause
        if (cause instanceof DOMException && cause.name === 'AbortError') throw new ApiError(408, 'REQUEST_TIMEOUT', 'Layanan suara tidak merespons tepat waktu')
        throw new ApiError(0, 'NETWORK_ERROR', 'Tidak dapat terhubung ke layanan suara')
      } finally { window.clearTimeout(timeout) }
    },
  },
}
