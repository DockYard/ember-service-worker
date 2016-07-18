
/* globals suite, test */
/* jshint node: true, esnext: false, expr: true */
/* jscs: disable */
'use strict';

var addonUtils = require('../lib/addon-utils');
var assert = require('chai').assert;

suite('Addon Utils');

test('#hasKeyword returns true if addon has given keyword', function() {
  var addon = { pkg: { keywords: ['foo', 'bar', 'baz'] } };
  assert.equal(addonUtils.hasKeyword(addon, 'bar'), true, 'Addon should have given keyword');
});

test('#hasKeyword returns false if addon does not have given keyword', function() {
  var addon = { pkg: { keywords: ['foo', 'bar', 'baz'] } };
  assert.equal(addonUtils.hasKeyword(addon, 'quux'), false, 'Addon should not have given keyword');
});

test('#filterByKeyword returns the addons that have give keyword', function() {
  var addons = [
    { pkg: { name: 'a', keywords: ['foo', 'bar', 'baz'] } },
    { pkg: { name: 'b', keywords: ['foo', 'baz'] } },
    { pkg: { name: 'c', keywords: ['foo', 'bar'] } },
    { pkg: { name: 'd', keywords: ['baz'] } },
  ];

  var result = addonUtils.filterByKeyword(addons, 'bar');
  assert.equal(result.length, 2, 'Two addons should have been found');
  assert.equal(result[0].pkg.name, 'a', 'First addon found should be "a"');
  assert.equal(result[1].pkg.name, 'c', 'Second addon found should be "b"');
});
