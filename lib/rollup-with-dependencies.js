var path = require('path');
var Rollup = require('broccoli-rollup');
var existsSync = require('exists-sync');

function RollupWithDependencies(inputNode, options) {
  if (!(this instanceof RollupWithDependencies)) {
    return new RollupWithDependencies(inputNode, options);
  }

  Rollup.call(this, inputNode, options);
}

RollupWithDependencies.prototype = Object.create(Rollup.prototype);
RollupWithDependencies.prototype.constructor = RollupWithDependencies;

/*
 Overriding the `build` tree here to allow us to force non-relative imports
 to be evaluated at the top level of the input path.

 So given:

 ```
 input/
 service-a/
 index.js
 other.js
 service-b.js
 ```

 We would resolve the following:

 * `import b from 'service-b';` from `service-a/index.js` would resolve to the top level `service-b`
 * `import a from 'service-a';` from `service-b.js` would resolve to `service-a/index.js`

 */
RollupWithDependencies.prototype.build = function() {
  var plugins = this.rollupOptions.plugins || [];
  var inputPath = this.inputPaths[0];

  plugins.push({
    resolveId: function(importee, importer) {
      var modulePath = path.join(inputPath, importee + '.js');
      if (existsSync(modulePath)) {
        return modulePath;
      }

      // allow service-worker/addon-name/index.js fallback
      modulePath = path.join(inputPath, importee, 'index.js');
      if (existsSync(modulePath)) {
        return modulePath;
      }
    }
  });

  this.rollupOptions.plugins = plugins;

  return Rollup.prototype.build.apply(this, arguments);
};

module.exports = RollupWithDependencies;
