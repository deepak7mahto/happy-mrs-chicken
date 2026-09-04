#!/usr/bin/env node
import { readdirSync, statSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, relative, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const DIST_DIR = resolve(ROOT_DIR, 'dist');
const PKG_PATH = resolve(ROOT_DIR, 'package.json');

if (!existsSync(DIST_DIR)) {
  console.error('[PWA Build] Error: dist/ directory not found. Run vite build first.');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf-8'));
const version = pkg.version || '3.1.0';
const buildHash = Date.now().toString(36);
const cacheName = `adventures-of-trishu-v${version}-${buildHash}`;

function scanDir(dir) {
  const files = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    // Skip sw.js itself to avoid recursive caching loops
    if (entry === 'sw.js' || entry === '.DS_Store') continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...scanDir(fullPath));
    } else if (stat.isFile()) {
      const rel = './' + relative(DIST_DIR, fullPath).replace(/\\/g, '/');
      files.push(rel);
    }
  }
  return files;
}

const scannedAssets = scanDir(DIST_DIR);
// Always ensure core roots are included
const precacheAssets = Array.from(new Set(['./', './index.html', './manifest.json', ...scannedAssets])).sort();

console.log(`[PWA Build] Generating heavy PWA service worker (${cacheName})...`);
console.log(`[PWA Build] Precaching ${precacheAssets.length} build assets:`);
precacheAssets.forEach(a => console.log(`  + ${a}`));

const swContent = `/**
 * Adventures of Trishu - High Performance Offline Service Worker
 * Generated at build time. Version: ${cacheName}
 */

const CACHE_NAME = '${cacheName}';
const PRECACHE_ASSETS = ${JSON.stringify(precacheAssets, null, 2)};

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
`;

writeFileSync(resolve(DIST_DIR, 'sw.js'), swContent, 'utf-8');
console.log(`[PWA Build] Successfully wrote dist/sw.js`);
