import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex-1 px-8 py-6">
         <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Settings
          </h1>

          <p className="mt-1 text-muted-foreground">
            Manage your profile and preferences
          </p>
        </div>
    <div className="mx-auto w-full max-w-5xl space-y-5 md:space-y-6 xl:grid xl:grid-cols-[1fr_360px] xl:gap-6 xl:space-y-0">

      {/* =========================
          PROFILE INFORMATION
      ========================== */}
      <div className="min-w-0">
        <Card className="w-full">

          <CardHeader className="px-4 py-5 sm:px-6">
            <Skeleton className="h-6 w-40 sm:h-7" />
            <Skeleton className="mt-1 h-4 w-64" />
          </CardHeader>

          <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">

            <div className="space-y-5">

              {/* =========================
                  PROFILE AVATAR
              ========================== */}
              <div className="flex flex-col items-center rounded-xl border bg-muted/30 px-4 py-6 text-center sm:py-7">

                {/* Avatar */}
                <Skeleton className="size-24 shrink-0 rounded-full sm:size-28" />

                {/* Profile Name */}
                <Skeleton className="mt-4 h-5 w-32 sm:h-6" />

                {/* Upload Button */}
                <Skeleton className="mt-3 h-10 w-32 rounded-md" />

                {/* File Requirements */}
                <Skeleton className="mt-2 h-4 w-48" />

              </div>

              {/* =========================
                  PROFILE NAME + EMAIL
              ========================== */}
              <div className="grid grid-cols-1 gap-5">

                {/* Profile Name */}
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-11 w-full rounded-md" />
                </div>

                {/* Email */}
                <div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-2 h-11 w-full rounded-md" />
                </div>

              </div>

              {/* Email notice */}
              <div className="flex items-start gap-2">
                <Skeleton className="mt-0.5 size-3.5 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-72 max-w-full" />
              </div>

              {/* =========================
                  PASSWORD
              ========================== */}
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-11 w-full rounded-md" />
              </div>

              {/* =========================
                  SAVE BUTTON
              ========================== */}
              <Skeleton className="h-11 w-full rounded-md sm:w-48" />

            </div>

          </CardContent>

        </Card>
      </div>

      {/* =========================
          RIGHT COLUMN
      ========================== */}
      <div className="min-w-0 space-y-5 md:space-y-6">

        {/* =========================
            ACCOUNT SECURITY
        ========================== */}
        <Card>

          <CardHeader className="px-4 py-5 sm:px-6">
            <Skeleton className="h-6 w-40 sm:h-7" />
            <Skeleton className="mt-1 h-10 w-full" />
          </CardHeader>

          <CardContent className="space-y-3 px-4 pb-5 sm:px-6 sm:pb-6">

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />

          </CardContent>

        </Card>

        {/* =========================
            DELETE ACCOUNT
        ========================== */}
        <Card className="border-destructive/30">

          <CardHeader className="px-4 py-5 sm:px-6">
            <Skeleton className="h-6 w-36 sm:h-7" />
            <Skeleton className="mt-1 h-10 w-full" />
          </CardHeader>

          <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">

            <Skeleton className="h-11 w-full rounded-md" />

            <div className="mt-3 flex justify-center">
              <Skeleton className="h-4 w-36" />
            </div>

          </CardContent>

        </Card>

        {/* =========================
            MOBILE LOGOUT
        ========================== */}
        <div className="md:hidden">
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

      </div>

    </div>
    </div>
    </div>
  )
}