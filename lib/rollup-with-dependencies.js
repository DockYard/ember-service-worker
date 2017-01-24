'use strict';

const Rollup = require('broccoli-rollup');
const path = require('path');
const existsSync = require('exists-sync');

module.exports = class RollupWithDependencies extends Rollup {
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
  build() {
    let plugins = this.rollupOptions.plugins || [];
    let inputPath = this.inputPaths[0];

    plugins.push({
      resolveId(importee, importer) {
        let modulePath = path.join(inputPath, `${importee}.js`);
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

    return super.build();
  }
};
