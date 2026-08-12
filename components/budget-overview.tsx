'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface BudgetOverviewProps {
  budgets: any[]
  expenses: any[]
}

export function BudgetOverview({ budgets, expenses }: BudgetOverviewProps) {
  const getBudgetProgress = (budget: any) => {
    const categoryExpenses = expenses
      .filter((e) => e.category === budget.category)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)

    return {
      spent: categoryExpenses,
      limit: parseFloat(budget.budget_amount || 0),
      percentage: Math.min(100, (categoryExpenses / parseFloat(budget.budget_amount || 1)) * 100),
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Status</CardTitle>
      </CardHeader>
      <CardContent>
        {budgets.length === 0 ? (
          <div className="text-muted-foreground text-sm">No budgets set for this month</div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const progress = getBudgetProgress(budget)
              const isOverBudget = progress.percentage > 100

              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{budget.category}</span>
                    <span className={isOverBudget ? 'text-red-500' : 'text-muted-foreground'}>
                      ${progress.spent.toFixed(2)} / ${progress.limit.toFixed(2)}
                    </span>
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
  )
}
