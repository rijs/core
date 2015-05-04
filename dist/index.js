"use strict";

/* istanbul ignore next */
var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// -------------------------------------------
// API: Gets or sets a resource
// -------------------------------------------
// ripple('name')     - returns the resource body if it exists
// ripple('name')     - creates & returns resource if it doesn't exist
// ripple('name', {}) - creates & returns resource, with specified name and body
// ripple({ ... })    - creates & returns resource, with specified name, body and headers
// ripple.resources   - returns raw resources
// ripple.resource    - alias for ripple, returns ripple instead of resource for method chaining
// ripple.register    - alias for ripple
// ripple.on          - event listener for changes - all resources
// ripple('name').on  - event listener for changes - resource-specific

module.exports = core;

function core() {
  log("creating core");

  var resources = {};
  ripple.resources = resources;
  ripple.resource = chainable(ripple);
  ripple.register = ripple;
  ripple.types = types();
  return emitterify(ripple);

  function ripple(name, body, headers) {
    return is.str(name) && !body && resources[name] ? resources[name].body : is.str(name) && !body && !resources[name] ? register(ripple)({ name: name }) : is.str(name) && body ? register(ripple)({ name: name, body: body, headers: headers }) : is.obj(name) && !is.arr(name) ? register(ripple)(name) : (err("could not find or create resource", name), false);
  }
}

function register(ripple) {
  return function (_ref) {
    var name = _ref.name;
    var body = _ref.body;
    var _ref$headers = _ref.headers;
    var headers = _ref$headers === undefined ? {} : _ref$headers;

    log("registering", name);
    var res = normalise(ripple)({ name: name, body: body, headers: headers });
    if (!res) return (err("failed to register", name), false);
    ripple.resources[name] = res;
    ripple.emit("change", ripple.resources[name]);
    return ripple.resources[name].body;
  };
}

function normalise(ripple) {
  return function (res) {
    if (!header("content-type")(res)) values(ripple.types).some(contentType(res));
    if (!header("content-type")(res)) return (err("could not understand", res), false);
    inflate(ripple)(res);
    return res;
  };
}

function inflate(ripple) {
  return function (res) {
    (ripple.types[header("content-type")(res)].inflate || noop)(res);
  };
}

function contentType(res) {
  return function (type) {
    return type.check(res) && (res.headers["content-type"] = type.header);
  };
}

function types() {
  return objectify([text, fn, data], "header");
}

require("colors");

var emitterify = _interopRequire(require("utilise/emitterify"));

var chainable = _interopRequire(require("utilise/chainable"));

var objectify = _interopRequire(require("utilise/objectify"));

var rebind = _interopRequire(require("utilise/rebind"));

var header = _interopRequire(require("utilise/header"));

var values = _interopRequire(require("utilise/values"));

var noop = _interopRequire(require("utilise/noop"));

var err = _interopRequire(require("utilise/err"));

var log = _interopRequire(require("utilise/log"));

var is = _interopRequire(require("utilise/is"));

var text = _interopRequire(require("./types/text"));

var data = _interopRequire(require("./types/data"));

var fn = _interopRequire(require("./types/fn"));

err = err("[ri/core]");
log = log("[ri/core]");