import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="w-full p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-2 md:hidden">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>

        <Skeleton className="h-7 w-40 md:h-9 md:w-52" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* This Month Overview */}
      <Card className="mb-6 md:mb-8 border-primary/10 bg-gradient-to-br from-[#4242fe] to-[#8368fd]">
        <CardHeader className="pb-3 md:pb-4">
          <Skeleton className="h-4 w-32 bg-white/20" />
        </CardHeader>

        <CardContent className="space-y-4 md:space-y-6">
          {/* Spending Summary */}
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 bg-white/20" />
              <Skeleton className="h-8 w-28 bg-white/20 md:h-9" />
            </div>

            <div className="flex flex-col items-end space-y-2">
              <Skeleton className="h-3 w-16 bg-white/20" />
              <Skeleton className="h-8 w-28 bg-white/20 md:h-9" />
            </div>
          </div>

          {/* Budget Progress */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 bg-white/20" />

            <Skeleton className="h-3 w-full rounded-full bg-white/20" />

            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 bg-white/20" />
              <Skeleton className="h-3 w-16 bg-white/20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6 md:mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-1 md:pb-2 space-y-2">
              <Skeleton className="h-4 w-4 rounded-md md:h-5 md:w-5" />
              <Skeleton className="h-3 w-20" />
            </CardHeader>

            <CardContent>
              <Skeleton className="h-7 w-24 md:h-8" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insight */}
      <Card className="mb-6 overflow-hidden rounded-2xl border-0">
        <div className="flex h-[130px]">
          <div className="flex w-[65%] flex-col justify-center bg-card px-5 py-4">
            <Skeleton className="h-6 w-24" />

            <Skeleton className="mt-3 h-4 w-full max-w-[250px]" />
            <Skeleton className="mt-2 h-4 w-4/5 max-w-[200px]" />

            <Skeleton className="mt-4 h-9 w-24 rounded-md" />
          </div>

          <div className="flex w-[35%] items-center justify-center bg-muted">
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </div>
      </Card>

      {/* Add Expense */}
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <Skeleton className="h-5 w-24 md:h-6 md:w-28" />
      </div>

      <div className="mb-6 md:mb-8">
        <Card className="bg-primary/30">
          <CardContent className="py-6 md:py-8 flex items-center justify-center">
            <Skeleton className="h-10 w-10 rounded-md md:h-11 md:w-11" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>

          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>

                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
