const appShellCache = 'app-shell-v3';//v1 - versioning, whenever something is modified in any asset, this must be changed to a newer version
const dynamicCache = 'dynamic-v3';
const dynamicCacheSize = 3;
const appShellAssets = [
    '/',
    
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    
    '/css/materialize.min.css',
    '/css/styles.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
    '/img/app/bag.png',

    '/pages/fallback.html',

    'https://www.gstatic.com/firebasejs/7.13.2/firebase-app.js',
    'https://www.gstatic.com/firebasejs/7.13.2/firebase-firestore.js'

];

//cache size limit
const limitCacheSize = (name, size) =>{
    caches.open(name).then(cache =>{
        cache.keys().then(keys=>{
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name, size));//recursively delete items until length =< size
            }
        })
    })
};

//after-install event - triggered only when we change the sw
//can be used to add assets to the cache, asset choice that may change with new sw files
self.addEventListener('install', e =>{
    //delay firing installation finished event until caching is done 
    e.waitUntil(
        caches.open(appShellCache)//open or create a cache with this name
        .then(cache =>{
            cache.addAll(appShellAssets);//we store all desired requests and responses to display them later on, when offline
        })
    );
    console.log('cached')
});

//after-activation event - another area for cache management
self.addEventListener('activate', e =>{
    //wait until all old caches are deleted
    e.waitUntil(
        //take all caches
        caches.keys().then(keys=>{
            //this promise will resolve when all promises specified will
            return Promise.all(
                //async command to find and delete all caches which do not
                //have the same name as string val. appShellCache 
                keys
                .filter(key => key !== appShellCache && key !== dynamicCache)//any key not equal to appShellCache or dynamicCache remains in the array
                .map(key => caches.delete(key))//map through array and delete the cache with that key
                )
        })
    );
});

// //fetch events : client - server intercept
self.addEventListener('fetch', evt => {
    //we dont cache db requests
    if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
     //requests go to the server but since they will not return in offline we can respond with our cached responses
      evt.respondWith(
          //search for a match between client request and cached response in all caches
        caches.match(evt.request).then(cacheRes => {
          return cacheRes || fetch(evt.request).then(fetchRes => {
            return caches.open(dynamicCache).then(cache => {
              cache.put(evt.request.url, fetchRes.clone());
              // check cached items size
              limitCacheSize(dynamicCache, 6);
              return fetchRes;
            })
          });//return the match or if null and online repeat fetch to catch response and cache it in the dynamic cache
        //when all else fails return a fallback
        }).catch(() => {
            //return the fallback page in case the request is html
          if(evt.request.url.indexOf('.html') > -1){
            return caches.match('/pages/fallback.html');
          }
        })
      );
    }
  });

