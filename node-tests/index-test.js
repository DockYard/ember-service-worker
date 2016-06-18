/* globals suite, test */
/* jshint node: true, esnext: false, expr: true */
/* jscs: disable */
'use strict';

const addonIndex = require('../index');
const assert = require('chai').assert;

suite('Index');

test('_findPluginsFor grabs all plugins from a project', () => {
  let project = {
    addons: [
      { name: 'one', pkg: { keywords: ['ember-addon'] } },
      { name: 'two', pkg: { keywords: ['ember-addon', 'ember-service-worker-plugin'] } }
    ]
  };

  let addons = addonIndex._findPluginsFor(project);

  assert.equal(addons.length, 1, 'It should find one addon');
  assert.equal(addons[0].name, 'two', 'The addon named "two" should be found');
});
