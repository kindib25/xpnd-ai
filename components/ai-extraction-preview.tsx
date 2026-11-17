'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Edit2,
  Check,
  ChevronDown,
  Sparkles,
  CalendarDays,
  Store,
  FileText,
  Tag,
  Wallet,
} from 'lucide-react'

interface ParsedExpense {
  amount: number
  category: string
  description: string
  merchant: string
  date: string
}

interface AIExtractionPreviewProps {
  expense: ParsedExpense
  onConfirm: (updatedExpense?: ParsedExpense) => void
  onEdit: () => void
  isLoading?: boolean
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Utilities',
  'Personal Care',
  'Other',
]

const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'

const HAIRLINE =
  'pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40'

const INPUT_GLASS =
  'min-h-[44px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground ' +
  'shadow-sm backdrop-blur-xl ' +
  'transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
  'hover:bg-foreground/[0.02] ' +
  'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white dark:placeholder:text-white/35 ' +
  'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:hover:border-white/[0.20] dark:hover:bg-white/[0.06]'

export function AIExtractionPreview({
  expense,
  onConfirm,
  onEdit,
  isLoading = false,
}: AIExtractionPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedExpense, setEditedExpense] = useState<ParsedExpense>(expense)

  const formatDate = (dateStr: string) => {
    try {
      const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
      const date = dateOnlyMatch
        ? new Date(
            Number(dateOnlyMatch[1]),
            Number(dateOnlyMatch[2]) - 1,
            Number(dateOnlyMatch[3])
          )
        : new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const toDateInputValue = (dateStr: string) => {
    try {
      const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
      if (dateOnlyMatch) return dateStr
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ''
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch {
      return ''
    }
  }

  const updateField = (field: keyof ParsedExpense, value: string | number) => {
    setEditedExpense((prev) => ({ ...prev, [field]: value }))
  }

  const handleEdit = () => {
    setEditedExpense(expense)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditedExpense(expense)
    setIsEditing(false)
  }

  const handleSaveEdit = () => setIsEditing(false)

  const handleConfirm = () => onConfirm(editedExpense)

  return (
    <>
      {/* AMBIENT BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-background transition-colors duration-500 dark:bg-[radial-gradient(120%_120%_at_50%_0%,#30333a_0%,#1a1d22_42%,#13161a_72%,#0f1115_100%)]" />
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/15" />
        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-primary/5 blur-[140px] dark:bg-primary/10" />
        <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/10 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-2xl mx-auto px-3 sm:px-5 md:px-0 pb-[calc(var(--mobile-nav-h,72px)+2rem)] md:pb-8 text-foreground">
        {/* Header */}
        <div className="pt-2 sm:pt-4 md:pt-6 mb-5 md:mb-7">
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={isEditing ? handleCancelEdit : onEdit}
              aria-label="Go back"
              className={`${FOCUS_RING} absolute left-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground/75 shadow-sm backdrop-blur-xl transition-all duration-300 ${EASE} hover:-translate-y-0.5 hover:bg-foreground/5 hover:text-foreground active:scale-95 dark:border-white/[0.14] dark:bg-white/[0.055] dark:text-white/75 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] dark:hover:border-white/[0.24] dark:hover:bg-white/[0.10] dark:hover:text-white`}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="px-12 text-center">
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl md:text-2xl dark:text-white">
                {isEditing ? 'Edit Expense' : 'Review Expense'}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm dark:text-white/55">
                {isEditing ? 'Make corrections before saving' : 'Check what AI extracted'}
              </p>
            </div>
          </div>
        </div>

        {/* AI Status banner */}
        {!isEditing && (
          <div className="relative mb-4 flex items-center gap-3 overflow-hidden rounded-2xl border border-primary/25 bg-primary/10 px-3.5 py-3 shadow-sm backdrop-blur-xl sm:px-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            />
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground dark:text-white/95">
                AI extraction complete
              </p>
              <p className="text-[11px] text-muted-foreground sm:text-xs dark:text-white/55">
                Review the details before saving
              </p>
            </div>
          </div>
        )}

        {/* Expense Card */}
        <Card className="relative overflow-hidden rounded-[26px] border border-border bg-card text-card-foreground shadow-sm backdrop-blur-2xl dark:border-white/[0.14] dark:bg-[#151922]/70 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-35px_rgba(0,0,0,0.85)]">
          <div aria-hidden="true" className={HAIRLINE} />
          <CardContent className="relative z-10 p-0">
            {/* Amount */}
            <div className="relative overflow-hidden px-4 py-6 sm:px-6 sm:py-7 md:px-7 md:py-9">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/15 blur-3xl"
              />
              <div className="relative">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 shadow-sm">
                    <Wallet className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs dark:text-white/55">
                    Amount
                  </span>
                </div>

                {isEditing ? (
                  <div className="flex max-w-full items-center gap-2">
                    <span className="text-2xl font-semibold text-foreground/90 sm:text-3xl dark:text-white/90">
                      ₱
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={editedExpense.amount}
                      onChange={(e) => updateField('amount', Number(e.target.value))}
                      className="min-w-0 w-full border-b-2 border-primary/50 bg-transparent px-0 py-1 text-3xl font-bold text-foreground outline-none tabular-nums transition-[border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-primary sm:text-4xl dark:text-white"
                    />
                  </div>
                ) : (
                  <p className="break-words text-4xl font-bold tracking-tight text-foreground tabular-nums sm:text-5xl dark:text-white">
                    ₱{editedExpense.amount.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="divide-y divide-border dark:divide-white/[0.06]">
              {/* Category */}
              <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 shadow-sm backdrop-blur-xl sm:h-10 sm:w-10 dark:border-white/[0.10] dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <Tag className="h-4 w-4 text-muted-foreground dark:text-white/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] font-medium text-muted-foreground sm:text-xs dark:text-white/50">
                    Category
                  </p>
                  {isEditing ? (
                    <div className="relative">
                      <select
                        value={editedExpense.category}
                        onChange={(e) => updateField('category', e.target.value)}
                        className={`${INPUT_GLASS} min-h-[44px] appearance-none pr-10 [&>option]:bg-card [&>option]:text-card-foreground`}
                      >
                        {EXPENSE_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-white/55" />
                    </div>
                  ) : (
                    <p className="truncate text-sm font-semibold text-foreground sm:text-base dark:text-white/95">
                      {editedExpense.category || '—'}
                    </p>
                  )}
                </div>
              </div>

              {/* Merchant */}
              <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 shadow-sm backdrop-blur-xl sm:h-10 sm:w-10 dark:border-white/[0.10] dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <Store className="h-4 w-4 text-muted-foreground dark:text-white/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] font-medium text-muted-foreground sm:text-xs dark:text-white/50">
                    Merchant
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedExpense.merchant}
                      onChange={(e) => updateField('merchant', e.target.value)}
                      placeholder="Enter merchant"
                      className={INPUT_GLASS}
                    />
                  ) : (
                    <p className="truncate text-sm font-semibold text-foreground sm:text-base dark:text-white/95">
                      {editedExpense.merchant || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 shadow-sm backdrop-blur-xl sm:h-10 sm:w-10 dark:border-white/[0.10] dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <FileText className="h-4 w-4 text-muted-foreground dark:text-white/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] font-medium text-muted-foreground sm:text-xs dark:text-white/50">
                    Description
                  </p>
                  {isEditing ? (
                    <textarea
                      value={editedExpense.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Enter description"
                      rows={3}
                      className={`${INPUT_GLASS} min-h-[90px] resize-none py-2.5`}
                    />
                  ) : (
                    <p className="break-words text-sm font-semibold leading-relaxed text-foreground sm:text-base dark:text-white/95">
                      {editedExpense.description || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 shadow-sm backdrop-blur-xl sm:h-10 sm:w-10 dark:border-white/[0.10] dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <CalendarDays className="h-4 w-4 text-muted-foreground dark:text-white/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] font-medium text-muted-foreground sm:text-xs dark:text-white/50">
                    Date
                  </p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={toDateInputValue(editedExpense.date)}
                      onChange={(e) => updateField('date', e.target.value)}
                      className={`${INPUT_GLASS} [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100`}
                    />
                  ) : (
                    <p className="text-sm font-semibold text-foreground sm:text-base dark:text-white/95">
                      {formatDate(editedExpense.date)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helper */}
        {!isEditing && (
          <div className="mt-4 px-3 text-center">
            <p className="text-[11px] text-muted-foreground sm:text-xs dark:text-white/55">
              Check the extracted details. You can edit anything before saving.
            </p>
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className={`${FOCUS_RING} h-11 rounded-xl border border-border bg-background text-sm font-medium text-foreground shadow-sm backdrop-blur-xl transition-colors duration-300 ${EASE} hover:bg-foreground/5 sm:h-12 dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-white/[0.24] dark:hover:bg-white/[0.10] dark:hover:text-white`}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveEdit}
                  className={`${FOCUS_RING} h-11 gap-2 rounded-xl border border-primary/30 bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 ${EASE} hover:scale-[1.02] hover:bg-primary/90 sm:h-12`}
                >
                  <Check className="h-4 w-4" />
                  Done
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEdit}
                  className={`${FOCUS_RING} h-11 gap-2 rounded-xl border border-border bg-background text-sm font-medium text-foreground shadow-sm backdrop-blur-xl transition-colors duration-300 ${EASE} hover:bg-foreground/5 sm:h-12 dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-white/[0.24] dark:hover:bg-white/[0.10] dark:hover:text-white`}
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`${FOCUS_RING} h-11 gap-2 rounded-xl border border-primary/30 bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 ${EASE} hover:scale-[1.02] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:h-12`}
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Expense
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}