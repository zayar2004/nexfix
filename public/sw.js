const CACHE_VERSION = "nexfix-v3";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Pre-cache လုပ်မယ့် Pages
const PRECACHE_URLS = [
  "/",
  "/notes",
  "/library",
  "/search",
  "/settings",
  "/settings/notifications",
  "/settings/reminders",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install — Pre-cache
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("Some pre-cache failed:", err);
      });
    })
  );
});

// Activate — အဟောင်း Cache တွေ ဖျက်မယ်
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!key.startsWith(CACHE_VERSION)) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch — Offline မှာ Cache ကနေ ပြမယ်
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Chrome Extension တွေ ကျော်မယ်
  if (!url.protocol.startsWith("http")) return;

  // API Request တွေ — Network only (Offline မှာ Fail ဖြစ်ပါစေ)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ ok: false, error: "Offline" }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // Navigation (Page) — Network First, Cache Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // အောင်မြင်ရင် Cache မှာ သိမ်းမယ်
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(async () => {
          // Offline ဖြစ်ရင် Cache ကနေ ယူမယ်
          const cached = await caches.match(request);
          if (cached) return cached;
          
          // Cache မှာ မရှိရင် Home ကို ပြ
          const homeCached = await caches.match("/");
          if (homeCached) return homeCached;
          
          // အဲ့ဒါလည်း မရှိရင် Offline Page
          return new Response(
            `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Offline</title></head><body style="background:#050505;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:16px;"><h1>📵 Offline</h1><p>Internet မရှိပါ။</p><button onclick="location.reload()" style="padding:12px 24px;background:#20E3FF;color:#000;border:none;border-radius:8px;font-weight:bold;">ပြန် Load မည်</button></body></html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // JS, CSS, Fonts, Images — Cache First
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        
        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // တခြား Request — Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(request))
  );
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
