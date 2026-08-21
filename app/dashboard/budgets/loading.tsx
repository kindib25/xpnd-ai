import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <div className="w-full p-4 md:p-8 max-w-7xl mx-auto">

            <div className="mb-8">
                <h1 className="text-3xl font-bold">Budget</h1>
                <p className="text-muted-foreground mt-1">Stay on track with your budget.</p>

            </div>
            {/* This Month Overview */}
            <Card className="mb-6 md:mb-8 border-primary/10 bg-gradient-to-br from-[#bffa29] to-[#7ce72e] text-black">
                <CardHeader className="flex flex-row items-center justify-between pb-3 md:pb-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-black/10" />
                        <Skeleton className="h-3 w-20 bg-black/10" />
                    </div>

                    <Skeleton className="h-8 w-16 bg-white/60" />
                </CardHeader>

                <CardContent className="space-y-4 md:space-y-6">
                    {/* Spending Summary */}
                    <div className="grid grid-cols-2 gap-4 md:gap-8">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-20 bg-black/10" />
                            <Skeleton className="h-8 w-28 bg-black/10 md:h-9" />
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                            <Skeleton className="h-3 w-16 bg-black/10" />
                            <Skeleton className="h-8 w-28 bg-black/10 md:h-9" />
                        </div>
                    </div>

                    {/* Budget Progress */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-24 bg-black/10" />
                        </div>

                        <Skeleton className="h-3 w-full rounded-full bg-white/60" />

                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-20 bg-black/10" />
                            <Skeleton className="h-3 w-16 bg-black/10" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Category Budgets */}
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-20" />
                    </div>

                    <Skeleton className="h-9 w-32" />
                </div>

                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Card
                            key={index}
                            className="rounded-xl border-0 bg-card shadow-sm"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    {/* Category Icon */}
                                    <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />

                                    <div className="min-w-0 flex-1 space-y-2">
                                        {/* Category + Percentage */}
                                        <div className="flex items-center justify-between gap-3">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-10" />
                                        </div>

                                        {/* Amount + Delete */}
                                        <div className="flex items-center justify-between gap-3">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-7 w-7 rounded-md" />
                                        </div>

                                        {/* Progress */}
                                        <Skeleton className="mt-3 h-2 w-full rounded-full" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    )
}
