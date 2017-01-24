/* globals suite, test */
/* jshint node: true, esnext: false, expr: true */
/* jscs: disable */
'use strict';

var addonIndex = require('../index');
var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var helpers = require('broccoli-test-helpers');
var cleanupBuilders = helpers.cleanupBuilders;

var fixturePath = path.join(__dirname, 'fixtures');

var makeTestHelper = function(functionName) {
  return helpers.makeTestHelper({
    subject: function() {
      return addonIndex[functionName].apply(addonIndex, arguments);
    },
    fixturePath: fixturePath
  });
};

var transpilePath = makeTestHelper('_transpilePath');
var serviceWorkerTreeFor = makeTestHelper('_serviceWorkerTreeFor');
var serviceWorkerRegistrationTreeFor = makeTestHelper('_serviceWorkerRegistrationTreeFor');

var pathFromEntry = function(entry) {
  return path.join(entry.basePath, entry.relativePath);
};

var generateProject = function(name, projectPath) {
  return {
    pkg: { name: name },
    root: path.join(fixturePath, projectPath),
  };
};

describe('Index', function() {

  beforeEach(function() {
    addonIndex.treeGenerator = function(dir) {
      return dir;
    };
  });

  afterEach(function() {
    cleanupBuilders();
  });

  describe('#_findPluginsFor', function() {
    it('grabs all plugins from a project', function() {
      var project = {
        addons: [
          { name: 'one', pkg: { keywords: ['ember-addon'] } },
          { name: 'two', pkg: { keywords: ['ember-addon', 'ember-service-worker-plugin'] } }
        ]
      };

      var addons = addonIndex._findPluginsFor(project);

      assert.equal(addons.length, 1, 'It should find one addon');
      assert.equal(addons[0].name, 'two', 'The addon named "two" should be found');
    });
  });

  describe('#_transpilePath', function() {
    xit('transpiles a tree from given path', function() {
      var project = generateProject('test-project', 'transpile-tree-test');

      return transpilePath(project, 'a-path').then(function(results) {
        var indexOfFile = results.files.indexOf('test-project/a-path/file.js');
        assert.ok(indexOfFile >= 0, 'File is copied over');

        var filePath = pathFromEntry(results.entries[indexOfFile]);
        assert.equal(fs.readFileSync(filePath), 'var foo = 42;');
      });
    });

    xit('returns only if the target path exists', function() {
      var project = generateProject('test-project', 'transpile-tree-test');
      assert.equal(addonIndex._transpilePath(project, 'b-path'), undefined);
    });
  });

  describe('#_serviceWorkerTreeFor', function() {
    xit('gets the service-worker directory', function() {
      var project = generateProject('test-project', 'transpile-tree-test');
      return serviceWorkerTreeFor(project).then(function(results) {
        assert.ok(results.files.indexOf('test-project/service-worker/index.js') >= 0, 'index.js is copied over');
        assert.ok(results.files.indexOf('test-project/service-worker/module.js') >= 0, 'other files are copied over');
      });
    });
  });

  describe('#_serviceWorkerRegistrationTreeFor', function() {
    xit('gets the service-worker-registration directory', function() {
      var project = generateProject('test-project', 'transpile-tree-test');
      return serviceWorkerRegistrationTreeFor(project).then(function(results) {
        assert.ok(results.files.indexOf('test-project/service-worker-registration/index.js') >= 0, 'index.js is copied over');
        assert.ok(results.files.indexOf('test-project/service-worker-registration/module.js') >= 0, 'other files are copied over');
      });
    });
  });
});
