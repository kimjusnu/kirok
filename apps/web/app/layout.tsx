import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: '정밀 기질검사 · 1,500원', template: '%s · 정밀 기질검사' },
  description:
    'Goldberg IPIP Big-Five 50문항 · AI 해석 · 학술 논문 자동 인용 · 익명 1,500원 (커피 한 잔 값)',
  openGraph: {
    title: '정밀 기질검사 · 1,500원',
    description:
      '논문 기반 Big Five 검사 · AI 해석과 자동 인용 · 익명 1회 1,500원 · 쿠폰 시 무료',
    locale: 'ko_KR',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
