const CACHE = 'cache-only-v1'


self.addEventListener('install', async (event) => {
    const cache = await caches.open(CACHE)
    await cache.addAll([
        "index.html",
        "style.css",
        "script.js", 
        "/sound/exactly.mp3", 
        "/sound/mistake.mp3",
        "/sound/over.mp3",
        "/sound/victory.mp3",
        "/png/icon32.png",
        "/png/icon256.png",
        "manifest.json",
    ])
})

self.addEventListener('fetch', (event) =>
    event.respondWith(cacheFirst(event.request))
)

async function cacheFirst(request) {
    const storeC = await caches.open(CACHE)
    const c = await storeC.match(request)
    return c || await fetch(request)
}