import { createClient } from '@/lib/supabase/server'
import { GoalsList } from '@/components/goals-list'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, ChevronDown, PiggyBank, Target } from 'lucide-react'
import Link from 'next/link'

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
      .select('month_year, limit_amount')
      .eq('user_id', user.id)
      .lt('month_year', currentMonth),

    supabase
      .from('expenses')
      .select('date, amount')
      .eq('user_id', user.id)
      .lt('date', `${currentMonth}-01`),
  ])

  const spentByMonth = (expenses || []).reduce<Record<string, number>>(
    (totals, expense) => {
      const month = String(expense.date).substring(0, 7)

      totals[month] =
        (totals[month] || 0) + Number(expense.amount || 0)

      return totals
    },
    {}
  )

  const previousBudgetRemainder = (monthlyBudgets || []).reduce(
    (total, budget) => {
      const remainder =
        Number(budget.limit_amount || 0) -
        (spentByMonth[budget.month_year] || 0)

      return total + Math.max(0, remainder)
    },
    0
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 p-4 md:p-8">
      <div className="w-full">
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
                outline-none
                transition-all
                duration-200
                md:hover:bg-white/[0.04]
                focus-visible:ring-2
                focus-visible:ring-primary/30
                md:text-4xl
              "
            >
              <span>Savings Goals</span>

              <ChevronDown
                className="
                  mt-1
                  h-5
                  w-5
                  text-muted-foreground
                  transition-transform
                  duration-200
                  group-data-[state=open]:rotate-180
                  group-data-[state=open]:text-foreground
                  md:h-6
                  md:w-6
                "
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              sideOffset={12}
              className="
                w-[calc(100vw-32px)]
                max-w-[320px]
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.06]
                bg-[#0E141C]/95
                p-1.5
                shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)]
                ring-1
                ring-black/40
                backdrop-blur-xl
              "
            >
              {/* Menu Header */}
              <div className="px-3 pb-1.5 pt-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                  Manage finances
                </p>
              </div>

              {/* Budget */}
              <DropdownMenuItem
                className="
                  cursor-pointer
                  rounded-xl
                  p-0
                  outline-none
                  transition-colors
                  duration-200
                  md:hover:bg-white/[0.05]
                  md:focus:bg-white/[0.05]
                  md:data-[highlighted]:bg-white/[0.05]
                "
              >
                <Link
                  href="/dashboard/budgets"
                  className="
                    group/item
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    outline-none
                  "
                >
                  {/* Icon */}
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-white/[0.05]
                      text-white/60
                      transition-colors
                      duration-200
                      md:group-hover/item:text-primary
                    "
                  >
                    <PiggyBank className="h-[18px] w-[18px]" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white/90">
                      Budget
                    </p>

                    <p className="mt-0.5 truncate text-xs text-white/40">
                      Manage your spending
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronDown
                    className="
                      h-4
                      w-4
                      shrink-0
                      -rotate-90
                      text-white/25
                      transition-all
                      duration-200
                      md:group-hover/item:translate-x-0.5
                      md:group-hover/item:text-white/50
                    "
                  />
                </Link>
              </DropdownMenuItem>

              {/* Divider */}
              <div className="mx-3 my-1.5 h-px bg-white/[0.05]" />

              {/* Savings Goals — Active */}
              <DropdownMenuItem
                className="
                  cursor-pointer
                  rounded-xl
                  bg-emerald-500/[0.08]
                  p-0
                  outline-none
                  transition-colors
                  duration-200
                  md:hover:bg-emerald-500/[0.14]
                  md:focus:bg-emerald-500/[0.14]
                  md:data-[highlighted]:bg-emerald-500/[0.14]
                "
              >
                <Link
                  href="/dashboard/goals"
                  className="
                    group/item
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    outline-none
                  "
                >
                  {/* Icon */}
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-emerald-500/15
                      text-emerald-400
                    "
                  >
                    <Target className="h-[18px] w-[18px]" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      Savings Goals
                    </p>

                    <p className="mt-0.5 truncate text-xs text-white/40">
                      Track your savings
                    </p>
                  </div>

                  {/* Active Indicator */}
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <p className="mt-1 text-sm text-muted-foreground md:text-base">
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