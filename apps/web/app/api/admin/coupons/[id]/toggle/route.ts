import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@temperament/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RequestSchema = z.object({ active: z.boolean() })

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

  const db = createServiceClient()
  const { error } = await db
    .from('coupons')
    .update({ is_active: parsed.data.active })
    .eq('id', idParse.data)
  if (error) {
    console.error('coupons toggle failed', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
