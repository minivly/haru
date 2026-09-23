// 페이지(HTML)는 서버를 먼저 본다 — GitHub Pages의 10분 캐시 때문에 고친 내용이
// 늦게 보이던 문제를 없앤다. 글꼴·아이콘은 잘 안 바뀌고 무거우므로(글꼴 2.9MB)
// 저장해 둔 것을 먼저 쓴다. 오프라인이면 저장해 둔 것으로 버틴다.
const CACHE = 'haru-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const heavy = /\.(woff2|png|jpg|webmanifest)$/.test(url.pathname);

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (heavy) {
      const hit = await cache.match(e.request);
      if (hit) return hit;
    }
    try {
      const fresh = await fetch(e.request, heavy ? {} : { cache: 'no-store' });
      if (fresh.ok) cache.put(e.request, fresh.clone());
      return fresh;
    } catch {
      const hit = await cache.match(e.request);
      if (hit) return hit;
      throw new Error('offline');
    }
  })());
});
