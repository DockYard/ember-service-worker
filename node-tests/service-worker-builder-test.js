'use strict';

var ServiceWorkerBuilder = require('../lib/service-worker-builder');
var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var helper = require('broccoli-test-helper');
var Babel = require('broccoli-babel-transpiler');
var EmberCliBabel = require('ember-cli-babel');

var fixturePath = path.join(__dirname, 'fixtures');
var createBuilder = helper.createBuilder;
var serviceWorkerFilename = 'sw.js';

var generatePlugin = function(name, projectPath) {
  return {
    pkg: { name: name },
    root: path.join(fixturePath, projectPath),
  };
};

describe('Service Worker Builder', () => {
  let app;
  let build;
  let output;

  beforeEach(() => {

    build = function(options, type) {
      let subject = new ServiceWorkerBuilder(options).build(type);
      output = createBuilder(subject);
      return output.build();
    };

    app = {
      treeGenerator: (dir) => dir,
      project: {
        addons: [
          {
            name: 'ember-cli-babel',
            transpileTree(tree, options) {
              return new Babel(tree, {
                annotation: "Babel: app-with-sw",
                babelrc: false,
                highlightCode: false,
                sourceMaps: false,
                presets: [
                  EmberCliBabel._getPresetEnv({ 'ember-cli-babel': { compileModules: false } }),
                ].filter(Boolean)
              });
            }
          }
        ]
      },
    };
  });

  afterEach(() => output.dispose());

  it('returns a tree with the sw.js file', () => {
    let plugins = [generatePlugin('test-project', 'builder-test')];
    return build({ app, plugins, serviceWorkerFilename }, 'service-worker').then(() => {
      let files = output.read();
      assert.property(files, serviceWorkerFilename);
    });
  });

  it('returns a tree with a custom service worker file', () => {
    let plugins = [generatePlugin('test-project', 'builder-test')];
    return build({ app, plugins, serviceWorkerFilename: 'kermit.js' }, 'service-worker').then(() => {
      let files = output.read();
      assert.property(files, 'kermit.js');
    });
  });

  it('returns a tree with the sw-registration.js file', () => {
    let plugins = [generatePlugin('test-project', 'builder-test')];
    return build({ app, plugins }, 'service-worker-registration').then(() => {
      let files = output.read();
      assert.property(files, 'sw-registration.js');
    });
  });

  it('transpiles code with babel', () => {
    let plugins = [generatePlugin('test-project', 'builder-test/babel')];
    return build({ app, plugins, serviceWorkerFilename }, 'service-worker').then(() => {
      let expected = `(function () {
  'use strict';

  var CONSTANT = 42;
  self.addEventListener('fetch', function () {
    var x = CONSTANT + 1;
    return x;
  });

}());
`;
      let files = output.read();
      assert.property(files, serviceWorkerFilename);
      assert.equal(files[serviceWorkerFilename], expected);
    });
  });

  it('uses rollup to concat all modules in a file', () => {
    let plugins = [
      generatePlugin('plugin-a', 'builder-test/rollup/plugin-a'),
      generatePlugin('plugin-b', 'builder-test/rollup/plugin-b')
    ];

    return build({ app, plugins, serviceWorkerFilename }, 'service-worker')
      .then((results) => {
        let expected = `(function () {
  'use strict';

  var CONSTANT = 42;

  self.addEventListener('fetch', function () {
    var x = CONSTANT + 1;
    return x;
  });

}());
`;

        let files = output.read();
        assert.property(files, serviceWorkerFilename);
        assert.equal(files[serviceWorkerFilename], expected);
      });
  });
  it('overides root url when using serviceWorkerScope', () => {
    let plugins = [
      generatePlugin('ember-service-worker', 'builder-test/rollup/scope-override/ember-service-worker'),
    ];
    return build({ app, plugins, rootURL: '/', serviceWorkerFilename, serviceWorkerScope: '/other-scope/' }, 'service-worker-registration').then(() => {
      let files = output.read();
      let expected = `(function () {
  'use strict';

  var SCOPE = '/other-scope/';
  var ROOT_URL = '/';
  var scopePassed = SCOPE !== 'undefined';
  var scope = scopePassed ? SCOPE : ROOT_URL;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: scope });
  }

}());
`;
      assert.equal(files['sw-registration.js'], expected);
    });
  });

  it('uglifies the code when `minifyJS` is enabled', () => {
    let plugins = [generatePlugin('test-project', 'builder-test')];
    return build({ app, plugins, serviceWorkerFilename, minifyJS: { enabled: true } }, 'service-worker')
      .then((results) => {
        let expected = '\n//# sourceMappingURL=sw.map';

        let files = output.read();
        assert.property(files, serviceWorkerFilename);
        assert.equal(files[serviceWorkerFilename], expected);
      });
  });
});
