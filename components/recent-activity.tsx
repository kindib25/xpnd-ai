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

    /* glass core — lower fill than the stat tiles, bigger surface */
    border border-white/[0.12]
    bg-white/[0.045]
    backdrop-blur-[24px]

    /* light model */
    shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_55px_-22px_rgba(0,0,0,0.75)]

    transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
    hover:border-white/[0.18]
  "
    >
      {/* A. diagonal light wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.01] opacity-70"
      />

      {/* B. top hairline, fading at both ends */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-70"
      />

      {/* C. corner specular hotspot */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/[0.05] blur-3xl"
      />

      {/* D. content — must sit above the overlays */}
      <div className="relative z-10 p-5 md:p-6">

        {/* Header */}
        <div className="flex flex-row items-center justify-between pb-3">
          <h3 className="text-base font-medium tracking-tight text-white md:text-lg">
            Recent Activity
          </h3>

          <Link
            href="/dashboard/transactions"
            className="rounded-full text-xs font-medium text-white/50 transition-colors duration-300 hover:text-white md:text-sm"
          >
            See all
          </Link>
        </div>

        {/* List */}
        <div className="space-y-4">
          {recentExpenses.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/30">
              No recent expenses
            </p>
          ) : (
            recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="
              -mx-2 flex items-center gap-3 rounded-2xl px-2 py-2
              transition-colors duration-500
              hover:bg-white/[0.04]
              md:gap-4
            "
              >
                {/* Merchant Icon — translucent chip, no nested backdrop-blur */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:h-12 md:w-12">
                  <span className="text-base font-semibold uppercase tracking-tight text-white/80 md:text-lg">
                    {(expense.merchant || expense.category || '?')
                      .trim()
                      .charAt(0)}
                  </span>
                </div>

                {/* Merchant Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold tracking-tight text-white md:text-base">
                    {expense.merchant || expense.category}
                  </p>
                  <p className="text-xs text-white/35 md:text-sm">
                    {formatDate(expense.date)}
                  </p>
                </div>

                {/* Amount */}
                <p className="flex-shrink-0 text-sm font-semibold tabular-nums text-white md:text-base">
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
