import { createClient } from '@/lib/supabase/server'
import { BudgetsList } from '@/components/budgets-list'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const now = new Date()
  const monthYear = now.toISOString().substring(0, 7)

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month_year', monthYear)
    .order('category', { ascending: true })

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <p className="text-muted-foreground mt-1">Manage your monthly budgets</p>
      </div>

      <BudgetsList budgets={budgets || []} expenses={expenses || []} monthYear={monthYear} />
    </div>
  )
}
