import { createClient } from '@/lib/supabase/server'
import { BudgetsList } from '@/components/budgets-list'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const monthYear = new Date().toISOString().substring(0, 7)
  const [budgetsResult, monthlyBudgetResult, expensesResult] = await Promise.all([
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
    <div className="w-full p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Budget</h1>
        <p className="text-muted-foreground mt-1">Stay on track with your budget.</p>
        
      </div>

      <BudgetsList
        budgets={budgetsResult.data || []}
        monthlyBudget={monthlyBudgetResult.data}
        expenses={expensesResult.data || []}
        monthYear={monthYear}
      />
    </div>
  )
}
