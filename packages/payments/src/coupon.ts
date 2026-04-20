import type { CouponRow, DiscountType } from '@temperament/db'

export interface DiscountInput {
  basePriceKrw: number
  discountType: DiscountType
  discountValue: number
}

export interface DiscountResult {
  finalAmountKrw: number
  discountAmountKrw: number
  isFree: boolean
}

export function calculateDiscount(input: DiscountInput): DiscountResult {
  const { basePriceKrw, discountType, discountValue } = input

  if (basePriceKrw < 0) {
    throw new Error('basePriceKrw must be non-negative')
  }

  let finalAmountKrw: number
  if (discountType === 'free') {
    finalAmountKrw = 0
  } else if (discountType === 'fixed') {
    finalAmountKrw = Math.max(0, basePriceKrw - discountValue)
  } else if (discountType === 'percent') {
    if (discountValue < 0 || discountValue > 100) {
      throw new Error('percent discountValue must be within [0, 100]')
    }
    finalAmountKrw = Math.round(basePriceKrw * (1 - discountValue / 100))
  } else {
    throw new Error(`Unknown discountType: ${discountType as string}`)
  }

  return {
    finalAmountKrw,
    discountAmountKrw: basePriceKrw - finalAmountKrw,
    isFree: finalAmountKrw === 0,
  }
}

export type CouponPreviewStatus =
  | 'valid'
  | 'not_found'
  | 'expired'
  | 'exhausted'
  | 'inactive'

export interface CouponPreview {
  status: CouponPreviewStatus
  discountType?: DiscountType
  discountValue?: number
}

/**
 * Read-only coupon validation (does not mutate state).
 * Use to preview the discount before committing via `use_coupon` RPC.
 */
export function previewCoupon(
  coupon: Pick<
    CouponRow,
    'discount_type' | 'discount_value' | 'max_uses' | 'used_count' | 'expires_at' | 'is_active'
  > | null,
  now: Date = new Date(),
): CouponPreview {
  if (!coupon) {
    return { status: 'not_found' }
  }
  if (!coupon.is_active) {
    return { status: 'inactive' }
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now.getTime()) {
    return { status: 'expired' }
  }
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    return { status: 'exhausted' }
  }
  return {
    status: 'valid',
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
  }
}
