const
	bindings = require('bindings'),
	blake2   = bindings('blake2'),
	P        = require('p-promise')
	;

const B = 0,
	BP = 1,
	S = 2,
	SP = 3;

function wrapperFile(algo, fname)
{
	if (typeof fname !== 'string')
		return P.reject(new Error('You must pass a string filename as input.'));

	var deferred = P.defer();

	blake2.b2_file(algo, fname, (err, result) =>
	{
		if (err) deferred.reject(err);
		else deferred.resolve(result);
	});

	return deferred.promise;
}

function sumBuffer(buffer, algorithm)
{
	if (!algorithm)
		algorithm = B;

	if (!Buffer.isBuffer(buffer))
	{
		throw new TypeError('You must pass a buffer as input.');
	}

	return blake2.b2_buffer(algorithm, buffer);
}

function sumFile(fname, algorithm, callback)
{
	if (typeof algorithm === 'function')
	{
		callback = algorithm;
		algorithm = B;
	}
	return wrapperFile(algorithm, fname).nodeify(callback);
}

module.exports =
{
	// convenience wrappers
	sumBuffer,
	sumFile,
	sumStream:  require('./streaming'),
	ALGORITHMS: require('./streaming').ALGORITHMS,

	// exposing the implementations
	blake2:           function(buffer) { return sumBuffer(buffer, B); },
	blake2SMP:        function(buffer) { return sumBuffer(buffer, BP); },
	blake2_32:        function(buffer) { return sumBuffer(buffer, S); },
	blake2_32SMP:     function(buffer) { return sumBuffer(buffer, SP); },
	blake2File:       function(fname, callback) { return wrapperFile(B, fname).nodeify(callback); },
	blake2SMPFile:    function(fname, callback) { return wrapperFile(BP, fname).nodeify(callback); },
	blake2_32File:    function(fname, callback) { return wrapperFile(S, fname).nodeify(callback); },
	blake2_32SMPFile: function(fname, callback) { return wrapperFile(SP, fname).nodeify(callback); },
};
