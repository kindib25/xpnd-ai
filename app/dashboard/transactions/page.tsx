import { createClient } from '@/lib/supabase/server'
import { TransactionsList } from '@/components/transactions-list'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return (
    <div className="w-full p-10 md:p-15">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold">Transactions</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">Review and manage your expenses</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <TransactionsList expenses={expenses || []} />
      </div>
    </div>
  )
}
