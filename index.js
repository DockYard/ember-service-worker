/* jshint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const mergeTrees = require('broccoli-merge-trees');
const Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-service-worker',

  postprocessTree(type, tree) {
    if (type === 'all') {
      let plugins = this._findPluginsFor(this);
      let trees = [tree];

      plugins.forEach((plugin) => {
        let pluginTreePath = path.resolve(plugin.root, 'service-worker');
        let pluginTree = plugin.treeGenerator(pluginTreePath);

        trees.push(pluginTree);
      });

      return mergeTrees(trees);
    }

    return tree;
  },

  contentFor(type, config) {
    if (type === 'body-footer' && config.environment !== 'test') {
      let plugins = this._findPluginsFor(this);
      let pluginNames = plugins
        .map((plugin) => `'${plugin.name}'`)
        .join(',');
      let functionBody = fs.readFileSync('./lib/registration.js');

      return `<script>
                (function() {
                  var serviceWorkers = [${pluginNames}];
                  ${functionBody}
                })();
              </script>`;
    }
  },

  _findPluginsFor(project) {
    var plugins = [];

    (project.addons || []).forEach((addon) => {
      if (this._addonHasKeyword(addon, 'ember-service-worker-plugin')) {
        plugins.push(addon);
      }
    });

    return plugins;
  },

  _addonHasKeyword(addon, keyword) {
    var keywords = addon.pkg.keywords;
    return keywords.indexOf(keyword) > -1;
  }
};
