'use client'

import { memo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  TrendingUp,
  Target,
  DollarSign,
  UserRound,
  Bell,
  Calendar,
  Calendars,
  Database,
  Layers,
  Icon,
  AlertTriangle,
  CircleAlert,
} from 'lucide-react'
import Link from 'next/link'
import { ExpenseChart } from './expense-chart'
import { BudgetOverview } from './budget-overview'
import { RecentActivity } from './recent-activity'

interface DashboardOverviewProps {
  profile: {
    full_name?: string | null
    avatar_url?: string | null
  } | null
  expenses: any[]
  budgets: any[]
  goals: any[]
}

function DashboardOverviewComponent({
  profile,
  expenses,
  budgets,
  goals,
}: DashboardOverviewProps) {
  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount || 0),
    0
  )

  const totalBudget = budgets.reduce(
    (sum, budget) =>
      sum + parseFloat(budget.limit_amount || 0),
    0
  )

  const budgetPercentage =
    totalBudget > 0
      ? Math.min(
          (totalExpenses / totalBudget) * 100,
          100
        )
      : 0

  const isOverBudget =
    totalBudget > 0 &&
    totalExpenses > totalBudget

  const isApproachingBudget =
    totalBudget > 0 &&
    budgetPercentage >= 80 &&
    !isOverBudget

  // Calculate today's spending
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySpending = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      expDate.setHours(0, 0, 0, 0)

      return (
        expDate.getTime() === today.getTime()
      )
    })
    .reduce(
      (sum, exp) =>
        sum + parseFloat(exp.amount || 0),
      0
    )

  // Calculate this week's spending
  // Sunday to Saturday
  const weekStart = new Date(today)

  weekStart.setDate(
    today.getDate() - today.getDay()
  )

  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)

  weekEnd.setDate(
    weekStart.getDate() + 7
  )

  weekEnd.setHours(0, 0, 0, 0)

  const weekSpending = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)

      return (
        expDate >= weekStart &&
        expDate < weekEnd
      )
    })
    .reduce(
      (sum, exp) =>
        sum + parseFloat(exp.amount || 0),
      0
    )

  // Count total transactions
  const transactionCount = expenses.length

  // Find top category
  const categoryTotals: Record<
    string,
    number
  > = {}

  expenses.forEach((exp) => {
    const category =
      exp.category || 'Uncategorized'

    categoryTotals[category] =
      (categoryTotals[category] || 0) +
      parseFloat(exp.amount || 0)
  })

  const topCategory =
    Object.entries(categoryTotals).reduce(
      (
        top,
        [category, amount]
      ) =>
        amount > top.amount
          ? {
              category,
              amount,
            }
          : top,
      {
        category: 'N/A',
        amount: 0,
      }
    )

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">

      {/* =========================
          HEADER
      ========================== */}
      <div className="mb-6 md:mb-8">

        {/* Mobile Only */}
        <div className="flex items-center justify-between mb-2 md:hidden">

          {/* Profile Avatar */}
          <div className="w-11 h-11 overflow-hidden rounded-full bg-gray-500 flex items-center justify-center">
            {profile?.avatar_url ? (

              <Link href="/dashboard/settings">
                <img
                  src={profile.avatar_url}
                  alt={`${profile.full_name || 'Profile'} avatar`}
                  className="w-full h-full object-cover"
                />
              </Link>
              
            ) : (
              <UserRound
                className="w-5 h-5 text-white"
                aria-hidden="true"
              />
            )}

          </div>

          {/* Logo */}
          <div>
            <img
              src="/xpnd-ai-logo-dark.svg"
              alt="Logo"
              className="w-60 h-15 object-contain"
            />
          </div>

          {/* Notification */}
          <button
            type="button"
            className="w-11 h-11 rounded-full flex items-center justify-center"
          >
            <Bell className="text-white" />
          </button>

        </div>

        <h1 className="text-xl md:text-3xl font-bold">
          Good day,{' '}
          {profile?.full_name
            ?.trim()
            .split(/\s+/)[0]}
          !
        </h1>

        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Track smarter with AI-powered insights.
        </p>

      </div>

      {/* =========================
          THIS MONTH OVERVIEW
      ========================== */}
      <Card className="mb-6 md:mb-8 border-primary/10 bg-gradient-to-br from-[#4242fe] to-[#8368fd]">

        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-xs md:text-sm font-medium text-white/70">
            This Month Overview
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 md:space-y-6">

          <div className="grid grid-cols-2 gap-4 md:gap-8">

            <div>
              <p className="text-xs text-white/70 font-medium mb-1 md:mb-2">
                Total Spent
              </p>

              <p className="text-2xl md:text-3xl font-bold">
                ₱{totalExpenses.toFixed(0)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-white/70 font-medium mb-1 md:mb-2">
                Budget
              </p>

              <p className="text-2xl md:text-3xl font-bold">
                ₱{totalBudget.toFixed(0)}
              </p>
            </div>

          </div>

          {/* Budget Alert */}
          {isOverBudget && (
            <div
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-red-100"
              role="alert"
            >
              <CircleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />

              <p>
                <span className="font-semibold">
                  Budget exceeded.
                </span>{' '}
                You are ₱
                {(
                  totalExpenses -
                  totalBudget
                ).toFixed(0)}{' '}
                over your monthly limit.
              </p>
            </div>
          )}

          {/* Approaching Budget */}
          {isApproachingBudget && (
            <div
              className="flex items-start gap-3 rounded-lg border border-amber-300/30 bg-amber-400/10 p-3 text-sm text-amber-100"
              role="status"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />

              <p>
                <span className="font-semibold">
                  Approaching your limit.
                </span>{' '}
                You have used{' '}
                {Math.round(
                  budgetPercentage
                )}
                % of your monthly budget.
              </p>
            </div>
          )}

          {/* Budget Progress */}
          <div className="space-y-2">

            <div className="flex items-center justify-between text-xs md:text-sm">
              <p className="text-white/70">
                Budget Usage
              </p>
            </div>

            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all"
                style={{
                  width: `${budgetPercentage}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between">

              <p className="text-xs md:text-sm text-white/70">
                ₱
                {Math.max(
                  totalBudget -
                    totalExpenses,
                  0
                ).toFixed(0)}{' '}
                left
              </p>

              <p className="text-xs md:text-sm font-medium">
                {Math.round(
                  budgetPercentage
                )}
                % used
              </p>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* =========================
          QUICK STATS
      ========================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6 md:mb-8">

        {[
          {
            label: 'Today',
            value: `₱${todaySpending.toFixed(0)}`,
            icon: Calendar,
          },
          {
            label: 'This Week',
            value: `₱${weekSpending.toFixed(0)}`,
            icon: Calendars,
          },
          {
            label: 'Transactions',
            value: transactionCount.toString(),
            icon: Database,
          },
          {
            label: 'Top Category',
            value: topCategory.category,
            icon: Layers,
          },
        ].map((stat) => (
          <Card key={stat.label}>

            <CardHeader className="pb-1 md:pb-2">

              <stat.icon className="w-4 h-4 md:w-5 md:h-5" />

              <CardTitle className="text-xs font-medium text-white/70">
                {stat.label}
              </CardTitle>

            </CardHeader>

            <CardContent>
              <p className="text-xl md:text-2xl font-bold">
                {stat.value}
              </p>
            </CardContent>

          </Card>
        ))}

      </div>

      {/* =========================
          AI INSIGHT
      ========================== */}
      <Card className="mb-6 overflow-hidden rounded-2xl border-0">

        <div className="flex h-[130px]">

          <div className="flex w-[65%] flex-col justify-center bg-card px-5 py-4">

            <h3 className="text-lg font-bold text-foreground">
              AI Insight
            </h3>

            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              You spent{' '}
              <span className="font-semibold text-foreground">
                25% more on Food
              </span>{' '}
              compared to last month.
            </p>

            <Button className="mt-4 h-9 w-fit rounded-md">
              View Details
            </Button>

          </div>

          <div className="flex w-[35%] items-center justify-center bg-muted">

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/50">

              <Icon
                name="image"
                size="xl"
                color="currentColor"
                iconNode={[]}
              />

            </div>

          </div>

        </div>

      </Card>

      {/* =========================
          ADD EXPENSE
      ========================== */}
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <p className="text-base md:text-lg">
          Add Expense
        </p>
      </div>

      <div className="mb-6 md:mb-8">

        <Link
          href="/dashboard/add-expense"
          className="block"
        >
          <Card className="transition-all cursor-pointer bg-primary/90 hover:bg-primary">

            <CardContent className="py-6 md:py-8 flex items-center justify-center">

              <div className="text-center">
                <Plus className="w-10 h-10 md:w-11 md:h-11 text-background" />
              </div>

            </CardContent>

          </Card>
        </Link>

      </div>

      {/* =========================
          RECENT ACTIVITY
      ========================== */}
      <div>
        <RecentActivity
          expenses={expenses}
        />
      </div>

    </div>
  )
}

export const DashboardOverview = memo(
  DashboardOverviewComponent
)