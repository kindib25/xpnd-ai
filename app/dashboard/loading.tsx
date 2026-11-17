import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
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

      <div className="mx-auto w-full max-w-7xl p-4 text-foreground md:p-8">

        {/* HEADER */}
        <header className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2 md:hidden">
            <Skeleton className="h-11 w-11 rounded-full bg-muted dark:bg-white/10" />
            <Skeleton className="h-15 w-60 rounded-md bg-muted dark:bg-white/10" />
            <Skeleton className="h-11 w-11 rounded-full bg-muted dark:bg-white/10" />
          </div>

          <Skeleton className="h-7 w-40 bg-muted dark:bg-white/10 md:h-9 md:w-52" />
          <Skeleton className="mt-2 h-4 w-64 bg-muted dark:bg-white/10" />
        </header>

        {/* THIS MONTH OVERVIEW — dynamic primary gradient */}
        <Card className="relative mb-6 overflow-hidden rounded-[18px] border border-primary/50 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60 backdrop-blur-[28px] md:mb-8 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_10px_36px_-24px_var(--primary)]">
          <CardHeader className="relative z-10 pb-3 md:pb-4">
            <Skeleton className="h-4 w-32 bg-primary-foreground/20" />
          </CardHeader>

          <CardContent className="relative z-10 space-y-4 md:space-y-6">
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 bg-primary-foreground/20" />
                <Skeleton className="h-8 w-28 bg-primary-foreground/20 md:h-9" />
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Skeleton className="h-3 w-16 bg-primary-foreground/20" />
                <Skeleton className="h-8 w-28 bg-primary-foreground/20 md:h-9" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-24 bg-primary-foreground/20" />
              <Skeleton className="h-3 w-full rounded-full bg-primary-foreground/20" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20 bg-primary-foreground/20" />
                <Skeleton className="h-3 w-16 bg-primary-foreground/20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QUICK STATS — glass tiles */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-[20px] p-4 md:p-5 border border-border bg-card/60 backdrop-blur-xl shadow-sm dark:border-white/[0.14] dark:bg-white/[0.075] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-center gap-2 pb-1 md:pb-2">
                <Skeleton className="h-4 w-4 rounded-md bg-muted dark:bg-white/15 md:h-5 md:w-5" />
                <Skeleton className="h-3 w-16 bg-muted dark:bg-white/15" />
              </div>
              <Skeleton className="mt-2 h-6 w-20 bg-muted dark:bg-white/15 md:h-7" />
            </div>
          ))}
        </div>

        {/* QUICK ADD EXPENSE — deep glass surface */}
        <div className="mb-6 md:mb-8">
          <Card className="relative overflow-hidden rounded-[26px] border border-border bg-card/80 backdrop-blur-2xl shadow-sm dark:border-white/[0.14] dark:bg-[#151922]/70 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-35px_rgba(0,0,0,0.85)]">
            <CardContent className="relative z-10 p-4 sm:p-6 md:p-7">
              {/* Centered heading block */}
              <div className="mb-6 flex flex-col items-center text-center md:mb-8">
                {/* AI badge pill */}
                <Skeleton className="h-7 w-44 rounded-full bg-primary/10" />

                {/* h2 heading */}
                <Skeleton className="mt-4 h-8 w-72 max-w-full bg-muted dark:bg-white/10 md:h-9" />

                {/* subtitle */}
                <Skeleton className="mt-2 h-4 w-full max-w-lg bg-muted dark:bg-white/10" />
                <Skeleton className="mt-1.5 h-4 w-4/5 max-w-md bg-muted dark:bg-white/10" />
              </div>

              {/* Textarea */}
              <Skeleton className="h-[120px] w-full rounded-2xl bg-muted/50 dark:bg-white/[0.045] md:h-[140px]" />

              {/* Footer row */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <Skeleton className="hidden h-4 w-44 bg-muted dark:bg-white/10 sm:block" />
                <Skeleton className="ml-auto h-11 w-40 rounded-xl bg-primary/20 md:h-12" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RECENT ACTIVITY */}
        <Card className="border-border bg-card/60 dark:border-white/[0.12] dark:bg-white/[0.045]">
          <CardHeader>
            <Skeleton className="h-6 w-36 bg-muted dark:bg-white/10" />
          </CardHeader>

          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-muted dark:bg-white/10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-muted dark:bg-white/10" />
                  <Skeleton className="h-3 w-20 bg-muted dark:bg-white/10" />
                </div>
                <Skeleton className="h-4 w-20 bg-muted dark:bg-white/10" />
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </>
  )
}