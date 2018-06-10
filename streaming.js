var
	assert   = require('assert'),
	bindings = require('bindings'),
	blake2   = bindings('blake2'),
	stream   = require('readable-stream'),
	util     = require('util')
	;

var ALGORITHMS = { 'B': 0, 'BP': 1, 'S': 2, 'SP': 3 };

function createStreamingHash(algorithm)
{
	if (typeof algorithm === 'string')
		algorithm = ALGORITHMS[algorithm];
	assert(typeof algorithm === 'number' && algorithm < 4, 'you must pass an algorithm number from Avon.ALGORITHMS');
	return new StreamingWrap(algorithm);
}

function StreamingWrap(algorithm)
{
	this._finalized = false;
	this.hash = new blake2.AvonStream(algorithm);
	stream.Writable.call(this);
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

StreamingWrap.prototype.update = function(data)
{
	if (typeof data === 'string') data = Buffer.from(data);
	assert(Buffer.isBuffer(data), 'better pass a buffer, buddy');
	this.hash.update(data);
};

StreamingWrap.prototype.digest = function(type)
{
	this._finalized = true;
	var buf = this.hash.final();
	return buf.toString(type ? type : 'hex');
};

module.exports = createStreamingHash;
createStreamingHash.StreamingWrap = StreamingWrap;
createStreamingHash.ALGORITHMS = ALGORITHMS;
