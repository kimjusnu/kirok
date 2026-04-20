import { NextResponse } from 'next/server'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

/**
 * 결제 페이지 드롭다운이 호출하는 익명 공개 쿠폰 리스트.
 * 관리자가 is_public=true로 명시한 활성 쿠폰만 반환한다.
 * 비공개 쿠폰(개인용 무료 코드 등)은 절대 노출되지 않음.
 *
 * 코드 단독으로는 결제 권한을 주지 않고, 실제 적용은 /api/coupons/validate
 * 에서 세션 컨텍스트와 함께 다시 검증된다.
 */
export async function GET() {
  const db = createServiceClient()
  const { data, error } = await db
    .from('coupons')
    .select('code, discount_type, discount_value, note, max_uses, used_count, expires_at')
    .eq('is_public', true)
    .eq('is_active', true)
    .order('discount_value', { ascending: false })

  if (error) {
    // 마이그레이션 0008 미적용(is_public 컬럼 부재) → 공개 쿠폰이 "없음"으로
    // 안전하게 폴백. 사용자는 "기타 쿠폰 직접 입력"으로 코드 입력해서 쓰면 됨.
    const code = (error as { code?: string }).code
    if (code === '42703' || code === 'PGRST204') {
      return NextResponse.json({ coupons: [] })
    }
    console.error('coupons/public: query failed', error)
    return NextResponse.json({ coupons: [] })
  }

  const now = Date.now()
  const coupons =
    (data ?? []).filter((c) => {
      if (c.expires_at && new Date(c.expires_at).getTime() < now) return false
      if (c.max_uses != null && c.used_count >= c.max_uses) return false
      return true
    }) ?? []

  return NextResponse.json({ coupons })
}
