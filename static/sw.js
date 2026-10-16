// Service Worker Tiêu Chí Đoàn - Tự động xóa sạch Cache khi có phiên bản mới
const SW_VERSION = '1792146930';
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

// HỖ TRỢ ĐẶT HUY HIỆU (APP BADGE) TRÊN THANH TASKBAR WINDOWS & MÀN HÌNH PWA
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SET_BADGE') {
    const count = Number(event.data.count) || 0;
    if (self.navigator && 'setAppBadge' in self.navigator) {
      if (count > 0) {
        self.navigator.setAppBadge(count).catch(() => {});
      } else {
        self.navigator.clearAppBadge().catch(() => {});
      }
    }
  } else if (event.data.type === 'SHOW_NOTIFICATION') {
    const title = event.data.title || 'Bộ Tiêu Chí Đoàn';
    const options = event.data.options || {};
    self.registration.showNotification(title, options).catch(() => {});
  }
});

// XỬ LÝ PUSH NOTIFICATION THỰC THỤ KHI TẮT HẲN TRÌNH DUYỆT / ĐÓNG WEB / MÀN HÌNH KHÓA
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Bộ Tiêu Chí Đoàn', message: event.data.text() };
    }
  }
  const title = data.title || data.heading || 'Bộ Tiêu Chí Đoàn Cấp Cơ Sở';
  const body = data.body || data.message || 'Bạn có thông báo mới từ hệ thống!';
  const targetUrl = (data.data && data.data.url) || data.web_url || './';
  const badgeCount = Number(data.badgeCount || (data.custom_data && data.custom_data.badgeCount) || data.badge || 1);

  // CẬP NHẬT SỐ ĐẾM BADGE LÊN BIỂU TƯỢNG APP NGOÀI MÀN HÌNH ĐIỆN THOẠI (ANDROID & IPHONE)
  if (self.navigator && 'setAppBadge' in self.navigator) {
    if (badgeCount > 0) {
      self.navigator.setAppBadge(badgeCount).catch(() => {});
    } else {
      self.navigator.clearAppBadge().catch(() => {});
    }
  }

  const options = {
    body: body,
    icon: './icon-192.png',
    badge: './favicon.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'tieuchidoan-push-' + Date.now(),
    renotify: true,
    data: { url: targetUrl }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// XỬ LÝ KHI NGƯỜI DÙNG BẤM VÀO THÔNG BÁO NỔI
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

