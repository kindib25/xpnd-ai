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
import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react'
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

const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

const HAIRLINE =
  'pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'

const INPUT_GLASS =
  'h-10 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground ' +
  'shadow-sm backdrop-blur-xl ' +
  'transition-[border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
  'hover:bg-foreground/5 ' +
  'focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white dark:placeholder:text-white/35 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:hover:border-white/[0.20] dark:hover:bg-white/[0.06]'

// Category chips — vibrant in light mode, glowing in dark mode
const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-400/25',
  Transportation: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/25',
  Shopping: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-400/25',
  Entertainment: 'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-400/25',
  Healthcare: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/25',
  Education: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/25',
  Travel: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-400/25',
  Utilities: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-400/25',
  'Personal Care': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/25',
  Other: 'bg-muted text-muted-foreground border-border dark:bg-white/[0.06] dark:text-white/70 dark:border-white/[0.14]',
}

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Healthcare', 'Education', 'Travel', 'Utilities', 'Personal Care', 'Other',
]

const getCategoryColor = (category: string) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other
}

function SwipeableSheetContent({
  onClose,
  open,
  children,
  style,
  ...props
}: React.ComponentProps<typeof SheetContent> & {
  onClose: () => void
  open: boolean
}) {
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  const [offsetY, setOffsetY] = useState(0)

  const startY = useRef(0)
  const lastY = useRef(0)
  const lastT = useRef(0)
  const velocity = useRef(0)
  const dragging = useRef(false)
  const offsetRef = useRef(0)
  const onCloseRef = useRef(onClose)

  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useLayoutEffect(() => {
    if (open) { offsetRef.current = 0; setOffsetY(0) }
  }, [open])

  useEffect(() => {
    if (!node) return
    const getScroller = () => node.querySelector<HTMLElement>('[data-sheet-scrollable]')

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const scroller = getScroller()
      if (scroller && scroller.scrollTop > 0) return
      startY.current = e.touches[0].clientY
      lastY.current = startY.current
      lastT.current = performance.now()
      velocity.current = 0
      dragging.current = true
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return
      const y = e.touches[0].clientY
      const now = performance.now()
      const dt = now - lastT.current
      if (dt > 0) velocity.current = (y - lastY.current) / dt
      lastY.current = y
      lastT.current = now
      const delta = Math.max(0, y - startY.current)
      offsetRef.current = delta
      setOffsetY(delta)
      if (delta > 0 && e.cancelable) e.preventDefault()
    }

    const onTouchEnd = () => {
      if (!dragging.current) return
      dragging.current = false
      const shouldClose = offsetRef.current > 110 || velocity.current > 0.55
      offsetRef.current = 0
      setOffsetY(0)
      if (shouldClose) onCloseRef.current()
    }

    node.addEventListener('touchstart', onTouchStart, { passive: true })
    node.addEventListener('touchmove', onTouchMove, { passive: false })
    node.addEventListener('touchend', onTouchEnd)
    node.addEventListener('touchcancel', onTouchEnd)

    return () => {
      node.removeEventListener('touchstart', onTouchStart)
      node.removeEventListener('touchmove', onTouchMove)
      node.removeEventListener('touchend', onTouchEnd)
      node.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [node])

  return (
    <SheetContent
      ref={setNode}
      style={{
        ...(offsetY > 0 ? { transform: `translateY(${offsetY}px)`, transition: 'none' } : { transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)' }),
        ...style,
      }}
      {...props}
    >
      {children}
    </SheetContent>
  )
}

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [editAmount, setEditAmount] = useState(String(expense.amount ?? ''))
  const [editDescription, setEditDescription] = useState(expense.description || '')
  const [editCategory, setEditCategory] = useState(expense.category || '')
  const [editMerchant, setEditMerchant] = useState(expense.merchant || '')

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
    if (!editAmount.trim() || isNaN(amount) || amount <= 0) return toast.error('Please enter a valid amount.')
    if (!editDescription.trim()) return toast.error('Description cannot be empty.')
    if (!editCategory) return toast.error('Please select a category.')

    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('expenses')
        .update({ amount, description: editDescription.trim(), category: editCategory, merchant: editMerchant.trim() || null })
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
      const { error } = await supabase.from('expenses').delete().eq('id', expense.id)
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
      <div className="divide-y divide-border dark:divide-white/[0.06]">
        {/* Amount */}
        <div className="bg-muted/30 px-4 py-5 dark:bg-white/[0.025]">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 shadow-sm dark:border-primary/25">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground dark:text-white/50">Amount</p>
          </div>

          {isEditing ? (
            <div className="ml-11 flex items-center gap-2 border-b-2 border-primary/60">
              <span className="text-2xl font-semibold text-foreground dark:text-white">₱</span>
              <Input
                type="number" inputMode="decimal" min="0" step="0.01"
                value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                placeholder="0.00"
                className="h-10 border-0 bg-transparent px-0 text-2xl font-bold text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 dark:text-white dark:placeholder:text-white/30"
              />
            </div>
          ) : (
            <p className="ml-11 text-3xl font-bold tracking-tight tabular-nums text-foreground dark:text-white">
              ₱{parseFloat(expense.amount).toFixed(2)}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="flex gap-3 px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.045]">
            <Tag className="h-4 w-4 text-muted-foreground dark:text-white/60" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-medium text-muted-foreground dark:text-white/50">Category</p>
            {isEditing ? (
              <Select value={editCategory} onValueChange={(value) => setEditCategory(value ?? '')}>
                <SelectTrigger className="h-10 w-full rounded-xl border-border bg-background text-foreground shadow-sm backdrop-blur-xl transition-colors hover:bg-foreground/5 focus:border-primary/50 focus:ring-2 focus:ring-primary/30 dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card text-card-foreground shadow-xl backdrop-blur-2xl dark:border-white/[0.14] dark:bg-[#151922]/95 dark:text-white">
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category} className="focus:bg-primary focus:text-primary-foreground">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-xl ${getCategoryColor(expense.category)}`}>
                {expense.category || 'Other'}
              </span>
            )}
          </div>
        </div>

        {/* Merchant */}
        <div className="flex gap-3 px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.045]">
            <Store className="h-4 w-4 text-muted-foreground dark:text-white/60" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-medium text-muted-foreground dark:text-white/50">Merchant</p>
            {isEditing ? (
              <Input value={editMerchant} onChange={(e) => setEditMerchant(e.target.value)} placeholder="Enter merchant" className={INPUT_GLASS} />
            ) : (
              <p className="break-words text-sm font-semibold text-foreground dark:text-white/95">{expense.merchant || 'Not specified'}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex gap-3 px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.045]">
            <FileText className="h-4 w-4 text-muted-foreground dark:text-white/60" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-medium text-muted-foreground dark:text-white/50">Description</p>
            {isEditing ? (
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Enter description" className={INPUT_GLASS} />
            ) : (
              <p className="break-words text-sm font-semibold text-foreground dark:text-white/95">{expense.description || 'Expense'}</p>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex gap-3 px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 shadow-sm dark:border-white/[0.10] dark:bg-white/[0.045]">
            <CalendarDays className="h-4 w-4 text-muted-foreground dark:text-white/60" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-medium text-muted-foreground dark:text-white/50">Date</p>
            <p className="text-sm font-semibold text-foreground dark:text-white/95">
              {new Date(expense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Transaction ID */}
        <div className="bg-muted/10 px-4 py-4 dark:bg-white/[0.015]">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground dark:text-white/45">Transaction ID</p>
          <p className="break-all text-[11px] leading-relaxed text-muted-foreground dark:text-white/50">{expense.id}</p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="relative border-t border-border p-4 dark:border-white/[0.06]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40" />

        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={`${FOCUS_RING} h-11 flex-1 rounded-xl border-border bg-background text-foreground shadow-sm hover:bg-foreground/5 dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white dark:hover:bg-white/[0.10]`}
              disabled={isSaving}
              onClick={handleCancelEdit}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>

            <Button
              className={`${FOCUS_RING} h-11 flex-1 rounded-xl border border-primary/30 bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-300 hover:scale-[1.02] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={isSaving || !editAmount || Number(editAmount) <= 0}
              onClick={handleSave}
            >
              <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={`${FOCUS_RING} h-11 flex-1 rounded-xl border-border bg-background text-foreground shadow-sm hover:bg-foreground/5 dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white dark:hover:bg-white/[0.10]`}
              onClick={handleEdit}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>

            <Button
              variant="destructive"
              className={`${FOCUS_RING} h-11 flex-1 rounded-xl border border-red-200 bg-red-50 font-semibold text-red-600 shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_-8px_rgba(248,113,113,0.55)] dark:hover:border-red-400/50 dark:hover:bg-red-500/30 dark:hover:text-red-100`}
              disabled={isDeleting}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={(open) => { if (!open && !isDeleting) setShowDeleteConfirm(false) }}>
        <AlertDialogContent className="fixed left-1/2 top-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[26px] border border-border bg-background text-foreground shadow-xl backdrop-blur-2xl dark:border-white/[0.14] dark:bg-[#151922]/90 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-40px_rgba(0,0,0,0.95)]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40" />
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground dark:text-white/60">
              Are you sure you want to delete <span className="font-semibold text-foreground dark:text-white/95">"{expense.description || 'this transaction'}"</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className={`${FOCUS_RING} rounded-xl border-border bg-background text-foreground hover:bg-foreground/5 dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white dark:hover:bg-white/[0.10]`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={confirmDelete} className={`${FOCUS_RING} rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30`}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function TransactionsList({ expenses }: TransactionsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dateExpenses, setDateExpenses] = useState<any[]>([])
  const [searchSheetExpense, setSearchSheetExpense] = useState<any | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const ITEMS_PER_PAGE = 5
  const router = useRouter()

  useEffect(() => {
    if (selectedDate && dateExpenses.length === 0) setSelectedDate(null)
  }, [dateExpenses, selectedDate])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsSearchOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredExpenses = expenses.filter(
    (exp) => exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) || exp.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE)
  const paginatedExpenses = filteredExpenses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background transition-colors duration-500 dark:bg-[radial-gradient(120%_120%_at_50%_0%,#30333a_0%,#1a1d22_42%,#13161a_72%,#0f1115_100%)]" />
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-primary/10 dark:bg-primary/15 blur-[130px]" />
        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-primary/5 dark:bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/10 blur-[140px]" />
      </div>

      <div className="relative w-full space-y-5 text-foreground md:space-y-6">
        
        {/* SEARCH */}
        <section ref={searchRef} className="relative z-30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-white/45" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true) }}
              onFocus={() => setIsSearchOpen(true)}
              className={`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 h-11 rounded-full border-border bg-background/50 pl-10 text-sm text-foreground placeholder:text-muted-foreground shadow-sm backdrop-blur-xl transition-all duration-300 ${EASE} hover:bg-foreground/5 md:text-base dark:border-white/[0.14] dark:bg-white/[0.055] dark:text-white dark:placeholder:text-white/35 dark:hover:bg-white/[0.075]`}
            />
          </div>

          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card/95 text-card-foreground shadow-xl backdrop-blur-2xl dark:border-white/[0.14] dark:bg-[#151922]/95 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_30px_80px_-30px_rgba(0,0,0,0.95)]">
              <div aria-hidden="true" className={HAIRLINE} />
              {filteredExpenses.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground dark:text-white/55">No transactions found</div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto">
                  <div className="divide-y divide-border dark:divide-white/[0.06]">
                    {paginatedExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        onClick={() => { setSearchSheetExpense(expense); setIsSearchOpen(false) }}
                        className={`group flex cursor-pointer items-center gap-2 p-3 transition-all duration-300 ${EASE} hover:bg-foreground/5 md:gap-3 dark:hover:bg-white/[0.055]`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/50 shadow-sm backdrop-blur-xl dark:border-white/[0.10] dark:bg-white/[0.045]">
                          <Wallet className="h-4 w-4 text-muted-foreground dark:text-white/60" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-foreground dark:text-white/95">{expense.description || 'Expense'}</h3>
                          <p className="text-xs text-muted-foreground dark:text-white/55">
                            {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <span className={`hidden whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium shadow-sm backdrop-blur-xl sm:inline-flex ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                        <p className="min-w-fit text-right text-sm font-semibold tabular-nums text-foreground dark:text-white/95">₱{parseFloat(expense.amount).toFixed(0)}</p>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 dark:border-white/[0.06]">
                      <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className={`${FOCUS_RING} h-8 rounded-lg border-border bg-background px-3 text-xs text-foreground hover:bg-foreground/5 dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white dark:hover:bg-white/[0.10]`}>
                        Previous
                      </Button>
                      <div className="text-xs text-muted-foreground dark:text-white/55">Page {currentPage} of {totalPages}</div>
                      <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className={`${FOCUS_RING} h-8 rounded-lg border-border bg-background px-3 text-xs text-foreground hover:bg-foreground/5 dark:border-white/[0.14] dark:bg-white/[0.045] dark:text-white dark:hover:bg-white/[0.10]`}>
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* CALENDAR */}
        <section className="space-y-3">
          <TransactionCalendar
            expenses={expenses}
            onDateClick={(dayExpenses, dateKey) => {
              if (dayExpenses.length > 0) { setDateExpenses(dayExpenses); setSelectedDate(dateKey) }
            }}
          />
        </section>

        {/* DATE TRANSACTIONS SHEET */}
        <Sheet open={!!selectedDate} onOpenChange={(open) => { if (!open) { setSelectedDate(null); setDateExpenses([]) } }}>
          <SwipeableSheetContent
            open={!!selectedDate}
            onClose={() => { setSelectedDate(null); setDateExpenses([]) }}
            side="bottom"
            className="w-full mx-auto max-w-2xl rounded-t-[26px] rounded-b-none border-x border-t border-b-0 border-border bg-card/95 p-0 text-card-foreground shadow-2xl backdrop-blur-2xl [&>button]:hidden focus:outline-none dark:border-white/[0.14] dark:bg-[#151922]/90 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_-30px_80px_-40px_rgba(0,0,0,0.95)]"
          >
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1.5 w-10 rounded-full bg-foreground/20 dark:bg-white/25" />
            </div>

            <SheetHeader className="relative border-b border-border px-4 py-4 text-left dark:border-white/[0.06]">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40" />
              <div className="mx-auto w-full max-w-3xl">
                <SheetTitle className="text-base font-semibold text-foreground dark:text-white">
                  {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground dark:text-white/55">
                  {dateExpenses.length} {dateExpenses.length === 1 ? 'transaction' : 'transactions'} · ₱{dateExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0).toFixed(2)}
                </SheetDescription>
              </div>
            </SheetHeader>

            <div data-sheet-scrollable className="max-h-[75vh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
              <div className="mx-auto w-full max-w-3xl">
                {dateExpenses.map((expense, index) => (
                  <div key={expense.id} className={index > 0 ? 'border-t border-border dark:border-white/[0.10]' : ''}>
                    <TransactionDetailCard
                      expense={expense}
                      onUpdated={(updated) => { setDateExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e))) }}
                      onDeleted={(id) => { setDateExpenses((prev) => prev.filter((e) => e.id !== id)) }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </SwipeableSheetContent>
        </Sheet>

        {/* SEARCH RESULT SHEET */}
        <Sheet open={!!searchSheetExpense} onOpenChange={(open) => { if (!open) setSearchSheetExpense(null) }}>
          <SwipeableSheetContent
            open={!!searchSheetExpense}
            onClose={() => setSearchSheetExpense(null)}
            side="bottom"
            className="w-full mx-auto max-w-2xl rounded-t-[26px] rounded-b-none border-x border-t border-b-0 border-border bg-card/95 p-0 text-card-foreground shadow-2xl backdrop-blur-2xl [&>button]:hidden focus:outline-none dark:border-white/[0.14] dark:bg-[#151922]/90 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_-30px_80px_-40px_rgba(0,0,0,0.95)]"
          >
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1.5 w-10 rounded-full bg-foreground/20 dark:bg-white/25" />
            </div>

            <SheetHeader className="relative border-b border-border px-4 py-4 text-left dark:border-white/[0.06]">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 dark:via-white/40" />
              <div className="mx-auto w-full max-w-3xl">
                <SheetTitle className="text-base font-semibold text-foreground dark:text-white">Transaction Details</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground dark:text-white/55">
                  {searchSheetExpense ? new Date(searchSheetExpense.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                </SheetDescription>
              </div>
            </SheetHeader>

            <div data-sheet-scrollable className="max-h-[75vh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
              <div className="mx-auto w-full max-w-3xl">
                {searchSheetExpense && (
                  <TransactionDetailCard
                    key={searchSheetExpense.id}
                    expense={searchSheetExpense}
                    onUpdated={(updated) => setSearchSheetExpense(updated)}
                    onDeleted={() => setSearchSheetExpense(null)}
                  />
                )}
              </div>
            </div>
          </SwipeableSheetContent>
        </Sheet>
      </div>
    </>
  )
}