'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type CouponState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'invalid'; reason: string }
  | {
      kind: 'applied'
      code: string
      finalAmountKrw: number
      discountAmountKrw: number
      isFree: boolean
      discountType: string
    }

function isMobileUA(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export function PaymentClient({
  slug: _slug,
  testNameKo,
  sessionId,
  basePriceKrw,
  anchorPriceKrw,
}: {
  slug: string
  testNameKo: string
  sessionId: string
  basePriceKrw: number
  anchorPriceKrw: number
}) {
  const router = useRouter()
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<CouponState>({ kind: 'idle' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finalAmount = useMemo(() => {
    if (coupon.kind === 'applied') return coupon.finalAmountKrw
    return basePriceKrw
  }, [coupon, basePriceKrw])

  const isFree = coupon.kind === 'applied' && coupon.isFree

  const applyCoupon = useCallback(async () => {
    const code = couponInput.trim()
    if (!code) return
    setCoupon({ kind: 'checking' })
    setError(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code }),
      })
      const body = await res.json()
      if (!res.ok) {
        setCoupon({ kind: 'invalid', reason: body.error ?? 'error' })
        return
      }
      if (!body.valid) {
        setCoupon({ kind: 'invalid', reason: body.reason ?? 'invalid' })
        return
      }
      setCoupon({
        kind: 'applied',
        code,
        finalAmountKrw: body.finalAmountKrw,
        discountAmountKrw: body.discountAmountKrw,
        isFree: body.isFree,
        discountType: body.discountType,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'coupon_error')
      setCoupon({ kind: 'idle' })
    }
  }, [couponInput, sessionId])

  const removeCoupon = useCallback(() => {
    setCouponInput('')
    setCoupon({ kind: 'idle' })
  }, [])

  const claimFree = useCallback(async () => {
    if (coupon.kind !== 'applied' || !coupon.isFree) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/payments/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, couponCode: coupon.code }),
      })
      const body = await res.json()
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? 'free_redeem_failed')
      }
      router.push(`/report/${body.accessToken}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'free_redeem_failed')
    } finally {
      setSubmitting(false)
    }
  }, [coupon, sessionId, router])

  const startKakaoPayment = useCallback(async () => {
    setSubmitting(true)
    setError(null)
    try {
      const body: { sessionId: string; couponCode?: string } = { sessionId }
      if (coupon.kind === 'applied' && !coupon.isFree) {
        body.couponCode = coupon.code
      }
      const res = await fetch('/api/payments/ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? 'ready_failed')
      }
      const target = isMobileUA() ? data.redirectMobileUrl : data.redirectPcUrl
      if (!target) throw new Error('no_redirect_url')
      window.location.href = target
    } catch (e) {
      setError(e instanceof Error ? e.message : 'kakao_request_failed')
      setSubmitting(false)
    }
  }, [sessionId, coupon])

  return (
    <div className="max-w-xl mx-auto px-6 py-12 sm:py-16">
      <header>
        <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Checkout
        </p>
        <h1 className="mt-4 text-3xl font-semibold">결제</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          {testNameKo} · 리포트 구매
        </p>
      </header>

      <section className="mt-10 pb-8 border-b border-[var(--line)]">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs text-[var(--ink-soft)] line-through">
              {anchorPriceKrw.toLocaleString()}원
            </div>
            <div className="mt-1 text-4xl font-semibold tracking-tight">
              {finalAmount.toLocaleString()}
              <span className="text-lg font-normal text-[var(--ink-muted)] ml-1">
                원
              </span>
            </div>
          </div>
          {coupon.kind === 'applied' && (
            <div className="text-right text-xs text-[var(--accent)]">
              {coupon.isFree
                ? '쿠폰으로 무료'
                : `−${coupon.discountAmountKrw.toLocaleString()}원`}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Coupon
        </h2>
        {coupon.kind === 'applied' ? (
          <div className="mt-3 flex items-center justify-between py-3 border-b border-[var(--line)]">
            <div className="text-sm">
              <span className="font-mono tracking-wide">{coupon.code}</span>
              <span className="ml-3 text-xs text-[var(--ink-soft)]">적용됨</span>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-[11px] text-[var(--ink-soft)] link-underline"
            >
              제거
            </button>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="코드 입력"
              className="flex-1 px-3 py-2.5 border border-[var(--line)] focus:border-[var(--ink)] outline-none text-sm font-mono tracking-wide transition"
              aria-label="쿠폰 코드"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={
                coupon.kind === 'checking' || couponInput.trim().length === 0
              }
              className="px-5 py-2.5 bg-[var(--ink)] text-white text-sm disabled:opacity-30"
            >
              {coupon.kind === 'checking' ? '확인…' : '적용'}
            </button>
          </div>
        )}
        {coupon.kind === 'invalid' && (
          <div className="mt-2 text-[11px] text-red-600">
            사용할 수 없는 쿠폰 · {coupon.reason}
          </div>
        )}
      </section>

      <div className="mt-10">
        {isFree ? (
          <button
            type="button"
            onClick={claimFree}
            disabled={submitting}
            className="w-full px-5 py-4 bg-[var(--ink)] text-white font-medium rounded-sm disabled:opacity-40"
          >
            {submitting ? '처리 중…' : '무료로 리포트 받기 →'}
          </button>
        ) : (
          <button
            type="button"
            onClick={startKakaoPayment}
            disabled={submitting}
            className="w-full px-5 py-4 bg-[#FEE500] text-[#3C1E1E] font-semibold rounded-sm hover:bg-[#FDD835] transition disabled:opacity-40"
          >
            {submitting
              ? '카카오페이로 이동 중…'
              : `카카오페이로 ${finalAmount.toLocaleString()}원 결제`}
          </button>
        )}
        <p className="mt-3 text-[11px] text-[var(--ink-soft)]">
          결제창은 카카오페이로 이동합니다. 완료 후 자동으로 리포트 페이지로
          돌아옵니다.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 border-l-2 border-red-500 pl-4 py-2 text-sm text-red-700"
        >
          오류 · {error}
        </div>
      )}

      <p className="mt-14 pt-8 border-t border-[var(--line)] text-[11px] text-[var(--ink-soft)] leading-relaxed">
        결제 정보는 카카오페이로만 전달되며, 본 사이트는 결제 수단이나 카드번호를
        저장하지 않습니다. 리포트는 결제 완료 시점부터 7일간 열람 가능합니다.
      </p>
    </div>
  )
}
