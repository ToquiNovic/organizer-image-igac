import { precacheAndRoute } from 'workbox-precaching';

// Inyecta el manifiesto para que Workbox precachee los recursos
precacheAndRoute(self.__WB_MANIFEST);

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