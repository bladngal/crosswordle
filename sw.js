/* Crosswordle service worker: makes the game load instantly and work offline.
 *
 * Strategy: stale-while-revalidate. Every request is answered from the local
 * cache immediately (instant load, works in airplane mode), while a fresh copy
 * is fetched in the background and stored for NEXT launch. So after deploying
 * changes, players see them on their second visit — no cache-version bumping
 * required for routine updates. Bump CACHE only to force a clean slate.
 */
const CACHE = "crosswordle-v1";

const SHELL = [
  "./",
  "index.html",
  "styles.css",
  "game.js",
  "audio.js",
  "puzzles.js",
  "words.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(e.request);
      const fresh = fetch(e.request)
        .then((res) => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        })
        .catch(() => cached); // offline: fall back to cache
      return cached || fresh;
    })()
  );
});
