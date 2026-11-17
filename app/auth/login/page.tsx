'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import DashboardBackground from '@/components/dashboard-background'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    supabase.auth.getSession().then(
      ({
        data,
        error,
      }: {
        data: { session: Session | null }
        error: { message: string } | null
      }) => {
        if (isMounted && data.session) {
          window.location.replace('/dashboard')
        }
      },
    )

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (isMounted && session) {
          window.location.replace('/dashboard')
        }
      },
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to log in. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      })
      if (error) throw error
    } catch (error: unknown) {
      console.error('Google Sign-In Error:', error)
      setError('Google sign-in could not be started. Please try again.')
      setIsLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: redirectUrl },
      })
      if (error) throw error
    } catch (error: unknown) {
      console.error('Apple Sign-In Error:', error)
      setError('Apple sign-in could not be started. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-svh w-full text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[428px] flex-col px-8">
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
          <h2 className="text-[18px] font-bold tracking-[-0.3px] text-foreground md:text-[24px] dark:text-white">
            Welcome to Xpnd AI
          </h2>

          <p className="mt-2 text-[15px] font-medium text-muted-foreground md:text-[17px] dark:text-white/55">
            Sign in to continue
          </p>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleLogin} className="mt-[45px] space-y-5">
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

          {/* Error */}
          {error && (
            <p className="text-center text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-[58px] w-full cursor-pointer rounded-[10px] bg-gradient-to-r from-primary to-primary/85 text-[17px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-105 hover:shadow-xl hover:shadow-primary/30"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {/* Sign Up */}
        <div className="mt-6 text-center text-[15px]">
          <span className="text-muted-foreground dark:text-white/55">
            Don&apos;t have an account?{' '}
          </span>

          <Link
            href="/auth/sign-up"
            className="font-semibold text-primary underline underline-offset-4 hover:opacity-80"
          >
            Sign up
          </Link>
        </div>

        {/* Divider */}
        <div className="mt-[45px] flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="px-1 text-[17px] font-semibold text-muted-foreground dark:text-white/55">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Social Login Buttons */}
        <div className="mt-[35px] grid grid-cols-2 gap-[19px]">
          {/* Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex h-[70px] cursor-pointer items-center justify-center gap-2.5 rounded-[11px] border border-border bg-card text-foreground shadow-sm hover:border-primary/40 hover:bg-foreground/5 dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-white dark:shadow-[0_8px_30px_rgba(0,0,0,0.20)] dark:hover:border-primary/50 dark:hover:bg-white/[0.06]"
          >
            <svg
              className="h-5 w-5 shrink-0"
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
            <span className="text-[16px] font-semibold">Google</span>
          </Button>

          {/* Apple */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAppleSignIn}
            disabled={true}
            className="h-[70px] rounded-[11px] border border-border bg-card text-foreground shadow-sm hover:border-primary/40 hover:bg-foreground/5 dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-white dark:shadow-[0_8px_30px_rgba(0,0,0,0.20)] dark:hover:border-primary/50 dark:hover:bg-white/[0.06]"
          >
            <span className="text-[16px] font-semibold">Apple</span>
          </Button>
        </div>

        {/* Terms */}
        <div className="mt-auto pb-[70px] pt-10 text-center">
          <p className="text-[14px] font-medium text-muted-foreground dark:text-white/40">
            By continuing, you agree to our
          </p>
          <p className="text-[14px] font-bold text-foreground dark:text-white">
            Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </main>
  )
}