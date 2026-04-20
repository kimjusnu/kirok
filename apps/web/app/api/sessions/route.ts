import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RequestSchema = z.object({
  testSlug: z.string().min(1).max(64),
})

function generateAccessToken(): string {
  return randomBytes(24).toString('base64url')
}

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

  const db = createServiceClient()

  const { data: test, error: testError } = await db
    .from('tests')
    .select('id, slug, is_active')
    .eq('slug', parsed.data.testSlug)
    .maybeSingle()
  if (testError) {
    console.error('sessions: test lookup failed', testError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  if (!test || !test.is_active) {
    return NextResponse.json({ error: 'test_not_available' }, { status: 404 })
  }

  const accessToken = generateAccessToken()

  const { data: session, error: insertError } = await db
    .from('sessions')
    .insert({
      test_id: test.id,
      access_token: accessToken,
    })
    .select('id, access_token')
    .single()
  if (insertError || !session) {
    console.error('sessions: insert failed', insertError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  return NextResponse.json({
    sessionId: session.id,
    accessToken: session.access_token,
  })
}
