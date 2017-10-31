var header = require('utilise/header')
  , expect = require('chai').expect
  , is = require('utilise/is')
  , core = require('./')

describe('Core', function() {
  
  it('should create empty resource from name', function(){  
    var ripple = core()
    expect(ripple('foo', 'bar')).to.eql('bar')
  })

  it('should fail to create resource it does not understand', function(){  
    var ripple = core()
    expect(ripple('foo')).to.be.not.ok
  })

  it('should set content-type by default', function(){  
    var ripple = core()
    ripple('foo', 'bar')
    expect(header('content-type')(ripple.resources['foo'])).to.be.equal('text/plain')
  })

  it('should create resource using alias', function(){  
    var ripple = core()
    expect(ripple.register('foo', 'bar')).to.eql('bar')
  })

  it('should create and get resource from name', function(){  
    var ripple = core()
    ripple('foo', 'bar')
    expect(ripple('foo')).to.eql('bar')
  })

  it('should create and get resource from obj', function(){  
    var ripple = core()
    expect(ripple({ name: 'foo', body: 'bar', headers: {} })).to.eql('bar')
    expect(ripple.resources.foo).to.eql({
      name: 'foo'
    , body: 'bar'
    , headers: { 'content-type': 'text/plain' } 
    })
  })

  it('should import multiple resources from object', function(){  
    var ripple = core()
    expect(ripple({ 
      foo: { name: 'foo', body: 'foo', headers: {} }
    , bar: { name: 'bar', body: 'bar', headers: {} }
    })).to.eql([ 'foo', 'bar' ])

    expect(ripple.resources).to.eql({ 
      foo: { name: 'foo', body: 'foo', headers: { 'content-type': 'text/plain' } }
    , bar: { name: 'bar', body: 'bar', headers: { 'content-type': 'text/plain' } }
    })
  })
  it('should create import resources from another node', function(){  
    var ripple = core()
    ripple({ name: 'foo', body: 'bar', headers: {} })
    var ripple2 = core()
    ripple2(ripple)
    expect(ripple2.resources.foo).to.eql({
      name: 'foo'
    , body: 'bar'
    , headers: { 'content-type': 'text/plain' } 
    })
  })

  it('should use explicitly set headers', function(){  
    var ripple = core()
    expect(ripple({
      name: 'sth'
    , body: { a : 1 }
    , headers: { 'content-type': 'text/plain' } 
    })).to.eql({ a : 1 })
    expect(ripple.resources.sth).to.eql({
      name: 'sth'
    , body: { a : 1 }
    , headers: { 'content-type': 'text/plain' } 
    })
  })

  it('should support method chaining api', function(){  
    var ripple = core()
    ripple
      .resource('foo', 'bar')
      .resource('bar', 'foo')

    expect(ripple('foo')).to.eql('bar')
    expect(ripple('bar')).to.eql('foo')
  })

  it('should create two different ripple nodes', function(){
    var ripple1 = core()
      , ripple2 = core()
    
    expect(ripple1).to.not.equal(ripple2)
  })

  it('should register multiple resources', function(){
    var ripple = core()
    ripple([{name:'foo', body:'1'}, {name:'bar', body:'1'}])
    
    expect('foo' in ripple.resources).to.be.ok
    expect('bar' in ripple.resources).to.be.ok
  })

  it('should destroy existing headers by default', function(){
    var ripple = core()
    ripple({ name: 'name', body: 'foo', headers: { 'foo': 'bar' }})
    expect(ripple.resources.name.headers.foo).to.be.eql('bar')

    ripple({ name:'name', body: 'baz' })
    expect(ripple.resources.name.headers.foo).to.be.not.ok
  })

  it('should fail if cannot interpret resource', function(){
    var ripple = core()
    expect(ripple('foo', [])).to.not.be.ok
    expect(ripple('bar')).to.not.be.ok

    expect('foo' in ripple.resources).to.be.false
    expect('bar' in ripple.resources).to.be.false
  })

  it('should fail if uses api incorrectly', function(){
    var ripple = core()
    expect(ripple()).to.be.eql(ripple)
    expect(ripple(String)).to.not.be.ok
    expect(ripple.resources).to.eql({})
  })

  it('should skip empty objects', function(){
    var ripple = core()
    expect(ripple({})).to.be.eql([])
    expect(ripple.resources).to.eql({})
  })

  it('should not register type it does not understand', function(){
    var ripple = core()
    expect(ripple({ name: 'foo', body: 'foo', headers: { 'content-type': 'application/jsx' }})).to.not.be.ok
    expect(ripple.resources).to.eql({})
  })

  it('should emit global change events', function(){
    var ripple = core()
      , params
      , fn = function(name, change){ params = [name, change] }

    ripple.on('change', fn)
    ripple('foo', 'bar')
    expect(params).to.eql(['foo', { type: 'update', value: 'bar', time: undefined }])

    ripple.types['data'] = { header: 'data', check: String }
    ripple('boo', { log: ['baz'] })
    expect(params).to.eql(['boo', { type: 'update', value: { log: ['baz'] }, time: 0 }])
  })

  it('should indicate if new resource', function(done){
    var ripple = core()
    ripple.once('change', function(d, change){
      expect(d).to.eql('foo')
      expect(change).to.eql({ type: 'update', value: 'foo', time: undefined })
      ripple.once('change', function(d, change){
        expect(d).to.eql('foo')
        expect(change).to.eql({ type: 'update', value: 'bar', time: undefined })
        done()
      })
      ripple('foo', 'bar')
    })
    ripple('foo', 'foo')
  })

  it('should register new types by order', function(){
    var ripple = core()
    ripple('text', 'text')
    expect(ripple.resources.text.headers['content-type']).to.eql('text/plain')

    ripple.types['priority/low'] = {
      header: 'priority/low'
    , check: String
    , priority: -10
    }

    ripple('low', 'low')
    expect(ripple.resources.low.headers['content-type']).to.eql('text/plain')

    ripple.types['priority/high'] = {
      header: 'priority/high'
    , check: String
    , priority: 10
    }

    ripple('high', 'high')
    expect(ripple.resources.high.headers['content-type']).to.eql('priority/high')
  })  

  it('should register promise - resource', function(done){
    var ripple = core()
    ripple(Promise.resolve({ name:'foo', body: 'bar' }))
      .then(d => expect('foo' in ripple.resources).to.be.ok)
      .then(d => expect(ripple.resources.foo.body).to.be.eql('bar'))
      .then(d => done())

    expect('foo' in ripple.resources).to.not.be.ok
  })

  it('should register promise - body 1', function(done){
    var ripple = core()
    ripple('foo', Promise.resolve('bar'))
      .then(d => expect('foo' in ripple.resources).to.be.ok)
      .then(d => expect(ripple.resources.foo.body).to.be.eql('bar'))
      .then(d => done())

    expect('foo' in ripple.resources).to.not.be.ok
  })

  it('should register promise - body 2', function(done){
    var ripple = core()
    ripple({ name: 'foo', body: Promise.resolve('bar') })
      .then(d => expect('foo' in ripple.resources).to.be.ok)
      .then(d => expect(ripple.resources.foo.body).to.be.eql('bar'))
      .then(d => done())

    expect('foo' in ripple.resources).to.not.be.ok
  })

})
