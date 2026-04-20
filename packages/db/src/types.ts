/**
 * Hand-written DB types matching supabase/migrations/0001_initial.sql.
 *
 * Row types are `type` aliases (not `interface`) because supabase-js requires
 * each Table entry to satisfy `Record<string, unknown>`; TypeScript treats
 * interface declarations as declaration-mergeable and rejects the index-
 * signature check, so interfaces would make the whole Database type collapse
 * to `never` at query sites.
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

export type TestRow = {
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

export type TestItemRow = {
  id: string
  test_id: string
  order_num: number
  item_text_ko: string
  item_text_en: string
  facet: string
  reverse_scored: boolean
  scale_type: ScaleType
}

export type SessionRow = {
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

export type ResponseRow = {
  id: string
  session_id: string
  item_id: string
  score: number
  answered_at: string
}

export type ResultRow = {
  id: string
  session_id: string
  raw_scores: Json
  percentiles: Json
  ai_interpretation: string | null
  citations: Json
  generated_at: string
}

export type CouponRow = {
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

export type CouponRedemptionRow = {
  id: string
  coupon_id: string
  session_id: string
  redeemed_at: string
}

export type PaymentRow = {
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

export type Gender = 'male' | 'female' | 'other' | 'prefer_not'
export type AgeRange = 'teens' | '20s' | '30s' | '40s' | '50s' | '60_plus' | 'prefer_not'

export type ParticipantProfileRow = {
  session_id: string
  display_name: string
  gender: Gender
  age_range: AgeRange
  consent_at: string
  created_at: string
}

export type UseCouponResult =
  | { ok: true; discount_type: DiscountType; discount_value: number }
  | { ok: false; error: 'not_found' | 'expired' | 'exhausted' | 'already_used' }

export type Database = {
  public: {
    Tables: {
      tests: {
        Row: TestRow
        Insert: Partial<TestRow>
        Update: Partial<TestRow>
        Relationships: []
      }
      test_items: {
        Row: TestItemRow
        Insert: Partial<TestItemRow>
        Update: Partial<TestItemRow>
        Relationships: []
      }
      sessions: {
        Row: SessionRow
        Insert: Partial<SessionRow>
        Update: Partial<SessionRow>
        Relationships: []
      }
      responses: {
        Row: ResponseRow
        Insert: Partial<ResponseRow>
        Update: Partial<ResponseRow>
        Relationships: []
      }
      results: {
        Row: ResultRow
        Insert: Partial<ResultRow>
        Update: Partial<ResultRow>
        Relationships: []
      }
      coupons: {
        Row: CouponRow
        Insert: Partial<CouponRow>
        Update: Partial<CouponRow>
        Relationships: []
      }
      coupon_redemptions: {
        Row: CouponRedemptionRow
        Insert: Partial<CouponRedemptionRow>
        Update: Partial<CouponRedemptionRow>
        Relationships: []
      }
      payments: {
        Row: PaymentRow
        Insert: Partial<PaymentRow>
        Update: Partial<PaymentRow>
        Relationships: []
      }
      participant_profiles: {
        Row: ParticipantProfileRow
        Insert: Partial<ParticipantProfileRow>
        Update: Partial<ParticipantProfileRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      use_coupon: {
        Args: { p_code: string; p_session_id: string }
        Returns: UseCouponResult
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
