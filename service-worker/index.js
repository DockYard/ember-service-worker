export const PROJECT_REVISION = '{{PROJECT_REVISION}}';
export const VERSION = '{{BUILD_TIME}}';

self.addEventListener('install', function installEventListenerCallback(event) {
  return self.skipWaiting();
});

self.addEventListener('activate', function installEventListenerCallback(event) {
  return self.clients.claim();
});

