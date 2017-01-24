'use strict';

const Plugin = require('broccoli-plugin');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

module.exports = class EntryPoint extends Plugin {
  constructor(inputNodes, options) {
    super(inputNodes, {
      name: options && options.name,
      annotation: options && options.annotation
    });

    this.entryPoint = options && options.entryPoint;
  }

  build() {
    let entryPointJS = this.inputPaths.reduce((lines, inputPath) => {
      let indexJS = glob.sync('**/index.js', { cwd: inputPath })[0];

      if (indexJS) {
        let entryPointModuleName = path.dirname(indexJS);
        return lines.concat(`import "${entryPointModuleName}";\n`);
      }

      return lines;
    }, '');

    fs.writeFileSync(path.join(this.outputPath, this.entryPoint), entryPointJS);
  }
};
