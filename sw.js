/* ============================================================
   twRty — Service Worker
   Standard caching strategy mix:
     - HTML pages → bypass SW entirely (always fresh from network)
     - CSS / JS  → stale-while-revalidate (instant + auto-updates on next visit)
     - Fonts / images → cache-first (rarely change)

   Why this works for updates:
   When you push a CSS/JS update, users get the OLD cached version
   on their first page load after the deploy (fast), AND the SW
   fetches the new version in the background and stores it. On their
   NEXT page navigation, they see the new version. No manual bump.

   For emergency cache-clear (e.g. major restructure), bump
   CACHE_VERSION below. activate event will delete the old cache.
============================================================ */

const CACHE_VERSION = 'twrty-v1';

const PRECACHE_URLS = [
  '/css/v2.css',
  '/js/v2.js',
  '/js/cookie-consent.js',
  '/fonts/montserrat-variable.woff2',
  '/fonts/merriweather-variable.woff2',
  '/images/logo-trimmed.png',
  '/images/favicon.ico',
];

// ── Install: pre-cache critical assets, activate immediately ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old cache versions, take control of pages ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Helper: always cache the response if it's a successful, basic (same-origin) reply ──
function cachePut(req, response) {
  if (response && response.status === 200 && response.type === 'basic') {
    const clone = response.clone();
    caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
  }
  return response;
}

// ── Fetch handler: route by file type for the best strategy ──
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET; skip POST/PUT/etc.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip cross-origin entirely (instant.page CDN, Cloudflare insights, etc.)
  if (url.origin !== self.location.origin) return;

  // HTML pages → bypass SW entirely. Browser fetches fresh from network
  // every time, so content edits appear immediately on next navigation.
  if (
    req.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/' ||
    !url.pathname.includes('.')
  ) {
    return;
  }

  // CSS / JS → stale-while-revalidate.
  // Serve cached version instantly (fast), AND fetch fresh in background
  // to update the cache for the NEXT navigation. Keeps users only one
  // page-navigation behind on deploys, automatically.
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const networkPromise = fetch(req).then((resp) => cachePut(req, resp)).catch(() => cached);
      return cached || networkPromise;
    })());
    return;
  }

  // Fonts / images → cache-first (these almost never change; a deploy
  // that DOES change them should bump CACHE_VERSION above).
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => cachePut(req, resp));
    })
  );
});
