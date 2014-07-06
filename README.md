# avon

Node bindings for the [blake2](https://blake2.net) cryptographic hash function.

Blake2 provides four different hashing functions:

* `blake2b`, `blake2bp`: 64-bit architectures, single & multicore variations
* `blake2s`, `blake2sp`: 32-bit and under architectures, single & multicore variations

All four algorithms are different & will produce different sums. Choose the one that's appropriate for your use.

[![Build Status](http://img.shields.io/travis/ceejbot/avon/master.svg?style=flat)](http://travis-ci.org/ceejbot/avon)
![Coverage](http://img.shields.io/badge/coverage-100%25-green.svg?style=flat)

## Usage

All four functions take an optional callback. If no callback is provided, they return promises. Use the flow control method you prefer! The calculated hash is a node Buffer.

```javascript
var Avon = require('avon');
var assert = require('assert');

var buf = new Buffer('this is some input');

Avon.blake2b(buf)
.then(function(hash)
{
	assert(hash instanceof Buffer);
	console.log(hash.toString('hex'));
}, function(err)
{
	console.error('noooooo! ' + err.message);
}).done();

Avon.blake2bp(buf, function(err, buffer)
{
	if (err) console.error('noooo!');
	else console.log(buffer.toString('hex'))
})
```

The functions can also take a filename input:

```javascript
Avon.blake2b('my_file.dat')
.then(function(hash)
{
	assert(hash instanceof Buffer);
	console.log(hash.toString('hex'));
}, function(err)
{
	console.error('noooooo! ' + err.message);
}).done();

Avon.blake2bp('my_file.dat', function(err, buffer)
{
	if (err) console.error('noooo!');
	else console.log(buffer.toString('hex'))
})
```

## TODO

- See about stream input.
- BREAK THE API and provide file-specific functions so we can handle strings.
- Refactor `blake2.cpp` to simplify.

## Notes

V8 bindings made considerably easier thanks to rvagg's [NAN](https://github.com/rvagg/nan).

## License

ICS.
