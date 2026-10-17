// OneSignal Service Worker v16 - Tiêu Chí Đoàn Cấp Cơ Sở
// Tự động nhận Web Push Notification kể cả khi tắt trình duyệt / tắt máy / màn hình khóa
try {
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch (e) {
  console.warn('[OneSignalWorker] Could not import OneSignalSDK.sw.js:', e);
}

// ĐẢM BẢO MỌI THÔNG BÁO PUSH ĐỀU RUNG MẠNH, BẬT MÀN HÌNH KHÓA VÀ HIỆN BANNER NỔI
if (typeof self !== 'undefined' && self.registration) {
  const _origShowNotification = self.registration.showNotification.bind(self.registration);
  self.registration.showNotification = function(title, options) {
    try {
      options = options || {};
      if (!options.tag) {
        options.tag = 'tieuchidoan_msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      }
      options.renotify = true;
      options.silent = false;
      if (!options.vibrate) {
        options.vibrate = [300, 150, 300, 150, 300];
      }
      if (!options.badge) options.badge = './favicon.png';
      if (!options.icon) options.icon = './icon-192.png';

      // Cập nhật App Badge theo số lượng thông báo thực tế đang có trong khay
      if (self.navigator && 'setAppBadge' in self.navigator) {
        if (self.registration && self.registration.getNotifications) {
          self.registration.getNotifications().then(notifs => {
            const count = (notifs ? notifs.length : 0) + 1;
            self.navigator.setAppBadge(count).catch(() => {});
          }).catch(() => {
            self.navigator.setAppBadge(1).catch(() => {});
          });
        } else {
          self.navigator.setAppBadge(1).catch(() => {});
        }
      }
      return _origShowNotification(title, options);
    } catch (err) {
      console.warn('[OneSignalWorker] showNotification wrapper error:', err);
      return _origShowNotification(title, options || {});
    }
  };
}

const SW_VERSION = '1792216073';
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
    // Nếu count === 0 (người dùng đã vào đọc hết tin / mở ô chat), tự động xóa sạch các thông báo trong khay
    if (count === 0 && self.registration && self.registration.getNotifications) {
      self.registration.getNotifications().then(notifs => {
        notifs.forEach(n => n.close());
      }).catch(() => {});
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

  // Gửi tín hiệu PUSH_RECEIVED tới các client đang mở
  if (self.clients && self.clients.matchAll) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (let client of clientList) {
          client.postMessage({ type: 'PUSH_RECEIVED', data: data });
        }
      }).catch(() => {})
    );
  }

  // Cập nhật huy hiệu App Badge khi có thông báo đẩy gửi tới
  if (self.navigator && 'setAppBadge' in self.navigator) {
    let bCount = 1;
    try {
      const customData = (data.custom && data.custom.a) || data.data || {};
      if (customData.badgeCount) bCount = Number(customData.badgeCount) || 1;
    } catch (e) {}
    self.navigator.setAppBadge(bCount).catch(() => {});
  }

  // Nếu push này là từ OneSignal (có custom.i), OneSignalSDK.sw.js đã tự xử lý hiển thị banner.
  // Tránh hiển thị trùng lặp 2 thông báo cùng lúc.
  const isOneSignal = Boolean(data.custom && data.custom.i);
  if (!isOneSignal) {
    const title = data.title || data.heading || 'Bộ Tiêu Chí Đoàn Cấp Cơ Sở';
    const body = data.body || data.message || 'Bạn có thông báo mới từ hệ thống!';
    const targetUrl = (data.data && data.data.url) || data.web_url || './';

    const options = {
      body: body,
      icon: './icon-192.png',
      badge: './favicon.png',
      vibrate: [200, 100, 200],
      tag: 'tieuchidoan_push_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      renotify: true,
      data: { url: targetUrl }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// XỬ LÝ KHI NGƯỜI DÙNG BẤM VÀO THÔNG BÁO NỔI
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './';

  // Cập nhật lại số lượng huy hiệu App Badge sau khi đóng bớt thông báo
  if (self.navigator && 'setAppBadge' in self.navigator) {
    if (self.registration && self.registration.getNotifications) {
      self.registration.getNotifications().then(notifs => {
        const remaining = notifs ? notifs.length : 0;
        if (remaining > 0) {
          self.navigator.setAppBadge(remaining).catch(() => {});
        } else {
          self.navigator.clearAppBadge().catch(() => {});
        }
      }).catch(() => {});
    }
  }

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
