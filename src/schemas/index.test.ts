import { describe, expect, it } from 'vitest'
import { AccountSchema, SessionRecordSchema } from './index'

describe('frontend API schemas', () => {
  it('requires the backend account id', () => {
    expect(AccountSchema.safeParse({
      email: 'user@example.com', name: 'User', role: 'user', kind: 'tuli',
    }).success).toBe(false)
  })

  it('represents unavailable model accuracy as null', () => {
    const result = SessionRecordSchema.safeParse({
      id: 'session-1',
      date: new Date().toISOString(),
      psikolog: 'Psikolog',
      klien: 'Klien',
      durationMin: 10,
      score: 12,
      accuracy: null,
      manual: 10,
      status: 'Selesai',
      notes: null,
      lines: [],
    })
    expect(result.success).toBe(true)
  })
})
