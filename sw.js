/* ============================================================
   twRty — Service Worker DISABLE/UNREGISTER
   This SW unregisters itself and deletes all caches.
   Any browser that previously installed our SW will, on next
   visit, run this version which removes the SW entirely.
   The site then operates without a Service Worker.

   To re-enable Service Worker later, replace this file with the
   real cache-first SW.
============================================================ */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Delete every cache this SW (or any old version) created
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))),
      // Unregister self so the browser stops using a SW for this site
      self.registration.unregister(),
    ]).then(() => self.clients.claim())
  );
});

// No fetch handler — every request goes to network, browser handles caching itself.
