import { createClient } from '@/lib/supabase/server'
import { BudgetsList } from '@/components/budgets-list'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

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
        {/* Page Navigation Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="
              group
              -ml-2
              inline-flex
              items-center
              gap-2
              rounded-xl
              px-2
              py-1
              text-3xl
              font-bold
              tracking-tight
              text-foreground
              transition-all
              duration-200
              hover:bg-muted/60
              focus:outline-none
              focus:ring-2
              focus:ring-primary/20
              md:text-4xl
            "
          >
            <span>Budget</span>

            <ChevronDown
              className="
                mt-1
                h-5
                w-5
                text-muted-foreground
                transition-transform
                duration-200
                group-data-[state=open]:rotate-180
                md:h-6
                md:w-6
              "
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            sideOffset={10}
            className="
              w-[calc(100vw-32px)]
              max-w-64
              rounded-2xl
              border-border/60
              bg-background/95
              p-2
              shadow-xl
              backdrop-blur-xl
            "
          >
            {/* Budget */}
            <DropdownMenuItem
              className="
                cursor-pointer
                rounded-xl
                p-2
                focus:bg-muted
              "
            >
              <Link
                href="/dashboard/budgets"
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-2
                  py-2
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary/10
                    text-sm
                    font-bold
                    text-primary
                  "
                >
                  $
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Budget
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Manage your spending
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>

            {/* Savings Goals */}
            <DropdownMenuItem
              className="
                cursor-pointer
                rounded-xl
                p-2
                focus:bg-muted
              "
            >
              <Link
                href="/dashboard/goals"
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-2
                  py-2
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-500/10
                    text-sm
                    font-bold
                    text-emerald-500
                  "
                >
                  ₱
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Savings Goals
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Track your savings
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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