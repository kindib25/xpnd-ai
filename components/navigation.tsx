'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, ReceiptText, Wallet, Settings, LogOut, ChartNoAxesCombined } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Transactions', href: '/dashboard/transactions', icon: ReceiptText },
  { label: 'Finances', href: '/dashboard/budgets', icon: Wallet, activePaths: ['/dashboard/budgets', '/dashboard/goals'] },
  { label: 'Analytics', href: '/dashboard/analytics', icon: ChartNoAxesCombined },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
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
    if (item.href === '/dashboard') return pathname === '/dashboard'
    if ('activePaths' in item && item.activePaths) {
      return item.activePaths.some((path) => pathname === path || pathname.startsWith(path + '/'))
    }
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  if (variant === 'mobile') {
    return (
      <nav className="relative mx-3 mb-3 flex h-[72px] items-center justify-around overflow-hidden rounded-[24px] border border-border bg-card/90 px-2 shadow-sm backdrop-blur-[28px] dark:border-white/[0.14] dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_50px_-20px_rgba(0,0,0,0.75)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-transparent dark:from-white/[0.08] dark:to-white/[0.015]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = isItemActive(item)

          return (
            <Link key={item.href} href={item.href} className={cn(`group relative z-10 flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl py-2 transition-all duration-500`, isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground dark:text-white/35 dark:hover:text-white/70')}>
              {isActive && <span aria-hidden="true" className="absolute inset-x-1 inset-y-[-0.50rem] -z-10 rounded-2xl border border-primary/15 bg-primary/10 shadow-sm backdrop-blur-xl dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]" />}
              <Icon className={cn('h-[21px] w-[21px] transition-all duration-500', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground dark:text-white/40 dark:group-hover:text-white/80')} />
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <aside className="relative flex h-screen w-[280px] shrink-0 flex-col overflow-hidden border-r border-border bg-card/90 shadow-sm backdrop-blur-[28px] dark:border-white/[0.10] dark:bg-[#11131c]/70 dark:shadow-[10px_0_50px_-30px_rgba(0,0,0,0.8)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/[0.02] via-transparent to-transparent dark:from-white/[0.025] dark:to-white/[0.015]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/5 blur-[120px] dark:bg-white/[0.025]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-primary/5 blur-[140px] dark:bg-white/[0.02]" />

      <div className="relative border-b border-border p-5 dark:border-white/[0.08]">
        <div className="relative overflow-hidden rounded-[24px] border border-border bg-background px-5 py-5 shadow-sm backdrop-blur-[28px] dark:border-white/[0.12] dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_45px_-20px_rgba(0,0,0,0.55)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-transparent dark:from-white/[0.08] dark:to-white/[0.015]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40" />
          <div className="relative z-10 flex items-center justify-center">
            <img src="/xpnd-ai-logo-dark.svg" alt="Xpnd AI" className="h-auto w-44 object-contain dark:block hidden" />
            <img src="/xpnd-ai-logo-light.svg" alt="Xpnd AI" className="h-auto w-44 object-contain dark:hidden block" />
          </div>
        </div>
      </div>

      <nav className="relative flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isItemActive(item)

            return (
              <Link key={item.href} href={item.href} className={cn(`group relative flex items-center gap-3 overflow-hidden rounded-[18px] border px-4 py-3.5 text-[18px] font-medium transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`, isActive ? `border-primary/15 bg-primary/10 text-primary shadow-sm backdrop-blur-[28px] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-20px_rgba(0,0,0,0.65)]` : `border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-foreground/5 hover:text-foreground dark:text-white/45 dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04] dark:hover:text-white/80`)}>
                {isActive && <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.05] via-transparent to-transparent dark:from-white/[0.10] dark:to-white/[0.015]" />}
                {isActive && <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />}

                <span className={cn(`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500`, isActive ? `border-primary/20 bg-primary/10 text-primary shadow-sm backdrop-blur-xl dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]` : `border-border bg-foreground/5 text-muted-foreground group-hover:border-border/80 group-hover:bg-foreground/10 group-hover:text-foreground dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/35 dark:group-hover:border-white/[0.12] dark:group-hover:bg-white/[0.045] dark:group-hover:text-white/70`)}>
                  <Icon className="h-[17px] w-[17px]" />
                </span>

                <span className="relative z-10">{item.label}</span>
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-foreground/[0.02] to-transparent transition-all duration-700 group-hover:left-full dark:via-white/[0.04]" />
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="relative border-t border-border p-4 dark:border-white/[0.08]">
        <Button onClick={handleLogout} disabled={isLoggingOut} variant="ghost" className="group relative h-12 w-full justify-start overflow-hidden rounded-[18px] border border-border bg-background px-4 text-muted-foreground shadow-sm backdrop-blur-xl transition-all duration-500 hover:border-border/80 hover:bg-foreground/5 hover:text-foreground dark:border-white/[0.10] dark:bg-white/[0.035] dark:text-white/45 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] dark:hover:border-white/[0.16] dark:hover:bg-white/[0.065] dark:hover:text-white">
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-transparent dark:from-white/[0.04]" />
          <span className="relative z-10 mr-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-foreground/5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.025] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <LogOut className="h-4 w-4" />
          </span>
          <span className="relative z-10 text-[18px] font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </Button>
      </div>
    </aside>
  )
}