var expect = require('chai').expect;

describe('ServicesAsPromised', function () {
  it('is a module', function () {
    require('../index');
  });

  describe('.Container', function () {
    var m = require('../index');
    it('is a function', function () {
      expect(m.Container).to.be.a('function');
    })

    it('is a constructor', function () {
      var c = new m.Container('/');
      expect(c).to.be.an.instanceof(m.Container);
    })
  })

  describe('.TestContainer', function () {
    var m = require('../index');
    it('is a function', function () {
      expect(m.TestContainer).to.be.a('function');
    })

    it('is a constructor', function () {
      var c = new m.TestContainer();
      expect(c).to.be.an.instanceof(m.TestContainer);
    })
  })
})
