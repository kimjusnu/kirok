import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RequestSchema = z
  .object({
    code: z
      .string()
      .min(3)
      .max(64)
      .regex(/^[A-Z0-9_-]+$/, 'code must be alphanumeric, underscore or hyphen'),
    discountType: z.enum(['free', 'percent', 'fixed']),
    discountValue: z.number().int().min(0).max(1_000_000),
    maxUses: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
    note: z.string().max(200).nullable().optional(),
    // true 로 발급하면 결제 페이지 드롭다운에 즉시 노출.
    isPublic: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.discountType === 'free' ||
      (d.discountType === 'percent' && d.discountValue > 0 && d.discountValue <= 100) ||
      (d.discountType === 'fixed' && d.discountValue > 0),
    { message: 'invalid discountValue for type' },
  )

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  const parsed = RequestSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_request', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const d = parsed.data

  const db = createServiceClient()
  const base = {
    code: d.code,
    discount_type: d.discountType,
    discount_value: d.discountValue,
    max_uses: d.maxUses ?? null,
    expires_at: d.expiresAt ?? null,
    note: d.note ?? null,
    is_active: true,
  }

  // 먼저 is_public 포함해서 insert 시도. 컬럼 부재(42703/PGRST204)면 레거시
  // 스키마로 폴백 — 마이그레이션 0008이 아직 프로덕션에 적용 안 됐어도
  // 쿠폰 발급 자체는 끊기지 않게 한다.
  let result = await db
    .from('coupons')
    .insert({ ...base, is_public: d.isPublic ?? false })
    .select('id, code')
    .single()

  if (result.error) {
    const code = (result.error as { code?: string }).code
    if (code === '42703' || code === 'PGRST204') {
      result = await db.from('coupons').insert(base).select('id, code').single()
    }
  }

  if (result.error) {
    if ((result.error as { code?: string }).code === '23505') {
      return NextResponse.json({ error: 'code_already_exists' }, { status: 409 })
    }
    console.error('admin/coupons: insert failed', result.error)
    return NextResponse.json(
      { error: 'internal_error', message: result.error.message },
      { status: 500 },
    )
  }
  return NextResponse.json({ ok: true, id: result.data.id, code: result.data.code })
}
