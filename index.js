var b2File = require('./build/Release/blake2').blake2_file;
var b2Buffer = require('./build/Release/blake2').blake2_buffer;
var P = require('bluebird');

function wrapper(algo, input)
{
	var deferred = P.defer();

	var func;
	if (Buffer.isBuffer(input))
		func = b2Buffer;
	else
		func = b2File;

	func(algo, input, function(err, result)
	{
		if (err) deferred.reject(err);
		else deferred.resolve(result);
	});

	return deferred.promise;
}

function blake2b(input)
{
	return wrapper(0, input)
}

function blake2bp(input, callback)
{
	return wrapper(1, input)
}

function blake2s(input, callback)
{
	return wrapper(2, input);
}

function blake2sp(input, callback)
{
	return wrapper(3, input);
}

module.exports =
{
	blake2b  : function(input, callback) { return blake2b(input).nodeify(callback) },
	blake2bp : function(input, callback) { return blake2bp(input).nodeify(callback) },
	blake2s  : function(input, callback) { return blake2s(input).nodeify(callback) },
	blake2sp : function(input, callback) { return blake2sp(input).nodeify(callback) },
};
