import { z } from 'zod'

const UUID = z.string().uuid()
const COUPON_CODE = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[A-Z0-9_-]+$/i, 'coupon code must be alphanumeric, underscore, or hyphen')

export const CouponValidateRequest = z.object({
  code: COUPON_CODE,
  sessionId: UUID,
})
export type CouponValidateRequest = z.infer<typeof CouponValidateRequest>

export const PaymentConfirmRequest = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().int().positive(),
  sessionId: UUID,
})
export type PaymentConfirmRequest = z.infer<typeof PaymentConfirmRequest>

export const PaymentFreeRequest = z.object({
  sessionId: UUID,
  couponCode: COUPON_CODE,
})
export type PaymentFreeRequest = z.infer<typeof PaymentFreeRequest>
