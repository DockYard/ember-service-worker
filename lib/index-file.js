'use strict';

const fs = require('fs');
const path = require('path');
const Plugin = require('broccoli-plugin');

const VERSION_STRATEGIES = {
  EVERY_BUILD: 'every-build',
  PROJECT_REVISION: 'project-revision',
  PROJECT_VERSION: 'project-version'
};

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
const INSTALL_EVENT_LISTENER = `
  self.addEventListener('install', function installEventListenerCallback(event) {
    return self.skipWaiting();
  });
`;
const IMMEDIATE_CLAIM_LISTENER = `
  self.addEventListener('message', function skipWaitingMessageCallback(event) {
    if (event.data === 'skipWaiting') {
      return self.skipWaiting();
    }
  });
`;
const SKIP_WAITING_LISTENER = `
  self.addEventListener('activate', function installEventListenerCallback(event) {
    return self.clients.claim();
  });
`;

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
    let validVersionStrategies = [VERSION_STRATEGIES.EVERY_BUILD, VERSION_STRATEGIES.PROJECT_REVISION, VERSION_STRATEGIES.PROJECT_VERSION];
    let versionStrategy = validVersionStrategies.indexOf(options.versionStrategy) !== -1 ? options.versionStrategy : VERSION_STRATEGIES.EVERY_BUILD;

    if (versionStrategy === VERSION_STRATEGIES.EVERY_BUILD) {
      module += EVERY_BUILD_STRATEGY;
    }

    if (versionStrategy === VERSION_STRATEGIES.PROJECT_REVISION) {
      module += PROJECT_REVISION_STRATEGY;
    }

    if (versionStrategy === VERSION_STRATEGIES.PROJECT_VERSION) {
      module += PROJECT_VERSION_STRATEGY;
    }

    const implicitImmediateClaim = !('immediateClaim' in options);
    const explicitImmediateClaim = !implicitImmediateClaim && options.immediateClaim === true;
    const skipWaiting = ('skipWaitingOnMessage' in options && options.skipWaitingOnMessage === true);

    if (implicitImmediateClaim || explicitImmediateClaim) {
      module += INSTALL_EVENT_LISTENER;
    }
    if (!explicitImmediateClaim && skipWaiting) {
      module += IMMEDIATE_CLAIM_LISTENER;
    }
    if (implicitImmediateClaim || explicitImmediateClaim || skipWaiting) {
      module += SKIP_WAITING_LISTENER;
    }

    fs.writeFileSync(path.join(this.outputPath, 'index.js'), module);
  }
};
