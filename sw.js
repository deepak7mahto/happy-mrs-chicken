/**
 * Adventures of Trishu - High Performance Offline Service Worker
 * Generated at build time. Version: adventures-of-trishu-v3.1.0-mu5d3iqo
 */

const CACHE_NAME = 'adventures-of-trishu-v3.1.0-mu5d3iqo';
const PRECACHE_ASSETS = [
  "./",
  "./assets/audio-engine-DscjPmBZ.js",
  "./assets/fredoka-hebrew-400-normal-CT3eDt6U.woff2",
  "./assets/fredoka-hebrew-400-normal-S03uWvSu.woff",
  "./assets/fredoka-hebrew-500-normal-BtShCMVp.woff",
  "./assets/fredoka-hebrew-500-normal-DdMTjgiE.woff2",
  "./assets/fredoka-hebrew-600-normal-BiVDObXj.woff",
  "./assets/fredoka-hebrew-600-normal-CTBxhdlE.woff2",
  "./assets/fredoka-hebrew-700-normal-DBqnFHCe.woff2",
  "./assets/fredoka-hebrew-700-normal-DiqR04Vd.woff",
  "./assets/fredoka-latin-400-normal-17JuUzdy.woff2",
  "./assets/fredoka-latin-400-normal-DbXSrOeS.woff",
  "./assets/fredoka-latin-500-normal-B0JifZgm.woff2",
  "./assets/fredoka-latin-500-normal-BL692wg7.woff",
  "./assets/fredoka-latin-600-normal-C4zohCW5.woff2",
  "./assets/fredoka-latin-600-normal-CcrEjrB4.woff",
  "./assets/fredoka-latin-700-normal-BOIZVyIN.woff2",
  "./assets/fredoka-latin-700-normal-C8FeHd3X.woff",
  "./assets/graphics-engine-CupFgdVd.js",
  "./assets/index-CJc0URvh.js",
  "./assets/index-DM5KVhMt.css",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/icon.svg",
  "./index.html",
  "./manifest.json"
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
      .then(() => {
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SW_ACTIVATED', cacheName: CACHE_NAME });
          });
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'SW_VERSION', version: CACHE_NAME });
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (index.html): Network-First with cached fallback for 100% offline
  if (request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match('./index.html') || caches.match(request);
        })
    );
    return;
  }

  // 2. Hashed build assets (/assets/): Cache-First (immutable)
  if (url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // 3. Static metadata & images (manifest.json, icons): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkRes;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
