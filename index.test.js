const { is, header }  = require('utilise/pure')
    , { test } = require('tap')
    , core = require('./')

test('should create empty resource from name', ({ plan, same }) => {  
  plan(1)
  const ripple = core()
  same(ripple('foo', 'bar'), 'bar')
})

test('should fail to create resource it does not understand', ({ plan, same }) => {  
  plan(1)
  const ripple = core()
  same(ripple('foo'), undefined)
})

test('should set content-type by default', ({ plan, same }) => {  
  plan(1)
  const ripple = core()
  ripple('foo', 'bar')
  same(header('content-type')(ripple.resources['foo']), 'text/plain')
})

test('should create resource using alias', ({ plan, same }) => {  
  plan(1)
  const ripple = core()
  same(ripple.register('foo', 'bar'), 'bar')
})

test('should create and get resource from name', ({ plan, same }) => {  
  plan(1)
  const ripple = core()
  ripple('foo', 'bar')
  same(ripple('foo'), 'bar')
})

test('should create and get resource from obj', ({ plan, same }) => {  
  plan(2)
  const ripple = core()
  same(ripple({ name: 'foo', body: 'bar', headers: {} }), 'bar')
  same(ripple.resources.foo, {
    name: 'foo'
  , body: 'bar'
  , headers: { 'content-type': 'text/plain' } 
  })
})

test('should import multiple resources from object', ({ plan, same }) => {  
  plan(2)
  const ripple = core()
  same(ripple({ 
    foo: { name: 'foo', body: 'foo', headers: {} }
  , bar: { name: 'bar', body: 'bar', headers: {} }
  }), [ 'foo', 'bar' ])

  same(ripple.resources, { 
    foo: { name: 'foo', body: 'foo', headers: { 'content-type': 'text/plain' } }
  , bar: { name: 'bar', body: 'bar', headers: { 'content-type': 'text/plain' } }
  })
})

test('should create import resources from another node', ({ plan, same }) => {  
  plan(1)
  const ripple = core()
  ripple({ name: 'foo', body: 'bar', headers: {} })
  const ripple2 = core()
  ripple2(ripple)
  same(ripple2.resources.foo, {
    name: 'foo'
  , body: 'bar'
  , headers: { 'content-type': 'text/plain' } 
  })
})

test('should use explicitly set headers', ({ plan, same }) => {  
  plan(2)
  const ripple = core()
  same(ripple({
    name: 'sth'
  , body: { a : 1 }
  , headers: { 'content-type': 'text/plain' } 
  }), { a : 1 })
  same(ripple.resources.sth, {
    name: 'sth'
  , body: { a : 1 }
  , headers: { 'content-type': 'text/plain' } 
  })
})

test('should create two different ripple nodes', ({ plan, ok }) => {
  plan(1)
  const ripple1 = core()
      , ripple2 = core()
  
  ok(ripple1 !== ripple2)
})

test('should register multiple resources', ({ plan, ok }) => {
  plan(2)
  const ripple = core()
  ripple([{name:'foo', body:'1'}, {name:'bar', body:'1'}])
  
  ok('foo' in ripple.resources)
  ok('bar' in ripple.resources)
})

test('should destroy existing headers by default', ({ plan, same }) => {
  plan(2)
  const ripple = core()
  ripple({ name: 'name', body: 'foo', headers: { 'foo': 'bar' }})
  same(ripple.resources.name.headers.foo, 'bar')

  ripple({ name:'name', body: 'baz' })
  same(ripple.resources.name.headers.foo, undefined)
})

test('should fail if cannot interpret resource', ({ plan, notOk }) => {
  plan(4)
  const ripple = core()
  notOk(ripple('foo', []))
  notOk(ripple('bar'))

  notOk('foo' in ripple.resources)
  notOk('bar' in ripple.resources)
})

test('should fail if uses api incorrectly', ({ plan, same }) => {
  plan(3)
  const ripple = core()
  same(ripple(), ripple)
  same(ripple(String), false)
  same(ripple.resources, {})
})

test('should skip empty objects', ({ plan, same }) => {
  plan(2)
  const ripple = core()
  same(ripple({}), [])
  same(ripple.resources, {})
})

test('should not register type it does not understand', ({ plan, same }) => {
  plan(2)
  const ripple = core()
  same(ripple({ name: 'foo', body: 'foo', headers: { 'content-type': 'application/jsx' }}), false)
  same(ripple.resources, {})
})

test('should emit global change events', ({ plan, same }) => {
  plan(2)
  let ripple = core()
    , params
    , fn = (name, change) => { params = [name, change] }

  ripple.on('change', fn)
  ripple('foo', 'bar')
  same(params, ['foo', { type: 'update', value: 'bar', time: undefined }])

  ripple.types['data'] = { header: 'data', check: String }
  ripple('boo', { log: ['baz'] })
  same(params, ['boo', { type: 'update', value: { log: ['baz'] }, time: 0 }])
})

test('should indicate if new resource', ({ plan, same }) => {
  plan(4)
  const ripple = core()
  ripple.once('change', (d, change) => {
    same(d, 'foo')
    same(change, { type: 'update', value: 'foo', time: undefined })
    ripple.once('change', (d, change) => {
      same(d, 'foo')
      same(change, { type: 'update', value: 'bar', time: undefined })
    })
    ripple('foo', 'bar')
  })
  ripple('foo', 'foo')
})

test('should register new types by order', ({ plan, same }) => {
  plan(3)
  const ripple = core()
  ripple('text', 'text')
  same(ripple.resources.text.headers['content-type'], 'text/plain')

  ripple.types['priority/low'] = {
    header: 'priority/low'
  , check: String
  , priority: -10
  }

  ripple('low', 'low')
  same(ripple.resources.low.headers['content-type'], 'text/plain')

  ripple.types['priority/high'] = {
    header: 'priority/high'
  , check: String
  , priority: 10
  }

  ripple('high', 'high')
  same(ripple.resources.high.headers['content-type'], 'priority/high')
})  

test('should register promise - resource', ({ plan, same}) => {
  plan(3)
  const ripple = core()
  ripple(Promise.resolve({ name:'foo', body: 'bar' }))
    .then(d => same('foo' in ripple.resources, true))
    .then(d => same(ripple.resources.foo.body, 'bar'))
    
  same('foo' in ripple.resources, false)
})

test('should register promise - body 1', ({ plan, same }) => {
  plan(3)
  const ripple = core()
  ripple('foo', Promise.resolve('bar'))
    .then(d => same('foo' in ripple.resources, true))
    .then(d => same(ripple.resources.foo.body, 'bar'))
    
  same('foo' in ripple.resources, false)
})

test('should register promise - body 2', ({ plan, same }) => {
  plan(3)
  const ripple = core()
  ripple({ name: 'foo', body: Promise.resolve('bar') })
    .then(d => same('foo' in ripple.resources, true))
    .then(d => same(ripple.resources.foo.body, 'bar'))
    
  same('foo' in ripple.resources, false)
})

test('should link resource', ({ plan, same }) => {
  plan(5)
  const ripple = core({ aliases: { bar: 'foo' }})
  same(ripple.aliases, { 
    src: { 'foo': 'bar' }
  , dst: { 'bar': 'foo' }
  })

  ripple('bar', 'bar')
  same(ripple('foo'), 'bar')
  same(ripple('bar'), 'bar')

  ripple('foo', 'foo')
  same(ripple('foo'), 'foo')
  same(ripple('bar'), 'foo')
})