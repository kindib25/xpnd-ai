'use client'

import { memo, useState } from 'react'
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
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [isLoadingInsight, setIsLoadingInsight] = useState(false)
  const [insightError, setInsightError] = useState<string | null>(null)

  async function generateInsight() {
    setIsLoadingInsight(true)
    setInsightError(null)

    try {
      const response = await fetch('/api/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses, budgets }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate an insight')
      }

      setAiInsight(data.insight)
    } catch (error) {
      console.error('[v0] Insight request failed:', error)
      setInsightError('AI Insight is temporarily unavailable.')
    } finally {
      setIsLoadingInsight(false)
    }
  }

  // Calculate total expenses
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
      <Card
        className="
    group relative mb-6 overflow-hidden rounded-[28px]
    border-0 bg-transparent p-[2px]
    shadow-[0_0_25px_rgba(105,69,255,0.15)]
  "
      >
        {/* Neon gradient border */}
        <div
          className="
      absolute inset-0 rounded-[28px]
      bg-[linear-gradient(90deg,#7CFF3A_0%,#65E8FF_48%,#6945FF_100%)]
      opacity-90
    "
        />

        {/* Glow */}
        <div
          className="
      absolute -inset-1 rounded-[30px]
      bg-[linear-gradient(90deg,#7CFF3A,#65E8FF,#6945FF)]
      opacity-25 blur-xl
    "
        />

        {/* Card content */}
        <div
          className="
      relative flex min-h-[190px]
      flex-col justify-between
      gap-5
      rounded-[26px]
      bg-[#0D1626]
      px-5 py-6

      sm:px-6 sm:py-7

      md:min-h-[190px]
      md:flex-row
      md:items-center
      md:gap-8
      md:px-8

      lg:px-10
    "
        >
          {/* Left side */}
          <div className="min-w-0 flex-1">
            {/* Heading */}
            <div className="mb-3 flex items-center gap-2 md:gap-2.5">
              <div
                className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-md
            bg-gradient-to-br
            from-[#7A35FF]
            to-[#5B24E8]
            shadow-[0_0_18px_rgba(105,69,255,0.45)]
            sm:h-10 sm:w-10
          "
              >
                <span className="text-lg font-bold text-white sm:text-xl">
                  AI
                </span>
              </div>

              <h3
                className="
            text-lg font-bold
            tracking-tight text-white
            sm:text-xl
            md:text-2xl
          "
              >
                Insight
              </h3>
            </div>

            {/* Insight text */}
            <p
              className="
          line-clamp-3
          max-w-3xl
          text-sm
          font-medium
          leading-6
          text-[#C5CCDB]
          sm:line-clamp-2
          md:text-base
          md:leading-7
        "
            >
              {isLoadingInsight
                ? 'Analyzing your spending...'
                : aiInsight ||
                insightError ||
                'Get a personalized spending pattern and recommendation.'}
            </p>
          </div>

          {/* Right side / Button */}
          <div className="w-full shrink-0 md:w-auto">
            <Button
              className="
          h-12
          w-full
          rounded-xl
          border-0
          bg-gradient-to-r
          from-[#6930FF]
          to-[#7538FF]
          px-6
          text-sm
          font-bold
          text-white

          shadow-[0_0_20px_rgba(105,69,255,0.30)]

          transition-all
          duration-200

          hover:scale-[1.02]
          hover:from-[#7538FF]
          hover:to-[#824AFF]
          hover:shadow-[0_0_28px_rgba(105,69,255,0.45)]

          disabled:cursor-not-allowed
          disabled:opacity-50
          disabled:hover:scale-100

          sm:h-14
          sm:text-base
          sm:px-8

          md:min-w-[170px]
        "
              onClick={generateInsight}
              disabled={isLoadingInsight || expenses.length === 0}
            >
              {isLoadingInsight
                ? 'Loading...'
                : aiInsight
                  ? 'Refresh'
                  : 'Get Insight'}
            </Button>
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