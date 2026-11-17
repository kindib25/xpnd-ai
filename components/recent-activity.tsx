'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface RecentActivityProps {
  expenses: any[]
}

function RecentActivityComponent({ expenses }: RecentActivityProps) {
  // Get the 5 most recent expenses
  const recentExpenses = expenses.slice(0, 5)

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div
      className="
        group/card relative overflow-hidden rounded-[24px]
        
        /* Glass core - Light Mode */
        border border-border
        bg-card/60
        backdrop-blur-[24px]
        shadow-sm

        /* Glass core - Dark Mode */
        dark:border-white/[0.12]
        dark:bg-white/[0.045]
        dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_55px_-22px_rgba(0,0,0,0.75)]

        transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:border-border/80
        dark:hover:border-white/[0.18]
      "
    >
      {/* A. diagonal light wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-transparent opacity-70 dark:from-white/[0.08] dark:to-white/[0.01]"
      />

      {/* B. top hairline, fading at both ends */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/35"
      />

      {/* C. corner specular hotspot */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/5 blur-3xl dark:bg-white/[0.05]"
      />

      {/* D. content — must sit above the overlays */}
      <div className="relative z-10 p-5 md:p-6">
        {/* Header */}
        <div className="flex flex-row items-center justify-between pb-3">
          <h3 className="text-base font-medium tracking-tight text-foreground md:text-lg dark:text-white">
            Recent Activity
          </h3>

          <Link
            href="/dashboard/transactions"
            className="rounded-full text-xs font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground md:text-sm dark:text-white/50 dark:hover:text-white"
          >
            See all
          </Link>
        </div>

        {/* List */}
        <div className="space-y-4">
          {recentExpenses.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground dark:text-white/30">
              No recent expenses
            </p>
          ) : (
            recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="
                  -mx-2 flex items-center gap-3 rounded-2xl px-2 py-2
                  transition-colors duration-500
                  hover:bg-foreground/5
                  dark:hover:bg-white/[0.04]
                  md:gap-4
                "
              >
                {/* Merchant Icon — translucent chip, no nested backdrop-blur */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted shadow-sm md:h-12 md:w-12 dark:border-white/[0.10] dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="text-base font-semibold uppercase tracking-tight text-muted-foreground md:text-lg dark:text-white/80">
                    {(expense.merchant || expense.category || '?')
                      .trim()
                      .charAt(0)}
                  </span>
                </div>

                {/* Merchant Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold tracking-tight text-foreground md:text-base dark:text-white">
                    {expense.merchant || expense.category}
                  </p>
                  <p className="text-xs text-muted-foreground md:text-sm dark:text-white/35">
                    {formatDate(expense.date)}
                  </p>
                </div>

                {/* Amount */}
                <p className="flex-shrink-0 text-sm font-semibold tabular-nums text-foreground md:text-base dark:text-white">
                  ₱{expense.amount}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export const RecentActivity = memo(RecentActivityComponent)