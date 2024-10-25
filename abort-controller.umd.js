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

    function m(a, b) {
        F.set(this, {
            eventTarget: a,
            event: b,
            eventPhase: 2,
            currentTarget: a,
            canceled: !1,
            stopped: !1,
            immediateStopped: !1,
            passiveListener: null,
            timeStamp: b.timeStamp || Date.now()
        }),
Object.defineProperty(this, "isTrusted", { value: !1, enumerable: !0 });
        for (var c, d = Object.keys(b), e = 0; e < d.length; ++e)
            (c = d[e]), c in this || Object.defineProperty(this, c, n(c));
    }

    function n(a) {
        return {
            get: function () {
                return k(this).event[a];
            },
            set: function (b) {
                k(this).event[a] = b;
            },
            configurable: !0,
            enumerable: !0
        };
    }

    function o(a) {
        return {
            value: function () {
                var b = k(this).event;
                return b[a].apply(b, arguments);
            },
            configurable: !0,
            enumerable: !0
        };
    }

    function p(a, b) {
        function c(b, c) {
            a.call(this, b, c);
        }

        var d = Object.keys(b);
        if (0 === d.length) return a;
        c.prototype = Object.create(a.prototype, {
            constructor: { value: c, configurable: !0, writable: !0 }
        });
        for (var e, f = 0; f < d.length; ++f)
            if (((e = d[f]), !(e in a.prototype))) {
                var g = Object.getOwnPropertyDescriptor(b, e),
                    h = "function" == typeof g.value;
                Object.defineProperty(c.prototype, e, h ? o(e) : n(e));
            }
        return c;
    }

 function q(a) {
        if (null == a || a === Object.prototype) return m;
        var b = G.get(a);
        return null == b && ((b = p(q(Object.getPrototypeOf(a)), a)), G.set(a, b)), b;
    }

    function r(a, b) {
        var c = q(Object.getPrototypeOf(b));
        return new c(a, b);
    }

    function s(a) {
        return k(a).immediateStopped;
    }

    function t(a, b) {
        k(a).eventPhase = b;
    }

    function u(a, b) {
        k(a).currentTarget = b;
    }

    function v(a, b) {
        k(a).passiveListener = b;
    }

    function w(a) {
        return null !== a && "object" === b(a);
    }

    function x(a) {
        var b = H.get(a);
        if (null == b) throw new TypeError("'this' is expected an EventTarget object, but got another value.");
        return b;
    }

    function y(a) {
        return {
            get: function () {
                for (var b = x(this), c = b.get(a); null != c; ) {
                    if (3 === c.listenerType) return c.listener;
                    c = c.next;
                }
                return null;
            },
            set: function (b) {
                "function" == typeof b || w(b) || (b = null);
                for (var c = x(this), d = null, e = c.get(a); null != e; ) 3 === e.listenerType ? (null === d ? (null === e.next ? c.delete(a) : c.set(a, e.next)) : (d.next = e.next)) : (d = e), (e = e.next);
                if (null !== b) {
                    var f = { listener: b, listenerType: 3, passive: !1, once: !1, next: null };
                    null === d ? c.set(a, f) : (d.next = f);
                }
            },
            configurable: !0,
            enumerable: !0
        };
    }

    function z(a, b) {
        Object.defineProperty(a, "on".concat(b), y(b));
    }

    function A(a) {
        function b() {
            B.call(this);
        }

        b.prototype = Object.create(B.prototype, { constructor: { value: b, configurable: !0, writable: !0 } });
        for (var c = 0; c < a.length; ++c) z(b.prototype, a[c]);
        return b;
    }

    function B() {
        if (this instanceof B) return void H.set(this, new Map());
        if (1 === arguments.length && Array.isArray(arguments[0])) return A(arguments[0]);
        if (0 < arguments.length) {
            for (var a = Array(arguments.length), b = 0; b < arguments.length; ++b) a[b] = arguments[b];
            return A(a);
        }
        throw new TypeError("Cannot call a class as a function");
    }

    function C() {
        var a = Object.create(K.prototype);
        return B.call(a), L.set(a, !1), a;
    }

   function D(a) {
        !1 !== L.get(a) || (L.set(a, !0), a.dispatchEvent({ type: "abort" }));
    }

    function E(a) {
        var c = N.get(a);
        if (null == c) throw new TypeError("Expected 'this' to be an 'AbortController' object, but got ".concat(null === a ? "null" : b(a)));
        return c;
    }

    var F = new WeakMap(),
        G = new WeakMap();
    
    m.prototype = {
        get type() {
                return k(this).event.type;
        },
        get target() {
            return k(this).eventTarget;
        },
        get currentTarget() {
            return k(this).currentTarget;
        },
        composedPath: function () {
            var a = k(this).currentTarget;
            return null == a ? [] : [a];
        },
        get NONE() {
            return 0;
        },
        get CAPTURING_PHASE() {
            return 1;
        },
        get AT_TARGET() {
            return 2;
        },
        get BUBBLING_PHASE() {
            return 3;
        },
        get eventPhase() {
            return k(this).eventPhase;
        },
        stopPropagation: function () {
            var a = k(this);
            (a.stopped = !0), "function" == typeof a.event.stopPropagation && a.event.stopPropagation();
        },
        stopImmediatePropagation: function () {
            var a = k(this);
            (a.stopped = !0), (a.immediateStopped = !0), "function" == typeof a.event.stopImmediatePropagation && a.event.stopImmediatePropagation();
        },
        get bubbles() {
            return !!k(this).event.bubbles;
        },
        get cancelable() {
            return !!k(this).event.cancelable;
        },
        preventDefault: function () {
            l(k(this));
        },
        get defaultPrevented() {
            return k(this).canceled;
        },
        get composed() {
            return !!k(this).event.composed;
        },
        get timeStamp() {
            return k(this).timeStamp;
        },
        get srcElement() {
            return k(this).eventTarget;
        },
        get cancelBubble() {
            return k(this).stopped;
        },
        set cancelBubble(a) {
            if (a) {
                var b = k(this);
                (b.stopped = !0), "boolean" == typeof b.event.cancelBubble && (b.event.cancelBubble = !0);
            }
        },
        get returnValue() {
            return !k(this).canceled;
        },
        set returnValue(a) {
            a || l(k(this));
        },
        initEvent: function () {}
    },
    Object.defineProperty(m.prototype, "constructor", { value: m, configurable: !0, writable: !0 }),
