/*global before:true describe:true, it:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand     = require('must'),
	fs         = require('fs'),
	path       = require('path'),
	Avon = require('../index'),
	createHash = require('../index').sumStream
	;

var correct2B = '7eb5d436ac77cb137329e74074501e484f4a9ed15f32b4be56842a8f285ebe4989cf89dd3794a8aee56e5964f3f5cd07f1b019611ce724141fd2a4b245d0d1a0';
var correct2S = 'e58137b4c75c81b4b20bce99cc742335e3e9e8b8e57d2290670c8f3235f4bff3';
var testp = path.resolve(__dirname, './test.png');

describe('blake2 streaming hash', function()
{
	it('is in fact exported', function()
	{
		createHash.must.exist();
		createHash.must.be.a.function();
	});

	it('throws if not passed an algorithm enum', function()
	{
		function shouldThrow() { return createHash(17); }
		shouldThrow.must.throw(/algorithm number/);
	});

	it('can be constructed', function()
	{
		var streamer = createHash(Avon.ALGORITHMS.BP);
		streamer.must.be.an.object();
		streamer.constructor.name.must.equal('StreamingWrap');
		streamer.must.be.instanceof(createHash.StreamingWrap);
	});

	it('can be constructed using a string', function()
	{
		var streamer = createHash('SP');
		streamer.must.be.an.object();
		streamer.constructor.name.must.equal('StreamingWrap');
		streamer.must.be.instanceof(createHash.StreamingWrap);
	});

	it('implements stream.Writable', function()
	{
		var streamer = createHash(Avon.ALGORITHMS.BP);
		streamer.writable.must.be.true();
	});

	it('provides a digest() function', function()
	{
		var result = createHash(Avon.ALGORITHMS.SP);
		result.must.have.property('digest');
		result.digest.must.be.a.function();
	});

	it('exposes a native update() function', function()
	{
		var result = createHash(Avon.ALGORITHMS.S);
		result.hash.must.have.property('update');
		result.hash.update.must.be.a.function();
	});

	it('exposes a native final() function', function()
	{
		var result = createHash(Avon.ALGORITHMS.BP);
		result.hash.must.have.property('final');
		result.hash.final.must.be.a.function();
	});

	it('can hash a file stream correctly', function(done)
	{
		var input = fs.createReadStream(testp);
		var hasher = createHash(Avon.ALGORITHMS.B);

		input.on('close', function()
		{
			var digest = hasher.digest('hex');
			digest.must.equal(correct2B);
			done();
		});

		input.pipe(hasher);
	});

	it('respects the algorithm parameter', function(done)
	{
		var input = fs.createReadStream(testp);
		var hasher = createHash(Avon.ALGORITHMS.S);

		input.on('close', function()
		{
			var digest = hasher.digest('hex');
			digest.must.equal(correct2S);
			done();
		});

		input.pipe(hasher);
	});

	it('throws if you attempt to update a finalized hash', function()
	{
		var hash = createHash(Avon.ALGORITHMS.SP);
		hash.digest('hex');
		function shouldThrow() { hash.write(new Buffer('hello')); }
		shouldThrow.must.throw(/finalized/);
	});
});
