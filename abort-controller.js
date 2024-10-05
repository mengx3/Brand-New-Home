'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var eventTargetShim = require('event-target-shim');

class AbortSignal extends eventTargetShim.EventTarget {
    /**
     * AbortSignal cannot be constructed directly.
     */
