import { NextResponse } from 'next/server'
import { createServiceClient } from '@temperament/db'
import type { UseCouponResult } from '@temperament/db'
import { PaymentFreeRequest, calculateDiscount } from '@temperament/payments'

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

  const parsed = PaymentFreeRequest.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_request', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { sessionId, couponCode } = parsed.data
  const db = createServiceClient()

  const { data: session, error: sessionError } = await db
    .from('sessions')
    .select('id, access_token, completed_at, paid_at, tests(price_krw)')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError) {
    console.error('payments/free: session lookup failed', sessionError)
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

  const priceKrw = (session.tests as unknown as { price_krw: number } | null)?.price_krw
  if (priceKrw == null) {
    console.error('payments/free: missing test price', { sessionId })
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  // Atomically redeem coupon (also records redemption, increments used_count).
  const { data: redeemRaw, error: redeemError } = await db.rpc('use_coupon', {
    p_code: couponCode,
    p_session_id: sessionId,
  })
  if (redeemError) {
    console.error('payments/free: use_coupon RPC failed', redeemError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  const redeem = redeemRaw as unknown as UseCouponResult
  if (!redeem?.ok) {
    return NextResponse.json(
      { error: 'coupon_invalid', reason: redeem?.error ?? 'unknown' },
      { status: 409 },
    )
  }

  // Free path only accepts coupons that reduce price to 0.
  const discount = calculateDiscount({
    basePriceKrw: priceKrw,
    discountType: redeem.discount_type,
    discountValue: redeem.discount_value,
  })
  if (!discount.isFree) {
    return NextResponse.json(
      { error: 'coupon_not_free', finalAmountKrw: discount.finalAmountKrw },
      { status: 409 },
    )
  }

  const now = new Date()
  const expiresAt = addDays(now, REPORT_VALID_DAYS)

  const { error: updateError } = await db
    .from('sessions')
    .update({
      paid_at: now.toISOString(),
      payment_amount: 0,
      coupon_code: couponCode,
      expires_at: expiresAt.toISOString(),
    })
    .eq('id', sessionId)

  if (updateError) {
    console.error('payments/free: session update failed', updateError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    accessToken: session.access_token,
    expiresAt: expiresAt.toISOString(),
    amountKrw: 0,
  })
}
