import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@temperament/db'
import { getAdminBasePath } from '@/lib/admin-path'
import { firstEmbed } from '@/lib/supabase-embed'
import { RegenerateButton } from './RegenerateButton'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GENDER_LABEL: Record<string, string> = {
  male: '남성',
  female: '여성',
  other: '기타',
  prefer_not: '미응답',
}
const AGE_LABEL: Record<string, string> = {
  teens: '10대',
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60_plus': '60대+',
  prefer_not: '미응답',
}

function fmt(s: string | null | undefined): string {
  if (!s) return '—'
  return new Date(s).toLocaleString('ko-KR')
}

export default async function AdminSessionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const base = getAdminBasePath()
  const db = createServiceClient()
  const { data: session, error } = await db
    .from('sessions')
    .select(
      'id, access_token, started_at, completed_at, paid_at, payment_amount, coupon_code, expires_at, tests(slug, name_ko), participant_profiles(display_name, gender, age_range, consent_at)',
    )
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    return (
      <main>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-sm text-red-600">불러오기 실패: {error.message}</p>
        </div>
      </main>
    )
  }
  if (!session) notFound()

  // PostgREST는 1:1(session_id PK) 관계를 단일 객체로 반환하지만 배열로 올
   // 수도 있어 두 shape 모두 수용.
  const profile = firstEmbed(
    session.participant_profiles as unknown as
      | {
          display_name: string
          gender: string
          age_range: string
          consent_at: string
        }
      | {
          display_name: string
          gender: string
          age_range: string
          consent_at: string
        }[]
      | null,
  )
  const test = firstEmbed(
    session.tests as unknown as
      | { slug: string; name_ko: string }
      | { slug: string; name_ko: string }[]
      | null,
  )

  const { data: results } = await db
    .from('results')
    .select('raw_scores, percentiles, ai_interpretation, generated_at')
    .eq('session_id', session.id)
    .maybeSingle()

  const { data: responses } = await db
    .from('responses')
    .select('score, test_items(order_num)')
    .eq('session_id', session.id)

  const responseCount = responses?.length ?? 0

  const percentiles = (results?.percentiles as Record<string, number> | undefined) ?? null
  const rawScores = (results?.raw_scores as Record<string, number> | undefined) ?? null

  return (
    <main>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between">
          <div>
            <Link
              href={`${base}/sessions`}
              className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)] link-underline"
            >
              ← Sessions
            </Link>
            <h1 className="mt-3 text-2xl font-semibold font-mono">
              {session.id.slice(0, 8)}…
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {session.paid_at && results && (
              <RegenerateButton sessionId={session.id} />
            )}
            {session.paid_at && (
              <Link
                href={`/report/${session.access_token}`}
                target="_blank"
                className="link-underline"
              >
                리포트 열기 →
              </Link>
            )}
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Participant
          </h2>
          <dl className="mt-4 divide-y divide-[var(--line)]">
            <Field label="닉네임" value={profile?.display_name ?? '—'} />
            <Field
              label="성별"
              value={profile ? (GENDER_LABEL[profile.gender] ?? '—') : '—'}
            />
            <Field
              label="나이대"
              value={profile ? (AGE_LABEL[profile.age_range] ?? '—') : '—'}
            />
            <Field
              label="동의 시각"
              value={fmt(profile?.consent_at)}
              mono
            />
          </dl>
        </section>

        <section className="mt-12">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Session
          </h2>
          <dl className="mt-4 divide-y divide-[var(--line)]">
            <Field label="검사" value={test?.name_ko ?? test?.slug ?? '—'} />
            <Field label="시작" value={fmt(session.started_at)} mono />
            <Field label="완료" value={fmt(session.completed_at)} mono />
            <Field label="응답 수" value={`${responseCount}문항`} />
            <Field label="결제" value={fmt(session.paid_at)} mono />
            <Field
              label="결제 금액"
              value={
                session.paid_at
                  ? `${(session.payment_amount ?? 0).toLocaleString()}원`
                  : '—'
              }
            />
            <Field label="쿠폰" value={session.coupon_code ?? '—'} mono />
            <Field label="리포트 만료" value={fmt(session.expires_at)} mono />
          </dl>
        </section>

        <section className="mt-12">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Scores
          </h2>
          {!results ? (
            <p className="mt-4 text-sm text-[var(--ink-soft)]">
              아직 리포트가 생성되지 않았어요.
            </p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-[var(--ink-soft)] border-b border-[var(--line)]">
                  <th className="text-left font-normal py-2">요인</th>
                  <th className="text-right font-normal py-2">원점수</th>
                  <th className="text-right font-normal py-2">백분위</th>
                </tr>
              </thead>
              <tbody>
                {percentiles &&
                  Object.keys(percentiles).map((factor) => (
                    <tr
                      key={factor}
                      className="border-b border-[var(--line-soft)]"
                    >
                      <td className="py-2 capitalize">{factor}</td>
                      <td className="py-2 text-right font-mono text-xs">
                        {rawScores?.[factor]?.toFixed(2) ?? '—'}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {percentiles[factor]}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  )
}

function Field({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="py-3 flex items-baseline gap-4">
      <dt className="w-32 text-xs text-[var(--ink-soft)]">{label}</dt>
      <dd className={`flex-1 text-sm ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </dd>
    </div>
  )
}
