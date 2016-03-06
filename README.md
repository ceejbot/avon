# avon

Node bindings for the [blake2](https://blake2.net) cryptographic hash function.

Blake2 provides four different hashing functions:

* `blake2b`, `blake2bp`: 64-bit architectures, single & multicore variations
* `blake2s`, `blake2sp`: 32-bit and under architectures, single & multicore variations

All four algorithms are different & will produce different sums. Choose the one that's appropriate for your use.

[![on npm](https://img.shields.io/npm/v/avon.svg?style=flat)](https://www.npmjs.com/package/avon) [![Build Status](http://img.shields.io/travis/ceejbot/avon/master.svg?style=flat)](https://travis-ci.org/ceejbot/avon) [![Coverage Status](https://img.shields.io/coveralls/ceejbot/avon.svg?style=flat)](https://coveralls.io/github/ceejbot/avon?branch=master)

Tested on node 0.10, 4.x, and 5.x.

## Usage

Avon exports `sumFile`, 'sumBuffer', and `sumStream` functions to calculate a hash for whatever sort of data you have. All three functions take an optional callback. If no callback is provided, they return promises. Use the flow control method you prefer! The calculated hash is a node Buffer.

If you don't specify an algorithm, the 64-bit single-core `B` algorithm is used.

```javascript
var Avon = require('avon');
var assert = require('assert');

var buf = new Buffer('this is some input');

Avon.sumBuffer(buf, Avon.ALGORITHMS.BP)
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
});
```

There are variations that take a filename as input:

```javascript
Avon.sumFile('my_file.dat', , Avon.ALGORITHMS.SP, function(err, buffer)
{
	if (err) console.error('noooo!');
	else console.log(buffer.toString('hex'))
});
```

Or create a stream:

```js
var input = fs.createReadStream('my-large-file');
var hasher = Avon.sumStream(Avon.ALGORITHMS.BP);

input.on('close', function()
{
	var digest = hasher.digest('hex');
	// you now have a string with the final hash digest
	// the hash is unusable from here on
});

input.pipe(hasher);
```

## API

`Avon.ALGORITHMS` exports the enum-like list of algorithms: `B`, `BP`, `S`, and `SP`.

Blake2 provides a bewildering variety of variations. Avon exposes all of them. This chart might help you decide which to use.

| function | input | arch | multicore? | algo name
| --- | --- | --- | --- | ---
| sumStream | stream | * | * | pass algo name
| sumBuffer | buffer | * | * | pass algo name
| sumFile | file | * | * | pass algo name
| blake2  | buffer | 64 | n | B
| blake2SMP  | buffer | 64 | y | BP
| blake2_32  | buffer | 32 | n | S
| blake2_32SMP  | buffer | 32 | y | SP
| blake2File | file | 64 | n | B
| blake2SMPFile | file | 64 | y | BP
| blake2_32File | file | 32 | n | S
| blake2_32SMPFile | file | 32 | y | SP

## Notes

V8 bindings made considerably easier thanks to [NAN](https://github.com/nodejs/nan).

## License

ISC.
