import Link from 'next/link'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/admin-auth'
import { getAdminBasePathOrEmpty } from '@/lib/admin-path'

export const dynamic = 'force-dynamic'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value
  const loggedIn = await verifyAdminToken(token)
  const adminBase = loggedIn ? getAdminBasePathOrEmpty() : ''

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter adminBase={adminBase} />
    </>
  )
}

function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)]">
      <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-[15px] tracking-tight font-semibold">
          kirok
        </Link>
        <nav className="text-xs text-[var(--ink-muted)]">
          <Link href="/test/ipip50" className="link-underline">
            검사 시작
          </Link>
        </nav>
      </div>
    </header>
  )
}

function SiteFooter({ adminBase }: { adminBase: string }) {
  return (
    <footer className="mt-16 border-t border-[var(--line)]">
      <div className="max-w-2xl mx-auto px-6 py-10 text-xs text-[var(--ink-soft)] leading-relaxed">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-[var(--ink)]">kirok</span>
          <span>Goldberg (1992) · Public domain items</span>
        </div>
        <p className="mt-3">
          본 검사는 자기이해 목적의 참고 자료이며, 임상 진단이 아닙니다.
        </p>
        {adminBase && (
          <div className="mt-6 pt-4 border-t border-[var(--line-soft)]">
            <Link
              href={`${adminBase}/`}
              className="text-[10px] tracking-[0.2em] uppercase link-underline text-[var(--ink-muted)]"
            >
              admin →
            </Link>
          </div>
        )}
      </div>
    </footer>
  )
}
