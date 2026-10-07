// app/dashboard/budgets/loading.tsx

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

      {/* ---------------------------------------------------------------- */}
      {/* Page Header — mirrors FinancePageNavigation + description        */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-8">
        {/* Nav trigger: large rounded button with "Budget" + menu icon */}
        <Bone className="h-[60px] w-44 rounded-2xl bg-muted md:h-[68px] md:w-56" />

        {/* "Stay on track with your budget." */}
        <Bone className="mt-2 ml-2 h-4 w-56 bg-muted md:h-5 md:w-64" />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* This Month Overview — featured gradient card                     */}
      {/* ---------------------------------------------------------------- */}
      <Card className="mb-6 md:mb-8 border-primary/10 bg-gradient-to-br from-[#bffa29] to-[#7ce72e] text-black">
        <CardHeader className="flex flex-row items-center justify-between pb-3 md:pb-4">
          <div className="space-y-2">
            {/* "This Month Overview" */}
            <Bone className="h-3.5 w-36 bg-black/15 md:h-4 md:w-44" />
            {/* monthYear */}
            <Bone className="h-3 w-20 bg-black/10 md:h-3.5 md:w-24" />
          </div>

          {/* Edit button */}
          <Bone className="h-8 w-16 rounded-md bg-white/70 md:w-24" />
        </CardHeader>

        <CardContent className="space-y-4 md:space-y-6">
          {/* Spending summary: Total Spent / Budget */}
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-1 md:space-y-2">
              <Bone className="h-3 w-20 bg-black/10" />
              <Bone className="h-7 w-28 bg-black/20 md:h-9 md:w-36" />
            </div>

            <div className="flex flex-col items-end space-y-1 md:space-y-2">
              <Bone className="h-3 w-14 bg-black/10" />
              <Bone className="h-7 w-28 bg-black/20 md:h-9 md:w-36" />
            </div>
          </div>

          {/* Budget usage progress */}
          <div className="space-y-2">
            <Bone className="h-3.5 w-24 bg-black/10 md:h-4" />

            <Bone className="h-3 w-full rounded-full bg-black/15" />

            <div className="flex items-center justify-between">
              <Bone className="h-3.5 w-20 bg-black/10 md:h-4" />
              <Bone className="h-3.5 w-16 bg-black/10 md:h-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Category Budgets                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section>
        {/* Section header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <Bone className="h-6 w-40 bg-muted" />
            <Bone className="h-3.5 w-20 bg-muted" />
          </div>

          {/* "Add category" button */}
          <Bone className="h-9 w-32 rounded-md bg-muted" />
        </div>

        {/* Category budget rows */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Avatar / first letter tile */}
                <Bone className="h-16 w-16 shrink-0 rounded-xl bg-muted" />

                <div className="min-w-0 flex-1">
                  {/* Category name + percentage */}
                  <div className="flex items-center justify-between gap-3">
                    <Bone className="h-4 w-28 bg-muted" />
                    <Bone className="h-4 w-10 bg-muted" />
                  </div>

                  {/* Spent / limit + delete button */}
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Bone className="h-3.5 w-32 bg-muted" />
                    <Bone className="h-7 w-7 rounded-md bg-muted" />
                  </div>

                  {/* Progress bar — hidden on mobile, visible md+ */}
                  <Bone className="mt-3 h-0 w-full rounded-full bg-muted md:h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}