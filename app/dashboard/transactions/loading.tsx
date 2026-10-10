import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-4">
     {/* =========================================================
          AMBIENT BACKGROUND — fixed, full-viewport, out of content flow.
          Colour orbs give the backdrop-blur something real to bite on.
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

        {/* Lime orb — primary accent, upper-left */}
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#9ee82d]/[0.14] blur-[130px]" />

        {/* Violet orb — brand purple, right */}
        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-[#724bf6]/[0.20] blur-[140px]" />

        {/* Sky/cyan counterweight, bottom */}
        <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/[0.10] blur-[140px]" />
      </div>
      
      {/* Header */}
      <header className="mt-5 mb-6 md:mt-10 md:mb-8">
        <h1 className="text-xl font-bold md:text-3xl">Transactions</h1>
        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
          Review and manage your expenses
        </p>
      </header>

      {/* =========================
          TRANSACTION CALENDAR
      ========================== */}
      <section className="space-y-3">

        <Card className="bg-white">
          <CardContent className="bg-white p-4 md:p-6">
            {/* Calendar Header */}
            <div className="mb-5 flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-md" />

              <Skeleton className="h-5 w-32 md:w-40" />

              <Skeleton className="h-8 w-8 rounded-md" />
            </div>

            {/* Calendar Weekdays */}
            <div className="mb-3 grid grid-cols-7 gap-1 md:gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex justify-center">
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-square w-full rounded-md"
                />
              ))}
            </div>
          </CardContent>
        </Card>


      </section>

      {/* ============================================
    TRANSACTIONS
============================================ */}
      <section className="space-y-3">

        {/* Search */}
        <div className="relative">
          <Skeleton
            className="h-11 w-full rounded-full border border-white/[0.14] bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
          />
        </div>

        {/* Transaction List */}
        <Card className="relative overflow-hidden rounded-xl border border-white/[0.12] bg-white/[0.045] shadow-xl backdrop-blur-xl">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.10]" />

          <CardContent className="relative z-10 p-0">
            <div className="divide-y divide-white/[0.06]">

              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={`
              flex
              items-center
              gap-2
              p-3
              md:gap-4
              md:p-4
            `}
                >
                  {/* Icon */}
                  <Skeleton
                    className="
                h-10 w-10 shrink-0 rounded-xl
                border border-white/[0.10]
                bg-white/[0.045]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                backdrop-blur-xl
                md:h-12 md:w-12
              "
                  />

                  {/* Description + Date */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded-md bg-white/[0.09] md:h-5 md:w-44" />

                    <Skeleton className="h-3 w-24 rounded-md bg-white/[0.055] md:w-28" />
                  </div>

                  {/* Category */}
                  <Skeleton
                    className="
                hidden h-6 w-24 rounded-full
                border border-white/[0.10]
                bg-white/[0.055]
                sm:inline-block
                md:w-28
              "
                  />

                  {/* Amount */}
                  <Skeleton className="h-5 w-16 shrink-0 rounded-md bg-white/[0.09] md:w-20" />
                </div>
              ))}

            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 pt-2">

          <Skeleton
            className="
        h-9 w-20 rounded-xl
        border border-white/[0.14]
        bg-white/[0.045]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
        backdrop-blur-xl
      "
          />

          <Skeleton className="h-5 w-24 rounded-md bg-white/[0.055]" />

          <Skeleton
            className="
        h-9 w-20 rounded-xl
        border border-white/[0.14]
        bg-white/[0.045]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
        backdrop-blur-xl
      "
          />

        </div>
      </section>
    </div>
  )
}