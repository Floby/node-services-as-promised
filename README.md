[![Build Status][travis-image]][travis-url] [![Coverage][coveralls-image]][coveralls-url]

node-services-as-promised
==================

> A DI container using promises

Installation
------------

    npm install --save services-as-promised

Usage
-----

### Using services

```javascript
var Container = require('services-as-promised').Container;
var services = new Container('/path/to/services/directory');

services.with('db', 'api/google').then(([db, google]) => {
  google.search('something').then(result => db.insert(result));
})
```
Resolving services as promises allows for asynchronous instanciation of them.
In the example above, the `db` service has the time to asynchronously connect
to the database.

### Defining services

```javascript
// this file under your `services` directory
exports.register = (container) => new Promise((resolve, reject) {
  asyncInitializationOfStuff((err, stuff) => {
    err ? reject(err) : resolve(stuff);
  })
})
```
The sync example would be a shame to even detail here.

Bottom-line, the register function returns a promise which
resolves to your service singleton.

### As connect/express middleware

```javascript
app.use(services.using('db', 'api/google'), (req, res) => {
  let db = req.services['db'];
  let google = req.services['api/google'];
});
```

### When testing

Here is an example with Mocha, because Mocha rules.

```javascript
var Container = require('services-as-promised').TestContainer;
var MyService = require('../services/my-service');
describe("My service under test", function () {
  let myService, mockedConfService;
  beforeEach(function() {
    let container = new Container();
    mockedConfService = {get: sinon.spy()};
    container.set('config', mockedConfService);
    myService = MyService.register(container);
  });
  
  it('looks up some value', function () {
    myService.someMethod();
    expect(mockedConfService.get).to.have.been.calledWith('some-conf-key');
  })
});
```

Test
----

You can run the tests with `npm test`. You will need to know [mocha][mocha-url]

Contributing
------------

Anyone is welcome to submit issues and pull requests


License
-------

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2015 Florent Jaby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[travis-image]: http://img.shields.io/travis/Floby/node-services-as-promised/master.svg?style=flat
[travis-url]: https://travis-ci.org/Floby/node-services-as-promised
[coveralls-image]: http://img.shields.io/coveralls/Floby/node-services-as-promised/master.svg?style=flat
[coveralls-url]: https://coveralls.io/r/Floby/node-services-as-promised
[mocha-url]: https://github.com/visionmedia/mocha


