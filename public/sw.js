const CACHE_NAME = "kiments-pwa-v3";
const APP_SHELL = ["/img/pwa/logo_pwa.png", "/manifest.webmanifest"];
const MEDIA_REQUEST = /\.(?:mp4|webm|mov|m4v|mp3|wav|ogg)$/i;
const STATIC_REQUEST = /(?:^\/_next\/static\/|\/(?:img|ico|iconos|font)\/|\/manifest\.webmanifest$|\/favicon\.ico$|\.(?:css|js|json|png|jpg|jpeg|webp|svg|ico|woff2?|ttf)$)/i;

function canCache(request, response) {
  const url = new URL(request.url);
  return (
    response.status === 200 &&
    response.type === "basic" &&
    !request.headers.has("range") &&
    !MEDIA_REQUEST.test(url.pathname) &&
    STATIC_REQUEST.test(url.pathname)
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.headers.has("range") || MEDIA_REQUEST.test(url.pathname)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => Response.error()));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (canCache(request, response)) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {}));
        }
        return response;
      }).catch(() => caches.match(request).then((cached) => cached || Response.error()));
    }),
  );
});
