import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Limit key surface to the Crockford-ish alphabet used in sessions/route.ts.
// Upper-case, no 0/O/1/I/L. Accept any length 6-16 to be forgiving of future
// widening; exact format is validated server-side.
const RequestSchema = z.object({
  key: z
    .string()
    .trim()
    .min(4)
    .max(24)
    .transform((v) => v.replace(/[\s-]/g, '').toUpperCase())
    .refine((v) => /^[A-Z0-9]+$/.test(v), 'invalid_format'),
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

  const db = createServiceClient()
  const { data: session, error } = await db
    .from('sessions')
    .select('access_token, paid_at, expires_at')
    .eq('report_key', parsed.data.key)
    .maybeSingle()

  if (error) {
    console.error('sessions/resolve: lookup failed', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  if (!session) {
    return NextResponse.json({ error: 'key_not_found' }, { status: 404 })
  }
  if (!session.paid_at) {
    return NextResponse.json({ error: 'not_paid' }, { status: 402 })
  }
  if (
    session.expires_at &&
    new Date(session.expires_at).getTime() < Date.now()
  ) {
    return NextResponse.json({ error: 'expired' }, { status: 410 })
  }

  return NextResponse.json({ accessToken: session.access_token })
}
