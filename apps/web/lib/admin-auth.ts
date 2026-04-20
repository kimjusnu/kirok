/**
 * Minimal admin auth for single-operator use.
 * Cookie value is HMAC-SHA256(ADMIN_COOKIE_SECRET, "admin"), hex-encoded.
 * Password is checked plaintext against ADMIN_PASSWORD env; the cookie never
 * carries the password itself, so even if a cookie leaks it cannot reveal it.
 *
 * Uses Web Crypto (SubtleCrypto) so it works from both edge middleware and
 * Node route handlers without needing separate impls.
 */

const COOKIE_NAME = 'kirok_admin'
const COOKIE_MESSAGE = 'admin'

export const ADMIN_COOKIE_NAME = COOKIE_NAME

function getSecret(): string {
  const s = process.env.ADMIN_COOKIE_SECRET
  if (!s || s.length < 16) {
    throw new Error(
      'ADMIN_COOKIE_SECRET not set or too short (need ≥16 chars)',
    )
  }
  return s
}

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i]!.toString(16).padStart(2, '0')
  }
  return out
}

export async function signAdminToken(): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(COOKIE_MESSAGE),
  )
  return toHex(sig)
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  try {
    const expected = await signAdminToken()
    if (token.length !== expected.length) return false
    // Constant-time compare.
    let mismatch = 0
    for (let i = 0; i < expected.length; i++) {
      mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i)
    }
    return mismatch === 0
  } catch {
    return false
  }
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  if (password.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ password.charCodeAt(i)
  }
  return mismatch === 0
}
