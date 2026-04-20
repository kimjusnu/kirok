import Link from 'next/link'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function fmt(s: string | null | undefined): string {
  if (!s) return '—'
  return new Date(s).toLocaleString('ko-KR')
}

const TYPE_LABEL: Record<string, string> = {
  free: '무료',
  percent: '퍼센트',
  fixed: '정액',
}

export default async function AdminCouponsPage() {
  const db = createServiceClient()
  const { data, error } = await db
    .from('coupons')
    .select('id, code, discount_type, discount_value, max_uses, used_count, expires_at, is_active, note, created_at')
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
            href="/admin/coupons/new"
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
                <th className="text-left font-normal py-3">메모</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-sm text-[var(--ink-soft)]"
                  >
                    아직 쿠폰이 없어요.{' '}
                    <Link href="/admin/coupons/new" className="link-underline">
                      첫 쿠폰 만들기
                    </Link>
                  </td>
                </tr>
              )}
              {rows.map((c) => {
                const usage = c.max_uses != null
                  ? `${c.used_count} / ${c.max_uses}`
                  : `${c.used_count}`
                const expired = c.expires_at && new Date(c.expires_at) < new Date()
                const state = !c.is_active ? '비활성' : expired ? '만료' : '활성'
                const stateClass = !c.is_active
                  ? 'text-[var(--ink-soft)]'
                  : expired
                    ? 'text-yellow-700'
                    : 'text-[var(--accent)]'
                return (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--line-soft)] hover:bg-[var(--line-soft)] transition"
                  >
                    <td className="py-3 font-mono tracking-wide">{c.code}</td>
                    <td className="py-3 text-xs">{TYPE_LABEL[c.discount_type] ?? c.discount_type}</td>
                    <td className="py-3 text-right font-mono text-xs">
                      {c.discount_type === 'free'
                        ? '—'
                        : c.discount_type === 'percent'
                          ? `${c.discount_value}%`
                          : `${c.discount_value.toLocaleString()}원`}
                    </td>
                    <td className="py-3 text-right font-mono text-xs">{usage}</td>
                    <td className="py-3 font-mono text-xs text-[var(--ink-muted)]">
                      {fmt(c.expires_at)}
                    </td>
                    <td className={`py-3 text-xs ${stateClass}`}>{state}</td>
                    <td className="py-3 text-xs text-[var(--ink-muted)] truncate max-w-[220px]">
                      {c.note ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
