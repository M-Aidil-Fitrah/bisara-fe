import { describe, expect, it } from 'vitest'
import { findActiveMotionRange } from './animationTiming'

describe('animation motion timing', () => {
  it('ignores low-motion lead-in and recovery frames', () => {
    expect(findActiveMotionRange([
      { timeMs: 0, motion: 0.001 },
      { timeMs: 500, motion: 0.004 },
      { timeMs: 1_000, motion: 0.12 },
      { timeMs: 2_500, motion: 0.2 },
      { timeMs: 3_000, motion: 0.03 },
      { timeMs: 3_500, motion: 0.003 },
    ], 4_000)).toEqual({ activeStartMs: 1_000, activeEndMs: 3_000 })
  })

  it('uses the full clip when no meaningful motion is detected', () => {
    expect(findActiveMotionRange([
      { timeMs: 200, motion: 0.0001 },
      { timeMs: 700, motion: 0.0002 },
    ], 1_000)).toEqual({ activeStartMs: 0, activeEndMs: 1_000 })
  })
})
