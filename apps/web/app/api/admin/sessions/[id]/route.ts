import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 세션 하드 삭제 (관리자 전용).
 *
 * 스키마 설계상 `payments.session_id`, `coupon_redemptions.session_id`는
 * ON DELETE CASCADE가 걸려 있지 않다 (감사 기록 목적). 관리자가 세션을
 * 완전히 지우려면 자식 레코드를 수동으로 먼저 제거해야 한다.
 *
 * 자동 cascade 되는 것:
 *   responses, results, participant_profiles (모두 0001~0003에서
 *   sessions(id) ON DELETE CASCADE).
 *
 * 수동으로 지워야 하는 것:
 *   payments, coupon_redemptions.
 *
 * 실패 시 각 단계를 개별 응답으로 보고해 UI에서 원인 확인 가능.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const parsed = z.string().uuid().safeParse(params.id)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }
  const sessionId = parsed.data
  const db = createServiceClient()

  try {
    // 1) payments 먼저 (no cascade).
    const { error: payErr } = await db
      .from('payments')
      .delete()
      .eq('session_id', sessionId)
    if (payErr) {
      console.error('admin/sessions/delete: payments cleanup failed', payErr)
      return NextResponse.json(
        { error: 'internal_error', stage: 'payments', message: payErr.message },
        { status: 500 },
      )
    }

    // 2) coupon_redemptions (no cascade).
    const { error: redErr } = await db
      .from('coupon_redemptions')
      .delete()
      .eq('session_id', sessionId)
    if (redErr) {
      console.error('admin/sessions/delete: redemptions cleanup failed', redErr)
      return NextResponse.json(
        {
          error: 'internal_error',
          stage: 'coupon_redemptions',
          message: redErr.message,
        },
        { status: 500 },
      )
    }

    // 3) sessions 본체 — responses/results/participant_profiles는 cascade.
    const { error: sessErr } = await db
      .from('sessions')
      .delete()
      .eq('id', sessionId)
    if (sessErr) {
      console.error('admin/sessions/delete: session delete failed', sessErr)
      return NextResponse.json(
        {
          error: 'internal_error',
          stage: 'sessions',
          message: sessErr.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('admin/sessions/delete: unhandled', e)
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
