import { describe, expect, it } from 'vitest'
import type { Phrase } from '../api/client'
import { buildSignSequence, normalizeSignText, type AnimationClipTiming } from './signSequence'

const clip = (name: string, durationMs = 4_000, activeStartMs = 500, activeEndMs = 3_500): AnimationClipTiming => ({ name, durationMs, activeStartMs, activeEndMs })

const phrases: Phrase[] = [{
  id: 'phrase-thanks',
  text: 'Terima kasih',
  category: 'UMUM',
  animations: [{ id: 'asset-thanks', glbUrl: '/models/avatar.glb', animationName: 'terima_kasih', durationMs: 1_500 }],
}]

describe('sign sequence planner', () => {
  it('normalizes Indonesian input and punctuation', () => {
    expect(normalizeSignText('  Terima, KASIH!  ')).toBe('terima kasih')
  })

  it('prefers the longest catalog phrase', () => {
    const sequence = buildSignSequence('Terima kasih', phrases, [clip('idle_ready'), clip('terima_kasih')])
    expect(sequence).toHaveLength(1)
    expect(sequence[0]).toMatchObject({ kind: 'word', actionName: 'terima_kasih', hasAnimation: true })
  })

  it('uses a direct model action for a known word', () => {
    const sequence = buildSignSequence('air', [], [clip('air'), clip('idle_ready')])
    expect(sequence[0]).toMatchObject({ label: 'air', actionName: 'air', kind: 'word', hasAnimation: true })
    expect(sequence[0]).toMatchObject({ startOffsetMs: 420, endOffsetMs: 3_580, durationMs: 3_340 })
  })

  it('matches a multiword action embedded in the local model', () => {
    const sequence = buildSignSequence('terima kasih', [], [clip('idle_ready'), clip('terima_kasih')])
    expect(sequence).toHaveLength(1)
    expect(sequence[0]).toMatchObject({ label: 'terima kasih', actionName: 'terima_kasih', hasAnimation: true })
  })

  it('spells an unknown word and adopts alphabet clips when available', () => {
    const sequence = buildSignSequence('ab', [], [clip('huruf_a')])
    expect(sequence.map((step) => step.label)).toEqual(['A', 'B'])
    expect(sequence[0]).toMatchObject({ actionName: 'huruf_a', hasAnimation: true })
    expect(sequence[1]).toMatchObject({ actionName: '', hasAnimation: false })
    expect(sequence[1]).toMatchObject({ startOffsetMs: 0, endOffsetMs: 900, durationMs: 1_100 })
  })
})
