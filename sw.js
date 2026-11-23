const CACHE="malerkasse-v4";
const FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Netzwerk zuerst (neue Version kommt automatisch), bei Offline/Zeitüberschreitung (2,5 s) aus dem Cache
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const fromCache=()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("index.html"));
 const net=fetch(e.request,{cache:"no-cache"}).then(n=>{
  if(n.ok&&new URL(e.request.url).origin===location.origin){const c=n.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}
  return n});
 e.waitUntil(net.catch(()=>{}));
 const to=new Promise(res=>setTimeout(()=>res(null),2500));
 e.respondWith(Promise.race([net,to]).then(r=>r||fromCache().then(m=>m||net)).catch(()=>fromCache()));
});
