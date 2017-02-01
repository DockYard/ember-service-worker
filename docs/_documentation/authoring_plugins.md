---
layout: doc_page
title: Authoring plugins
description: How to build your own Service Worker plugins
order: 2
sections:
  - anchor: initializing-a-plugin
    title: Initializing a plugin
  - anchor: adding-service-worker-code
    title: Adding Service Worker code
  - anchor: adding-service-worker-registration-code
    title: Adding Service Worker registration code
  - anchor: programmaticaly-customizing-the-output
    title: Programmaticaly customizing the output
---

### Initializing a plugin

Ember Service Worker plugins are just Ember CLI addons to begin with. Begin with
initializing a new Ember addon.

The first step to turn the regular Ember CLI addon into a plugin is to open up
`package.json` and add `"ember-service-worker-plugin"` as keyword to it. This is
because the `ember-service-worker` addon only picks up addons that have this
keyword. An abridged version of `package.json` should look like this:

{% highlight json %}
{
  "name": "my-ember-service-worker-plugin",
  "version": "0.0.0",
  "keywords": [
    "ember-addon",
    "ember-service-worker-plugin"
  ]
}
{% endhighlight %}

### Adding Service Worker code

To add code to the generated Service Worker, you need to create a
`service-worker` folder in the root of your project. You will also at least need
to have an `index.js` file in it, this will be the entry point file that the
generated Service Worker will include.

#### Importing other JavaScript modules

From within your Service Worker JavaScript files you can freely import code from
any other Service Worker plugin, including your own of course. Plugins use
native JavaScript modules just like your regular Ember apps and addons.

The pattern to include modules goes like this:

{% highlight javascript %}
import ... from '<plugin-name>/service-worker/<path-to-module>';
{% endhighlight %}

So if you want to import the `service-worker/utils/calculate-hash.js` module
from the `hashing-cacher` plugin the import statement would be:

{% highlight javascript %}
import calculateHash from 'hashing-cacher/service-worker/utils/calculate-hash';
{% endhighlight %}

### Adding Service Worker registration code

Adding code to the Service Worker registration script works just like adding
code to the Service Worker script, except that the code needs to be in the
`service-worker-registration` folder instead.

### Programmaticaly customizing the output

If you need to modify or transform your service worker (registration) code, you
can do that using the `treeForServiceWorker` and
`treeForServiceWorkerRegistration` hooks in the `index.js` file that is in the
root of the project.

The first argument to the hooks is the tree containing the contents of your
`service-worker` or `service-worker-registration` directory. The second argument
is the tree that contains the fully built app.

An example:

{% highlight javascript %}
var mergeTrees = require('broccoli-merge-trees');
var Config = require('./lib/config');

module.exports = {
  name: 'my-ember-service-worker-plugin',

  treeForServiceWorker(serviceWorkerTree, appTree) {
    var options = this.app.options['my-service-worker-plugin'];
    var configTree = new Config([appTree], options);

    return mergeTrees([serviceWorkerTree, configTree]);
  }
};
{% endhighlight %}
