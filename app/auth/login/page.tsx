'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAuthRedirectUrl } from '@/lib/supabase/auth-redirect'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import DashboardBackground from '@/components/dashboard-background'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        console.log('[v0] Auth getSession:', {
          hasSession: Boolean(data.session),
          userId: data.session?.user.id ?? null,
          error: error?.message ?? null,
        })

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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthRedirectUrl('/dashboard'),
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      console.error(error)
      setError('Google sign-in could not be started. Please try again.')
      setIsLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    const supabase = createClient()

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: getAuthRedirectUrl('/dashboard'),
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      console.error(error)
      setError('Apple sign-in could not be started. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-svh w-full  text-[#F5F7FF]">
      <div className="mx-auto flex min-h-screen w-full max-w-[428px] flex-col px-8">
        <DashboardBackground />

        {/* Logo */}
        <Link href="/landing_page">
        <div className="flex justify-center pt-[15%]">
          <img
            src="/xpnd-ai-logo-dark.svg"
            alt="Xpnd AI"
            className="h-auto w-[140px] md:w-[160px]"
          />
        </div>
        </Link>

        {/* Heading */}
        <div className="mt-[5%] text-center">
          <h2 className="text-[18px] md:text-[24px] font-bold tracking-[-0.3px]">
            Welcome to Xpnd AI
          </h2>

          <p className="mt-2 text-[15px] md:text-[17px] font-medium text-[#9B9AAF]">
            Sign in to continue
          </p>
        </div>

        {/* Email / Password Form */}
        <form
          onSubmit={handleLogin}
          className="mt-[45px] space-y-5"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[15px] font-semibold text-[#F5F7FF]"
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
              className="
                h-[56px]
                rounded-[10px]
                border-[#302C43]
                bg-[#171522]
                px-4
                text-[16px]
                text-[#F5F7FF]
                placeholder:text-[#77738A]
                focus-visible:border-[#7C5CFF]
                focus-visible:ring-[#7C5CFF]/30
              "
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[15px] font-semibold text-[#F5F7FF]"
            >
              Password
            </label>

            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="
                h-[56px]
                rounded-[10px]
                border-[#302C43]
                bg-[#171522]
                px-4
                text-[16px]
                text-[#F5F7FF]
                placeholder:text-[#77738A]
                focus-visible:border-[#7C5CFF]
                focus-visible:ring-[#7C5CFF]/30
              "
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="
    h-[58px]
    w-full
    rounded-[10px]
    bg-gradient-to-r
    from-[#B6FF3B]
    to-[#7EEB2A]
    text-[17px]
    font-semibold
    text-[#0D0D16]
    shadow-[0_8px_25px_rgba(126,235,42,0.25)]
    transition-all
    hover:brightness-110
    cursor-pointer
  "
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

        </form>

        {/* Sign Up */}
        <div className="mt-6 text-center text-[15px]">
          <span className="text-[#9B9AAF]">
            Don&apos;t have an account?{' '}
          </span>

          <Link
            href="/auth/sign-up"
            className="
              font-semibold
              text-[#B6FF3B]
              underline
              underline-offset-4
              hover:text-[#7EEB2A]
            "
          >
            Sign up
          </Link>
        </div>

        {/* Divider */}
        <div className="mt-[45px] flex items-center gap-3">
          <div className="h-px flex-1 bg-[#302C43]" />

          <span className="px-1 text-[17px] font-semibold text-[#9B9AAF]">
            or
          </span>

          <div className="h-px flex-1 bg-[#302C43]" />
        </div>

        {/* Social Login Buttons */}
        <div className="mt-[35px] grid grid-cols-2 gap-[19px]">

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={true}
            className="
              h-[70px]
              rounded-[11px]
              border
              border-[#302C43]
              bg-[#171522]
              text-[#F5F7FF]
              shadow-[0_8px_30px_rgba(0,0,0,0.20)]
              hover:border-[#7C5CFF]
              hover:bg-[#1D1A2C]
            "
          >
    
            <span className="text-[16px] font-semibold">
              Google
            </span>
          </Button>

          {/* Apple */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAppleSignIn}
            disabled={true}
            className="
              h-[70px]
              rounded-[11px]
              border
              border-[#302C43]
              bg-[#171522]
              text-[#F5F7FF]
              shadow-[0_8px_30px_rgba(0,0,0,0.20)]
              hover:border-[#7C5CFF]
              hover:bg-[#1D1A2C]
            "
          >

            <span className="text-[16px] font-semibold">
              Apple
            </span>
          </Button>
        </div>

        {/* Terms */}
        <div className="mt-auto pb-[70px] pt-10 text-center">
          <p className="text-[14px] font-medium text-[#77738A]">
            By continuing, you agree to our
          </p>

          <p className="text-[14px] font-bold text-[#F5F7FF]">
            Terms of Service and Privacy Policy
          </p>
        </div>

      </div>
    </main>
  )
}