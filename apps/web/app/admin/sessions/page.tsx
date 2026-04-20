import Link from 'next/link'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

type SessionRow = {
  id: string
  access_token: string
  started_at: string
  completed_at: string | null
  paid_at: string | null
  payment_amount: number | null
  tests: { slug: string; name_ko: string } | null
  participant_profiles:
    | { display_name: string; gender: string; age_range: string }[]
    | null
}

const GENDER_LABEL: Record<string, string> = {
  male: '남',
  female: '여',
  other: '기타',
  prefer_not: '—',
}
const AGE_LABEL: Record<string, string> = {
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

export default async function AdminSessionsPage() {
  const db = createServiceClient()
  const { data, error } = await db
    .from('sessions')
    .select(
      'id, access_token, started_at, completed_at, paid_at, payment_amount, tests(slug, name_ko), participant_profiles(display_name, gender, age_range)',
    )
    .order('started_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (error) {
    return (
      <main>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-xl font-semibold">세션</h1>
          <p className="mt-4 text-sm text-red-600">불러오기 실패: {error.message}</p>
        </div>
      </main>
    )
  }

  const rows = (data ?? []) as unknown as SessionRow[]

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
          <span className="text-xs text-[var(--ink-muted)]">
            최근 {rows.length}개
          </span>
        </div>

        <div className="mt-10 border-t border-[var(--line)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)] border-b border-[var(--line)]">
                <th className="text-left font-normal py-3">시간</th>
                <th className="text-left font-normal py-3">닉네임</th>
                <th className="text-left font-normal py-3">성별 · 나이</th>
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
                    아직 참여 세션이 없어요.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const profile = r.participant_profiles?.[0]
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
                        ? `${GENDER_LABEL[profile.gender] ?? '—'} · ${AGE_LABEL[profile.age_range] ?? '—'}`
                        : '—'}
                    </td>
                    <td className="py-3 text-xs">{r.tests?.name_ko ?? r.tests?.slug ?? '—'}</td>
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
                        href={`/admin/sessions/${r.id}`}
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
