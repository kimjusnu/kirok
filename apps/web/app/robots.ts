import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const ADMIN_BASE = process.env.ADMIN_BASE_PATH ?? '/admin'

// AEO/GEO: explicitly allow answer-engine / LLM crawlers so the site can be
// cited in ChatGPT, Perplexity, Google AI Overview, Claude, etc.
// Reference: 2026 zero-click landscape — being indexed != being retrieved.
const AI_CRAWLERS = [
  'GPTBot', // OpenAI training + browsing
  'OAI-SearchBot', // ChatGPT Search
  'ChatGPT-User', // on-demand fetches from ChatGPT tool use
  'ClaudeBot', // Anthropic training
  'Claude-Web', // Anthropic Web
  'anthropic-ai', // legacy Anthropic
  'PerplexityBot', // Perplexity index
  'Perplexity-User', // Perplexity live fetch
  'Google-Extended', // Bard / Gemini / Vertex training
  'Applebot-Extended', // Apple Intelligence
  'CCBot', // Common Crawl (underlies many AI datasets)
  'Bytespider', // ByteDance / Doubao
  'Amazonbot',
  'DuckAssistBot',
  'Meta-ExternalAgent', // Meta AI
  'Meta-ExternalFetcher',
  'cohere-ai',
  'YouBot',
  'Diffbot',
  'Timpibot',
]

export default function robots(): MetadataRoute.Robots {
  // 개인 리포트 경로는 access_token이 URL에 노출되어 있어 크롤러가 긁으면
  // 타인의 리포트에 접근하는 경로가 열리므로 전면 차단.
  const globalDisallow = [
    `${ADMIN_BASE}/`,
    '/admin/',
    '/api/admin/',
    '/report/',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: globalDisallow,
      },
      ...AI_CRAWLERS.map((ua) => ({
        userAgent: ua,
        allow: '/',
        disallow: globalDisallow,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
