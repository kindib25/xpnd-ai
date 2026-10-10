import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Skeleton block helper.
 * Reusing one component keeps the pulse timing consistent everywhere.
 */
function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md ${className}`} />
}

export default function BudgetsLoading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl p-4 md:p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading your budgets…</span>

      {/* =========================================================
          AMBIENT BACKGROUND — mirrors BudgetsList
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 50% 0%, #30333a 0%, #1a1d22 42%, #13161a 72%, #0f1115 100%)',
          }}
        />
      </div>

      {/* =========================================================
          PAGE HEADER — FinancePageNavigation + description
      ========================================================== */}
      <div className="mb-8">
        {/* Nav trigger: large rounded button */}
        <Bone className="h-[60px] w-44 rounded-2xl border border-white/[0.10] bg-white/[0.06] md:h-[68px] md:w-56" />

        {/* "Stay on track with your budget." */}
        <Bone className="mt-2 ml-2 h-4 w-56 bg-white/[0.05] md:h-5 md:w-64" />
      </div>

      {/* =========================================================
          THIS MONTH OVERVIEW — featured glass card
      ========================================================== */}
      <Card
        className="
          relative mb-6 overflow-hidden
          rounded-[18px]
          border border-[#9ee82d]/[0.22]
          bg-[#0f1115]/[0.55]
          text-white
          backdrop-blur-[28px]
          shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_36px_-24px_rgba(0,0,0,0.40)]
          md:mb-8
        "
      >
        {/* Lime tint overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#9ee82d]/[0.14]"
        />

        {/* Glass gradient */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-br from-white/[0.16] via-transparent to-white/[0.03]
          "
        />

        {/* Top specular hairline */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-x-5 top-0 h-px
            bg-gradient-to-r from-transparent via-[#9ee82d]/50 to-transparent
          "
        />

        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-3 md:pb-4">
          <div className="space-y-2">
            {/* "This Month Overview" */}
            <Bone className="h-3.5 w-36 bg-white/[0.14] md:h-4 md:w-44" />
            {/* monthYear */}
            <Bone className="h-3 w-20 bg-white/[0.08] md:h-3.5 md:w-24" />
          </div>

          {/* Edit button — rounded-full pill */}
          <Bone className="h-8 w-16 rounded-full bg-white/[0.12] md:w-24" />
        </CardHeader>

        <CardContent className="relative z-10 space-y-4 md:space-y-6">
          {/* Spending summary: Total Spent / Budget */}
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-1 md:space-y-2">
              <Bone className="h-3 w-20 bg-white/[0.08]" />
              <Bone className="h-7 w-28 bg-white/[0.16] md:h-9 md:w-36" />
            </div>

            <div className="flex flex-col items-end space-y-1 md:space-y-2">
              <Bone className="h-3 w-14 bg-white/[0.08]" />
              {/* "Budget" reads lime in the real card */}
              <Bone className="h-7 w-28 bg-[#9ee82d]/[0.28] md:h-9 md:w-36" />
            </div>
          </div>

          {/* Budget usage progress */}
          <div className="space-y-2">
            <Bone className="h-3.5 w-24 bg-white/[0.08] md:h-4" />

            <Bone className="h-3 w-full rounded-full bg-white/[0.10]" />

            <div className="flex items-center justify-between">
              <Bone className="h-3.5 w-20 bg-white/[0.08] md:h-4" />
              <Bone className="h-3.5 w-16 bg-white/[0.08] md:h-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================================================
          CATEGORY BUDGETS
      ========================================================== */}
      <section>
        {/* Section header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <Bone className="h-6 w-40 bg-white/[0.14]" />
            <Bone className="h-3.5 w-20 bg-white/[0.08]" />
          </div>

          {/* "Add category" button — rounded-full pill */}
          <Bone className="h-9 w-32 rounded-full bg-white/[0.10]" />
        </div>

        {/* Category budget rows */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="
                group relative isolate overflow-hidden
                rounded-[20px] p-4 md:p-5
                border border-white/[0.14]
                bg-white/[0.075]
                backdrop-blur-xl
                shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)]
              "
            >
              {/* Glass surface gradient */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none absolute inset-0
                  bg-gradient-to-br from-white/[0.10] via-transparent to-white/[0.015]
                  opacity-70
                "
              />

              {/* Top edge reflection */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none absolute inset-x-4 top-0 h-px
                  bg-gradient-to-r from-transparent via-white/40 to-transparent
                  opacity-70
                "
              />

              {/* Soft corner glow */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none absolute -right-12 -top-12
                  h-28 w-28 rounded-full
                  bg-white/[0.06] blur-2xl
                "
              />

              {/* Foreground content */}
              <div className="relative z-10 flex items-center gap-4">
                {/* Category icon tile */}
                <Bone className="h-16 w-16 shrink-0 rounded-xl border border-white/[0.10] bg-white/[0.08]" />

                <div className="min-w-0 flex-1">
                  {/* Category name + percentage */}
                  <div className="flex items-center justify-between gap-3">
                    <Bone className="h-4 w-28 bg-white/[0.14]" />
                    <Bone className="h-4 w-10 bg-white/[0.14]" />
                  </div>

                  {/* Spent / limit + delete button */}
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <Bone className="h-3.5 w-32 bg-white/[0.08]" />
                    <Bone className="h-7 w-7 rounded-md bg-white/[0.08]" />
                  </div>

                  {/* Progress bar — always h-2 in the real card */}
                  <Bone className="mt-3 h-2 w-full rounded-full bg-white/[0.10]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}