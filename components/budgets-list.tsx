'use client'

import { useState } from 'react'
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
import { Trash2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
]

interface BudgetsListProps {
  budgets: any[]
  expenses: any[]
  monthYear: string
}

export function BudgetsList({ budgets, expenses, monthYear }: BudgetsListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const getBudgetProgress = (budget: any) => {
    const categoryExpenses = expenses
      .filter((e) => {
        const expenseMonth = new Date(e.date).toISOString().substring(0, 7)
        return e.category === budget.category && expenseMonth === monthYear
      })
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)

    return {
      spent: categoryExpenses,
      limit: parseFloat(budget.budget_amount || 0),
      percentage: Math.min(100, (categoryExpenses / parseFloat(budget.budget_amount || 1)) * 100),
    }
  }

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory || !newAmount) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('budgets').insert({
        user_id: user.id,
        category: newCategory,
        budget_amount: parseFloat(newAmount),
        month_year: monthYear,
      })

      if (error) throw error
      setNewCategory('')
      setNewAmount('')
      setIsAdding(false)
      router.refresh()
    } catch (error) {
      alert('Failed to add budget')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Delete this budget?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('budgets').delete().eq('id', id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      alert('Failed to delete budget')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Budgets - {monthYear}</CardTitle>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAddBudget} className="mb-6 p-4 bg-muted rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newCategory} onValueChange={setNewCategory} disabled={isLoading}>
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || !newCategory || !newAmount}>
                  Add
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {budgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No budgets set yet. Add one to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const progress = getBudgetProgress(budget)
                const isOverBudget = progress.percentage > 100

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{budget.category}</h3>
                        <p className="text-sm text-muted-foreground">
                          ₱{progress.spent.toFixed(2)} / ₱{progress.limit.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Progress
                      value={progress.percentage}
                      className={isOverBudget ? 'bg-red-100' : ''}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
