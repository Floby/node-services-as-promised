'use strict';
var path = require('path');

class Container {
  constructor(path) {
    if (!path) {
      throw Error('A service directory path is mandatory when instanciating a container');
    }
    this._root = path;
    this._registry = new Map();
  }

  with(name) {
    if (arguments.length === 1) {
      return this.withOne(name);
    } else {
      let names = [].slice.call(arguments);
      let promises = names.map(name => this.withOne(name));
      return Promise.all(promises);
    }
  }

  withOne(name) {
    if (this._registry.has(name)) {
      return this._registry.get(name);
    } else {
      let promise = this.resolve(name);
      this._registry.set(name, promise);
      return promise;
    }
  }

  resolve(name) {
    return new Promise((resolve, reject) => {
      let servicePath = path.resolve(this._root, name);
      let serviceModule = require(servicePath);
      let promise = serviceModule.register(this);
      if (promise instanceof Promise) {
        promise.then(resolve, reject);
      } else {
        reject(Error(`service at ${servicePath} should return a promise. got ${String(promise)}`));
      }
    })
  }
}

module.exports = Container;
