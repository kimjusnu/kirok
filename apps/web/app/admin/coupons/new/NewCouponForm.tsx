'use client'

import { useState } from 'react'
import { adminBasePathFromLocation } from '@/lib/admin-path'

type DiscountType = 'free' | 'percent' | 'fixed'

export function NewCouponForm() {
  const [code, setCode] = useState('')
  const [type, setType] = useState<DiscountType>('free')
  const [value, setValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [note, setNote] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        code: code.trim().toUpperCase(),
        discountType: type,
        note: note.trim() || null,
        isPublic,
      }
      if (type === 'free') {
        body.discountValue = 0
      } else {
        const v = Number(value)
        if (!Number.isFinite(v) || v <= 0) throw new Error('값이 올바르지 않아요')
        body.discountValue = v
      }
      if (maxUses.trim()) {
        const m = Number(maxUses)
        if (!Number.isFinite(m) || m <= 0) throw new Error('최대 사용 횟수가 올바르지 않아요')
        body.maxUses = m
      }
      if (expiresAt) {
        body.expiresAt = new Date(expiresAt).toISOString()
      }

      const base = adminBasePathFromLocation()
      const res = await fetch(`${base}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      // 응답 본문이 비어도(500 empty body 포함) UI가 터지지 않게 방어.
      const raw = await res.text()
      let data: { error?: string; stage?: string; id?: string; code?: string } =
        {}
      if (raw) {
        try {
          data = JSON.parse(raw)
        } catch {
          data = { error: `HTTP_${res.status}` }
        }
      }
      if (!res.ok) {
        if (res.status === 409 || data.error === 'code_already_exists') {
          throw new Error(
            `이미 "${body.code as string}" 코드의 쿠폰이 있어요. 목록에서 삭제 후 다시 만들거나 다른 코드를 쓰세요.`,
          )
        }
        const detail = data.stage ? ` (${data.stage})` : ''
        throw new Error(`${data.error ?? `HTTP_${res.status}`}${detail}`)
      }
      // Next.js App Router의 소프트 네비게이션 + 서버 컴포넌트 캐시로 인해
      // `router.push + refresh`가 프로덕션에서 가끔 stale 리스트를 보여 주는
      // 사례가 있었음. Full navigation으로 강제 새 요청 → 서버 컴포넌트 재렌더.
      window.location.href = `${base}/coupons`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'create_failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <label className="block">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Code
        </span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          minLength={3}
          maxLength={64}
          pattern="[A-Z0-9_\-]+"
          placeholder="LAUNCH100"
          className="mt-3 w-full px-0 py-2 border-0 border-b border-[var(--line)] focus:border-[var(--ink)] outline-none text-[17px] font-mono tracking-wider bg-transparent"
        />
      </label>

      <div>
        <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Type
        </span>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              { v: 'free', label: '무료' },
              { v: 'percent', label: '퍼센트' },
              { v: 'fixed', label: '정액' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setType(opt.v)}
              className={`py-2.5 text-sm border transition ${
                type === opt.v
                  ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                  : 'border-[var(--line)] hover:border-[var(--ink-muted)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {type !== 'free' && (
        <label className="block">
          <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
            {type === 'percent' ? 'Discount %' : 'Discount 원'}
          </span>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            min={1}
            max={type === 'percent' ? 100 : 1000000}
            placeholder={type === 'percent' ? '30' : '500'}
            className="mt-3 w-full px-0 py-2 border-0 border-b border-[var(--line)] focus:border-[var(--ink)] outline-none text-[17px] font-mono bg-transparent"
          />
        </label>
      )}

      <label className="block">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Max uses (optional)
        </span>
        <input
          type="number"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          min={1}
          placeholder="비워두면 무제한"
          className="mt-3 w-full px-0 py-2 border-0 border-b border-[var(--line)] focus:border-[var(--ink)] outline-none text-[17px] font-mono bg-transparent"
        />
      </label>

      <label className="block">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Expires at (optional)
        </span>
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="mt-3 w-full px-0 py-2 border-0 border-b border-[var(--line)] focus:border-[var(--ink)] outline-none text-[16px] font-mono bg-transparent"
        />
      </label>

      <label className="block">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          Note (optional)
        </span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          placeholder="예: 런칭 체험단 100명"
          className="mt-3 w-full px-0 py-2 border-0 border-b border-[var(--line)] focus:border-[var(--ink)] outline-none text-[16px] bg-transparent"
        />
      </label>

      <label className="flex items-start gap-3 pt-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[var(--ink)]"
        />
        <span className="text-[13px] leading-relaxed">
          <span className="font-medium">결제창에 공개</span>
          <span className="block text-[var(--ink-muted)] text-[12px] mt-1">
            체크하면 누구나 결제 페이지 쿠폰 드롭다운에서 이 쿠폰을 바로 고를
            수 있어요. 끄면 코드를 아는 사람만 &quot;기타 쿠폰 직접 입력&quot;으로
            쓸 수 있는 비공개 쿠폰이 됩니다.
          </span>
        </span>
      </label>

      {error && (
        <div role="alert" className="text-xs text-red-600">
          생성 실패 · {error}
        </div>
      )}

      <div className="pt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-[var(--ink)] text-white text-sm font-medium rounded-sm disabled:opacity-30"
        >
          {submitting ? '발급 중…' : '쿠폰 발급'}
        </button>
      </div>
    </form>
  )
}
