import { describe, expect, it } from 'vitest'
import { calculateDiscount, previewCoupon } from './coupon'
import type { CouponRow } from '@temperament/db'

describe('calculateDiscount', () => {
  it('free: always zero', () => {
    const r = calculateDiscount({ basePriceKrw: 1200, discountType: 'free', discountValue: 0 })
    expect(r.finalAmountKrw).toBe(0)
    expect(r.discountAmountKrw).toBe(1200)
    expect(r.isFree).toBe(true)
  })

  it('fixed: subtracts and clamps to 0', () => {
    expect(calculateDiscount({ basePriceKrw: 1200, discountType: 'fixed', discountValue: 500 }).finalAmountKrw).toBe(700)
    expect(calculateDiscount({ basePriceKrw: 1200, discountType: 'fixed', discountValue: 5000 }).finalAmountKrw).toBe(0)
  })

  it('percent: rounds half away from zero', () => {
    expect(calculateDiscount({ basePriceKrw: 1200, discountType: 'percent', discountValue: 10 }).finalAmountKrw).toBe(1080)
    expect(calculateDiscount({ basePriceKrw: 1200, discountType: 'percent', discountValue: 100 }).finalAmountKrw).toBe(0)
    expect(calculateDiscount({ basePriceKrw: 999, discountType: 'percent', discountValue: 50 }).finalAmountKrw).toBe(500)
  })

  it('percent: rejects out-of-range values', () => {
    expect(() => calculateDiscount({ basePriceKrw: 1200, discountType: 'percent', discountValue: -1 })).toThrow()
    expect(() => calculateDiscount({ basePriceKrw: 1200, discountType: 'percent', discountValue: 101 })).toThrow()
  })

  it('rejects negative base price', () => {
    expect(() => calculateDiscount({ basePriceKrw: -1, discountType: 'free', discountValue: 0 })).toThrow()
  })
})

function makeCoupon(overrides: Partial<CouponRow> = {}): CouponRow {
  return {
    id: 'id',
    code: 'CODE',
    discount_type: 'free',
    discount_value: 0,
    max_uses: null,
    used_count: 0,
    expires_at: null,
    note: null,
    is_active: true,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('previewCoupon', () => {
  it('null → not_found', () => {
    expect(previewCoupon(null).status).toBe('not_found')
  })

  it('inactive coupon', () => {
    expect(previewCoupon(makeCoupon({ is_active: false })).status).toBe('inactive')
  })

  it('expired coupon', () => {
    const past = new Date('2020-01-01').toISOString()
    expect(previewCoupon(makeCoupon({ expires_at: past })).status).toBe('expired')
  })

  it('exhausted coupon', () => {
    expect(previewCoupon(makeCoupon({ max_uses: 10, used_count: 10 })).status).toBe('exhausted')
  })

  it('valid coupon returns discount info', () => {
    const preview = previewCoupon(
      makeCoupon({ discount_type: 'percent', discount_value: 50, max_uses: 100, used_count: 1 }),
    )
    expect(preview.status).toBe('valid')
    expect(preview.discountType).toBe('percent')
    expect(preview.discountValue).toBe(50)
  })

  it('unlimited max_uses (null)', () => {
    expect(previewCoupon(makeCoupon({ max_uses: null, used_count: 99999 })).status).toBe('valid')
  })

  it('future-dated coupon is valid', () => {
    const future = new Date(Date.now() + 86400_000).toISOString()
    expect(previewCoupon(makeCoupon({ expires_at: future })).status).toBe('valid')
  })
})
