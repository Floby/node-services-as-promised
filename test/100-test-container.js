"use strict"
var expect = require('chai').expect;
var TestContainer = require('../lib/test-container');

describe('TestContainer', function () {
  let container;
  beforeEach(function () {
    container = new TestContainer();
  })
  describe('.with(name)', function () {
    it('returns a promise', function () {
      expect(container.with('name')).to.be.an.instanceof(Promise);
    });

    it('rejects the promise', function (done) {
      container.with('name')
        .then(() => done(Error('should not be called')))
        .catch((err) => done())
    })

    describe('after a .set(name, service)', function () {
      let service = {};
      beforeEach(() => container.set('name', service))
      it('resolves to that service', function (done) {
        container.with('name')
          .then((resolved) => {
            expect(resolved).to.equal(service)
            done()
          })
          .catch(done)
      })
    })
  })

  describe('.with(A, B)', function () {
    describe('with A and B registered', function () {
      let A = {}, B = {};
      beforeEach(() => {container.set('A', A); container.set('B', B)});
      it('resolve to an array of services', function (done) {
        container.with('A', 'B')
          .then((resolved) => {
            let resA = resolved.shift();
            let resB = resolved.shift();
            expect(resA).to.equal(A);
            expect(resB).to.equal(B);
            done()
          })
          .catch(done)
      })
    })

    describe('with only one registered', function () {
      let A = {};
      beforeEach(() => container.set('A', A))
      it('rejects the promise', function (done) {
        container.with('A', 'B')
          .then(() => done(Error('should not resolve')))
          .catch((reason) => {
            done();
          })
      })
    })
  })
})
