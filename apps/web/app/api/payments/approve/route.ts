import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'
import { approveKakaoPayment } from '@temperament/payments'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REPORT_VALID_DAYS = 7

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

const ApproveRequest = z.object({
  sessionId: z.string().uuid(),
  orderId: z.string().min(1),
  pgToken: z.string().min(1),
  // Optional coupon code carried through approval_url as context.
  couponCode: z.string().min(1).optional(),
})

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

  const parsed = ApproveRequest.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_request', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { sessionId, orderId, pgToken, couponCode } = parsed.data
  const db = createServiceClient()

  const { data: session, error: sessionError } = await db
    .from('sessions')
    .select('id, access_token, completed_at, paid_at')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError) {
    console.error('payments/approve: session lookup failed', sessionError)
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

  // Locate the pending payment row that matches this order.
  const { data: pending, error: pendingError } = await db
    .from('payments')
    .select('id, provider, provider_payment_key, amount, status')
    .eq('session_id', sessionId)
    .eq('provider_order_id', orderId)
    .eq('provider', 'kakao')
    .eq('status', 'pending')
    .maybeSingle()

  if (pendingError) {
    console.error('payments/approve: pending lookup failed', pendingError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  if (!pending || !pending.provider_payment_key) {
    return NextResponse.json({ error: 'pending_payment_not_found' }, { status: 404 })
  }

  const kakao = await approveKakaoPayment({
    cid: cid(),
    tid: pending.provider_payment_key,
    partnerOrderId: orderId,
    partnerUserId: sessionId,
    pgToken,
  })

  if (!kakao.ok) {
    await db
      .from('payments')
      .update({
        status: 'failed',
        raw_response: kakao.raw as never,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pending.id)
    return NextResponse.json(
      { error: 'kakao_approve_failed', code: kakao.code, message: kakao.message },
      { status: 402 },
    )
  }

  // Guard: Kakao-reported total must match what we recorded at ready time.
  if (kakao.totalAmount !== pending.amount) {
    await db
      .from('payments')
      .update({
        status: 'failed',
        raw_response: kakao.raw as never,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pending.id)
    return NextResponse.json({ error: 'kakao_amount_mismatch' }, { status: 409 })
  }

  const now = new Date()
  const expiresAt = addDays(now, REPORT_VALID_DAYS)

  const { error: paymentUpdateError } = await db
    .from('payments')
    .update({
      status: 'completed',
      raw_response: kakao.raw as never,
      updated_at: now.toISOString(),
    })
    .eq('id', pending.id)

  if (paymentUpdateError) {
    console.error('payments/approve: payment update failed', paymentUpdateError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  const sessionUpdate: {
    paid_at: string
    payment_amount: number
    expires_at: string
    coupon_code?: string
  } = {
    paid_at: now.toISOString(),
    payment_amount: pending.amount,
    expires_at: expiresAt.toISOString(),
  }
  if (couponCode) sessionUpdate.coupon_code = couponCode

  const { error: sessionUpdateError } = await db
    .from('sessions')
    .update(sessionUpdate)
    .eq('id', sessionId)

  if (sessionUpdateError) {
    console.error('payments/approve: session update failed', sessionUpdateError)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    accessToken: session.access_token,
    expiresAt: expiresAt.toISOString(),
    amountKrw: pending.amount,
  })
}
