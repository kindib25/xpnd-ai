
const CACHE_NAME = 'xpnd-shell-v3'

const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/xpnd-ai-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL)),
  )

  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('xpnd-shell-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Xpnd AI',
    body: 'You have a reminder from Xpnd AI.',
    tag: 'xpnd-reminder',
    url: '/dashboard',
  }

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() }
    }
  } catch {
    // Keep the default payload if the push data is invalid JSON.
  }

  let targetUrl = '/dashboard'

  try {
    const parsedUrl = new URL(
      payload.url || '/dashboard',
      self.location.origin,
    )

    if (parsedUrl.origin === self.location.origin) {
      targetUrl = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash
    }
  } catch {
    // Use the dashboard as the safe default.
  }

  event.waitUntil(
    self.registration.showNotification(
      String(payload.title || 'Xpnd AI'),
      {
        body: String(payload.body || 'You have a reminder from Xpnd AI.'),
        icon: '/xpnd-ai-icon.png',
        badge: '/xpnd-ai-icon.png',
        tag: String(payload.tag || 'xpnd-reminder'),
        data: { url: targetUrl },
      },
    ),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    (async () => {
      const target = new URL(
        event.notification.data?.url || '/dashboard',
        self.location.origin,
      )

      if (target.origin !== self.location.origin) {
        return
      }

      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      const existing = windows.find((client) => {
        try {
          return new URL(client.url).origin === self.location.origin
        } catch {
          return false
        }
      })

      if (existing) {
        await existing.focus()

        if (typeof existing.navigate === 'function') {
          await existing.navigate(target.href)
        }

        return
      }

      await self.clients.openWindow(target.href)
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Never cache cross-origin requests or authenticated API responses.
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (request.headers.has('authorization')) return

  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname)

  // Keep page navigation network-only. Use the cached shell only
  // when navigation fails and the browser requests a page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedHome = await caches.match('/')

        if (cachedHome) return cachedHome

        return new Response(
          'You are offline. Please reconnect and try again.',
          {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          },
        )
      }),
    )

    return
  }

  if (!isStaticAsset) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(request)

      if (cached) {
        event.waitUntil(
          fetch(request)
            .then((response) => {
              if (response.ok && response.type === 'basic') {
                return cache.put(request, response)
              }
            })
            .catch(() => {}),
        )

        return cached
      }

      try {
        const response = await fetch(request)

        if (response.ok && response.type === 'basic') {
          await cache.put(request, response.clone())
        }

        return response
      } catch {
        return new Response('Asset unavailable offline.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      }
    })(),
  )
})