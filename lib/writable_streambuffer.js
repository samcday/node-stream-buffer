'use strict';

var util = require('util');
var stream = require('stream');
var constants = require('./constants');

var WritableStreamBuffer = module.exports = function(opts) {
  var that = this;

  stream.Writable.call(this, opts);

  opts = opts || {};
  var initialSize = opts.initialSize || constants.DEFAULT_INITIAL_SIZE;
  var incrementAmount = opts.incrementAmount || constants.DEFAULT_INCREMENT_AMOUNT;

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

  this._write = function(chunk, encoding, callback) {
    if(Buffer.isBuffer(chunk)) {
      increaseBufferIfNecessary(chunk.length);
      chunk.copy(buffer, size, 0);
      size += chunk.length;
    }
    else {
      chunk = chunk + '';
      increaseBufferIfNecessary(Buffer.byteLength(chunk));
      buffer.write(chunk, size, encoding || 'utf8');
      size += Buffer.byteLength(chunk);
    }

    if(typeof callback === 'function') {
      callback();
    }
  };
};

util.inherits(WritableStreamBuffer, stream.Writable);
