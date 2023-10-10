'use strict';

//export * from "./constants.js";

import { constants } from "./constants.js";
export const DEFAULT_INITIAL_SIZE = constants.DEFAULT_INITIAL_SIZE;
export const DEFAULT_INCREMENT_AMOUNT = constants.DEFAULT_INCREMENT_AMOUNT;
export const DEFAULT_FREQUENCY = constants.DEFAULT_FREQUENCY;
export const DEFAULT_CHUNK_SIZE = constants.DEFAULT_CHUNK_SIZE;


export { default as ReadableStreamBuffer } from "./readable_streambuffer.js";
export { default as WritableStreamBuffer } from "./writable_streambuffer.js";
