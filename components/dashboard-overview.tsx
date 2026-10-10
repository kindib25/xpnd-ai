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
  UserRound,
  Bell,
  Calendar,
  Calendars,
  Database,
  Layers,
  AlertTriangle,
  CircleAlert,
} from 'lucide-react'
import Link from 'next/link'
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

  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount || 0),
    0
  )

  const totalBudget = budgets.reduce(
    (sum, budget) => sum + parseFloat(budget.limit_amount || 0),
    0
  )

  const budgetPercentage =
    totalBudget > 0
      ? Math.min((totalExpenses / totalBudget) * 100, 100)
      : 0

  const isOverBudget = totalBudget > 0 && totalExpenses > totalBudget
  const isApproachingBudget =
    totalBudget > 0 && budgetPercentage >= 80 && !isOverBudget

  // Local-time safe: "YYYY-MM-DD" parsed as UTC shifts a day in negative offsets.
  const toLocalMidnight = (value: string) => {
    const [y, m, d] = value.split('-').map(Number)
    if (!y || !m || !d) return new Date(value)
    return new Date(y, m - 1, d)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySpending = expenses
    .filter((exp) => {
      const expDate = toLocalMidnight(exp.date)
      expDate.setHours(0, 0, 0, 0)
      return expDate.getTime() === today.getTime()
    })
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)

  // Sunday → Saturday
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  weekEnd.setHours(0, 0, 0, 0)

  const weekSpending = expenses
    .filter((exp) => {
      const expDate = toLocalMidnight(exp.date)
      return expDate >= weekStart && expDate < weekEnd
    })
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)

  const transactionCount = expenses.length

  const categoryTotals: Record<string, number> = {}
  expenses.forEach((exp) => {
    const category = exp.category || 'Uncategorized'
    categoryTotals[category] =
      (categoryTotals[category] || 0) + parseFloat(exp.amount || 0)
  })

  const topCategory = Object.entries(categoryTotals).reduce(
    (top, [category, amount]) =>
      amount > top.amount ? { category, amount } : top,
    { category: 'N/A', amount: 0 }
  )

  const STATS = [
    { label: 'Today', value: `₱${todaySpending.toFixed(0)}`, icon: Calendar },
    { label: 'This Week', value: `₱${weekSpending.toFixed(0)}`, icon: Calendars },
    { label: 'Transactions', value: transactionCount.toString(), icon: Database },
    { label: 'Top Category', value: topCategory.category, icon: Layers },
  ]

  const firstName = profile?.full_name?.trim().split(/\s+/)[0]

  return (
    <>
      {/* =========================================================
          AMBIENT BACKGROUND — top-level, fixed, out of content flow
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 50% 0%, #30333a 0%, #1a1d22 42%, #13161a 72%, #0f1115 100%)',
          }}
        />

      </div>

      <div className="mx-auto w-full max-w-7xl p-4 text-white md:p-8">

        {/* =========================
            HEADER
        ========================== */}
        <header className="mb-6 md:mb-8">

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
            
            {/* Notification — glass chip */}
            <button
              type="button"
              aria-label="Notifications"
              className="
                grid h-11 w-11 place-items-center rounded-full
                border border-white/[0.14] bg-white/[0.055]
                text-white/70
                shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]
                backdrop-blur-xl
                transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                hover:-translate-y-0.5 hover:border-white/[0.24]
                hover:bg-white/[0.10] hover:text-white
              "
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

          </div>

          <h1 className="text-xl font-semibold tracking-tight text-white md:text-3xl">
            Good day{firstName ? `, ${firstName}` : ''}!
          </h1>

          <p className="mt-1 text-xs text-white/40 md:text-sm">
            Track smarter with AI-powered insights.
          </p>

        </header>

        {/* =========================
            THIS MONTH OVERVIEW — UNCHANGED
        ========================== */}
        <Card
          className="
    relative
    mb-6
    overflow-hidden
    rounded-[18px]
    border
    border-[#724bf6]/[0.50]
    bg-gradient-to-br
    from-[#271c83]/[0.72]
    via-[#4d34bd]/[0.62]
    to-[#724bf6]/[0.42]
    text-white
    backdrop-blur-[28px]
    shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_36px_-24px_rgba(39,28,131,0.70)]
    md:mb-8
  "
        >
          <div
            aria-hidden="true"
            className="
      pointer-events-none
      absolute inset-0
      bg-gradient-to-br
      from-[#e9d5ff]/[0.22]
      via-[#c4b5fd]/[0.05]
      to-[#a78bfa]/[0.10]
    "
          />

          <div
            aria-hidden="true"
            className="
      pointer-events-none
      absolute inset-x-5 top-0
      h-px
      bg-gradient-to-r
      from-transparent
      via-[#c4b5fd]/85
      to-transparent
    "
          />

          <CardHeader className="relative z-10 pb-3 md:pb-4">
            <CardTitle className="text-xs font-medium text-white/90 md:text-sm">
              This Month Overview
            </CardTitle>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4 md:space-y-6">

            <div className="grid grid-cols-2 gap-4 md:gap-8">

              <div>
                <p className="mb-1 text-xs font-medium text-white/90 md:mb-2">
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-white md:text-3xl">
                  ₱{totalExpenses.toFixed(0)}
                </p>
              </div>

              <div className="text-right">
                <p className="mb-1 text-xs font-medium text-white/90 md:mb-2">
                  Budget
                </p>
                <p className="text-2xl font-bold text-white md:text-3xl">
                  ₱{totalBudget.toFixed(0)}
                </p>
              </div>

            </div>

            {isOverBudget && (
              <div
                className="
          flex items-start gap-3
          rounded-lg
          border border-red-400/50
          bg-red-500/[0.22]
          p-3
          text-sm text-red-50
        "
                role="alert"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>
                  <span className="font-semibold">Budget exceeded.</span>{' '}
                  You are ₱{(totalExpenses - totalBudget).toFixed(0)} over your
                  monthly limit.
                </p>
              </div>
            )}

            {isApproachingBudget && (
              <div
                className="
          flex items-start gap-3
          rounded-lg
          border border-amber-400/50
          bg-amber-500/[0.22]
          p-3
          text-sm text-amber-50
        "
                role="status"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>
                  <span className="font-semibold">Approaching your limit.</span>{' '}
                  You have used {Math.round(budgetPercentage)}% of your monthly
                  budget.
                </p>
              </div>
            )}

            <div className="space-y-2">

              <div className="flex items-center justify-between text-xs md:text-sm">
                <p className="text-white/90">Budget Usage</p>
              </div>

              <div
                className="
          h-3 w-full
          overflow-hidden
          rounded-full
          border border-[#724bf6]/[0.30]
          bg-[#170f57]/[0.55]
        "
              >
                <div
                  className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-[#c8fb45]
            to-[#9ee82d]
            shadow-[0_0_12px_rgba(158,232,45,0.65)]
            transition-[width]
            duration-700
            ease-[cubic-bezier(0.16,1,0.3,1)]
          "
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-white/90 md:text-sm">
                  ₱{Math.max(totalBudget - totalExpenses, 0).toFixed(0)} left
                </p>
                <p className="text-xs font-medium text-[#c8fb45] md:text-sm">
                  {Math.round(budgetPercentage)}% used
                </p>
              </div>

            </div>

          </CardContent>
        </Card>

        {/* =========================
            QUICK STATS
        ========================== */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-4 md:gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="
                group relative overflow-hidden rounded-[20px] p-4 md:p-5

                border border-white/[0.14]
                bg-white/[0.075]
                backdrop-blur-xl

                shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)]

                transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                hover:-translate-y-1
                hover:border-white/[0.24]
                hover:bg-white/[0.12]
                hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_20px_55px_-18px_rgba(0,0,0,0.85)]
              "
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.10] via-transparent to-white/[0.015] opacity-70"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/[0.06] blur-2xl"
              />

              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center gap-2 pb-1 md:pb-2">
                  <stat.icon
                    className="h-4 w-4 text-white/50 md:h-5 md:w-5"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-white/50">
                    {stat.label}
                  </span>
                </div>

                <p className="mt-2 truncate text-xl font-semibold tabular-nums tracking-tight text-white md:text-2xl">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* =========================
            AI INSIGHT — UNCHANGED
        ========================== */}
        <Card
          className="
    group relative mb-6 overflow-hidden rounded-[28px]
    border-0 bg-transparent p-[2px]
    shadow-[0_0_25px_rgba(105,69,255,0.15)]
  "
        >
          <div
            className="
      absolute inset-0 rounded-[28px]
      bg-[linear-gradient(90deg,#7CFF3A_0%,#65E8FF_48%,#6945FF_100%)]
      opacity-90
    "
          />

          <div
            className="
      absolute -inset-1 rounded-[30px]
      bg-[linear-gradient(90deg,#7CFF3A,#65E8FF,#6945FF)]
      opacity-25 blur-xl
    "
          />

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
            <div className="min-w-0 flex-1">
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
            ADD EXPENSE — UNCHANGED
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
        <RecentActivity expenses={expenses} />

      </div>
    </>
  )
}

export const DashboardOverview = memo(DashboardOverviewComponent)