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

export default function core(){
  log('creating core')

  var resources = {}
  ripple.resources = resources
  ripple.resource  = chainable(ripple)
  ripple.register  = ripple
  ripple.types     = types()
  return emitterify(ripple)

  function ripple(name, body, headers){
    return is.str(name) && !body &&  resources[name] ? resources[name].body
         : is.str(name) && !body && !resources[name] ? register(ripple)({ name })
         : is.str(name) &&  body                     ? register(ripple)({ name, body, headers })
         : is.obj(name) && !is.arr(name)             ? register(ripple)(name)
         : (err('could not find or create resource', name), false)
  }
}

function register(ripple) { 
  return ({name, body, headers = {}}) => {
    log('registering', name)
    var res = normalise(ripple)({ name, body: body, headers })
    if (!res) return err('failed to register', name), false
    ripple.resources[name] = res
    ripple.emit('change', ripple.resources[name])
    return ripple.resources[name].body
  }
}

function normalise(ripple) {
  return (res) => {
    if (!header('content-type')(res)) values(ripple.types).some(contentType(res))
    if (!header('content-type')(res)) return err('could not understand', res), false
    inflate(ripple)(res)
    return res
  }
}

function inflate(ripple) {
  return function(res){
    (ripple.types[header('content-type')(res)].inflate || noop)(res)
  }
}

function contentType(res){
  return function(type){
    return type.check(res) && (res.headers['content-type'] = type.header)
  }
}

function types() {
  return objectify([text, fn, data], 'header')
}

import 'colors'
import emitterify from 'utilise/emitterify'
import chainable  from 'utilise/chainable'
import objectify  from 'utilise/objectify'
import rebind     from 'utilise/rebind'
import header     from 'utilise/header'
import values     from 'utilise/values'
import noop       from 'utilise/noop'
import err        from 'utilise/err'
import log        from 'utilise/log'
import is         from 'utilise/is'
import text       from './types/text'
import data       from './types/data'
import fn         from './types/fn'
err = err('[ri/core]')
log = log('[ri/core]')