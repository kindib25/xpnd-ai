'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Trash2, Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Travel', 'Personal Care']

interface BudgetsListProps {
  budgets: any[]
  monthlyBudget: any | null
  expenses: any[]
  monthYear: string
}

const money = (value: number) => `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

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
  const remaining = monthlyLimit - allocated

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
    if (!Number.isFinite(amount) || amount <= 0) return setError('Enter a monthly budget greater than zero.')
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
      router.refresh()
    } catch (saveError) {
      console.error('[v0] Error saving monthly budget:', saveError)
      setError('Could not save the monthly budget.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBudget = async (event: React.FormEvent) => {
    event.preventDefault()
    const amount = Number(newAmount)
    if (!newCategory || !Number.isFinite(amount) || amount <= 0) return setError('Choose a category and enter a valid amount.')
    if (!monthlyLimit) return setError('Set a monthly budget before adding categories.')
    if (allocated + amount > monthlyLimit) return setError(`Category budgets cannot exceed ${money(monthlyLimit)}.`)
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
      router.refresh()
    } catch (insertError) {
      console.error('[v0] Error adding category budget:', insertError)
      setError('Could not add category budget. Check that the category is not already listed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Delete this budget?')) return
    const supabase = createClient()
    const { error: deleteError } = await supabase.from('budgets').delete().eq('id', id)
    if (deleteError) {
      setError('Could not delete this budget.')
      return
    }
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Monthly Budget</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{monthYear} · {money(Math.max(remaining, 0))} unallocated</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditingMonthly((value) => !value)}>
            <Pencil className="w-4 h-4 mr-2" /> {monthlyBudget ? 'Edit' : 'Set budget'}
          </Button>
        </CardHeader>
        <CardContent>
          {editingMonthly && (
            <form onSubmit={saveMonthlyBudget} className="mb-5 p-4 bg-muted rounded-lg space-y-3">
              <Label htmlFor="monthly-amount">Monthly limit</Label>
              <div className="flex gap-2">
                <Input id="monthly-amount" type="number" min="0.01" step="0.01" value={monthlyAmount} onChange={(event) => setMonthlyAmount(event.target.value)} disabled={isLoading} placeholder="10000" />
                <Button type="submit" disabled={isLoading}>Save</Button>
              </div>
            </form>
          )}
          <div className="flex justify-between text-sm">
            <span>Allocated to categories</span>
            <span className={remaining < 0 ? 'text-destructive font-medium' : 'font-medium'}>{money(allocated)} / {money(monthlyLimit)}</span>
          </div>
          <Progress value={monthlyLimit > 0 ? Math.min(100, (allocated / monthlyLimit) * 100) : 0} className="mt-3" />
          {error && <p className="text-sm text-destructive mt-3" role="alert">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Category Budgets · {monthYear}</CardTitle>
          {!isAdding && <Button size="sm" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4 mr-2" />Add Budget</Button>}
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAddBudget} className="mb-6 p-4 bg-muted rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="category">Category</Label><Select value={newCategory} onValueChange={(value) => setNewCategory(value ?? '')} disabled={isLoading}><SelectTrigger id="category" className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{CATEGORIES.filter((category) => !budgets.some((budget) => budget.category === category)).map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></div>
                <div><Label htmlFor="amount">Amount</Label><Input id="amount" type="number" min="0.01" step="0.01" placeholder="100.00" value={newAmount} onChange={(event) => setNewAmount(event.target.value)} disabled={isLoading} className="mt-1" /></div>
              </div>
              <div className="flex gap-2"><Button type="submit" disabled={isLoading || !newCategory || !newAmount}>Add</Button><Button type="button" variant="outline" onClick={() => setIsAdding(false)} disabled={isLoading}>Cancel</Button></div>
            </form>
          )}
          {budgets.length === 0 ? <div className="text-center py-8 text-muted-foreground">No category budgets set yet.</div> : <div className="space-y-4">{budgets.map((budget) => { const progress = getBudgetProgress(budget); const isOverBudget = progress.spent > progress.limit; return <div key={budget.id} className="space-y-2"><div className="flex justify-between items-center"><div><h3 className="font-semibold">{budget.category}</h3><p className="text-sm text-muted-foreground">{money(progress.spent)} / {money(progress.limit)}</p></div><Button size="sm" variant="ghost" onClick={() => handleDeleteBudget(budget.id)} aria-label={`Delete ${budget.category} budget`}><Trash2 className="w-4 h-4" /></Button></div><Progress value={progress.percentage} className={isOverBudget ? 'bg-red-100' : ''} /></div> })}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
