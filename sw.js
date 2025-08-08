const CACHE_NAME = 'planner-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
  // (필요하면 아이콘 파일 경로를 추가)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 네트워크 우선, 실패 시 캐시 폴백
  event.respondWith(
    fetch(event.request).then(resp => {
      // 응답을 캐시에 저장 (파일 응답만)
      if (resp && resp.status === 200 && event.request.method === 'GET') {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return resp;
    }).catch(() => caches.match(event.request).then(matched => matched || caches.match('./')))
  );
});
