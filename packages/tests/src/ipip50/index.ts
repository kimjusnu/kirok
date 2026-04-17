import type { TestDefinition } from '../types'
import { IPIP50_FACTORS, IPIP50_NORMS } from './metadata'
import { IPIP50_ITEMS } from './items'

export const IPIP50_TEST: TestDefinition = {
  id: 'ipip50',
  nameKo: '성격 5요인 검사 (IPIP-50)',
  nameEn: 'IPIP Big-Five Factor Markers',
  description:
    'Goldberg(1992)의 International Personality Item Pool을 기반으로 한 Big Five 성격 5요인 50문항 검사. 외향성·친화성·성실성·신경성·개방성을 측정합니다.',
  factors: IPIP50_FACTORS,
  items: IPIP50_ITEMS,
  norms: IPIP50_NORMS,
  estimatedMinutes: 10,
  scaleType: 'likert5',
  translation: {
    status: 'preliminary',
    note: '한국어 번역은 참고용 자체 번역이며 공식 타당화 절차를 거치지 않았습니다. 학술·임상 목적에는 정식 한국어 검증본 사용을 권장합니다.',
  },
  source:
    'Goldberg, L. R. (1992). The development of markers for the Big-Five factor structure. Psychological Assessment, 4(1), 26-42. Public domain items: https://ipip.ori.org/newBigFive5broadKey.htm',
}

export { IPIP50_ITEMS, IPIP50_FACTORS, IPIP50_NORMS }
