var
    bindings = require('bindings'),
    blake2   = bindings('blake2'),
    stream   = require('readable-stream'),
    util     = require('util')
	;

var B = 0, BP = 1, S = 2, SP = 3;

function StreamingB2B()
{
	// TODO algorithm is ignored right now
	return new blake2.b2_stream(B);
}
util.inherits(StreamingB2B, stream.Writable);

StreamingB2B.prototype._write = function(data, encoding, callback)
{
    this.update(data);
    callback();
};

StreamingB2B.prototype.digest = function(type)
{
    var buf = this.final();
    return buf.toString(type ? type : 'hex');
};


module.exports = StreamingB2B;
