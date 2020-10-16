const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";
const staticFilesToPreCache = [
  "/",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/index.js",
  "/manifest.json",
  "db.js"
];

// install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(staticFilesToPreCache);
    })
  );
});

// fetch
self.addEventListener("fetch", function (evt) {
  const { url } = evt.request;
  if (url.includes("/api")) {
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request, response.clone());
              }
              return response;
            })
            .catch((err) => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );
  } else {
    // respond from static cache, request is not for /api/*
    evt.respondWith(
      fetch(evt.request).catch(function () {
        return cache.match(evt.request).then((response) => {
          if (response) {
            return response;
          } else if (evt.request.get("accept").includes("text/html")) {
            return caches.match("/");
          }
        });
      })
    );
  }
});
