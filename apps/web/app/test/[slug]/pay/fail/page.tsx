import Link from 'next/link'

export const dynamic = 'force-dynamic'

type SearchParams = {
  sid?: string
  code?: string
  message?: string
}

export default function PaymentFailPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: SearchParams
}) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-bold">결제가 완료되지 않았습니다</h1>
        <p className="mt-3 text-gray-700">
          결제 과정에서 문제가 발생했어요. 다시 시도해 주시거나, 쿠폰이 있다면 쿠폰
          코드를 입력해 무료로 받을 수도 있습니다.
        </p>

        {(searchParams.code || searchParams.message) && (
          <pre className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-700 whitespace-pre-wrap">
            {searchParams.code && `code: ${searchParams.code}\n`}
            {searchParams.message && `message: ${searchParams.message}`}
          </pre>
        )}

        <div className="mt-6 flex gap-3">
          {searchParams.sid ? (
            <Link
              href={`/test/${params.slug}/pay?sid=${searchParams.sid}`}
              className="inline-block px-5 py-2.5 bg-black text-white rounded-md text-sm font-medium"
            >
              결제 다시 시도
            </Link>
          ) : null}
          <Link
            href="/"
            className="inline-block px-5 py-2.5 border border-gray-300 rounded-md text-sm"
          >
            처음으로
          </Link>
        </div>
      </div>
    </main>
  )
}
