const cacheName = self.location.pathname
const pages = [

  "/forevertyp/forevertyp.github.io/categories/",
  "/forevertyp/forevertyp.github.io/zh/categories/",
  "/forevertyp/forevertyp.github.io/he/categories/",
  "/forevertyp/forevertyp.github.io/",
  "/forevertyp/forevertyp.github.io/zh/",
  "/forevertyp/forevertyp.github.io/he/",
  "/forevertyp/forevertyp.github.io/tags/",
  "/forevertyp/forevertyp.github.io/zh/tags/",
  "/forevertyp/forevertyp.github.io/he/tags/",
  "/forevertyp/forevertyp.github.io/book.min.cc2c524ed250aac81b23d1f4af87344917b325208841feca0968fe450f570575.css",
  "/forevertyp/forevertyp.github.io/en.search-data.min.4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945.json",
  "/forevertyp/forevertyp.github.io/en.search.min.98b8829e0b18232f2a55363620a645490e66516ce620b62774b8f7777ba8a47a.js",
  
];

self.addEventListener("install", function (event) {
  self.skipWaiting();

  caches.open(cacheName).then((cache) => {
    return cache.addAll(pages);
  });
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  /**
   * @param {Response} response
   * @returns {Promise<Response>}
   */
  function saveToCache(response) {
    if (cacheable(response)) {
      return caches
        .open(cacheName)
        .then((cache) => cache.put(request, response.clone()))
        .then(() => response);
    } else {
      return response;
    }
  }

  /**
   * @param {Error} error
   */
  function serveFromCache(error) {
    return caches.open(cacheName).then((cache) => cache.match(request.url));
  }

  /**
   * @param {Response} response
   * @returns {Boolean}
   */
  function cacheable(response) {
    return response.type === "basic" && response.ok && !response.headers.has("Content-Disposition")
  }

  event.respondWith(fetch(request).then(saveToCache).catch(serveFromCache));
});
