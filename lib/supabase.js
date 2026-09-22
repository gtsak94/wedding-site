import { createClient } from '@supabase/supabase-js'

// Server-only client. Uses the service-role key, so NEVER import this
// into a "use client" component. Only server components, route handlers
// and scripts touch it.
export function getAdminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Copy .env.local.example to .env.local and fill them in.'
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}
