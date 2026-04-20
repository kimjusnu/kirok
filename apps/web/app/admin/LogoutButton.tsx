'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
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
