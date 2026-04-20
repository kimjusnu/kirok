import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const SITE_NAME = 'kirok'
const SITE_TAGLINE = 'kirok · 정밀 기질검사'
const SITE_DESCRIPTION =
  'Goldberg IPIP Big-Five 50문항 기반 5요인 성격검사. 요인별 백분위와 한국어 AI 해석, OpenAlex에서 실시간 검색한 학술 논문 인용까지. 10분, 익명, 1,500원 (쿠폰 시 무료).'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TAGLINE, template: '%s · kirok' },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: 'kirok' }],
  keywords: [
    'Big Five',
    'IPIP-50',
    'Goldberg',
    '5요인 성격검사',
    '성격검사',
    '기질검사',
    'AI 해석',
    'OpenAlex',
    '심리검사',
    'MBTI 대안',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    siteName: SITE_NAME,
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
}

const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description: SITE_DESCRIPTION,
  knowsAbout: [
    'Big Five personality model',
    'IPIP-50',
    'Five-Factor Model',
    'Personality assessment',
    'Psychometrics',
  ],
}

const WEBSITE_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'ko-KR',
  description: SITE_DESCRIPTION,
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-white text-[var(--ink)]">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_LD) }}
        />
      </body>
    </html>
  )
}
