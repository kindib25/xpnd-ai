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
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Send, AlertCircle, ArrowRight } from 'lucide-react'
import { AIExtractionPreview } from './ai-extraction-preview'

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
]

const EXAMPLE_EXPENSES = [
  'Spent 25 on jeep fare',
  'Lunch at Jollibee 200',
  'Movie ticket 250',
]

interface ParsedExpense {
  amount: number
  category: string
  description: string
  merchant: string
  date: string
}

export function AddExpenseForm() {
  const [step, setStep] = useState<'input' | 'preview' | 'manual'>('input')
  const [input, setInput] = useState('')
  const [isParsingNLP, setIsParsingNLP] = useState(false)
  const [parsedExpense, setParsedExpense] = useState<ParsedExpense | null>(null)
  const [error, setError] = useState('')

  // Manual form state
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [merchant, setMerchant] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Handle NLP parsing
  const handleParseExpense = async (text: string) => {
    if (!text.trim()) return

    setIsParsingNLP(true)
    setError('')

    try {
      const response = await fetch('/api/parse-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to parse expense')
      }

      const data = await response.json()
      setParsedExpense(data.expense)
      setAmount(data.expense.amount.toString())
      setCategory(data.expense.category || '')
      setDescription(data.expense.description || '')
      setMerchant(data.expense.merchant || '')
      // Store ISO date string from API response
      setDate(data.expense.date || new Date().toISOString())
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse expense')
    } finally {
      setIsParsingNLP(false)
    }
  }

  const handleSubmitInput = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleParseExpense(input)
  }

  const handleExampleClick = async (example: string) => {
    setInput(example)
    await handleParseExpense(example)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category || !date) {
      setError('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase.from('expenses').insert({
        user_id: user.id,
        amount: parseFloat(amount),
        category,
        description: description || null,
        merchant: merchant || null,
        date,
      })

      if (insertError) throw insertError

      // Reset form
      setInput('')
      setParsedExpense(null)
      setAmount('')
      setCategory('')
      setDescription('')
      setMerchant('')
      setDate(new Date().toISOString())
      setStep('input')

      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save expense'
      console.error('[v0] Error saving expense:', err)
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Show preview step
  if (step === 'preview' && parsedExpense) {
    return (
      <AIExtractionPreview
        expense={parsedExpense}
        onEdit={() => setStep('input')}
        onConfirm={handleSubmit}
        isLoading={isSaving}
      />
    )
  }

  return (
    <div className="w-full space-y-4 md:space-y-6 max-w-2xl mx-auto">
      {/* NLP Input Card - Main Focus */}
      <Card className="border-primary/10">
        <CardContent className="pt-6 md:pt-8 pb-6 md:pb-6">
          <form onSubmit={handleSubmitInput} className="space-y-4 md:space-y-6">
            {/* Input Section */}
            <div>
              <label className="block text-sm md:text-base font-medium mb-2 md:mb-3">What did you spend on?</label>
              <textarea
                placeholder="Spent 150 on Coffee at Starbucks |"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isParsingNLP}
                className="w-full p-3 md:p-4 bg-muted rounded-lg border-0 text-base md:text-lg placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isParsingNLP || !input.trim()}
                size="lg"
                className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
              >
                {isParsingNLP ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Examples Section */}
      <div>
        <p className="text-xs md:text-sm text-muted-foreground font-medium mb-2 md:mb-3">Examples</p>
        <div className="grid grid-cols-1 gap-2">
          {EXAMPLE_EXPENSES.map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(example)}
              disabled={isParsingNLP}
              className="p-2 md:p-3 text-xs md:text-sm bg-muted hover:bg-muted/80 disabled:opacity-50 rounded-lg text-left transition-colors border border-transparent hover:border-primary/20"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs md:text-sm font-medium text-red-900 dark:text-red-100">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
