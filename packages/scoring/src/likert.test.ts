import { describe, expect, it } from 'vitest'
import type { TestItem } from '@temperament/tests'
import { normalizeResponse, scaleMax, scaleMin } from './likert'

function makeItem(overrides: Partial<TestItem> = {}): TestItem {
  return {
    id: 'test-1',
    order: 1,
    textEn: 'Example item',
    textKo: '예시 문항',
    factor: 'extraversion',
    facet: 'extraversion',
    reverseScored: false,
    scaleType: 'likert5',
    ...overrides,
  }
}

describe('scaleMin / scaleMax', () => {
  it('returns 1 for the min of either scale', () => {
    expect(scaleMin('likert5')).toBe(1)
    expect(scaleMin('likert7')).toBe(1)
  })

  it('returns 5 for likert5 and 7 for likert7', () => {
    expect(scaleMax('likert5')).toBe(5)
    expect(scaleMax('likert7')).toBe(7)
  })
})

describe('normalizeResponse', () => {
  it('passes through non-reversed responses unchanged', () => {
    const item = makeItem()
    expect(normalizeResponse(item, 1)).toBe(1)
    expect(normalizeResponse(item, 3)).toBe(3)
    expect(normalizeResponse(item, 5)).toBe(5)
  })

  it('reverse-scores likert5 items correctly (max+min - response)', () => {
    const item = makeItem({ reverseScored: true })
    expect(normalizeResponse(item, 1)).toBe(5)
    expect(normalizeResponse(item, 2)).toBe(4)
    expect(normalizeResponse(item, 3)).toBe(3)
    expect(normalizeResponse(item, 4)).toBe(2)
    expect(normalizeResponse(item, 5)).toBe(1)
  })

  it('reverse-scores likert7 items correctly', () => {
    const item = makeItem({ reverseScored: true, scaleType: 'likert7' })
    expect(normalizeResponse(item, 1)).toBe(7)
    expect(normalizeResponse(item, 4)).toBe(4)
    expect(normalizeResponse(item, 7)).toBe(1)
  })

  it('rejects out-of-range responses', () => {
    const item = makeItem()
    expect(() => normalizeResponse(item, 0)).toThrow(/out of range/)
    expect(() => normalizeResponse(item, 6)).toThrow(/out of range/)
  })

  it('rejects non-integer responses', () => {
    const item = makeItem()
    expect(() => normalizeResponse(item, 3.5)).toThrow(/integer/)
    expect(() => normalizeResponse(item, Number.NaN)).toThrow()
  })
})
