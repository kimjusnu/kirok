import { describe, expect, it, vi } from 'vitest'
import { generateContent, parseInterpretation } from './gemini'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function geminiSuccessBody(text: string) {
  return {
    candidates: [{ content: { parts: [{ text }] } }],
  }
}

describe('generateContent', () => {
  it('posts to the correct endpoint with api key', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () =>
      jsonResponse(geminiSuccessBody('{"overall":"ok","factors":{"openness":"x"},"suggestions":["a"]}')),
    ) as unknown as typeof fetch
    const mock = vi.mocked(fetchImpl)

    const result = await generateContent(
      { prompt: 'hi' },
      { apiKey: 'AIza_test', fetchImpl },
    )

    expect(result.ok).toBe(true)
    const url = mock.mock.calls[0]![0] as string
    expect(url).toContain('generativelanguage.googleapis.com')
    expect(url).toContain('gemini-2.5-flash')
    expect(url).toContain('key=AIza_test')
  })

  it('returns HTTP error code from Gemini', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () =>
      jsonResponse({ error: { status: 'RESOURCE_EXHAUSTED', message: 'quota' } }, 429),
    ) as unknown as typeof fetch

    const result = await generateContent(
      { prompt: 'hi' },
      { apiKey: 'x', fetchImpl },
    )

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('RESOURCE_EXHAUSTED')
  })

  it('reports empty response', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () =>
      jsonResponse({ candidates: [{ content: { parts: [] } }] }),
    ) as unknown as typeof fetch

    const result = await generateContent(
      { prompt: 'hi' },
      { apiKey: 'x', fetchImpl },
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('EMPTY_RESPONSE')
  })
})

describe('parseInterpretation', () => {
  it('parses plain JSON with legacy string suggestions', () => {
    const json = '{"overall":"ov","factors":{"openness":"o"},"suggestions":["a"]}'
    const parsed = parseInterpretation(json)
    expect(parsed?.overall).toBe('ov')
    expect(parsed?.factors.openness).toBe('o')
    // Legacy string → auto-promoted to { text }.
    expect(parsed?.suggestions[0]?.text).toBe('a')
    expect(parsed?.suggestions[0]?.linkedFactor).toBeUndefined()
  })

  it('parses structured suggestion objects with linkedFactor and why', () => {
    const json = JSON.stringify({
      overall: 'ov',
      factors: { openness: 'o' },
      practiceLead: '당신의 상위 두 요인과 맞닿은 한 주짜리 실험이에요.',
      suggestions: [
        {
          text: '수요일 퇴근 후 30분, 스마트폰을 다른 방에 두고 노트에 두 문단을 써 보세요.',
          linkedFactor: 'openness',
          why: '당신의 개방성이 상위권이라 언어로 풀어내는 실험이 에너지가 됩니다.',
        },
      ],
    })
    const parsed = parseInterpretation(json)
    expect(parsed?.practiceLead).toContain('실험')
    expect(parsed?.suggestions[0]?.linkedFactor).toBe('openness')
    expect(parsed?.suggestions[0]?.why).toContain('개방성')
  })

  it('strips ```json fences', () => {
    const wrapped = '```json\n{"overall":"ov","factors":{"o":"x"},"suggestions":["s"]}\n```'
    expect(parseInterpretation(wrapped)).not.toBeNull()
  })

  it('returns null on malformed JSON', () => {
    expect(parseInterpretation('not json')).toBeNull()
    expect(parseInterpretation('{"overall":"x"}')).toBeNull() // missing required fields
  })

  it('parses JSON with lifeFit section', () => {
    const body = {
      overall: 'ov',
      factors: { openness: 'o', conscientiousness: 'c', extraversion: 'e', agreeableness: 'a', neuroticism: 'n' },
      suggestions: ['s1', 's2', 's3', 's4'],
      practiceLead: '당신의 상위 두 요인과 맞닿은 한 주짜리 실험이에요.',
      lifeFit: {
        careers: [
          { title: 'UX 리서처', reason: '개방성↑·친화성↑ 조합이 깊은 인터뷰와 어울림', fit: 5 },
          { title: '브랜드 전략 컨설턴트', reason: '아이디어 발굴에 먼저 붙어야 에너지가 살아남', fit: 4 },
          { title: '콘텐츠 에디터', reason: '언어 감각과 구조화 능력이 동시에 요구되는 자리', fit: 3 },
        ],
        hobbies: [
          { title: '도시 산책 사진 아카이빙', reason: '혼자 몰입하면서 감각을 수집하는 데 잘 맞음', fit: 4 },
          { title: '독서 모임 주최', reason: '깊은 대화가 에너지가 되는 조합' },
          { title: '수채화 스케치', reason: '감정을 손끝으로 옮기는 자기 조절 통로' },
        ],
        narrative: '아이디어와 공감이 동시에 살아나는 지점에 설 때 이 사람의 결이 가장 잘 드러납니다.',
      },
    }
    const parsed = parseInterpretation(JSON.stringify(body))
    expect(parsed?.lifeFit?.careers).toHaveLength(3)
    expect(parsed?.lifeFit?.hobbies).toHaveLength(3)
    expect(parsed?.lifeFit?.narrative).toContain('이 사람')
    expect(parsed?.lifeFit?.careers[0]?.fit).toBe(5)
  })

  it('still parses legacy JSON without lifeFit (optional field)', () => {
    const parsed = parseInterpretation(
      '{"overall":"o","factors":{"x":"y"},"suggestions":["s"]}',
    )
    expect(parsed).not.toBeNull()
    expect(parsed?.lifeFit).toBeUndefined()
    expect(parsed?.practiceLead).toBeUndefined()
    // Legacy strings are lifted to { text }.
    expect(parsed?.suggestions[0]?.text).toBe('s')
  })

  it('rejects lifeFit with too few careers', () => {
    const body = {
      overall: 'o',
      factors: { x: 'y' },
      suggestions: ['s'],
      lifeFit: {
        careers: [
          { title: 'a', reason: 'r' },
          { title: 'b', reason: 'r' },
        ], // only 2 → below min(3)
        hobbies: [
          { title: 'h1', reason: 'r' },
          { title: 'h2', reason: 'r' },
          { title: 'h3', reason: 'r' },
        ],
        narrative: 'n',
      },
    }
    expect(parseInterpretation(JSON.stringify(body))).toBeNull()
  })
})
