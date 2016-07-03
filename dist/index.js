'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = core;

var _emitterify = require('utilise/emitterify');

var _emitterify2 = _interopRequireDefault(_emitterify);

var _colorfill = require('utilise/colorfill');

var _colorfill2 = _interopRequireDefault(_colorfill);

var _identity = require('utilise/identity');

var _identity2 = _interopRequireDefault(_identity);

var _header = require('utilise/header');

var _header2 = _interopRequireDefault(_header);

var _values = require('utilise/values');

var _values2 = _interopRequireDefault(_values);

var _key = require('utilise/key');

var _key2 = _interopRequireDefault(_key);

var _is = require('utilise/is');

var _is2 = _interopRequireDefault(_is);

var _to = require('utilise/to');

var _to2 = _interopRequireDefault(_to);

var _za = require('utilise/za');

var _za2 = _interopRequireDefault(_za);

var _text = require('./types/text');

var _text2 = _interopRequireDefault(_text);

/* istanbul ignore next */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function core() {
  log('creating');

  var resources = {};
  ripple.resources = resources;
  ripple.resource = chainable(ripple);
  ripple.register = ripple;
  ripple.types = types();
  return (0, _emitterify2.default)(ripple);

  function ripple(name, body, headers) {
    return !name ? ripple : _is2.default.arr(name) ? name.map(ripple) : _is2.default.obj(name) && !name.name ? ripple((0, _values2.default)(name)) : _is2.default.fn(name) && name.resources ? ripple((0, _values2.default)(name.resources)) : _is2.default.str(name) && !body && resources[name] ? resources[name].body : _is2.default.str(name) && !body && !resources[name] ? register(ripple)({ name: name }) : _is2.default.str(name) && body ? register(ripple)({ name: name, body: body, headers: headers }) : _is2.default.obj(name) && !_is2.default.arr(name) ? register(ripple)(name) : (err('could not find or create resource', name), false);
  }
}

var register = function register(ripple) {
  return function (_ref) {
    var name = _ref.name;
    var body = _ref.body;
    var _ref$headers = _ref.headers;
    var headers = _ref$headers === undefined ? {} : _ref$headers;

    log('registering', name);
    var res = normalise(ripple)({ name: name, body: body, headers: headers });

    if (!res) return err('failed to register', name), false;
    ripple.resources[name] = res;
    ripple.emit('change', [name, {
      type: 'update',
      value: res.body,
      time: now(res)
    }]);
    return ripple.resources[name].body;
  };
};

var normalise = function normalise(ripple) {
  return function (res) {
    if (!(0, _header2.default)('content-type')(res)) (0, _values2.default)(ripple.types).sort((0, _za2.default)('priority')).some(contentType(res));
    if (!(0, _header2.default)('content-type')(res)) return err('could not understand resource', res), false;
    return parse(ripple)(res);
  };
};

var parse = function parse(ripple) {
  return function (res) {
    var type = (0, _header2.default)('content-type')(res);
    if (!ripple.types[type]) return err('could not understand type', type), false;
    return (ripple.types[type].parse || _identity2.default)(res);
  };
};

var contentType = function contentType(res) {
  return function (type) {
    return type.check(res) && (res.headers['content-type'] = type.header);
  };
};

var types = function types() {
  return [_text2.default].reduce(_to2.default.obj('header'), 1);
};

var chainable = function chainable(fn) {
  return function () {
    return fn.apply(this, arguments), fn;
  };
};

var err = require('utilise/err')('[ri/core]'),
    log = require('utilise/log')('[ri/core]'),
    now = function now(d, t) {
  return t = (0, _key2.default)('body.log.length')(d), _is2.default.num(t) ? t - 1 : t;
};