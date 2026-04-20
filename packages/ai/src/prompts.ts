import type { ScoringResult, FactorScore } from '@temperament/scoring'
import type { FactorMeta } from '@temperament/tests'
import type { CitationPaper } from './papers'

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

function koreanCitationTag(paper: CitationPaper): string {
  const year = paper.year ?? 'n.d.'
  const firstSurname = paper.authors[0]?.split(' ').slice(-1)[0]
  if (!firstSurname) return `(Unknown, ${year})`
  if (paper.authors.length === 1) return `(${firstSurname}, ${year})`
  if (paper.authors.length === 2) {
    const secondSurname = paper.authors[1]!.split(' ').slice(-1)[0]
    return `(${firstSurname} & ${secondSurname}, ${year})`
  }
  return `(${firstSurname} 외, ${year})`
}

export interface InterpretationPromptInput {
  result: ScoringResult
  factors: FactorMeta[]
  papersByFactor?: Record<string, CitationPaper[]>
}

export function buildInterpretationPrompt(input: InterpretationPromptInput): string {
  const rows = snapshot(input.result.factors, input.factors)
    .map(
      (f) =>
        `- ${f.nameKo} (${f.id}): ${LEVEL_LABEL[f.level]} · 백분위 ${f.percentile} · 평균 ${f.rawMean.toFixed(2)}/5`,
    )
    .join('\n')

  const paperLines: string[] = []
  const anyPapers =
    input.papersByFactor &&
    Object.values(input.papersByFactor).some((list) => list.length > 0)
  if (input.papersByFactor && anyPapers) {
    paperLines.push('')
    paperLines.push('참고 연구 (각 요인별 본문에 반드시 1회 이상 자연스러운 국문 인용으로 녹여 넣을 것):')
    for (const f of input.factors) {
      const papers = input.papersByFactor[f.id] ?? []
      if (papers.length === 0) continue
      paperLines.push(`[${f.nameKo}]`)
      for (const p of papers.slice(0, 3)) {
        const tag = koreanCitationTag(p)
        paperLines.push(`  · ${tag} ${p.title}`)
      }
    }
    paperLines.push('')
    paperLines.push('인용 지침:')
    paperLines.push('- 제공된 위 목록에 있는 논문만 인용. 다른 연구를 지어내거나 추측하지 말 것.')
    paperLines.push('- 자연스러운 국문 패턴 예: "한 종단 연구(Lee 외, 2019)에서는 ...", "개방성과 창의성의 관계를 살핀 연구(Kim & Park, 2020)에 따르면 ...".')
    paperLines.push('- 인용 꺽쇠는 반드시 위 목록의 표기를 그대로 복사해 사용.')
    paperLines.push('- 해당 요인에 제공된 논문이 없으면 그 요인의 본문에서는 인용을 생략해도 됨.')
  }

  return [
    '당신은 성격심리학을 전공한 따뜻한 상담자이자 숙련된 에디터입니다.',
    'IPIP Big Five (Goldberg, 1992) 검사 결과를 한국어로 깊이 있고 서사적으로 해설해 주세요.',
    '독자가 "아, 내가 이런 사람이구나" 하고 자신을 다정하게 발견하도록 돕는 것이 목표입니다.',
    '',
    '작성 규칙:',
    '- overall: 6~8문장. 이 사람의 전반적인 결·에너지의 방향·관계에서의 분위기·고유한 조합을 서사적 문체로 묘사. 다섯 요인을 따로따로 나열하지 말고 하나의 인물 스케치처럼 엮을 것.',
    '- 각 요인 해석: 5~7문장. 다음 요소를 골고루 포함할 것.',
    '  ① 이 점수 수준에서 실제로 드러나는 일상적 모습 (예: 회의 자리에서, 친구와의 대화에서, 혼자 있을 때).',
    '  ② 이 성향이 빛나는 강점과 상황.',
    '  ③ 조심해야 할 사각지대 또는 피로가 쌓이기 쉬운 지점.',
    '  ④ 위 "참고 연구" 중 해당 요인의 논문을 최소 1회 자연스럽게 인용.',
    '- suggestions: 오늘 바로 시도할 수 있는 구체적 행동 제안 4~6개. 추상적 조언 금지, "월요일 아침에 ~~를 해보세요" 같은 실행 가능한 문장.',
    '- 톤: 따뜻하지만 깊이 있음. 판단·진단·의학 조언 금지. 독자를 동등한 어른으로 존중.',
    '- 같은 표현 반복 피하고, 의식의 흐름처럼 읽히되 각 문장이 정보를 담고 있어야 함.',
    '- 숫자(백분위)는 본문에서 과하게 반복하지 말고, 필요 시 "상위권" / "평균 부근" / "하위 20% 내외" 같은 자연어로.',
    '',
    '출력 형식은 반드시 아래 JSON (코드블록 없이, 다른 텍스트 없이).',
    '{',
    '  "overall": "서사적 요약 6~8문장",',
    '  "factors": {',
    '    "openness": "5~7문장, 참고 연구 인용 포함",',
    '    "conscientiousness": "...",',
    '    "extraversion": "...",',
    '    "agreeableness": "...",',
    '    "neuroticism": "..."',
    '  },',
    '  "suggestions": ["구체 행동 제안", "..."]',
    '}',
    '',
    '점수표:',
    rows,
    ...paperLines,
    '',
    'JSON만 출력.',
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
