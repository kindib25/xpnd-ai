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

// ---------------------------------------------------------------------------
// Glass tokens — shared recipe so the material can't drift
// ---------------------------------------------------------------------------
const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4b5fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#13161a]'

const HAIRLINE =
  'pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70'

const GLASS_SURFACE_DEEP =
  'relative overflow-hidden rounded-[26px] border border-white/[0.14] bg-[#151922]/70 backdrop-blur-2xl ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-35px_rgba(0,0,0,0.85)]'

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
    <>
      {/* =========================================================
          AMBIENT BACKGROUND — fixed, full-viewport, out of content flow.
          Colour orbs give the backdrop-blur something real to bite on.
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

        {/* Lime orb — primary accent, upper-left */}
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#9ee82d]/[0.14] blur-[130px]" />

        {/* Violet orb — brand purple, right */}
        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-[#724bf6]/[0.20] blur-[140px]" />

        {/* Sky/cyan counterweight, bottom */}
        <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/[0.10] blur-[140px]" />
      </div>

      <div className="relative w-full max-w-3xl mx-auto px-3 sm:px-0 text-white">

        {/* Header */}
        <div className="text-center mb-6 md:mb-8">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full border border-[#9ee82d]/25 bg-[#9ee82d]/[0.08] text-[#c8ff75] text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl">
            <Sparkles className="w-3.5 h-3.5" />
            AI Expense Tracking
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            What did you spend on?
          </h2>

          <p className="mt-2 text-sm md:text-base text-white/55 max-w-lg mx-auto">
            Just describe your expense naturally. Xpnd AI will
            automatically extract the amount, category, and details.
          </p>

        </div>

        {/* Main Input Card — glass hero */}
        <Card className={GLASS_SURFACE_DEEP}>
          <div aria-hidden="true" className={HAIRLINE} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#9ee82d]/12 blur-3xl"
          />

          <CardContent className="relative z-10 p-4 sm:p-6 md:p-7">

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
                    border border-white/[0.14]
                    bg-white/[0.045]
                    px-4
                    py-4
                    pb-10
                    text-base
                    leading-relaxed
                    text-white
                    placeholder:text-white/35
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                    backdrop-blur-xl
                    transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    hover:border-white/[0.20] hover:bg-white/[0.06]
                    focus:outline-none
                    focus:border-[#9ee82d]/50
                    focus:bg-white/[0.06]
                    focus:ring-2
                    focus:ring-[#9ee82d]/25
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />

                {/* Character count */}
                <div className="absolute bottom-3 right-4 text-[11px] tabular-nums text-white/45">
                  {input.length}/500
                </div>

              </div>

              {/* Bottom action row */}
              <div className="flex items-center justify-between gap-3">

                <div className="hidden sm:flex items-center gap-2 text-xs text-white/55">
                  <Sparkles className="w-3.5 h-3.5 text-[#9ee82d]/80" />
                  <span>AI will analyze your expense</span>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isParsingNLP ||
                    !input.trim()
                  }
                  size="lg"
                  className={`
                    ${FOCUS_RING}
                    ml-auto
                    h-11 md:h-12
                    rounded-xl
                    border border-[#9ee82d]/30
                    bg-gradient-to-r from-[#9ee82d] to-[#c8ff75]
                    px-5
                    gap-2
                    text-sm font-semibold text-[#17200a]
                    shadow-[0_0_18px_-6px_rgba(158,232,45,0.65)]
                    transition-[transform,box-shadow] duration-300 ${EASE}
                    hover:scale-[1.02]
                    hover:shadow-[0_0_24px_-6px_rgba(158,232,45,0.85)]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    disabled:hover:scale-100
                  `}
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
              <p className="text-sm font-medium text-white/90">
                Try an example
              </p>

              <p className="text-xs text-white/50 mt-0.5">
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
                className={`
                  ${FOCUS_RING}
                  group
                  relative
                  flex
                  items-center
                  justify-between
                  gap-3
                  overflow-hidden
                  text-left
                  px-3.5
                  py-3
                  rounded-xl
                  border border-white/[0.14]
                  bg-white/[0.045]
                  text-sm
                  text-white/75
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                  backdrop-blur-xl
                  transition-[background-color,border-color,color,transform,box-shadow] duration-300 ${EASE}
                  hover:-translate-y-[1px]
                  hover:border-[#9ee82d]/30
                  hover:bg-white/[0.075]
                  hover:text-white
                  hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_12px_30px_-18px_rgba(158,232,45,0.55)]
                `}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-70"
                />

                <span className="relative transition-colors">
                  {example}
                </span>

                <ArrowRight className="relative w-3.5 h-3.5 shrink-0 text-white/40 transition-colors group-hover:text-[#c8ff75]" />

              </button>
            ))}

          </div>

        </div>

        {/* Error — red glass */}
        {error && (
          <div className="relative mt-5 flex items-start gap-3 overflow-hidden rounded-xl border border-red-400/30 bg-red-500/[0.10] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-red-300/50 to-transparent opacity-70"
            />

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-400/30 bg-red-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
              <AlertCircle className="w-4 h-4 text-red-300" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-red-100">
                Something went wrong
              </p>

              <p className="mt-0.5 text-xs text-red-200/85 break-words">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* Small helper text */}
        <p className="text-center text-[11px] text-white/45 mt-6">
          Example: “Spent 150 pesos for lunch at Jollibee”
        </p>

      </div>
    </>
  )
}