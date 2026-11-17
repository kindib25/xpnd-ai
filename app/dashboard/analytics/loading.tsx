import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Glass tokens — mirror analytics-client.tsx exactly
// ---------------------------------------------------------------------------
const GLASS_SURFACE =
  'relative overflow-hidden rounded-[26px] border border-border bg-card/80 backdrop-blur-xl shadow-sm ' +
  'dark:border-white/[0.14] dark:bg-white/[0.075] ' +
  'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)]'

const GLASS_SURFACE_DEEP =
  'relative overflow-hidden rounded-[26px] border border-border bg-card/80 backdrop-blur-2xl shadow-sm ' +
  'dark:border-white/[0.14] dark:bg-[#151922]/70 ' +
  'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-35px_rgba(0,0,0,0.85)]'

const HAIRLINE =
  'pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40'

const ROW_SHELL =
  'relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-border ' +
  'bg-foreground/[0.02] px-4 py-4 shadow-sm backdrop-blur-xl sm:px-5 sm:py-5 ' +
  'dark:border-white/[0.14] dark:bg-white/[0.055] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]'

const BONE = 'bg-muted dark:bg-white/[0.08]'
const BONE_STRONG = 'bg-muted/80 dark:bg-white/[0.14]'

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

      <div className="relative mx-auto w-full max-w-7xl space-y-7 p-4 text-foreground sm:p-6 md:space-y-8 md:p-8">
        {/* Header */}
        <div className="relative mb-8">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Understand your spending patterns.
          </p>
        </div>

        {/* Tab cluster */}
        <div
          aria-hidden="true"
          className="relative mb-8 flex w-full flex-wrap gap-2 overflow-hidden rounded-2xl border border-border bg-card/60 p-1.5 shadow-sm backdrop-blur-xl sm:w-fit dark:border-white/[0.14] dark:bg-white/[0.055] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)]"
        >
          <div className={HAIRLINE} />
          <Skeleton className={`h-10 w-24 rounded-xl ${BONE}`} />
          <Skeleton className={`h-10 w-20 rounded-xl ${BONE}`} />
          <Skeleton className={`h-10 w-28 rounded-xl ${BONE}`} />
        </div>

        <div className="space-y-6">
          {/* Spending Overview */}
          <Card className={GLASS_SURFACE_DEEP}>
            <div aria-hidden="true" className={HAIRLINE} />
            <CardHeader className="border-b border-border px-5 py-5 sm:px-6 dark:border-white/[0.06]">
              <Skeleton className={`h-6 w-44 md:h-7 md:w-52 ${BONE_STRONG}`} />
              <Skeleton className={`mt-2 h-4 w-20 ${BONE}`} />
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              <div className="flex h-64 items-center justify-center md:h-80">
                {/* Donut ring via thick border (real cutout for glass bg) */}
                <div
                  className="h-48 w-48 rounded-full border-[38px] border-muted md:h-56 md:w-56 md:border-[45px] dark:border-white/[0.08]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className={`${GLASS_SURFACE} p-3 md:p-5`}>
            <div aria-hidden="true" className={HAIRLINE} />
            <CardHeader className="px-0 pb-4">
              <Skeleton className={`h-6 w-48 md:h-7 md:w-56 ${BONE_STRONG}`} />
            </CardHeader>

            <CardContent className="px-0">
              <div className="space-y-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className={ROW_SHELL}>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40"
                    />

                    <div className="flex min-w-0 items-center gap-4">
                      <Skeleton className={`h-3 w-3 shrink-0 rounded-full ${BONE_STRONG}`} />

                      <div className="min-w-0 space-y-2">
                        <Skeleton className={`h-5 w-32 md:h-6 md:w-40 ${BONE_STRONG}`} />
                        <Skeleton className={`h-4 w-24 md:w-28 ${BONE}`} />
                      </div>
                    </div>

                    <Skeleton className={`ml-4 h-7 w-14 shrink-0 md:h-8 md:w-16 ${BONE_STRONG}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}