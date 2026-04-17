export type ScoreLevel = 'very-low' | 'low' | 'average' | 'high' | 'very-high'

export interface ItemResponse {
  itemId: string
  score: number
}

export interface FactorScore {
  factorId: string
  rawMean: number
  rawSum: number
  percentile: number
  zScore: number
  level: ScoreLevel
  answeredCount: number
}

export interface ScoringResult {
  testId: string
  itemCount: number
  answered: number
  completed: boolean
  factors: FactorScore[]
}
