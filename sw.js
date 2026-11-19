const CACHE = "malumotnoma-offline-b5618597";
// Heavy PDF/Fontkit vendor libs (~2.8 MB) are cached on-demand by the fetch handler
// so first visit stays fast for Word-only workflows.
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/fonts.css?v=a7797cf389",
  "./css/app.css?v=74a7131d",
  "./vendor/jszip.min.js",
  "./vendor/xmldom.js",
  "./js/core.js",
  "./js/coi-engine.js",
  "./js/science-engine.js",
  "./js/pdf-engine.js",
  "./js/file-error.js",
  "./js/scanned-pdf-ocr.js",
  "./js/parseworker.js",
  "./js/app.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-first so fresh deployments arrive immediately while offline stays cached.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })),
  );
});
