/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var writeFile = require('broccoli-file-creator');
var Babel = require('broccoli-babel-transpiler');
var getBabelOptions = require('./lib/get-babel-options');
var Rollup = require('./lib/rollup-with-dependencies');
var rollupReplace = require('rollup-plugin-replace');
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

      var serviceWorkerTrees = [];

      plugins = [this].concat(plugins, this.project);

      plugins.forEach(function(plugin) {
        var pluginTree = self._serviceWorkerTreeFor(plugin);
        var pluginName = plugin.pkg.name || plugin.name;

        if (pluginTree) {
          serviceWorkerTrees.push(pluginTree);
          pluginFileNames.push(pluginName);
        }
      });

      var swjsTemplate = '';

      pluginFileNames.forEach(function(name) {
        swjsTemplate += 'import "' + name + '/service-worker";';
      });

      serviceWorkerTrees.push(writeFile('sw.js', swjsTemplate));
      var serviceWorkerTree = mergeTrees(serviceWorkerTrees, { overwrite: true });

      var rollupReplaceConfig = {
        include: '**/ember-service-worker/service-worker/index.js',
        delimiters: ['{{', '}}']
      };

      // define `BUILD_TIME` as a getter so that each time
      // rollup runs the version string is changed.  Otherwise,
      // when running `ember s` this would never change (leading to
      // cache invalidation trollage).
      Object.defineProperty(rollupReplaceConfig, 'BUILD_TIME', {
        enumerable: true,
        configurable: true,
        get: function() {
          return (new Date()).getTime();
        }
      });

      serviceWorkerTree = new Rollup(serviceWorkerTree, {
        inputFiles: '**/*.js',
        rollup: {
          entry: 'sw.js',
          dest: 'sw.js',
          plugins: [
            rollupReplace(rollupReplaceConfig)
          ]
        }
      });

      return mergeTrees([serviceWorkerTree, tree], { overwrite: true });
    }

    return tree;
  },

  contentFor: function(type, config) {
    if (type === 'body-footer' && config.environment !== 'test') {
      var rootURL = config.rootURL || config.baseURL || '/';
      var functionBody = fs.readFileSync(path.join(this.root, 'lib/registration.js'), { encoding: 'utf8' });

      functionBody = functionBody.replace(/{{rootURL}}/g, rootURL);
      return '<script>' + functionBody + '</script>';
    }
  },

  _serviceWorkerTreeFor: function(project) {
    var projectPath = path.resolve(project.root, 'service-worker');

    if (fs.existsSync(projectPath)) {
      var babelTree = new Babel(this.treeGenerator(projectPath), getBabelOptions(project));
      var name = project.pkg.name || project.name;

      return new Funnel(babelTree, {
        destDir: name + '/service-worker'
      });
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
