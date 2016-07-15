(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '{{rootURL}}' }).then(function(reg) {
      console.log('Service Worker registration succeeded. Scope is ' + reg.scope);
    }).catch(function(error) {
      console.log('Service Worker registration failed with ' + error);
    });
  }
})();
