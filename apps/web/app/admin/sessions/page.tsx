import Link from 'next/link'
import { createServiceClient } from '@temperament/db'
import { getAdminBasePath } from '@/lib/admin-path'
import { firstEmbed } from '@/lib/supabase-embed'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 100

type Status = 'all' | 'in_progress' | 'completed' | 'paid'
type Gender = 'all' | 'male' | 'female' | 'other' | 'prefer_not'
type AgeRange = 'all' | 'teens' | '20s' | '30s' | '40s' | '50s' | '60_plus' | 'prefer_not'

type Filters = {
  status: Status
  gender: Gender
  age: AgeRange
  q: string
  from: string
  to: string
}

function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const get = (k: string): string =>
    typeof sp[k] === 'string' ? (sp[k] as string) : ''
  return {
    status: ((['all', 'in_progress', 'completed', 'paid'] as const).find(
      (s) => s === get('status'),
    ) ?? 'all') as Status,
    gender: ((['all', 'male', 'female', 'other', 'prefer_not'] as const).find(
      (g) => g === get('gender'),
    ) ?? 'all') as Gender,
    age: ((['all', 'teens', '20s', '30s', '40s', '50s', '60_plus', 'prefer_not'] as const).find(
      (a) => a === get('age'),
    ) ?? 'all') as AgeRange,
    q: get('q').trim().slice(0, 40),
    from: get('from'),
    to: get('to'),
  }
}

const GENDER_LABEL: Record<Exclude<Gender, 'all'>, string> = {
  male: '남',
  female: '여',
  other: '기타',
  prefer_not: '—',
}
const AGE_LABEL: Record<Exclude<AgeRange, 'all'>, string> = {
  teens: '10대',
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60_plus': '60+',
  prefer_not: '—',
}

function fmtDate(s: string): string {
  const d = new Date(s)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`
}

type ParticipantProfileLite = {
  display_name: string
  gender: string
  age_range: string
}

type SessionRow = {
  id: string
  access_token: string
  started_at: string
  completed_at: string | null
  paid_at: string | null
  payment_amount: number | null
  tests: { slug: string; name_ko: string } | null
  // PostgREST는 1:1 관계(participant_profiles.session_id PK)를 단일 객체로
  // 돌려주지만, 일부 쿼리 모양에선 배열로도 올 수 있어 둘 다 허용.
  participant_profiles:
    | ParticipantProfileLite
    | ParticipantProfileLite[]
    | null
}

async function fetchRows(filters: Filters): Promise<SessionRow[]> {
  const db = createServiceClient()
  let q = db
    .from('sessions')
    .select(
      'id, access_token, started_at, completed_at, paid_at, payment_amount, tests(slug, name_ko), participant_profiles!inner(display_name, gender, age_range)',
    )
    .order('started_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (filters.status === 'paid') {
    q = q.not('paid_at', 'is', null)
  } else if (filters.status === 'completed') {
    q = q.not('completed_at', 'is', null).is('paid_at', null)
  } else if (filters.status === 'in_progress') {
    q = q.is('completed_at', null)
  }

  if (filters.gender !== 'all') {
    q = q.eq('participant_profiles.gender', filters.gender)
  }
  if (filters.age !== 'all') {
    q = q.eq('participant_profiles.age_range', filters.age)
  }
  if (filters.q) {
    q = q.ilike('participant_profiles.display_name', `%${filters.q}%`)
  }
  if (filters.from) {
    q = q.gte('started_at', new Date(filters.from).toISOString())
  }
  if (filters.to) {
    const end = new Date(filters.to)
    end.setHours(23, 59, 59, 999)
    q = q.lte('started_at', end.toISOString())
  }

  const { data, error } = await q
  if (error) {
    console.error('admin/sessions query failed', error)
    return []
  }
  return (data ?? []) as unknown as SessionRow[]
}

function buildQuery(base: string, filters: Filters, extra: Record<string, string> = {}): string {
  const p = new URLSearchParams()
  if (filters.status !== 'all') p.set('status', filters.status)
  if (filters.gender !== 'all') p.set('gender', filters.gender)
  if (filters.age !== 'all') p.set('age', filters.age)
  if (filters.q) p.set('q', filters.q)
  if (filters.from) p.set('from', filters.from)
  if (filters.to) p.set('to', filters.to)
  for (const [k, v] of Object.entries(extra)) p.set(k, v)
  const qs = p.toString()
  return qs ? `${base}?${qs}` : base
}

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const base = getAdminBasePath()
  const filters = parseFilters(searchParams)
  const rows = await fetchRows(filters)

  return (
    <main>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
              Sessions
            </p>
            <h1 className="mt-3 text-2xl font-semibold">참여 세션</h1>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a
              href={buildQuery(`${base}/api/sessions/export`, filters)}
              className="link-underline text-[var(--ink-muted)]"
            >
              CSV 내보내기
            </a>
            <span className="text-[var(--ink-muted)]">
              최근 {rows.length}개
            </span>
          </div>
        </div>

        <form method="get" className="mt-8 grid grid-cols-2 sm:grid-cols-6 gap-2 text-sm">
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="닉네임"
            className="col-span-2 px-3 py-2 border border-[var(--line)] focus:border-[var(--ink)] outline-none"
          />
          <select
            name="status"
            defaultValue={filters.status}
            className="px-3 py-2 border border-[var(--line)] focus:border-[var(--ink)] outline-none bg-white"
          >
            <option value="all">상태 · 전체</option>
            <option value="in_progress">진행 중</option>
            <option value="completed">검사 완료</option>
            <option value="paid">결제 완료</option>
          </select>
          <select
            name="gender"
            defaultValue={filters.gender}
            className="px-3 py-2 border border-[var(--line)] focus:border-[var(--ink)] outline-none bg-white"
          >
            <option value="all">성별 · 전체</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
            <option value="prefer_not">미응답</option>
          </select>
          <select
            name="age"
            defaultValue={filters.age}
            className="px-3 py-2 border border-[var(--line)] focus:border-[var(--ink)] outline-none bg-white"
          >
            <option value="all">나이 · 전체</option>
            <option value="teens">10대</option>
            <option value="20s">20대</option>
            <option value="30s">30대</option>
            <option value="40s">40대</option>
            <option value="50s">50대</option>
            <option value="60_plus">60+</option>
            <option value="prefer_not">미응답</option>
          </select>
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="date"
              name="from"
              defaultValue={filters.from}
              className="flex-1 px-2 py-2 border border-[var(--line)] focus:border-[var(--ink)] outline-none font-mono text-xs"
            />
            <span className="text-[var(--ink-soft)]">–</span>
            <input
              type="date"
              name="to"
              defaultValue={filters.to}
              className="flex-1 px-2 py-2 border border-[var(--line)] focus:border-[var(--ink)] outline-none font-mono text-xs"
            />
          </div>
          <div className="col-span-2 sm:col-span-4 flex items-center gap-3 text-xs">
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--ink)] text-white text-xs font-medium"
            >
              필터 적용
            </button>
            <Link
              href={`${base}/sessions`}
              className="link-underline text-[var(--ink-muted)]"
            >
              초기화
            </Link>
          </div>
        </form>

        <div className="mt-8 border-t border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)] border-b border-[var(--line)]">
                <th className="text-left font-normal py-3">시간</th>
                <th className="text-left font-normal py-3">닉네임</th>
                <th className="text-left font-normal py-3">성별·나이</th>
                <th className="text-left font-normal py-3">검사</th>
                <th className="text-left font-normal py-3">상태</th>
                <th className="text-right font-normal py-3">금액</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-sm text-[var(--ink-soft)]"
                  >
                    조건에 맞는 세션이 없어요.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const profile = firstEmbed(r.participant_profiles)
                const status = r.paid_at
                  ? 'paid'
                  : r.completed_at
                    ? 'completed'
                    : 'in_progress'
                return (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--line-soft)] hover:bg-[var(--line-soft)] transition"
                  >
                    <td className="py-3 font-mono text-xs text-[var(--ink-muted)]">
                      {fmtDate(r.started_at)}
                    </td>
                    <td className="py-3">{profile?.display_name ?? '—'}</td>
                    <td className="py-3 text-xs text-[var(--ink-muted)]">
                      {profile
                        ? `${GENDER_LABEL[profile.gender as keyof typeof GENDER_LABEL] ?? '—'} · ${AGE_LABEL[profile.age_range as keyof typeof AGE_LABEL] ?? '—'}`
                        : '—'}
                    </td>
                    <td className="py-3 text-xs">
                      {r.tests?.name_ko ?? r.tests?.slug ?? '—'}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="py-3 text-right font-mono text-xs">
                      {r.paid_at
                        ? `${(r.payment_amount ?? 0).toLocaleString()}원`
                        : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`${base}/sessions/${r.id}`}
                        className="text-xs link-underline"
                      >
                        상세 →
                      </Link>
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

function StatusBadge({ status }: { status: 'in_progress' | 'completed' | 'paid' }) {
  const map: Record<typeof status, { label: string; cls: string }> = {
    in_progress: {
      label: '진행 중',
      cls: 'text-[var(--ink-soft)] border-[var(--line)]',
    },
    completed: {
      label: '검사 완료',
      cls: 'text-[var(--ink-muted)] border-[var(--ink-muted)]',
    },
    paid: {
      label: '결제 완료',
      cls: 'text-[var(--accent)] border-[var(--accent)]',
    },
  }
  const s = map[status]
  return (
    <span className={`inline-block px-2 py-0.5 border text-[10px] uppercase tracking-wider ${s.cls}`}>
      {s.label}
    </span>
  )
}
