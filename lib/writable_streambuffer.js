'use strict';

var util = require('util');
var stream = require('stream');
var constants = require('./constants');

var WritableStreamBuffer = module.exports = function(opts) {
  opts = opts || {};
  opts.decodeStrings = true;

  stream.Writable.call(this, opts);

  var initialSize = opts.initialSize || constants.DEFAULT_INITIAL_SIZE;
  var incrementAmount = opts.incrementAmount || constants.DEFAULT_INCREMENT_AMOUNT;
  var limit = opts.limit || constants.DEFAULT_LIMIT;

  var buffer = new Buffer(initialSize);
  var size = 0;

  this.size = function() {
    return size;
  };

  this.maxSize = function() {
    return buffer.length;
  };

  this.getContents = function(length) {
    if(!size) return false;

    var data = new Buffer(Math.min(length || size, size));
    buffer.copy(data, 0, 0, data.length);

    if(data.length < size)
      buffer.copy(buffer, 0, data.length);

    size -= data.length;

    return data;
  };

  this.getContentsAsString = function(encoding, length) {
    if(!size) return false;

    var data = buffer.toString(encoding || 'utf8', 0, Math.min(length || size, size));
    var dataLength = Buffer.byteLength(data);

    if(dataLength < size)
      buffer.copy(buffer, 0, dataLength);

    size -= dataLength;
    return data;
  };

  var increaseBufferIfNecessary = function(incomingDataSize) {
    if((buffer.length - size) < incomingDataSize) {
      var factor = Math.ceil((incomingDataSize - (buffer.length - size)) / incrementAmount);

      var newBuffer = new Buffer(buffer.length + (incrementAmount * factor));
      buffer.copy(newBuffer, 0, 0, size);
      buffer = newBuffer;
    }
  };

  function allowedToWriteSize(chunkSize) {
    return Math.min(chunkSize, limit - size);
  }

  this._write = function(chunk, encoding, callback) {
    var sizeToWrite = allowedToWriteSize(chunk.length);
    increaseBufferIfNecessary(sizeToWrite);
    chunk.copy(buffer, size, 0, sizeToWrite);
    size += sizeToWrite;
    if (sizeToWrite < chunk.length) {
      callback(new Error('Stream overflows the limit'));
    } else {
      callback();
    }
  };
};

util.inherits(WritableStreamBuffer, stream.Writable);
