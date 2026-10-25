// Service worker sederhana: selalu ambil versi terbaru dari internet,
// cadangan dari cache hanya bila offline. Tidak menyentuh permintaan ke Supabase.
const C = 'examdas-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)).catch(() => {}); return res; })
      .catch(() => caches.match(r).then(x => x || caches.match('./')))
  );
});
