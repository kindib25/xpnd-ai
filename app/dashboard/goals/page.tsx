import { createClient } from '@/lib/supabase/server'
import { GoalsList } from '@/components/goals-list'
import { FinancePageNavigation } from '@/components/finance-page-navigation'

export default async function GoalsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const currentMonth = new Date().toISOString().substring(0, 7)

  const [
    { data: goals },
    { data: profile },
    { data: monthlyBudgets },
    { data: expenses },
  ] = await Promise.all([
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
      .select(
        'id, month_year, limit_amount, savings_remainder_recorded'
      )
      .eq('user_id', user.id)
      .lt('month_year', currentMonth),

    supabase
      .from('expenses')
      .select('date, amount')
      .eq('user_id', user.id)
      .lt('date', `${currentMonth}-01`),
  ])

  /*
   * Calculate total expenses per month.
   */
  const spentByMonth = (expenses || []).reduce<
    Record<string, number>
  >((totals, expense) => {
    const month = String(expense.date).substring(0, 7)

    totals[month] =
      (totals[month] || 0) +
      Number(expense.amount || 0)

    return totals
  }, {})

  /*
   * IMPORTANT:
   * Only calculate remainder for monthly budgets
   * that have NOT been recorded yet.
   *
   * Once savings_remainder_recorded becomes TRUE,
   * that month's remainder will no longer be included.
   */
  const previousBudgetRemainder = (
    monthlyBudgets || []
  ).reduce((total, budget) => {
    // Already transferred to savings
    if (budget.savings_remainder_recorded) {
      return total
    }

    const remainder =
      Number(budget.limit_amount || 0) -
      (spentByMonth[budget.month_year] || 0)

    return total + Math.max(0, remainder)
  }, 0)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 p-4 md:p-8">
      <div className="w-full">
        {/* Page Header */}
        <div className="mb-8">
          <FinancePageNavigation />

          <p className="mt-2 ml-2 text-sm text-muted-foreground md:text-base">
            Track your savings and financial goals
          </p>
        </div>

        {/* Goals Content */}
        <GoalsList
          goals={goals || []}
          profile={profile}
          previousBudgetRemainder={previousBudgetRemainder}
        />
      </div>
    </div>
  )
}