var
    bindings = require('bindings'),
    blake2   = bindings('blake2'),
    stream   = require('readable-stream'),
    util     = require('util')
	;

const B = 0, BP = 1, S = 2, SP = 3;

function StreamingB2B()
{
	// TODO algorithm is ignored right now
	return new blake2.b2_stream(B);
}
util.inherits(StreamingB2B, stream.WritableStream);


StreamingB2B.prototype.update = function(buf)
{
    // TODO
};

StreamingB2B.prototype.digest = function(type)
{
    // TODO
}
