const CACHE_NAME = 'navallia-v1';

// Recursos estáticos mínimos que queremos cachear logo na instalação
const URLS_TO_CACHE = [
  '/',
  '/offline.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pula cache para requisições de API, Firebase e extensões do navegador (chrome-extension://)
  if (
    !event.request.url.startsWith('http') ||
    event.request.url.includes('/api/') || 
    event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('identitytoolkit.googleapis.com')
  ) {
    return;
  }

  // Tenta buscar na rede, se falhar, tenta no cache. Se falhar no cache (ex: página nova sem internet), retorna offline.html
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se for requisição válida (GET) salva no cache dinâmico para usar offline depois
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Se for navegação de página e não tiver no cache, mostra tela de offline
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        
        // Evitar erro TypeError do Service Worker (Falha ao converter valor para Response)
        return new Response('Network error or resource not cached', { 
          status: 408, 
          headers: { 'Content-Type': 'text/plain' } 
        });
      })
  );
});
