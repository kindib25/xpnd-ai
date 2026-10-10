'use client'

import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Trash2,
  Search,
  Pencil,
  Save,
  X,
  Wallet,
  FileText,
  Tag,
  Store,
  CalendarDays,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { TransactionCalendar } from './TransactionCalendar'

interface TransactionsListProps {
  expenses: any[]
}

// ---------------------------------------------------------------------------
// Glass design tokens — shared recipe so the material can't drift
// ---------------------------------------------------------------------------
const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

const GLASS_SURFACE_DEEP =
  'relative overflow-hidden rounded-[26px] border border-white/[0.14] bg-[#151922]/70 backdrop-blur-2xl ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-35px_rgba(0,0,0,0.85)]'

const GLASS_INSET =
  'relative overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.035] ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl'

const HAIRLINE =
  'pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70'

const HAIRLINE_SM =
  'pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4b5fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#13161a]'

const INPUT_GLASS =
  'h-10 rounded-xl border border-white/[0.14] bg-white/[0.045] text-white placeholder:text-white/35 ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl ' +
  'transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
  'hover:border-white/[0.20] hover:bg-white/[0.06] ' +
  'focus-visible:border-[#9ee82d]/50 focus-visible:ring-2 focus-visible:ring-[#9ee82d]/30 focus-visible:ring-offset-0 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

// Category chips — translucent fills + bright text work on any glass surface
const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining':
    'bg-orange-500/15 text-orange-300 border-orange-400/25',
  Transportation:
    'bg-sky-500/15 text-sky-300 border-sky-400/25',
  Shopping:
    'bg-purple-500/15 text-purple-300 border-purple-400/25',
  Entertainment:
    'bg-pink-500/15 text-pink-300 border-pink-400/25',
  Healthcare:
    'bg-red-500/15 text-red-300 border-red-400/25',
  Education:
    'bg-emerald-500/15 text-emerald-300 border-emerald-400/25',
  Travel:
    'bg-cyan-500/15 text-cyan-300 border-cyan-400/25',
  Utilities:
    'bg-slate-500/15 text-slate-300 border-slate-400/25',
  'Personal Care':
    'bg-indigo-500/15 text-indigo-300 border-indigo-400/25',
  Other:
    'bg-white/[0.06] text-white/70 border-white/[0.14]',
}

const CATEGORIES = [
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

export function TransactionsList({
  expenses,
}: TransactionsListProps) {
  const [isDeleting, setIsDeleting] =
    useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)

  const [deleteExpense, setDeleteExpense] =
    useState<any | null>(null)

  const [searchQuery, setSearchQuery] = useState('')

  const [currentPage, setCurrentPage] = useState(1)

  const [selectedExpense, setSelectedExpense] =
    useState<any | null>(null)

  const [isEditing, setIsEditing] = useState(false)

  // Editable fields
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] =
    useState('')
  const [editCategory, setEditCategory] =
    useState('')
  const [editMerchant, setEditMerchant] =
    useState('')

  const ITEMS_PER_PAGE = 5

  const router = useRouter()

  // ============================================
  // POPULATE EDIT FIELDS
  // ============================================

  useEffect(() => {
    if (selectedExpense) {
      setEditAmount(
        String(selectedExpense.amount ?? '')
      )

      setEditDescription(
        selectedExpense.description || ''
      )

      setEditCategory(
        selectedExpense.category || ''
      )

      setEditMerchant(
        selectedExpense.merchant || ''
      )
    }
  }, [selectedExpense])

  // ============================================
  // SELECT EXPENSE
  // ============================================

  const handleSelectExpense = (expense: any) => {
    setSelectedExpense(expense)
    setIsEditing(false)
  }

  // ============================================
  // EDIT
  // ============================================

  const handleEdit = () => {
    if (!selectedExpense) return

    setEditAmount(
      String(selectedExpense.amount ?? '')
    )

    setEditDescription(
      selectedExpense.description || ''
    )

    setEditCategory(
      selectedExpense.category || ''
    )

    setEditMerchant(
      selectedExpense.merchant || ''
    )

    setIsEditing(true)
  }

  // ============================================
  // CANCEL EDIT
  // ============================================

  const handleCancelEdit = () => {
    if (!selectedExpense) return

    setEditAmount(
      String(selectedExpense.amount ?? '')
    )

    setEditDescription(
      selectedExpense.description || ''
    )

    setEditCategory(
      selectedExpense.category || ''
    )

    setEditMerchant(
      selectedExpense.merchant || ''
    )

    setIsEditing(false)
  }

  // ============================================
  // SAVE
  // ============================================

  const handleSave = async () => {
    if (!selectedExpense) return

    const amount = Number(editAmount)

    if (
      !editAmount.trim() ||
      isNaN(amount) ||
      amount <= 0
    ) {
      toast.error('Please enter a valid amount.')
      return
    }

    if (!editDescription.trim()) {
      toast.error('Description cannot be empty.')
      return
    }

    if (!editCategory) {
      toast.error('Please select a category.')
      return
    }

    setIsSaving(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('expenses')
        .update({
          amount,
          description: editDescription.trim(),
          category: editCategory,
          merchant:
            editMerchant.trim() || null,
        })
        .eq('id', selectedExpense.id)
        .select()
        .single()

      if (error) throw error

      setSelectedExpense(data)
      setIsEditing(false)

      toast.success(
        'Transaction updated successfully.'
      )

      router.refresh()
    } catch (error) {
      console.error(
        'Failed to update expense:',
        error
      )

      toast.error(
        'Failed to update transaction.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================
  // DELETE
  // ============================================

  const handleDelete = (expense: any) => {
    setDeleteExpense(expense)
  }

  const confirmDelete = async (id: string) => {
    setIsDeleting(id)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success(
        'Transaction deleted successfully.'
      )

      setDeleteExpense(null)
      setSelectedExpense(null)
      setIsEditing(false)

      router.refresh()
    } catch (error) {
      console.error(
        'Failed to delete expense:',
        error
      )

      toast.error(
        'Failed to delete transaction.'
      )
    } finally {
      setIsDeleting(null)
    }
  }

  // ============================================
  // FILTER
  // ============================================

  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      exp.category
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(
    filteredExpenses.length / ITEMS_PER_PAGE
  )

  const paginatedExpenses =
    filteredExpenses.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // ============================================
  // CATEGORY COLOR
  // ============================================

  const getCategoryColor = (
    category: string
  ) => {
    return (
      CATEGORY_COLORS[category] ||
      CATEGORY_COLORS.Other
    )
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

      <div className="relative w-full space-y-5 text-white md:space-y-6">

        {/* ============================================
            CALENDAR
        ============================================ */}

        <section className="space-y-3">

          <TransactionCalendar
            expenses={expenses}
            onDateClick={(dayExpenses) => {
              if (dayExpenses.length > 0) {
                handleSelectExpense(
                  dayExpenses[0]
                )
              }
            }}
          />
        </section>

        {/* ============================================
            TRANSACTIONS
        ============================================ */}

        <section className="space-y-3">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />

            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`focus-visible:ring-2 focus-visible:ring-[#97e431] focus-visible:ring-offset-0 h-11 rounded-full border border-white/[0.14] bg-white/[0.055] pl-10 text-sm text-white placeholder:text-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[border-color,background-color] duration-300 ${EASE} hover:border-white/[0.20] hover:bg-white/[0.075] md:text-base`}
            />
          </div>

          {/* Transaction List */}
          <Card className={GLASS_SURFACE_DEEP}>
            <div aria-hidden="true" className={HAIRLINE} />
            <CardContent className="relative z-10 p-0">

              {filteredExpenses.length === 0 ? (
                <div className="py-10 text-center text-white/55 md:py-12">
                  <p className="text-sm md:text-base">
                    No transactions yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">

                  {paginatedExpenses.map(
                    (expense) => (
                      <div
                        key={expense.id}
                        onClick={() =>
                          handleSelectExpense(
                            expense
                          )
                        }
                        className={`
                          group
                          flex
                          cursor-pointer
                          items-center
                          gap-2
                          p-3
                          transition-[background-color]
                          duration-300
                          ${EASE}
                          hover:bg-white/[0.055]
                          md:gap-4
                          md:p-4
                        `}
                      >
                        {/* Icon */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl md:h-12 md:w-12">
                          <Wallet className="h-4 w-4 text-white/60 md:h-5 md:w-5" />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-xs font-semibold text-white/95 md:text-base">
                            {expense.description ||
                              'Expense'}
                          </h3>

                          <p className="text-xs text-white/55">
                            {new Date(
                              expense.date
                            ).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </p>
                        </div>

                        {/* Category */}
                        <span
                          className={`
                            hidden
                            whitespace-nowrap
                            rounded-full
                            border
                            px-2
                            py-1
                            text-xs
                            font-medium
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                            backdrop-blur-xl
                            sm:inline-flex
                            md:px-3
                            ${getCategoryColor(
                            expense.category
                          )}
                          `}
                        >
                          {expense.category}
                        </span>

                        {/* Amount */}
                        <p className="min-w-fit text-right text-sm font-semibold tabular-nums text-white/95 md:mx-5 md:text-base">
                          ₱
                          {parseFloat(
                            expense.amount
                          ).toFixed(0)}
                        </p>
                      </div>
                    )
                  )}

                </div>
              )}

            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    (prev) => prev - 1
                  )
                }
                className={`
                  ${FOCUS_RING}
                  rounded-xl border border-white/[0.14] bg-white/[0.045]
                  text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl
                  transition-[background-color,border-color] duration-300 ${EASE}
                  hover:border-white/[0.24] hover:bg-white/[0.10] hover:text-white
                  disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/[0.14] disabled:hover:bg-white/[0.045]
                `}
              >
                Previous
              </Button>

              <div className="text-sm text-white/55">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (prev) => prev + 1
                  )
                }
                className={`
                  ${FOCUS_RING}
                  rounded-xl border border-white/[0.14] bg-white/[0.045]
                  text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl
                  transition-[background-color,border-color] duration-300 ${EASE}
                  hover:border-white/[0.24] hover:bg-white/[0.10] hover:text-white
                  disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/[0.14] disabled:hover:bg-white/[0.045]
                `}
              >
                Next
              </Button>

            </div>
          )}
        </section>

        {/* ============================================
            TRANSACTION DETAILS DIALOG
        ============================================ */}

        <Dialog
          open={!!selectedExpense}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedExpense(null)
              setIsEditing(false)
            }
          }}
        >
          <DialogContent
            className="
              w-[calc(100%-1rem)]
              max-w-md
              max-h-[calc(100dvh-1rem)]
              overflow-y-auto
              gap-0
              rounded-[26px]
              border border-white/[0.14]
              bg-[#151922]/90
              p-0
              text-white
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-40px_rgba(0,0,0,0.95)]
              backdrop-blur-2xl
              sm:max-h-[90vh]
            "
          >
            {selectedExpense && (
              <>
                {/* HEADER */}
                <DialogHeader className="relative border-b border-white/[0.06] px-4 py-4">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"
                  />
                  <DialogTitle className="text-base font-semibold text-white">
                    {isEditing ? 'Edit Transaction' : 'Transaction Details'}
                  </DialogTitle>
                </DialogHeader>

                {/* DETAILS */}
                <div className="divide-y divide-white/[0.06]">

                  {/* Amount */}
                  <div className="bg-white/[0.025] px-4 py-5">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#9ee82d]/25 bg-[#9ee82d]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <Wallet className="h-4 w-4 text-[#c8ff75]" />
                      </div>

                      <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                        Amount
                      </p>
                    </div>

                    {isEditing ? (
                      <div className="ml-11 flex items-center gap-2 border-b-2 border-[#9ee82d]/60">
                        <span className="text-2xl font-semibold text-white">
                          ₱
                        </span>

                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) =>
                            setEditAmount(e.target.value)
                          }
                          placeholder="0.00"
                          className="
                            h-10
                            border-0
                            bg-transparent
                            px-0
                            text-2xl
                            font-bold
                            text-white
                            shadow-none
                            placeholder:text-white/30
                            focus-visible:ring-0
                          "
                        />
                      </div>
                    ) : (
                      <p className="ml-11 text-3xl font-bold tracking-tight tabular-nums text-white">
                        ₱
                        {parseFloat(
                          selectedExpense.amount
                        ).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="flex gap-3 px-4 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <Tag className="h-4 w-4 text-white/60" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-[11px] font-medium text-white/50">
                        Category
                      </p>

                      {isEditing ? (
                        <Select
                          value={editCategory}
                          onValueChange={(value) =>
                            setEditCategory(value ?? '')
                          }
                        >
                          <SelectTrigger
                            className="
                              h-10
                              w-full
                              rounded-xl
                              border border-white/[0.14]
                              bg-white/[0.045]
                              text-white
                              shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                              backdrop-blur-xl
                              transition-[border-color,background-color] duration-300
                              ease-[cubic-bezier(0.16,1,0.3,1)]
                              hover:border-white/[0.20]
                              focus:border-[#9ee82d]/50
                              focus:ring-2 focus:ring-[#9ee82d]/30
                            "
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>

                          <SelectContent className="rounded-xl border border-white/[0.14] bg-[#151922]/95 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-30px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
                            {CATEGORIES.map((category) => (
                              <SelectItem
                                key={category}
                                value={category}
                                className="focus:bg-primary focus:text-white"
                              >
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span
                          className={`
                            inline-flex
                            rounded-full
                            border
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                            backdrop-blur-xl
                            ${getCategoryColor(
                            selectedExpense.category
                          )}
                          `}
                        >
                          {selectedExpense.category || 'Other'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Merchant */}
                  <div className="flex gap-3 px-4 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <Store className="h-4 w-4 text-white/60" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-[11px] font-medium text-white/50">
                        Merchant
                      </p>

                      {isEditing ? (
                        <Input
                          value={editMerchant}
                          onChange={(e) =>
                            setEditMerchant(e.target.value)
                          }
                          placeholder="Enter merchant"
                          className={INPUT_GLASS}
                        />
                      ) : (
                        <p className="break-words text-sm font-semibold text-white/95">
                          {selectedExpense.merchant || 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex gap-3 px-4 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <FileText className="h-4 w-4 text-white/60" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-[11px] font-medium text-white/50">
                        Description
                      </p>

                      {isEditing ? (
                        <Input
                          value={editDescription}
                          onChange={(e) =>
                            setEditDescription(e.target.value)
                          }
                          placeholder="Enter description"
                          className={INPUT_GLASS}
                        />
                      ) : (
                        <p className="break-words text-sm font-semibold text-white/95">
                          {selectedExpense.description || 'Expense'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex gap-3 px-4 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <CalendarDays className="h-4 w-4 text-white/60" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-[11px] font-medium text-white/50">
                        Date
                      </p>

                      <p className="text-sm font-semibold text-white/95">
                        {new Date(
                          selectedExpense.date
                        ).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div className="bg-white/[0.015] px-4 py-4">
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/45">
                      Transaction ID
                    </p>

                    <p className="break-all text-[11px] leading-relaxed text-white/50">
                      {selectedExpense.id}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="relative border-t border-white/[0.06] p-4">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"
                  />
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className={`
                          ${FOCUS_RING}
                          h-11 flex-1 rounded-xl
                          border border-white/[0.14] bg-white/[0.045]
                          text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl
                          transition-[background-color,border-color] duration-300 ${EASE}
                          hover:border-white/[0.24] hover:bg-white/[0.10] hover:text-white
                        `}
                        disabled={isSaving}
                        onClick={handleCancelEdit}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>

                      <Button
                        className={`
                          ${FOCUS_RING}
                          h-11 flex-1 rounded-xl
                          border border-[#9ee82d]/30
                          bg-gradient-to-r from-[#9ee82d] to-[#c8ff75]
                          font-semibold text-[#17200a]
                          shadow-[0_0_18px_-6px_rgba(158,232,45,0.65)]
                          transition-[transform,box-shadow] duration-300 ${EASE}
                          hover:scale-[1.02]
                          hover:shadow-[0_0_24px_-6px_rgba(158,232,45,0.85)]
                          disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100
                        `}
                        disabled={
                          isSaving ||
                          !editAmount ||
                          Number(editAmount) <= 0
                        }
                        onClick={handleSave}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className={`
                          ${FOCUS_RING}
                          h-11 flex-1 rounded-xl
                          border border-white/[0.14] bg-white/[0.045]
                          text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl
                          transition-[background-color,border-color] duration-300 ${EASE}
                          hover:border-white/[0.24] hover:bg-white/[0.10] hover:text-white
                        `}
                        onClick={handleEdit}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        className={`
                          ${FOCUS_RING}
                          h-11 flex-1 rounded-xl
                          border border-red-400/30
                          bg-red-500/20
                          font-semibold text-red-200
                          shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_-8px_rgba(248,113,113,0.55)]
                          backdrop-blur-xl
                          transition-[transform,background-color,border-color,box-shadow] duration-300 ${EASE}
                          hover:scale-[1.02]
                          hover:border-red-400/50
                          hover:bg-red-500/30
                          hover:text-red-100
                          disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100
                        `}
                        disabled={
                          isDeleting === selectedExpense.id
                        }
                        onClick={() =>
                          handleDelete(selectedExpense)
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />

                        {isDeleting === selectedExpense.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ============================================
            DELETE CONFIRMATION
        ============================================ */}

        <AlertDialog
          open={!!deleteExpense}
          onOpenChange={(open) => {
            if (!open && !isDeleting) {
              setDeleteExpense(null)
            }
          }}
        >
          <AlertDialogContent className="relative w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-[26px] border border-white/[0.14] bg-[#151922]/90 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-40px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"
            />

            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Delete transaction?
              </AlertDialogTitle>

              <AlertDialogDescription className="text-white/60">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-white/95">
                  "
                  {deleteExpense?.description ||
                    'this transaction'}
                  "
                </span>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={!!isDeleting}
                className={`
                  ${FOCUS_RING}
                  rounded-xl
                  border border-white/[0.14] bg-white/[0.045]
                  text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl
                  transition-[background-color,border-color] duration-300 ${EASE}
                  hover:border-white/[0.24] hover:bg-white/[0.10] hover:text-white
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
              >
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                disabled={!!isDeleting}
                onClick={() => {
                  if (deleteExpense) {
                    confirmDelete(
                      deleteExpense.id
                    )
                  }
                }}
                className={`
                  ${FOCUS_RING}
                  rounded-xl
                  border border-red-400/30
                  bg-red-500/20
                  font-semibold text-red-200
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_-8px_rgba(248,113,113,0.55)]
                  backdrop-blur-xl
                  transition-[background-color,border-color,box-shadow] duration-300 ${EASE}
                  hover:border-red-400/50
                  hover:bg-red-500/30
                  hover:text-red-100
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>

          </AlertDialogContent>
        </AlertDialog>

      </div>
    </>
  )
}