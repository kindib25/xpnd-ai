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
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const isToday = date.toDateString() === today.toDateString()
    const isYesterday = date.toDateString() === yesterday.toDateString()

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    if (isToday) return `Today – ${time}`
    if (isYesterday) return `Yesterday – ${time}`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
        <Link href="/dashboard/transactions" className="text-xs md:text-sm text-primary hover:underline font-medium">
          See all
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent expenses</p>
        ) : (
          recentExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center gap-3 md:gap-4">
              {/* Merchant Icon */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-muted-foreground/20 rounded opacity-50" />
              </div>

              {/* Merchant Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm md:text-base truncate">{expense.merchant || expense.category}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{formatDate(expense.date)}</p>
              </div>

              {/* Amount */}
              <p className="text-sm md:text-base font-semibold flex-shrink-0">₱{expense.amount}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export const RecentActivity = memo(RecentActivityComponent)
