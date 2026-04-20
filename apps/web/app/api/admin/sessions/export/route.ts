import { createServiceClient } from '@temperament/db'
import type { Gender, AgeRange } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_ROWS = 5000

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

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function fmtDate(s: string | null): string {
  if (!s) return ''
  return new Date(s).toISOString()
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const status = url.searchParams.get('status') ?? 'all'
  const gender = url.searchParams.get('gender') ?? 'all'
  const age = url.searchParams.get('age') ?? 'all'
  const q = (url.searchParams.get('q') ?? '').trim().slice(0, 40)
  const from = url.searchParams.get('from') ?? ''
  const to = url.searchParams.get('to') ?? ''

  const db = createServiceClient()
  let query = db
    .from('sessions')
    .select(
      'id, started_at, completed_at, paid_at, payment_amount, coupon_code, tests(slug, name_ko), participant_profiles!inner(display_name, gender, age_range), results(raw_scores, percentiles)',
    )
    .order('started_at', { ascending: false })
    .limit(MAX_ROWS)

  if (status === 'paid') query = query.not('paid_at', 'is', null)
  else if (status === 'completed')
    query = query.not('completed_at', 'is', null).is('paid_at', null)
  else if (status === 'in_progress') query = query.is('completed_at', null)

  if (gender !== 'all') query = query.eq('participant_profiles.gender', gender as Gender)
  if (age !== 'all') query = query.eq('participant_profiles.age_range', age as AgeRange)
  if (q) query = query.ilike('participant_profiles.display_name', `%${q}%`)
  if (from) query = query.gte('started_at', new Date(from).toISOString())
  if (to) {
    const end = new Date(to)
    end.setHours(23, 59, 59, 999)
    query = query.lte('started_at', end.toISOString())
  }

  const { data, error } = await query
  if (error) {
    console.error('admin/sessions/export failed', error)
    return new Response(`export_failed: ${error.message}`, { status: 500 })
  }
  const rows = data ?? []

  const headers = [
    '시작시각',
    '완료시각',
    '결제시각',
    '닉네임',
    '성별',
    '나이대',
    '검사',
    '상태',
    '결제금액',
    '쿠폰',
    'Openness',
    'Conscientiousness',
    'Extraversion',
    'Agreeableness',
    'Neuroticism',
  ]

  const lines = [headers.map(csvEscape).join(',')]
  for (const r of rows as unknown as Array<{
    id: string
    started_at: string
    completed_at: string | null
    paid_at: string | null
    payment_amount: number | null
    coupon_code: string | null
    tests: { slug: string; name_ko: string } | null
    participant_profiles: { display_name: string; gender: string; age_range: string }[]
    results: { raw_scores: Record<string, number> | null; percentiles: Record<string, number> | null }[] | null
  }>) {
    const profile = r.participant_profiles[0]
    const status = r.paid_at
      ? '결제완료'
      : r.completed_at
        ? '검사완료'
        : '진행중'
    const pct = r.results?.[0]?.percentiles ?? null
    lines.push(
      [
        fmtDate(r.started_at),
        fmtDate(r.completed_at),
        fmtDate(r.paid_at),
        profile?.display_name ?? '',
        profile ? (GENDER_LABEL[profile.gender] ?? profile.gender) : '',
        profile ? (AGE_LABEL[profile.age_range] ?? profile.age_range) : '',
        r.tests?.name_ko ?? r.tests?.slug ?? '',
        status,
        r.paid_at ? String(r.payment_amount ?? 0) : '',
        r.coupon_code ?? '',
        pct?.openness ?? '',
        pct?.conscientiousness ?? '',
        pct?.extraversion ?? '',
        pct?.agreeableness ?? '',
        pct?.neuroticism ?? '',
      ]
        .map(csvEscape)
        .join(','),
    )
  }

  const body = '\uFEFF' + lines.join('\r\n') // BOM for Excel Korean compatibility
  const date = new Date().toISOString().slice(0, 10)
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kirok-sessions-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
