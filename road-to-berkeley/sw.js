// Network first so updates show up whenever the phone is online; cache as an offline fallback.
const CACHE = "rtb-lock-c87f365182";
const SHELL = ["./", "apple-touch-icon.png", "bank.bin", "bank.html", "guide.bin", "guide.html", "icon-192.png", "icon-512.png", "index.bin", "index.html", "manifest.webmanifest", "preprogram.bin", "preprogram.html", "speaking.bin", "speaking.html", "vaccins.bin", "vaccins.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    // Same-origin files are revalidated with the server instead of trusting the 10-minute HTTP cache
    // (fetched by URL, since a page-navigation request can't be re-issued with new options everywhere).
    (new URL(req.url).origin === self.location.origin ? fetch(req.url, { cache: "no-cache" }) : fetch(req))
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("index.html")))
  );
});
