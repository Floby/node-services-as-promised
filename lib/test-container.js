'use strict';

class TestContainer {
  constructor() {
    this._registry = new Map();
  }
  set(name, service) {
    this._registry.set(name, service);
  }
  with(name) {
    // FIXME with spread operator
    if (arguments.length === 1) {
      return this.withOne(name);
    } else {
      let args = [].slice.call(arguments);
      let promises = args.map(name => this.withOne(name));
      return Promise.all(promises);
    }
  }
  withOne(name) {
    return new Promise((resolve, reject) => {
      if (this._registry.has(name)) {
        resolve(this._registry.get(name));
      } else {
        reject(Error(`"${name}" cannot be loaded`))
      }
    });
  }
}

module.exports = TestContainer;

