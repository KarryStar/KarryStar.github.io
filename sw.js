/* 考研学习站导航主页 Service Worker
   scope=/ ：同时控制导航主页与 /815-agri-extension/、/341-agri-comprehensive/ 子路径
   策略：同源 network-first（离线回退缓存，保证题库更新即时可见）；
        跨域（ECharts 等 CDN）cache-first；视频 Range 请求直连不缓存。
   内容更新后请递增 VER 以清理旧缓存。 */
const VER = "v1.0.0";
const CACHE = "karrystudy-" + VER;
const PRECACHE = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"
];
const CACHE_MAX = 300;

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(u => c.add(u).catch(() => {})));
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("karrystudy-") && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function trim(cacheName) {
  const c = await caches.open(cacheName);
  const keys = await c.keys();
  if (keys.length <= CACHE_MAX) return;
  for (const k of keys.slice(0, keys.length - CACHE_MAX)) await c.delete(k);
}

function isAsset(url) {
  return /\.(js|css|json|png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf|webmanifest|mp4)$/i.test(url.pathname) || url.pathname.endsWith("/");
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.headers.has("range")) return; /* 视频拖动等 Range 请求直连 */

  /* 同源：network-first，离线回退缓存 */
  if (url.origin === location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const resp = await fetch(req);
        if (resp && resp.ok && isAsset(url)) {
          cache.put(req, resp.clone()).then(() => trim(CACHE)).catch(() => {});
        }
        return resp;
      } catch (_) {
        const exact = await cache.match(req, { ignoreSearch: req.mode === "navigate" });
        if (exact) return exact;
        if (req.mode === "navigate") {
          let p = url.pathname;
          const candidates = [p, p.endsWith("/") ? p + "index.html" : p + "/index.html", p + "/"];
          for (const c of candidates) {
            const hit = await cache.match(c);
            if (hit) return hit;
          }
        }
        return new Response("离线且未缓存", { status: 503, statusText: "offline" });
      }
    })());
    return;
  }

  /* 跨域 CDN：cache-first（ECharts 等大文件） */
  if (/^(https:)?$/.test(url.protocol) && /(\.js|\.css|\.woff2?)$/i.test(url.pathname)) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const resp = await fetch(req);
        if (resp && (resp.ok || resp.type === "opaque")) cache.put(req, resp.clone()).catch(() => {});
        return resp;
      } catch (_) {
        return new Response("", { status: 504 });
      }
    })());
  }
});
