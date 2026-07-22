import { AddExpenseForm } from '@/components/add-expense-form'

export default function AddExpensePage() {
  return (
    <div className="w-full p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <button className="flex items-center gap-2 text-primary hover:text-primary/80 mb-3 md:mb-4 transition-colors text-sm md:text-base">
          <span>←</span>
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-xl md:text-3xl font-bold">Add Expense</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Type naturally, let AI handle the rest
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <AddExpenseForm />
      </div>
    </div>
  )
}
