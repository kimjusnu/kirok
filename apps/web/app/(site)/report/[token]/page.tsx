import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'
import { getTestById } from '@temperament/tests'
import { InterpretationSchema } from '@temperament/ai'
import { ReportView, type ReportPayload, type FactorMetaLite } from './ReportView'

// Loose fallback for legacy interpretations whose shape diverged from the
// current zod schema (e.g. odd factor records, stringified arrays). If the
// strict schema fails, we still want to render the overall/factors/suggestions
// the user paid for — lifeFit / practiceLead come back via the "다시 생성" banner.
//
// Suggestions in old caches are plain strings; they get lifted into
// { text } objects here to match the post-upgrade UI type.
const LegacySuggestionSchema = z.preprocess(
  (v) => (typeof v === 'string' ? { text: v } : v),
  z.object({
    text: z.string(),
    linkedFactor: z.string().optional(),
    why: z.string().optional(),
  }),
)
const LegacyInterpretationSchema = z.object({
  overall: z.string(),
  factors: z.record(z.string(), z.string()),
  suggestions: z.array(LegacySuggestionSchema),
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 개인별 리포트는 검색엔진·AI 크롤러 모두에 색인되면 안 됨 (access_token이
// URL에 노출된 상태라 색인 시 다른 사용자가 리포트에 접근하는 경로가 생김).
// noindex + nofollow + noarchive + max-snippet:0으로 최대한 차단.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  },
}

function gate(title: string, body: string) {
  return (
    <main>
      <div className="max-w-xl mx-auto px-6 py-16">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Report
        </p>
        <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 prose-editorial text-[15px]">{body}</p>
        <Link href="/" className="mt-8 inline-block text-sm link-underline">
          ← 처음으로
        </Link>
      </div>
    </main>
  )
}

export default async function ReportPage({
  params,
}: {
  params: { token: string }
}) {
  if (!params.token || params.token.length < 8) notFound()

  const db = createServiceClient()
  const { data: session, error } = await db
    .from('sessions')
    .select('id, paid_at, expires_at, report_key, tests(slug)')
    .eq('access_token', params.token)
    .maybeSingle()

  if (error) {
    console.error('report: session lookup failed', error)
    return gate('일시적 오류', '잠시 후 다시 시도해 주세요.')
  }
  if (!session) notFound()
  if (!session.paid_at) {
    return gate('아직 결제되지 않았습니다', '결제를 완료하면 리포트가 열립니다.')
  }
  if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
    return gate(
      '리포트 유효기간이 지났습니다',
      '리포트 링크는 결제 후 7일간만 유효합니다.',
    )
  }

  const testMeta = session.tests as unknown as { slug: string } | null
  if (!testMeta) return gate('오류', '검사 정보를 찾을 수 없습니다.')
  const testDef = getTestById(testMeta.slug)
  if (!testDef) return gate('지원하지 않는 검사', '현재 이 검사의 리포트는 제공되지 않습니다.')

  const factors: FactorMetaLite[] = testDef.factors.map((f) => ({
    id: f.id,
    nameKo: f.nameKo,
    descriptionKo: f.descriptionKo,
  }))

  const { data: results } = await db
    .from('results')
    .select('raw_scores, percentiles, ai_interpretation, citations')
    .eq('session_id', session.id)
    .maybeSingle()

  let cached: ReportPayload | null = null
  if (results?.ai_interpretation) {
    try {
      const raw = JSON.parse(results.ai_interpretation)
      const strict = InterpretationSchema.safeParse(raw)
      if (strict.success) {
        cached = {
          rawScores: results.raw_scores as Record<string, number>,
          percentiles: results.percentiles as Record<string, number>,
          interpretation: strict.data,
          citations: (results.citations as ReportPayload['citations']) ?? [],
        }
      } else {
        const loose = LegacyInterpretationSchema.safeParse(raw)
        if (loose.success) {
          cached = {
            rawScores: results.raw_scores as Record<string, number>,
            percentiles: results.percentiles as Record<string, number>,
            // lifeFit intentionally undefined — UI shows the regenerate banner.
            interpretation: { ...loose.data },
            citations: (results.citations as ReportPayload['citations']) ?? [],
          }
        }
      }
    } catch (e) {
      console.error('report: cached interpretation parse failed', e)
    }
  }

  return (
    <main>
      <ReportView
        sessionId={session.id}
        testNameKo={testDef.nameKo}
        factors={factors}
        cached={cached}
        reportKey={session.report_key}
      />
    </main>
  )
}
