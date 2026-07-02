/* Pharm-Assist service worker — enables install ("Add to Home Screen") and
   basic offline caching of the app shell. It deliberately never caches API
   calls, and serves fresh HTML when online. Bump CACHE on meaningful changes. */
const CACHE = 'pharm-assist-v1';

// Pre-cache the app shell so navigations work offline.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(['/', '/index.html'])).then(() => self.skipWaiting())
  );
});

// Clean up old caches when a new service worker activates.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                       // never touch POST/PUT/etc.

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // ignore cross-origin (GoodRx, Gmail, etc.)
  if (url.pathname.startsWith('/api')) return;            // never cache the API — always hit the network

  // Page navigations: network-first (fresh when online), fall back to cached shell.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/index.html')));
    return;
  }

  // Static assets (hashed JS/CSS/images): cache-first, then network (and cache it).
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => cached)
    )
  );
});
