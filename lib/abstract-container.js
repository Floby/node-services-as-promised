"use strict"

class AbstractContainer {
  constructor() {
    this._registry = new Map();
  }
  resolve(name) {
    throw Error('not implemented');
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

  using() {
    let container = this;
    let names = arguments;
    return function (req, res, next) {
      container.with.apply(container, names)
        .then(services => {
          if (!Array.isArray(services)) services = [services];
          let newServices = services.reduce((services, service, index) => {
            services[names[index]] = service;
            return services;
          }, {});

          req.services = Object.assign({}, req.services, newServices);
          next();
        })
        .catch((err) => {
          next(err);
        });
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


}

module.exports = AbstractContainer;
