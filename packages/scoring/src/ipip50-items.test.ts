import { describe, expect, it } from 'vitest'
import { IPIP50_ITEMS } from '@temperament/tests'

/**
 * Structural integrity tests for the IPIP-50 item bank.
 *
 * These tests exist because the Korean/English wording gets rewritten
 * occasionally for readability, and a careless edit could silently break the
 * factor mapping or reverse-keying that the Goldberg normative table
 * (packages/tests/src/ipip50/metadata.ts) assumes. When anything in this file
 * goes red, the 2026-style rewrite probably touched a structural field it
 * should not have.
 */

// Expected reverse-keying counts per factor, locked to the public IPIP-50
// key. Changing these values invalidates the current norms table and
// requires re-norming — do not relax without that work.
const EXPECTED_REVERSE_COUNT: Record<string, number> = {
  extraversion: 5,
  agreeableness: 4,
  conscientiousness: 4,
  neuroticism: 2,
  openness: 3,
}

const EXPECTED_FACTORS = Object.keys(EXPECTED_REVERSE_COUNT)

describe('IPIP50 item bank integrity', () => {
  it('contains exactly 50 items in order 1..50', () => {
    expect(IPIP50_ITEMS).toHaveLength(50)
    const orders = IPIP50_ITEMS.map((i) => i.order)
    expect(orders).toEqual(Array.from({ length: 50 }, (_, i) => i + 1))
  })

  it('has unique ids of the form ipip50-N', () => {
    const ids = IPIP50_ITEMS.map((i) => i.id)
    expect(new Set(ids).size).toBe(50)
    for (const item of IPIP50_ITEMS) {
      expect(item.id).toBe(`ipip50-${item.order}`)
    }
  })

  it('assigns exactly 10 items to each of the five factors', () => {
    const counts: Record<string, number> = {}
    for (const item of IPIP50_ITEMS) {
      counts[item.factor] = (counts[item.factor] ?? 0) + 1
    }
    for (const factor of EXPECTED_FACTORS) {
      expect(counts[factor], `factor=${factor}`).toBe(10)
    }
  })

  it('preserves the original IPIP-50 reverse-keyed distribution', () => {
    const reverseCounts: Record<string, number> = {}
    for (const item of IPIP50_ITEMS) {
      if (item.reverseScored) {
        reverseCounts[item.factor] = (reverseCounts[item.factor] ?? 0) + 1
      }
    }
    for (const factor of EXPECTED_FACTORS) {
      expect(reverseCounts[factor] ?? 0, `factor=${factor}`).toBe(
        EXPECTED_REVERSE_COUNT[factor],
      )
    }
  })

  it('uses the likert5 scale for every item', () => {
    for (const item of IPIP50_ITEMS) {
      expect(item.scaleType).toBe('likert5')
    }
  })

  it('has non-trivial English and Korean wording (length ≥ 10)', () => {
    for (const item of IPIP50_ITEMS) {
      expect(item.textEn.trim().length, `id=${item.id} textEn`).toBeGreaterThanOrEqual(10)
      expect(item.textKo.trim().length, `id=${item.id} textKo`).toBeGreaterThanOrEqual(10)
    }
  })

  it('limits "~편이다" endings so the bank feels varied', () => {
    // Style gate: the pre-2026 Korean translation ended most items with
    // "~편이다", which made many items read as duplicates. The rewrite
    // replaces that pattern with concrete scenes. A small residue is OK,
    // a flood is not.
    const endsWithPyeonIda = IPIP50_ITEMS.filter((i) =>
      i.textKo.trim().endsWith('편이다.'),
    )
    expect(endsWithPyeonIda.length).toBeLessThanOrEqual(5)
  })
})
