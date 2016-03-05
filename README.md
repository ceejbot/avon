# avon

Node bindings for the [blake2](https://blake2.net) cryptographic hash function.

Blake2 provides four different hashing functions:

* `blake2b`, `blake2bp`: 64-bit architectures, single & multicore variations
* `blake2s`, `blake2sp`: 32-bit and under architectures, single & multicore variations

All four algorithms are different & will produce different sums. Choose the one that's appropriate for your use.

[![on npm](https://img.shields.io/npm/v/avon.svg?style=flat)](https://www.npmjs.com/package/avon) [![Build Status](http://img.shields.io/travis/ceejbot/avon/master.svg?style=flat)](https://travis-ci.org/ceejbot/avon) [![Coverage Status](https://img.shields.io/coveralls/ceejbot/avon.svg?style=flat)](https://coveralls.io/github/ceejbot/avon?branch=master)

Tested on node 0.10, 4.x, and 5.x.

## Usage

All four functions take an optional callback. If no callback is provided, they return promises. Use the flow control method you prefer! The calculated hash is a node Buffer.

```javascript
var Avon = require('avon');
var assert = require('assert');

var buf = new Buffer('this is some input');

Avon.sumBuffer(buf)
.then(function(hash)
{
	assert(hash instanceof Buffer);
	console.log(hash.toString('hex'));
}, function(err)
{
	console.error('noooooo! ' + err.message);
}).done();

Avon.sumBuffer(buf, function(err, buffer)
{
	if (err) console.error('noooo!');
	else console.log(buffer.toString('hex'))
})
```

There are variations that take a filename as input:

```javascript
Avon.sumFile('my_file.dat')
.then(function(hash)
{
	assert(hash instanceof Buffer);
	console.log(hash.toString('hex'));
}, function(err)
{
	console.error('noooooo! ' + err.message);
}).done();

Avon.sumFile('my_file.dat', function(err, buffer)
{
	if (err) console.error('noooo!');
	else console.log(buffer.toString('hex'))
})
```

## Streams!

The blake2 64-bit single core (aka blake2 b) algorithm is exposed with a streaming interface.

```js
var Avon = require('avon');

var input = fs.createReadStream('my-large-file');
var hasher = Avon.sumStream();

input.on('close', function()
{
	var digest = hasher.digest('hex');
	// you now have a string with the final hash digest
	// the hash is unusable from here on
});

input.pipe(hasher);
```

## API

The following function are exported. This chart might help you decide which to use.

| function | input | arch | multicore? | blake name
| --- | --- | --- | --- | ---
| sumStream | stream | 64 | n | blake 2b
| sumBuffer | buffer | 64 | n | alias for blake2()
| sumFile | file | 64 | n | alias for blake2File()
| blake2  | buffer | 64 | n | 2b
| blake2SMP  | buffer | 64 | y | 2bp
| blake2_32  | buffer | 32 | n | 2s
| blake2_32SMP  | buffer | 32 | y | 2sp
| blake2File | file | 64 | n | 2b
| blake2SMPFile | file | 64 | y | 2bp
| blake2_32File | file | 32 | n | 2s
| blake2_32SMPFile | file | 32 | y | 2sp


## TODO

- Provide the other algorithms in streaming form.

## Notes

V8 bindings made considerably easier thanks to [NAN](https://github.com/nodejs/nan).

## License

ISC.
