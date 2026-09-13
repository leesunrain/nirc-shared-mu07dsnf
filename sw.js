const CACHE='nirc-member-20260914-ops1';
const CORE=['./','./index.html','./styles.css?v=20260914-ops1','./seed.js?v=20260914-ops1','./app.js?v=20260914-ops1','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(req,{cache:'no-store'});
      if(fresh && fresh.ok){
        const c=await caches.open(CACHE); c.put(req,fresh.clone());
      }
      return fresh;
    }catch(e){
      return (await caches.match(req)) || (await caches.match('./index.html'));
    }
  })());
});
