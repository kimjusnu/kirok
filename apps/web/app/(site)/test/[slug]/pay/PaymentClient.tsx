'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

// 드롭다운 옵션은 3개로 고정:
// - 'none'    쿠폰 미사용 (기준가 그대로)
// - 'launch'  런칭 할인 쿠폰 자동 적용 (LAUNCH1500)
// - 'other'   그 외 코드는 모두 기타 입력 필드에서 처리
// admin에 is_public=true로 등록된 다른 공개 쿠폰이 있어도 드롭다운에는
// 올리지 않음 — 무료/특별 할인은 운영자가 코드를 수동 공유해야 하는
// 정책이라서 드롭다운 노출은 런칭 쿠폰 하나로 제한.
type CouponMode = 'none' | 'launch' | 'other'

const LAUNCH_COUPON_CODE = 'LAUNCH1500'

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
  const [mode, setMode] = useState<CouponMode>('none')
  const [customInput, setCustomInput] = useState('')
  const [coupon, setCoupon] = useState<CouponState>({ kind: 'idle' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const consentsOk = agreeTerms && agreePrivacy
  const finalAmount = useMemo(() => {
    if (coupon.kind === 'applied') return coupon.finalAmountKrw
    return basePriceKrw
  }, [coupon, basePriceKrw])

  const isFree = coupon.kind === 'applied' && coupon.isFree

  const validateCode = useCallback(
    async (code: string) => {
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
    },
    [sessionId],
  )

  const onModeChange = useCallback(
    (next: CouponMode) => {
      setMode(next)
      setCustomInput('')
      setCoupon({ kind: 'idle' })
      setError(null)
      if (next === 'launch') {
        void validateCode(LAUNCH_COUPON_CODE)
      }
    },
    [validateCode],
  )

  const applyCustom = useCallback(() => {
    const code = customInput.trim().toUpperCase()
    if (!code) return
    void validateCode(code)
  }, [customInput, validateCode])

  const removeCoupon = useCallback(() => {
    onModeChange('none')
  }, [onModeChange])

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

  const appliedTag = (() => {
    if (coupon.kind !== 'applied') return null
    if (coupon.isFree) return '쿠폰으로 무료'
    return `−${coupon.discountAmountKrw.toLocaleString()}원`
  })()

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
          {appliedTag && (
            <div className="text-right text-xs text-[var(--accent)]">
              {appliedTag}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Coupon
        </h2>

        <div className="mt-3">
          <label htmlFor="coupon-mode" className="sr-only">
            쿠폰 선택
          </label>
          <select
            id="coupon-mode"
            value={mode}
            onChange={(e) => onModeChange(e.target.value as CouponMode)}
            className="w-full px-3 py-2.5 border border-[var(--line)] bg-white text-sm focus:border-[var(--ink)] outline-none transition"
          >
            <option value="none">
              쿠폰 사용 안 함 · {basePriceKrw.toLocaleString()}원
            </option>
            <option value="launch">런칭 할인 쿠폰 적용 · 1,500원</option>
            <option value="other">기타 쿠폰 직접 입력</option>
          </select>
        </div>

        {mode === 'other' && coupon.kind !== 'applied' && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.toUpperCase())}
              placeholder="코드 입력"
              className="flex-1 px-3 py-2.5 border border-[var(--line)] focus:border-[var(--ink)] outline-none text-sm font-mono tracking-wide transition"
              aria-label="기타 쿠폰 코드"
            />
            <button
              type="button"
              onClick={applyCustom}
              disabled={
                coupon.kind === 'checking' || customInput.trim().length === 0
              }
              className="px-5 py-2.5 bg-[var(--ink)] text-white text-sm disabled:opacity-30"
            >
              {coupon.kind === 'checking' ? '확인…' : '적용'}
            </button>
          </div>
        )}

        {coupon.kind === 'applied' && (
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
        )}

        {coupon.kind === 'checking' && mode === 'launch' && (
          <div className="mt-2 text-[11px] text-[var(--ink-soft)]">
            쿠폰 적용 중…
          </div>
        )}

        {coupon.kind === 'invalid' && (
          <div className="mt-2 text-[11px] text-red-600">
            사용할 수 없는 쿠폰 · {coupon.reason}
          </div>
        )}
      </section>

      <section className="mt-10 pt-6 border-t border-[var(--line)]">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          약관 동의
        </h2>
        <div className="mt-3 space-y-2 text-[13px]">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-[3px] shrink-0"
              aria-label="이용약관 및 환불정책 동의"
            />
            <span className="leading-[1.6]">
              <span className="text-red-600 mr-1" aria-hidden>
                *
              </span>
              (필수){' '}
              <Link href="/terms" target="_blank" className="link-underline">
                이용약관
              </Link>{' '}
              및{' '}
              <Link href="/refund" target="_blank" className="link-underline">
                환불정책
              </Link>
              에 동의합니다.
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="mt-[3px] shrink-0"
              aria-label="개인정보 수집 및 이용 동의"
            />
            <span className="leading-[1.6]">
              <span className="text-red-600 mr-1" aria-hidden>
                *
              </span>
              (필수){' '}
              <Link href="/privacy" target="_blank" className="link-underline">
                개인정보 수집·이용
              </Link>
              에 동의합니다.
            </span>
          </label>
        </div>
      </section>

      <div className="mt-8">
        {isFree ? (
          <button
            type="button"
            onClick={claimFree}
            disabled={submitting || !consentsOk}
            className="w-full px-5 py-4 bg-[var(--ink)] text-white font-medium rounded-sm disabled:opacity-40"
          >
            {submitting ? '처리 중…' : '무료로 리포트 받기 →'}
          </button>
        ) : (
          <button
            type="button"
            onClick={startKakaoPayment}
            disabled={submitting || !consentsOk}
            className="w-full px-5 py-4 bg-[#FEE500] text-[#3C1E1E] font-semibold rounded-sm hover:bg-[#FDD835] transition disabled:opacity-40"
          >
            {submitting
              ? '카카오페이로 이동 중…'
              : `카카오페이로 ${finalAmount.toLocaleString()}원 결제`}
          </button>
        )}
        {!consentsOk && (
          <p className="mt-2 text-[11px] text-[var(--ink-soft)]">
            결제 진행을 위해 위 약관에 동의해 주세요.
          </p>
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
