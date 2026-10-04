'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit2, Check, ChevronDown } from 'lucide-react'

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

  const [editedExpense, setEditedExpense] = useState<ParsedExpense>(expense)

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
    <div className="w-full space-y-4 md:space-y-6 max-w-2xl mx-auto mt-3">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="relative flex items-center justify-center h-10">
            <button
              onClick={isEditing ? handleCancelEdit : onEdit}
              className="absolute left-0 p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold">
              {isEditing ? 'Edit Expense' : 'AI Extraction Preview'}
            </h2>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {isEditing
              ? 'Update the extracted details'
              : 'Review before saving'}
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={isEditing ? handleCancelEdit : onEdit}
            className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Expense' : 'AI Extraction Preview'}
            </h2>

            <p className="text-sm text-muted-foreground">
              {isEditing
                ? 'Update the extracted details'
                : 'Review before saving'}
            </p>
          </div>
        </div>
      </div>

      {/* Extracted Details Card */}
      <Card>
        <CardContent className="pt-4 md:pt-6 space-y-3 md:space-y-4">

          {/* Amount */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-muted rounded-lg flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-muted-foreground/20 rounded opacity-50" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Amount
              </p>

              <p className="text-xl md:text-2xl font-bold mt-0.5 md:mt-1">
                ₱{editedExpense.amount.toFixed(2)}
              </p>
            </div>
          </div>

          <hr className="border-muted" />

          {/* Category */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-muted rounded-lg flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-muted-foreground/20 rounded opacity-50" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Category
              </p>

              {isEditing ? (
                <div className="relative mt-1">
                  <select
                    value={editedExpense.category}
                    onChange={(e) =>
                      updateField('category', e.target.value)
                    }
                    className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm md:text-base font-medium outline-none focus:ring-2 focus:ring-ring"
                  >
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              ) : (
                <p className="text-base md:text-lg font-semibold mt-0.5 md:mt-1 truncate">
                  {editedExpense.category}
                </p>
              )}
            </div>
          </div>

          <hr className="border-muted" />

          {/* Description */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-muted rounded-lg flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-muted-foreground/20 rounded opacity-50" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Description
              </p>

              {isEditing ? (
                <textarea
                  value={editedExpense.description}
                  onChange={(e) =>
                    updateField('description', e.target.value)
                  }
                  placeholder="Enter description"
                  rows={2}
                  className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm md:text-base font-medium outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <p className="text-base md:text-lg font-semibold mt-0.5 md:mt-1 line-clamp-2">
                  {editedExpense.description || '—'}
                </p>
              )}
            </div>
          </div>

          <hr className="border-muted" />

          {/* Merchant */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-muted rounded-lg flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-muted-foreground/20 rounded opacity-50" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Merchant
              </p>

              {isEditing ? (
                <input
                  type="text"
                  value={editedExpense.merchant}
                  onChange={(e) =>
                    updateField('merchant', e.target.value)
                  }
                  placeholder="Enter merchant"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm md:text-base font-medium outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <p className="text-base md:text-lg font-semibold mt-0.5 md:mt-1 truncate">
                  {editedExpense.merchant || '—'}
                </p>
              )}
            </div>
          </div>

          <hr className="border-muted" />

          {/* Date - Read Only */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-muted rounded-lg flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-muted-foreground/20 rounded opacity-50" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Date
              </p>

              <p className="text-base md:text-lg font-semibold mt-0.5 md:mt-1">
                {formatDate(editedExpense.date)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Note */}
      {!isEditing && (
        <p className="text-xs text-muted-foreground text-center">
          Edit details if needed
        </p>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 fixed bottom-24 md:bottom-0 left-0 right-0 md:static p-4 md:p-0 bg-background md:bg-transparent">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="font-medium text-sm md:text-base"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSaveEdit}
              className="font-medium text-sm md:text-base bg-primary hover:bg-primary/90"
            >
              <Check className="w-4 h-4 mr-2" />
              Done
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={handleEdit}
              className="font-medium text-sm md:text-base"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>

            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="font-medium text-sm md:text-base bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
