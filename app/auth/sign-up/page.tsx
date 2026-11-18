'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import DashboardBackground from '@/components/dashboard-background'
import { Eye, EyeOff } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()

    // ---- Client-side validation (run BEFORE setting loading) ----
    if (password !== repeatPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const redirectTo =
        process.env.NODE_ENV === 'development' &&
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
          ? process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
          : `${window.location.origin}/auth/callback?next=/dashboard`

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: { emailRedirectTo: redirectTo },
      })

      if (error) throw error

      // ---- Duplicate email detection ----
      // When email confirmation is ON, Supabase returns a fake user object
      // (with an empty `identities` array) for an existing email instead of
      // throwing an error. Detect that and surface a real message.
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        setError(
          'An account with this email already exists. Please log in instead.',
        )
        return
      }

      // ---- Confirmation OFF: user is signed in immediately ----
      if (data.session) {
        router.replace('/dashboard')
        router.refresh()
        return
      }

      // ---- Confirmation ON: no session yet, tell user to check email ----
      router.push('/auth/sign-up-success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      })
      if (error) throw error
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err)
      setError('Google sign-in could not be started. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-svh w-full text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-[428px] flex-col px-8">
        <DashboardBackground />

        {/* Logo */}
        <Link href="/landing_page">
          <div className="flex justify-center pt-[15%]">
            <img
              src="/xpnd-ai-logo-dark.svg"
              alt="Xpnd AI"
              className="hidden h-auto w-[140px] dark:block md:w-[160px]"
            />
            <img
              src="/xpnd-ai-logo-light.svg"
              alt="Xpnd AI"
              className="block h-auto w-[140px] dark:hidden md:w-[160px]"
            />
          </div>
        </Link>

        {/* Heading */}
        <div className="mt-[5%] text-center">
          <h1 className="text-[18px] font-bold tracking-[-0.3px] text-foreground md:text-[24px] dark:text-white">
            Create your account
          </h1>

          <p className="mt-2 text-[15px] font-medium text-muted-foreground md:text-[17px] dark:text-white/55">
            Start tracking your expenses smarter
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="mt-[35px] space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[15px] font-semibold text-foreground dark:text-white"
            >
              Email
            </label>

            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-[56px] rounded-[10px] border-border bg-background px-4 text-[16px] text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/30 dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/35"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[15px] font-semibold text-foreground dark:text-white"
            >
              Password
            </label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-[56px] rounded-[10px] border-border bg-background px-4 pr-12 text-[16px] text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/30 dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/35"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white/40 dark:hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="repeat-password"
              className="mb-2 block text-[15px] font-semibold text-foreground dark:text-white"
            >
              Confirm Password
            </label>

            <div className="relative">
              <Input
                id="repeat-password"
                type={showRepeatPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                disabled={isLoading}
                aria-invalid={
                  repeatPassword.length > 0 && repeatPassword !== password
                    ? true
                    : undefined
                }
                className="h-[56px] rounded-[10px] border-border bg-background px-4 pr-12 text-[16px] text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/30 dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/35"
              />

              <button
                type="button"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                disabled={isLoading}
                aria-label={
                  showRepeatPassword ? 'Hide password' : 'Show password'
                }
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white/40 dark:hover:text-white"
              >
                {showRepeatPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {repeatPassword.length > 0 && repeatPassword !== password && (
              <p className="mt-1.5 text-[13px] text-red-500 dark:text-red-400">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Sign Up Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-[58px] w-full cursor-pointer rounded-[10px] bg-gradient-to-r from-primary to-primary/85 text-[17px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-105 hover:shadow-xl hover:shadow-primary/30"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Login */}
        <div className="mt-6 text-center text-[15px]">
          <span className="text-muted-foreground dark:text-white/55">
            Already have an account?{' '}
          </span>

          <Link
            href="/auth/login"
            className="font-semibold text-primary underline underline-offset-4 hover:opacity-80"
          >
            Login
          </Link>
        </div>

        {/* Divider */}
        <div className="mt-[35px] flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="px-1 text-[16px] font-semibold text-muted-foreground dark:text-white/55">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google */}
        <div className="mt-[30px]">
          <Button
            type="button"
            variant="outline"
            className="flex h-[64px] w-full cursor-pointer items-center justify-center rounded-[11px] border border-border bg-card text-foreground shadow-sm hover:border-primary/40 hover:bg-foreground/5 dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-white dark:shadow-[0_8px_30px_rgba(0,0,0,0.20)] dark:hover:border-primary/50 dark:hover:bg-white/[0.06]"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <svg
              className="mr-2.5 h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
              />
            </svg>

            <span className="text-[16px] font-semibold">
              {isLoading ? 'Loading...' : 'Sign up with Google'}
            </span>
          </Button>
        </div>

        {/* Terms */}
        <div className="mt-auto pb-[55px] pt-10 text-center">
          <p className="text-[13px] font-medium text-muted-foreground dark:text-white/40">
            By creating an account, you agree to our
          </p>

          <p className="text-[13px] font-bold text-foreground dark:text-white">
            Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </main>
  )
}