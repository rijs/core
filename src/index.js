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

  const resources = {}
  ripple.resources = resources
  ripple.resource  = chainable(ripple)
  ripple.register  = ripple
  ripple.types     = types()
  return emitterify(ripple)

  function ripple(name, body, headers){
    return !name                                     ? ripple
         : is.arr(name)                              ? name.map(ripple)
         : is.obj(name) && !name.name                ? ripple(values(name))
         : is.fn(name)  &&  name.resources           ? ripple(values(name.resources))
         : is.str(name) && !body &&  resources[name] ? resources[name].body
         : is.str(name) && !body && !resources[name] ? register(ripple)({ name })
         : is.str(name) &&  body                     ? register(ripple)({ name, body, headers })
         : is.obj(name) && !is.arr(name)             ? register(ripple)(name)
         : (err('could not find or create resource', name), false)
  }
}

const register = ripple => ({name, body, headers = {}}) => {
  log('registering', name)
  const res = normalise(ripple)({ name, body, headers })

  if (!res) return err('failed to register', name), false
  ripple.resources[name] = res
  ripple.emit('change', [name, { 
    type: 'update'
  , value: res.body
  , time: now(res)
  }])
  return ripple.resources[name].body
}

const normalise = ripple => res => {
  if (!header('content-type')(res)) values(ripple.types).sort(za('priority')).some(contentType(res))
  if (!header('content-type')(res)) return err('could not understand resource', res), false
  return parse(ripple)(res)
}

const parse = ripple => res => {
  var type = header('content-type')(res)
  if (!ripple.types[type]) return err('could not understand type', type), false
  return (ripple.types[type].parse || identity)(res)
}

const contentType = res => type => type.check(res) && (res.headers['content-type'] = type.header)

const types = () => [text].reduce(to.obj('header'), 1)

const chainable = fn => function() {
  return fn.apply(this, arguments), fn
}

import emitterify from 'utilise/emitterify'
import colorfill  from 'utilise/colorfill'
import identity   from 'utilise/identity'
import header     from 'utilise/header'
import values     from 'utilise/values'
import key        from 'utilise/key'
import is         from 'utilise/is'
import to         from 'utilise/to'
import za         from 'utilise/za'
import text       from './types/text'
const err = require('utilise/err')('[ri/core]')
    , log = require('utilise/log')('[ri/core]')
    , now = (d, t) => (t = key('body.log.length')(d), is.num(t) ? t - 1 : t)