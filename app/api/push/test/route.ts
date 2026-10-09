import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const subscription = body?.subscription
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: 'A valid push subscription is required.' }, { status: 400 })
  }

  webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!)
  try {
    await webpush.sendNotification(subscription, JSON.stringify({
      title: 'Xpnd AI',
      body: 'Push notifications are working. You are all set.',
      tag: 'xpnd-test-notification',
      url: '/dashboard/settings',
    }))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[push-test]', error)
    return NextResponse.json({ error: 'Unable to send the test notification.' }, { status: 502 })
  }
}

export async function GET() {
  return NextResponse.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? '' })
}

export const dynamic = 'force-dynamic'
