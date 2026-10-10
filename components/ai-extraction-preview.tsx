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

// ---------------------------------------------------------------------------
// Glass tokens — shared recipe so the material can't drift
// ---------------------------------------------------------------------------
const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4b5fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#13161a]'

const HAIRLINE =
  'pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70'

const INPUT_GLASS =
  'min-h-[44px] w-full rounded-xl border border-white/[0.14] bg-white/[0.045] px-3 py-2 text-sm font-medium text-white placeholder:text-white/35 ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl ' +
  'transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
  'hover:border-white/[0.20] hover:bg-white/[0.06] ' +
  'focus:border-[#9ee82d]/50 focus:outline-none focus:ring-2 focus:ring-[#9ee82d]/30 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

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

      <div className="relative w-full max-w-2xl mx-auto px-3 sm:px-5 md:px-0 pb-[120px] md:pb-8 text-white">

        {/* Header */}
        <div className="pt-2 sm:pt-4 md:pt-6 mb-5 md:mb-7">
          <div className="relative flex items-center justify-center">

            {/* Back Button — glass chip */}
            <button
              type="button"
              onClick={isEditing ? handleCancelEdit : onEdit}
              aria-label="Go back"
              className={`
                ${FOCUS_RING}
                absolute left-0 flex h-10 w-10 shrink-0 items-center justify-center
                rounded-xl
                border border-white/[0.14] bg-white/[0.055]
                text-white/75
                shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                backdrop-blur-xl
                transition-[background-color,border-color,color,transform,box-shadow] duration-300 ${EASE}
                hover:-translate-y-0.5
                hover:border-white/[0.24]
                hover:bg-white/[0.10]
                hover:text-white
                active:scale-95
              `}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Centered Title */}
            <div className="px-12 text-center">
              <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl md:text-2xl">
                {isEditing ? 'Edit Expense' : 'Review Expense'}
              </h2>

              <p className="mt-0.5 text-xs text-white/55 sm:text-sm">
                {isEditing
                  ? 'Make corrections before saving'
                  : 'Check what AI extracted'}
              </p>
            </div>

          </div>
        </div>


        {/* AI Status — glass banner with lime accent */}
        {!isEditing && (
          <div className="relative mb-4 flex items-center gap-3 overflow-hidden rounded-2xl border border-[#9ee82d]/25 bg-[#9ee82d]/[0.07] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-xl sm:px-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#c8ff75]/60 to-transparent"
            />

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#9ee82d]/30 bg-[#9ee82d]/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <Sparkles className="h-4 w-4 text-[#c8ff75]" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-white/95">
                AI extraction complete
              </p>

              <p className="text-[11px] text-white/55 sm:text-xs">
                Review the details before saving
              </p>
            </div>

          </div>
        )}

        {/* Expense Card — the glass hero */}
        <Card
          className="
            relative overflow-hidden rounded-[26px]
            border border-white/[0.14]
            bg-[#151922]/70
            text-white
            shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-35px_rgba(0,0,0,0.85)]
            backdrop-blur-2xl
          "
        >
          <div aria-hidden="true" className={HAIRLINE} />

          <CardContent className="relative z-10 p-0">

            {/* Amount */}
            <div className="relative overflow-hidden px-4 py-6 sm:px-6 sm:py-7 md:px-7 md:py-9">
              {/* Tinted wash inside the amount panel */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#9ee82d]/[0.08] via-transparent to-transparent"
              />

              {/* Blurred lime orb — subtle glow behind the number */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#9ee82d]/15 blur-3xl"
              />

              <div className="relative">

                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#9ee82d]/25 bg-[#9ee82d]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                    <Wallet className="h-3.5 w-3.5 text-[#c8ff75]" />
                  </div>

                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/55 sm:text-xs">
                    Amount
                  </span>
                </div>

                {isEditing ? (
                  <div className="flex max-w-full items-center gap-2">
                    <span className="text-2xl font-semibold text-white/90 sm:text-3xl">
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
                      className="
                        min-w-0 w-full
                        border-b-2 border-[#9ee82d]/50
                        bg-transparent px-0 py-1
                        text-3xl font-bold text-white
                        outline-none
                        tabular-nums
                        transition-[border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                        focus:border-[#9ee82d]
                        sm:text-4xl
                      "
                    />
                  </div>
                ) : (
                  <p className="break-words text-4xl font-bold tracking-tight text-white tabular-nums sm:text-5xl">
                    ₱{editedExpense.amount.toFixed(2)}
                  </p>
                )}

              </div>
            </div>

            {/* Details */}
            <div className="divide-y divide-white/[0.06]">

              {/* Category */}
              <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:h-10 sm:w-10">
                  <Tag className="h-4 w-4 text-white/60" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] font-medium text-white/50 sm:text-xs">
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
                        className={`
                          ${INPUT_GLASS}
                          min-h-[44px] appearance-none pr-10
                          [&>option]:bg-[#151922] [&>option]:text-white
                        `}
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

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
                    </div>
                  ) : (
                    <p className="truncate text-sm font-semibold text-white/95 sm:text-base">
                      {editedExpense.category || '—'}
                    </p>
                  )}
                </div>
              </div>

              {/* Merchant */}
              <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:h-10 sm:w-10">
                  <Store className="h-4 w-4 text-white/60" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] font-medium text-white/50 sm:text-xs">
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
                      className={INPUT_GLASS}
                    />
                  ) : (
                    <p className="truncate text-sm font-semibold text-white/95 sm:text-base">
                      {editedExpense.merchant || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:h-10 sm:w-10">
                  <FileText className="h-4 w-4 text-white/60" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] font-medium text-white/50 sm:text-xs">
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
                      className={`
                        ${INPUT_GLASS}
                        min-h-[90px] resize-none py-2.5
                      `}
                    />
                  ) : (
                    <p className="break-words text-sm font-semibold leading-relaxed text-white/95 sm:text-base">
                      {editedExpense.description || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:h-10 sm:w-10">
                  <CalendarDays className="h-4 w-4 text-white/60" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] font-medium text-white/50 sm:text-xs">
                    Date
                  </p>

                  <p className="text-sm font-semibold text-white/95 sm:text-base">
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
            <p className="text-[11px] text-white/55 sm:text-xs">
              Check the extracted details. You can edit anything before saving.
            </p>
          </div>
        )}

        {/* Action Bar — glass on mobile, static on desktop */}
        <div
          className="
            fixed inset-x-0 bottom-0 z-50
            border-t border-white/[0.14]
            bg-[#0f1115]/85
            px-3 pt-3
            backdrop-blur-2xl
            shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-20px_50px_-30px_rgba(0,0,0,0.9)]
            md:static md:mt-6 md:border-0 md:bg-transparent md:px-0 md:pt-0 md:backdrop-blur-none md:shadow-none
          "
        >
          <div className="mx-auto max-w-2xl pb-[env(safe-area-inset-bottom)]">

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">

              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className={`
                      ${FOCUS_RING}
                      h-11 rounded-xl
                      border border-white/[0.14] bg-white/[0.045]
                      text-sm font-medium text-white
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                      backdrop-blur-xl
                      transition-[background-color,border-color] duration-300 ${EASE}
                      hover:border-white/[0.24] hover:bg-white/[0.10] hover:text-white
                      sm:h-12
                    `}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSaveEdit}
                    className={`
                      ${FOCUS_RING}
                      h-11 gap-2 rounded-xl
                      border border-[#9ee82d]/30
                      bg-gradient-to-r from-[#9ee82d] to-[#c8ff75]
                      text-sm font-semibold text-[#17200a]
                      shadow-[0_0_18px_-6px_rgba(158,232,45,0.65)]
                      transition-[transform,box-shadow] duration-300 ${EASE}
                      hover:scale-[1.02]
                      hover:shadow-[0_0_24px_-6px_rgba(158,232,45,0.85)]
                      sm:h-12
                    `}
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
                    className={`
                      ${FOCUS_RING}
                      h-11 gap-2 rounded-xl
                      border border-white/[0.14] bg-white/[0.045]
                      text-sm font-medium text-white
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                      backdrop-blur-xl
                      transition-[background-color,border-color] duration-300 ${EASE}
                      hover:border-white/[0.24] hover:bg-white/[0.10] hover:text-white
                      sm:h-12
                    `}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>

                  <Button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`
                      ${FOCUS_RING}
                      h-11 gap-2 rounded-xl
                      border border-[#9ee82d]/30
                      bg-gradient-to-r from-[#9ee82d] to-[#c8ff75]
                      text-sm font-semibold text-[#17200a]
                      shadow-[0_0_18px_-6px_rgba(158,232,45,0.65)]
                      transition-[transform,box-shadow] duration-300 ${EASE}
                      hover:scale-[1.02]
                      hover:shadow-[0_0_24px_-6px_rgba(158,232,45,0.85)]
                      disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100
                      sm:h-12
                    `}
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
    </>
  )
}