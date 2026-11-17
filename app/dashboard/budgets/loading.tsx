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
      
      {/* PAGE HEADER */}
      <div className="mb-8">
        <Bone className="h-[60px] w-44 rounded-2xl border border-border bg-muted md:h-[68px] md:w-56 dark:border-white/[0.10] dark:bg-white/[0.06]" />
        <Bone className="mt-2 ml-2 h-4 w-56 bg-muted/70 md:h-5 md:w-64 dark:bg-white/[0.05]" />
      </div>

      {/* THIS MONTH OVERVIEW — glass card mirroring budgets-list.tsx */}
      <Card className="relative mb-6 overflow-hidden rounded-[18px] border border-primary/20 bg-card/80 text-card-foreground backdrop-blur-[28px] shadow-sm md:mb-8 dark:border-primary/40 dark:bg-[#0f1115]/[0.55] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_36px_-24px_rgba(0,0,0,0.40)]">
        {/* Primary tint overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-primary/5 dark:bg-primary/10"
        />

        {/* Glass gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-transparent dark:from-white/[0.16] dark:to-white/[0.03]"
        />

        {/* Top specular hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />

        <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-3 md:pb-4">
          <div className="space-y-2">
            <Bone className="h-3.5 w-36 bg-muted md:h-4 md:w-44 dark:bg-white/[0.14]" />
            <Bone className="h-3 w-20 bg-muted/70 md:h-3.5 md:w-24 dark:bg-white/[0.08]" />
          </div>

          <Bone className="h-8 w-16 rounded-full bg-muted md:w-24 dark:bg-white/[0.12]" />
        </CardHeader>

        <CardContent className="relative z-10 space-y-4 md:space-y-6">
          {/* Spending summary */}
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-1 md:space-y-2">
              <Bone className="h-3 w-20 bg-muted/70 dark:bg-white/[0.08]" />
              <Bone className="h-7 w-28 bg-muted md:h-9 md:w-36 dark:bg-white/[0.16]" />
            </div>

            <div className="flex flex-col items-end space-y-1 md:space-y-2">
              <Bone className="h-3 w-14 bg-muted/70 dark:bg-white/[0.08]" />
              {/* "Budget" — shown in primary color in real card */}
              <Bone className="h-7 w-28 bg-primary/30 md:h-9 md:w-36 dark:bg-primary/30" />
            </div>
          </div>

          {/* Budget usage progress */}
          <div className="space-y-2">
            <Bone className="h-3.5 w-24 bg-muted/70 md:h-4 dark:bg-white/[0.08]" />
            <Bone className="h-3 w-full rounded-full bg-muted dark:bg-white/[0.10]" />
            <div className="flex items-center justify-between">
              <Bone className="h-3.5 w-20 bg-muted/70 md:h-4 dark:bg-white/[0.08]" />
              <Bone className="h-3.5 w-16 bg-muted/70 md:h-4 dark:bg-white/[0.08]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CATEGORY BUDGETS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <Bone className="h-6 w-40 bg-muted dark:bg-white/[0.14]" />
            <Bone className="h-3.5 w-20 bg-muted/70 dark:bg-white/[0.08]" />
          </div>
          <Bone className="h-9 w-32 rounded-full bg-muted dark:bg-white/[0.10]" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="group relative isolate overflow-hidden rounded-[20px] p-4 md:p-5 border border-border bg-card/80 backdrop-blur-xl shadow-sm dark:border-white/[0.14] dark:bg-white/[0.075] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)]"
            >
              {/* Glass surface gradient */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-transparent opacity-70 dark:from-white/[0.10] dark:to-white/[0.015]"
              />

              {/* Top edge reflection */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40"
              />

              {/* Soft corner glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/5 blur-2xl dark:bg-white/[0.06]"
              />

              {/* Foreground content */}
              <div className="relative z-10 flex items-center gap-4">
                <Bone className="h-16 w-16 shrink-0 rounded-xl border border-border bg-muted dark:border-white/[0.10] dark:bg-white/[0.08]" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <Bone className="h-4 w-28 bg-muted dark:bg-white/[0.14]" />
                    <Bone className="h-4 w-10 bg-muted dark:bg-white/[0.14]" />
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-3">
                    <Bone className="h-3.5 w-32 bg-muted/70 dark:bg-white/[0.08]" />
                    <Bone className="h-7 w-7 rounded-md bg-muted/70 dark:bg-white/[0.08]" />
                  </div>

                  <Bone className="mt-3 h-2 w-full rounded-full bg-muted dark:bg-white/[0.10]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}