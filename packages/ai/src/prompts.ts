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
    '- overall: 8~10문장. 다섯 요인의 조합에서 드러나는 "이 사람 특유의 결"을 인물 스케치처럼 그릴 것. 다음을 최소 1회씩 다룰 것.',
    '  (a) 에너지가 어디서 충전되고 어디서 소진되는지',
    '  (b) 의사결정 스타일 (직관·분석·합의 등)',
    '  (c) 가까운 관계와 낯선 자리에서의 톤 차이',
    '  (d) 스트레스 아래에서 돌아가는 기본값',
    '  (e) 강점과 맞닿아 있는 맹점 한 가지',
    '  · 요인별로 문단을 나누지 말고 하나의 서사로 엮을 것. 숫자 나열 금지.',
    '',
    '- 각 요인 해석: 7~9문장. 다음 네 요소를 섞어 쓸 것.',
    '  ① 이 점수 수준이 실제로 드러나는 구체 장면 3개 이상. 회의실/팀 점심/친구 생일/혼자 보내는 주말/퇴근길/새 프로젝트의 첫 주/갈등 중재/낯선 모임 중 서로 다른 맥락을 골라 쓸 것.',
    '  ② 이 성향이 "잘 통하는" 역할·환경을 구체 직무명이나 상황으로 묘사.',
    '  ③ 사각지대 — 자기 관점에선 잘 안 보이지만 주변이 먼저 감지하는 신호.',
    '  ④ 위 "참고 연구" 중 해당 요인의 논문을 자연스러운 국문 인용으로 최소 1회 녹여 쓸 것. 인용은 주장의 근거로 쓰되 장식처럼 붙이지 말 것.',
    '',
    '- practiceLead: 한 줄(50~90자). Practice 목록 바로 위에 놓일 리드 문장. "당신의 상위 두 요인과 맞닿은 한 주짜리 실험이에요" 같은 톤으로, 독자의 점수 지형을 한 마디로 짚어 줄 것. 진단·평가 표현 금지.',
    '',
    '- suggestions: 4~6개. 각 항목은 {text, linkedFactor, why} 세 필드를 가진 객체.',
    '  · text: "언제 · 어디서 · 무엇을 · 어떻게" 네 요소를 포함한 실행 가능한 한 문장. 예시 톤: "수요일 퇴근 후 30분, 스마트폰을 다른 방에 두고 평소 피하던 주제 하나를 노트에 두 문단 써 보세요." 추상 조언("자주 ~하세요") 금지.',
    '  · linkedFactor: 이 제안이 가장 강하게 연결된 단일 요인 id. openness / conscientiousness / extraversion / agreeableness / neuroticism 중 정확히 하나.',
    '  · why: 40~70자 한국어 한 줄. "당신의 ○○ 점수가 ~이기 때문에 이 실험을 골랐어요" 톤으로 구체적인 근거 제시. 점수 벡터를 직접 참조할 것.',
    '  · 4~6개가 한 요인에 치우치지 않도록 최소 3개 이상의 요인에 분산 배치할 것.',
    '',
    '- lifeFit (반드시 포함):',
    '  · careers: 4~6개. 각 카드 = {title, reason, fit}.',
    '    - title: 한국어 직무명. "컨설턴트"처럼 넓지 말고 "브랜드 전략 컨설턴트"처럼 한 단계 구체.',
    '    - reason: 60~90자 한국어 한 줄. 이 사람의 상위 2개 요인과 점수 벡터 자체를 근거로 논증. 예: "개방성 82 · 성실성 48 조합이라 구조보다 아이디어 발굴에 먼저 붙어야 에너지가 살아납니다."',
    '    - fit: 1~5 정수 적합도. 5는 상위 2개 요인과 직접 연관된 직무에만. 남발 금지.',
    '  · hobbies: 4~6개. 같은 {title, reason, fit} 구조. 직업 카드와 겹치지 않는 여가 영역(운동/창작/공부/관계/여행/감각 수집)에서 골고루.',
    '  · narrative: 3~5문장. 특정 카드를 반복 인용하지 말고 전체 점수 지형의 관점에서 "왜 이 조합이 이 사람에게 어울리는가"를 서사로 풀 것.',
    '',
    '- 직업·취미 제안 시 참고용 심리학 매핑 (원문 복붙 금지, 경향일 뿐):',
    '  · 개방성↑ : 예술·연구·UX·브랜드·콘텐츠 전략 / 창작·탐구형 취미',
    '  · 개방성↓ : 운영·품질·제조·정밀 공정 / 규칙과 반복이 있는 취미',
    '  · 성실성↑ : 재무·법무·프로젝트 관리·의료 / 수련형 취미',
    '  · 성실성↓ : 즉흥 기획·영업 프런트·창작 프로토타이핑 / 자유형 취미',
    '  · 외향성↑ : 세일즈·커뮤니티·교육·이벤트 / 팀 스포츠·사교형',
    '  · 외향성↓ : 글쓰기·분석·리서치·개발 / 혼자 몰입하는 취미',
    '  · 친화성↑ : HR·상담·간호·교육·NGO / 돌봄·협력형 취미',
    '  · 친화성↓ : 협상·트레이딩·비평·감사 / 개인 경쟁 취미',
    '  · 신경성↑ : 창작(감정 소재)·심리·인문 연구 / 자기조절형 취미 (단, 고강도 실시간 응대 직군은 피로 위험을 한 줄 언급)',
    '  · 신경성↓ : 응급·구조·고위험 현장·트레이더 / 모험형 취미',
    '  - 단독 요인으로 판단 금지. 반드시 상위 2~3개 요인의 조합으로 해석.',
    '  - "당신은 반드시 ~에 적합합니다" 같은 직업 보장 표현 금지.',
    '',
    '- 톤: 따뜻하지만 깊이 있음. 판단·진단·의학 조언 금지. 독자를 동등한 어른으로 존중.',
    '- 같은 문장 시작과 같은 어미의 반복 피하기. 각 문장이 정보를 담고 있을 것.',
    '- 숫자(백분위)는 본문에서 과하게 반복하지 말고 "상위권 / 평균 근처 / 하위 20% 내외" 같은 자연어로.',
    '',
    '출력 형식은 반드시 아래 JSON (코드블록 없이, 다른 텍스트 없이).',
    '{',
    '  "overall": "서사적 요약 8~10문장",',
    '  "factors": {',
    '    "openness": "7~9문장, 참고 연구 인용 포함",',
    '    "conscientiousness": "...",',
    '    "extraversion": "...",',
    '    "agreeableness": "...",',
    '    "neuroticism": "..."',
    '  },',
    '  "practiceLead": "한 주짜리 실험 목록 위에 놓일 한 줄 리드",',
    '  "suggestions": [',
    '    { "text": "언제·어디서·무엇을·어떻게를 담은 구체 행동 한 문장",',
    '      "linkedFactor": "openness",',
    '      "why": "당신의 ○○ 점수가 ~이기 때문에 이 실험을 골랐어요 (40~70자)" }',
    '  ],',
    '  "lifeFit": {',
    '    "careers": [',
    '      { "title": "브랜드 전략 컨설턴트", "reason": "60~90자 한 줄 근거", "fit": 5 }',
    '    ],',
    '    "hobbies": [',
    '      { "title": "도시 산책 사진 아카이빙", "reason": "...", "fit": 4 }',
    '    ],',
    '    "narrative": "이 조합이 왜 이 사람에게 어울리는가 — 3~5문장"',
    '  }',
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
