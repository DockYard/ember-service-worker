'use strict';

const fs = require('fs');
const path = require('path');
const Plugin = require('broccoli-plugin');

function baseModule(options) {
  return `
    export const PROJECT_VERSION = '${options.projectVersion}';
    export const PROJECT_REVISION = '${options.projectRevision}';
    export const VERSION = '${options.buildTime}';
  `;
}

const EVERY_BUILD_STRATEGY = `self.CACHE_BUSTER = VERSION;`;
const PROJECT_REVISION_STRATEGY = `self.CACHE_BUSTER = PROJECT_REVISION;`;
const PROJECT_VERSION_STRATEGY = `self.CACHE_BUSTER = PROJECT_VERSION;`;

module.exports = class Config extends Plugin {
  constructor(inputNodes, options) {
    super(inputNodes, {
      name: options && options.name,
      annotation: options && options.annotation
    });

    this.options = options;
  }

  build() {
    let options = this.options;
    options.buildTime = (new Date).getTime() + '|' + Math.random();

    let module = baseModule(options);

    if (options.versionStrategy === 'every-build') {
      module += EVERY_BUILD_STRATEGY;
    }

    if (options.versionStrategy === 'project-revision') {
      module += PROJECT_REVISION_STRATEGY;
    }

    if (options.versionStrategy === 'project-version') {
      module += PROJECT_VERSION_STRATEGY;
    }

    if (!('immediateClaim' in options) || options.immediateClaim === true) {
      module += `
        self.addEventListener('install', function installEventListenerCallback(event) {
          return self.skipWaiting();
        });

        self.addEventListener('activate', function installEventListenerCallback(event) {
          return self.clients.claim();
        });
      `;
    }

    fs.writeFileSync(path.join(this.outputPath, 'index.js'), module);
  }
};
