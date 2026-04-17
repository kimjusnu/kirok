export type ScaleType = 'likert5' | 'likert7'

export type TranslationStatus = 'validated' | 'preliminary' | 'english-only'

export interface TestItem {
  id: string
  order: number
  textKo: string
  textEn: string
  factor: string
  facet: string
  reverseScored: boolean
  scaleType: ScaleType
}

export interface FacetMeta {
  id: string
  nameKo: string
  nameEn: string
  descriptionKo?: string
}

export interface FactorMeta {
  id: string
  nameKo: string
  nameEn: string
  descriptionKo: string
  facets?: FacetMeta[]
}

export interface TranslationMeta {
  status: TranslationStatus
  note: string
}

export interface FactorNorm {
  factorId: string
  mean: number
  sd: number
  source: string
}

export interface TestDefinition {
  id: string
  nameKo: string
  nameEn: string
  description: string
  factors: FactorMeta[]
  items: TestItem[]
  norms: FactorNorm[]
  estimatedMinutes: number
  scaleType: ScaleType
  translation: TranslationMeta
  source: string
}
