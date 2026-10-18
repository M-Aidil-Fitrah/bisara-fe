export type MotionSample = {
  timeMs: number
  motion: number
}

export type ActiveMotionRange = {
  activeStartMs: number
  activeEndMs: number
}

export function findActiveMotionRange(samples: readonly MotionSample[], durationMs: number): ActiveMotionRange {
  const peakMotion = samples.reduce((peak, sample) => Math.max(peak, sample.motion), 0)
  const threshold = Math.max(peakMotion * 0.08, 0.002)
  const activeSamples = samples.filter((sample) => sample.motion >= threshold)

  return {
    activeStartMs: activeSamples[0]?.timeMs ?? 0,
    activeEndMs: activeSamples.at(-1)?.timeMs ?? durationMs,
  }
}
