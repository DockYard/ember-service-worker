/* jshint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const mergeTrees = require('broccoli-merge-trees');
const writeFile = require('broccoli-file-creator');
const Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-service-worker',

  included: function(app) {
    this._super.included && this._super.included.apply(this, arguments);
    this.app = app;
    this.app.options = this.app.options || {};
    this.app.options.fingerprint = this.app.options.fingerprint || {};
    this.app.options.fingerprint.exclude = this.app.options.fingerprint.exclude || [];
    this.app.options.fingerprint.exclude.push('sw.js');
  },

  postprocessTree(type, tree) {
    if (type === 'all') {
      let plugins = this._findPluginsFor(this.project);
      let pluginFileNames = plugins
        .map((plugin) => `'${plugin.name}.js'`)
        .concat('ember-service-worker.js')
        .join(', ');
      let swjsTree = writeFile('sw.js', `
        const VERSION = ${+new Date()};
        self.importScripts(${plugins.length ? pluginFileNames : ''});
      `);
      let middlewareTree = this.treeGenerator(path.resolve(this.root, 'service-worker'));
      let trees = [tree, swjsTree, middlewareTree];

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
      let functionBody = fs.readFileSync(path.join(this.root, 'lib/registration.js'));
      return `<script>${functionBody}</script>`;
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
