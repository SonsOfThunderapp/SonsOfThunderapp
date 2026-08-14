/* Thunder Board service worker — push + minimal fetch (Android install criteria) */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/* Required by Chromium Android for full PWA install / WebAPK eligibility.
   Network-only pass-through — no offline cache bloat. */
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

self.addEventListener('push', (event) => {
  let data = { title: 'Sons of Thunder', body: 'Open Thunder Board', url: '/' };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (e) {
    try {
      const text = event.data && event.data.text();
      if (text) data.body = text;
    } catch (e2) {}
  }

  const title = data.title || 'Sons of Thunder';
  const options = {
    body: data.body || 'Open Thunder Board',
    icon: '/assets/icon-192.png',
    badge: '/assets/favicon-32.png',
    data: { url: data.url || '/' },
    tag: data.tag || 'thunder-gathering',
    renotify: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of all) {
        if ('focus' in client) {
          client.focus();
          if (client.navigate) {
            try { await client.navigate(target); } catch (e) {}
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(target);
      }
    })()
  );
});
