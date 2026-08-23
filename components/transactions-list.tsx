'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Search, SlidersHorizontal } from 'lucide-react'
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
import { toast } from 'sonner'
import { TransactionCalendar } from './TransactionCalendar'


interface TransactionsListProps {
  expenses: any[]
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  'Transportation': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Shopping': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  'Entertainment': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
  'Healthcare': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  'Education': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  'Travel': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
  'Utilities': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
  'Personal Care': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
}

export function TransactionsList({ expenses }: TransactionsListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteExpense, setDeleteExpense] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 5

  const router = useRouter()

  const [selectedExpense, setSelectedExpense] = useState<any | null>(null)

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
      router.refresh()
    } catch (error) {
      console.error('Failed to delete expense:', error)
      toast.error('Failed to delete transaction.')
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredExpenses = expenses.filter(exp =>
    exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    return CATEGORY_COLORS[category] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
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
              setSelectedExpense(dayExpenses[0])
              return
            }

            setSelectedExpense(dayExpenses[0])
          }}
        />
      </section>

      {/* Transactions Section */}
      <section className="space-y-3">
        <h2 className="text-lg md:text-xl font-semibold">
          Transactions
        </h2>

        {/* Search and Filter */}
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
                    onClick={() => setSelectedExpense(expense)}
                    className="p-3 md:p-4 hover:bg-muted/50 transition-colors flex items-center gap-2 md:gap-4 group cursor-pointer"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 text-base md:text-lg">
                      {/* Icon Here*/}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 mr-8 md:mr-0">
                      <h3 className="font-semibold text-xs md:text-base truncate">
                        {expense.description || 'Expense'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Category Badge - Hidden on small mobile */}
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
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
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="rounded-lg"
            >
              Next
            </Button>
          </div>
        )}
      </section>

      <Dialog
        open={!!selectedExpense}
        onOpenChange={(open) => {
          if (!open) setSelectedExpense(null)
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
                {/* Description */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="font-semibold text-base">
                    {selectedExpense.description || 'Expense'}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Amount
                  </p>
                  <p className="text-2xl font-bold">
                    ₱{parseFloat(selectedExpense.amount).toFixed(2)}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Category
                  </p>

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      selectedExpense.category
                    )}`}
                  >
                    {selectedExpense.category || 'Other'}
                  </span>
                </div>

                {/* Merchant */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Merchant
                  </p>
                  <p className="font-medium">
                    {selectedExpense.merchant || 'Not specified'}
                  </p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Date
                  </p>
                  <p className="font-medium">
                    {new Date(selectedExpense.date).toLocaleDateString(
                      'en-US',
                      {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </p>
                </div>


                {/* ID */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Transaction ID
                  </p>
                  <p className="text-xs text-muted-foreground break-all">
                    {selectedExpense.id}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="default"
                  className="w-full p-5 bg-red-600 text-white hover:bg-red-700"
                  disabled={isDeleting === selectedExpense.id}
                  onClick={() => handleDelete(selectedExpense)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting === selectedExpense.id
                    ? 'Deleting...'
                    : 'Delete Transaction'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>

      </Dialog>
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
                "{deleteExpense?.description || 'this transaction'}"
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
