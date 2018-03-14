"use strict"
var expect = require('chai').expect;
require('chai').use(require('chai-as-promised'))
var TestContainer = require('../lib/test-container');

describe('TestContainer', function () {
  let container;
  beforeEach(function () {
    container = new TestContainer();
  })
  describe('.with(name)', function () {
    it('rejects the promise', function () {
      return expect(container.with('name'))
        .to.eventually.be.rejectedWith(Error)
    })

    describe('after a .set(name, service)', function () {
      let service = {};
      beforeEach(() => container.set('name', service))
      it('resolves to that service', function () {
        return expect(container.with('name'))
          .to.eventually.equal(service)
      })
    })
  })

  describe('.with(A, B)', function () {
    describe('with A and B registered', function () {
      let A = {}, B = {};
      beforeEach(() => {container.set('A', A); container.set('B', B)});
      it('resolve to an array of services', async function () {
        const [ resA, resB ] = await container.with('A', 'B')
        expect(resA).to.equal(A);
        expect(resB).to.equal(B);
      })
    })

    describe('with only one registered', function () {
      let A = {};
      beforeEach(() => container.set('A', A))
      it('rejects the promise', function () {
        return expect(container.with('A', 'B'))
          .to.eventually.be.rejectedWith(Error)
      })
    })
  })
})
