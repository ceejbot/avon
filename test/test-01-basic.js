/*global before:true describe:true, it:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand = require('must'),
	fs        = require('fs'),
	path      = require('path'),
	Blake2    = require('../index')
	;

var correct2B = '7eb5d436ac77cb137329e74074501e484f4a9ed15f32b4be56842a8f285ebe4989cf89dd3794a8aee56e5964f3f5cd07f1b019611ce724141fd2a4b245d0d1a0';
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

	describe('core', function()
	{
		it('exports eight hash functions', function()
		{
			Blake2.must.be.an.object();
			var funcs = Object.keys(Blake2);
			funcs.length.must.be.above(8);
			for (var i = 0; i < funcs.length; i++)
			{
				Blake2[funcs[i]].must.be.a.function();
			}
		});

		it('all functions return promises if called sans callback', function(done)
		{
			var funcs = Object.keys(Blake2);
			funcs.forEach(function(f)
			{
				if (f === 'sumStream') return; // the one exception
				var res = Blake2[f](testp);
				res.must.be.an.object();
				res.must.have.property('then');
				res.then.must.be.a.function();
			});
			done();
		});

		it('all four functions invoke a callback if provided', function(done)
		{
			Blake2.blake2_32SMP(testp, function(ignored, callback)
			{
				// we got here!
				done();
			});
		});
	});

	describe('blake2 64-bit single core', function()
	{
		it('is aliased as sumBuffer', function()
		{
			Blake2.blake2.must.equal(Blake2.sumBuffer);
		});

		it('hashes a buffer correctly', function(done)
		{
			Blake2.blake2(testbuffer, function(err, hash)
			{
				demand(err).not.exist();
				hash.toString('hex').must.equal(correct2B);
				done();
			});
		});

		it('the promise version works too', function(done)
		{
			Blake2.blake2(testbuffer)
			.then(function(hash)
			{
				hash.toString('hex').must.equal(correct2B);
				done();
			}).done();
		});
	});

	describe('blake2File 64-bit single core', function()
	{
		var first;

		it('is aliased as sumFile', function()
		{
			Blake2.blake2File.must.equal(Blake2.sumFile);
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

		it('hashes a buffer', function(done)
		{
			Blake2.blake2SMP(testbuffer, function(err, hash)
			{
				demand(err).not.exist();
				hash.toString('hex').must.equal(result);
				done();
			});
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

		it('hashes a buffer', function(done)
		{
			Blake2.blake2_32(testbuffer)
			.then(function(hash)
			{
				hash.toString('hex').must.equal(result);
				done();
			}).done();
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

		it('hashes a buffer', function(done)
		{
			Blake2.blake2_32SMP(testbuffer)
			.then(function(hash)
			{
				hash.toString('hex').must.equal(result);
				done();
			}).done();
		});
	});

	describe('errors', function()
	{
		it('responds with an error when asked to hash file that doesn\'t exist', function(done)
		{
			Blake2.blake2_32SMPFile('idonotexist.jpg', function(err, hash)
			{
				err.must.be.instanceof(Error);
				err.message.must.equal('Could not open file to hash.');
				done();
			});
		});

		it('responds with an error when given an unknown hash type', function(done)
		{
			var b2Buffer = require('../build/Release/blake2').b2_buffer;
			b2Buffer(17, new Buffer('that does not exist'), function(err, result)
			{
				err.must.be.instanceof(Error);
				err.message.must.equal('Unknown hash type.');
				done();
			});
		});

		it('buffer summers respond with an error if you pass a non-string', function(done)
		{
			Blake2.sumBuffer({ foo: 'bar' }, function(err, hash)
			{
				err.must.be.instanceof(Error);
				err.message.must.equal('You must pass a buffer as input.');
				done();
			});
		});

		it('file summers respond with an error if you pass a non-string', function(done)
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
