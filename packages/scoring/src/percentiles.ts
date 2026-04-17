import type { ScoreLevel } from './types'

/**
 * Standard normal CDF using Abramowitz & Stegun 26.2.17 approximation.
 * Accurate to ~1e-7 across the whole real line.
 */
export function normalCdf(z: number): number {
  const b1 = 0.31938153
  const b2 = -0.356563782
  const b3 = 1.781477937
  const b4 = -1.821255978
  const b5 = 1.330274429
  const p = 0.2316419

  const absZ = Math.abs(z)
  const t = 1 / (1 + p * absZ)
  const d = 0.3989422804014327 * Math.exp(-0.5 * absZ * absZ)
  const poly = b1 * t + b2 * t * t + b3 * t ** 3 + b4 * t ** 4 + b5 * t ** 5
  const upperTail = d * poly

  return z < 0 ? upperTail : 1 - upperTail
}

export function zToPercentile(z: number): number {
  const pct = normalCdf(z) * 100
  const clamped = Math.min(99, Math.max(1, pct))
  return Math.round(clamped)
}

export function percentileToLevel(percentile: number): ScoreLevel {
  if (percentile < 10) return 'very-low'
  if (percentile < 30) return 'low'
  if (percentile < 70) return 'average'
  if (percentile < 90) return 'high'
  return 'very-high'
}
