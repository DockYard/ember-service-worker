'use strict';

const Plugin = require('broccoli-caching-writer');
const fs = require('fs');
const path = require('path');

module.exports = class InlineRegistration extends Plugin {
constructor(inputNodes, options) {
    super(inputNodes, {
      name: options && options.name,
      annotation: options && options.annotation
    });

    this.options = options;
  }

  build() {
    let indexHtml = fs.readFileSync(path.join(this.inputPaths[0], 'index.html')).toString();
    let swRegistration = fs.readFileSync(path.join(this.inputPaths[1], 'sw-registration.js')).toString();

    indexHtml = indexHtml.replace('ESW_INLINE_PLACEHOLDER', swRegistration);

    fs.writeFileSync(path.join(this.outputPath, 'index.html'), indexHtml);
  }
}
