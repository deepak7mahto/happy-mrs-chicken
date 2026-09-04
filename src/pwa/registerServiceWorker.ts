import { pwaManager } from './PwaManager';

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register in production and preview modes
  if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          // 1. Check if a worker is already waiting to activate
          if (reg.waiting) {
            pwaManager.notifyUpdateAvailable(reg);
          }

          // 2. Listen for new workers installing
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener('statechange', () => {
                if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                  // A new update is ready!
                  pwaManager.notifyUpdateAvailable(reg);
                }
              });
            }
          });

          // Check for SW updates periodically
          setInterval(() => {
            reg.update().catch(() => {});
          }, 60 * 60 * 1000); // Hourly check
        })
        .catch((err) => {
          console.log('[PWA] ServiceWorker registration failed:', err);
        });
    });
  }
}
