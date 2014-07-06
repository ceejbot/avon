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
    Streamer   = require('../streaming')
    ;

var correct2B = '7eb5d436ac77cb137329e74074501e484f4a9ed15f32b4be56842a8f285ebe4989cf89dd3794a8aee56e5964f3f5cd07f1b019611ce724141fd2a4b245d0d1a0';
var testp = path.resolve(__dirname, './test.png');
var testbuffer;

describe('blake2 streaming hash', function()
{
    it('has tests');


    it('can be constructed', function(done)
    {
        var streamer = new Streamer(2);
        console.log(streamer);
        done();
    });
});
