import type { TestDefinition } from './types'
import { IPIP50_TEST } from './ipip50'

export * from './types'
export * from './ipip50'

export const TESTS: Record<string, TestDefinition> = {
  ipip50: IPIP50_TEST,
}

export function getTestById(id: string): TestDefinition | undefined {
  return TESTS[id]
}

export function listActiveTests(): TestDefinition[] {
  return Object.values(TESTS)
}
