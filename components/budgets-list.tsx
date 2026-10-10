'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Trash2,
  Plus,
  X,
  AlertTriangle,
  CircleAlert,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
]

interface BudgetsListProps {
  budgets: any[]
  monthlyBudget: any | null
  expenses: any[]
  monthYear: string
}

const money = (value: number) =>
  `₱${value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`

/**
 * Timezone-safe "YYYY-MM" extraction.
 * Avoids `new Date().toISOString()` which shifts month boundaries
 * in negative UTC offsets.
 */
function monthKey(value: string): string {
  if (!value) return ''
  const [y, m] = value.split('-')
  if (!y || !m) return ''
  return `${y}-${m.padStart(2, '0')}`
}

export function BudgetsList({
  budgets,
  monthlyBudget,
  expenses,
  monthYear,
}: BudgetsListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingMonthly, setEditingMonthly] = useState(false)
  const [monthlyAmount, setMonthlyAmount] = useState(
    monthlyBudget?.limit_amount?.toString() || ''
  )
  const [newCategory, setNewCategory] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [monthlyError, setMonthlyError] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const router = useRouter()

  const allocated = useMemo(
    () =>
      budgets.reduce(
        (sum, budget) => sum + Number(budget.budget_amount || 0),
        0
      ),
    [budgets]
  )

  const monthlyLimit = Number(monthlyBudget?.limit_amount || 0)

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => monthKey(expense.date) === monthYear),
    [expenses, monthYear]
  )

  const totalSpent = useMemo(
    () =>
      monthExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
      ),
    [monthExpenses]
  )

  const remaining = monthlyLimit - totalSpent
  const monthlyPercentage =
    monthlyLimit > 0 ? Math.min(100, (totalSpent / monthlyLimit) * 100) : 0

  const isMonthlyOverBudget = monthlyLimit > 0 && totalSpent > monthlyLimit
  const isMonthlyApproaching =
    monthlyLimit > 0 && monthlyPercentage >= 80 && !isMonthlyOverBudget

  // --- Progress bar tone derived from state -------------------------------
  const monthlyBarTone = isMonthlyOverBudget
    ? 'from-red-500 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.55)]'
    : isMonthlyApproaching
      ? 'from-amber-400 to-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.50)]'
      : 'from-[#c8fb45] to-[#8bef3d] shadow-[0_0_12px_rgba(158,232,45,0.50)]'

  const getBudgetProgress = (budget: any) => {
    const spent = expenses
      .filter(
        (expense) =>
          expense.category === budget.category &&
          monthKey(expense.date) === monthYear
      )
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    const limit = Number(budget.budget_amount || 0)
    return {
      spent,
      limit,
      percentage: limit > 0 ? Math.min(100, (spent / limit) * 100) : 0,
    }
  }

  // --- Monthly budget ------------------------------------------------------
  const saveMonthlyBudget = async (event: React.FormEvent) => {
    event.preventDefault()
    const amount = Number(monthlyAmount)
    const floor = Math.max(allocated, 1)

    if (!Number.isFinite(amount) || amount < floor) {
      setMonthlyError(
        allocated > 0
          ? `Monthly budget must be at least ${money(allocated)} to cover your category budgets.`
          : 'Enter a valid monthly budget amount.'
      )
      return
    }

    setIsLoading(true)
    setMonthlyError('')

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: saveError } = await supabase
        .from('monthly_budgets')
        .upsert(
          { user_id: user.id, month_year: monthYear, limit_amount: amount },
          { onConflict: 'user_id,month_year' }
        )
      if (saveError) throw saveError

      setEditingMonthly(false)
      toast.success('Monthly budget updated successfully.')
      router.refresh()
    } catch (saveError) {
      console.error('[v0] Error saving monthly budget:', saveError)
      toast.error('Could not save the monthly budget.')
    } finally {
      setIsLoading(false)
    }
  }

  // --- Category budget -----------------------------------------------------
  const handleAddBudget = async (event: React.FormEvent) => {
    event.preventDefault()
    const amount = Number(newAmount)

    if (!newCategory || !Number.isFinite(amount) || amount <= 0) {
      setCategoryError('Choose a category and enter a valid amount.')
      return
    }
    if (!monthlyLimit) {
      setCategoryError('Set a monthly budget before adding categories.')
      return
    }
    if (allocated + amount > monthlyLimit) {
      setCategoryError(
        `Category budgets cannot exceed your monthly limit of ${money(monthlyLimit)}.`
      )
      return
    }

    setIsLoading(true)
    setCategoryError('')

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase.from('budgets').insert({
        user_id: user.id,
        category: newCategory,
        budget_amount: amount,
        month_year: monthYear,
      })
      if (insertError) throw insertError

      setNewCategory('')
      setNewAmount('')
      setIsAdding(false)
      toast.success('Category budget added successfully.')
      router.refresh()
    } catch (insertError) {
      console.error('[v0] Error adding category budget:', insertError)
      toast.error(
        'Could not add category budget. Check that the category is not already listed.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // --- Delete --------------------------------------------------------------
  const confirmDeleteBudget = async (id: string, category: string) => {
    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[v0] Error deleting budget:', deleteError)
      toast.error(`Could not delete ${category} budget.`)
      return
    }

    toast.success(`${category} budget deleted successfully.`)
    router.refresh()
  }

  const handleDeleteBudget = (id: string, category: string) => {
    toast.warning(`Delete ${category} budget?`, {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: () => confirmDeleteBudget(id, category),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => { },
      },
    })
  }

  // --- Modal helpers -------------------------------------------------------
  const closeMonthlyModal = () => {
    if (isLoading) return
    setEditingMonthly(false)
    setMonthlyError('')
  }

  const closeAddModal = () => {
    if (isLoading) return
    setIsAdding(false)
    setCategoryError('')
  }

  return (
    <div className="space-y-6">
      {/* =========================================================
          AMBIENT BACKGROUND — fixed, full-viewport, out of content flow.
          Colour orbs give the backdrop-blur something real to bite on.
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

        {/* Lime orb — primary accent, upper-left */}
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#9ee82d]/[0.14] blur-[130px]" />

        {/* Violet orb — brand purple, right */}
        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-[#724bf6]/[0.20] blur-[140px]" />

        {/* Sky/cyan counterweight, bottom */}
        <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/[0.10] blur-[140px]" />
      </div>
      
      {/* =========================================================
          THIS MONTH OVERVIEW — featured glass card
      ========================================================== */}
      <Card
        className="
          relative
          mb-6
          overflow-hidden
          rounded-[18px]
          border
          border-[#9ee82d]/[0.22]
          bg-[#0f1115]/[0.55]
          text-white
          backdrop-blur-[28px]
          shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_36px_-24px_rgba(0,0,0,0.40)]
          md:mb-8
        "
      >
        {/* Lime tint overlay */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            bg-[#9ee82d]/[0.14]
          "
        />

        {/* Glass gradient */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            bg-gradient-to-br
            from-white/[0.16]
            via-transparent
            to-white/[0.03]
          "
        />

        {/* Top specular hairline — tinted to the card hue */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-x-5 top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-[#9ee82d]/50
            to-transparent
          "
        />

        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-3 md:pb-4">
          <div>
            <CardTitle className="text-xs font-bold text-[#b6f04a] md:text-sm">
              This Month Overview
            </CardTitle>
            <p className="mt-1 text-xs text-white/60 md:text-sm">
              {monthYear}
            </p>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingMonthly((value) => !value)}
            aria-label="Edit monthly budget"
            className="
              group
              relative
              cursor-pointer
              overflow-hidden
              rounded-full
              border
              border-white/[0.14]
              bg-white/[0.08]
              px-5
              py-0
              text-white/80
              backdrop-blur-xl
              transition-[background-color,border-color,color]
              duration-500
              ease-[cubic-bezier(0.16,1,0.3,1)]
              hover:border-white/[0.20]
              hover:bg-white/[0.14]
              hover:text-white
              md:px-8
            "
          >
            <span className="relative z-10">Edit</span>
            {/* Hover sheen — transform-based, compositor-friendly */}
            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute inset-y-0
                left-0
                w-1/2
                -translate-x-full
                bg-gradient-to-r
                from-transparent
                via-white/[0.10]
                to-transparent
                transition-transform
                duration-500
                ease-[cubic-bezier(0.16,1,0.3,1)]
                group-hover:translate-x-[300%]
              "
            />
          </Button>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4 md:space-y-6">
          {/* Spending summary */}
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div>
              <p className="mb-1 text-xs font-medium text-white/60 md:mb-2">
                Total Spent
              </p>
              <p className="text-2xl font-bold text-white md:text-3xl">
                {money(totalSpent)}
              </p>
            </div>

            <div className="text-right">
              <p className="mb-1 text-xs font-medium text-white/60 md:mb-2">
                Budget
              </p>
              <p className="text-2xl font-bold text-[#b6f04a] md:text-3xl">
                {money(monthlyLimit)}
              </p>
            </div>
          </div>

          {/* Alerts — no blur, contrast-safe text */}
          {isMonthlyOverBudget && (
            <div
              className="
                flex items-start gap-3
                rounded-lg
                border border-red-400/30
                bg-red-500/[0.14]
                p-3
                text-sm text-red-100
              "
              role="alert"
            >
              <span
                className="
                  flex h-6 w-6 shrink-0 items-center justify-center
                  rounded-full
                  border border-red-400/30
                  bg-red-500/[0.14]
                "
              >
                <CircleAlert className="size-3.5" aria-hidden="true" />
              </span>
              <p>
                <span className="font-semibold">Budget exceeded.</span>{' '}
                You are {money(totalSpent - monthlyLimit)} over your monthly
                limit.
              </p>
            </div>
          )}

          {isMonthlyApproaching && (
            <div
              className="
                flex items-start gap-3
                rounded-lg
                border border-amber-400/30
                bg-amber-500/[0.14]
                p-3
                text-sm text-amber-100
              "
              role="status"
            >
              <span
                className="
                  flex h-6 w-6 shrink-0 items-center justify-center
                  rounded-full
                  border border-amber-400/30
                  bg-amber-500/[0.14]
                "
              >
                <AlertTriangle className="size-3.5" aria-hidden="true" />
              </span>
              <p>
                <span className="font-semibold">Approaching your limit.</span>{' '}
                You have used {Math.round(monthlyPercentage)}% of your monthly
                budget.
              </p>
            </div>
          )}

          {/* Budget progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <p className="text-white/60">Budget Usage</p>
            </div>

            <div
              className="
                h-3 w-full
                overflow-hidden
                rounded-full
                border border-white/[0.08]
                bg-white/[0.10]
              "
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(monthlyPercentage)}
              aria-label="Monthly budget usage"
            >
              <div
                className={`
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  ${monthlyBarTone}
                  transition-[width,background,box-shadow]
                  duration-700
                  ease-[cubic-bezier(0.16,1,0.3,1)]
                `}
                style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-white/60 md:text-sm">
                {money(Math.max(remaining, 0))} left
              </p>
              <p
                className={`text-xs font-medium md:text-sm ${isMonthlyOverBudget
                  ? 'text-red-300'
                  : isMonthlyApproaching
                    ? 'text-amber-300'
                    : 'text-[#b6f04a]'
                  }`}
              >
                {Math.round(monthlyPercentage)}% used
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================================================
          CATEGORY BUDGETS
      ========================================================== */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Category Budgets
            </h2>
            <p className="text-sm text-white/50">{monthYear}</p>
          </div>

          {!isAdding && (
            <Button
              size="sm"
              onClick={() => {
                setCategoryError('')
                setIsAdding(true)
              }}
              className="
                cursor-pointer
                rounded-full
                border border-white/[0.14]
                bg-white/[0.08]
                text-white/80
                backdrop-blur-xl
                transition-[background-color,border-color,color]
                duration-300
                hover:border-white/[0.20]
                hover:bg-white/[0.14]
                hover:text-white
              "
            >
              <Plus className="mr-2 h-4 w-4" />
              Add category
            </Button>
          )}
        </div>

        <div>
          {budgets.length === 0 ? (
            <div
              className="
                rounded-xl
                border border-white/[0.10]
                bg-white/[0.05]
                p-8
                text-center
                text-white/60
                shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
              "
            >
              No category budgets set yet.
            </div>
          ) : (
            <div className="space-y-4">

              {budgets.map((budget) => {
                const progress = getBudgetProgress(budget);
                const isOverBudget = progress.spent > progress.limit;
                const isApproaching =
                  progress.percentage >= 80 && !isOverBudget;

                return (
                  <div
                    key={budget.id}
                    className="
        group relative isolate overflow-hidden
        rounded-[20px] p-4 md:p-5

        border border-white/[0.14]
        bg-white/[0.075]
        backdrop-blur-xl

        shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)]

        transition-all duration-700
        ease-[cubic-bezier(0.16,1,0.3,1)]

        hover:-translate-y-1
        hover:border-white/[0.24]
        hover:bg-white/[0.12]
        hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_20px_55px_-18px_rgba(0,0,0,0.65)]
      "
                  >
                    {/* Glass surface gradient */}
                    <div
                      aria-hidden="true"
                      className="
          pointer-events-none absolute inset-0
          bg-gradient-to-br
          from-white/[0.10]
          via-transparent
          to-white/[0.015]
          opacity-70
        "
                    />

                    {/* Top edge reflection */}
                    <div
                      aria-hidden="true"
                      className="
          pointer-events-none absolute inset-x-4 top-0
          h-px bg-gradient-to-r
          from-transparent via-white/40 to-transparent
          opacity-70
        "
                    />

                    {/* Soft corner glow */}
                    <div
                      aria-hidden="true"
                      className="
          pointer-events-none absolute -right-12 -top-12
          h-28 w-28 rounded-full
          bg-white/[0.06] blur-2xl
        "
                    />

                    {/* Foreground content */}
                    <div className="relative z-10 flex items-center gap-4">
                      {/* Category icon */}
                      <div
                        className="
            flex h-16 w-16 shrink-0 items-center
            justify-center rounded-xl

            border border-white/[0.10]
            bg-white/[0.06]
            text-white/70

            shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
            transition-colors duration-500
            group-hover:bg-white/[0.10]
          "
                      >
                        <span className="text-2xl">
                          {budget.category.charAt(0)}
                        </span>
                      </div>

                      {/* Budget details */}
                      <div className="min-w-0 flex-1">
                        {/* Category and percentage */}
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="truncate font-semibold text-white">
                            {budget.category}
                          </h3>

                          <span
                            className={
                              isOverBudget
                                ? "shrink-0 font-semibold text-red-400"
                                : isApproaching
                                  ? "shrink-0 font-semibold text-amber-300"
                                  : "shrink-0 font-semibold text-white/80"
                            }
                          >
                            {Math.round(progress.percentage)}%
                          </span>
                        </div>

                        {/* Spent amount and delete button */}
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <p className="text-sm text-white/50">
                            {money(progress.spent)} / {money(progress.limit)}
                          </p>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="
                h-7 w-7 shrink-0 p-0
                text-white/40
                transition-colors
                hover:bg-red-500/10
                hover:text-red-400
              "
                            onClick={() =>
                              handleDeleteBudget(
                                budget.id,
                                budget.category
                              )
                            }
                            aria-label={`Delete ${budget.category} budget`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Progress bar */}
                        <Progress
                          value={progress.percentage}
                          className={`
              mt-3 h-2 overflow-hidden
              bg-white/[0.10]

              ${isOverBudget ? "[&>div]:!bg-red-400" : ""}
              ${isApproaching ? "[&>div]:!bg-amber-300" : ""}
            `}
                        />

                        {/* Over-budget warning */}
                        {isOverBudget && (
                          <p
                            className="
                mt-2 flex items-center gap-2
                text-xs font-medium text-red-400
              "
                            role="alert"
                          >
                            <CircleAlert
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            Over by {money(progress.spent - progress.limit)}
                          </p>
                        )}

                        {/* Approaching-limit warning */}
                        {isApproaching && (
                          <p
                            className="
                mt-2 flex items-center gap-2
                text-xs font-medium text-amber-300
              "
                            role="status"
                          >
                            <AlertTriangle
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            Approaching this category limit
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          EDIT MONTHLY BUDGET — glass modal
      ========================================================== */}
      {editingMonthly && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={closeMonthlyModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="monthly-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="
              relative w-full max-w-md
              overflow-hidden
              rounded-2xl
              border border-white/[0.14]
              bg-[#0f1115]/[0.72]
              p-6
              text-white
              backdrop-blur-2xl
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-30px_rgba(0,0,0,0.9)]
            "
          >
            {/* Top specular */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute inset-x-6 top-0
                h-px
                bg-gradient-to-r from-transparent via-white/40 to-transparent
              "
            />

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  id="monthly-modal-title"
                  className="text-base font-semibold text-white md:text-lg"
                >
                  Edit Monthly Budget
                </h2>
                <p className="text-xs text-white/50 md:text-sm">
                  Set your budget limit for {monthYear}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeMonthlyModal}
                disabled={isLoading}
                aria-label="Close"
                className="
                  rounded-full
                  bg-white/[0.08]
                  text-white/70
                  transition-colors
                  hover:bg-red-500/[0.20]
                  hover:text-red-200
                "
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={saveMonthlyBudget} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="monthly-amount"
                  className="text-xs font-medium text-white md:text-sm"
                >
                  Monthly budget limit
                </Label>

                <Input
                  id="monthly-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={monthlyAmount}
                  onChange={(event) => setMonthlyAmount(event.target.value)}
                  disabled={isLoading}
                  placeholder="10000"
                  autoFocus
                  className="
                    h-11
                    border-white/[0.14]
                    bg-white/[0.06]
                    text-white
                    placeholder:text-white/40
                  "
                />
              </div>

              {monthlyError && (
                <p
                  className="
                    rounded-lg
                    border border-red-400/30
                    bg-red-500/[0.14]
                    px-3 py-2
                    text-sm text-red-200
                  "
                  role="alert"
                >
                  {monthlyError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="
                    h-11 w-full
                    rounded-xl
                    border border-[#9ee82d]/25
                    bg-[#9ee82d]
                    font-semibold
                    text-[#11131c]
                    shadow-[0_8px_24px_-12px_rgba(158,232,45,0.65),inset_0_1px_0_rgba(255,255,255,0.45)]
                    transition-all
                    duration-300
                    hover:bg-[#b0f34b]
                    hover:shadow-[0_10px_30px_-12px_rgba(158,232,45,0.75)]
                    disabled:opacity-50
                    sm:w-auto
                  "
                >
                  {isLoading ? 'Saving...' : 'Save Budget'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          ADD CATEGORY BUDGET — glass modal
      ========================================================== */}
      {isAdding && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={closeAddModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-category-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="
              relative w-full max-w-md
              overflow-hidden
              rounded-2xl
              border border-white/[0.14]
              bg-[#0f1115]/[0.72]
              p-6
              text-white
              backdrop-blur-2xl
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-30px_rgba(0,0,0,0.9)]
            "
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute inset-x-6 top-0
                h-px
                bg-gradient-to-r from-transparent via-white/40 to-transparent
              "
            />

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  id="add-category-modal-title"
                  className="text-lg font-semibold text-white"
                >
                  Add Category Budget
                </h2>
                <p className="text-sm text-white/50">
                  Set a budget for a spending category
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeAddModal}
                disabled={isLoading}
                aria-label="Close"
                className="
                  rounded-full
                  bg-white/[0.08]
                  text-white/70
                  transition-colors
                  hover:bg-red-500/[0.20]
                  hover:text-red-200
                "
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleAddBudget} className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white/80">
                  Category
                </Label>

                <Select
                  value={newCategory}
                  onValueChange={(value) => setNewCategory(value || '')}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="category"
                    className="
                      h-11
                      border-white/[0.14]
                      bg-white/[0.06]
                      text-white
                    "
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>

                  <SelectContent>
                    {CATEGORIES.filter(
                      (category) =>
                        !budgets.some(
                          (budget) => budget.category === category
                        )
                    ).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white/80">
                  Budget Amount
                </Label>

                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="1000"
                  value={newAmount}
                  onChange={(event) => setNewAmount(event.target.value)}
                  disabled={isLoading}
                  className="
                    h-11
                    border-white/[0.14]
                    bg-white/[0.06]
                    text-white
                    placeholder:text-white/40
                  "
                />
              </div>

              {categoryError && (
                <p
                  className="
                    rounded-lg
                    border border-red-400/30
                    bg-red-500/[0.14]
                    px-3 py-2
                    text-sm text-red-200
                  "
                  role="alert"
                >
                  {categoryError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !newCategory || !newAmount}
                  className="
                    cursor-pointer
                    rounded-xl
                    bg-primary
                    px-5 py-2.5
                    font-semibold
                    text-primary-foreground
                    transition-colors
                    hover:bg-primary/90
                    disabled:opacity-50
                  "
                >
                  {isLoading ? 'Adding...' : 'Add Budget'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}