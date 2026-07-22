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
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0]
  const monthYear = now.toISOString().substring(0, 7) // YYYY-MM

  // Run all queries in parallel
  const [profileResult, expensesResult, budgetsResult, goalsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .order('date', { ascending: false }),
    supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_year', monthYear),
    supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline', { ascending: true }),
  ])

  const { data: profile } = profileResult
  const { data: expenses } = expensesResult
  const { data: budgets } = budgetsResult
  const { data: goals } = goalsResult

  return (
    <DashboardOverview
      profile={profile}
      expenses={expenses || []}
      budgets={budgets || []}
      goals={goals || []}
    />
  )
}
