'use strict';
var Path = require('path');
var AbstractContainer = require('./abstract-container');

class Container extends AbstractContainer {
  constructor(path) {
    super();
    if (!path) {
      throw Error('A service directory path is mandatory when instanciating a container');
    }
    if (!Path.isAbsolute(path)) {
      throw Error ('The service directory path must be absolute');
    }
    this._root = path;
  }

  resolve(name) {
    return new Promise((resolve, reject) => {
      let servicePath = Path.resolve(this._root, name);
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
