var header = require('utilise/header')
  , expect = require('chai').expect
  , is = require('utilise/is')
  , core = require('./')
  , ripple

describe('Core', function() {
  beforeEach(function(){
    ripple = core()
  })

  it('should create empty resource from name', function(){  
    expect(ripple('foo', 'bar')).to.eql('bar')
  })

  it('should fail to create resource it does not understand', function(){  
    expect(ripple('foo')).to.eql(false)
  })

  it('should set content-type by default', function(){  
    ripple('foo', 'bar')
    expect(header('content-type')(ripple.resources['foo'])).to.be.equal('text/plain')
  })

  it('should create resource using alias', function(){  
    expect(ripple.register('foo', 'bar')).to.eql('bar')
  })

  it('should create and get resource from name', function(){  
    ripple('foo', 'bar')
    expect(ripple('foo')).to.eql('bar')
  })

  it('should create and get resource from obj', function(){  
    expect(ripple({ name: 'foo', body: 'bar', headers: {} })).to.eql('bar')
    expect(ripple.resources.foo).to.eql({
      name: 'foo'
    , body: 'bar'
    , headers: { 'content-type': 'text/plain' } 
    })
  })

  it('should create import resources from another node', function(){  
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
    ripple([{name:'foo', body:'1'}, {name:'bar', body:'1'}])
    
    expect('foo' in ripple.resources).to.be.ok
    expect('bar' in ripple.resources).to.be.ok
  })

  it('should destroy existing headers by default', function(){
    ripple({ name: 'name', body: 'foo', headers: { 'foo': 'bar' }})
    expect(ripple.resources.name.headers.foo).to.be.eql('bar')

    ripple({ name:'name', body: 'baz' })
    expect(ripple.resources.name.headers.foo).to.be.not.ok
  })

  it('should fail if cannot interpret resource', function(){
    expect(ripple('foo', [])).to.not.be.ok
    expect(ripple('bar')).to.not.be.ok

    expect('foo' in ripple.resources).to.be.false
    expect('bar' in ripple.resources).to.be.false
  })

  it('should fail if uses api incorrectly', function(){
    expect(ripple()).to.be.eql(ripple)
    expect(ripple(String)).to.not.be.ok
    expect(ripple.resources).to.eql({})
  })

  it('should emit global change events', function(){
    var called = 0
      , fn = function(){ called++ }

    ripple.on('change', fn)
    ripple('foo', 'bar')
    expect(called).to.equal(1)
  })

})
