import type { FactorNorm, TestDefinition } from '@temperament/tests'
import { normalizeResponse } from './likert'
import { percentileToLevel, zToPercentile } from './percentiles'
import type { FactorScore, ItemResponse, ScoringResult } from './types'

function findNorm(norms: FactorNorm[], factorId: string): FactorNorm | undefined {
  return norms.find((n) => n.factorId === factorId)
}

export function scoreTest(
  test: TestDefinition,
  responses: ItemResponse[],
): ScoringResult {
  const responseMap = new Map(responses.map((r) => [r.itemId, r.score]))
  const normalizedByFactor = new Map<string, number[]>()

  for (const item of test.items) {
    const raw = responseMap.get(item.id)
    if (raw === undefined) continue
    const normalized = normalizeResponse(item, raw)
    const bucket = normalizedByFactor.get(item.factor) ?? []
    bucket.push(normalized)
    normalizedByFactor.set(item.factor, bucket)
  }

  const factors: FactorScore[] = test.factors.map((factor) => {
    const values = normalizedByFactor.get(factor.id) ?? []
    const rawSum = values.reduce((acc, v) => acc + v, 0)
    const rawMean = values.length > 0 ? rawSum / values.length : 0
    const norm = findNorm(test.norms, factor.id)
    const zScore = norm && values.length > 0 ? (rawMean - norm.mean) / norm.sd : 0
    const percentile = norm && values.length > 0 ? zToPercentile(zScore) : 50

    return {
      factorId: factor.id,
      rawMean: Number(rawMean.toFixed(3)),
      rawSum,
      percentile,
      zScore: Number(zScore.toFixed(3)),
      level: percentileToLevel(percentile),
      answeredCount: values.length,
    }
  })

  return {
    testId: test.id,
    itemCount: test.items.length,
    answered: responses.length,
    completed: responses.length === test.items.length,
    factors,
  }
}
