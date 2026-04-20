import { NextResponse } from 'next/server'
import { createServiceClient } from '@temperament/db'
import type { DiscountType } from '@temperament/db'
import {
  PaymentReadyRequest,
  readyKakaoPayment,
  calculateDiscount,
} from '@temperament/payments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function siteUrl(request: Request): string {
  // Prefer explicit env so callback URLs are stable across previews / prod.
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (env) return env.replace(/\/+$/, '')
  const h = new URL(request.url)
  return `${h.protocol}//${h.host}`
}

function cid(): string {
  return process.env.KAKAO_PAY_CID ?? 'TC0ONETIME'
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = PaymentReadyRequest.safeParse(payload)
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
    .select('id, completed_at, paid_at, tests(slug, name_ko, price_krw)')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError) {
    console.error('payments/ready: session lookup failed', sessionError)
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

  const test = session.tests as unknown as {
    slug: string
    name_ko: string
    price_krw: number
  } | null
  if (!test) {
    console.error('payments/ready: missing test meta', { sessionId })
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  // Determine final amount, optionally discounted.
  let finalAmount = test.price_krw
  if (couponCode) {
    const { data: coupon, error: couponError } = await db
      .from('coupons')
      .select('discount_type, discount_value, is_active, expires_at, max_uses, used_count')
      .eq('code', couponCode)
      .eq('is_active', true)
      .maybeSingle()

    if (couponError) {
      console.error('payments/ready: coupon lookup failed', couponError)
      return NextResponse.json({ error: 'internal_error' }, { status: 500 })
    }
    if (!coupon) {
      return NextResponse.json({ error: 'coupon_invalid', reason: 'not_found' }, { status: 409 })
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'coupon_invalid', reason: 'expired' }, { status: 409 })
    }
    if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'coupon_invalid', reason: 'exhausted' }, { status: 409 })
    }

    const discount = calculateDiscount({
      basePriceKrw: test.price_krw,
      discountType: coupon.discount_type as DiscountType,
      discountValue: coupon.discount_value,
    })
    if (discount.isFree) {
      // Free coupons go through /api/payments/free to atomically redeem.
      return NextResponse.json(
        { error: 'use_free_endpoint_for_free_coupon' },
        { status: 409 },
      )
    }
    finalAmount = discount.finalAmountKrw
  }

  // Kakao requires total_amount >= 1.
  if (finalAmount < 1) {
    return NextResponse.json({ error: 'amount_too_small' }, { status: 409 })
  }

  const orderId = `kirok_${sessionId.replace(/-/g, '').slice(0, 12)}_${Date.now()}`
  const origin = siteUrl(request)
  // Preserve sessionId + orderId (+ coupon) on the approval callback so the
  // success page can call /approve with enough context. Kakao appends
  // ?pg_token=... to whatever URL we provide, preserving our query.
  const couponQuery = couponCode ? `&c=${encodeURIComponent(couponCode)}` : ''
  const baseCb = `${origin}/test/${test.slug}/pay`
  const approvalUrl = `${baseCb}/success?sid=${sessionId}&oid=${encodeURIComponent(orderId)}${couponQuery}`
  const cancelUrl = `${baseCb}/fail?sid=${sessionId}&reason=cancel`
  const failUrl = `${baseCb}/fail?sid=${sessionId}&reason=fail`

  const kakao = await readyKakaoPayment({
    cid: cid(),
    partnerOrderId: orderId,
    partnerUserId: sessionId,
    itemName: `${test.name_ko} 리포트`,
    quantity: 1,
    totalAmount: finalAmount,
    taxFreeAmount: 0,
    approvalUrl,
    cancelUrl,
    failUrl,
  })

  if (!kakao.ok) {
    console.error('payments/ready: kakao ready failed', kakao)
    return NextResponse.json(
      { error: 'kakao_ready_failed', code: kakao.code, message: kakao.message },
      { status: 502 },
    )
  }

  // Record pending payment so approve can locate it and failures are tracked.
  const { error: insertError } = await db.from('payments').insert({
    session_id: sessionId,
    provider: 'kakao',
    provider_order_id: orderId,
    provider_payment_key: kakao.tid,
    amount: finalAmount,
    status: 'pending',
    raw_response: kakao.raw as never,
  })

  if (insertError) {
    console.error('payments/ready: pending insert failed', insertError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    tid: kakao.tid,
    orderId,
    amount: finalAmount,
    redirectPcUrl: kakao.nextRedirectPcUrl,
    redirectMobileUrl: kakao.nextRedirectMobileUrl,
    redirectAppUrl: kakao.nextRedirectAppUrl,
  })
}
