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

export function AIExtractionPreview({
  expense,
  onConfirm,
  onEdit,
  isLoading = false,
}: AIExtractionPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)

  const [editedExpense, setEditedExpense] =
    useState<ParsedExpense>(expense)

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const updateField = (
    field: keyof ParsedExpense,
    value: string | number
  ) => {
    setEditedExpense((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEdit = () => {
    setEditedExpense(expense)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditedExpense(expense)
    setIsEditing(false)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
  }

  const handleConfirm = () => {
    onConfirm(editedExpense)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-5 md:px-0 pb-[120px] md:pb-8">

      {/* Header */}
      <div className="pt-2 sm:pt-4 md:pt-6 mb-5 md:mb-7">
        <div className="relative flex items-center justify-center">

          {/* Back Button */}
          <button
            type="button"
            onClick={isEditing ? handleCancelEdit : onEdit}
            aria-label="Go back"
            className="absolute left-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background transition active:scale-95 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Centered Title */}
          <div className="px-12 text-center">
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
              {isEditing ? 'Edit Expense' : 'Review Expense'}
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {isEditing
                ? 'Make corrections before saving'
                : 'Check what AI extracted'}
            </p>
          </div>

        </div>
      </div>


      {/* AI Status */}
      {!isEditing && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-3.5 py-3 sm:px-4">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium">
              AI extraction complete
            </p>

            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Review the details before saving
            </p>
          </div>

        </div>
      )}

      {/* Expense Card */}
      <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
        <CardContent className="p-0">

          {/* Amount */}
          <div className="relative overflow-hidden bg-muted/30 px-4 py-6 sm:px-6 sm:py-7 md:px-7 md:py-9">

            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative">

              <div className="mb-2 flex items-center gap-2">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-3.5 w-3.5 text-primary" />
                </div>

                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
                  Amount
                </span>

              </div>

              {isEditing ? (
                <div className="flex max-w-full items-center gap-2">

                  <span className="text-2xl font-semibold sm:text-3xl">
                    ₱
                  </span>

                  <input
                    type="number"
                    inputMode="decimal"
                    value={editedExpense.amount}
                    onChange={(e) =>
                      updateField(
                        'amount',
                        Number(e.target.value)
                      )
                    }
                    className="min-w-0 w-full border-b-2 border-primary/40 bg-transparent px-0 py-1 text-3xl font-bold outline-none focus:border-primary sm:text-4xl"
                  />

                </div>
              ) : (
                <p className="break-words text-4xl font-bold tracking-tight sm:text-5xl">
                  ₱{editedExpense.amount.toFixed(2)}
                </p>
              )}

            </div>
          </div>

          {/* Details */}
          <div className="divide-y divide-border/60">

            {/* Category */}
            <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted sm:h-10 sm:w-10">
                <Tag className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="mb-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
                  Category
                </p>

                {isEditing ? (
                  <div className="relative">

                    <select
                      value={editedExpense.category}
                      onChange={(e) =>
                        updateField(
                          'category',
                          e.target.value
                        )
                      }
                      className="min-h-[44px] w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 pr-10 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {EXPENSE_CATEGORIES.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  </div>
                ) : (
                  <p className="truncate text-sm font-semibold sm:text-base">
                    {editedExpense.category || '—'}
                  </p>
                )}

              </div>
            </div>

            {/* Merchant */}
            <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted sm:h-10 sm:w-10">
                <Store className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="mb-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
                  Merchant
                </p>

                {isEditing ? (
                  <input
                    type="text"
                    value={editedExpense.merchant}
                    onChange={(e) =>
                      updateField(
                        'merchant',
                        e.target.value
                      )
                    }
                    placeholder="Enter merchant"
                    className="min-h-[44px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <p className="truncate text-sm font-semibold sm:text-base">
                    {editedExpense.merchant || 'Not specified'}
                  </p>
                )}

              </div>
            </div>

            {/* Description */}
            <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted sm:h-10 sm:w-10">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="mb-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
                  Description
                </p>

                {isEditing ? (
                  <textarea
                    value={editedExpense.description}
                    onChange={(e) =>
                      updateField(
                        'description',
                        e.target.value
                      )
                    }
                    placeholder="Enter description"
                    rows={3}
                    className="min-h-[90px] w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <p className="break-words text-sm font-semibold leading-relaxed sm:text-base">
                    {editedExpense.description || 'Not specified'}
                  </p>
                )}

              </div>
            </div>

            {/* Date */}
            <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted sm:h-10 sm:w-10">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="mb-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
                  Date
                </p>

                <p className="text-sm font-semibold sm:text-base">
                  {formatDate(editedExpense.date)}
                </p>

              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Helper */}
      {!isEditing && (
        <div className="mt-4 px-3 text-center">
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            Check the extracted details. You can edit anything before saving.
          </p>
        </div>
      )}

      {/* Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-3 pt-3 backdrop-blur-xl md:static md:mt-6 md:border-0 md:bg-transparent md:px-0 md:pt-0 md:backdrop-blur-none">

        <div className="mx-auto max-w-2xl pb-[env(safe-area-inset-bottom)]">

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">

            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="h-11 rounded-xl text-sm font-medium sm:h-12"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveEdit}
                  className="h-11 gap-2 rounded-xl text-sm font-medium sm:h-12"
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
                  className="h-11 gap-2 rounded-xl text-sm font-medium sm:h-12"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="h-11 gap-2 rounded-xl text-sm font-medium sm:h-12"
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

    </div>
  )
}
