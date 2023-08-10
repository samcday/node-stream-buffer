'use strict';

var expect = require('chai').expect;
var fixtures = require('./fixtures');
var streamBuffer = require('../lib/streambuffer');

describe('A default ReadableStreamBuffer', function() {
  beforeEach(function() {
    this.buffer = new streamBuffer.ReadableStreamBuffer();
  });

  it('is a Stream', function() {
    expect(this.buffer).to.be.an.instanceOf(require('stream').Stream);
  });

  it('is empty by default', function() {
    expect(this.buffer.size()).to.equal(0);
  });

  it('has default backing buffer size', function() {
    expect(this.buffer.maxSize()).to.equal(streamBuffer.DEFAULT_INITIAL_SIZE);
  });

  describe('when stopped', function() {
    beforeEach(function() {
      this.buffer.stop();
    });

    it('throws error on calling stop() again', function() {
      expect(this.buffer.stop.bind(this.buffer)).to.throw(Error);
    });

    it('throws error on calls to put()', function() {
      expect(this.buffer.put.bind(this.buffer)).to.throw(Error);
    });
  });

  it('emits end event when stopped', function(done) {
    this.buffer.on('end', done);
    this.buffer.stop();
    this.buffer.read();
  });

  it('emits end event after data, when stopped', function(done) {
    var that = this;
    var str = '';
    this.buffer.on('readable', function() {
      str += (that.buffer.read() || Buffer.alloc(0)).toString('utf8');
    });
    this.buffer.on('end', function() {
      expect(str).to.equal(fixtures.unicodeString);
      done();
    });
    this.buffer.put(fixtures.unicodeString);
    this.buffer.stop();
  });

  it('pushes new data even if read when empty', function(done) {
    var that = this;
    var str = '';
    this.buffer.on('readable', function() {
      str += (that.buffer.read() || Buffer.alloc(0)).toString('utf8');
    });
    this.buffer.on('end', function() {
      expect(str).to.equal(fixtures.unicodeString);
      done();
    });

    setTimeout(function() {
      that.buffer.put(fixtures.unicodeString);
      that.buffer.stop();
    }, streamBuffer.DEFAULT_FREQUENCY + 1);
  });

  describe('when writing binary data', function() {
    beforeEach(function(done) {
      var that = this;
      this.buffer.put(fixtures.binaryData);

      this.buffer.once('readable', function() {
        that.data = that.buffer.read();
        done();
      });
    });

    it('results in a Buffer', function() {
      expect(this.data).to.be.an.instanceOf(Buffer);
    });

    it('with the correct data', function() {
      expect(this.data).to.deep.equal(fixtures.binaryData);
    });
  });

  it('supports putting in hex data', function(done) {
    this.buffer.put('BEEF', 'hex');

    var that = this;
    this.buffer.once('readable', function() {
      var buf = that.buffer.read();
      expect(buf[0]).to.equal(190);
      expect(buf[1]).to.equal(239);
      done();
    });
  })

  describe('when writing binary data larger than initial backing buffer size', function() {
    beforeEach(function() {
      this.buffer.pause();
      this.buffer.put(fixtures.largeBinaryData);
    });

    it('buffer is correct size', function() {
      expect(this.buffer.size()).to.equal(fixtures.largeBinaryData.length);
    });

    it('backing buffer is correct size', function() {
      expect(this.buffer.maxSize()).to.equal(streamBuffer.DEFAULT_INITIAL_SIZE + streamBuffer.DEFAULT_INCREMENT_AMOUNT);
    });
  });
});

describe('A ReadableStreamBuffer using custom chunk size', function() {
  beforeEach(function(done) {
    var that = this;

    this.buffer = new streamBuffer.ReadableStreamBuffer({
      chunkSize: 2
    });

    this.buffer.once('readable', function() {
      that.data = that.buffer.read();
      done();
    });
    this.buffer.put(fixtures.binaryData);
  });

  it('yields a Buffer with the correct data', function() {
    expect(this.data).to.deep.equal(fixtures.binaryData.slice(0, 2));
  });
});

describe('A ReadableStreamBuffer using custom frequency', function() {
  beforeEach(function(done) {
    var that = this;
    var startTime = new Date().getTime();

    this.buffer = new streamBuffer.ReadableStreamBuffer({
      frequency: 300
    });

    this.buffer.once('readable', function() {
      that.time = new Date().getTime() - startTime;
      done();
    });
    this.buffer.put(fixtures.binaryData);
  });

  it('gave us data after the correct amount of time', function() {
    // Wtfux: sometimes the timer is coming back a millisecond or two
    // faster. So we do a 'close-enough' assertion here ;)
    expect(this.time).to.be.at.least(295);
  });
});