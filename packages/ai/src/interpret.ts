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
}

export async function interpretScores(
  input: { result: ScoringResult; factors: FactorMeta[] },
  deps: InterpretDeps = {},
): Promise<
  | { ok: true; bundle: InterpretationBundle }
  | { ok: false; stage: 'gemini' | 'parse' | 'citations'; code: string; message: string }
> {
  const prompt = buildInterpretationPrompt(input)

  const gemini = await generateContent(
    { prompt },
    {
      apiKey: deps.geminiApiKey,
      model: deps.geminiModel,
      fetchImpl: deps.fetchImpl,
    },
  )
  if (!gemini.ok) {
    return { ok: false, stage: 'gemini', code: gemini.code, message: gemini.message }
  }

  const interpretation = parseInterpretation(gemini.text)
  if (!interpretation) {
    return {
      ok: false,
      stage: 'parse',
      code: 'INVALID_JSON',
      message: 'Gemini output did not match expected schema',
    }
  }

  const snapshots = factorSnapshots(input.result.factors, input.factors)
  const citations: FactorCitations[] = []
  for (const snap of snapshots) {
    const search = await searchPapers(
      { query: buildSemanticScholarQuery(snap), limit: deps.papersPerFactor ?? 3 },
      { fetchImpl: deps.fetchImpl },
    )
    if (!search.ok) {
      // Soft-fail citations: interpretation is still useful without papers.
      citations.push({ factorId: snap.id, papers: [] })
      continue
    }
    citations.push({ factorId: snap.id, papers: search.papers })
  }

  return {
    ok: true,
    bundle: { interpretation, citations },
  }
}
