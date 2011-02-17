var vows = require("vows"),
	assert = require("assert"),
	streamBuffer = require("../lib/streambuffer.js"),
	fixtures = require("./fixtures"),
	helpers = require("./helpers");

vows.describe("WritableStreamBuffer").addBatch({
	"A simple WritableStreamBuffer": {
		topic: function() {
			return new streamBuffer.WritableStreamBuffer();
		},
		
		"is writable": function(aStreamBuffer) {
			assert.isTrue(aStreamBuffer.writable);
		}
	},

	"Writing a simple string": {
		topic: function() {
			var aStreamBuffer = new streamBuffer.WritableStreamBuffer();
			aStreamBuffer.write(fixtures.simpleString);
			return aStreamBuffer;
		},

		"backing buffer should be correct length": function(aStreamBuffer) {
			assert.equal(aStreamBuffer.size(), fixtures.simpleString.length);
		},
		
		"max size should be default size": function(aStreamBuffer) {
			assert.equal(aStreamBuffer.maxSize(), fixtures.streamBuffer.DEFAULT_INITIAL_SIZE);
		},
		
		"contents should be correct": function(aStreamBuffer) {
			assert.equal(aStreamBuffer.getContentsAsString(), fixtures.simpleString);
		}
	},

	"When writing a large binary blob": {
		topic: function() {
			var aStreamBuffer = new streamBuffer.WritableStreamBuffer();
			aStreamBuffer.write(fixtures.largeBinaryData);
			return aStreamBuffer;
		},
		
		"backing buffer should be correct size": function(aStreamBuffer) {
			assert.equal(aStreamBuffer.size(), fixtures.largeBinaryData.length)
		},
		
		"backing buffer size should have incremented": function(aStreamBuffer) {
			assert.equal(aStreamBuffer.maxSize(), streamBuffer.DEFAULT_INITIAL_SIZE + streamBuffer.DEFAULT_INCREMENT_AMOUNT);
		},
		
		"contents match": function(aStreamBuffer) {
			helpers.assertBuffersEqual(aStreamBuffer.getContents(), fixtures.largeBinaryData);
		}
	},

	"StreamBuffer with a different initial size and increment amount": {
		topic: function() {
			var aStreamBuffer = new streamBuffer.WritableStreamBuffer({
				initialSize: 62,
				incrementAmount: 321
			});
			aStreamBuffer.write(fixtures.largeBinaryData);
			return aStreamBuffer;
		},
		
		"has the correct initial size": function(aStreamBuffer) {
			assert.equal(aStreamBuffer.maxSize(), 123);
		},
		
		"after data is written": {
			topic: function(aStreamBuffer) {
				aStreamBuffer.write(binaryData);
				return aStreamBuffer;
			},
			
			"has correct initial size + custom increment amount": function(aStreamBuffer) {
				assert.equal(aStreamBuffer.maxSize(), 321 + 62);
			}
		}
	},
	
	"When stream is written in two chunks": {
		topic: function() {
			var aStreamBuffer = new streamBuffer.WritableStreamBuffer();
			aStreamBuffer.write(fixtures.simpleString);
			aStreamBuffer.write(fixtures.simpleString);
			return aStreamBuffer;
		},
		
		"buffer contents are correct": function(aStreamBuffer) {
			assert.equal(aStreamBuffer.getContentsAsString(), fixtures.simpleString + fixtures.simpleString);
		}
	},
	
	"When stream is end()'ed with final buffer": {
		topic: function() {
			var aStreamBuffer = new streamBuffer.WritableStreamBuffer();
			aStreamBuffer.write(fixtures.simpleString);
			aStreamBuffer.end(fixtures.simpleString);
			return aStreamBuffer;
		},
		
		"buffer contents are correct": function(aStreamBuffer) {
			assert.equal(aStreamBuffer.getContentsAsString(), fixtures.simpleString + fixtures.simpleString);
		},
		
		"writable should be false": function(aStreamBuffer) {
			assert.isFalse(aStreamBuffer.writable);
		}
	},

	"When stream is destroyed": {
		topic: function() {
			var aStreamBuffer = new streamBuffer.WritableStreamBuffer();
			aStreamBuffer.write(fixtures.simpleString);
			aStreamBuffer.end(fixtures.simpleString);
			return aStreamBuffer;
		},
		
		"buffer contents are correct": function(aStreamBuffer) {
			assert.equal(aStreamBuffer.getContentsAsString(), fixtures.simpleString + fixtures.simpleString);
		}
	}
}).export(module);