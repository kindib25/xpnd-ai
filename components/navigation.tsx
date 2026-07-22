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
    label: 'Add Expense',
    href: '/dashboard/add-expense',
    icon: PlusSquare,
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
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 py-2 px-3 flex-1">
              <div
                className={cn(
                  'flex flex-col items-center justify-center transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="w-6 h-6" />
                <span className={cn('text-xs font-medium', isActive && 'text-primary')}>
                  {item.label === 'Add Expense' ? 'Add' : item.label === 'Transactions' ? 'Txns' : item.label}
                </span>
              </div>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </nav>
    )
  }

  // Desktop Sidebar
  return (
    <aside className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Xpnd</h1>
        <p className="text-xs text-muted-foreground">AI Expense Tracking</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
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
