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
      var self = this;
      var plugins = this._findPluginsFor(this.project);
      var pluginFileNames = [];

      var trees = [tree];

      plugins = [this].concat(plugins, this.project);

      plugins.forEach(function(plugin) {
        var pluginTree = self._serviceWorkerTreeFor(plugin);
        var pluginName = plugin.pkg.name || plugin.name;

        if (pluginTree) {
          trees.push(pluginTree);
          pluginFileNames.push('\'' + pluginName + '.js\'');
        }
      });

      var swjsTemplate =
        'var VERSION = ' + (+new Date()) + ';' +
        'self.importScripts(' + pluginFileNames.join(',') + ');'

      trees.push(writeFile('sw.js', swjsTemplate));

      return mergeTrees(trees, { overwrite: true });
    }

    return tree;
  },

  contentFor: function(type, config) {
    if (type === 'body-footer' && config.environment !== 'test') {
      var functionBody = fs.readFileSync(path.join(this.root, 'lib/registration.js'));
      return '<script>' + functionBody + '</script>';
    }
  },

  _serviceWorkerTreeFor: function(project) {
    var projectPath = path.resolve(project.root, 'service-worker');

    if (fs.existsSync(projectPath)) {
      return this.treeGenerator(projectPath);
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
