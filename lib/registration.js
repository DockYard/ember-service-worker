if ('serviceWorker' in navigator) {
  serviceWorkers.forEach(function(serviceWorker) {
    navigator.serviceWorker.register('/' + serviceWorker + '.js', { scope: '/' }).then(function(reg) {
      console.log('Service Worker "' + serviceWorker + '" registration succeeded. Scope is ' + reg.scope);
    }).catch(function(error) {
      console.log('Service Worker "' + serviceWorker + '" registration failed with ' + error);
    });
  });
}
