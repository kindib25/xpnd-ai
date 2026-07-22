'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  profile: any
  user: any
}

export function SettingsForm({ profile, user }: SettingsFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [currency, setCurrency] = useState(profile?.currency || 'USD')
  const [monthlyBudget, setMonthlyBudget] = useState(
    profile?.monthly_budget?.toString() || ''
  )
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          currency,
          monthly_budget: monthlyBudget ? parseFloat(monthlyBudget) : 0,
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      router.refresh()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed in this interface
              </p>
            </div>

            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSaving}
                className="mt-1"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded text-sm ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency} disabled={isSaving}>
                <SelectTrigger id="currency" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="monthlyBudget">Default Monthly Budget</Label>
              <Input
                id="monthlyBudget"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                disabled={isSaving}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Set a default budget for new months
              </p>
            </div>

            {message && (
              <div
                className={`p-3 rounded text-sm ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
