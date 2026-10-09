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

function getManilaDateTime() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  )

  return {
    today: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
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

export async function GET(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8)
  const startedAt = Date.now()

  console.log(`[Push:${requestId}] ===== DISPATCH STARTED =====`)
  console.log(`[Push:${requestId}] Request time (UTC):`, new Date().toISOString())
  console.log(`[Push:${requestId}] Method:`, request.method)
  console.log(
    `[Push:${requestId}] Authorization header present:`,
    Boolean(request.headers.get('authorization')),
  )
  console.log(
    `[Push:${requestId}] CRON_SECRET configured:`,
    Boolean(process.env.CRON_SECRET),
  )

  // 1. Verify cron authorization
  const cronSecret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')

  if (
    !cronSecret ||
    authorization !== `Bearer ${cronSecret}`
  ) {
    console.error(
      `[Push:${requestId}] UNAUTHORIZED: CRON_SECRET is missing or authorization does not match.`,
    )

    return NextResponse.json(
      { error: 'Unauthorized', requestId },
      { status: 401 },
    )
  }

  console.log(`[Push:${requestId}] Cron authorization passed.`)

  // 2. Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

  console.log(`[Push:${requestId}] Environment configuration:`, {
    supabaseUrlConfigured: Boolean(supabaseUrl),
    serviceRoleKeyConfigured: Boolean(serviceRoleKey),
    vapidSubjectConfigured: Boolean(vapidSubject),
    vapidPublicKeyConfigured: Boolean(vapidPublicKey),
    vapidPrivateKeyConfigured: Boolean(vapidPrivateKey),
  })

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !vapidSubject ||
    !vapidPublicKey ||
    !vapidPrivateKey
  ) {
    console.error(
      `[Push:${requestId}] Missing required environment variables.`,
    )

    return NextResponse.json(
      { error: 'Push notification service is not configured.', requestId },
      { status: 500 },
    )
  }

  // 3. Initialize services
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
    console.error(
      `[Push:${requestId}] Failed to configure VAPID:`,
      error,
    )

    return NextResponse.json(
      { error: 'VAPID configuration failed.', requestId },
      { status: 500 },
    )
  }

  // 4. Get current Manila time
  const { today, time } = getManilaDateTime()

  console.log(`[Push:${requestId}] Current Manila date:`, today)
  console.log(`[Push:${requestId}] Current Manila time:`, time)

  // 5. Load reminders that have not been sent today
  const { data: reminders, error: reminderError } = await supabase
    .from('notification_reminders')
    .select(
      'id,user_id,title,body,reminder_time,last_sent_on',
    )
    .eq('enabled', true)
    .or(`last_sent_on.is.null,last_sent_on.neq.${today}`)

  if (reminderError) {
    console.error(
      `[Push:${requestId}] Failed to load reminders:`,
      reminderError.message,
      reminderError.code,
    )

    return NextResponse.json(
      { error: 'Unable to load reminders.', requestId },
      { status: 500 },
    )
  }

  const enabledReminders = (reminders ?? []) as Reminder[]

  console.log(
    `[Push:${requestId}] Eligible enabled reminders from database:`,
    enabledReminders.length,
  )

  // Log scheduled times without exposing reminder text or user IDs.
  for (const reminder of enabledReminders) {
    console.log(`[Push:${requestId}] Reminder candidate:`, {
      reminderId: reminder.id,
      scheduledTime: reminder.reminder_time,
      lastSentOn: reminder.last_sent_on,
      due: isDue(reminder.reminder_time, time),
    })
  }

  const dueReminders = enabledReminders.filter((reminder) =>
    isDue(reminder.reminder_time, time),
  )

  console.log(
    `[Push:${requestId}] Due reminders:`,
    dueReminders.length,
  )

  if (dueReminders.length === 0) {
    console.warn(
      `[Push:${requestId}] No reminders are due. Check enabled status, reminder_time, and last_sent_on.`,
    )
  }

  let sent = 0
  let failed = 0
  let skipped = 0

  // 6. Process due reminders
  for (const reminder of dueReminders) {
    console.log(
      `[Push:${requestId}] Processing reminder ${reminder.id}`,
    )

    try {
      // Load subscriptions
      const {
        data: subscriptions,
        error: subscriptionError,
      } = await supabase
        .from('push_subscriptions')
        .select('id,endpoint,p256dh,auth')
        .eq('user_id', reminder.user_id)

      if (subscriptionError) {
        failed++

        console.error(
          `[Push:${requestId}] Failed to load subscriptions for reminder ${reminder.id}:`,
          subscriptionError.message,
          subscriptionError.code,
        )

        continue
      }

      const userSubscriptions =
        (subscriptions ?? []) as PushSubscriptionRecord[]

      console.log(
        `[Push:${requestId}] Subscriptions found for reminder ${reminder.id}:`,
        userSubscriptions.length,
      )

      if (userSubscriptions.length === 0) {
        skipped++

        console.warn(
          `[Push:${requestId}] SKIPPED: No push subscriptions found for reminder ${reminder.id}.`,
        )

        continue
      }

      // Claim the reminder before sending to avoid duplicate processing.
      const { data: claimed, error: claimError } = await supabase
        .from('notification_reminders')
        .update({ last_sent_on: today })
        .eq('id', reminder.id)
        .eq('enabled', true)
        .or(`last_sent_on.is.null,last_sent_on.neq.${today}`)
        .select('id')

      if (claimError) {
        failed++

        console.error(
          `[Push:${requestId}] Failed to claim reminder ${reminder.id}:`,
          claimError.message,
          claimError.code,
        )

        continue
      }

      if (!claimed?.length) {
        skipped++

        console.warn(
          `[Push:${requestId}] SKIPPED: Reminder ${reminder.id} was already claimed or changed.`,
        )

        continue
      }

      console.log(
        `[Push:${requestId}] Reminder ${reminder.id} successfully claimed.`,
      )

      let delivered = 0
      let deliveryFailed = false

      // 7. Send notifications to each subscribed device
      for (const subscription of userSubscriptions) {
        try {
          console.log(
            `[Push:${requestId}] Sending push for reminder ${reminder.id} to subscription ${subscription.id}...`,
          )

          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify({
              title: reminder.title || 'Record your expenses',
              body: reminder.body,
              tag: `reminder-${reminder.id}`,
              url: '/dashboard',
            }),
          )

          delivered++
          sent++

          console.log(
            `[Push:${requestId}] PUSH ACCEPTED for subscription ${subscription.id}.`,
          )
        } catch (pushError: unknown) {
          deliveryFailed = true

          const statusCode = getPushStatusCode(pushError)

          console.error(
            `[Push:${requestId}] PUSH FAILED for subscription ${subscription.id}.`,
            {
              statusCode,
              message:
                pushError instanceof Error
                  ? pushError.message
                  : String(pushError),
            },
          )

          // Remove expired subscriptions.
          if (statusCode === 404 || statusCode === 410) {
            const { error: deleteError } = await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', subscription.id)

            if (deleteError) {
              console.error(
                `[Push:${requestId}] Failed to delete expired subscription ${subscription.id}:`,
                deleteError.message,
              )
            } else {
              console.log(
                `[Push:${requestId}] Removed expired subscription ${subscription.id}.`,
              )
            }
          }
        }
      }

      console.log(
        `[Push:${requestId}] Delivery results for reminder ${reminder.id}:`,
        {
          totalSubscriptions: userSubscriptions.length,
          delivered,
          deliveryFailed,
        },
      )

      // Retry later if every delivery failed.
      if (delivered === 0 && deliveryFailed) {
        const { error: resetError } = await supabase
          .from('notification_reminders')
          .update({ last_sent_on: reminder.last_sent_on })
          .eq('id', reminder.id)
          .eq('last_sent_on', today)

        if (resetError) {
          console.error(
            `[Push:${requestId}] Failed to reset last_sent_on for reminder ${reminder.id}:`,
            resetError.message,
          )
        } else {
          console.log(
            `[Push:${requestId}] Reset sent marker for reminder ${reminder.id}; it can retry on the next cron run.`,
          )
        }

        failed++
      }
    } catch (error: unknown) {
      failed++

      console.error(
        `[Push:${requestId}] Unexpected error processing reminder ${reminder.id}:`,
        error,
      )
    }
  }

  // 8. Return summary
  const durationMs = Date.now() - startedAt

  const result = {
    ok: failed === 0,
    requestId,
    timeZone: TIME_ZONE,
    today,
    currentTime: time,
    eligibleReminders: enabledReminders.length,
    checked: dueReminders.length,
    sent,
    failed,
    skipped,
    durationMs,
  }

  console.log(`[Push:${requestId}] DISPATCH SUMMARY:`, result)
  console.log(`[Push:${requestId}] ===== DISPATCH FINISHED =====`)

  return NextResponse.json(result)
}