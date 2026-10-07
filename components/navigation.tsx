'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  ReceiptText,
  Wallet,
  Settings,
  LogOut,
  ChartNoAxesCombined,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Transactions',
    href: '/dashboard/transactions',
    icon: ReceiptText,
  },
  {
    label: 'Finances',
    href: '/dashboard/budgets',
    icon: Wallet,
    activePaths: ['/dashboard/budgets', '/dashboard/goals'],
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: ChartNoAxesCombined,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface NavigationProps {
  variant?: 'sidebar' | 'mobile'
}

export function Navigation({ variant = 'sidebar' }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()

    setIsLoggingOut(true)

    await supabase.auth.signOut()

    router.push('/auth/login')
  }

  const isItemActive = (item: (typeof navItems)[number]) => {
    // Dashboard should only be active on exactly /dashboard
    if (item.href === '/dashboard') {
      return pathname === '/dashboard'
    }

    // Finances can have multiple pages
    if ('activePaths' in item && item.activePaths) {
      return item.activePaths.some(
        (path) =>
          pathname === path ||
          pathname.startsWith(path + '/')
      )
    }

    // Normal navigation items
    return (
      pathname === item.href ||
      pathname.startsWith(item.href + '/')
    )
  }

  /* -------------------------------------------------------------------------- */
  /*                              MOBILE NAVIGATION                             */
  /* -------------------------------------------------------------------------- */

  if (variant === 'mobile') {
    return (
      <nav
        className="
          relative
          mx-3 mb-3
          flex h-[72px]
          items-center justify-around
          overflow-hidden
          rounded-[24px]
          border border-white/[0.14]
          bg-white/[0.045]
          px-2
          shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_50px_-20px_rgba(0,0,0,0.75)]
          backdrop-blur-[28px]
        "
      >
        {/* Glass surface */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            bg-gradient-to-br
            from-white/[0.08]
            via-transparent
            to-white/[0.015]
          "
        />

        {/* Top glass highlight */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-x-6 top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-[#9ee82d]/30
            to-transparent
          "
        />

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = isItemActive(item)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                `
                  group
                  relative z-10
                  flex flex-1
                  flex-col
                  items-center
                  justify-center
                  gap-1.5
                  rounded-2xl
                  py-2
                  transition-all
                  duration-500
                `,
                isActive
                  ? 'text-[#9ee82d]'
                  : 'text-white/35 hover:text-white/70'
              )}
            >
              {/* Active glass */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="
                    absolute
                    inset-x-1
                    inset-y-[-0.50rem]
                    -z-10
                    rounded-2xl
                    border border-[#9ee82d]/[0.12]
                    bg-[#9ee82d]/[0.075]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                    backdrop-blur-xl
                  "
                />
              )}

              <Icon
                className={cn(
                  'h-[21px] w-[21px] transition-all duration-500',
                  isActive
                    ? 'text-[#9ee82d]'
                    : 'text-white/40 group-hover:text-white/80'
                )}
              />
            </Link>
          )
        })}
      </nav>
    )
  }

  /* -------------------------------------------------------------------------- */
  /*                              DESKTOP SIDEBAR                               */
  /* -------------------------------------------------------------------------- */

  return (
    <aside
      className="
        relative
        flex h-screen w-[280px] shrink-0
        flex-col
        overflow-hidden
        border-r border-white/[0.10]
        bg-[#11131c]/70
        shadow-[10px_0_50px_-30px_rgba(0,0,0,0.8)]
        backdrop-blur-[28px]
      "
    >
      {/* -------------------------------------------------------------------- */}
      {/* Background                                                           */}
      {/* -------------------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          bg-gradient-to-b
          from-white/[0.025]
          via-transparent
          to-white/[0.015]
        "
      />

      {/* Soft ambient glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-32
          top-20
          h-80
          w-80
          rounded-full
          bg-white/[0.025]
          blur-[120px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-20
          h-96
          w-96
          rounded-full
          bg-white/[0.02]
          blur-[140px]
        "
      />

      {/* -------------------------------------------------------------------- */}
      {/* Header / Logo                                                        */}
      {/* -------------------------------------------------------------------- */}

      <div
        className="
          relative
          border-b border-white/[0.08]
          p-5
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[24px]
            border border-white/[0.12]
            bg-white/[0.045]
            px-5
            py-5
            shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_45px_-20px_rgba(0,0,0,0.55)]
            backdrop-blur-[28px]
          "
        >
          {/* Card gradient */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-0
              bg-gradient-to-br
              from-white/[0.08]
              via-transparent
              to-white/[0.015]
            "
          />

          {/* Top highlight */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-x-6 top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-white/40
              to-transparent
              opacity-70
            "
          />

          <div className="relative z-10 flex items-center justify-center">
            <img
              src="/xpnd-ai-logo-dark-label.svg"
              alt="Xpnd AI"
              className="h-auto w-44 object-contain"
            />
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Navigation                                                           */}
      {/* -------------------------------------------------------------------- */}

      <nav className="relative flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isItemActive(item)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  `
                    group
                    relative
                    flex
                    items-center
                    gap-3
                    overflow-hidden
                    rounded-[18px]
                    border
                    px-4
                    py-3.5
                    text-[18px]
                    font-medium
                    transition-all
                    duration-500
                    ease-[cubic-bezier(0.16,1,0.3,1)]
                  `,
                  isActive
                    ? `
                      border-[#9ee82d]/[0.14]
                      bg-[#9ee82d]/[0.075]
                      text-[#9ee82d]
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-20px_rgba(0,0,0,0.65)]
                      backdrop-blur-[28px]
                    `
                    : `
                      border-transparent
                      bg-transparent
                      text-white/45
                      hover:border-white/[0.08]
                      hover:bg-white/[0.04]
                      hover:text-white/80
                    `
                )}
              >
                {/* Active glass gradient */}
                {isActive && (
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute inset-0
                      bg-gradient-to-br
                      from-white/[0.10]
                      via-transparent
                      to-white/[0.015]
                    "
                  />
                )}

                {/* Active top highlight */}
                {isActive && (
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute inset-x-5 top-0
                      h-px
                      bg-gradient-to-r
                      from-transparent
                      via-[#9ee82d]/35
                      to-transparent
                    "
                  />
                )}

                {/* Icon container */}
                <span
                  className={cn(
                    `
                      relative z-10
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      transition-all
                      duration-500
                    `,
                    isActive
                      ? `
                        border-[#9ee82d]/[0.14]
                        bg-[#9ee82d]/[0.055]
                        text-[#9ee82d]/80
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                        backdrop-blur-xl
                      `
                      : `
                        border-white/[0.06]
                        bg-white/[0.02]
                        text-white/35
                        group-hover:border-white/[0.12]
                        group-hover:bg-white/[0.045]
                        group-hover:text-white/70
                      `
                  )}
                >
                  <Icon className="h-[17px] w-[17px]" />
                </span>

                <span className="relative z-10">
                  {item.label}
                </span>

                {/* Hover light */}
                <span
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    inset-y-0
                    -left-full
                    w-1/2
                    bg-gradient-to-r
                    from-transparent
                    via-white/[0.04]
                    to-transparent
                    transition-all
                    duration-700
                    group-hover:left-full
                  "
                />
              </Link>
            )
          })}
        </div>
      </nav>

      {/* -------------------------------------------------------------------- */}
      {/* Logout                                                               */}
      {/* -------------------------------------------------------------------- */}

      <div
        className="
          relative
          border-t border-white/[0.08]
          p-4
        "
      >
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="ghost"
          className="
            group
            relative
            h-12
            w-full
            justify-start
            overflow-hidden
            rounded-[18px]
            border border-white/[0.10]
            bg-white/[0.035]
            px-4
            text-white/45
            shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]
            backdrop-blur-xl
            transition-all
            duration-500
            hover:border-white/[0.16]
            hover:bg-white/[0.065]
            hover:text-white
          "
        >
          {/* Gradient layer */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute inset-0
              bg-gradient-to-br
              from-white/[0.04]
              via-transparent
              to-transparent
            "
          />

          <span
            className="
              relative z-10
              mr-3
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border border-white/[0.08]
              bg-white/[0.025]
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
            "
          >
            <LogOut className="h-4 w-4" />
          </span>

          <span className="relative z-10 text-[18px] font-medium">
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </Button>
      </div>
    </aside>
  )
}