import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// `active` 또는 `public` 둘 중 하나 이상 포함. 두 토글을 별도 엔드포인트로
// 쪼개는 대신 필드 단위 업데이트로 처리해 UI 추가 시에도 경로 증식을 막음.
const RequestSchema = z
  .object({
    active: z.boolean().optional(),
    public: z.boolean().optional(),
  })
  .refine((d) => d.active != null || d.public != null, {
    message: 'active 또는 public 중 하나는 필수',
  })

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const idParse = z.string().uuid().safeParse(params.id)
  if (!idParse.success) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  const parsed = RequestSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const patch: { is_active?: boolean; is_public?: boolean } = {}
  if (parsed.data.active != null) patch.is_active = parsed.data.active
  if (parsed.data.public != null) patch.is_public = parsed.data.public

  const db = createServiceClient()
  const { error } = await db.from('coupons').update(patch).eq('id', idParse.data)
  if (error) {
    console.error('coupons toggle failed', error)
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 },
    )
  }
  return NextResponse.json({ ok: true })
}
