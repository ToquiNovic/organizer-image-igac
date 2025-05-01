// sw.js
// Marcador para que Workbox inyecte el manifiesto de precaché
self.__WB_MANIFEST;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: "UPDATE_AVAILABLE" })
        );
      });
    })
  );
});
