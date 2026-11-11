/* MAGASIN MOINS CHER — fonctionnement hors ligne. Version 3.1-design */
const MEMOIRE = 'mmc-3.1-design';
const FICHIERS = ['./', './index.html', './manifest.webmanifest', './icone-192.png', './icone-512.png', './icone-maskable.png', './favicon-32.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(MEMOIRE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== MEMOIRE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== self.location.origin) return;
  const cle = req.mode === 'navigate' ? './index.html' : req;
  const reseau = fetch(req).then(r => {
    if (r && r.ok) { const copie = r.clone(); caches.open(MEMOIRE).then(c => c.put(cle, copie)); }
    return r;
  });
  const secours = () => caches.match(cle, { ignoreSearch: true }).then(r => r || caches.match('./index.html'));
  // internet lent : au bout de 4 s, on affiche la version en mémoire (la nouvelle est gardée pour la prochaine fois)
  const lent = new Promise(ok => setTimeout(ok, 4000)).then(secours);
  e.respondWith(Promise.race([reseau.catch(secours), lent.then(r => r || reseau)]));
});
