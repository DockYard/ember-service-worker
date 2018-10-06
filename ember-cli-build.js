'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  let app = new EmberAddon(defaults, {
    hinting: false,
    // Add options here
    'ember-cli-babel': {
      // Used by the dummy app, doesn't affect the host app
      includePolyfill: true
    }
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying  or app's build file
  */

  return app.toTree();
};
