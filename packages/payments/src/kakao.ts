/**
 * Kakao Pay Online v1 API client — server-only.
 *
 * Flow: ready → user redirects to Kakao → on success returns via approval_url
 * with ?pg_token=... → approve (finalizes the payment).
 *
 * Docs: https://developers.kakaopay.com/docs/payment/online
 */

const KAKAO_READY_URL =
  'https://open-api.kakaopay.com/online/v1/payment/ready'
const KAKAO_APPROVE_URL =
  'https://open-api.kakaopay.com/online/v1/payment/approve'

function requireSecretKey(): string {
  const key = process.env.KAKAO_PAY_SECRET_KEY
  if (!key) {
    throw new Error('Missing required environment variable: KAKAO_PAY_SECRET_KEY')
  }
  return key
}

function authHeader(secretKey: string): string {
  return `SECRET_KEY ${secretKey}`
}

/** Prefix used by the v1 API for all secret-key-based auth. */
export function buildKakaoAuthHeader(secretKey: string): string {
  return authHeader(secretKey)
}

export interface KakaoReadyInput {
  cid: string
  partnerOrderId: string
  partnerUserId: string
  itemName: string
  quantity: number
  totalAmount: number
  taxFreeAmount: number
  approvalUrl: string
  cancelUrl: string
  failUrl: string
}

export interface KakaoReadySuccess {
  ok: true
  tid: string
  nextRedirectPcUrl: string
  nextRedirectMobileUrl: string
  nextRedirectAppUrl: string
  createdAt: string
  raw: unknown
}

export interface KakaoReadyFailure {
  ok: false
  code: string
  message: string
  raw: unknown
}

export type KakaoReadyResult = KakaoReadySuccess | KakaoReadyFailure

export interface KakaoApproveInput {
  cid: string
  tid: string
  partnerOrderId: string
  partnerUserId: string
  pgToken: string
}

export interface KakaoApproveSuccess {
  ok: true
  aid: string
  tid: string
  cid: string
  partnerOrderId: string
  partnerUserId: string
  paymentMethodType: string
  totalAmount: number
  approvedAt: string
  itemName: string
  raw: unknown
}

export interface KakaoApproveFailure {
  ok: false
  code: string
  message: string
  raw: unknown
}

export type KakaoApproveResult = KakaoApproveSuccess | KakaoApproveFailure

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function kakaoError(
  code: string,
  message: string,
  raw: unknown,
): KakaoReadyFailure {
  return { ok: false, code, message, raw }
}

/**
 * Prepare a Kakao Pay payment. Returns tid + redirect URLs.
 * The caller must persist `tid` against the session and redirect the user to
 * the device-appropriate next_redirect_* URL.
 */
export async function readyKakaoPayment(
  input: KakaoReadyInput,
  deps: { secretKey?: string; fetchImpl?: typeof fetch } = {},
): Promise<KakaoReadyResult> {
  const secretKey = deps.secretKey ?? requireSecretKey()
  const fetchImpl = deps.fetchImpl ?? fetch

  let response: Response
  try {
    response = await fetchImpl(KAKAO_READY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader(secretKey),
      },
      body: JSON.stringify({
        cid: input.cid,
        partner_order_id: input.partnerOrderId,
        partner_user_id: input.partnerUserId,
        item_name: input.itemName,
        quantity: input.quantity,
        total_amount: input.totalAmount,
        tax_free_amount: input.taxFreeAmount,
        approval_url: input.approvalUrl,
        cancel_url: input.cancelUrl,
        fail_url: input.failUrl,
      }),
    })
  } catch (error) {
    return kakaoError(
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'network error',
      null,
    )
  }

  const body = await parseJson(response)

  if (!response.ok) {
    const err = body as { error_code?: number | string; error_message?: string } | null
    return kakaoError(
      String(err?.error_code ?? `HTTP_${response.status}`),
      err?.error_message ?? 'kakao ready failed',
      body,
    )
  }

  const p = body as {
    tid?: string
    next_redirect_pc_url?: string
    next_redirect_mobile_url?: string
    next_redirect_app_url?: string
    created_at?: string
  } | null

  if (
    !p?.tid ||
    !p.next_redirect_pc_url ||
    !p.next_redirect_mobile_url ||
    !p.created_at
  ) {
    return kakaoError(
      'MALFORMED_SUCCESS',
      'kakao ready response missing required fields',
      body,
    )
  }

  return {
    ok: true,
    tid: p.tid,
    nextRedirectPcUrl: p.next_redirect_pc_url,
    nextRedirectMobileUrl: p.next_redirect_mobile_url,
    nextRedirectAppUrl: p.next_redirect_app_url ?? '',
    createdAt: p.created_at,
    raw: body,
  }
}

/**
 * Finalize a Kakao Pay payment using the pg_token Kakao returned to the
 * approval_url. Partner_order_id, partner_user_id, and tid MUST match the
 * values used at ready time.
 */
export async function approveKakaoPayment(
  input: KakaoApproveInput,
  deps: { secretKey?: string; fetchImpl?: typeof fetch } = {},
): Promise<KakaoApproveResult> {
  const secretKey = deps.secretKey ?? requireSecretKey()
  const fetchImpl = deps.fetchImpl ?? fetch

  let response: Response
  try {
    response = await fetchImpl(KAKAO_APPROVE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader(secretKey),
      },
      body: JSON.stringify({
        cid: input.cid,
        tid: input.tid,
        partner_order_id: input.partnerOrderId,
        partner_user_id: input.partnerUserId,
        pg_token: input.pgToken,
      }),
    })
  } catch (error) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'network error',
      raw: null,
    }
  }

  const body = await parseJson(response)

  if (!response.ok) {
    const err = body as { error_code?: number | string; error_message?: string } | null
    return {
      ok: false,
      code: String(err?.error_code ?? `HTTP_${response.status}`),
      message: err?.error_message ?? 'kakao approve failed',
      raw: body,
    }
  }

  const p = body as {
    aid?: string
    tid?: string
    cid?: string
    partner_order_id?: string
    partner_user_id?: string
    payment_method_type?: string
    amount?: { total?: number }
    approved_at?: string
    item_name?: string
  } | null

  if (
    !p?.aid ||
    !p.tid ||
    !p.cid ||
    !p.partner_order_id ||
    !p.partner_user_id ||
    !p.amount ||
    typeof p.amount.total !== 'number' ||
    !p.approved_at
  ) {
    return {
      ok: false,
      code: 'MALFORMED_SUCCESS',
      message: 'kakao approve response missing required fields',
      raw: body,
    }
  }

  return {
    ok: true,
    aid: p.aid,
    tid: p.tid,
    cid: p.cid,
    partnerOrderId: p.partner_order_id,
    partnerUserId: p.partner_user_id,
    paymentMethodType: p.payment_method_type ?? '',
    totalAmount: p.amount.total,
    approvedAt: p.approved_at,
    itemName: p.item_name ?? '',
    raw: body,
  }
}
