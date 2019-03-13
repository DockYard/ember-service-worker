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
                  EmberCliBabel._getPresetEnvPlugins({ 'ember-cli-babel': { compileModules: false } }),
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
    return build({ app, plugins }, 'service-worker').then(() => {
      let files = output.read();
      assert.property(files, 'sw.js');
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
    return build({ app, plugins }, 'service-worker').then(() => {
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
      assert.property(files, 'sw.js');
      assert.equal(files['sw.js'], expected);
    });
  });

  it('uses rollup to concat all modules in a file', () => {
    let plugins = [
      generatePlugin('plugin-a', 'builder-test/rollup/plugin-a'),
      generatePlugin('plugin-b', 'builder-test/rollup/plugin-b')
    ];

    return build({ app, plugins }, 'service-worker')
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
        assert.property(files, 'sw.js');
        assert.equal(files['sw.js'], expected);
      });
  });

  it('uglifies the code when `minifyJS` is enabled', () => {
    let plugins = [generatePlugin('test-project', 'builder-test')];
    return build({ app, plugins, minifyJS: { enabled: true } }, 'service-worker')
      .then((results) => {
        let expected = '\n//# sourceMappingURL=sw.map';

        let files = output.read();
        assert.property(files, 'sw.js');
        assert.equal(files['sw.js'], expected);
      });
  });
});
