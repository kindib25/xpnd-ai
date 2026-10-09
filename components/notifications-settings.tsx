'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const DEFAULT_REMINDERS = [
  {
    title: 'Before You Sleep',
    body: "Record today's expenses before calling it a night!",
    reminder_time: '21:00',
  },
  {
    title: 'Track Your Expenses',
    body: "Don't forget to log your expenses today!",
    reminder_time: '09:00',
  },
  {
    title: 'Stay on Budget',
    body: 'Keep track of your spending and stay on budget.',
    reminder_time: '12:00',
  },
]

type ExistingReminder = {
  id: string
  title: string
  body: string
  reminder_time: string
  enabled: boolean
  last_sent_on: string | null
}


type NotificationSettingsState = {
  enabled: boolean
  permission: NotificationPermission
}

export function NotificationsSettings() {
  const [enabled, setEnabled] = useState(false)
  const [permission, setPermission] =
    useState<NotificationPermission>('default')
  const [busy, setBusy] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const syncDefaultReminders = useCallback(async () => {
    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error(
        'Please sign in to manage notifications.',
      )
    }

    const { data: existing, error } = await supabase
      .from('notification_reminders')
      .select('id,title,body,reminder_time,enabled,last_sent_on')
      .eq('user_id', user.id)

    if (error) throw error

    const existingReminders: ExistingReminder[] =
      (existing ?? []) as ExistingReminder[]

    for (const reminder of DEFAULT_REMINDERS) {
      const normalizedTitle = reminder.title.toLowerCase()

      const match = existingReminders.find((item) => {
        const title = item.title
          .toLowerCase()
          .replace(/\s*\|+\s*$/, '')
          .trim()

        return title === normalizedTitle
      })

      if (match) {
        // Update reminder content and time only when needed.
        // Never reset last_sent_on: doing so could allow the
        // API route to send the same reminder again today.
        const needsUpdate =
          match.title !== reminder.title ||
          match.body !== reminder.body ||
          String(match.reminder_time).slice(0, 5) !==
          reminder.reminder_time

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('notification_reminders')
            .update({
              title: reminder.title,
              body: reminder.body,
              reminder_time: reminder.reminder_time,
            })
            .eq('id', match.id)
            .eq('user_id', user.id)

          if (updateError) throw updateError
        }
      } else {
        // New reminders start enabled. Existing reminders retain
        // their current enabled state and daily delivery marker.
        const { error: insertError } = await supabase
          .from('notification_reminders')
          .insert({
            ...reminder,
            user_id: user.id,
            enabled: true,
          })

        if (insertError) throw insertError
      }
    }
  }, [])

  const loadNotificationSettings = useCallback(
    async (): Promise<NotificationSettingsState> => {
      if (typeof window === 'undefined') {
        return {
          enabled: false,
          permission: 'default',
        }
      }

      const currentPermission =
        'Notification' in window
          ? Notification.permission
          : 'denied'

      if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window)
      ) {
        return {
          enabled: false,
          permission: currentPermission,
        }
      }

      const registration =
        await navigator.serviceWorker.getRegistration('/')

      if (!registration) {
        return {
          enabled: false,
          permission: currentPermission,
        }
      }

      const subscription =
        await registration.pushManager.getSubscription()

      return {
        enabled:
          currentPermission === 'granted' &&
          Boolean(subscription),
        permission: currentPermission,
      }
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        if (typeof window !== 'undefined') {
          const currentPermission =
            'Notification' in window
              ? Notification.permission
              : 'denied'

          if (!cancelled) {
            setPermission(currentPermission)
          }
        }

        await syncDefaultReminders()

        const settings =
          await loadNotificationSettings()

        if (!cancelled) {
          setEnabled(settings.enabled)
          setPermission(settings.permission)
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load notification settings.',
          )
        }
      } finally {
        if (!cancelled) {
          setBusy(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [syncDefaultReminders, loadNotificationSettings])

  const getSubscription = useCallback(async () => {
    if (
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      throw new Error(
        'Push notifications are not supported by this browser.',
      )
    }

    const registration =
      await navigator.serviceWorker.register('/sw.js')

    await navigator.serviceWorker.ready

    const existing =
      await registration.pushManager.getSubscription()

    if (existing) return existing

    const response = await fetch('/api/push/test', {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(
        'Unable to load push notification configuration.',
      )
    }

    const { publicKey } = await response.json()

    if (!publicKey) {
      throw new Error(
        'Push notifications are not configured yet.',
      )
    }

    const padding = '='.repeat(
      (4 - (publicKey.length % 4)) % 4,
    )

    const base64 = publicKey
      .replace(/-/g, '+')
      .replace(/_/g, '/') + padding

    const applicationServerKey = Uint8Array.from(
      atob(base64),
      (char) => char.charCodeAt(0),
    )

    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    })
  }, [])

  const saveSubscription = useCallback(
    async (subscription: PushSubscription) => {
      const supabase = createClient()

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error(
          'Your session has expired. Sign in again.',
        )
      }

      const json = subscription.toJSON()

      if (
        !json.endpoint ||
        !json.keys?.p256dh ||
        !json.keys?.auth
      ) {
        throw new Error(
          'The browser returned an incomplete push subscription.',
        )
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            user_id: user.id,
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
            user_agent: navigator.userAgent,
          },
          {
            onConflict: 'user_id,endpoint',
          },
        )

      if (error) throw error
    },
    [],
  )

  const enableNotifications = async (next: boolean) => {
    if (toggling) return

    setToggling(true)
    setMessage(null)

    try {
      if (!('Notification' in window)) {
        throw new Error(
          'This browser does not support notifications.',
        )
      }

      const supabase = createClient()

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error(
          'Sign in again to manage notifications.',
        )
      }

      if (!next) {
        if ('serviceWorker' in navigator) {
          const registration =
            await navigator.serviceWorker.getRegistration('/')

          const subscription =
            await registration?.pushManager.getSubscription()

          if (subscription) {
            const { error: deleteError } = await supabase
              .from('push_subscriptions')
              .delete()
              .eq('user_id', user.id)
              .eq('endpoint', subscription.endpoint)

            if (deleteError) throw deleteError

            const unsubscribed =
              await subscription.unsubscribe()

            if (!unsubscribed) {
              throw new Error(
                'The browser could not unsubscribe this device.',
              )
            }
          }
        }

        setEnabled(false)
        setMessage(
          'Push notifications disabled on this device.',
        )
        return
      }

      const result =
        await Notification.requestPermission()

      setPermission(result)

      if (result !== 'granted') {
        throw new Error(
          'Allow notifications in your browser settings to continue.',
        )
      }

      // Synchronize defaults without resetting delivery history
      // or re-enabling existing reminders.
      await syncDefaultReminders()

      const subscription = await getSubscription()

      await saveSubscription(subscription)

      setEnabled(true)
      setMessage(
        'Push notifications enabled on this device.',
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to update notification settings.',
      )

      try {
        const settings =
          await loadNotificationSettings()

        setEnabled(settings.enabled)
        setPermission(settings.permission)
      } catch {
        // Keep the last known UI state if refresh fails.
      }
    } finally {
      setToggling(false)
    }
  }

  if (busy) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell
            className="size-4"
            aria-hidden="true"
          />
          Notifications
        </CardTitle>

        <CardDescription>
          Receive reminders about your expenses, budget,
          and savings goals.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary">
              {enabled ? (
                <Bell
                  className="size-4"
                  aria-hidden="true"
                />
              ) : (
                <BellOff
                  className="size-4"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="font-medium">
                Push notifications
              </p>

              <p className="text-sm text-muted-foreground">
                {permission === 'denied'
                  ? 'Blocked in browser settings'
                  : enabled
                    ? 'Enabled on this device'
                    : 'Currently disabled'}
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={enabled}
            disabled={
              toggling ||
              permission === 'denied'
            }
            onChange={(event) => {
              void enableNotifications(
                event.target.checked,
              )
            }}
            aria-label="Enable push notifications"
            className="size-5 shrink-0 accent-primary"
          />
        </div>

        {message && (
          <p
            className="break-words text-sm text-muted-foreground"
            role="status"
          >
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}