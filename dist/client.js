(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./types/data":2,"./types/fn":3,"./types/text":4,"colors":5,"utilise/chainable":6,"utilise/emitterify":7,"utilise/err":8,"utilise/header":10,"utilise/is":11,"utilise/log":13,"utilise/noop":33,"utilise/objectify":34,"utilise/rebind":35,"utilise/values":36}],2:[function(require,module,exports){
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
},{"utilise/emitterify":7,"utilise/header":10,"utilise/is":11,"utilise/keys":12}],3:[function(require,module,exports){
"use strict";

/* istanbul ignore next */
var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = {
  header: "application/javascript",
  check: function check(res) {
    return is.fn(res.body);
  },
  inflate: function inflate(res) {
    res.body = fn(res.body);
  }
};

var is = _interopRequire(require("utilise/is"));

var fn = _interopRequire(require("utilise/fn"));
},{"utilise/fn":9,"utilise/is":11}],4:[function(require,module,exports){
"use strict";

/* istanbul ignore next */
var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = {
  header: "text/plain",
  check: function check(res) {
    return is.str(res.body);
  }
};

var is = _interopRequire(require("utilise/is"));
},{"utilise/is":11}],5:[function(require,module,exports){

},{}],6:[function(require,module,exports){
module.exports = require('chainable')
},{"chainable":14}],7:[function(require,module,exports){
module.exports = require('emitterify')
},{"emitterify":15}],8:[function(require,module,exports){
module.exports = require('err')
},{"err":18}],9:[function(require,module,exports){
module.exports = require('fn')
},{"fn":19}],10:[function(require,module,exports){
module.exports = require('header')
},{"header":21}],11:[function(require,module,exports){
module.exports = require('is')
},{"is":23}],12:[function(require,module,exports){
module.exports = require('keys')
},{"keys":24}],13:[function(require,module,exports){
module.exports = require('log')
},{"log":25}],14:[function(require,module,exports){
module.exports = function chainable(fn) {
  return function(){
    return fn.apply(this, arguments), fn
  }
}
},{}],15:[function(require,module,exports){
var err = require('err')('emitterify')
  , def = require('def')

module.exports = function emitterify(body) {
  return def(body, 'on', on)
       , def(body, 'once', once)
       , def(body, 'emit', emit)
       , body

  function emit(type, param) {
    (body.on[type] || []).forEach(function (d,i,a) {
      try {
        (d.once ? a.splice(i, 1).pop().fn : d.fn)(param)
      } catch(e) { err(e) }
    })
  }

  function on(type, callback, opts) {
    opts = opts || {}
    opts.fn = callback
    body.on[type] = body.on[type] || []
    body.on[type].push(opts)
    return body
  }

  function once(type, callback){
    return body.on(type, callback, { once: true }), body
  }
}

},{"def":16,"err":18}],16:[function(require,module,exports){
var has = require('has')

module.exports = function def(o, p, v, w){
  !has(o, p) && Object.defineProperty(o, p, { value: v, writable: w })
  return o[p]
}

},{"has":17}],17:[function(require,module,exports){
module.exports = function has(o, k) {
  return o.hasOwnProperty(k)
}
},{}],18:[function(require,module,exports){
module.exports = function err(prefix){
  return function(d){
    var args = [].slice.call(arguments, 0)
    args.unshift(''.red ? prefix.red : prefix)
    return console.log.apply(console, args), d
  }
}
},{}],19:[function(require,module,exports){
var is = require('is')

module.exports = function fn(candid){
  return is.fn(candid) ? candid
       : (new Function("return " + candid))()
}
},{"is":20}],20:[function(require,module,exports){
module.exports = { 
  fn     : isFunction
, str    : isString
, num    : isNumber
, obj    : isObject
, truthy : isTruthy
, falsy  : isFalsy
, arr    : isArray
, null   : isNull
, def    : isDef
, in     : isIn
}

function isFunction(d) {
  return typeof d == 'function'
}

function isString(d) {
  return typeof d == 'string'
}

function isNumber(d) {
  return typeof d == 'number'
}

function isObject(d) {
  return typeof d == 'object'
}

function isTruthy(d) {
  return !!d == true
}

function isFalsy(d) {
  return !!d == false
}

function isArray(d) {
  return d instanceof Array
}

function isNull(d) {
  return d === null
}

function isDef(d) {
  return typeof d !== 'undefined'
}

function isIn(set) {
  return function(d){
    return ~set.indexOf(d)
  }
}
},{}],21:[function(require,module,exports){
var has = require('has')

module.exports = function header(header, value) {
  var getter = arguments.length == 1
  return function(d){ 
    return !has(d, 'headers')      ? null
         : !has(d.headers, header) ? null
         : getter                  ? d['headers'][header]
                                   : d['headers'][header] == value
  }
}
},{"has":22}],22:[function(require,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"dup":17}],23:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20}],24:[function(require,module,exports){
module.exports = function keys(o) {
  return Object.keys(o)
}
},{}],25:[function(require,module,exports){
var is = require('is')

module.exports = function log(prefix){
  return function(d){
    is.arr(arguments[2]) && (arguments[2] = arguments[2].length)
    var args = [].slice.call(arguments, 0)
    args.unshift(''.grey ? prefix.grey : prefix)
    return console.log.apply(console, args), d
  }
}
},{"is":26}],26:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"dup":20}],27:[function(require,module,exports){
module.exports = function noop(){}
},{}],28:[function(require,module,exports){
module.exports = function objectify(rows, by) {
  var o = {}, by = by || 'name'
  return rows.forEach(function(d){
    return o[d[by]] = d 
  }), o
}
},{}],29:[function(require,module,exports){
module.exports = function(target, source) {
  var i = 1, n = arguments.length, method
  while (++i < n) target[method = arguments[i]] = rebind(target, source, source[method])
  return target
}

function rebind(target, source, method) {
  return function() {
    var value = method.apply(source, arguments)
    return value === source ? target : value
  }
}
},{}],30:[function(require,module,exports){
var keys = require('keys')
  , base = require('base')

module.exports = function values(o) {
  return !o ? [] : keys(o).map(base(o))
}
},{"base":31,"keys":32}],31:[function(require,module,exports){
module.exports = function base(o) {
  return function (k) {
    return o[k]
  }
}
},{}],32:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"dup":24}],33:[function(require,module,exports){
module.exports = require('noop')
},{"noop":27}],34:[function(require,module,exports){
module.exports = require('objectify')
},{"objectify":28}],35:[function(require,module,exports){
module.exports = require('rebind')
},{"rebind":29}],36:[function(require,module,exports){
module.exports = require('values')
},{"values":30}]},{},[1]);
