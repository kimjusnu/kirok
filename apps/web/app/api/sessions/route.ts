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

type SessionInsertResult = {
  id: string
  access_token: string
  report_key: string | null
}

/**
 * Insert a new session row. Tries with `report_key` column first (migration
 * 0007). If the target environment hasn't applied 0007 yet, Postgres returns
 * error code 42703 ("undefined column") — we fall back to the legacy insert
 * without that column so the user-facing flow keeps working while the
 * operator runs the migration. Also retries up to 4 times on the astronomical
 * chance of a report_key collision (23505, unique_violation).
 */
async function insertSession(
  db: ReturnType<typeof createServiceClient>,
  testId: string,
  accessToken: string,
): Promise<
  | { ok: true; session: SessionInsertResult }
  | { ok: false; error: unknown; stage: 'report_key' | 'legacy' }
> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const reportKey = generateReportKey()
    const { data, error } = await db
      .from('sessions')
      .insert({
        test_id: testId,
        access_token: accessToken,
        report_key: reportKey,
      })
      .select('id, access_token, report_key')
      .single()

    if (!error && data) {
      return { ok: true, session: data }
    }

    const code = (error as { code?: string } | null)?.code
    if (code === '23505') continue // unique_violation on report_key → retry

    // Schema missing report_key column (migration 0007 pending) → fall back.
    if (code === '42703' || code === 'PGRST204') {
      const legacy = await db
        .from('sessions')
        .insert({ test_id: testId, access_token: accessToken })
        .select('id, access_token')
        .single()
      if (legacy.error || !legacy.data) {
        return { ok: false, error: legacy.error, stage: 'legacy' }
      }
      return {
        ok: true,
        session: { ...legacy.data, report_key: null },
      }
    }

    return { ok: false, error, stage: 'report_key' }
  }
  return {
    ok: false,
    error: new Error('report_key collision exhausted'),
    stage: 'report_key',
  }
}

export async function POST(request: Request) {
  // Top-level try/catch: guarantees a JSON response body on ANY unhandled
  // throw (env missing, Supabase init failure, etc.) instead of Vercel's
  // default empty 500 that breaks client-side `res.json()`.
  try {
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
      return NextResponse.json(
        { error: 'internal_error', stage: 'test_lookup' },
        { status: 500 },
      )
    }
    if (!test || !test.is_active) {
      return NextResponse.json({ error: 'test_not_available' }, { status: 404 })
    }

    const accessToken = generateAccessToken()
    const insert = await insertSession(db, test.id, accessToken)
    if (!insert.ok) {
      const err = insert.error as { code?: string; message?: string } | null
      console.error('sessions: insert failed', insert)
      return NextResponse.json(
        {
          error: 'internal_error',
          stage: `session_insert_${insert.stage}`,
          code: err?.code,
          message: err?.message,
        },
        { status: 500 },
      )
    }
    const session = insert.session

    const { error: profileError } = await db
      .from('participant_profiles')
      .insert({
        session_id: session.id,
        display_name: parsed.data.profile.displayName,
        gender: parsed.data.profile.gender,
        age_range: parsed.data.profile.ageRange,
      })
    if (profileError) {
      console.error('sessions: profile insert failed', profileError)
      // Roll back the orphaned session.
      await db.from('sessions').delete().eq('id', session.id)
      return NextResponse.json(
        {
          error: 'internal_error',
          stage: 'profile_insert',
          code: (profileError as { code?: string }).code,
          message: profileError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      sessionId: session.id,
      accessToken: session.access_token,
      reportKey: session.report_key,
    })
  } catch (e) {
    // Anything we didn't anticipate (env var missing, Supabase client init
    // failure, runtime quirk). Make sure the client always receives JSON so
    // the UI can show a meaningful message instead of "Unexpected end of
    // JSON input".
    console.error('sessions: unhandled error', e)
    return NextResponse.json(
      {
        error: 'internal_error',
        stage: 'unhandled',
        message: e instanceof Error ? e.message : 'unknown',
      },
      { status: 500 },
    )
  }
}
