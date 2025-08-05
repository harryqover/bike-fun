/**
 * Service Worker for RoadBuddy AI PWA.
 * Implements a cache-first strategy for static assets to enable offline use
 * and a network-first strategy for API calls to ensure data freshness.
 */

const CACHE_NAME = 'roadbuddy-ai-cache-v2'; // Incremented cache version
const API_URL_PREFIX = 'https://script.google.com/macros/s/';

// List of core files to cache on installation
const urlsToCache = [
  'https://harryqover.github.io/bike-fun/roadbuddyai/index.html',
  'https://harryqover.github.io/bike-fun/roadbuddyai/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/exif-js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
  'https://harryqover.github.io/bike-fun/img/roadbuddyai.jpeg',
  'https://harryqover.github.io/bike-fun/img/roadbuddyai_192.png',
  'https://harryqover.github.io/bike-fun/img/roadbuddyai_512.png'
];

// Install event: opens a cache and adds the core files to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching core assets.');
        const promises = urlsToCache.map(urlToCache => {
          return fetch(new Request(urlToCache, { mode: 'no-cors' }))
            .then(response => {
              if (response.status === 200) {
                return cache.put(urlToCache, response);
              }
              console.warn(`Skipping caching for ${urlToCache} - status: ${response.status}`);
            }).catch(err => {
              console.error(`Failed to fetch and cache ${urlToCache}`, err);
            });
        });
        return Promise.all(promises);
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
            console.log('Deleting old cache:', cacheName);
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

  // Strategy for API calls: Network first, then cache fallback
  if (requestUrl.href.startsWith(API_URL_PREFIX)) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
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
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
