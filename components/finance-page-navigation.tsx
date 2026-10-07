"use client"

import {
  Check,
  ChevronDown,
  PiggyBank,
  Target,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function FinancePageNavigation() {
  const pathname = usePathname()

  const isBudgetPage = pathname === "/dashboard/budgets"
  const isGoalsPage = pathname === "/dashboard/goals"

  const currentTitle = isGoalsPage ? "Savings Goals" : "Budget"

  return (
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
        <span>{currentTitle}</span>

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
        {/* Header */}
        <div className="px-3 pb-1.5 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
            Manage finances
          </p>
        </div>

        {/* Budget */}
        <DropdownMenuItem
          className={`
            cursor-pointer
            rounded-xl
            p-0
            outline-none
            transition-colors
            duration-200
            ${
              isBudgetPage
                ? "bg-primary/[0.08] md:hover:bg-primary/[0.14] md:focus:bg-primary/[0.14]"
                : "md:hover:bg-white/[0.05] md:focus:bg-white/[0.05]"
            }
          `}
        >
          <Link
            href="/dashboard/budgets"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 outline-none"
          >
            <div
              className={`
                flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                ${
                  isBudgetPage
                    ? "bg-primary/15 text-primary"
                    : "bg-white/[0.05] text-white/60"
                }
              `}
            >
              <PiggyBank className="h-[18px] w-[18px]" />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  isBudgetPage ? "text-white" : "text-white/90"
                }`}
              >
                Budget
              </p>

              <p className="mt-0.5 truncate text-xs text-white/40">
                Manage your spending
              </p>
            </div>

            {isBudgetPage && (
              <Check className="h-4 w-4 shrink-0 text-primary" />
            )}

            {!isBudgetPage && (
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
                "
              />
            )}
          </Link>
        </DropdownMenuItem>

        {/* Divider */}
        <div className="mx-3 my-1.5 h-px bg-white/[0.05]" />

        {/* Savings Goals */}
        <DropdownMenuItem
          className={`
            cursor-pointer
            rounded-xl
            p-0
            outline-none
            transition-colors
            duration-200
            ${
              isGoalsPage
                ? "bg-primary/[0.08] md:hover:bg-primary/[0.14] md:focus:bg-primary/[0.14]"
                : "md:hover:bg-white/[0.05] md:focus:bg-white/[0.05]"
            }
          `}
        >
          <Link
            href="/dashboard/goals"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 outline-none"
          >
            <div
              className={`
                flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                ${
                  isGoalsPage
                    ? "bg-primary/15 text-primary"
                    : "bg-white/[0.05] text-white/60"
                }
              `}
            >
              <Target className="h-[18px] w-[18px]" />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  isGoalsPage ? "text-white" : "text-white/90"
                }`}
              >
                Savings Goals
              </p>

              <p className="mt-0.5 truncate text-xs text-white/40">
                Track your savings
              </p>
            </div>

            {isGoalsPage && (
              <Check className="h-4 w-4 shrink-0 text-primary" />
            )}

            {!isGoalsPage && (
              <ChevronDown
                className="
                  h-4
                  w-4
                  shrink-0
                  -rotate-90
                  text-white/25
                  transition-all
                  duration-200
                "
              />
            )}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}