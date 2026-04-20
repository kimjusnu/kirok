import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'
import { getTestById } from '@temperament/tests'
import { scoreTest } from '@temperament/scoring'
import type { ItemResponse } from '@temperament/scoring'
import { interpretScores, formatInlineCitation } from '@temperament/ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const RequestSchema = z.object({ sessionId: z.string().uuid() })

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  const parsed = RequestSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }
  const { sessionId } = parsed.data

  const db = createServiceClient()

  const { data: session, error: sessionError } = await db
    .from('sessions')
    .select('id, completed_at, paid_at, expires_at, tests(id, slug)')
    .eq('id', sessionId)
    .maybeSingle()
  if (sessionError) {
    console.error('results/generate: session lookup failed', sessionError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  if (!session) return NextResponse.json({ error: 'session_not_found' }, { status: 404 })
  if (!session.completed_at)
    return NextResponse.json({ error: 'session_not_completed' }, { status: 409 })
  if (!session.paid_at)
    return NextResponse.json({ error: 'session_not_paid' }, { status: 402 })
  if (session.expires_at && new Date(session.expires_at).getTime() < Date.now())
    return NextResponse.json({ error: 'session_expired' }, { status: 410 })

  const testMeta = session.tests as unknown as { id: string; slug: string } | null
  if (!testMeta) {
    console.error('results/generate: missing test join', { sessionId })
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  const testDef = getTestById(testMeta.slug)
  if (!testDef) {
    return NextResponse.json({ error: 'test_not_supported' }, { status: 501 })
  }

  // Serve cached result if present — idempotent re-generation.
  const { data: cached } = await db
    .from('results')
    .select('raw_scores, percentiles, ai_interpretation, citations, generated_at')
    .eq('session_id', sessionId)
    .maybeSingle()
  if (cached?.ai_interpretation) {
    return NextResponse.json({
      cached: true,
      rawScores: cached.raw_scores,
      percentiles: cached.percentiles,
      interpretation: JSON.parse(cached.ai_interpretation),
      citations: cached.citations,
    })
  }

  // Load responses mapped to internal TestDefinition item ids.
  const { data: responses, error: responsesError } = await db
    .from('responses')
    .select('item_id, score, test_items(id, order_num)')
    .eq('session_id', sessionId)
  if (responsesError) {
    console.error('results/generate: responses lookup failed', responsesError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  if (!responses || responses.length === 0) {
    return NextResponse.json({ error: 'no_responses' }, { status: 409 })
  }

  // The in-memory test definition is indexed by `order_num` — map DB item_id → order.
  const orderByItemId = new Map<string, number>()
  for (const r of responses) {
    const ti = r.test_items as unknown as { id: string; order_num: number } | null
    if (ti) orderByItemId.set(ti.id, ti.order_num)
  }
  const itemResponses: ItemResponse[] = []
  for (const r of responses) {
    const order = orderByItemId.get(r.item_id)
    if (order == null) continue
    const defItem = testDef.items.find((i) => i.order === order)
    if (!defItem) continue
    itemResponses.push({ itemId: defItem.id, score: r.score })
  }

  const scoring = scoreTest(testDef, itemResponses)

  const interp = await interpretScores({ result: scoring, factors: testDef.factors })
  if (!interp.ok) {
    console.error('results/generate: interpretation failed', interp)
    return NextResponse.json(
      { error: 'interpretation_failed', stage: interp.stage, code: interp.code },
      { status: 502 },
    )
  }

  const rawScores: Record<string, number> = {}
  const percentiles: Record<string, number> = {}
  for (const f of scoring.factors) {
    rawScores[f.factorId] = f.rawMean
    percentiles[f.factorId] = f.percentile
  }

  const citationRecords = interp.bundle.citations.map((c) => ({
    factorId: c.factorId,
    papers: c.papers.map((p) => ({
      paperId: p.paperId,
      title: p.title,
      authors: p.authors,
      year: p.year,
      doi: p.doi,
      url: p.url,
      inline: formatInlineCitation(p),
    })),
  }))

  const { error: upsertError } = await db.from('results').upsert(
    {
      session_id: sessionId,
      raw_scores: rawScores,
      percentiles,
      ai_interpretation: JSON.stringify(interp.bundle.interpretation),
      citations: citationRecords,
      generated_at: new Date().toISOString(),
    },
    { onConflict: 'session_id' },
  )
  if (upsertError) {
    console.error('results/generate: upsert failed', upsertError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  return NextResponse.json({
    cached: false,
    rawScores,
    percentiles,
    interpretation: interp.bundle.interpretation,
    citations: citationRecords,
  })
}
