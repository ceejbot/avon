var blake2 = require('./build/Release/blake2').blake2;
var P = require('bluebird');


function wrapper(algo, fname)
{
	var deferred = P.defer();

	blake2(algo, fname, function(err, result)
	{
		if (err) deferred.reject(err);
		else deferred.resolve(result);
	});

	return deferred.promise;
}

function blake2b(fname)
{
	return wrapper(0, fname);
}

function blake2bp(fname, callback)
{
	return wrapper(1, fname);
}

function blake2s(fname, callback)
{
	return wrapper(2, fname);
}

function blake2sp(fname, callback)
{
	return wrapper(3, fname);
}

module.exports =
{
	blake2b  : function(input, callback) { return blake2b(input).nodeify(callback) },
	blake2bp : function(input, callback) { return blake2bp(input).nodeify(callback) },
	blake2s  : function(input, callback) { return blake2s(input).nodeify(callback) },
	blake2sp : function(input, callback) { return blake2sp(input).nodeify(callback) },
};
