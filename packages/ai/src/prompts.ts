import type { ScoringResult, FactorScore } from '@temperament/scoring'
import type { FactorMeta } from '@temperament/tests'

export interface PromptFactorSnapshot {
  id: string
  nameKo: string
  percentile: number
  level: FactorScore['level']
  rawMean: number
}

const LEVEL_LABEL: Record<FactorScore['level'], string> = {
  'very-low': '매우 낮음',
  low: '낮음',
  average: '평균',
  high: '높음',
  'very-high': '매우 높음',
}

function snapshot(scores: FactorScore[], factors: FactorMeta[]): PromptFactorSnapshot[] {
  const nameById = new Map(factors.map((f) => [f.id, f.nameKo]))
  return scores.map((s) => ({
    id: s.factorId,
    nameKo: nameById.get(s.factorId) ?? s.factorId,
    percentile: s.percentile,
    level: s.level,
    rawMean: s.rawMean,
  }))
}

export function buildInterpretationPrompt(input: {
  result: ScoringResult
  factors: FactorMeta[]
}): string {
  const rows = snapshot(input.result.factors, input.factors)
    .map(
      (f) =>
        `- ${f.nameKo} (${f.id}): ${LEVEL_LABEL[f.level]} · 백분위 ${f.percentile} · 평균 ${f.rawMean.toFixed(2)}/5`,
    )
    .join('\n')

  return [
    '당신은 심리검사 결과를 설명하는 상담 전문가입니다.',
    'IPIP Big Five 척도(Goldberg, 1992)의 5요인 점수를 한국어로 해석해 주세요.',
    '',
    '규칙:',
    '- 각 요인별 2~3문장으로 균형 있게 설명 (장점/주의점 모두).',
    '- 검사는 상대적 경향이라는 점을 명시.',
    '- 진단·의학적 조언 금지. 발달 가능성에 대한 따뜻한 톤.',
    '- 특정 논문/연구/저자를 "직접 인용"하지 말 것 (인용은 후단 시스템이 별도 삽입).',
    '- 반드시 아래 JSON 스키마로만 응답:',
    '',
    '{',
    '  "overall": "전체 프로파일 요약 (3~4문장)",',
    '  "factors": {',
    '    "openness": "해석 (2~3문장)",',
    '    "conscientiousness": "...",',
    '    "extraversion": "...",',
    '    "agreeableness": "...",',
    '    "neuroticism": "..."',
    '  },',
    '  "suggestions": ["일상/관계에서 시도해 볼 1~3가지 제안"]',
    '}',
    '',
    '점수표:',
    rows,
    '',
    'JSON만 출력 (코드 블록 없이).',
  ].join('\n')
}

export function buildSemanticScholarQuery(factor: PromptFactorSnapshot): string {
  const idToQuery: Record<string, string> = {
    openness: 'Big Five openness to experience personality',
    conscientiousness: 'Big Five conscientiousness personality outcomes',
    extraversion: 'Big Five extraversion personality',
    agreeableness: 'Big Five agreeableness personality',
    neuroticism: 'Big Five neuroticism personality',
  }
  return idToQuery[factor.id] ?? `Big Five ${factor.id} personality`
}

export { snapshot as factorSnapshots }
