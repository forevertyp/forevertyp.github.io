const cacheName = self.location.pathname
const pages = [

  "/hugo-book/categories/",
  "/hugo-book/zh/categories/",
  "/hugo-book/he/categories/",
  "/hugo-book/",
  "/hugo-book/zh/",
  "/hugo-book/he/",
  "/hugo-book/tags/",
  "/hugo-book/zh/tags/",
  "/hugo-book/he/tags/",
  "/hugo-book/book.min.cc2c524ed250aac81b23d1f4af87344917b325208841feca0968fe450f570575.css",
  "/hugo-book/en.search-data.min.4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945.json",
  "/hugo-book/en.search.min.66b0dc3697cc17ef7f8a98bc6c0d8ca5eabb59ade1b1d6cd4fe49952e8816e86.js",
  
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
