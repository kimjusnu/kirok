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
  it('parses plain JSON', () => {
    const json = '{"overall":"ov","factors":{"openness":"o"},"suggestions":["a"]}'
    const parsed = parseInterpretation(json)
    expect(parsed?.overall).toBe('ov')
    expect(parsed?.factors.openness).toBe('o')
    expect(parsed?.suggestions[0]).toBe('a')
  })

  it('strips ```json fences', () => {
    const wrapped = '```json\n{"overall":"ov","factors":{"o":"x"},"suggestions":["s"]}\n```'
    expect(parseInterpretation(wrapped)).not.toBeNull()
  })

  it('returns null on malformed JSON', () => {
    expect(parseInterpretation('not json')).toBeNull()
    expect(parseInterpretation('{"overall":"x"}')).toBeNull() // missing required fields
  })
})
