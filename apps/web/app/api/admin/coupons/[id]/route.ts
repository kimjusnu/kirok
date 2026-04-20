import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 쿠폰 하드 삭제 (관리자 전용).
 *
 * `coupon_redemptions.coupon_id`는 cascade가 아니므로 자식 레코드를 먼저
 * 정리한다. 이미 사용된 쿠폰을 지우면 해당 사용 기록도 함께 사라진다는
 * 점을 UI 확인 다이얼로그에서 안내할 것.
 *
 * 사용 이력 보존이 우선이면 삭제 대신 "비활성화"(toggle) 사용 권장.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const parsed = z.string().uuid().safeParse(params.id)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }
  const couponId = parsed.data
  const db = createServiceClient()

  try {
    const { error: redErr } = await db
      .from('coupon_redemptions')
      .delete()
      .eq('coupon_id', couponId)
    if (redErr) {
      console.error('admin/coupons/delete: redemptions cleanup failed', redErr)
      return NextResponse.json(
        {
          error: 'internal_error',
          stage: 'coupon_redemptions',
          message: redErr.message,
        },
        { status: 500 },
      )
    }

    const { error } = await db.from('coupons').delete().eq('id', couponId)
    if (error) {
      console.error('admin/coupons/delete: coupon delete failed', error)
      return NextResponse.json(
        { error: 'internal_error', stage: 'coupons', message: error.message },
        { status: 500 },
      )
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('admin/coupons/delete: unhandled', e)
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
