/* jshint node: true */
'use strict';

var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var writeFile = require('broccoli-file-creator');
var Babel = require('broccoli-babel-transpiler');
var getBabelOptions = require('./lib/get-babel-options');
var Rollup = require('./lib/rollup-with-dependencies');
var rollupReplace = require('rollup-plugin-replace');
var Funnel = require('broccoli-funnel');
var existsSync = require('exists-sync');
var hashForDep = require('hash-for-dep');
var addonUtils = require('./lib/addon-utils');
var uglify = require('broccoli-uglify-sourcemap');

var TREE_FOR_METHODS = {
  'service-worker': 'treeForServiceWorker',
  'service-worker-registration': 'treeForServiceWorkerRegistration'
};

module.exports = {
  name: 'ember-service-worker',

  included: function(app) {
    if (this._super.included) {
      this._super.included.apply(this, arguments);
    }

    // Configures Ember CLI's build system to not add a fingerprint to sw.js
    this.app = app;
    this.app.options = this.app.options || {};
    this.app.options.fingerprint = this.app.options.fingerprint || {};
    this.app.options.fingerprint.exclude = this.app.options.fingerprint.exclude || [];
    this.app.options.fingerprint.exclude.push('sw.js');

    this._projectVersion = hashForDep(this.project.root);
  },

  postprocessTree: function(type, tree) {
    if (type !== 'all') {
      return tree;
    }

    var self = this;
    var plugins = this._findPluginsFor(this.project);

    var swjsTemplate = '';
    var registrationTemplate = '';
    var serviceWorkerTrees = [];
    var serviceWorkerRegistrationTrees = [];

    // Add the project itself as a possible plugin, this way user can add custom
    // service-worker code in their app, without needing to build a plugin.
    plugins = [this].concat(plugins, this.project);

    // Builds the trees for the sw.js asset and the service-worker registration
    // script.
    plugins.forEach(function(plugin) {
      var pluginServiceWorkerTree = self._serviceWorkerTreeFor(plugin, tree);
      var pluginServiceWorkerRegistrationTree = self._serviceWorkerRegistrationTreeFor(plugin, tree);
      var pluginName = addonUtils.getName(plugin);

      if (pluginServiceWorkerTree) {
        serviceWorkerTrees.push(pluginServiceWorkerTree);
        if (self._treeContainsIndexFile(pluginServiceWorkerTree)) {
          swjsTemplate += 'import "' + pluginName + '/service-worker";';
        }
      }

      if (pluginServiceWorkerRegistrationTree) {
        serviceWorkerRegistrationTrees.push(pluginServiceWorkerRegistrationTree);
        if (existsSync(pluginServiceWorkerRegistrationTree._inputNodes[0]._inputNodes[0]._directoryPath + '/index.js')) {
          registrationTemplate += 'import "' + pluginName + '/service-worker-registration";';
        }
      }
    });

    serviceWorkerTrees.push(writeFile('sw.js', swjsTemplate));
    var serviceWorkerTree = mergeTrees(serviceWorkerTrees, { overwrite: true });

    serviceWorkerRegistrationTrees.push(writeFile('sw-registration.js', registrationTemplate));
    var serviceWorkerRegistrationTree = mergeTrees(serviceWorkerRegistrationTrees, { overwrite: true });

    serviceWorkerTree = this._rollupTree(serviceWorkerTree, 'sw.js');
    serviceWorkerTree = this._uglifyTree(serviceWorkerTree);

    serviceWorkerRegistrationTree = this._rollupTree(serviceWorkerRegistrationTree, 'sw-registration.js');
    serviceWorkerRegistrationTree = this._uglifyTree(serviceWorkerRegistrationTree);

    return mergeTrees([serviceWorkerTree, serviceWorkerRegistrationTree, tree], { overwrite: true });
  },

  contentFor: function(type, config) {
    if (type === 'body-footer' && config.environment !== 'test') {
      var rootURL = this._getRootURL();

      return '<script src="' + rootURL + 'sw-registration.js"></script>';
    }
  },

  _treeContainsIndexFile: function(tree) {
    return existsSync(tree._inputNodes[0]._inputNodes[0]._directoryPath + '/index.js') ||
           existsSync(tree._inputNodes[0]._inputNodes[0]._inputNodes[0]._directoryPath + '/index.js');
  },

  _rollupTree: function(tree, entryFile, destFile) {
    var rootURL = this._getRootURL();

    var rollupReplaceConfig = {
      include: ['**/ember-service-worker/**/*.js'],
      delimiters: ['{{', '}}'],
      ROOT_URL: rootURL,
      PROJECT_REVISION: this._projectVersion,

      // define `BUILD_TIME` as a getter so that each time
      // rollup runs the version string is changed.  Otherwise,
      // when running `ember s` this would never change (leading to
      // cache invalidation trollage).
      get BUILD_TIME() {
        return (new Date()).getTime();
      }
    };

    return new Rollup(tree, {
      inputFiles: '**/*.js',
      rollup: {
        entry: entryFile,
        dest: destFile || entryFile,
        format: 'iife',
        plugins: [
          rollupReplace(rollupReplaceConfig)
        ]
      }
    });
  },

  _uglifyTree: function(tree) {
    if (this.app.options.minifyJS.enabled) {
      var options = this.app.options.minifyJS.options || {};
      options.sourceMapConfig = this.app.options.sourcemaps;
      return uglify(tree,  options);
    }

    return tree;
  },

  _getRootURL: function() {
    if (this._projectRootURL) {
      return this._projectRootURL;
    }

    var config = this.project.config(this.app.env);
    var rootURL = config.rootURL || config.baseURL || '/';

    return this._projectRootURL = rootURL;
  },

  _transpilePath: function(project, treePath, appTree) {
    var projectPath = path.resolve(project.root, treePath);
    var treeForMethod = TREE_FOR_METHODS[treePath];

    var babelOptions = getBabelOptions(project);
    var tree;

    if (existsSync(projectPath)) {
      tree = this.treeGenerator(projectPath);
    }

    if (project[treeForMethod]) {
      tree = project[treeForMethod](tree, appTree);
    }

    if (tree) {
      var babelTree = new Babel(tree, babelOptions);

      return new Funnel(babelTree, {
        destDir: project.pkg.name + '/' + treePath
      });
    }
  },

  _serviceWorkerTreeFor: function(project, tree) {
    return this._transpilePath(project, 'service-worker', tree);
  },

  _serviceWorkerRegistrationTreeFor: function(project, tree) {
    return this._transpilePath(project, 'service-worker-registration', tree);
  },

  _findPluginsFor: function(project) {
    var addons = project.addons || [];
    return addonUtils.filterByKeyword(addons, 'ember-service-worker-plugin');
  }
};
