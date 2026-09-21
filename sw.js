// 캐시보다 서버를 먼저 본다. GitHub Pages가 10분 캐시를 걸어두는 탓에
// 고친 내용이 한참 뒤에야 보이던 문제를 없앤다. 오프라인일 때만 캐시를 쓴다.
const CACHE = 'haru-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  e.respondWith((async () => {
    try {
      const fresh = await fetch(e.request, { cache: 'no-store' });
      const cache = await caches.open(CACHE);
      cache.put(e.request, fresh.clone());
      return fresh;
    } catch {
      const hit = await caches.match(e.request);
      if (hit) return hit;
      throw new Error('offline');
    }
  })());
});
