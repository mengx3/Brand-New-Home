(function (a, b) {
    "object" == typeof exports && "undefined" != typeof module
        ? b(exports)
        : "function" == typeof define && define.amd
        ? define(["exports"], b)
        : ((a = a || self), b(a.AbortControllerShim = {}));
})(this, function (a) {
    "use strict";

    function b(a) {
        return (b =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                ? function (a) {
                      return typeof a;
                  }
                : function (a) {
                      return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype
                          ? "symbol"
                          : typeof a;
                  }),
        b(a);
    }

    function c(a, b) {
        if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
    }

    function d(a, b) {
        for (var c, d = 0; d < b.length; d++) 
