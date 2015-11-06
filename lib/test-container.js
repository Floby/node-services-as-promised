'use strict';
var AbstractContainer = require('./abstract-container');

class TestContainer extends AbstractContainer {
  constructor() {
    super();
    this._map = new Map();
  }
  set(name, service) {
    this._map.set(name, service);
  }

  resolve(name) {
    return new Promise((resolve, reject) => {
      if (this._map.has(name)) {
        resolve(this._map.get(name));
      } else {
        reject(Error(`"${name}" cannot be loaded`))
      }
    });
  }
}

module.exports = TestContainer;

