# avon

Node bindings for the [blake2](https://blake2.net) cryptographic hash function. The relationship of Avon to Blake is of course [obvious](https://en.wikipedia.org/wiki/Kerr_Avon).

Blake2 provides four different hashing functions:

* `blake2b`, `blake2bp`: 64-bit architectures, single & multicore variations
* `blake2s`, `blake2sp`: 32-bit and under architectures, single & multicore variations

All four algorithms are different & will produce different sums. Choose the one that's appropriate for your use.

[![on npm](https://img.shields.io/npm/v/avon.svg?style=flat)](https://www.npmjs.com/package/avon) [![Build Status](http://img.shields.io/travis/ceejbot/avon/master.svg?style=flat)](https://travis-ci.org/ceejbot/avon) [![Coverage Status](https://img.shields.io/coveralls/ceejbot/avon.svg?style=flat)](https://coveralls.io/github/ceejbot/avon?branch=master)

Tested on node 6, 8, and 10.

## Usage

Avon exports `sumFile()`, `sumBuffer()`, and `sumStream()` functions to calculate a hash for whatever sort of data you have. `sumBuffer()` is synchronous. `sumFile()` and `sumStream()` take an optional callback. If no callback is provided, they return promises. Use the control flow method you prefer! The calculated hash is a node Buffer.

If you don't specify an algorithm, the 64-bit single-core `B` algorithm is used.

```js
var Avon = require('avon');
var assert = require('assert');

var buf = Buffer.from('this is some input');

var hash = Avon.sumBuffer(buf, Avon.ALGORITHMS.BP);
assert(hash instanceof Buffer);
console.log(hash.toString('hex'));

var sum = Avon.sumBuffer(buf, Avon.ALGORITHMS.SP);
console.log(sum.toString('hex');
```

Want to hash a file? Sure!

```javascript
Avon.sumFile('my_file.dat', Avon.ALGORITHMS.SP, function(err, buffer)
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

Blake2 provides a bewildering variety of variations. Avon exposes all of them both in the general-purpose functions given above, and in some convenience wrappers. This chart might help you decide which to use.

| function | input | arch | multicore? | async? | algo name
| --- | --- | --- | --- | --- | ---
| sumStream | stream | * | * | - | pass algo name
| sumBuffer | buffer | * | * | n | pass algo name
| sumFile | file | * | * | y | pass algo name
| blake2  | buffer | 64 | n | n | B
| blake2SMP  | buffer | 64 | y | n | BP
| blake2_32  | buffer | 32 | n | n | S
| blake2_32SMP  | buffer | 32 | y | n | SP
| blake2File | file | 64 | n | y | B
| blake2SMPFile | file | 64 | y | y | BP
| blake2_32File | file | 32 | n | y | S
| blake2_32SMPFile | file | 32 | y | y | SP

## Notes

V8 bindings made considerably easier thanks to [NAN](https://github.com/nodejs/nan).

## License

ISC.
