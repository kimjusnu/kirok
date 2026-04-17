/**
 * Hand-written DB types matching supabase/migrations/0001_initial.sql.
 *
 * To replace with CLI-generated types after migration is applied:
 *   pnpm --filter @temperament/db gen:types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ScaleType = 'likert5' | 'likert7'
export type DiscountType = 'percent' | 'fixed' | 'free'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'canceled'

export interface TestRow {
  id: string
  slug: string
  name_ko: string
  name_en: string
  description: string | null
  total_items: number
  estimated_minutes: number
  price_krw: number
  anchor_price_krw: number
  is_active: boolean
  created_at: string
}

export interface TestItemRow {
  id: string
  test_id: string
  order_num: number
  item_text_ko: string
  item_text_en: string
  facet: string
  reverse_scored: boolean
  scale_type: ScaleType
}

export interface SessionRow {
  id: string
  test_id: string
  access_token: string
  started_at: string
  completed_at: string | null
  paid_at: string | null
  payment_amount: number | null
  coupon_code: string | null
  expires_at: string | null
}

export interface ResponseRow {
  id: string
  session_id: string
  item_id: string
  score: number
  answered_at: string
}

export interface ResultRow {
  id: string
  session_id: string
  raw_scores: Json
  percentiles: Json
  ai_interpretation: string | null
  citations: Json
  generated_at: string
}

export interface CouponRow {
  id: string
  code: string
  discount_type: DiscountType
  discount_value: number
  max_uses: number | null
  used_count: number
  expires_at: string | null
  note: string | null
  is_active: boolean
  created_at: string
}

export interface PaymentRow {
  id: string
  session_id: string
  toss_payment_key: string | null
  toss_order_id: string | null
  amount: number
  status: PaymentStatus
  raw_response: Json | null
  created_at: string
  updated_at: string
}

export type UseCouponResult =
  | { ok: true; discount_type: DiscountType; discount_value: number }
  | { ok: false; error: 'not_found' | 'expired' | 'exhausted' | 'already_used' }

export interface Database {
  public: {
    Tables: {
      tests: { Row: TestRow; Insert: Partial<TestRow>; Update: Partial<TestRow> }
      test_items: { Row: TestItemRow; Insert: Partial<TestItemRow>; Update: Partial<TestItemRow> }
      sessions: { Row: SessionRow; Insert: Partial<SessionRow>; Update: Partial<SessionRow> }
      responses: { Row: ResponseRow; Insert: Partial<ResponseRow>; Update: Partial<ResponseRow> }
      results: { Row: ResultRow; Insert: Partial<ResultRow>; Update: Partial<ResultRow> }
      coupons: { Row: CouponRow; Insert: Partial<CouponRow>; Update: Partial<CouponRow> }
      coupon_redemptions: {
        Row: { id: string; coupon_id: string; session_id: string; redeemed_at: string }
        Insert: Partial<{ id: string; coupon_id: string; session_id: string; redeemed_at: string }>
        Update: Partial<{ id: string; coupon_id: string; session_id: string; redeemed_at: string }>
      }
      payments: { Row: PaymentRow; Insert: Partial<PaymentRow>; Update: Partial<PaymentRow> }
    }
    Views: Record<string, never>
    Functions: {
      use_coupon: {
        Args: { p_code: string; p_session_id: string }
        Returns: UseCouponResult
      }
    }
    Enums: Record<string, never>
  }
}
