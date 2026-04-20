/**
 * OpenAlex Works API — public, no auth required, ~100k req/day unauthenticated.
 * Docs: https://docs.openalex.org/api-entities/works
 *
 * We previously used Semantic Scholar, which throttles unauthenticated traffic
 * aggressively (IP-wide cooldown on bursts). OpenAlex is CC0 open metadata and
 * has much more generous limits for our use case.
 */

export interface CitationPaper {
  paperId: string
  title: string
  authors: string[]
  year: number | null
  doi: string | null
  url: string | null
  abstract: string | null
}

export interface SearchPapersInput {
  query: string
  limit?: number
}

export interface SearchPapersSuccess {
  ok: true
  papers: CitationPaper[]
  raw: unknown
}

export interface SearchPapersFailure {
  ok: false
  code: string
  message: string
  raw: unknown
}

export type SearchPapersResult = SearchPapersSuccess | SearchPapersFailure

const BASE_URL = 'https://api.openalex.org/works'
const SELECT_FIELDS = 'id,doi,title,publication_year,authorships'

function buildUrl(input: SearchPapersInput): string {
  const params = new URLSearchParams()
  params.set('search', input.query)
  params.set('per-page', String(input.limit ?? 5))
  params.set('select', SELECT_FIELDS)
  return `${BASE_URL}?${params.toString()}`
}

function stripPrefix(value: string | null | undefined, prefix: string): string | null {
  if (!value) return null
  return value.startsWith(prefix) ? value.slice(prefix.length) : value
}

export async function searchPapers(
  input: SearchPapersInput,
  deps: { fetchImpl?: typeof fetch } = {},
): Promise<SearchPapersResult> {
  const fetchImpl = deps.fetchImpl ?? fetch

  let response: Response
  try {
    response = await fetchImpl(buildUrl(input), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        // OpenAlex asks for a mailto or User-Agent for their "polite pool".
        'User-Agent': 'kirok/1.0 (temperament test site)',
      },
    })
  } catch (error) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'unknown network error',
      raw: null,
    }
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    return { ok: false, code: 'INVALID_RESPONSE', message: 'non-JSON response', raw: null }
  }

  if (!response.ok) {
    const err = payload as { error?: string; message?: string }
    return {
      ok: false,
      code: `HTTP_${response.status}`,
      message: err.message ?? err.error ?? 'OpenAlex request failed',
      raw: payload,
    }
  }

  const results = (payload as { results?: unknown[] }).results ?? []
  const papers: CitationPaper[] = results.map((raw) => {
    const r = raw as {
      id?: string
      doi?: string | null
      title?: string
      publication_year?: number | null
      authorships?: Array<{ author?: { display_name?: string } }>
    }
    const paperId = stripPrefix(r.id, 'https://openalex.org/') ?? r.id ?? ''
    const doi = stripPrefix(r.doi, 'https://doi.org/')
    return {
      paperId,
      title: r.title ?? '',
      authors: (r.authorships ?? [])
        .map((a) => a.author?.display_name ?? '')
        .filter(Boolean),
      year: r.publication_year ?? null,
      doi,
      url: r.id ?? (doi ? `https://doi.org/${doi}` : null),
      abstract: null,
    }
  })

  return { ok: true, papers, raw: payload }
}

/**
 * Format a paper as a short inline citation, e.g. "(Goldberg, 1992)".
 * Falls back to first author only; "et al." when >2 authors.
 */
export function formatInlineCitation(paper: CitationPaper): string {
  const year = paper.year ?? 'n.d.'
  const first = paper.authors[0]?.split(' ').slice(-1)[0] ?? 'Unknown'
  if (paper.authors.length === 0) return `(${first}, ${year})`
  if (paper.authors.length === 1) return `(${first}, ${year})`
  if (paper.authors.length === 2) {
    const second = paper.authors[1]!.split(' ').slice(-1)[0]
    return `(${first} & ${second}, ${year})`
  }
  return `(${first} et al., ${year})`
}
