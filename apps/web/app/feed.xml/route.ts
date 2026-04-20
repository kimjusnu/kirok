// RSS 2.0 피드. 네이버 Search Advisor는 RSS 제출 시 갱신 감지가 사이트맵보다
// 빨라서 Naver 색인 선점에 유리. 현재는 고정 페이지가 주라 소수 항목이지만,
// 향후 블로그·연구 노트 추가 시 이 라우트만 확장하면 됨.

export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const revalidate = 3600

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '')

type Item = {
  title: string
  link: string
  description: string
  pubDate: string
  guid: string
  category?: string
}

// 고정 발행일(런칭 기준). 컨텐츠 실제 변경 시에만 갱신 — AI 크롤러는
// pubDate를 신뢰성 판단에 쓰므로 자주 흔들지 않는 편이 좋다.
const LAUNCH_DATE = new Date('2026-04-20T00:00:00+09:00').toUTCString()

const ITEMS: Item[] = [
  {
    title: 'kirok — Big Five 성격검사 (IPIP-50)',
    link: `${SITE_URL}/`,
    description:
      'Goldberg IPIP-50 50문항 기반 Big Five 성격검사. 5요인 백분위, 한국어 AI 해석, OpenAlex 학술 논문 인용을 익명으로 10분 안에 제공합니다.',
    pubDate: LAUNCH_DATE,
    guid: `${SITE_URL}/`,
    category: '성격검사',
  },
  {
    title: 'IPIP-50 검사 시작하기',
    link: `${SITE_URL}/test/ipip50`,
    description:
      'IPIP-50은 Goldberg(1992)가 공개한 Big Five 측정용 50문항 자기보고 검사입니다. 닉네임·성별·연령대만 입력하고 10분 안에 끝납니다.',
    pubDate: LAUNCH_DATE,
    guid: `${SITE_URL}/test/ipip50`,
    category: '성격검사',
  },
  {
    title: '이용약관',
    link: `${SITE_URL}/terms`,
    description: 'kirok 서비스 이용약관 전문. 디지털 콘텐츠 특성 고지 포함.',
    pubDate: LAUNCH_DATE,
    guid: `${SITE_URL}/terms`,
    category: '법정',
  },
  {
    title: '개인정보처리방침',
    link: `${SITE_URL}/privacy`,
    description:
      '수집 항목·목적·보유기간·위탁처리업체 전문. 실명·연락처는 수집하지 않습니다.',
    pubDate: LAUNCH_DATE,
    guid: `${SITE_URL}/privacy`,
    category: '법정',
  },
  {
    title: '환불정책',
    link: `${SITE_URL}/refund`,
    description:
      '디지털 콘텐츠(리포트) 환불 기준. 링크 미열람 시 전액 환불, 1회 이상 열람 후에는 환불 제한.',
    pubDate: LAUNCH_DATE,
    guid: `${SITE_URL}/refund`,
    category: '법정',
  },
]

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(): Promise<Response> {
  const now = new Date().toUTCString()
  const itemsXml = ITEMS.map(
    (i) => `
    <item>
      <title>${escapeXml(i.title)}</title>
      <link>${escapeXml(i.link)}</link>
      <description>${escapeXml(i.description)}</description>
      <pubDate>${i.pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(i.guid)}</guid>
      ${i.category ? `<category>${escapeXml(i.category)}</category>` : ''}
    </item>`,
  ).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>kirok — Big Five 성격검사</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Goldberg IPIP-50 기반 Big Five 성격검사. 5요인 백분위와 AI 해석, OpenAlex 학술 논문 인용을 익명으로 제공합니다.</description>
    <language>ko-KR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>kirok</generator>
    <ttl>60</ttl>${itemsXml}
  </channel>
</rss>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
