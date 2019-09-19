---
layout: doc_page
title: Configuration
order: 3
sections:
  - anchor: versioning
    title: Versioning
  - anchor: registration
    title: Registration
  - anchor: disabling-the-service-worker
    title: Disabling the Service Worker
  - anchor: customizing-the-sw.js-filename
    title: Customizing the sw.js Filename
---

### Versioning

The service worker in the browser is updated when the `sw.js` file has changed.
The problem is that not every update to your app will result in a change to the
`sw.js` file. Therefore ember-service-worker has a few configuration options to
force a change to the `sw.js` file when building. This is done by setting the
`versionStrategy` property in your `ember-cli-build.js` file. An example:

```js
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'ember-service-worker': {
      versionStrategy: 'every-build'
    }
  });

  return app.toTree();
};
```

In the example the strategy is set to `every-build`, this is a very safe
strategy, because it will force a change to your `sw.js` file everytime you do a
new build. This is also the strategy  what Ember Service Worker defaults to.

There are two other options to this: `project-revision` and `project-version`.

The `project-revision` option will create a checksum based on the contents of
your application folder using the [hash-for-dep](https://github.com/stefanpenner/hash-for-dep)
package and use that to version the `sw.js` file.

The `project-version` option will use the version number specified in your
`package.json` file to version the `sw.js` file.

### Registration

There are various ways to inject the service worker registration script. By
default the registration file `sw-registration.js` is loaded using a simple
script tag in the bottom of the body tag. You can change this by setting the
`registrationStrategy` property in your `ember-cli-build.js` file. For example:

```js
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'ember-service-worker': {
      registrationStrategy: 'inline'
    }
  });

  return app.toTree();
};
```

In the example the strategy is set to `inline`, this will write the contents of
the registration script into the `index.html` file instead. If your registration
script is small, this saves you an extra http request.

In addition to `inline` strategy there is also the `async` option. This will add
the async property to the injected script tag, which will make the loading
behavior of the registration script async.

### Disabling the Service Worker

If you like to run or build your app without the Service Worker functionality
you can set the `enabled` property to false in your `ember-cli-build.js` file or
using the `SW_DISABLED` environment variable when executing the `ember`
command.

To disable the Service Worker in your `ember-cli-build.js` file:

```js
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'ember-service-worker': {
      enabled: false
    }
  });

  return app.toTree();
};
```

To disable the Service Worker on the command line:

```sh
SW_DISABLED=true ember serve
```

### Customizing the sw.js Filename

The common filename for the file that contains all of the service worker code is `sw.js`. If you require a different filename to be generated, you can specify this in the configuration.

To change the filename used from the `sw.js` default, update your `ember-cli-build.js` file:

```js
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'ember-service-worker': {
      serviceWorkerFilename: 'customfilename.js'
    }
  });

  return app.toTree();
};
```
