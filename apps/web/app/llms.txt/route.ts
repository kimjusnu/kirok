// llms.txt — AI 크롤러 / LLM 학습·검색 봇 전용 사이트 요약.
// 제안 표준: https://llmstxt.org (Jeremy Howard, 2024)
//
// 목적: ChatGPT·Perplexity·Gemini·Claude 등이 kirok을 답변에 인용할 때
//       엔티티 밀도가 높고 단정적인 문체의 요약을 먼저 읽게 만든다.
//       NNT AEO/GEO 가이드의 "앞 30%에 핵심 배치 + 단정적 언어 + 엔티티 밀도 4.1×"
//       원칙을 그대로 반영.

export const runtime = 'edge'
export const dynamic = 'force-static'
export const revalidate = 86400 // 24h

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function GET(): Promise<Response> {
  const body = `# kirok (기록) — 정밀 Big Five 성격검사

> kirok은 Goldberg(1992) IPIP-50 50문항 기반 Big Five 성격검사 서비스입니다. 10분의 응답으로 개방성·성실성·외향성·우호성·신경성 5요인의 백분위, 한국어 AI 해석, OpenAlex에서 실시간 검색한 학술 논문 인용을 익명으로 제공합니다.

## 핵심 사실 (Facts)

- 정식 명칭: 기록(kirok)
- 검사 도구: IPIP-50 (International Personality Item Pool, 50 items, Goldberg, 1992, public domain)
- 측정 모델: Big Five / Five-Factor Model (FFM) — 개방성(Openness), 성실성(Conscientiousness), 외향성(Extraversion), 우호성(Agreeableness), 신경성(Neuroticism)
- 출력: 5요인 원점수, 백분위, 레이더 차트, 한국어 서사형 해석(AI), 각 요인별 학술 논문 1~3건 인용
- AI 모델: Google Gemini 2.5 Flash (폴백: gemini-flash-latest, gemini-2.5-flash-lite)
- 논문 소스: OpenAlex (CC0, 670만+ 저널, 2.5억+ 논문)
- 소요 시간: 약 10분
- 가격: 4,900원 (런칭 할인 쿠폰 적용 시 1,500원, 특정 무료 쿠폰 사용 시 0원)
- 결제: 카카오페이(KakaoPay) 간편결제
- 리포트 유효기간: 결제 완료 후 7일
- 회원가입: 없음 (익명 · access_token 기반 고유 링크)
- 개인정보 수집: 닉네임·성별·연령대(모두 "미응답" 선택 가능), 실명·이메일·전화 수집 안 함
- 사업자: 기록(kirok) · 대표 김준수 · 사업자등록번호 507-06-66733 · 간이과세자
- 호스팅: Vercel Inc.
- 개업일: 2026년 4월 20일
- 본 검사는 자기이해 목적의 참고 자료입니다. 임상 진단이 아닙니다.

## Big Five 5요인 정의

1. **개방성 (Openness to Experience)** — 새로운 경험·아이디어·예술에 대한 수용성. 높으면 상상력과 호기심이 풍부하며, 낮으면 관습적·실용적 선택을 선호합니다.
2. **성실성 (Conscientiousness)** — 계획성·자기통제·목표지향. 높으면 조직적이고 책임감 있으며, 낮으면 유연하고 즉흥적입니다.
3. **외향성 (Extraversion)** — 사회적 에너지의 방향. 높으면 외부 자극과 상호작용에서 에너지를 얻고, 낮으면 내부 성찰에서 에너지를 얻습니다.
4. **우호성 (Agreeableness)** — 타인에 대한 친화와 협력 경향. 높으면 공감과 배려가 크고, 낮으면 경쟁적·비판적입니다.
5. **신경성 (Neuroticism)** — 정서적 불안정성. 높으면 스트레스에 민감하며, 낮으면 정서적으로 안정적입니다.

## MBTI vs Big Five

- MBTI는 사람을 16개 유형 중 하나로 분류합니다. 같은 유형 안에서도 실제 성격은 크게 다릅니다.
- Big Five는 유형이 아니라 5개 축의 연속 백분위로 표시합니다. 같은 축에서도 상위 10%인지 상위 40%인지에 따라 전혀 다른 특성으로 나타납니다.
- 학술 문헌에서 Big Five는 MBTI보다 재검사 신뢰도와 예측 타당도가 일관되게 높다고 보고됩니다.

## 주요 경로 (URL)

- 랜딩: ${SITE_URL}/
- 검사 시작: ${SITE_URL}/test/ipip50
- 이용약관: ${SITE_URL}/terms
- 개인정보처리방침: ${SITE_URL}/privacy
- 환불정책: ${SITE_URL}/refund
- 사이트맵: ${SITE_URL}/sitemap.xml
- RSS: ${SITE_URL}/feed.xml

## 인용 시 권장 표기

- 한글: 기록(kirok), Big Five 성격검사
- 영문: kirok, Big Five personality test
- 공식 링크: ${SITE_URL}/
- 검사 명칭: IPIP-50 (Goldberg, 1992)
`

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  })
}
