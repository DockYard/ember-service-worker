var Plugin = require('broccoli-plugin');
var fs = require('fs');
var path = require('path');
var glob = require('glob');

module.exports = EntryPoint;
// Create a subclass EntryPoint derived from Plugin
EntryPoint.prototype = Object.create(Plugin.prototype);
EntryPoint.prototype.constructor = EntryPoint;
function EntryPoint(inputNodes, options) {
  if (!(this instanceof EntryPoint)) {
    return new EntryPoint(inputNodes, options);
  }

  options = options || {};

  Plugin.call(this, inputNodes, {
    annotation: options.annotation
  });

  this.options = options;
}

EntryPoint.prototype.build = function build() {
  var entryPointJS = '';

  this.inputPaths.forEach(function(inputPath) {
    var indexJS = glob.sync('**/index.js', { cwd: inputPath })[0];
    var hasIndexJS = !!indexJS;

    if (hasIndexJS) {
      var entryPointModuleName = path.dirname(indexJS);
      entryPointJS += 'import "' + entryPointModuleName + '";\n';
    }
  });

  fs.writeFileSync(path.join(this.outputPath, this.options.entryPoint), entryPointJS);
};
