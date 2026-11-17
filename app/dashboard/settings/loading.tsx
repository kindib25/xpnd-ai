import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Theme-aware skeleton fill
const sk = 'bg-muted dark:bg-white/[0.06]'

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
      
      <div className="flex-1 px-8 py-6">
        <div className="mx-auto w-full max-w-5xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-1 text-muted-foreground">Manage your profile and preferences</p>
          </div>

          <div className="relative isolate mx-auto w-full max-w-6xl space-y-5 md:space-y-6 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-6 xl:space-y-0">
            {/* LEFT COLUMN */}
            <div className="min-w-0 space-y-5 md:space-y-6">
              {/* PROFILE INFORMATION */}
              <Card className="relative w-full overflow-hidden rounded-[26px] border border-border bg-card/80 text-card-foreground shadow-sm backdrop-blur-[28px] dark:border-white/[0.10] dark:bg-[#11131c]/65 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_-35px_rgba(0,0,0,0.85)]">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-foreground/[0.01] dark:from-white/[0.045] dark:to-white/[0.01]" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <CardHeader className="relative z-10 border-b border-border px-4 py-5 sm:px-6 sm:py-6 dark:border-white/[0.07]">
                  <Skeleton className={`h-6 w-40 sm:h-7 ${sk}`} />
                  <Skeleton className={`mt-2 h-4 w-64 ${sk}`} />
                </CardHeader>

                <CardContent className="relative z-10 px-4 pb-5 sm:px-6 sm:pb-6">
                  <div className="space-y-5">
                    {/* AVATAR BLOCK */}
                    <div className="relative flex flex-col items-center overflow-hidden rounded-[22px] border border-border bg-foreground/[0.02] px-4 py-6 text-center shadow-sm sm:py-7 dark:border-white/[0.09] dark:bg-white/[0.025] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
                      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-primary/[0.02] dark:from-white/[0.035] dark:to-primary/[0.025]" />
                      <Skeleton className={`relative size-24 shrink-0 rounded-full sm:size-28 ${sk}`} />
                      <Skeleton className={`relative mt-4 h-5 w-32 sm:h-6 ${sk}`} />
                      <Skeleton className={`relative mt-3 h-10 w-32 rounded-xl ${sk}`} />
                      <Skeleton className={`relative mt-2 h-4 w-48 ${sk}`} />
                    </div>

                    {/* NAME + EMAIL */}
                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <Skeleton className={`h-4 w-24 ${sk}`} />
                        <Skeleton className={`mt-2 h-11 w-full rounded-xl ${sk}`} />
                      </div>
                      <div>
                        <Skeleton className={`h-4 w-28 ${sk}`} />
                        <Skeleton className={`mt-2 h-11 w-full rounded-xl ${sk}`} />
                      </div>
                    </div>

                    {/* EMAIL NOTICE */}
                    <div className="flex items-start gap-2 rounded-xl border border-border bg-foreground/[0.02] px-3 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                      <Skeleton className={`mt-0.5 size-3.5 shrink-0 rounded-full ${sk}`} />
                      <Skeleton className={`h-4 w-72 max-w-full ${sk}`} />
                    </div>

                    {/* PASSWORD */}
                    <div>
                      <Skeleton className={`h-4 w-24 ${sk}`} />
                      <Skeleton className={`mt-2 h-11 w-full rounded-xl ${sk}`} />
                    </div>

                    {/* SAVE BUTTON */}
                    <Skeleton className={`h-11 w-full rounded-xl sm:w-48 ${sk}`} />
                  </div>
                </CardContent>
              </Card>

              {/* APPEARANCE */}
              <Card className="relative w-full overflow-hidden rounded-[26px] border border-border bg-card/80 text-card-foreground shadow-sm backdrop-blur-[28px] dark:border-white/[0.10] dark:bg-[#11131c]/65 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_-35px_rgba(0,0,0,0.85)]">
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                <CardHeader className="relative z-10 border-b border-border px-4 py-5 sm:px-6 sm:py-6 dark:border-white/[0.07]">
                  <Skeleton className={`h-6 w-32 sm:h-7 ${sk}`} />
                  <Skeleton className={`mt-2 h-4 w-72 max-w-full ${sk}`} />
                </CardHeader>

                <CardContent className="relative z-10 px-4 pb-5 pt-6 sm:px-6 sm:pb-6">
                  <div className="space-y-8">
                    {/* Display Mode row — 3 buttons */}
                    <div>
                      <Skeleton className={`h-4 w-28 ${sk}`} />
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Skeleton className={`h-24 w-full rounded-xl ${sk}`} />
                        <Skeleton className={`h-24 w-full rounded-xl ${sk}`} />
                        <Skeleton className={`h-24 w-full rounded-xl ${sk}`} />
                      </div>
                    </div>

                    {/* Accent Color row */}
                    <div>
                      <Skeleton className={`h-4 w-28 ${sk}`} />
                      <Skeleton className={`mt-2 h-3 w-64 max-w-full ${sk}`} />
                      <div className="mt-4 flex flex-wrap gap-4">
                        {Array.from({ length: 7 }).map((_, index) => (
                          <div key={index} className="flex flex-col items-center gap-2">
                            <Skeleton className={`size-8 rounded-full ${sk}`} />
                            <Skeleton className={`h-3 w-12 ${sk}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview card */}
                    <div>
                      <Skeleton className={`h-4 w-20 ${sk}`} />
                      <div className="mt-3 rounded-2xl border border-border bg-card/50 p-5 dark:border-white/[0.10] dark:bg-white/[0.02]">
                        <Skeleton className={`h-4 w-24 ${sk}`} />
                        <Skeleton className={`mt-4 h-3 w-20 ${sk}`} />
                        <Skeleton className={`mt-2 h-8 w-32 ${sk}`} />
                        <Skeleton className={`mt-3 h-1.5 w-full rounded-full ${sk}`} />
                        <Skeleton className={`mt-4 h-10 w-full rounded-xl ${sk}`} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NOTIFICATIONS PANEL */}
              <div className="relative overflow-hidden rounded-[26px] border border-border bg-card/60 shadow-sm backdrop-blur-[28px] dark:border-white/[0.10] dark:bg-[#11131c]/60 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_55px_-35px_rgba(0,0,0,0.8)]">
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="relative z-10 px-4 py-5 sm:px-6 sm:py-6">
                  <Skeleton className={`h-6 w-48 ${sk}`} />
                  <Skeleton className={`mt-2 h-4 w-72 max-w-full ${sk}`} />
                  <div className="mt-5 space-y-3">
                    <Skeleton className={`h-11 w-full rounded-xl ${sk}`} />
                    <Skeleton className={`h-11 w-full rounded-xl ${sk}`} />
                    <Skeleton className={`h-11 w-full rounded-xl ${sk}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="min-w-0 space-y-5 md:space-y-6">
              {/* ACCOUNT SECURITY */}
              <Card className="relative overflow-hidden rounded-[26px] border border-border bg-card/80 text-card-foreground shadow-sm backdrop-blur-[28px] dark:border-white/[0.10] dark:bg-[#11131c]/65 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_-35px_rgba(0,0,0,0.85)]">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.02] via-transparent to-transparent dark:from-white/[0.04]" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/20" />

                <CardHeader className="relative z-10 border-b border-border px-4 py-5 sm:px-6 dark:border-white/[0.07]">
                  <Skeleton className={`h-6 w-40 sm:h-7 ${sk}`} />
                  <Skeleton className={`mt-2 h-4 w-full ${sk}`} />
                </CardHeader>

                <CardContent className="relative z-10 space-y-3 px-4 pb-5 pt-5 sm:px-6 sm:pb-6">
                  <Skeleton className={`h-4 w-full ${sk}`} />
                  <Skeleton className={`h-4 w-11/12 ${sk}`} />
                </CardContent>
              </Card>

              {/* DELETE ACCOUNT */}
              <Card className="relative overflow-hidden rounded-[26px] border border-red-200 bg-red-50/50 text-card-foreground shadow-sm backdrop-blur-[28px] dark:border-red-400/[0.20] dark:bg-[#171219]/70 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_70px_-35px_rgba(0,0,0,0.85)]">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/[0.02] via-transparent to-transparent dark:from-red-400/[0.045]" />

                <CardHeader className="relative z-10 border-b border-red-100 px-4 py-5 sm:px-6 dark:border-white/[0.07]">
                  <Skeleton className={`h-6 w-36 sm:h-7 ${sk}`} />
                  <Skeleton className={`mt-2 h-4 w-full ${sk}`} />
                </CardHeader>

                <CardContent className="relative z-10 px-4 pb-5 pt-5 sm:px-6 sm:pb-6">
                  <Skeleton className={`h-11 w-full rounded-xl ${sk}`} />
                  <div className="mt-3 flex justify-center">
                    <Skeleton className={`h-4 w-36 ${sk}`} />
                  </div>
                </CardContent>
              </Card>

              {/* MOBILE LOGOUT */}
              <div className="md:hidden">
                <Skeleton className={`h-11 w-full rounded-xl ${sk}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}