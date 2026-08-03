/**
 * Minimal offline-first service worker.
 *
 * Strategy:
 *   - Navigation requests (loading the app itself, i.e. index.html) are
 *     NETWORK-FIRST: always try to fetch the latest version first, and
 *     only fall back to the cached copy if there's no internet. This is
 *     what makes new deploys show up immediately for users instead of
 *     being stuck on whatever was cached on their very first visit.
 *   - Hashed static assets (JS/CSS — Vite gives each build's files a new
 *     filename like index-C5o2EX_m.js) stay CACHE-FIRST, which is safe:
 *     if the content changes, the filename changes too, so there's no
 *     way to serve stale JS/CSS by accident.
 */
const CACHE_NAME = 'gd-topper-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  const isNavigation = request.mode === 'navigate' || request.url.endsWith('/') || request.url.endsWith('index.html');

  if (isNavigation) {
    // Network-first: always get the freshest app shell when online.
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first for everything else (hashed static assets).
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
