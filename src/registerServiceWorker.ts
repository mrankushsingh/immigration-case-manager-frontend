/**
 * Registers the app service worker and checks for updates on focus / interval.
 * Bump `CACHE_NAME` in `public/sw.js` when you need to invalidate old caches after deploys.
 */

const UPDATE_CHECK_MS = 60 * 60 * 1000; // hourly

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[SW] registered', registration.scope);

        const pingUpdate = () => {
          registration.update().catch(() => {});
        };

        setInterval(pingUpdate, UPDATE_CHECK_MS);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') pingUpdate();
        });

        registration.addEventListener('updatefound', () => {
          console.log('[SW] update found — new version will activate (skipWaiting in sw.js)');
        });
      })
      .catch((err) => console.error('[SW] registration failed', err));
  });
}

/** Online / offline — optional hook for UI (e.g. banner) */
export function registerConnectionListeners(
  onOnline?: () => void,
  onOffline?: () => void
): void {
  window.addEventListener('online', () => {
    console.log('[net] online');
    onOnline?.();
  });
  window.addEventListener('offline', () => {
    console.log('[net] offline');
    onOffline?.();
  });
}
