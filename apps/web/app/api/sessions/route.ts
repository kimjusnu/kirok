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

// Crockford-style alphabet: no 0/O, 1/I/L — reduces misreads when users type
// the key back in on the "이전 검사 보기" form.
const REPORT_KEY_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const REPORT_KEY_LENGTH = 8

function generateReportKey(): string {
  const bytes = randomBytes(REPORT_KEY_LENGTH)
  let out = ''
  for (let i = 0; i < REPORT_KEY_LENGTH; i++) {
    out += REPORT_KEY_ALPHABET[bytes[i]! % REPORT_KEY_ALPHABET.length]
  }
  return out
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

  // Retry on the extremely rare report_key collision — 31^8 ≈ 8.5e11 space,
  // but we still guard so users never see a 500 for this.
  let session: { id: string; access_token: string; report_key: string | null } | null = null
  let insertError: unknown = null
  for (let attempt = 0; attempt < 5 && !session; attempt++) {
    const reportKey = generateReportKey()
    const result = await db
      .from('sessions')
      .insert({
        test_id: test.id,
        access_token: accessToken,
        report_key: reportKey,
      })
      .select('id, access_token, report_key')
      .single()
    if (result.error) {
      insertError = result.error
      const code = (result.error as { code?: string }).code
      if (code === '23505') continue // unique violation → retry with new key
      break
    }
    session = result.data
  }
  if (!session) {
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
    reportKey: session.report_key,
  })
}
