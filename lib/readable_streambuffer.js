'use strict';

var stream = require('stream');
var constants = require('./constants');
var util = require('util');

var ReadableStreamBuffer = module.exports = function(opts) {
  var that = this;
  opts = opts || {};

  stream.Readable.call(this, opts);

  this.stopped = false;
  this.err = false;

  var frequency = opts.hasOwnProperty('frequency') ? opts.frequency : constants.DEFAULT_FREQUENCY;
  validateInteger(frequency, 'frequency');
  var chunkSize = opts.chunkSize || constants.DEFAULT_CHUNK_SIZE;
  validateInteger(chunkSize, 'chunkSize');
  var initialSize = opts.initialSize || constants.DEFAULT_INITIAL_SIZE;
  validateInteger(initialSize, 'initialSize');
  var incrementAmount = opts.incrementAmount || constants.DEFAULT_INCREMENT_AMOUNT;
  validateInteger(incrementAmount, 'incrementAmount');

  var size = 0;
  var buffer = new Buffer(initialSize);

  var sendData = function() {
    var amount = Math.min(chunkSize, size);
    var sendMore = false;

    if (amount > 0) {
      var chunk = new Buffer(amount);
      buffer.copy(chunk, 0, 0, amount);

      sendMore = that.push(chunk) !== false;

      buffer.copy(buffer, 0, amount, size);
      size -= amount;
    }

    if(size === 0 && that.stopped) {
      that.push(null);
    }

    if (sendMore) {
      sendData.timeout = setTimeout(sendData, frequency);
    }
    else {
      sendData.timeout = null;
    }

    if (that.err) {
      that.push([]);
    }
  };

  this.stop = function() {
    if (this.stopped) {
      throw new Error('stop() called on already stopped ReadableStreamBuffer');
    }
    this.stopped = true;

    if (size === 0) {
      this.push(null);
    }
  };

  this.error = function() {
    if (this.stopped) {
      throw new Error('error(err) called on already stopped ReadableStreamBuffer');
    }
    this.stopped = true;
    this.err = true;
  };

  this.size = function() {
    return size;
  };

  this.maxSize = function() {
    return buffer.length;
  };

  var increaseBufferIfNecessary = function(incomingDataSize) {
    if((buffer.length - size) < incomingDataSize) {
      var factor = Math.ceil((incomingDataSize - (buffer.length - size)) / incrementAmount);

      var newBuffer = new Buffer(buffer.length + (incrementAmount * factor));
      buffer.copy(newBuffer, 0, 0, size);
      buffer = newBuffer;
    }
  };

  this.put = function(data, encoding) {
    if (that.stopped) {
      throw new Error('Tried to write data to a stopped ReadableStreamBuffer');
    }

    if(Buffer.isBuffer(data)) {
      increaseBufferIfNecessary(data.length);
      data.copy(buffer, size, 0);
      size += data.length;
    }
    else {
      data = data + '';
      var dataSizeInBytes = Buffer.byteLength(data);
      increaseBufferIfNecessary(dataSizeInBytes);
      buffer.write(data, size, encoding || 'utf8');
      size += dataSizeInBytes;
    }
  };

  this._read = function() {
    if (!sendData.timeout) {
      sendData.timeout = setTimeout(sendData, frequency);
    }
  };

  function validateInteger(value, option) {
    if (!Number.isInteger(value)) {
      throw new TypeError('option \'' + option + '\' should be of type Integer');
    }
  }
};

util.inherits(ReadableStreamBuffer, stream.Readable);
