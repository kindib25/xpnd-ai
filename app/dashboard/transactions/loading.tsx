import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      {/* Header */}
      <header className="mt-5 mb-6 md:mt-10 md:mb-8">
        <h1 className="text-xl font-bold md:text-3xl">Transactions</h1>
        <p className="mt-1 text-xs text-muted-foreground md:text-sm">
          Review and manage your expenses
        </p>
      </header>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['All', 'Today', 'This Week', 'This Month'].map((filter) => (
          <Skeleton
            key={filter}
            className="h-7 w-16 shrink-0 rounded-full"
          />
        ))}
      </div>

      {/* Transactions */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="
                  grid items-center
                  grid-cols-[40px_minmax(0,1fr)_64px_32px]
                  gap-3 p-3
                  sm:grid-cols-[40px_minmax(0,1fr)_96px_64px_32px]
                  md:grid-cols-[48px_minmax(0,1fr)_112px_80px_32px]
                  md:gap-4 md:p-4
                "
              >
                {/* Icon */}
                <Skeleton className="h-10 w-10 rounded-lg md:h-12 md:w-12" />

                {/* Content */}
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-32 max-w-full md:h-5 md:w-44" />
                  <Skeleton className="h-3 w-24 md:w-28" />
                </div>

                {/* Category */}
                <Skeleton className="hidden h-6 w-24 justify-self-end rounded-full sm:block md:w-28" />

                {/* Amount */}
                <Skeleton className="h-4 w-16 justify-self-end md:h-5 md:w-20" />

                {/* Delete */}
                <Skeleton className="h-8 w-8 justify-self-end rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}