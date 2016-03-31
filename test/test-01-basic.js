/*global before:true describe:true, it:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand = require('must'),
	fs        = require('fs'),
	path      = require('path'),
	Blake2    = require('../index')
	;

var correct2B = '7eb5d436ac77cb137329e74074501e484f4a9ed15f32b4be56842a8f285ebe4989cf89dd3794a8aee56e5964f3f5cd07f1b019611ce724141fd2a4b245d0d1a0';
var correct2S = 'e58137b4c75c81b4b20bce99cc742335e3e9e8b8e57d2290670c8f3235f4bff3';
var testp = path.resolve(__dirname, './test.png');
var testbuffer;

describe('blake2', function()
{
	before(function(done)
	{
		fs.readFile(testp, null, function(err, data)
		{
			demand(err).not.exist();
			testbuffer = data;
			done();
		});
	});

	describe('exports', function()
	{
		it('exports eight hash functions', function()
		{
			Blake2.must.be.an.object();
			var funcs = Object.keys(Blake2);
			funcs.length.must.be.above(8);
			for (var i = 0; i < funcs.length; i++)
			{
				if (funcs[i] === 'ALGORITHMS') return; // the one exception
				Blake2[funcs[i]].must.be.a.function();
			}
		});

		it('all file functions return promises if called sans callback', function(done)
		{
			var funcs = Object.keys(Blake2);
			funcs.forEach(function(f)
			{
				if (!f.match(/File$/)) return;
				var res = Blake2[f](testp);
				res.must.be.an.object();
				res.must.have.property('then');
				res.then.must.be.a.function();
			});
			done();
		});

		it('all file functions invoke a callback if provided', function(done)
		{
			Blake2.blake2_32SMPFile('idontexist.js', function(ignored, callback)
			{
				// we got here!
				done();
			});
		});
	});

	describe('blake2 64-bit single core', function()
	{
		var first;

		it('hashes a buffer correctly', function()
		{
			var hash = Blake2.blake2(testbuffer);
			hash.toString('hex').must.equal(correct2B);
		});

		it('returns an error if it cannot find target file', function(done)
		{
			Blake2.blake2File('idontexist.js', function(err, hash)
			{
				err.must.exist();
				err.must.be.an.object();
				err.must.match(/Could not open file to hash./);
				done();
			});
		});

		it('hashes a file', function(done)
		{
			Blake2.blake2File(testp, function(err, hash)
			{
				demand(err).not.exist();
				hash.must.be.instanceof(Buffer);
				hash.length.must.equal(64);
				first = hash.toString('hex');
				done();
			});
		});

		it('hashes correctly', function(done)
		{
			Blake2.blake2File(testp, function(err, hash)
			{
				demand(err).not.exist();
				hash.toString('hex').must.equal(correct2B);
				done();
			});
		});

		it('hashes to the same value when run twice', function(done)
		{
			Blake2.blake2File(testp, function(err, hash)
			{
				demand(err).not.exist();
				hash.toString('hex').must.equal(first);
				done();
			});
		});
	});

	describe('blake2 64-bit multicore', function()
	{
		var result;

		it('hashes a file', function(done)
		{
			Blake2.blake2SMPFile(testp)
			.then(function(hash)
			{
				hash.must.be.instanceof(Buffer);
				hash.length.must.equal(64);
				result = hash.toString('hex');
				done();
			}).done();
		});

		it('hashes a buffer', function()
		{
			var hash = Blake2.blake2SMP(testbuffer);
			hash.toString('hex').must.equal(result);
		});
	});

	describe('blake2 32-bit single core', function()
	{
		var result;

		it('hashes a file', function(done)
		{
			Blake2.blake2_32File(testp)
			.then(function(hash)
			{
				hash.must.be.instanceof(Buffer);
				hash.length.must.equal(32);
				result = hash.toString('hex');
				done();
			}).done();
		});

		it('hashes a buffer', function()
		{
			var hash = Blake2.blake2_32(testbuffer);
			hash.toString('hex').must.equal(result);
		});
	});

	describe('blake2 32-bit multicore', function()
	{
		var result;

		it('hashes a file', function(done)
		{
			Blake2.blake2_32SMPFile(testp)
			.then(function(hash)
			{
				hash.must.be.instanceof(Buffer);
				hash.length.must.equal(32);
				result = hash.toString('hex');
				done();
			}).done();
		});

		it('hashes a buffer', function()
		{
			var hash = Blake2.blake2_32SMP(testbuffer);
			hash.toString('hex').must.equal(result);
		});
	});

	describe('sumBuffer', function()
	{
		it('defaults to B if no algorithm is passed', function()
		{
			var hash =  Blake2.sumBuffer(testbuffer);
			hash.toString('hex').must.equal(correct2B);
		});

		it('throws when given a bad algorithm', function()
		{
			function shouldThrow()
			{ return Blake2.sumBuffer(testbuffer, 47); }

			shouldThrow.must.throw(/Unknown hash type\./);
		});

		it('throws when given non-buffer input', function()
		{
			function shouldThrow()
			{ return Blake2.sumBuffer('foo', 47); }

			shouldThrow.must.throw(/buffer/);
		});
	});

	describe('sumFile', function()
	{
		it('defaults to B if no algorithm is passed', function(done)
		{
			Blake2.sumFile(testp, function(err, hash)
			{
				demand(err).not.exist();
				hash.toString('hex').must.equal(correct2B);
				done();
			});
		});

		it('respects a passed-in algorithm', function(done)
		{
			Blake2.sumFile(testp, 2, function(err, hash)
			{
				demand(err).not.exist();
				hash.toString('hex').must.equal(correct2S);
				done();
			});
		});
	});

	describe('file summers', function()
	{
		it('respond with an error when asked to hash file that doesn\'t exist', function(done)
		{
			Blake2.blake2_32SMPFile('idonotexist.jpg', function(err, hash)
			{
				err.must.be.instanceof(Error);
				err.message.must.equal('Could not open file to hash.');
				done();
			});
		});

		it('respond with an error if you pass a non-string', function(done)
		{
			Blake2.sumFile(new Buffer('whatever'), function(err, hash)
			{
				err.must.be.instanceof(Error);
				err.message.must.equal('You must pass a string filename as input.');
				done();
			});
		});
	});
});
