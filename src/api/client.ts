import { z } from 'zod'
import { SessionRecordSchema, type Account, type Appt, type SessionRecord } from '../schemas'

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

const API_BASE_URL = import.meta.env.VITE_API_URL
if (!API_BASE_URL) throw new Error('VITE_API_URL wajib dikonfigurasi')
const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({ code: z.string(), message: z.string() }),
})

async function request<T>(path: string, schema: z.ZodType<T>, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 12_000)
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null)
      const parsed = ApiErrorResponseSchema.safeParse(body)
      throw new ApiError(
        response.status,
        parsed.success ? parsed.data.error.code : 'REQUEST_FAILED',
        parsed.success ? parsed.data.error.message : `Permintaan gagal (${response.status})`,
      )
    }
    const body: unknown = await response.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ApiError || error instanceof z.ZodError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'REQUEST_TIMEOUT', 'Server tidak merespons tepat waktu')
    }
    throw new ApiError(0, 'NETWORK_ERROR', 'Tidak dapat terhubung ke server BISARA')
  } finally {
    window.clearTimeout(timeout)
  }
}

async function requestEmpty(path: string, init: RequestInit): Promise<void> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 12_000)
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      signal: controller.signal,
    })
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null)
      const parsed = ApiErrorResponseSchema.safeParse(body)
      throw new ApiError(
        response.status,
        parsed.success ? parsed.data.error.code : 'REQUEST_FAILED',
        parsed.success ? parsed.data.error.message : `Permintaan gagal (${response.status})`,
      )
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'REQUEST_TIMEOUT', 'Server tidak merespons tepat waktu')
    }
    throw new ApiError(0, 'NETWORK_ERROR', 'Tidak dapat terhubung ke server BISARA')
  } finally {
    window.clearTimeout(timeout)
  }
}

export const BackendRoleSchema = z.enum(['TULI', 'PSIKOLOG', 'ADMIN'])
export const BackendAuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: BackendRoleSchema,
  profile: z.object({
    name: z.string(),
    avatarUrl: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    sippNumber: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
  }).nullable(),
})
export type BackendAuthUser = z.infer<typeof BackendAuthUserSchema>

export function mapBackendUserToAccount(user: BackendAuthUser): Account {
  return {
    id: user.id,
    email: user.email,
    name: user.profile?.name ?? user.email,
    role: user.role === 'ADMIN' ? 'admin' : 'user',
    kind: user.role === 'PSIKOLOG' ? 'psikolog' : user.role === 'TULI' ? 'tuli' : undefined,
    title: user.profile?.title ?? undefined,
  }
}

const AuthEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.object({ user: BackendAuthUserSchema }),
})

export const BackendAppointmentSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  clientEmail: z.string(),
  psychologistId: z.string(),
  psychologistName: z.string(),
  psychologistEmail: z.string(),
  scheduledAt: z.string().or(z.date()),
  status: z.enum(['SCHEDULED', 'WAITING', 'IN_SESSION', 'COMPLETED', 'CANCELLED']),
  note: z.string().nullable().optional(),
  sessionId: z.string().nullable(),
})
export type BackendAppointment = z.infer<typeof BackendAppointmentSchema>

function mapAppointment(value: BackendAppointment): Appt {
  const status: Appt['status'] =
    value.status === 'WAITING' ? 'waiting' :
    value.status === 'IN_SESSION' ? 'live' :
    value.status === 'COMPLETED' ? 'done' :
    value.status === 'CANCELLED' ? 'cancelled' : 'scheduled'
  const date = new Date(value.scheduledAt)
  return {
    id: value.id,
    clientId: value.clientId,
    psychologistId: value.psychologistId,
    klien: value.clientName,
    psikolog: value.psychologistName,
    time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    scheduledAt: date.toISOString(),
    status,
    note: value.note ?? undefined,
    sessionId: value.sessionId,
  }
}

export const BackendPsychologistSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  email: z.string().optional(),
  title: z.string().nullable().optional(),
  sippNumber: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
})
export type BackendPsychologist = z.infer<typeof BackendPsychologistSchema>

export const BackendPss10ItemSchema = z.object({
  id: z.string(),
  itemNumber: z.number().int(),
  questionText: z.string(),
  isReversed: z.boolean(),
  phrases: z.array(z.object({
    id: z.string(),
    indonesianText: z.string(),
    signCategory: z.string(),
    animations: z.array(z.object({
      id: z.string(),
      glbUrl: z.string(),
      animationName: z.string(),
      durationMs: z.number().int(),
    })),
  })),
})
export type BackendPss10Item = z.infer<typeof BackendPss10ItemSchema>

export const CatalogPhraseSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.string(),
  animations: z.array(z.object({
    id: z.string(),
    glbUrl: z.string(),
    animationName: z.string(),
    durationMs: z.number().int(),
  })),
})
export type CatalogPhrase = z.infer<typeof CatalogPhraseSchema>

export const BackendSessionMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  senderRole: z.enum(['TULI', 'PSIKOLOG']),
  text: z.string(),
  step: z.number().int(),
  status: z.enum(['PROCESSING', 'REVIEW_REQUIRED', 'CORRECTION_REQUIRED', 'CONFIRMED', 'SENT', 'FAILED']),
  confidence: z.number().nullable(),
  isManualCorrection: z.boolean(),
  phraseMatched: z.boolean(),
  createdAt: z.string().or(z.date()),
})
export type BackendSessionMessage = z.infer<typeof BackendSessionMessageSchema>

export const BackendSessionDetailSchema = z.object({
  id: z.string(),
  appointmentId: z.string().nullable(),
  clientId: z.string(),
  clientName: z.string(),
  psychologistId: z.string(),
  psychologistName: z.string(),
  startedAt: z.string().or(z.date()),
  endedAt: z.string().or(z.date()).nullable(),
  score: z.number().nullable(),
  accuracy: z.number().nullable(),
  manualCorrections: z.number(),
  notes: z.string().nullable(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']),
  messages: z.array(BackendSessionMessageSchema),
})
export type BackendSessionDetail = z.infer<typeof BackendSessionDetailSchema>

const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: BackendRoleSchema,
  createdAt: z.string().or(z.date()),
  profile: z.object({
    name: z.string(),
    title: z.string().nullable(),
    sippNumber: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }).nullable(),
})
export type AdminUser = z.infer<typeof AdminUserSchema>

export const WS_BASE_URL: string = import.meta.env.VITE_WS_URL
if (!WS_BASE_URL) throw new Error('VITE_WS_URL wajib dikonfigurasi')

export const api = {
  auth: {
    async login(email: string, password: string): Promise<BackendAuthUser> {
      const result = await request('/auth/login', AuthEnvelopeSchema, {
        method: 'POST', body: JSON.stringify({ email, password }),
      })
      return result.data.user
    },
    async register(data: { name: string; email: string; password: string; role: 'TULI' }): Promise<BackendAuthUser> {
      const result = await request('/auth/register', AuthEnvelopeSchema, {
        method: 'POST', body: JSON.stringify(data),
      })
      return result.data.user
    },
    async getMe(): Promise<BackendAuthUser | null> {
      try {
        const result = await request('/auth/me', z.object({ success: z.literal(true), data: BackendAuthUserSchema }))
        return result.data
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 401) return null
        throw error
      }
    },
    logout(): Promise<void> {
      return requestEmpty('/auth/logout', { method: 'POST' })
    },
  },
  appointments: {
    async list(): Promise<Appt[]> {
      const result = await request('/appointments', z.object({ success: z.literal(true), data: z.array(BackendAppointmentSchema) }))
      return result.data.map(mapAppointment)
    },
    async create(psychologistId: string, scheduledAt: Date, note?: string): Promise<Appt> {
      const result = await request('/appointments', z.object({ success: z.literal(true), data: BackendAppointmentSchema }), {
        method: 'POST', body: JSON.stringify({ psychologistId, scheduledAt: scheduledAt.toISOString(), note }),
      })
      return mapAppointment(result.data)
    },
    async updateStatus(id: string, status: 'WAITING' | 'CANCELLED'): Promise<Appt> {
      const result = await request(`/appointments/${id}/status`, z.object({ success: z.literal(true), data: BackendAppointmentSchema }), {
        method: 'PATCH', body: JSON.stringify({ status }),
      })
      return mapAppointment(result.data)
    },
  },
  psychologists: {
    async list(): Promise<BackendPsychologist[]> {
      const result = await request('/psychologists', z.object({ success: z.literal(true), data: z.array(BackendPsychologistSchema) }))
      return result.data
    },
  },
  pss10: {
    async items(): Promise<BackendPss10Item[]> {
      const result = await request('/pss10/items', z.object({ success: z.literal(true), data: z.array(BackendPss10ItemSchema) }))
      return result.data
    },
  },
  catalog: {
    async phrases(): Promise<CatalogPhrase[]> {
      const result = await request('/catalog/phrases', z.object({
        success: z.literal(true),
        data: z.array(CatalogPhraseSchema),
      }))
      return result.data
    },
  },
  sessions: {
    async create(appointmentId: string): Promise<BackendSessionDetail> {
      const result = await request('/sessions', z.object({ success: z.literal(true), data: BackendSessionDetailSchema }), {
        method: 'POST', body: JSON.stringify({ appointmentId }),
      })
      return result.data
    },
    async get(id: string): Promise<BackendSessionDetail> {
      const result = await request(`/sessions/${id}`, z.object({ success: z.literal(true), data: BackendSessionDetailSchema }))
      return result.data
    },
    async addMessage(sessionId: string, message: {
      text: string
      step: number
      phraseId?: string
    }): Promise<BackendSessionMessage> {
      const result = await request(`/sessions/${sessionId}/messages`, z.object({ success: z.literal(true), data: BackendSessionMessageSchema }), {
        method: 'POST', body: JSON.stringify(message),
      })
      return result.data
    },
    async complete(sessionId: string, resultData: {
      notes?: string
    }): Promise<BackendSessionDetail> {
      const result = await request(`/sessions/${sessionId}/complete`, z.object({ success: z.literal(true), data: BackendSessionDetailSchema }), {
        method: 'POST', body: JSON.stringify(resultData),
      })
      return result.data
    },
  },
  history: {
    async list(): Promise<SessionRecord[]> {
      const result = await request('/history', z.object({ success: z.literal(true), data: z.array(SessionRecordSchema) }))
      return result.data
    },
  },
  admin: {
    async users(): Promise<AdminUser[]> {
      const result = await request('/admin/users', z.object({ success: z.literal(true), data: z.array(AdminUserSchema) }))
      return result.data
    },
    async createPsychologist(data: {
      name: string
      email: string
      password: string
      title: string
      sippNumber: string
      bio?: string
      avatarUrl?: string
    }): Promise<AdminUser> {
      const result = await request('/admin/psychologists', z.object({ success: z.literal(true), data: AdminUserSchema }), {
        method: 'POST', body: JSON.stringify(data),
      })
      return result.data
    },
    deleteUser(id: string): Promise<void> {
      return requestEmpty(`/admin/users/${id}`, { method: 'DELETE' })
    },
  },
}
