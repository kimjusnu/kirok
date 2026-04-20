'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminBasePathFromLocation } from '@/lib/admin-path'

export function RegenerateButton({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    if (!confirm('이 세션의 AI 해석을 다시 생성합니다. 계속할까요?')) return
    setBusy(true)
    setError(null)
    try {
      const base = adminBasePathFromLocation()
      const res = await fetch(`${base}/api/sessions/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? 'regenerate_failed')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'regenerate_failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="link-underline text-[var(--ink-muted)] disabled:opacity-40"
      >
        {busy ? '재생성 중…' : '리포트 재생성'}
      </button>
      {error && (
        <span className="text-red-600 text-[11px]">({error})</span>
      )}
    </>
  )
}
