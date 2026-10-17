import { z } from 'zod'
import { BackendSessionMessageSchema } from '../api/client'

const PresencePayloadSchema = z.object({
  memberCount: z.number().int().nonnegative(),
})

export const WebSocketServerEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('ROOM_JOINED'),
    payload: PresencePayloadSchema.extend({ sessionId: z.string() }),
  }),
  z.object({
    type: z.enum(['MEMBER_JOINED', 'MEMBER_LEFT']),
    payload: PresencePayloadSchema.extend({
      role: z.enum(['TULI', 'PSIKOLOG', 'ADMIN']),
      name: z.string(),
    }),
  }),
  z.object({
    type: z.literal('MESSAGE_SENT'),
    payload: BackendSessionMessageSchema,
  }),
  z.object({
    type: z.literal('PEER_READY'),
    payload: z.object({
      peerId: z.uuid(),
      role: z.enum(['TULI', 'PSIKOLOG']),
    }),
  }),
  z.object({
    type: z.literal('ERROR'),
    error: z.object({ code: z.string(), message: z.string() }),
  }),
])
