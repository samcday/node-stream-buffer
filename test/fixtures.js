var streamBuffer = require("../lib/streambuffer");

var simpleString = "This is a String!";

var binaryData = new Buffer(64);
for(var i = 0; i < binaryData.length; i++) {
	binaryData[i] = i;
}

// Binary data larger than initial size of buffers.
var largeBinaryData = new Buffer(streamBuffer.DEFAULT_INITIAL_SIZE + 1);
for(var i = 0; i < largeBinaryData.length; i++) {
	largeBinaryData[i] = i % 256;
}

module.exports = {
	simpleString: simpleString,
	binaryData: binaryData,
	largeBinaryData: largeBinaryData
};
