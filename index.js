var
	bindings = require('bindings'),
	blake2   = bindings('blake2'),
	P        = require('p-promise')
	;

var B = 0, BP = 1, S = 2, SP = 3;

function wrapper(algo, input)
{
	var func;
	if (Buffer.isBuffer(input))
		func = blake2.b2_buffer;
	else if (typeof input === 'string')
		func = blake2.b2_file;
	else
		return P.reject(new Error('You must pass either a buffer or a filename as input.'));

	var deferred = P.defer();

	func(algo, input, function(err, result)
	{
		if (err) deferred.reject(err);
		else deferred.resolve(result);
	});

	return deferred.promise;
}

function blake2b(input)
{
	return wrapper(B, input);
}

function blake2bp(input, callback)
{
	return wrapper(BP, input);
}

function blake2s(input, callback)
{
	return wrapper(S, input);
}

function blake2sp(input, callback)
{
	return wrapper(SP, input);
}

module.exports =
{
	blake2b  : function(input, callback) { return blake2b(input).nodeify(callback); },
	blake2bp : function(input, callback) { return blake2bp(input).nodeify(callback); },
	blake2s  : function(input, callback) { return blake2s(input).nodeify(callback); },
	blake2sp : function(input, callback) { return blake2sp(input).nodeify(callback); },
	streaming: require('./streaming')
};
