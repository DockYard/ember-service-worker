/* globals suite, test */
/* jshint node: true, esnext: false, expr: true */
/* jscs: disable */
'use strict';

var addonIndex = require('../index');
var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var helpers = require('broccoli-test-helpers');
var makeTestHelper = helpers.makeTestHelper;

var fixturePath = path.join(__dirname, 'fixtures');

var transpilePath = makeTestHelper({
  subject: addonIndex._transpilePath,
  fixturePath: fixturePath
});

var pathFromEntry = function(entry) {
  return path.join(entry.basePath, entry.relativePath);
};

suite('Index');

test('#_findPluginsFor grabs all plugins from a project', function() {
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

test('#_transpilePath transpiles a tree from given path', function() {
  var project = {
    pkg: { name: 'test-project' },
    root: path.join(fixturePath, 'transpile-tree-test'),
    treeGenerator: function(dir) { return dir; }
  };

  return transpilePath(project, 'a-path').then(function(results) {
    var indexOfFile = results.files.indexOf('test-project/a-path/file.js');
    assert.ok(indexOfFile >= 0, 'File is copied over');

    var filePath = pathFromEntry(results.entries[indexOfFile]);
    assert.equal(fs.readFileSync(filePath), 'var foo = 42;');
  });
});

test('#_transpilePath returns only if the target path exists', function() {
  var project = {
    pkg: { name: 'test-project' },
    root: path.join(fixturePath, 'transpile-tree-test'),
    treeGenerator: function(dir) { return dir; }
  };

  assert.equal(addonIndex._transpilePath(project, 'b-path'), undefined);
});
