/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var writeFile = require('broccoli-file-creator');
var Funnel = require('broccoli-funnel');

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

  postprocessTree: function(type, tree) {
    if (type === 'all') {
      var plugins = this._findPluginsFor(this.project);
      var pluginFileNames = plugins
        .map(function(plugin) { `'${plugin.name}.js'`})
        .join(', ');
      var swjsTemplate =
        'var VERSION = ' + (+new Date()) + ';' +
        'self.importScripts(\'ember-service-worker.js\'' + (plugins.length ? ', ' + pluginFileNames : '') + ');'
      var swjsTree = writeFile('sw.js', swjsTemplate);
      var middlewareTree = this.treeGenerator(path.resolve(this.root, 'service-worker'));
      var trees = [tree, swjsTree, middlewareTree];

      plugins.forEach(function(plugin) {
        var pluginTreePath = path.resolve(plugin.root, 'service-worker');
        var pluginTree = plugin.treeGenerator(pluginTreePath);

        trees.push(pluginTree);
      });

      return mergeTrees(trees);
    }

    return tree;
  },

  contentFor: function(type, config) {
    if (type === 'body-footer' && config.environment !== 'test') {
      var functionBody = fs.readFileSync(path.join(this.root, 'lib/registration.js'));
      return '<script>' + functionBody + '</script>';
    }
  },

  _findPluginsFor: function(project) {
    var self = this;
    var plugins = [];

    (project.addons || []).forEach(function(addon) {
      if (self._addonHasKeyword(addon, 'ember-service-worker-plugin')) {
        plugins.push(addon);
      }
    });

    return plugins;
  },

  _addonHasKeyword: function(addon, keyword) {
    var keywords = addon.pkg.keywords;
    return keywords.indexOf(keyword) > -1;
  }
};
