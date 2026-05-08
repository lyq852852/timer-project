/**
 * Timer PWA - Service Worker
 * 鎻愪緵绂荤嚎缂撳瓨鏀寔
 */

const CACHE_NAME = 'timer-pwa-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
];

// 瀹夎闃舵锛氶缂撳瓨鎵€鏈夐潤鎬佽祫婧?
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => {
      // 寮哄埗婵€娲绘柊鐨?SW
      return self.skipWaiting();
    })
  );
});

// 婵€娲婚樁娈碉細娓呯悊鏃х紦瀛?
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // 绔嬪嵆鎺ョ鎵€鏈夐〉闈?
      return self.clients.claim();
    })
  );
});

// 璇锋眰鎷︽埅锛氱紦瀛樹紭鍏堬紝鏈懡涓垯缃戠粶璇锋眰
self.addEventListener('fetch', (event) => {
  // 浠呭鐞嗗悓婧愯姹?
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 缂撳瓨鍛戒腑锛屽厛杩斿洖缂撳瓨鍐嶆洿鏂帮紙stale-while-revalidate锛?
        event.waitUntil(
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {
            // 缃戠粶璇锋眰澶辫触锛屽拷鐣ワ紙缂撳瓨宸茶繑鍥烇級
          })
        );
        return cachedResponse;
      }

      // 缂撳瓨鏈懡涓紝璧扮綉缁?
      return fetch(event.request).then((networkResponse) => {
        // 瀵归潤鎬佽祫婧愯繘琛岀紦瀛?
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // 缃戠粶涓嶅彲鐢ㄤ笖鏃犵紦瀛橈紝杩斿洖绂荤嚎椤甸潰
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
