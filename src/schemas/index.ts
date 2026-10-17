import { z } from 'zod'

export const SignLabelEnum = z.enum([
  'TIDAK_PERNAH',
  'HAMPIR_TIDAK_PERNAH',
  'KADANG_KADANG',
  'CUKUP_SERING',
  'SANGAT_SERING',
])
export type SignLabel = z.infer<typeof SignLabelEnum>

export const RoleSchema = z.enum(['user', 'admin'])
export type Role = z.infer<typeof RoleSchema>

export const KindSchema = z.enum(['tuli', 'psikolog'])
export type Kind = z.infer<typeof KindSchema>

export const AccountSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: RoleSchema,
  kind: KindSchema.optional(),
  title: z.string().optional(),
})
export type Account = z.infer<typeof AccountSchema>

export const ApptStatusSchema = z.enum(['scheduled', 'waiting', 'live', 'done'])
export type ApptStatus = z.infer<typeof ApptStatusSchema>

export const ApptSchema = z.object({
  id: z.string(),
  klien: z.string(),
  psikolog: z.string(),
  time: z.string(),
  status: ApptStatusSchema,
  note: z.string().optional(),
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
  id: z.number(),
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
  durationMin: z.number(),
  score: z.number().nullable(),
  accuracy: z.number(),
  manual: z.number(),
  status: SessionStatusSchema,
  notes: z.string(),
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

export const SignDictionaryItemSchema = z.object({
  word: z.string(),
  category: z.string(),
  desc: z.string(),
  hasClip: z.boolean(),
  glbUrl: z.string().optional(),
  animationName: z.string().optional(),
})
export type Sign = z.infer<typeof SignDictionaryItemSchema>

export const SignPredictionResponseSchema = z.object({
  label: SignLabelEnum,
  confidence: z.number(),
})
export type SignPredictionResponse = z.infer<typeof SignPredictionResponseSchema>
