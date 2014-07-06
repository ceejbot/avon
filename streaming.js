var
    bindings = require('bindings'),
    blake2   = bindings('blake2'),
    stream   = require('readable-stream'),
    util     = require('util')
	;

var B = 0, BP = 1, S = 2, SP = 3;

function createHash(algorithm)
{
	// TODO algorithm is ignored right now
	var result = new blake2.Streamer(B);
    stream.Writable.call(result);
    return result;
}
util.inherits(blake2.Streamer, stream.Writable);

blake2.Streamer.prototype._write = function(data, encoding, callback)
{
    this.update(data);
    callback();
};

blake2.Streamer.prototype.digest = function(type)
{
    var buf = this.final();
    return buf.toString(type ? type : 'hex');
};


module.exports = createHash;
