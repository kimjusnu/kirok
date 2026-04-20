'use client'

import { useRouter } from 'next/navigation'
import { adminBasePathFromLocation } from '@/lib/admin-path'

export function LogoutButton() {
  const router = useRouter()
  async function logout() {
    const base = adminBasePathFromLocation()
    await fetch(`${base}/api/logout`, { method: 'POST' })
    router.push(`${base}/login`)
    router.refresh()
  }
  return (
    <button
      type="button"
      onClick={logout}
      className="text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink)]"
    >
      로그아웃
    </button>
  )
}
