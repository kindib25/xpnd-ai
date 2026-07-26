'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  PlusSquare,
  ReceiptText,
  Wallet,
  Target,
  Settings,
  LogOut,
  ChartNoAxesCombined,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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
    label: 'Budgets',
    href: '/dashboard/budgets',
    icon: Wallet,
  },
  {
    label: 'Goals',
    href: '/dashboard/goals',
    icon: Target,
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

  // Mobile Bottom Navigation
  if (variant === 'mobile') {
    return (
      <nav className="flex items-center justify-around h-20 px-2">
        {navItems.slice(0, 6).map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center py-2 px-3 flex-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-6 h-6" />
            </Link>
          )
        })}
      </nav>
    )
  }

  // Desktop Sidebar
  return (
    <aside className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-border flex flex-col items-center text-center">
        <img
          src="/xpnd-ai-logo-dark-label.svg"
          alt="Logo"
          className="w-60 h-auto object-contain"
        />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-4 rounded-sm text-xl font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}>

              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="outline"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </aside>
  )
}
