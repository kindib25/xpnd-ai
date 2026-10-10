import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Mirror the glass tokens from AnalyticsClient so loading and loaded states
// share one geometry. Keep in sync if the recipe changes.
// ---------------------------------------------------------------------------
const GLASS_SURFACE =
  'relative overflow-hidden rounded-[26px] border border-white/[0.14] bg-white/[0.075] backdrop-blur-xl ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)]'

const GLASS_SURFACE_DEEP =
  'relative overflow-hidden rounded-[26px] border border-white/[0.14] bg-[#151922]/70 backdrop-blur-2xl ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-35px_rgba(0,0,0,0.85)]'

const HAIRLINE =
  'pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70'

const ROW_SHELL =
  'relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/[0.14] ' +
  'bg-white/[0.055] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl sm:px-5 sm:py-5'

const BONE = 'bg-white/[0.08]'
const BONE_STRONG = 'bg-white/[0.14]'

export default function Loading() {
  return (
    <>
      {/* Ambient background — identical to the loaded page so nothing shifts. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 50% 0%, #30333a 0%, #1a1d22 42%, #13161a 72%, #0f1115 100%)',
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl space-y-7 p-4 text-white sm:p-6 md:space-y-8 md:p-8">
        {/* Header */}
        <div className="relative mb-8">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Analytics
          </h1>
          <p className="text-sm text-white/60 sm:text-base">
            Understand your spending patterns.
          </p>
        </div>

        {/* Tab cluster — glass container, not a bare flex row */}
        <div
          aria-hidden="true"
          className="relative mb-8 flex w-full flex-wrap gap-2 overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.055] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:w-fit"
        >
          <div className={HAIRLINE} />
          <Skeleton className={`h-10 w-24 rounded-xl ${BONE}`} />
          <Skeleton className={`h-10 w-20 rounded-xl ${BONE}`} />
          <Skeleton className={`h-10 w-28 rounded-xl ${BONE}`} />
        </div>

        <div className="space-y-6">
          {/* Spending Overview — deep surface, matching the loaded chart card */}
          <Card className={`${GLASS_SURFACE_DEEP} text-white`}>
            <div aria-hidden="true" className={HAIRLINE} />
            <CardHeader className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
              <Skeleton className={`h-6 w-44 md:h-7 md:w-52 ${BONE_STRONG}`} />
              <Skeleton className={`mt-2 h-4 w-20 ${BONE}`} />
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              <div className="flex h-64 items-center justify-center md:h-80">
                {/*
                  Donut ring via a thick border instead of an overlay disc.
                  An overlay can't match a translucent glass background, so the
                  hole has to be a real cutout. 38px / 45px ≈ recharts'
                  innerRadius 60 : outerRadius 100 ratio at each breakpoint.
                */}
                <div
                  className={`h-48 w-48 rounded-full border-[38px] border-white/[0.08] md:h-56 md:w-56 md:border-[45px]`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown — mid surface, transparent wrapper like the real one */}
          <Card className={`${GLASS_SURFACE} p-3 text-white md:p-5`}>
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
                      className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"
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