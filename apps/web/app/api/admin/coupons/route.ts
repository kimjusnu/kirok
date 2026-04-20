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
  const { data, error } = await db
    .from('coupons')
    .insert({
      code: d.code,
      discount_type: d.discountType,
      discount_value: d.discountValue,
      max_uses: d.maxUses ?? null,
      expires_at: d.expiresAt ?? null,
      note: d.note ?? null,
      is_active: true,
      is_public: d.isPublic ?? false,
    })
    .select('id, code')
    .single()

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json({ error: 'code_already_exists' }, { status: 409 })
    }
    console.error('admin/coupons: insert failed', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, id: data.id, code: data.code })
}
