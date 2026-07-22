'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Trash2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface GoalsListProps {
  goals: any[]
}

export function GoalsList({ goals }: GoalsListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    current: '',
    deadline: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoal.name || !newGoal.target) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('savings_goals').insert({
        user_id: user.id,
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target),
        current_amount: parseFloat(newGoal.current) || 0,
        deadline: newGoal.deadline || null,
      })

      if (error) throw error
      setNewGoal({ name: '', target: '', current: '', deadline: '' })
      setIsAdding(false)
      router.refresh()
    } catch (error) {
      alert('Failed to add goal')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Delete this goal?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('savings_goals').delete().eq('id', id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      alert('Failed to delete goal')
    }
  }

  const handleUpdateProgress = async (id: string, currentAmount: number) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('savings_goals')
        .update({ current_amount: currentAmount })
        .eq('id', id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      alert('Failed to update goal')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Goals</CardTitle>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleAddGoal} className="mb-6 p-4 bg-muted rounded-lg space-y-4">
              <div>
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g., Vacation Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="goal-current">Current Amount</Label>
                  <Input
                    id="goal-current"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newGoal.current}
                    onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-target">Target Amount</Label>
                  <Input
                    id="goal-target"
                    type="number"
                    step="0.01"
                    placeholder="1000.00"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-deadline">Deadline (optional)</Label>
                  <Input
                    id="goal-deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    disabled={isLoading}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || !newGoal.name || !newGoal.target}>
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

          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No goals yet. Start saving towards something!
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = (parseFloat(goal.current_amount || 0) / parseFloat(goal.target_amount)) * 100
                const daysLeft =
                  goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

                return (
                  <div key={goal.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${parseFloat(goal.current_amount || 0).toFixed(2)} / $
                          {parseFloat(goal.target_amount).toFixed(2)}
                        </p>
                        {goal.deadline && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {daysLeft && daysLeft > 0
                              ? `${daysLeft} days left`
                              : daysLeft === 0
                                ? 'Due today'
                                : 'Deadline passed'}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Progress value={Math.min(100, progress)} />
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
