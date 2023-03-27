'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "4aae230968cfaf2701680360c66ba50d",
"index.html": "8520844e6e98ca7abe69b63786532e5d",
"/": "8520844e6e98ca7abe69b63786532e5d",
"main.dart.js": "f8d5e6543072b9074edea20984a47c21",
"flutter.js": "1cfe996e845b3a8a33f57607e8b09ee4",
"assets/asset/svg/meat.svg": "516a1051ebbf0789c6d799fb3f2c0ea9",
"assets/asset/svg/recycling.svg": "646a1d536c027201ca3def28184c9a18",
"assets/asset/svg/black_plastic_container.svg": "2d6b42cee09a39815b52691bd5c75fc6",
"assets/asset/svg/blister_pack.svg": "56aee817dfd8a0ae7bd4bc3acd156657",
"assets/asset/svg/tea_bag.svg": "5507bdd818295d3c0ab714da3fc54ba5",
"assets/asset/svg/pizza_box.svg": "d10302184114d7aa683f4a1a66d7568f",
"assets/asset/svg/jar.svg": "e03208216b192ca0f3121fd9266f4889",
"assets/asset/svg/plastic_bag.svg": "a69da104d820d21b574a615c7452c04f",
"assets/asset/svg/correct.svg": "6f4d73ba6205c3b2150bfa78c5e1c147",
"assets/asset/svg/toilet_paper.svg": "e771eb899ab0ec5a97872936af1f12ac",
"assets/asset/svg/bag.svg": "839f7d755b49e7eed2f9118755e5296d",
"assets/asset/svg/broken_dish.svg": "724169cd33bcc8ec21a9b439205a0a89",
"assets/asset/svg/food_can.svg": "42d0d73df4c27be7ef61d4f3feeaca8e",
"assets/asset/svg/paper_napkin.svg": "7b06e9ac21e324d2b34add69f171843a",
"assets/asset/svg/incorrect.svg": "e31efd637511fd30b17b633ea5027fea",
"assets/asset/svg/paper_bag.svg": "0c1d544e0fe57e6d73a7795e54c71535",
"assets/asset/svg/organics.svg": "8f68190c214bc1985a7ad96eb32687f7",
"assets/asset/svg/garbage.svg": "b03cccbdf72e4f3ef814f01bfc11d581",
"assets/asset/svg/hot_drink_cup.svg": "cda06c5d0620be1452eb3d05a4f20584",
"assets/asset/png/yellow.png": "61bdb76dcc94e23e39f061b847c81360",
"assets/asset/png/pink.png": "c1aa79e3a46a44000f130445ec716e74",
"assets/asset/png/blue.png": "5b2f1d86b477dbc4d25ee02e58a8f28b",
"assets/asset/png/green.png": "6b3e31a7978e44a059341d3edef5c931",
"assets/asset/png/cloud.png": "cb8d49c0ccfede4a68647a1dce81fc52",
"assets/asset/png/red.png": "b102363ed3f51a0eced4b200b1945109",
"assets/asset/json/wastes.json": "009224b2595adbc2678e434745eae9af",
"assets/AssetManifest.json": "f1e47571d6ca08fb7eeff9f7e33348d5",
"assets/NOTICES": "613aa2a99a8a95116c20f728f7f7be44",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
