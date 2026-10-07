import { createClient } from '@/lib/supabase/server'
import { BudgetsList } from '@/components/budgets-list'
import { FinancePageNavigation } from '@/components/finance-page-navigation'

export default async function BudgetsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const monthYear = new Date().toISOString().substring(0, 7)

  const [budgetsResult, monthlyBudgetResult, expensesResult] =
    await Promise.all([
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', monthYear)
        .order('category', { ascending: true }),

      supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', monthYear)
        .maybeSingle(),

      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
    ])

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-8">
        {/* Page Navigation */}
        <FinancePageNavigation />

        {/* Page Description */}
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Stay on track with your budget.
        </p>
      </div>

      {/* Budget Content */}
      <BudgetsList
        budgets={budgetsResult.data || []}
        monthlyBudget={monthlyBudgetResult.data}
        expenses={expensesResult.data || []}
        monthYear={monthYear}
      />
    </div>
  )
}