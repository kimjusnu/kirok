import { describe, expect, it, vi } from 'vitest'
import { formatInlineCitation, searchPapers } from './papers'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('searchPapers', () => {
  it('maps OpenAlex response into CitationPaper shape', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () =>
      jsonResponse({
        results: [
          {
            id: 'https://openalex.org/W123',
            doi: 'https://doi.org/10.1000/xyz',
            title: 'Big Five Inventory',
            publication_year: 1992,
            authorships: [{ author: { display_name: 'Lewis R. Goldberg' } }],
          },
          {
            id: 'https://openalex.org/W456',
            doi: null,
            title: 'Second Paper',
            publication_year: 2020,
            authorships: [
              { author: { display_name: 'Jane Doe' } },
              { author: { display_name: 'Bob Roe' } },
              { author: { display_name: 'Carol Coe' } },
            ],
          },
        ],
      }),
    ) as unknown as typeof fetch
    const mock = vi.mocked(fetchImpl)

    const r = await searchPapers({ query: 'openness', limit: 2 }, { fetchImpl })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.papers).toHaveLength(2)
      expect(r.papers[0]).toMatchObject({
        paperId: 'W123',
        doi: '10.1000/xyz',
        year: 1992,
      })
      expect(r.papers[0]!.authors[0]).toBe('Lewis R. Goldberg')
      expect(r.papers[0]!.url).toBe('https://openalex.org/W123')
      expect(r.papers[1]!.doi).toBeNull()
    }

    const url = mock.mock.calls[0]![0] as string
    expect(url).toContain('search=openness')
    expect(url).toContain('per-page=2')
    expect(url).toContain('select=')
  })

  it('returns HTTP error code on non-2xx', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () =>
      jsonResponse({ message: 'rate limited' }, 429),
    ) as unknown as typeof fetch

    const r = await searchPapers({ query: 'x' }, { fetchImpl })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('HTTP_429')
  })

  it('tolerates missing results array', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () => jsonResponse({})) as unknown as typeof fetch
    const r = await searchPapers({ query: 'x' }, { fetchImpl })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.papers).toEqual([])
  })
})

describe('formatInlineCitation', () => {
  const base = {
    paperId: 'p',
    title: 't',
    year: 1992,
    doi: null,
    url: null,
    abstract: null,
  }

  it('single author', () => {
    expect(formatInlineCitation({ ...base, authors: ['Lewis R. Goldberg'] })).toBe(
      '(Goldberg, 1992)',
    )
  })

  it('two authors joined with &', () => {
    expect(formatInlineCitation({ ...base, authors: ['John Smith', 'Jane Roe'] })).toBe(
      '(Smith & Roe, 1992)',
    )
  })

  it('three+ authors use et al.', () => {
    expect(
      formatInlineCitation({ ...base, authors: ['A One', 'B Two', 'C Three'] }),
    ).toBe('(One et al., 1992)')
  })

  it('uses n.d. when year missing', () => {
    expect(formatInlineCitation({ ...base, year: null, authors: ['Lewis Goldberg'] })).toBe(
      '(Goldberg, n.d.)',
    )
  })
})
