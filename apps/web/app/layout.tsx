import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'kirok · 정밀 기질검사', template: '%s · kirok' },
  description:
    'Goldberg IPIP Big-Five 50문항 · AI 해석 · 학술 논문 자동 인용 · 익명 1,500원 (커피 한 잔 값)',
  openGraph: {
    title: 'kirok · 정밀 기질검사',
    description:
      '논문 기반 Big Five 검사 · AI 해석과 자동 인용 · 익명 1회 1,500원 · 쿠폰 시 무료',
    locale: 'ko_KR',
    type: 'website',
  },
  robots: { index: true, follow: true },
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

function SiteFooter() {
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
      </div>
    </footer>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-white text-[var(--ink)]">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
