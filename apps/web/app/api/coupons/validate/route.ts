import { NextResponse } from 'next/server'
import { createServiceClient } from '@temperament/db'
import { CouponValidateRequest, calculateDiscount, previewCoupon } from '@temperament/payments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = CouponValidateRequest.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_request', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { code, sessionId } = parsed.data
  const db = createServiceClient()

  const { data: session, error: sessionError } = await db
    .from('sessions')
    .select('id, completed_at, paid_at, test_id, tests(price_krw)')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError) {
    console.error('coupons/validate: session lookup failed', sessionError)
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
    console.error('coupons/validate: missing test price', { sessionId })
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  const { data: coupon, error: couponError } = await db
    .from('coupons')
    .select('discount_type, discount_value, max_uses, used_count, expires_at, is_active')
    .eq('code', code)
    .maybeSingle()

  if (couponError) {
    console.error('coupons/validate: coupon lookup failed', couponError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  const preview = previewCoupon(coupon)
  if (preview.status !== 'valid') {
    return NextResponse.json({ valid: false, reason: preview.status }, { status: 200 })
  }

  const discount = calculateDiscount({
    basePriceKrw: priceKrw,
    discountType: preview.discountType!,
    discountValue: preview.discountValue!,
  })

  return NextResponse.json({
    valid: true,
    basePriceKrw: priceKrw,
    finalAmountKrw: discount.finalAmountKrw,
    discountAmountKrw: discount.discountAmountKrw,
    isFree: discount.isFree,
    discountType: preview.discountType,
  })
}
