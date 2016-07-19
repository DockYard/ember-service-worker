export const PROJECT_REVISION = '{{PROJECT_REVISION}}';
export const VERSION = '{{BUILD_TIME}}';

let FETCH_HANDLERS = [];

self.addEventListener('fetch', function fetchEventListenerCallback(event) {
  let resolver = function fetchResolver(resolve, reject, index) {
    if (!index) {
      index = 0;
    }

    if (index >= FETCH_HANDLERS.length) {
      resolve(fetch(event.request));
      return;
    }

    let handler = FETCH_HANDLERS[index];
    let result = handler(event);

    Promise.resolve(result)
      .then(function (response) {
        if (response) {
          return resolve(response);
        } else {
          return resolver(resolve, reject, index + 1);
        }
      })
      .catch(reject);
  };

  event.respondWith(new Promise(resolver));
});

self.addEventListener('install', function installEventListenerCallback(event) {
  return self.skipWaiting();
});

self.addEventListener('activate', function installEventListenerCallback(event) {
  return self.clients.claim();
});

export function addFetchListener(handler) {
  FETCH_HANDLERS.push(handler);
}
