'use strict';

const path = require('path');
const mergeTrees = require('broccoli-merge-trees');
const writeFile = require('broccoli-file-creator');
const Babel = require('broccoli-babel-transpiler');
const getBabelOptions = require('./lib/get-babel-options');
const Rollup = require('./lib/rollup-with-dependencies');
const rollupReplace = require('rollup-plugin-replace');
const Funnel = require('broccoli-funnel');
const existsSync = require('exists-sync');
const hashForDep = require('hash-for-dep');
const addonUtils = require('./lib/addon-utils');
const EntryPoint = require('./lib/entry-point');
const uglify = require('broccoli-uglify-sourcemap');

const TREE_FOR_METHODS = {
  'service-worker': 'treeForServiceWorker',
  'service-worker-registration': 'treeForServiceWorkerRegistration'
};

module.exports = {
  name: 'ember-service-worker',

  included(app) {
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

  postprocessTree(type, tree) {
    if (type !== 'all') {
      return tree;
    }

    let plugins = this._findPluginsFor(this.project);

    let serviceWorkerTrees = [];
    let serviceWorkerRegistrationTrees = [];

    // Add the project itself as a possible plugin, this way user can add custom
    // service-worker code in their app, without needing to build a plugin.
    plugins = [this].concat(plugins, this.project);

    // Builds the trees for the sw.js asset and the service-worker registration
    // script.
    plugins.forEach((plugin) => {
      let pluginServiceWorkerTree = this._serviceWorkerTreeFor(plugin, tree);
      let pluginServiceWorkerRegistrationTree = this._serviceWorkerRegistrationTreeFor(plugin, tree);
      let pluginName = addonUtils.getName(plugin);

      if (pluginServiceWorkerTree) {
        serviceWorkerTrees.push(pluginServiceWorkerTree);
      }

      if (pluginServiceWorkerRegistrationTree) {
        serviceWorkerRegistrationTrees.push(pluginServiceWorkerRegistrationTree);
      }
    });

    let serviceWorkerEntryPoint = new EntryPoint(serviceWorkerTrees, { entryPoint: 'sw.js' });
    let serviceWorkerTree = mergeTrees(serviceWorkerTrees.concat(serviceWorkerEntryPoint), { overwrite: true });
    serviceWorkerTree = this._rollupTree(serviceWorkerTree, 'sw.js');
    serviceWorkerTree = this._uglifyTree(serviceWorkerTree);

    let serviceWorkerRegistrationEntryPoint = new EntryPoint(serviceWorkerRegistrationTrees, { entryPoint: 'sw-registration.js' });
    let serviceWorkerRegistrationTree = mergeTrees(serviceWorkerRegistrationTrees.concat(serviceWorkerRegistrationEntryPoint), { overwrite: true });
    serviceWorkerRegistrationTree = this._rollupTree(serviceWorkerRegistrationTree, 'sw-registration.js');
    serviceWorkerRegistrationTree = this._uglifyTree(serviceWorkerRegistrationTree);

    return mergeTrees([serviceWorkerTree, serviceWorkerRegistrationTree, tree], { overwrite: true });
  },

  contentFor(type, config) {
    if (type === 'body-footer' && config.environment !== 'test') {
      return `<script src="${this._getRootURL()}sw-registration.js"></script>`;
    }
  },

  _rollupTree(tree, entryFile, destFile) {
    let rootURL = this._getRootURL();

    let rollupReplaceConfig = {
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

  _uglifyTree(tree) {
    if (this.app.options.minifyJS.enabled) {
      let options = this.app.options.minifyJS.options || {};
      options.sourceMapConfig = this.app.options.sourcemaps;
      return uglify(tree,  options);
    }

    return tree;
  },

  _getRootURL() {
    if (this._projectRootURL) {
      return this._projectRootURL;
    }

    let config = this.project.config(this.app.env);
    let rootURL = config.rootURL || config.baseURL || '/';

    return this._projectRootURL = rootURL;
  },

  _transpilePath(project, treePath, appTree) {
    let projectPath = path.resolve(project.root, treePath);
    let treeForMethod = TREE_FOR_METHODS[treePath];

    let babelOptions = getBabelOptions(project);
    let tree;

    if (existsSync(projectPath)) {
      tree = this.treeGenerator(projectPath);
    }

    if (project[treeForMethod]) {
      tree = project[treeForMethod](tree, appTree);
    }

    if (tree) {
      let babelTree = new Babel(tree, babelOptions);

      return new Funnel(babelTree, {
        destDir: project.pkg.name + '/' + treePath
      });
    }
  },

  _serviceWorkerTreeFor(project, tree) {
    return this._transpilePath(project, 'service-worker', tree);
  },

  _serviceWorkerRegistrationTreeFor(project, tree) {
    return this._transpilePath(project, 'service-worker-registration', tree);
  },

  _findPluginsFor(project) {
    let addons = project.addons || [];
    return addonUtils.filterByKeyword(addons, 'ember-service-worker-plugin');
  }
};
