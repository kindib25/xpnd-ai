'use client'

import { useState } from 'react'
import { AddExpenseForm } from '@/components/add-expense-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AddExpensePage() {
  const [isAILoading, setIsAILoading] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  return (
    <div className="w-full p-6 md:p-8 max-w-7xl mx-auto">
      {!isAILoading && !isPreview && (
        <div className="mb-6 md:mb-8">
          {/* Mobile Header */}
          <div className="md:hidden">
            <div className="relative flex items-center justify-center h-10 mt-3">
              <Link
                href="/dashboard"
                className="absolute left-0 text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>

              <h1 className="text-2xl font-bold">Add Expense</h1>
            </div>

            <p className="text-center text-xs text-white/70 mt-1">
              Type naturally, let AI handle the rest
            </p>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="font-medium text-lg">Back</span>
            </Link>

            <h1 className="text-3xl font-bold">Add Expense</h1>

            <p className="text-sm text-white/70 mt-1">
              Type naturally, let AI handle the rest
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <AddExpenseForm
          onLoadingChange={setIsAILoading}
          onPreviewChange={setIsPreview}
        />
      </div>
    </div>
  )
}