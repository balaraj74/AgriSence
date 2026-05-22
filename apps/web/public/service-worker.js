// Define the cache name, including a version number for easy updates.
const CACHE_NAME = 'agrisence-v1';

// List the essential files that make up the app's shell.
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Installation event: fires when the service worker is first installed.
self.addEventListener('install', event => {
  // We don't want to interrupt previous service worker until this one is ready.
  self.skipWaiting();

  event.waitUntil(
    // Open the cache and add all the app shell files to it.
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation event: fires when the new service worker is activated.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        // Delete any old caches that don't match the current version.
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event: fires for every network request the browser makes.
self.addEventListener('fetch', event => {
  event.respondWith(
    // Try to find a matching response in the cache first.
    caches.match(event.request)
      .then(response => {
        // If a cached response is found, return it.
        if (response) {
          return response;
        }
        // Otherwise, make a network request for the resource.
        return fetch(event.request);
      })
  );
});
