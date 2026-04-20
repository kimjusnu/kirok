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

type CouponListRow = {
  id: string
  code: string
  discount_type: 'free' | 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
  is_public: boolean
  note: string | null
  created_at: string
}

export default async function AdminCouponsPage() {
  noStore()
  const base = getAdminBasePath()
  const db = createServiceClient()

  // 마이그레이션 0008이 아직 프로덕션에 적용 안 된 경우 is_public 컬럼
  // 부재로 `42703` 에러가 난다. 운영 흐름이 끊기지 않게, 레거시 스키마로
  // 폴백해서 리스트를 보여 주되 "공개" 컬럼은 전부 false로 처리.
  let rows: CouponListRow[] = []
  let migrationPending = false
  const fullSelect = await db
    .from('coupons')
    .select(
      'id, code, discount_type, discount_value, max_uses, used_count, expires_at, is_active, is_public, note, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (fullSelect.error) {
    const code = (fullSelect.error as { code?: string }).code
    if (code === '42703' || code === 'PGRST204') {
      migrationPending = true
      const legacy = await db
        .from('coupons')
        .select(
          'id, code, discount_type, discount_value, max_uses, used_count, expires_at, is_active, note, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(200)
      if (legacy.error) {
        return (
          <main>
            <div className="max-w-5xl mx-auto px-6 py-12">
              <p className="text-sm text-red-600">
                불러오기 실패: {legacy.error.message}
              </p>
            </div>
          </main>
        )
      }
      rows = (legacy.data ?? []).map((c) => ({ ...c, is_public: false })) as CouponListRow[]
    } else {
      return (
        <main>
          <div className="max-w-5xl mx-auto px-6 py-12">
            <p className="text-sm text-red-600">
              불러오기 실패: {fullSelect.error.message}
            </p>
          </div>
        </main>
      )
    }
  } else {
    rows = (fullSelect.data ?? []) as CouponListRow[]
  }

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

        {migrationPending && (
          <div className="mt-6 border border-yellow-600/40 bg-yellow-50 px-4 py-3 text-[13px]">
            <p className="font-medium">
              마이그레이션 0008_coupon_public_flag.sql 미적용
            </p>
            <p className="mt-1 text-[12px] text-[var(--ink-muted)] leading-relaxed">
              <code className="font-mono">coupons.is_public</code> 컬럼이 DB에
              없어서 공개/비공개 토글이 작동하지 않습니다. 모든 쿠폰은
              일시적으로 "비공개"로 표시됩니다. Supabase SQL Editor에서 아래 2줄
              실행 후 새로고침하세요:
            </p>
            <pre className="mt-2 text-[11px] font-mono bg-white px-3 py-2 border border-yellow-600/30 overflow-x-auto">
              {`alter table public.coupons add column is_public boolean not null default false;
update public.coupons set is_public = true where code = 'LAUNCH1500';`}
            </pre>
          </div>
        )}

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
