'use strict';

var
	Lab      = require('lab'),
	lab      = exports.lab = Lab.script(),
	before   = lab.before,
	after    = lab.after,
	describe = lab.describe,
	it       = lab.it,
	demand   = require('must'),
	fs       = require('fs'),
	path     = require('path'),
	Blake2   = require('../index')
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
		it('exports four hash functions', function(done)
		{
			Blake2.must.be.an.object();
			Blake2.blake2b.must.exist();
			Blake2.blake2b.must.be.a.function();
			Blake2.blake2bp.must.exist();
			Blake2.blake2bp.must.be.a.function();
			Blake2.blake2s.must.exist();
			Blake2.blake2s.must.be.a.function();
			Blake2.blake2sp.must.exist();
			Blake2.blake2sp.must.be.a.function();

			done();
		});

		it('all four functions return promises if called sans callback', function(done)
		{
			['blake2b', 'blake2bp', 'blake2s', 'blake2sp'].forEach(function(f)
			{
				var res = Blake2[f](testp);
				res.must.be.an.object();
				res.must.have.property('then');
				res.then.must.be.a.function();
			});
			done();
		});

		it('all four functions invoke a callback if provided', function(done)
		{
			Blake2.blake2sp(testp, function(err, callback)
			{
				// we got here!
				done();
			});
		});
	});

	describe('blake2b', function()
	{
		var first;

		it('returns an error if it cannot find target file', function(done)
		{
			Blake2.blake2b('idontexist.js', function(err, hash)
			{
				err.must.exist();
				err.must.be.an.object();
				err.must.match(/Could not open file to hash./);
				done();
			});
		})

		it('hashes a file', function(done)
		{
			Blake2.blake2b(testp, function(err, hash)
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
			Blake2.blake2b(testp, function(err, hash)
			{
				demand(err).not.exist();
				hash.toString('hex').must.equal(correct2B);
				done();
			});
		});

		it('hashes to the same value when run twice', function(done)
		{
			Blake2.blake2b(testp, function(err, hash)
			{
				demand(err).not.exist();
				hash.toString('hex').must.equal(first);
				done();
			});
		});

        it('hashes a buffer correctly', function(done)
        {
			Blake2.blake2b(testbuffer, function(err, hash)
			{
				demand(err).not.exist();
				hash.toString('hex').must.equal(correct2B);
				done();
			});
        });
	});

	describe('blake2bp', function()
	{
		var result;

		it('hashes a file', function(done)
		{
			Blake2.blake2bp(testp)
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
			Blake2.blake2bp(testbuffer, function(err, hash)
			{
				demand(err).not.exist();
				hash.toString('hex').must.equal(result);
				done();
			});
		});
	});

	describe('blake2s', function()
	{
		var result;

		it('hashes a file', function(done)
		{
			Blake2.blake2s(testp)
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
			Blake2.blake2s(testbuffer)
			.then(function(hash)
			{
				hash.toString('hex').must.equal(result);
				done();
			}).done();
		});
	});

	describe('blake2sp', function()
	{
		var result;

		it('hashes a file', function(done)
		{
			Blake2.blake2sp(testp)
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
			Blake2.blake2sp(testbuffer)
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
			Blake2.blake2sp('idonotexist.jpg', function(err, hash)
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

		it('responds with an error if you pass a non-string or buffer', function(done)
		{
			Blake2.blake2sp({ foo: 'bar' }, function(err, hash)
			{
				err.must.be.instanceof(Error);
				err.message.must.equal('You must pass either a buffer or a filename as input.');
				done();
			});
		});
	});
});
