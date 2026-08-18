export function getAuthRedirectUrl(next = '/dashboard') {
  const configured = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL

  if (configured) {
    const url = new URL(configured)
    url.searchParams.set('next', next)
    return url.toString()
  }

  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
}
