/*
 * Deletes all caches that start with the `prefix`, except for the
 * cache defined by `currentCache`
 */
export default (prefix, currentCache) => {
  return caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      let isOwnCache = cacheName.indexOf(prefix) === 0;
      let isNotCurrentCache = cacheName !== currentCache;

      if (isOwnCache && isNotCurrentCache) {
        caches.delete(cacheName);
      }
    });
  });
};
