'use strict';

const Babel = require('broccoli-babel-transpiler');
const EntryPoint = require('./entry-point');
const Funnel = require('broccoli-funnel');
const Rollup = require('./rollup-with-dependencies');
const existsSync = require('exists-sync');
const getBabelOptions = require('./get-babel-options');
const mergeTrees = require('broccoli-merge-trees');
const path = require('path');
const rollupReplace = require('rollup-plugin-replace');
const uglify = require('broccoli-uglify-sourcemap');

const TREE_FOR_METHODS = {
  'service-worker': 'treeForServiceWorker',
  'service-worker-registration': 'treeForServiceWorkerRegistration'
};

const ENTRY_POINT_FILENAMES = {
  'service-worker': 'sw.js',
  'service-worker-registration': 'sw-registration.js'
};

module.exports = class ServiceWorkerBuilder {
  constructor(options) {
    this.options = options || {};

    this.plugins = options.plugins;
    this.appTree = options.appTree;
    this.app = options.app;
  }

  build(type) {
    let trees = this._treesForPlugins(type);
    return this._compileTrees(trees, ENTRY_POINT_FILENAMES[type]);
  }

  _treesForPlugins(type) {
    return this.plugins.reduce((trees, plugin) => {
      let pluginTree = this._treeForPlugin(plugin, type);

      if (pluginTree) {
        return trees.concat(pluginTree);
      }

      return trees
    }, []);
  }

  _treeForPlugin(plugin, type) {
    let pluginPath = path.resolve(plugin.root, type);
    let treeForMethod = TREE_FOR_METHODS[type];

    let tree;

    if (existsSync(pluginPath)) {
      tree = this.app.treeGenerator(pluginPath);
    }

    if (plugin[treeForMethod]) {
      tree = plugin[treeForMethod](tree, this.appTree);
    }

    if (tree) {
      return new Funnel(tree, {
        destDir: plugin.pkg.name + '/' + type
      });
    }
  }

  _compileTrees(trees, treeName) {
    let entryPoint = new EntryPoint(trees, { entryPoint: `${treeName}` });
    let tree = mergeTrees(trees.concat(entryPoint), { overwrite: true });

    tree = this._rollupTree(tree, `${treeName}`);
    tree = this._uglifyTree(tree);

    return tree
  }

  _rollupTree(tree, entryFile, destFile) {
    let rollupReplaceConfig = {
      include: ['**/ember-service-worker/**/*.js'],
      delimiters: ['{{', '}}'],
      ROOT_URL: this.options.rootURL,
      PROJECT_VERSION: this.options.projectVersion,
      PROJECT_REVISION: this.options.projectRevision,

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
        exports: 'none',
        plugins: [
          rollupReplace(rollupReplaceConfig)
        ]
      }
    });
  }

  _uglifyTree(tree) {
    if (this.options.minifyJS && this.options.minifyJS.enabled) {
      let options = this.options.minifyJS.options || {};
      options.sourceMapConfig = this.options.sourcemaps;
      tree = this._babelTranspile(tree);
      return uglify(tree,  options);
    }

    return tree;
  }

  _babelTranspile(tree) {
    let babelOptions = getBabelOptions(this.app.project);
    return new Babel(tree, babelOptions);
  }
}
