/* eslint-disable no-restricted-globals */
/**
 * Service worker — BERLIKU frontend
 * Bump CACHE_NAME when you deploy breaking cache changes so users get fresh shells/assets.
 */
const CACHE_NAME = 'berliku-app-v3';
const PRECACHE_URLS = ['/', '/index.html', '/logo_AB.svg', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch((err) => console.warn('[SW] precache skip', url, err))
          )
        )
      )
      .catch((err) => console.error('[SW] install failed', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] delete old cache', key);
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Allow the page to force activation (e.g. after user taps "Update")
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function shouldBypassCache(url) {
  const p = url.pathname;
  // API proxy / JSON — always network
  if (p.startsWith('/api') || p.includes('/api/')) return true;
  return false;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!isSameOrigin(url)) return;

  if (shouldBypassCache(url)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigation: network-first so new deploys load immediately; fallback to cached shell offline
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // App assets (JS/CSS/chunks): network-first, then cache — avoids stale bundles after deploy
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
