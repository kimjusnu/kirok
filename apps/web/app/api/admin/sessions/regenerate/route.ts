import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const RequestSchema = z.object({ sessionId: z.string().uuid() })

/**
 * Clear the cached result row for a session, then call the public
 * /api/results/generate endpoint which re-scores + re-calls Gemini.
 */
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
  const { error: delError } = await db
    .from('results')
    .delete()
    .eq('session_id', sessionId)
  if (delError) {
    console.error('regenerate: delete failed', delError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  // Call the public results/generate on our own origin. Preserves idempotency
  // (generate upserts) and avoids duplicating its logic.
  const origin = new URL(request.url).origin
  const res = await fetch(`${origin}/api/results/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
    cache: 'no-store',
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    return NextResponse.json(
      { error: body.error ?? 'regenerate_failed', code: body.code },
      { status: res.status },
    )
  }
  return NextResponse.json({ ok: true })
}
