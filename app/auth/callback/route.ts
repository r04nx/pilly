import { NextResponse } from 'next/server'
// The client you created in Step 2
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    // Even if there is an error (e.g., missing PKCE cookie from opening the link in a different browser),
    // the email was still verified by the Supabase server before redirecting here.
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const forwardedHost = request.headers.get('x-forwarded-host')

    let baseUrl = origin
    if (!isLocalEnv && forwardedHost) {
      baseUrl = `https://${forwardedHost}`
    }

    if (!error) {
      // If we successfully authenticated, redirect to next (dashboard)
      return NextResponse.redirect(`${baseUrl}${next}`)
    } else {
      // If we couldn't authenticate (PKCE error), redirect to login with a verified=true success param
      return NextResponse.redirect(`${baseUrl}/auth/login?verified=true`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`)
}
