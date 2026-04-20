import { z } from 'zod'

const UUID = z.string().uuid()
const COUPON_CODE = z
  .string()
  .min(3)
  .max(64)
  .regex(
    /^[A-Z0-9_-]+$/i,
    'coupon code must be alphanumeric, underscore, or hyphen',
  )

export const CouponValidateRequest = z.object({
  code: COUPON_CODE,
  sessionId: UUID,
})
export type CouponValidateRequest = z.infer<typeof CouponValidateRequest>

/** Request to initialize a Kakao Pay payment (server-side prepares `ready`). */
export const PaymentReadyRequest = z.object({
  sessionId: UUID,
  /**
   * Optional partial-discount coupon code. For FREE coupons, clients must
   * use /api/payments/free instead — ready does not permit 0-amount orders.
   */
  couponCode: COUPON_CODE.optional(),
})
export type PaymentReadyRequest = z.infer<typeof PaymentReadyRequest>

/** Request to finalize a Kakao Pay payment after user returns with pg_token. */
export const PaymentApproveRequest = z.object({
  sessionId: UUID,
  pgToken: z.string().min(1),
})
export type PaymentApproveRequest = z.infer<typeof PaymentApproveRequest>

export const PaymentFreeRequest = z.object({
  sessionId: UUID,
  couponCode: COUPON_CODE,
})
export type PaymentFreeRequest = z.infer<typeof PaymentFreeRequest>
