/**
 * Admin URL prefix utilities.
 *
 * The admin UI lives internally at /admin/* but is only reachable via the
 * secret prefix ADMIN_BASE_PATH. Middleware rewrites external requests of
 * ${ADMIN_BASE_PATH}/(.*) to /admin/$1. Direct /admin access returns 404.
 */

/** Server-only: read the configured secret base path. Throws if missing. */
export function getAdminBasePath(): string {
  const p = process.env.ADMIN_BASE_PATH
  if (!p || !p.startsWith('/') || p.length < 4) {
    throw new Error(
      'ADMIN_BASE_PATH env must be set to a secret path prefix (e.g. /c-a8fj2m)',
    )
  }
  if (p.endsWith('/')) return p.slice(0, -1)
  return p
}

export function getAdminBasePathOrEmpty(): string {
  try {
    return getAdminBasePath()
  } catch {
    return ''
  }
}

/**
 * Client helper: derive the admin base prefix from the current URL.
 * Used for fetch() and router.push() calls in admin client components so
 * they don't need the secret prefix at build time.
 */
export function adminBasePathFromLocation(): string {
  if (typeof window === 'undefined') return ''
  const m = window.location.pathname.match(/^(\/[^/]+)(\/|$)/)
  return m?.[1] ?? ''
}
