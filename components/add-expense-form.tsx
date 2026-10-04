'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Loader2,
  Send,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { AIExtractionPreview } from './ai-extraction-preview'

import AILoader from '@/components/ui/ai-loader'
import AILoaderBackground from './ui/ai-loader-background'

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
  const [step, setStep] = useState<'input' | 'preview' | 'manual'>(
    'input'
  )

  const [input, setInput] = useState('')
  const [isParsingNLP, setIsParsingNLP] = useState(false)
  const [parsedExpense, setParsedExpense] =
    useState<ParsedExpense | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    onPreviewChange?.(step === 'preview')
  }, [step, onPreviewChange])

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
        date:
          data.expense.date ||
          new Date().toISOString(),
      }

      setParsedExpense(expense)

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
    const expenseToSave: ParsedExpense = updatedExpense
      ? updatedExpense
      : {
          amount: parseFloat(amount),
          category,
          description,
          merchant,
          date,
        }

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
  // AI LOADING
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
        onConfirm={(updatedExpense) => {
          handleSubmit(updatedExpense)
        }}
        isLoading={isSaving}
      />
    )
  }

  // ============================================
  // INPUT UI
  // ============================================

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-0">

      {/* Header */}
      <div className="text-center mb-6 md:mb-8">

        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-primary/10 border border-primary/10 text-primary text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          AI Expense Tracking
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          What did you spend on?
        </h2>

        <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
          Just describe your expense naturally. Xpnd AI will
          automatically extract the amount, category, and details.
        </p>

      </div>

      {/* Main Input Card */}
      <Card className="overflow-hidden border-primary/10 shadow-sm">

        <CardContent className="p-4 sm:p-6 md:p-7">

          <form
            onSubmit={handleSubmitInput}
            className="space-y-4"
          >

            {/* Textarea container */}
            <div className="relative">

              <textarea
                autoFocus
                placeholder="e.g. Spent 150 pesos for lunch"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setError('')
                }}
                disabled={isParsingNLP}
                maxLength={500}
                rows={5}
                className="
                  w-full
                  min-h-[150px]
                  md:min-h-[180px]
                  resize-none
                  rounded-2xl
                  border
                  border-border
                  bg-muted/40
                  px-4
                  py-4
                  pb-10
                  text-base
                  leading-relaxed
                  placeholder:text-muted-foreground/60
                  transition-all
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primary/20
                  focus:border-primary/40
                  focus:bg-background
                  disabled:opacity-60
                "
              />

              {/* Character count */}
              <div className="absolute bottom-3 right-4 text-[11px] text-muted-foreground">
                {input.length}/500
              </div>

            </div>

            {/* Bottom action row */}
            <div className="flex items-center justify-between gap-3">

              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI will analyze your expense</span>
              </div>

              <Button
                type="submit"
                disabled={
                  isParsingNLP ||
                  !input.trim()
                }
                size="lg"
                className="
                  ml-auto
                  rounded-xl
                  px-5
                  gap-2
                  shadow-sm
                  transition-all
                  hover:shadow-md
                "
              >
                {isParsingNLP ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Expense
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

            </div>

          </form>

        </CardContent>

      </Card>

      {/* Examples */}
      <div className="mt-6">

        <div className="flex items-center justify-between mb-3">

          <div>
            <p className="text-sm font-medium">
              Try an example
            </p>

            <p className="text-xs text-muted-foreground mt-0.5">
              Click one to use it
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

          {EXAMPLE_EXPENSES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setInput(example)
                setError('')
              }}
              className="
                group
                flex
                items-center
                justify-between
                gap-3
                text-left
                px-3.5
                py-3
                rounded-xl
                border
                border-border/60
                bg-muted/30
                text-sm
                transition-all
                hover:bg-muted
                hover:border-primary/20
                hover:-translate-y-[1px]
              "
            >

              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                {example}
              </span>

              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50 group-hover:text-primary transition-colors" />

            </button>
          ))}

        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3.5">

          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">

            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />

          </div>

          <div className="min-w-0">

            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              Something went wrong
            </p>

            <p className="mt-0.5 text-xs text-red-700 dark:text-red-300 break-words">
              {error}
            </p>

          </div>

        </div>
      )}

      {/* Small helper text */}
      <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
        Example: “Spent 150 pesos for lunch at Jollibee”
      </p>

    </div>
  )
}