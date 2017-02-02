---
layout: doc_page
title: Getting started
description: Make your app offline first in about 30 minutes
order: 1
sections:
  - anchor: installation
    title: Installation
  - anchor: offline-first
    title: Offline first
---


### Installation

To get started with Ember Service Worker, install the addon in your exisiting
Ember.js project:

{% highlight shell %}
ember install ember-service-worker
{% endhighlight %}

If you now rebuild and visit your Ember app it should install a Service Worker
when the page loads.

### Offline first

Let's now add some plugins to make the app offline first. This is done by
installing some aditional addons:

{% highlight shell %}
ember install ember-service-worker-index
ember install ember-service-worker-asset-cache
{% endhighlight %}

These plugins will take care of caching your `index.html` page and static
assets. If you again restart rebuild and visit your Ember app, it caches
your `index.html` file and static assets. If you now disconnect your internet
connection (or turn on 'offline' mode in your browser's dev tools) and refresh
the page, your app should still load!

There might be a small gotcha though, that is it doesn't cache any non-static
resources, like requests to an API. To do this, we need to install another
plugin:

{% highlight shell %}
ember install ember-service-worker-cache-fallback
{% endhighlight %}

This plugin will cache any request that you configure it to do so, but will only
serve the contents from the cache when the resource won't load.
To configure which resources it should cache we need to add some configuration to
the `ember-cli-build.js` file that should be in the root of your Ember.js
project. The configuration depends on what kind of resources your app loads.
Here's an example configuration:

{% highlight javascript %}
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'esw-cache-fallback': {
      patterns: [
        '/api/v1/(.+)'
      ],
    }
  });

  return app.toTree();
};
{% endhighlight %}

The `patterns` property in the `esw-cache-fallback` configuration should be an
array of regular expressions that describe the URLs it can cache. In the example
it's configured to cache anything resource of which the URL starts with `/api/v1/`.

Update the configuration to your liking and then rebuild and visit your app
again. Now browse around your app for a few moments while online to prime the
fallback cache, afterwards put your browser into offline mode and try to load a
page you have visited before. If everything went well, it should now also serve
your API responses from the cache.

Congratulations! Your app is now offline first.
