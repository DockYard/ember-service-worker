/* globals suite, test */
/* jshint node: true, esnext: false, expr: true */
/* jscs: disable */
'use strict';

var addonIndex = require('../index');
var assert = require('chai').assert;

describe('Index', function() {

  beforeEach(function() {
    addonIndex.treeGenerator = function(dir) {
      return dir;
    };
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
