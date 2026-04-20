import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SearchParams = {
  sid?: string
  paymentKey?: string
  orderId?: string
  amount?: string
}

function resolveOrigin(): string {
  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return host ? `${proto}://${host}` : 'http://localhost:3000'
}

function errorView(title: string, detail: string) {
  return (
    <main>
      <div className="max-w-xl mx-auto px-6 py-16">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Error
        </p>
        <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 prose-editorial text-[15px]">{detail}</p>
        <Link href="/" className="mt-8 inline-block text-sm link-underline">
          ← 처음으로
        </Link>
      </div>
    </main>
  )
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { sid, paymentKey, orderId, amount } = searchParams
  if (!sid || !paymentKey || !orderId || !amount) {
    return errorView('잘못된 접근', '결제 확인에 필요한 정보가 부족합니다.')
  }
  const amountNum = Number(amount)
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return errorView('잘못된 금액', '결제 금액이 올바르지 않습니다.')
  }

  const origin = resolveOrigin()
  let confirmBody: { ok?: boolean; accessToken?: string; error?: string } = {}
  try {
    const res = await fetch(`${origin}/api/payments/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sid,
        paymentKey,
        orderId,
        amount: amountNum,
      }),
      cache: 'no-store',
    })
    confirmBody = await res.json()
    if (!res.ok || !confirmBody.ok) {
      return errorView(
        '결제 확인 실패',
        `서버에서 결제를 확정하지 못했습니다 (${confirmBody.error ?? res.status}). 고객센터에 문의해 주세요.`,
      )
    }
  } catch (e) {
    return errorView(
      '네트워크 오류',
      e instanceof Error ? e.message : '결제 확인 요청이 실패했습니다.',
    )
  }

  if (!confirmBody.accessToken) {
    return errorView('오류', '리포트 접근 토큰을 받지 못했습니다.')
  }

  redirect(`/report/${confirmBody.accessToken}`)
}
