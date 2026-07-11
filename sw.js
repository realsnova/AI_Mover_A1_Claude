/* 單字冒險 Service Worker — 離線可玩、更新可控
   策略：
   1) 自家資產（HTML/manifest/音樂/圖示）：安裝時盡量預先快取；同源請求走「網路優先，離線退回快取」，
      確保線上玩家永遠拿到最新版本，離線玩家仍可完整遊玩。
   2) 跨網域資產（PokeAPI 怪獸圖、Twemoji 圖示）：內容不會變動，走「快取優先」，
      第一次連網瀏覽後即快取，之後離線也能正常顯示。
   3) 版本化快取名稱 + activate 時清除舊版本，並透過訊息機制讓頁面決定何時套用更新（不強制打斷遊玩中的玩家）。
*/

const CACHE_VERSION = "v1";
const STATIC_CACHE = "wa-static-" + CACHE_VERSION;
const RUNTIME_CACHE = "wa-runtime-" + CACHE_VERSION;

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./單字冒險.html",
  "./manifest.json",
  "./assets/audio/BGM_no1.mp3",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
];

const RUNTIME_HOSTS = ["raw.githubusercontent.com", "cdn.jsdelivr.net"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url).catch(() => {})))
    )
  );
  /* 不主動 skipWaiting：讓頁面決定何時套用更新，避免打斷正在遊玩的玩家 */
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== STATIC_CACHE && n !== RUNTIME_CACHE)
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  /* 跨網域靜態資源（怪獸圖／Twemoji）：快取優先，離線也能顯示
     注意：img 標籤未加 crossorigin，回應多半是 opaque response（status 恆為 0、ok 恆為 false），
     無法用 res.ok 判斷成功與否，因此只要 fetch 沒有丟例外就視為可快取。 */
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req)
            .then((res) => {
              cache.put(req, res.clone());
              return res;
            })
            .catch(() => cached); /* 離線且未快取過：交還 undefined，讓畫面走 B3 破圖後備 */
        })
      )
    );
    return;
  }

  /* 同源請求：網路優先（確保拿到最新版），離線時退回快取 */
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match("./單字冒險.html")))
    );
  }
});
