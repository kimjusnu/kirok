import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  ADMIN_COOKIE_NAME,
  checkAdminPassword,
  signAdminToken,
} from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RequestSchema = z.object({ password: z.string().min(1).max(200) })

export async function POST(request: Request) {
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

  if (!checkAdminPassword(parsed.data.password)) {
    // Small delay to dampen brute-force. Not a full defense.
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 })
  }

  let token: string
  try {
    token = await signAdminToken()
  } catch (error) {
    console.error('admin/login: sign failed', error)
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })
  return response
}
