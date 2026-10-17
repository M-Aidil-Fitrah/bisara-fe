import { z } from 'zod'

export const RoleSchema = z.enum(['user', 'admin'])
export type Role = z.infer<typeof RoleSchema>

export const KindSchema = z.enum(['tuli', 'psikolog'])
export type Kind = z.infer<typeof KindSchema>

export const AccountSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: RoleSchema,
  kind: KindSchema.optional(),
  title: z.string().optional(),
})
export type Account = z.infer<typeof AccountSchema>

export const ApptStatusSchema = z.enum(['scheduled', 'waiting', 'live', 'done', 'cancelled'])
export type ApptStatus = z.infer<typeof ApptStatusSchema>

export const ApptSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  psychologistId: z.string(),
  klien: z.string(),
  psikolog: z.string(),
  time: z.string(),
  status: ApptStatusSchema,
  note: z.string().optional(),
  scheduledAt: z.string(),
  sessionId: z.string().nullable(),
})
export type Appt = z.infer<typeof ApptSchema>

export const MessageStatusEnum = z.enum([
  'PROCESSING',
  'REVIEW_REQUIRED',
  'CORRECTION_REQUIRED',
  'CONFIRMED',
  'SENT',
  'FAILED',
])
export type MessageStatus = z.infer<typeof MessageStatusEnum>

export const MessageSchema = z.object({
  id: z.string(),
  from: KindSchema,
  text: z.string(),
  step: z.number(),
  status: MessageStatusEnum.optional(),
  phraseMatched: z.boolean().optional(),
  conf: z.number().optional(),
  manual: z.boolean().optional(),
  at: z.number(),
})
export type Msg = z.infer<typeof MessageSchema>

export const SessionStatusSchema = z.enum(['Selesai', 'Dibatalkan'])
export type SessionStatus = z.infer<typeof SessionStatusSchema>

export const SessionRecordSchema = z.object({
  id: z.string(),
  date: z.string(),
  psikolog: z.string(),
  klien: z.string(),
  durationMin: z.number().nullable(),
  score: z.number().nullable(),
  accuracy: z.number().nullable(),
  manual: z.number(),
  status: SessionStatusSchema,
  notes: z.string().nullable(),
  lines: z.array(
    z.object({
      from: KindSchema,
      text: z.string(),
      conf: z.number().optional(),
      manual: z.boolean().optional(),
    }),
  ),
})
export type SessionRecord = z.infer<typeof SessionRecordSchema>
