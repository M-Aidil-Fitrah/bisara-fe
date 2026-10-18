import { describe, expect, it } from 'vitest'
import { parsePssAnswer } from './pssAnswer'

describe('parsePssAnswer', () => {
  it.each([
    ['Tidak pernah.', 0],
    ['HAMPIR TIDAK PERNAH', 1],
    ['kadang-kadang', 2],
    ['cukup sering', 3],
    ['sangat sering', 4],
  ])('maps %s to PSS value %i', (text, value) => {
    expect(parsePssAnswer(text)).toBe(value)
  })

  it('accepts concise model labels and rejects ambiguous text', () => {
    expect(parsePssAnswer('kadang')).toBe(2)
    expect(parsePssAnswer('empat')).toBe(4)
    expect(parsePssAnswer('saya sedang sedih')).toBeNull()
    expect(parsePssAnswer('')).toBeNull()
  })
})
