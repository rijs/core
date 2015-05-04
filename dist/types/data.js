"use strict";

/* istanbul ignore next */
var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = {
  header: "application/data",
  check: function check(res) {
    return true;
  },
  inflate: function inflate(res) {
    !res.body && (res.body = []);
    emitterify(res.body);
    res.headers = {
      "content-type": "application/data"
      // , 'content-location': res.headers['content-location'] || res.headers['table'] || res.name
      // , 'proxy-to'        : res.headers['proxy-to'] || res.headers['to']
      // , 'proxy-from'      : res.headers['proxy-from'] || res.headers['from']
      // , 'version'         : res.headers['version']
      // , 'max-versions'    : is.num(header('max-versions')(res)) ? header('max-versions')(res)
      //                     : Infinity
      // , 'cache-control'   : is.null(res.headers['cache']) ? 'no-store'
      //                     : res.headers['cache-control'] || res.headers['cache']
    }

    // keys(res.headers)
    //   .filter(k => !is.def(res.headers[k]))
    //   .map(k => delete res.headers[k])
    ;
  }
};

var emitterify = _interopRequire(require("utilise/emitterify"));

var header = _interopRequire(require("utilise/header"));

var keys = _interopRequire(require("utilise/keys"));

var is = _interopRequire(require("utilise/is"));