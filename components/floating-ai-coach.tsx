'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Loader2,
  Sparkles,
  AlertCircle,
  X,
  MessageCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Coach persona — constants
// ---------------------------------------------------------------------------
const COACH = {
  name: 'Kai',
  role: 'AI Financial Coach',
  status: 'Online',
} as const

const COACH_GREETINGS = [
  "Hey! I'm Kai, your financial coach. Let's see what your spending says about your money habits.",
  "Here's your money check-in. I'll help you understand your expenses and stay on budget.",
  "Your spending tells a story. Let's find patterns and discover where you can save more.",
  "Let's review your finances. I'll highlight your spending habits, budget progress, and opportunities to save.",
] as const

const COACH_EMPTY_STATE =
  "Tap “Get insight” and I'll break down where your money's going — plus one move to improve it."

const FAB_SIZE = 64
const FAB_MARGIN = 20
const BUBBLE_RESERVE = 340

/**
 * Extra bottom clearance on small screens so the FAB never overlaps the
 * mobile bottom navigation on first paint. Tune this to match your nav's
 * actual height (typical mobile bottom navs are 64–80px, plus a little
 * breathing room).
 */
const MOBILE_NAV_CLEARANCE = 80
const MOBILE_BREAKPOINT = 768 // matches Tailwind's `md`

/** How far from the bottom edge the FAB is allowed to sit. */
function getBottomOffset(viewportWidth: number) {
  const isMobile = viewportWidth < MOBILE_BREAKPOINT
  return FAB_MARGIN + (isMobile ? MOBILE_NAV_CLEARANCE : 0)
}

// ---------------------------------------------------------------------------
// Coach avatar
// ---------------------------------------------------------------------------
function CoachAvatar({
  size = 40,
  thinking = false,
  className = '',
}: {
  size?: number
  thinking?: boolean
  className?: string
}) {
  return (
    <div
      className={`pointer-events-none relative shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src="/ai-agent.png" // <-- your filename in /public
        alt=""
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className="pointer-events-none h-full w-full select-none rounded-full border border-white/10 object-cover shadow-[0_0_20px_-4px_rgba(105,69,255,0.85)]"
      />
      {thinking && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-[#0D1626]/50 backdrop-blur-[1px]">
          <span className="h-2.5 w-2.5 animate-ping rounded-full bg-[#65E8FF]" />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Draggable FAB + chat bubble (presentational)
// ---------------------------------------------------------------------------
interface FloatingAIAssistantProps {
  insight: string | null
  isLoading: boolean
  error: string | null
  onGenerate: () => void
  disabled?: boolean
}

function FloatingAIAssistant({
  insight,
  isLoading,
  error,
  onGenerate,
  disabled,
}: FloatingAIAssistantProps) {
  const [open, setOpen] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })

  const [greeting] = useState(
    () => COACH_GREETINGS[Math.floor(Math.random() * COACH_GREETINGS.length)]
  )

  const dragRef = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    moved: false,
  })
  const suppressClickRef = useRef(false)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const bottomOffset = getBottomOffset(w)

      setViewport({ w, h })
      setPos((prev) => {
        // First paint — snap to bottom-right, above the mobile nav if any.
        if (!prev) {
          return {
            x: w - FAB_SIZE - FAB_MARGIN,
            y: h - FAB_SIZE - bottomOffset,
          }
        }

        // On resize, re-clamp into the safe area so it can't hide behind
        // the mobile nav or get pushed off-screen.
        return {
          x: Math.max(
            FAB_MARGIN,
            Math.min(w - FAB_SIZE - FAB_MARGIN, prev.x)
          ),
          y: Math.max(
            FAB_MARGIN,
            Math.min(h - FAB_SIZE - bottomOffset, prev.y)
          ),
        }
      })
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pos) return
    suppressClickRef.current = false
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
      moved: false,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current.pointerId !== e.pointerId) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY

    if (!dragRef.current.moved && Math.hypot(dx, dy) > 4) {
      dragRef.current.moved = true
      setDragging(true)
      setOpen(false)
    }

    if (dragRef.current.moved) {
      const bottomOffset = getBottomOffset(viewport.w)
      const newX = Math.max(
        FAB_MARGIN,
        Math.min(
          viewport.w - FAB_SIZE - FAB_MARGIN,
          dragRef.current.startPosX + dx
        )
      )
      const newY = Math.max(
        FAB_MARGIN,
        Math.min(
          viewport.h - FAB_SIZE - bottomOffset,
          dragRef.current.startPosY + dy
        )
      )
      setPos({ x: newX, y: newY })
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current.pointerId !== e.pointerId) return
    if (dragRef.current.moved) {
      suppressClickRef.current = true
    }
    dragRef.current.pointerId = null
    setDragging(false)
  }

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next && !hasRequested && !insight && !isLoading && !disabled) {
      setHasRequested(true)
      onGenerate()
    }
  }

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    handleToggle()
  }

  const bottomOffset = getBottomOffset(viewport.w)
  const openUpward = pos
    ? pos.y + FAB_SIZE + BUBBLE_RESERVE > viewport.h - bottomOffset
    : true
  const alignRight = pos ? pos.x + FAB_SIZE / 2 > viewport.w / 2 : true

  if (!pos) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 50,
        touchAction: 'none',
      }}
    >
      {open && (
        <div
          role="dialog"
          aria-label={`${COACH.name}, ${COACH.role}`}
          className={`
            absolute w-[min(92vw,368px)] overflow-hidden rounded-3xl
            border border-white/[0.14] bg-[#0D1626]/95 backdrop-blur-2xl
            shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_28px_70px_-22px_rgba(0,0,0,0.9)]
            animate-in fade-in duration-200
            ${openUpward ? 'bottom-full mb-3 slide-in-from-bottom-3' : 'top-full mt-3 slide-in-from-top-3'}
            ${alignRight ? 'right-0' : 'left-0'}
          `}
        >
          <div
            aria-hidden="true"
            className="h-[3px] w-full bg-[linear-gradient(90deg,#7CFF3A,#65E8FF,#6945FF)]"
          />

          <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <CoachAvatar size={40} thinking={isLoading} />
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white">
                    {COACH.name}
                  </p>
                  <span className="rounded-full border border-[#7CFF3A]/30 bg-[#7CFF3A]/10 px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wide text-[#c8ff75]">
                    Coach
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/50">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7CFF3A] shadow-[0_0_6px_rgba(124,255,58,0.9)]" />
                  {COACH.role} · {COACH.status}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close coach"
              className="
                grid h-7 w-7 place-items-center rounded-full
                text-white/55 transition-colors
                hover:bg-white/[0.08] hover:text-white
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4b5fd]
              "
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3 px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <CoachAvatar size={28} className="mt-0.5" />
              <div className="relative rounded-2xl rounded-tl-sm border border-white/[0.10] bg-white/[0.05] px-3.5 py-2.5 text-[13px] leading-relaxed text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {greeting}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-7 shrink-0" aria-hidden="true" />
              <div
                className="
                  relative flex-1 rounded-2xl rounded-tl-sm
                  border border-white/[0.10] bg-[linear-gradient(180deg,rgba(105,69,255,0.14),rgba(255,255,255,0.04))]
                  px-3.5 py-3 text-[13px] leading-relaxed text-white/90
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                "
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 text-white/75">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c8ff75] [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c8ff75] [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c8ff75]" />
                    </span>
                    Kai is reviewing your numbers…
                  </span>
                ) : error ? (
                  <span className="flex items-start gap-2 text-red-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                    <span>{error}</span>
                  </span>
                ) : insight ? (
                  insight
                ) : (
                  <span className="text-white/55">{COACH_EMPTY_STATE}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="flex items-center gap-1.5 text-[10px] text-white/35">
                <MessageCircle className="h-3 w-3" />
                Powered by Xpnd AI
              </span>

              <button
                type="button"
                onClick={onGenerate}
                disabled={isLoading || disabled}
                className="
                  inline-flex items-center gap-1.5 rounded-xl
                  border border-[#6930FF]/40 bg-gradient-to-r from-[#6930FF] to-[#7538FF]
                  px-3.5 py-2 text-xs font-semibold text-white
                  shadow-[0_0_16px_rgba(105,69,255,0.35)]
                  transition-all duration-200
                  hover:scale-[1.02] hover:shadow-[0_0_22px_rgba(105,69,255,0.5)]
                  disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4b5fd]
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Coaching…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {insight ? 'Refresh coaching' : 'Get insight'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        aria-label={
          open
            ? `Close ${COACH.name}, ${COACH.role}`
            : `Open ${COACH.name}, ${COACH.role}`
        }
        aria-expanded={open}
        style={{ touchAction: 'none', width: FAB_SIZE, height: FAB_SIZE }}
        className={`
          group relative grid select-none place-items-center rounded-full
          transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${dragging ? 'scale-105 cursor-grabbing' : 'cursor-grab hover:scale-[1.06]'}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4b5fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#13161a]
        `}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-full bg-[#6945FF]/45 blur-xl opacity-70"
        />

        {!open && insight && !isLoading && (
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#7CFF3A]/25"
          />
        )}

        {open ? (
          <div className="grid h-full w-full place-items-center rounded-full border border-white/[0.16] bg-[#0D1626]/90 backdrop-blur-xl">
            <X className="h-6 w-6 text-white" />
          </div>
        ) : (
          <CoachAvatar size={FAB_SIZE} thinking={isLoading} />
        )}

        {!open && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-[#0D1626] bg-[#0D1626]"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#7CFF3A] shadow-[0_0_8px_rgba(124,255,58,0.95)]" />
          </span>
        )}

        {!open && insight && !isLoading && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-0.5 right-1 h-2.5 w-2.5 rounded-full bg-[#65E8FF] ring-2 ring-[#0D1626]"
          />
        )}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FloatingAICoach — self-contained wrapper (fetch data + render coach)
// ---------------------------------------------------------------------------
export function FloatingAICoach() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [isLoadingInsight, setIsLoadingInsight] = useState(false)
  const [insightError, setInsightError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // Fetch user's data once on mount so the coach works on any page.
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (!cancelled) setReady(true)
          return
        }

        const [expRes, budRes] = await Promise.all([
          supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false }),
          supabase.from('budgets').select('*').eq('user_id', user.id),
        ])

        if (cancelled) return
        setExpenses(expRes.data || [])
        setBudgets(budRes.data || [])
      } catch (err) {
        console.error('[coach] Failed to load data:', err)
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function generateInsight() {
    setIsLoadingInsight(true)
    setInsightError(null)

    try {
      const response = await fetch('/api/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses, budgets }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate an insight')
      }

      setAiInsight(data.insight)
    } catch (error) {
      console.error('[coach] Insight request failed:', error)
      setInsightError(
        "I couldn't pull your numbers just now. Give me a moment and try again."
      )
    } finally {
      setIsLoadingInsight(false)
    }
  }

  return (
    <FloatingAIAssistant
      insight={aiInsight}
      isLoading={isLoadingInsight}
      error={insightError}
      onGenerate={generateInsight}
      disabled={!ready || expenses.length === 0}
    />
  )
}