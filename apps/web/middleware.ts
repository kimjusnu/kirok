import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME, verifyAdminToken } from './lib/admin-auth'
import { getAdminBasePathOrEmpty } from './lib/admin-path'

const INTERNAL_UI_PREFIX = '/admin'
const INTERNAL_API_PREFIX = '/api/admin'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const base = getAdminBasePathOrEmpty()

  // Hide bare /admin and /api/admin entirely from outside.
  if (
    base &&
    (pathname === INTERNAL_UI_PREFIX ||
      pathname.startsWith(`${INTERNAL_UI_PREFIX}/`) ||
      pathname === INTERNAL_API_PREFIX ||
      pathname.startsWith(`${INTERNAL_API_PREFIX}/`))
  ) {
    return new NextResponse(null, { status: 404 })
  }

  if (!base || !pathname.startsWith(base)) {
    return NextResponse.next()
  }

  // Inside the secret-prefixed zone.
  const rest = pathname.slice(base.length) || '/'
  const isApi = rest.startsWith('/api/')
  const internalPath = isApi
    ? `${INTERNAL_API_PREFIX}${rest.slice('/api'.length)}`
    : `${INTERNAL_UI_PREFIX}${rest === '/' ? '' : rest}`

  // Auth gate — login UI and login API are the only public entry points.
  const isLoginUi = rest === '/login' || rest === '/login/'
  const isLoginApi = rest === '/api/login'
  const needsAuth = !isLoginUi && !isLoginApi

  if (needsAuth) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    const valid = await verifyAdminToken(token)
    if (!valid) {
      const url = request.nextUrl.clone()
      url.pathname = `${base}/login`
      url.search = `?next=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(url)
    }
  }

  const url = request.nextUrl.clone()
  url.pathname = internalPath
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Matcher cannot read env vars, so we widen and do the path check in code.
    '/((?!_next/|favicon|.*\\..*).*)',
  ],
}
