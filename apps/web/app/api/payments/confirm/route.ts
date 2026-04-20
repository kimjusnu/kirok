import { NextResponse } from 'next/server'
import { createServiceClient } from '@temperament/db'
import { PaymentConfirmRequest, confirmTossPayment } from '@temperament/payments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REPORT_VALID_DAYS = 7

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = PaymentConfirmRequest.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_request', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { paymentKey, orderId, amount, sessionId } = parsed.data
  const db = createServiceClient()

  const { data: session, error: sessionError } = await db
    .from('sessions')
    .select('id, access_token, completed_at, paid_at, tests(price_krw)')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError) {
    console.error('payments/confirm: session lookup failed', sessionError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  if (!session) {
    return NextResponse.json({ error: 'session_not_found' }, { status: 404 })
  }
  if (!session.completed_at) {
    return NextResponse.json({ error: 'session_not_completed' }, { status: 409 })
  }
  if (session.paid_at) {
    return NextResponse.json({ error: 'session_already_paid' }, { status: 409 })
  }

  const expectedAmount = (session.tests as unknown as { price_krw: number } | null)?.price_krw
  if (expectedAmount == null) {
    console.error('payments/confirm: missing test price', { sessionId })
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  // Client-submitted amount must match the server-side expected price.
  // (Toss will confirm whatever amount we send — trusting client alone is unsafe.)
  if (amount !== expectedAmount) {
    return NextResponse.json({ error: 'amount_mismatch', expected: expectedAmount }, { status: 409 })
  }

  // Record pending payment row first so we can track failures too.
  const { data: pending, error: pendingError } = await db
    .from('payments')
    .insert({
      session_id: sessionId,
      toss_order_id: orderId,
      amount,
      status: 'pending',
    })
    .select('id')
    .single()

  if (pendingError || !pending) {
    console.error('payments/confirm: pending insert failed', pendingError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  const tossResult = await confirmTossPayment({ paymentKey, orderId, amount })

  if (!tossResult.ok) {
    await db
      .from('payments')
      .update({
        status: 'failed',
        raw_response: tossResult.raw as never,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pending.id)
    return NextResponse.json(
      { error: 'toss_confirm_failed', code: tossResult.code, message: tossResult.message },
      { status: 402 },
    )
  }

  // Re-check that Toss reported the same amount we expected.
  if (tossResult.totalAmount !== expectedAmount) {
    await db
      .from('payments')
      .update({
        status: 'failed',
        raw_response: tossResult.raw as never,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pending.id)
    return NextResponse.json({ error: 'toss_amount_mismatch' }, { status: 409 })
  }

  const now = new Date()
  const expiresAt = addDays(now, REPORT_VALID_DAYS)

  const { error: paymentUpdateError } = await db
    .from('payments')
    .update({
      status: 'completed',
      toss_payment_key: tossResult.paymentKey,
      raw_response: tossResult.raw as never,
      updated_at: now.toISOString(),
    })
    .eq('id', pending.id)

  if (paymentUpdateError) {
    console.error('payments/confirm: payment update failed', paymentUpdateError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  const { error: sessionUpdateError } = await db
    .from('sessions')
    .update({
      paid_at: now.toISOString(),
      payment_amount: amount,
      expires_at: expiresAt.toISOString(),
    })
    .eq('id', sessionId)

  if (sessionUpdateError) {
    console.error('payments/confirm: session update failed', sessionUpdateError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    accessToken: session.access_token,
    expiresAt: expiresAt.toISOString(),
    amountKrw: amount,
  })
}
