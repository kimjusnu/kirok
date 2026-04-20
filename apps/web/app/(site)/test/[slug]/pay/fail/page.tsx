import Link from 'next/link'

export const dynamic = 'force-dynamic'

type SearchParams = {
  sid?: string
  reason?: string
  code?: string
  message?: string
}

const REASON_LABEL: Record<string, string> = {
  cancel: '사용자가 결제를 취소했습니다.',
  fail: '카카오페이에서 결제가 실패했습니다.',
}

export default function PaymentFailPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: SearchParams
}) {
  const reasonText =
    searchParams.reason && REASON_LABEL[searchParams.reason]
      ? REASON_LABEL[searchParams.reason]
      : null

  return (
    <main>
      <div className="max-w-xl mx-auto px-6 py-16">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Payment failed
        </p>
        <h1 className="mt-4 text-2xl font-semibold">결제가 완료되지 않았습니다</h1>
        <p className="mt-4 prose-editorial text-[15px]">
          {reasonText ??
            '결제 과정에서 문제가 발생했어요.'}{' '}
          다시 시도해 주시거나, 쿠폰이 있다면 쿠폰 코드를 입력해 무료로 받을
          수도 있습니다.
        </p>

        {(searchParams.code || searchParams.message) && (
          <pre className="mt-6 p-4 bg-[var(--line-soft)] text-xs text-[var(--ink-muted)] whitespace-pre-wrap font-mono">
            {searchParams.code && `code: ${searchParams.code}\n`}
            {searchParams.message && `message: ${searchParams.message}`}
          </pre>
        )}

        <div className="mt-10 flex items-center gap-5">
          {searchParams.sid ? (
            <Link
              href={`/test/${params.slug}/pay?sid=${searchParams.sid}`}
              className="px-5 py-3 bg-[var(--ink)] text-white rounded-sm text-sm font-medium"
            >
              결제 다시 시도
            </Link>
          ) : null}
          <Link href="/" className="text-sm link-underline text-[var(--ink-muted)]">
            ← 처음으로
          </Link>
        </div>
      </div>
    </main>
  )
}
