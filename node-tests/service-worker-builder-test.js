'use strict';

var ServiceWorkerBuilder = require('../lib/service-worker-builder');
var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var helpers = require('broccoli-test-helpers');

var cleanupBuilders = helpers.cleanupBuilders;

var fixturePath = path.join(__dirname, 'fixtures');

var generatePlugin = function(name, projectPath) {
  return {
    pkg: { name: name },
    root: path.join(fixturePath, projectPath),
  };
};

let readFile = function(results, filePath) {
  let indexOfFile = results.files.indexOf(filePath);
  let entry = results.entries[indexOfFile];
  return fs.readFileSync(path.join(entry.basePath, entry.relativePath));
};

describe('Service Worker Builder', () => {
  let app;
  let build;

  beforeEach(() => {
    build = helpers.makeTestHelper({
      subject(options, type) {
        return new ServiceWorkerBuilder(options).build(type);
      },
      fixturePath: fixturePath
    });

    app = {
      treeGenerator: (dir) => dir,
      project: { },
    };
  });

  afterEach(() => helpers.cleanupBuilders());

  it('returns a tree with the sw.js file', () => {
    let plugins = [generatePlugin('test-project', 'builder-test')];
    return build({ app, plugins }, 'service-worker')
      .then((results) => {
        assert.equal(results.files.length, 1);
        assert.equal(results.files.indexOf('sw.js'), 0);
      });
  });

  it('returns a tree with the sw-registration.js file', () => {
    let plugins = [generatePlugin('test-project', 'builder-test')];
    return build({ app, plugins }, 'service-worker-registration')
      .then((results) => {
        assert.equal(results.files.length, 1);
        assert.equal(results.files.indexOf('sw-registration.js'), 0);
      });
  });

  it('transpiles code with babel', () => {
    let plugins = [generatePlugin('test-project', 'builder-test/babel')];
    return build({ app, plugins }, 'service-worker')
      .then((results) => {
        let expected = `
(function () {
  'use strict';

  var CONSTANT = 42;
  self.addEventListener('fetch', function () {
    var x = CONSTANT + 1;
  });

}());
`.trim();

        let file = readFile(results, 'sw.js').toString('utf8');
        assert.equal(file, expected);
      });
  });

  it('uses rollup to concat all modules in a file', () => {
    let plugins = [
      generatePlugin('plugin-a', 'builder-test/rollup/plugin-a'),
      generatePlugin('plugin-b', 'builder-test/rollup/plugin-b')
    ];

    return build({ app, plugins }, 'service-worker')
      .then((results) => {
        let expected = `
(function () {
  'use strict';

  var CONSTANT = 42;

  self.addEventListener('fetch', function () {
    var x = CONSTANT + 1;
  });

}());
`.trim();

        let file = readFile(results, 'sw.js').toString('utf8');
        assert.equal(file, expected);
      });
  });

  it('uglifies the code when `minifyJS` is enabled', () => {
    let plugins = [generatePlugin('test-project', 'builder-test')];
    return build({ app, plugins, minifyJS: { enabled: true } }, 'service-worker')
      .then((results) => {
        let expected = `
!function(){"use strict"}();
//# sourceMappingURL=sw.map
`.trim();

        assert.equal(readFile(results, 'sw.js'), expected);
      });
  });
});
