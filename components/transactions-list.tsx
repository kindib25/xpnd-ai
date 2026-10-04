'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Search, Pencil, Save, X } from 'lucide-react'
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

export function TransactionsList({ expenses }: TransactionsListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteExpense, setDeleteExpense] = useState<any | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedExpense, setSelectedExpense] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editMerchant, setEditMerchant] = useState('')

  const ITEMS_PER_PAGE = 5

  const router = useRouter()

  // Populate the edit fields whenever a transaction is selected
  useEffect(() => {
    if (selectedExpense) {
      setEditDescription(selectedExpense.description || '')
      setEditCategory(selectedExpense.category || '')
      setEditMerchant(selectedExpense.merchant || '')
    }
  }, [selectedExpense])

  const handleSelectExpense = (expense: any) => {
    setSelectedExpense(expense)
    setIsEditing(false)
  }

  const handleEdit = () => {
    if (!selectedExpense) return

    setEditDescription(selectedExpense.description || '')
    setEditCategory(selectedExpense.category || '')
    setEditMerchant(selectedExpense.merchant || '')

    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (!selectedExpense) return

    setEditDescription(selectedExpense.description || '')
    setEditCategory(selectedExpense.category || '')
    setEditMerchant(selectedExpense.merchant || '')

    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!selectedExpense) return

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
          description: editDescription.trim(),
          category: editCategory,
          merchant: editMerchant.trim() || null,
        })
        .eq('id', selectedExpense.id)
        .select()
        .single()

      if (error) throw error

      // Update the currently selected transaction immediately
      setSelectedExpense(data)
      setIsEditing(false)

      toast.success('Transaction updated successfully.')

      router.refresh()
    } catch (error) {
      console.error('Failed to update expense:', error)
      toast.error('Failed to update transaction.')
    } finally {
      setIsSaving(false)
    }
  }

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

      toast.success('Transaction deleted successfully.')
      setDeleteExpense(null)
      setSelectedExpense(null)
      setIsEditing(false)

      router.refresh()
    } catch (error) {
      console.error('Failed to delete expense:', error)
      toast.error('Failed to delete transaction.')
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      exp.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE)

  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const getCategoryColor = (category: string) => {
    return (
      CATEGORY_COLORS[category] ||
      'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
    )
  }

  return (
    <div className="w-full space-y-5 md:space-y-6">
      {/* Calendar Section */}
      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-semibold">
          Transaction Calendar
        </h2>

        <TransactionCalendar
          expenses={expenses}
          onDateClick={(dayExpenses) => {
            if (dayExpenses.length === 1) {
              handleSelectExpense(dayExpenses[0])
              return
            }

            handleSelectExpense(dayExpenses[0])
          }}
        />
      </section>

      {/* Transactions Section */}
      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-semibold">
          Transactions
        </h2>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full text-sm md:text-base"
            />
          </div>
        </div>

        {/* Transactions */}
        <Card>
          <CardContent className="p-0">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-8 md:py-12 text-muted-foreground">
                <p className="text-sm md:text-base">
                  No transactions yet
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {paginatedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    onClick={() => handleSelectExpense(expense)}
                    className="p-3 md:p-4 hover:bg-muted/50 transition-colors flex items-center gap-2 md:gap-4 group cursor-pointer"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 text-base md:text-lg">
                      {/* Icon Here */}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 mr-8 md:mr-0">
                      <h3 className="font-semibold text-xs md:text-base truncate">
                        {expense.description || 'Expense'}
                      </h3>

                      <p className="text-xs text-muted-foreground">
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

                    {/* Category */}
                    <span
                      className={`hidden sm:inline px-2 md:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(
                        expense.category
                      )}`}
                    >
                      {expense.category}
                    </span>

                    {/* Amount */}
                    <p className="font-semibold text-sm md:text-base text-right min-w-fit mx-0 md:mx-5">
                      ₱{parseFloat(expense.amount).toFixed(0)}
                    </p>
                  </div>
                ))}
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
                setCurrentPage((prev) => prev - 1)
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
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
              className="rounded-lg"
            >
              Next
            </Button>
          </div>
        )}
      </section>

      {/* Transaction Details Dialog */}
      <Dialog
        open={!!selectedExpense}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedExpense(null)
            setIsEditing(false)
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
          {selectedExpense && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">
                  Transaction Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Description - EDITABLE */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Description
                  </p>

                  {isEditing ? (
                    <Input
                      value={editDescription}
                      onChange={(e) =>
                        setEditDescription(e.target.value)
                      }
                      placeholder="Enter description"
                    />
                  ) : (
                    <p className="font-semibold text-base">
                      {selectedExpense.description || 'Expense'}
                    </p>
                  )}
                </div>

                {/* Amount - READ ONLY */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Amount
                  </p>

                  <p className="text-2xl font-bold">
                    ₱{parseFloat(selectedExpense.amount).toFixed(2)}
                  </p>
                </div>

                {/* Category - EDITABLE */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Category
                  </p>

                  {isEditing ? (
                    <Select
                      value={editCategory}
                      onValueChange={(value) => setEditCategory(value ?? '')}
                    >
                      <SelectTrigger className="w-full">
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
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        selectedExpense.category
                      )}`}
                    >
                      {selectedExpense.category || 'Other'}
                    </span>
                  )}
                </div>

                {/* Merchant - EDITABLE */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Merchant
                  </p>

                  {isEditing ? (
                    <Input
                      value={editMerchant}
                      onChange={(e) =>
                        setEditMerchant(e.target.value)
                      }
                      placeholder="Enter merchant"
                    />
                  ) : (
                    <p className="font-medium">
                      {selectedExpense.merchant || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Date - READ ONLY */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Date
                  </p>

                  <p className="font-medium">
                    {new Date(
                      selectedExpense.date
                    ).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* ID - READ ONLY */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Transaction ID
                  </p>

                  <p className="text-xs text-muted-foreground break-all">
                    {selectedExpense.id}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t space-y-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="default"
                      className="w-full"
                      disabled={isSaving}
                      onClick={handleSave}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving
                        ? 'Saving...'
                        : 'Save Changes'}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={isSaving}
                      onClick={handleCancelEdit}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleEdit}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Transaction
                    </Button>

                    <Button
                      variant="default"
                      className="w-full p-5 bg-red-600 text-white hover:bg-red-700"
                      disabled={
                        isDeleting === selectedExpense.id
                      }
                      onClick={() =>
                        handleDelete(selectedExpense)
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting === selectedExpense.id
                        ? 'Deleting...'
                        : 'Delete Transaction'}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
                "{deleteExpense?.description ||
                  'this transaction'}"
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
                  confirmDelete(deleteExpense.id)
                }
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
