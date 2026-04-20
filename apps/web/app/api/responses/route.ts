import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'
import { getTestById } from '@temperament/tests'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RequestSchema = z.object({
  sessionId: z.string().uuid(),
  // Responses keyed by test item `order` (1-based). Kept small to avoid
  // client-side DB-uuid coupling; server resolves to actual item ids.
  responses: z
    .array(
      z.object({
        order: z.number().int().positive(),
        score: z.number().int().min(1).max(7),
      }),
    )
    .min(1)
    .max(500),
})

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
  const { sessionId, responses } = parsed.data

  const db = createServiceClient()

  const { data: session, error: sessionError } = await db
    .from('sessions')
    .select('id, test_id, completed_at, tests(slug)')
    .eq('id', sessionId)
    .maybeSingle()
  if (sessionError) {
    console.error('responses: session lookup failed', sessionError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  if (!session) return NextResponse.json({ error: 'session_not_found' }, { status: 404 })
  if (session.completed_at) {
    return NextResponse.json({ error: 'session_already_completed' }, { status: 409 })
  }

  const testMeta = session.tests as unknown as { slug: string } | null
  if (!testMeta) {
    console.error('responses: missing test join', { sessionId })
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  const testDef = getTestById(testMeta.slug)
  if (!testDef) {
    return NextResponse.json({ error: 'test_not_supported' }, { status: 501 })
  }

  // Reject partial submissions — we only accept a final, full-test batch.
  if (responses.length !== testDef.items.length) {
    return NextResponse.json(
      { error: 'incomplete_responses', expected: testDef.items.length },
      { status: 422 },
    )
  }

  const { data: items, error: itemsError } = await db
    .from('test_items')
    .select('id, order_num')
    .eq('test_id', session.test_id)
  if (itemsError || !items) {
    console.error('responses: items lookup failed', itemsError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  const itemIdByOrder = new Map<number, string>()
  for (const it of items) itemIdByOrder.set(it.order_num, it.id)

  const rows = responses.map((r) => {
    const itemId = itemIdByOrder.get(r.order)
    if (!itemId) throw new Error(`unknown_order_${r.order}`)
    return { session_id: sessionId, item_id: itemId, score: r.score }
  })

  const { error: insertError } = await db
    .from('responses')
    .upsert(rows, { onConflict: 'session_id,item_id' })
  if (insertError) {
    console.error('responses: insert failed', insertError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  const { error: completeError } = await db
    .from('sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (completeError) {
    console.error('responses: session complete failed', completeError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, count: rows.length })
}
