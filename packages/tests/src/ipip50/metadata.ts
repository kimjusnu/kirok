import type { FactorMeta, FactorNorm } from '../types'

export const IPIP50_FACTORS: FactorMeta[] = [
  {
    id: 'extraversion',
    nameKo: '외향성',
    nameEn: 'Extraversion',
    descriptionKo: '사회적 상호작용에서 느끼는 활력, 자기 주장, 긍정적 정서를 경험하는 경향',
  },
  {
    id: 'agreeableness',
    nameKo: '친화성',
    nameEn: 'Agreeableness',
    descriptionKo: '타인에 대한 신뢰, 공감, 협력하려는 성향',
  },
  {
    id: 'conscientiousness',
    nameKo: '성실성',
    nameEn: 'Conscientiousness',
    descriptionKo: '목표 달성을 위한 계획성, 자기 통제, 책임감의 정도',
  },
  {
    id: 'neuroticism',
    nameKo: '신경성',
    nameEn: 'Neuroticism',
    descriptionKo: '불안, 우울, 스트레스 등 부정적 정서를 경험하는 빈도와 강도',
  },
  {
    id: 'openness',
    nameKo: '개방성',
    nameEn: 'Openness',
    descriptionKo: '상상력, 지적 호기심, 새로운 아이디어와 경험에 대한 수용성',
  },
]

/**
 * Approximate IPIP Big-Five-50 means and SDs.
 * Source: Goldberg, L. R. (1992) IPIP normative data for adult samples.
 * Values are ITEM-level averages on a 1-5 Likert scale.
 */
export const IPIP50_NORMS: FactorNorm[] = [
  { factorId: 'extraversion', mean: 3.3, sd: 0.74, source: 'Goldberg IPIP norms (adult)' },
  { factorId: 'agreeableness', mean: 3.73, sd: 0.62, source: 'Goldberg IPIP norms (adult)' },
  { factorId: 'conscientiousness', mean: 3.35, sd: 0.71, source: 'Goldberg IPIP norms (adult)' },
  { factorId: 'neuroticism', mean: 2.78, sd: 0.77, source: 'Goldberg IPIP norms (adult)' },
  { factorId: 'openness', mean: 3.82, sd: 0.6, source: 'Goldberg IPIP norms (adult)' },
]
