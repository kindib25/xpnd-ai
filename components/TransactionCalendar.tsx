'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TransactionCalendarProps {
  expenses: any[]
  onDateClick: (expenses: any[], date: string) => void
}

export function TransactionCalendar({
  expenses,
  onDateClick,
}: TransactionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const getDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`
  }

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {}

    expenses.forEach((expense) => {
      if (!expense.date || !expense.amount) return

      const date = new Date(expense.date)
      const key = getDateKey(date)

      totals[key] = (totals[key] || 0) + Number(expense.amount)
    })

    return totals
  }, [expenses])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Monday = 0
    const startingDay = (firstDay.getDay() + 6) % 7

    const days: Date[] = []

    for (let i = startingDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i))
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }

    const remainingDays = 42 - days.length

    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day))
    }

    return days
  }, [year, month])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 sm:p-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h2 className="text-sm font-semibold">
            {monthName}
          </h2>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const dateKey = getDateKey(date)
            const amount = dailyTotals[dateKey] || 0
            const isCurrentMonth = date.getMonth() === month
            const isToday = dateKey === getDateKey(new Date())

            const dayExpenses = expenses.filter((expense) => {
              if (!expense.date) return false

              return getDateKey(new Date(expense.date)) === dateKey
            })

            return (
              <button
                key={`${dateKey}-${index}`}
                type="button"
                onClick={() => {
                  if (dayExpenses.length > 0) {
                    onDateClick(dayExpenses, dateKey)
                  }
                }}
                className={`
                  relative min-h-[62px] sm:min-h-[75px]
                  border border-border/40
                  p-1 sm:p-1.5
                  transition-colors
                  text-left
                  ${
                    isCurrentMonth
                      ? 'hover:bg-muted/50'
                      : 'text-muted-foreground/40'
                  }
                  ${
                    dayExpenses.length > 0
                      ? 'cursor-pointer'
                      : 'cursor-default'
                  }
                `}
              >
                <div className="flex justify-center">
                  <span
                    className={`
                      flex h-6 w-6 items-center justify-center
                      rounded-full text-xs sm:text-sm
                      ${
                        isToday
                          ? 'bg-primary text-primary-foreground font-bold'
                          : ''
                      }
                    `}
                  >
                    {date.getDate()}
                  </span>
                </div>

                {amount > 0 && isCurrentMonth && (
                  <div className="mt-1 text-center">
                    <span className="text-[9px] sm:text-[11px] font-medium text-red-500 dark:text-red-400">
                      ₱
                      {amount.toLocaleString('en-PH', {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}