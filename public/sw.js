// The Oven Pizza - Service Worker
// Handles push notifications and background updates

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);

  if (!event.data) {
    console.log('[SW] No data in push event');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Push data:', data);

    const options = {
      body: data.body || 'You have a new notification',
      icon: '/logo.png',
      badge: '/badge.png',
      tag: data.tag || 'order-notification',
      requireInteraction: data.requireInteraction || false,
      data: {
        orderId: data.orderId,
        branchId: data.branchId,
        url: data.url || '/',
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'The Oven Pizza', options)
    );
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
    event.waitUntil(
      self.registration.showNotification('The Oven Pizza', {
        body: 'You have a new notification',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification dismissed:', event.notification.data);
});
