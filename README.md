# Ember Service Worker

_A pluggable approach to Service Workers for Ember.js_

[![Ember Observer Score](https://emberobserver.com/badges/ember-service-worker.svg)](https://emberobserver.com/addons/ember-service-worker)
[![Build Status](https://travis-ci.org/DockYard/ember-service-worker.svg?branch=master)](https://travis-ci.org/DockYard/ember-service-worker)

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

For a full list of available Ember Service Worker plugins: [click here](https://npmsearch.com/?q=keywords:ember-cli-deploy-plugin)

## Authoring plugins

To create an Ember Service Worker plugin, you first need to add the
`ember-service-worker-plugin` keyword to the `keywords` option in the plugin's
`package.json`

Then create a file with the same name as your Ember Service Worker plugin within
the `service-worker` folder that should be in the root of your addon. For
example: `service-worker/ember-service-worker-asset-cache.js`. This file will
automatically be loaded by the created service worker.

All other files in the `service-worker` directory will also be copied to your build of the
application. This enables you to use `importScript` to load additional files.

All the plugins have the `VERSION` constant available to them. This is a
timestamp and will change on every rebuild of `sw.js`.

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
