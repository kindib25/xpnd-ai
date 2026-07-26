'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface AnalyticsClientProps {
  expenses: any[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e']

const EXPENSE_CATEGORIES = [
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

export function AnalyticsClient({ expenses }: AnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories'>('overview')

  // Calculate category breakdown
  const categoryData = useMemo(() => {
    const totals: { [key: string]: number } = {}

    expenses.forEach((expense) => {
      const category = expense.category || 'Other'
      totals[category] = (totals[category] || 0) + parseFloat(expense.amount || 0)
    })

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
      }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  // Calculate total spending
  const totalSpending = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)
  }, [expenses])

  // Get top categories
  const topCategories = categoryData.slice(0, 5)

  // Calculate daily spending for trends
  const trendData = useMemo(() => {
    const daily: { [key: string]: number } = {}

    expenses.forEach((expense) => {
      const date = new Date(expense.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      daily[date] = (daily[date] || 0) + parseFloat(expense.amount || 0)
    })

    return Object.entries(daily)
      .map(([date, amount]) => ({
        date,
        amount: Math.round(amount * 100) / 100,
      }))
      .slice(-7)
  }, [expenses])

  return (
    <div className="w-full p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Understand your spending patterns.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 md:gap-3 mb-8">
        {(['overview', 'trends', 'categories'] as const).map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            variant={activeTab === tab ? 'default' : 'outline'}
            className="capitalize rounded-full"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Spending Overview</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">This Month</p>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No spending data available
                </div>
              ) : (
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => {
                          const numberValue = Number(value)
                          return `₱${numberValue.toFixed(2)}`
                        }}
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No spending data available</p>
              ) : (
                topCategories.map((category, index) => {
                  const percentage = Math.round((category.value / totalSpending) * 100)
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm md:text-base">{category.name}</p>
                            <p className="text-xs text-muted-foreground">₱{category.value.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="text-sm md:text-base font-semibold ml-2">{percentage}%</p>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Daily Spending Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            ) : (
              <div className="space-y-4">
                {trendData.map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <p className="text-sm font-medium w-20">{day.date}</p>
                    <div className="flex-1 mx-4 bg-muted rounded-full h-8 flex items-center px-3">
                      <div className="bg-primary rounded-full h-6 flex items-center justify-center px-2" style={{
                        width: `${Math.min((day.amount / Math.max(...trendData.map(d => d.amount))) * 100, 100)}%`
                      }}>
                        {day.amount > 100 && <span className="text-xs text-primary-foreground font-semibold">₱{day.amount.toFixed(0)}</span>}
                      </div>
                    </div>
                    <p className="text-sm font-semibold w-16 text-right">₱{day.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EXPENSE_CATEGORIES.map((category) => {
            const catData = categoryData.find((c) => c.name === category)
            const amount = catData?.value || 0
            const percentage = totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0

            return (
              <Card key={category}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="font-semibold text-base md:text-lg">{category}</p>
                      <p className="text-sm text-muted-foreground">₱{amount.toFixed(2)}</p>
                    </div>
                    <p className="text-lg md:text-2xl font-bold ml-4">{percentage}%</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
