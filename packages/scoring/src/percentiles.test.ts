import { describe, expect, it } from 'vitest'
import { normalCdf, percentileToLevel, zToPercentile } from './percentiles'

describe('normalCdf', () => {
  it('returns 0.5 at z=0', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 3)
  })

  it('matches known values', () => {
    expect(normalCdf(1)).toBeCloseTo(0.8413, 3)
    expect(normalCdf(-1)).toBeCloseTo(0.1587, 3)
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3)
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3)
  })

  it('approaches 1 for large z', () => {
    expect(normalCdf(4)).toBeGreaterThan(0.99996)
  })

  it('approaches 0 for very negative z', () => {
    expect(normalCdf(-4)).toBeLessThan(0.0001)
  })
})

describe('zToPercentile', () => {
  it('clamps to 1..99', () => {
    expect(zToPercentile(-10)).toBe(1)
    expect(zToPercentile(10)).toBe(99)
  })

  it('rounds to integer percentiles', () => {
    expect(zToPercentile(0)).toBe(50)
    expect(Number.isInteger(zToPercentile(1.234))).toBe(true)
  })
})

describe('percentileToLevel', () => {
  it('maps percentiles to labels', () => {
    expect(percentileToLevel(5)).toBe('very-low')
    expect(percentileToLevel(20)).toBe('low')
    expect(percentileToLevel(50)).toBe('average')
    expect(percentileToLevel(80)).toBe('high')
    expect(percentileToLevel(95)).toBe('very-high')
  })

  it('handles boundaries correctly', () => {
    expect(percentileToLevel(9)).toBe('very-low')
    expect(percentileToLevel(10)).toBe('low')
    expect(percentileToLevel(29)).toBe('low')
    expect(percentileToLevel(30)).toBe('average')
    expect(percentileToLevel(69)).toBe('average')
    expect(percentileToLevel(70)).toBe('high')
    expect(percentileToLevel(89)).toBe('high')
    expect(percentileToLevel(90)).toBe('very-high')
  })
})
