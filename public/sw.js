// Service worker with network-first strategy
const CACHE_NAME = 'campuspulse-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Always fetch fresh from network
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
