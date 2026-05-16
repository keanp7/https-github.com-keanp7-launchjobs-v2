const CACHE = "relaunchjobs-v3"

const STATIC_ASSETS = [
  "/manifest.json",
  "/icon.svg",
  "/icon-192x192.png",
  "/icon-512x512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)))
    )
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Cache static assets only — no navigation interception, no offline fallback
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Only handle same-origin static assets
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    event.request.mode === "navigate"
  ) {
    return
  }

  // Cache-first for static assets (images, fonts, manifest, icons)
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image/") ||
    /\.(svg|png|jpg|jpeg|webp|woff2?|ico|json)$/.test(url.pathname)

  if (isStatic) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(event.request).then(
          (cached) =>
            cached ||
            fetch(event.request).then((res) => {
              cache.put(event.request, res.clone())
              return res
            })
        )
      )
    )
  }
})
