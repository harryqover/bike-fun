/**
 * Service Worker for RoadBuddy AI PWA.
 * Implements a cache-first strategy for static assets to enable offline use
 * and a network-first strategy for API calls to ensure data freshness.
 */

const CACHE_NAME = 'roadbuddy-ai-cache-v1';
const API_URL_PREFIX = 'https://script.google.com/macros/s/';

// List of files to cache on installation
const urlsToCache = [
  '/',
  'index.html',
  'script.js',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/exif-js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
  'https://harryqover.github.io/bike-fun/img/roadbuddyai.jpeg'
];

// Install event: opens a cache and adds the core files to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: removes old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serves assets from cache or network.
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Strategy for API calls: Network first, then cache fallback (if available)
  if (requestUrl.href.startsWith(API_URL_PREFIX)) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // If the network request is successful, cache it and return it
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return networkResponse;
        })
        .catch(() => {
          // If the network fails, try to get the response from the cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Strategy for all other requests (static assets): Cache first, then network fallback
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});
