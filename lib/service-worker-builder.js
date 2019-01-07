'use strict';

const EntryPoint = require('./entry-point');
const Funnel = require('broccoli-funnel');
const Rollup = require('./rollup-with-dependencies');
const fs = require('fs');
const mergeTrees = require('broccoli-merge-trees');
const path = require('path');
const rollupReplace = require('rollup-plugin-replace');
const uglify = require('broccoli-uglify-sourcemap');
const resolve = require('rollup-plugin-node-resolve');
const includePaths = require('rollup-plugin-includepaths')
const commonJs = require('rollup-plugin-commonjs');

const TREE_FOR_METHODS = {
  "service-worker": "treeForServiceWorker",
  "service-worker-registration": "treeForServiceWorkerRegistration"
};

const ENTRY_POINT_FILENAMES = {
  "service-worker": "sw.js",
  "service-worker-registration": "sw-registration.js"
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

      return trees;
    }, []);
  }

  _treeForPlugin(plugin, type) {
    let pluginPath = path.resolve(plugin.root, type);
    let treeForMethod = TREE_FOR_METHODS[type];

    let tree;

    if (fs.existsSync(pluginPath)) {
      tree = this.app.treeGenerator(pluginPath);
    }

    if (plugin[treeForMethod]) {
      tree = plugin[treeForMethod](tree, this.appTree);
    }

    if (tree) {
      return new Funnel(tree, {
        destDir: plugin.pkg.name + "/" + type
      });
    }
  }

  _compileTrees(trees, treeName) {
    let entryPoint = new EntryPoint(trees, { entryPoint: `${treeName}` });
    let tree = mergeTrees(trees.concat(entryPoint), { overwrite: true });

    let registrationDistPath = this.options.registrationDistPath;
    let treeDistPath = treeName;
    if (treeName === "sw-registration.js" && registrationDistPath) {
      treeDistPath = path.join(registrationDistPath, treeName);
    }

    tree = this._babelTranspile(tree);
    tree = this._rollupTree(tree, `${treeName}`, treeDistPath);
    tree = this._uglifyTree(tree);

    return tree;
  }

  _rollupTree(tree, entryFile, destFile) {
    const rollupReplaceConfig = {
      include: [
        '/**/ember-service-worker/**/*.js',
        // same as above but for windows paths like D:\my-ember\ember-service-worker\whatever\sw.js; which are updated before this step to D:/my-ember/ember-service/worker/whatever/sw.js
        // the original one doesn't work when the source code and the %TMP% folder, which ember started to use after v3.5, are located on different logical drives
        // which is quite common in Windows.
        /^[a-z]:\/(?:[^\/:*?"<>|\r\n]+\/)*ember-service-worker\/(?:[^\/:*?"<>|\r\n]+\/)*[^\/:*?"<>|\r\n]*\.js$/i
      ],
      delimiters: ['{{', '}}'],
      ROOT_URL: this.options.rootURL
    };

    const includePathOptions = {
      extensions: ['.js', '.json']
    }

    return new Rollup(tree, {
      inputFiles: "**/*.js",
      rollup: {
        input: entryFile,
        output: {
          file: destFile || entryFile,
          format: 'iife',
          exports: 'none',
        },
        plugins: [
          commonJs({
            include: 'node_modules/**',
          }),
          resolve({
            module: true,
            jsnext: true,
            browser: true,
          }),
          includePaths(includePathOptions),
          rollupReplace(rollupReplaceConfig)
        ]
      }
    });
  }

  _uglifyTree(tree) {
    if (this.options.minifyJS && this.options.minifyJS.enabled) {
      let options = this.options.minifyJS.options || {};
      options.sourceMapConfig = this.options.sourcemaps;
      return uglify(tree, options);
    }

    return tree;
  }

  _babelTranspile(tree) {
    let emberCliBabel = this.app.project.addons.filter((a) => a.name === 'ember-cli-babel')[0];
    return emberCliBabel.transpileTree(tree,
      {
        'ember-cli-babel': { compileModules: false},
      }
    );
  }
};
