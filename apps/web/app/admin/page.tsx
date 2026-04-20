import Link from 'next/link'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function loadStats() {
  const db = createServiceClient()

  const [allSessions, completed, paid] = await Promise.all([
    db.from('sessions').select('id', { count: 'exact', head: true }),
    db
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .not('completed_at', 'is', null),
    db
      .from('sessions')
      .select('id, payment_amount', { count: 'exact' })
      .not('paid_at', 'is', null),
  ])

  const totalSessions = allSessions.count ?? 0
  const totalCompleted = completed.count ?? 0
  const paidRows = paid.data ?? []
  const totalPaid = paid.count ?? 0
  const revenue = paidRows.reduce((sum, r) => sum + (r.payment_amount ?? 0), 0)

  return {
    totalSessions,
    totalCompleted,
    totalPaid,
    revenue,
    completionRate: totalSessions > 0 ? totalCompleted / totalSessions : 0,
    conversionRate: totalCompleted > 0 ? totalPaid / totalCompleted : 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await loadStats()

  return (
    <main>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Overview
        </p>
        <h1 className="mt-3 text-2xl font-semibold">대시보드</h1>

        <section className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-0 border-y border-[var(--line)]">
          <Stat label="총 세션" value={stats.totalSessions.toLocaleString()} />
          <Stat
            label="검사 완료"
            value={stats.totalCompleted.toLocaleString()}
            hint={`${(stats.completionRate * 100).toFixed(0)}%`}
          />
          <Stat
            label="결제 완료"
            value={stats.totalPaid.toLocaleString()}
            hint={`${(stats.conversionRate * 100).toFixed(0)}%`}
          />
          <Stat
            label="총 매출"
            value={`${stats.revenue.toLocaleString()}원`}
          />
        </section>

        <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Link
            href="/admin/sessions"
            className="block border border-[var(--line)] p-6 hover:border-[var(--ink)] transition"
          >
            <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              Sessions
            </div>
            <div className="mt-2 text-lg font-semibold">세션 목록</div>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              참여자 정보·점수·결제 상태·리포트 열람
            </p>
          </Link>
          <Link
            href="/admin/coupons"
            className="block border border-[var(--line)] p-6 hover:border-[var(--ink)] transition"
          >
            <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              Coupons
            </div>
            <div className="mt-2 text-lg font-semibold">쿠폰 관리</div>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              무료·할인 쿠폰 발급 및 사용 현황
            </p>
          </Link>
        </section>
      </div>
    </main>
  )
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="py-6 px-4 border-r border-[var(--line)] last:border-r-0">
      <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-[var(--ink-soft)]">{hint}</div>}
    </div>
  )
}
