import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  gender: z.enum(['male', 'female', 'other', 'prefer_not']),
  ageRange: z.enum(['teens', '20s', '30s', '40s', '50s', '60_plus', 'prefer_not']),
})

const RequestSchema = z.object({
  testSlug: z.string().min(1).max(64),
  profile: ProfileSchema,
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

  const { error: profileError } = await db.from('participant_profiles').insert({
    session_id: session.id,
    display_name: parsed.data.profile.displayName,
    gender: parsed.data.profile.gender,
    age_range: parsed.data.profile.ageRange,
  })
  if (profileError) {
    console.error('sessions: profile insert failed', profileError)
    // Roll back session so we don't leave it orphaned.
    await db.from('sessions').delete().eq('id', session.id)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  return NextResponse.json({
    sessionId: session.id,
    accessToken: session.access_token,
  })
}
