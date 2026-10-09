
'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bell, BellOff, Clock3, Send } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

type Reminder = {
  id: string
  title: string
  body: string
  reminder_time: string
  enabled: boolean
}

const DEFAULTS = [
  {
    title: 'Record your expenses before sleep',
    body: "Take a moment to record today's expenses.",
    reminder_time: '20:00',
  },
  {
    title: 'Budget limit warning',
    body: 'You are approaching your budget limit.',
    reminder_time: '10:00',
  },
  {
    title: 'Savings goal reminder',
    body: 'Check in on your savings goals.',
    reminder_time: '09:00',
  },
]

export function NotificationsSettings() {
  const [enabled, setEnabled] = useState(false)
  const [permission, setPermission] =
    useState<NotificationPermission>('default')
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [busy, setBusy] = useState(true)
  const [sending, setSending] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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

    const response = await fetch('/api/push/test')

    if (!response.ok) {
      throw new Error('Unable to load push notification settings.')
    }

    const { publicKey } = await response.json()

    if (!publicKey) {
      throw new Error(
        'Push notifications are not configured yet.',
      )
    }

    const padding = '='.repeat((4 - (publicKey.length % 4)) % 4)
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
          'Your session has expired. Sign in again to enable notifications.',
        )
      }

      const json = subscription.toJSON()

      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
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
          { onConflict: 'user_id,endpoint' },
        )

      if (error) throw error
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        if ('Notification' in window) {
          setPermission(Notification.permission)
        } else {
          setPermission('denied')
        }

        const supabase = createClient()

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          throw new Error('Please sign in to manage your reminders.')
        }

        const { data, error } = await supabase
          .from('notification_reminders')
          .select('id,title,body,reminder_time,enabled')
          .eq('user_id', user.id)
          .order('created_at')

        if (error) throw error

        if (cancelled) return

        setReminders(data ?? [])

        if (
          'Notification' in window &&
          Notification.permission === 'granted' &&
          'serviceWorker' in navigator
        ) {
          const registration = await navigator.serviceWorker.ready
          const subscription =
            await registration.pushManager.getSubscription()

          if (!cancelled) {
            setEnabled(Boolean(subscription))
          }
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
        if (!cancelled) setBusy(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

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
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Sign in again to manage notifications.')
      }

      if (!next) {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready
          const subscription =
            await registration.pushManager.getSubscription()

          if (subscription) {
            const endpoint = subscription.endpoint

            const { error } = await supabase
              .from('push_subscriptions')
              .delete()
              .eq('user_id', user.id)
              .eq('endpoint', endpoint)

            if (error) throw error

            const unsubscribed = await subscription.unsubscribe()

            if (!unsubscribed) {
              throw new Error(
                'The browser could not unsubscribe this device.',
              )
            }
          }
        }

        setEnabled(false)
        setMessage('Notifications disabled on this device.')
        return
      }

      const result = await Notification.requestPermission()
      setPermission(result)

      if (result !== 'granted') {
        throw new Error(
          'Allow notifications in your browser or phone settings to continue.',
        )
      }

      const subscription = await getSubscription()
      await saveSubscription(subscription)

      setEnabled(true)
      setMessage(
        'Notifications enabled on this device. Scheduled reminders require the server scheduler to be running.',
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to update notification settings.',
      )
    } finally {
      setToggling(false)
    }
  }

  const sendTest = async () => {
    if (sending) return

    setSending(true)
    setMessage(null)

    try {
      if (
        !('Notification' in window) ||
        Notification.permission !== 'granted'
      ) {
        throw new Error(
          'Enable browser notifications before sending a test.',
        )
      }

      const subscription = await getSubscription()
      await saveSubscription(subscription)

      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'Unable to send test notification.',
        )
      }

      setEnabled(true)
      setMessage('Test notification sent.')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to send test notification.',
      )
    } finally {
      setSending(false)
    }
  }

  const updateReminder = async (
    id: string,
    patch: Partial<
      Pick<Reminder, 'reminder_time' | 'enabled'>
    >,
  ) => {
    const previous = reminders
    const reminder = previous.find((item) => item.id === id)

    if (!reminder) return

    setMessage(null)

    const next = previous.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    )

    setReminders(next)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Please sign in again.')

      const { data, error } = await supabase
        .from('notification_reminders')
        .update(patch)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id')

      if (error) throw error

      if (!data?.length) {
        throw new Error(
          'Reminder was not saved. Check your access and try again.',
        )
      }
    } catch (error) {
      setReminders(previous)
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save this reminder.',
      )
    }
  }

  const addDefaults = async () => {
    if (adding) return

    setAdding(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Sign in again to create reminders.')
      }

      const { data: existing, error: existingError } =
        await supabase
          .from('notification_reminders')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

      if (existingError) throw existingError

      if (existing?.length) {
        throw new Error(
          'You already have reminders. Refresh the page to load them.',
        )
      }

      const { data, error } = await supabase
        .from('notification_reminders')
        .insert(
          DEFAULTS.map((reminder) => ({
            ...reminder,
            user_id: user.id,
            enabled: true,
          })),
        )
        .select('id,title,body,reminder_time,enabled')

      if (error) throw error

      setReminders(data ?? [])
      setMessage('Recommended reminders created.')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to create reminders.',
      )
    } finally {
      setAdding(false)
    }
  }

  if (busy) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4" aria-hidden="true" />
          Notifications &amp; Reminders
        </CardTitle>
        <CardDescription>
          Get timely reminders on your device, even when Xpnd AI is closed.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              {enabled ? (
                <Bell className="size-4" />
              ) : (
                <BellOff className="size-4" />
              )}
            </div>

            <div>
              <p className="font-medium">Push notifications</p>
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
            disabled={toggling || permission === 'denied'}
            onChange={(event) =>
              void enableNotifications(event.target.checked)
            }
            aria-label="Enable push notifications"
            className="size-5 accent-primary"
          />
        </div>

        <div className="space-y-3">
          {reminders.length === 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void addDefaults()}
              disabled={adding}
            >
              {adding ? 'Adding reminders...' : 'Add recommended reminders'}
            </Button>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                <Clock3 className="size-4 shrink-0 text-muted-foreground" />

                <div className="min-w-0 flex-1">
                  <Label
                    htmlFor={`reminder-${reminder.id}`}
                    className="truncate"
                  >
                    {reminder.title}
                  </Label>
                  <p className="truncate text-xs text-muted-foreground">
                    {reminder.body}
                  </p>
                </div>

                <Input
                  id={`reminder-${reminder.id}`}
                  type="time"
                  value={reminder.reminder_time.slice(0, 5)}
                  onChange={(event) =>
                    void updateReminder(reminder.id, {
                      reminder_time: event.target.value,
                    })
                  }
                  className="w-[112px]"
                  aria-label={`Time for ${reminder.title}`}
                />

                <input
                  type="checkbox"
                  checked={reminder.enabled}
                  onChange={(event) =>
                    void updateReminder(reminder.id, {
                      enabled: event.target.checked,
                    })
                  }
                  aria-label={`Enable ${reminder.title}`}
                  className="size-5 accent-primary"
                />
              </div>
            ))
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void sendTest()}
          disabled={sending || toggling}
        >
          <Send className="mr-2 size-4" />
          {sending ? 'Sending...' : 'Send test notification'}
        </Button>

        {message && (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}