import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { createServiceClient } from '@temperament/db'
import { getAdminBasePath } from '@/lib/admin-path'
import { CouponRow } from './CouponRow'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// `dynamic = force-dynamic`만으로는 Supabase 내부 fetch가 Next.js의 Data Cache
// 레이어에 잡히는 경우가 있다(특히 Vercel 프로덕션 + 미들웨어 rewrite 조합).
// noStore()를 명시적으로 호출해 모든 캐싱 레이어를 opt-out.
export const fetchCache = 'force-no-store'

const TYPE_LABEL: Record<string, string> = {
  free: '무료',
  percent: '퍼센트',
  fixed: '정액',
}

function fmt(s: string | null | undefined): string {
  if (!s) return '—'
  return new Date(s).toLocaleString('ko-KR')
}

export default async function AdminCouponsPage() {
  noStore()
  const base = getAdminBasePath()
  const db = createServiceClient()
  const { data, error } = await db
    .from('coupons')
    .select(
      'id, code, discount_type, discount_value, max_uses, used_count, expires_at, is_active, is_public, note, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <main>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-sm text-red-600">불러오기 실패: {error.message}</p>
        </div>
      </main>
    )
  }
  const rows = data ?? []

  return (
    <main>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              Coupons
            </p>
            <h1 className="mt-3 text-2xl font-semibold">쿠폰</h1>
          </div>
          <Link
            href={`${base}/coupons/new`}
            className="px-4 py-2 bg-[var(--ink)] text-white text-sm font-medium rounded-sm"
          >
            + 새 쿠폰
          </Link>
        </div>

        <div className="mt-10 border-t border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)] border-b border-[var(--line)]">
                <th className="text-left font-normal py-3">코드</th>
                <th className="text-left font-normal py-3">유형</th>
                <th className="text-right font-normal py-3">값</th>
                <th className="text-right font-normal py-3">사용</th>
                <th className="text-left font-normal py-3">만료</th>
                <th className="text-left font-normal py-3">상태</th>
                <th className="text-left font-normal py-3">공개</th>
                <th className="text-left font-normal py-3">메모</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-10 text-center text-sm text-[var(--ink-soft)]"
                  >
                    아직 쿠폰이 없어요.{' '}
                    <Link href={`${base}/coupons/new`} className="link-underline">
                      첫 쿠폰 만들기
                    </Link>
                  </td>
                </tr>
              )}
              {rows.map((c) => {
                const expired = c.expires_at && new Date(c.expires_at) < new Date()
                const usage = c.max_uses != null
                  ? `${c.used_count} / ${c.max_uses}`
                  : `${c.used_count}`
                return (
                  <CouponRow
                    key={c.id}
                    id={c.id}
                    code={c.code}
                    typeLabel={TYPE_LABEL[c.discount_type] ?? c.discount_type}
                    valueLabel={
                      c.discount_type === 'free'
                        ? '—'
                        : c.discount_type === 'percent'
                          ? `${c.discount_value}%`
                          : `${c.discount_value.toLocaleString()}원`
                    }
                    usage={usage}
                    expires={fmt(c.expires_at)}
                    expired={Boolean(expired)}
                    isActive={c.is_active}
                    isPublic={c.is_public}
                    note={c.note}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
