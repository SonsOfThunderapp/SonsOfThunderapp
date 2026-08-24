/* 20260824-imin1: only I’M IN signs a brother in. No Brothers/Home SIGN IN. */
/* Thunder Board service worker — push, badge, share-in, deep-link */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(function (k) { return k !== 'tb-share'; }).map(function (k) {
        return caches.delete(k);
      }));
    } catch (e) {}
    await self.clients.claim();
    try {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach(function (c) {
        try { c.postMessage({ type: 'tb-sw-updated' }); } catch (e) {}
      });
    } catch (e) {}
  })());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && (url.pathname === '/share-memory' || url.pathname === '/share-memory/')) {
    event.respondWith((async () => {
      try {
        const form = await event.request.formData();
        const file = form.get('media') || form.get('file') || form.get('image');
        if (file && file.size) {
          const cache = await caches.open('tb-share');
          await cache.put('/__shared_memory', new Response(file, {
            headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Filename': file.name || 'shared' }
          }));
        }
      } catch (e) {}
      return Response.redirect('/?view=events&add=1&shared=1', 303);
    })());
    return;
  }
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
  const tag = data.tag || 'thunder-gathering';
  const gathering = /^thunder-(gathering|d7|d1|h2|morning|7d|1d|2h)/.test(tag) || tag.indexOf('thunder-d') === 0;
  const options = {
    body: data.body || '',
    icon: '/assets/icon-192-v3.png',
    badge: '/assets/icon-official.png',
    data: { url: data.url || '/?view=home' },
    tag: tag,
    renotify: false
  };
  if (gathering) {
    options.actions = [
      { action: 'imin', title: "I'M IN" },
      { action: 'open', title: 'OPEN' }
    ];
  }

  event.waitUntil((async () => {
    await self.registration.showNotification(title, options);
    try {
      if (self.registration.setAppBadge) await self.registration.setAppBadge(1);
    } catch (e) {}
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let target = (event.notification.data && event.notification.data.url) || '/?view=home';
  if (event.action === 'imin') target = '/?view=home&imin=1';
  else if (event.action === 'open' || !event.action) target = (event.notification.data && event.notification.data.url) || '/?view=home';
  event.waitUntil(
    (async () => {
      try {
        if (self.registration.clearAppBadge) await self.registration.clearAppBadge();
      } catch (e) {}
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
