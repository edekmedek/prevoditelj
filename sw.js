const CACHE = 'prevodatelj-v10';

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(['./', './index.html', './style.css', './manifest.json', './avatar.jpg']))
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        ).then(() => clients.claim())
    );
});

self.addEventListener('fetch', e => {
    // Za share target POST zahtjev â€” preusmjeri na GET s parametrom
    if (e.request.method === 'POST' && e.request.url.includes('share-target')) {
        e.respondWith((async () => {
            const formData = await e.request.formData();
            const text = formData.get('text') || formData.get('title') || formData.get('url') || '';
            const url = new URL('/', self.location.origin);
            url.searchParams.set('shared', encodeURIComponent(text));
            return Response.redirect(url.toString(), 303);
        })());
        return;
    }

    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});




