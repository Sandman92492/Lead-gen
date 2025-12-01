/**
 * Service Worker Update Listener
 * Detects when a new service worker is waiting and prompts user to update
 * or auto-activates on next visit
 */

let pendingRegistration: ServiceWorkerRegistration | null = null;
let currentRegistration: ServiceWorkerRegistration | null = null;

/**
 * Manually trigger an update check (useful for testing)
 */
export function checkForUpdatesNow() {
  if (currentRegistration) {
    currentRegistration.update().catch(() => {
      // Silent fail
    });
  } else {
    // Try to get registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        currentRegistration = reg;
        reg.update().catch(() => {
          // Silent fail
        });
      }
    });
  }
}

/**
 * Listen for service worker updates
 * Dispatches custom event when new version is ready
 */
export function initSWUpdateListener() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  // Get current registration
  navigator.serviceWorker.getRegistration().then((registration) => {
    if (!registration) {
      return;
    }

    currentRegistration = registration;

    // Check for updates every 60 seconds
    setInterval(() => {
      registration?.update().catch(() => {
        // Silent fail
      });
    }, 60000);

    // Also check when page becomes visible or focused
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        registration?.update().catch(() => {
          // Silent fail
        });
      }
    });

    window.addEventListener('focus', () => {
      registration?.update().catch(() => {
        // Silent fail
      });
    });

    // Listen for new waiting service worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (!newWorker) {
        return;
      }

      newWorker.addEventListener('statechange', () => {
        // New SW is waiting (installed but not activated)
        if (newWorker.state === 'installed') {
          // Check if we already have an active service worker
          if (navigator.serviceWorker.controller) {
            // Active SW exists, so this is a new update
            pendingRegistration = registration;
            // Dispatch custom event for app to listen to
            window.dispatchEvent(
              new CustomEvent('swupdate', { detail: registration })
            );
          }
        }
      });
    });
  });
}

/**
 * Accept pending update and reload
 * Call this when user clicks "Update" button
 */
export function acceptSWUpdate() {
  if (pendingRegistration?.waiting) {
    // Tell the waiting service worker to activate
    pendingRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload page once new SW takes over
    let refreshed = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshed) {
        window.location.reload();
        refreshed = true;
      }
    });
    
    // Fallback: reload after 2 seconds if controller doesn't change
    setTimeout(() => {
      if (!refreshed) {
        window.location.reload();
        refreshed = true;
      }
    }, 2000);
  } else {
    // No waiting worker, just reload
    window.location.reload();
  }
}

/**
 * Get pending registration (used to check if update is available)
 */
export function getPendingRegistration() {
  return pendingRegistration;
}

/**
 * Clear pending registration (e.g., when user dismisses update)
 */
export function clearPendingRegistration() {
  pendingRegistration = null;
}
