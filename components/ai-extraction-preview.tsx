'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit2 } from 'lucide-react'

interface ParsedExpense {
  amount: number
  category: string
  description: string
  merchant: string
  date: string
}

interface AIExtractionPreviewProps {
  expense: ParsedExpense
  onConfirm: () => void
  onEdit: () => void
  isLoading?: boolean
}

export function AIExtractionPreview({
  expense,
  onConfirm,
  onEdit,
  isLoading = false,
}: AIExtractionPreviewProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="w-full space-y-4 md:space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <button
          onClick={onEdit}
          className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-lg md:text-xl font-semibold">AI Extraction Preview</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Review before saving</p>
        </div>
      </div>

      {/* Extracted Details Card */}
      <Card>
        <CardContent className="pt-4 md:pt-6 space-y-3 md:space-y-4">
          {/* Amount */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-muted rounded-lg flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-primary to-primary/60 rounded opacity-20" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Amount</p>
              <p className="text-xl md:text-2xl font-bold mt-0.5 md:mt-1">₱{expense.amount.toFixed(2)}</p>
            </div>
          </div>

          <hr className="border-muted" />

          {/* Category */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-muted rounded-lg flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-accent to-accent/60 rounded opacity-20" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Category</p>
              <p className="text-base md:text-lg font-semibold mt-0.5 md:mt-1 truncate">{expense.category}</p>
            </div>
          </div>

          <hr className="border-muted" />

          {/* Description */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-muted rounded-lg flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-blue-500/60 rounded opacity-20" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Description</p>
              <p className="text-base md:text-lg font-semibold mt-0.5 md:mt-1 line-clamp-2">{expense.description || '—'}</p>
            </div>
          </div>

          <hr className="border-muted" />

          {/* Merchant */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-muted rounded-lg flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-green-500 to-green-500/60 rounded opacity-20" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Merchant</p>
              <p className="text-base md:text-lg font-semibold mt-0.5 md:mt-1 truncate">{expense.merchant || '—'}</p>
            </div>
          </div>

          <hr className="border-muted" />

          {/* Date */}
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-muted rounded-lg flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-orange-500 to-orange-500/60 rounded opacity-20" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Date</p>
              <p className="text-base md:text-lg font-semibold mt-0.5 md:mt-1">{formatDate(expense.date)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Note */}
      <p className="text-xs text-muted-foreground text-center">
        Edit details if needed
      </p>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 fixed bottom-24 md:bottom-0 left-0 right-0 md:static p-4 md:p-0 bg-background md:bg-transparent">
        <Button
          variant="outline"
          onClick={onEdit}
          className="font-medium text-sm md:text-base"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="font-medium text-sm md:text-base bg-primary hover:bg-primary/90"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
