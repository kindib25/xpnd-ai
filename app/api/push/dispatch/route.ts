
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

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET

  if (
    !cronSecret ||
    request.headers.get('authorization') !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json(
      { error: 'Unauthorized' },
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
    console.error('Push notification environment variables are missing.')

    return NextResponse.json(
      { error: 'Push notification service is not configured.' },
      { status: 500 },
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey,
  )

  const { today, time } = getManilaDateTime()

  const { data: reminders, error } = await supabase
    .from('notification_reminders')
    .select(
      'id,user_id,title,body,reminder_time,last_sent_on',
    )
    .eq('enabled', true)
    .or(`last_sent_on.is.null,last_sent_on.neq.${today}`)

  if (error) {
    console.error('Unable to load reminders:', error.message)

    return NextResponse.json(
      { error: 'Unable to load reminders.' },
      { status: 500 },
    )
  }

  const dueReminders = ((reminders ?? []) as Reminder[]).filter(
    (reminder) => isDue(reminder.reminder_time, time),
  )

  let sent = 0
  let failed = 0
  let skipped = 0

  for (const reminder of dueReminders) {
    try {
      const { data: subscriptions, error: subscriptionError } =
        await supabase
          .from('push_subscriptions')
          .select('id,endpoint,p256dh,auth')
          .eq('user_id', reminder.user_id)

      if (subscriptionError) {
        failed++
        console.error(
          `Unable to load subscriptions for reminder ${reminder.id}:`,
          subscriptionError.message,
        )
        continue
      }

      const userSubscriptions =
        (subscriptions ?? []) as PushSubscriptionRecord[]

      if (userSubscriptions.length === 0) {
        skipped++
        continue
      }

      // Claim the reminder before sending. The conditional UPDATE
      // allows only a worker that successfully updates this row to proceed.
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
          `Unable to claim reminder ${reminder.id}:`,
          claimError.message,
        )
        continue
      }

      if (!claimed?.length) {
        skipped++
        continue
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
              title: reminder.title || 'Xpnd AI',
              body: reminder.body,
              tag: `reminder-${reminder.id}`,
              url: '/dashboard',
            }),
          )

          delivered++
          sent++
        } catch (pushError: unknown) {
          deliveryFailed = true

          const statusCode =
            typeof pushError === 'object' &&
            pushError !== null &&
            'statusCode' in pushError
              ? (pushError as { statusCode?: number }).statusCode
              : undefined

          if (statusCode === 404 || statusCode === 410) {
            const { error: deleteError } = await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', subscription.id)

            if (deleteError) {
              console.error(
                `Unable to remove expired subscription ${subscription.id}:`,
                deleteError.message,
              )
            }
          } else {
            console.error(
              `Push delivery failed for reminder ${reminder.id}:`,
              pushError,
            )
          }
        }
      }

      // Retry on the next cron run if every delivery failed.
      // If at least one succeeded, keep today's sent marker to
      // prevent sending the same reminder again to successful devices.
      if (delivered === 0 && deliveryFailed) {
        const { error: resetError } = await supabase
          .from('notification_reminders')
          .update({ last_sent_on: reminder.last_sent_on })
          .eq('id', reminder.id)
          .eq('last_sent_on', today)

        if (resetError) {
          console.error(
            `Unable to reset reminder ${reminder.id}:`,
            resetError.message,
          )
        }

        failed++
      }
    } catch (error) {
      failed++
      console.error(
        `Unexpected error processing reminder ${reminder.id}:`,
        error,
      )
    }
  }

  return NextResponse.json({
    ok: failed === 0,
    timeZone: TIME_ZONE,
    checked: dueReminders.length,
    sent,
    failed,
    skipped,
  })
}