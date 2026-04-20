import { describe, expect, it, vi } from 'vitest'
import { approveKakaoPayment, readyKakaoPayment } from './kakao'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('readyKakaoPayment', () => {
  it('sends POST with SECRET_KEY auth and returns redirect URLs on success', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () =>
      jsonResponse({
        tid: 'T1234567890',
        next_redirect_pc_url: 'https://online-pay.kakao.com/pc/...',
        next_redirect_mobile_url: 'https://online-pay.kakao.com/m/...',
        next_redirect_app_url: 'kakaotalk://...',
        created_at: '2026-04-20T00:00:00',
      }),
    ) as unknown as typeof fetch
    const fetchMock = vi.mocked(fetchImpl)

    const result = await readyKakaoPayment(
      {
        cid: 'TC0ONETIME',
        partnerOrderId: 'order_abc',
        partnerUserId: 'user_abc',
        itemName: 'kirok 리포트',
        quantity: 1,
        totalAmount: 1500,
        taxFreeAmount: 0,
        approvalUrl: 'https://site/approve',
        cancelUrl: 'https://site/cancel',
        failUrl: 'https://site/fail',
      },
      { secretKey: 'DEV_SECRET_abc', fetchImpl },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.tid).toBe('T1234567890')
    expect(result.nextRedirectPcUrl).toMatch(/^https:\/\//)

    const [, init] = fetchMock.mock.calls[0]!
    expect(init?.method).toBe('POST')
    const headers = init?.headers as Record<string, string>
    expect(headers.Authorization).toBe('SECRET_KEY DEV_SECRET_abc')
    expect(headers['Content-Type']).toBe('application/json')
    const sent = JSON.parse(init?.body as string)
    expect(sent.partner_order_id).toBe('order_abc')
    expect(sent.total_amount).toBe(1500)
  })

  it('returns failure with code when Kakao responds with error', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () =>
      jsonResponse(
        { error_code: -702, error_message: 'invalid amount' },
        400,
      ),
    ) as unknown as typeof fetch

    const result = await readyKakaoPayment(
      {
        cid: 'TC0ONETIME',
        partnerOrderId: 'x',
        partnerUserId: 'y',
        itemName: 'x',
        quantity: 1,
        totalAmount: 1,
        taxFreeAmount: 0,
        approvalUrl: 'https://s/a',
        cancelUrl: 'https://s/c',
        failUrl: 'https://s/f',
      },
      { secretKey: 'k', fetchImpl },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('-702')
    expect(result.message).toBe('invalid amount')
  })

  it('returns MALFORMED_SUCCESS when tid is missing', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () =>
      jsonResponse({ next_redirect_pc_url: 'x' }),
    ) as unknown as typeof fetch

    const result = await readyKakaoPayment(
      {
        cid: 'TC0ONETIME',
        partnerOrderId: 'x',
        partnerUserId: 'y',
        itemName: 'x',
        quantity: 1,
        totalAmount: 1,
        taxFreeAmount: 0,
        approvalUrl: 'https://s/a',
        cancelUrl: 'https://s/c',
        failUrl: 'https://s/f',
      },
      { secretKey: 'k', fetchImpl },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('MALFORMED_SUCCESS')
  })
})

describe('approveKakaoPayment', () => {
  it('sends pg_token and returns total amount on success', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () =>
      jsonResponse({
        aid: 'A123',
        tid: 'T123',
        cid: 'TC0ONETIME',
        partner_order_id: 'order_abc',
        partner_user_id: 'user_abc',
        payment_method_type: 'MONEY',
        amount: { total: 1500, tax_free: 0, vat: 136, point: 0, discount: 0 },
        approved_at: '2026-04-20T00:01:00',
        item_name: 'kirok 리포트',
      }),
    ) as unknown as typeof fetch
    const fetchMock = vi.mocked(fetchImpl)

    const result = await approveKakaoPayment(
      {
        cid: 'TC0ONETIME',
        tid: 'T123',
        partnerOrderId: 'order_abc',
        partnerUserId: 'user_abc',
        pgToken: 'pgt_xxx',
      },
      { secretKey: 'DEV_SECRET_abc', fetchImpl },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.totalAmount).toBe(1500)
    expect(result.paymentMethodType).toBe('MONEY')

    const [, init] = fetchMock.mock.calls[0]!
    const sent = JSON.parse(init?.body as string)
    expect(sent.pg_token).toBe('pgt_xxx')
  })

  it('returns failure on HTTP error', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () =>
      jsonResponse({ error_code: -780, error_message: 'already approved' }, 400),
    ) as unknown as typeof fetch

    const result = await approveKakaoPayment(
      {
        cid: 'TC0ONETIME',
        tid: 'T123',
        partnerOrderId: 'o',
        partnerUserId: 'u',
        pgToken: 'x',
      },
      { secretKey: 'k', fetchImpl },
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('-780')
  })
})
