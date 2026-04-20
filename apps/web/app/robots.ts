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
  const adminDisallow = [`${ADMIN_BASE}/`, '/admin/', '/api/admin/']

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: adminDisallow,
      },
      ...AI_CRAWLERS.map((ua) => ({
        userAgent: ua,
        allow: '/',
        disallow: adminDisallow,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
