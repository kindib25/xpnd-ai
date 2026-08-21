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
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 md:mb-8 mt-5 md:mt-10">
          <h1 className="text-xl font-bold md:text-3xl">
            Transactions
          </h1>

          <p className="mt-1 text-xs text-muted-foreground md:text-sm">
            Review and manage your expenses
          </p>
        </header>

        <section className="w-full">
          <TransactionsList expenses={expenses ?? []} />
        </section>
      </div>
    </main>
  )
}