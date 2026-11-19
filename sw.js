const CACHE = "malumotnoma-offline-v3";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/fonts.css?v=a7797cf389",
  "./css/app.css?v=lead-edu-24",
  "./vendor/jszip.min.js",
  "./vendor/xmldom.js",
  "./vendor/pdf.min.js",
  "./vendor/pdf.worker.min.js",
  "./vendor/pdf-lib.min.js",
  "./vendor/fontkit.umd.min.js",
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
