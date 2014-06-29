'use strict';

var
    lab      = require('lab'),
    before   = lab.before,
    after    = lab.after,
    describe = lab.describe,
    it       = lab.it,
    demand   = require('must'),
    fs       = require('fs'),
    path     = require('path'),
    Blake2   = require('../index')
    ;

describe('blake2', function()
{
	describe('core', function()
	{
		var testp = path.resolve(__dirname, '../index.js');

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
			var testp = path.resolve(__dirname, '../index.js');
			Blake2.blake2b(testp, function(err, hash)
			{
				demand(err).not.exist();
				hash.must.be.instanceof(Buffer);
				hash.length.must.equal(64);
				first = hash.toString('hex');
				done();
			});
		});

		it('hashes to the same value', function(done)
		{
			var testp = path.resolve(__dirname, '../index.js');
			Blake2.blake2b(testp, function(err, hash)
			{
				demand(err).not.exist();
				hash.toString('hex').must.equal(first);
				done();
			});
		});

        it('hashes a buffer', function(done)
        {
			fs.readFile(path.resolve(__dirname, '../index.js'), function(err, data)
			{
				demand(err).not.exist();

				Blake2.blake2b(data, function(err, hash)
				{
					demand(err).not.exist();
					hash.toString('hex').must.equal(first);
					done();
				});
			});
        });
	});

	describe('blake2bp', function()
	{
		it('hashes a file', function(done)
		{
			var testp = path.resolve(__dirname, '../index.js');
			Blake2.blake2bp(testp)
			.then(function(hash)
			{
				hash.must.be.instanceof(Buffer);
				hash.length.must.equal(64);
				done();
			}).done();
		});

	});

	describe('blake2s', function()
	{
		it('hashes a file', function(done)
		{
			var testp = path.resolve(__dirname, '../index.js');
			Blake2.blake2s(testp)
			.then(function(hash)
			{
				hash.must.be.instanceof(Buffer);
				hash.length.must.equal(32);
				done();
			}).done();
		});
	});

	describe('blake2sp', function()
	{
		it('hashes a file', function(done)
		{
			var testp = path.resolve(__dirname, '../index.js');
			Blake2.blake2sp(testp)
			.then(function(hash)
			{
				hash.must.be.instanceof(Buffer);
				hash.length.must.equal(32);
				done();
			}).done();
		});
	});
});
