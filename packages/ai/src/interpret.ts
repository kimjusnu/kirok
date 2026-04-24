import type { ScoringResult } from '@temperament/scoring'
import type { FactorMeta } from '@temperament/tests'
import { buildInterpretationPrompt, buildSemanticScholarQuery, factorSnapshots } from './prompts'
import { generateContent, parseInterpretation, type Interpretation } from './gemini'
import { searchPapers, type CitationPaper } from './papers'

export interface FactorCitations {
  factorId: string
  papers: CitationPaper[]
}

export interface InterpretationBundle {
  interpretation: Interpretation
  citations: FactorCitations[]
}

export interface InterpretDeps {
  geminiApiKey?: string
  geminiModel?: string
  fetchImpl?: typeof fetch
  papersPerFactor?: number
  maxGeminiAttempts?: number
  /** Override the model fallback chain (for tests). */
  geminiModelChain?: string[]
}

// Ordered list of models we try. When the primary (2.5 Flash) is under heavy
// demand Google returns 503 UNAVAILABLE; `gemini-flash-latest` is an alias
// that usually routes to spare capacity, and 2.5-flash-lite is cheaper/faster
// and on a separate pool. (Note: gemini-1.5-flash is deprecated — 404.)
const DEFAULT_MODEL_CHAIN = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
]

// Errors that are worth retrying (transient server-side or content-mode hiccups)
// vs. ones where retrying only burns quota (bad key, malformed request).
const RETRYABLE_CODES = new Set([
  'UNAVAILABLE',
  'DEADLINE_EXCEEDED',
  'RESOURCE_EXHAUSTED',
  'INTERNAL',
  'NETWORK_ERROR',
  'EMPTY_RESPONSE',
  'HTTP_429',
  'HTTP_500',
  'HTTP_502',
  'HTTP_503',
  'HTTP_504',
])

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function interpretScores(
  input: { result: ScoringResult; factors: FactorMeta[] },
  deps: InterpretDeps = {},
): Promise<
  | { ok: true; bundle: InterpretationBundle }
  | { ok: false; stage: 'gemini' | 'parse' | 'citations'; code: string; message: string }
> {
  const snapshots = factorSnapshots(input.result.factors, input.factors)

  // Fetch papers FIRST so they can be woven into the prompt. Soft-fail per
  // factor: if OpenAlex misses, Gemini still has the other factors' papers.
  const citations: FactorCitations[] = []
  const papersByFactor: Record<string, CitationPaper[]> = {}
  for (const snap of snapshots) {
    const search = await searchPapers(
      { query: buildSemanticScholarQuery(snap), limit: deps.papersPerFactor ?? 3 },
      { fetchImpl: deps.fetchImpl },
    )
    const papers = search.ok ? search.papers : []
    citations.push({ factorId: snap.id, papers })
    papersByFactor[snap.id] = papers
  }

  const prompt = buildInterpretationPrompt({ ...input, papersByFactor })

  // Model fallback chain: try the preferred model first, then cheaper / older
  // ones if it's unavailable. Each attempt counts against maxGeminiAttempts.
  const chain: string[] = (() => {
    if (deps.geminiModelChain && deps.geminiModelChain.length > 0) {
      return [...deps.geminiModelChain]
    }
    if (deps.geminiModel) {
      // User pinned a model → honor it but still cascade to backups.
      return Array.from(new Set([deps.geminiModel, ...DEFAULT_MODEL_CHAIN]))
    }
    return DEFAULT_MODEL_CHAIN
  })()

  const maxAttempts = Math.max(1, deps.maxGeminiAttempts ?? chain.length + 1)

  let lastFailure: { stage: 'gemini' | 'parse'; code: string; message: string } = {
    stage: 'gemini',
    code: 'NO_ATTEMPT',
    message: 'no generation attempted',
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      // Backoff: 600ms, 1200ms, 2400ms — caps by maxAttempts.
      await sleep(600 * 2 ** Math.min(attempt - 1, 3))
    }
    const model = chain[Math.min(attempt, chain.length - 1)]!

    const gemini = await generateContent(
      // Deeper overall (8–10 sentences), richer per-factor (7–9),
      // plus the new lifeFit block (careers + hobbies + narrative).
      // 12288 leaves room for reasoning headroom while staying well within
      // the model's context budget.
      { prompt, maxOutputTokens: 12288, temperature: 0.6 },
      {
        apiKey: deps.geminiApiKey,
        model,
        fetchImpl: deps.fetchImpl,
      },
    )
    if (!gemini.ok) {
      lastFailure = { stage: 'gemini', code: gemini.code, message: gemini.message }
      if (!RETRYABLE_CODES.has(gemini.code)) break
      continue
    }
    const interpretation = parseInterpretation(gemini.text)
    if (!interpretation) {
      lastFailure = {
        stage: 'parse',
        code: 'INVALID_JSON',
        message: 'Gemini output did not match expected schema',
      }
      continue
    }
    return { ok: true, bundle: { interpretation, citations } }
  }

  return { ok: false, ...lastFailure }
}
