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

//   'Setting a custom initial size and increment amount': {
//     topic: function() {
//       return new streamBuffer.ReadableStreamBuffer({
//         initialSize: 1,
//         incrementAmount: 5
//       });
//     },

//     'gives us correct initial backing buffer size': function(aStreamBuffer) {
//       assert.equal(aStreamBuffer.maxSize(), 1);
//     },

//     'and writing to size of initial size': {
//       topic: function(aStreamBuffer) {
//         aStreamBuffer.put('ab');
//         return aStreamBuffer;
//       },

//       'gives us correct incremented size of backing buffer': function(aStreamBuffer) {
//         assert.equal(aStreamBuffer.maxSize(), 6);
//       }
//     },

//     teardown: function(aStreamBuffer) {
//       aStreamBuffer.destroy();
//     }
//   },

//   'Destroying stream': {
//     topic: function() {
//       var that = this;

//       var aStreamBuffer = new streamBuffer.ReadableStreamBuffer();

//       aStreamBuffer.on('data', function() {
//         aStreamBuffer.dataCalled = true;
//       });

//       aStreamBuffer.on('end', function() {
//         aStreamBuffer.endCalled = true;
//       });

//       aStreamBuffer.on('close', function() {
//         that.callback(null, aStreamBuffer);
//       });

//       aStreamBuffer.put('asdf');
//       aStreamBuffer.destroy();
//     },

//     'sets *readable* to false': function(aStreamBuffer) {
//       assert.isFalse(aStreamBuffer.readable);
//     },

//     '*data* event was never called': function(aStreamBuffer) {
//       assert.isFalse(aStreamBuffer.dataCalled || false);
//     },

//     '*end* event was called': function(aStreamBuffer) {
//       assert.isTrue(aStreamBuffer.endCalled);
//     }
//   },

//   'Data written in two chunks': {
//     topic: function() {
//       var that = this;

//       var aStreamBuffer = new streamBuffer.ReadableStreamBuffer({
//         chunkSize: Math.ceil(fixtures.simpleString.length / 2)
//       });
//       aStreamBuffer.setEncoding('utf8');

//       var chunks = [];
//       aStreamBuffer.on('data', function(data) {
//         chunks.push(data);
//         if(chunks.length == 2) that.callback(null, chunks);
//       });

//       aStreamBuffer.put(fixtures.simpleString);
//       aStreamBuffer.destroySoon();
//     },

//     'chunks equal original value': function(chunks) {
//       assert.equal(chunks[0] + chunks[1], fixtures.simpleString);
//     }
//   },

//   'Writing unicode data in two writes': {
//     topic: function() {
//       var aStreamBuffer = new streamBuffer.ReadableStreamBuffer();
//       aStreamBuffer.pause();
//       aStreamBuffer.put(fixtures.unicodeString);
//       aStreamBuffer.put(fixtures.unicodeString);
//       aStreamBuffer.resume();
//       aStreamBuffer.setEncoding('utf8');
//       aStreamBuffer.on('data', this.callback.bind(this, null));
//       aStreamBuffer.destroySoon();
//     },

//     'chunks equal original value': function(data) {
//       assert.equal(data, fixtures.unicodeString + fixtures.unicodeString);
//     }
//   },

//   'Incoming data larger than chunk size (Issue #5)': {
//     topic: function() {
//       var that = this;

//       var aStreamBuffer = new streamBuffer.ReadableStreamBuffer({
//         chunkSize: 5,
//         initialSize: 10
//       });
//       aStreamBuffer.pause();
//       aStreamBuffer.put('HelloWorld');
//       var chunks = [];
//       aStreamBuffer.setEncoding('utf8');
//       aStreamBuffer.resume();
//       aStreamBuffer.on('data', function(data) {
//         chunks.push(data);
//         if(chunks.length == 2) that.callback(null, chunks);
//       });
//       aStreamBuffer.destroySoon();
//     },
//     'is chunked correctly': function(data) {
//       assert.equal(data[0], 'Hello');
//       assert.equal(data[1], 'World');
//     }
//   },

//   'Frequency 0': {
//     topic: function() {
//       var aStreamBuffer = new streamBuffer.ReadableStreamBuffer({
//         chunkSize: 1,
//         frequency: 0
//       });
//       aStreamBuffer.setEncoding('utf8');
//       return aStreamBuffer;
//     },
//     'emits data immediately': function(streamBuffer) {
//       var dataCalled = false;
//       streamBuffer.once('data', function() {
//         dataCalled = true;
//       });

//       streamBuffer.put('a');
//       assert.isTrue(dataCalled);
//     },
//     'emits multiple chunks immediately': function(streamBuffer) {
//       var chunks = [];
//       var dataHandler = function(chunk) {
//         chunks.push(chunk);
//       };
//       streamBuffer.on('data', dataHandler);

//       streamBuffer.put('ab');
//       streamBuffer.removeListener('data', dataHandler);
//       assert.deepEqual(chunks, ['a', 'b']);
//     },
//     'emits end event immediately on destroySoon': function(streamBuffer) {
//       var endCalled = false;
//       var closeCalled = false;

//       streamBuffer.on('end', function() {
//         endCalled = true;
//       });

//       streamBuffer.on('close', function() {
//         closeCalled = true;
//       });

//       streamBuffer.destroySoon();
//       assert.isTrue(endCalled);
//       assert.isTrue(closeCalled);
//     },
//     teardown: function(streamBuffer) {
//       streamBuffer.destroy();
//     }
//   }
// }).addBatch({
//   'Readable event':{
//     topic:function(){
//       var that = this;

//       var aStreamBuffer = new streamBuffer.ReadableStreamBuffer();

//       aStreamBuffer.on('readable', function(){
//         var data = aStreamBuffer.read();
//         that.callback(null,data);
//       });

//       aStreamBuffer.setEncoding('utf8');
//       aStreamBuffer.put(fixtures.unicodeString);  
//       aStreamBuffer.destroySoon();
//     },

//     'Pumping out data through *aStreamBuffer.read()*':function(data){
//       assert.equal(data,fixtures.unicodeString);
//     }
//   } 
// }).export(module);
});