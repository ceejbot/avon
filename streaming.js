var
	assert   = require('assert'),
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
	this._finalized = false;
	this.hash = new blake2.Streamer();
	stream.Writable.call(this, opts);
}
util.inherits(StreamingWrap, stream.Writable);

StreamingWrap.prototype._finalized = false;
StreamingWrap.prototype.hash = null;

StreamingWrap.prototype._write = function(data, encoding, callback)
{
	assert(!this._finalized, 'attempting to update a finalized hash');
	this.hash.update(data);
	callback();
};

StreamingWrap.prototype.digest = function(type)
{
	this._finalized = true;
	var buf = this.hash.final();
	return buf.toString(type ? type : 'hex');
};

module.exports = createStreamingHash;
createStreamingHash.StreamingWrap = StreamingWrap;
