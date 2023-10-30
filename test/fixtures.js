'use strict';

import * as streamBuffer from '../lib/streambuffer.js';

export var simpleString = 'This is a String!';
export var unicodeString = '\u00bd + \u00bc = \u00be';
export var binaryData = new Buffer(64);
for(var i = 0; i < binaryData.length; i++) {
  binaryData[i] = i;
}

// Binary data larger than initial size of buffers.
export var largeBinaryData = new Buffer(streamBuffer.DEFAULT_INITIAL_SIZE + 1);
for(i = 0; i < largeBinaryData.length; i++) {
  largeBinaryData[i] = i % 256;
}
