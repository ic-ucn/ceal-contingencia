const CACHE_NAME = "ceal-contingencia-v43";
const APP_SHELL = [
  "./",
  "./index.html",
  "./admin.html",
  "./styles.css?v=43",
  "./admin.css?v=43",
  "./app.js?v=43",
  "./admin.js?v=43",
  "./manifest.webmanifest?v=43",
  "./assets/app-icon.svg",
  "./assets/logo-ingenieria-civil.png?v=43",
  "./assets/petitorio-paralizacion-2026.pdf"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/") || event.request.method !== "GET") {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === "navigate" || event.request.destination === "document") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => {
          const directMatch = await caches.match(event.request);
          if (directMatch) return directMatch;
          if (url.pathname.endsWith("/admin.html")) {
            return caches.match("./admin.html");
          }
          return caches.match("./index.html");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return Promise.reject(new Error("asset-unavailable"));
        });
    })
  );
});
