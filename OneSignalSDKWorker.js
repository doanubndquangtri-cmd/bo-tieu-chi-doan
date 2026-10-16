// OneSignal Service Worker v16 - Tiêu Chí Đoàn Cấp Cơ Sở
// Tự động nhận Web Push Notification kể cả khi tắt trình duyệt / tắt máy / màn hình khóa
try {
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch (e) {
  console.warn('[OneSignalWorker] Could not import OneSignalSDK.sw.js:', e);
}

self.addEventListener('push', (event) => {
  try {
    let data = {};
    if (event.data) {
      try { data = event.data.json(); } catch (e) { data = {}; }
    }
    let badgeCount = 1;
    if (data.badgeCount) badgeCount = Number(data.badgeCount);
    else if (data.custom && data.custom.a && data.custom.a.badgeCount) badgeCount = Number(data.custom.a.badgeCount);
    else if (data.data && data.data.badgeCount) badgeCount = Number(data.data.badgeCount);
    else if (data.badge) badgeCount = Number(data.badge);

    if (self.navigator && 'setAppBadge' in self.navigator) {
      if (badgeCount > 0) {
        self.navigator.setAppBadge(badgeCount).catch(() => {});
      } else {
        self.navigator.clearAppBadge().catch(() => {});
      }
    }
  } catch (err) {}
});
