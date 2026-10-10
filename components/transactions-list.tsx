'use client'

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
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
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

const HAIRLINE =
  'pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70'

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

const getCategoryColor = (category: string) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other
}

// ===========================================================================
// TRANSACTION DETAIL CARD
// Renders one transaction using the exact same UI as the details Dialog,
// but self-contained so it can be embedded inside the bottom Sheet.
// ===========================================================================

function TransactionDetailCard({
  expense,
  onUpdated,
  onDeleted,
}: {
  expense: any
  onUpdated: (updated: any) => void
  onDeleted: (id: string) => void
}) {
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false)

  const [editAmount, setEditAmount] = useState(
    String(expense.amount ?? '')
  )
  const [editDescription, setEditDescription] = useState(
    expense.description || ''
  )
  const [editCategory, setEditCategory] = useState(
    expense.category || ''
  )
  const [editMerchant, setEditMerchant] = useState(
    expense.merchant || ''
  )

  // Keep edit fields in sync when the expense prop changes (e.g. after save)
  useEffect(() => {
    setEditAmount(String(expense.amount ?? ''))
    setEditDescription(expense.description || '')
    setEditCategory(expense.category || '')
    setEditMerchant(expense.merchant || '')
  }, [expense])

  const handleEdit = () => {
    setEditAmount(String(expense.amount ?? ''))
    setEditDescription(expense.description || '')
    setEditCategory(expense.category || '')
    setEditMerchant(expense.merchant || '')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditAmount(String(expense.amount ?? ''))
    setEditDescription(expense.description || '')
    setEditCategory(expense.category || '')
    setEditMerchant(expense.merchant || '')
    setIsEditing(false)
  }

  const handleSave = async () => {
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
          merchant: editMerchant.trim() || null,
        })
        .eq('id', expense.id)
        .select()
        .single()

      if (error) throw error

      setIsEditing(false)
      onUpdated(data)

      toast.success('Transaction updated successfully.')
      router.refresh()
    } catch (error) {
      console.error('Failed to update expense:', error)
      toast.error('Failed to update transaction.')
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    setIsDeleting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id)

      if (error) throw error

      toast.success('Transaction deleted successfully.')

      setShowDeleteConfirm(false)
      onDeleted(expense.id)

      router.refresh()
    } catch (error) {
      console.error('Failed to delete expense:', error)
      toast.error('Failed to delete transaction.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative">
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
              ₱{parseFloat(expense.amount).toFixed(2)}
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
                  ${getCategoryColor(expense.category)}
                `}
              >
                {expense.category || 'Other'}
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
                {expense.merchant || 'Not specified'}
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
                {expense.description || 'Expense'}
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
              {new Date(expense.date).toLocaleDateString(
                'en-US',
                {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }
              )}
            </p>
          </div>
        </div>

        {/* Transaction ID */}
        <div className="bg-white/[0.015] px-4 py-4">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/45">
            Transaction ID
          </p>

          <p className="break-all text-[11px] leading-relaxed text-white/50">
            {expense.id}
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
              disabled={isDeleting}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setShowDeleteConfirm(false)
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
                "{expense.description || 'this transaction'}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
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
              disabled={isDeleting}
              onClick={confirmDelete}
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
  )
}

// ===========================================================================
// MAIN COMPONENT
// ===========================================================================

export function TransactionsList({
  expenses,
}: TransactionsListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const [currentPage, setCurrentPage] = useState(1)

  // Date sheet state — which date's transactions are being shown
  const [selectedDate, setSelectedDate] =
    useState<string | null>(null)

  const [dateExpenses, setDateExpenses] = useState<any[]>([])

  // Search result sheet state — single transaction picked from search
  const [searchSheetExpense, setSearchSheetExpense] =
    useState<any | null>(null)

  // Search dropdown state
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const ITEMS_PER_PAGE = 5

  const router = useRouter()

  // Auto-close the date sheet once its contents have been emptied out
  useEffect(() => {
    if (selectedDate && dateExpenses.length === 0) {
      setSelectedDate(null)
    }
  }, [dateExpenses, selectedDate])

  // Close the search dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
  }, [])

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

  return (
    <>
      {/* =========================================================
          AMBIENT BACKGROUND
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

        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#9ee82d]/[0.14] blur-[130px]" />

        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-[#724bf6]/[0.20] blur-[140px]" />

        <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/[0.10] blur-[140px]" />
      </div>

      <div className="relative w-full space-y-5 text-white md:space-y-6">

        {/* ============================================
            SEARCH (with dropdown results)
        ============================================ */}

        <section ref={searchRef} className="relative z-30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />

            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsSearchOpen(true)
              }}
              onFocus={() => setIsSearchOpen(true)}
              className={`focus-visible:ring-2 focus-visible:ring-[#97e431] focus-visible:ring-offset-0 h-11 rounded-full border border-white/[0.14] bg-white/[0.055] pl-10 text-sm text-white placeholder:text-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-[border-color,background-color] duration-300 ${EASE} hover:border-white/[0.20] hover:bg-white/[0.075] md:text-base`}
            />
          </div>

          {/* Dropdown results — appears directly under the search bar */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/[0.14] bg-[#151922]/95 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-30px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
              <div aria-hidden="true" className={HAIRLINE} />

              {filteredExpenses.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-white/55">
                  No transactions found
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto">
                  <div className="divide-y divide-white/[0.06]">
                    {paginatedExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        onClick={() => {
                          setSearchSheetExpense(expense)
                          setIsSearchOpen(false)
                        }}
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
                          md:gap-3
                        `}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
                          <Wallet className="h-4 w-4 text-white/60" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-white/95">
                            {expense.description || 'Expense'}
                          </h3>

                          <p className="text-xs text-white/55">
                            {new Date(expense.date).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </p>
                        </div>

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
                            ${getCategoryColor(expense.category)}
                          `}
                        >
                          {expense.category}
                        </span>

                        <p className="min-w-fit text-right text-sm font-semibold tabular-nums text-white/95">
                          ₱{parseFloat(expense.amount).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] px-3 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((prev) => prev - 1)
                        }
                        className={`
                          ${FOCUS_RING}
                          h-8 rounded-lg border border-white/[0.14] bg-white/[0.045]
                          px-3 text-xs text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                          backdrop-blur-xl transition-[background-color,border-color]
                          duration-300 ${EASE}
                          hover:border-white/[0.24] hover:bg-white/[0.10] hover:text-white
                          disabled:cursor-not-allowed disabled:opacity-40
                        `}
                      >
                        Previous
                      </Button>

                      <div className="text-xs text-white/55">
                        Page {currentPage} of {totalPages}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((prev) => prev + 1)
                        }
                        className={`
                          ${FOCUS_RING}
                          h-8 rounded-lg border border-white/[0.14] bg-white/[0.045]
                          px-3 text-xs text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                          backdrop-blur-xl transition-[background-color,border-color]
                          duration-300 ${EASE}
                          hover:border-white/[0.24] hover:bg-white/[0.10] hover:text-white
                          disabled:cursor-not-allowed disabled:opacity-40
                        `}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ============================================
            CALENDAR
        ============================================ */}

        <section className="space-y-3">
          <TransactionCalendar
            expenses={expenses}
            onDateClick={(dayExpenses, dateKey) => {
              if (dayExpenses.length > 0) {
                setDateExpenses(dayExpenses)
                setSelectedDate(dateKey)
              }
            }}
          />
        </section>

        {/* ============================================
            DATE TRANSACTIONS SHEET
            Uses the same content + UI as the details Dialog
        ============================================ */}

        <Sheet
          open={!!selectedDate}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedDate(null)
              setDateExpenses([])
            }
          }}
        >
          <SheetContent
            side="bottom"
            className="
              mx-auto w-full max-w-md
              rounded-t-[26px] rounded-b-none
              border-x border-t border-b-0 border-white/[0.14]
              bg-[#151922]/90
              p-0
              text-white
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_-30px_80px_-40px_rgba(0,0,0,0.95)]
              backdrop-blur-2xl
              [&>button]:hidden
              focus:outline-none
            "
          >
            {/* Drag handle */}
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1.5 w-10 rounded-full bg-white/25" />
            </div>

            {/* Header */}
            <SheetHeader className="relative border-b border-white/[0.06] px-4 py-4 text-left">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"
              />

              <SheetTitle className="text-base font-semibold text-white">
                {selectedDate
                  ? new Date(
                      selectedDate + 'T00:00:00'
                    ).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : ''}
              </SheetTitle>

              <SheetDescription className="text-xs text-white/55">
                {dateExpenses.length}{' '}
                {dateExpenses.length === 1
                  ? 'transaction'
                  : 'transactions'}{' '}
                · ₱
                {dateExpenses
                  .reduce(
                    (sum, e) =>
                      sum + Number(e.amount || 0),
                    0
                  )
                  .toFixed(2)}
              </SheetDescription>
            </SheetHeader>

            {/* Transactions — each one rendered with the full
                details UI from the Dialog */}
            <div className="max-h-[75vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
              {dateExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className={
                    index > 0
                      ? 'border-t border-white/[0.10]'
                      : ''
                  }
                >
                  <TransactionDetailCard
                    expense={expense}
                    onUpdated={(updated) => {
                      setDateExpenses((prev) =>
                        prev.map((e) =>
                          e.id === updated.id ? updated : e
                        )
                      )
                    }}
                    onDeleted={(id) => {
                      setDateExpenses((prev) =>
                        prev.filter((e) => e.id !== id)
                      )
                    }}
                  />
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* ============================================
            SEARCH RESULT SHEET
            Opens when a transaction is picked from the search dropdown.
            Uses the same TransactionDetailCard UI as the date sheet.
        ============================================ */}

        <Sheet
          open={!!searchSheetExpense}
          onOpenChange={(open) => {
            if (!open) {
              setSearchSheetExpense(null)
            }
          }}
        >
          <SheetContent
            side="bottom"
            className="
              mx-auto w-full max-w-md
              rounded-t-[26px] rounded-b-none
              border-x border-t border-b-0 border-white/[0.14]
              bg-[#151922]/90
              p-0
              text-white
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_-30px_80px_-40px_rgba(0,0,0,0.95)]
              backdrop-blur-2xl
              [&>button]:hidden
              focus:outline-none
            "
          >
            {/* Drag handle */}
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1.5 w-10 rounded-full bg-white/25" />
            </div>

            {/* Header */}
            <SheetHeader className="relative border-b border-white/[0.06] px-4 py-4 text-left">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"
              />

              <SheetTitle className="text-base font-semibold text-white">
                Transaction Details
              </SheetTitle>

              <SheetDescription className="text-xs text-white/55">
                {searchSheetExpense
                  ? new Date(
                      searchSheetExpense.date
                    ).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : ''}
              </SheetDescription>
            </SheetHeader>

            <div className="max-h-[75vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
              {searchSheetExpense && (
                <TransactionDetailCard
                  key={searchSheetExpense.id}
                  expense={searchSheetExpense}
                  onUpdated={(updated) =>
                    setSearchSheetExpense(updated)
                  }
                  onDeleted={() =>
                    setSearchSheetExpense(null)
                  }
                />
              )}
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </>
  )
}