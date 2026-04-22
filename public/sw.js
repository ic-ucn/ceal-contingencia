const CACHE_NAME = "ceal-contingencia-v33";
const APP_SHELL = [
  "./",
  "./index.html",
  "./admin.html",
  "./styles.css?v=33",
  "./admin.css?v=33",
  "./app.js?v=33",
  "./admin.js?v=33",
  "./manifest.webmanifest?v=33",
  "./assets/app-icon.svg",
  "./assets/logo-ingenieria-civil.png?v=33"
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

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/") || event.request.method !== "GET") {
    event.respondWith(fetch(event.request));
    return;
  }

  if (url.pathname.endsWith("/config.js")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
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
