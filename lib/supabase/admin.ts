import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client with administrative privileges.
 * ONLY use this in server-side code (API routes, Server Actions).
 * NEVER expose the SERVICE_ROLE key or this client to the browser.
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SECRET_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Admin Client Error: Missing URL or Service Role Key')
  }

  return createClient(
    supabaseUrl!,
    serviceRoleKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
