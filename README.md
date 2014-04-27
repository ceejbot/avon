# avon

Node bindings for the [blake2](https://blake2.net) cryptographic hash function.

Blake2 provides four different hashing functions:

* `blake2b`, `blake2bp`: 64-bit architectures, single & multicore variations
* `blake2s`, `blake2sp`: 32-bit and under architectures, single & multicore variations

All four algorithms are different & will produce different sums. Choose the one that's appropriate for your use.

[![Build Status](http://img.shields.io/travis/ceejbot/avon.svg?style=flat)](http://travis-ci.org/ceejbot/avon)

## Usage

All four functions take an optional callback. If no callback is provided, they return promises. Use the flow control method you prefer! The calculated hash is a node Buffer.

```javascript
var Blake2 = require('blake2');
var assert = require('assert');

Blake2.blake2b('my_file.dat')
.then(function(hash)
{
	assert(hash instanceof Buffer);
	console.log(hash.toString('hex'));
}, function(err)
{
	console.error('noooooo! ' + err.message);
}).done();

Blake2.blake2bp('my_file.dat', function(err, buffer)
{
	if (err) console.error('noooo!');
	else console.log(buffer.toString('hex'))
})

```

## Notes

V8 bindings made considerably easier thanks to rvagg's [NAN](https://github.com/rvagg/nan).

## License

ICS.
