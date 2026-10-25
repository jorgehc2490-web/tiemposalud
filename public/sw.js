// TiempoSalud — service worker: red primero para tener datos frescos;
// la carcasa (HTML/CSS/JS) queda en caché como reserva sin conexión.
const CACHE = 'tiemposalud-v1';
const SHELL = ['/', '/index.html', '/styles.css', '/app.js', '/ads.js', '/instalar.js',
  '/icon-192.png', '/icon-512.png', '/privacidad.html', '/contacto.html', '/manifest.webmanifest'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api/')) return; // la API, siempre en vivo
  e.respondWith(
    fetch(e.request)
      .then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then((m) => m || caches.match('/index.html')))
  );
});
