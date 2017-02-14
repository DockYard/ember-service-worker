'use strict';

const ServiceWorkerBuilder = require('./lib/service-worker-builder');
const mergeTrees = require('broccoli-merge-trees');
const writeFile = require('broccoli-file-creator');
const hashForDep = require('hash-for-dep');
const addonUtils = require('./lib/addon-utils');

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

    let options = this.app.options['ember-service-worker'] =  this.app.options['ember-service-worker'] || {}
    options.registrationStrategy = options.registrationStrategy || 'default';

    if (options.registrationStrategy === 'after-ember' && !process.env.EMBER_CLI_FASTBOOT) {
      app.import('vendor/ember-service-worker/load-registration-script.js');
    }
  },

  treeForVendor() {
    return writeFile('ember-service-worker/load-registration-script.js', `
      (function() {
        var script = document.createElement('script')
        script.src = '${this._getRootURL()}sw-registration.js';
        document.body.appendChild(script);
      })();
    `);
  },

  postprocessTree(type, appTree) {
    if (type !== 'all') {
      return appTree;
    }

    let plugins = this._findPluginsFor(this.project);

    // Add the project itself as a possible plugin, this way user can add custom
    // service-worker code in their app, without needing to build a plugin.
    plugins = [this].concat(plugins, this.project);

    let serviceWorkerBuilder = new ServiceWorkerBuilder({
      app: this,
      appTree,
      minifyJS: this.app.options.minifyJS,
      plugins,
      projectVersion: hashForDep(this.project.root),
      rootURL: this._getRootURL(),
      sourcemaps: this.app.options.sourcemaps
    });

    let serviceWorkerTree = serviceWorkerBuilder.build('service-worker');
    let serviceWorkerRegistrationTree =
      serviceWorkerBuilder.build('service-worker-registration');

    return mergeTrees([
      serviceWorkerTree,
      serviceWorkerRegistrationTree,
      appTree
    ], { overwrite: true });
  },

  contentFor(type, config) {
    let options = this.app.options['ember-service-worker'];

    if (config.env === 'test') {
      return;
    }

    if (type === 'body-footer' && options.registrationStrategy === 'default') {
      return `<script src="${this._getRootURL()}sw-registration.js"></script>`;
    }

    if (type === 'head-footer' && options.registrationStrategy === 'async') {
      return `<script async src="${this._getRootURL()}sw-registration.js"></script>`;
    }
  },

  _getRootURL() {
    if (this._projectRootURL) {
      return this._projectRootURL;
    }

    let customOptions = this.app.options['ember-service-worker'] || {};
    let config = this.project.config(this.app.env);
    let rootURL = customOptions.rootUrl || config.rootURL || config.baseURL || '/';

    return this._projectRootURL = rootURL;
  },

  _findPluginsFor(project) {
    let addons = project.addons || [];
    return addonUtils.filterByKeyword(addons, 'ember-service-worker-plugin');
  }
};
