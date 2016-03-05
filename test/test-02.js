/*global describe:true, it:true, beforeEach: true, afterEach:true */
'use strict';

var
    demand     = require('must'),
    bindings   = require('bindings'),
    fs         = require('fs'),
    path       = require('path'),
    blake2     = bindings('blake2'),
    createHash = require('../streaming')
    ;

var correct2B = '7eb5d436ac77cb137329e74074501e484f4a9ed15f32b4be56842a8f285ebe4989cf89dd3794a8aee56e5964f3f5cd07f1b019611ce724141fd2a4b245d0d1a0';
var testp = path.resolve(__dirname, './test.png');
var testbuffer;

describe('blake2 streaming hash', function()
{
    it('can be constructed', function(done)
    {
        var streamer = createHash(2);
        streamer.must.be.an.object();
        streamer.constructor.name.must.equal('Streamer');
        done();
    });

    it('implements stream.Writable', function()
    {
        var streamer = createHash(2);
        streamer.must.have.property('update');
        streamer.update.must.be.a.function();
    });

    it('exposes a native update() function', function(done)
    {
        var result = createHash(2);
        result.must.have.property('update');
        result.update.must.be.a.function();
        done();
    });

    it('exposes a native final() function');

    it('can hash a file stream correctly', function(done)
    {
        var input = fs.createReadStream(testp);
        var hasher = createHash(2);

        input.on('close', function()
        {
            var digest = hasher.digest('hex');
            digest.must.equal(correct2B);
            done();
        });

        input.pipe(hasher);
    })
});
