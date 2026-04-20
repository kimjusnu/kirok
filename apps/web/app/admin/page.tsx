import Link from 'next/link'
import { createServiceClient } from '@temperament/db'
import { getAdminBasePath } from '@/lib/admin-path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Gender = 'male' | 'female' | 'other' | 'prefer_not'
type AgeRange = 'teens' | '20s' | '30s' | '40s' | '50s' | '60_plus' | 'prefer_not'

const GENDER_ORDER: Gender[] = ['male', 'female', 'other', 'prefer_not']
const AGE_ORDER: AgeRange[] = ['teens', '20s', '30s', '40s', '50s', '60_plus', 'prefer_not']
const GENDER_LABEL: Record<Gender, string> = {
  male: '남성',
  female: '여성',
  other: '기타',
  prefer_not: '미응답',
}
const AGE_LABEL: Record<AgeRange, string> = {
  teens: '10대',
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60_plus': '60+',
  prefer_not: '미응답',
}

async function loadStats() {
  const db = createServiceClient()

  const [allSessions, completed, paid, profiles] = await Promise.all([
    db.from('sessions').select('id', { count: 'exact', head: true }),
    db
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .not('completed_at', 'is', null),
    db
      .from('sessions')
      .select('id, payment_amount', { count: 'exact' })
      .not('paid_at', 'is', null),
    db
      .from('participant_profiles')
      .select('gender, age_range'),
  ])

  const totalSessions = allSessions.count ?? 0
  const totalCompleted = completed.count ?? 0
  const paidRows = paid.data ?? []
  const totalPaid = paid.count ?? 0
  const revenue = paidRows.reduce((sum, r) => sum + (r.payment_amount ?? 0), 0)

  // Demographics — aggregate in-process.
  const profileRows = (profiles.data ?? []) as Array<{ gender: Gender; age_range: AgeRange }>
  const byGender: Record<Gender, number> = { male: 0, female: 0, other: 0, prefer_not: 0 }
  const byAge: Record<AgeRange, number> = {
    teens: 0,
    '20s': 0,
    '30s': 0,
    '40s': 0,
    '50s': 0,
    '60_plus': 0,
    prefer_not: 0,
  }
  for (const p of profileRows) {
    byGender[p.gender] = (byGender[p.gender] ?? 0) + 1
    byAge[p.age_range] = (byAge[p.age_range] ?? 0) + 1
  }

  return {
    totalSessions,
    totalCompleted,
    totalPaid,
    revenue,
    completionRate: totalSessions > 0 ? totalCompleted / totalSessions : 0,
    conversionRate: totalCompleted > 0 ? totalPaid / totalCompleted : 0,
    totalProfiles: profileRows.length,
    byGender,
    byAge,
  }
}

export default async function AdminDashboardPage() {
  const base = getAdminBasePath()
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

        <section className="mt-16">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Demographics · {stats.totalProfiles.toLocaleString()} participants
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10">
            <BreakdownBars
              title="성별 분포"
              total={stats.totalProfiles}
              rows={GENDER_ORDER.map((g) => ({
                label: GENDER_LABEL[g],
                value: stats.byGender[g],
              }))}
            />
            <BreakdownBars
              title="나이대 분포"
              total={stats.totalProfiles}
              rows={AGE_ORDER.map((a) => ({
                label: AGE_LABEL[a],
                value: stats.byAge[a],
              }))}
            />
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Link
            href={`${base}/sessions`}
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
            href={`${base}/coupons`}
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

function BreakdownBars({
  title,
  total,
  rows,
}: {
  title: string
  total: number
  rows: Array<{ label: string; value: number }>
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-4 space-y-2.5">
        {rows.map((r) => {
          const pct = total > 0 ? (r.value / total) * 100 : 0
          return (
            <div key={r.label} className="flex items-center gap-3 text-xs">
              <div className="w-14 text-[var(--ink-muted)]">{r.label}</div>
              <div className="flex-1 h-4 bg-[var(--line-soft)] relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--ink)]"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              </div>
              <div className="w-20 text-right font-mono">
                {r.value.toLocaleString()}{' '}
                <span className="text-[var(--ink-soft)]">
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
          )
        })}
        {total === 0 && (
          <p className="text-xs text-[var(--ink-soft)]">아직 참여자가 없어요.</p>
        )}
      </div>
    </div>
  )
}
