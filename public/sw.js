// PayWise Progressive Web App (PWA) Service Worker
const CACHE_NAME = "paywise-offline-v1";

const PRECACHE_ASSETS = [
  "/",
  "/dashboard",
  "/reports",
  "/ai",
  "/savings",
  "/settings",
  "/bills",
  "/budget",
  "/loans",
  "/salary",
  "/transactions",
  "/notifications",
  "/manifest.json",
  "/icon.svg",
  "/icon-192.svg",
  "/icon-512.svg"
];

// Install: pre-cache the app shell and core routes
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn("[PWA SW] Pre-caching warning:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: purge stale caches and claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: offline-first strategy for static assets and network-first for pages
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass non-GET requests (e.g. POST to API)
  if (request.method !== "GET") {
    return;
  }

  // Handle Next.js static files and assets: Stale-While-Revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Handle navigation requests (pages): Network first with fallback to cached page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache the latest version of this page for offline use
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network failed (user is offline), retrieve from cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to cached dashboard if specific route wasn't precached
          const fallback = await caches.match("/dashboard");
          if (fallback) {
            return fallback;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <title>PayWise — Offline Mode</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F8FAFC; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 24px; text-align: center; }
                  .card { background: #1E293B; border-radius: 24px; padding: 32px 24px; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                  h1 { font-size: 20px; font-weight: 800; margin: 0 0 12px; color: #70D6F7; }
                  p { font-size: 14px; color: #94A3B8; line-height: 1.5; margin: 0 0 20px; }
                  button { background: #4A90FF; color: white; border: none; padding: 12px 24px; border-radius: 9999px; font-weight: 700; cursor: pointer; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>PayWise Offline Mode</h1>
                  <p>You are currently offline. Your saved financial data is safely stored in your device&apos;s local storage.</p>
                  <button onclick="window.location.href='/dashboard'">Go to Dashboard</button>
                </div>
              </body>
            </html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // Default fallback for any other requests
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// Skip waiting message listener
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
