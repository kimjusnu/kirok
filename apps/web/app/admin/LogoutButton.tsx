'use client'

import { adminBasePathFromLocation } from '@/lib/admin-path'

export function LogoutButton() {
  async function logout() {
    const base = adminBasePathFromLocation()
    try {
      await fetch(`${base}/api/logout`, { method: 'POST' })
    } catch {
      // 네트워크 실패여도 쿠키만 날리면 되므로 무시 — 다음 내비가 미인증 처리.
    }
    // 로그아웃 후엔 admin 컨텍스트를 완전히 비워야 해서 SPA 라우팅 대신
    // 전체 내비게이션으로 kirok 홈(/)으로 이동. 서버 컴포넌트 캐시·관리자
    // 세션 쿠키 의존성 모두 자연 초기화.
    window.location.href = '/'
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
