'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminBasePathFromLocation } from '@/lib/admin-path'

type DiscountType = 'free' | 'percent' | 'fixed'

export function NewCouponForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [type, setType] = useState<DiscountType>('free')
  const [value, setValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [note, setNote] = useState('')
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'create_failed')
      router.push(`${base}/coupons`)
      router.refresh()
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
