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

export const InterpretationSchema = z.object({
  overall: z.string().min(1),
  factors: z.record(z.string(), z.string().min(1)),
  suggestions: z.array(z.string().min(1)),
})
export type Interpretation = z.infer<typeof InterpretationSchema>

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
