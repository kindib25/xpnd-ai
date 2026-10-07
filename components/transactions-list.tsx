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

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining':
    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',

  Transportation:
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',

  Shopping:
    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',

  Entertainment:
    'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',

  Healthcare:
    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',

  Education:
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',

  Travel:
    'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',

  Utilities:
    'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',

  'Personal Care':
    'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',

  Other:
    'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400',
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
      'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
    )
  }

  return (
    <div className="w-full space-y-5 md:space-y-6">

      {/* ============================================
          CALENDAR
      ============================================ */}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold md:text-xl">
          Transaction Calendar
        </h2>

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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="h-11 rounded-full pl-10 text-sm md:text-base"
          />
        </div>

        {/* Transaction List */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">

            {filteredExpenses.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground md:py-12">
                <p className="text-sm md:text-base">
                  No transactions yet
                </p>
              </div>
            ) : (
              <div className="divide-y">

                {paginatedExpenses.map(
                  (expense) => (
                    <div
                      key={expense.id}
                      onClick={() =>
                        handleSelectExpense(
                          expense
                        )
                      }
                      className="
                        group
                        flex
                        cursor-pointer
                        items-center
                        gap-2
                        p-3
                        transition-colors
                        hover:bg-muted/50
                        md:gap-4
                        md:p-4
                      "
                    >
                      {/* Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted md:h-12 md:w-12">
                        <Wallet className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-xs font-semibold md:text-base">
                          {expense.description ||
                            'Expense'}
                        </h3>

                        <p className="text-xs text-muted-foreground">
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
                          px-2
                          py-1
                          text-xs
                          font-medium
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
                      <p className="min-w-fit text-right text-sm font-semibold md:mx-5 md:text-base">
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
              className="rounded-lg"
            >
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
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
              className="rounded-lg"
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
      rounded-2xl
      border-border/60
      bg-background
      p-0
      gap-0
      sm:max-h-[90vh]
    "
        >
          {selectedExpense && (
            <>
              {/* ============================================
            HEADER
        ============================================ */}
              <DialogHeader className="border-b border-border/60 bg-background px-4 py-4">
                <DialogTitle className="text-base font-semibold text-foreground">
                  {isEditing ? 'Edit Transaction' : 'Transaction Details'}
                </DialogTitle>
              </DialogHeader>

              {/* ============================================
            DETAILS
        ============================================ */}
              <div className="divide-y divide-border/60">

                {/* Amount */}
                <div className="bg-muted/30 px-4 py-5">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Wallet className="h-4 w-4 text-primary" />
                    </div>

                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Amount
                    </p>
                  </div>

                  {isEditing ? (
                    <div className="ml-11 flex items-center gap-2 border-b-2 border-primary/60">
                      <span className="text-2xl font-semibold text-foreground">
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
                    text-foreground
                    shadow-none
                    placeholder:text-muted-foreground
                    focus-visible:ring-0
                  "
                      />
                    </div>
                  ) : (
                    <p className="ml-11 text-3xl font-bold tracking-tight text-foreground">
                      ₱
                      {parseFloat(
                        selectedExpense.amount
                      ).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="flex gap-3 bg-background px-4 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[11px] font-medium text-muted-foreground">
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
                      border-border/70
                      bg-muted/30
                      text-foreground
                      focus:ring-primary/20
                    "
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>

                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem
                              key={category}
                              value={category}
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
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
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
                <div className="flex gap-3 bg-background px-4 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                      Merchant
                    </p>

                    {isEditing ? (
                      <Input
                        value={editMerchant}
                        onChange={(e) =>
                          setEditMerchant(e.target.value)
                        }
                        placeholder="Enter merchant"
                        className="
                    h-10
                    rounded-xl
                    border-border/70
                    bg-muted/30
                    text-foreground
                    placeholder:text-muted-foreground
                    focus-visible:border-primary
                    focus-visible:ring-primary/20
                  "
                      />
                    ) : (
                      <p className="break-words text-sm font-semibold text-foreground">
                        {selectedExpense.merchant || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="flex gap-3 bg-background px-4 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                      Description
                    </p>

                    {isEditing ? (
                      <Input
                        value={editDescription}
                        onChange={(e) =>
                          setEditDescription(e.target.value)
                        }
                        placeholder="Enter description"
                        className="
                    h-10
                    rounded-xl
                    border-border/70
                    bg-muted/30
                    text-foreground
                    placeholder:text-muted-foreground
                    focus-visible:border-primary
                    focus-visible:ring-primary/20
                  "
                      />
                    ) : (
                      <p className="break-words text-sm font-semibold text-foreground">
                        {selectedExpense.description || 'Expense'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="flex gap-3 bg-background px-4 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                      Date
                    </p>

                    <p className="text-sm font-semibold text-foreground">
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
                <div className="bg-muted/10 px-4 py-4">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Transaction ID
                  </p>

                  <p className="break-all text-[11px] leading-relaxed text-muted-foreground">
                    {selectedExpense.id}
                  </p>
                </div>
              </div>

              {/* ============================================
            ACTIONS
        ============================================ */}
              <div className="border-t border-border/60 bg-muted/20 p-4">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="
                  h-11
                  flex-1
                  rounded-xl
                  border-border/70
                  bg-background
                  text-foreground
                  hover:bg-muted
                "
                      disabled={isSaving}
                      onClick={handleCancelEdit}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>

                    <Button
                      className="h-11 flex-1 rounded-xl"
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
                      className="
                  h-11
                  flex-1
                  rounded-xl
                  border-border/70
                  bg-background
                  text-foreground
                  hover:bg-muted
                "
                      onClick={handleEdit}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      className="h-11 flex-1 rounded-xl"
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
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">

          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete transaction?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">
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
              className="rounded-xl"
              disabled={!!isDeleting}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!isDeleting}
              onClick={() => {
                if (deleteExpense) {
                  confirmDelete(
                    deleteExpense.id
                  )
                }
              }}
            >
              {isDeleting
                ? 'Deleting...'
                : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}