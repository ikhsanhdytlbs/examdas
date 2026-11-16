// Service worker EXAMDAS.
// - Halaman (index.html): ambil versi terbaru dari internet, cadangan dari cache bila offline.
// - app.css dan KaTeX: disimpan di HP, dipakai dari cache lebih dulu agar halaman cepat terbuka dan tahan jaringan lambat.
// - Permintaan ke Supabase dan situs lain tidak disentuh.
const C = 'examdas-v2';
const PRE = ['./', 'index.html', 'katex.min.css', 'katex.min.js', 'auto-render.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => Promise.allSettled(PRE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const keep = (r, res) => { if (res && res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)).catch(() => {}); } return res; };
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  const aset = /\/(app\.css|katex\.min\.(js|css)|auto-render\.min\.js)$/.test(u.pathname);
  if (aset) {
    // file aset: cache dulu; app.css membawa ?v=... sehingga versi baru otomatis diambil
    e.respondWith(caches.match(r).then(x => x || fetch(r).then(res => keep(r, res))));
    return;
  }
  e.respondWith(
    fetch(r).then(res => keep(r, res)).catch(() => caches.match(r).then(x => x || caches.match('./')))
  );
});
