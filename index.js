var b2File = require('./build/Release/blake2').blake2_file;
var b2Buffer = require('./build/Release/blake2').blake2_buffer;
var P = require('bluebird');

function wrapperFile(algo, fname)
{
	var deferred = P.defer();

	b2File(algo, fname, function(err, result)
	{
		if (err) deferred.reject(err);
		else deferred.resolve(result);
	});

	return deferred.promise;
}

function wrapperBuffer(algo, buf)
{
	var deferred = P.defer();

	b2Buffer(algo, buf, function(err, result)
	{
		if (err) deferred.reject(err);
		else deferred.resolve(result);
	});

	return deferred.promise;
}

function blake2b(input)
{
	if (Buffer.isBuffer(input))
		return wrapperBuffer(0, input)
	else
		return wrapperFile(0, input);
}

function blake2bp(input, callback)
{
	if (Buffer.isBuffer(input))
		return wrapperBuffer(1, input)
	else
		return wrapperFile(1, input);
}

function blake2s(input, callback)
{
	if (Buffer.isBuffer(input))
		return wrapperBuffer(2, input)
	else
		return wrapperFile(2, input);
}

function blake2sp(input, callback)
{
	if (Buffer.isBuffer(input))
		return wrapperBuffer(3, input)
	else
		return wrapperFile(3, input);
}

module.exports =
{
	blake2b  : function(input, callback) { return blake2b(input).nodeify(callback) },
	blake2bp : function(input, callback) { return blake2bp(input).nodeify(callback) },
	blake2s  : function(input, callback) { return blake2s(input).nodeify(callback) },
	blake2sp : function(input, callback) { return blake2sp(input).nodeify(callback) },
};
