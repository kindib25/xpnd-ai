'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

interface AnalyticsClientProps {
  expenses: any[]
}

const COLORS = ['#9ee82d', '#7dd3fc', '#c4b5fd', '#f9a8d4', '#fbbf24', '#5eead4', '#a5b4fc', '#fda4af']

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
]

// ---------------------------------------------------------------------------
// Glass design tokens — extracted from the study so the recipe can't drift
// ---------------------------------------------------------------------------
const EASE = 'ease-[cubic-bezier(0.16,1,0.3,1)]'

const GLASS_SURFACE =
  'relative overflow-hidden rounded-[26px] border border-white/[0.14] bg-white/[0.075] backdrop-blur-xl ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)]'

const GLASS_SURFACE_DEEP =
  'relative overflow-hidden rounded-[26px] border border-white/[0.14] bg-[#151922]/70 backdrop-blur-2xl ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_-35px_rgba(0,0,0,0.85)]'

const HAIRLINE =
  'pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4b5fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#13161a]'

// ---------------------------------------------------------------------------
// Pie callout labels — leader lines from each slice out to a readable label.
// ---------------------------------------------------------------------------
const RADIAN = Math.PI / 180

/** True below `breakpoint` px. Used to slim the callouts down on phones. */
function useIsNarrow(breakpoint = 640) {
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const sync = () => setIsNarrow(mq.matches)

    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [breakpoint])

  return isNarrow
}

/**
 * Callback ref that reports the element's pixel size and keeps it in sync.
 * A callback ref (rather than useRef + useEffect) means it re-attaches every
 * time the chart mounts — e.g. after switching tabs away and back.
 */
function useMeasuredSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const observer = useRef<ResizeObserver | null>(null)

  const ref = useCallback((node: HTMLDivElement | null) => {
    observer.current?.disconnect()
    if (!node) return

    const measure = () => {
      const rect = node.getBoundingClientRect()
      setSize((prev) =>
        prev.width === rect.width && prev.height === rect.height
          ? prev
          : { width: rect.width, height: rect.height },
      )
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    observer.current = ro
  }, [])

  return [ref, size] as const
}

/** Trim a label to fit the callout column without wrapping. */
function truncateLabel(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value
}

interface PieLabelNode {
  index: number
  name: string
  value: number
  pct: number
  color: string
  side: -1 | 1
  /** Vertical anchor the label settles on, after de-overlap. */
  ey: number
  /** Fixed x of the label column on this side of the pie. */
  ex: number
}

interface PieLayout {
  nodes: PieLabelNode[]
  cx: number
  cy: number
  outerRadius: number
  innerRadius: number
  elbowGutter: number
}

const EMPTY_LAYOUT: PieLayout = {
  nodes: [],
  cx: 0,
  cy: 0,
  outerRadius: 0,
  innerRadius: 0,
  elbowGutter: 12,
}

/**
 * Two-pass layout.
 *
 * Pass 1 places every label at the y its slice naturally points to.
 * Pass 2 sweeps each side top→bottom and pushes rows apart so they can never
 * collide — the same technique a chart library uses for axis ticks.
 *
 * The result is a set of label anchors that always show the category name,
 * even when the chart is squeezed into a phone.
 */
function computePieLayout(
  data: { name: string; value: number }[],
  width: number,
  height: number,
  isNarrow: boolean,
): PieLayout {
  if (!data.length || width <= 0 || height <= 0) return EMPTY_LAYOUT

  const cx = width / 2
  const cy = height / 2
  const min = Math.min(width, height)

  // On phones the ring shrinks further so the two label columns have room.
  const outerRadius = Math.max(24, Math.round(min * (isNarrow ? 0.2 : 0.3)))
  const innerRadius = Math.round(outerRadius * 0.64)

  // Two stacked text rows on mobile, so rows need more breathing space.
  const rowHeight = isNarrow ? 30 : 34
  const elbowGutter = isNarrow ? 8 : 14
  const edgePad = isNarrow ? 6 : 10
  // Horizontal room reserved for the label text on each side.
  const textReserve = isNarrow ? 78 : 148

  const tailLimit = cx - 8 - textReserve
  const tailCap = outerRadius + (isNarrow ? 56 : 150)
  const tail = Math.max(
    outerRadius + elbowGutter + 2,
    Math.min(tailLimit, tailCap),
  )

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1

  let cumulative = 0
  const nodes: PieLabelNode[] = data.map((entry, index) => {
    const fraction = entry.value / total
    const midFraction = cumulative + fraction / 2
    cumulative += fraction

    // Recharts measures angles counter-clockwise; negate for screen coords.
    const angle = -RADIAN * (midFraction * 360)
    const sin = Math.sin(angle)
    const side: -1 | 1 = Math.cos(angle) >= 0 ? 1 : -1

    return {
      index,
      name: entry.name,
      value: entry.value,
      pct: Math.round(fraction * 100),
      color: COLORS[index % COLORS.length],
      side,
      naturalY: cy + (outerRadius + elbowGutter) * sin,
      ey: 0,
      ex: cx + side * tail,
    } as PieLabelNode & { naturalY: number }
  })

  // --- Pass 2: separate rows on each side --------------------------------
  const top = edgePad + rowHeight / 2
  const bottom = Math.max(top, height - edgePad - rowHeight / 2)

  for (const side of [-1, 1] as const) {
    const group = nodes
      .filter((node) => node.side === side)
      .sort(
        (a, b) =>
          (a as PieLabelNode & { naturalY: number }).naturalY -
          (b as PieLabelNode & { naturalY: number }).naturalY,
      )

    const count = group.length
    if (!count) continue

    const ys = group.map((node) => {
      const natural = (node as PieLabelNode & { naturalY: number }).naturalY
      return Math.min(Math.max(natural, top), bottom)
    })

    // Push down so nothing overlaps…
    for (let i = 1; i < count; i++) {
      ys[i] = Math.max(ys[i], ys[i - 1] + rowHeight)
    }

    // …then, if we ran off the bottom, shove the whole stack back up.
    if (ys[count - 1] > bottom) {
      ys[count - 1] = bottom
      for (let i = count - 2; i >= 0; i--) {
        ys[i] = Math.min(ys[i], ys[i + 1] - rowHeight)
      }
    }

    // Final guard: if the stack is taller than the chart, pin it to the top.
    if (ys[0] < top) {
      ys[0] = top
      for (let i = 1; i < count; i++) {
        ys[i] = Math.max(ys[i], ys[i - 1] + rowHeight)
      }
    }

    group.forEach((node, i) => {
      node.ey = ys[i]
    })
  }

  return { nodes, cx, cy, outerRadius, innerRadius, elbowGutter }
}

/**
 * Renders a leader line + label anchored to a pie sector.
 *
 * The slice edge and elbow radius come from Recharts' live sector geometry so
 * the line always touches the arc; the label column and vertical position come
 * from the pre-computed layout, which guarantees the text stays legible and
 * never overlaps a neighbour.
 */
function renderPieLabel(props: any, layout: PieLayout, isNarrow: boolean) {
  const { cx, cy, midAngle, outerRadius, index = 0 } = props
  const node = layout.nodes[index]

  if (!node || !Number.isFinite(midAngle) || !outerRadius) return <g />

  const angle = -RADIAN * midAngle
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  const radius = Number(outerRadius)
  const elbowR = radius + layout.elbowGutter

  // Anchor on the slice edge, elbow just outside the ring, then jog to the
  // label's own row before running out horizontally.
  const sx = cx + (radius + 2) * cos
  const sy = cy + (radius + 2) * sin
  const mx = cx + elbowR * cos
  const my = cy + elbowR * sin

  const ex = node.ex
  const ey = node.ey
  const direction = node.side
  const textX = ex + direction * 8
  const textAnchor = direction >= 0 ? 'start' : 'end'

  const name = isNarrow ? truncateLabel(node.name, 12) : node.name

  // A dark halo keeps the type readable wherever it crosses the artwork.
  const halo = {
    paintOrder: 'stroke' as const,
    stroke: 'rgba(15,17,21,0.6)',
    strokeWidth: 3,
    strokeLinejoin: 'round' as const,
  }

  return (
    <g key={`pie-label-${index}`} style={{ pointerEvents: 'none' }}>
      <polyline
        points={`${sx},${sy} ${mx},${my} ${mx},${ey} ${ex},${ey}`}
        stroke={node.color}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.7}
      />

      <circle cx={ex} cy={ey} r={2.5} fill={node.color} opacity={0.9} />

      {isNarrow ? (
        <>
          {/* Category name leads — the percentage is the supporting detail. */}
          <text
            x={textX}
            y={ey - 6}
            textAnchor={textAnchor}
            dominantBaseline="central"
            fill="rgba(255,255,255,0.96)"
            fontSize={11}
            fontWeight={600}
            style={halo}
          >
            {name}
          </text>
          <text
            x={textX}
            y={ey + 8}
            textAnchor={textAnchor}
            dominantBaseline="central"
            fill={node.color}
            fontSize={10.5}
            fontWeight={700}
            className="tabular-nums"
            style={{ ...halo, strokeWidth: 2.5 }}
          >
            {`${node.pct}%`}
          </text>
        </>
      ) : (
        <>
          <text
            x={textX}
            y={ey - 1}
            textAnchor={textAnchor}
            dominantBaseline="central"
            fill="rgba(255,255,255,0.96)"
            fontSize={12}
            fontWeight={600}
            style={halo}
          >
            {name}
          </text>
          <text
            x={textX}
            y={ey + 14}
            textAnchor={textAnchor}
            dominantBaseline="central"
            fill="rgba(255,255,255,0.62)"
            fontSize={11}
            className="tabular-nums"
            style={{ ...halo, strokeWidth: 2.5 }}
          >
            {`₱${node.value.toFixed(2)} · ${node.pct}%`}
          </text>
        </>
      )}
    </g>
  )
}

export function AnalyticsClient({ expenses }: AnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'categories'>('overview')
  const isNarrow = useIsNarrow()
  const [chartRef, chartSize] = useMeasuredSize()

  // Calculate category breakdown
  const categoryData = useMemo(() => {
    const totals: { [key: string]: number } = {}

    expenses.forEach((expense) => {
      const category = expense.category || 'Other'
      totals[category] = (totals[category] || 0) + parseFloat(expense.amount || 0)
    })

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
      }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  // Calculate total spending
  const totalSpending = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)
  }, [expenses])

  // Get top categories
  const topCategories = categoryData.slice(0, 5)

  // Callout geometry — recomputed whenever the chart box or breakpoint changes
  const pieLayout = useMemo(
    () => computePieLayout(categoryData, chartSize.width, chartSize.height, isNarrow),
    [categoryData, chartSize.width, chartSize.height, isNarrow],
  )

  // Calculate daily spending for trends (sorted chronologically for the line chart)
  const trendData = useMemo(() => {
    const daily: { [key: string]: { ts: number; label: string; amount: number } } = {}

    expenses.forEach((expense) => {
      const parsed = new Date(expense.date)
      // Local-midnight timestamp → stable sort key, immune to timezone drift
      const ts = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime()
      const label = parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })

      if (!daily[ts]) daily[ts] = { ts, label, amount: 0 }
      daily[ts].amount += parseFloat(expense.amount || 0)
    })

    return Object.values(daily)
      .sort((a, b) => a.ts - b.ts)
      .map(({ label, amount }) => ({
        date: label,
        amount: Math.round(amount * 100) / 100,
      }))
      .slice(-7)
  }, [expenses])

  // All categories with amounts + percentages, sorted highest → lowest
  const categoryBreakdown = useMemo(() => {
    return EXPENSE_CATEGORIES.map((category) => {
      const catData = categoryData.find((c) => c.name === category)
      const amount = catData?.value || 0
      const percentage =
        totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0

      return { name: category, amount, percentage }
    }).sort((a, b) => b.amount - a.amount)
  }, [categoryData, totalSpending])

  return (
    <>
      {/* =========================================================
          AMBIENT BACKGROUND — fixed, full-viewport, out of content flow.
          Colour orbs give the backdrop-blur something real to bite on.
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

        {/* Lime orb — primary accent, upper-left */}
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#9ee82d]/[0.14] blur-[130px]" />

        {/* Violet orb — brand purple, right */}
        <div className="absolute -right-40 top-1/3 h-[380px] w-[380px] rounded-full bg-[#724bf6]/[0.20] blur-[140px]" />

        {/* Sky/cyan counterweight, bottom */}
        <div className="absolute bottom-[-140px] left-1/3 h-[400px] w-[400px] rounded-full bg-sky-400/[0.10] blur-[140px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl space-y-7 p-4 text-white sm:p-6 md:space-y-8 md:p-8">
        {/* Header */}
        <div className="relative mb-8">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Analytics
          </h1>
          <p className="text-sm text-white/60 sm:text-base">
            Understand your spending patterns.
          </p>
        </div>

        {/* Tab Navigation — segmented on mobile, glass pill cluster on ≥sm */}
        <div className="relative mb-8 flex w-full gap-1.5 overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.055] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:w-fit sm:gap-2">
          <div aria-hidden="true" className={HAIRLINE} />

          {(['overview', 'trends', 'categories'] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant="ghost"
              aria-pressed={activeTab === tab}
              className={
                `${FOCUS_RING} h-10 min-w-0 flex-1 whitespace-nowrap rounded-xl px-2 text-[13px] font-medium capitalize sm:h-9 sm:flex-none sm:px-4 sm:text-sm ` +
                (activeTab === tab
                  ? `border border-[#9ee82d]/25 bg-[#9ee82d]/10 text-[#c8ff75] shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_4px_18px_-10px_rgba(158,232,45,0.45)] hover:bg-[#9ee82d]/15`
                  : `border border-transparent text-white/55 transition-[color,background-color,border-color] duration-300 ${EASE} hover:border-white/[0.14] hover:bg-white/[0.075] hover:text-white/90`)
              }
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* =========================
            OVERVIEW TAB
        ========================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Pie Chart */}
            <Card className={`${GLASS_SURFACE_DEEP} text-white`}>
              <div
                aria-hidden="true"
                className={HAIRLINE}
              />
              <CardHeader className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
                <CardTitle className="text-base font-semibold tracking-tight text-white sm:text-lg">
                  Spending Overview
                </CardTitle>
                <p className="mt-1 text-xs text-white/55 sm:text-sm">Spending by category</p>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                {categoryData.length === 0 ? (
                  <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/[0.14] bg-white/[0.025] text-sm text-white/55">
                    No spending data available
                  </div>
                ) : (
                  <div ref={chartRef} className="h-80 w-full sm:h-80 md:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={pieLayout.innerRadius}
                          outerRadius={pieLayout.outerRadius}
                          paddingAngle={2}
                          dataKey="value"
                          labelLine={false}
                          label={(props: any) =>
                            renderPieLabel(props, pieLayout, isNarrow)
                          }
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => {
                            const numberValue = Number(value)
                            return `₱${numberValue.toFixed(2)}`
                          }}
                          contentStyle={{
                            backgroundColor: 'rgba(23,27,37,0.85)',
                            border: '1px solid rgba(255,255,255,0.14)',
                            borderRadius: '14px',
                            color: '#fff',
                            boxShadow:
                              'inset 0 1px 0 rgba(255,255,255,0.10), 0 16px 40px rgba(0,0,0,0.45)',
                            backdropFilter: 'blur(16px)',
                          }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className={`${GLASS_SURFACE} p-3 text-white md:p-5`}>
              <div aria-hidden="true" className={HAIRLINE} />
              <CardHeader className="px-0 pb-4">
                <CardTitle className="text-base font-semibold tracking-tight text-white sm:text-lg">
                  Category Breakdown
                </CardTitle>
              </CardHeader>

              <CardContent className="px-0">
                {topCategories.length === 0 ? (
                  <p className="text-sm text-white/55">No spending data available</p>
                ) : (
                  <div className="space-y-5">
                    {topCategories.map((category, index) => {
                      const percentage =
                        totalSpending > 0
                          ? Math.round((category.value / totalSpending) * 100)
                          : 0

                      return (
                        <div
                          key={category.name}
                          className="
                            group relative flex items-center justify-between gap-4 overflow-hidden
                            rounded-2xl border border-white/[0.14]
                            bg-white/[0.055] px-4 py-4
                            shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                            backdrop-blur-xl
                            transition-[border-color,background-color,box-shadow] duration-500
                            ease-[cubic-bezier(0.16,1,0.3,1)]
                            hover:border-white/[0.24] hover:bg-white/[0.10]
                            hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_40px_-20px_rgba(0,0,0,0.65)]
                            sm:px-5 sm:py-5
                          "
                        >
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"
                          />

                          {/* Left Side */}
                          <div className="flex min-w-0 items-center gap-4">
                            {/* Category Colour */}
                            <div
                              className="h-3 w-3 flex-shrink-0 rounded-full"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                                boxShadow: `0 0 12px ${COLORS[index % COLORS.length]}66`,
                              }}
                            />

                            {/* Category Information */}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white/95 sm:text-base">
                                {category.name}
                              </p>
                              <p className="mt-1 text-sm tabular-nums text-white/55">
                                ₱{category.value.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Percentage */}
                          <p className="ml-4 shrink-0 text-lg font-semibold tabular-nums text-[#c8ff75] sm:text-xl">
                            {percentage}%
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================
            TRENDS TAB
        ========================== */}
        {activeTab === 'trends' && (
          <Card className={`${GLASS_SURFACE_DEEP} text-white`}>
            <div aria-hidden="true" className={HAIRLINE} />
            <CardHeader className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
              <CardTitle className="text-base font-semibold tracking-tight text-white sm:text-lg">
                Daily Spending Trends
              </CardTitle>
              <p className="mt-1 text-xs text-white/55 sm:text-sm">
                Last {trendData.length} day{trendData.length === 1 ? '' : 's'} of activity
              </p>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              {trendData.length === 0 ? (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/[0.14] bg-white/[0.025] text-sm text-white/55">
                  No trend data available
                </div>
              ) : (
                <div className="h-64 w-full md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 12, right: 14, bottom: 4, left: 0 }}
                    >
                      <defs>
                        <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#9ee82d" />
                          <stop offset="100%" stopColor="#d0ff79" />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="rgba(255,255,255,0.08)"
                        strokeDasharray="3 6"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
                        tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                        tickMargin={10}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={64}
                        tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                        tickFormatter={(value) => `₱${Number(value).toLocaleString()}`}
                      />

                      <Tooltip
                        cursor={{
                          stroke: 'rgba(158,232,45,0.35)',
                          strokeWidth: 1,
                          strokeDasharray: '4 4',
                        }}
                        formatter={(value) => [`₱${Number(value).toFixed(2)}`, 'Spent']}
                        labelStyle={{ color: 'rgba(255,255,255,0.60)', marginBottom: 4 }}
                        contentStyle={{
                          backgroundColor: 'rgba(23,27,37,0.85)',
                          border: '1px solid rgba(255,255,255,0.14)',
                          borderRadius: '14px',
                          color: '#fff',
                          boxShadow:
                            'inset 0 1px 0 rgba(255,255,255,0.10), 0 16px 40px rgba(0,0,0,0.45)',
                          backdropFilter: 'blur(16px)',
                        }}
                        itemStyle={{ color: '#c8ff75' }}
                      />

                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="url(#trendStroke)"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        dot={{
                          r: 3.5,
                          fill: '#9ee82d',
                          stroke: '#13161a',
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          fill: '#d0ff79',
                          stroke: '#13161a',
                          strokeWidth: 2,
                          style: { filter: 'drop-shadow(0 0 10px rgba(158,232,45,0.7))' },
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* =========================
            CATEGORIES TAB
        ========================== */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {categoryBreakdown.map(({ name, amount, percentage }) => (
              <Card
                key={name}
                className="
                  group relative overflow-hidden rounded-[24px]
                  border border-white/[0.14]
                  bg-[#151922]/65 text-white
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_18px_45px_-32px_rgba(0,0,0,0.9)]
                  backdrop-blur-2xl
                  transition-[transform,border-color,background-color,box-shadow]
                  duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                  hover:-translate-y-0.5
                  hover:border-[#9ee82d]/25
                  hover:bg-[#191e29]/80
                  hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_24px_55px_-30px_rgba(0,0,0,0.95)]
                "
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/[0.06] blur-2xl"
                />

                <CardContent className="relative z-10 p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/90 sm:text-base">
                        {name}
                      </p>
                      <p className="mt-1 text-sm tabular-nums text-white/55">
                        ₱{amount.toFixed(2)}
                      </p>
                    </div>
                    <p className="ml-4 text-xl font-semibold tabular-nums text-[#c8ff75] sm:text-2xl">
                      {percentage}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}