/* Custom service worker used with next-pwa (injectManifest)
   This file will have the precache manifest injected during build.
   We add a message handler for SKIP_WAITING so the client 'Atualizar' button works,
   and ensure clients.claim() on activation so the new worker takes control.
*/

self.addEventListener('message', (event) => {
  if (!event.data) {
    return;
  }

  const { type } = event.data;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (self.clients && clients.claim) {
        await clients.claim();
      }
    })()
  );
});

// Placeholder for precache manifest that next-pwa will inject in build
// workbox will add the precache manifest here when using injectManifest
// self.__WB_MANIFEST = []; // injected by build step

// Basic fetch handler (workbox will usually add runtime caching rules)
self.addEventListener('fetch', (event) => {
  // Let network handle it by default, fallback to cache if desired by workbox rules
});
