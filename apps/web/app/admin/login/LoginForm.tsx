'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminBasePathFromLocation } from '@/lib/admin-path'

export function LoginForm({ next }: { next: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const base = adminBasePathFromLocation()
      const res = await fetch(`${base}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'login_failed')
      }
      router.push(next || `${base}/`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'login_failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        autoFocus
        className="w-full px-4 py-3 border border-[var(--line)] focus:border-[var(--ink)] outline-none text-sm font-mono"
      />
      {error && (
        <div role="alert" className="text-xs text-red-600">
          로그인 실패 ·{' '}
          {error === 'invalid_password' ? '비밀번호가 맞지 않아요' : error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting || password.length === 0}
        className="w-full px-5 py-3 bg-[var(--ink)] text-white text-sm font-medium rounded-sm disabled:opacity-30"
      >
        {submitting ? '확인 중…' : '로그인 →'}
      </button>
    </form>
  )
}
