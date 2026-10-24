const CACHE_VERSION = "nexfix-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = "nexfix-images-v1";

// Cache လုပ်မယ့် Static Files
const STATIC_ASSETS = [
  "/",
  "/notes",
  "/library",
  "/search",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/sounds/default-notification.mp3",
];

// Install
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Some static assets failed to cache:", err);
      });
    })
  );
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // အဟောင်း Cache တွေ ဖျက်မယ်
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API Request တွေကို မကိုင်ဘူး (Network ကိုပဲ ပို့)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // ပုံတွေ
  if (request.destination === "image" || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) {
            // Cache ထဲမှာ ရှိရင် အဲ့ဒါကို ပြ
            return cached;
          }
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached);
        });
      })
    );
    return;
  }

  // HTML/JS/CSS တွေ - Network First, Cache Fallback
  if (request.mode === "navigate" || request.destination === "document" || request.destination === "script" || request.destination === "style") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Offline Page
            return caches.match("/");
          });
        })
    );
    return;
  }
});

// Notification Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/notes");
      }
    })
  );
});
