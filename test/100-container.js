"use strict"
var expect = require('chai').expect;
var Container = require('../lib/container');
var sinon = require('sinon');
var path = require('path');
var A = require('./to-resolve/A')
var B = require('./to-resolve/B')

describe('Container', function () {
  describe('new Container()', function () {
    it('throws', function () {
      expect(() => new Container()).to.throw(/path is mandatory/);
    });
  });

  describe('new Container("some/relative/path")', function () {
    it('throws', function () {
      expect(() => new Container('./heyyyy')).to.throw(/must be absolute/);
    })
  })

  describe('new Container("/absolute/path")', function () {
    let container;
    beforeEach(() => {
      container = new Container(path.join(__dirname, 'to-resolve'));
    })

    describe('.with(A)', function () {
      let mockA;
      beforeEach(() => mockA = sinon.mock(A) )
      afterEach(() => mockA.restore() )

      it('returns a Promise', function () {
        expect(container.with('A')).to.be.an.instanceof(Promise);
      })

      it('calls .register(this) on the module at /absolute/path/A', function () {
        mockA.expects('register').withArgs(container);
        container.with('A');
        mockA.verify();
      });

      describe('when the module does not exist', function () {
        it('rejects the promise', function (done) {
          expectReject(container.with('i-dont-exist'), (err) => {
            expect(err).to.be.an.instanceof(Error);
          }).then(done, done)
        })
      })

      describe('when .register(container) does not return a promise', function () {
        beforeEach(() => mockA.expects('register').returns({}))

        it('rejects its promise', function (done) {
          expectReject(container.with('A'), (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err).to.be.match(/should return a promise/);
          }).then(done, done);
        })
      })


      describe('when .register(container) returns a promise', function () {
        let error = Error('my error');
        let service = {};
        describe('that fails', function () {
          beforeEach(() => mockA.expects('register').returns(Promise.reject(error)));

          it('rejects its promise', function (done) {
            expectReject(container.with('A'), (err) => {
              expect(err).to.equal(error);
            }).then(done, done)
          });
        })

        describe('that succeeds', function () {
          beforeEach(() => mockA.expects('register').returns(Promise.resolve(service)));

          it('resolves the service', function (done) {
            container.with('A')
              .then(actual => {
                expect(actual).to.equal(service);
              }).then(done, done)
          })
        })
      })

      describe('called twice', function () {
        let service = {}
        beforeEach(() => mockA.expects('register').once().returns(Promise.resolve(service)));
        beforeEach(done => container.with('A').then(() => done(), done));

        it('only calls .register(container) once', function (done) {
          container.with('A')
            .then(actual => {
              expect(actual).to.equal(service);
              mockA.verify();
              done()
            })
            .catch(done)
        })
      })
    })

    describe('.with(A, B)', function () {
      let mockA;
      beforeEach(() => mockA = sinon.mock(A) )
      afterEach(() => mockA.restore() )
      let mockB;
      beforeEach(() => mockB = sinon.mock(B) )
      afterEach(() => mockB.restore() )

      describe('if both services exist', function () {
        let A = {}, B = {};
        beforeEach(() => mockA.expects('register').once().returns(Promise.resolve(A)))
        beforeEach(() => mockB.expects('register').once().returns(Promise.resolve(B)))

        it('resolves to an array of services', function (done) {
          container.with('A', 'B')
          .then((actual) => {
            expect(actual[0]).to.equal(A)
            expect(actual[1]).to.equal(B)
            done();
          })
          .catch(done)
        });
      });

      describe('if at least one fails', function () {
        let A = {}, B = Error('hey!');
        beforeEach(() => mockA.expects('register').once().returns(Promise.resolve(A)))
        beforeEach(() => mockB.expects('register').once().returns(Promise.reject(B)))

        it('rejects the promise altogether', function () {
          expectReject(container.with('A', 'B'), (err) => {
            expect(err).to.equal(B);
          })
        })
      })
    })
  })
});


function expectReject (promise, assertions) {
  return promise
    .then(function () {
      throw Error('did not expect promise to resolve')
    })
    .catch(err => err) 
    .then(err => assertions(err))
}
