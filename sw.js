// Service Worker Tiêu Chí Đoàn - Tự động xóa sạch Cache khi có phiên bản mới
const SW_VERSION = '1791429690';
const CACHE_NAME = 'tieuchidoan-v' + SW_VERSION;
const ASSETS_TO_CACHE = [
  './logo_doan.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Đối với code (HTML, JS, CSS) -> Luôn lấy mới 100% từ mạng (no-cache), không lưu đệm để tránh kẹt F5
  const isCodeOrDoc =
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname === '/' ||
    url.pathname.endsWith('/') ||
    url.origin !== self.origin;

  if (isCodeOrDoc) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Đối với hình ảnh tĩnh -> Dùng Cache-First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
