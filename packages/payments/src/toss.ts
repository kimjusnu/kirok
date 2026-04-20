/**
 * Toss Payments v1 API client — server-only.
 * Docs: https://docs.tosspayments.com/reference
 */

export interface TossConfirmInput {
  paymentKey: string
  orderId: string
  amount: number
}

export interface TossConfirmSuccess {
  ok: true
  paymentKey: string
  orderId: string
  totalAmount: number
  status: string
  approvedAt: string
  method: string | null
  raw: unknown
}

export interface TossConfirmFailure {
  ok: false
  code: string
  message: string
  raw: unknown
}

export type TossConfirmResult = TossConfirmSuccess | TossConfirmFailure

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm'

function requireSecretKey(): string {
  const key = process.env.TOSS_SECRET_KEY
  if (!key) {
    throw new Error('Missing required environment variable: TOSS_SECRET_KEY')
  }
  return key
}

function basicAuthHeader(secretKey: string): string {
  const encoded = Buffer.from(`${secretKey}:`).toString('base64')
  return `Basic ${encoded}`
}

/**
 * Confirm a Toss payment by re-verifying paymentKey+orderId+amount server-side.
 * The caller MUST have already compared `amount` against the expected session price
 * before calling — Toss confirms the amount the client claimed, so trusting client
 * input alone is unsafe.
 */
export async function confirmTossPayment(
  input: TossConfirmInput,
  deps: { secretKey?: string; fetchImpl?: typeof fetch } = {},
): Promise<TossConfirmResult> {
  const secretKey = deps.secretKey ?? requireSecretKey()
  const fetchImpl = deps.fetchImpl ?? fetch

  let response: Response
  try {
    response = await fetchImpl(TOSS_CONFIRM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: basicAuthHeader(secretKey),
      },
      body: JSON.stringify(input),
    })
  } catch (error) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'unknown network error',
      raw: null,
    }
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    return {
      ok: false,
      code: 'INVALID_RESPONSE',
      message: 'Toss response was not valid JSON',
      raw: null,
    }
  }

  if (!response.ok) {
    const err = body as { code?: string; message?: string }
    return {
      ok: false,
      code: err.code ?? `HTTP_${response.status}`,
      message: err.message ?? 'Toss confirm failed',
      raw: body,
    }
  }

  const payload = body as {
    paymentKey?: string
    orderId?: string
    totalAmount?: number
    status?: string
    approvedAt?: string
    method?: string | null
  }

  if (
    !payload.paymentKey ||
    !payload.orderId ||
    typeof payload.totalAmount !== 'number' ||
    !payload.status ||
    !payload.approvedAt
  ) {
    return {
      ok: false,
      code: 'MALFORMED_SUCCESS',
      message: 'Toss response missing required fields',
      raw: body,
    }
  }

  return {
    ok: true,
    paymentKey: payload.paymentKey,
    orderId: payload.orderId,
    totalAmount: payload.totalAmount,
    status: payload.status,
    approvedAt: payload.approvedAt,
    method: payload.method ?? null,
    raw: body,
  }
}
