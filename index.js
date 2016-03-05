var
	bindings = require('bindings'),
	blake2   = bindings('blake2'),
	P        = require('p-promise')
	;

var B = 0, BP = 1, S = 2, SP = 3;

function wrapper(algo, buffer)
{
	if (!Buffer.isBuffer(buffer))
		return P.reject(new Error('You must pass a buffer as input.'));

	var deferred = P.defer();

	blake2.b2_buffer(algo, buffer, function(err, result)
	{
		if (err) deferred.reject(err);
		else deferred.resolve(result);
	});

	return deferred.promise;
}

function wrapperFile(algo, fname)
{
	if (typeof fname !== 'string')
		return P.reject(new Error('You must pass a string filename as input.'));

	var deferred = P.defer();

	blake2.b2_file(algo, fname, function(err, result)
	{
		if (err) deferred.reject(err);
		else deferred.resolve(result);
	});

	return deferred.promise;
}

// blake2bp - multicore, 64

module.exports =
{
	blake2:           function(buffer, callback) { return wrapper(B, buffer).nodeify(callback); },
	blake2SMP:        function(buffer, callback) { return wrapper(BP, buffer).nodeify(callback); },
	blake2_32:        function(buffer, callback) { return wrapper(S, buffer).nodeify(callback); },
	blake2_32SMP:     function(buffer, callback) { return wrapper(SP, buffer).nodeify(callback); },
	blake2File:       function(fname, callback) { return wrapperFile(B, fname).nodeify(callback); },
	blake2SMPFile:    function(fname, callback) { return wrapperFile(BP, fname).nodeify(callback); },
	blake2_32File:    function(fname, callback) { return wrapperFile(S, fname).nodeify(callback); },
	blake2_32SMPFile: function(fname, callback) { return wrapperFile(SP, fname).nodeify(callback); },
	sumStream:        require('./streaming')
};

// Aliases for the most common.
module.exports.sumBuffer = module.exports.blake2;
module.exports.sumFile = module.exports.blake2File;
