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
  const [isRecordingRemainder, setIsRecordingRemainder] = useState(false)

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
   *
   * The key prevents this component from recording the exact same
   * remainder more than once during the current browser session.
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

        /*
         * Get the latest saved amount from the database.
         * This prevents using an outdated prop value.
         */
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

        setTotalSaved(Number(updatedProfile.total_saved_amount || 0))
        setSavedDraft(
          String(Number(updatedProfile.total_saved_amount || 0))
        )

        /*
         * Mark this exact remainder as recorded for this session.
         */
        sessionStorage.setItem(remainderKey, 'true')

        router.refresh()
      } catch (error) {
        console.error('Failed to record budget remainder:', error)
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
      const amount = Number(profile?.total_saved_amount || 0)

      setTotalSaved(amount)
      setSavedDraft(String(amount))
    }
  }, [profile?.total_saved_amount, remainder])

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
      alert('You cannot allocate more than your total saved amount')
      return
    }

    const currentAmount = Number(goal.current_amount || 0)
    const targetAmount = Number(goal.target_amount || 0)

    if (currentAmount >= targetAmount) {
      alert('This goal is already complete')
      return
    }

    const remainingGoalAmount = targetAmount - currentAmount

    if (amount > remainingGoalAmount) {
      alert(
        `You only need ₱${remainingGoalAmount.toLocaleString(
          'en-PH',
          {
            minimumFractionDigits: 2,
          }
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

      /*
       * Add the money to the goal.
       */
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

      /*
       * Remove the allocated amount from available savings.
       */
      const nextTotal = totalSaved - amount

      const { data: updatedProfile, error: profileError } =
        await supabase
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

  const handleAddGoal = async (e: React.FormEvent) => {
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
    <div className="space-y-6">
      {/* AVAILABLE SAVINGS */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <PiggyBank className="h-6 w-6 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Available savings
              </p>

              <p className="text-3xl font-bold">
                ₱
                {totalSaved.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                })}
              </p>

              <p className="text-xs text-muted-foreground">
                Allocate this amount toward your goals
              </p>

              {isRecordingRemainder && (
                <p className="mt-1 text-xs text-primary">
                  Adding previous budget remainder...
                </p>
              )}

              {remainder > 0 && !isRecordingRemainder && (
                <p className="mt-1 text-xs text-primary">
                  ₱
                  {remainder.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  from your previous budget was added to savings
                </p>
              )}
            </div>
          </div>

          {isEditingSaved ? (
            <div className="flex items-center gap-2">
              <Input
                aria-label="Total saved amount"
                type="number"
                min="0"
                step="0.01"
                value={savedDraft}
                onChange={(e) =>
                  setSavedDraft(e.target.value)
                }
                className="w-36"
                disabled={isLoading}
              />

              <Button
                size="icon"
                onClick={handleSaveTotal}
                disabled={isLoading}
              >
                <Check className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setSavedDraft(String(totalSaved))
                  setIsEditingSaved(false)
                }}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditingSaved(true)}
              disabled={isRecordingRemainder}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit total
            </Button>
          )}
        </CardContent>
      </Card>

      {/* GOALS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Goals</CardTitle>

          {!isAdding && (
            <Button
              size="sm"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {/* ADD GOAL FORM */}
          {isAdding && (
            <form
              onSubmit={handleAddGoal}
              className="mb-6 space-y-4 rounded-lg bg-muted p-4"
            >
              <div>
                <Label htmlFor="goal-name">
                  Goal Name
                </Label>

                <Input
                  id="goal-name"
                  placeholder="e.g., Vacation Fund"
                  value={newGoal.name}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      name: e.target.value,
                    })
                  }
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="goal-current">
                    Current Amount
                  </Label>

                  <Input
                    id="goal-current"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newGoal.current}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        current: e.target.value,
                      })
                    }
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="goal-target">
                    Target Amount
                  </Label>

                  <Input
                    id="goal-target"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="1000.00"
                    value={newGoal.target}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        target: e.target.value,
                      })
                    }
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="goal-deadline">
                    Deadline (optional)
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
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !newGoal.name ||
                    !newGoal.target
                  }
                >
                  Add Goal
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* EMPTY STATE */}
          {goals.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No goals yet. Start saving towards something!
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const current = Number(
                  goal.current_amount || 0
                )

                const target = Number(
                  goal.target_amount || 0
                )

                const progress =
                  target > 0
                    ? (current / target) * 100
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

                const remaining =
                  Math.max(target - current, 0)

                return (
                  <div
                    key={goal.id}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {goal.name}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          ₱{current.toFixed(2)} / ₱
                          {target.toFixed(2)}
                        </p>

                        {goal.deadline && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {daysLeft !== null &&
                            daysLeft > 0
                              ? `${daysLeft} days left`
                              : daysLeft === 0
                                ? 'Due today'
                                : 'Deadline passed'}
                          </p>
                        )}
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleDeleteGoal(goal.id)
                        }
                        aria-label={`Delete ${goal.name}`}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Progress
                      value={Math.min(100, progress)}
                    />

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        aria-label={`Amount to add to ${goal.name}`}
                        type="number"
                        min="0.01"
                        max={Math.min(
                          totalSaved,
                          remaining
                        )}
                        step="0.01"
                        placeholder="Amount to allocate"
                        value={
                          allocationDraft[goal.id] || ''
                        }
                        onChange={(e) =>
                          setAllocationDraft({
                            ...allocationDraft,
                            [goal.id]: e.target.value,
                          })
                        }
                        disabled={
                          isLoading ||
                          totalSaved <= 0 ||
                          remaining <= 0
                        }
                      />

                      <Button
                        onClick={() =>
                          handleAllocate(goal)
                        }
                        disabled={
                          isLoading ||
                          totalSaved <= 0 ||
                          remaining <= 0
                        }
                      >
                        {remaining <= 0
                          ? 'Goal Complete'
                          : 'Add to goal'}
                      </Button>
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