'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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
    console.log('--- GOOGLE BUTTON CLICKED ---')

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Force an absolute URL. Supabase REJECTS relative URLs.
      const redirectUrl = `${window.location.origin}/auth/callback?next=/dashboard`
      console.log('--- REDIRECT URL SENT TO SUPABASE:', redirectUrl)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      console.error('Google Sign-In Error:', error)
      setError('Google sign-in could not be started. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-svh w-full text-[#F5F7FF]">
      <div className="mx-auto flex min-h-svh w-full max-w-[428px] flex-col px-8">
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
              flex
              h-[64px]
              w-full
              items-center
              justify-center
              rounded-[11px]
              border
              border-[#302C43]
              bg-[#171522]
              text-[#F5F7FF]
              shadow-[0_8px_30px_rgba(0,0,0,0.20)]
              hover:border-[#7C5CFF]
              hover:bg-[#1D1A2C]
              cursor-pointer
            "
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