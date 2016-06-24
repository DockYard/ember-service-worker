(function() {
  var EVENT_HANDLERS = { };

  var waitUntilHandler = function waitUntilHandler(eventName) {
    return function waitUntilHandlerCallback(event) {
      var handlers = EVENT_HANDLERS[eventName];
      var handlerPromises = handlers.map(function eventHandlerIterator(handler) {
        return handler(event);
      });

      event.waitUntil(Promise.all(handlerPromises));
    }
  };

  var nonWaitingHandler = function nonWaitingHandler(eventName) {
    return function nonWaitingHandlerCallback(event) {
      EVENT_HANDLERS[eventName].forEach(function eventHandlerIterator(handler) {
        handler(event);
      });
    };
  };

  self.addEventListener('activate', waitUntilHandler('activate'));

  self.addEventListener('fetch', function fetchHandlerCallback(event) {
    var handlers = EVENT_HANDLERS.fetch;
    var resolver = function fetchResolver(resolve, reject, index) {
      if (!index) {
        index = 0;
      }

      if (index >= handlers.length) {
        resolve(fetch(event.request));
      }

      var handler = handlers[index];

      handler(event)
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

  self.addEventListener('install', waitUntilHandler('install'));
  self.addEventListener('message', nonWaitingHandler('message'));
  self.addEventListener('notificationclick', waitUntilHandler('notificationclick'));
  self.addEventListener('notificationclose', waitUntilHandler('notificationclose'));
  self.addEventListener('push', nonWaitingHandler('push'));
  self.addEventListener('pushsubscriptionchange', nonWaitingHandler('pushsubscriptionchange'));
  self.addEventListener('sync', nonWaitingHandler('sync'));

  self.addEventHandler = function registerHandler(eventName, handler) {
    EVENT_HANDLERS[eventName] = EVENT_HANDLERS[eventName] || [];
    EVENT_HANDLERS[eventName].push(handler);
  };
})();
