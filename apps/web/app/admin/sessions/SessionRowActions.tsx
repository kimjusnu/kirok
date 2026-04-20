'use client'

import Link from 'next/link'
import { useState } from 'react'
import { adminBasePathFromLocation } from '@/lib/admin-path'

export function SessionRowActions({
  sessionId,
  label,
  detailHref,
}: {
  sessionId: string
  label: string | null
  detailHref: string
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onDelete() {
    const who = label ? `"${label}"의 세션` : '이 세션'
    const ok = window.confirm(
      `${who}을 완전히 삭제합니다.\n\n응답·리포트·결제 기록·쿠폰 사용 이력까지 모두 지워지고 되돌릴 수 없어요. 진행할까요?`,
    )
    if (!ok) return

    setDeleting(true)
    setError(null)
    try {
      const base = adminBasePathFromLocation()
      const res = await fetch(`${base}/api/sessions/${sessionId}`, {
        method: 'DELETE',
      })
      const body = await res
        .json()
        .catch(() => ({}) as { error?: string; stage?: string; message?: string })
      if (!res.ok) {
        const detail = body.stage ? ` (${body.stage})` : ''
        setError(`${body.error ?? `HTTP_${res.status}`}${detail}`)
        return
      }
      // Vercel 프로덕션의 route 캐시가 stale하게 유지되는 사례가 있어
      // 하드 리로드로 확실히 갱신.
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'delete_failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-3 justify-end">
      <Link href={detailHref} className="text-xs link-underline">
        상세 →
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="text-xs text-[var(--ink-soft)] hover:text-red-600 transition disabled:opacity-30"
        title="세션 완전 삭제"
      >
        {deleting ? '삭제 중…' : '삭제'}
      </button>
      {error && (
        <span className="text-[10px] text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
