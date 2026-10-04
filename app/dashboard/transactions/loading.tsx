import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-4">
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

        <Skeleton className="h-6 w-48 md:h-7 md:w-56" />

        <Card>
          <CardContent className="p-4 md:p-6">

            {/* Calendar Header */}
            <div className="mb-5 flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-md" />

              <Skeleton className="h-5 w-32 md:w-40" />

              <Skeleton className="h-8 w-8 rounded-md" />
            </div>

            {/* Calendar Weekdays */}
            <div className="mb-3 grid grid-cols-7 gap-1 md:gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="flex justify-center"
                >
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

      {/* =========================
          TRANSACTIONS
      ========================== */}
      <section className="space-y-3">

        <Skeleton className="h-6 w-32 md:h-7 md:w-40" />

        {/* Search */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-full rounded-full md:h-11" />
        </div>

        {/* Transaction List */}
        <Card>
          <CardContent className="p-0">

            <div className="divide-y">

              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 md:gap-4 md:p-4"
                >

                  {/* Icon */}
                  <Skeleton className="h-10 w-10 shrink-0 rounded-lg md:h-12 md:w-12" />

                  {/* Description + Date */}
                  <div className="mr-8 min-w-0 flex-1 space-y-2 md:mr-0">
                    <Skeleton className="h-4 w-32 md:h-5 md:w-44" />
                    <Skeleton className="h-3 w-24 md:w-28" />
                  </div>

                  {/* Category */}
                  <Skeleton className="hidden h-6 w-24 rounded-full sm:inline-block md:w-28" />

                  {/* Amount */}
                  <Skeleton className="h-5 w-16 md:w-20" />

                </div>
              ))}

            </div>

          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 pt-2">

          <Skeleton className="h-9 w-20 rounded-lg" />

          <Skeleton className="h-5 w-24" />

          <Skeleton className="h-9 w-20 rounded-lg" />

        </div>

      </section>
    </div>
  )
}