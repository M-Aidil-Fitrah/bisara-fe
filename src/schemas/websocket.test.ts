import { describe, expect, it } from 'vitest'
import { WebSocketServerEventSchema } from './websocket'

describe('WebSocketServerEventSchema', () => {
  it('menerima event presence dan peer yang lengkap', () => {
    expect(WebSocketServerEventSchema.safeParse({
      type: 'ROOM_JOINED',
      payload: { sessionId: 'session-1', memberCount: 2 },
    }).success).toBe(true)
    expect(WebSocketServerEventSchema.safeParse({
      type: 'PEER_READY',
      payload: { peerId: '02cbe4e4-5e66-43cf-8c88-9595d58c2d36', role: 'PSIKOLOG' },
    }).success).toBe(true)
  })

  it('menolak event yang tidak dikenal atau payload parsial', () => {
    expect(WebSocketServerEventSchema.safeParse({
      type: 'ROOM_JOINED',
      payload: { sessionId: 'session-1' },
    }).success).toBe(false)
    expect(WebSocketServerEventSchema.safeParse({ type: 'UNSUPPORTED', payload: {} }).success).toBe(false)
  })
})
