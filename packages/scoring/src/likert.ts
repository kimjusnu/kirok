import type { ScaleType, TestItem } from '@temperament/tests'

export function scaleMin(_scale: ScaleType): number {
  return 1
}

export function scaleMax(scale: ScaleType): number {
  return scale === 'likert7' ? 7 : 5
}

/**
 * Apply reverse scoring if the item is reverse-keyed.
 * Formula: (max + min) - response
 * Example: likert5 response=4 reverses to 2.
 */
export function normalizeResponse(item: TestItem, response: number): number {
  const min = scaleMin(item.scaleType)
  const max = scaleMax(item.scaleType)

  if (!Number.isFinite(response) || !Number.isInteger(response)) {
    throw new Error(`Response must be an integer, got ${response} for item ${item.id}`)
  }
  if (response < min || response > max) {
    throw new Error(
      `Response ${response} out of range [${min}, ${max}] for item ${item.id} (${item.scaleType})`,
    )
  }

  return item.reverseScored ? max + min - response : response
}
