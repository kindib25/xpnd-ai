'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Trash2,
  Plus,
  PiggyBank,
  Pencil,
  Check,
  X,
  Target,
  CalendarDays,
  Wallet,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface GoalsListProps {
  goals: any[]
  profile: { total_saved_amount?: number | string } | null
  previousBudgetRemainder?: number
}

export function GoalsList({
  goals,
  profile,
  previousBudgetRemainder = 0,
}: GoalsListProps) {
  const router = useRouter()

  const baseSaved = Number(profile?.total_saved_amount || 0)
  const remainder = Number(previousBudgetRemainder || 0)

  const [totalSaved, setTotalSaved] = useState(baseSaved)
  const [savedDraft, setSavedDraft] = useState(String(baseSaved))

  const [isAdding, setIsAdding] = useState(false)
  const [isEditingSaved, setIsEditingSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecordingRemainder, setIsRecordingRemainder] =
    useState(false)

  const [allocationDraft, setAllocationDraft] = useState<
    Record<string, string>
  >({})

  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    current: '',
    deadline: '',
  })

  /*
   * Record the previous budget remainder into total_saved_amount.
   */
  useEffect(() => {
    if (remainder <= 0) return

    const remainderKey = `budget-remainder-recorded-${remainder}`

    if (sessionStorage.getItem(remainderKey)) {
      return
    }

    const recordRemainder = async () => {
      setIsRecordingRemainder(true)

      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('Not authenticated')
        }

        const { data: latestProfile, error: profileFetchError } =
          await supabase
            .from('profiles')
            .select('total_saved_amount')
            .eq('id', user.id)
            .single()

        if (profileFetchError) {
          throw profileFetchError
        }

        const currentSaved = Number(
          latestProfile?.total_saved_amount || 0
        )

        const newTotalSaved = currentSaved + remainder

        const { data: updatedProfile, error: updateError } =
          await supabase
            .from('profiles')
            .update({
              total_saved_amount: newTotalSaved,
            })
            .eq('id', user.id)
            .select('id, total_saved_amount')
            .single()

        if (updateError || !updatedProfile) {
          throw updateError || new Error('Profile was not updated')
        }

        setTotalSaved(
          Number(updatedProfile.total_saved_amount || 0)
        )

        setSavedDraft(
          String(Number(updatedProfile.total_saved_amount || 0))
        )

        sessionStorage.setItem(remainderKey, 'true')

        router.refresh()
      } catch (error) {
        console.error(
          'Failed to record budget remainder:',
          error
        )
      } finally {
        setIsRecordingRemainder(false)
      }
    }

    recordRemainder()
  }, [remainder, router])

  /*
   * Update local state if the profile value changes.
   */
  useEffect(() => {
    if (remainder <= 0) {
      const amount = Number(
        profile?.total_saved_amount || 0
      )

      setTotalSaved(amount)
      setSavedDraft(String(amount))
    }
  }, [profile?.total_saved_amount, remainder])

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatShortCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  const handleSaveTotal = async () => {
    const amount = Number(savedDraft)

    if (!Number.isFinite(amount) || amount < 0) {
      alert('Enter a valid non-negative amount')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          total_saved_amount: amount,
        })
        .eq('id', user.id)
        .select('id, total_saved_amount')
        .single()

      if (error || !updatedProfile) {
        throw error || new Error('Profile was not updated')
      }

      const updatedAmount = Number(
        updatedProfile.total_saved_amount || 0
      )

      setTotalSaved(updatedAmount)
      setSavedDraft(String(updatedAmount))
      setIsEditingSaved(false)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to update total saved amount')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAllocate = async (goal: any) => {
    const amount = Number(allocationDraft[goal.id])

    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Enter an amount greater than zero')
      return
    }

    if (amount > totalSaved) {
      alert(
        'You cannot allocate more than your total saved amount'
      )
      return
    }

    const currentAmount = Number(
      goal.current_amount || 0
    )

    const targetAmount = Number(
      goal.target_amount || 0
    )

    if (currentAmount >= targetAmount) {
      alert('This goal is already complete')
      return
    }

    const remainingGoalAmount =
      targetAmount - currentAmount

    if (amount > remainingGoalAmount) {
      alert(
        `You only need ${formatCurrency(
          remainingGoalAmount
        )} to complete this goal`
      )
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error: goalError } = await supabase
        .from('savings_goals')
        .update({
          current_amount: currentAmount + amount,
        })
        .eq('id', goal.id)
        .eq('user_id', user.id)

      if (goalError) {
        throw goalError
      }

      const nextTotal = totalSaved - amount

      const {
        data: updatedProfile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .update({
          total_saved_amount: nextTotal,
        })
        .eq('id', user.id)
        .select('id, total_saved_amount')
        .single()

      if (profileError || !updatedProfile) {
        throw (
          profileError ||
          new Error('Profile was not updated')
        )
      }

      const updatedAmount = Number(
        updatedProfile.total_saved_amount || 0
      )

      setTotalSaved(updatedAmount)
      setSavedDraft(String(updatedAmount))

      setAllocationDraft((draft) => ({
        ...draft,
        [goal.id]: '',
      }))

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to allocate savings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddGoal = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!newGoal.name || !newGoal.target) {
      return
    }

    const target = Number(newGoal.target)
    const current = Number(newGoal.current || 0)

    if (!Number.isFinite(target) || target <= 0) {
      alert('Enter a valid target amount')
      return
    }

    if (!Number.isFinite(current) || current < 0) {
      alert('Enter a valid current amount')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user.id,
          name: newGoal.name,
          target_amount: target,
          current_amount: current,
          deadline: newGoal.deadline || null,
        })

      if (error) {
        throw error
      }

      setNewGoal({
        name: '',
        target: '',
        current: '',
        deadline: '',
      })

      setIsAdding(false)

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to add goal')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Delete this goal?')) {
      return
    }

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to delete goal')
    }
  }

  return (
    <div className="w-full space-y-5 sm:space-y-6">

      {/* =========================================
          AVAILABLE SAVINGS
      ========================================= */}
      <Card className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-sm">
        <CardContent className="p-0">
          <div className="relative overflow-hidden">

            {/* Decorative glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative p-5 sm:p-6">

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <PiggyBank className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      Available savings
                    </p>

                    <p className="text-xs text-muted-foreground/70">
                      Money available for your goals
                    </p>
                  </div>
                </div>

                {!isEditingSaved && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-xl"
                    onClick={() =>
                      setIsEditingSaved(true)
                    }
                    disabled={isRecordingRemainder}
                    aria-label="Edit total savings"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Amount */}
              {!isEditingSaved ? (
                <div className="mt-5">
                  <p className="break-all text-3xl font-bold tracking-tight sm:text-4xl">
                    {formatCurrency(totalSaved)}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" />

                    <p className="text-xs text-muted-foreground">
                      Allocate this amount toward your goals
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  <Label htmlFor="total-saved">
                    Total saved amount
                  </Label>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="total-saved"
                      aria-label="Total saved amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={savedDraft}
                      onChange={(e) =>
                        setSavedDraft(e.target.value)
                      }
                      disabled={isLoading}
                      className="h-11 rounded-xl"
                      autoFocus
                    />

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        className="h-11 w-11 shrink-0 rounded-xl"
                        onClick={handleSaveTotal}
                        disabled={isLoading}
                        aria-label="Save amount"
                      >
                        <Check className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="h-11 w-11 shrink-0 rounded-xl"
                        onClick={() => {
                          setSavedDraft(
                            String(totalSaved)
                          )
                          setIsEditingSaved(false)
                        }}
                        disabled={isLoading}
                        aria-label="Cancel editing"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Budget remainder notice */}
              {isRecordingRemainder && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />

                  <p className="text-xs font-medium text-primary">
                    Adding previous budget remainder...
                  </p>
                </div>
              )}

              {remainder > 0 &&
                !isRecordingRemainder && (
                  <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5">
                    <p className="text-xs leading-relaxed text-primary">
                      {formatCurrency(remainder)} from
                      your previous budget was added to
                      savings.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================================
          GOALS
      ========================================= */}
      <Card className="overflow-hidden rounded-3xl border bg-card shadow-sm">

        {/* Goals header */}
        <CardHeader className="space-y-4 p-5 pb-4 sm:p-6 sm:pb-5">
          <div className="flex items-center justify-between gap-3">

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0">
                <CardTitle className="text-lg font-bold">
                  Your Goals
                </CardTitle>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {goals.length === 0
                    ? 'Start building your savings'
                    : `${goals.length} ${
                        goals.length === 1
                          ? 'goal'
                          : 'goals'
                      }`}
                </p>
              </div>
            </div>

            {!isAdding && (
              <Button
                size="sm"
                onClick={() => setIsAdding(true)}
                className="shrink-0 rounded-xl"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                <span className="hidden xs:inline sm:inline">
                  New Goal
                </span>
                <span className="xs:hidden sm:hidden">
                  Add
                </span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">

          {/* =====================================
              ADD GOAL FORM
          ===================================== */}
          {isAdding && (
            <form
              onSubmit={handleAddGoal}
              className="mb-5 overflow-hidden rounded-2xl border bg-muted/30"
            >
              <div className="border-b bg-muted/40 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />

                  <div>
                    <p className="text-sm font-semibold">
                      Create a savings goal
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Give your savings something to work toward.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 sm:p-5">

                {/* Goal name */}
                <div className="space-y-1.5">
                  <Label htmlFor="goal-name">
                    Goal name
                  </Label>

                  <Input
                    id="goal-name"
                    placeholder="e.g. Vacation Fund"
                    value={newGoal.name}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        name: e.target.value,
                      })
                    }
                    disabled={isLoading}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="space-y-1.5">
                    <Label htmlFor="goal-target">
                      Target amount
                    </Label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₱
                      </span>

                      <Input
                        id="goal-target"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="10,000"
                        value={newGoal.target}
                        onChange={(e) =>
                          setNewGoal({
                            ...newGoal,
                            target: e.target.value,
                          })
                        }
                        disabled={isLoading}
                        className="h-11 rounded-xl bg-background pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="goal-current">
                      Already saved
                    </Label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₱
                      </span>

                      <Input
                        id="goal-current"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={newGoal.current}
                        onChange={(e) =>
                          setNewGoal({
                            ...newGoal,
                            current: e.target.value,
                          })
                        }
                        disabled={isLoading}
                        className="h-11 rounded-xl bg-background pl-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <Label htmlFor="goal-deadline">
                    Deadline
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      optional
                    </span>
                  </Label>

                  <Input
                    id="goal-deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        deadline: e.target.value,
                      })
                    }
                    disabled={isLoading}
                    className="h-11 rounded-xl bg-background"
                  />
                </div>

                {/* Form buttons */}
                <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false)
                      setNewGoal({
                        name: '',
                        target: '',
                        current: '',
                        deadline: '',
                      })
                    }}
                    disabled={isLoading}
                    className="h-11 rounded-xl sm:w-auto"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      !newGoal.name ||
                      !newGoal.target
                    }
                    className="h-11 rounded-xl sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Goal
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* =====================================
              EMPTY STATE
          ===================================== */}
          {goals.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 px-5 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                No savings goals yet
              </h3>

              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Create a goal for something you want to
                save for and track your progress here.
              </p>

              {!isAdding && (
                <Button
                  size="sm"
                  className="mt-5 rounded-xl"
                  onClick={() => setIsAdding(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first goal
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => {
                const current = Number(
                  goal.current_amount || 0
                )

                const target = Number(
                  goal.target_amount || 0
                )

                const progress =
                  target > 0
                    ? Math.min(
                        100,
                        (current / target) * 100
                      )
                    : 0

                const daysLeft = goal.deadline
                  ? Math.ceil(
                      (new Date(
                        goal.deadline
                      ).getTime() -
                        Date.now()) /
                        86400000
                    )
                  : null

                const remaining = Math.max(
                  target - current,
                  0
                )

                const isComplete =
                  remaining <= 0

                const allocationValue =
                  allocationDraft[goal.id] || ''

                return (
                  <div
                    key={goal.id}
                    className="group overflow-hidden rounded-2xl border bg-background transition-colors hover:bg-muted/20"
                  >
                    <div className="p-4 sm:p-5">

                      {/* Goal heading */}
                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                              <Target className="h-4 w-4 text-primary" />
                            </div>

                            <h3 className="min-w-0 truncate text-sm font-semibold sm:text-base">
                              {goal.name}
                            </h3>
                          </div>

                          <div className="mt-3">
                            <p className="text-xl font-bold tracking-tight sm:text-2xl">
                              {formatShortCurrency(
                                current
                              )}

                              <span className="ml-1 text-sm font-normal text-muted-foreground">
                                of{' '}
                                {formatShortCurrency(
                                  target
                                )}
                              </span>
                            </p>
                          </div>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteGoal(
                              goal.id
                            )
                          }
                          aria-label={`Delete ${goal.name}`}
                          disabled={isLoading}
                          className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-muted-foreground">
                            Progress
                          </span>

                          <span className="text-xs font-bold text-primary">
                            {Math.round(progress)}%
                          </span>
                        </div>

                        <Progress
                          value={progress}
                          className="h-2.5"
                        />
                      </div>

                      {/* Stats */}
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">

                        <div className="rounded-xl bg-muted/40 px-3 py-2.5">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Remaining
                          </p>

                          <p className="mt-0.5 truncate text-sm font-semibold">
                            {formatCurrency(
                              remaining
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-muted/40 px-3 py-2.5">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Target
                          </p>

                          <p className="mt-0.5 truncate text-sm font-semibold">
                            {formatCurrency(
                              target
                            )}
                          </p>
                        </div>

                        <div className="col-span-2 rounded-xl bg-muted/40 px-3 py-2.5 sm:col-span-1">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            Deadline
                          </p>

                          <div className="mt-0.5 flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                            <p className="truncate text-sm font-semibold">
                              {!goal.deadline
                                ? 'No deadline'
                                : daysLeft === null
                                  ? 'No deadline'
                                  : daysLeft > 0
                                    ? `${daysLeft} days left`
                                    : daysLeft === 0
                                      ? 'Due today'
                                      : 'Passed'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Allocation */}
                      {!isComplete && (
                        <div className="mt-4 border-t pt-4">
                          <div className="mb-2.5 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold">
                                Add to this goal
                              </p>

                              <p className="text-xs text-muted-foreground">
                                Available:{' '}
                                {formatCurrency(
                                  totalSaved
                                )}
                              </p>
                            </div>

                            {remaining > 0 && (
                              <span className="hidden text-xs text-muted-foreground sm:block">
                                Need{' '}
                                {formatCurrency(
                                  remaining
                                )}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative flex-1">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                ₱
                              </span>

                              <Input
                                aria-label={`Amount to add to ${goal.name}`}
                                type="number"
                                min="0.01"
                                max={Math.min(
                                  totalSaved,
                                  remaining
                                )}
                                step="0.01"
                                placeholder="Enter amount"
                                value={
                                  allocationValue
                                }
                                onChange={(e) =>
                                  setAllocationDraft(
                                    (draft) => ({
                                      ...draft,
                                      [goal.id]:
                                        e.target
                                          .value,
                                    })
                                  )
                                }
                                disabled={
                                  isLoading ||
                                  totalSaved <=
                                    0
                                }
                                className="h-11 rounded-xl pl-8"
                              />
                            </div>

                            <Button
                              onClick={() =>
                                handleAllocate(
                                  goal
                                )
                              }
                              disabled={
                                isLoading ||
                                totalSaved <=
                                  0 ||
                                remaining <=
                                  0 ||
                                !allocationValue
                              }
                              className="h-11 w-full rounded-xl sm:w-auto sm:min-w-[130px]"
                            >
                              <ArrowUpRight className="mr-2 h-4 w-4" />
                              Add savings
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Completed */}
                      {isComplete && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-3.5 w-3.5 text-primary" />
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-primary">
                              Goal completed
                            </p>

                            <p className="text-[11px] text-muted-foreground">
                              You reached your savings target.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}