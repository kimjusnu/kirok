import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export type DbClient = SupabaseClient<Database>

/**
 * Browser / public client. Uses anon key; bound by RLS policies.
 * Only allows reading the public test catalog.
 */
export function createBrowserClient(): DbClient {
  return createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      auth: { persistSession: false },
    },
  )
}

/**
 * Server client. Uses service_role key; bypasses RLS.
 * NEVER import this from code that reaches the browser bundle.
 * Use only in Next.js Route Handlers, Server Actions, or server utilities.
 */
export function createServiceClient(): DbClient {
  return createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )
}
