/* jshint node: true */
'use strict';

var fs = require('fs');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-service-worker',

  postprocessTree: function (type, tree) {
    if (type === 'all') {
      var swjs = new Funnel('lib', { include: ['sw.js'] });
      return mergeTrees([tree, swjs]);
    }

    return tree;
  },

  contentFor: function(type, config) {
    if (type === 'body-footer' && config.environment !== 'test') {
      return '<script>' + fs.readFileSync('./lib/registration.js') + '</script>';
    }
  }
};
