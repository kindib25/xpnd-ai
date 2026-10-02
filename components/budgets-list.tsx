'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Trash2, Plus, Pencil, X, AlertTriangle, CircleAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const CATEGORIES = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Travel', 'Personal Care', 'Other']

interface BudgetsListProps {
  budgets: any[]
  monthlyBudget: any | null
  expenses: any[]
  monthYear: string
}

const money = (value: number) => `₱${value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`

export function BudgetsList({ budgets, monthlyBudget, expenses, monthYear }: BudgetsListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingMonthly, setEditingMonthly] = useState(false)
  const [monthlyAmount, setMonthlyAmount] = useState(monthlyBudget?.limit_amount?.toString() || '')
  const [newCategory, setNewCategory] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const allocated = useMemo(() => budgets.reduce((sum, budget) => sum + Number(budget.budget_amount || 0), 0), [budgets])
  const monthlyLimit = Number(monthlyBudget?.limit_amount || 0)
  const monthExpenses = useMemo(
    () => expenses.filter((expense) => new Date(expense.date).toISOString().substring(0, 7) === monthYear),
    [expenses, monthYear],
  )
  const totalSpent = useMemo(
    () => monthExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [monthExpenses],
  )
  const remaining = monthlyLimit - totalSpent
  const monthlyPercentage = monthlyLimit > 0 ? Math.min(100, (totalSpent / monthlyLimit) * 100) : 0

  const isMonthlyOverBudget = monthlyLimit > 0 && totalSpent > monthlyLimit
  const isMonthlyApproaching = monthlyLimit > 0 && monthlyPercentage >= 80 && !isMonthlyOverBudget

  const getBudgetProgress = (budget: any) => {
    const spent = expenses
      .filter((expense) => expense.category === budget.category && new Date(expense.date).toISOString().substring(0, 7) === monthYear)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    const limit = Number(budget.budget_amount || 0)
    return { spent, limit, percentage: limit > 0 ? Math.min(100, (spent / limit) * 100) : 0 }
  }

  const saveMonthlyBudget = async (event: React.FormEvent) => {
    event.preventDefault()
    const amount = Number(monthlyAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(`Monthly budget must be at least ${money(allocated)}.`)
      return
    }
    if (amount < allocated) return setError(`Monthly budget must be at least ${money(allocated)}.`)
    setIsLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error: saveError } = await supabase.from('monthly_budgets').upsert({ user_id: user.id, month_year: monthYear, limit_amount: amount }, { onConflict: 'user_id,month_year' })
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

  const handleAddBudget = async (event: React.FormEvent) => {
    event.preventDefault()
    const amount = Number(newAmount)
    if (!newCategory || !Number.isFinite(amount) || amount <= 0) {
      toast.error('Choose a category and enter a valid amount.')
      return
    }
    if (!monthlyLimit) {
      toast.error('Set a monthly budget before adding categories.')
      return
    }
    if (allocated + amount > monthlyLimit) {
      toast.error(`Category budgets cannot exceed ${money(monthlyLimit)}.`)
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error: insertError } = await supabase.from('budgets').insert({ user_id: user.id, category: newCategory, budget_amount: amount, month_year: monthYear })
      if (insertError) throw insertError
      setNewCategory('')
      setNewAmount('')
      setIsAdding(false)
      toast.success('Category budget added successfully.')
      router.refresh()
    } catch (insertError) {
      console.error('[v0] Error adding category budget:', insertError)
      toast.error('Could not add category budget. Check that the category is not already listed.')
    } finally {
      setIsLoading(false)
    }
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
        onClick: () => {},
      },
    })
  }

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

  return (
    <div className="space-y-6">

      {/* This Month Overview - Featured Card */}
      <Card className="mb-6 md:mb-8 border-primary/10 bg-gradient-to-br from-[#bffa29] to-[#7ce72e] text-black">
        <CardHeader className="flex flex-row items-center justify-between pb-3 md:pb-4">
          <div>
            <CardTitle className="text-xs md:text-sm font-bold text-black">
              This Month Overview
            </CardTitle>
            <p className="text-xs md:text-sm text-black/80 mt-1">{monthYear}</p>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingMonthly((value) => !value)}
            aria-label="Edit monthly budget"
            className="text-black/70 bg-white py-0 px-5 md:px-10 cursor-pointer"
          >
            Edit
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 md:space-y-6">
          {editingMonthly && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl">

                {/* Modal Header */}
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-white">
                      Edit Monthly Budget
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Set your budget limit for {monthYear}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingMonthly(false)
                      setError('')
                    }}
                    disabled={isLoading}
                    className="rounded-full bg-white/20 hover:bg-red-400 transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </Button>
                </div>

                {/* Form */}
                <form onSubmit={saveMonthlyBudget} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly-amount" className="text-xs md:text-sm font-medium text-white">
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
                      className="h-11 text-white placeholder:text-white/50"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <p
                      className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}

                  {/* Buttons */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="p-5 cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      {isLoading ? 'Saving...' : 'Save Budget'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Spending Summary */}
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div>
              <p className="text-xs text-black/70 font-medium mb-1 md:mb-2">
                Total Spent
              </p>

              <p className="text-2xl md:text-3xl font-bold">
                {money(totalSpent)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-black/70 font-medium mb-1 md:mb-2">
                Budget
              </p>

              <p className="text-2xl md:text-3xl font-bold">
                {money(monthlyLimit)}
              </p>
            </div>
          </div>

          {/* Monthly Budget Alerts */}
          {isMonthlyOverBudget && (
            <div
              className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <CircleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                <span className="font-semibold">Budget exceeded.</span>{' '}
                You are {money(totalSpent - monthlyLimit)} over your monthly limit.
              </p>
            </div>
          )}

          {isMonthlyApproaching && (
            <div
              className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300"
              role="status"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                <span className="font-semibold">Approaching your limit.</span>{' '}
                You have used {Math.round(monthlyPercentage)}% of your monthly budget.
              </p>
            </div>
          )}

          {/* Budget Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <p className="text-black/70">Budget Usage</p>
            </div>

            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-white h-full transition-all"
                style={{
                  width: `${Math.min(monthlyPercentage, 100)}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs md:text-sm text-black/70">
                {money(Math.max(remaining, 0))} left
              </p>

              <p className="text-xs md:text-sm font-medium text-black">
                {Math.round(monthlyPercentage)}% used
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-sm text-white bg-red-500/20 rounded-lg px-3 py-2"
              role="alert"
            >
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Category Budgets</h2>
            <p className="text-sm text-muted-foreground">{monthYear}</p>
          </div>
          {!isAdding && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setError('')
                setIsAdding(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add category
            </Button>
          )}
        </div>
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-0">
            {isAdding && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl">

                  {/* Modal Header */}
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Add Category Budget
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Set a budget for a spending category
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsAdding(false)
                        setError('')
                      }}
                      disabled={isLoading}
                      className="rounded-full bg-white/20 hover:bg-red-400 transition-colors"
                    >
                      <X className="h-5 w-5 text-white" />
                    </Button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleAddBudget} className="space-y-4">

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Category
                      </Label>

                      <Select
                        value={newCategory}
                        onValueChange={(value) => setNewCategory(value || '')}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="category" className="h-11">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>

                        <SelectContent>
                          {CATEGORIES
                            .filter(
                              (category) =>
                                !budgets.some(
                                  (budget) => budget.category === category
                                )
                            )
                            .map((category) => (
                              <SelectItem
                                key={category}
                                value={category}
                              >
                                {category}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        Budget Amount
                      </Label>

                      <Input
                        id="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="1000"
                        value={newAmount}
                        onChange={(event) =>
                          setNewAmount(event.target.value)
                        }
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <p
                        className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600"
                        role="alert"
                      >
                        {error}
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          !newCategory ||
                          !newAmount
                        }
                        className="p-5 cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        {isLoading ? 'Adding...' : 'Add Budget'}
                      </Button>
                    </div>

                  </form>
                </div>
              </div>
            )}
            {budgets.length === 0 ?
              <div className="rounded-xl bg-card p-8 text-center text-muted-foreground shadow-sm">
                No category budgets set yet.
              </div>
              : <div className="space-y-4">{budgets.map((budget) => {
                const progress = getBudgetProgress(budget);
                const isOverBudget = progress.spent > progress.limit;
                const isApproaching = progress.percentage >= 80 && !isOverBudget;

                return <div key={budget.id} className="rounded-xl bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <span className="text-2xl">{budget.category.charAt(0)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="truncate font-semibold">{budget.category}</h3>
                        <span
                          className={
                            isOverBudget
                              ? 'text-destructive font-semibold'
                              : isApproaching
                                ? 'text-amber-600 dark:text-amber-300 font-semibold'
                                : 'font-semibold'
                          }
                        >
                          {Math.round(progress.percentage)}%</span></div><div className="mt-1 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{money(progress.spent)} / {money(progress.limit)}</p><Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDeleteBudget(budget.id, budget.category)} aria-label={`Delete ${budget.category} budget`}><Trash2 className="w-4 h-4" /></Button></div><Progress value={progress.percentage} className={`mt-3 h-0 md:h-2 ${isOverBudget ? 'bg-red-100' : ''}`} />
                      {isOverBudget && (
                        <p
                          className="mt-2 flex items-center gap-2 text-xs font-medium text-destructive"
                          role="alert"
                        >
                          <CircleAlert
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          Over by {money(progress.spent - progress.limit)}
                        </p>
                      )}

                      {isApproaching && (
                        <p
                          className="mt-2 flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-300"
                          role="status"
                        >
                          <AlertTriangle
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          Approaching this category limit
                        </p>
                      )}
                    </div></div></div>
              })}</div>}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
