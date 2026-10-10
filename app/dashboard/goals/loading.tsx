import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Skeleton block helper.
 * Reusing one component keeps the pulse timing consistent everywhere.
 */
function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md ${className}`} />
}

export default function GoalsLoading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl p-4 md:p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading your savings goals…</span>

      {/* ---------------------------------------------------------------- */}
      {/* Page Header — mirrors FinancePageNavigation + description        */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-8">
        {/* Nav trigger: large rounded button */}
        <Bone className="h-[60px] w-64 rounded-2xl bg-muted md:h-[68px] md:w-80" />

        {/* Page description */}
        <Bone className="mt-2 ml-2 h-4 w-56 bg-muted/70 md:h-5 md:w-72" />
      </div>

      {/* =========================================================
          AMBIENT BACKGROUND — mirrors GoalsList
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

      <div className="w-full space-y-5 sm:space-y-6">
        {/* -------------------------------------------------------------- */}
        {/* Available Savings — gradient card                              */}
        {/* -------------------------------------------------------------- */}
        <Card className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-sm">
          <CardContent className="p-0">
            <div className="relative overflow-hidden">
              {/* Decorative glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative p-5 sm:p-6">
                {/* Header: icon + labels + edit button */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {/* PiggyBank icon tile */}
                    <Bone className="h-11 w-11 shrink-0 rounded-2xl bg-primary/10" />

                    <div className="space-y-1.5">
                      {/* "Available savings" */}
                      <Bone className="h-3.5 w-28 bg-muted" />
                      {/* "Money available for your goals" */}
                      <Bone className="h-3 w-44 bg-muted/70" />
                    </div>
                  </div>

                  {/* Edit (pencil) button */}
                  <Bone className="h-9 w-9 shrink-0 rounded-xl bg-muted" />
                </div>

                {/* Amount + subtitle */}
                <div className="mt-5 space-y-3">
                  {/* ₱XX,XXX.XX */}
                  <Bone className="h-9 w-48 bg-muted sm:h-11 sm:w-60" />

                  <div className="flex items-center gap-2">
                    {/* Wallet icon */}
                    <Bone className="h-3.5 w-3.5 rounded-full bg-muted/70" />
                    {/* "Allocate this amount…" */}
                    <Bone className="h-3 w-56 bg-muted/70" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* -------------------------------------------------------------- */}
        {/* Goals card                                                     */}
        {/* -------------------------------------------------------------- */}
        <Card className="overflow-hidden rounded-3xl border bg-card shadow-sm">
          <CardHeader className="space-y-4 p-5 pb-4 sm:p-6 sm:pb-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {/* Target icon tile */}
                <Bone className="h-10 w-10 shrink-0 rounded-xl bg-primary/10" />

                <div className="space-y-1.5">
                  {/* "Your Goals" */}
                  <Bone className="h-5 w-28 bg-muted" />
                  {/* "N goals" */}
                  <Bone className="h-3 w-20 bg-muted/70" />
                </div>
              </div>

              {/* "New Goal" button — collapses to "Add" below sm */}
              <Bone className="h-9 w-20 shrink-0 rounded-xl bg-muted sm:w-32" />
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border bg-background"
                >
                  <div className="p-4 sm:p-5">
                    {/* Goal heading: icon + name + amount + delete */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          {/* Target icon tile */}
                          <Bone className="h-9 w-9 shrink-0 rounded-xl bg-primary/10" />
                          {/* Goal name */}
                          <Bone className="h-4 w-32 bg-muted" />
                        </div>

                        {/* "₱X of ₱Y" */}
                        <Bone className="h-6 w-40 bg-muted sm:h-7 sm:w-48" />
                      </div>

                      {/* Delete button */}
                      <Bone className="h-9 w-9 shrink-0 rounded-xl bg-muted" />
                    </div>

                    {/* Progress label + bar */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        {/* "Progress" */}
                        <Bone className="h-3 w-16 bg-muted/70" />
                        {/* "NN%" */}
                        <Bone className="h-3 w-10 bg-muted" />
                      </div>

                      <Bone className="h-2.5 w-full rounded-full bg-muted" />
                    </div>

                    {/* Stats grid: Remaining / Target / Deadline */}
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <div className="space-y-2 rounded-xl bg-muted/40 px-3 py-2.5">
                        <Bone className="h-2.5 w-16 bg-muted-foreground/20" />
                        <Bone className="h-3.5 w-20 bg-muted" />
                      </div>

                      <div className="space-y-2 rounded-xl bg-muted/40 px-3 py-2.5">
                        <Bone className="h-2.5 w-12 bg-muted-foreground/20" />
                        <Bone className="h-3.5 w-20 bg-muted" />
                      </div>

                      <div className="col-span-2 space-y-2 rounded-xl bg-muted/40 px-3 py-2.5 sm:col-span-1">
                        <Bone className="h-2.5 w-14 bg-muted-foreground/20" />
                        <Bone className="h-3.5 w-24 bg-muted" />
                      </div>
                    </div>

                    {/* Allocation section */}
                    <div className="mt-4 border-t pt-4">
                      <div className="mb-2.5 flex items-center justify-between gap-2">
                        <div className="space-y-1.5">
                          {/* "Add to this goal" */}
                          <Bone className="h-3.5 w-32 bg-muted" />
                          {/* "Available: ₱X" */}
                          <Bone className="h-3 w-40 bg-muted/70" />
                        </div>

                        {/* "Need ₱X" — hidden below sm */}
                        <Bone className="hidden h-3 w-24 bg-muted/70 sm:block" />
                      </div>

                      {/* Input + Add savings button */}
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Bone className="h-11 flex-1 rounded-xl bg-muted" />
                        <Bone className="h-11 w-full rounded-xl bg-muted sm:w-[130px]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}