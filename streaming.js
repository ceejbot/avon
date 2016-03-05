var
	bindings = require('bindings'),
	blake2   = bindings('blake2'),
	stream   = require('readable-stream'),
	util     = require('util')
	;

function createStreamingHash(algorithm)
{
	return new StreamingWrap();
}

function StreamingWrap(opts)
{
	this.hash = new blake2.Streamer();
	stream.Writable.call(this, opts);
}
util.inherits(StreamingWrap, stream.Writable);

StreamingWrap.prototype._write = function(data, encoding, callback)
{
	this.hash.update(data);
	callback();
};

StreamingWrap.prototype.digest = function(type)
{
	var buf = this.hash.final();
	return buf.toString(type ? type : 'hex');
};

module.exports = createStreamingHash;
createStreamingHash.StreamingWrap = StreamingWrap;
