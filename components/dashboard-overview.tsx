'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, Target, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { ExpenseChart } from './expense-chart'
import { BudgetOverview } from './budget-overview'

interface DashboardOverviewProps {
  profile: any
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
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)
  const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.limit_amount || 0), 0)
  const totalGoalsAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.current_amount || 0), 0)
  const totalGoalsTarget = goals.reduce((sum, goal) => sum + parseFloat(goal.target_amount || 0), 0)

  return (
    <div className="w-full p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header - Mobile optimized */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4 md:hidden">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">👤</div>
          <Link href="/dashboard/settings" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
            ⚙️
          </Link>
        </div>
        <h1 className="text-xl md:text-3xl font-bold">Good day, User!</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">Track smarter with AI-powered insights.</p>
      </div>

      {/* This Month Overview - Featured Card */}
      <Card className="mb-6 md:mb-8 border-primary/10 bg-gradient-to-br from-background to-muted/50">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">This Month Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1 md:mb-2">Total Spent</p>
              <p className="text-2xl md:text-3xl font-bold">₱{totalExpenses.toFixed(0)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium mb-1 md:mb-2">Budget</p>
              <p className="text-2xl md:text-3xl font-bold">₱{totalBudget.toFixed(0)}</p>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <p className="text-muted-foreground">Budget Usage</p>
              <p className="font-medium">{totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0}% used</p>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all"
                style={{
                  width: `${totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">₱{Math.max(totalBudget - totalExpenses, 0).toFixed(0)} left</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Cards - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6 md:mb-8">
        {[
          { label: 'Today', value: '₱320' },
          { label: 'This Week', value: '₱1,250' },
          { label: 'Pending', value: '2' },
          { label: 'Top Category', value: '₱1,2od' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insight Card */}
      <Card className="mb-6 md:mb-8 bg-muted/40 border-muted">
        <CardContent className="pt-4 md:pt-6">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 bg-accent/10 rounded-lg flex-shrink-0">
              <span className="text-lg md:text-xl">✨</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm md:text-base mb-1">AI Insight</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                You spent 25% more on Food compared to last month.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary text-xs md:text-sm flex-shrink-0">
              View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Expense Button */}
      <div className="mb-6 md:mb-8">
        <Link href="/dashboard/add-expense" className="block">
          <Card className="border-2 border-dashed border-primary/30 hover:border-primary transition-all cursor-pointer bg-muted/30 hover:bg-muted/50">
            <CardContent className="py-6 md:py-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Plus className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <p className="font-semibold text-sm md:text-base">Add Expense</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Type naturally, let AI handle the rest</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts and Details - Only on desktop */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ExpenseChart expenses={expenses} />
        </div>
        <div>
          <BudgetOverview budgets={budgets} expenses={expenses} />
        </div>
      </div>
    </div>
  )
}

export const DashboardOverview = memo(DashboardOverviewComponent)
