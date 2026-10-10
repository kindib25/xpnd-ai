import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      {/* =========================================================
          AMBIENT BACKGROUND — fixed, full-viewport, out of content flow.
          Colour orbs give the backdrop-blur something real to bite on.
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 50% 0%, #30333a 0%, #1a1d22 42%, #13161a 72%, #0f1115 100%)',
          }}
        />

        {/* Lime orb — primary accent, upper-left */}
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#9ee82d]/[0.14] blur-[130px]" />

        {/* Violet orb — brand purple, right */}
        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-[#724bf6]/[0.20] blur-[140px]" />

        {/* Sky/cyan counterweight, bottom */}
        <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/[0.10] blur-[140px]" />
      </div>

      <div className="mx-auto w-full max-w-7xl p-4 text-white md:p-8">

        {/* =========================
            HEADER
        ========================== */}
        <header className="mb-6 md:mb-8">
          {/* Mobile-only chrome */}
          <div className="flex items-center justify-between mb-2 md:hidden">
            <Skeleton className="h-11 w-11 rounded-full bg-white/10" />
            <Skeleton className="h-15 w-60 rounded-md bg-white/10" />
            <Skeleton className="h-11 w-11 rounded-full bg-white/10" />
          </div>

          <Skeleton className="h-7 w-40 bg-white/10 md:h-9 md:w-52" />
          <Skeleton className="mt-2 h-4 w-64 bg-white/10" />
        </header>

        {/* =========================
            THIS MONTH OVERVIEW
        ========================== */}
        <Card
          className="
            relative mb-6 overflow-hidden rounded-[18px]
            border border-[#724bf6]/[0.50]
            bg-gradient-to-br
            from-[#271c83]/[0.72]
            via-[#4d34bd]/[0.62]
            to-[#724bf6]/[0.42]
            backdrop-blur-[28px]
            md:mb-8
          "
        >
          <CardHeader className="relative z-10 pb-3 md:pb-4">
            <Skeleton className="h-4 w-32 bg-white/20" />
          </CardHeader>

          <CardContent className="relative z-10 space-y-4 md:space-y-6">
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

        {/* =========================
            QUICK STATS — glass tiles, not Cards
        ========================== */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="
                relative overflow-hidden rounded-[20px] p-4 md:p-5
                border border-white/[0.14]
                bg-white/[0.075]
                backdrop-blur-xl
              "
            >
              <div className="flex items-center gap-2 pb-1 md:pb-2">
                <Skeleton className="h-4 w-4 rounded-md bg-white/15 md:h-5 md:w-5" />
                <Skeleton className="h-3 w-16 bg-white/15" />
              </div>
              <Skeleton className="mt-2 h-6 w-20 bg-white/15 md:h-7" />
            </div>
          ))}
        </div>

        {/* =========================
            AI INSIGHT — gradient border wrapper
        ========================== */}
        <div className="group relative mb-6 overflow-hidden rounded-[28px] border-0 bg-transparent p-[2px]">
          {/* Gradient border ring */}
          <div
            aria-hidden="true"
            className="
              absolute inset-0 rounded-[28px]
              bg-[linear-gradient(90deg,#7CFF3A_0%,#65E8FF_48%,#6945FF_100%)]
              opacity-90
            "
          />

          <div
            className="
              relative flex min-h-[190px]
              flex-col justify-between gap-5
              rounded-[26px] bg-[#0D1626]
              px-5 py-6
              sm:px-6 sm:py-7
              md:flex-row md:items-center md:gap-8 md:px-8
              lg:px-10
            "
          >
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center gap-2 md:gap-2.5">
                <Skeleton className="h-9 w-9 shrink-0 rounded-md bg-white/10 sm:h-10 sm:w-10" />
                <Skeleton className="h-6 w-20 bg-white/10 sm:h-7 md:h-8" />
              </div>

              <Skeleton className="h-4 w-full max-w-3xl bg-white/10" />
              <Skeleton className="mt-2 h-4 w-4/5 max-w-2xl bg-white/10" />
            </div>

            <div className="w-full shrink-0 md:w-auto">
              <Skeleton className="h-12 w-full rounded-xl bg-white/10 sm:h-14 md:min-w-[170px]" />
            </div>
          </div>
        </div>

        {/* =========================
            ADD EXPENSE
        ========================== */}
        <div className="mb-2 flex items-center justify-between md:mb-3">
          <Skeleton className="h-5 w-24 bg-white/10 md:h-6 md:w-28" />
        </div>

        <div className="mb-6 md:mb-8">
          <Card className="bg-primary/90">
            <CardContent className="flex items-center justify-center py-6 md:py-8">
              <Skeleton className="h-10 w-10 rounded-md bg-background/40 md:h-11 md:w-11" />
            </CardContent>
          </Card>
        </div>

        {/* =========================
            RECENT ACTIVITY
        ========================== */}
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
    </>
  )
}