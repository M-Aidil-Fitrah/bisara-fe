import { describe, expect, it } from 'vitest'
import { shouldInitiateCall } from './videoCall'

describe('shouldInitiateCall', () => {
  it('elects exactly one peer to start a call', () => {
    const first = '00000000-0000-4000-8000-000000000001'
    const second = '00000000-0000-4000-8000-000000000002'

    expect(shouldInitiateCall(first, second)).toBe(true)
    expect(shouldInitiateCall(second, first)).toBe(false)
  })

  it('does not elect a peer against itself', () => {
    const peer = '00000000-0000-4000-8000-000000000001'
    expect(shouldInitiateCall(peer, peer)).toBe(false)
  })
})
