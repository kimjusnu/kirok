'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminBasePathFromLocation } from '@/lib/admin-path'

export function CouponRow({
  id,
  code,
  typeLabel,
  valueLabel,
  usage,
  expires,
  expired,
  isActive,
  note,
}: {
  id: string
  code: string
  typeLabel: string
  valueLabel: string
  usage: string
  expires: string
  expired: boolean
  isActive: boolean
  note: string | null
}) {
  const router = useRouter()
  const [active, setActive] = useState(isActive)
  const [pending, start] = useTransition()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const state = !active ? '비활성' : expired ? '만료' : '활성'
  const stateClass = !active
    ? 'text-[var(--ink-soft)]'
    : expired
      ? 'text-yellow-700'
      : 'text-[var(--accent)]'

  async function toggle() {
    const next = !active
    setError(null)
    setActive(next)
    start(async () => {
      const base = adminBasePathFromLocation()
      const res = await fetch(`${base}/api/coupons/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: next }),
      })
      if (!res.ok) {
        setActive(!next) // rollback UI
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'toggle_failed')
        return
      }
      router.refresh()
    })
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }

  return (
    <tr className="border-b border-[var(--line-soft)] hover:bg-[var(--line-soft)] transition">
      <td className="py-3 font-mono tracking-wide">
        <button
          type="button"
          onClick={copy}
          className="link-underline"
          title="클릭해서 코드 복사"
        >
          {copied ? '복사됨' : code}
        </button>
      </td>
      <td className="py-3 text-xs">{typeLabel}</td>
      <td className="py-3 text-right font-mono text-xs">{valueLabel}</td>
      <td className="py-3 text-right font-mono text-xs">{usage}</td>
      <td className="py-3 font-mono text-xs text-[var(--ink-muted)]">{expires}</td>
      <td className={`py-3 text-xs ${stateClass}`}>{state}</td>
      <td className="py-3 text-xs text-[var(--ink-muted)] truncate max-w-[220px]">
        {note ?? '—'}
      </td>
      <td className="py-3 text-right">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className="text-[11px] link-underline text-[var(--ink-muted)] disabled:opacity-40"
        >
          {pending ? '…' : active ? '비활성화' : '활성화'}
        </button>
        {error && (
          <div className="mt-1 text-[10px] text-red-600">{error}</div>
        )}
      </td>
    </tr>
  )
}
