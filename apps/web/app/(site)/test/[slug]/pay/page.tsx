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
    <main>
      <div className="max-w-xl mx-auto px-6 py-16">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Error
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
      <main>
        <div className="max-w-xl mx-auto px-6 py-16">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            Paid
          </p>
          <h1 className="mt-4 text-2xl font-semibold">
            이미 결제 완료된 세션입니다
          </h1>
          {at ? (
            <Link
              href={`/report/${at}`}
              className="mt-8 inline-block px-5 py-3 bg-[var(--ink)] text-white rounded-sm text-sm font-medium"
            >
              리포트 보기 →
            </Link>
          ) : null}
        </div>
      </main>
    )
  }

  return (
    <main>
      <PaymentClient
        slug={params.slug}
        testNameKo={test.nameKo}
        sessionId={session.id}
        basePriceKrw={testMeta.price_krw}
        anchorPriceKrw={testMeta.anchor_price_krw}
      />
    </main>
  )
}
