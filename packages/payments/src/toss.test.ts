import { describe, expect, it, vi } from 'vitest'
import { confirmTossPayment } from './toss'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('confirmTossPayment', () => {
  it('sends POST with Basic auth and JSON body', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () =>
      jsonResponse({
        paymentKey: 'pk_test',
        orderId: 'order_1',
        totalAmount: 1200,
        status: 'DONE',
        approvedAt: '2026-04-20T00:00:00+09:00',
        method: '카드',
      }),
    ) as unknown as typeof fetch
    const fetchMock = vi.mocked(fetchImpl)

    const result = await confirmTossPayment(
      { paymentKey: 'pk_test', orderId: 'order_1', amount: 1200 },
      { secretKey: 'test_sk_docs_abc', fetchImpl },
    )

    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const call = fetchMock.mock.calls[0]!
    const url = call[0] as string
    const init = call[1] as RequestInit
    expect(url).toBe('https://api.tosspayments.com/v1/payments/confirm')
    expect(init.method).toBe('POST')
    const headers = init.headers as Record<string, string>
    expect(headers['Authorization']).toMatch(/^Basic /)
    expect(headers['Content-Type']).toBe('application/json')
    const body = JSON.parse(init.body as string)
    expect(body).toEqual({ paymentKey: 'pk_test', orderId: 'order_1', amount: 1200 })
  })

  it('returns failure on non-2xx with Toss error shape', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ code: 'ALREADY_PROCESSED_PAYMENT', message: 'already done' }, 400),
    )

    const result = await confirmTossPayment(
      { paymentKey: 'pk_test', orderId: 'order_1', amount: 1200 },
      { secretKey: 'test_sk', fetchImpl: fetchImpl as unknown as typeof fetch },
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('ALREADY_PROCESSED_PAYMENT')
    }
  })

  it('returns NETWORK_ERROR when fetch throws', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('ECONNRESET')
    })

    const result = await confirmTossPayment(
      { paymentKey: 'pk', orderId: 'o', amount: 1 },
      { secretKey: 'x', fetchImpl: fetchImpl as unknown as typeof fetch },
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('NETWORK_ERROR')
      expect(result.message).toContain('ECONNRESET')
    }
  })

  it('rejects malformed success response', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ paymentKey: 'pk' }))

    const result = await confirmTossPayment(
      { paymentKey: 'pk', orderId: 'o', amount: 1 },
      { secretKey: 'x', fetchImpl: fetchImpl as unknown as typeof fetch },
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.code).toBe('MALFORMED_SUCCESS')
    }
  })
})
