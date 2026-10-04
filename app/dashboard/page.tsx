import { createClient } from '@/lib/supabase/server'
import { DashboardOverview } from '@/components/dashboard-overview'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Calculate date ranges
  const now = new Date()

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  )
    .toISOString()
    .split('T')[0]

  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  )
    .toISOString()
    .split('T')[0]

  const monthYear = now
    .toISOString()
    .substring(0, 7)

  // Run all queries in parallel
  const [
    profileResult,
    expensesResult,
    monthlyBudgetsResult,
    goalsResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),

    supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .order('date', {
        ascending: false,
      }),

    supabase
      .from('monthly_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_year', monthYear),

    supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline', {
        ascending: true,
      }),
  ])

  const { data: profile } = profileResult
  const { data: expenses } = expensesResult
  const { data: monthlyBudgets } =
    monthlyBudgetsResult
  const { data: goals } = goalsResult

  /*
   * Add the avatar from Supabase Auth metadata
   * to the profile object used by the dashboard.
   */
  const dashboardProfile = {
    ...profile,
    avatar_url:
      user.user_metadata?.avatar_url || null,
  }

  return (
    <DashboardOverview
      profile={dashboardProfile}
      expenses={expenses || []}
      budgets={monthlyBudgets || []}
      goals={goals || []}
    />
  )
}