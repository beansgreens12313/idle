// Keeps IDLE's preview instant and working offline. Bump CACHE when any file changes.
const CACHE = "idle-v4";
const FILES = [
  "./", "index.html", "manifest.webmanifest", "mo.svg", "og.jpg", "icon-192.png", "icon-512.png", "apple-touch-icon.png",
  "fonts/Nunito_400Regular.woff", "fonts/Nunito_700Bold.woff", "fonts/Nunito_900Black.woff",
  "shots/napping.webp", "shots/gapAlert.webp", "shots/today.webp", "shots/questFound.webp", "shots/questTimer.webp",
  "shots/questClear.webp", "shots/chat.webp", "shots/recap.webp", "shots/goals.webp", "shots/you.webp",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page itself comes from the network when it can, so updates show up; everything else from the cache.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          if (r.ok) {
            const copy = r.clone();
            caches.open(CACHE).then((c) => c.put("index.html", copy));
          }
          return r;
        })
        .catch(() => caches.match("index.html"))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
