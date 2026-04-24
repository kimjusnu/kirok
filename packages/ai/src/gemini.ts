/**
 * Gemini 1.5 Flash REST wrapper — server-only.
 * Docs: https://ai.google.dev/api/rest/v1beta/models/generateContent
 */

import { z } from 'zod'

export interface GeminiGenerateInput {
  prompt: string
  temperature?: number
  maxOutputTokens?: number
}

export interface GeminiSuccess {
  ok: true
  text: string
  raw: unknown
}

export interface GeminiFailure {
  ok: false
  code: string
  message: string
  raw: unknown
}

export type GeminiResult = GeminiSuccess | GeminiFailure

export const CareerCardSchema = z.object({
  title: z.string().min(1),
  reason: z.string().min(1),
  fit: z.number().int().min(1).max(5).optional(),
})
export const HobbyCardSchema = z.object({
  title: z.string().min(1),
  reason: z.string().min(1),
  fit: z.number().int().min(1).max(5).optional(),
})
export const LifeFitSchema = z.object({
  careers: z.array(CareerCardSchema).min(3).max(7),
  hobbies: z.array(HobbyCardSchema).min(3).max(7),
  narrative: z.string().min(1),
})

// A single "try this week" action. `linkedFactor` (one of openness /
// conscientiousness / extraversion / agreeableness / neuroticism) + `why`
// anchor the suggestion to the user's score vector so the Practice section
// reads as "because of your X, try Y" instead of generic advice.
export const SuggestionItemSchema = z.object({
  text: z.string().min(1),
  linkedFactor: z.string().min(1).optional(),
  why: z.string().min(1).optional(),
})
// Legacy reports stored suggestions as plain strings. `preprocess` lifts each
// string into {text} before validation so old cached interpretations keep
// rendering after the schema change.
export const SuggestionSchema = z.preprocess(
  (v) => (typeof v === 'string' ? { text: v } : v),
  SuggestionItemSchema,
)

export const InterpretationSchema = z.object({
  overall: z.string().min(1),
  factors: z.record(z.string(), z.string().min(1)),
  suggestions: z.array(SuggestionSchema),
  // Optional so legacy cached interpretations (pre-Life-Fit) still parse.
  lifeFit: LifeFitSchema.optional(),
  // Optional one-line lead shown above the Practice list (e.g. "당신의 상위
  // 두 요인과 맞닿은 한 주짜리 실험이에요"). Gemini may omit it for legacy
  // callers.
  practiceLead: z.string().min(1).optional(),
})
export type Interpretation = z.infer<typeof InterpretationSchema>
export type CareerCard = z.infer<typeof CareerCardSchema>
export type HobbyCard = z.infer<typeof HobbyCardSchema>
export type LifeFit = z.infer<typeof LifeFitSchema>
export type SuggestionItem = z.infer<typeof SuggestionItemSchema>

const DEFAULT_MODEL = 'gemini-2.5-flash'

function endpoint(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
}

function requireApiKey(): string {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('Missing required environment variable: GEMINI_API_KEY')
  }
  return key
}

export async function generateContent(
  input: GeminiGenerateInput,
  deps: { apiKey?: string; model?: string; fetchImpl?: typeof fetch } = {},
): Promise<GeminiResult> {
  const apiKey = deps.apiKey ?? requireApiKey()
  const model = deps.model ?? DEFAULT_MODEL
  const fetchImpl = deps.fetchImpl ?? fetch

  const body = {
    contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
    generationConfig: {
      temperature: input.temperature ?? 0.4,
      maxOutputTokens: input.maxOutputTokens ?? 4096,
      responseMimeType: 'application/json',
      // Gemini 2.5 Flash uses "thinking" tokens by default, consuming the
      // output budget before the actual JSON is generated. Disable to keep
      // responses deterministic and within token limits.
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  let response: Response
  try {
    response = await fetchImpl(endpoint(model, apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (error) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'unknown network error',
      raw: null,
    }
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    return { ok: false, code: 'INVALID_RESPONSE', message: 'non-JSON response', raw: null }
  }

  if (!response.ok) {
    const err = (payload as { error?: { code?: number; status?: string; message?: string } }).error
    return {
      ok: false,
      code: err?.status ?? `HTTP_${response.status}`,
      message: err?.message ?? 'Gemini request failed',
      raw: payload,
    }
  }

  const candidate = (
    payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
  ).candidates?.[0]
  const text = candidate?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  if (!text) {
    return { ok: false, code: 'EMPTY_RESPONSE', message: 'Gemini returned no text', raw: payload }
  }
  return { ok: true, text, raw: payload }
}

export function parseInterpretation(text: string): Interpretation | null {
  // Gemini may wrap JSON in ```json ... ``` despite the mime hint — strip if present.
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  try {
    const parsed = JSON.parse(cleaned)
    const result = InterpretationSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
