'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Trash2, Plus, PiggyBank, Pencil, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface GoalsListProps {
  goals: any[]
  profile: { total_saved_amount?: number | string } | null
  previousBudgetRemainder?: number
}

export function GoalsList({ goals, profile, previousBudgetRemainder = 0 }: GoalsListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '', deadline: '' })
  // Previous budget remainders are recorded into profiles.total_saved_amount by the server page.
  // Keep one source of truth here so allocations are never subtracted twice.
  const baseSaved = Number(profile?.total_saved_amount || 0)
  const [totalSaved, setTotalSaved] = useState(baseSaved)
  const [savedDraft, setSavedDraft] = useState(String(baseSaved))
  const [isEditingSaved, setIsEditingSaved] = useState(false)
  const [allocationDraft, setAllocationDraft] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSaveTotal = async () => {
    const amount = Number(savedDraft)
    if (!Number.isFinite(amount) || amount < 0) return alert('Enter a valid non-negative amount')
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({ total_saved_amount: amount })
        .eq('id', user.id)
        .select('id, total_saved_amount')
        .single()
      if (error || !updatedProfile) throw error || new Error('Profile was not updated')
      setTotalSaved(amount)
      setSavedDraft(String(amount))
      setIsEditingSaved(false)
    } catch { alert('Failed to update total saved amount') } finally { setIsLoading(false) }
  }

  const handleAllocate = async (goal: any) => {
    const amount = Number(allocationDraft[goal.id])
    if (!Number.isFinite(amount) || amount <= 0) return alert('Enter an amount greater than zero')
    if (amount > totalSaved) return alert('You cannot allocate more than your total saved amount')
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error: goalError } = await supabase.from('savings_goals').update({ current_amount: Number(goal.current_amount || 0) + amount }).eq('id', goal.id).eq('user_id', user.id)
      if (goalError) throw goalError
      const nextTotal = totalSaved - amount
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({ total_saved_amount: nextTotal })
        .eq('id', user.id)
        .select('id, total_saved_amount')
        .single()
      if (profileError || !updatedProfile) throw profileError || new Error('Profile was not updated')
      setTotalSaved(nextTotal)
      setAllocationDraft((draft) => ({ ...draft, [goal.id]: '' }))
      router.refresh()
    } catch { alert('Failed to allocate savings') } finally { setIsLoading(false) }
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoal.name || !newGoal.target) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('savings_goals').insert({ user_id: user.id, name: newGoal.name, target_amount: parseFloat(newGoal.target), current_amount: parseFloat(newGoal.current) || 0, deadline: newGoal.deadline || null })
      if (error) throw error
      setNewGoal({ name: '', target: '', current: '', deadline: '' })
      setIsAdding(false)
      router.refresh()
    } catch { alert('Failed to add goal') } finally { setIsLoading(false) }
  }

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Delete this goal?')) return
    try {
      const { error } = await createClient().from('savings_goals').delete().eq('id', id)
      if (error) throw error
      router.refresh()
    } catch { alert('Failed to delete goal') }
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3"><PiggyBank className="h-6 w-6 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Available savings</p><p className="text-3xl font-bold">₱{totalSaved.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p><p className="text-xs text-muted-foreground">Allocate this amount toward your goals</p>{previousBudgetRemainder > 0 && <p className="mt-1 text-xs text-primary">Includes ₱{previousBudgetRemainder.toLocaleString('en-PH', { minimumFractionDigits: 2 })} remaining from previous monthly budgets</p>}</div>
          </div>
          {isEditingSaved ? <div className="flex items-center gap-2"><Input aria-label="Total saved amount" type="number" min="0" step="0.01" value={savedDraft} onChange={(e) => setSavedDraft(e.target.value)} className="w-36" disabled={isLoading} /><Button size="icon" onClick={handleSaveTotal} disabled={isLoading}><Check className="h-4 w-4" /></Button><Button size="icon" variant="outline" onClick={() => setIsEditingSaved(false)} disabled={isLoading}><X className="h-4 w-4" /></Button></div> : <Button variant="outline" onClick={() => setIsEditingSaved(true)}><Pencil className="mr-2 h-4 w-4" />Edit total</Button>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Your Goals</CardTitle>{!isAdding && <Button size="sm" onClick={() => setIsAdding(true)}><Plus className="mr-2 h-4 w-4" />New Goal</Button>}</CardHeader>
        <CardContent>
          {isAdding && <form onSubmit={handleAddGoal} className="mb-6 space-y-4 rounded-lg bg-muted p-4"><div><Label htmlFor="goal-name">Goal Name</Label><Input id="goal-name" placeholder="e.g., Vacation Fund" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} disabled={isLoading} className="mt-1" /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div><Label htmlFor="goal-current">Current Amount</Label><Input id="goal-current" type="number" min="0" step="0.01" placeholder="0.00" value={newGoal.current} onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })} disabled={isLoading} className="mt-1" /></div><div><Label htmlFor="goal-target">Target Amount</Label><Input id="goal-target" type="number" min="0.01" step="0.01" placeholder="1000.00" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} disabled={isLoading} className="mt-1" /></div><div><Label htmlFor="goal-deadline">Deadline (optional)</Label><Input id="goal-deadline" type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} disabled={isLoading} className="mt-1" /></div></div><div className="flex gap-2"><Button type="submit" disabled={isLoading || !newGoal.name || !newGoal.target}>Add Goal</Button><Button type="button" variant="outline" onClick={() => setIsAdding(false)} disabled={isLoading}>Cancel</Button></div></form>}
          {goals.length === 0 ? <div className="py-8 text-center text-muted-foreground">No goals yet. Start saving towards something!</div> : <div className="space-y-4">{goals.map((goal) => { const current = Number(goal.current_amount || 0); const target = Number(goal.target_amount || 0); const progress = target ? (current / target) * 100 : 0; const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000) : null; return <div key={goal.id} className="space-y-3 rounded-lg border p-4"><div className="flex items-start justify-between"><div><h3 className="font-semibold">{goal.name}</h3><p className="text-sm text-muted-foreground">₱{current.toFixed(2)} / ₱{target.toFixed(2)}</p>{goal.deadline && <p className="mt-1 text-xs text-muted-foreground">{daysLeft && daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Deadline passed'}</p>}</div><Button size="icon" variant="ghost" onClick={() => handleDeleteGoal(goal.id)} aria-label={`Delete ${goal.name}`}><Trash2 className="h-4 w-4" /></Button></div><Progress value={Math.min(100, progress)} /><div className="flex flex-col gap-2 sm:flex-row"><Input aria-label={`Amount to add to ${goal.name}`} type="number" min="0.01" max={totalSaved} step="0.01" placeholder="Amount to allocate" value={allocationDraft[goal.id] || ''} onChange={(e) => setAllocationDraft({ ...allocationDraft, [goal.id]: e.target.value })} disabled={isLoading || totalSaved <= 0} /><Button onClick={() => handleAllocate(goal)} disabled={isLoading || totalSaved <= 0}>Add to goal</Button></div></div> })}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
