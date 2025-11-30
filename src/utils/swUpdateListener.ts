/**
 * Service Worker Update Listener
 * Detects when a new service worker is waiting and prompts user to update
 * or auto-activates on next visit
 */

let pendingRegistration: ServiceWorkerRegistration | null = null;

/**
 * Listen for service worker updates
 * Dispatches custom event when new version is ready
 */
export function initSWUpdateListener() {
  console.log('initSWUpdateListener: Starting');
  if (!('serviceWorker' in navigator)) {
    console.log('initSWUpdateListener: Service Worker not supported');
    return;
  }

  // Get current registration
  navigator.serviceWorker.getRegistration().then((registration) => {
    console.log('initSWUpdateListener: Got registration:', registration);
    if (!registration) {
      console.log('initSWUpdateListener: No registration found');
      return;
    }

    // Check for updates every 60 seconds
    setInterval(() => {
      registration?.update().catch(() => {
        // Silent fail
      });
    }, 60000);

    // Listen for new waiting service worker
    registration.addEventListener('updatefound', () => {
      console.log('initSWUpdateListener: updatefound event fired');
      const newWorker = registration.installing;

      if (!newWorker) {
        console.log('initSWUpdateListener: No installing worker');
        return;
      }

      newWorker.addEventListener('statechange', () => {
        console.log('initSWUpdateListener: SW state changed to:', newWorker.state);
        // New SW is waiting (installed but not activated)
        if (newWorker.state === 'installed') {
          // Check if we already have an active service worker
          if (navigator.serviceWorker.controller) {
            console.log('initSWUpdateListener: Dispatching swupdate event');
            // Active SW exists, so this is a new update
            pendingRegistration = registration;
            // Dispatch custom event for app to listen to
            window.dispatchEvent(
              new CustomEvent('swupdate', { detail: registration })
            );
          } else {
            console.log('initSWUpdateListener: No active controller, skipping update prompt');
          }
        }

        // New SW is activated
        if (newWorker.state === 'activated') {
          // Optionally reload to use new version immediately
          // window.location.reload();
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
  console.log('acceptSWUpdate called, pendingRegistration:', pendingRegistration);
  if (pendingRegistration?.waiting) {
    console.log('Sending SKIP_WAITING to waiting SW');
    // Tell the waiting service worker to activate
    pendingRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload page once new SW takes over
    let refreshed = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Controller changed, reloading page');
      if (!refreshed) {
        window.location.reload();
        refreshed = true;
      }
    });
  } else {
    console.log('No pending registration or waiting SW');
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
