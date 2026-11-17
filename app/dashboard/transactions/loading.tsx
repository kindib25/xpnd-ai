import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-4">
      {/* AMBIENT BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-background transition-colors duration-500 dark:bg-[radial-gradient(120%_120%_at_50%_0%,#30333a_0%,#1a1d22_42%,#13161a_72%,#0f1115_100%)]" />

        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/15" />
        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-primary/5 blur-[140px] dark:bg-primary/10" />
        <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="mt-5 mb-6 md:mt-10 md:mb-8">
        <h1 className="text-xl font-bold text-foreground md:text-3xl">Transactions</h1>
        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
          Review and manage your expenses
        </p>
      </header>

      {/* TRANSACTION CALENDAR */}
      <section className="space-y-3">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-4 md:p-6">
            {/* Calendar Header */}
            <div className="mb-5 flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-md bg-muted dark:bg-white/10" />
              <Skeleton className="h-5 w-32 bg-muted dark:bg-white/10 md:w-40" />
              <Skeleton className="h-8 w-8 rounded-md bg-muted dark:bg-white/10" />
            </div>

            {/* Calendar Weekdays */}
            <div className="mb-3 grid grid-cols-7 gap-1 md:gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex justify-center">
                  <Skeleton className="h-4 w-8 bg-muted dark:bg-white/10" />
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-square w-full rounded-md bg-muted dark:bg-white/10"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* TRANSACTIONS */}
      <section className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Skeleton className="h-11 w-full rounded-full border border-border bg-background shadow-sm backdrop-blur-xl dark:border-white/[0.14] dark:bg-white/[0.055] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
        </div>

        {/* Transaction List */}
        <Card className="relative overflow-hidden rounded-xl border border-border bg-card/60 shadow-sm backdrop-blur-xl dark:border-white/[0.12] dark:bg-white/[0.045] dark:shadow-xl">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border dark:bg-white/[0.10]" />

          <CardContent className="relative z-10 p-0">
            <div className="divide-y divide-border dark:divide-white/[0.06]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 md:gap-4 md:p-4"
                >
                  {/* Icon */}
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl border border-border bg-muted shadow-sm backdrop-blur-xl md:h-12 md:w-12 dark:border-white/[0.10] dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />

                  {/* Description + Date */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded-md bg-muted md:h-5 md:w-44 dark:bg-white/[0.09]" />
                    <Skeleton className="h-3 w-24 rounded-md bg-muted/70 md:w-28 dark:bg-white/[0.055]" />
                  </div>

                  {/* Category */}
                  <Skeleton className="hidden h-6 w-24 rounded-full border border-border bg-muted sm:inline-block md:w-28 dark:border-white/[0.10] dark:bg-white/[0.055]" />

                  {/* Amount */}
                  <Skeleton className="h-5 w-16 shrink-0 rounded-md bg-muted md:w-20 dark:bg-white/[0.09]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Skeleton className="h-9 w-20 rounded-xl border border-border bg-background shadow-sm backdrop-blur-xl dark:border-white/[0.14] dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />

          <Skeleton className="h-5 w-24 rounded-md bg-muted dark:bg-white/[0.055]" />

          <Skeleton className="h-9 w-20 rounded-xl border border-border bg-background shadow-sm backdrop-blur-xl dark:border-white/[0.14] dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
        </div>
      </section>
    </div>
  )
}