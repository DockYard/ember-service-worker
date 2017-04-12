'use strict';

const Plugin = require('broccoli-plugin');
const fs = require('fs');
const path = require('path');

const BASE_MODULE = `
  export const PROJECT_VERSION = '{{PROJECT_VERSION}}';
  export const PROJECT_REVISION = '{{PROJECT_REVISION}}';
  export const VERSION = '{{BUILD_TIME}}';

  self.addEventListener('install', function installEventListenerCallback(event) {
    return self.skipWaiting();
  });

  self.addEventListener('activate', function installEventListenerCallback(event) {
    return self.clients.claim();
  });
`;

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
    let module = BASE_MODULE;

    if (options.versionStrategy === 'every-build') {
      module += EVERY_BUILD_STRATEGY;
    }

    if (options.versionStrategy === 'project-revision') {
      module += PROJECT_REVISION_STRATEGY;
    }

    if (options.versionStrategy === 'project-version') {
      module += PROJECT_VERSION_STRATEGY;
    }

    fs.writeFileSync(path.join(this.outputPath, 'index.js'), module);
  }
};
