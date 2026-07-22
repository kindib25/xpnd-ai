'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ExpenseChartProps {
  expenses: any[]
}

function ExpenseChartComponent({ expenses }: ExpenseChartProps) {
  // Group expenses by category
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      const category = expense.category || 'Other'
      const amount = parseFloat(expense.amount || 0)
      const existing = acc.find((e) => e.name === category)
      if (existing) {
        existing.value += amount
      } else {
        acc.push({ name: category, value: amount })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>
  )

  // Group by day
  const expensesByDay = expenses.reduce(
    (acc, expense) => {
      const date = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const amount = parseFloat(expense.amount || 0)
      const existing = acc.find((e) => e.date === date)
      if (existing) {
        existing.amount += amount
      } else {
        acc.push({ date, amount })
      }
      return acc
    },
    [] as Array<{ date: string; amount: number }>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No expenses recorded yet
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-4">By Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={expensesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                    formatter={(value) => `$${(value as number).toFixed(2)}`}
                  />
                  <Bar dataKey="value" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const ExpenseChart = memo(ExpenseChartComponent)
