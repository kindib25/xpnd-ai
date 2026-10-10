import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Shared skeleton fill — keeps placeholders visible against the
// dark glass panels without fighting the theme.
const sk = 'bg-white/[0.06]'

export default function Loading() {
  return (
    <>
      {/* =========================================================
          AMBIENT BACKGROUND — matches SettingsForm so there is no
          colour pop when the real content streams in.
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
      </div>
      <div className="flex-1 px-8 py-6">
        <div className="mx-auto w-full max-w-5xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Settings
            </h1>

            <p className="mt-1 text-muted-foreground">
              Manage your profile and preferences
            </p>
          </div>
          <div className="relative isolate mx-auto w-full max-w-6xl space-y-5 md:space-y-6 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-6 xl:space-y-0">

            {/* =========================
            LEFT COLUMN
        ========================== */}
            <div className="min-w-0">

              {/* PROFILE INFORMATION */}
              <Card className="relative w-full overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#11131c]/65 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_-35px_rgba(0,0,0,0.85)] backdrop-blur-[28px]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.045] via-transparent to-white/[0.01]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#9ee82d]/30 to-transparent"
                />

                <CardHeader className="relative z-10 border-b border-white/[0.07] px-4 py-5 sm:px-6 sm:py-6">
                  <Skeleton className={`h-6 w-40 sm:h-7 ${sk}`} />
                  <Skeleton className={`mt-2 h-4 w-64 ${sk}`} />
                </CardHeader>

                <CardContent className="relative z-10 px-4 pb-5 sm:px-6 sm:pb-6">
                  <div className="space-y-5">

                    {/* AVATAR BLOCK */}
                    <div className="relative flex flex-col items-center overflow-hidden rounded-[22px] border border-white/[0.09] bg-white/[0.025] px-4 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] sm:py-7">
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.035] via-transparent to-[#9ee82d]/[0.025]"
                      />
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
                    <div className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
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

              {/* NOTIFICATIONS PANEL */}
              <div className="relative mt-5 overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#11131c]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_55px_-35px_rgba(0,0,0,0.8)] backdrop-blur-[28px] md:mt-6">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#9ee82d]/25 to-transparent"
                />
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

            {/* =========================
            RIGHT COLUMN
        ========================== */}
            <div className="min-w-0 space-y-5 md:space-y-6">

              {/* ACCOUNT SECURITY */}
              <Card className="relative overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#11131c]/65 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_-35px_rgba(0,0,0,0.85)] backdrop-blur-[28px]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.01]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />

                <CardHeader className="relative z-10 border-b border-white/[0.07] px-4 py-5 sm:px-6">
                  <Skeleton className={`h-6 w-40 sm:h-7 ${sk}`} />
                  <Skeleton className={`mt-2 h-4 w-full ${sk}`} />
                </CardHeader>

                <CardContent className="relative z-10 space-y-3 px-4 pb-5 pt-5 sm:px-6 sm:pb-6">
                  <Skeleton className={`h-4 w-full ${sk}`} />
                  <Skeleton className={`h-4 w-11/12 ${sk}`} />
                </CardContent>
              </Card>

              {/* DELETE ACCOUNT */}
              <Card className="relative overflow-hidden rounded-[26px] border border-red-400/[0.20] bg-[#171219]/70 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_70px_-35px_rgba(0,0,0,0.85)] backdrop-blur-[28px]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-400/[0.045] via-transparent to-transparent"
                />

                <CardHeader className="relative z-10 border-b border-white/[0.07] px-4 py-5 sm:px-6">
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