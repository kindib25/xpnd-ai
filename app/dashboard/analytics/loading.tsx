import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <div className="w-full p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Analytics</h1>
                <p className="text-muted-foreground">Understand your spending patterns.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 md:gap-3 mb-8">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-20 rounded-full" />
                <Skeleton className="h-10 w-28 rounded-full" />
            </div>

            {/* Spending Overview */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-44 md:h-7 md:w-52" />
                        <Skeleton className="mt-2 h-4 w-20" />
                    </CardHeader>

                    <CardContent>
                        <div className="flex h-64 items-center justify-center md:h-80">
                            {/* Donut chart skeleton */}
                            <div className="relative h-48 w-48 md:h-56 md:w-56">
                                <Skeleton className="h-full w-full rounded-full" />
                                <div className="absolute inset-0 m-auto h-24 w-24 rounded-full bg-background md:h-28 md:w-28" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card className="border-0 bg-transparent p-3 shadow-none md:p-5">
                    <CardHeader className="px-0 pb-4">
                        <Skeleton className="h-6 w-48 md:h-7 md:w-56" />
                    </CardHeader>

                    <CardContent className="px-0">
                        <div className="space-y-5">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between rounded-2xl bg-[#1e293b] px-4 py-5 md:px-5 md:py-6"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <Skeleton className="h-3 w-3 shrink-0 rounded-full bg-slate-600" />

                                        <div className="min-w-0 space-y-2">
                                            <Skeleton className="h-5 w-32 bg-slate-600 md:h-6 md:w-40" />
                                            <Skeleton className="h-4 w-24 bg-slate-600 md:w-28" />
                                        </div>
                                    </div>

                                    <Skeleton className="ml-4 h-7 w-14 bg-slate-600 md:h-8 md:w-16" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
