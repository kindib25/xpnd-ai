'use client'

import { memo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'

const HAIRLINE =
  'pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40'

const GLASS_SURFACE_DEEP =
  'relative overflow-hidden rounded-[26px] border border-border bg-card/80 backdrop-blur-2xl shadow-sm ' +
  'dark:border-white/[0.14] dark:bg-[#151922]/70 ' +
  'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-35px_rgba(0,0,0,0.85)]'

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
  onOverlayChange?: (active: boolean) => void
}

function QuickAddExpense({
  showExamples = false,
  onSaved,
  className,
  onOverlayChange,
}: QuickAddExpenseProps) {
  const [step, setStep] = useState<'input' | 'preview'>('input')
  const [input, setInput] = useState('')
  const [isParsingNLP, setIsParsingNLP] = useState(false)
  const [parsedExpense, setParsedExpense] = useState<ParsedExpense | null>(null)
  const [error, setError] = useState('')

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [merchant, setMerchant] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const showLoader = isParsingNLP
  const showPreview = step === 'preview' && !!parsedExpense
  const overlayActive = showLoader || showPreview

  useEffect(() => {
    onOverlayChange?.(overlayActive)
  }, [overlayActive, onOverlayChange])

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
      setError(err instanceof Error ? err.message : 'Failed to parse expense')
    } finally {
      setIsParsingNLP(false)
    }
  }

  const handleSubmitInput = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleParseExpense(input)
  }

  const handleSubmit = async (updatedExpense?: ParsedExpense) => {
    const expenseToSave: ParsedExpense = updatedExpense
      ? updatedExpense
      : { amount: parseFloat(amount), category, description, merchant, date }

    if (!expenseToSave.amount || !expenseToSave.category || !expenseToSave.date) {
      setError('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase.from('expenses').insert({
        user_id: user.id,
        amount: expenseToSave.amount,
        category: expenseToSave.category,
        description: expenseToSave.description || null,
        merchant: expenseToSave.merchant || null,
        date: expenseToSave.date,
      })

      if (insertError) throw insertError

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to save expense'
      console.error('[v0] Error saving expense:', err)
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={className}>
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
              border border-border bg-background px-4 py-4 pb-10
              text-base leading-relaxed text-foreground placeholder:text-muted-foreground
              shadow-sm backdrop-blur-xl
              transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              hover:border-border/80 hover:bg-foreground/[0.02]
              focus:outline-none focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/25
              disabled:cursor-not-allowed disabled:opacity-60
              dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white dark:placeholder:text-white/35
              dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
              dark:hover:border-white/[0.20] dark:hover:bg-white/[0.06]
              dark:focus:bg-white/[0.06]
            "
          />
          <div className="absolute bottom-3 right-4 text-[11px] tabular-nums text-muted-foreground dark:text-white/45">
            {input.length}/500
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground dark:text-white/55">
            <Sparkles className="w-3.5 h-3.5 text-primary/80" />
            <span>AI will analyze your expense</span>
          </div>

          <Button
            type="submit"
            disabled={isParsingNLP || !input.trim()}
            size="lg"
            className={`
              ${FOCUS_RING}
              ml-auto h-11 md:h-12 rounded-xl
              border border-primary/30
              bg-primary
              px-5 gap-2 text-sm font-semibold text-primary-foreground
              shadow-[0_0_18px_-6px_var(--primary)]
              transition-[transform,box-shadow] duration-300 ${EASE}
              hover:scale-[1.02] hover:bg-primary/90
              hover:shadow-[0_0_24px_-6px_var(--primary)]
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

      {showExamples && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-foreground">Try an example</p>
              <p className="text-xs text-muted-foreground mt-0.5">Click one to use it</p>
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
                  border border-border bg-foreground/[0.02]
                  text-sm text-foreground/75
                  shadow-sm backdrop-blur-xl
                  transition-[background-color,border-color,color,transform,box-shadow] duration-300 ${EASE}
                  hover:-translate-y-[1px] hover:border-primary/30
                  hover:bg-foreground/[0.05] hover:text-foreground
                  dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white/75
                  dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                  dark:hover:bg-white/[0.075] dark:hover:text-white
                `}
              >
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/35" />
                <span className="relative">{example}</span>
                <ArrowRight className="relative w-3.5 h-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="relative mt-5 flex items-start gap-3 overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 shadow-sm backdrop-blur-xl dark:border-red-400/30 dark:bg-red-500/[0.10] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent opacity-70 dark:via-red-300/50" />
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-100 shadow-sm dark:border-red-400/30 dark:bg-red-500/20 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-300" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-red-800 dark:text-red-100">Something went wrong</p>
            <p className="mt-0.5 text-xs text-red-600/85 break-words dark:text-red-200/85">{error}</p>
          </div>
        </div>
      )}

      {mounted && showLoader && createPortal(
        <div className="fixed inset-0 z-[100]">
          <AILoaderBackground />
          <div role="status" aria-live="polite" aria-label="Analyzing your expense" className="absolute inset-0 flex items-center justify-center">
            <AILoader />
          </div>
        </div>,
        document.body
      )}

      {mounted && !showLoader && showPreview && createPortal(
        <div role="dialog" aria-modal="true" aria-label="Confirm extracted expense" className="fixed inset-0 z-[100] overflow-y-auto">
          <button
            type="button"
            aria-label="Cancel preview"
            onClick={() => { if (!isSaving) setStep('input') }}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          />
          <div className="relative flex min-h-full items-center justify-center p-4">
            <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300">
              <AIExtractionPreview
                expense={parsedExpense!}
                onEdit={() => setStep('input')}
                onConfirm={(updatedExpense) => handleSubmit(updatedExpense)}
                isLoading={isSaving}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
interface DashboardOverviewProps {
  profile: { full_name?: string | null; avatar_url?: string | null } | null
  expenses: any[]
  budgets: any[]
  goals: any[]
}

function DashboardOverviewComponent({ profile, expenses, budgets, goals }: DashboardOverviewProps) {
  const [overlayActive, setOverlayActive] = useState(false)

  const formatPeso = (value: number) =>
    `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)
  const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.limit_amount || 0), 0)
  const budgetPercentage = totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0
  const isOverBudget = totalBudget > 0 && totalExpenses > totalBudget
  const isApproachingBudget = totalBudget > 0 && budgetPercentage >= 80 && !isOverBudget

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
    categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(exp.amount || 0)
  })

  const topCategory = Object.entries(categoryTotals).reduce(
    (top, [category, amount]) => amount > top.amount ? { category, amount } : top,
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
      <div className={overlayActive ? 'hidden' : undefined}>
        {/* Ambient background */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-background transition-colors duration-500 dark:bg-[radial-gradient(120%_120%_at_50%_0%,#30333a_0%,#1a1d22_42%,#13161a_72%,#0f1115_100%)]" />
          <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/15" />
          <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-primary/5 blur-[140px] dark:bg-primary/10" />
          <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/10 blur-[140px]" />
        </div>

        <div className="mx-auto w-full max-w-7xl p-4 text-foreground md:p-8">
          {/* HEADER */}
          <header className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-2 md:hidden">
              <div className="w-11 h-11 overflow-hidden rounded-full bg-muted flex items-center justify-center border border-border">
                {profile?.avatar_url ? (
                  <Link href="/dashboard/settings">
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  </Link>
                ) : (
                  <UserRound className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                )}
              </div>

              <div>
                <img src="/xpnd-ai-logo-dark.svg" alt="Logo" className="w-60 h-15 object-contain dark:block hidden" />
                <img src="/xpnd-ai-logo-light.svg" alt="Logo" className="w-60 h-15 object-contain dark:hidden block" />
              </div>

              <button
                type="button"
                aria-label="Notifications"
                className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background text-muted-foreground shadow-sm backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-foreground/[0.05] hover:text-foreground dark:border-white/[0.14] dark:bg-white/[0.055] dark:text-white/70 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] dark:hover:border-white/[0.24] dark:hover:bg-white/[0.10] dark:hover:text-white"
              >
                <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-3xl">
              Good day{firstName ? `, ${firstName}` : ''}!
            </h1>

            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              Track smarter with AI-powered insights.
            </p>
          </header>

          {/* THIS MONTH OVERVIEW (Now uses dynamic primary color) */}
          <Card className="relative mb-6 overflow-hidden rounded-[18px] border border-primary/50 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60 text-primary-foreground backdrop-blur-[28px] shadow-sm md:mb-8 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_36px_-24px_var(--primary)]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.15] via-transparent to-transparent dark:from-white/[0.22]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            <CardHeader className="relative z-10 pb-3 md:pb-4">
              <CardTitle className="text-xs font-medium text-primary-foreground/90 md:text-sm">
                This Month Overview
              </CardTitle>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4 md:space-y-6">
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div>
                  <p className="mb-1 text-xs font-medium text-primary-foreground/80 md:mb-2">Total Spent</p>
                  <p className="text-2xl font-bold text-primary-foreground md:text-3xl">{formatPeso(totalExpenses)}</p>
                </div>
                <div className="text-right">
                  <p className="mb-1 text-xs font-medium text-primary-foreground/80 md:mb-2">Budget</p>
                  <p className="text-2xl font-bold text-primary-foreground md:text-3xl">{formatPeso(totalBudget)}</p>
                </div>
              </div>

              {isOverBudget && (
                <div className="flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-sm text-red-50" role="alert">
                  <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p><span className="font-semibold">Budget exceeded.</span> You are {formatPeso(totalExpenses - totalBudget)} over your monthly limit.</p>
                </div>
              )}

              {isApproachingBudget && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/20 p-3 text-sm text-amber-50" role="status">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p><span className="font-semibold">Approaching your limit.</span> You have used {Math.round(budgetPercentage)}% of your monthly budget.</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <p className="text-primary-foreground/90">Budget Usage</p>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full border border-primary-foreground/20 bg-black/20">
                  <div 
                    className="h-full rounded-full bg-primary-foreground shadow-[0_0_12px_rgba(255,255,255,0.5)] transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-primary-foreground/80 md:text-sm">{formatPeso(Math.max(totalBudget - totalExpenses, 0))} left</p>
                  <p className="text-xs font-medium text-primary-foreground md:text-sm">{Math.round(budgetPercentage)}% used</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QUICK STATS */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-4 md:gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-[20px] p-4 md:p-5 border border-border bg-card/60 backdrop-blur-xl shadow-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-border/80 hover:bg-card dark:border-white/[0.14] dark:bg-white/[0.075] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)] dark:hover:border-white/[0.24] dark:hover:bg-white/[0.12]"
              >
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-transparent opacity-70 dark:from-white/[0.10] dark:to-white/[0.015]" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/5 blur-2xl dark:bg-white/[0.06]" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-center gap-2 pb-1 md:pb-2">
                    <stat.icon className="h-4 w-4 text-muted-foreground md:h-5 md:w-5 dark:text-white/50" aria-hidden="true" />
                    <span className="text-xs font-medium text-muted-foreground dark:text-white/50">{stat.label}</span>
                  </div>
                  <p className="mt-2 truncate text-xl font-semibold tabular-nums tracking-tight text-foreground md:text-2xl dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* QUICK ADD EXPENSE */}
          <div className="mb-6 md:mb-8">
            <Card className={GLASS_SURFACE_DEEP}>
              <div aria-hidden="true" className={HAIRLINE} />
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

              <CardContent className="relative z-10 p-4 sm:p-6 md:p-7">
                <div className="text-center mb-6 md:mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-medium shadow-sm backdrop-blur-xl dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Expense Tracking
                  </div>

                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground dark:text-white">
                    What did you spend on?
                  </h2>

                  <p className="mt-2 text-xs md:text-base text-muted-foreground max-w-80 md:max-w-lg mx-auto dark:text-white/55">
                    Just describe your expense naturally. Xpnd AI will automatically extract the amount, category, and details.
                  </p>
                </div>

                <QuickAddExpense showExamples={false} onOverlayChange={setOverlayActive} />
              </CardContent>
            </Card>
          </div>

          {/* RECENT ACTIVITY */}
          <RecentActivity expenses={expenses} />
        </div>
      </div>
    </>
  )
}

export const DashboardOverview = memo(DashboardOverviewComponent)