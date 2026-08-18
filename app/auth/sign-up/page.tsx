'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getAuthRedirectUrl } from '@/lib/supabase/auth-redirect'
import DashboardBackground from '@/components/dashboard-background'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    const supabase = createClient()

    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })

      if (error) throw error

      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
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
      setError(
        'Google sign-in could not be started. Please try again.',
      )
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-svh w-full text-[#F5F7FF]">
      <div className="mx-auto flex min-h-svh w-full max-w-[428px] flex-col px-8">
        <DashboardBackground />

        {/* Logo */}
        <div className="flex justify-center pt-[15%]">
          <img
            src="/xpnd-ai-logo-dark.svg"
            alt="Xpnd AI"
            className="h-auto w-[140px] md:w-[160px]"
          />
        </div>

        {/* Heading */}
        <div className="mt-[5%] text-center">
          <h1 className="text-[18px] md:text-[24px] font-bold tracking-[-0.3px]">
            Create your account
          </h1>

          <p className="mt-2 text-[15px] md:text-[17px] font-medium text-[#9B9AAF]">
            Start tracking your expenses smarter
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSignUp}
          className="mt-[35px] space-y-5"
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

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="repeat-password"
              className="mb-2 block text-[15px] font-semibold text-[#F5F7FF]"
            >
              Confirm Password
            </label>

            <Input
              id="repeat-password"
              type="password"
              placeholder="Re-enter your password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
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

          {/* Sign Up Button */}
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Login */}
        <div className="mt-6 text-center text-[15px]">
          <span className="text-[#9B9AAF]">
            Already have an account?{' '}
          </span>

          <Link
            href="/auth/login"
            className="
              font-semibold
              text-[#B6FF3B]
              underline
              underline-offset-4
              hover:text-[#7EEB2A]
            "
          >
            Login
          </Link>
        </div>

        {/* Divider */}
        <div className="mt-[35px] flex items-center gap-3">
          <div className="h-px flex-1 bg-[#302C43]" />

          <span className="px-1 text-[16px] font-semibold text-[#9B9AAF]">
            or
          </span>

          <div className="h-px flex-1 bg-[#302C43]" />
        </div>

        {/* Google */}
        <div className="mt-[30px]">
          <Button
            type="button"
            variant="outline"
            className="
              h-[64px]
              w-full
              rounded-[11px]
              border
              border-[#302C43]
              bg-[#171522]
              text-[#F5F7FF]
              shadow-[0_8px_30px_rgba(0,0,0,0.20)]
              hover:border-[#7C5CFF]
              hover:bg-[#1D1A2C]
            "
            onClick={handleGoogleSignUp}
            disabled={true} //replace with isLoading when done configured
          >
            <span className="text-[16px] font-semibold">
              {isLoading
                ? 'Loading...'
                : 'Sign up with Google'}
            </span>
          </Button>
        </div>

        {/* Terms */}
        <div className="mt-auto pb-[55px] pt-10 text-center">
          <p className="text-[13px] font-medium text-[#77738A]">
            By creating an account, you agree to our
          </p>

          <p className="text-[13px] font-bold text-[#F5F7FF]">
            Terms of Service and Privacy Policy
          </p>
        </div>

      </div>
    </main>
  )
}