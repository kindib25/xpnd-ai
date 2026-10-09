import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const TIME_ZONE = 'Asia/Manila'

type Reminder = {
  id: string
  user_id: string
  title: string
  body: string
  reminder_time: string
  last_sent_on: string | null
}

type PushSubscriptionRecord = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

type NotificationMessage = {
  userId: string
  title: string
  body: string
  tag: string
  eventKey?: string
}

function getManilaDateTime() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(new Date())

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  )

  return {
    today: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
    weekday: values.weekday,
  }
}

function isDue(reminderTime: string, currentTime: string) {
  return reminderTime.slice(0, 5) <= currentTime
}

function getPushStatusCode(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error
  ) {
    return (error as { statusCode?: number }).statusCode
  }

  return undefined
}

function peso(amount: number) {
  return `₱${amount.toLocaleString('en-PH', {
    maximumFractionDigits: 2,
  })}`
}

function getMonthBounds(today: string) {
  const [year, month] = today.split('-').map(Number)

  const start = `${year}-${String(month).padStart(2, '0')}-01`

  const nextMonthDate = new Date(Date.UTC(year, month, 1))
  const nextMonth = nextMonthDate.toISOString().slice(0, 10)

  return { start, nextMonth }
}

function getWeekStart(today: string) {
  const date = new Date(`${today}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 6)
  return date.toISOString().slice(0, 10)
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8)
  const startedAt = Date.now()

  const cronSecret = process.env.CRON_SECRET

  if (
    !cronSecret ||
    request.headers.get('authorization') !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !vapidSubject ||
    !vapidPublicKey ||
    !vapidPrivateKey
  ) {
    return NextResponse.json(
      { error: 'Push notification service is not configured.', requestId },
      { status: 500 },
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey,
    )
  } catch (error) {
    console.error(`[Push:${requestId}] VAPID configuration failed:`, error)

    return NextResponse.json(
      { error: 'VAPID configuration failed.', requestId },
      { status: 500 },
    )
  }

  const { today, time, weekday } = getManilaDateTime()
  const currentMonth = today.slice(0, 7)
  const { start: monthStart, nextMonth } = getMonthBounds(today)

  let sent = 0
  let failed = 0
  let skipped = 0
  let messagesCreated = 0

  console.log(`[Push:${requestId}] Started`, {
    today,
    time,
    weekday,
  })

  // Claims a one-time event so frequent cron runs don't duplicate it.
  async function claimEvent(eventKey: string) {
    const { error } = await supabase
      .from('push_notification_events')
      .insert({ event_key: eventKey })

    if (!error) return true

    // PostgreSQL unique violation means another run already claimed it.
    if (error.code === '23505') return false

    console.error(`[Push:${requestId}] Event claim failed:`, {
      eventKey,
      error: error.message,
    })

    throw new Error(`Could not claim notification event: ${eventKey}`)
  }

  async function releaseEvent(eventKey: string) {
    const { error } = await supabase
      .from('push_notification_events')
      .delete()
      .eq('event_key', eventKey)

    if (error) {
      console.error(`[Push:${requestId}] Could not release event:`, {
        eventKey,
        error: error.message,
      })
    }
  }

  async function sendMessage(
    message: NotificationMessage,
  ): Promise<boolean> {
    let eventClaimed = false

    try {
      if (message.eventKey) {
        eventClaimed = await claimEvent(message.eventKey)

        if (!eventClaimed) {
          skipped++
          return false
        }
      }

      const {
        data: subscriptions,
        error: subscriptionError,
      } = await supabase
        .from('push_subscriptions')
        .select('id,endpoint,p256dh,auth')
        .eq('user_id', message.userId)

      if (subscriptionError) {
        throw new Error(subscriptionError.message)
      }

      const userSubscriptions =
        (subscriptions ?? []) as PushSubscriptionRecord[]

      if (userSubscriptions.length === 0) {
        skipped++

        if (message.eventKey && eventClaimed) {
          await releaseEvent(message.eventKey)
        }

        return false
      }

      let delivered = 0
      let deliveryFailed = false

      for (const subscription of userSubscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify({
              title: message.title,
              body: message.body,
              tag: message.tag,
              url: '/dashboard',
            }),
          )

          delivered++
          sent++
        } catch (error: unknown) {
          deliveryFailed = true

          const statusCode = getPushStatusCode(error)

          console.error(`[Push:${requestId}] Delivery failed:`, {
            subscriptionId: subscription.id,
            statusCode,
            message:
              error instanceof Error ? error.message : String(error),
          })

          if (statusCode === 404 || statusCode === 410) {
            const { error: deleteError } = await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', subscription.id)

            if (deleteError) {
              console.error(
                `[Push:${requestId}] Could not delete expired subscription:`,
                deleteError.message,
              )
            }
          }
        }
      }

      if (delivered === 0) {
        failed++

        // Permit retry on the next cron run if every delivery failed.
        if (message.eventKey && eventClaimed) {
          await releaseEvent(message.eventKey)
        }

        return false
      }

      if (deliveryFailed) {
        console.warn(
          `[Push:${requestId}] Some devices failed, but at least one accepted the push.`,
        )
      }

      return true
    } catch (error) {
      failed++

      console.error(`[Push:${requestId}] Notification processing failed:`, {
        eventKey: message.eventKey,
        userId: message.userId,
        error: error instanceof Error ? error.message : String(error),
      })

      if (message.eventKey && eventClaimed) {
        await releaseEvent(message.eventKey)
      }

      return false
    }
  }

  // 1. Scheduled reminders: respect each user's selected time.
  const { data: reminders, error: reminderError } = await supabase
    .from('notification_reminders')
    .select('id,user_id,title,body,reminder_time,last_sent_on')
    .eq('enabled', true)
    .or(`last_sent_on.is.null,last_sent_on.neq.${today}`)

  if (reminderError) {
    console.error(`[Push:${requestId}] Could not load reminders:`, reminderError)

    return NextResponse.json(
      { error: 'Unable to load reminders.', requestId },
      { status: 500 },
    )
  }

  const enabledReminders = (reminders ?? []) as Reminder[]
  const dueReminders = enabledReminders.filter((reminder) =>
    isDue(reminder.reminder_time, time),
  )

  for (const reminder of dueReminders) {
    try {
      // Claim the reminder before sending, preventing concurrent duplicate runs.
      const { data: claimed, error: claimError } = await supabase
        .from('notification_reminders')
        .update({ last_sent_on: today })
        .eq('id', reminder.id)
        .eq('enabled', true)
        .or(`last_sent_on.is.null,last_sent_on.neq.${today}`)
        .select('id')

      if (claimError) {
        failed++
        console.error(`[Push:${requestId}] Reminder claim failed:`, claimError)
        continue
      }

      if (!claimed?.length) {
        skipped++
        continue
      }

      const delivered = await sendMessage({
        userId: reminder.user_id,
        title: reminder.title || 'Xpnd AI Reminder',
        body: reminder.body || 'You have a scheduled reminder.',
        tag: `reminder-${reminder.id}`,
      })

      // Restore the previous marker if no device accepted the push.
      if (!delivered) {
        const { error: resetError } = await supabase
          .from('notification_reminders')
          .update({ last_sent_on: reminder.last_sent_on })
          .eq('id', reminder.id)
          .eq('last_sent_on', today)

        if (resetError) {
          console.error(
            `[Push:${requestId}] Could not reset reminder marker:`,
            resetError.message,
          )
        }
      }

      messagesCreated++
    } catch (error) {
      failed++
      console.error(
        `[Push:${requestId}] Reminder processing failed:`,
        reminder.id,
        error,
      )
    }
  }

  // 2. Monthly budget alerts: notify once at 80% and once at 100%.
  const [
    { data: budgets, error: budgetError },
    { data: monthlyExpenses, error: expenseError },
  ] = await Promise.all([
    supabase
      .from('monthly_budgets')
      .select('user_id,limit_amount')
      .eq('month_year', currentMonth),

    supabase
      .from('expenses')
      .select('user_id,amount,date')
      .gte('date', monthStart)
      .lt('date', nextMonth),
  ])

  if (budgetError) {
    console.error(`[Push:${requestId}] Could not load budgets:`, budgetError)
    failed++
  } else if (expenseError) {
    console.error(
      `[Push:${requestId}] Could not load monthly expenses:`,
      expenseError,
    )
    failed++
  } else {
    for (const budget of budgets ?? []) {
      const limit = Number(budget.limit_amount || 0)
      if (limit <= 0) continue

      const spent = (monthlyExpenses ?? [])
        .filter((expense) => expense.user_id === budget.user_id)
        .reduce(
          (total, expense) => total + Number(expense.amount || 0),
          0,
        )

      const percentage = (spent / limit) * 100
      const remaining = limit - spent

      // Send only the highest reached threshold, avoiding two alerts
      // at once when spending jumps directly above 100%.
      const threshold = percentage >= 100 ? 100 : percentage >= 80 ? 80 : 0
      if (!threshold) continue

      const eventKey =
        `budget:${budget.user_id}:${currentMonth}:${threshold}`

      const body =
        threshold === 100
          ? `You've used 100% of your ${peso(limit)} monthly budget. You are ${peso(Math.abs(remaining))} over budget.`
          : `You've used ${percentage.toFixed(0)}% of your ${peso(limit)} monthly budget. You have ${peso(Math.max(remaining, 0))} remaining.`

      await sendMessage({
        userId: budget.user_id,
        title: threshold === 100 ? 'Monthly budget reached' : 'Budget limit warning',
        body,
        tag: `budget-alert-${currentMonth}-${threshold}`,
        eventKey,
      })

      messagesCreated++
    }
  }

  // 3. Daily savings goal reminder: choose one goal per user.
  // Once sent, the event key prevents repeats for that user today.
  if (time >= '09:00') {
    const { data: goals, error: goalError } = await supabase
      .from('savings_goals')
      .select('user_id,name,current_amount,target_amount')
      .not('target_amount', 'is', null)
      .gt('target_amount', 0)

    if (goalError) {
      console.error(`[Push:${requestId}] Could not load savings goals:`, goalError)
      failed++
    } else {
      const goalsByUser = new Map<string, typeof goals>()

      for (const goal of goals ?? []) {
        const userGoals = goalsByUser.get(goal.user_id) ?? []
        userGoals.push(goal)
        goalsByUser.set(goal.user_id, userGoals)
      }

      for (const [userId, userGoals] of goalsByUser) {
        if (!userGoals.length) continue

        const eventKey = `savings-goal:${userId}:${today}`

        // Don't select/send a goal if today's reminder was already recorded.
        const { data: existingEvent, error: existingError } = await supabase
          .from('push_notification_events')
          .select('event_key')
          .eq('event_key', eventKey)
          .maybeSingle()

        if (existingError) {
          failed++
          console.error(
            `[Push:${requestId}] Could not check savings event:`,
            existingError.message,
          )
          continue
        }

        if (existingEvent) {
          skipped++
          continue
        }

        const goal = userGoals[Math.floor(Math.random() * userGoals.length)]
        const target = Number(goal.target_amount || 0)
        const current = Number(goal.current_amount || 0)
        const progress = Math.round((current / target) * 100)

        await sendMessage({
          userId,
          title: 'Savings goal check-in',
          body: `Your ${goal.name} savings goal is ${progress}% complete. Keep going toward your target!`,
          tag: `savings-goal-${today}`,
          eventKey,
        })

        messagesCreated++
      }
    }
  }

  // 4. Weekly summary: Sunday after 8 PM Manila time.
  // Each user gets at most one summary for that Sunday.
  if (weekday === 'Sun' && time >= '20:00') {
    const weekStart = getWeekStart(today)

    const { data: weeklyExpenses, error: weeklyError } = await supabase
      .from('expenses')
      .select('user_id,amount,category,date')
      .gte('date', weekStart)
      .lt('date', `${today}T23:59:59.999`)

    if (weeklyError) {
      console.error(
        `[Push:${requestId}] Could not load weekly expenses:`,
        weeklyError,
      )
      failed++
    } else {
      const summaries = new Map<
        string,
        { total: number; categories: Map<string, number> }
      >()

      for (const expense of weeklyExpenses ?? []) {
        const current = summaries.get(expense.user_id) ?? {
          total: 0,
          categories: new Map<string, number>(),
        }

        const amount = Number(expense.amount || 0)
        const category = expense.category || 'Uncategorized'

        current.total += amount
        current.categories.set(
          category,
          (current.categories.get(category) ?? 0) + amount,
        )

        summaries.set(expense.user_id, current)
      }

      for (const [userId, summary] of summaries) {
        const highestCategory = [...summary.categories.entries()]
          .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No category'

        await sendMessage({
          userId,
          title: 'Your weekly spending summary',
          body: `You spent ${peso(summary.total)} this week. ${highestCategory} was your highest spending category.`,
          tag: `weekly-summary-${today}`,
          eventKey: `weekly-summary:${userId}:${today}`,
        })

        messagesCreated++
      }
    }
  }

  const result = {
    ok: failed === 0,
    requestId,
    timeZone: TIME_ZONE,
    today,
    currentTime: time,
    eligibleReminders: enabledReminders.length,
    dueReminders: dueReminders.length,
    messagesCreated,
    sent,
    failed,
    skipped,
    durationMs: Date.now() - startedAt,
  }

  console.log(`[Push:${requestId}] Dispatch summary:`, result)

  return NextResponse.json(result)
}
