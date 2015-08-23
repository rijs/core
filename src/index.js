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
  log('creating')

  var resources = {}
  ripple.resources = resources
  ripple.resource  = chainable(ripple)
  ripple.register  = ripple
  ripple.types     = types()
  return emitterify(ripple)

  function ripple(name, body, headers){
    return !name                                     ? ripple
         : is.arr(name)                              ? name.map(ripple)
         : is.obj(name) && !name.name                ? ripple
         : is.fn(name)  &&  name.resources           ? ripple(values(name.resources))
         : is.str(name) && !body &&  resources[name] ? resources[name].body
         : is.str(name) && !body && !resources[name] ? register(ripple)({ name })
         : is.str(name) &&  body                     ? register(ripple)({ name, body, headers })
         : is.obj(name) && !is.arr(name)             ? register(ripple)(name)
         : (err('could not find or create resource', name), false)
  }
}

function register(ripple) { 
  return ({name, body, headers = {}}) => {
    log('registering', name)
    var res = normalise(ripple)({ name, body, headers })
      , type = !ripple.resources[name] ? 'load' : ''

    if (!res) return err('failed to register', name), false
    ripple.resources[name] = res
    ripple.emit('change', [ripple.resources[name], { type }])
    return ripple.resources[name].body
  }
}

function normalise(ripple) {
  return (res) => {
    if (!header('content-type')(res)) values(ripple.types).some(contentType(res))
    if (!header('content-type')(res)) return err('could not understand resource', res), false
    return parse(ripple)(res)
  }
}

function parse(ripple) {
  return (res) => {
    var type = header('content-type')(res)
    if (!ripple.types[type]) return err('could not understand type', type), false
    return (ripple.types[type].parse || identity)(res)
  }
}

function contentType(res){
  return (type) => type.check(res) && (res.headers['content-type'] = type.header)
}

function types() {
  return [text].reduce(to.obj('header'), 1)
}

import emitterify from 'utilise/emitterify'
import colorfill  from 'utilise/colorfill'
import chainable  from 'utilise/chainable'
import identity   from 'utilise/identity'
import rebind     from 'utilise/rebind'
import header     from 'utilise/header'
import values     from 'utilise/values'
import err        from 'utilise/err'
import log        from 'utilise/log'
import is         from 'utilise/is'
import to         from 'utilise/to'
import text       from './types/text'
err = err('[ri/core]')
log = log('[ri/core]')