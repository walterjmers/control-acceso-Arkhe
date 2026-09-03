// Service worker mínimo: cachea la página principal para que abra rápido
// y sea "instalable" como app. No cachea el escaneo en sí (necesita internet
// para consultar Google Apps Script), solo la interfaz visual.

var CACHE_NAME = "escaner-arkhe-v1";
var ARCHIVOS_CACHE = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ARCHIVOS_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(
        nombres
          .filter(function (nombre) { return nombre !== CACHE_NAME; })
          .map(function (nombre) { return caches.delete(nombre); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  // Para las consultas al escáner (Google Apps Script), siempre ir a la red.
  if (event.request.url.indexOf("script.google.com") !== -1 ||
      event.request.url.indexOf("script.googleusercontent.com") !== -1) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (respuestaCache) {
      return respuestaCache || fetch(event.request);
    })
  );
});
