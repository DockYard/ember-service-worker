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
});
