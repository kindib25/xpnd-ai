import { createClient } from '@/lib/supabase/server'
import { GoalsList } from '@/components/goals-list'

export default async function GoalsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('deadline', { ascending: true })

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Savings Goals</h1>
        <p className="text-muted-foreground mt-1">Track your savings and financial goals</p>
      </div>

      <GoalsList goals={goals || []} />
    </div>
  )
}
