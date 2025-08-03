// sw.js - Service Worker for offline functionality

const CACHE_NAME = 'pannekoek-pwa-cache-v2'; // Incremented cache version
// Corrected relative paths for GitHub pages subdirectory
const urlsToCache = [
    './', // Represents the root of the directory
    'index.html',
    'manifest.json',
    'https://cdn.tailwindcss.com/',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Pacifico&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://storage.googleapis.com/gemini-prod/images/89f7c18a-f781-41cd-9e6f-24521aa097e4', // Cache the logo image
    // Add paths to your icons if they are stored locally, e.g. 'images/icon-192x192.png'
];

// Install event: opens a cache and adds the core files to it.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and caching files');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event: serves assets from cache if they exist.
self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                // Return response from cache if found
                if (response) {
                    return response;
                }

                // If not in cache, fetch from network
                return fetch(event.request).then(networkResponse => {
                    // Check if we received a valid response
                    if (networkResponse && networkResponse.status === 200) {
                        // Cache the new response for future use
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        })
    );
});


// Activate event: cleans up old caches.
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
