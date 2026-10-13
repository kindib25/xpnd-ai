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
            QUICK ADD EXPENSE — deep glass surface
        ========================== */}
        <div className="mb-6 md:mb-8">
          <Card
            className="
              relative overflow-hidden rounded-[26px]
              border border-white/[0.14]
              bg-[#151922]/70
              backdrop-blur-2xl
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-35px_rgba(0,0,0,0.85)]
            "
          >
            <CardContent className="relative z-10 p-4 sm:p-6 md:p-7">
              {/* Centered heading block */}
              <div className="mb-6 flex flex-col items-center text-center md:mb-8">
                {/* AI badge pill */}
                <Skeleton className="h-7 w-44 rounded-full bg-[#9ee82d]/[0.10]" />

                {/* h2 — "What did you spend on?" */}
                <Skeleton className="mt-4 h-8 w-72 max-w-full bg-white/10 md:h-9" />

                {/* subtitle — two lines, matches max-w-lg copy */}
                <Skeleton className="mt-2 h-4 w-full max-w-lg bg-white/10" />
                <Skeleton className="mt-1.5 h-4 w-4/5 max-w-md bg-white/10" />
              </div>

              {/* Textarea — mirrors min-h-[120px] md:min-h-[140px] */}
              <Skeleton className="h-[120px] w-full rounded-2xl bg-white/[0.045] md:h-[140px]" />

              {/* Footer row — hint (sm+) + analyze button */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <Skeleton className="hidden h-4 w-44 bg-white/10 sm:block" />
                <Skeleton className="ml-auto h-11 w-40 rounded-xl bg-[#9ee82d]/[0.18] md:h-12" />
              </div>
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