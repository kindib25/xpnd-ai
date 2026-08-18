import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const requestedNext = searchParams.get('next')

  console.log('[v0] OAuth callback received:', {
    hasCode: Boolean(code),
    providerError: error,
    providerErrorDescription: errorDescription,
    requestedNext,
    origin,
  })
  const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[v0] OAuth callback exchange result:', {
      success: !exchangeError,
      error: exchangeError?.message ?? null,
      redirectTarget: next,
    })
    if (!exchangeError) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  console.log('[v0] OAuth callback failed; redirecting to auth error')
  return NextResponse.redirect(new URL('/auth/error', origin))
}
