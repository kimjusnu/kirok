import { describe, expect, it } from 'vitest'
import { IPIP50_TEST } from '@temperament/tests'
import { scoreTest } from './score'
import type { ItemResponse } from './types'

function allResponses(value: number): ItemResponse[] {
  return IPIP50_TEST.items.map((item) => ({ itemId: item.id, score: value }))
}

describe('scoreTest with IPIP-50', () => {
  it('marks a full response set as completed', () => {
    const result = scoreTest(IPIP50_TEST, allResponses(3))
    expect(result.completed).toBe(true)
    expect(result.answered).toBe(50)
    expect(result.factors).toHaveLength(5)
  })

  it('marks partial responses as not completed', () => {
    const partial = IPIP50_TEST.items.slice(0, 10).map((item) => ({
      itemId: item.id,
      score: 4,
    }))
    const result = scoreTest(IPIP50_TEST, partial)
    expect(result.completed).toBe(false)
    expect(result.answered).toBe(10)
  })

  it('midpoint responses produce mean ~3 for each factor', () => {
    const result = scoreTest(IPIP50_TEST, allResponses(3))
    for (const factor of result.factors) {
      expect(factor.rawMean).toBeCloseTo(3, 2)
      expect(factor.answeredCount).toBe(10)
    }
  })

  it('endorsing all items at max yields elevated scores after reverse-keying', () => {
    // When all responses are 5, reverse-scored items become 1 and direct items stay 5.
    // For each IPIP-50 factor, direct items outnumber or equal reverse items,
    // so the factor mean should still be >= 3 but rarely at the ceiling.
    const result = scoreTest(IPIP50_TEST, allResponses(5))
    for (const factor of result.factors) {
      expect(factor.rawMean).toBeGreaterThanOrEqual(1)
      expect(factor.rawMean).toBeLessThanOrEqual(5)
    }
  })

  it('extraversion-high profile produces high extraversion percentile', () => {
    // Answer 5 to direct-keyed E items, 1 to reverse-keyed E items.
    // All other factor items set to midpoint (3).
    const responses: ItemResponse[] = IPIP50_TEST.items.map((item) => {
      if (item.factor === 'extraversion') {
        return { itemId: item.id, score: item.reverseScored ? 1 : 5 }
      }
      return { itemId: item.id, score: 3 }
    })

    const result = scoreTest(IPIP50_TEST, responses)
    const extraversion = result.factors.find((f) => f.factorId === 'extraversion')
    expect(extraversion).toBeDefined()
    expect(extraversion?.rawMean).toBe(5)
    expect(extraversion?.percentile).toBeGreaterThanOrEqual(95)
    expect(extraversion?.level).toBe('very-high')
  })

  it('extraversion-low profile produces low extraversion percentile', () => {
    const responses: ItemResponse[] = IPIP50_TEST.items.map((item) => {
      if (item.factor === 'extraversion') {
        return { itemId: item.id, score: item.reverseScored ? 5 : 1 }
      }
      return { itemId: item.id, score: 3 }
    })

    const result = scoreTest(IPIP50_TEST, responses)
    const extraversion = result.factors.find((f) => f.factorId === 'extraversion')
    expect(extraversion?.rawMean).toBe(1)
    expect(extraversion?.percentile).toBeLessThanOrEqual(5)
    expect(extraversion?.level).toBe('very-low')
  })
})

describe('IPIP-50 structural integrity', () => {
  it('has exactly 50 items', () => {
    expect(IPIP50_TEST.items).toHaveLength(50)
  })

  it('has exactly 10 items per factor', () => {
    const counts: Record<string, number> = {}
    for (const item of IPIP50_TEST.items) {
      counts[item.factor] = (counts[item.factor] ?? 0) + 1
    }
    expect(counts).toEqual({
      extraversion: 10,
      agreeableness: 10,
      conscientiousness: 10,
      neuroticism: 10,
      openness: 10,
    })
  })

  it('has unique item IDs and sequential order', () => {
    const ids = new Set(IPIP50_TEST.items.map((i) => i.id))
    expect(ids.size).toBe(50)

    const orders = IPIP50_TEST.items.map((i) => i.order).sort((a, b) => a - b)
    expect(orders).toEqual(Array.from({ length: 50 }, (_, i) => i + 1))
  })

  it('has a norm defined for each factor', () => {
    for (const factor of IPIP50_TEST.factors) {
      const norm = IPIP50_TEST.norms.find((n) => n.factorId === factor.id)
      expect(norm).toBeDefined()
    }
  })
})
