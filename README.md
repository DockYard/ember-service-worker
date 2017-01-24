# Ember Service Worker

_A pluggable approach to Service Workers for Ember.js_

[![Ember Observer Score](https://emberobserver.com/badges/ember-service-worker.svg)](https://emberobserver.com/addons/ember-service-worker)
[![Build Status](https://travis-ci.org/DockYard/ember-service-worker.svg?branch=master)](https://travis-ci.org/DockYard/ember-service-worker)

## 🚨 WARNING 🚨

Please test this addon on your local/staging environment before deploying to production. Please report any errors or odd behaviour when testing!

## Batteries excluded

Without any extra addons all this addon does is install a Service Worker,
but the Service Worker itself will do nothing.
This allows you to craft a set of addons that make the Service Worker function the way you want it to.

## Installation

```
ember install ember-service-worker
```

## Available plugins

- [ember-service-worker-asset-cache](https://github.com/DockYard/ember-service-worker-asset-cache)
- [ember-service-worker-cache-first](https://github.com/DockYard/ember-service-worker-cache-first)
- [ember-service-worker-cache-fallback](https://github.com/DockYard/ember-service-worker-cache-fallback)

For a full list of available Ember Service Worker plugins: [click here](https://npmsearch.com/?q=keywords:ember-service-worker-plugin)

## Authoring plugins

To create an Ember Service Worker plugin, you first need to add the
`ember-service-worker-plugin` keyword to the `keywords` option in the plugin's
`package.json`

From within a service worker plugin, you can modify the contents of the generated service worker
(built to `dist/sw.js`) and/or you can modify the mechanism of service worker registration ( built
to `dist/sw-registration.js`).

## Service Worker Tree

Create a `service-worker/index.js` file within in the root of your addon. This file will
automatically be loaded by the created service worker.

Other files in the `service-worker` file are available for `import` via standard ES6 module
semantics.

### API

#### `VERSION`

This is a constant that you can utilize which is updated for every build of the
service worker. You could use this as part of the cache key:

```js
import { VERSION } from 'ember-service-worker/service-worker';

var CACHE_NAME = 'asset-cache-' + VERSION;
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        // more stuff here
      })
  );
});
```

#### `PROJECT_REVISION`

This is a constant that you can utilize which is tied to the project (and all
levels of dependencies). One use case for this, is to ensure that the service worker
in use is paired with the correct project:

```js
import { PROJECT_REVISION } from 'ember-service-worker/service-worker';

self.addEventListener('message', function(event) {
  if (event.data && event.data.command === 'verify-project-revision') {
    if (PROJECT_REVISION !== event.data.PROJECT_REVISION) {
      // handle when the project revision doesn't match
    }
  }
});
```

## Service Worker Registration Tree

Create a `service-worker-registration/index.js` file within the root of your addon. This file
is required to register the service worker (and its scope).

Other files in the `service-worker-registration` file are available for `import` via standard
ES6 module semantics.

### API

#### `addSuccessHandler`

You can use this method to register a callback to execute after registration is successful.
The callback will be passed the `registration` object.

Example:

```js
import { addSuccessHandler } from 'ember-service-worker/service-worker-registration';

addSuccessHandler(function(reg) {
  // do stuff on successful registration
});
```

#### `addErrorHandler`

You can use this method to register a callback to execute if registration has errored.
The callback will be passed the `registration` object.

Example:

```js
import { addErrorHandler } from 'ember-service-worker/service-worker-registration';

addErrorHandler(function(reg) {
  // do stuff on errored registration
});
```

#### `PROJECT_VERSION`

This is a constant that you can utilize which is tied to the project (and all
levels of dependencies). One use case for this, is to ensure that the service worker
in use is paired with the correct project:

```js
import { addSuccessHandler, PROJECT_REVISION } from 'ember-service-worker/service-worker-registration';

addSuccessHandler(function(reg) {
  return navigator.serviceWorker.ready
    .then(function() {
      navigator.serviceWorker.controller.postMessage({
        command: 'verify-project-revision',
        revision: PROJECT_REVISION
      });
    });
});
```

## Adding Service Worker code directly to your app

It is also possible to add service worker code to your app directly. To do this
add a `service-worker/index.js` or `service-worker-registration/index.js` file to
your project.

This works exactly as authoring plugins.

## Customizing the service worker and service worker registration trees

_since version 0.6_

If you need to modify or transform your service worker (registration) code, you
can do that using the `treeForServiceWorker` and
`treeForServiceWorkerRegistration` hooks in the `index.js` file.

The first argument to the hooks is the tree containing the contents of your
`service-worker` or `service-worker-registrations` directory. The second
argument is the tree that contains the fully built app.

An example:

```javascript
var mergeTrees = require('broccoli-merge-trees');
var AssetMap = require('./lib/asset-map');

module.exports = {
  treeForServiceWorker(serviceWorkerTree, appTree) {
    var options = this.app.options['my-service-worker-plugin'];
    var assetMapFile = new AssetMap([appTree], options);

    return mergeTrees([serviceWorkerTree, assetMapFile]);
  }
};
```

## Authors

* [Marten Schilstra](http://twitter.com/martndemus)

## Versioning

This library follows [Semantic Versioning](http://semver.org)

## Want to help?

Please do! We are always looking to improve this library. Please see our
[Contribution Guidelines](https://github.com/dockyard/ember-service-worker/blob/master/CONTRIBUTING.md)
on how to properly submit issues and pull requests.

## Legal

[DockYard](http://dockyard.com/), Inc. &copy; 2016

[@dockyard](http://twitter.com/dockyard)

[Licensed under the MIT license](http://www.opensource.org/licenses/mit-license.php)
