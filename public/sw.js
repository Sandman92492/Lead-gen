// Service Worker for Port Alfred Holiday Pass PWA
// Build timestamp: 2025-12-15T15:28:17.517Z
const CACHE_NAME = 'holiday-pass-v5';
const RUNTIME_CACHE = 'holiday-pass-runtime-v5';
const ASSETS_CACHE = 'holiday-pass-assets-v5';
const REDEMPTION_QUEUE_KEY = 'redemption_queue';

// Assets to cache on install (app shell)
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event: cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE).catch(() => {
          console.log('Some assets could not be cached during install');
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Keep only current cache versions
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== ASSETS_CACHE &&
              cacheName.includes('holiday-pass')
            ) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event: optimized caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and external API domains (but allow googleusercontent images to be cached)
  if (url.protocol === 'chrome-extension:' || url.hostname.includes('googleapis.com')) {
    return;
  }
  
  // Handle googleusercontent images with long cache
  if (url.hostname.includes('googleusercontent.com')) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) return response;
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(ASSETS_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // For HTML pages (navigation), use network-first strategy
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful HTML responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cached version if offline
          return caches.match(request)
            .then((response) => response || caches.match('/index.html'))
            .catch(() => {
              // Last resort fallback
              return new Response('Offline - Please check your connection', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain',
                }),
              });
            });
        })
    );
    return;
  }

  // For images, use cache-first strategy
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) return response;
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(ASSETS_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // Fallback for failed images - return cached or empty transparent pixel
          return caches.match(request)
            .catch(() => {
              // Return 1x1 transparent PNG if offline and no cache
              return new Response(
                new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 10, 73, 68, 65, 84, 120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]),
                {
                  status: 200,
                  statusText: 'OK',
                  headers: new Headers({
                    'Content-Type': 'image/png',
                  }),
                }
              );
            });
        })
    );
    return;
  }

  // For other assets (CSS, JS), use network-first with longer cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          const cacheTarget = request.destination === 'script' || request.destination === 'style'
            ? ASSETS_CACHE
            : RUNTIME_CACHE;
          caches.open(cacheTarget).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fall back to cache if network fails
        return caches.match(request)
          .catch(() => {
            return new Response('Offline - Asset unavailable', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
  );
});

// Background sync for queued redemptions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-redemptions') {
    event.waitUntil(syncQueuedRedemptions());
  }
});

// Message handler for triggering manual sync and SW updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_REDEMPTIONS') {
    event.waitUntil(syncQueuedRedemptions());
  }
  
  // Skip waiting: activate new SW immediately
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Function to sync queued redemptions
async function syncQueuedRedemptions() {
  try {
    const clients = await self.clients.matchAll({ type: 'window' });

    if (clients.length === 0) {
      console.log('No clients available for syncing');
      return;
    }

    // Send message to first client to perform sync
    clients[0].postMessage({
      type: 'PERFORM_SYNC',
      payload: null,
    });
  } catch (error) {
    console.error('Error syncing redemptions:', error);
  }
}
