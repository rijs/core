var header = require('utilise/header')
  , expect = require('chai').expect
  , is = require('utilise/is')
  , core = require('./')
  , ripple

describe('core', function() {
  beforeEach(function(){
    ripple = core()
  })

  it('should create empty resource from name', function(){  
    expect(ripple('sth')).to.eql([])
  })

  it('should create different core types', function(){  
    expect(ripple('1', 'sth')).to.eql('sth')
    expect(ripple('2', [])).to.eql([])
    expect(ripple('3', {})).to.eql({})
    expect(ripple('4', String)).to.eql(String)

    expect(header('content-type')(ripple.resources['1'])).to.be.equal('text/plain')
    expect(header('content-type')(ripple.resources['2'])).to.be.equal('application/data')
    expect(header('content-type')(ripple.resources['3'])).to.be.equal('application/data')
    expect(header('content-type')(ripple.resources['4'])).to.be.equal('application/javascript')
  })

  it('should create resource using alias', function(){  
    expect(ripple.register('sth', 'els')).to.eql('els')
  })

  it('should create and get resource from name', function(){  
    expect(ripple('sth', ['lorem'])).to.eql(['lorem'])
    expect(ripple('sth')).to.eql(['lorem'])
  })

  it('should create and get resource from obj', function(){  
    expect(ripple({ name: 'sth', body: {a:1}, headers: {} })).to.eql({a:1})
    expect(ripple.resources.sth).to.eql({
      name: 'sth'
    , body: { a : 1 }
    , headers: { 'content-type': 'application/data' } 
    })
  })

  it('should use explicitly set headers', function(){  
    expect(ripple({
      name: 'sth'
    , body: { a : 1 }
    , headers: { 'content-type': 'application/data' } 
    })).to.eql({ a : 1 })
    expect(ripple.resources.sth).to.eql({
      name: 'sth'
    , body: { a : 1 }
    , headers: { 'content-type': 'application/data' } 
    })
  })

  it('should support method chaining api', function(){  
    ripple
      .resource('1', [10])
      .resource('2', [20])

    expect(ripple('1')).to.eql([10])
    expect(ripple('2')).to.eql([20])
  })

  it('should create two different ripple nodes', function(){
    var ripple1 = core()
      , ripple2 = core()
    
    expect(ripple1).to.not.equal(ripple2)
  })

  it('should fail if cannot interpret resource', function(){
    delete ripple.types['application/data']
    expect(ripple('sth', [])).to.not.be.ok
    expect(ripple('els')).to.not.be.ok

    expect('sth' in ripple.resources).to.be.false
    expect('els' in ripple.resources).to.be.false
  })

  it('should fail if uses api incorrectly', function(){
    expect(ripple()).to.not.be.ok
    expect(ripple([])).to.not.be.ok
    expect(ripple(String)).to.not.be.ok
    expect(ripple.resources).to.eql({})
  })

  it('should emit global change events', function(){
    var called = 0
      , fn = function(){ called++ }

    ripple.on('change', fn)
    ripple('sth')
    expect(called).to.equal(1)
  })

  it('should emit local change events', function(){
    var called = 0
      , fn = function(){ called++ }

    ripple('sth')
    ripple('raa')
    ripple.on('change', fn)
    ripple('raa').on('change', fn)
    ripple('sth').on('change', fn)
    ripple('sth').emit('change')
    expect(called).to.equal(1)
  })

})