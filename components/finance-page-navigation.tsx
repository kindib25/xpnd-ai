"use client"

import {
  Check,
  Menu,
  PiggyBank,
  Target,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function FinancePageNavigation() {
  const pathname = usePathname()

  const isBudgetPage = pathname.startsWith("/dashboard/budgets")
  const isGoalsPage = pathname.startsWith("/dashboard/goals")

  const currentTitle = isGoalsPage ? "Savings Goals" : "Budget"

  return (
    <Sheet>
      {/* Page Title Trigger */}
      <SheetTrigger
        className="
          group
          -ml-2
          inline-flex
          items-center
          gap-2
          rounded-2xl
          border
          border-border
          bg-card/50
          px-6
          py-4
          text-3xl
          font-bold
          tracking-tight
          text-foreground
          outline-none
          transition-all
          duration-200
          hover:bg-foreground/5
          focus-visible:ring-2
          focus-visible:ring-primary/30
          md:text-4xl
          cursor-pointer
          dark:border-white/30
          dark:bg-white/[0.03]
          dark:hover:border-white/[0.14]
          dark:hover:bg-white/[0.05]
        "
      >
        <span>{currentTitle}</span>

        <Menu
          className="
            h-5
            w-5
            ml-2
            text-muted-foreground
            transition-transform
            duration-200
            group-data-[state=open]:rotate-180
            group-data-[state=open]:text-foreground
            md:h-6
            md:w-6
            cursor-pointer
            dark:group-data-[state=open]:text-white
          "
        />
      </SheetTrigger>

      {/* Bottom Sheet */}
      <SheetContent
        side="bottom"
        className="
          rounded-t-3xl
          border-border
          bg-background/95
          px-4
          pb-8
          pt-5
          shadow-xl
          backdrop-blur-xl
          dark:border-white/[0.06]
          dark:bg-[#0E141C]/95
          dark:shadow-[0_-24px_60px_-15px_rgba(0,0,0,0.85)]
        "
      >
        {/* Drag indicator */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-foreground/15 dark:bg-white/15" />

        <SheetHeader className="mb-5 text-left">
          <SheetTitle className="text-lg font-semibold text-foreground dark:text-white">
            Manage finances
          </SheetTitle>

          <p className="text-sm text-muted-foreground dark:text-white/40">
            Choose what you want to manage
          </p>
        </SheetHeader>

        <div className="space-y-2">
          {/* Budget */}
          <Link
            href="/dashboard/budgets"
            className={`
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              border
              px-4
              py-3.5
              outline-none
              transition-colors
              ${
                isBudgetPage
                  ? "border-primary/30 bg-primary/[0.08]"
                  : "border-border bg-foreground/[0.02] dark:border-white/[0.05] dark:bg-white/[0.02]"
              }
            `}
          >
            {/* Icon */}
            <div
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                ${
                  isBudgetPage
                    ? "bg-primary/15 text-primary"
                    : "bg-foreground/5 text-muted-foreground dark:bg-white/[0.05] dark:text-white/50"
                }
              `}
            >
              <PiggyBank className="h-[19px] w-[19px]" />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p
                className={`
                  text-sm
                  font-medium
                  ${
                    isBudgetPage
                      ? "text-primary"
                      : "text-foreground dark:text-white/85"
                  }
                `}
              >
                Budget
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground dark:text-white/35">
                Manage your spending
              </p>
            </div>

            {/* Active indicator */}
            {isBudgetPage && (
              <Check className="h-4 w-4 shrink-0 text-primary" />
            )}
          </Link>

          {/* Savings Goals */}
          <Link
            href="/dashboard/goals"
            className={`
              flex
              w-full
              items-center
              gap-3
              rounded-2xl
              border
              px-4
              py-3.5
              outline-none
              transition-colors
              ${
                isGoalsPage
                  ? "border-primary/30 bg-primary/[0.08]"
                  : "border-border bg-foreground/[0.02] dark:border-white/[0.05] dark:bg-white/[0.02]"
              }
            `}
          >
            {/* Icon */}
            <div
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                ${
                  isGoalsPage
                    ? "bg-primary/15 text-primary"
                    : "bg-foreground/5 text-muted-foreground dark:bg-white/[0.05] dark:text-white/50"
                }
              `}
            >
              <Target className="h-[19px] w-[19px]" />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p
                className={`
                  text-sm
                  font-medium
                  ${
                    isGoalsPage
                      ? "text-primary"
                      : "text-foreground dark:text-white/85"
                  }
                `}
              >
                Savings Goals
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground dark:text-white/35">
                Track your savings
              </p>
            </div>

            {/* Active indicator */}
            {isGoalsPage && (
              <Check className="h-4 w-4 shrink-0 text-primary" />
            )}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}