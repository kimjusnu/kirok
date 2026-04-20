import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTestById } from '@temperament/tests'
import { createServiceClient } from '@temperament/db'
import { PaymentClient } from './PaymentClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SearchParams = { sid?: string; at?: string }

function renderError(title: string, body: string) {
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

export default async function PayPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: SearchParams
}) {
  const test = getTestById(params.slug)
  if (!test) notFound()

  const sessionId = searchParams.sid
  if (!sessionId) {
    return renderError('잘못된 접근', '세션 정보가 없습니다. 처음부터 다시 시작해 주세요.')
  }

  const db = createServiceClient()
  const { data: session, error } = await db
    .from('sessions')
    .select('id, completed_at, paid_at, tests(slug, price_krw, anchor_price_krw)')
    .eq('id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('pay: session lookup failed', error)
    return renderError('일시적 오류', '다시 시도해 주세요.')
  }
  if (!session) return renderError('세션 없음', '유효하지 않은 세션입니다.')
  if (!session.completed_at) {
    return renderError('검사 미완료', '모든 문항에 응답한 후 결제로 이동해 주세요.')
  }

  const testMeta = session.tests as unknown as {
    slug: string
    price_krw: number
    anchor_price_krw: number
  } | null
  if (!testMeta) return renderError('오류', '검사 정보를 찾을 수 없습니다.')

  if (session.paid_at) {
    const at = searchParams.at
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-xl mx-auto p-8">
          <h1 className="text-2xl font-bold">이미 결제 완료된 세션입니다</h1>
          {at ? (
            <Link
              href={`/report/${at}`}
              className="mt-6 inline-block px-5 py-2.5 bg-black text-white rounded-md text-sm font-medium"
            >
              리포트 보기
            </Link>
          ) : null}
        </div>
      </main>
    )
  }

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ''

  return (
    <main className="min-h-screen bg-gray-50">
      <PaymentClient
        slug={params.slug}
        testNameKo={test.nameKo}
        sessionId={session.id}
        basePriceKrw={testMeta.price_krw}
        anchorPriceKrw={testMeta.anchor_price_krw}
        tossClientKey={clientKey}
      />
    </main>
  )
}
