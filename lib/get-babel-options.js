var clone = require('clone');

function getAddonOptions(addonContext) {
  var baseOptions = (addonContext.parent && addonContext.parent.options) || (addonContext.app && addonContext.app.options);
  return baseOptions && baseOptions.babel || {};
}

function getBabelOptions(addonContext) {
  var options = clone(getAddonOptions(addonContext));

  // Ensure modules aren't compiled unless explicitly set to compile
  options.blacklist = options.blacklist || ['es6.modules'];

  // do not enable non-standard transforms
  if (!('nonStandard' in options)) {
    options.nonStandard = false;
  }

  // Don't include the `includePolyfill` flag, since Babel doesn't care
  delete options.includePolyfill;

  // disable module transpilation so that we can use rollup to build a single
  // loaderless sw.js
  delete options.compileModules;
  if (options.blacklist.indexOf('es6.modules') < 0) {
    options.blacklist.push('es6.modules');
  }

  // Ember-CLI inserts its own 'use strict' directive
  options.blacklist.push('useStrict');
  options.highlightCode = false;

  return options;
}

module.exports = getBabelOptions;
