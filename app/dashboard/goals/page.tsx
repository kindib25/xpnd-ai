import { createClient } from '@/lib/supabase/server'
import { GoalsList } from '@/components/goals-list'

export default async function GoalsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const currentMonth = new Date().toISOString().substring(0, 7)
  const [{ data: goals }, { data: profile }, { data: monthlyBudgets }, { data: expenses }] = await Promise.all([
    supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline', { ascending: true }),
    supabase
      .from('profiles')
      .select('total_saved_amount')
      .eq('id', user.id)
      .single(),
    supabase
      .from('monthly_budgets')
      .select('month_year, limit_amount')
      .eq('user_id', user.id)
      .lt('month_year', currentMonth),
    supabase
      .from('expenses')
      .select('date, amount')
      .eq('user_id', user.id)
      .lt('date', `${currentMonth}-01`),
  ])

  const spentByMonth = (expenses || []).reduce<Record<string, number>>((totals, expense) => {
    const month = String(expense.date).substring(0, 7)
    totals[month] = (totals[month] || 0) + Number(expense.amount || 0)
    return totals
  }, {})
  const previousBudgetRemainder = (monthlyBudgets || []).reduce((total, budget) => {
    const remainder = Number(budget.limit_amount || 0) - (spentByMonth[budget.month_year] || 0)
    return total + Math.max(0, remainder)
  }, 0)

  return (
    <div className="w-full p-4 md:p-8 max-w-7xl mx-auto flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Savings Goals</h1>
        <p className="text-muted-foreground mt-1">Track your savings and financial goals</p>
      </div>

      <GoalsList
        goals={goals || []}
        profile={profile}
        previousBudgetRemainder={previousBudgetRemainder}
      />
    </div>
  )
}
