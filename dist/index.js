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
  log("creating");

  var resources = {};
  ripple.resources = resources;
  ripple.resource = chainable(ripple);
  ripple.register = ripple;
  ripple.types = types();
  return emitterify(ripple);

  function ripple(_x, _x2, _x3) {
    var _again = true;

    _function: while (_again) {
      _again = false;
      var name = _x,
          body = _x2,
          headers = _x3;
      if (!name) {
        return ripple;
      } else {
        if (is.arr(name)) {
          return name.map(ripple);
        } else {
          if (is.obj(name) && !name.name) {
            return ripple;
          } else {
            if (is.fn(name) && name.resources) {
              _x = values(name.resources);
              _again = true;
              continue _function;
            } else {
              return is.str(name) && !body && resources[name] ? resources[name].body : is.str(name) && !body && !resources[name] ? register(ripple)({ name: name }) : is.str(name) && body ? register(ripple)({ name: name, body: body, headers: headers }) : is.obj(name) && !is.arr(name) ? register(ripple)(name) : (err("could not find or create resource", name), false);
            }
          }
        }
      }
    }
  }
}

function register(ripple) {
  return function (_ref) {
    var name = _ref.name;
    var body = _ref.body;
    var _ref$headers = _ref.headers;
    var headers = _ref$headers === undefined ? {} : _ref$headers;

    log("registering", name);
    var res = normalise(ripple)({ name: name, body: body, headers: headers }),
        type = !ripple.resources[name] ? "load" : "";

    if (!res) return (err("failed to register", name), false);
    ripple.resources[name] = res;
    ripple.emit("change", [ripple.resources[name], { type: type }]);
    return ripple.resources[name].body;
  };
}

function normalise(ripple) {
  return function (res) {
    if (!header("content-type")(res)) values(ripple.types).some(contentType(res));
    if (!header("content-type")(res)) return (err("could not understand resource", res), false);
    return parse(ripple)(res);
  };
}

function parse(ripple) {
  return function (res) {
    var type = header("content-type")(res);
    if (!ripple.types[type]) return (err("could not understand type", type), false);
    return (ripple.types[type].parse || identity)(res);
  };
}

function contentType(res) {
  return function (type) {
    return type.check(res) && (res.headers["content-type"] = type.header);
  };
}

function types() {
  return [text].reduce(to.obj("header"), 1);
}

var emitterify = _interopRequire(require("utilise/emitterify"));

var colorfill = _interopRequire(require("utilise/colorfill"));

var chainable = _interopRequire(require("utilise/chainable"));

var identity = _interopRequire(require("utilise/identity"));

var rebind = _interopRequire(require("utilise/rebind"));

var header = _interopRequire(require("utilise/header"));

var values = _interopRequire(require("utilise/values"));

var err = _interopRequire(require("utilise/err"));

var log = _interopRequire(require("utilise/log"));

var is = _interopRequire(require("utilise/is"));

var to = _interopRequire(require("utilise/to"));

var text = _interopRequire(require("./types/text"));

err = err("[ri/core]");
log = log("[ri/core]");