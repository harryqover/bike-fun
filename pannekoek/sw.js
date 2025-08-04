// sw.js - Service Worker for offline functionality and push notifications

const CACHE_NAME = 'pannekoek-pwa-cache-v5'; // Incremented cache version
// Only cache local assets during installation.
// Third-party assets will be cached on first use by the fetch handler.
const urlsToCache = [
    './',
    'https://harryqover.github.io/bike-fun/pannekoek/index.html',
    'https://harryqover.github.io/bike-fun/pannekoek/manifest.json',
    'https://harryqover.github.io/bike-fun/pannekoek/img/logo.png'
];

// --- Cache Install and Activate Events ---
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => {
        console.log('Opened cache and caching local files');
        return cache.addAll(urlsToCache);
    }));
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.map(cacheName => {
                if (cacheWhitelist.indexOf(cacheName) === -1) {
                    console.log('Deleting old cache:', cacheName);
                    return caches.delete(cacheName);
                }
            })
        ))
    );
});

// --- Fetch Event Handler ---
// This strategy is "Cache falling back to network".
// It also caches new requests to third-party domains (like Tailwind, Google Fonts) as they are made.
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(responseFromCache => {
                // If the resource is in the cache, return it.
                if (responseFromCache) {
                    return responseFromCache;
                }

                // Otherwise, fetch from the network.
                return fetch(event.request).then(networkResponse => {
                    // If we get a valid response, clone it and put it in the cache.
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    // Return the network response.
                    return networkResponse;
                });
            });
        })
    );
});


// --- PUSH EVENT LISTENER ---
self.addEventListener('push', event => {
    console.log('[Service Worker] Push Received.');
    
    let notificationData = {
        title: 'De Pannekoek',
        body: 'Quelque chose de nouveau s\'est passé !',
        icon: 'https://harryqover.github.io/bike-fun/pannekoek/img/logo.png'
    };

    if (event.data) {
        try {
            const parsedData = JSON.parse(event.data.text());
            notificationData = { ...notificationData, ...parsedData };
        } catch (e) {
            console.error('Push event data parsing error:', e);
        }
    }

    const options = {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: 'https://harryqover.github.io/bike-fun/pannekoek/img/logo.png',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
    );
});

// --- NOTIFICATION CLICK EVENT ---
self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientsArr => {
            const hadWindowToFocus = clientsArr.some(windowClient =>
                windowClient.url.includes('harryqover.github.io/bike-fun/pannekoek/') 
                ? (windowClient.focus(), true) 
                : false
            );
            if (!hadWindowToFocus) {
                clients.openWindow('/bike-fun/pannekoek/index.html').then(wc => wc ? wc.focus() : null);
            }
        })
    );
});
