import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const SITE_NAME = 'kirok'

// NNT AEO 가이드: "Title의 핵심 개념 전진 배치 (Front-load target concepts)".
// AI 크롤러·검색엔진이 가장 먼저 읽는 첫 단어에 타깃 엔티티(Big Five,
// IPIP-50, 5요인 성격검사)를 배치. 브랜드명 kirok은 후행.
const SITE_TITLE =
  'Big Five 성격검사 IPIP-50 · 5요인 백분위와 AI 해석 · kirok'

// 단정적 문체 + 엔티티 밀도 4.1× 원칙. 첫 문장에 서비스 정의 → 두 번째
// 문장에 구체 수치 → 세 번째 문장에 결정적 특징·가격. AI가 문단의 중간
// 문장(53%)을 선호하므로 핵심 팩트를 중간에 명시적으로 배치.
const SITE_DESCRIPTION =
  'kirok은 Goldberg IPIP-50 50문항 기반 Big Five 성격검사입니다. 10분 안에 개방성·성실성·외향성·우호성·신경성 5요인의 백분위, 한국어 AI 해석, OpenAlex에서 실시간 검색한 학술 논문 인용을 받습니다. 익명, 회원가입 없음, 1,500원, 리포트는 7일간 유효합니다.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: '%s · kirok' },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: 'kirok', url: SITE_URL }],
  creator: '기록(kirok)',
  publisher: '기록(kirok)',
  category: '성격검사',
  keywords: [
    'Big Five',
    'Big Five 성격검사',
    '5요인 성격검사',
    'IPIP-50',
    'Goldberg',
    'Five-Factor Model',
    'FFM',
    '개방성',
    '성실성',
    '외향성',
    '우호성',
    '신경성',
    'Openness',
    'Conscientiousness',
    'Extraversion',
    'Agreeableness',
    'Neuroticism',
    '성격검사',
    '기질검사',
    '심리검사',
    'MBTI 대안',
    'AI 해석',
    'OpenAlex',
    '논문 인용 성격검사',
    'kirok',
    '기록',
  ],
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'kirok RSS' }],
    },
  },
  openGraph: {
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'IF3-fq0lvvNTcCCxBMZFtZea5z6sFe8Z3olALXzA4QE',
    other: {
      'naver-site-verification': 'e8a3628e1e39103b9be3632ffcea88c7c2379da8',
      // 네이버는 naver-site-verification 외 별도 메타를 요구하지 않지만,
      // og:section·article:section은 Naver 카테고라이저가 부가 신호로 사용.
      'article:section': '성격검사',
      'article:tag': 'Big Five, IPIP-50, 성격검사, 5요인',
    },
  },
  other: {
    // AI 크롤러가 사이트 요약을 빠르게 찾도록 head에 명시.
    'llms.txt': `${SITE_URL}/llms.txt`,
  },
}

// ─── JSON-LD ─────────────────────────────────────────────
// 구조화 데이터는 AEO·GEO 인용률에 직접 영향. 복수 스키마를 @graph로
// 묶어서 한 번에 제공 — WebSite(사이트) + Organization(사업자) +
// WebApplication(검사 도구) + Product(리포트 상품) + HowTo(검사 절차).
const JSON_LD_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: '기록(kirok)',
      alternateName: ['kirok', '기록'],
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon`,
        width: 512,
        height: 512,
      },
      founder: { '@type': 'Person', name: '김준수' },
      foundingDate: '2026-04-20',
      taxID: '507-06-66733',
      knowsAbout: [
        'Big Five personality model',
        'Five-Factor Model',
        'IPIP-50',
        'Personality assessment',
        'Psychometrics',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: '기록',
      url: SITE_URL,
      inLanguage: 'ko-KR',
      description: SITE_DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapp`,
      name: 'IPIP-50 Big Five 성격검사',
      alternativeHeadline: '5요인 성격검사 · AI 해석 · 학술 논문 인용',
      url: `${SITE_URL}/test/ipip50`,
      applicationCategory: 'HealthApplication',
      applicationSubCategory: 'Personality Assessment',
      operatingSystem: 'Any (Web)',
      inLanguage: 'ko-KR',
      isAccessibleForFree: false,
      browserRequirements: 'Requires modern browser with JavaScript enabled.',
      provider: { '@id': `${SITE_URL}/#organization` },
      description:
        'Goldberg(1992)가 공개한 IPIP-50 50문항으로 Big Five 5요인(개방성·성실성·외향성·우호성·신경성) 백분위를 산출하고, Gemini 2.5 Flash로 한국어 서사 해석을 생성하며, OpenAlex에서 요인별 학술 논문 1~3건을 실시간 검색해 인용합니다.',
      featureList: [
        '50문항 리커트 5점 척도 자기보고',
        '5요인별 원점수·백분위·레이더 차트',
        'AI 기반 한국어 서사형 해석',
        '요인별 학술 논문 자동 인용 (OpenAlex)',
        'PDF 저장',
        '7일간 유효한 익명 고유 링크',
      ],
      offers: {
        '@type': 'Offer',
        '@id': `${SITE_URL}/#offer`,
        name: 'Big Five 리포트',
        description:
          '결제 완료 후 생성되는 Big Five 5요인 분석 리포트. 7일간 고유 링크로 열람 가능.',
        price: '1500',
        priceCurrency: 'KRW',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-04-20',
        url: `${SITE_URL}/test/ipip50`,
        seller: { '@id': `${SITE_URL}/#organization` },
      },
    },
    {
      '@type': 'Product',
      '@id': `${SITE_URL}/#product`,
      name: 'Big Five 성격검사 리포트 (IPIP-50)',
      description:
        'IPIP-50 50문항 응답을 바탕으로 생성되는 Big Five 5요인 분석 리포트. 백분위, 레이더 차트, 한국어 AI 서사 해석, 학술 논문 인용을 포함합니다. 결제 후 7일간 유효.',
      brand: { '@id': `${SITE_URL}/#organization` },
      category: 'Personality Assessment Report',
      offers: { '@id': `${SITE_URL}/#offer` },
    },
    {
      '@type': 'HowTo',
      '@id': `${SITE_URL}/#howto`,
      name: 'Big Five 성격검사를 받는 방법',
      description:
        'kirok에서 Big Five 성격검사를 받고 리포트를 받기까지의 4단계.',
      totalTime: 'PT10M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'KRW',
        value: '1500',
      },
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: '닉네임과 기본 정보 입력',
          text: '리포트에 표시할 닉네임, 성별, 연령대를 입력합니다. 실명·이메일·전화는 수집하지 않습니다.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: '50문항 응답 (약 10분)',
          text: 'IPIP-50 50문항에 리커트 5점 척도(전혀 그렇지 않다 ~ 매우 그렇다)로 응답합니다. 중도 저장이 자동으로 이뤄집니다.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: '카카오페이 결제',
          text: '카카오페이로 1,500원을 결제합니다. 결제 정보는 카카오페이가 처리하며 kirok 서버에는 카드 번호가 남지 않습니다.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: '리포트 확인',
          text: '고유 링크로 7일간 유효한 리포트를 엽니다. 5요인 백분위, AI 해석, 학술 논문 인용이 포함됩니다. PDF로 저장할 수 있습니다.',
        },
      ],
    },
  ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_GRAPH) }}
        />
      </body>
    </html>
  )
}
