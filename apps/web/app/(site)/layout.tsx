import Link from 'next/link'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/lib/admin-auth'
import { getAdminBasePathOrEmpty } from '@/lib/admin-path'
import { BUSINESS_INFO } from '@/lib/business-info'

// Shown in the footer as the admin entry point. If ADMIN_BASE_PATH is set,
// this links straight to the obfuscated admin login — convenient for the
// operator, at the cost of exposing the secret prefix in HTML.
const ADMIN_LOGIN_HREF = (() => {
  const base = getAdminBasePathOrEmpty()
  return base ? `${base}/login` : ''
})()

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
  const b = BUSINESS_INFO
  return (
    <footer className="mt-16 border-t border-[var(--line)]">
      <div className="max-w-2xl mx-auto px-6 py-10 text-xs text-[var(--ink-soft)] leading-relaxed">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-[var(--ink)]">{b.brandName}</span>
          <span>Goldberg (1992) · Public domain items</span>
        </div>
        <p className="mt-3">
          본 검사는 자기이해 목적의 참고 자료이며, 임상 진단이 아닙니다.
        </p>

        <nav className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
          <Link href="/terms" className="link-underline">
            이용약관
          </Link>
          <Link href="/privacy" className="link-underline">
            <strong>개인정보처리방침</strong>
          </Link>
          <Link href="/refund" className="link-underline">
            환불정책
          </Link>
        </nav>

        <dl className="mt-5 flex flex-col gap-y-1 text-[11px] text-left">
          <div>
            <dt className="inline text-[var(--ink-muted)]">대표 </dt>
            <dd className="inline">{b.representative}</dd>
          </div>
          <div>
            <dt className="inline text-[var(--ink-muted)]">이메일 </dt>
            <dd className="inline">{b.email}</dd>
          </div>
          <div>
            <dt className="inline text-[var(--ink-muted)]">사업자등록번호 </dt>
            <dd className="inline">{b.businessRegistrationNumber}</dd>
          </div>
        </dl>

        <div className="mt-6 pt-4 border-t border-[var(--line-soft)] flex items-center justify-between gap-4">
          {adminBase ? (
            <Link
              href={`${adminBase}/`}
              className="text-[10px] tracking-[0.2em] uppercase link-underline text-[var(--ink-muted)]"
            >
              admin dashboard →
            </Link>
          ) : ADMIN_LOGIN_HREF ? (
            <Link
              href={ADMIN_LOGIN_HREF}
              className="text-[10px] tracking-[0.2em] uppercase link-underline text-[var(--ink-muted)]"
            >
              admin login →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </footer>
  )
}
