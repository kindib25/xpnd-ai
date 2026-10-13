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
  UserRound,
  Bell,
  Calendar,
  Calendars,
  Database,
  Layers,
  AlertTriangle,
  CircleAlert,
  Loader2,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RecentActivity } from './recent-activity'
import { AIExtractionPreview } from './ai-extraction-preview'
import AILoader from '@/components/ui/ai-loader'
import AILoaderBackground from './ui/ai-loader-background'

// ---------------------------------------------------------------------------
// Shared glass tokens
// ---------------------------------------------------------------------------
const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4b5fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#13161a]'

const HAIRLINE =
  'pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70'

const GLASS_SURFACE_DEEP =
  'relative overflow-hidden rounded-[26px] border border-white/[0.14] bg-[#151922]/70 backdrop-blur-2xl ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-35px_rgba(0,0,0,0.85)]'

// ---------------------------------------------------------------------------
// Quick-add-expense — inline NLP input + AI preview + save
// ---------------------------------------------------------------------------
const EXAMPLE_EXPENSES = [
  'Spent 25 on jeep fare',
  'Lunch at Jollibee 200',
  'Movie ticket 250',
  'Paid electricity bill 3000',
  'Taxi ride to airport 500',
  'Coffee at Starbucks 150',
  'Bought a new book for 400',
]

interface ParsedExpense {
  amount: number
  category: string
  description: string
  merchant: string
  date: string
}

interface QuickAddExpenseProps {
  showExamples?: boolean
  onSaved?: () => void
  className?: string
}

function QuickAddExpense({
  showExamples = false,
  onSaved,
  className,
}: QuickAddExpenseProps) {
  const [step, setStep] = useState<'input' | 'preview'>('input')
  const [input, setInput] = useState('')
  const [isParsingNLP, setIsParsingNLP] = useState(false)
  const [parsedExpense, setParsedExpense] =
    useState<ParsedExpense | null>(null)
  const [error, setError] = useState('')

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [merchant, setMerchant] = useState('')
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // ============================
  // PARSE (NLP)
  // ============================
  const handleParseExpense = async (text: string) => {
    if (!text.trim()) return

    setIsParsingNLP(true)
    setError('')

    try {
      const response = await fetch('/api/parse-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to parse expense')
      }

      const data = await response.json()

      const expense: ParsedExpense = {
        amount: Number(data.expense.amount),
        category: data.expense.category || '',
        description: data.expense.description || '',
        merchant: data.expense.merchant || '',
        date: data.expense.date || new Date().toISOString(),
      }

      setParsedExpense(expense)
      setAmount(expense.amount.toString())
      setCategory(expense.category)
      setDescription(expense.description)
      setMerchant(expense.merchant)
      setDate(expense.date)
      setStep('preview')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to parse expense'
      )
    } finally {
      setIsParsingNLP(false)
    }
  }

  const handleSubmitInput = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleParseExpense(input)
  }

  // ============================
  // SAVE
  // ============================
  const handleSubmit = async (updatedExpense?: ParsedExpense) => {
    const expenseToSave: ParsedExpense = updatedExpense
      ? updatedExpense
      : {
        amount: parseFloat(amount),
        category,
        description,
        merchant,
        date,
      }

    if (
      !expenseToSave.amount ||
      !expenseToSave.category ||
      !expenseToSave.date
    ) {
      setError('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: expenseToSave.amount,
          category: expenseToSave.category,
          description: expenseToSave.description || null,
          merchant: expenseToSave.merchant || null,
          date: expenseToSave.date,
        })

      if (insertError) throw insertError

      // Reset local state
      setInput('')
      setParsedExpense(null)
      setAmount('')
      setCategory('')
      setDescription('')
      setMerchant('')
      setDate(new Date().toISOString().split('T')[0])
      setStep('input')

      onSaved?.()
      router.refresh()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save expense'
      console.error('[v0] Error saving expense:', err)
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // ============================
  // LOADING (AI)
  // ============================
  if (isParsingNLP) {
    return (
      <>
        <AILoaderBackground />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <AILoader />
        </div>
      </>
    )
  }

  // ============================
  // PREVIEW
  // ============================
  if (step === 'preview' && parsedExpense) {
    return (
      <AIExtractionPreview
        expense={parsedExpense}
        onEdit={() => setStep('input')}
        onConfirm={(updatedExpense) => handleSubmit(updatedExpense)}
        isLoading={isSaving}
      />
    )
  }

  // ============================
  // INPUT UI
  // ============================
  return (
    <div className={className}>
      <Card className={GLASS_SURFACE_DEEP}>
        <div aria-hidden="true" className={HAIRLINE} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#9ee82d]/12 blur-3xl"
        />

        <CardContent className="relative z-10 p-4 sm:p-6 md:p-7">
          <form onSubmit={handleSubmitInput} className="space-y-4">
            <div className="relative">
              <textarea
                placeholder="e.g. Spent 150 pesos for lunch"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setError('')
                }}
                disabled={isParsingNLP}
                maxLength={500}
                rows={4}
                aria-label="Describe your expense"
                className="
                  w-full min-h-[120px] md:min-h-[140px] resize-none rounded-2xl
                  border border-white/[0.14] bg-white/[0.045] px-4 py-4 pb-10
                  text-base leading-relaxed text-white placeholder:text-white/35
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl
                  transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  hover:border-white/[0.20] hover:bg-white/[0.06]
                  focus:outline-none focus:border-[#9ee82d]/50 focus:bg-white/[0.06]
                  focus:ring-2 focus:ring-[#9ee82d]/25
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              />
              <div className="absolute bottom-3 right-4 text-[11px] tabular-nums text-white/45">
                {input.length}/500
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-white/55">
                <Sparkles className="w-3.5 h-3.5 text-[#9ee82d]/80" />
                <span>AI will analyze your expense</span>
              </div>

              <Button
                type="submit"
                disabled={isParsingNLP || !input.trim()}
                size="lg"
                className={`
                  ${FOCUS_RING}
                  ml-auto h-11 md:h-12 rounded-xl
                  border border-[#9ee82d]/30
                  bg-gradient-to-r from-[#9ee82d] to-[#c8ff75]
                  px-5 gap-2 text-sm font-semibold text-[#17200a]
                  shadow-[0_0_18px_-6px_rgba(158,232,45,0.65)]
                  transition-[transform,box-shadow] duration-300 ${EASE}
                  hover:scale-[1.02]
                  hover:shadow-[0_0_24px_-6px_rgba(158,232,45,0.85)]
                  disabled:cursor-not-allowed disabled:opacity-50
                  disabled:hover:scale-100
                `}
              >
                {isParsingNLP ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Expense
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showExamples && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-white/90">
                Try an example
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                Click one to use it
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLE_EXPENSES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setInput(example)
                  setError('')
                }}
                className={`
                  ${FOCUS_RING}
                  group relative flex items-center justify-between gap-3
                  overflow-hidden text-left px-3.5 py-3 rounded-xl
                  border border-white/[0.14] bg-white/[0.045]
                  text-sm text-white/75
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl
                  transition-[background-color,border-color,color,transform,box-shadow] duration-300 ${EASE}
                  hover:-translate-y-[1px] hover:border-[#9ee82d]/30
                  hover:bg-white/[0.075] hover:text-white
                  hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_30px_-18px_rgba(158,232,45,0.55)]
                `}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-70"
                />
                <span className="relative">{example}</span>
                <ArrowRight className="relative w-3.5 h-3.5 shrink-0 text-white/40 transition-colors group-hover:text-[#c8ff75]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="relative mt-5 flex items-start gap-3 overflow-hidden rounded-xl border border-red-400/30 bg-red-500/[0.10] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-red-300/50 to-transparent opacity-70"
          />
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-400/30 bg-red-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
            <AlertCircle className="w-4 h-4 text-red-300" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-red-100">
              Something went wrong
            </p>
            <p className="mt-0.5 text-xs text-red-200/85 break-words">
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
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

  // Format a number as Philippine peso with thousands separators.
  const formatPeso = (value: number) =>
    `₱${value.toLocaleString('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`

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
    { label: 'Today', value: formatPeso(todaySpending), icon: Calendar },
    { label: 'This Week', value: formatPeso(weekSpending), icon: Calendars },
    { label: 'Transactions', value: transactionCount.toString(), icon: Database },
    { label: 'Top Category', value: topCategory.category, icon: Layers },
  ]

  const firstName = profile?.full_name?.trim().split(/\s+/)[0]

  return (
    <>
      {/* =========================================================
          AMBIENT BACKGROUND — fixed, full-viewport, out of content flow.
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

        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#9ee82d]/[0.14] blur-[130px]" />
        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-[#724bf6]/[0.20] blur-[140px]" />
        <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/[0.10] blur-[140px]" />
      </div>

      <div className="mx-auto w-full max-w-7xl p-4 text-white md:p-8">
        {/* =========================
            HEADER
        ========================== */}
        <header className="mb-6 md:mb-8">
          {/* Mobile Only */}
          <div className="flex items-center justify-between mb-2 md:hidden">
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

            <div>
              <img
                src="/xpnd-ai-logo-dark.svg"
                alt="Logo"
                className="w-60 h-15 object-contain"
              />
            </div>

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
            THIS MONTH OVERVIEW
        ========================== */}
        <Card
          className="
            relative mb-6 overflow-hidden rounded-[18px]
            border border-[#724bf6]/[0.50]
            bg-gradient-to-br from-[#271c83]/[0.72] via-[#4d34bd]/[0.62] to-[#724bf6]/[0.42]
            text-white backdrop-blur-[28px]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_36px_-24px_rgba(39,28,131,0.70)]
            md:mb-8
          "
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0
              bg-gradient-to-br from-[#e9d5ff]/[0.22] via-[#c4b5fd]/[0.05] to-[#a78bfa]/[0.10]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-x-5 top-0 h-px
              bg-gradient-to-r from-transparent via-[#c4b5fd]/85 to-transparent
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
                  {formatPeso(totalExpenses)}
                </p>
              </div>

              <div className="text-right">
                <p className="mb-1 text-xs font-medium text-white/90 md:mb-2">
                  Budget
                </p>
                <p className="text-2xl font-bold text-white md:text-3xl">
                  {formatPeso(totalBudget)}
                </p>
              </div>
            </div>

            {isOverBudget && (
              <div
                className="
                  flex items-start gap-3 rounded-lg
                  border border-red-400/50 bg-red-500/[0.22] p-3
                  text-sm text-red-50
                "
                role="alert"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>
                  <span className="font-semibold">Budget exceeded.</span>{' '}
                  You are {formatPeso(totalExpenses - totalBudget)} over your
                  monthly limit.
                </p>
              </div>
            )}

            {isApproachingBudget && (
              <div
                className="
                  flex items-start gap-3 rounded-lg
                  border border-amber-400/50 bg-amber-500/[0.22] p-3
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
                  h-3 w-full overflow-hidden rounded-full
                  border border-[#724bf6]/[0.30] bg-[#170f57]/[0.55]
                "
              >
                <div
                  className="
                    h-full rounded-full
                    bg-gradient-to-r from-[#c8fb45] to-[#9ee82d]
                    shadow-[0_0_12px_rgba(158,232,45,0.65)]
                    transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                  "
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-white/90 md:text-sm">
                  {formatPeso(Math.max(totalBudget - totalExpenses, 0))} left
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
                border border-white/[0.14] bg-white/[0.075] backdrop-blur-xl
                shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)]
                transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                hover:-translate-y-1 hover:border-white/[0.24] hover:bg-white/[0.12]
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
            AI INSIGHT
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
              relative flex min-h-[190px] flex-col justify-between gap-5
              rounded-[26px] bg-[#0D1626] px-5 py-6
              sm:px-6 sm:py-7
              md:min-h-[190px] md:flex-row md:items-center md:gap-8 md:px-8
              lg:px-10
            "
          >
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center gap-2 md:gap-2.5">
                <div
                  className="
                    flex h-9 w-9 shrink-0 items-center justify-center rounded-md
                    bg-gradient-to-br from-[#7A35FF] to-[#5B24E8]
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
                    text-lg font-bold tracking-tight text-white
                    sm:text-xl md:text-2xl
                  "
                >
                  Insight
                </h3>
              </div>

              <p
                className="
                  line-clamp-3 max-w-3xl text-sm font-medium leading-6 text-[#C5CCDB]
                  sm:line-clamp-2 md:text-base md:leading-7
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
                  h-12 w-full rounded-xl border-0
                  bg-gradient-to-r from-[#6930FF] to-[#7538FF]
                  px-6 text-sm font-bold text-white
                  shadow-[0_0_20px_rgba(105,69,255,0.30)]
                  transition-all duration-200
                  hover:scale-[1.02] hover:from-[#7538FF] hover:to-[#824AFF]
                  hover:shadow-[0_0_28px_rgba(105,69,255,0.45)]
                  disabled:cursor-not-allowed disabled:opacity-50
                  disabled:hover:scale-100
                  sm:h-14 sm:text-base sm:px-8
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
            QUICK ADD EXPENSE — inline form
        ========================== */}
        <div className="mb-6 md:mb-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full border border-[#9ee82d]/25 bg-[#9ee82d]/[0.08] text-[#c8ff75] text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5" />
              AI Expense Tracking
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              What did you spend on?
            </h2>

            <p className="mt-2 text-sm md:text-base text-white/55 max-w-lg mx-auto">
              Just describe your expense naturally. Xpnd AI will
              automatically extract the amount, category, and details.
            </p>
          </div>

          <QuickAddExpense showExamples={false} />
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