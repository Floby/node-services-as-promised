"use strict"

var expect = require('chai').expect;
require('chai').use(require('sinon-chai'));
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

      it('calls .register(this) on the module at /absolute/path/A', async function () {
        mockA.expects('register').withArgs(container);
        await container.with('A').catch(() => {})
        mockA.verify();
      });

      describe('when the module does not exist', function () {
        it('rejects the promise', function () {
          return expect(container.with('i-dont-exist'))
            .to.eventually.be.rejectedWith(Error)
        })
      })

      describe('when .register(container) does not return a promise', function () {
        beforeEach(() => mockA.expects('register').returns({}))

        it('rejects its promise', function () {
          return expect(container.with('A'))
            .to.eventually.be.rejectedWith(Error, /should return a promise/)
        })
      })


      describe('when .register(container) returns a promise', function () {
        let error = Error('my error');
        let service = {};
        describe('that fails', function () {
          beforeEach(() => mockA.expects('register').returns(Promise.reject(error)));

          it('rejects its promise', function () {
            return expect(container.with('A'))
              .to.eventually.be.rejectedWith(error)
          });
        })

        describe('that succeeds', function () {
          beforeEach(() => mockA.expects('register').returns(Promise.resolve(service)));

          it('resolves the service', function () {
            return expect(container.with('A'))
              .to.eventually.equal(service)
          })
        })
      })

      describe('called twice', function () {
        let service = {}
        beforeEach(() => mockA.expects('register').once().returns(Promise.resolve(service)));
        beforeEach(() => container.with('A'));

        it('only calls .register(container) once', function () {
          return expect(container.with('A'))
            .to.eventually.equal(service)
            .then(() => mockA.verify())
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

        it('resolves to an array of services', async function () {
          const [ resA, resB ] = await container.with('A', 'B')
          expect(resA).to.equal(A)
          expect(resB).to.equal(B)
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


    describe('.using("A", "B")', function () {
      let mockContainer, req, res, next;
      beforeEach(() => mockContainer = sinon.mock(container));
      afterEach(() => mockContainer.restore())
      beforeEach(() => {
        req = {};
        res = {};
        next = sinon.spy();
      })

      it('returns a middleware', function () {
        let middleware = container.using('A', 'B');
        expect(container.using('A', 'B')).to.be.a('function');
        expect(container.using('A', 'B').toString()).to.match(/\(req, ?res, ?next\)/)
      })

      describe('(req, res, next)', function () {
        describe('if service lookup fails', function () {
          it('calls next with the error', function () {
            let error = Error('hey');
            let promise = Promise.reject(error)
            mockContainer.expects('resolve').withArgs('A').returns(promise);
            container.using('A')(req, res, next);
            return expect(promise).to.eventually.be.rejected
              .then(() => expect(next).to.have.been.calledOnce)
              .then(() => expect(next).to.have.been.calledWith(error))
          });
        })

        describe('if all services succeed', function () {
          let A = {}, B = {};
          beforeEach(() => {
            mockContainer.expects('resolve').withArgs('A').returns(Promise.resolve(A))
            mockContainer.expects('resolve').withArgs('B').returns(Promise.resolve(B))
          })

          it('populates the request with a "service" object', function (done) {
            container.using('A', 'B')(req, res, function(err) {
              try {
                expect(err).not.to.be.ok;
                expect(req).to.have.property('services');
                expect(req.services.A).to.equal(A);
                expect(req.services.B).to.equal(B);
                done();
              } catch(e) {
                done(e);
              }
            });
          });

          it('keeps other previously set services and overrides same names', function (done) {
            let previous = {}, myB = 'myB';
            req.services = {previous, B: myB};
            container.using('B')(req, res, function (err) {
              try {
                expect(err).not.to.be.ok;
                expect(req).to.have.property('services');
                expect(req.services).to.have.property('previous')
                expect(req.services.previous).to.equal(previous);
                expect(req.services.B).to.equal(B);
                done();
              } catch(e) {
                done(e);
              }
            })
          })
        })
      })
    });
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
