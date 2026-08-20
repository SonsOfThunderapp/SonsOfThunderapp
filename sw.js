/* Thunder Board service worker — push + deep-link click */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'Sons of Thunder',
    body: 'Open Thunder Board',
    url: '/?view=home',
    tag: 'thunder-gathering'
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = Object.assign({}, data, parsed);
    }
  } catch (e) {
    try {
      const text = event.data && event.data.text();
      if (text) data.body = text;
    } catch (e2) {}
  }

  const title = data.title || 'Sons of Thunder';
  const options = {
    body: data.body || '',
    icon: '/assets/icon-192-v2.png',
    badge: '/assets/icon-official.png',
    data: { url: data.url || '/?view=home' },
    tag: data.tag || 'thunder-gathering',
    renotify: false
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/?view=home';
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of all) {
        try {
          if (client.focus) await client.focus();
          client.postMessage({ type: 'tb-open', url: target });
          return;
        } catch (e) {}
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(target);
      }
    })()
  );
});
