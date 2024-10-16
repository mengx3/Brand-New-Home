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
            (c = b[d]),
            (c.enumerable = c.enumerable || !1),
            (c.configurable = !0),
            "value" in c && (c.writable = !0),
            Object.defineProperty(a, c.key, c);
    }

    function e(a, b, c) {
        return b && d(a.prototype, b), c && d(a, c), a;
    }

    function f(a, b) {
        if ("function" != typeof b && null !== b)
            throw new TypeError("Super expression must either be null or a function");
        a.prototype = Object.create(b && b.prototype, {
            constructor: { value: a, writable: !0, configurable: !0 }
        }),
        b && h(a, b);
    }

    function g(a) {
        return (g = Object.setPrototypeOf
            ? Object.getPrototypeOf
            : function (a) {
                  return a.__proto__ || Object.getPrototypeOf(a);
              }),
        g(a);
    }

    function h(a, b) {
        return (h = Object.setPrototypeOf ||
            function (a, b) {
                return (a.__proto__ = b), a;
            }),
        h(a, b);
    }

    function i(a) {
        if (void 0 === a)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return a;
    }

    function j(a, b) {
        return b && ("object" == typeof b || "function" == typeof b) ? b : i(a);
    }

    function k(a) {
        var b = F.get(a);
        return console.assert(null != b, "'this' is expected an Event object, but got", a), b;
    }

    function l(a) {
        return null == a.passiveListener
            ? void (!a.event.cancelable || ((a.canceled = !0), "function" == typeof a.event.preventDefault && a.event.preventDefault()))
            : void ("undefined" != typeof console && "function" == typeof console.error && console.error("Unable to preventDefault inside passive event listener invocation.", a.passiveListener));
    }

