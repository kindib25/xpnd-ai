'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Send, AlertCircle } from 'lucide-react'
import { AIExtractionPreview } from './ai-extraction-preview'

import AILoader from '@/components/ui/ai-loader'
import AILoaderBackground from './ui/ai-loader-background'

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
  'Paid electricity bill 3000',
  'Taxi ride to airport 500',
  'Coffee at Starbucks 150',
  'Bought a new book for 400',
]

interface ParsedExpense {
  amount: number
  category: string
  description: string
  merchant: string
  date: string
}

interface AddExpenseFormProps {
  onLoadingChange?: (loading: boolean) => void
  onPreviewChange?: (preview: boolean) => void
}

export function AddExpenseForm({
  onLoadingChange,
  onPreviewChange,
}: AddExpenseFormProps) {
  const [step, setStep] = useState<'input' | 'preview' | 'manual'>('input')
  const [input, setInput] = useState('')
  const [isParsingNLP, setIsParsingNLP] = useState(false)
  const [parsedExpense, setParsedExpense] =
    useState<ParsedExpense | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    onPreviewChange?.(step === 'preview')
  }, [step, onPreviewChange])

  // Form state
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [merchant, setMerchant] = useState('')
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [isSaving, setIsSaving] = useState(false)

  const router = useRouter()

  // ============================================
  // NLP PARSING
  // ============================================

  const handleParseExpense = async (text: string) => {
    if (!text.trim()) return

    setIsParsingNLP(true)
    onLoadingChange?.(true)
    setError('')

    try {
      const response = await fetch('/api/parse-expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(
          errorData.error || 'Failed to parse expense'
        )
      }

      const data = await response.json()

      const expense: ParsedExpense = {
        amount: Number(data.expense.amount),
        category: data.expense.category || '',
        description: data.expense.description || '',
        merchant: data.expense.merchant || '',
        date: data.expense.date || new Date().toISOString(),
      }

      // Store parsed expense
      setParsedExpense(expense)

      // Store values in form state as well
      setAmount(expense.amount.toString())
      setCategory(expense.category)
      setDescription(expense.description)
      setMerchant(expense.merchant)
      setDate(expense.date)

      setStep('preview')
      onPreviewChange?.(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to parse expense'
      )
    } finally {
      setIsParsingNLP(false)
      onLoadingChange?.(false)
    }
  }

  const handleSubmitInput = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    await handleParseExpense(input)
  }

  // ============================================
  // SAVE EXPENSE
  // ============================================

  const handleSubmit = async (
    updatedExpense?: ParsedExpense
  ) => {
    /*
      If the preview sends an edited expense,
      use that.

      Otherwise use the current form state.
    */

    const expenseToSave: ParsedExpense = updatedExpense
      ? updatedExpense
      : {
          amount: parseFloat(amount),
          category,
          description,
          merchant,
          date,
        }

    // Validate
    if (
      !expenseToSave.amount ||
      !expenseToSave.category ||
      !expenseToSave.date
    ) {
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

      if (!user) {
        throw new Error('Not authenticated')
      }

      // Save the UPDATED expense
      const { error: insertError } =
        await supabase.from('expenses').insert({
          user_id: user.id,
          amount: expenseToSave.amount,
          category: expenseToSave.category,
          description:
            expenseToSave.description || null,
          merchant:
            expenseToSave.merchant || null,
          date: expenseToSave.date,
        })

      if (insertError) {
        throw insertError
      }

      // Reset form
      setInput('')
      setParsedExpense(null)

      setAmount('')
      setCategory('')
      setDescription('')
      setMerchant('')

      setDate(
        new Date().toISOString().split('T')[0]
      )

      setStep('input')
      onPreviewChange?.(false)

      // Go back to dashboard
      router.push('/dashboard')
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to save expense'

      console.error(
        '[v0] Error saving expense:',
        err
      )

      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================
  // NLP LOADING SCREEN
  // ============================================

  if (isParsingNLP) {
    return (
      <>
        <AILoaderBackground />

        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <AILoader />
        </div>
      </>
    )
  }

  // ============================================
  // AI EXTRACTION PREVIEW
  // ============================================

  if (step === 'preview' && parsedExpense) {
    return (
      <AIExtractionPreview
        expense={parsedExpense}

        onEdit={() => {
          setStep('input')
          onPreviewChange?.(false)
        }}

        /*
          IMPORTANT:
          Receive the edited expense from
          AIExtractionPreview and save it.
        */
        onConfirm={(updatedExpense) => {
          handleSubmit(updatedExpense)
        }}

        isLoading={isSaving}
      />
    )
  }

  // ============================================
  // NLP INPUT
  // ============================================

  return (
    <div className="w-full space-y-4 md:space-y-6 max-w-2xl mx-auto">

      <Card className="border-primary/10">
        <CardContent className="pt-6 md:pt-8 pb-6 md:pb-6">

          <form
            onSubmit={handleSubmitInput}
            className="space-y-4 md:space-y-6"
          >

            {/* Input */}
            <div>
              <label className="block text-sm md:text-base font-medium mb-2 md:mb-3">
                What did you spend on?
              </label>

              <textarea
                placeholder="Describe your expense..."
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                disabled={isParsingNLP}
                className="w-full p-3 md:p-4 bg-muted rounded-lg border-0 text-base md:text-lg placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">

              <Button
                type="submit"
                disabled={
                  isParsingNLP ||
                  !input.trim()
                }
                size="lg"
                className="rounded-full w-12 h-12 p-0 flex items-center justify-center cursor-pointer"
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

      {/* Examples */}
      <div>

        <p className="text-xs md:text-sm text-muted-foreground font-medium mb-2 md:mb-3">
          Examples
        </p>

        <div className="grid grid-cols-2 gap-2">

          {EXAMPLE_EXPENSES.map((example) => (
            <div
              key={example}
              className="p-2 md:p-3 text-xs md:text-sm bg-muted rounded-2xl text-left border border-transparent"
            >
              {example}
            </div>
          ))}

        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">

          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />

          <div>
            <p className="text-xs md:text-sm font-medium text-red-900 dark:text-red-100">
              {error}
            </p>
          </div>

        </div>
      )}

    </div>
  )
}
