'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PreviousReportLookup() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim().replace(/[\s-]/g, '').toUpperCase()
    if (!trimmed) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/sessions/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: trimmed }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(bodyMessage(body.error ?? `HTTP_${res.status}`))
        return
      }
      router.push(`/report/${body.accessToken}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown_error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-10 border border-[var(--line)] bg-white px-5 py-5 sm:flex sm:items-end sm:gap-4"
    >
      <label className="block flex-1">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
          이미 검사를 받으셨나요? · Report Key
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="예: K7B2XF9M"
          maxLength={24}
          autoComplete="off"
          className="mt-2 w-full px-0 py-2 border-0 border-b border-[var(--line)] focus:border-[var(--ink)] focus:ring-0 outline-none text-[18px] font-mono tracking-[0.15em] bg-transparent"
          aria-label="리포트 키"
        />
      </label>
      <button
        type="submit"
        disabled={submitting || value.trim().length === 0}
        className="mt-4 sm:mt-0 shrink-0 px-5 py-3 bg-[var(--ink)] text-white text-sm font-medium rounded-sm disabled:opacity-30"
      >
        {submitting ? '확인 중…' : '이전 검사 보기 →'}
      </button>
      {error && (
        <p
          role="alert"
          className="mt-3 sm:mt-0 sm:ml-4 text-[12px] text-red-600"
        >
          {error}
        </p>
      )}
    </form>
  )
}

function bodyMessage(code: string): string {
  switch (code) {
    case 'key_not_found':
      return '키를 찾을 수 없어요. 다시 확인해 주세요.'
    case 'not_paid':
      return '결제가 완료되지 않은 키입니다.'
    case 'expired':
      return '리포트 유효기간(7일)이 지났습니다.'
    case 'invalid_request':
      return '키 형식이 올바르지 않아요.'
    default:
      return `오류 · ${code}`
  }
}
