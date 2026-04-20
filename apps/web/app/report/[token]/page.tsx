import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@temperament/db'
import { getTestById } from '@temperament/tests'
import { ReportView, type ReportPayload, type FactorMetaLite } from './ReportView'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function gate(title: string, body: string) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-gray-700">{body}</p>
        <Link href="/" className="mt-6 inline-block text-sm underline text-gray-600">
          처음으로
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
    .select('id, paid_at, expires_at, tests(slug)')
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
      cached = {
        rawScores: results.raw_scores as Record<string, number>,
        percentiles: results.percentiles as Record<string, number>,
        interpretation: JSON.parse(results.ai_interpretation),
        citations: (results.citations as ReportPayload['citations']) ?? [],
      }
    } catch (e) {
      console.error('report: cached interpretation parse failed', e)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <ReportView
        sessionId={session.id}
        testNameKo={testDef.nameKo}
        factors={factors}
        cached={cached}
      />
    </main>
  )
}
