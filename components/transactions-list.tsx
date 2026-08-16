'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Search, SlidersHorizontal } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

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
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    setIsDeleting(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('expenses').delete().eq('id', id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      alert('Failed to delete expense')
    } finally {
      setIsDeleting(null)
    }
  }

  const filteredExpenses = expenses.filter(exp =>
    exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
  }

  return (
    <div className="w-full space-y-3 md:space-y-4">
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
        <Button variant="outline" size="icon" className="rounded-full flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Tags */}
      <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
        {['All', 'Today', 'This Week', 'This Month'].map((filter) => (
          <button
            key={filter}
            className="px-3 py-1 text-xs md:text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors flex-shrink-0"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Transactions */}
      <Card>
        <CardContent className="p-0">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-muted-foreground">
              <p className="text-sm md:text-base">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-3 md:p-4 hover:bg-muted/50 transition-colors flex items-center gap-2 md:gap-4 group"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 text-base md:text-lg">
                    {/* Icon Here*/}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm md:text-base truncate">
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
                  <p className="font-semibold text-sm md:text-base text-right min-w-fit">
                    ₱{parseFloat(expense.amount).toFixed(0)}
                  </p>

                  {/* Delete Button - Show on mobile, hover on desktop */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(expense.id)}
                    disabled={isDeleting === expense.id}
                    className="md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
