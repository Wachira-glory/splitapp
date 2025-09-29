import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const errorCode = requestUrl.searchParams.get('error_code')

  if (error) {
    console.error('Auth callback error:', { error, errorCode, errorDescription })
    
    let redirectUrl = '/login'
    let errorMessage = 'Authentication failed'

    if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
      errorMessage = 'Email link has expired. Please sign up again.'
      redirectUrl = '/signup'
    } else if (errorDescription?.includes('invalid')) {
      errorMessage = 'Invalid email link. Please sign up again.'
      redirectUrl = '/signup'
    }

    return NextResponse.redirect(
      new URL(`${redirectUrl}?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }

  if (code) {
    try {
      // Create a Supabase client with the Auth context of the logged in user
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce'
          }
        }
      )

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent('Failed to authenticate. Please try again.')}`, request.url)
        )
      }

      // Success - redirect to dashboard
      return NextResponse.redirect(
        new URL('/dashboard?success=Authentication successful!', request.url)
      )
    } catch (error) {
      console.error('Unexpected error during code exchange:', error)
      return NextResponse.redirect(
        new URL('/login?error=An unexpected error occurred', request.url)
      )
    }
  }

  // No code or error - redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}