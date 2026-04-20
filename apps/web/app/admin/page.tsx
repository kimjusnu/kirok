import Link from 'next/link'
import { createServiceClient } from '@temperament/db'
import { getAdminBasePath } from '@/lib/admin-path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Gender = 'male' | 'female' | 'other' | 'prefer_not'
type AgeRange =
  | 'teens'
  | '20s'
  | '30s'
  | '40s'
  | '50s'
  | '60_plus'
  | 'prefer_not'

const GENDER_ORDER: Gender[] = ['male', 'female', 'other', 'prefer_not']
const AGE_ORDER: AgeRange[] = [
  'teens',
  '20s',
  '30s',
  '40s',
  '50s',
  '60_plus',
  'prefer_not',
]
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

const DAY_MS = 24 * 60 * 60 * 1000
const KST_OFFSET_MS = 9 * 60 * 60 * 1000

function kstDateKey(ts: string | Date): string {
  const d = typeof ts === 'string' ? new Date(ts) : ts
  return new Date(d.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10)
}

type SessionRow = {
  id: string
  started_at: string
  completed_at: string | null
  paid_at: string | null
  payment_amount: number | null
  coupon_code: string | null
}

type Bucket = { sessions: number; completed: number; paid: number; revenue: number }

function emptyBucket(): Bucket {
  return { sessions: 0, completed: 0, paid: 0, revenue: 0 }
}

async function loadStats() {
  const db = createServiceClient()
  const [sessionsResp, profiles] = await Promise.all([
    db
      .from('sessions')
      .select(
        'id, started_at, completed_at, paid_at, payment_amount, coupon_code',
      )
      .order('started_at', { ascending: false })
      .limit(10000),
    db.from('participant_profiles').select('gender, age_range'),
  ])

  if (sessionsResp.error) {
    throw new Error(`dashboard load failed: ${sessionsResp.error.message}`)
  }
  const sessions = (sessionsResp.data ?? []) as SessionRow[]

  const now = Date.now()
  const cutoffDay = now - DAY_MS
  const cutoff7 = now - 7 * DAY_MS
  const cutoff30 = now - 30 * DAY_MS

  const all = emptyBucket()
  const day = emptyBucket()
  const week = emptyBucket()
  const month = emptyBucket()

  // 7-day rolling window keyed by KST date.
  const dayKeys: string[] = []
  const byDay = new Map<string, number>()
  for (let i = 6; i >= 0; i--) {
    const k = kstDateKey(new Date(now - i * DAY_MS))
    dayKeys.push(k)
    byDay.set(k, 0)
  }

  const durationsMs: number[] = []
  let couponPaid = 0

  for (const s of sessions) {
    const startedTs = new Date(s.started_at).getTime()
    all.sessions++
    if (s.completed_at) all.completed++
    if (s.paid_at) {
      all.paid++
      all.revenue += s.payment_amount ?? 0
    }

    const addTo = (b: Bucket, cutoff: number) => {
      if (startedTs >= cutoff) b.sessions++
      if (s.completed_at && new Date(s.completed_at).getTime() >= cutoff)
        b.completed++
      if (s.paid_at && new Date(s.paid_at).getTime() >= cutoff) {
        b.paid++
        b.revenue += s.payment_amount ?? 0
      }
    }
    addTo(day, cutoffDay)
    addTo(week, cutoff7)
    addTo(month, cutoff30)

    const key = kstDateKey(s.started_at)
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1)

    if (s.completed_at) {
      const dur = new Date(s.completed_at).getTime() - startedTs
      // Ignore >3h outliers (walked away, paused). Keep genuine completions only.
      if (dur > 0 && dur < 3 * 60 * 60 * 1000) durationsMs.push(dur)
    }
    if (s.coupon_code && s.paid_at) couponPaid++
  }

  const avgDurationSec =
    durationsMs.length > 0
      ? Math.round(
          durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length / 1000,
        )
      : 0
  const medianDurationSec =
    durationsMs.length > 0
      ? Math.round(
          [...durationsMs].sort((a, b) => a - b)[
            Math.floor(durationsMs.length / 2)
          ]! / 1000,
        )
      : 0
  const couponRate = all.paid > 0 ? couponPaid / all.paid : 0

  const profileRows = (profiles.data ?? []) as Array<{
    gender: Gender
    age_range: AgeRange
  }>
  const byGender: Record<Gender, number> = {
    male: 0,
    female: 0,
    other: 0,
    prefer_not: 0,
  }
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
    all,
    day,
    week,
    month,
    avgDurationSec,
    medianDurationSec,
    couponPaid,
    couponRate,
    dayKeys,
    byDay,
    byGender,
    byAge,
    totalProfiles: profileRows.length,
  }
}

function fmtDuration(sec: number): string {
  if (sec <= 0) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m === 0) return `${s}초`
  if (s === 0) return `${m}분`
  return `${m}분 ${s}초`
}

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(0)}%`
}

function fmtShortDay(isoDay: string): string {
  // 'YYYY-MM-DD' → 'M/D (요일)'
  const [_, m, d] = isoDay.split('-')
  const dow = ['일', '월', '화', '수', '목', '금', '토'][
    new Date(`${isoDay}T00:00:00+09:00`).getDay()
  ]
  return `${Number(m)}/${Number(d)} (${dow})`
}

export default async function AdminDashboardPage() {
  const base = getAdminBasePath()
  const stats = await loadStats()
  const completionRate =
    stats.all.sessions > 0 ? stats.all.completed / stats.all.sessions : 0
  const conversionRate =
    stats.all.completed > 0 ? stats.all.paid / stats.all.completed : 0

  return (
    <main>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Overview
        </p>
        <h1 className="mt-3 text-2xl font-semibold">대시보드</h1>

        {/* Cumulative KPIs */}
        <section className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-0 border-y border-[var(--line)]">
          <Stat label="총 세션" value={stats.all.sessions.toLocaleString()} />
          <Stat
            label="검사 완료"
            value={stats.all.completed.toLocaleString()}
            hint={`완료율 ${fmtPct(completionRate)}`}
          />
          <Stat
            label="결제 완료"
            value={stats.all.paid.toLocaleString()}
            hint={`전환율 ${fmtPct(conversionRate)}`}
          />
          <Stat
            label="총 매출"
            value={`${stats.all.revenue.toLocaleString()}원`}
          />
        </section>

        {/* Time-window KPIs */}
        <section className="mt-14">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Time windows
          </p>
          <h2 className="mt-2 text-lg font-semibold">기간별 지표</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm border-t border-b border-[var(--line)]">
              <thead>
                <tr className="text-[var(--ink-soft)] text-xs">
                  <th className="text-left font-normal py-3 pr-4">기간</th>
                  <th className="text-right font-normal py-3 px-4">신규 세션</th>
                  <th className="text-right font-normal py-3 px-4">검사 완료</th>
                  <th className="text-right font-normal py-3 px-4">결제</th>
                  <th className="text-right font-normal py-3 pl-4">매출</th>
                </tr>
              </thead>
              <tbody>
                <TimeRow label="최근 24시간" bucket={stats.day} />
                <TimeRow label="최근 7일" bucket={stats.week} />
                <TimeRow label="최근 30일" bucket={stats.month} />
              </tbody>
            </table>
          </div>
        </section>

        {/* 7-day bar chart */}
        <section className="mt-14">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Daily · last 7 days
          </p>
          <h2 className="mt-2 text-lg font-semibold">일자별 세션 추이</h2>
          <DayBars dayKeys={stats.dayKeys} byDay={stats.byDay} />
        </section>

        {/* Quality metrics */}
        <section className="mt-14">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Quality
          </p>
          <h2 className="mt-2 text-lg font-semibold">검사 품질 지표</h2>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-0 border-y border-[var(--line)]">
            <Stat
              label="평균 완료 시간"
              value={fmtDuration(stats.avgDurationSec)}
              hint={
                stats.medianDurationSec > 0
                  ? `중앙값 ${fmtDuration(stats.medianDurationSec)}`
                  : undefined
              }
            />
            <Stat
              label="쿠폰 사용률"
              value={fmtPct(stats.couponRate)}
              hint={`${stats.couponPaid.toLocaleString()}건 / 결제 ${stats.all.paid.toLocaleString()}건`}
            />
            <Stat
              label="평균 결제가"
              value={
                stats.all.paid > 0
                  ? `${Math.round(
                      stats.all.revenue / stats.all.paid,
                    ).toLocaleString()}원`
                  : '—'
              }
              hint="ARPU"
            />
          </div>
        </section>

        {/* Demographics */}
        <section className="mt-14">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Demographics · {stats.totalProfiles.toLocaleString()} participants
          </p>
          <h2 className="mt-2 text-lg font-semibold">참여자 분포</h2>
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

        {/* Deep links */}
        <section className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6">
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

function TimeRow({ label, bucket }: { label: string; bucket: Bucket }) {
  return (
    <tr className="border-t border-[var(--line-soft)]">
      <td className="py-3 pr-4 font-medium">{label}</td>
      <td className="py-3 px-4 text-right font-mono">
        {bucket.sessions.toLocaleString()}
      </td>
      <td className="py-3 px-4 text-right font-mono">
        {bucket.completed.toLocaleString()}
      </td>
      <td className="py-3 px-4 text-right font-mono">
        {bucket.paid.toLocaleString()}
      </td>
      <td className="py-3 pl-4 text-right font-mono">
        {bucket.revenue.toLocaleString()}원
      </td>
    </tr>
  )
}

function DayBars({
  dayKeys,
  byDay,
}: {
  dayKeys: string[]
  byDay: Map<string, number>
}) {
  const values = dayKeys.map((k) => byDay.get(k) ?? 0)
  const max = Math.max(1, ...values)
  return (
    <div className="mt-5 flex items-end gap-2 h-40 border-b border-[var(--line)] pb-1">
      {dayKeys.map((k) => {
        const v = byDay.get(k) ?? 0
        const h = max > 0 ? (v / max) * 100 : 0
        return (
          <div key={k} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full bg-[var(--ink)]"
                style={{ height: `${h}%`, minHeight: v > 0 ? '2px' : '0' }}
                aria-hidden
              />
            </div>
            <div className="text-[10px] font-mono text-[var(--ink-muted)]">
              {v}
            </div>
            <div className="text-[10px] text-[var(--ink-soft)] whitespace-nowrap">
              {fmtShortDay(k)}
            </div>
          </div>
        )
      })}
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
