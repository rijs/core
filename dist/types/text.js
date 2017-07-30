'use strict';

module.exports = {
  header: 'text/plain',
  check: function check(res) {
    return !includes('.html')(res.name) && !includes('.css')(res.name) && is.str(res.body);
  }
};

var includes = require('utilise/includes'),
    is = require('utilise/is');