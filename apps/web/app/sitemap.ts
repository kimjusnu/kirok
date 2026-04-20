import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/test/ipip50`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // 약관·정책: 신뢰·심사 관점에서 낮지 않게 잡아야 Naver/Google이 E-E-A-T
    // 신호로 인식. 0.2 → 0.4.
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/refund`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]
}
