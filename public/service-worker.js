// Service Worker for Event Counter PWA
// Handles offline functionality and caching strategy

const CACHE_NAME = 'event-counter-v1';
const API_CACHE = 'event-counter-api-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.log('[Service Worker] Some assets failed to cache:', err);
        // Continue even if some assets fail
        return Promise.resolve();
      });
    })
  );
  
  // Force the waiting service worker to become the active one
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests differently from assets
  if (url.pathname.startsWith('/api/')) {
    // Network first strategy for API calls
    event.respondWith(networkFirst(request));
  } else {
    // Cache first strategy for assets
    event.respondWith(cacheFirst(request));
  }
});

/**
 * Cache first strategy: Try cache, fall back to network
 * Good for static assets that don't change often
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    console.log('[Service Worker] Serving from cache:', request.url);
    return cached;
  }

  try {
    console.log('[Service Worker] Fetching from network:', request.url);
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Fetch failed, returning offline page:', error);
    
    // Return offline page or cached version
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Return a generic offline response
    return new Response(
      JSON.stringify({
        error: 'You are offline',
        message: 'This action requires an internet connection'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    );
  }
}

/**
 * Network first strategy: Try network, fall back to cache
 * Good for API calls that need fresh data
 */
async function networkFirst(request) {
  try {
    console.log('[Service Worker] Fetching from network:', request.url);
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url, error);
    
    // Try to return cached version
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Return offline error
    return new Response(
      JSON.stringify({
        error: 'You are offline',
        message: 'Unable to fetch data. Check your connection.'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    );
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[Service Worker] Cache cleared');
    });
  }
});

console.log('[Service Worker] Script loaded');
