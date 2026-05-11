import {
  __commonJS,
  __toESM
} from "./chunk-WOR4A3D2.js";

// ../../../../node_modules/highcharts/highcharts.js
var require_highcharts = __commonJS({
  "../../../../node_modules/highcharts/highcharts.js"(exports, module) {
    (function(S, K) {
      "object" === typeof module && module.exports ? module.exports = S.document ? K(S) : K : "function" === typeof define && define.amd ? define(function() {
        return K(S);
      }) : S.Highcharts = K(S);
    })("undefined" !== typeof window ? window : exports, function(S) {
      var K = function() {
        var a = "undefined" === typeof S ? window : S, C = a.document, F = a.navigator && a.navigator.userAgent || "", I = C && C.createElementNS && !!C.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect, n = /(edge|msie|trident)/i.test(F) && !a.opera, f = -1 !== F.indexOf("Firefox"), e = -1 !== F.indexOf("Chrome"), u = f && 4 > parseInt(F.split("Firefox/")[1], 10);
        return a.Highcharts ? a.Highcharts.error(16, true) : {
          product: "Highcharts",
          version: "6.2.0",
          deg2rad: 2 * Math.PI / 360,
          doc: C,
          hasBidiBug: u,
          hasTouch: C && void 0 !== C.documentElement.ontouchstart,
          isMS: n,
          isWebKit: -1 !== F.indexOf("AppleWebKit"),
          isFirefox: f,
          isChrome: e,
          isSafari: !e && -1 !== F.indexOf("Safari"),
          isTouchDevice: /(Mobile|Android|Windows Phone)/.test(F),
          SVG_NS: "http://www.w3.org/2000/svg",
          chartCount: 0,
          seriesTypes: {},
          symbolSizes: {},
          svg: I,
          win: a,
          marginNames: ["plotTop", "marginRight", "marginBottom", "plotLeft"],
          noop: function() {
          },
          charts: []
        };
      }();
      (function(a) {
        a.timers = [];
        var C = a.charts, F = a.doc, I = a.win;
        a.error = function(n, f) {
          n = a.isNumber(n) ? "Highcharts error #" + n + ": www.highcharts.com/errors/" + n : n;
          if (f) throw Error(n);
          I.console && console.log(n);
        };
        a.Fx = function(a2, f, e) {
          this.options = f;
          this.elem = a2;
          this.prop = e;
        };
        a.Fx.prototype = {
          dSetter: function() {
            var a2 = this.paths[0], f = this.paths[1], e = [], u = this.now, x = a2.length, t;
            if (1 === u) e = this.toD;
            else if (x === f.length && 1 > u) for (; x--; ) t = parseFloat(a2[x]), e[x] = isNaN(t) ? f[x] : u * parseFloat(f[x] - t) + t;
            else e = f;
            this.elem.attr("d", e, null, true);
          },
          update: function() {
            var a2 = this.elem, f = this.prop, e = this.now, u = this.options.step;
            if (this[f + "Setter"]) this[f + "Setter"]();
            else a2.attr ? a2.element && a2.attr(f, e, null, true) : a2.style[f] = e + this.unit;
            u && u.call(a2, e, this);
          },
          run: function(n, f, e) {
            var u = this, x = u.options, t = function(a2) {
              return t.stopped ? false : u.step(a2);
            }, w = I.requestAnimationFrame || function(a2) {
              setTimeout(a2, 13);
            }, y = function() {
              for (var c = 0; c < a.timers.length; c++) a.timers[c]() || a.timers.splice(c--, 1);
              a.timers.length && w(y);
            };
            n !== f || this.elem["forceAnimate:" + this.prop] ? (this.startTime = +/* @__PURE__ */ new Date(), this.start = n, this.end = f, this.unit = e, this.now = this.start, this.pos = 0, t.elem = this.elem, t.prop = this.prop, t() && 1 === a.timers.push(t) && w(y)) : (delete x.curAnim[this.prop], x.complete && 0 === a.keys(x.curAnim).length && x.complete.call(this.elem));
          },
          step: function(n) {
            var f = +/* @__PURE__ */ new Date(), e, u = this.options, x = this.elem, t = u.complete, w = u.duration, y = u.curAnim;
            x.attr && !x.element ? n = false : n || f >= w + this.startTime ? (this.now = this.end, this.pos = 1, this.update(), e = y[this.prop] = true, a.objectEach(y, function(a2) {
              true !== a2 && (e = false);
            }), e && t && t.call(x), n = false) : (this.pos = u.easing((f - this.startTime) / w), this.now = this.start + (this.end - this.start) * this.pos, this.update(), n = true);
            return n;
          },
          initPath: function(n, f, e) {
            function u(a2) {
              var b2, k2;
              for (d = a2.length; d--; ) b2 = "M" === a2[d] || "L" === a2[d], k2 = /[a-zA-Z]/.test(a2[d + 3]), b2 && k2 && a2.splice(d + 1, 0, a2[d + 1], a2[d + 2], a2[d + 1], a2[d + 2]);
            }
            function x(a2, h2) {
              for (; a2.length < k; ) {
                a2[0] = h2[k - a2.length];
                var c2 = a2.slice(0, p);
                [].splice.apply(a2, [0, 0].concat(c2));
                b && (c2 = a2.slice(a2.length - p), [].splice.apply(a2, [a2.length, 0].concat(c2)), d--);
              }
              a2[0] = "M";
            }
            function t(a2, d2) {
              for (var c2 = (k - a2.length) / p; 0 < c2 && c2--; ) q = a2.slice().splice(a2.length / v - p, p * v), q[0] = d2[k - p - c2 * p], h && (q[p - 6] = q[p - 2], q[p - 5] = q[p - 1]), [].splice.apply(a2, [a2.length / v, 0].concat(q)), b && c2--;
            }
            f = f || "";
            var w, y = n.startX, c = n.endX, h = -1 < f.indexOf("C"), p = h ? 7 : 3, k, q, d;
            f = f.split(" ");
            e = e.slice();
            var b = n.isArea, v = b ? 2 : 1, J;
            h && (u(f), u(e));
            if (y && c) {
              for (d = 0; d < y.length; d++) if (y[d] === c[0]) {
                w = d;
                break;
              } else if (y[0] === c[c.length - y.length + d]) {
                w = d;
                J = true;
                break;
              }
              void 0 === w && (f = []);
            }
            f.length && a.isNumber(w) && (k = e.length + w * v * p, J ? (x(f, e), t(e, f)) : (x(e, f), t(f, e)));
            return [f, e];
          },
          fillSetter: function() {
            a.Fx.prototype.strokeSetter.apply(this, arguments);
          },
          strokeSetter: function() {
            this.elem.attr(this.prop, a.color(this.start).tweenTo(a.color(this.end), this.pos), null, true);
          }
        };
        a.merge = function() {
          var n, f = arguments, e, u = {}, x = function(e2, n2) {
            "object" !== typeof e2 && (e2 = {});
            a.objectEach(n2, function(y, c) {
              !a.isObject(y, true) || a.isClass(y) || a.isDOMElement(y) ? e2[c] = n2[c] : e2[c] = x(e2[c] || {}, y);
            });
            return e2;
          };
          true === f[0] && (u = f[1], f = Array.prototype.slice.call(f, 2));
          e = f.length;
          for (n = 0; n < e; n++) u = x(u, f[n]);
          return u;
        };
        a.pInt = function(a2, f) {
          return parseInt(a2, f || 10);
        };
        a.isString = function(a2) {
          return "string" === typeof a2;
        };
        a.isArray = function(a2) {
          a2 = Object.prototype.toString.call(a2);
          return "[object Array]" === a2 || "[object Array Iterator]" === a2;
        };
        a.isObject = function(n, f) {
          return !!n && "object" === typeof n && (!f || !a.isArray(n));
        };
        a.isDOMElement = function(n) {
          return a.isObject(n) && "number" === typeof n.nodeType;
        };
        a.isClass = function(n) {
          var f = n && n.constructor;
          return !(!a.isObject(n, true) || a.isDOMElement(n) || !f || !f.name || "Object" === f.name);
        };
        a.isNumber = function(a2) {
          return "number" === typeof a2 && !isNaN(a2) && Infinity > a2 && -Infinity < a2;
        };
        a.erase = function(a2, f) {
          for (var e = a2.length; e--; ) if (a2[e] === f) {
            a2.splice(e, 1);
            break;
          }
        };
        a.defined = function(a2) {
          return void 0 !== a2 && null !== a2;
        };
        a.attr = function(n, f, e) {
          var u;
          a.isString(f) ? a.defined(e) ? n.setAttribute(f, e) : n && n.getAttribute && ((u = n.getAttribute(f)) || "class" !== f || (u = n.getAttribute(f + "Name"))) : a.defined(f) && a.isObject(f) && a.objectEach(f, function(a2, e2) {
            n.setAttribute(e2, a2);
          });
          return u;
        };
        a.splat = function(n) {
          return a.isArray(n) ? n : [n];
        };
        a.syncTimeout = function(a2, f, e) {
          if (f) return setTimeout(a2, f, e);
          a2.call(0, e);
        };
        a.clearTimeout = function(n) {
          a.defined(n) && clearTimeout(n);
        };
        a.extend = function(a2, f) {
          var e;
          a2 || (a2 = {});
          for (e in f) a2[e] = f[e];
          return a2;
        };
        a.pick = function() {
          var a2 = arguments, f, e, u = a2.length;
          for (f = 0; f < u; f++) if (e = a2[f], void 0 !== e && null !== e) return e;
        };
        a.css = function(n, f) {
          a.isMS && !a.svg && f && void 0 !== f.opacity && (f.filter = "alpha(opacity=" + 100 * f.opacity + ")");
          a.extend(n.style, f);
        };
        a.createElement = function(n, f, e, u, x) {
          n = F.createElement(n);
          var t = a.css;
          f && a.extend(n, f);
          x && t(n, {
            padding: 0,
            border: "none",
            margin: 0
          });
          e && t(n, e);
          u && u.appendChild(n);
          return n;
        };
        a.extendClass = function(n, f) {
          var e = function() {
          };
          e.prototype = new n();
          a.extend(e.prototype, f);
          return e;
        };
        a.pad = function(a2, f, e) {
          return Array((f || 2) + 1 - String(a2).replace("-", "").length).join(e || 0) + a2;
        };
        a.relativeLength = function(a2, f, e) {
          return /%$/.test(a2) ? f * parseFloat(a2) / 100 + (e || 0) : parseFloat(a2);
        };
        a.wrap = function(a2, f, e) {
          var n = a2[f];
          a2[f] = function() {
            var a3 = Array.prototype.slice.call(arguments), t = arguments, w = this;
            w.proceed = function() {
              n.apply(w, arguments.length ? arguments : t);
            };
            a3.unshift(n);
            a3 = e.apply(this, a3);
            w.proceed = null;
            return a3;
          };
        };
        a.datePropsToTimestamps = function(n) {
          a.objectEach(n, function(f, e) {
            a.isObject(f) && "function" === typeof f.getTime ? n[e] = f.getTime() : (a.isObject(f) || a.isArray(f)) && a.datePropsToTimestamps(f);
          });
        };
        a.formatSingle = function(n, f, e) {
          var u = /\.([0-9])/, x = a.defaultOptions.lang;
          /f$/.test(n) ? (e = (e = n.match(u)) ? e[1] : -1, null !== f && (f = a.numberFormat(f, e, x.decimalPoint, -1 < n.indexOf(",") ? x.thousandsSep : ""))) : f = (e || a.time).dateFormat(n, f);
          return f;
        };
        a.format = function(n, f, e) {
          for (var u = "{", x = false, t, w, y, c, h = [], p; n; ) {
            u = n.indexOf(u);
            if (-1 === u) break;
            t = n.slice(0, u);
            if (x) {
              t = t.split(":");
              w = t.shift().split(".");
              c = w.length;
              p = f;
              for (y = 0; y < c; y++) p && (p = p[w[y]]);
              t.length && (p = a.formatSingle(t.join(":"), p, e));
              h.push(p);
            } else h.push(t);
            n = n.slice(u + 1);
            u = (x = !x) ? "}" : "{";
          }
          h.push(n);
          return h.join("");
        };
        a.getMagnitude = function(a2) {
          return Math.pow(10, Math.floor(Math.log(a2) / Math.LN10));
        };
        a.normalizeTickInterval = function(n, f, e, u, x) {
          var t, w = n;
          e = a.pick(e, 1);
          t = n / e;
          f || (f = x ? [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] : [1, 2, 2.5, 5, 10], false === u && (1 === e ? f = a.grep(f, function(a2) {
            return 0 === a2 % 1;
          }) : 0.1 >= e && (f = [1 / e])));
          for (u = 0; u < f.length && !(w = f[u], x && w * e >= n || !x && t <= (f[u] + (f[u + 1] || f[u])) / 2); u++) ;
          return w = a.correctFloat(w * e, -Math.round(Math.log(1e-3) / Math.LN10));
        };
        a.stableSort = function(a2, f) {
          var e = a2.length, n, x;
          for (x = 0; x < e; x++) a2[x].safeI = x;
          a2.sort(function(a3, e2) {
            n = f(a3, e2);
            return 0 === n ? a3.safeI - e2.safeI : n;
          });
          for (x = 0; x < e; x++) delete a2[x].safeI;
        };
        a.arrayMin = function(a2) {
          for (var f = a2.length, e = a2[0]; f--; ) a2[f] < e && (e = a2[f]);
          return e;
        };
        a.arrayMax = function(a2) {
          for (var f = a2.length, e = a2[0]; f--; ) a2[f] > e && (e = a2[f]);
          return e;
        };
        a.destroyObjectProperties = function(n, f) {
          a.objectEach(n, function(a2, u) {
            a2 && a2 !== f && a2.destroy && a2.destroy();
            delete n[u];
          });
        };
        a.discardElement = function(n) {
          var f = a.garbageBin;
          f || (f = a.createElement("div"));
          n && f.appendChild(n);
          f.innerHTML = "";
        };
        a.correctFloat = function(a2, f) {
          return parseFloat(a2.toPrecision(f || 14));
        };
        a.setAnimation = function(n, f) {
          f.renderer.globalAnimation = a.pick(n, f.options.chart.animation, true);
        };
        a.animObject = function(n) {
          return a.isObject(n) ? a.merge(n) : {
            duration: n ? 500 : 0
          };
        };
        a.timeUnits = {
          millisecond: 1,
          second: 1e3,
          minute: 6e4,
          hour: 36e5,
          day: 864e5,
          week: 6048e5,
          month: 24192e5,
          year: 314496e5
        };
        a.numberFormat = function(n, f, e, u) {
          n = +n || 0;
          f = +f;
          var x = a.defaultOptions.lang, t = (n.toString().split(".")[1] || "").split("e")[0].length, w, y, c = n.toString().split("e");
          -1 === f ? f = Math.min(t, 20) : a.isNumber(f) ? f && c[1] && 0 > c[1] && (w = f + +c[1], 0 <= w ? (c[0] = (+c[0]).toExponential(w).split("e")[0], f = w) : (c[0] = c[0].split(".")[0] || 0, n = 20 > f ? (c[0] * Math.pow(10, c[1])).toFixed(f) : 0, c[1] = 0)) : f = 2;
          y = (Math.abs(c[1] ? c[0] : n) + Math.pow(10, -Math.max(f, t) - 1)).toFixed(f);
          t = String(a.pInt(y));
          w = 3 < t.length ? t.length % 3 : 0;
          e = a.pick(e, x.decimalPoint);
          u = a.pick(u, x.thousandsSep);
          n = (0 > n ? "-" : "") + (w ? t.substr(0, w) + u : "");
          n += t.substr(w).replace(/(\d{3})(?=\d)/g, "$1" + u);
          f && (n += e + y.slice(-f));
          c[1] && 0 !== +n && (n += "e" + c[1]);
          return n;
        };
        Math.easeInOutSine = function(a2) {
          return -0.5 * (Math.cos(Math.PI * a2) - 1);
        };
        a.getStyle = function(n, f, e) {
          if ("width" === f) return Math.max(0, Math.min(n.offsetWidth, n.scrollWidth) - a.getStyle(n, "padding-left") - a.getStyle(n, "padding-right"));
          if ("height" === f) return Math.max(0, Math.min(n.offsetHeight, n.scrollHeight) - a.getStyle(n, "padding-top") - a.getStyle(n, "padding-bottom"));
          I.getComputedStyle || a.error(27, true);
          if (n = I.getComputedStyle(n, void 0)) n = n.getPropertyValue(f), a.pick(e, "opacity" !== f) && (n = a.pInt(n));
          return n;
        };
        a.inArray = function(n, f, e) {
          return (a.indexOfPolyfill || Array.prototype.indexOf).call(f, n, e);
        };
        a.grep = function(n, f) {
          return (a.filterPolyfill || Array.prototype.filter).call(n, f);
        };
        a.find = Array.prototype.find ? function(a2, f) {
          return a2.find(f);
        } : function(a2, f) {
          var e, u = a2.length;
          for (e = 0; e < u; e++) if (f(a2[e], e)) return a2[e];
        };
        a.some = function(n, f, e) {
          return (a.somePolyfill || Array.prototype.some).call(n, f, e);
        };
        a.map = function(a2, f) {
          for (var e = [], u = 0, x = a2.length; u < x; u++) e[u] = f.call(a2[u], a2[u], u, a2);
          return e;
        };
        a.keys = function(n) {
          return (a.keysPolyfill || Object.keys).call(void 0, n);
        };
        a.reduce = function(n, f, e) {
          return (a.reducePolyfill || Array.prototype.reduce).apply(n, 2 < arguments.length ? [f, e] : [f]);
        };
        a.offset = function(a2) {
          var f = F.documentElement;
          a2 = a2.parentElement || a2.parentNode ? a2.getBoundingClientRect() : {
            top: 0,
            left: 0
          };
          return {
            top: a2.top + (I.pageYOffset || f.scrollTop) - (f.clientTop || 0),
            left: a2.left + (I.pageXOffset || f.scrollLeft) - (f.clientLeft || 0)
          };
        };
        a.stop = function(n, f) {
          for (var e = a.timers.length; e--; ) a.timers[e].elem !== n || f && f !== a.timers[e].prop || (a.timers[e].stopped = true);
        };
        a.each = function(n, f, e) {
          return (a.forEachPolyfill || Array.prototype.forEach).call(n, f, e);
        };
        a.objectEach = function(a2, f, e) {
          for (var u in a2) a2.hasOwnProperty(u) && f.call(e || a2[u], a2[u], u, a2);
        };
        a.addEvent = function(n, f, e, u) {
          var x, t = n.addEventListener || a.addEventListenerPolyfill;
          x = "function" === typeof n && n.prototype ? n.prototype.protoEvents = n.prototype.protoEvents || {} : n.hcEvents = n.hcEvents || {};
          a.Point && n instanceof a.Point && n.series && n.series.chart && (n.series.chart.runTrackerClick = true);
          t && t.call(n, f, e, false);
          x[f] || (x[f] = []);
          x[f].push(e);
          u && a.isNumber(u.order) && (e.order = u.order, x[f].sort(function(a2, e2) {
            return a2.order - e2.order;
          }));
          return function() {
            a.removeEvent(n, f, e);
          };
        };
        a.removeEvent = function(n, f, e) {
          function u(e2, c) {
            var h = n.removeEventListener || a.removeEventListenerPolyfill;
            h && h.call(n, e2, c, false);
          }
          function x(e2) {
            var c, h;
            n.nodeName && (f ? (c = {}, c[f] = true) : c = e2, a.objectEach(c, function(a2, k) {
              if (e2[k]) for (h = e2[k].length; h--; ) u(k, e2[k][h]);
            }));
          }
          var t, w;
          a.each(["protoEvents", "hcEvents"], function(y) {
            var c = n[y];
            c && (f ? (t = c[f] || [], e ? (w = a.inArray(e, t), -1 < w && (t.splice(w, 1), c[f] = t), u(f, e)) : (x(c), c[f] = [])) : (x(c), n[y] = {}));
          });
        };
        a.fireEvent = function(n, f, e, u) {
          var x, t, w, y, c;
          e = e || {};
          F.createEvent && (n.dispatchEvent || n.fireEvent) ? (x = F.createEvent("Events"), x.initEvent(f, true, true), a.extend(x, e), n.dispatchEvent ? n.dispatchEvent(x) : n.fireEvent(f, x)) : a.each(["protoEvents", "hcEvents"], function(h) {
            if (n[h]) for (t = n[h][f] || [], w = t.length, e.target || a.extend(e, {
              preventDefault: function() {
                e.defaultPrevented = true;
              },
              target: n,
              type: f
            }), y = 0; y < w; y++) (c = t[y]) && false === c.call(n, e) && e.preventDefault();
          });
          u && !e.defaultPrevented && u.call(n, e);
        };
        a.animate = function(n, f, e) {
          var u, x = "", t, w, y;
          a.isObject(e) || (y = arguments, e = {
            duration: y[2],
            easing: y[3],
            complete: y[4]
          });
          a.isNumber(e.duration) || (e.duration = 400);
          e.easing = "function" === typeof e.easing ? e.easing : Math[e.easing] || Math.easeInOutSine;
          e.curAnim = a.merge(f);
          a.objectEach(f, function(c, h) {
            a.stop(n, h);
            w = new a.Fx(n, e, h);
            t = null;
            "d" === h ? (w.paths = w.initPath(n, n.d, f.d), w.toD = f.d, u = 0, t = 1) : n.attr ? u = n.attr(h) : (u = parseFloat(a.getStyle(n, h)) || 0, "opacity" !== h && (x = "px"));
            t || (t = c);
            t && t.match && t.match("px") && (t = t.replace(/px/g, ""));
            w.run(u, t, x);
          });
        };
        a.seriesType = function(n, f, e, u, x) {
          var t = a.getOptions(), w = a.seriesTypes;
          t.plotOptions[n] = a.merge(t.plotOptions[f], e);
          w[n] = a.extendClass(w[f] || function() {
          }, u);
          w[n].prototype.type = n;
          x && (w[n].prototype.pointClass = a.extendClass(a.Point, x));
          return w[n];
        };
        a.uniqueKey = function() {
          var a2 = Math.random().toString(36).substring(2, 9), f = 0;
          return function() {
            return "highcharts-" + a2 + "-" + f++;
          };
        }();
        I.jQuery && (I.jQuery.fn.highcharts = function() {
          var n = [].slice.call(arguments);
          if (this[0]) return n[0] ? (new a[a.isString(n[0]) ? n.shift() : "Chart"](this[0], n[0], n[1]), this) : C[a.attr(this[0], "data-highcharts-chart")];
        });
      })(K);
      (function(a) {
        var C = a.each, F = a.isNumber, I = a.map, n = a.merge, f = a.pInt;
        a.Color = function(e) {
          if (!(this instanceof a.Color)) return new a.Color(e);
          this.init(e);
        };
        a.Color.prototype = {
          parsers: [{
            regex: /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/,
            parse: function(a2) {
              return [f(a2[1]), f(a2[2]), f(a2[3]), parseFloat(a2[4], 10)];
            }
          }, {
            regex: /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/,
            parse: function(a2) {
              return [f(a2[1]), f(a2[2]), f(a2[3]), 1];
            }
          }],
          names: {
            white: "#ffffff",
            black: "#000000"
          },
          init: function(e) {
            var f2, x, t, w;
            if ((this.input = e = this.names[e && e.toLowerCase ? e.toLowerCase() : ""] || e) && e.stops) this.stops = I(e.stops, function(e2) {
              return new a.Color(e2[1]);
            });
            else if (e && e.charAt && "#" === e.charAt() && (f2 = e.length, e = parseInt(e.substr(1), 16), 7 === f2 ? x = [(e & 16711680) >> 16, (e & 65280) >> 8, e & 255, 1] : 4 === f2 && (x = [(e & 3840) >> 4 | (e & 3840) >> 8, (e & 240) >> 4 | e & 240, (e & 15) << 4 | e & 15, 1])), !x) for (t = this.parsers.length; t-- && !x; ) w = this.parsers[t], (f2 = w.regex.exec(e)) && (x = w.parse(f2));
            this.rgba = x || [];
          },
          get: function(a2) {
            var e = this.input, f2 = this.rgba, t;
            this.stops ? (t = n(e), t.stops = [].concat(t.stops), C(this.stops, function(e2, y) {
              t.stops[y] = [t.stops[y][0], e2.get(a2)];
            })) : t = f2 && F(f2[0]) ? "rgb" === a2 || !a2 && 1 === f2[3] ? "rgb(" + f2[0] + "," + f2[1] + "," + f2[2] + ")" : "a" === a2 ? f2[3] : "rgba(" + f2.join(",") + ")" : e;
            return t;
          },
          brighten: function(a2) {
            var e, x = this.rgba;
            if (this.stops) C(this.stops, function(e2) {
              e2.brighten(a2);
            });
            else if (F(a2) && 0 !== a2) for (e = 0; 3 > e; e++) x[e] += f(255 * a2), 0 > x[e] && (x[e] = 0), 255 < x[e] && (x[e] = 255);
            return this;
          },
          setOpacity: function(a2) {
            this.rgba[3] = a2;
            return this;
          },
          tweenTo: function(a2, f2) {
            var e = this.rgba, t = a2.rgba;
            t.length && e && e.length ? (a2 = 1 !== t[3] || 1 !== e[3], f2 = (a2 ? "rgba(" : "rgb(") + Math.round(t[0] + (e[0] - t[0]) * (1 - f2)) + "," + Math.round(t[1] + (e[1] - t[1]) * (1 - f2)) + "," + Math.round(t[2] + (e[2] - t[2]) * (1 - f2)) + (a2 ? "," + (t[3] + (e[3] - t[3]) * (1 - f2)) : "") + ")") : f2 = a2.input || "none";
            return f2;
          }
        };
        a.color = function(e) {
          return new a.Color(e);
        };
      })(K);
      (function(a) {
        var C, F, I = a.addEvent, n = a.animate, f = a.attr, e = a.charts, u = a.color, x = a.css, t = a.createElement, w = a.defined, y = a.deg2rad, c = a.destroyObjectProperties, h = a.doc, p = a.each, k = a.extend, q = a.erase, d = a.grep, b = a.hasTouch, v = a.inArray, J = a.isArray, l = a.isFirefox, L = a.isMS, B = a.isObject, D = a.isString, m = a.isWebKit, G = a.merge, A = a.noop, N = a.objectEach, E = a.pick, g = a.pInt, r = a.removeEvent, M = a.stop, O = a.svg, H = a.SVG_NS, R = a.symbolSizes, Q = a.win;
        C = a.SVGElement = function() {
          return this;
        };
        k(C.prototype, {
          opacity: 1,
          SVG_NS: H,
          textProps: "direction fontSize fontWeight fontFamily fontStyle color lineHeight width textAlign textDecoration textOverflow textOutline cursor".split(" "),
          init: function(a2, g2) {
            this.element = "span" === g2 ? t(g2) : h.createElementNS(this.SVG_NS, g2);
            this.renderer = a2;
          },
          animate: function(z, g2, r2) {
            g2 = a.animObject(E(g2, this.renderer.globalAnimation, true));
            0 !== g2.duration ? (r2 && (g2.complete = r2), n(this, z, g2)) : (this.attr(z, null, r2), g2.step && g2.step.call(this));
            return this;
          },
          complexColor: function(z, g2, r2) {
            var b2 = this.renderer, k2, m2, d2, H2, c2, h2, q2, A2, v2, P, l2, O2 = [], M2;
            a.fireEvent(this.renderer, "complexColor", {
              args: arguments
            }, function() {
              z.radialGradient ? m2 = "radialGradient" : z.linearGradient && (m2 = "linearGradient");
              m2 && (d2 = z[m2], c2 = b2.gradients, q2 = z.stops, P = r2.radialReference, J(d2) && (z[m2] = d2 = {
                x1: d2[0],
                y1: d2[1],
                x2: d2[2],
                y2: d2[3],
                gradientUnits: "userSpaceOnUse"
              }), "radialGradient" === m2 && P && !w(d2.gradientUnits) && (H2 = d2, d2 = G(d2, b2.getRadialAttr(P, H2), {
                gradientUnits: "userSpaceOnUse"
              })), N(d2, function(a2, z2) {
                "id" !== z2 && O2.push(z2, a2);
              }), N(q2, function(a2) {
                O2.push(a2);
              }), O2 = O2.join(","), c2[O2] ? l2 = c2[O2].attr("id") : (d2.id = l2 = a.uniqueKey(), c2[O2] = h2 = b2.createElement(m2).attr(d2).add(b2.defs), h2.radAttr = H2, h2.stops = [], p(q2, function(z2) {
                0 === z2[1].indexOf("rgba") ? (k2 = a.color(z2[1]), A2 = k2.get("rgb"), v2 = k2.get("a")) : (A2 = z2[1], v2 = 1);
                z2 = b2.createElement("stop").attr({
                  offset: z2[0],
                  "stop-color": A2,
                  "stop-opacity": v2
                }).add(h2);
                h2.stops.push(z2);
              })), M2 = "url(" + b2.url + "#" + l2 + ")", r2.setAttribute(g2, M2), r2.gradient = O2, z.toString = function() {
                return M2;
              });
            });
          },
          applyTextOutline: function(z) {
            var g2 = this.element, r2, b2, d2, m2, k2;
            -1 !== z.indexOf("contrast") && (z = z.replace(/contrast/g, this.renderer.getContrast(g2.style.fill)));
            z = z.split(" ");
            b2 = z[z.length - 1];
            if ((d2 = z[0]) && "none" !== d2 && a.svg) {
              this.fakeTS = true;
              z = [].slice.call(g2.getElementsByTagName("tspan"));
              this.ySetter = this.xSetter;
              d2 = d2.replace(/(^[\d\.]+)(.*?)$/g, function(a2, z2, g3) {
                return 2 * z2 + g3;
              });
              for (k2 = z.length; k2--; ) r2 = z[k2], "highcharts-text-outline" === r2.getAttribute("class") && q(z, g2.removeChild(r2));
              m2 = g2.firstChild;
              p(z, function(a2, z2) {
                0 === z2 && (a2.setAttribute("x", g2.getAttribute("x")), z2 = g2.getAttribute("y"), a2.setAttribute("y", z2 || 0), null === z2 && g2.setAttribute("y", 0));
                a2 = a2.cloneNode(1);
                f(a2, {
                  "class": "highcharts-text-outline",
                  fill: b2,
                  stroke: b2,
                  "stroke-width": d2,
                  "stroke-linejoin": "round"
                });
                g2.insertBefore(a2, m2);
              });
            }
          },
          attr: function(a2, g2, r2, b2) {
            var z, d2 = this.element, m2, k2 = this, c2, H2;
            "string" === typeof a2 && void 0 !== g2 && (z = a2, a2 = {}, a2[z] = g2);
            "string" === typeof a2 ? k2 = (this[a2 + "Getter"] || this._defaultGetter).call(this, a2, d2) : (N(a2, function(z2, g3) {
              c2 = false;
              b2 || M(this, g3);
              this.symbolName && /^(x|y|width|height|r|start|end|innerR|anchorX|anchorY)$/.test(g3) && (m2 || (this.symbolAttr(a2), m2 = true), c2 = true);
              !this.rotation || "x" !== g3 && "y" !== g3 || (this.doTransform = true);
              c2 || (H2 = this[g3 + "Setter"] || this._defaultSetter, H2.call(this, z2, g3, d2), this.shadows && /^(width|height|visibility|x|y|d|transform|cx|cy|r)$/.test(g3) && this.updateShadows(g3, z2, H2));
            }, this), this.afterSetters());
            r2 && r2.call(this);
            return k2;
          },
          afterSetters: function() {
            this.doTransform && (this.updateTransform(), this.doTransform = false);
          },
          updateShadows: function(a2, g2, r2) {
            for (var z = this.shadows, d2 = z.length; d2--; ) r2.call(z[d2], "height" === a2 ? Math.max(g2 - (z[d2].cutHeight || 0), 0) : "d" === a2 ? this.d : g2, a2, z[d2]);
          },
          addClass: function(a2, g2) {
            var z = this.attr("class") || "";
            -1 === z.indexOf(a2) && (g2 || (a2 = (z + (z ? " " : "") + a2).replace("  ", " ")), this.attr("class", a2));
            return this;
          },
          hasClass: function(a2) {
            return -1 !== v(a2, (this.attr("class") || "").split(" "));
          },
          removeClass: function(a2) {
            return this.attr("class", (this.attr("class") || "").replace(a2, ""));
          },
          symbolAttr: function(a2) {
            var z = this;
            p("x y r start end width height innerR anchorX anchorY".split(" "), function(g2) {
              z[g2] = E(a2[g2], z[g2]);
            });
            z.attr({
              d: z.renderer.symbols[z.symbolName](z.x, z.y, z.width, z.height, z)
            });
          },
          clip: function(a2) {
            return this.attr("clip-path", a2 ? "url(" + this.renderer.url + "#" + a2.id + ")" : "none");
          },
          crisp: function(a2, g2) {
            var z;
            g2 = g2 || a2.strokeWidth || 0;
            z = Math.round(g2) % 2 / 2;
            a2.x = Math.floor(a2.x || this.x || 0) + z;
            a2.y = Math.floor(a2.y || this.y || 0) + z;
            a2.width = Math.floor((a2.width || this.width || 0) - 2 * z);
            a2.height = Math.floor((a2.height || this.height || 0) - 2 * z);
            w(a2.strokeWidth) && (a2.strokeWidth = g2);
            return a2;
          },
          css: function(a2) {
            var z = this.styles, r2 = {}, d2 = this.element, b2, m2 = "", c2, H2 = !z, h2 = ["textOutline", "textOverflow", "width"];
            a2 && a2.color && (a2.fill = a2.color);
            z && N(a2, function(a3, g2) {
              a3 !== z[g2] && (r2[g2] = a3, H2 = true);
            });
            H2 && (z && (a2 = k(z, r2)), a2 && (null === a2.width || "auto" === a2.width ? delete this.textWidth : "text" === d2.nodeName.toLowerCase() && a2.width && (b2 = this.textWidth = g(a2.width))), this.styles = a2, b2 && !O && this.renderer.forExport && delete a2.width, d2.namespaceURI === this.SVG_NS ? (c2 = function(a3, z2) {
              return "-" + z2.toLowerCase();
            }, N(a2, function(a3, z2) {
              -1 === v(z2, h2) && (m2 += z2.replace(/([A-Z])/g, c2) + ":" + a3 + ";");
            }), m2 && f(d2, "style", m2)) : x(d2, a2), this.added && ("text" === this.element.nodeName && this.renderer.buildText(this), a2 && a2.textOutline && this.applyTextOutline(a2.textOutline)));
            return this;
          },
          strokeWidth: function() {
            return this["stroke-width"] || 0;
          },
          on: function(a2, g2) {
            var z = this, r2 = z.element;
            b && "click" === a2 ? (r2.ontouchstart = function(a3) {
              z.touchEventFired = Date.now();
              a3.preventDefault();
              g2.call(r2, a3);
            }, r2.onclick = function(a3) {
              (-1 === Q.navigator.userAgent.indexOf("Android") || 1100 < Date.now() - (z.touchEventFired || 0)) && g2.call(r2, a3);
            }) : r2["on" + a2] = g2;
            return this;
          },
          setRadialReference: function(a2) {
            var z = this.renderer.gradients[this.element.gradient];
            this.element.radialReference = a2;
            z && z.radAttr && z.animate(this.renderer.getRadialAttr(a2, z.radAttr));
            return this;
          },
          translate: function(a2, g2) {
            return this.attr({
              translateX: a2,
              translateY: g2
            });
          },
          invert: function(a2) {
            this.inverted = a2;
            this.updateTransform();
            return this;
          },
          updateTransform: function() {
            var a2 = this.translateX || 0, g2 = this.translateY || 0, r2 = this.scaleX, d2 = this.scaleY, b2 = this.inverted, m2 = this.rotation, k2 = this.matrix, c2 = this.element;
            b2 && (a2 += this.width, g2 += this.height);
            a2 = ["translate(" + a2 + "," + g2 + ")"];
            w(k2) && a2.push("matrix(" + k2.join(",") + ")");
            b2 ? a2.push("rotate(90) scale(-1,1)") : m2 && a2.push("rotate(" + m2 + " " + E(this.rotationOriginX, c2.getAttribute("x"), 0) + " " + E(this.rotationOriginY, c2.getAttribute("y") || 0) + ")");
            (w(r2) || w(d2)) && a2.push("scale(" + E(r2, 1) + " " + E(d2, 1) + ")");
            a2.length && c2.setAttribute("transform", a2.join(" "));
          },
          toFront: function() {
            var a2 = this.element;
            a2.parentNode.appendChild(a2);
            return this;
          },
          align: function(a2, g2, r2) {
            var z, d2, b2, m2, k2 = {};
            d2 = this.renderer;
            b2 = d2.alignedObjects;
            var c2, H2;
            if (a2) {
              if (this.alignOptions = a2, this.alignByTranslate = g2, !r2 || D(r2)) this.alignTo = z = r2 || "renderer", q(b2, this), b2.push(this), r2 = null;
            } else a2 = this.alignOptions, g2 = this.alignByTranslate, z = this.alignTo;
            r2 = E(r2, d2[z], d2);
            z = a2.align;
            d2 = a2.verticalAlign;
            b2 = (r2.x || 0) + (a2.x || 0);
            m2 = (r2.y || 0) + (a2.y || 0);
            "right" === z ? c2 = 1 : "center" === z && (c2 = 2);
            c2 && (b2 += (r2.width - (a2.width || 0)) / c2);
            k2[g2 ? "translateX" : "x"] = Math.round(b2);
            "bottom" === d2 ? H2 = 1 : "middle" === d2 && (H2 = 2);
            H2 && (m2 += (r2.height - (a2.height || 0)) / H2);
            k2[g2 ? "translateY" : "y"] = Math.round(m2);
            this[this.placed ? "animate" : "attr"](k2);
            this.placed = true;
            this.alignAttr = k2;
            return this;
          },
          getBBox: function(a2, g2) {
            var z, r2 = this.renderer, d2, b2 = this.element, m2 = this.styles, c2, H2 = this.textStr, h2, q2 = r2.cache, A2 = r2.cacheKeys, v2 = b2.namespaceURI === this.SVG_NS, l2;
            g2 = E(g2, this.rotation);
            d2 = g2 * y;
            c2 = m2 && m2.fontSize;
            w(H2) && (l2 = H2.toString(), -1 === l2.indexOf("<") && (l2 = l2.replace(/[0-9]/g, "0")), l2 += ["", g2 || 0, c2, this.textWidth, m2 && m2.textOverflow].join());
            l2 && !a2 && (z = q2[l2]);
            if (!z) {
              if (v2 || r2.forExport) {
                try {
                  (h2 = this.fakeTS && function(a3) {
                    p(b2.querySelectorAll(".highcharts-text-outline"), function(g3) {
                      g3.style.display = a3;
                    });
                  }) && h2("none"), z = b2.getBBox ? k({}, b2.getBBox()) : {
                    width: b2.offsetWidth,
                    height: b2.offsetHeight
                  }, h2 && h2("");
                } catch (X) {
                }
                if (!z || 0 > z.width) z = {
                  width: 0,
                  height: 0
                };
              } else z = this.htmlGetBBox();
              r2.isSVG && (a2 = z.width, r2 = z.height, v2 && (z.height = r2 = {
                "11px,17": 14,
                "13px,20": 16
              }[m2 && m2.fontSize + "," + Math.round(r2)] || r2), g2 && (z.width = Math.abs(r2 * Math.sin(d2)) + Math.abs(a2 * Math.cos(d2)), z.height = Math.abs(r2 * Math.cos(d2)) + Math.abs(a2 * Math.sin(d2))));
              if (l2 && 0 < z.height) {
                for (; 250 < A2.length; ) delete q2[A2.shift()];
                q2[l2] || A2.push(l2);
                q2[l2] = z;
              }
            }
            return z;
          },
          show: function(a2) {
            return this.attr({
              visibility: a2 ? "inherit" : "visible"
            });
          },
          hide: function() {
            return this.attr({
              visibility: "hidden"
            });
          },
          fadeOut: function(a2) {
            var g2 = this;
            g2.animate({
              opacity: 0
            }, {
              duration: a2 || 150,
              complete: function() {
                g2.attr({
                  y: -9999
                });
              }
            });
          },
          add: function(a2) {
            var g2 = this.renderer, z = this.element, r2;
            a2 && (this.parentGroup = a2);
            this.parentInverted = a2 && a2.inverted;
            void 0 !== this.textStr && g2.buildText(this);
            this.added = true;
            if (!a2 || a2.handleZ || this.zIndex) r2 = this.zIndexSetter();
            r2 || (a2 ? a2.element : g2.box).appendChild(z);
            if (this.onAdd) this.onAdd();
            return this;
          },
          safeRemoveChild: function(a2) {
            var g2 = a2.parentNode;
            g2 && g2.removeChild(a2);
          },
          destroy: function() {
            var a2 = this, g2 = a2.element || {}, r2 = a2.renderer.isSVG && "SPAN" === g2.nodeName && a2.parentGroup, d2 = g2.ownerSVGElement, b2 = a2.clipPath;
            g2.onclick = g2.onmouseout = g2.onmouseover = g2.onmousemove = g2.point = null;
            M(a2);
            b2 && d2 && (p(d2.querySelectorAll("[clip-path],[CLIP-PATH]"), function(a3) {
              var g3 = a3.getAttribute("clip-path"), z = b2.element.id;
              (-1 < g3.indexOf("(#" + z + ")") || -1 < g3.indexOf('("#' + z + '")')) && a3.removeAttribute("clip-path");
            }), a2.clipPath = b2.destroy());
            if (a2.stops) {
              for (d2 = 0; d2 < a2.stops.length; d2++) a2.stops[d2] = a2.stops[d2].destroy();
              a2.stops = null;
            }
            a2.safeRemoveChild(g2);
            for (a2.destroyShadows(); r2 && r2.div && 0 === r2.div.childNodes.length; ) g2 = r2.parentGroup, a2.safeRemoveChild(r2.div), delete r2.div, r2 = g2;
            a2.alignTo && q(a2.renderer.alignedObjects, a2);
            N(a2, function(g3, z) {
              delete a2[z];
            });
            return null;
          },
          shadow: function(a2, g2, r2) {
            var z = [], d2, b2, m2 = this.element, k2, c2, H2, h2;
            if (!a2) this.destroyShadows();
            else if (!this.shadows) {
              c2 = E(a2.width, 3);
              H2 = (a2.opacity || 0.15) / c2;
              h2 = this.parentInverted ? "(-1,-1)" : "(" + E(a2.offsetX, 1) + ", " + E(a2.offsetY, 1) + ")";
              for (d2 = 1; d2 <= c2; d2++) b2 = m2.cloneNode(0), k2 = 2 * c2 + 1 - 2 * d2, f(b2, {
                stroke: a2.color || "#000000",
                "stroke-opacity": H2 * d2,
                "stroke-width": k2,
                transform: "translate" + h2,
                fill: "none"
              }), b2.setAttribute("class", (b2.getAttribute("class") || "") + " highcharts-shadow"), r2 && (f(b2, "height", Math.max(f(b2, "height") - k2, 0)), b2.cutHeight = k2), g2 ? g2.element.appendChild(b2) : m2.parentNode && m2.parentNode.insertBefore(b2, m2), z.push(b2);
              this.shadows = z;
            }
            return this;
          },
          destroyShadows: function() {
            p(this.shadows || [], function(a2) {
              this.safeRemoveChild(a2);
            }, this);
            this.shadows = void 0;
          },
          xGetter: function(a2) {
            "circle" === this.element.nodeName && ("x" === a2 ? a2 = "cx" : "y" === a2 && (a2 = "cy"));
            return this._defaultGetter(a2);
          },
          _defaultGetter: function(a2) {
            a2 = E(this[a2 + "Value"], this[a2], this.element ? this.element.getAttribute(a2) : null, 0);
            /^[\-0-9\.]+$/.test(a2) && (a2 = parseFloat(a2));
            return a2;
          },
          dSetter: function(a2, g2, r2) {
            a2 && a2.join && (a2 = a2.join(" "));
            /(NaN| {2}|^$)/.test(a2) && (a2 = "M 0 0");
            this[g2] !== a2 && (r2.setAttribute(g2, a2), this[g2] = a2);
          },
          dashstyleSetter: function(a2) {
            var r2, z = this["stroke-width"];
            "inherit" === z && (z = 1);
            if (a2 = a2 && a2.toLowerCase()) {
              a2 = a2.replace("shortdashdotdot", "3,1,1,1,1,1,").replace("shortdashdot", "3,1,1,1").replace("shortdot", "1,1,").replace("shortdash", "3,1,").replace("longdash", "8,3,").replace(/dot/g, "1,3,").replace("dash", "4,3,").replace(/,$/, "").split(",");
              for (r2 = a2.length; r2--; ) a2[r2] = g(a2[r2]) * z;
              a2 = a2.join(",").replace(/NaN/g, "none");
              this.element.setAttribute("stroke-dasharray", a2);
            }
          },
          alignSetter: function(a2) {
            this.alignValue = a2;
            this.element.setAttribute("text-anchor", {
              left: "start",
              center: "middle",
              right: "end"
            }[a2]);
          },
          opacitySetter: function(a2, g2, r2) {
            this[g2] = a2;
            r2.setAttribute(g2, a2);
          },
          titleSetter: function(a2) {
            var g2 = this.element.getElementsByTagName("title")[0];
            g2 || (g2 = h.createElementNS(this.SVG_NS, "title"), this.element.appendChild(g2));
            g2.firstChild && g2.removeChild(g2.firstChild);
            g2.appendChild(h.createTextNode(String(E(a2), "").replace(/<[^>]*>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">")));
          },
          textSetter: function(a2) {
            a2 !== this.textStr && (delete this.bBox, this.textStr = a2, this.added && this.renderer.buildText(this));
          },
          fillSetter: function(a2, g2, r2) {
            "string" === typeof a2 ? r2.setAttribute(g2, a2) : a2 && this.complexColor(a2, g2, r2);
          },
          visibilitySetter: function(a2, g2, r2) {
            "inherit" === a2 ? r2.removeAttribute(g2) : this[g2] !== a2 && r2.setAttribute(g2, a2);
            this[g2] = a2;
          },
          zIndexSetter: function(a2, r2) {
            var z = this.renderer, d2 = this.parentGroup, b2 = (d2 || z).element || z.box, m2, k2 = this.element, c2, H2, z = b2 === z.box;
            m2 = this.added;
            var h2;
            w(a2) ? (k2.setAttribute("data-z-index", a2), a2 = +a2, this[r2] === a2 && (m2 = false)) : w(this[r2]) && k2.removeAttribute("data-z-index");
            this[r2] = a2;
            if (m2) {
              (a2 = this.zIndex) && d2 && (d2.handleZ = true);
              r2 = b2.childNodes;
              for (h2 = r2.length - 1; 0 <= h2 && !c2; h2--) if (d2 = r2[h2], m2 = d2.getAttribute("data-z-index"), H2 = !w(m2), d2 !== k2) {
                if (0 > a2 && H2 && !z && !h2) b2.insertBefore(k2, r2[h2]), c2 = true;
                else if (g(m2) <= a2 || H2 && (!w(a2) || 0 <= a2)) b2.insertBefore(k2, r2[h2 + 1] || null), c2 = true;
              }
              c2 || (b2.insertBefore(k2, r2[z ? 3 : 0] || null), c2 = true);
            }
            return c2;
          },
          _defaultSetter: function(a2, g2, r2) {
            r2.setAttribute(g2, a2);
          }
        });
        C.prototype.yGetter = C.prototype.xGetter;
        C.prototype.translateXSetter = C.prototype.translateYSetter = C.prototype.rotationSetter = C.prototype.verticalAlignSetter = C.prototype.rotationOriginXSetter = C.prototype.rotationOriginYSetter = C.prototype.scaleXSetter = C.prototype.scaleYSetter = C.prototype.matrixSetter = function(a2, g2) {
          this[g2] = a2;
          this.doTransform = true;
        };
        C.prototype["stroke-widthSetter"] = C.prototype.strokeSetter = function(a2, g2, r2) {
          this[g2] = a2;
          this.stroke && this["stroke-width"] ? (C.prototype.fillSetter.call(this, this.stroke, "stroke", r2), r2.setAttribute("stroke-width", this["stroke-width"]), this.hasStroke = true) : "stroke-width" === g2 && 0 === a2 && this.hasStroke && (r2.removeAttribute("stroke"), this.hasStroke = false);
        };
        F = a.SVGRenderer = function() {
          this.init.apply(this, arguments);
        };
        k(F.prototype, {
          Element: C,
          SVG_NS: H,
          init: function(a2, g2, r2, d2, b2, k2) {
            var z;
            d2 = this.createElement("svg").attr({
              version: "1.1",
              "class": "highcharts-root"
            }).css(this.getStyle(d2));
            z = d2.element;
            a2.appendChild(z);
            f(a2, "dir", "ltr");
            -1 === a2.innerHTML.indexOf("xmlns") && f(z, "xmlns", this.SVG_NS);
            this.isSVG = true;
            this.box = z;
            this.boxWrapper = d2;
            this.alignedObjects = [];
            this.url = (l || m) && h.getElementsByTagName("base").length ? Q.location.href.split("#")[0].replace(/<[^>]*>/g, "").replace(/([\('\)])/g, "\\$1").replace(/ /g, "%20") : "";
            this.createElement("desc").add().element.appendChild(h.createTextNode("Created with Highcharts 6.2.0"));
            this.defs = this.createElement("defs").add();
            this.allowHTML = k2;
            this.forExport = b2;
            this.gradients = {};
            this.cache = {};
            this.cacheKeys = [];
            this.imgCount = 0;
            this.setSize(g2, r2, false);
            var c2;
            l && a2.getBoundingClientRect && (g2 = function() {
              x(a2, {
                left: 0,
                top: 0
              });
              c2 = a2.getBoundingClientRect();
              x(a2, {
                left: Math.ceil(c2.left) - c2.left + "px",
                top: Math.ceil(c2.top) - c2.top + "px"
              });
            }, g2(), this.unSubPixelFix = I(Q, "resize", g2));
          },
          getStyle: function(a2) {
            return this.style = k({
              fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
              fontSize: "12px"
            }, a2);
          },
          setStyle: function(a2) {
            this.boxWrapper.css(this.getStyle(a2));
          },
          isHidden: function() {
            return !this.boxWrapper.getBBox().width;
          },
          destroy: function() {
            var a2 = this.defs;
            this.box = null;
            this.boxWrapper = this.boxWrapper.destroy();
            c(this.gradients || {});
            this.gradients = null;
            a2 && (this.defs = a2.destroy());
            this.unSubPixelFix && this.unSubPixelFix();
            return this.alignedObjects = null;
          },
          createElement: function(a2) {
            var g2 = new this.Element();
            g2.init(this, a2);
            return g2;
          },
          draw: A,
          getRadialAttr: function(a2, g2) {
            return {
              cx: a2[0] - a2[2] / 2 + g2.cx * a2[2],
              cy: a2[1] - a2[2] / 2 + g2.cy * a2[2],
              r: g2.r * a2[2]
            };
          },
          truncate: function(a2, g2, r2, d2, b2, m2, k2) {
            var z = this, c2 = a2.rotation, H2, q2 = d2 ? 1 : 0, A2 = (r2 || d2).length, v2 = A2, p2 = [], l2 = function(a3) {
              g2.firstChild && g2.removeChild(g2.firstChild);
              a3 && g2.appendChild(h.createTextNode(a3));
            }, O2 = function(m3, c3) {
              c3 = c3 || m3;
              if (void 0 === p2[c3]) if (g2.getSubStringLength) try {
                p2[c3] = b2 + g2.getSubStringLength(0, d2 ? c3 + 1 : c3);
              } catch (Y) {
              }
              else z.getSpanWidth && (l2(k2(r2 || d2, m3)), p2[c3] = b2 + z.getSpanWidth(a2, g2));
              return p2[c3];
            }, G2, M2;
            a2.rotation = 0;
            G2 = O2(g2.textContent.length);
            if (M2 = b2 + G2 > m2) {
              for (; q2 <= A2; ) v2 = Math.ceil((q2 + A2) / 2), d2 && (H2 = k2(d2, v2)), G2 = O2(v2, H2 && H2.length - 1), q2 === A2 ? q2 = A2 + 1 : G2 > m2 ? A2 = v2 - 1 : q2 = v2;
              0 === A2 ? l2("") : r2 && A2 === r2.length - 1 || l2(H2 || k2(r2 || d2, v2));
            }
            d2 && d2.splice(0, v2);
            a2.actualWidth = G2;
            a2.rotation = c2;
            return M2;
          },
          escapes: {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
          },
          buildText: function(a2) {
            var r2 = a2.element, b2 = this, m2 = b2.forExport, c2 = E(a2.textStr, "").toString(), z = -1 !== c2.indexOf("<"), k2 = r2.childNodes, q2, A2 = f(r2, "x"), l2 = a2.styles, G2 = a2.textWidth, M2 = l2 && l2.lineHeight, e2 = l2 && l2.textOutline, B2 = l2 && "ellipsis" === l2.textOverflow, R2 = l2 && "nowrap" === l2.whiteSpace, y2 = l2 && l2.fontSize, t2, D2, J2 = k2.length, l2 = G2 && !a2.added && this.box, w2 = function(a3) {
              var d2;
              d2 = /(px|em)$/.test(a3 && a3.style.fontSize) ? a3.style.fontSize : y2 || b2.style.fontSize || 12;
              return M2 ? g(M2) : b2.fontMetrics(d2, a3.getAttribute("style") ? a3 : r2).h;
            }, Q2 = function(a3, g2) {
              N(b2.escapes, function(r3, d2) {
                g2 && -1 !== v(r3, g2) || (a3 = a3.toString().replace(new RegExp(r3, "g"), d2));
              });
              return a3;
            }, u2 = function(a3, g2) {
              var r3;
              r3 = a3.indexOf("<");
              a3 = a3.substring(r3, a3.indexOf(">") - r3);
              r3 = a3.indexOf(g2 + "=");
              if (-1 !== r3 && (r3 = r3 + g2.length + 1, g2 = a3.charAt(r3), '"' === g2 || "'" === g2)) return a3 = a3.substring(r3 + 1), a3.substring(0, a3.indexOf(g2));
            };
            t2 = [c2, B2, R2, M2, e2, y2, G2].join();
            if (t2 !== a2.textCache) {
              for (a2.textCache = t2; J2--; ) r2.removeChild(k2[J2]);
              z || e2 || B2 || G2 || -1 !== c2.indexOf(" ") ? (l2 && l2.appendChild(r2), c2 = z ? c2.replace(/<(b|strong)>/g, '<span style="font-weight:bold">').replace(/<(i|em)>/g, '<span style="font-style:italic">').replace(/<a/g, "<span").replace(/<\/(b|strong|i|em|a)>/g, "</span>").split(/<br.*?>/g) : [c2], c2 = d(c2, function(a3) {
                return "" !== a3;
              }), p(c2, function(g2, d2) {
                var c3, z2 = 0, k3 = 0;
                g2 = g2.replace(/^\s+|\s+$/g, "").replace(/<span/g, "|||<span").replace(/<\/span>/g, "</span>|||");
                c3 = g2.split("|||");
                p(c3, function(g3) {
                  if ("" !== g3 || 1 === c3.length) {
                    var v2 = {}, l3 = h.createElementNS(b2.SVG_NS, "tspan"), p2, M3;
                    (p2 = u2(g3, "class")) && f(l3, "class", p2);
                    if (p2 = u2(g3, "style")) p2 = p2.replace(/(;| |^)color([ :])/, "$1fill$2"), f(l3, "style", p2);
                    (M3 = u2(g3, "href")) && !m2 && (f(l3, "onclick", 'location.href="' + M3 + '"'), f(l3, "class", "highcharts-anchor"), x(l3, {
                      cursor: "pointer"
                    }));
                    g3 = Q2(g3.replace(/<[a-zA-Z\/](.|\n)*?>/g, "") || " ");
                    if (" " !== g3) {
                      l3.appendChild(h.createTextNode(g3));
                      z2 ? v2.dx = 0 : d2 && null !== A2 && (v2.x = A2);
                      f(l3, v2);
                      r2.appendChild(l3);
                      !z2 && D2 && (!O && m2 && x(l3, {
                        display: "block"
                      }), f(l3, "dy", w2(l3)));
                      if (G2) {
                        var e3 = g3.replace(/([^\^])-/g, "$1- ").split(" "), v2 = !R2 && (1 < c3.length || d2 || 1 < e3.length);
                        M3 = 0;
                        var t3 = w2(l3);
                        if (B2) q2 = b2.truncate(a2, l3, g3, void 0, 0, Math.max(0, G2 - parseInt(y2 || 12, 10)), function(a3, g4) {
                          return a3.substring(0, g4) + "…";
                        });
                        else if (v2) for (; e3.length; ) e3.length && !R2 && 0 < M3 && (l3 = h.createElementNS(H, "tspan"), f(l3, {
                          dy: t3,
                          x: A2
                        }), p2 && f(l3, "style", p2), l3.appendChild(h.createTextNode(e3.join(" ").replace(/- /g, "-"))), r2.appendChild(l3)), b2.truncate(a2, l3, null, e3, 0 === M3 ? k3 : 0, G2, function(a3, g4) {
                          return e3.slice(0, g4).join(" ").replace(/- /g, "-");
                        }), k3 = a2.actualWidth, M3++;
                      }
                      z2++;
                    }
                  }
                });
                D2 = D2 || r2.childNodes.length;
              }), B2 && q2 && a2.attr("title", Q2(a2.textStr, ["&lt;", "&gt;"])), l2 && l2.removeChild(r2), e2 && a2.applyTextOutline && a2.applyTextOutline(e2)) : r2.appendChild(h.createTextNode(Q2(c2)));
            }
          },
          getContrast: function(a2) {
            a2 = u(a2).rgba;
            a2[0] *= 1;
            a2[1] *= 1.2;
            a2[2] *= 0.5;
            return 459 < a2[0] + a2[1] + a2[2] ? "#000000" : "#FFFFFF";
          },
          button: function(a2, g2, r2, d2, b2, c2, m2, H2, h2) {
            var z = this.label(a2, g2, r2, h2, null, null, null, null, "button"), q2 = 0;
            z.attr(G({
              padding: 8,
              r: 2
            }, b2));
            var A2, v2, l2, p2;
            b2 = G({
              fill: "#f7f7f7",
              stroke: "#cccccc",
              "stroke-width": 1,
              style: {
                color: "#333333",
                cursor: "pointer",
                fontWeight: "normal"
              }
            }, b2);
            A2 = b2.style;
            delete b2.style;
            c2 = G(b2, {
              fill: "#e6e6e6"
            }, c2);
            v2 = c2.style;
            delete c2.style;
            m2 = G(b2, {
              fill: "#e6ebf5",
              style: {
                color: "#000000",
                fontWeight: "bold"
              }
            }, m2);
            l2 = m2.style;
            delete m2.style;
            H2 = G(b2, {
              style: {
                color: "#cccccc"
              }
            }, H2);
            p2 = H2.style;
            delete H2.style;
            I(z.element, L ? "mouseover" : "mouseenter", function() {
              3 !== q2 && z.setState(1);
            });
            I(z.element, L ? "mouseout" : "mouseleave", function() {
              3 !== q2 && z.setState(q2);
            });
            z.setState = function(a3) {
              1 !== a3 && (z.state = q2 = a3);
              z.removeClass(/highcharts-button-(normal|hover|pressed|disabled)/).addClass("highcharts-button-" + ["normal", "hover", "pressed", "disabled"][a3 || 0]);
              z.attr([b2, c2, m2, H2][a3 || 0]).css([A2, v2, l2, p2][a3 || 0]);
            };
            z.attr(b2).css(k({
              cursor: "default"
            }, A2));
            return z.on("click", function(a3) {
              3 !== q2 && d2.call(z, a3);
            });
          },
          crispLine: function(a2, g2) {
            a2[1] === a2[4] && (a2[1] = a2[4] = Math.round(a2[1]) - g2 % 2 / 2);
            a2[2] === a2[5] && (a2[2] = a2[5] = Math.round(a2[2]) + g2 % 2 / 2);
            return a2;
          },
          path: function(a2) {
            var g2 = {
              fill: "none"
            };
            J(a2) ? g2.d = a2 : B(a2) && k(g2, a2);
            return this.createElement("path").attr(g2);
          },
          circle: function(a2, g2, r2) {
            a2 = B(a2) ? a2 : {
              x: a2,
              y: g2,
              r: r2
            };
            g2 = this.createElement("circle");
            g2.xSetter = g2.ySetter = function(a3, g3, r3) {
              r3.setAttribute("c" + g3, a3);
            };
            return g2.attr(a2);
          },
          arc: function(a2, g2, r2, d2, b2, c2) {
            B(a2) ? (d2 = a2, g2 = d2.y, r2 = d2.r, a2 = d2.x) : d2 = {
              innerR: d2,
              start: b2,
              end: c2
            };
            a2 = this.symbol("arc", a2, g2, r2, r2, d2);
            a2.r = r2;
            return a2;
          },
          rect: function(a2, g2, r2, d2, b2, c2) {
            b2 = B(a2) ? a2.r : b2;
            var m2 = this.createElement("rect");
            a2 = B(a2) ? a2 : void 0 === a2 ? {} : {
              x: a2,
              y: g2,
              width: Math.max(r2, 0),
              height: Math.max(d2, 0)
            };
            void 0 !== c2 && (a2.strokeWidth = c2, a2 = m2.crisp(a2));
            a2.fill = "none";
            b2 && (a2.r = b2);
            m2.rSetter = function(a3, g3, r3) {
              f(r3, {
                rx: a3,
                ry: a3
              });
            };
            return m2.attr(a2);
          },
          setSize: function(a2, g2, r2) {
            var d2 = this.alignedObjects, b2 = d2.length;
            this.width = a2;
            this.height = g2;
            for (this.boxWrapper.animate({
              width: a2,
              height: g2
            }, {
              step: function() {
                this.attr({
                  viewBox: "0 0 " + this.attr("width") + " " + this.attr("height")
                });
              },
              duration: E(r2, true) ? void 0 : 0
            }); b2--; ) d2[b2].align();
          },
          g: function(a2) {
            var g2 = this.createElement("g");
            return a2 ? g2.attr({
              "class": "highcharts-" + a2
            }) : g2;
          },
          image: function(a2, g2, r2, d2, b2, c2) {
            var m2 = {
              preserveAspectRatio: "none"
            }, H2, h2 = function(a3, g3) {
              a3.setAttributeNS ? a3.setAttributeNS("http://www.w3.org/1999/xlink", "href", g3) : a3.setAttribute("hc-svg-href", g3);
            }, q2 = function(g3) {
              h2(H2.element, a2);
              c2.call(H2, g3);
            };
            1 < arguments.length && k(m2, {
              x: g2,
              y: r2,
              width: d2,
              height: b2
            });
            H2 = this.createElement("image").attr(m2);
            c2 ? (h2(H2.element, "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="), m2 = new Q.Image(), I(m2, "load", q2), m2.src = a2, m2.complete && q2({})) : h2(H2.element, a2);
            return H2;
          },
          symbol: function(a2, g2, r2, d2, b2, c2) {
            var m2 = this, H2, q2 = /^url\((.*?)\)$/, A2 = q2.test(a2), v2 = !A2 && (this.symbols[a2] ? a2 : "circle"), z = v2 && this.symbols[v2], l2 = w(g2) && z && z.call(this.symbols, Math.round(g2), Math.round(r2), d2, b2, c2), G2, M2;
            z ? (H2 = this.path(l2), H2.attr("fill", "none"), k(H2, {
              symbolName: v2,
              x: g2,
              y: r2,
              width: d2,
              height: b2
            }), c2 && k(H2, c2)) : A2 && (G2 = a2.match(q2)[1], H2 = this.image(G2), H2.imgwidth = E(R[G2] && R[G2].width, c2 && c2.width), H2.imgheight = E(R[G2] && R[G2].height, c2 && c2.height), M2 = function() {
              H2.attr({
                width: H2.width,
                height: H2.height
              });
            }, p(["width", "height"], function(a3) {
              H2[a3 + "Setter"] = function(a4, g3) {
                var r3 = {}, d3 = this["img" + g3], b3 = "width" === g3 ? "translateX" : "translateY";
                this[g3] = a4;
                w(d3) && (this.element && this.element.setAttribute(g3, d3), this.alignByTranslate || (r3[b3] = ((this[g3] || 0) - d3) / 2, this.attr(r3)));
              };
            }), w(g2) && H2.attr({
              x: g2,
              y: r2
            }), H2.isImg = true, w(H2.imgwidth) && w(H2.imgheight) ? M2() : (H2.attr({
              width: 0,
              height: 0
            }), t("img", {
              onload: function() {
                var a3 = e[m2.chartIndex];
                0 === this.width && (x(this, {
                  position: "absolute",
                  top: "-999em"
                }), h.body.appendChild(this));
                R[G2] = {
                  width: this.width,
                  height: this.height
                };
                H2.imgwidth = this.width;
                H2.imgheight = this.height;
                H2.element && M2();
                this.parentNode && this.parentNode.removeChild(this);
                m2.imgCount--;
                if (!m2.imgCount && a3 && a3.onload) a3.onload();
              },
              src: G2
            }), this.imgCount++));
            return H2;
          },
          symbols: {
            circle: function(a2, g2, r2, d2) {
              return this.arc(a2 + r2 / 2, g2 + d2 / 2, r2 / 2, d2 / 2, {
                start: 0,
                end: 2 * Math.PI,
                open: false
              });
            },
            square: function(a2, g2, r2, d2) {
              return ["M", a2, g2, "L", a2 + r2, g2, a2 + r2, g2 + d2, a2, g2 + d2, "Z"];
            },
            triangle: function(a2, g2, r2, d2) {
              return ["M", a2 + r2 / 2, g2, "L", a2 + r2, g2 + d2, a2, g2 + d2, "Z"];
            },
            "triangle-down": function(a2, g2, r2, d2) {
              return ["M", a2, g2, "L", a2 + r2, g2, a2 + r2 / 2, g2 + d2, "Z"];
            },
            diamond: function(a2, g2, r2, d2) {
              return ["M", a2 + r2 / 2, g2, "L", a2 + r2, g2 + d2 / 2, a2 + r2 / 2, g2 + d2, a2, g2 + d2 / 2, "Z"];
            },
            arc: function(a2, g2, r2, d2, b2) {
              var c2 = b2.start, m2 = b2.r || r2, H2 = b2.r || d2 || r2, k2 = b2.end - 1e-3;
              r2 = b2.innerR;
              d2 = E(b2.open, 1e-3 > Math.abs(b2.end - b2.start - 2 * Math.PI));
              var h2 = Math.cos(c2), q2 = Math.sin(c2), A2 = Math.cos(k2), k2 = Math.sin(k2);
              b2 = 1e-3 > b2.end - c2 - Math.PI ? 0 : 1;
              m2 = ["M", a2 + m2 * h2, g2 + H2 * q2, "A", m2, H2, 0, b2, 1, a2 + m2 * A2, g2 + H2 * k2];
              w(r2) && m2.push(d2 ? "M" : "L", a2 + r2 * A2, g2 + r2 * k2, "A", r2, r2, 0, b2, 0, a2 + r2 * h2, g2 + r2 * q2);
              m2.push(d2 ? "" : "Z");
              return m2;
            },
            callout: function(a2, g2, r2, d2, b2) {
              var c2 = Math.min(b2 && b2.r || 0, r2, d2), m2 = c2 + 6, H2 = b2 && b2.anchorX;
              b2 = b2 && b2.anchorY;
              var k2;
              k2 = ["M", a2 + c2, g2, "L", a2 + r2 - c2, g2, "C", a2 + r2, g2, a2 + r2, g2, a2 + r2, g2 + c2, "L", a2 + r2, g2 + d2 - c2, "C", a2 + r2, g2 + d2, a2 + r2, g2 + d2, a2 + r2 - c2, g2 + d2, "L", a2 + c2, g2 + d2, "C", a2, g2 + d2, a2, g2 + d2, a2, g2 + d2 - c2, "L", a2, g2 + c2, "C", a2, g2, a2, g2, a2 + c2, g2];
              H2 && H2 > r2 ? b2 > g2 + m2 && b2 < g2 + d2 - m2 ? k2.splice(13, 3, "L", a2 + r2, b2 - 6, a2 + r2 + 6, b2, a2 + r2, b2 + 6, a2 + r2, g2 + d2 - c2) : k2.splice(13, 3, "L", a2 + r2, d2 / 2, H2, b2, a2 + r2, d2 / 2, a2 + r2, g2 + d2 - c2) : H2 && 0 > H2 ? b2 > g2 + m2 && b2 < g2 + d2 - m2 ? k2.splice(33, 3, "L", a2, b2 + 6, a2 - 6, b2, a2, b2 - 6, a2, g2 + c2) : k2.splice(33, 3, "L", a2, d2 / 2, H2, b2, a2, d2 / 2, a2, g2 + c2) : b2 && b2 > d2 && H2 > a2 + m2 && H2 < a2 + r2 - m2 ? k2.splice(23, 3, "L", H2 + 6, g2 + d2, H2, g2 + d2 + 6, H2 - 6, g2 + d2, a2 + c2, g2 + d2) : b2 && 0 > b2 && H2 > a2 + m2 && H2 < a2 + r2 - m2 && k2.splice(3, 3, "L", H2 - 6, g2, H2, g2 - 6, H2 + 6, g2, r2 - c2, g2);
              return k2;
            }
          },
          clipRect: function(g2, r2, d2, b2) {
            var c2 = a.uniqueKey(), m2 = this.createElement("clipPath").attr({
              id: c2
            }).add(this.defs);
            g2 = this.rect(g2, r2, d2, b2, 0).add(m2);
            g2.id = c2;
            g2.clipPath = m2;
            g2.count = 0;
            return g2;
          },
          text: function(a2, g2, r2, d2) {
            var b2 = {};
            if (d2 && (this.allowHTML || !this.forExport)) return this.html(a2, g2, r2);
            b2.x = Math.round(g2 || 0);
            r2 && (b2.y = Math.round(r2));
            w(a2) && (b2.text = a2);
            a2 = this.createElement("text").attr(b2);
            d2 || (a2.xSetter = function(a3, g3, r3) {
              var d3 = r3.getElementsByTagName("tspan"), b3, c2 = r3.getAttribute(g3), m2;
              for (m2 = 0; m2 < d3.length; m2++) b3 = d3[m2], b3.getAttribute(g3) === c2 && b3.setAttribute(g3, a3);
              r3.setAttribute(g3, a3);
            });
            return a2;
          },
          fontMetrics: function(a2, r2) {
            a2 = a2 || r2 && r2.style && r2.style.fontSize || this.style && this.style.fontSize;
            a2 = /px/.test(a2) ? g(a2) : /em/.test(a2) ? parseFloat(a2) * (r2 ? this.fontMetrics(null, r2.parentNode).f : 16) : 12;
            r2 = 24 > a2 ? a2 + 3 : Math.round(1.2 * a2);
            return {
              h: r2,
              b: Math.round(0.8 * r2),
              f: a2
            };
          },
          rotCorr: function(a2, g2, r2) {
            var d2 = a2;
            g2 && r2 && (d2 = Math.max(d2 * Math.cos(g2 * y), 4));
            return {
              x: -a2 / 3 * Math.sin(g2 * y),
              y: d2
            };
          },
          label: function(g2, d2, b2, c2, m2, H2, h2, q2, A2) {
            var v2 = this, l2 = v2.g("button" !== A2 && "label"), M2 = l2.text = v2.text("", 0, 0, h2).attr({
              zIndex: 1
            }), O2, z, e2 = 0, B2 = 3, R2 = 0, f2, y2, t2, D2, J2, E2 = {}, N2, x2, Q2 = /^url\((.*?)\)$/.test(c2), u2 = Q2, L2, n2, P, T;
            A2 && l2.addClass("highcharts-" + A2);
            u2 = Q2;
            L2 = function() {
              return (N2 || 0) % 2 / 2;
            };
            n2 = function() {
              var a2 = M2.element.style, g3 = {};
              z = (void 0 === f2 || void 0 === y2 || J2) && w(M2.textStr) && M2.getBBox();
              l2.width = (f2 || z.width || 0) + 2 * B2 + R2;
              l2.height = (y2 || z.height || 0) + 2 * B2;
              x2 = B2 + v2.fontMetrics(a2 && a2.fontSize, M2).b;
              u2 && (O2 || (l2.box = O2 = v2.symbols[c2] || Q2 ? v2.symbol(c2) : v2.rect(), O2.addClass(("button" === A2 ? "" : "highcharts-label-box") + (A2 ? " highcharts-" + A2 + "-box" : "")), O2.add(l2), a2 = L2(), g3.x = a2, g3.y = (q2 ? -x2 : 0) + a2), g3.width = Math.round(l2.width), g3.height = Math.round(l2.height), O2.attr(k(g3, E2)), E2 = {});
            };
            P = function() {
              var a2 = R2 + B2, g3;
              g3 = q2 ? 0 : x2;
              w(f2) && z && ("center" === J2 || "right" === J2) && (a2 += {
                center: 0.5,
                right: 1
              }[J2] * (f2 - z.width));
              if (a2 !== M2.x || g3 !== M2.y) M2.attr("x", a2), M2.hasBoxWidthChanged && (z = M2.getBBox(true), n2()), void 0 !== g3 && M2.attr("y", g3);
              M2.x = a2;
              M2.y = g3;
            };
            T = function(a2, g3) {
              O2 ? O2.attr(a2, g3) : E2[a2] = g3;
            };
            l2.onAdd = function() {
              M2.add(l2);
              l2.attr({
                text: g2 || 0 === g2 ? g2 : "",
                x: d2,
                y: b2
              });
              O2 && w(m2) && l2.attr({
                anchorX: m2,
                anchorY: H2
              });
            };
            l2.widthSetter = function(g3) {
              f2 = a.isNumber(g3) ? g3 : null;
            };
            l2.heightSetter = function(a2) {
              y2 = a2;
            };
            l2["text-alignSetter"] = function(a2) {
              J2 = a2;
            };
            l2.paddingSetter = function(a2) {
              w(a2) && a2 !== B2 && (B2 = l2.padding = a2, P());
            };
            l2.paddingLeftSetter = function(a2) {
              w(a2) && a2 !== R2 && (R2 = a2, P());
            };
            l2.alignSetter = function(a2) {
              a2 = {
                left: 0,
                center: 0.5,
                right: 1
              }[a2];
              a2 !== e2 && (e2 = a2, z && l2.attr({
                x: t2
              }));
            };
            l2.textSetter = function(a2) {
              void 0 !== a2 && M2.textSetter(a2);
              n2();
              P();
            };
            l2["stroke-widthSetter"] = function(a2, g3) {
              a2 && (u2 = true);
              N2 = this["stroke-width"] = a2;
              T(g3, a2);
            };
            l2.strokeSetter = l2.fillSetter = l2.rSetter = function(a2, g3) {
              "r" !== g3 && ("fill" === g3 && a2 && (u2 = true), l2[g3] = a2);
              T(g3, a2);
            };
            l2.anchorXSetter = function(a2, g3) {
              m2 = l2.anchorX = a2;
              T(g3, Math.round(a2) - L2() - t2);
            };
            l2.anchorYSetter = function(a2, g3) {
              H2 = l2.anchorY = a2;
              T(g3, a2 - D2);
            };
            l2.xSetter = function(a2) {
              l2.x = a2;
              e2 && (a2 -= e2 * ((f2 || z.width) + 2 * B2), l2["forceAnimate:x"] = true);
              t2 = Math.round(a2);
              l2.attr("translateX", t2);
            };
            l2.ySetter = function(a2) {
              D2 = l2.y = Math.round(a2);
              l2.attr("translateY", D2);
            };
            var V = l2.css;
            return k(l2, {
              css: function(a2) {
                if (a2) {
                  var g3 = {};
                  a2 = G(a2);
                  p(l2.textProps, function(r2) {
                    void 0 !== a2[r2] && (g3[r2] = a2[r2], delete a2[r2]);
                  });
                  M2.css(g3);
                  "width" in g3 && n2();
                }
                return V.call(l2, a2);
              },
              getBBox: function() {
                return {
                  width: z.width + 2 * B2,
                  height: z.height + 2 * B2,
                  x: z.x - B2,
                  y: z.y - B2
                };
              },
              shadow: function(a2) {
                a2 && (n2(), O2 && O2.shadow(a2));
                return l2;
              },
              destroy: function() {
                r(l2.element, "mouseenter");
                r(l2.element, "mouseleave");
                M2 && (M2 = M2.destroy());
                O2 && (O2 = O2.destroy());
                C.prototype.destroy.call(l2);
                l2 = v2 = n2 = P = T = null;
              }
            });
          }
        });
        a.Renderer = F;
      })(K);
      (function(a) {
        var C = a.attr, F = a.createElement, I = a.css, n = a.defined, f = a.each, e = a.extend, u = a.isFirefox, x = a.isMS, t = a.isWebKit, w = a.pick, y = a.pInt, c = a.SVGRenderer, h = a.win, p = a.wrap;
        e(a.SVGElement.prototype, {
          htmlCss: function(a2) {
            var c2 = "SPAN" === this.element.tagName && a2 && "width" in a2, d = w(c2 && a2.width, void 0);
            c2 && (delete a2.width, this.textWidth = d, this.htmlUpdateTransform());
            a2 && "ellipsis" === a2.textOverflow && (a2.whiteSpace = "nowrap", a2.overflow = "hidden");
            this.styles = e(this.styles, a2);
            I(this.element, a2);
            return this;
          },
          htmlGetBBox: function() {
            var a2 = this.element;
            return {
              x: a2.offsetLeft,
              y: a2.offsetTop,
              width: a2.offsetWidth,
              height: a2.offsetHeight
            };
          },
          htmlUpdateTransform: function() {
            if (this.added) {
              var a2 = this.renderer, c2 = this.element, d = this.translateX || 0, b = this.translateY || 0, h2 = this.x || 0, p2 = this.y || 0, l = this.textAlign || "left", e2 = {
                left: 0,
                center: 0.5,
                right: 1
              }[l], B = this.styles, t2 = B && B.whiteSpace;
              I(c2, {
                marginLeft: d,
                marginTop: b
              });
              this.shadows && f(this.shadows, function(a3) {
                I(a3, {
                  marginLeft: d + 1,
                  marginTop: b + 1
                });
              });
              this.inverted && f(c2.childNodes, function(d2) {
                a2.invertChild(d2, c2);
              });
              if ("SPAN" === c2.tagName) {
                var B = this.rotation, m = this.textWidth && y(this.textWidth), G = [B, l, c2.innerHTML, this.textWidth, this.textAlign].join(), A;
                (A = m !== this.oldTextWidth) && !(A = m > this.oldTextWidth) && ((A = this.textPxLength) || (I(c2, {
                  width: "",
                  whiteSpace: t2 || "nowrap"
                }), A = c2.offsetWidth), A = A > m);
                A && /[ \-]/.test(c2.textContent || c2.innerText) ? (I(c2, {
                  width: m + "px",
                  display: "block",
                  whiteSpace: t2 || "normal"
                }), this.oldTextWidth = m, this.hasBoxWidthChanged = true) : this.hasBoxWidthChanged = false;
                G !== this.cTT && (t2 = a2.fontMetrics(c2.style.fontSize).b, !n(B) || B === (this.oldRotation || 0) && l === this.oldAlign || this.setSpanRotation(B, e2, t2), this.getSpanCorrection(!n(B) && this.textPxLength || c2.offsetWidth, t2, e2, B, l));
                I(c2, {
                  left: h2 + (this.xCorr || 0) + "px",
                  top: p2 + (this.yCorr || 0) + "px"
                });
                this.cTT = G;
                this.oldRotation = B;
                this.oldAlign = l;
              }
            } else this.alignOnAdd = true;
          },
          setSpanRotation: function(a2, c2, d) {
            var b = {}, k = this.renderer.getTransformKey();
            b[k] = b.transform = "rotate(" + a2 + "deg)";
            b[k + (u ? "Origin" : "-origin")] = b.transformOrigin = 100 * c2 + "% " + d + "px";
            I(this.element, b);
          },
          getSpanCorrection: function(a2, c2, d) {
            this.xCorr = -a2 * d;
            this.yCorr = -c2;
          }
        });
        e(c.prototype, {
          getTransformKey: function() {
            return x && !/Edge/.test(h.navigator.userAgent) ? "-ms-transform" : t ? "-webkit-transform" : u ? "MozTransform" : h.opera ? "-o-transform" : "";
          },
          html: function(a2, c2, d) {
            var b = this.createElement("span"), k = b.element, h2 = b.renderer, l = h2.isSVG, q = function(a3, d2) {
              f(["opacity", "visibility"], function(b2) {
                p(a3, b2 + "Setter", function(a4, b3, c3, m) {
                  a4.call(this, b3, c3, m);
                  d2[c3] = b3;
                });
              });
              a3.addedSetters = true;
            };
            b.textSetter = function(a3) {
              a3 !== k.innerHTML && delete this.bBox;
              this.textStr = a3;
              k.innerHTML = w(a3, "");
              b.doTransform = true;
            };
            l && q(b, b.element.style);
            b.xSetter = b.ySetter = b.alignSetter = b.rotationSetter = function(a3, d2) {
              "align" === d2 && (d2 = "textAlign");
              b[d2] = a3;
              b.doTransform = true;
            };
            b.afterSetters = function() {
              this.doTransform && (this.htmlUpdateTransform(), this.doTransform = false);
            };
            b.attr({
              text: a2,
              x: Math.round(c2),
              y: Math.round(d)
            }).css({
              fontFamily: this.style.fontFamily,
              fontSize: this.style.fontSize,
              position: "absolute"
            });
            k.style.whiteSpace = "nowrap";
            b.css = b.htmlCss;
            l && (b.add = function(a3) {
              var d2, c3 = h2.box.parentNode, l2 = [];
              if (this.parentGroup = a3) {
                if (d2 = a3.div, !d2) {
                  for (; a3; ) l2.push(a3), a3 = a3.parentGroup;
                  f(l2.reverse(), function(a4) {
                    function m(g2, d3) {
                      a4[d3] = g2;
                      "translateX" === d3 ? k2.left = g2 + "px" : k2.top = g2 + "px";
                      a4.doTransform = true;
                    }
                    var k2, g = C(a4.element, "class");
                    g && (g = {
                      className: g
                    });
                    d2 = a4.div = a4.div || F("div", g, {
                      position: "absolute",
                      left: (a4.translateX || 0) + "px",
                      top: (a4.translateY || 0) + "px",
                      display: a4.display,
                      opacity: a4.opacity,
                      pointerEvents: a4.styles && a4.styles.pointerEvents
                    }, d2 || c3);
                    k2 = d2.style;
                    e(a4, {
                      classSetter: /* @__PURE__ */ function(a5) {
                        return function(g2) {
                          this.element.setAttribute("class", g2);
                          a5.className = g2;
                        };
                      }(d2),
                      on: function() {
                        l2[0].div && b.on.apply({
                          element: l2[0].div
                        }, arguments);
                        return a4;
                      },
                      translateXSetter: m,
                      translateYSetter: m
                    });
                    a4.addedSetters || q(a4, k2);
                  });
                }
              } else d2 = c3;
              d2.appendChild(k);
              b.added = true;
              b.alignOnAdd && b.htmlUpdateTransform();
              return b;
            });
            return b;
          }
        });
      })(K);
      (function(a) {
        var C = a.defined, F = a.each, I = a.extend, n = a.merge, f = a.pick, e = a.timeUnits, u = a.win;
        a.Time = function(a2) {
          this.update(a2, false);
        };
        a.Time.prototype = {
          defaultOptions: {},
          update: function(a2) {
            var e2 = f(a2 && a2.useUTC, true), w = this;
            this.options = a2 = n(true, this.options || {}, a2);
            this.Date = a2.Date || u.Date;
            this.timezoneOffset = (this.useUTC = e2) && a2.timezoneOffset;
            this.getTimezoneOffset = this.timezoneOffsetFunction();
            (this.variableTimezone = !(e2 && !a2.getTimezoneOffset && !a2.timezone)) || this.timezoneOffset ? (this.get = function(a3, c) {
              var h = c.getTime(), p = h - w.getTimezoneOffset(c);
              c.setTime(p);
              a3 = c["getUTC" + a3]();
              c.setTime(h);
              return a3;
            }, this.set = function(a3, c, h) {
              var p;
              if ("Milliseconds" === a3 || "Seconds" === a3 || "Minutes" === a3 && 0 === c.getTimezoneOffset() % 60) c["set" + a3](h);
              else p = w.getTimezoneOffset(c), p = c.getTime() - p, c.setTime(p), c["setUTC" + a3](h), a3 = w.getTimezoneOffset(c), p = c.getTime() + a3, c.setTime(p);
            }) : e2 ? (this.get = function(a3, c) {
              return c["getUTC" + a3]();
            }, this.set = function(a3, c, h) {
              return c["setUTC" + a3](h);
            }) : (this.get = function(a3, c) {
              return c["get" + a3]();
            }, this.set = function(a3, c, h) {
              return c["set" + a3](h);
            });
          },
          makeTime: function(e2, t, w, y, c, h) {
            var p, k, q;
            this.useUTC ? (p = this.Date.UTC.apply(0, arguments), k = this.getTimezoneOffset(p), p += k, q = this.getTimezoneOffset(p), k !== q ? p += q - k : k - 36e5 !== this.getTimezoneOffset(p - 36e5) || a.isSafari || (p -= 36e5)) : p = new this.Date(e2, t, f(w, 1), f(y, 0), f(c, 0), f(h, 0)).getTime();
            return p;
          },
          timezoneOffsetFunction: function() {
            var e2 = this, f2 = this.options, w = u.moment;
            if (!this.useUTC) return function(a2) {
              return 6e4 * new Date(a2).getTimezoneOffset();
            };
            if (f2.timezone) {
              if (w) return function(a2) {
                return 6e4 * -w.tz(a2, f2.timezone).utcOffset();
              };
              a.error(25);
            }
            return this.useUTC && f2.getTimezoneOffset ? function(a2) {
              return 6e4 * f2.getTimezoneOffset(a2);
            } : function() {
              return 6e4 * (e2.timezoneOffset || 0);
            };
          },
          dateFormat: function(e2, f2, w) {
            if (!a.defined(f2) || isNaN(f2)) return a.defaultOptions.lang.invalidDate || "";
            e2 = a.pick(e2, "%Y-%m-%d %H:%M:%S");
            var t = this, c = new this.Date(f2), h = this.get("Hours", c), p = this.get("Day", c), k = this.get("Date", c), q = this.get("Month", c), d = this.get("FullYear", c), b = a.defaultOptions.lang, v = b.weekdays, J = b.shortWeekdays, l = a.pad, c = a.extend({
              a: J ? J[p] : v[p].substr(0, 3),
              A: v[p],
              d: l(k),
              e: l(k, 2, " "),
              w: p,
              b: b.shortMonths[q],
              B: b.months[q],
              m: l(q + 1),
              o: q + 1,
              y: d.toString().substr(2, 2),
              Y: d,
              H: l(h),
              k: h,
              I: l(h % 12 || 12),
              l: h % 12 || 12,
              M: l(t.get("Minutes", c)),
              p: 12 > h ? "AM" : "PM",
              P: 12 > h ? "am" : "pm",
              S: l(c.getSeconds()),
              L: l(Math.floor(f2 % 1e3), 3)
            }, a.dateFormats);
            a.objectEach(c, function(a2, d2) {
              for (; -1 !== e2.indexOf("%" + d2); ) e2 = e2.replace("%" + d2, "function" === typeof a2 ? a2.call(t, f2) : a2);
            });
            return w ? e2.substr(0, 1).toUpperCase() + e2.substr(1) : e2;
          },
          resolveDTLFormat: function(e2) {
            return a.isObject(e2, true) ? e2 : (e2 = a.splat(e2), {
              main: e2[0],
              from: e2[1],
              to: e2[2]
            });
          },
          getTimeTicks: function(a2, t, w, y) {
            var c = this, h = [], p, k = {}, q;
            p = new c.Date(t);
            var d = a2.unitRange, b = a2.count || 1, v;
            y = f(y, 1);
            if (C(t)) {
              c.set("Milliseconds", p, d >= e.second ? 0 : b * Math.floor(c.get("Milliseconds", p) / b));
              d >= e.second && c.set("Seconds", p, d >= e.minute ? 0 : b * Math.floor(c.get("Seconds", p) / b));
              d >= e.minute && c.set("Minutes", p, d >= e.hour ? 0 : b * Math.floor(c.get("Minutes", p) / b));
              d >= e.hour && c.set("Hours", p, d >= e.day ? 0 : b * Math.floor(c.get("Hours", p) / b));
              d >= e.day && c.set("Date", p, d >= e.month ? 1 : b * Math.floor(c.get("Date", p) / b));
              d >= e.month && (c.set("Month", p, d >= e.year ? 0 : b * Math.floor(c.get("Month", p) / b)), q = c.get("FullYear", p));
              d >= e.year && c.set("FullYear", p, q - q % b);
              d === e.week && (q = c.get("Day", p), c.set("Date", p, c.get("Date", p) - q + y + (q < y ? -7 : 0)));
              q = c.get("FullYear", p);
              y = c.get("Month", p);
              var J = c.get("Date", p), l = c.get("Hours", p);
              t = p.getTime();
              c.variableTimezone && (v = w - t > 4 * e.month || c.getTimezoneOffset(t) !== c.getTimezoneOffset(w));
              t = p.getTime();
              for (p = 1; t < w; ) h.push(t), t = d === e.year ? c.makeTime(q + p * b, 0) : d === e.month ? c.makeTime(q, y + p * b) : !v || d !== e.day && d !== e.week ? v && d === e.hour && 1 < b ? c.makeTime(q, y, J, l + p * b) : t + d * b : c.makeTime(q, y, J + p * b * (d === e.day ? 1 : 7)), p++;
              h.push(t);
              d <= e.hour && 1e4 > h.length && F(h, function(a3) {
                0 === a3 % 18e5 && "000000000" === c.dateFormat("%H%M%S%L", a3) && (k[a3] = "day");
              });
            }
            h.info = I(a2, {
              higherRanks: k,
              totalRange: d * b
            });
            return h;
          }
        };
      })(K);
      (function(a) {
        var C = a.color, F = a.merge;
        a.defaultOptions = {
          colors: "#7cb5ec #434348 #90ed7d #f7a35c #8085e9 #f15c80 #e4d354 #2b908f #f45b5b #91e8e1".split(" "),
          symbols: ["circle", "diamond", "square", "triangle", "triangle-down"],
          lang: {
            loading: "Loading...",
            months: "January February March April May June July August September October November December".split(" "),
            shortMonths: "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
            weekdays: "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
            decimalPoint: ".",
            numericSymbols: "kMGTPE".split(""),
            resetZoom: "Reset zoom",
            resetZoomTitle: "Reset zoom level 1:1",
            thousandsSep: " "
          },
          global: {},
          time: a.Time.prototype.defaultOptions,
          chart: {
            borderRadius: 0,
            defaultSeriesType: "line",
            ignoreHiddenSeries: true,
            spacing: [10, 10, 15, 10],
            resetZoomButton: {
              theme: {
                zIndex: 6
              },
              position: {
                align: "right",
                x: -10,
                y: 10
              }
            },
            width: null,
            height: null,
            borderColor: "#335cad",
            backgroundColor: "#ffffff",
            plotBorderColor: "#cccccc"
          },
          title: {
            text: "Chart title",
            align: "center",
            margin: 15,
            widthAdjust: -44
          },
          subtitle: {
            text: "",
            align: "center",
            widthAdjust: -44
          },
          plotOptions: {},
          labels: {
            style: {
              position: "absolute",
              color: "#333333"
            }
          },
          legend: {
            enabled: true,
            align: "center",
            alignColumns: true,
            layout: "horizontal",
            labelFormatter: function() {
              return this.name;
            },
            borderColor: "#999999",
            borderRadius: 0,
            navigation: {
              activeColor: "#003399",
              inactiveColor: "#cccccc"
            },
            itemStyle: {
              color: "#333333",
              fontSize: "12px",
              fontWeight: "bold",
              textOverflow: "ellipsis"
            },
            itemHoverStyle: {
              color: "#000000"
            },
            itemHiddenStyle: {
              color: "#cccccc"
            },
            shadow: false,
            itemCheckboxStyle: {
              position: "absolute",
              width: "13px",
              height: "13px"
            },
            squareSymbol: true,
            symbolPadding: 5,
            verticalAlign: "bottom",
            x: 0,
            y: 0,
            title: {
              style: {
                fontWeight: "bold"
              }
            }
          },
          loading: {
            labelStyle: {
              fontWeight: "bold",
              position: "relative",
              top: "45%"
            },
            style: {
              position: "absolute",
              backgroundColor: "#ffffff",
              opacity: 0.5,
              textAlign: "center"
            }
          },
          tooltip: {
            enabled: true,
            animation: a.svg,
            borderRadius: 3,
            dateTimeLabelFormats: {
              millisecond: "%A, %b %e, %H:%M:%S.%L",
              second: "%A, %b %e, %H:%M:%S",
              minute: "%A, %b %e, %H:%M",
              hour: "%A, %b %e, %H:%M",
              day: "%A, %b %e, %Y",
              week: "Week from %A, %b %e, %Y",
              month: "%B %Y",
              year: "%Y"
            },
            footerFormat: "",
            padding: 8,
            snap: a.isTouchDevice ? 25 : 10,
            backgroundColor: C("#f7f7f7").setOpacity(0.85).get(),
            borderWidth: 1,
            headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
            pointFormat: '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y}</b><br/>',
            shadow: true,
            style: {
              color: "#333333",
              cursor: "default",
              fontSize: "12px",
              pointerEvents: "none",
              whiteSpace: "nowrap"
            }
          },
          credits: {
            enabled: true,
            href: "https://www.highcharts.com",
            position: {
              align: "right",
              x: -10,
              verticalAlign: "bottom",
              y: -5
            },
            style: {
              cursor: "pointer",
              color: "#999999",
              fontSize: "9px"
            },
            text: "Highcharts.com"
          }
        };
        a.setOptions = function(C2) {
          a.defaultOptions = F(true, a.defaultOptions, C2);
          a.time.update(F(a.defaultOptions.global, a.defaultOptions.time), false);
          return a.defaultOptions;
        };
        a.getOptions = function() {
          return a.defaultOptions;
        };
        a.defaultPlotOptions = a.defaultOptions.plotOptions;
        a.time = new a.Time(F(a.defaultOptions.global, a.defaultOptions.time));
        a.dateFormat = function(C2, n, f) {
          return a.time.dateFormat(C2, n, f);
        };
      })(K);
      (function(a) {
        var C = a.correctFloat, F = a.defined, I = a.destroyObjectProperties, n = a.fireEvent, f = a.isNumber, e = a.merge, u = a.pick, x = a.deg2rad;
        a.Tick = function(a2, e2, f2, c, h) {
          this.axis = a2;
          this.pos = e2;
          this.type = f2 || "";
          this.isNewLabel = this.isNew = true;
          this.parameters = h || {};
          this.tickmarkOffset = this.parameters.tickmarkOffset;
          this.options = this.parameters.options;
          f2 || c || this.addLabel();
        };
        a.Tick.prototype = {
          addLabel: function() {
            var f2 = this, w = f2.axis, y = w.options, c = w.chart, h = w.categories, p = w.names, k = f2.pos, q = u(f2.options && f2.options.labels, y.labels), d = w.tickPositions, b = k === d[0], v = k === d[d.length - 1], h = this.parameters.category || (h ? u(h[k], p[k], k) : k), J = f2.label, d = d.info, l, n2, B, D;
            w.isDatetimeAxis && d && (n2 = c.time.resolveDTLFormat(y.dateTimeLabelFormats[!y.grid && d.higherRanks[k] || d.unitName]), l = n2.main);
            f2.isFirst = b;
            f2.isLast = v;
            f2.formatCtx = {
              axis: w,
              chart: c,
              isFirst: b,
              isLast: v,
              dateTimeLabelFormat: l,
              tickPositionInfo: d,
              value: w.isLog ? C(w.lin2log(h)) : h,
              pos: k
            };
            y = w.labelFormatter.call(f2.formatCtx, this.formatCtx);
            if (D = n2 && n2.list) f2.shortenLabel = function() {
              for (B = 0; B < D.length; B++) if (J.attr({
                text: w.labelFormatter.call(a.extend(f2.formatCtx, {
                  dateTimeLabelFormat: D[B]
                }))
              }), J.getBBox().width < w.getSlotWidth(f2) - 2 * u(q.padding, 5)) return;
              J.attr({
                text: ""
              });
            };
            if (F(J)) J && J.textStr !== y && (!J.textWidth || q.style && q.style.width || J.styles.width || J.css({
              width: null
            }), J.attr({
              text: y
            }));
            else {
              if (f2.label = J = F(y) && q.enabled ? c.renderer.text(y, 0, 0, q.useHTML).css(e(q.style)).add(w.labelGroup) : null) J.textPxLength = J.getBBox().width;
              f2.rotation = 0;
            }
          },
          getLabelSize: function() {
            return this.label ? this.label.getBBox()[this.axis.horiz ? "height" : "width"] : 0;
          },
          handleOverflow: function(a2) {
            var e2 = this.axis, f2 = e2.options.labels, c = a2.x, h = e2.chart.chartWidth, p = e2.chart.spacing, k = u(e2.labelLeft, Math.min(e2.pos, p[3])), p = u(e2.labelRight, Math.max(e2.isRadial ? 0 : e2.pos + e2.len, h - p[1])), q = this.label, d = this.rotation, b = {
              left: 0,
              center: 0.5,
              right: 1
            }[e2.labelAlign || q.attr("align")], v = q.getBBox().width, J = e2.getSlotWidth(this), l = J, t = 1, B, D = {};
            if (d || "justify" !== u(f2.overflow, "justify")) 0 > d && c - b * v < k ? B = Math.round(c / Math.cos(d * x) - k) : 0 < d && c + b * v > p && (B = Math.round((h - c) / Math.cos(d * x)));
            else if (h = c + (1 - b) * v, c - b * v < k ? l = a2.x + l * (1 - b) - k : h > p && (l = p - a2.x + l * b, t = -1), l = Math.min(J, l), l < J && "center" === e2.labelAlign && (a2.x += t * (J - l - b * (J - Math.min(v, l)))), v > l || e2.autoRotation && (q.styles || {}).width) B = l;
            B && (this.shortenLabel ? this.shortenLabel() : (D.width = B, (f2.style || {}).textOverflow || (D.textOverflow = "ellipsis"), q.css(D)));
          },
          getPosition: function(e2, f2, y, c) {
            var h = this.axis, p = h.chart, k = c && p.oldChartHeight || p.chartHeight;
            e2 = {
              x: e2 ? a.correctFloat(h.translate(f2 + y, null, null, c) + h.transB) : h.left + h.offset + (h.opposite ? (c && p.oldChartWidth || p.chartWidth) - h.right - h.left : 0),
              y: e2 ? k - h.bottom + h.offset - (h.opposite ? h.height : 0) : a.correctFloat(k - h.translate(f2 + y, null, null, c) - h.transB)
            };
            n(this, "afterGetPosition", {
              pos: e2
            });
            return e2;
          },
          getLabelPosition: function(a2, e2, f2, c, h, p, k, q) {
            var d = this.axis, b = d.transA, v = d.reversed, J = d.staggerLines, l = d.tickRotCorr || {
              x: 0,
              y: 0
            }, t = h.y, B = c || d.reserveSpaceDefault ? 0 : -d.labelOffset * ("center" === d.labelAlign ? 0.5 : 1), D = {};
            F(t) || (t = 0 === d.side ? f2.rotation ? -8 : -f2.getBBox().height : 2 === d.side ? l.y + 8 : Math.cos(f2.rotation * x) * (l.y - f2.getBBox(false, 0).height / 2));
            a2 = a2 + h.x + B + l.x - (p && c ? p * b * (v ? -1 : 1) : 0);
            e2 = e2 + t - (p && !c ? p * b * (v ? 1 : -1) : 0);
            J && (f2 = k / (q || 1) % J, d.opposite && (f2 = J - f2 - 1), e2 += d.labelOffset / J * f2);
            D.x = a2;
            D.y = Math.round(e2);
            n(this, "afterGetLabelPosition", {
              pos: D
            });
            return D;
          },
          getMarkPath: function(a2, e2, f2, c, h, p) {
            return p.crispLine(["M", a2, e2, "L", a2 + (h ? 0 : -f2), e2 + (h ? f2 : 0)], c);
          },
          renderGridLine: function(a2, e2, f2) {
            var c = this.axis, h = c.options, p = this.gridLine, k = {}, q = this.pos, d = this.type, b = u(this.tickmarkOffset, c.tickmarkOffset), v = c.chart.renderer, J = d ? d + "Grid" : "grid", l = h[J + "LineWidth"], t = h[J + "LineColor"], h = h[J + "LineDashStyle"];
            p || (k.stroke = t, k["stroke-width"] = l, h && (k.dashstyle = h), d || (k.zIndex = 1), a2 && (e2 = 0), this.gridLine = p = v.path().attr(k).addClass("highcharts-" + (d ? d + "-" : "") + "grid-line").add(c.gridGroup));
            if (p && (f2 = c.getPlotLinePath(q + b, p.strokeWidth() * f2, a2, "pass"))) p[a2 || this.isNew ? "attr" : "animate"]({
              d: f2,
              opacity: e2
            });
          },
          renderMark: function(a2, e2, f2) {
            var c = this.axis, h = c.options, p = c.chart.renderer, k = this.type, q = k ? k + "Tick" : "tick", d = c.tickSize(q), b = this.mark, v = !b, J = a2.x;
            a2 = a2.y;
            var l = u(h[q + "Width"], !k && c.isXAxis ? 1 : 0), h = h[q + "Color"];
            d && (c.opposite && (d[0] = -d[0]), v && (this.mark = b = p.path().addClass("highcharts-" + (k ? k + "-" : "") + "tick").add(c.axisGroup), b.attr({
              stroke: h,
              "stroke-width": l
            })), b[v ? "attr" : "animate"]({
              d: this.getMarkPath(J, a2, d[0], b.strokeWidth() * f2, c.horiz, p),
              opacity: e2
            }));
          },
          renderLabel: function(a2, e2, y, c) {
            var h = this.axis, p = h.horiz, k = h.options, q = this.label, d = k.labels, b = d.step, h = u(this.tickmarkOffset, h.tickmarkOffset), v = true, J = a2.x;
            a2 = a2.y;
            q && f(J) && (q.xy = a2 = this.getLabelPosition(J, a2, q, p, d, h, c, b), this.isFirst && !this.isLast && !u(k.showFirstLabel, 1) || this.isLast && !this.isFirst && !u(k.showLastLabel, 1) ? v = false : !p || d.step || d.rotation || e2 || 0 === y || this.handleOverflow(a2), b && c % b && (v = false), v && f(a2.y) ? (a2.opacity = y, q[this.isNewLabel ? "attr" : "animate"](a2), this.isNewLabel = false) : (q.attr("y", -9999), this.isNewLabel = true));
          },
          render: function(e2, f2, y) {
            var c = this.axis, h = c.horiz, p = this.pos, k = u(this.tickmarkOffset, c.tickmarkOffset), p = this.getPosition(h, p, k, f2), k = p.x, q = p.y, c = h && k === c.pos + c.len || !h && q === c.pos ? -1 : 1;
            y = u(y, 1);
            this.isActive = true;
            this.renderGridLine(f2, y, c);
            this.renderMark(p, y, c);
            this.renderLabel(p, f2, y, e2);
            this.isNew = false;
            a.fireEvent(this, "afterRender");
          },
          destroy: function() {
            I(this, this.axis);
          }
        };
      })(K);
      var W = function(a) {
        var C = a.addEvent, F = a.animObject, I = a.arrayMax, n = a.arrayMin, f = a.color, e = a.correctFloat, u = a.defaultOptions, x = a.defined, t = a.deg2rad, w = a.destroyObjectProperties, y = a.each, c = a.extend, h = a.fireEvent, p = a.format, k = a.getMagnitude, q = a.grep, d = a.inArray, b = a.isArray, v = a.isNumber, J = a.isString, l = a.merge, L = a.normalizeTickInterval, B = a.objectEach, D = a.pick, m = a.removeEvent, G = a.splat, A = a.syncTimeout, N = a.Tick, E = function() {
          this.init.apply(this, arguments);
        };
        a.extend(E.prototype, {
          defaultOptions: {
            dateTimeLabelFormats: {
              millisecond: {
                main: "%H:%M:%S.%L",
                range: false
              },
              second: {
                main: "%H:%M:%S",
                range: false
              },
              minute: {
                main: "%H:%M",
                range: false
              },
              hour: {
                main: "%H:%M",
                range: false
              },
              day: {
                main: "%e. %b"
              },
              week: {
                main: "%e. %b"
              },
              month: {
                main: "%b '%y"
              },
              year: {
                main: "%Y"
              }
            },
            endOnTick: false,
            labels: {
              enabled: true,
              indentation: 10,
              x: 0,
              style: {
                color: "#666666",
                cursor: "default",
                fontSize: "11px"
              }
            },
            maxPadding: 0.01,
            minorTickLength: 2,
            minorTickPosition: "outside",
            minPadding: 0.01,
            startOfWeek: 1,
            startOnTick: false,
            tickLength: 10,
            tickPixelInterval: 100,
            tickmarkPlacement: "between",
            tickPosition: "outside",
            title: {
              align: "middle",
              style: {
                color: "#666666"
              }
            },
            type: "linear",
            minorGridLineColor: "#f2f2f2",
            minorGridLineWidth: 1,
            minorTickColor: "#999999",
            lineColor: "#ccd6eb",
            lineWidth: 1,
            gridLineColor: "#e6e6e6",
            tickColor: "#ccd6eb"
          },
          defaultYAxisOptions: {
            endOnTick: true,
            maxPadding: 0.05,
            minPadding: 0.05,
            tickPixelInterval: 72,
            showLastLabel: true,
            labels: {
              x: -8
            },
            startOnTick: true,
            title: {
              rotation: 270,
              text: "Values"
            },
            stackLabels: {
              allowOverlap: false,
              enabled: false,
              formatter: function() {
                return a.numberFormat(this.total, -1);
              },
              style: {
                color: "#000000",
                fontSize: "11px",
                fontWeight: "bold",
                textOutline: "1px contrast"
              }
            },
            gridLineWidth: 1,
            lineWidth: 0
          },
          defaultLeftAxisOptions: {
            labels: {
              x: -15
            },
            title: {
              rotation: 270
            }
          },
          defaultRightAxisOptions: {
            labels: {
              x: 15
            },
            title: {
              rotation: 90
            }
          },
          defaultBottomAxisOptions: {
            labels: {
              autoRotation: [-45],
              x: 0
            },
            title: {
              rotation: 0
            }
          },
          defaultTopAxisOptions: {
            labels: {
              autoRotation: [-45],
              x: 0
            },
            title: {
              rotation: 0
            }
          },
          init: function(a2, r) {
            var g = r.isX, b2 = this;
            b2.chart = a2;
            b2.horiz = a2.inverted && !b2.isZAxis ? !g : g;
            b2.isXAxis = g;
            b2.coll = b2.coll || (g ? "xAxis" : "yAxis");
            h(this, "init", {
              userOptions: r
            });
            b2.opposite = r.opposite;
            b2.side = r.side || (b2.horiz ? b2.opposite ? 0 : 2 : b2.opposite ? 1 : 3);
            b2.setOptions(r);
            var c2 = this.options, m2 = c2.type;
            b2.labelFormatter = c2.labels.formatter || b2.defaultLabelFormatter;
            b2.userOptions = r;
            b2.minPixelPadding = 0;
            b2.reversed = c2.reversed;
            b2.visible = false !== c2.visible;
            b2.zoomEnabled = false !== c2.zoomEnabled;
            b2.hasNames = "category" === m2 || true === c2.categories;
            b2.categories = c2.categories || b2.hasNames;
            b2.names || (b2.names = [], b2.names.keys = {});
            b2.plotLinesAndBandsGroups = {};
            b2.isLog = "logarithmic" === m2;
            b2.isDatetimeAxis = "datetime" === m2;
            b2.positiveValuesOnly = b2.isLog && !b2.allowNegativeLog;
            b2.isLinked = x(c2.linkedTo);
            b2.ticks = {};
            b2.labelEdge = [];
            b2.minorTicks = {};
            b2.plotLinesAndBands = [];
            b2.alternateBands = {};
            b2.len = 0;
            b2.minRange = b2.userMinRange = c2.minRange || c2.maxZoom;
            b2.range = c2.range;
            b2.offset = c2.offset || 0;
            b2.stacks = {};
            b2.oldStacks = {};
            b2.stacksTouched = 0;
            b2.max = null;
            b2.min = null;
            b2.crosshair = D(c2.crosshair, G(a2.options.tooltip.crosshairs)[g ? 0 : 1], false);
            r = b2.options.events;
            -1 === d(b2, a2.axes) && (g ? a2.axes.splice(a2.xAxis.length, 0, b2) : a2.axes.push(b2), a2[b2.coll].push(b2));
            b2.series = b2.series || [];
            a2.inverted && !b2.isZAxis && g && void 0 === b2.reversed && (b2.reversed = true);
            B(r, function(a3, g2) {
              C(b2, g2, a3);
            });
            b2.lin2log = c2.linearToLogConverter || b2.lin2log;
            b2.isLog && (b2.val2lin = b2.log2lin, b2.lin2val = b2.lin2log);
            h(this, "afterInit");
          },
          setOptions: function(a2) {
            this.options = l(this.defaultOptions, "yAxis" === this.coll && this.defaultYAxisOptions, [this.defaultTopAxisOptions, this.defaultRightAxisOptions, this.defaultBottomAxisOptions, this.defaultLeftAxisOptions][this.side], l(u[this.coll], a2));
            h(this, "afterSetOptions", {
              userOptions: a2
            });
          },
          defaultLabelFormatter: function() {
            var g = this.axis, r = this.value, b2 = g.chart.time, d2 = g.categories, c2 = this.dateTimeLabelFormat, m2 = u.lang, k2 = m2.numericSymbols, m2 = m2.numericSymbolMagnitude || 1e3, h2 = k2 && k2.length, l2, q2 = g.options.labels.format, g = g.isLog ? Math.abs(r) : g.tickInterval;
            if (q2) l2 = p(q2, this, b2);
            else if (d2) l2 = r;
            else if (c2) l2 = b2.dateFormat(c2, r);
            else if (h2 && 1e3 <= g) for (; h2-- && void 0 === l2; ) b2 = Math.pow(m2, h2 + 1), g >= b2 && 0 === 10 * r % b2 && null !== k2[h2] && 0 !== r && (l2 = a.numberFormat(r / b2, -1) + k2[h2]);
            void 0 === l2 && (l2 = 1e4 <= Math.abs(r) ? a.numberFormat(r, -1) : a.numberFormat(r, -1, void 0, ""));
            return l2;
          },
          getSeriesExtremes: function() {
            var a2 = this, r = a2.chart;
            h(this, "getSeriesExtremes", null, function() {
              a2.hasVisibleSeries = false;
              a2.dataMin = a2.dataMax = a2.threshold = null;
              a2.softThreshold = !a2.isXAxis;
              a2.buildStacks && a2.buildStacks();
              y(a2.series, function(g) {
                if (g.visible || !r.options.chart.ignoreHiddenSeries) {
                  var b2 = g.options, d2 = b2.threshold, c2;
                  a2.hasVisibleSeries = true;
                  a2.positiveValuesOnly && 0 >= d2 && (d2 = null);
                  if (a2.isXAxis) b2 = g.xData, b2.length && (g = n(b2), c2 = I(b2), v(g) || g instanceof Date || (b2 = q(b2, v), g = n(b2), c2 = I(b2)), b2.length && (a2.dataMin = Math.min(D(a2.dataMin, b2[0], g), g), a2.dataMax = Math.max(D(a2.dataMax, b2[0], c2), c2)));
                  else if (g.getExtremes(), c2 = g.dataMax, g = g.dataMin, x(g) && x(c2) && (a2.dataMin = Math.min(D(a2.dataMin, g), g), a2.dataMax = Math.max(D(a2.dataMax, c2), c2)), x(d2) && (a2.threshold = d2), !b2.softThreshold || a2.positiveValuesOnly) a2.softThreshold = false;
                }
              });
            });
            h(this, "afterGetSeriesExtremes");
          },
          translate: function(a2, r, b2, d2, c2, m2) {
            var g = this.linkedParent || this, k2 = 1, H = 0, l2 = d2 ? g.oldTransA : g.transA;
            d2 = d2 ? g.oldMin : g.min;
            var h2 = g.minPixelPadding;
            c2 = (g.isOrdinal || g.isBroken || g.isLog && c2) && g.lin2val;
            l2 || (l2 = g.transA);
            b2 && (k2 *= -1, H = g.len);
            g.reversed && (k2 *= -1, H -= k2 * (g.sector || g.len));
            r ? (a2 = (a2 * k2 + H - h2) / l2 + d2, c2 && (a2 = g.lin2val(a2))) : (c2 && (a2 = g.val2lin(a2)), a2 = v(d2) ? k2 * (a2 - d2) * l2 + H + k2 * h2 + (v(m2) ? l2 * m2 : 0) : void 0);
            return a2;
          },
          toPixels: function(a2, r) {
            return this.translate(a2, false, !this.horiz, null, true) + (r ? 0 : this.pos);
          },
          toValue: function(a2, r) {
            return this.translate(a2 - (r ? 0 : this.pos), true, !this.horiz, null, true);
          },
          getPlotLinePath: function(a2, r, b2, d2, c2) {
            var g = this.chart, m2 = this.left, k2 = this.top, H, l2, h2 = b2 && g.oldChartHeight || g.chartHeight, q2 = b2 && g.oldChartWidth || g.chartWidth, A2;
            H = this.transB;
            var e2 = function(a3, g2, r2) {
              if ("pass" !== d2 && a3 < g2 || a3 > r2) d2 ? a3 = Math.min(Math.max(g2, a3), r2) : A2 = true;
              return a3;
            };
            c2 = D(c2, this.translate(a2, null, null, b2));
            c2 = Math.min(Math.max(-1e5, c2), 1e5);
            a2 = b2 = Math.round(c2 + H);
            H = l2 = Math.round(h2 - c2 - H);
            v(c2) ? this.horiz ? (H = k2, l2 = h2 - this.bottom, a2 = b2 = e2(a2, m2, m2 + this.width)) : (a2 = m2, b2 = q2 - this.right, H = l2 = e2(H, k2, k2 + this.height)) : (A2 = true, d2 = false);
            return A2 && !d2 ? null : g.renderer.crispLine(["M", a2, H, "L", b2, l2], r || 1);
          },
          getLinearTickPositions: function(a2, r, b2) {
            var g, d2 = e(Math.floor(r / a2) * a2);
            b2 = e(Math.ceil(b2 / a2) * a2);
            var c2 = [], m2;
            e(d2 + a2) === d2 && (m2 = 20);
            if (this.single) return [r];
            for (r = d2; r <= b2; ) {
              c2.push(r);
              r = e(r + a2, m2);
              if (r === g) break;
              g = r;
            }
            return c2;
          },
          getMinorTickInterval: function() {
            var a2 = this.options;
            return true === a2.minorTicks ? D(a2.minorTickInterval, "auto") : false === a2.minorTicks ? null : a2.minorTickInterval;
          },
          getMinorTickPositions: function() {
            var a2 = this, r = a2.options, b2 = a2.tickPositions, d2 = a2.minorTickInterval, c2 = [], m2 = a2.pointRangePadding || 0, k2 = a2.min - m2, m2 = a2.max + m2, l2 = m2 - k2;
            if (l2 && l2 / d2 < a2.len / 3) if (a2.isLog) y(this.paddedTicks, function(g, r2, b3) {
              r2 && c2.push.apply(c2, a2.getLogTickPositions(d2, b3[r2 - 1], b3[r2], true));
            });
            else if (a2.isDatetimeAxis && "auto" === this.getMinorTickInterval()) c2 = c2.concat(a2.getTimeTicks(a2.normalizeTimeTickInterval(d2), k2, m2, r.startOfWeek));
            else for (r = k2 + (b2[0] - k2) % d2; r <= m2 && r !== c2[0]; r += d2) c2.push(r);
            0 !== c2.length && a2.trimTicks(c2);
            return c2;
          },
          adjustForMinRange: function() {
            var a2 = this.options, r = this.min, b2 = this.max, d2, c2, m2, k2, l2, h2, q2, v2;
            this.isXAxis && void 0 === this.minRange && !this.isLog && (x(a2.min) || x(a2.max) ? this.minRange = null : (y(this.series, function(a3) {
              h2 = a3.xData;
              for (k2 = q2 = a3.xIncrement ? 1 : h2.length - 1; 0 < k2; k2--) if (l2 = h2[k2] - h2[k2 - 1], void 0 === m2 || l2 < m2) m2 = l2;
            }), this.minRange = Math.min(5 * m2, this.dataMax - this.dataMin)));
            b2 - r < this.minRange && (c2 = this.dataMax - this.dataMin >= this.minRange, v2 = this.minRange, d2 = (v2 - b2 + r) / 2, d2 = [r - d2, D(a2.min, r - d2)], c2 && (d2[2] = this.isLog ? this.log2lin(this.dataMin) : this.dataMin), r = I(d2), b2 = [r + v2, D(a2.max, r + v2)], c2 && (b2[2] = this.isLog ? this.log2lin(this.dataMax) : this.dataMax), b2 = n(b2), b2 - r < v2 && (d2[0] = b2 - v2, d2[1] = D(a2.min, b2 - v2), r = I(d2)));
            this.min = r;
            this.max = b2;
          },
          getClosest: function() {
            var a2;
            this.categories ? a2 = 1 : y(this.series, function(g) {
              var r = g.closestPointRange, b2 = g.visible || !g.chart.options.chart.ignoreHiddenSeries;
              !g.noSharedTooltip && x(r) && b2 && (a2 = x(a2) ? Math.min(a2, r) : r);
            });
            return a2;
          },
          nameToX: function(a2) {
            var g = b(this.categories), c2 = g ? this.categories : this.names, m2 = a2.options.x, k2;
            a2.series.requireSorting = false;
            x(m2) || (m2 = false === this.options.uniqueNames ? a2.series.autoIncrement() : g ? d(a2.name, c2) : D(c2.keys[a2.name], -1));
            -1 === m2 ? g || (k2 = c2.length) : k2 = m2;
            void 0 !== k2 && (this.names[k2] = a2.name, this.names.keys[a2.name] = k2);
            return k2;
          },
          updateNames: function() {
            var g = this, r = this.names;
            0 < r.length && (y(a.keys(r.keys), function(a2) {
              delete r.keys[a2];
            }), r.length = 0, this.minRange = this.userMinRange, y(this.series || [], function(a2) {
              a2.xIncrement = null;
              if (!a2.points || a2.isDirtyData) a2.processData(), a2.generatePoints();
              y(a2.points, function(r2, b2) {
                var d2;
                r2.options && (d2 = g.nameToX(r2), void 0 !== d2 && d2 !== r2.x && (r2.x = d2, a2.xData[b2] = d2));
              });
            }));
          },
          setAxisTranslation: function(a2) {
            var g = this, b2 = g.max - g.min, d2 = g.axisPointRange || 0, c2, m2 = 0, k2 = 0, l2 = g.linkedParent, q2 = !!g.categories, v2 = g.transA, A2 = g.isXAxis;
            if (A2 || q2 || d2) c2 = g.getClosest(), l2 ? (m2 = l2.minPointOffset, k2 = l2.pointRangePadding) : y(g.series, function(a3) {
              var b3 = q2 ? 1 : A2 ? D(a3.options.pointRange, c2, 0) : g.axisPointRange || 0;
              a3 = a3.options.pointPlacement;
              d2 = Math.max(d2, b3);
              g.single || (m2 = Math.max(m2, J(a3) ? 0 : b3 / 2), k2 = Math.max(k2, "on" === a3 ? 0 : b3));
            }), l2 = g.ordinalSlope && c2 ? g.ordinalSlope / c2 : 1, g.minPointOffset = m2 *= l2, g.pointRangePadding = k2 *= l2, g.pointRange = Math.min(d2, b2), A2 && (g.closestPointRange = c2);
            a2 && (g.oldTransA = v2);
            g.translationSlope = g.transA = v2 = g.staticScale || g.len / (b2 + k2 || 1);
            g.transB = g.horiz ? g.left : g.bottom;
            g.minPixelPadding = v2 * m2;
            h(this, "afterSetAxisTranslation");
          },
          minFromRange: function() {
            return this.max - this.range;
          },
          setTickInterval: function(g) {
            var b2 = this, d2 = b2.chart, c2 = b2.options, m2 = b2.isLog, l2 = b2.isDatetimeAxis, q2 = b2.isXAxis, A2 = b2.isLinked, p2 = c2.maxPadding, f2 = c2.minPadding, G2 = c2.tickInterval, B2 = c2.tickPixelInterval, J2 = b2.categories, E2 = v(b2.threshold) ? b2.threshold : null, N2 = b2.softThreshold, w2, t2, u2, n2;
            l2 || J2 || A2 || this.getTickAmount();
            u2 = D(b2.userMin, c2.min);
            n2 = D(b2.userMax, c2.max);
            A2 ? (b2.linkedParent = d2[b2.coll][c2.linkedTo], d2 = b2.linkedParent.getExtremes(), b2.min = D(d2.min, d2.dataMin), b2.max = D(d2.max, d2.dataMax), c2.type !== b2.linkedParent.options.type && a.error(11, 1)) : (!N2 && x(E2) && (b2.dataMin >= E2 ? (w2 = E2, f2 = 0) : b2.dataMax <= E2 && (t2 = E2, p2 = 0)), b2.min = D(u2, w2, b2.dataMin), b2.max = D(n2, t2, b2.dataMax));
            m2 && (b2.positiveValuesOnly && !g && 0 >= Math.min(b2.min, D(b2.dataMin, b2.min)) && a.error(10, 1), b2.min = e(b2.log2lin(b2.min), 15), b2.max = e(b2.log2lin(b2.max), 15));
            b2.range && x(b2.max) && (b2.userMin = b2.min = u2 = Math.max(b2.dataMin, b2.minFromRange()), b2.userMax = n2 = b2.max, b2.range = null);
            h(b2, "foundExtremes");
            b2.beforePadding && b2.beforePadding();
            b2.adjustForMinRange();
            !(J2 || b2.axisPointRange || b2.usePercentage || A2) && x(b2.min) && x(b2.max) && (d2 = b2.max - b2.min) && (!x(u2) && f2 && (b2.min -= d2 * f2), !x(n2) && p2 && (b2.max += d2 * p2));
            v(c2.softMin) && !v(b2.userMin) && (b2.min = Math.min(b2.min, c2.softMin));
            v(c2.softMax) && !v(b2.userMax) && (b2.max = Math.max(b2.max, c2.softMax));
            v(c2.floor) && (b2.min = Math.max(b2.min, c2.floor));
            v(c2.ceiling) && (b2.max = Math.min(b2.max, c2.ceiling));
            N2 && x(b2.dataMin) && (E2 = E2 || 0, !x(u2) && b2.min < E2 && b2.dataMin >= E2 ? b2.min = E2 : !x(n2) && b2.max > E2 && b2.dataMax <= E2 && (b2.max = E2));
            b2.tickInterval = b2.min === b2.max || void 0 === b2.min || void 0 === b2.max ? 1 : A2 && !G2 && B2 === b2.linkedParent.options.tickPixelInterval ? G2 = b2.linkedParent.tickInterval : D(G2, this.tickAmount ? (b2.max - b2.min) / Math.max(this.tickAmount - 1, 1) : void 0, J2 ? 1 : (b2.max - b2.min) * B2 / Math.max(b2.len, B2));
            q2 && !g && y(b2.series, function(a2) {
              a2.processData(b2.min !== b2.oldMin || b2.max !== b2.oldMax);
            });
            b2.setAxisTranslation(true);
            b2.beforeSetTickPositions && b2.beforeSetTickPositions();
            b2.postProcessTickInterval && (b2.tickInterval = b2.postProcessTickInterval(b2.tickInterval));
            b2.pointRange && !G2 && (b2.tickInterval = Math.max(b2.pointRange, b2.tickInterval));
            g = D(c2.minTickInterval, b2.isDatetimeAxis && b2.closestPointRange);
            !G2 && b2.tickInterval < g && (b2.tickInterval = g);
            l2 || m2 || G2 || (b2.tickInterval = L(b2.tickInterval, null, k(b2.tickInterval), D(c2.allowDecimals, !(0.5 < b2.tickInterval && 5 > b2.tickInterval && 1e3 < b2.max && 9999 > b2.max)), !!this.tickAmount));
            this.tickAmount || (b2.tickInterval = b2.unsquish());
            this.setTickPositions();
          },
          setTickPositions: function() {
            var g = this.options, b2, d2 = g.tickPositions;
            b2 = this.getMinorTickInterval();
            var c2 = g.tickPositioner, m2 = g.startOnTick, k2 = g.endOnTick;
            this.tickmarkOffset = this.categories && "between" === g.tickmarkPlacement && 1 === this.tickInterval ? 0.5 : 0;
            this.minorTickInterval = "auto" === b2 && this.tickInterval ? this.tickInterval / 5 : b2;
            this.single = this.min === this.max && x(this.min) && !this.tickAmount && (parseInt(this.min, 10) === this.min || false !== g.allowDecimals);
            this.tickPositions = b2 = d2 && d2.slice();
            !b2 && (!this.ordinalPositions && (this.max - this.min) / this.tickInterval > Math.max(2 * this.len, 200) ? (b2 = [this.min, this.max], a.error(19)) : b2 = this.isDatetimeAxis ? this.getTimeTicks(this.normalizeTimeTickInterval(this.tickInterval, g.units), this.min, this.max, g.startOfWeek, this.ordinalPositions, this.closestPointRange, true) : this.isLog ? this.getLogTickPositions(this.tickInterval, this.min, this.max) : this.getLinearTickPositions(this.tickInterval, this.min, this.max), b2.length > this.len && (b2 = [b2[0], b2.pop()], b2[0] === b2[1] && (b2.length = 1)), this.tickPositions = b2, c2 && (c2 = c2.apply(this, [this.min, this.max]))) && (this.tickPositions = b2 = c2);
            this.paddedTicks = b2.slice(0);
            this.trimTicks(b2, m2, k2);
            this.isLinked || (this.single && 2 > b2.length && (this.min -= 0.5, this.max += 0.5), d2 || c2 || this.adjustTickAmount());
            h(this, "afterSetTickPositions");
          },
          trimTicks: function(a2, b2, d2) {
            var g = a2[0], c2 = a2[a2.length - 1], m2 = this.minPointOffset || 0;
            if (!this.isLinked) {
              if (b2 && -Infinity !== g) this.min = g;
              else for (; this.min - m2 > a2[0]; ) a2.shift();
              if (d2) this.max = c2;
              else for (; this.max + m2 < a2[a2.length - 1]; ) a2.pop();
              0 === a2.length && x(g) && !this.options.tickPositions && a2.push((c2 + g) / 2);
            }
          },
          alignToOthers: function() {
            var a2 = {}, b2, d2 = this.options;
            false === this.chart.options.chart.alignTicks || false === d2.alignTicks || false === d2.startOnTick || false === d2.endOnTick || this.isLog || y(this.chart[this.coll], function(g) {
              var d3 = g.options, d3 = [g.horiz ? d3.left : d3.top, d3.width, d3.height, d3.pane].join();
              g.series.length && (a2[d3] ? b2 = true : a2[d3] = 1);
            });
            return b2;
          },
          getTickAmount: function() {
            var a2 = this.options, b2 = a2.tickAmount, d2 = a2.tickPixelInterval;
            !x(a2.tickInterval) && this.len < d2 && !this.isRadial && !this.isLog && a2.startOnTick && a2.endOnTick && (b2 = 2);
            !b2 && this.alignToOthers() && (b2 = Math.ceil(this.len / d2) + 1);
            4 > b2 && (this.finalTickAmt = b2, b2 = 5);
            this.tickAmount = b2;
          },
          adjustTickAmount: function() {
            var a2 = this.tickInterval, b2 = this.tickPositions, d2 = this.tickAmount, c2 = this.finalTickAmt, m2 = b2 && b2.length, k2 = D(this.threshold, this.softThreshold ? 0 : null);
            if (this.hasData()) {
              if (m2 < d2) {
                for (; b2.length < d2; ) b2.length % 2 || this.min === k2 ? b2.push(e(b2[b2.length - 1] + a2)) : b2.unshift(e(b2[0] - a2));
                this.transA *= (m2 - 1) / (d2 - 1);
                this.min = b2[0];
                this.max = b2[b2.length - 1];
              } else m2 > d2 && (this.tickInterval *= 2, this.setTickPositions());
              if (x(c2)) {
                for (a2 = d2 = b2.length; a2--; ) (3 === c2 && 1 === a2 % 2 || 2 >= c2 && 0 < a2 && a2 < d2 - 1) && b2.splice(a2, 1);
                this.finalTickAmt = void 0;
              }
            }
          },
          setScale: function() {
            var a2, b2;
            this.oldMin = this.min;
            this.oldMax = this.max;
            this.oldAxisLength = this.len;
            this.setAxisSize();
            b2 = this.len !== this.oldAxisLength;
            y(this.series, function(b3) {
              if (b3.isDirtyData || b3.isDirty || b3.xAxis.isDirty) a2 = true;
            });
            b2 || a2 || this.isLinked || this.forceRedraw || this.userMin !== this.oldUserMin || this.userMax !== this.oldUserMax || this.alignToOthers() ? (this.resetStacks && this.resetStacks(), this.forceRedraw = false, this.getSeriesExtremes(), this.setTickInterval(), this.oldUserMin = this.userMin, this.oldUserMax = this.userMax, this.isDirty || (this.isDirty = b2 || this.min !== this.oldMin || this.max !== this.oldMax)) : this.cleanStacks && this.cleanStacks();
            h(this, "afterSetScale");
          },
          setExtremes: function(a2, b2, d2, m2, k2) {
            var g = this, r = g.chart;
            d2 = D(d2, true);
            y(g.series, function(a3) {
              delete a3.kdTree;
            });
            k2 = c(k2, {
              min: a2,
              max: b2
            });
            h(g, "setExtremes", k2, function() {
              g.userMin = a2;
              g.userMax = b2;
              g.eventArgs = k2;
              d2 && r.redraw(m2);
            });
          },
          zoom: function(a2, b2) {
            var g = this.dataMin, d2 = this.dataMax, c2 = this.options, m2 = Math.min(g, D(c2.min, g)), c2 = Math.max(d2, D(c2.max, d2));
            if (a2 !== this.min || b2 !== this.max) this.allowZoomOutside || (x(g) && (a2 < m2 && (a2 = m2), a2 > c2 && (a2 = c2)), x(d2) && (b2 < m2 && (b2 = m2), b2 > c2 && (b2 = c2))), this.displayBtn = void 0 !== a2 || void 0 !== b2, this.setExtremes(a2, b2, false, void 0, {
              trigger: "zoom"
            });
            return true;
          },
          setAxisSize: function() {
            var b2 = this.chart, d2 = this.options, c2 = d2.offsets || [0, 0, 0, 0], m2 = this.horiz, k2 = this.width = Math.round(a.relativeLength(D(d2.width, b2.plotWidth - c2[3] + c2[1]), b2.plotWidth)), l2 = this.height = Math.round(a.relativeLength(D(d2.height, b2.plotHeight - c2[0] + c2[2]), b2.plotHeight)), h2 = this.top = Math.round(a.relativeLength(D(d2.top, b2.plotTop + c2[0]), b2.plotHeight, b2.plotTop)), d2 = this.left = Math.round(a.relativeLength(D(d2.left, b2.plotLeft + c2[3]), b2.plotWidth, b2.plotLeft));
            this.bottom = b2.chartHeight - l2 - h2;
            this.right = b2.chartWidth - k2 - d2;
            this.len = Math.max(m2 ? k2 : l2, 0);
            this.pos = m2 ? d2 : h2;
          },
          getExtremes: function() {
            var a2 = this.isLog;
            return {
              min: a2 ? e(this.lin2log(this.min)) : this.min,
              max: a2 ? e(this.lin2log(this.max)) : this.max,
              dataMin: this.dataMin,
              dataMax: this.dataMax,
              userMin: this.userMin,
              userMax: this.userMax
            };
          },
          getThreshold: function(a2) {
            var b2 = this.isLog, g = b2 ? this.lin2log(this.min) : this.min, b2 = b2 ? this.lin2log(this.max) : this.max;
            null === a2 || -Infinity === a2 ? a2 = g : Infinity === a2 ? a2 = b2 : g > a2 ? a2 = g : b2 < a2 && (a2 = b2);
            return this.translate(a2, 0, 1, 0, 1);
          },
          autoLabelAlign: function(a2) {
            a2 = (D(a2, 0) - 90 * this.side + 720) % 360;
            return 15 < a2 && 165 > a2 ? "right" : 195 < a2 && 345 > a2 ? "left" : "center";
          },
          tickSize: function(a2) {
            var b2 = this.options, g = b2[a2 + "Length"], d2 = D(b2[a2 + "Width"], "tick" === a2 && this.isXAxis ? 1 : 0);
            if (d2 && g) return "inside" === b2[a2 + "Position"] && (g = -g), [g, d2];
          },
          labelMetrics: function() {
            var a2 = this.tickPositions && this.tickPositions[0] || 0;
            return this.chart.renderer.fontMetrics(this.options.labels.style && this.options.labels.style.fontSize, this.ticks[a2] && this.ticks[a2].label);
          },
          unsquish: function() {
            var a2 = this.options.labels, b2 = this.horiz, d2 = this.tickInterval, c2 = d2, m2 = this.len / (((this.categories ? 1 : 0) + this.max - this.min) / d2), k2, l2 = a2.rotation, h2 = this.labelMetrics(), q2, v2 = Number.MAX_VALUE, A2, p2 = function(a3) {
              a3 /= m2 || 1;
              a3 = 1 < a3 ? Math.ceil(a3) : 1;
              return e(a3 * d2);
            };
            b2 ? (A2 = !a2.staggerLines && !a2.step && (x(l2) ? [l2] : m2 < D(a2.autoRotationLimit, 80) && a2.autoRotation)) && y(A2, function(a3) {
              var b3;
              if (a3 === l2 || a3 && -90 <= a3 && 90 >= a3) q2 = p2(Math.abs(h2.h / Math.sin(t * a3))), b3 = q2 + Math.abs(a3 / 360), b3 < v2 && (v2 = b3, k2 = a3, c2 = q2);
            }) : a2.step || (c2 = p2(h2.h));
            this.autoRotation = A2;
            this.labelRotation = D(k2, l2);
            return c2;
          },
          getSlotWidth: function(a2) {
            var b2 = this.chart, g = this.horiz, d2 = this.options.labels, c2 = Math.max(this.tickPositions.length - (this.categories ? 0 : 1), 1), m2 = b2.margin[3];
            return a2 && a2.slotWidth || g && 2 > (d2.step || 0) && !d2.rotation && (this.staggerLines || 1) * this.len / c2 || !g && (d2.style && parseInt(d2.style.width, 10) || m2 && m2 - b2.spacing[3] || 0.33 * b2.chartWidth);
          },
          renderUnsquish: function() {
            var a2 = this.chart, b2 = a2.renderer, d2 = this.tickPositions, c2 = this.ticks, m2 = this.options.labels, k2 = m2 && m2.style || {}, l2 = this.horiz, h2 = this.getSlotWidth(), q2 = Math.max(1, Math.round(h2 - 2 * (m2.padding || 5))), v2 = {}, A2 = this.labelMetrics(), e2 = m2.style && m2.style.textOverflow, p2, f2, G2 = 0, B2;
            J(m2.rotation) || (v2.rotation = m2.rotation || 0);
            y(d2, function(a3) {
              (a3 = c2[a3]) && a3.label && a3.label.textPxLength > G2 && (G2 = a3.label.textPxLength);
            });
            this.maxLabelLength = G2;
            if (this.autoRotation) G2 > q2 && G2 > A2.h ? v2.rotation = this.labelRotation : this.labelRotation = 0;
            else if (h2 && (p2 = q2, !e2)) {
              for (f2 = "clip", q2 = d2.length; !l2 && q2--; ) if (B2 = d2[q2], B2 = c2[B2].label) B2.styles && "ellipsis" === B2.styles.textOverflow ? B2.css({
                textOverflow: "clip"
              }) : B2.textPxLength > h2 && B2.css({
                width: h2 + "px"
              }), B2.getBBox().height > this.len / d2.length - (A2.h - A2.f) && (B2.specificTextOverflow = "ellipsis");
            }
            v2.rotation && (p2 = G2 > 0.5 * a2.chartHeight ? 0.33 * a2.chartHeight : G2, e2 || (f2 = "ellipsis"));
            if (this.labelAlign = m2.align || this.autoLabelAlign(this.labelRotation)) v2.align = this.labelAlign;
            y(d2, function(a3) {
              var b3 = (a3 = c2[a3]) && a3.label, g = k2.width, d3 = {};
              b3 && (b3.attr(v2), a3.shortenLabel ? a3.shortenLabel() : p2 && !g && "nowrap" !== k2.whiteSpace && (p2 < b3.textPxLength || "SPAN" === b3.element.tagName) ? (d3.width = p2, e2 || (d3.textOverflow = b3.specificTextOverflow || f2), b3.css(d3)) : b3.styles && b3.styles.width && !d3.width && !g && b3.css({
                width: null
              }), delete b3.specificTextOverflow, a3.rotation = v2.rotation);
            }, this);
            this.tickRotCorr = b2.rotCorr(A2.b, this.labelRotation || 0, 0 !== this.side);
          },
          hasData: function() {
            return this.hasVisibleSeries || x(this.min) && x(this.max) && this.tickPositions && 0 < this.tickPositions.length;
          },
          addTitle: function(a2) {
            var b2 = this.chart.renderer, g = this.horiz, d2 = this.opposite, c2 = this.options.title, m2;
            this.axisTitle || ((m2 = c2.textAlign) || (m2 = (g ? {
              low: "left",
              middle: "center",
              high: "right"
            } : {
              low: d2 ? "right" : "left",
              middle: "center",
              high: d2 ? "left" : "right"
            })[c2.align]), this.axisTitle = b2.text(c2.text, 0, 0, c2.useHTML).attr({
              zIndex: 7,
              rotation: c2.rotation || 0,
              align: m2
            }).addClass("highcharts-axis-title").css(l(c2.style)).add(this.axisGroup), this.axisTitle.isNew = true);
            c2.style.width || this.isRadial || this.axisTitle.css({
              width: this.len
            });
            this.axisTitle[a2 ? "show" : "hide"](true);
          },
          generateTick: function(a2) {
            var b2 = this.ticks;
            b2[a2] ? b2[a2].addLabel() : b2[a2] = new N(this, a2);
          },
          getOffset: function() {
            var a2 = this, b2 = a2.chart, d2 = b2.renderer, c2 = a2.options, m2 = a2.tickPositions, k2 = a2.ticks, l2 = a2.horiz, q2 = a2.side, v2 = b2.inverted && !a2.isZAxis ? [1, 0, 3, 2][q2] : q2, A2, e2, p2 = 0, G2, f2 = 0, J2 = c2.title, E2 = c2.labels, N2 = 0, w2 = b2.axisOffset, b2 = b2.clipOffset, t2 = [-1, 1, 1, -1][q2], u2 = c2.className, n2 = a2.axisParent;
            A2 = a2.hasData();
            a2.showAxis = e2 = A2 || D(c2.showEmpty, true);
            a2.staggerLines = a2.horiz && E2.staggerLines;
            a2.axisGroup || (a2.gridGroup = d2.g("grid").attr({
              zIndex: c2.gridZIndex || 1
            }).addClass("highcharts-" + this.coll.toLowerCase() + "-grid " + (u2 || "")).add(n2), a2.axisGroup = d2.g("axis").attr({
              zIndex: c2.zIndex || 2
            }).addClass("highcharts-" + this.coll.toLowerCase() + " " + (u2 || "")).add(n2), a2.labelGroup = d2.g("axis-labels").attr({
              zIndex: E2.zIndex || 7
            }).addClass("highcharts-" + a2.coll.toLowerCase() + "-labels " + (u2 || "")).add(n2));
            A2 || a2.isLinked ? (y(m2, function(b3, g) {
              a2.generateTick(b3, g);
            }), a2.renderUnsquish(), a2.reserveSpaceDefault = 0 === q2 || 2 === q2 || {
              1: "left",
              3: "right"
            }[q2] === a2.labelAlign, D(E2.reserveSpace, "center" === a2.labelAlign ? true : null, a2.reserveSpaceDefault) && y(m2, function(a3) {
              N2 = Math.max(k2[a3].getLabelSize(), N2);
            }), a2.staggerLines && (N2 *= a2.staggerLines), a2.labelOffset = N2 * (a2.opposite ? -1 : 1)) : B(k2, function(a3, b3) {
              a3.destroy();
              delete k2[b3];
            });
            J2 && J2.text && false !== J2.enabled && (a2.addTitle(e2), e2 && false !== J2.reserveSpace && (a2.titleOffset = p2 = a2.axisTitle.getBBox()[l2 ? "height" : "width"], G2 = J2.offset, f2 = x(G2) ? 0 : D(J2.margin, l2 ? 5 : 10)));
            a2.renderLine();
            a2.offset = t2 * D(c2.offset, w2[q2]);
            a2.tickRotCorr = a2.tickRotCorr || {
              x: 0,
              y: 0
            };
            d2 = 0 === q2 ? -a2.labelMetrics().h : 2 === q2 ? a2.tickRotCorr.y : 0;
            f2 = Math.abs(N2) + f2;
            N2 && (f2 = f2 - d2 + t2 * (l2 ? D(E2.y, a2.tickRotCorr.y + 8 * t2) : E2.x));
            a2.axisTitleMargin = D(G2, f2);
            a2.getMaxLabelDimensions && (a2.maxLabelDimensions = a2.getMaxLabelDimensions(k2, m2));
            l2 = this.tickSize("tick");
            w2[q2] = Math.max(w2[q2], a2.axisTitleMargin + p2 + t2 * a2.offset, f2, A2 && m2.length && l2 ? l2[0] + t2 * a2.offset : 0);
            c2 = c2.offset ? 0 : 2 * Math.floor(a2.axisLine.strokeWidth() / 2);
            b2[v2] = Math.max(b2[v2], c2);
            h(this, "afterGetOffset");
          },
          getLinePath: function(a2) {
            var b2 = this.chart, g = this.opposite, d2 = this.offset, c2 = this.horiz, m2 = this.left + (g ? this.width : 0) + d2, d2 = b2.chartHeight - this.bottom - (g ? this.height : 0) + d2;
            g && (a2 *= -1);
            return b2.renderer.crispLine(["M", c2 ? this.left : m2, c2 ? d2 : this.top, "L", c2 ? b2.chartWidth - this.right : m2, c2 ? d2 : b2.chartHeight - this.bottom], a2);
          },
          renderLine: function() {
            this.axisLine || (this.axisLine = this.chart.renderer.path().addClass("highcharts-axis-line").add(this.axisGroup), this.axisLine.attr({
              stroke: this.options.lineColor,
              "stroke-width": this.options.lineWidth,
              zIndex: 7
            }));
          },
          getTitlePosition: function() {
            var a2 = this.horiz, b2 = this.left, d2 = this.top, c2 = this.len, m2 = this.options.title, k2 = a2 ? b2 : d2, l2 = this.opposite, h2 = this.offset, q2 = m2.x || 0, v2 = m2.y || 0, A2 = this.axisTitle, e2 = this.chart.renderer.fontMetrics(m2.style && m2.style.fontSize, A2), A2 = Math.max(A2.getBBox(null, 0).height - e2.h - 1, 0), c2 = {
              low: k2 + (a2 ? 0 : c2),
              middle: k2 + c2 / 2,
              high: k2 + (a2 ? c2 : 0)
            }[m2.align], b2 = (a2 ? d2 + this.height : b2) + (a2 ? 1 : -1) * (l2 ? -1 : 1) * this.axisTitleMargin + [-A2, A2, e2.f, -A2][this.side];
            return {
              x: a2 ? c2 + q2 : b2 + (l2 ? this.width : 0) + h2 + q2,
              y: a2 ? b2 + v2 - (l2 ? this.height : 0) + h2 : c2 + v2
            };
          },
          renderMinorTick: function(a2) {
            var b2 = this.chart.hasRendered && v(this.oldMin), d2 = this.minorTicks;
            d2[a2] || (d2[a2] = new N(this, a2, "minor"));
            b2 && d2[a2].isNew && d2[a2].render(null, true);
            d2[a2].render(null, false, 1);
          },
          renderTick: function(a2, b2) {
            var d2 = this.isLinked, g = this.ticks, c2 = this.chart.hasRendered && v(this.oldMin);
            if (!d2 || a2 >= this.min && a2 <= this.max) g[a2] || (g[a2] = new N(this, a2)), c2 && g[a2].isNew && g[a2].render(b2, true, -1), g[a2].render(b2);
          },
          render: function() {
            var b2 = this, d2 = b2.chart, c2 = b2.options, m2 = b2.isLog, k2 = b2.isLinked, l2 = b2.tickPositions, q2 = b2.axisTitle, e2 = b2.ticks, p2 = b2.minorTicks, f2 = b2.alternateBands, G2 = c2.stackLabels, J2 = c2.alternateGridColor, E2 = b2.tickmarkOffset, D2 = b2.axisLine, t2 = b2.showAxis, w2 = F(d2.renderer.globalAnimation), u2, n2;
            b2.labelEdge.length = 0;
            b2.overlap = false;
            y([e2, p2, f2], function(a2) {
              B(a2, function(a3) {
                a3.isActive = false;
              });
            });
            if (b2.hasData() || k2) b2.minorTickInterval && !b2.categories && y(b2.getMinorTickPositions(), function(a2) {
              b2.renderMinorTick(a2);
            }), l2.length && (y(l2, function(a2, d3) {
              b2.renderTick(a2, d3);
            }), E2 && (0 === b2.min || b2.single) && (e2[-1] || (e2[-1] = new N(b2, -1, null, true)), e2[-1].render(-1))), J2 && y(l2, function(c3, g) {
              n2 = void 0 !== l2[g + 1] ? l2[g + 1] + E2 : b2.max - E2;
              0 === g % 2 && c3 < b2.max && n2 <= b2.max + (d2.polar ? -E2 : E2) && (f2[c3] || (f2[c3] = new a.PlotLineOrBand(b2)), u2 = c3 + E2, f2[c3].options = {
                from: m2 ? b2.lin2log(u2) : u2,
                to: m2 ? b2.lin2log(n2) : n2,
                color: J2
              }, f2[c3].render(), f2[c3].isActive = true);
            }), b2._addedPlotLB || (y((c2.plotLines || []).concat(c2.plotBands || []), function(a2) {
              b2.addPlotBandOrLine(a2);
            }), b2._addedPlotLB = true);
            y([e2, p2, f2], function(a2) {
              var b3, c3 = [], g = w2.duration;
              B(a2, function(a3, b4) {
                a3.isActive || (a3.render(b4, false, 0), a3.isActive = false, c3.push(b4));
              });
              A(function() {
                for (b3 = c3.length; b3--; ) a2[c3[b3]] && !a2[c3[b3]].isActive && (a2[c3[b3]].destroy(), delete a2[c3[b3]]);
              }, a2 !== f2 && d2.hasRendered && g ? g : 0);
            });
            D2 && (D2[D2.isPlaced ? "animate" : "attr"]({
              d: this.getLinePath(D2.strokeWidth())
            }), D2.isPlaced = true, D2[t2 ? "show" : "hide"](true));
            q2 && t2 && (c2 = b2.getTitlePosition(), v(c2.y) ? (q2[q2.isNew ? "attr" : "animate"](c2), q2.isNew = false) : (q2.attr("y", -9999), q2.isNew = true));
            G2 && G2.enabled && b2.renderStackTotals();
            b2.isDirty = false;
            h(this, "afterRender");
          },
          redraw: function() {
            this.visible && (this.render(), y(this.plotLinesAndBands, function(a2) {
              a2.render();
            }));
            y(this.series, function(a2) {
              a2.isDirty = true;
            });
          },
          keepProps: "extKey hcEvents names series userMax userMin".split(" "),
          destroy: function(a2) {
            var b2 = this, c2 = b2.stacks, g = b2.plotLinesAndBands, k2;
            h(this, "destroy", {
              keepEvents: a2
            });
            a2 || m(b2);
            B(c2, function(a3, b3) {
              w(a3);
              c2[b3] = null;
            });
            y([b2.ticks, b2.minorTicks, b2.alternateBands], function(a3) {
              w(a3);
            });
            if (g) for (a2 = g.length; a2--; ) g[a2].destroy();
            y("stackTotalGroup axisLine axisTitle axisGroup gridGroup labelGroup cross scrollbar".split(" "), function(a3) {
              b2[a3] && (b2[a3] = b2[a3].destroy());
            });
            for (k2 in b2.plotLinesAndBandsGroups) b2.plotLinesAndBandsGroups[k2] = b2.plotLinesAndBandsGroups[k2].destroy();
            B(b2, function(a3, c3) {
              -1 === d(c3, b2.keepProps) && delete b2[c3];
            });
          },
          drawCrosshair: function(a2, b2) {
            var d2, c2 = this.crosshair, g = D(c2.snap, true), m2, k2 = this.cross;
            h(this, "drawCrosshair", {
              e: a2,
              point: b2
            });
            a2 || (a2 = this.cross && this.cross.e);
            if (this.crosshair && false !== (x(b2) || !g)) {
              g ? x(b2) && (m2 = D(b2.crosshairPos, this.isXAxis ? b2.plotX : this.len - b2.plotY)) : m2 = a2 && (this.horiz ? a2.chartX - this.pos : this.len - a2.chartY + this.pos);
              x(m2) && (d2 = this.getPlotLinePath(b2 && (this.isXAxis ? b2.x : D(b2.stackY, b2.y)), null, null, null, m2) || null);
              if (!x(d2)) {
                this.hideCrosshair();
                return;
              }
              g = this.categories && !this.isRadial;
              k2 || (this.cross = k2 = this.chart.renderer.path().addClass("highcharts-crosshair highcharts-crosshair-" + (g ? "category " : "thin ") + c2.className).attr({
                zIndex: D(c2.zIndex, 2)
              }).add(), k2.attr({
                stroke: c2.color || (g ? f("#ccd6eb").setOpacity(0.25).get() : "#cccccc"),
                "stroke-width": D(c2.width, 1)
              }).css({
                "pointer-events": "none"
              }), c2.dashStyle && k2.attr({
                dashstyle: c2.dashStyle
              }));
              k2.show().attr({
                d: d2
              });
              g && !c2.width && k2.attr({
                "stroke-width": this.transA
              });
              this.cross.e = a2;
            } else this.hideCrosshair();
            h(this, "afterDrawCrosshair", {
              e: a2,
              point: b2
            });
          },
          hideCrosshair: function() {
            this.cross && this.cross.hide();
          }
        });
        return a.Axis = E;
      }(K);
      (function(a) {
        var C = a.Axis, F = a.getMagnitude, I = a.normalizeTickInterval, n = a.timeUnits;
        C.prototype.getTimeTicks = function() {
          return this.chart.time.getTimeTicks.apply(this.chart.time, arguments);
        };
        C.prototype.normalizeTimeTickInterval = function(a2, e) {
          var f = e || [["millisecond", [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]], ["second", [1, 2, 5, 10, 15, 30]], ["minute", [1, 2, 5, 10, 15, 30]], ["hour", [1, 2, 3, 4, 6, 8, 12]], ["day", [1, 2]], ["week", [1, 2]], ["month", [1, 2, 3, 4, 6]], ["year", null]];
          e = f[f.length - 1];
          var x = n[e[0]], t = e[1], w;
          for (w = 0; w < f.length && !(e = f[w], x = n[e[0]], t = e[1], f[w + 1] && a2 <= (x * t[t.length - 1] + n[f[w + 1][0]]) / 2); w++) ;
          x === n.year && a2 < 5 * x && (t = [1, 2, 5]);
          a2 = I(a2 / x, t, "year" === e[0] ? Math.max(F(a2 / x), 1) : 1);
          return {
            unitRange: x,
            count: a2,
            unitName: e[0]
          };
        };
      })(K);
      (function(a) {
        var C = a.Axis, F = a.getMagnitude, I = a.map, n = a.normalizeTickInterval, f = a.pick;
        C.prototype.getLogTickPositions = function(a2, u, x, t) {
          var e = this.options, y = this.len, c = [];
          t || (this._minorAutoInterval = null);
          if (0.5 <= a2) a2 = Math.round(a2), c = this.getLinearTickPositions(a2, u, x);
          else if (0.08 <= a2) for (var y = Math.floor(u), h, p, k, q, d, e = 0.3 < a2 ? [1, 2, 4] : 0.15 < a2 ? [1, 2, 4, 6, 8] : [1, 2, 3, 4, 5, 6, 7, 8, 9]; y < x + 1 && !d; y++) for (p = e.length, h = 0; h < p && !d; h++) k = this.log2lin(this.lin2log(y) * e[h]), k > u && (!t || q <= x) && void 0 !== q && c.push(q), q > x && (d = true), q = k;
          else u = this.lin2log(u), x = this.lin2log(x), a2 = t ? this.getMinorTickInterval() : e.tickInterval, a2 = f("auto" === a2 ? null : a2, this._minorAutoInterval, e.tickPixelInterval / (t ? 5 : 1) * (x - u) / ((t ? y / this.tickPositions.length : y) || 1)), a2 = n(a2, null, F(a2)), c = I(this.getLinearTickPositions(a2, u, x), this.log2lin), t || (this._minorAutoInterval = a2 / 5);
          t || (this.tickInterval = a2);
          return c;
        };
        C.prototype.log2lin = function(a2) {
          return Math.log(a2) / Math.LN10;
        };
        C.prototype.lin2log = function(a2) {
          return Math.pow(10, a2);
        };
      })(K);
      (function(a, C) {
        var F = a.arrayMax, I = a.arrayMin, n = a.defined, f = a.destroyObjectProperties, e = a.each, u = a.erase, x = a.merge, t = a.pick;
        a.PlotLineOrBand = function(a2, e2) {
          this.axis = a2;
          e2 && (this.options = e2, this.id = e2.id);
        };
        a.PlotLineOrBand.prototype = {
          render: function() {
            a.fireEvent(this, "render");
            var e2 = this, f2 = e2.axis, c = f2.horiz, h = e2.options, p = h.label, k = e2.label, q = h.to, d = h.from, b = h.value, v = n(d) && n(q), J = n(b), l = e2.svgElem, u2 = !l, B = [], D = h.color, m = t(h.zIndex, 0), G = h.events, B = {
              "class": "highcharts-plot-" + (v ? "band " : "line ") + (h.className || "")
            }, A = {}, N = f2.chart.renderer, E = v ? "bands" : "lines";
            f2.isLog && (d = f2.log2lin(d), q = f2.log2lin(q), b = f2.log2lin(b));
            J ? (B.stroke = D, B["stroke-width"] = h.width, h.dashStyle && (B.dashstyle = h.dashStyle)) : v && (D && (B.fill = D), h.borderWidth && (B.stroke = h.borderColor, B["stroke-width"] = h.borderWidth));
            A.zIndex = m;
            E += "-" + m;
            (D = f2.plotLinesAndBandsGroups[E]) || (f2.plotLinesAndBandsGroups[E] = D = N.g("plot-" + E).attr(A).add());
            u2 && (e2.svgElem = l = N.path().attr(B).add(D));
            if (J) B = f2.getPlotLinePath(b, l.strokeWidth());
            else if (v) B = f2.getPlotBandPath(d, q, h);
            else return;
            u2 && B && B.length ? (l.attr({
              d: B
            }), G && a.objectEach(G, function(a2, b2) {
              l.on(b2, function(a3) {
                G[b2].apply(e2, [a3]);
              });
            })) : l && (B ? (l.show(), l.animate({
              d: B
            })) : (l.hide(), k && (e2.label = k = k.destroy())));
            p && n(p.text) && B && B.length && 0 < f2.width && 0 < f2.height && !B.isFlat ? (p = x({
              align: c && v && "center",
              x: c ? !v && 4 : 10,
              verticalAlign: !c && v && "middle",
              y: c ? v ? 16 : 10 : v ? 6 : -4,
              rotation: c && !v && 90
            }, p), this.renderLabel(p, B, v, m)) : k && k.hide();
            return e2;
          },
          renderLabel: function(a2, e2, c, h) {
            var p = this.label, k = this.axis.chart.renderer;
            p || (p = {
              align: a2.textAlign || a2.align,
              rotation: a2.rotation,
              "class": "highcharts-plot-" + (c ? "band" : "line") + "-label " + (a2.className || "")
            }, p.zIndex = h, this.label = p = k.text(a2.text, 0, 0, a2.useHTML).attr(p).add(), p.css(a2.style));
            h = e2.xBounds || [e2[1], e2[4], c ? e2[6] : e2[1]];
            e2 = e2.yBounds || [e2[2], e2[5], c ? e2[7] : e2[2]];
            c = I(h);
            k = I(e2);
            p.align(a2, false, {
              x: c,
              y: k,
              width: F(h) - c,
              height: F(e2) - k
            });
            p.show();
          },
          destroy: function() {
            u(this.axis.plotLinesAndBands, this);
            delete this.axis;
            f(this);
          }
        };
        a.extend(C.prototype, {
          getPlotBandPath: function(a2, e2) {
            var c = this.getPlotLinePath(e2, null, null, true), h = this.getPlotLinePath(a2, null, null, true), p = [], k = this.horiz, q = 1, d;
            a2 = a2 < this.min && e2 < this.min || a2 > this.max && e2 > this.max;
            if (h && c) for (a2 && (d = h.toString() === c.toString(), q = 0), a2 = 0; a2 < h.length; a2 += 6) k && c[a2 + 1] === h[a2 + 1] ? (c[a2 + 1] += q, c[a2 + 4] += q) : k || c[a2 + 2] !== h[a2 + 2] || (c[a2 + 2] += q, c[a2 + 5] += q), p.push("M", h[a2 + 1], h[a2 + 2], "L", h[a2 + 4], h[a2 + 5], c[a2 + 4], c[a2 + 5], c[a2 + 1], c[a2 + 2], "z"), p.isFlat = d;
            return p;
          },
          addPlotBand: function(a2) {
            return this.addPlotBandOrLine(a2, "plotBands");
          },
          addPlotLine: function(a2) {
            return this.addPlotBandOrLine(a2, "plotLines");
          },
          addPlotBandOrLine: function(e2, f2) {
            var c = new a.PlotLineOrBand(this, e2).render(), h = this.userOptions;
            c && (f2 && (h[f2] = h[f2] || [], h[f2].push(e2)), this.plotLinesAndBands.push(c));
            return c;
          },
          removePlotBandOrLine: function(a2) {
            for (var f2 = this.plotLinesAndBands, c = this.options, h = this.userOptions, p = f2.length; p--; ) f2[p].id === a2 && f2[p].destroy();
            e([c.plotLines || [], h.plotLines || [], c.plotBands || [], h.plotBands || []], function(c2) {
              for (p = c2.length; p--; ) c2[p].id === a2 && u(c2, c2[p]);
            });
          },
          removePlotBand: function(a2) {
            this.removePlotBandOrLine(a2);
          },
          removePlotLine: function(a2) {
            this.removePlotBandOrLine(a2);
          }
        });
      })(K, W);
      (function(a) {
        var C = a.doc, F = a.each, I = a.extend, n = a.format, f = a.isNumber, e = a.map, u = a.merge, x = a.pick, t = a.splat, w = a.syncTimeout, y = a.timeUnits;
        a.Tooltip = function() {
          this.init.apply(this, arguments);
        };
        a.Tooltip.prototype = {
          init: function(a2, h) {
            this.chart = a2;
            this.options = h;
            this.crosshairs = [];
            this.now = {
              x: 0,
              y: 0
            };
            this.isHidden = true;
            this.split = h.split && !a2.inverted;
            this.shared = h.shared || this.split;
            this.outside = h.outside && !this.split;
          },
          cleanSplit: function(a2) {
            F(this.chart.series, function(c) {
              var h = c && c.tt;
              h && (!h.isActive || a2 ? c.tt = h.destroy() : h.isActive = false);
            });
          },
          getLabel: function() {
            var c = this.chart.renderer, h = this.options, e2;
            this.label || (this.outside && (this.container = e2 = a.doc.createElement("div"), e2.className = "highcharts-tooltip-container", a.css(e2, {
              position: "absolute",
              top: "1px",
              pointerEvents: h.style && h.style.pointerEvents
            }), a.doc.body.appendChild(e2), this.renderer = c = new a.Renderer(e2, 0, 0)), this.split ? this.label = c.g("tooltip") : (this.label = c.label("", 0, 0, h.shape || "callout", null, null, h.useHTML, null, "tooltip").attr({
              padding: h.padding,
              r: h.borderRadius
            }), this.label.attr({
              fill: h.backgroundColor,
              "stroke-width": h.borderWidth
            }).css(h.style).shadow(h.shadow)), this.outside && (this.label.attr({
              x: this.distance,
              y: this.distance
            }), this.label.xSetter = function(a2) {
              e2.style.left = a2 + "px";
            }, this.label.ySetter = function(a2) {
              e2.style.top = a2 + "px";
            }), this.label.attr({
              zIndex: 8
            }).add());
            return this.label;
          },
          update: function(a2) {
            this.destroy();
            u(true, this.chart.options.tooltip.userOptions, a2);
            this.init(this.chart, u(true, this.options, a2));
          },
          destroy: function() {
            this.label && (this.label = this.label.destroy());
            this.split && this.tt && (this.cleanSplit(this.chart, true), this.tt = this.tt.destroy());
            this.renderer && (this.renderer = this.renderer.destroy(), a.discardElement(this.container));
            a.clearTimeout(this.hideTimer);
            a.clearTimeout(this.tooltipTimeout);
          },
          move: function(c, h, e2, k) {
            var q = this, d = q.now, b = false !== q.options.animation && !q.isHidden && (1 < Math.abs(c - d.x) || 1 < Math.abs(h - d.y)), v = q.followPointer || 1 < q.len;
            I(d, {
              x: b ? (2 * d.x + c) / 3 : c,
              y: b ? (d.y + h) / 2 : h,
              anchorX: v ? void 0 : b ? (2 * d.anchorX + e2) / 3 : e2,
              anchorY: v ? void 0 : b ? (d.anchorY + k) / 2 : k
            });
            q.getLabel().attr(d);
            b && (a.clearTimeout(this.tooltipTimeout), this.tooltipTimeout = setTimeout(function() {
              q && q.move(c, h, e2, k);
            }, 32));
          },
          hide: function(c) {
            var h = this;
            a.clearTimeout(this.hideTimer);
            c = x(c, this.options.hideDelay, 500);
            this.isHidden || (this.hideTimer = w(function() {
              h.getLabel()[c ? "fadeOut" : "hide"]();
              h.isHidden = true;
            }, c));
          },
          getAnchor: function(a2, h) {
            var c = this.chart, k = c.pointer, q = c.inverted, d = c.plotTop, b = c.plotLeft, v = 0, f2 = 0, l, n2;
            a2 = t(a2);
            this.followPointer && h ? (void 0 === h.chartX && (h = k.normalize(h)), a2 = [h.chartX - c.plotLeft, h.chartY - d]) : a2[0].tooltipPos ? a2 = a2[0].tooltipPos : (F(a2, function(a3) {
              l = a3.series.yAxis;
              n2 = a3.series.xAxis;
              v += a3.plotX + (!q && n2 ? n2.left - b : 0);
              f2 += (a3.plotLow ? (a3.plotLow + a3.plotHigh) / 2 : a3.plotY) + (!q && l ? l.top - d : 0);
            }), v /= a2.length, f2 /= a2.length, a2 = [q ? c.plotWidth - f2 : v, this.shared && !q && 1 < a2.length && h ? h.chartY - d : q ? c.plotHeight - v : f2]);
            return e(a2, Math.round);
          },
          getPosition: function(a2, h, e2) {
            var c = this.chart, q = this.distance, d = {}, b = c.inverted && e2.h || 0, v, f2 = this.outside, l = f2 ? C.documentElement.clientWidth - 2 * q : c.chartWidth, p = f2 ? Math.max(C.body.scrollHeight, C.documentElement.scrollHeight, C.body.offsetHeight, C.documentElement.offsetHeight, C.documentElement.clientHeight) : c.chartHeight, B = c.pointer.chartPosition, D = ["y", p, h, (f2 ? B.top - q : 0) + e2.plotY + c.plotTop, f2 ? 0 : c.plotTop, f2 ? p : c.plotTop + c.plotHeight], m = ["x", l, a2, (f2 ? B.left - q : 0) + e2.plotX + c.plotLeft, f2 ? 0 : c.plotLeft, f2 ? l : c.plotLeft + c.plotWidth], G = !this.followPointer && x(e2.ttBelow, !c.inverted === !!e2.negative), A = function(a3, c2, g2, m2, k, l2) {
              var h2 = g2 < m2 - q, v2 = m2 + q + g2 < c2, A2 = m2 - q - g2;
              m2 += q;
              if (G && v2) d[a3] = m2;
              else if (!G && h2) d[a3] = A2;
              else if (h2) d[a3] = Math.min(l2 - g2, 0 > A2 - b ? A2 : A2 - b);
              else if (v2) d[a3] = Math.max(k, m2 + b + g2 > c2 ? m2 : m2 + b);
              else return false;
            }, N = function(a3, b2, c2, g2) {
              var m2;
              g2 < q || g2 > b2 - q ? m2 = false : d[a3] = g2 < c2 / 2 ? 1 : g2 > b2 - c2 / 2 ? b2 - c2 - 2 : g2 - c2 / 2;
              return m2;
            }, E = function(a3) {
              var b2 = D;
              D = m;
              m = b2;
              v = a3;
            }, g = function() {
              false !== A.apply(0, D) ? false !== N.apply(0, m) || v || (E(true), g()) : v ? d.x = d.y = 0 : (E(true), g());
            };
            (c.inverted || 1 < this.len) && E();
            g();
            return d;
          },
          defaultFormatter: function(a2) {
            var c = this.points || t(this), e2;
            e2 = [a2.tooltipFooterHeaderFormatter(c[0])];
            e2 = e2.concat(a2.bodyFormatter(c));
            e2.push(a2.tooltipFooterHeaderFormatter(c[0], true));
            return e2;
          },
          refresh: function(c, h) {
            var e2, k = this.options, q, d = c, b, v = {}, f2 = [];
            e2 = k.formatter || this.defaultFormatter;
            var v = this.shared, l;
            k.enabled && (a.clearTimeout(this.hideTimer), this.followPointer = t(d)[0].series.tooltipOptions.followPointer, b = this.getAnchor(d, h), h = b[0], q = b[1], !v || d.series && d.series.noSharedTooltip ? v = d.getLabelConfig() : (F(d, function(a2) {
              a2.setState("hover");
              f2.push(a2.getLabelConfig());
            }), v = {
              x: d[0].category,
              y: d[0].y
            }, v.points = f2, d = d[0]), this.len = f2.length, v = e2.call(v, this), l = d.series, this.distance = x(l.tooltipOptions.distance, 16), false === v ? this.hide() : (e2 = this.getLabel(), this.isHidden && e2.attr({
              opacity: 1
            }).show(), this.split ? this.renderSplit(v, t(c)) : (k.style.width || e2.css({
              width: this.chart.spacingBox.width
            }), e2.attr({
              text: v && v.join ? v.join("") : v
            }), e2.removeClass(/highcharts-color-[\d]+/g).addClass("highcharts-color-" + x(d.colorIndex, l.colorIndex)), e2.attr({
              stroke: k.borderColor || d.color || l.color || "#666666"
            }), this.updatePosition({
              plotX: h,
              plotY: q,
              negative: d.negative,
              ttBelow: d.ttBelow,
              h: b[2] || 0
            })), this.isHidden = false));
          },
          renderSplit: function(c, h) {
            var e2 = this, k = [], q = this.chart, d = q.renderer, b = true, v = this.options, f2 = 0, l, t2 = this.getLabel(), B = q.plotTop;
            a.isString(c) && (c = [false, c]);
            F(c.slice(0, h.length + 1), function(a2, c2) {
              if (false !== a2) {
                c2 = h[c2 - 1] || {
                  isHeader: true,
                  plotX: h[0].plotX
                };
                var m = c2.series || e2, A = m.tt, p = c2.series || {}, E = "highcharts-color-" + x(c2.colorIndex, p.colorIndex, "none");
                A || (m.tt = A = d.label(null, null, null, "callout", null, null, v.useHTML).addClass("highcharts-tooltip-box " + E + (c2.isHeader ? " highcharts-tooltip-header" : "")).attr({
                  padding: v.padding,
                  r: v.borderRadius,
                  fill: v.backgroundColor,
                  stroke: v.borderColor || c2.color || p.color || "#333333",
                  "stroke-width": v.borderWidth
                }).add(t2));
                A.isActive = true;
                A.attr({
                  text: a2
                });
                A.css(v.style).shadow(v.shadow);
                a2 = A.getBBox();
                p = a2.width + A.strokeWidth();
                c2.isHeader ? (f2 = a2.height, q.xAxis[0].opposite && (l = true, B -= f2), p = Math.max(0, Math.min(c2.plotX + q.plotLeft - p / 2, q.chartWidth + (q.scrollablePixels ? q.scrollablePixels - q.marginRight : 0) - p))) : p = c2.plotX + q.plotLeft - x(v.distance, 16) - p;
                0 > p && (b = false);
                a2 = (c2.series && c2.series.yAxis && c2.series.yAxis.pos) + (c2.plotY || 0);
                a2 -= B;
                c2.isHeader && (a2 = l ? -f2 : q.plotHeight + f2);
                k.push({
                  target: a2,
                  rank: c2.isHeader ? 1 : 0,
                  size: m.tt.getBBox().height + 1,
                  point: c2,
                  x: p,
                  tt: A
                });
              }
            });
            this.cleanSplit();
            a.distribute(k, q.plotHeight + f2);
            F(k, function(a2) {
              var c2 = a2.point, d2 = c2.series;
              a2.tt.attr({
                visibility: void 0 === a2.pos ? "hidden" : "inherit",
                x: b || c2.isHeader ? a2.x : c2.plotX + q.plotLeft + x(v.distance, 16),
                y: a2.pos + B,
                anchorX: c2.isHeader ? c2.plotX + q.plotLeft : c2.plotX + d2.xAxis.pos,
                anchorY: c2.isHeader ? q.plotTop + q.plotHeight / 2 : c2.plotY + d2.yAxis.pos
              });
            });
          },
          updatePosition: function(a2) {
            var c = this.chart, e2 = this.getLabel(), k = (this.options.positioner || this.getPosition).call(this, e2.width, e2.height, a2), q = a2.plotX + c.plotLeft;
            a2 = a2.plotY + c.plotTop;
            var d;
            this.outside && (d = (this.options.borderWidth || 0) + 2 * this.distance, this.renderer.setSize(e2.width + d, e2.height + d, false), q += c.pointer.chartPosition.left - k.x, a2 += c.pointer.chartPosition.top - k.y);
            this.move(Math.round(k.x), Math.round(k.y || 0), q, a2);
          },
          getDateFormat: function(a2, h, e2, k) {
            var c = this.chart.time, d = c.dateFormat("%m-%d %H:%M:%S.%L", h), b, v, f2 = {
              millisecond: 15,
              second: 12,
              minute: 9,
              hour: 6,
              day: 3
            }, l = "millisecond";
            for (v in y) {
              if (a2 === y.week && +c.dateFormat("%w", h) === e2 && "00:00:00.000" === d.substr(6)) {
                v = "week";
                break;
              }
              if (y[v] > a2) {
                v = l;
                break;
              }
              if (f2[v] && d.substr(f2[v]) !== "01-01 00:00:00.000".substr(f2[v])) break;
              "week" !== v && (l = v);
            }
            v && (b = c.resolveDTLFormat(k[v]).main);
            return b;
          },
          getXDateFormat: function(a2, h, e2) {
            h = h.dateTimeLabelFormats;
            var c = e2 && e2.closestPointRange;
            return (c ? this.getDateFormat(c, a2.x, e2.options.startOfWeek, h) : h.day) || h.year;
          },
          tooltipFooterHeaderFormatter: function(a2, h) {
            h = h ? "footer" : "header";
            var c = a2.series, k = c.tooltipOptions, e2 = k.xDateFormat, d = c.xAxis, b = d && "datetime" === d.options.type && f(a2.key), v = k[h + "Format"];
            b && !e2 && (e2 = this.getXDateFormat(a2, k, d));
            b && e2 && F(a2.point && a2.point.tooltipDateKeys || ["key"], function(a3) {
              v = v.replace("{point." + a3 + "}", "{point." + a3 + ":" + e2 + "}");
            });
            return n(v, {
              point: a2,
              series: c
            }, this.chart.time);
          },
          bodyFormatter: function(a2) {
            return e(a2, function(a3) {
              var c = a3.series.tooltipOptions;
              return (c[(a3.point.formatPrefix || "point") + "Formatter"] || a3.point.tooltipFormatter).call(a3.point, c[(a3.point.formatPrefix || "point") + "Format"]);
            });
          }
        };
      })(K);
      (function(a) {
        var C = a.addEvent, F = a.attr, I = a.charts, n = a.color, f = a.css, e = a.defined, u = a.each, x = a.extend, t = a.find, w = a.fireEvent, y = a.isNumber, c = a.isObject, h = a.offset, p = a.pick, k = a.splat, q = a.Tooltip;
        a.Pointer = function(a2, b) {
          this.init(a2, b);
        };
        a.Pointer.prototype = {
          init: function(a2, b) {
            this.options = b;
            this.chart = a2;
            this.runChartClick = b.chart.events && !!b.chart.events.click;
            this.pinchDown = [];
            this.lastValidTouch = {};
            q && (a2.tooltip = new q(a2, b.tooltip), this.followTouchMove = p(b.tooltip.followTouchMove, true));
            this.setDOMEvents();
          },
          zoomOption: function(a2) {
            var b = this.chart, c2 = b.options.chart, d = c2.zoomType || "", b = b.inverted;
            /touch/.test(a2.type) && (d = p(c2.pinchType, d));
            this.zoomX = a2 = /x/.test(d);
            this.zoomY = d = /y/.test(d);
            this.zoomHor = a2 && !b || d && b;
            this.zoomVert = d && !b || a2 && b;
            this.hasZoom = a2 || d;
          },
          normalize: function(a2, b) {
            var c2;
            c2 = a2.touches ? a2.touches.length ? a2.touches.item(0) : a2.changedTouches[0] : a2;
            b || (this.chartPosition = b = h(this.chart.container));
            return x(a2, {
              chartX: Math.round(c2.pageX - b.left),
              chartY: Math.round(c2.pageY - b.top)
            });
          },
          getCoordinates: function(a2) {
            var b = {
              xAxis: [],
              yAxis: []
            };
            u(this.chart.axes, function(c2) {
              b[c2.isXAxis ? "xAxis" : "yAxis"].push({
                axis: c2,
                value: c2.toValue(a2[c2.horiz ? "chartX" : "chartY"])
              });
            });
            return b;
          },
          findNearestKDPoint: function(a2, b, k2) {
            var d;
            u(a2, function(a3) {
              var l = !(a3.noSharedTooltip && b) && 0 > a3.options.findNearestPointBy.indexOf("y");
              a3 = a3.searchPoint(k2, l);
              if ((l = c(a3, true)) && !(l = !c(d, true))) var l = d.distX - a3.distX, e2 = d.dist - a3.dist, h2 = (a3.series.group && a3.series.group.zIndex) - (d.series.group && d.series.group.zIndex), l = 0 < (0 !== l && b ? l : 0 !== e2 ? e2 : 0 !== h2 ? h2 : d.series.index > a3.series.index ? -1 : 1);
              l && (d = a3);
            });
            return d;
          },
          getPointFromEvent: function(a2) {
            a2 = a2.target;
            for (var b; a2 && !b; ) b = a2.point, a2 = a2.parentNode;
            return b;
          },
          getChartCoordinatesFromPoint: function(a2, b) {
            var c2 = a2.series, d = c2.xAxis, c2 = c2.yAxis, k2 = p(a2.clientX, a2.plotX), e2 = a2.shapeArgs;
            if (d && c2) return b ? {
              chartX: d.len + d.pos - k2,
              chartY: c2.len + c2.pos - a2.plotY
            } : {
              chartX: k2 + d.pos,
              chartY: a2.plotY + c2.pos
            };
            if (e2 && e2.x && e2.y) return {
              chartX: e2.x,
              chartY: e2.y
            };
          },
          getHoverData: function(d, b, k2, e2, l, h2, q2) {
            var v, m = [], f2 = q2 && q2.isBoosting;
            e2 = !(!e2 || !d);
            q2 = b && !b.stickyTracking ? [b] : a.grep(k2, function(a2) {
              return a2.visible && !(!l && a2.directTouch) && p(a2.options.enableMouseTracking, true) && a2.stickyTracking;
            });
            b = (v = e2 ? d : this.findNearestKDPoint(q2, l, h2)) && v.series;
            v && (l && !b.noSharedTooltip ? (q2 = a.grep(k2, function(a2) {
              return a2.visible && !(!l && a2.directTouch) && p(a2.options.enableMouseTracking, true) && !a2.noSharedTooltip;
            }), u(q2, function(a2) {
              var b2 = t(a2.points, function(a3) {
                return a3.x === v.x && !a3.isNull;
              });
              c(b2) && (f2 && (b2 = a2.getPoint(b2)), m.push(b2));
            })) : m.push(v));
            return {
              hoverPoint: v,
              hoverSeries: b,
              hoverPoints: m
            };
          },
          runPointActions: function(c2, b) {
            var d = this.chart, k2 = d.tooltip && d.tooltip.options.enabled ? d.tooltip : void 0, l = k2 ? k2.shared : false, e2 = b || d.hoverPoint, h2 = e2 && e2.series || d.hoverSeries, h2 = this.getHoverData(e2, h2, d.series, "touchmove" !== c2.type && (!!b || h2 && h2.directTouch && this.isDirectTouch), l, c2, {
              isBoosting: d.isBoosting
            }), q2, e2 = h2.hoverPoint;
            q2 = h2.hoverPoints;
            b = (h2 = h2.hoverSeries) && h2.tooltipOptions.followPointer;
            l = l && h2 && !h2.noSharedTooltip;
            if (e2 && (e2 !== d.hoverPoint || k2 && k2.isHidden)) {
              u(d.hoverPoints || [], function(b2) {
                -1 === a.inArray(b2, q2) && b2.setState();
              });
              u(q2 || [], function(a2) {
                a2.setState("hover");
              });
              if (d.hoverSeries !== h2) h2.onMouseOver();
              d.hoverPoint && d.hoverPoint.firePointEvent("mouseOut");
              if (!e2.series) return;
              e2.firePointEvent("mouseOver");
              d.hoverPoints = q2;
              d.hoverPoint = e2;
              k2 && k2.refresh(l ? q2 : e2, c2);
            } else b && k2 && !k2.isHidden && (e2 = k2.getAnchor([{}], c2), k2.updatePosition({
              plotX: e2[0],
              plotY: e2[1]
            }));
            this.unDocMouseMove || (this.unDocMouseMove = C(d.container.ownerDocument, "mousemove", function(b2) {
              var c3 = I[a.hoverChartIndex];
              if (c3) c3.pointer.onDocumentMouseMove(b2);
            }));
            u(d.axes, function(b2) {
              var d2 = p(b2.crosshair.snap, true), m = d2 ? a.find(q2, function(a2) {
                return a2.series[b2.coll] === b2;
              }) : void 0;
              m || !d2 ? b2.drawCrosshair(c2, m) : b2.hideCrosshair();
            });
          },
          reset: function(a2, b) {
            var c2 = this.chart, d = c2.hoverSeries, l = c2.hoverPoint, e2 = c2.hoverPoints, h2 = c2.tooltip, q2 = h2 && h2.shared ? e2 : l;
            a2 && q2 && u(k(q2), function(b2) {
              b2.series.isCartesian && void 0 === b2.plotX && (a2 = false);
            });
            if (a2) h2 && q2 && (h2.refresh(q2), h2.shared && e2 ? u(e2, function(a3) {
              a3.setState(a3.state, true);
              a3.series.isCartesian && (a3.series.xAxis.crosshair && a3.series.xAxis.drawCrosshair(null, a3), a3.series.yAxis.crosshair && a3.series.yAxis.drawCrosshair(null, a3));
            }) : l && (l.setState(l.state, true), u(c2.axes, function(a3) {
              a3.crosshair && a3.drawCrosshair(null, l);
            })));
            else {
              if (l) l.onMouseOut();
              e2 && u(e2, function(a3) {
                a3.setState();
              });
              if (d) d.onMouseOut();
              h2 && h2.hide(b);
              this.unDocMouseMove && (this.unDocMouseMove = this.unDocMouseMove());
              u(c2.axes, function(a3) {
                a3.hideCrosshair();
              });
              this.hoverX = c2.hoverPoints = c2.hoverPoint = null;
            }
          },
          scaleGroups: function(a2, b) {
            var c2 = this.chart, d;
            u(c2.series, function(k2) {
              d = a2 || k2.getPlotBox();
              k2.xAxis && k2.xAxis.zoomEnabled && k2.group && (k2.group.attr(d), k2.markerGroup && (k2.markerGroup.attr(d), k2.markerGroup.clip(b ? c2.clipRect : null)), k2.dataLabelsGroup && k2.dataLabelsGroup.attr(d));
            });
            c2.clipRect.attr(b || c2.clipBox);
          },
          dragStart: function(a2) {
            var b = this.chart;
            b.mouseIsDown = a2.type;
            b.cancelClick = false;
            b.mouseDownX = this.mouseDownX = a2.chartX;
            b.mouseDownY = this.mouseDownY = a2.chartY;
          },
          drag: function(a2) {
            var b = this.chart, c2 = b.options.chart, d = a2.chartX, k2 = a2.chartY, e2 = this.zoomHor, h2 = this.zoomVert, q2 = b.plotLeft, m = b.plotTop, f2 = b.plotWidth, A = b.plotHeight, p2, E = this.selectionMarker, g = this.mouseDownX, r = this.mouseDownY, t2 = c2.panKey && a2[c2.panKey + "Key"];
            E && E.touch || (d < q2 ? d = q2 : d > q2 + f2 && (d = q2 + f2), k2 < m ? k2 = m : k2 > m + A && (k2 = m + A), this.hasDragged = Math.sqrt(Math.pow(g - d, 2) + Math.pow(r - k2, 2)), 10 < this.hasDragged && (p2 = b.isInsidePlot(g - q2, r - m), b.hasCartesianSeries && (this.zoomX || this.zoomY) && p2 && !t2 && !E && (this.selectionMarker = E = b.renderer.rect(q2, m, e2 ? 1 : f2, h2 ? 1 : A, 0).attr({
              fill: c2.selectionMarkerFill || n("#335cad").setOpacity(0.25).get(),
              "class": "highcharts-selection-marker",
              zIndex: 7
            }).add()), E && e2 && (d -= g, E.attr({
              width: Math.abs(d),
              x: (0 < d ? 0 : d) + g
            })), E && h2 && (d = k2 - r, E.attr({
              height: Math.abs(d),
              y: (0 < d ? 0 : d) + r
            })), p2 && !E && c2.panning && b.pan(a2, c2.panning)));
          },
          drop: function(a2) {
            var b = this, c2 = this.chart, d = this.hasPinched;
            if (this.selectionMarker) {
              var k2 = {
                originalEvent: a2,
                xAxis: [],
                yAxis: []
              }, h2 = this.selectionMarker, q2 = h2.attr ? h2.attr("x") : h2.x, p2 = h2.attr ? h2.attr("y") : h2.y, m = h2.attr ? h2.attr("width") : h2.width, G = h2.attr ? h2.attr("height") : h2.height, A;
              if (this.hasDragged || d) u(c2.axes, function(c3) {
                if (c3.zoomEnabled && e(c3.min) && (d || b[{
                  xAxis: "zoomX",
                  yAxis: "zoomY"
                }[c3.coll]])) {
                  var h3 = c3.horiz, g = "touchend" === a2.type ? c3.minPixelPadding : 0, l = c3.toValue((h3 ? q2 : p2) + g), h3 = c3.toValue((h3 ? q2 + m : p2 + G) - g);
                  k2[c3.coll].push({
                    axis: c3,
                    min: Math.min(l, h3),
                    max: Math.max(l, h3)
                  });
                  A = true;
                }
              }), A && w(c2, "selection", k2, function(a3) {
                c2.zoom(x(a3, d ? {
                  animation: false
                } : null));
              });
              y(c2.index) && (this.selectionMarker = this.selectionMarker.destroy());
              d && this.scaleGroups();
            }
            c2 && y(c2.index) && (f(c2.container, {
              cursor: c2._cursor
            }), c2.cancelClick = 10 < this.hasDragged, c2.mouseIsDown = this.hasDragged = this.hasPinched = false, this.pinchDown = []);
          },
          onContainerMouseDown: function(a2) {
            a2 = this.normalize(a2);
            2 !== a2.button && (this.zoomOption(a2), a2.preventDefault && a2.preventDefault(), this.dragStart(a2));
          },
          onDocumentMouseUp: function(c2) {
            I[a.hoverChartIndex] && I[a.hoverChartIndex].pointer.drop(c2);
          },
          onDocumentMouseMove: function(a2) {
            var b = this.chart, c2 = this.chartPosition;
            a2 = this.normalize(a2, c2);
            !c2 || this.inClass(a2.target, "highcharts-tracker") || b.isInsidePlot(a2.chartX - b.plotLeft, a2.chartY - b.plotTop) || this.reset();
          },
          onContainerMouseLeave: function(c2) {
            var b = I[a.hoverChartIndex];
            b && (c2.relatedTarget || c2.toElement) && (b.pointer.reset(), b.pointer.chartPosition = null);
          },
          onContainerMouseMove: function(c2) {
            var b = this.chart;
            e(a.hoverChartIndex) && I[a.hoverChartIndex] && I[a.hoverChartIndex].mouseIsDown || (a.hoverChartIndex = b.index);
            c2 = this.normalize(c2);
            c2.returnValue = false;
            "mousedown" === b.mouseIsDown && this.drag(c2);
            !this.inClass(c2.target, "highcharts-tracker") && !b.isInsidePlot(c2.chartX - b.plotLeft, c2.chartY - b.plotTop) || b.openMenu || this.runPointActions(c2);
          },
          inClass: function(a2, b) {
            for (var c2; a2; ) {
              if (c2 = F(a2, "class")) {
                if (-1 !== c2.indexOf(b)) return true;
                if (-1 !== c2.indexOf("highcharts-container")) return false;
              }
              a2 = a2.parentNode;
            }
          },
          onTrackerMouseOut: function(a2) {
            var b = this.chart.hoverSeries;
            a2 = a2.relatedTarget || a2.toElement;
            this.isDirectTouch = false;
            if (!(!b || !a2 || b.stickyTracking || this.inClass(a2, "highcharts-tooltip") || this.inClass(a2, "highcharts-series-" + b.index) && this.inClass(a2, "highcharts-tracker"))) b.onMouseOut();
          },
          onContainerClick: function(a2) {
            var b = this.chart, c2 = b.hoverPoint, d = b.plotLeft, k2 = b.plotTop;
            a2 = this.normalize(a2);
            b.cancelClick || (c2 && this.inClass(a2.target, "highcharts-tracker") ? (w(c2.series, "click", x(a2, {
              point: c2
            })), b.hoverPoint && c2.firePointEvent("click", a2)) : (x(a2, this.getCoordinates(a2)), b.isInsidePlot(a2.chartX - d, a2.chartY - k2) && w(b, "click", a2)));
          },
          setDOMEvents: function() {
            var c2 = this, b = c2.chart.container, k2 = b.ownerDocument;
            b.onmousedown = function(a2) {
              c2.onContainerMouseDown(a2);
            };
            b.onmousemove = function(a2) {
              c2.onContainerMouseMove(a2);
            };
            b.onclick = function(a2) {
              c2.onContainerClick(a2);
            };
            this.unbindContainerMouseLeave = C(b, "mouseleave", c2.onContainerMouseLeave);
            a.unbindDocumentMouseUp || (a.unbindDocumentMouseUp = C(k2, "mouseup", c2.onDocumentMouseUp));
            a.hasTouch && (b.ontouchstart = function(a2) {
              c2.onContainerTouchStart(a2);
            }, b.ontouchmove = function(a2) {
              c2.onContainerTouchMove(a2);
            }, a.unbindDocumentTouchEnd || (a.unbindDocumentTouchEnd = C(k2, "touchend", c2.onDocumentTouchEnd)));
          },
          destroy: function() {
            var c2 = this;
            c2.unDocMouseMove && c2.unDocMouseMove();
            this.unbindContainerMouseLeave();
            a.chartCount || (a.unbindDocumentMouseUp && (a.unbindDocumentMouseUp = a.unbindDocumentMouseUp()), a.unbindDocumentTouchEnd && (a.unbindDocumentTouchEnd = a.unbindDocumentTouchEnd()));
            clearInterval(c2.tooltipTimeout);
            a.objectEach(c2, function(a2, d) {
              c2[d] = null;
            });
          }
        };
      })(K);
      (function(a) {
        var C = a.charts, F = a.each, I = a.extend, n = a.map, f = a.noop, e = a.pick;
        I(a.Pointer.prototype, {
          pinchTranslate: function(a2, e2, f2, n2, y, c) {
            this.zoomHor && this.pinchTranslateDirection(true, a2, e2, f2, n2, y, c);
            this.zoomVert && this.pinchTranslateDirection(false, a2, e2, f2, n2, y, c);
          },
          pinchTranslateDirection: function(a2, e2, f2, n2, y, c, h, p) {
            var k = this.chart, q = a2 ? "x" : "y", d = a2 ? "X" : "Y", b = "chart" + d, v = a2 ? "width" : "height", t = k["plot" + (a2 ? "Left" : "Top")], l, u, B = p || 1, D = k.inverted, m = k.bounds[a2 ? "h" : "v"], G = 1 === e2.length, A = e2[0][b], N = f2[0][b], E = !G && e2[1][b], g = !G && f2[1][b], r;
            f2 = function() {
              !G && 20 < Math.abs(A - E) && (B = p || Math.abs(N - g) / Math.abs(A - E));
              u = (t - N) / B + A;
              l = k["plot" + (a2 ? "Width" : "Height")] / B;
            };
            f2();
            e2 = u;
            e2 < m.min ? (e2 = m.min, r = true) : e2 + l > m.max && (e2 = m.max - l, r = true);
            r ? (N -= 0.8 * (N - h[q][0]), G || (g -= 0.8 * (g - h[q][1])), f2()) : h[q] = [N, g];
            D || (c[q] = u - t, c[v] = l);
            c = D ? 1 / B : B;
            y[v] = l;
            y[q] = e2;
            n2[D ? a2 ? "scaleY" : "scaleX" : "scale" + d] = B;
            n2["translate" + d] = c * t + (N - c * A);
          },
          pinch: function(a2) {
            var u = this, t = u.chart, w = u.pinchDown, y = a2.touches, c = y.length, h = u.lastValidTouch, p = u.hasZoom, k = u.selectionMarker, q = {}, d = 1 === c && (u.inClass(a2.target, "highcharts-tracker") && t.runTrackerClick || u.runChartClick), b = {};
            1 < c && (u.initiated = true);
            p && u.initiated && !d && a2.preventDefault();
            n(y, function(a3) {
              return u.normalize(a3);
            });
            "touchstart" === a2.type ? (F(y, function(a3, b2) {
              w[b2] = {
                chartX: a3.chartX,
                chartY: a3.chartY
              };
            }), h.x = [w[0].chartX, w[1] && w[1].chartX], h.y = [w[0].chartY, w[1] && w[1].chartY], F(t.axes, function(a3) {
              if (a3.zoomEnabled) {
                var b2 = t.bounds[a3.horiz ? "h" : "v"], c2 = a3.minPixelPadding, d2 = a3.toPixels(e(a3.options.min, a3.dataMin)), k2 = a3.toPixels(e(a3.options.max, a3.dataMax)), h2 = Math.max(d2, k2);
                b2.min = Math.min(a3.pos, Math.min(d2, k2) - c2);
                b2.max = Math.max(a3.pos + a3.len, h2 + c2);
              }
            }), u.res = true) : u.followTouchMove && 1 === c ? this.runPointActions(u.normalize(a2)) : w.length && (k || (u.selectionMarker = k = I({
              destroy: f,
              touch: true
            }, t.plotBox)), u.pinchTranslate(w, y, q, k, b, h), u.hasPinched = p, u.scaleGroups(q, b), u.res && (u.res = false, this.reset(false, 0)));
          },
          touch: function(f2, n2) {
            var t = this.chart, u, y;
            if (t.index !== a.hoverChartIndex) this.onContainerMouseLeave({
              relatedTarget: true
            });
            a.hoverChartIndex = t.index;
            1 === f2.touches.length ? (f2 = this.normalize(f2), (y = t.isInsidePlot(f2.chartX - t.plotLeft, f2.chartY - t.plotTop)) && !t.openMenu ? (n2 && this.runPointActions(f2), "touchmove" === f2.type && (n2 = this.pinchDown, u = n2[0] ? 4 <= Math.sqrt(Math.pow(n2[0].chartX - f2.chartX, 2) + Math.pow(n2[0].chartY - f2.chartY, 2)) : false), e(u, true) && this.pinch(f2)) : n2 && this.reset()) : 2 === f2.touches.length && this.pinch(f2);
          },
          onContainerTouchStart: function(a2) {
            this.zoomOption(a2);
            this.touch(a2, true);
          },
          onContainerTouchMove: function(a2) {
            this.touch(a2);
          },
          onDocumentTouchEnd: function(e2) {
            C[a.hoverChartIndex] && C[a.hoverChartIndex].pointer.drop(e2);
          }
        });
      })(K);
      (function(a) {
        var C = a.addEvent, F = a.charts, I = a.css, n = a.doc, f = a.extend, e = a.noop, u = a.Pointer, x = a.removeEvent, t = a.win, w = a.wrap;
        if (!a.hasTouch && (t.PointerEvent || t.MSPointerEvent)) {
          var y = {}, c = !!t.PointerEvent, h = function() {
            var c2 = [];
            c2.item = function(a2) {
              return this[a2];
            };
            a.objectEach(y, function(a2) {
              c2.push({
                pageX: a2.pageX,
                pageY: a2.pageY,
                target: a2.target
              });
            });
            return c2;
          }, p = function(c2, q, d, b) {
            "touch" !== c2.pointerType && c2.pointerType !== c2.MSPOINTER_TYPE_TOUCH || !F[a.hoverChartIndex] || (b(c2), b = F[a.hoverChartIndex].pointer, b[q]({
              type: d,
              target: c2.currentTarget,
              preventDefault: e,
              touches: h()
            }));
          };
          f(u.prototype, {
            onContainerPointerDown: function(a2) {
              p(a2, "onContainerTouchStart", "touchstart", function(a3) {
                y[a3.pointerId] = {
                  pageX: a3.pageX,
                  pageY: a3.pageY,
                  target: a3.currentTarget
                };
              });
            },
            onContainerPointerMove: function(a2) {
              p(a2, "onContainerTouchMove", "touchmove", function(a3) {
                y[a3.pointerId] = {
                  pageX: a3.pageX,
                  pageY: a3.pageY
                };
                y[a3.pointerId].target || (y[a3.pointerId].target = a3.currentTarget);
              });
            },
            onDocumentPointerUp: function(a2) {
              p(a2, "onDocumentTouchEnd", "touchend", function(a3) {
                delete y[a3.pointerId];
              });
            },
            batchMSEvents: function(a2) {
              a2(this.chart.container, c ? "pointerdown" : "MSPointerDown", this.onContainerPointerDown);
              a2(this.chart.container, c ? "pointermove" : "MSPointerMove", this.onContainerPointerMove);
              a2(n, c ? "pointerup" : "MSPointerUp", this.onDocumentPointerUp);
            }
          });
          w(u.prototype, "init", function(a2, c2, d) {
            a2.call(this, c2, d);
            this.hasZoom && I(c2.container, {
              "-ms-touch-action": "none",
              "touch-action": "none"
            });
          });
          w(u.prototype, "setDOMEvents", function(a2) {
            a2.apply(this);
            (this.hasZoom || this.followTouchMove) && this.batchMSEvents(C);
          });
          w(u.prototype, "destroy", function(a2) {
            this.batchMSEvents(x);
            a2.call(this);
          });
        }
      })(K);
      (function(a) {
        var C = a.addEvent, F = a.css, I = a.discardElement, n = a.defined, f = a.each, e = a.fireEvent, u = a.isFirefox, x = a.marginNames, t = a.merge, w = a.pick, y = a.setAnimation, c = a.stableSort, h = a.win, p = a.wrap;
        a.Legend = function(a2, c2) {
          this.init(a2, c2);
        };
        a.Legend.prototype = {
          init: function(a2, c2) {
            this.chart = a2;
            this.setOptions(c2);
            c2.enabled && (this.render(), C(this.chart, "endResize", function() {
              this.legend.positionCheckboxes();
            }), this.proximate ? this.unchartrender = C(this.chart, "render", function() {
              this.legend.proximatePositions();
              this.legend.positionItems();
            }) : this.unchartrender && this.unchartrender());
          },
          setOptions: function(a2) {
            var c2 = w(a2.padding, 8);
            this.options = a2;
            this.itemStyle = a2.itemStyle;
            this.itemHiddenStyle = t(this.itemStyle, a2.itemHiddenStyle);
            this.itemMarginTop = a2.itemMarginTop || 0;
            this.padding = c2;
            this.initialItemY = c2 - 5;
            this.symbolWidth = w(a2.symbolWidth, 16);
            this.pages = [];
            this.proximate = "proximate" === a2.layout && !this.chart.inverted;
          },
          update: function(a2, c2) {
            var d = this.chart;
            this.setOptions(t(true, this.options, a2));
            this.destroy();
            d.isDirtyLegend = d.isDirtyBox = true;
            w(c2, true) && d.redraw();
            e(this, "afterUpdate");
          },
          colorizeItem: function(a2, c2) {
            a2.legendGroup[c2 ? "removeClass" : "addClass"]("highcharts-legend-item-hidden");
            var d = this.options, b = a2.legendItem, k = a2.legendLine, h2 = a2.legendSymbol, l = this.itemHiddenStyle.color, d = c2 ? d.itemStyle.color : l, q = c2 ? a2.color || l : l, f2 = a2.options && a2.options.marker, p2 = {
              fill: q
            };
            b && b.css({
              fill: d,
              color: d
            });
            k && k.attr({
              stroke: q
            });
            h2 && (f2 && h2.isMarker && (p2 = a2.pointAttribs(), c2 || (p2.stroke = p2.fill = l)), h2.attr(p2));
            e(this, "afterColorizeItem", {
              item: a2,
              visible: c2
            });
          },
          positionItems: function() {
            f(this.allItems, this.positionItem, this);
            this.chart.isResizing || this.positionCheckboxes();
          },
          positionItem: function(a2) {
            var c2 = this.options, d = c2.symbolPadding, c2 = !c2.rtl, b = a2._legendItemPos, e2 = b[0], b = b[1], h2 = a2.checkbox;
            if ((a2 = a2.legendGroup) && a2.element) a2[n(a2.translateY) ? "animate" : "attr"]({
              translateX: c2 ? e2 : this.legendWidth - e2 - 2 * d - 4,
              translateY: b
            });
            h2 && (h2.x = e2, h2.y = b);
          },
          destroyItem: function(a2) {
            var c2 = a2.checkbox;
            f(["legendItem", "legendLine", "legendSymbol", "legendGroup"], function(c3) {
              a2[c3] && (a2[c3] = a2[c3].destroy());
            });
            c2 && I(a2.checkbox);
          },
          destroy: function() {
            function a2(a3) {
              this[a3] && (this[a3] = this[a3].destroy());
            }
            f(this.getAllItems(), function(c2) {
              f(["legendItem", "legendGroup"], a2, c2);
            });
            f("clipRect up down pager nav box title group".split(" "), a2, this);
            this.display = null;
          },
          positionCheckboxes: function() {
            var a2 = this.group && this.group.alignAttr, c2, d = this.clipHeight || this.legendHeight, b = this.titleHeight;
            a2 && (c2 = a2.translateY, f(this.allItems, function(e2) {
              var h2 = e2.checkbox, k;
              h2 && (k = c2 + b + h2.y + (this.scrollOffset || 0) + 3, F(h2, {
                left: a2.translateX + e2.checkboxOffset + h2.x - 20 + "px",
                top: k + "px",
                display: this.proximate || k > c2 - 6 && k < c2 + d - 6 ? "" : "none"
              }));
            }, this));
          },
          renderTitle: function() {
            var a2 = this.options, c2 = this.padding, d = a2.title, b = 0;
            d.text && (this.title || (this.title = this.chart.renderer.label(d.text, c2 - 3, c2 - 4, null, null, null, a2.useHTML, null, "legend-title").attr({
              zIndex: 1
            }).css(d.style).add(this.group)), a2 = this.title.getBBox(), b = a2.height, this.offsetWidth = a2.width, this.contentGroup.attr({
              translateY: b
            }));
            this.titleHeight = b;
          },
          setText: function(c2) {
            var h2 = this.options;
            c2.legendItem.attr({
              text: h2.labelFormat ? a.format(h2.labelFormat, c2, this.chart.time) : h2.labelFormatter.call(c2)
            });
          },
          renderItem: function(a2) {
            var c2 = this.chart, d = c2.renderer, b = this.options, h2 = this.symbolWidth, e2 = b.symbolPadding, l = this.itemStyle, k = this.itemHiddenStyle, f2 = "horizontal" === b.layout ? w(b.itemDistance, 20) : 0, p2 = !b.rtl, m = a2.legendItem, G = !a2.series, A = !G && a2.series.drawLegendSymbol ? a2.series : a2, n2 = A.options, n2 = this.createCheckboxForItem && n2 && n2.showCheckbox, f2 = h2 + e2 + f2 + (n2 ? 20 : 0), E = b.useHTML, g = a2.options.className;
            m || (a2.legendGroup = d.g("legend-item").addClass("highcharts-" + A.type + "-series highcharts-color-" + a2.colorIndex + (g ? " " + g : "") + (G ? " highcharts-series-" + a2.index : "")).attr({
              zIndex: 1
            }).add(this.scrollGroup), a2.legendItem = m = d.text("", p2 ? h2 + e2 : -e2, this.baseline || 0, E).css(t(a2.visible ? l : k)).attr({
              align: p2 ? "left" : "right",
              zIndex: 2
            }).add(a2.legendGroup), this.baseline || (h2 = l.fontSize, this.fontMetrics = d.fontMetrics(h2, m), this.baseline = this.fontMetrics.f + 3 + this.itemMarginTop, m.attr("y", this.baseline)), this.symbolHeight = b.symbolHeight || this.fontMetrics.f, A.drawLegendSymbol(this, a2), this.setItemEvents && this.setItemEvents(a2, m, E), n2 && this.createCheckboxForItem(a2));
            this.colorizeItem(a2, a2.visible);
            l.width || m.css({
              width: (b.itemWidth || b.width || c2.spacingBox.width) - f2
            });
            this.setText(a2);
            c2 = m.getBBox();
            a2.itemWidth = a2.checkboxOffset = b.itemWidth || a2.legendItemWidth || c2.width + f2;
            this.maxItemWidth = Math.max(this.maxItemWidth, a2.itemWidth);
            this.totalItemWidth += a2.itemWidth;
            this.itemHeight = a2.itemHeight = Math.round(a2.legendItemHeight || c2.height || this.symbolHeight);
          },
          layoutItem: function(a2) {
            var c2 = this.options, d = this.padding, b = "horizontal" === c2.layout, h2 = a2.itemHeight, e2 = c2.itemMarginBottom || 0, l = this.itemMarginTop, k = b ? w(c2.itemDistance, 20) : 0, f2 = c2.width, p2 = f2 || this.chart.spacingBox.width - 2 * d - c2.x, c2 = c2.alignColumns && this.totalItemWidth > p2 ? this.maxItemWidth : a2.itemWidth;
            b && this.itemX - d + c2 > p2 && (this.itemX = d, this.itemY += l + this.lastLineHeight + e2, this.lastLineHeight = 0);
            this.lastItemY = l + this.itemY + e2;
            this.lastLineHeight = Math.max(h2, this.lastLineHeight);
            a2._legendItemPos = [this.itemX, this.itemY];
            b ? this.itemX += c2 : (this.itemY += l + h2 + e2, this.lastLineHeight = h2);
            this.offsetWidth = f2 || Math.max((b ? this.itemX - d - (a2.checkbox ? 0 : k) : c2) + d, this.offsetWidth);
          },
          getAllItems: function() {
            var a2 = [];
            f(this.chart.series, function(c2) {
              var d = c2 && c2.options;
              c2 && w(d.showInLegend, n(d.linkedTo) ? false : void 0, true) && (a2 = a2.concat(c2.legendItems || ("point" === d.legendType ? c2.data : c2)));
            });
            e(this, "afterGetAllItems", {
              allItems: a2
            });
            return a2;
          },
          getAlignment: function() {
            var a2 = this.options;
            return this.proximate ? a2.align.charAt(0) + "tv" : a2.floating ? "" : a2.align.charAt(0) + a2.verticalAlign.charAt(0) + a2.layout.charAt(0);
          },
          adjustMargins: function(a2, c2) {
            var d = this.chart, b = this.options, h2 = this.getAlignment();
            h2 && f([/(lth|ct|rth)/, /(rtv|rm|rbv)/, /(rbh|cb|lbh)/, /(lbv|lm|ltv)/], function(e2, l) {
              e2.test(h2) && !n(a2[l]) && (d[x[l]] = Math.max(d[x[l]], d.legend[(l + 1) % 2 ? "legendHeight" : "legendWidth"] + [1, -1, -1, 1][l] * b[l % 2 ? "x" : "y"] + w(b.margin, 12) + c2[l] + (0 === l && void 0 !== d.options.title.margin ? d.titleOffset + d.options.title.margin : 0)));
            });
          },
          proximatePositions: function() {
            var c2 = this.chart, h2 = [], d = "left" === this.options.align;
            f(this.allItems, function(b) {
              var e2, k;
              e2 = d;
              b.xAxis && b.points && (b.xAxis.options.reversed && (e2 = !e2), e2 = a.find(e2 ? b.points : b.points.slice(0).reverse(), function(b2) {
                return a.isNumber(b2.plotY);
              }), k = b.legendGroup.getBBox().height, h2.push({
                target: b.visible ? (e2 ? e2.plotY : b.xAxis.height) - 0.3 * k : c2.plotHeight,
                size: k,
                item: b
              }));
            }, this);
            a.distribute(h2, c2.plotHeight);
            f(h2, function(a2) {
              a2.item._legendItemPos[1] = c2.plotTop - c2.spacing[0] + a2.pos;
            });
          },
          render: function() {
            var a2 = this.chart, h2 = a2.renderer, d = this.group, b, e2, p2, l = this.box, n2 = this.options, B = this.padding;
            this.itemX = B;
            this.itemY = this.initialItemY;
            this.lastItemY = this.offsetWidth = 0;
            d || (this.group = d = h2.g("legend").attr({
              zIndex: 7
            }).add(), this.contentGroup = h2.g().attr({
              zIndex: 1
            }).add(d), this.scrollGroup = h2.g().add(this.contentGroup));
            this.renderTitle();
            b = this.getAllItems();
            c(b, function(a3, b2) {
              return (a3.options && a3.options.legendIndex || 0) - (b2.options && b2.options.legendIndex || 0);
            });
            n2.reversed && b.reverse();
            this.allItems = b;
            this.display = e2 = !!b.length;
            this.itemHeight = this.totalItemWidth = this.maxItemWidth = this.lastLineHeight = 0;
            f(b, this.renderItem, this);
            f(b, this.layoutItem, this);
            b = (n2.width || this.offsetWidth) + B;
            p2 = this.lastItemY + this.lastLineHeight + this.titleHeight;
            p2 = this.handleOverflow(p2);
            p2 += B;
            l || (this.box = l = h2.rect().addClass("highcharts-legend-box").attr({
              r: n2.borderRadius
            }).add(d), l.isNew = true);
            l.attr({
              stroke: n2.borderColor,
              "stroke-width": n2.borderWidth || 0,
              fill: n2.backgroundColor || "none"
            }).shadow(n2.shadow);
            0 < b && 0 < p2 && (l[l.isNew ? "attr" : "animate"](l.crisp.call({}, {
              x: 0,
              y: 0,
              width: b,
              height: p2
            }, l.strokeWidth())), l.isNew = false);
            l[e2 ? "show" : "hide"]();
            this.legendWidth = b;
            this.legendHeight = p2;
            e2 && (h2 = a2.spacingBox, /(lth|ct|rth)/.test(this.getAlignment()) && (h2 = t(h2, {
              y: h2.y + a2.titleOffset + a2.options.title.margin
            })), d.align(t(n2, {
              width: b,
              height: p2,
              verticalAlign: this.proximate ? "top" : n2.verticalAlign
            }), true, h2));
            this.proximate || this.positionItems();
          },
          handleOverflow: function(a2) {
            var c2 = this, d = this.chart, b = d.renderer, h2 = this.options, e2 = h2.y, l = this.padding, d = d.spacingBox.height + ("top" === h2.verticalAlign ? -e2 : e2) - l, e2 = h2.maxHeight, k, p2 = this.clipRect, n2 = h2.navigation, m = w(n2.animation, true), G = n2.arrowSize || 12, A = this.nav, t2 = this.pages, E, g = this.allItems, r = function(a3) {
              "number" === typeof a3 ? p2.attr({
                height: a3
              }) : p2 && (c2.clipRect = p2.destroy(), c2.contentGroup.clip());
              c2.contentGroup.div && (c2.contentGroup.div.style.clip = a3 ? "rect(" + l + "px,9999px," + (l + a3) + "px,0)" : "auto");
            };
            "horizontal" !== h2.layout || "middle" === h2.verticalAlign || h2.floating || (d /= 2);
            e2 && (d = Math.min(d, e2));
            t2.length = 0;
            a2 > d && false !== n2.enabled ? (this.clipHeight = k = Math.max(d - 20 - this.titleHeight - l, 0), this.currentPage = w(this.currentPage, 1), this.fullHeight = a2, f(g, function(a3, b2) {
              var c3 = a3._legendItemPos[1], d2 = Math.round(a3.legendItem.getBBox().height), m2 = t2.length;
              if (!m2 || c3 - t2[m2 - 1] > k && (E || c3) !== t2[m2 - 1]) t2.push(E || c3), m2++;
              a3.pageIx = m2 - 1;
              E && (g[b2 - 1].pageIx = m2 - 1);
              b2 === g.length - 1 && c3 + d2 - t2[m2 - 1] > k && (t2.push(c3), a3.pageIx = m2);
              c3 !== E && (E = c3);
            }), p2 || (p2 = c2.clipRect = b.clipRect(0, l, 9999, 0), c2.contentGroup.clip(p2)), r(k), A || (this.nav = A = b.g().attr({
              zIndex: 1
            }).add(this.group), this.up = b.symbol("triangle", 0, 0, G, G).on("click", function() {
              c2.scroll(-1, m);
            }).add(A), this.pager = b.text("", 15, 10).addClass("highcharts-legend-navigation").css(n2.style).add(A), this.down = b.symbol("triangle-down", 0, 0, G, G).on("click", function() {
              c2.scroll(1, m);
            }).add(A)), c2.scroll(0), a2 = d) : A && (r(), this.nav = A.destroy(), this.scrollGroup.attr({
              translateY: 1
            }), this.clipHeight = 0);
            return a2;
          },
          scroll: function(a2, c2) {
            var d = this.pages, b = d.length;
            a2 = this.currentPage + a2;
            var h2 = this.clipHeight, e2 = this.options.navigation, l = this.pager, f2 = this.padding;
            a2 > b && (a2 = b);
            0 < a2 && (void 0 !== c2 && y(c2, this.chart), this.nav.attr({
              translateX: f2,
              translateY: h2 + this.padding + 7 + this.titleHeight,
              visibility: "visible"
            }), this.up.attr({
              "class": 1 === a2 ? "highcharts-legend-nav-inactive" : "highcharts-legend-nav-active"
            }), l.attr({
              text: a2 + "/" + b
            }), this.down.attr({
              x: 18 + this.pager.getBBox().width,
              "class": a2 === b ? "highcharts-legend-nav-inactive" : "highcharts-legend-nav-active"
            }), this.up.attr({
              fill: 1 === a2 ? e2.inactiveColor : e2.activeColor
            }).css({
              cursor: 1 === a2 ? "default" : "pointer"
            }), this.down.attr({
              fill: a2 === b ? e2.inactiveColor : e2.activeColor
            }).css({
              cursor: a2 === b ? "default" : "pointer"
            }), this.scrollOffset = -d[a2 - 1] + this.initialItemY, this.scrollGroup.animate({
              translateY: this.scrollOffset
            }), this.currentPage = a2, this.positionCheckboxes());
          }
        };
        a.LegendSymbolMixin = {
          drawRectangle: function(a2, c2) {
            var d = a2.symbolHeight, b = a2.options.squareSymbol;
            c2.legendSymbol = this.chart.renderer.rect(b ? (a2.symbolWidth - d) / 2 : 0, a2.baseline - d + 1, b ? d : a2.symbolWidth, d, w(a2.options.symbolRadius, d / 2)).addClass("highcharts-point").attr({
              zIndex: 3
            }).add(c2.legendGroup);
          },
          drawLineMarker: function(a2) {
            var c2 = this.options, d = c2.marker, b = a2.symbolWidth, h2 = a2.symbolHeight, e2 = h2 / 2, l = this.chart.renderer, f2 = this.legendGroup;
            a2 = a2.baseline - Math.round(0.3 * a2.fontMetrics.b);
            var k;
            k = {
              "stroke-width": c2.lineWidth || 0
            };
            c2.dashStyle && (k.dashstyle = c2.dashStyle);
            this.legendLine = l.path(["M", 0, a2, "L", b, a2]).addClass("highcharts-graph").attr(k).add(f2);
            d && false !== d.enabled && b && (c2 = Math.min(w(d.radius, e2), e2), 0 === this.symbol.indexOf("url") && (d = t(d, {
              width: h2,
              height: h2
            }), c2 = 0), this.legendSymbol = d = l.symbol(this.symbol, b / 2 - c2, a2 - c2, 2 * c2, 2 * c2, d).addClass("highcharts-point").add(f2), d.isMarker = true);
          }
        };
        (/Trident\/7\.0/.test(h.navigator.userAgent) || u) && p(a.Legend.prototype, "positionItem", function(a2, c2) {
          var d = this, b = function() {
            c2._legendItemPos && a2.call(d, c2);
          };
          b();
          setTimeout(b);
        });
      })(K);
      (function(a) {
        var C = a.addEvent, F = a.animate, I = a.animObject, n = a.attr, f = a.doc, e = a.Axis, u = a.createElement, x = a.defaultOptions, t = a.discardElement, w = a.charts, y = a.css, c = a.defined, h = a.each, p = a.extend, k = a.find, q = a.fireEvent, d = a.grep, b = a.isNumber, v = a.isObject, J = a.isString, l = a.Legend, L = a.marginNames, B = a.merge, D = a.objectEach, m = a.Pointer, G = a.pick, A = a.pInt, N = a.removeEvent, E = a.seriesTypes, g = a.splat, r = a.syncTimeout, M = a.win, O = a.Chart = function() {
          this.getArgs.apply(this, arguments);
        };
        a.chart = function(a2, b2, c2) {
          return new O(a2, b2, c2);
        };
        p(O.prototype, {
          callbacks: [],
          getArgs: function() {
            var a2 = [].slice.call(arguments);
            if (J(a2[0]) || a2[0].nodeName) this.renderTo = a2.shift();
            this.init(a2[0], a2[1]);
          },
          init: function(b2, c2) {
            var d2, g2, m2 = b2.series, h2 = b2.plotOptions || {};
            q(this, "init", {
              args: arguments
            }, function() {
              b2.series = null;
              d2 = B(x, b2);
              for (g2 in d2.plotOptions) d2.plotOptions[g2].tooltip = h2[g2] && B(h2[g2].tooltip) || void 0;
              d2.tooltip.userOptions = b2.chart && b2.chart.forExport && b2.tooltip.userOptions || b2.tooltip;
              d2.series = b2.series = m2;
              this.userOptions = b2;
              var e2 = d2.chart, l2 = e2.events;
              this.margin = [];
              this.spacing = [];
              this.bounds = {
                h: {},
                v: {}
              };
              this.labelCollectors = [];
              this.callback = c2;
              this.isResizing = 0;
              this.options = d2;
              this.axes = [];
              this.series = [];
              this.time = b2.time && a.keys(b2.time).length ? new a.Time(b2.time) : a.time;
              this.hasCartesianSeries = e2.showAxes;
              var f2 = this;
              f2.index = w.length;
              w.push(f2);
              a.chartCount++;
              l2 && D(l2, function(a2, b3) {
                C(f2, b3, a2);
              });
              f2.xAxis = [];
              f2.yAxis = [];
              f2.pointCount = f2.colorCounter = f2.symbolCounter = 0;
              q(f2, "afterInit");
              f2.firstRender();
            });
          },
          initSeries: function(b2) {
            var c2 = this.options.chart;
            (c2 = E[b2.type || c2.type || c2.defaultSeriesType]) || a.error(17, true);
            c2 = new c2();
            c2.init(this, b2);
            return c2;
          },
          orderSeries: function(a2) {
            var b2 = this.series;
            for (a2 = a2 || 0; a2 < b2.length; a2++) b2[a2] && (b2[a2].index = a2, b2[a2].name = b2[a2].getName());
          },
          isInsidePlot: function(a2, b2, c2) {
            var d2 = c2 ? b2 : a2;
            a2 = c2 ? a2 : b2;
            return 0 <= d2 && d2 <= this.plotWidth && 0 <= a2 && a2 <= this.plotHeight;
          },
          redraw: function(b2) {
            q(this, "beforeRedraw");
            var c2 = this.axes, d2 = this.series, g2 = this.pointer, m2 = this.legend, e2 = this.userOptions.legend, l2 = this.isDirtyLegend, f2, A2, k2 = this.hasCartesianSeries, r2 = this.isDirtyBox, G2, v2 = this.renderer, H = v2.isHidden(), E2 = [];
            this.setResponsive && this.setResponsive(false);
            a.setAnimation(b2, this);
            H && this.temporaryDisplay();
            this.layOutTitles();
            for (b2 = d2.length; b2--; ) if (G2 = d2[b2], G2.options.stacking && (f2 = true, G2.isDirty)) {
              A2 = true;
              break;
            }
            if (A2) for (b2 = d2.length; b2--; ) G2 = d2[b2], G2.options.stacking && (G2.isDirty = true);
            h(d2, function(a2) {
              a2.isDirty && ("point" === a2.options.legendType ? (a2.updateTotals && a2.updateTotals(), l2 = true) : e2 && (e2.labelFormatter || e2.labelFormat) && (l2 = true));
              a2.isDirtyData && q(a2, "updatedData");
            });
            l2 && m2 && m2.options.enabled && (m2.render(), this.isDirtyLegend = false);
            f2 && this.getStacks();
            k2 && h(c2, function(a2) {
              a2.updateNames();
              a2.updateYNames && a2.updateYNames();
              a2.setScale();
            });
            this.getMargins();
            k2 && (h(c2, function(a2) {
              a2.isDirty && (r2 = true);
            }), h(c2, function(a2) {
              var b3 = a2.min + "," + a2.max;
              a2.extKey !== b3 && (a2.extKey = b3, E2.push(function() {
                q(a2, "afterSetExtremes", p(a2.eventArgs, a2.getExtremes()));
                delete a2.eventArgs;
              }));
              (r2 || f2) && a2.redraw();
            }));
            r2 && this.drawChartBox();
            q(this, "predraw");
            h(d2, function(a2) {
              (r2 || a2.isDirty) && a2.visible && a2.redraw();
              a2.isDirtyData = false;
            });
            g2 && g2.reset(true);
            v2.draw();
            q(this, "redraw");
            q(this, "render");
            H && this.temporaryDisplay(true);
            h(E2, function(a2) {
              a2.call();
            });
          },
          get: function(a2) {
            function b2(b3) {
              return b3.id === a2 || b3.options && b3.options.id === a2;
            }
            var c2, d2 = this.series, g2;
            c2 = k(this.axes, b2) || k(this.series, b2);
            for (g2 = 0; !c2 && g2 < d2.length; g2++) c2 = k(d2[g2].points || [], b2);
            return c2;
          },
          getAxes: function() {
            var a2 = this, b2 = this.options, c2 = b2.xAxis = g(b2.xAxis || {}), b2 = b2.yAxis = g(b2.yAxis || {});
            q(this, "getAxes");
            h(c2, function(a3, b3) {
              a3.index = b3;
              a3.isX = true;
            });
            h(b2, function(a3, b3) {
              a3.index = b3;
            });
            c2 = c2.concat(b2);
            h(c2, function(b3) {
              new e(a2, b3);
            });
            q(this, "afterGetAxes");
          },
          getSelectedPoints: function() {
            var a2 = [];
            h(this.series, function(b2) {
              a2 = a2.concat(d(b2.data || [], function(a3) {
                return a3.selected;
              }));
            });
            return a2;
          },
          getSelectedSeries: function() {
            return d(this.series, function(a2) {
              return a2.selected;
            });
          },
          setTitle: function(a2, b2, c2) {
            var d2 = this, g2 = d2.options, m2;
            m2 = g2.title = B({
              style: {
                color: "#333333",
                fontSize: g2.isStock ? "16px" : "18px"
              }
            }, g2.title, a2);
            g2 = g2.subtitle = B({
              style: {
                color: "#666666"
              }
            }, g2.subtitle, b2);
            h([["title", a2, m2], ["subtitle", b2, g2]], function(a3, b3) {
              var c3 = a3[0], g3 = d2[c3], m3 = a3[1];
              a3 = a3[2];
              g3 && m3 && (d2[c3] = g3 = g3.destroy());
              a3 && !g3 && (d2[c3] = d2.renderer.text(a3.text, 0, 0, a3.useHTML).attr({
                align: a3.align,
                "class": "highcharts-" + c3,
                zIndex: a3.zIndex || 4
              }).add(), d2[c3].update = function(a4) {
                d2.setTitle(!b3 && a4, b3 && a4);
              }, d2[c3].css(a3.style));
            });
            d2.layOutTitles(c2);
          },
          layOutTitles: function(a2) {
            var b2 = 0, c2, d2 = this.renderer, g2 = this.spacingBox;
            h(["title", "subtitle"], function(a3) {
              var c3 = this[a3], m2 = this.options[a3];
              a3 = "title" === a3 ? -3 : m2.verticalAlign ? 0 : b2 + 2;
              var h2;
              c3 && (h2 = m2.style.fontSize, h2 = d2.fontMetrics(h2, c3).b, c3.css({
                width: (m2.width || g2.width + m2.widthAdjust) + "px"
              }).align(p({
                y: a3 + h2
              }, m2), false, "spacingBox"), m2.floating || m2.verticalAlign || (b2 = Math.ceil(b2 + c3.getBBox(m2.useHTML).height)));
            }, this);
            c2 = this.titleOffset !== b2;
            this.titleOffset = b2;
            !this.isDirtyBox && c2 && (this.isDirtyBox = this.isDirtyLegend = c2, this.hasRendered && G(a2, true) && this.isDirtyBox && this.redraw());
          },
          getChartSize: function() {
            var b2 = this.options.chart, d2 = b2.width, b2 = b2.height, g2 = this.renderTo;
            c(d2) || (this.containerWidth = a.getStyle(g2, "width"));
            c(b2) || (this.containerHeight = a.getStyle(g2, "height"));
            this.chartWidth = Math.max(0, d2 || this.containerWidth || 600);
            this.chartHeight = Math.max(0, a.relativeLength(b2, this.chartWidth) || (1 < this.containerHeight ? this.containerHeight : 400));
          },
          temporaryDisplay: function(b2) {
            var c2 = this.renderTo;
            if (b2) for (; c2 && c2.style; ) c2.hcOrigStyle && (a.css(c2, c2.hcOrigStyle), delete c2.hcOrigStyle), c2.hcOrigDetached && (f.body.removeChild(c2), c2.hcOrigDetached = false), c2 = c2.parentNode;
            else for (; c2 && c2.style; ) {
              f.body.contains(c2) || c2.parentNode || (c2.hcOrigDetached = true, f.body.appendChild(c2));
              if ("none" === a.getStyle(c2, "display", false) || c2.hcOricDetached) c2.hcOrigStyle = {
                display: c2.style.display,
                height: c2.style.height,
                overflow: c2.style.overflow
              }, b2 = {
                display: "block",
                overflow: "hidden"
              }, c2 !== this.renderTo && (b2.height = 0), a.css(c2, b2), c2.offsetWidth || c2.style.setProperty("display", "block", "important");
              c2 = c2.parentNode;
              if (c2 === f.body) break;
            }
          },
          setClassName: function(a2) {
            this.container.className = "highcharts-container " + (a2 || "");
          },
          getContainer: function() {
            var c2, d2 = this.options, g2 = d2.chart, m2, h2;
            c2 = this.renderTo;
            var e2 = a.uniqueKey(), l2;
            c2 || (this.renderTo = c2 = g2.renderTo);
            J(c2) && (this.renderTo = c2 = f.getElementById(c2));
            c2 || a.error(13, true);
            m2 = A(n(c2, "data-highcharts-chart"));
            b(m2) && w[m2] && w[m2].hasRendered && w[m2].destroy();
            n(c2, "data-highcharts-chart", this.index);
            c2.innerHTML = "";
            g2.skipClone || c2.offsetWidth || this.temporaryDisplay();
            this.getChartSize();
            m2 = this.chartWidth;
            h2 = this.chartHeight;
            l2 = p({
              position: "relative",
              overflow: "hidden",
              width: m2 + "px",
              height: h2 + "px",
              textAlign: "left",
              lineHeight: "normal",
              zIndex: 0,
              "-webkit-tap-highlight-color": "rgba(0,0,0,0)"
            }, g2.style);
            this.container = c2 = u("div", {
              id: e2
            }, l2, c2);
            this._cursor = c2.style.cursor;
            this.renderer = new (a[g2.renderer] || a.Renderer)(c2, m2, h2, null, g2.forExport, d2.exporting && d2.exporting.allowHTML);
            this.setClassName(g2.className);
            this.renderer.setStyle(g2.style);
            this.renderer.chartIndex = this.index;
            q(this, "afterGetContainer");
          },
          getMargins: function(a2) {
            var b2 = this.spacing, d2 = this.margin, g2 = this.titleOffset;
            this.resetMargins();
            g2 && !c(d2[0]) && (this.plotTop = Math.max(this.plotTop, g2 + this.options.title.margin + b2[0]));
            this.legend && this.legend.display && this.legend.adjustMargins(d2, b2);
            q(this, "getMargins");
            a2 || this.getAxisMargins();
          },
          getAxisMargins: function() {
            var a2 = this, b2 = a2.axisOffset = [0, 0, 0, 0], d2 = a2.margin;
            a2.hasCartesianSeries && h(a2.axes, function(a3) {
              a3.visible && a3.getOffset();
            });
            h(L, function(g2, m2) {
              c(d2[m2]) || (a2[g2] += b2[m2]);
            });
            a2.setChartSize();
          },
          reflow: function(b2) {
            var d2 = this, g2 = d2.options.chart, m2 = d2.renderTo, h2 = c(g2.width) && c(g2.height), e2 = g2.width || a.getStyle(m2, "width"), g2 = g2.height || a.getStyle(m2, "height"), m2 = b2 ? b2.target : M;
            if (!h2 && !d2.isPrinting && e2 && g2 && (m2 === M || m2 === f)) {
              if (e2 !== d2.containerWidth || g2 !== d2.containerHeight) a.clearTimeout(d2.reflowTimeout), d2.reflowTimeout = r(function() {
                d2.container && d2.setSize(void 0, void 0, false);
              }, b2 ? 100 : 0);
              d2.containerWidth = e2;
              d2.containerHeight = g2;
            }
          },
          setReflow: function(a2) {
            var b2 = this;
            false === a2 || this.unbindReflow ? false === a2 && this.unbindReflow && (this.unbindReflow = this.unbindReflow()) : (this.unbindReflow = C(M, "resize", function(a3) {
              b2.reflow(a3);
            }), C(this, "destroy", this.unbindReflow));
          },
          setSize: function(b2, c2, d2) {
            var g2 = this, m2 = g2.renderer;
            g2.isResizing += 1;
            a.setAnimation(d2, g2);
            g2.oldChartHeight = g2.chartHeight;
            g2.oldChartWidth = g2.chartWidth;
            void 0 !== b2 && (g2.options.chart.width = b2);
            void 0 !== c2 && (g2.options.chart.height = c2);
            g2.getChartSize();
            b2 = m2.globalAnimation;
            (b2 ? F : y)(g2.container, {
              width: g2.chartWidth + "px",
              height: g2.chartHeight + "px"
            }, b2);
            g2.setChartSize(true);
            m2.setSize(g2.chartWidth, g2.chartHeight, d2);
            h(g2.axes, function(a2) {
              a2.isDirty = true;
              a2.setScale();
            });
            g2.isDirtyLegend = true;
            g2.isDirtyBox = true;
            g2.layOutTitles();
            g2.getMargins();
            g2.redraw(d2);
            g2.oldChartHeight = null;
            q(g2, "resize");
            r(function() {
              g2 && q(g2, "endResize", null, function() {
                --g2.isResizing;
              });
            }, I(b2).duration);
          },
          setChartSize: function(a2) {
            var b2 = this.inverted, c2 = this.renderer, g2 = this.chartWidth, d2 = this.chartHeight, m2 = this.options.chart, e2 = this.spacing, l2 = this.clipOffset, f2, A2, k2, r2;
            this.plotLeft = f2 = Math.round(this.plotLeft);
            this.plotTop = A2 = Math.round(this.plotTop);
            this.plotWidth = k2 = Math.max(0, Math.round(g2 - f2 - this.marginRight));
            this.plotHeight = r2 = Math.max(0, Math.round(d2 - A2 - this.marginBottom));
            this.plotSizeX = b2 ? r2 : k2;
            this.plotSizeY = b2 ? k2 : r2;
            this.plotBorderWidth = m2.plotBorderWidth || 0;
            this.spacingBox = c2.spacingBox = {
              x: e2[3],
              y: e2[0],
              width: g2 - e2[3] - e2[1],
              height: d2 - e2[0] - e2[2]
            };
            this.plotBox = c2.plotBox = {
              x: f2,
              y: A2,
              width: k2,
              height: r2
            };
            g2 = 2 * Math.floor(this.plotBorderWidth / 2);
            b2 = Math.ceil(Math.max(g2, l2[3]) / 2);
            c2 = Math.ceil(Math.max(g2, l2[0]) / 2);
            this.clipBox = {
              x: b2,
              y: c2,
              width: Math.floor(this.plotSizeX - Math.max(g2, l2[1]) / 2 - b2),
              height: Math.max(0, Math.floor(this.plotSizeY - Math.max(g2, l2[2]) / 2 - c2))
            };
            a2 || h(this.axes, function(a3) {
              a3.setAxisSize();
              a3.setAxisTranslation();
            });
            q(this, "afterSetChartSize", {
              skipAxes: a2
            });
          },
          resetMargins: function() {
            var a2 = this, b2 = a2.options.chart;
            h(["margin", "spacing"], function(c2) {
              var g2 = b2[c2], d2 = v(g2) ? g2 : [g2, g2, g2, g2];
              h(["Top", "Right", "Bottom", "Left"], function(g3, m2) {
                a2[c2][m2] = G(b2[c2 + g3], d2[m2]);
              });
            });
            h(L, function(b3, c2) {
              a2[b3] = G(a2.margin[c2], a2.spacing[c2]);
            });
            a2.axisOffset = [0, 0, 0, 0];
            a2.clipOffset = [0, 0, 0, 0];
          },
          drawChartBox: function() {
            var a2 = this.options.chart, b2 = this.renderer, c2 = this.chartWidth, g2 = this.chartHeight, d2 = this.chartBackground, m2 = this.plotBackground, h2 = this.plotBorder, e2, l2 = this.plotBGImage, f2 = a2.backgroundColor, A2 = a2.plotBackgroundColor, k2 = a2.plotBackgroundImage, r2, p2 = this.plotLeft, G2 = this.plotTop, v2 = this.plotWidth, E2 = this.plotHeight, n2 = this.plotBox, B2 = this.clipRect, t2 = this.clipBox, u2 = "animate";
            d2 || (this.chartBackground = d2 = b2.rect().addClass("highcharts-background").add(), u2 = "attr");
            e2 = a2.borderWidth || 0;
            r2 = e2 + (a2.shadow ? 8 : 0);
            f2 = {
              fill: f2 || "none"
            };
            if (e2 || d2["stroke-width"]) f2.stroke = a2.borderColor, f2["stroke-width"] = e2;
            d2.attr(f2).shadow(a2.shadow);
            d2[u2]({
              x: r2 / 2,
              y: r2 / 2,
              width: c2 - r2 - e2 % 2,
              height: g2 - r2 - e2 % 2,
              r: a2.borderRadius
            });
            u2 = "animate";
            m2 || (u2 = "attr", this.plotBackground = m2 = b2.rect().addClass("highcharts-plot-background").add());
            m2[u2](n2);
            m2.attr({
              fill: A2 || "none"
            }).shadow(a2.plotShadow);
            k2 && (l2 ? l2.animate(n2) : this.plotBGImage = b2.image(k2, p2, G2, v2, E2).add());
            B2 ? B2.animate({
              width: t2.width,
              height: t2.height
            }) : this.clipRect = b2.clipRect(t2);
            u2 = "animate";
            h2 || (u2 = "attr", this.plotBorder = h2 = b2.rect().addClass("highcharts-plot-border").attr({
              zIndex: 1
            }).add());
            h2.attr({
              stroke: a2.plotBorderColor,
              "stroke-width": a2.plotBorderWidth || 0,
              fill: "none"
            });
            h2[u2](h2.crisp({
              x: p2,
              y: G2,
              width: v2,
              height: E2
            }, -h2.strokeWidth()));
            this.isDirtyBox = false;
            q(this, "afterDrawChartBox");
          },
          propFromSeries: function() {
            var a2 = this, b2 = a2.options.chart, c2, g2 = a2.options.series, d2, m2;
            h(["inverted", "angular", "polar"], function(h2) {
              c2 = E[b2.type || b2.defaultSeriesType];
              m2 = b2[h2] || c2 && c2.prototype[h2];
              for (d2 = g2 && g2.length; !m2 && d2--; ) (c2 = E[g2[d2].type]) && c2.prototype[h2] && (m2 = true);
              a2[h2] = m2;
            });
          },
          linkSeries: function() {
            var a2 = this, b2 = a2.series;
            h(b2, function(a3) {
              a3.linkedSeries.length = 0;
            });
            h(b2, function(b3) {
              var c2 = b3.options.linkedTo;
              J(c2) && (c2 = ":previous" === c2 ? a2.series[b3.index - 1] : a2.get(c2)) && c2.linkedParent !== b3 && (c2.linkedSeries.push(b3), b3.linkedParent = c2, b3.visible = G(b3.options.visible, c2.options.visible, b3.visible));
            });
            q(this, "afterLinkSeries");
          },
          renderSeries: function() {
            h(this.series, function(a2) {
              a2.translate();
              a2.render();
            });
          },
          renderLabels: function() {
            var a2 = this, b2 = a2.options.labels;
            b2.items && h(b2.items, function(c2) {
              var g2 = p(b2.style, c2.style), d2 = A(g2.left) + a2.plotLeft, m2 = A(g2.top) + a2.plotTop + 12;
              delete g2.left;
              delete g2.top;
              a2.renderer.text(c2.html, d2, m2).attr({
                zIndex: 2
              }).css(g2).add();
            });
          },
          render: function() {
            var a2 = this.axes, b2 = this.renderer, c2 = this.options, g2, d2, m2;
            this.setTitle();
            this.legend = new l(this, c2.legend);
            this.getStacks && this.getStacks();
            this.getMargins(true);
            this.setChartSize();
            c2 = this.plotWidth;
            g2 = this.plotHeight = Math.max(this.plotHeight - 21, 0);
            h(a2, function(a3) {
              a3.setScale();
            });
            this.getAxisMargins();
            d2 = 1.1 < c2 / this.plotWidth;
            m2 = 1.05 < g2 / this.plotHeight;
            if (d2 || m2) h(a2, function(a3) {
              (a3.horiz && d2 || !a3.horiz && m2) && a3.setTickInterval(true);
            }), this.getMargins();
            this.drawChartBox();
            this.hasCartesianSeries && h(a2, function(a3) {
              a3.visible && a3.render();
            });
            this.seriesGroup || (this.seriesGroup = b2.g("series-group").attr({
              zIndex: 3
            }).add());
            this.renderSeries();
            this.renderLabels();
            this.addCredits();
            this.setResponsive && this.setResponsive();
            this.hasRendered = true;
          },
          addCredits: function(a2) {
            var b2 = this;
            a2 = B(true, this.options.credits, a2);
            a2.enabled && !this.credits && (this.credits = this.renderer.text(a2.text + (this.mapCredits || ""), 0, 0).addClass("highcharts-credits").on("click", function() {
              a2.href && (M.location.href = a2.href);
            }).attr({
              align: a2.position.align,
              zIndex: 8
            }).css(a2.style).add().align(a2.position), this.credits.update = function(a3) {
              b2.credits = b2.credits.destroy();
              b2.addCredits(a3);
            });
          },
          destroy: function() {
            var b2 = this, c2 = b2.axes, g2 = b2.series, d2 = b2.container, m2, e2 = d2 && d2.parentNode;
            q(b2, "destroy");
            b2.renderer.forExport ? a.erase(w, b2) : w[b2.index] = void 0;
            a.chartCount--;
            b2.renderTo.removeAttribute("data-highcharts-chart");
            N(b2);
            for (m2 = c2.length; m2--; ) c2[m2] = c2[m2].destroy();
            this.scroller && this.scroller.destroy && this.scroller.destroy();
            for (m2 = g2.length; m2--; ) g2[m2] = g2[m2].destroy();
            h("title subtitle chartBackground plotBackground plotBGImage plotBorder seriesGroup clipRect credits pointer rangeSelector legend resetZoomButton tooltip renderer".split(" "), function(a2) {
              var c3 = b2[a2];
              c3 && c3.destroy && (b2[a2] = c3.destroy());
            });
            d2 && (d2.innerHTML = "", N(d2), e2 && t(d2));
            D(b2, function(a2, c3) {
              delete b2[c3];
            });
          },
          firstRender: function() {
            var a2 = this, b2 = a2.options;
            if (!a2.isReadyToRender || a2.isReadyToRender()) {
              a2.getContainer();
              a2.resetMargins();
              a2.setChartSize();
              a2.propFromSeries();
              a2.getAxes();
              h(b2.series || [], function(b3) {
                a2.initSeries(b3);
              });
              a2.linkSeries();
              q(a2, "beforeRender");
              m && (a2.pointer = new m(a2, b2));
              a2.render();
              if (!a2.renderer.imgCount && a2.onload) a2.onload();
              a2.temporaryDisplay(true);
            }
          },
          onload: function() {
            h([this.callback].concat(this.callbacks), function(a2) {
              a2 && void 0 !== this.index && a2.apply(this, [this]);
            }, this);
            q(this, "load");
            q(this, "render");
            c(this.index) && this.setReflow(this.options.chart.reflow);
            this.onload = null;
          }
        });
      })(K);
      (function(a) {
        var C = a.addEvent, F = a.Chart, I = a.each;
        C(F, "afterSetChartSize", function(n) {
          var f = this.options.chart.scrollablePlotArea;
          (f = f && f.minWidth) && !this.renderer.forExport && (this.scrollablePixels = f = Math.max(0, f - this.chartWidth)) && (this.plotWidth += f, this.clipBox.width += f, n.skipAxes || I(this.axes, function(e) {
            1 === e.side ? e.getPlotLinePath = function() {
              var f2 = this.right, n2;
              this.right = f2 - e.chart.scrollablePixels;
              n2 = a.Axis.prototype.getPlotLinePath.apply(this, arguments);
              this.right = f2;
              return n2;
            } : (e.setAxisSize(), e.setAxisTranslation());
          }));
        });
        C(F, "render", function() {
          this.scrollablePixels ? (this.setUpScrolling && this.setUpScrolling(), this.applyFixed()) : this.fixedDiv && this.applyFixed();
        });
        F.prototype.setUpScrolling = function() {
          this.scrollingContainer = a.createElement("div", {
            className: "highcharts-scrolling"
          }, {
            overflowX: "auto",
            WebkitOverflowScrolling: "touch"
          }, this.renderTo);
          this.innerContainer = a.createElement("div", {
            className: "highcharts-inner-container"
          }, null, this.scrollingContainer);
          this.innerContainer.appendChild(this.container);
          this.setUpScrolling = null;
        };
        F.prototype.applyFixed = function() {
          var n = this.container, f, e, u = !this.fixedDiv;
          u && (this.fixedDiv = a.createElement("div", {
            className: "highcharts-fixed"
          }, {
            position: "absolute",
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 2
          }, null, true), this.renderTo.insertBefore(this.fixedDiv, this.renderTo.firstChild), this.fixedRenderer = f = new a.Renderer(this.fixedDiv, 0, 0), this.scrollableMask = f.path().attr({
            fill: a.color(this.options.chart.backgroundColor || "#fff").setOpacity(0.85).get(),
            zIndex: -1
          }).addClass("highcharts-scrollable-mask").add(), a.each([this.inverted ? ".highcharts-xaxis" : ".highcharts-yaxis", this.inverted ? ".highcharts-xaxis-labels" : ".highcharts-yaxis-labels", ".highcharts-contextbutton", ".highcharts-credits", ".highcharts-legend", ".highcharts-subtitle", ".highcharts-title", ".highcharts-legend-checkbox"], function(e2) {
            a.each(n.querySelectorAll(e2), function(a2) {
              (a2.namespaceURI === f.SVG_NS ? f.box : f.box.parentNode).appendChild(a2);
              a2.style.pointerEvents = "auto";
            });
          }));
          this.fixedRenderer.setSize(this.chartWidth, this.chartHeight);
          e = this.chartWidth + this.scrollablePixels;
          a.stop(this.container);
          this.container.style.width = e + "px";
          this.renderer.boxWrapper.attr({
            width: e,
            height: this.chartHeight,
            viewBox: [0, 0, e, this.chartHeight].join(" ")
          });
          this.chartBackground.attr({
            width: e
          });
          u && (e = this.options.chart.scrollablePlotArea, e.scrollPositionX && (this.scrollingContainer.scrollLeft = this.scrollablePixels * e.scrollPositionX));
          u = this.axisOffset;
          e = this.plotTop - u[0] - 1;
          var u = this.plotTop + this.plotHeight + u[2], x = this.plotLeft + this.plotWidth - this.scrollablePixels;
          this.scrollableMask.attr({
            d: this.scrollablePixels ? ["M", 0, e, "L", this.plotLeft - 1, e, "L", this.plotLeft - 1, u, "L", 0, u, "Z", "M", x, e, "L", this.chartWidth, e, "L", this.chartWidth, u, "L", x, u, "Z"] : ["M", 0, 0]
          });
        };
      })(K);
      (function(a) {
        var C, F = a.each, I = a.extend, n = a.erase, f = a.fireEvent, e = a.format, u = a.isArray, x = a.isNumber, t = a.pick, w = a.uniqueKey, y = a.defined, c = a.removeEvent;
        a.Point = C = function() {
        };
        a.Point.prototype = {
          init: function(a2, c2, e2) {
            this.series = a2;
            this.color = a2.color;
            this.applyOptions(c2, e2);
            this.id = y(this.id) ? this.id : w();
            a2.options.colorByPoint ? (c2 = a2.options.colors || a2.chart.options.colors, this.color = this.color || c2[a2.colorCounter], c2 = c2.length, e2 = a2.colorCounter, a2.colorCounter++, a2.colorCounter === c2 && (a2.colorCounter = 0)) : e2 = a2.colorIndex;
            this.colorIndex = t(this.colorIndex, e2);
            a2.chart.pointCount++;
            f(this, "afterInit");
            return this;
          },
          applyOptions: function(a2, c2) {
            var e2 = this.series, h = e2.options.pointValKey || e2.pointValKey;
            a2 = C.prototype.optionsToObject.call(this, a2);
            I(this, a2);
            this.options = this.options ? I(this.options, a2) : a2;
            a2.group && delete this.group;
            a2.dataLabels && delete this.dataLabels;
            h && (this.y = this[h]);
            this.isNull = t(this.isValid && !this.isValid(), null === this.x || !x(this.y, true));
            this.selected && (this.state = "select");
            "name" in this && void 0 === c2 && e2.xAxis && e2.xAxis.hasNames && (this.x = e2.xAxis.nameToX(this));
            void 0 === this.x && e2 && (this.x = void 0 === c2 ? e2.autoIncrement(this) : c2);
            return this;
          },
          setNestedProperty: function(c2, e2, f2) {
            f2 = f2.split(".");
            a.reduce(f2, function(c3, d, b, h) {
              c3[d] = h.length - 1 === b ? e2 : a.isObject(c3[d], true) ? c3[d] : {};
              return c3[d];
            }, c2);
            return c2;
          },
          optionsToObject: function(c2) {
            var e2 = {}, h = this.series, f2 = h.options.keys, d = f2 || h.pointArrayMap || ["y"], b = d.length, v = 0, n2 = 0;
            if (x(c2) || null === c2) e2[d[0]] = c2;
            else if (u(c2)) for (!f2 && c2.length > b && (h = typeof c2[0], "string" === h ? e2.name = c2[0] : "number" === h && (e2.x = c2[0]), v++); n2 < b; ) f2 && void 0 === c2[v] || (0 < d[n2].indexOf(".") ? a.Point.prototype.setNestedProperty(e2, c2[v], d[n2]) : e2[d[n2]] = c2[v]), v++, n2++;
            else "object" === typeof c2 && (e2 = c2, c2.dataLabels && (h._hasPointLabels = true), c2.marker && (h._hasPointMarkers = true));
            return e2;
          },
          getClassName: function() {
            return "highcharts-point" + (this.selected ? " highcharts-point-select" : "") + (this.negative ? " highcharts-negative" : "") + (this.isNull ? " highcharts-null-point" : "") + (void 0 !== this.colorIndex ? " highcharts-color-" + this.colorIndex : "") + (this.options.className ? " " + this.options.className : "") + (this.zone && this.zone.className ? " " + this.zone.className.replace("highcharts-negative", "") : "");
          },
          getZone: function() {
            var a2 = this.series, c2 = a2.zones, a2 = a2.zoneAxis || "y", e2 = 0, f2;
            for (f2 = c2[e2]; this[a2] >= f2.value; ) f2 = c2[++e2];
            this.nonZonedColor || (this.nonZonedColor = this.color);
            this.color = f2 && f2.color && !this.options.color ? f2.color : this.nonZonedColor;
            return f2;
          },
          destroy: function() {
            var a2 = this.series.chart, e2 = a2.hoverPoints, f2;
            a2.pointCount--;
            e2 && (this.setState(), n(e2, this), e2.length || (a2.hoverPoints = null));
            if (this === a2.hoverPoint) this.onMouseOut();
            if (this.graphic || this.dataLabel || this.dataLabels) c(this), this.destroyElements();
            this.legendItem && a2.legend.destroyItem(this);
            for (f2 in this) this[f2] = null;
          },
          destroyElements: function() {
            for (var a2 = ["graphic", "dataLabel", "dataLabelUpper", "connector", "shadowGroup"], c2, e2 = 6; e2--; ) c2 = a2[e2], this[c2] && (this[c2] = this[c2].destroy());
            this.dataLabels && (F(this.dataLabels, function(a3) {
              a3.element && a3.destroy();
            }), delete this.dataLabels);
            this.connectors && (F(this.connectors, function(a3) {
              a3.element && a3.destroy();
            }), delete this.connectors);
          },
          getLabelConfig: function() {
            return {
              x: this.category,
              y: this.y,
              color: this.color,
              colorIndex: this.colorIndex,
              key: this.name || this.category,
              series: this.series,
              point: this,
              percentage: this.percentage,
              total: this.total || this.stackTotal
            };
          },
          tooltipFormatter: function(a2) {
            var c2 = this.series, h = c2.tooltipOptions, f2 = t(h.valueDecimals, ""), d = h.valuePrefix || "", b = h.valueSuffix || "";
            F(c2.pointArrayMap || ["y"], function(c3) {
              c3 = "{point." + c3;
              if (d || b) a2 = a2.replace(RegExp(c3 + "}", "g"), d + c3 + "}" + b);
              a2 = a2.replace(RegExp(c3 + "}", "g"), c3 + ":,." + f2 + "f}");
            });
            return e(a2, {
              point: this,
              series: this.series
            }, c2.chart.time);
          },
          firePointEvent: function(a2, c2, e2) {
            var h = this, d = this.series.options;
            (d.point.events[a2] || h.options && h.options.events && h.options.events[a2]) && this.importEvents();
            "click" === a2 && d.allowPointSelect && (e2 = function(a3) {
              h.select && h.select(null, a3.ctrlKey || a3.metaKey || a3.shiftKey);
            });
            f(this, a2, c2, e2);
          },
          visible: true
        };
      })(K);
      (function(a) {
        var C = a.addEvent, F = a.animObject, I = a.arrayMax, n = a.arrayMin, f = a.correctFloat, e = a.defaultOptions, u = a.defaultPlotOptions, x = a.defined, t = a.each, w = a.erase, y = a.extend, c = a.fireEvent, h = a.grep, p = a.isArray, k = a.isNumber, q = a.isString, d = a.merge, b = a.objectEach, v = a.pick, J = a.removeEvent, l = a.splat, L = a.SVGElement, B = a.syncTimeout, D = a.win;
        a.Series = a.seriesType("line", null, {
          lineWidth: 2,
          allowPointSelect: false,
          showCheckbox: false,
          animation: {
            duration: 1e3
          },
          events: {},
          marker: {
            lineWidth: 0,
            lineColor: "#ffffff",
            enabledThreshold: 2,
            radius: 4,
            states: {
              normal: {
                animation: true
              },
              hover: {
                animation: {
                  duration: 50
                },
                enabled: true,
                radiusPlus: 2,
                lineWidthPlus: 1
              },
              select: {
                fillColor: "#cccccc",
                lineColor: "#000000",
                lineWidth: 2
              }
            }
          },
          point: {
            events: {}
          },
          dataLabels: {
            align: "center",
            formatter: function() {
              return null === this.y ? "" : a.numberFormat(this.y, -1);
            },
            style: {
              fontSize: "11px",
              fontWeight: "bold",
              color: "contrast",
              textOutline: "1px contrast"
            },
            verticalAlign: "bottom",
            x: 0,
            y: 0,
            padding: 5
          },
          cropThreshold: 300,
          pointRange: 0,
          softThreshold: true,
          states: {
            normal: {
              animation: true
            },
            hover: {
              animation: {
                duration: 50
              },
              lineWidthPlus: 1,
              marker: {},
              halo: {
                size: 10,
                opacity: 0.25
              }
            },
            select: {}
          },
          stickyTracking: true,
          turboThreshold: 1e3,
          findNearestPointBy: "x"
        }, {
          isCartesian: true,
          pointClass: a.Point,
          sorted: true,
          requireSorting: true,
          directTouch: false,
          axisTypes: ["xAxis", "yAxis"],
          colorCounter: 0,
          parallelArrays: ["x", "y"],
          coll: "series",
          init: function(a2, d2) {
            var m = this, e2, h2 = a2.series, g;
            m.chart = a2;
            m.options = d2 = m.setOptions(d2);
            m.linkedSeries = [];
            m.bindAxes();
            y(m, {
              name: d2.name,
              state: "",
              visible: false !== d2.visible,
              selected: true === d2.selected
            });
            e2 = d2.events;
            b(e2, function(a3, b2) {
              C(m, b2, a3);
            });
            if (e2 && e2.click || d2.point && d2.point.events && d2.point.events.click || d2.allowPointSelect) a2.runTrackerClick = true;
            m.getColor();
            m.getSymbol();
            t(m.parallelArrays, function(a3) {
              m[a3 + "Data"] = [];
            });
            m.setData(d2.data, false);
            m.isCartesian && (a2.hasCartesianSeries = true);
            h2.length && (g = h2[h2.length - 1]);
            m._i = v(g && g._i, -1) + 1;
            a2.orderSeries(this.insert(h2));
            c(this, "afterInit");
          },
          insert: function(a2) {
            var b2 = this.options.index, c2;
            if (k(b2)) {
              for (c2 = a2.length; c2--; ) if (b2 >= v(a2[c2].options.index, a2[c2]._i)) {
                a2.splice(c2 + 1, 0, this);
                break;
              }
              -1 === c2 && a2.unshift(this);
              c2 += 1;
            } else a2.push(this);
            return v(c2, a2.length - 1);
          },
          bindAxes: function() {
            var b2 = this, c2 = b2.options, d2 = b2.chart, e2;
            t(b2.axisTypes || [], function(m) {
              t(d2[m], function(a2) {
                e2 = a2.options;
                if (c2[m] === e2.index || void 0 !== c2[m] && c2[m] === e2.id || void 0 === c2[m] && 0 === e2.index) b2.insert(a2.series), b2[m] = a2, a2.isDirty = true;
              });
              b2[m] || b2.optionalAxis === m || a.error(18, true);
            });
          },
          updateParallelArrays: function(a2, b2) {
            var c2 = a2.series, d2 = arguments, m = k(b2) ? function(g) {
              var d3 = "y" === g && c2.toYData ? c2.toYData(a2) : a2[g];
              c2[g + "Data"][b2] = d3;
            } : function(a3) {
              Array.prototype[b2].apply(c2[a3 + "Data"], Array.prototype.slice.call(d2, 2));
            };
            t(c2.parallelArrays, m);
          },
          autoIncrement: function() {
            var a2 = this.options, b2 = this.xIncrement, c2, d2 = a2.pointIntervalUnit, e2 = this.chart.time, b2 = v(b2, a2.pointStart, 0);
            this.pointInterval = c2 = v(this.pointInterval, a2.pointInterval, 1);
            d2 && (a2 = new e2.Date(b2), "day" === d2 ? e2.set("Date", a2, e2.get("Date", a2) + c2) : "month" === d2 ? e2.set("Month", a2, e2.get("Month", a2) + c2) : "year" === d2 && e2.set("FullYear", a2, e2.get("FullYear", a2) + c2), c2 = a2.getTime() - b2);
            this.xIncrement = b2 + c2;
            return b2;
          },
          setOptions: function(a2) {
            var b2 = this.chart, m = b2.options, h2 = m.plotOptions, f2 = (b2.userOptions || {}).plotOptions || {}, g = h2[this.type];
            this.userOptions = a2;
            b2 = d(g, h2.series, a2);
            this.tooltipOptions = d(e.tooltip, e.plotOptions.series && e.plotOptions.series.tooltip, e.plotOptions[this.type].tooltip, m.tooltip.userOptions, h2.series && h2.series.tooltip, h2[this.type].tooltip, a2.tooltip);
            this.stickyTracking = v(a2.stickyTracking, f2[this.type] && f2[this.type].stickyTracking, f2.series && f2.series.stickyTracking, this.tooltipOptions.shared && !this.noSharedTooltip ? true : b2.stickyTracking);
            null === g.marker && delete b2.marker;
            this.zoneAxis = b2.zoneAxis;
            a2 = this.zones = (b2.zones || []).slice();
            !b2.negativeColor && !b2.negativeFillColor || b2.zones || a2.push({
              value: b2[this.zoneAxis + "Threshold"] || b2.threshold || 0,
              className: "highcharts-negative",
              color: b2.negativeColor,
              fillColor: b2.negativeFillColor
            });
            a2.length && x(a2[a2.length - 1].value) && a2.push({
              color: this.color,
              fillColor: this.fillColor
            });
            c(this, "afterSetOptions", {
              options: b2
            });
            return b2;
          },
          getName: function() {
            return this.name || "Series " + (this.index + 1);
          },
          getCyclic: function(a2, b2, c2) {
            var d2, e2 = this.chart, g = this.userOptions, m = a2 + "Index", h2 = a2 + "Counter", f2 = c2 ? c2.length : v(e2.options.chart[a2 + "Count"], e2[a2 + "Count"]);
            b2 || (d2 = v(g[m], g["_" + m]), x(d2) || (e2.series.length || (e2[h2] = 0), g["_" + m] = d2 = e2[h2] % f2, e2[h2] += 1), c2 && (b2 = c2[d2]));
            void 0 !== d2 && (this[m] = d2);
            this[a2] = b2;
          },
          getColor: function() {
            this.options.colorByPoint ? this.options.color = null : this.getCyclic("color", this.options.color || u[this.type].color, this.chart.options.colors);
          },
          getSymbol: function() {
            this.getCyclic("symbol", this.options.marker.symbol, this.chart.options.symbols);
          },
          drawLegendSymbol: a.LegendSymbolMixin.drawLineMarker,
          updateData: function(b2) {
            var c2 = this.options, d2 = this.points, e2 = [], m, g, h2, f2 = this.requireSorting;
            t(b2, function(b3) {
              var g2;
              g2 = a.defined(b3) && this.pointClass.prototype.optionsToObject.call({
                series: this
              }, b3).x;
              k(g2) && (g2 = a.inArray(g2, this.xData, h2), -1 === g2 || d2[g2].touched ? e2.push(b3) : b3 !== c2.data[g2] ? (d2[g2].update(b3, false, null, false), d2[g2].touched = true, f2 && (h2 = g2 + 1)) : d2[g2] && (d2[g2].touched = true), m = true);
            }, this);
            if (m) for (b2 = d2.length; b2--; ) g = d2[b2], g.touched || g.remove(false), g.touched = false;
            else if (b2.length === d2.length) t(b2, function(a2, b3) {
              d2[b3].update && a2 !== c2.data[b3] && d2[b3].update(a2, false, null, false);
            });
            else return false;
            t(e2, function(a2) {
              this.addPoint(a2, false);
            }, this);
            return true;
          },
          setData: function(b2, c2, d2, e2) {
            var m = this, g = m.points, h2 = g && g.length || 0, f2, l2 = m.options, A = m.chart, G = null, n2 = m.xAxis, B2 = l2.turboThreshold, u2 = this.xData, D2 = this.yData, y2 = (f2 = m.pointArrayMap) && f2.length, N;
            b2 = b2 || [];
            f2 = b2.length;
            c2 = v(c2, true);
            false !== e2 && f2 && h2 && !m.cropped && !m.hasGroupedData && m.visible && !m.isSeriesBoosting && (N = this.updateData(b2));
            if (!N) {
              m.xIncrement = null;
              m.colorCounter = 0;
              t(this.parallelArrays, function(a2) {
                m[a2 + "Data"].length = 0;
              });
              if (B2 && f2 > B2) {
                for (d2 = 0; null === G && d2 < f2; ) G = b2[d2], d2++;
                if (k(G)) for (d2 = 0; d2 < f2; d2++) u2[d2] = this.autoIncrement(), D2[d2] = b2[d2];
                else if (p(G)) {
                  if (y2) for (d2 = 0; d2 < f2; d2++) G = b2[d2], u2[d2] = G[0], D2[d2] = G.slice(1, y2 + 1);
                  else for (d2 = 0; d2 < f2; d2++) G = b2[d2], u2[d2] = G[0], D2[d2] = G[1];
                } else a.error(12);
              } else for (d2 = 0; d2 < f2; d2++) void 0 !== b2[d2] && (G = {
                series: m
              }, m.pointClass.prototype.applyOptions.apply(G, [b2[d2]]), m.updateParallelArrays(G, d2));
              D2 && q(D2[0]) && a.error(14, true);
              m.data = [];
              m.options.data = m.userOptions.data = b2;
              for (d2 = h2; d2--; ) g[d2] && g[d2].destroy && g[d2].destroy();
              n2 && (n2.minRange = n2.userMinRange);
              m.isDirty = A.isDirtyBox = true;
              m.isDirtyData = !!g;
              d2 = false;
            }
            "point" === l2.legendType && (this.processData(), this.generatePoints());
            c2 && A.redraw(d2);
          },
          processData: function(b2) {
            var c2 = this.xData, d2 = this.yData, e2 = c2.length, m;
            m = 0;
            var g, h2, f2 = this.xAxis, l2, k2 = this.options;
            l2 = k2.cropThreshold;
            var p2 = this.getExtremesFromAll || k2.getExtremesFromAll, q2 = this.isCartesian, k2 = f2 && f2.val2lin, v2 = f2 && f2.isLog, n2 = this.requireSorting, B2, t2;
            if (q2 && !this.isDirty && !f2.isDirty && !this.yAxis.isDirty && !b2) return false;
            f2 && (b2 = f2.getExtremes(), B2 = b2.min, t2 = b2.max);
            q2 && this.sorted && !p2 && (!l2 || e2 > l2 || this.forceCrop) && (c2[e2 - 1] < B2 || c2[0] > t2 ? (c2 = [], d2 = []) : this.yData && (c2[0] < B2 || c2[e2 - 1] > t2) && (m = this.cropData(this.xData, this.yData, B2, t2), c2 = m.xData, d2 = m.yData, m = m.start, g = true));
            for (l2 = c2.length || 1; --l2; ) e2 = v2 ? k2(c2[l2]) - k2(c2[l2 - 1]) : c2[l2] - c2[l2 - 1], 0 < e2 && (void 0 === h2 || e2 < h2) ? h2 = e2 : 0 > e2 && n2 && (a.error(15), n2 = false);
            this.cropped = g;
            this.cropStart = m;
            this.processedXData = c2;
            this.processedYData = d2;
            this.closestPointRange = h2;
          },
          cropData: function(a2, b2, c2, d2, e2) {
            var g = a2.length, m = 0, h2 = g, f2;
            e2 = v(e2, this.cropShoulder, 1);
            for (f2 = 0; f2 < g; f2++) if (a2[f2] >= c2) {
              m = Math.max(0, f2 - e2);
              break;
            }
            for (c2 = f2; c2 < g; c2++) if (a2[c2] > d2) {
              h2 = c2 + e2;
              break;
            }
            return {
              xData: a2.slice(m, h2),
              yData: b2.slice(m, h2),
              start: m,
              end: h2
            };
          },
          generatePoints: function() {
            var a2 = this.options, b2 = a2.data, c2 = this.data, d2, e2 = this.processedXData, g = this.processedYData, h2 = this.pointClass, f2 = e2.length, k2 = this.cropStart || 0, p2, q2 = this.hasGroupedData, a2 = a2.keys, v2, n2 = [], B2;
            c2 || q2 || (c2 = [], c2.length = b2.length, c2 = this.data = c2);
            a2 && q2 && (this.options.keys = false);
            for (B2 = 0; B2 < f2; B2++) p2 = k2 + B2, q2 ? (v2 = new h2().init(this, [e2[B2]].concat(l(g[B2]))), v2.dataGroup = this.groupMap[B2], v2.dataGroup.options && (v2.options = v2.dataGroup.options, y(v2, v2.dataGroup.options))) : (v2 = c2[p2]) || void 0 === b2[p2] || (c2[p2] = v2 = new h2().init(this, b2[p2], e2[B2])), v2 && (v2.index = p2, n2[B2] = v2);
            this.options.keys = a2;
            if (c2 && (f2 !== (d2 = c2.length) || q2)) for (B2 = 0; B2 < d2; B2++) B2 !== k2 || q2 || (B2 += f2), c2[B2] && (c2[B2].destroyElements(), c2[B2].plotX = void 0);
            this.data = c2;
            this.points = n2;
          },
          getExtremes: function(a2) {
            var b2 = this.yAxis, c2 = this.processedXData, d2, e2 = [], g = 0;
            d2 = this.xAxis.getExtremes();
            var m = d2.min, h2 = d2.max, f2, l2, q2 = this.requireSorting ? 1 : 0, v2, B2;
            a2 = a2 || this.stackedYData || this.processedYData || [];
            d2 = a2.length;
            for (B2 = 0; B2 < d2; B2++) if (l2 = c2[B2], v2 = a2[B2], f2 = (k(v2, true) || p(v2)) && (!b2.positiveValuesOnly || v2.length || 0 < v2), l2 = this.getExtremesFromAll || this.options.getExtremesFromAll || this.cropped || (c2[B2 + q2] || l2) >= m && (c2[B2 - q2] || l2) <= h2, f2 && l2) if (f2 = v2.length) for (; f2--; ) "number" === typeof v2[f2] && (e2[g++] = v2[f2]);
            else e2[g++] = v2;
            this.dataMin = n(e2);
            this.dataMax = I(e2);
          },
          translate: function() {
            this.processedXData || this.processData();
            this.generatePoints();
            var a2 = this.options, b2 = a2.stacking, d2 = this.xAxis, e2 = d2.categories, h2 = this.yAxis, g = this.points, l2 = g.length, p2 = !!this.modifyValue, q2 = a2.pointPlacement, B2 = "between" === q2 || k(q2), n2 = a2.threshold, t2 = a2.startFromThreshold ? n2 : 0, u2, D2, y2, w2, J2 = Number.MAX_VALUE;
            "between" === q2 && (q2 = 0.5);
            k(q2) && (q2 *= v(a2.pointRange || d2.pointRange));
            for (a2 = 0; a2 < l2; a2++) {
              var L2 = g[a2], C2 = L2.x, F2 = L2.y;
              D2 = L2.low;
              var I2 = b2 && h2.stacks[(this.negStacks && F2 < (t2 ? 0 : n2) ? "-" : "") + this.stackKey], K2;
              h2.positiveValuesOnly && null !== F2 && 0 >= F2 && (L2.isNull = true);
              L2.plotX = u2 = f(Math.min(Math.max(-1e5, d2.translate(C2, 0, 0, 0, 1, q2, "flags" === this.type)), 1e5));
              b2 && this.visible && !L2.isNull && I2 && I2[C2] && (w2 = this.getStackIndicator(w2, C2, this.index), K2 = I2[C2], F2 = K2.points[w2.key], D2 = F2[0], F2 = F2[1], D2 === t2 && w2.key === I2[C2].base && (D2 = v(k(n2) && n2, h2.min)), h2.positiveValuesOnly && 0 >= D2 && (D2 = null), L2.total = L2.stackTotal = K2.total, L2.percentage = K2.total && L2.y / K2.total * 100, L2.stackY = F2, K2.setOffset(this.pointXOffset || 0, this.barW || 0));
              L2.yBottom = x(D2) ? Math.min(Math.max(-1e5, h2.translate(D2, 0, 1, 0, 1)), 1e5) : null;
              p2 && (F2 = this.modifyValue(F2, L2));
              L2.plotY = D2 = "number" === typeof F2 && Infinity !== F2 ? Math.min(Math.max(-1e5, h2.translate(F2, 0, 1, 0, 1)), 1e5) : void 0;
              L2.isInside = void 0 !== D2 && 0 <= D2 && D2 <= h2.len && 0 <= u2 && u2 <= d2.len;
              L2.clientX = B2 ? f(d2.translate(C2, 0, 0, 0, 1, q2)) : u2;
              L2.negative = L2.y < (n2 || 0);
              L2.category = e2 && void 0 !== e2[L2.x] ? e2[L2.x] : L2.x;
              L2.isNull || (void 0 !== y2 && (J2 = Math.min(J2, Math.abs(u2 - y2))), y2 = u2);
              L2.zone = this.zones.length && L2.getZone();
            }
            this.closestPointRangePx = J2;
            c(this, "afterTranslate");
          },
          getValidPoints: function(a2, b2) {
            var c2 = this.chart;
            return h(a2 || this.points || [], function(a3) {
              return b2 && !c2.isInsidePlot(a3.plotX, a3.plotY, c2.inverted) ? false : !a3.isNull;
            });
          },
          setClip: function(a2) {
            var b2 = this.chart, c2 = this.options, d2 = b2.renderer, e2 = b2.inverted, g = this.clipBox, m = g || b2.clipBox, h2 = this.sharedClipKey || ["_sharedClip", a2 && a2.duration, a2 && a2.easing, m.height, c2.xAxis, c2.yAxis].join(), f2 = b2[h2], l2 = b2[h2 + "m"];
            f2 || (a2 && (m.width = 0, e2 && (m.x = b2.plotSizeX), b2[h2 + "m"] = l2 = d2.clipRect(e2 ? b2.plotSizeX + 99 : -99, e2 ? -b2.plotLeft : -b2.plotTop, 99, e2 ? b2.chartWidth : b2.chartHeight)), b2[h2] = f2 = d2.clipRect(m), f2.count = {
              length: 0
            });
            a2 && !f2.count[this.index] && (f2.count[this.index] = true, f2.count.length += 1);
            false !== c2.clip && (this.group.clip(a2 || g ? f2 : b2.clipRect), this.markerGroup.clip(l2), this.sharedClipKey = h2);
            a2 || (f2.count[this.index] && (delete f2.count[this.index], --f2.count.length), 0 === f2.count.length && h2 && b2[h2] && (g || (b2[h2] = b2[h2].destroy()), b2[h2 + "m"] && (b2[h2 + "m"] = b2[h2 + "m"].destroy())));
          },
          animate: function(a2) {
            var b2 = this.chart, c2 = F(this.options.animation), d2;
            a2 ? this.setClip(c2) : (d2 = this.sharedClipKey, (a2 = b2[d2]) && a2.animate({
              width: b2.plotSizeX,
              x: 0
            }, c2), b2[d2 + "m"] && b2[d2 + "m"].animate({
              width: b2.plotSizeX + 99,
              x: 0
            }, c2), this.animate = null);
          },
          afterAnimate: function() {
            this.setClip();
            c(this, "afterAnimate");
            this.finishedAnimating = true;
          },
          drawPoints: function() {
            var a2 = this.points, b2 = this.chart, c2, d2, e2, g, h2 = this.options.marker, f2, l2, k2, p2 = this[this.specialGroup] || this.markerGroup, q2, n2 = v(h2.enabled, this.xAxis.isRadial ? true : null, this.closestPointRangePx >= h2.enabledThreshold * h2.radius);
            if (false !== h2.enabled || this._hasPointMarkers) for (c2 = 0; c2 < a2.length; c2++) d2 = a2[c2], g = d2.graphic, f2 = d2.marker || {}, l2 = !!d2.marker, e2 = n2 && void 0 === f2.enabled || f2.enabled, k2 = d2.isInside, e2 && !d2.isNull ? (e2 = v(f2.symbol, this.symbol), q2 = this.markerAttribs(d2, d2.selected && "select"), g ? g[k2 ? "show" : "hide"](true).animate(q2) : k2 && (0 < q2.width || d2.hasImage) && (d2.graphic = g = b2.renderer.symbol(e2, q2.x, q2.y, q2.width, q2.height, l2 ? f2 : h2).add(p2)), g && g.attr(this.pointAttribs(d2, d2.selected && "select")), g && g.addClass(d2.getClassName(), true)) : g && (d2.graphic = g.destroy());
          },
          markerAttribs: function(a2, b2) {
            var c2 = this.options.marker, d2 = a2.marker || {}, e2 = d2.symbol || c2.symbol, g = v(d2.radius, c2.radius);
            b2 && (c2 = c2.states[b2], b2 = d2.states && d2.states[b2], g = v(b2 && b2.radius, c2 && c2.radius, g + (c2 && c2.radiusPlus || 0)));
            a2.hasImage = e2 && 0 === e2.indexOf("url");
            a2.hasImage && (g = 0);
            a2 = {
              x: Math.floor(a2.plotX) - g,
              y: a2.plotY - g
            };
            g && (a2.width = a2.height = 2 * g);
            return a2;
          },
          pointAttribs: function(a2, b2) {
            var c2 = this.options.marker, d2 = a2 && a2.options, e2 = d2 && d2.marker || {}, g = this.color, h2 = d2 && d2.color, m = a2 && a2.color, d2 = v(e2.lineWidth, c2.lineWidth);
            a2 = a2 && a2.zone && a2.zone.color;
            g = h2 || a2 || m || g;
            a2 = e2.fillColor || c2.fillColor || g;
            g = e2.lineColor || c2.lineColor || g;
            b2 && (c2 = c2.states[b2], b2 = e2.states && e2.states[b2] || {}, d2 = v(b2.lineWidth, c2.lineWidth, d2 + v(b2.lineWidthPlus, c2.lineWidthPlus, 0)), a2 = b2.fillColor || c2.fillColor || a2, g = b2.lineColor || c2.lineColor || g);
            return {
              stroke: g,
              "stroke-width": d2,
              fill: a2
            };
          },
          destroy: function() {
            var d2 = this, e2 = d2.chart, h2 = /AppleWebKit\/533/.test(D.navigator.userAgent), f2, l2, g = d2.data || [], k2, p2;
            c(d2, "destroy");
            J(d2);
            t(d2.axisTypes || [], function(a2) {
              (p2 = d2[a2]) && p2.series && (w(p2.series, d2), p2.isDirty = p2.forceRedraw = true);
            });
            d2.legendItem && d2.chart.legend.destroyItem(d2);
            for (l2 = g.length; l2--; ) (k2 = g[l2]) && k2.destroy && k2.destroy();
            d2.points = null;
            a.clearTimeout(d2.animationTimeout);
            b(d2, function(a2, b2) {
              a2 instanceof L && !a2.survive && (f2 = h2 && "group" === b2 ? "hide" : "destroy", a2[f2]());
            });
            e2.hoverSeries === d2 && (e2.hoverSeries = null);
            w(e2.series, d2);
            e2.orderSeries();
            b(d2, function(a2, b2) {
              delete d2[b2];
            });
          },
          getGraphPath: function(a2, b2, c2) {
            var d2 = this, e2 = d2.options, g = e2.step, h2, m = [], f2 = [], l2;
            a2 = a2 || d2.points;
            (h2 = a2.reversed) && a2.reverse();
            (g = {
              right: 1,
              center: 2
            }[g] || g && 3) && h2 && (g = 4 - g);
            !e2.connectNulls || b2 || c2 || (a2 = this.getValidPoints(a2));
            t(a2, function(h3, k2) {
              var r = h3.plotX, p2 = h3.plotY, q2 = a2[k2 - 1];
              (h3.leftCliff || q2 && q2.rightCliff) && !c2 && (l2 = true);
              h3.isNull && !x(b2) && 0 < k2 ? l2 = !e2.connectNulls : h3.isNull && !b2 ? l2 = true : (0 === k2 || l2 ? k2 = ["M", h3.plotX, h3.plotY] : d2.getPointSpline ? k2 = d2.getPointSpline(a2, h3, k2) : g ? (k2 = 1 === g ? ["L", q2.plotX, p2] : 2 === g ? ["L", (q2.plotX + r) / 2, q2.plotY, "L", (q2.plotX + r) / 2, p2] : ["L", r, q2.plotY], k2.push("L", r, p2)) : k2 = ["L", r, p2], f2.push(h3.x), g && (f2.push(h3.x), 2 === g && f2.push(h3.x)), m.push.apply(m, k2), l2 = false);
            });
            m.xMap = f2;
            return d2.graphPath = m;
          },
          drawGraph: function() {
            var a2 = this, b2 = this.options, c2 = (this.gappedPath || this.getGraphPath).call(this), d2 = [["graph", "highcharts-graph", b2.lineColor || this.color, b2.dashStyle]], d2 = a2.getZonesGraphs(d2);
            t(d2, function(d3, g) {
              var e2 = d3[0], h2 = a2[e2];
              h2 ? (h2.endX = a2.preventGraphAnimation ? null : c2.xMap, h2.animate({
                d: c2
              })) : c2.length && (a2[e2] = a2.chart.renderer.path(c2).addClass(d3[1]).attr({
                zIndex: 1
              }).add(a2.group), h2 = {
                stroke: d3[2],
                "stroke-width": b2.lineWidth,
                fill: a2.fillGraph && a2.color || "none"
              }, d3[3] ? h2.dashstyle = d3[3] : "square" !== b2.linecap && (h2["stroke-linecap"] = h2["stroke-linejoin"] = "round"), h2 = a2[e2].attr(h2).shadow(2 > g && b2.shadow));
              h2 && (h2.startX = c2.xMap, h2.isArea = c2.isArea);
            });
          },
          getZonesGraphs: function(a2) {
            t(this.zones, function(b2, c2) {
              a2.push(["zone-graph-" + c2, "highcharts-graph highcharts-zone-graph-" + c2 + " " + (b2.className || ""), b2.color || this.color, b2.dashStyle || this.options.dashStyle]);
            }, this);
            return a2;
          },
          applyZones: function() {
            var a2 = this, b2 = this.chart, c2 = b2.renderer, d2 = this.zones, e2, g, h2 = this.clips || [], f2, l2 = this.graph, k2 = this.area, p2 = Math.max(b2.chartWidth, b2.chartHeight), q2 = this[(this.zoneAxis || "y") + "Axis"], n2, B2, u2 = b2.inverted, D2, y2, w2, x2, J2 = false;
            d2.length && (l2 || k2) && q2 && void 0 !== q2.min && (B2 = q2.reversed, D2 = q2.horiz, l2 && !this.showLine && l2.hide(), k2 && k2.hide(), n2 = q2.getExtremes(), t(d2, function(d3, m) {
              e2 = B2 ? D2 ? b2.plotWidth : 0 : D2 ? 0 : q2.toPixels(n2.min);
              e2 = Math.min(Math.max(v(g, e2), 0), p2);
              g = Math.min(Math.max(Math.round(q2.toPixels(v(d3.value, n2.max), true)), 0), p2);
              J2 && (e2 = g = q2.toPixels(n2.max));
              y2 = Math.abs(e2 - g);
              w2 = Math.min(e2, g);
              x2 = Math.max(e2, g);
              q2.isXAxis ? (f2 = {
                x: u2 ? x2 : w2,
                y: 0,
                width: y2,
                height: p2
              }, D2 || (f2.x = b2.plotHeight - f2.x)) : (f2 = {
                x: 0,
                y: u2 ? x2 : w2,
                width: p2,
                height: y2
              }, D2 && (f2.y = b2.plotWidth - f2.y));
              u2 && c2.isVML && (f2 = q2.isXAxis ? {
                x: 0,
                y: B2 ? w2 : x2,
                height: f2.width,
                width: b2.chartWidth
              } : {
                x: f2.y - b2.plotLeft - b2.spacingBox.x,
                y: 0,
                width: f2.height,
                height: b2.chartHeight
              });
              h2[m] ? h2[m].animate(f2) : (h2[m] = c2.clipRect(f2), l2 && a2["zone-graph-" + m].clip(h2[m]), k2 && a2["zone-area-" + m].clip(h2[m]));
              J2 = d3.value > n2.max;
              a2.resetZones && 0 === g && (g = void 0);
            }), this.clips = h2);
          },
          invertGroups: function(a2) {
            function b2() {
              t(["group", "markerGroup"], function(b3) {
                c2[b3] && (d2.renderer.isVML && c2[b3].attr({
                  width: c2.yAxis.len,
                  height: c2.xAxis.len
                }), c2[b3].width = c2.yAxis.len, c2[b3].height = c2.xAxis.len, c2[b3].invert(a2));
              });
            }
            var c2 = this, d2 = c2.chart, e2;
            c2.xAxis && (e2 = C(d2, "resize", b2), C(c2, "destroy", e2), b2(a2), c2.invertGroups = b2);
          },
          plotGroup: function(a2, b2, c2, d2, e2) {
            var g = this[a2], h2 = !g;
            h2 && (this[a2] = g = this.chart.renderer.g().attr({
              zIndex: d2 || 0.1
            }).add(e2));
            g.addClass("highcharts-" + b2 + " highcharts-series-" + this.index + " highcharts-" + this.type + "-series " + (x(this.colorIndex) ? "highcharts-color-" + this.colorIndex + " " : "") + (this.options.className || "") + (g.hasClass("highcharts-tracker") ? " highcharts-tracker" : ""), true);
            g.attr({
              visibility: c2
            })[h2 ? "attr" : "animate"](this.getPlotBox());
            return g;
          },
          getPlotBox: function() {
            var a2 = this.chart, b2 = this.xAxis, c2 = this.yAxis;
            a2.inverted && (b2 = c2, c2 = this.xAxis);
            return {
              translateX: b2 ? b2.left : a2.plotLeft,
              translateY: c2 ? c2.top : a2.plotTop,
              scaleX: 1,
              scaleY: 1
            };
          },
          render: function() {
            var a2 = this, b2 = a2.chart, d2, e2 = a2.options, h2 = !!a2.animate && b2.renderer.isSVG && F(e2.animation).duration, g = a2.visible ? "inherit" : "hidden", f2 = e2.zIndex, l2 = a2.hasRendered, k2 = b2.seriesGroup, p2 = b2.inverted;
            d2 = a2.plotGroup("group", "series", g, f2, k2);
            a2.markerGroup = a2.plotGroup("markerGroup", "markers", g, f2, k2);
            h2 && a2.animate(true);
            d2.inverted = a2.isCartesian ? p2 : false;
            a2.drawGraph && (a2.drawGraph(), a2.applyZones());
            a2.drawDataLabels && a2.drawDataLabels();
            a2.visible && a2.drawPoints();
            a2.drawTracker && false !== a2.options.enableMouseTracking && a2.drawTracker();
            a2.invertGroups(p2);
            false === e2.clip || a2.sharedClipKey || l2 || d2.clip(b2.clipRect);
            h2 && a2.animate();
            l2 || (a2.animationTimeout = B(function() {
              a2.afterAnimate();
            }, h2));
            a2.isDirty = false;
            a2.hasRendered = true;
            c(a2, "afterRender");
          },
          redraw: function() {
            var a2 = this.chart, b2 = this.isDirty || this.isDirtyData, c2 = this.group, d2 = this.xAxis, e2 = this.yAxis;
            c2 && (a2.inverted && c2.attr({
              width: a2.plotWidth,
              height: a2.plotHeight
            }), c2.animate({
              translateX: v(d2 && d2.left, a2.plotLeft),
              translateY: v(e2 && e2.top, a2.plotTop)
            }));
            this.translate();
            this.render();
            b2 && delete this.kdTree;
          },
          kdAxisArray: ["clientX", "plotY"],
          searchPoint: function(a2, b2) {
            var c2 = this.xAxis, d2 = this.yAxis, e2 = this.chart.inverted;
            return this.searchKDTree({
              clientX: e2 ? c2.len - a2.chartY + c2.pos : a2.chartX - c2.pos,
              plotY: e2 ? d2.len - a2.chartX + d2.pos : a2.chartY - d2.pos
            }, b2);
          },
          buildKDTree: function() {
            function a2(c3, d2, g) {
              var e2, h2;
              if (h2 = c3 && c3.length) return e2 = b2.kdAxisArray[d2 % g], c3.sort(function(a3, b3) {
                return a3[e2] - b3[e2];
              }), h2 = Math.floor(h2 / 2), {
                point: c3[h2],
                left: a2(c3.slice(0, h2), d2 + 1, g),
                right: a2(c3.slice(h2 + 1), d2 + 1, g)
              };
            }
            this.buildingKdTree = true;
            var b2 = this, c2 = -1 < b2.options.findNearestPointBy.indexOf("y") ? 2 : 1;
            delete b2.kdTree;
            B(function() {
              b2.kdTree = a2(b2.getValidPoints(null, !b2.directTouch), c2, c2);
              b2.buildingKdTree = false;
            }, b2.options.kdNow ? 0 : 1);
          },
          searchKDTree: function(a2, b2) {
            function c2(a3, b3, f2, l2) {
              var m = b3.point, k2 = d2.kdAxisArray[f2 % l2], p2, q2, r = m;
              q2 = x(a3[e2]) && x(m[e2]) ? Math.pow(a3[e2] - m[e2], 2) : null;
              p2 = x(a3[g]) && x(m[g]) ? Math.pow(a3[g] - m[g], 2) : null;
              p2 = (q2 || 0) + (p2 || 0);
              m.dist = x(p2) ? Math.sqrt(p2) : Number.MAX_VALUE;
              m.distX = x(q2) ? Math.sqrt(q2) : Number.MAX_VALUE;
              k2 = a3[k2] - m[k2];
              p2 = 0 > k2 ? "left" : "right";
              q2 = 0 > k2 ? "right" : "left";
              b3[p2] && (p2 = c2(a3, b3[p2], f2 + 1, l2), r = p2[h2] < r[h2] ? p2 : m);
              b3[q2] && Math.sqrt(k2 * k2) < r[h2] && (a3 = c2(a3, b3[q2], f2 + 1, l2), r = a3[h2] < r[h2] ? a3 : r);
              return r;
            }
            var d2 = this, e2 = this.kdAxisArray[0], g = this.kdAxisArray[1], h2 = b2 ? "distX" : "dist";
            b2 = -1 < d2.options.findNearestPointBy.indexOf("y") ? 2 : 1;
            this.kdTree || this.buildingKdTree || this.buildKDTree();
            if (this.kdTree) return c2(a2, this.kdTree, b2, b2);
          }
        });
      })(K);
      (function(a) {
        var C = a.Axis, F = a.Chart, I = a.correctFloat, n = a.defined, f = a.destroyObjectProperties, e = a.each, u = a.format, x = a.objectEach, t = a.pick, w = a.Series;
        a.StackItem = function(a2, c, e2, f2, k) {
          var h = a2.chart.inverted;
          this.axis = a2;
          this.isNegative = e2;
          this.options = c;
          this.x = f2;
          this.total = null;
          this.points = {};
          this.stack = k;
          this.rightCliff = this.leftCliff = 0;
          this.alignOptions = {
            align: c.align || (h ? e2 ? "left" : "right" : "center"),
            verticalAlign: c.verticalAlign || (h ? "middle" : e2 ? "bottom" : "top"),
            y: t(c.y, h ? 4 : e2 ? 14 : -6),
            x: t(c.x, h ? e2 ? -6 : 6 : 0)
          };
          this.textAlign = c.textAlign || (h ? e2 ? "right" : "left" : "center");
        };
        a.StackItem.prototype = {
          destroy: function() {
            f(this, this.axis);
          },
          render: function(a2) {
            var c = this.axis.chart, e2 = this.options, f2 = e2.format, f2 = f2 ? u(f2, this, c.time) : e2.formatter.call(this);
            this.label ? this.label.attr({
              text: f2,
              visibility: "hidden"
            }) : this.label = c.renderer.text(f2, null, null, e2.useHTML).css(e2.style).attr({
              align: this.textAlign,
              rotation: e2.rotation,
              visibility: "hidden"
            }).add(a2);
            this.label.labelrank = c.plotHeight;
          },
          setOffset: function(a2, c) {
            var e2 = this.axis, f2 = e2.chart, k = e2.translate(e2.usePercentage ? 100 : this.total, 0, 0, 0, 1), q = e2.translate(0), q = n(k) && Math.abs(k - q);
            a2 = f2.xAxis[0].translate(this.x) + a2;
            e2 = n(k) && this.getStackBox(f2, this, a2, k, c, q, e2);
            (c = this.label) && e2 && (c.align(this.alignOptions, null, e2), e2 = c.alignAttr, c[false === this.options.crop || f2.isInsidePlot(e2.x, e2.y) ? "show" : "hide"](true));
          },
          getStackBox: function(a2, c, e2, f2, k, q, d) {
            var b = c.axis.reversed, h = a2.inverted;
            a2 = d.height + d.pos - (h ? a2.plotLeft : a2.plotTop);
            c = c.isNegative && !b || !c.isNegative && b;
            return {
              x: h ? c ? f2 : f2 - q : e2,
              y: h ? a2 - e2 - k : c ? a2 - f2 - q : a2 - f2,
              width: h ? q : k,
              height: h ? k : q
            };
          }
        };
        F.prototype.getStacks = function() {
          var a2 = this;
          e(a2.yAxis, function(a3) {
            a3.stacks && a3.hasVisibleSeries && (a3.oldStacks = a3.stacks);
          });
          e(a2.series, function(c) {
            !c.options.stacking || true !== c.visible && false !== a2.options.chart.ignoreHiddenSeries || (c.stackKey = c.type + t(c.options.stack, ""));
          });
        };
        C.prototype.buildStacks = function() {
          var a2 = this.series, c = t(this.options.reversedStacks, true), e2 = a2.length, f2;
          if (!this.isXAxis) {
            this.usePercentage = false;
            for (f2 = e2; f2--; ) a2[c ? f2 : e2 - f2 - 1].setStackedPoints();
            for (f2 = 0; f2 < e2; f2++) a2[f2].modifyStacks();
          }
        };
        C.prototype.renderStackTotals = function() {
          var a2 = this.chart, c = a2.renderer, e2 = this.stacks, f2 = this.stackTotalGroup;
          f2 || (this.stackTotalGroup = f2 = c.g("stack-labels").attr({
            visibility: "visible",
            zIndex: 6
          }).add());
          f2.translate(a2.plotLeft, a2.plotTop);
          x(e2, function(a3) {
            x(a3, function(a4) {
              a4.render(f2);
            });
          });
        };
        C.prototype.resetStacks = function() {
          var a2 = this, c = a2.stacks;
          a2.isXAxis || x(c, function(c2) {
            x(c2, function(e2, h) {
              e2.touched < a2.stacksTouched ? (e2.destroy(), delete c2[h]) : (e2.total = null, e2.cumulative = null);
            });
          });
        };
        C.prototype.cleanStacks = function() {
          var a2;
          this.isXAxis || (this.oldStacks && (a2 = this.stacks = this.oldStacks), x(a2, function(a3) {
            x(a3, function(a4) {
              a4.cumulative = a4.total;
            });
          }));
        };
        w.prototype.setStackedPoints = function() {
          if (this.options.stacking && (true === this.visible || false === this.chart.options.chart.ignoreHiddenSeries)) {
            var e2 = this.processedXData, c = this.processedYData, h = [], f2 = c.length, k = this.options, q = k.threshold, d = t(k.startFromThreshold && q, 0), b = k.stack, k = k.stacking, v = this.stackKey, u2 = "-" + v, l = this.negStacks, w2 = this.yAxis, B = w2.stacks, D = w2.oldStacks, m, G, A, x2, E, g, r;
            w2.stacksTouched += 1;
            for (E = 0; E < f2; E++) g = e2[E], r = c[E], m = this.getStackIndicator(m, g, this.index), x2 = m.key, A = (G = l && r < (d ? 0 : q)) ? u2 : v, B[A] || (B[A] = {}), B[A][g] || (D[A] && D[A][g] ? (B[A][g] = D[A][g], B[A][g].total = null) : B[A][g] = new a.StackItem(w2, w2.options.stackLabels, G, g, b)), A = B[A][g], null !== r ? (A.points[x2] = A.points[this.index] = [t(A.cumulative, d)], n(A.cumulative) || (A.base = x2), A.touched = w2.stacksTouched, 0 < m.index && false === this.singleStacks && (A.points[x2][0] = A.points[this.index + "," + g + ",0"][0])) : A.points[x2] = A.points[this.index] = null, "percent" === k ? (G = G ? v : u2, l && B[G] && B[G][g] ? (G = B[G][g], A.total = G.total = Math.max(G.total, A.total) + Math.abs(r) || 0) : A.total = I(A.total + (Math.abs(r) || 0))) : A.total = I(A.total + (r || 0)), A.cumulative = t(A.cumulative, d) + (r || 0), null !== r && (A.points[x2].push(A.cumulative), h[E] = A.cumulative);
            "percent" === k && (w2.usePercentage = true);
            this.stackedYData = h;
            w2.oldStacks = {};
          }
        };
        w.prototype.modifyStacks = function() {
          var a2 = this, c = a2.stackKey, h = a2.yAxis.stacks, f2 = a2.processedXData, k, q = a2.options.stacking;
          a2[q + "Stacker"] && e([c, "-" + c], function(c2) {
            for (var b = f2.length, d, e2; b--; ) if (d = f2[b], k = a2.getStackIndicator(k, d, a2.index, c2), e2 = (d = h[c2] && h[c2][d]) && d.points[k.key]) a2[q + "Stacker"](e2, d, b);
          });
        };
        w.prototype.percentStacker = function(a2, c, e2) {
          c = c.total ? 100 / c.total : 0;
          a2[0] = I(a2[0] * c);
          a2[1] = I(a2[1] * c);
          this.stackedYData[e2] = a2[1];
        };
        w.prototype.getStackIndicator = function(a2, c, e2, f2) {
          !n(a2) || a2.x !== c || f2 && a2.key !== f2 ? a2 = {
            x: c,
            index: 0,
            key: f2
          } : a2.index++;
          a2.key = [e2, c, a2.index].join();
          return a2;
        };
      })(K);
      (function(a) {
        var C = a.addEvent, F = a.animate, I = a.Axis, n = a.createElement, f = a.css, e = a.defined, u = a.each, x = a.erase, t = a.extend, w = a.fireEvent, y = a.inArray, c = a.isNumber, h = a.isObject, p = a.isArray, k = a.merge, q = a.objectEach, d = a.pick, b = a.Point, v = a.Series, J = a.seriesTypes, l = a.setAnimation, L = a.splat;
        t(a.Chart.prototype, {
          addSeries: function(a2, b2, c2) {
            var e2, h2 = this;
            a2 && (b2 = d(b2, true), w(h2, "addSeries", {
              options: a2
            }, function() {
              e2 = h2.initSeries(a2);
              h2.isDirtyLegend = true;
              h2.linkSeries();
              w(h2, "afterAddSeries");
              b2 && h2.redraw(c2);
            }));
            return e2;
          },
          addAxis: function(a2, b2, c2, e2) {
            var h2 = b2 ? "xAxis" : "yAxis", f2 = this.options;
            a2 = k(a2, {
              index: this[h2].length,
              isX: b2
            });
            b2 = new I(this, a2);
            f2[h2] = L(f2[h2] || {});
            f2[h2].push(a2);
            d(c2, true) && this.redraw(e2);
            return b2;
          },
          showLoading: function(a2) {
            var b2 = this, c2 = b2.options, d2 = b2.loadingDiv, e2 = c2.loading, h2 = function() {
              d2 && f(d2, {
                left: b2.plotLeft + "px",
                top: b2.plotTop + "px",
                width: b2.plotWidth + "px",
                height: b2.plotHeight + "px"
              });
            };
            d2 || (b2.loadingDiv = d2 = n("div", {
              className: "highcharts-loading highcharts-loading-hidden"
            }, null, b2.container), b2.loadingSpan = n("span", {
              className: "highcharts-loading-inner"
            }, null, d2), C(b2, "redraw", h2));
            d2.className = "highcharts-loading";
            b2.loadingSpan.innerHTML = a2 || c2.lang.loading;
            f(d2, t(e2.style, {
              zIndex: 10
            }));
            f(b2.loadingSpan, e2.labelStyle);
            b2.loadingShown || (f(d2, {
              opacity: 0,
              display: ""
            }), F(d2, {
              opacity: e2.style.opacity || 0.5
            }, {
              duration: e2.showDuration || 0
            }));
            b2.loadingShown = true;
            h2();
          },
          hideLoading: function() {
            var a2 = this.options, b2 = this.loadingDiv;
            b2 && (b2.className = "highcharts-loading highcharts-loading-hidden", F(b2, {
              opacity: 0
            }, {
              duration: a2.loading.hideDuration || 100,
              complete: function() {
                f(b2, {
                  display: "none"
                });
              }
            }));
            this.loadingShown = false;
          },
          propsRequireDirtyBox: "backgroundColor borderColor borderWidth margin marginTop marginRight marginBottom marginLeft spacing spacingTop spacingRight spacingBottom spacingLeft borderRadius plotBackgroundColor plotBackgroundImage plotBorderColor plotBorderWidth plotShadow shadow".split(" "),
          propsRequireUpdateSeries: "chart.inverted chart.polar chart.ignoreHiddenSeries chart.type colors plotOptions time tooltip".split(" "),
          update: function(a2, b2, h2, f2) {
            var l2 = this, m = {
              credits: "addCredits",
              title: "setTitle",
              subtitle: "setSubtitle"
            }, p2 = a2.chart, g, r, v2 = [];
            w(l2, "update", {
              options: a2
            });
            if (p2) {
              k(true, l2.options.chart, p2);
              "className" in p2 && l2.setClassName(p2.className);
              "reflow" in p2 && l2.setReflow(p2.reflow);
              if ("inverted" in p2 || "polar" in p2 || "type" in p2) l2.propFromSeries(), g = true;
              "alignTicks" in p2 && (g = true);
              q(p2, function(a3, b3) {
                -1 !== y("chart." + b3, l2.propsRequireUpdateSeries) && (r = true);
                -1 !== y(b3, l2.propsRequireDirtyBox) && (l2.isDirtyBox = true);
              });
              "style" in p2 && l2.renderer.setStyle(p2.style);
            }
            a2.colors && (this.options.colors = a2.colors);
            a2.plotOptions && k(true, this.options.plotOptions, a2.plotOptions);
            q(a2, function(a3, b3) {
              if (l2[b3] && "function" === typeof l2[b3].update) l2[b3].update(a3, false);
              else if ("function" === typeof l2[m[b3]]) l2[m[b3]](a3);
              "chart" !== b3 && -1 !== y(b3, l2.propsRequireUpdateSeries) && (r = true);
            });
            u("xAxis yAxis zAxis series colorAxis pane".split(" "), function(b3) {
              var c2;
              a2[b3] && ("series" === b3 && (c2 = [], u(l2[b3], function(a3, b4) {
                a3.options.isInternal || c2.push(b4);
              })), u(L(a2[b3]), function(a3, d2) {
                (d2 = e(a3.id) && l2.get(a3.id) || l2[b3][c2 ? c2[d2] : d2]) && d2.coll === b3 && (d2.update(a3, false), h2 && (d2.touched = true));
                if (!d2 && h2) {
                  if ("series" === b3) l2.addSeries(a3, false).touched = true;
                  else if ("xAxis" === b3 || "yAxis" === b3) l2.addAxis(a3, "xAxis" === b3, false).touched = true;
                }
              }), h2 && u(l2[b3], function(a3) {
                a3.touched || a3.options.isInternal ? delete a3.touched : v2.push(a3);
              }));
            });
            u(v2, function(a3) {
              a3.remove && a3.remove(false);
            });
            g && u(l2.axes, function(a3) {
              a3.update({}, false);
            });
            r && u(l2.series, function(a3) {
              a3.update({}, false);
            });
            a2.loading && k(true, l2.options.loading, a2.loading);
            g = p2 && p2.width;
            p2 = p2 && p2.height;
            c(g) && g !== l2.chartWidth || c(p2) && p2 !== l2.chartHeight ? l2.setSize(g, p2, f2) : d(b2, true) && l2.redraw(f2);
            w(l2, "afterUpdate", {
              options: a2
            });
          },
          setSubtitle: function(a2) {
            this.setTitle(void 0, a2);
          }
        });
        t(b.prototype, {
          update: function(a2, b2, c2, e2) {
            function f2() {
              l2.applyOptions(a2);
              null === l2.y && g && (l2.graphic = g.destroy());
              h(a2, true) && (g && g.element && a2 && a2.marker && void 0 !== a2.marker.symbol && (l2.graphic = g.destroy()), a2 && a2.dataLabels && l2.dataLabel && (l2.dataLabel = l2.dataLabel.destroy()), l2.connector && (l2.connector = l2.connector.destroy()));
              k2 = l2.index;
              m.updateParallelArrays(l2, k2);
              p2.data[k2] = h(p2.data[k2], true) || h(a2, true) ? l2.options : d(a2, p2.data[k2]);
              m.isDirty = m.isDirtyData = true;
              !m.fixedBox && m.hasCartesianSeries && (q2.isDirtyBox = true);
              "point" === p2.legendType && (q2.isDirtyLegend = true);
              b2 && q2.redraw(c2);
            }
            var l2 = this, m = l2.series, g = l2.graphic, k2, q2 = m.chart, p2 = m.options;
            b2 = d(b2, true);
            false === e2 ? f2() : l2.firePointEvent("update", {
              options: a2
            }, f2);
          },
          remove: function(a2, b2) {
            this.series.removePoint(y(this, this.series.data), a2, b2);
          }
        });
        t(v.prototype, {
          addPoint: function(a2, b2, c2, e2) {
            var h2 = this.options, f2 = this.data, l2 = this.chart, g = this.xAxis, g = g && g.hasNames && g.names, m = h2.data, k2, p2, q2 = this.xData, v2, n2;
            b2 = d(b2, true);
            k2 = {
              series: this
            };
            this.pointClass.prototype.applyOptions.apply(k2, [a2]);
            n2 = k2.x;
            v2 = q2.length;
            if (this.requireSorting && n2 < q2[v2 - 1]) for (p2 = true; v2 && q2[v2 - 1] > n2; ) v2--;
            this.updateParallelArrays(k2, "splice", v2, 0, 0);
            this.updateParallelArrays(k2, v2);
            g && k2.name && (g[n2] = k2.name);
            m.splice(v2, 0, a2);
            p2 && (this.data.splice(v2, 0, null), this.processData());
            "point" === h2.legendType && this.generatePoints();
            c2 && (f2[0] && f2[0].remove ? f2[0].remove(false) : (f2.shift(), this.updateParallelArrays(k2, "shift"), m.shift()));
            this.isDirtyData = this.isDirty = true;
            b2 && l2.redraw(e2);
          },
          removePoint: function(a2, b2, c2) {
            var e2 = this, h2 = e2.data, f2 = h2[a2], m = e2.points, g = e2.chart, k2 = function() {
              m && m.length === h2.length && m.splice(a2, 1);
              h2.splice(a2, 1);
              e2.options.data.splice(a2, 1);
              e2.updateParallelArrays(f2 || {
                series: e2
              }, "splice", a2, 1);
              f2 && f2.destroy();
              e2.isDirty = true;
              e2.isDirtyData = true;
              b2 && g.redraw();
            };
            l(c2, g);
            b2 = d(b2, true);
            f2 ? f2.firePointEvent("remove", null, k2) : k2();
          },
          remove: function(a2, b2, c2) {
            function e2() {
              h2.destroy();
              h2.remove = null;
              f2.isDirtyLegend = f2.isDirtyBox = true;
              f2.linkSeries();
              d(a2, true) && f2.redraw(b2);
            }
            var h2 = this, f2 = h2.chart;
            false !== c2 ? w(h2, "remove", null, e2) : e2();
          },
          update: function(b2, c2) {
            var e2 = this, h2 = e2.chart, f2 = e2.userOptions, l2 = e2.oldType || e2.type, q2 = b2.type || f2.type || h2.options.chart.type, g = J[l2].prototype, p2, v2 = ["group", "markerGroup", "dataLabelsGroup"], n2 = ["navigatorSeries", "baseSeries"], B = e2.finishedAnimating && {
              animation: false
            }, D = ["data", "name", "turboThreshold"], x2 = a.keys(b2), L2 = 0 < x2.length;
            u(x2, function(a2) {
              -1 === y(a2, D) && (L2 = false);
            });
            if (L2) b2.data && this.setData(b2.data, false), b2.name && this.setName(b2.name, false);
            else {
              n2 = v2.concat(n2);
              u(n2, function(a2) {
                n2[a2] = e2[a2];
                delete e2[a2];
              });
              b2 = k(f2, B, {
                index: e2.index,
                pointStart: d(f2.pointStart, e2.xData[0])
              }, {
                data: e2.options.data
              }, b2);
              e2.remove(false, null, false);
              for (p2 in g) e2[p2] = void 0;
              J[q2 || l2] ? t(e2, J[q2 || l2].prototype) : a.error(17, true);
              u(n2, function(a2) {
                e2[a2] = n2[a2];
              });
              e2.init(h2, b2);
              b2.zIndex !== f2.zIndex && u(v2, function(a2) {
                e2[a2] && e2[a2].attr({
                  zIndex: b2.zIndex
                });
              });
              e2.oldType = l2;
              h2.linkSeries();
            }
            w(this, "afterUpdate");
            d(c2, true) && h2.redraw(L2 ? void 0 : false);
          },
          setName: function(a2) {
            this.name = this.options.name = this.userOptions.name = a2;
            this.chart.isDirtyLegend = true;
          }
        });
        t(I.prototype, {
          update: function(a2, b2) {
            var c2 = this.chart, e2 = a2 && a2.events || {};
            a2 = k(this.userOptions, a2);
            c2.options[this.coll].indexOf && (c2.options[this.coll][c2.options[this.coll].indexOf(this.userOptions)] = a2);
            q(c2.options[this.coll].events, function(a3, b3) {
              "undefined" === typeof e2[b3] && (e2[b3] = void 0);
            });
            this.destroy(true);
            this.init(c2, t(a2, {
              events: e2
            }));
            c2.isDirtyBox = true;
            d(b2, true) && c2.redraw();
          },
          remove: function(a2) {
            for (var b2 = this.chart, c2 = this.coll, e2 = this.series, h2 = e2.length; h2--; ) e2[h2] && e2[h2].remove(false);
            x(b2.axes, this);
            x(b2[c2], this);
            p(b2.options[c2]) ? b2.options[c2].splice(this.options.index, 1) : delete b2.options[c2];
            u(b2[c2], function(a3, b3) {
              a3.options.index = a3.userOptions.index = b3;
            });
            this.destroy();
            b2.isDirtyBox = true;
            d(a2, true) && b2.redraw();
          },
          setTitle: function(a2, b2) {
            this.update({
              title: a2
            }, b2);
          },
          setCategories: function(a2, b2) {
            this.update({
              categories: a2
            }, b2);
          }
        });
      })(K);
      (function(a) {
        var C = a.color, F = a.each, I = a.map, n = a.pick, f = a.Series, e = a.seriesType;
        e("area", "line", {
          softThreshold: false,
          threshold: 0
        }, {
          singleStacks: false,
          getStackPoints: function(e2) {
            var f2 = [], t = [], u = this.xAxis, y = this.yAxis, c = y.stacks[this.stackKey], h = {}, p = this.index, k = y.series, q = k.length, d, b = n(y.options.reversedStacks, true) ? 1 : -1, v;
            e2 = e2 || this.points;
            if (this.options.stacking) {
              for (v = 0; v < e2.length; v++) e2[v].leftNull = e2[v].rightNull = null, h[e2[v].x] = e2[v];
              a.objectEach(c, function(a2, b2) {
                null !== a2.total && t.push(b2);
              });
              t.sort(function(a2, b2) {
                return a2 - b2;
              });
              d = I(k, function() {
                return this.visible;
              });
              F(t, function(a2, e3) {
                var l = 0, k2, n2;
                if (h[a2] && !h[a2].isNull) f2.push(h[a2]), F([-1, 1], function(f3) {
                  var l2 = 1 === f3 ? "rightNull" : "leftNull", m = 0, u2 = c[t[e3 + f3]];
                  if (u2) for (v = p; 0 <= v && v < q; ) k2 = u2.points[v], k2 || (v === p ? h[a2][l2] = true : d[v] && (n2 = c[a2].points[v]) && (m -= n2[1] - n2[0])), v += b;
                  h[a2][1 === f3 ? "rightCliff" : "leftCliff"] = m;
                });
                else {
                  for (v = p; 0 <= v && v < q; ) {
                    if (k2 = c[a2].points[v]) {
                      l = k2[1];
                      break;
                    }
                    v += b;
                  }
                  l = y.translate(l, 0, 1, 0, 1);
                  f2.push({
                    isNull: true,
                    plotX: u.translate(a2, 0, 0, 0, 1),
                    x: a2,
                    plotY: l,
                    yBottom: l
                  });
                }
              });
            }
            return f2;
          },
          getGraphPath: function(a2) {
            var e2 = f.prototype.getGraphPath, t = this.options, u = t.stacking, y = this.yAxis, c, h, p = [], k = [], q = this.index, d, b = y.stacks[this.stackKey], v = t.threshold, J = y.getThreshold(t.threshold), l, t = t.connectNulls || "percent" === u, L = function(c2, e3, h2) {
              var f2 = a2[c2];
              c2 = u && b[f2.x].points[q];
              var l2 = f2[h2 + "Null"] || 0;
              h2 = f2[h2 + "Cliff"] || 0;
              var m, n2, f2 = true;
              h2 || l2 ? (m = (l2 ? c2[0] : c2[1]) + h2, n2 = c2[0] + h2, f2 = !!l2) : !u && a2[e3] && a2[e3].isNull && (m = n2 = v);
              void 0 !== m && (k.push({
                plotX: d,
                plotY: null === m ? J : y.getThreshold(m),
                isNull: f2,
                isCliff: true
              }), p.push({
                plotX: d,
                plotY: null === n2 ? J : y.getThreshold(n2),
                doCurve: false
              }));
            };
            a2 = a2 || this.points;
            u && (a2 = this.getStackPoints(a2));
            for (c = 0; c < a2.length; c++) if (h = a2[c].isNull, d = n(a2[c].rectPlotX, a2[c].plotX), l = n(a2[c].yBottom, J), !h || t) t || L(c, c - 1, "left"), h && !u && t || (k.push(a2[c]), p.push({
              x: c,
              plotX: d,
              plotY: l
            })), t || L(c, c + 1, "right");
            c = e2.call(this, k, true, true);
            p.reversed = true;
            h = e2.call(this, p, true, true);
            h.length && (h[0] = "L");
            h = c.concat(h);
            e2 = e2.call(this, k, false, t);
            h.xMap = c.xMap;
            this.areaPath = h;
            return e2;
          },
          drawGraph: function() {
            this.areaPath = [];
            f.prototype.drawGraph.apply(this);
            var a2 = this, e2 = this.areaPath, t = this.options, w = [["area", "highcharts-area", this.color, t.fillColor]];
            F(this.zones, function(e3, c) {
              w.push(["zone-area-" + c, "highcharts-area highcharts-zone-area-" + c + " " + e3.className, e3.color || a2.color, e3.fillColor || t.fillColor]);
            });
            F(w, function(f2) {
              var c = f2[0], h = a2[c];
              h ? (h.endX = a2.preventGraphAnimation ? null : e2.xMap, h.animate({
                d: e2
              })) : (h = a2[c] = a2.chart.renderer.path(e2).addClass(f2[1]).attr({
                fill: n(f2[3], C(f2[2]).setOpacity(n(t.fillOpacity, 0.75)).get()),
                zIndex: 0
              }).add(a2.group), h.isArea = true);
              h.startX = e2.xMap;
              h.shiftUnit = t.step ? 2 : 1;
            });
          },
          drawLegendSymbol: a.LegendSymbolMixin.drawRectangle
        });
      })(K);
      (function(a) {
        var C = a.pick;
        a = a.seriesType;
        a("spline", "line", {}, {
          getPointSpline: function(a2, I, n) {
            var f = I.plotX, e = I.plotY, u = a2[n - 1];
            n = a2[n + 1];
            var x, t, w, y;
            if (u && !u.isNull && false !== u.doCurve && !I.isCliff && n && !n.isNull && false !== n.doCurve && !I.isCliff) {
              a2 = u.plotY;
              w = n.plotX;
              n = n.plotY;
              var c = 0;
              x = (1.5 * f + u.plotX) / 2.5;
              t = (1.5 * e + a2) / 2.5;
              w = (1.5 * f + w) / 2.5;
              y = (1.5 * e + n) / 2.5;
              w !== x && (c = (y - t) * (w - f) / (w - x) + e - y);
              t += c;
              y += c;
              t > a2 && t > e ? (t = Math.max(a2, e), y = 2 * e - t) : t < a2 && t < e && (t = Math.min(a2, e), y = 2 * e - t);
              y > n && y > e ? (y = Math.max(n, e), t = 2 * e - y) : y < n && y < e && (y = Math.min(n, e), t = 2 * e - y);
              I.rightContX = w;
              I.rightContY = y;
            }
            I = ["C", C(u.rightContX, u.plotX), C(u.rightContY, u.plotY), C(x, f), C(t, e), f, e];
            u.rightContX = u.rightContY = null;
            return I;
          }
        });
      })(K);
      (function(a) {
        var C = a.seriesTypes.area.prototype, F = a.seriesType;
        F("areaspline", "spline", a.defaultPlotOptions.area, {
          getStackPoints: C.getStackPoints,
          getGraphPath: C.getGraphPath,
          drawGraph: C.drawGraph,
          drawLegendSymbol: a.LegendSymbolMixin.drawRectangle
        });
      })(K);
      (function(a) {
        var C = a.animObject, F = a.color, I = a.each, n = a.extend, f = a.defined, e = a.isNumber, u = a.merge, x = a.pick, t = a.Series, w = a.seriesType, y = a.svg;
        w("column", "line", {
          borderRadius: 0,
          crisp: true,
          groupPadding: 0.2,
          marker: null,
          pointPadding: 0.1,
          minPointLength: 0,
          cropThreshold: 50,
          pointRange: null,
          states: {
            hover: {
              halo: false,
              brightness: 0.1
            },
            select: {
              color: "#cccccc",
              borderColor: "#000000"
            }
          },
          dataLabels: {
            align: null,
            verticalAlign: null,
            y: null
          },
          softThreshold: false,
          startFromThreshold: true,
          stickyTracking: false,
          tooltip: {
            distance: 6
          },
          threshold: 0,
          borderColor: "#ffffff"
        }, {
          cropShoulder: 0,
          directTouch: true,
          trackerGroups: ["group", "dataLabelsGroup"],
          negStacks: true,
          init: function() {
            t.prototype.init.apply(this, arguments);
            var a2 = this, e2 = a2.chart;
            e2.hasRendered && I(e2.series, function(c) {
              c.type === a2.type && (c.isDirty = true);
            });
          },
          getColumnMetrics: function() {
            var a2 = this, e2 = a2.options, f2 = a2.xAxis, k = a2.yAxis, q = f2.options.reversedStacks, q = f2.reversed && !q || !f2.reversed && q, d, b = {}, v = 0;
            false === e2.grouping ? v = 1 : I(a2.chart.series, function(c) {
              var e3 = c.options, f3 = c.yAxis, h;
              c.type !== a2.type || !c.visible && a2.chart.options.chart.ignoreHiddenSeries || k.len !== f3.len || k.pos !== f3.pos || (e3.stacking ? (d = c.stackKey, void 0 === b[d] && (b[d] = v++), h = b[d]) : false !== e3.grouping && (h = v++), c.columnIndex = h);
            });
            var n2 = Math.min(Math.abs(f2.transA) * (f2.ordinalSlope || e2.pointRange || f2.closestPointRange || f2.tickInterval || 1), f2.len), l = n2 * e2.groupPadding, t2 = (n2 - 2 * l) / (v || 1), e2 = Math.min(e2.maxPointWidth || f2.len, x(e2.pointWidth, t2 * (1 - 2 * e2.pointPadding)));
            a2.columnMetrics = {
              width: e2,
              offset: (t2 - e2) / 2 + (l + ((a2.columnIndex || 0) + (q ? 1 : 0)) * t2 - n2 / 2) * (q ? -1 : 1)
            };
            return a2.columnMetrics;
          },
          crispCol: function(a2, e2, f2, k) {
            var c = this.chart, d = this.borderWidth, b = -(d % 2 ? 0.5 : 0), d = d % 2 ? 0.5 : 1;
            c.inverted && c.renderer.isVML && (d += 1);
            this.options.crisp && (f2 = Math.round(a2 + f2) + b, a2 = Math.round(a2) + b, f2 -= a2);
            k = Math.round(e2 + k) + d;
            b = 0.5 >= Math.abs(e2) && 0.5 < k;
            e2 = Math.round(e2) + d;
            k -= e2;
            b && k && (--e2, k += 1);
            return {
              x: a2,
              y: e2,
              width: f2,
              height: k
            };
          },
          translate: function() {
            var a2 = this, e2 = a2.chart, p = a2.options, k = a2.dense = 2 > a2.closestPointRange * a2.xAxis.transA, k = a2.borderWidth = x(p.borderWidth, k ? 0 : 1), q = a2.yAxis, d = p.threshold, b = a2.translatedThreshold = q.getThreshold(d), v = x(p.minPointLength, 5), n2 = a2.getColumnMetrics(), l = n2.width, u2 = a2.barW = Math.max(l, 1 + 2 * k), B = a2.pointXOffset = n2.offset;
            e2.inverted && (b -= 0.5);
            p.pointPadding && (u2 = Math.ceil(u2));
            t.prototype.translate.apply(a2);
            I(a2.points, function(c) {
              var h = x(c.yBottom, b), k2 = 999 + Math.abs(h), p2 = l, k2 = Math.min(Math.max(-k2, c.plotY), q.len + k2), n3 = c.plotX + B, t2 = u2, g = Math.min(k2, h), r, w2 = Math.max(k2, h) - g;
              v && Math.abs(w2) < v && (w2 = v, r = !q.reversed && !c.negative || q.reversed && c.negative, c.y === d && a2.dataMax <= d && q.min < d && (r = !r), g = Math.abs(g - b) > v ? h - v : b - (r ? v : 0));
              f(c.options.pointWidth) && (p2 = t2 = Math.ceil(c.options.pointWidth), n3 -= Math.round((p2 - l) / 2));
              c.barX = n3;
              c.pointWidth = p2;
              c.tooltipPos = e2.inverted ? [q.len + q.pos - e2.plotLeft - k2, a2.xAxis.len - n3 - t2 / 2, w2] : [n3 + t2 / 2, k2 + q.pos - e2.plotTop, w2];
              c.shapeType = "rect";
              c.shapeArgs = a2.crispCol.apply(a2, c.isNull ? [n3, b, t2, 0] : [n3, g, t2, w2]);
            });
          },
          getSymbol: a.noop,
          drawLegendSymbol: a.LegendSymbolMixin.drawRectangle,
          drawGraph: function() {
            this.group[this.dense ? "addClass" : "removeClass"]("highcharts-dense-data");
          },
          pointAttribs: function(a2, e2) {
            var c = this.options, f2, h = this.pointAttrToOptions || {};
            f2 = h.stroke || "borderColor";
            var d = h["stroke-width"] || "borderWidth", b = a2 && a2.color || this.color, n2 = a2 && a2[f2] || c[f2] || this.color || b, t2 = a2 && a2[d] || c[d] || this[d] || 0, h = c.dashStyle;
            a2 && this.zones.length && (b = a2.getZone(), b = a2.options.color || b && b.color || this.color);
            e2 && (a2 = u(c.states[e2], a2.options.states && a2.options.states[e2] || {}), e2 = a2.brightness, b = a2.color || void 0 !== e2 && F(b).brighten(a2.brightness).get() || b, n2 = a2[f2] || n2, t2 = a2[d] || t2, h = a2.dashStyle || h);
            f2 = {
              fill: b,
              stroke: n2,
              "stroke-width": t2
            };
            h && (f2.dashstyle = h);
            return f2;
          },
          drawPoints: function() {
            var a2 = this, f2 = this.chart, p = a2.options, k = f2.renderer, q = p.animationLimit || 250, d;
            I(a2.points, function(b) {
              var c = b.graphic, h = c && f2.pointCount < q ? "animate" : "attr";
              if (e(b.plotY) && null !== b.y) {
                d = b.shapeArgs;
                if (c) c[h](u(d));
                else b.graphic = c = k[b.shapeType](d).add(b.group || a2.group);
                p.borderRadius && c.attr({
                  r: p.borderRadius
                });
                c[h](a2.pointAttribs(b, b.selected && "select")).shadow(p.shadow, null, p.stacking && !p.borderRadius);
                c.addClass(b.getClassName(), true);
              } else c && (b.graphic = c.destroy());
            });
          },
          animate: function(a2) {
            var c = this, e2 = this.yAxis, f2 = c.options, q = this.chart.inverted, d = {}, b = q ? "translateX" : "translateY", v;
            y && (a2 ? (d.scaleY = 1e-3, a2 = Math.min(e2.pos + e2.len, Math.max(e2.pos, e2.toPixels(f2.threshold))), q ? d.translateX = a2 - e2.len : d.translateY = a2, c.group.attr(d)) : (v = c.group.attr(b), c.group.animate({
              scaleY: 1
            }, n(C(c.options.animation), {
              step: function(a3, f3) {
                d[b] = v + f3.pos * (e2.pos - v);
                c.group.attr(d);
              }
            })), c.animate = null));
          },
          remove: function() {
            var a2 = this, e2 = a2.chart;
            e2.hasRendered && I(e2.series, function(c) {
              c.type === a2.type && (c.isDirty = true);
            });
            t.prototype.remove.apply(a2, arguments);
          }
        });
      })(K);
      (function(a) {
        a = a.seriesType;
        a("bar", "column", null, {
          inverted: true
        });
      })(K);
      (function(a) {
        var C = a.Series;
        a = a.seriesType;
        a("scatter", "line", {
          lineWidth: 0,
          findNearestPointBy: "xy",
          marker: {
            enabled: true
          },
          tooltip: {
            headerFormat: '<span style="color:{point.color}">●</span> <span style="font-size: 0.85em"> {series.name}</span><br/>',
            pointFormat: "x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>"
          }
        }, {
          sorted: false,
          requireSorting: false,
          noSharedTooltip: true,
          trackerGroups: ["group", "markerGroup", "dataLabelsGroup"],
          takeOrdinalPosition: false,
          drawGraph: function() {
            this.options.lineWidth && C.prototype.drawGraph.call(this);
          }
        });
      })(K);
      (function(a) {
        var C = a.deg2rad, F = a.isNumber, I = a.pick, n = a.relativeLength;
        a.CenteredSeriesMixin = {
          getCenter: function() {
            var a2 = this.options, e = this.chart, u = 2 * (a2.slicedOffset || 0), x = e.plotWidth - 2 * u, e = e.plotHeight - 2 * u, t = a2.center, t = [I(t[0], "50%"), I(t[1], "50%"), a2.size || "100%", a2.innerSize || 0], w = Math.min(x, e), y, c;
            for (y = 0; 4 > y; ++y) c = t[y], a2 = 2 > y || 2 === y && /%$/.test(c), t[y] = n(c, [x, e, w, t[2]][y]) + (a2 ? u : 0);
            t[3] > t[2] && (t[3] = t[2]);
            return t;
          },
          getStartAndEndRadians: function(a2, e) {
            a2 = F(a2) ? a2 : 0;
            e = F(e) && e > a2 && 360 > e - a2 ? e : a2 + 360;
            return {
              start: C * (a2 + -90),
              end: C * (e + -90)
            };
          }
        };
      })(K);
      (function(a) {
        var C = a.addEvent, F = a.CenteredSeriesMixin, I = a.defined, n = a.each, f = a.extend, e = F.getStartAndEndRadians, u = a.inArray, x = a.noop, t = a.pick, w = a.Point, y = a.Series, c = a.seriesType, h = a.setAnimation;
        c("pie", "line", {
          center: [null, null],
          clip: false,
          colorByPoint: true,
          dataLabels: {
            allowOverlap: true,
            distance: 30,
            enabled: true,
            formatter: function() {
              return this.point.isNull ? void 0 : this.point.name;
            },
            x: 0
          },
          ignoreHiddenPoint: true,
          legendType: "point",
          marker: null,
          size: null,
          showInLegend: false,
          slicedOffset: 10,
          stickyTracking: false,
          tooltip: {
            followPointer: true
          },
          borderColor: "#ffffff",
          borderWidth: 1,
          states: {
            hover: {
              brightness: 0.1
            }
          }
        }, {
          isCartesian: false,
          requireSorting: false,
          directTouch: true,
          noSharedTooltip: true,
          trackerGroups: ["group", "dataLabelsGroup"],
          axisTypes: [],
          pointAttribs: a.seriesTypes.column.prototype.pointAttribs,
          animate: function(a2) {
            var c2 = this, e2 = c2.points, d = c2.startAngleRad;
            a2 || (n(e2, function(a3) {
              var b = a3.graphic, e3 = a3.shapeArgs;
              b && (b.attr({
                r: a3.startR || c2.center[3] / 2,
                start: d,
                end: d
              }), b.animate({
                r: e3.r,
                start: e3.start,
                end: e3.end
              }, c2.options.animation));
            }), c2.animate = null);
          },
          updateTotals: function() {
            var a2, c2 = 0, e2 = this.points, d = e2.length, b, f2 = this.options.ignoreHiddenPoint;
            for (a2 = 0; a2 < d; a2++) b = e2[a2], c2 += f2 && !b.visible ? 0 : b.isNull ? 0 : b.y;
            this.total = c2;
            for (a2 = 0; a2 < d; a2++) b = e2[a2], b.percentage = 0 < c2 && (b.visible || !f2) ? b.y / c2 * 100 : 0, b.total = c2;
          },
          generatePoints: function() {
            y.prototype.generatePoints.call(this);
            this.updateTotals();
          },
          translate: function(a2) {
            this.generatePoints();
            var c2 = 0, f2 = this.options, d = f2.slicedOffset, b = d + (f2.borderWidth || 0), h2, n2, l, p = e(f2.startAngle, f2.endAngle), u2 = this.startAngleRad = p.start, p = (this.endAngleRad = p.end) - u2, w2 = this.points, m, x2 = f2.dataLabels.distance, f2 = f2.ignoreHiddenPoint, A, y2 = w2.length, E;
            a2 || (this.center = a2 = this.getCenter());
            this.getX = function(b2, c3, d2) {
              l = Math.asin(Math.min((b2 - a2[1]) / (a2[2] / 2 + d2.labelDistance), 1));
              return a2[0] + (c3 ? -1 : 1) * Math.cos(l) * (a2[2] / 2 + d2.labelDistance);
            };
            for (A = 0; A < y2; A++) {
              E = w2[A];
              E.labelDistance = t(E.options.dataLabels && E.options.dataLabels.distance, x2);
              this.maxLabelDistance = Math.max(this.maxLabelDistance || 0, E.labelDistance);
              h2 = u2 + c2 * p;
              if (!f2 || E.visible) c2 += E.percentage / 100;
              n2 = u2 + c2 * p;
              E.shapeType = "arc";
              E.shapeArgs = {
                x: a2[0],
                y: a2[1],
                r: a2[2] / 2,
                innerR: a2[3] / 2,
                start: Math.round(1e3 * h2) / 1e3,
                end: Math.round(1e3 * n2) / 1e3
              };
              l = (n2 + h2) / 2;
              l > 1.5 * Math.PI ? l -= 2 * Math.PI : l < -Math.PI / 2 && (l += 2 * Math.PI);
              E.slicedTranslation = {
                translateX: Math.round(Math.cos(l) * d),
                translateY: Math.round(Math.sin(l) * d)
              };
              n2 = Math.cos(l) * a2[2] / 2;
              m = Math.sin(l) * a2[2] / 2;
              E.tooltipPos = [a2[0] + 0.7 * n2, a2[1] + 0.7 * m];
              E.half = l < -Math.PI / 2 || l > Math.PI / 2 ? 1 : 0;
              E.angle = l;
              h2 = Math.min(b, E.labelDistance / 5);
              E.labelPos = [a2[0] + n2 + Math.cos(l) * E.labelDistance, a2[1] + m + Math.sin(l) * E.labelDistance, a2[0] + n2 + Math.cos(l) * h2, a2[1] + m + Math.sin(l) * h2, a2[0] + n2, a2[1] + m, 0 > E.labelDistance ? "center" : E.half ? "right" : "left", l];
            }
          },
          drawGraph: null,
          drawPoints: function() {
            var a2 = this, c2 = a2.chart.renderer, e2, d, b, h2, t2 = a2.options.shadow;
            t2 && !a2.shadowGroup && (a2.shadowGroup = c2.g("shadow").add(a2.group));
            n(a2.points, function(l) {
              d = l.graphic;
              if (l.isNull) d && (l.graphic = d.destroy());
              else {
                h2 = l.shapeArgs;
                e2 = l.getTranslate();
                var k = l.shadowGroup;
                t2 && !k && (k = l.shadowGroup = c2.g("shadow").add(a2.shadowGroup));
                k && k.attr(e2);
                b = a2.pointAttribs(l, l.selected && "select");
                d ? d.setRadialReference(a2.center).attr(b).animate(f(h2, e2)) : (l.graphic = d = c2[l.shapeType](h2).setRadialReference(a2.center).attr(e2).add(a2.group), d.attr(b).attr({
                  "stroke-linejoin": "round"
                }).shadow(t2, k));
                d.attr({
                  visibility: l.visible ? "inherit" : "hidden"
                });
                d.addClass(l.getClassName());
              }
            });
          },
          searchPoint: x,
          sortByAngle: function(a2, c2) {
            a2.sort(function(a3, d) {
              return void 0 !== a3.angle && (d.angle - a3.angle) * c2;
            });
          },
          drawLegendSymbol: a.LegendSymbolMixin.drawRectangle,
          getCenter: F.getCenter,
          getSymbol: x
        }, {
          init: function() {
            w.prototype.init.apply(this, arguments);
            var a2 = this, c2;
            a2.name = t(a2.name, "Slice");
            c2 = function(c3) {
              a2.slice("select" === c3.type);
            };
            C(a2, "select", c2);
            C(a2, "unselect", c2);
            return a2;
          },
          isValid: function() {
            return a.isNumber(this.y, true) && 0 <= this.y;
          },
          setVisible: function(a2, c2) {
            var e2 = this, d = e2.series, b = d.chart, f2 = d.options.ignoreHiddenPoint;
            c2 = t(c2, f2);
            a2 !== e2.visible && (e2.visible = e2.options.visible = a2 = void 0 === a2 ? !e2.visible : a2, d.options.data[u(e2, d.data)] = e2.options, n(["graphic", "dataLabel", "connector", "shadowGroup"], function(b2) {
              if (e2[b2]) e2[b2][a2 ? "show" : "hide"](true);
            }), e2.legendItem && b.legend.colorizeItem(e2, a2), a2 || "hover" !== e2.state || e2.setState(""), f2 && (d.isDirty = true), c2 && b.redraw());
          },
          slice: function(a2, c2, e2) {
            var d = this.series;
            h(e2, d.chart);
            t(c2, true);
            this.sliced = this.options.sliced = I(a2) ? a2 : !this.sliced;
            d.options.data[u(this, d.data)] = this.options;
            this.graphic.animate(this.getTranslate());
            this.shadowGroup && this.shadowGroup.animate(this.getTranslate());
          },
          getTranslate: function() {
            return this.sliced ? this.slicedTranslation : {
              translateX: 0,
              translateY: 0
            };
          },
          haloPath: function(a2) {
            var c2 = this.shapeArgs;
            return this.sliced || !this.visible ? [] : this.series.chart.renderer.symbols.arc(c2.x, c2.y, c2.r + a2, c2.r + a2, {
              innerR: this.shapeArgs.r - 1,
              start: c2.start,
              end: c2.end
            });
          }
        });
      })(K);
      (function(a) {
        var C = a.addEvent, F = a.arrayMax, I = a.defined, n = a.each, f = a.extend, e = a.format, u = a.map, x = a.merge, t = a.noop, w = a.pick, y = a.relativeLength, c = a.Series, h = a.seriesTypes, p = a.some, k = a.stableSort, q = a.isArray, d = a.splat;
        a.distribute = function(b, c2, d2) {
          function e2(a2, b2) {
            return a2.target - b2.target;
          }
          var f2, h2 = true, q2 = b, m = [], v;
          v = 0;
          var t2 = q2.reducedLen || c2;
          for (f2 = b.length; f2--; ) v += b[f2].size;
          if (v > t2) {
            k(b, function(a2, b2) {
              return (b2.rank || 0) - (a2.rank || 0);
            });
            for (v = f2 = 0; v <= t2; ) v += b[f2].size, f2++;
            m = b.splice(f2 - 1, b.length);
          }
          k(b, e2);
          for (b = u(b, function(a2) {
            return {
              size: a2.size,
              targets: [a2.target],
              align: w(a2.align, 0.5)
            };
          }); h2; ) {
            for (f2 = b.length; f2--; ) h2 = b[f2], v = (Math.min.apply(0, h2.targets) + Math.max.apply(0, h2.targets)) / 2, h2.pos = Math.min(Math.max(0, v - h2.size * h2.align), c2 - h2.size);
            f2 = b.length;
            for (h2 = false; f2--; ) 0 < f2 && b[f2 - 1].pos + b[f2 - 1].size > b[f2].pos && (b[f2 - 1].size += b[f2].size, b[f2 - 1].targets = b[f2 - 1].targets.concat(b[f2].targets), b[f2 - 1].align = 0.5, b[f2 - 1].pos + b[f2 - 1].size > c2 && (b[f2 - 1].pos = c2 - b[f2 - 1].size), b.splice(f2, 1), h2 = true);
          }
          q2.push.apply(q2, m);
          f2 = 0;
          p(b, function(b2) {
            var e3 = 0;
            if (p(b2.targets, function() {
              q2[f2].pos = b2.pos + e3;
              if (Math.abs(q2[f2].pos - q2[f2].target) > d2) return n(q2.slice(0, f2 + 1), function(a2) {
                delete a2.pos;
              }), q2.reducedLen = (q2.reducedLen || c2) - 0.1 * c2, q2.reducedLen > 0.1 * c2 && a.distribute(q2, c2, d2), true;
              e3 += q2[f2].size;
              f2++;
            })) return true;
          });
          k(q2, e2);
        };
        c.prototype.drawDataLabels = function() {
          function b(a2, b2) {
            var c3 = b2.filter;
            return c3 ? (b2 = c3.operator, a2 = a2[c3.property], c3 = c3.value, ">" === b2 && a2 > c3 || "<" === b2 && a2 < c3 || ">=" === b2 && a2 >= c3 || "<=" === b2 && a2 <= c3 || "==" === b2 && a2 == c3 || "===" === b2 && a2 === c3 ? true : false) : true;
          }
          function c2(a2, b2) {
            var c3 = [], d2;
            if (q(a2) && !q(b2)) c3 = u(a2, function(a3) {
              return x(a3, b2);
            });
            else if (q(b2) && !q(a2)) c3 = u(b2, function(b3) {
              return x(a2, b3);
            });
            else if (q(a2) || q(b2)) for (d2 = Math.max(a2.length, b2.length); d2--; ) c3[d2] = x(a2[d2], b2[d2]);
            else c3 = x(a2, b2);
            return c3;
          }
          var f2 = this, h2 = f2.chart, k2 = f2.options, p2 = k2.dataLabels, t2 = f2.points, m, y2 = f2.hasRendered || 0, A, F2 = w(p2.defer, !!k2.animation), E = h2.renderer, p2 = c2(c2(h2.options.plotOptions && h2.options.plotOptions.series && h2.options.plotOptions.series.dataLabels, h2.options.plotOptions && h2.options.plotOptions[f2.type] && h2.options.plotOptions[f2.type].dataLabels), p2);
          if (q(p2) || p2.enabled || f2._hasPointLabels) A = f2.plotGroup("dataLabelsGroup", "data-labels", F2 && !y2 ? "hidden" : "visible", p2.zIndex || 6), F2 && (A.attr({
            opacity: +y2
          }), y2 || C(f2, "afterAnimate", function() {
            f2.visible && A.show(true);
            A[k2.animation ? "animate" : "attr"]({
              opacity: 1
            }, {
              duration: 200
            });
          })), n(t2, function(g) {
            m = d(c2(p2, g.dlOptions || g.options && g.options.dataLabels));
            n(m, function(c3, d2) {
              var l = c3.enabled && !g.isNull && b(g, c3), m2, n2, q2, r, p3 = g.dataLabels ? g.dataLabels[d2] : g.dataLabel, v = g.connectors ? g.connectors[d2] : g.connector, t3 = !p3;
              l && (m2 = g.getLabelConfig(), n2 = c3[g.formatPrefix + "Format"] || c3.format, m2 = I(n2) ? e(n2, m2, h2.time) : (c3[g.formatPrefix + "Formatter"] || c3.formatter).call(m2, c3), n2 = c3.style, q2 = c3.rotation, n2.color = w(c3.color, n2.color, f2.color, "#000000"), "contrast" === n2.color && (g.contrastColor = E.getContrast(g.color || f2.color), n2.color = c3.inside || 0 > w(c3.distance, g.labelDistance) || k2.stacking ? g.contrastColor : "#000000"), k2.cursor && (n2.cursor = k2.cursor), r = {
                fill: c3.backgroundColor,
                stroke: c3.borderColor,
                "stroke-width": c3.borderWidth,
                r: c3.borderRadius || 0,
                rotation: q2,
                padding: c3.padding,
                zIndex: 1
              }, a.objectEach(r, function(a2, b2) {
                void 0 === a2 && delete r[b2];
              }));
              !p3 || l && I(m2) ? l && I(m2) && (p3 ? r.text = m2 : (g.dataLabels = g.dataLabels || [], p3 = g.dataLabels[d2] = q2 ? E.text(m2, 0, -9999).addClass("highcharts-data-label") : E.label(m2, 0, -9999, c3.shape, null, null, c3.useHTML, null, "data-label"), d2 || (g.dataLabel = p3), p3.addClass(" highcharts-data-label-color-" + g.colorIndex + " " + (c3.className || "") + (c3.useHTML ? " highcharts-tracker" : ""))), p3.options = c3, p3.attr(r), p3.css(n2).shadow(c3.shadow), p3.added || p3.add(A), f2.alignDataLabel(g, p3, c3, null, t3)) : (g.dataLabel = g.dataLabel.destroy(), g.dataLabels && (1 === g.dataLabels.length ? delete g.dataLabels : delete g.dataLabels[d2]), d2 || delete g.dataLabel, v && (g.connector = g.connector.destroy(), g.connectors && (1 === g.connectors.length ? delete g.connectors : delete g.connectors[d2])));
            });
          });
          a.fireEvent(this, "afterDrawDataLabels");
        };
        c.prototype.alignDataLabel = function(a2, c2, d2, e2, h2) {
          var b = this.chart, l = b.inverted, m = w(a2.dlBox && a2.dlBox.centerX, a2.plotX, -9999), k2 = w(a2.plotY, -9999), n2 = c2.getBBox(), q2, p2 = d2.rotation, g = d2.align, r = this.visible && (a2.series.forceDL || b.isInsidePlot(m, Math.round(k2), l) || e2 && b.isInsidePlot(m, l ? e2.x + 1 : e2.y + e2.height - 1, l)), v = "justify" === w(d2.overflow, "justify");
          if (r && (q2 = d2.style.fontSize, q2 = b.renderer.fontMetrics(q2, c2).b, e2 = f({
            x: l ? this.yAxis.len - k2 : m,
            y: Math.round(l ? this.xAxis.len - m : k2),
            width: 0,
            height: 0
          }, e2), f(d2, {
            width: n2.width,
            height: n2.height
          }), p2 ? (v = false, m = b.renderer.rotCorr(q2, p2), m = {
            x: e2.x + d2.x + e2.width / 2 + m.x,
            y: e2.y + d2.y + {
              top: 0,
              middle: 0.5,
              bottom: 1
            }[d2.verticalAlign] * e2.height
          }, c2[h2 ? "attr" : "animate"](m).attr({
            align: g
          }), k2 = (p2 + 720) % 360, k2 = 180 < k2 && 360 > k2, "left" === g ? m.y -= k2 ? n2.height : 0 : "center" === g ? (m.x -= n2.width / 2, m.y -= n2.height / 2) : "right" === g && (m.x -= n2.width, m.y -= k2 ? 0 : n2.height), c2.placed = true, c2.alignAttr = m) : (c2.align(d2, null, e2), m = c2.alignAttr), v && 0 <= e2.height ? a2.isLabelJustified = this.justifyDataLabel(c2, d2, m, n2, e2, h2) : w(d2.crop, true) && (r = b.isInsidePlot(m.x, m.y) && b.isInsidePlot(m.x + n2.width, m.y + n2.height)), d2.shape && !p2)) c2[h2 ? "attr" : "animate"]({
            anchorX: l ? b.plotWidth - a2.plotY : a2.plotX,
            anchorY: l ? b.plotHeight - a2.plotX : a2.plotY
          });
          r || (c2.attr({
            y: -9999
          }), c2.placed = false);
        };
        c.prototype.justifyDataLabel = function(a2, c2, d2, e2, f2, h2) {
          var b = this.chart, l = c2.align, k2 = c2.verticalAlign, n2, q2, p2 = a2.box ? 0 : a2.padding || 0;
          n2 = d2.x + p2;
          0 > n2 && ("right" === l ? c2.align = "left" : c2.x = -n2, q2 = true);
          n2 = d2.x + e2.width - p2;
          n2 > b.plotWidth && ("left" === l ? c2.align = "right" : c2.x = b.plotWidth - n2, q2 = true);
          n2 = d2.y + p2;
          0 > n2 && ("bottom" === k2 ? c2.verticalAlign = "top" : c2.y = -n2, q2 = true);
          n2 = d2.y + e2.height - p2;
          n2 > b.plotHeight && ("top" === k2 ? c2.verticalAlign = "bottom" : c2.y = b.plotHeight - n2, q2 = true);
          q2 && (a2.placed = !h2, a2.align(c2, null, f2));
          return q2;
        };
        h.pie && (h.pie.prototype.drawDataLabels = function() {
          var b = this, d2 = b.data, e2, f2 = b.chart, h2 = b.options.dataLabels, k2 = w(h2.connectorPadding, 10), q2 = w(h2.connectorWidth, 1), m = f2.plotWidth, p2 = f2.plotHeight, t2 = Math.round(f2.chartWidth / 3), u2, x2 = b.center, g = x2[2] / 2, r = x2[1], y2, C2, H, K2, Q = [[], []], z, P, T, S2, U = [0, 0, 0, 0];
          b.visible && (h2.enabled || b._hasPointLabels) && (n(d2, function(a2) {
            a2.dataLabel && a2.visible && a2.dataLabel.shortened && (a2.dataLabel.attr({
              width: "auto"
            }).css({
              width: "auto",
              textOverflow: "clip"
            }), a2.dataLabel.shortened = false);
          }), c.prototype.drawDataLabels.apply(b), n(d2, function(a2) {
            a2.dataLabel && (a2.visible ? (Q[a2.half].push(a2), a2.dataLabel._pos = null, !I(h2.style.width) && !I(a2.options.dataLabels && a2.options.dataLabels.style && a2.options.dataLabels.style.width) && a2.dataLabel.getBBox().width > t2 && (a2.dataLabel.css({
              width: 0.7 * t2
            }), a2.dataLabel.shortened = true)) : (a2.dataLabel = a2.dataLabel.destroy(), a2.dataLabels && 1 === a2.dataLabels.length && delete a2.dataLabels));
          }), n(Q, function(c2, d3) {
            var l, q3, t3 = c2.length, v = [], u3;
            if (t3) for (b.sortByAngle(c2, d3 - 0.5), 0 < b.maxLabelDistance && (l = Math.max(0, r - g - b.maxLabelDistance), q3 = Math.min(r + g + b.maxLabelDistance, f2.plotHeight), n(c2, function(a2) {
              0 < a2.labelDistance && a2.dataLabel && (a2.top = Math.max(0, r - g - a2.labelDistance), a2.bottom = Math.min(r + g + a2.labelDistance, f2.plotHeight), u3 = a2.dataLabel.getBBox().height || 21, a2.distributeBox = {
                target: a2.labelPos[1] - a2.top + u3 / 2,
                size: u3,
                rank: a2.y
              }, v.push(a2.distributeBox));
            }), l = q3 + u3 - l, a.distribute(v, l, l / 5)), S2 = 0; S2 < t3; S2++) e2 = c2[S2], H = e2.labelPos, y2 = e2.dataLabel, T = false === e2.visible ? "hidden" : "inherit", P = l = H[1], v && I(e2.distributeBox) && (void 0 === e2.distributeBox.pos ? T = "hidden" : (K2 = e2.distributeBox.size, P = e2.top + e2.distributeBox.pos)), delete e2.positionIndex, z = h2.justify ? x2[0] + (d3 ? -1 : 1) * (g + e2.labelDistance) : b.getX(P < e2.top + 2 || P > e2.bottom - 2 ? l : P, d3, e2), y2._attr = {
              visibility: T,
              align: H[6]
            }, y2._pos = {
              x: z + h2.x + ({
                left: k2,
                right: -k2
              }[H[6]] || 0),
              y: P + h2.y - 10
            }, H.x = z, H.y = P, w(h2.crop, true) && (C2 = y2.getBBox().width, l = null, z - C2 < k2 && 1 === d3 ? (l = Math.round(C2 - z + k2), U[3] = Math.max(l, U[3])) : z + C2 > m - k2 && 0 === d3 && (l = Math.round(z + C2 - m + k2), U[1] = Math.max(l, U[1])), 0 > P - K2 / 2 ? U[0] = Math.max(Math.round(-P + K2 / 2), U[0]) : P + K2 / 2 > p2 && (U[2] = Math.max(Math.round(P + K2 / 2 - p2), U[2])), y2.sideOverflow = l);
          }), 0 === F(U) || this.verifyDataLabelOverflow(U)) && (this.placeDataLabels(), q2 && n(this.points, function(a2) {
            var c2;
            u2 = a2.connector;
            if ((y2 = a2.dataLabel) && y2._pos && a2.visible && 0 < a2.labelDistance) {
              T = y2._attr.visibility;
              if (c2 = !u2) a2.connector = u2 = f2.renderer.path().addClass("highcharts-data-label-connector  highcharts-color-" + a2.colorIndex + (a2.className ? " " + a2.className : "")).add(b.dataLabelsGroup), u2.attr({
                "stroke-width": q2,
                stroke: h2.connectorColor || a2.color || "#666666"
              });
              u2[c2 ? "attr" : "animate"]({
                d: b.connectorPath(a2.labelPos)
              });
              u2.attr("visibility", T);
            } else u2 && (a2.connector = u2.destroy());
          }));
        }, h.pie.prototype.connectorPath = function(a2) {
          var b = a2.x, c2 = a2.y;
          return w(this.options.dataLabels.softConnector, true) ? ["M", b + ("left" === a2[6] ? 5 : -5), c2, "C", b, c2, 2 * a2[2] - a2[4], 2 * a2[3] - a2[5], a2[2], a2[3], "L", a2[4], a2[5]] : ["M", b + ("left" === a2[6] ? 5 : -5), c2, "L", a2[2], a2[3], "L", a2[4], a2[5]];
        }, h.pie.prototype.placeDataLabels = function() {
          n(this.points, function(a2) {
            var b = a2.dataLabel;
            b && a2.visible && ((a2 = b._pos) ? (b.sideOverflow && (b._attr.width = b.getBBox().width - b.sideOverflow, b.css({
              width: b._attr.width + "px",
              textOverflow: (this.options.dataLabels.style || {}).textOverflow || "ellipsis"
            }), b.shortened = true), b.attr(b._attr), b[b.moved ? "animate" : "attr"](a2), b.moved = true) : b && b.attr({
              y: -9999
            }));
          }, this);
        }, h.pie.prototype.alignDataLabel = t, h.pie.prototype.verifyDataLabelOverflow = function(a2) {
          var b = this.center, c2 = this.options, d2 = c2.center, e2 = c2.minSize || 80, f2, h2 = null !== c2.size;
          h2 || (null !== d2[0] ? f2 = Math.max(b[2] - Math.max(a2[1], a2[3]), e2) : (f2 = Math.max(b[2] - a2[1] - a2[3], e2), b[0] += (a2[3] - a2[1]) / 2), null !== d2[1] ? f2 = Math.max(Math.min(f2, b[2] - Math.max(a2[0], a2[2])), e2) : (f2 = Math.max(Math.min(f2, b[2] - a2[0] - a2[2]), e2), b[1] += (a2[0] - a2[2]) / 2), f2 < b[2] ? (b[2] = f2, b[3] = Math.min(y(c2.innerSize || 0, f2), f2), this.translate(b), this.drawDataLabels && this.drawDataLabels()) : h2 = true);
          return h2;
        });
        h.column && (h.column.prototype.alignDataLabel = function(a2, d2, e2, f2, h2) {
          var b = this.chart.inverted, l = a2.series, m = a2.dlBox || a2.shapeArgs, k2 = w(a2.below, a2.plotY > w(this.translatedThreshold, l.yAxis.len)), n2 = w(e2.inside, !!this.options.stacking);
          m && (f2 = x(m), 0 > f2.y && (f2.height += f2.y, f2.y = 0), m = f2.y + f2.height - l.yAxis.len, 0 < m && (f2.height -= m), b && (f2 = {
            x: l.yAxis.len - f2.y - f2.height,
            y: l.xAxis.len - f2.x - f2.width,
            width: f2.height,
            height: f2.width
          }), n2 || (b ? (f2.x += k2 ? 0 : f2.width, f2.width = 0) : (f2.y += k2 ? f2.height : 0, f2.height = 0)));
          e2.align = w(e2.align, !b || n2 ? "center" : k2 ? "right" : "left");
          e2.verticalAlign = w(e2.verticalAlign, b || n2 ? "middle" : k2 ? "top" : "bottom");
          c.prototype.alignDataLabel.call(this, a2, d2, e2, f2, h2);
          a2.isLabelJustified && a2.contrastColor && d2.css({
            color: a2.contrastColor
          });
        });
      })(K);
      (function(a) {
        var C = a.Chart, F = a.each, I = a.isArray, n = a.objectEach, f = a.pick;
        a = a.addEvent;
        a(C, "render", function() {
          var a2 = [];
          F(this.labelCollectors || [], function(e) {
            a2 = a2.concat(e());
          });
          F(this.yAxis || [], function(e) {
            e.options.stackLabels && !e.options.stackLabels.allowOverlap && n(e.stacks, function(e2) {
              n(e2, function(e3) {
                a2.push(e3.label);
              });
            });
          });
          F(this.series || [], function(e) {
            var n2 = e.options.dataLabels;
            e.visible && (false !== n2.enabled || e._hasPointLabels) && F(e.points, function(e2) {
              if (e2.visible) {
                var n3 = I(e2.dataLabels) ? e2.dataLabels : e2.dataLabel ? [e2.dataLabel] : [];
                F(n3, function(n4) {
                  var c = n4.options;
                  n4.labelrank = f(c.labelrank, e2.labelrank, e2.shapeArgs && e2.shapeArgs.height);
                  c.allowOverlap || a2.push(n4);
                });
              }
            });
          });
          this.hideOverlappingLabels(a2);
        });
        C.prototype.hideOverlappingLabels = function(a2) {
          var e = a2.length, f2 = this.renderer, n2, w, y, c, h, p, k = function(a3, c2, b, e2, f3, h2, k2, n3) {
            return !(f3 > a3 + b || f3 + k2 < a3 || h2 > c2 + e2 || h2 + n3 < c2);
          };
          y = function(a3) {
            var c2, b, e2, h2 = a3.box ? 0 : a3.padding || 0;
            e2 = 0;
            if (a3 && (!a3.alignAttr || a3.placed)) return c2 = a3.alignAttr || {
              x: a3.attr("x"),
              y: a3.attr("y")
            }, b = a3.parentGroup, a3.width || (e2 = a3.getBBox(), a3.width = e2.width, a3.height = e2.height, e2 = f2.fontMetrics(null, a3.element).h), {
              x: c2.x + (b.translateX || 0) + h2,
              y: c2.y + (b.translateY || 0) + h2 - e2,
              width: a3.width - 2 * h2,
              height: a3.height - 2 * h2
            };
          };
          for (w = 0; w < e; w++) if (n2 = a2[w]) n2.oldOpacity = n2.opacity, n2.newOpacity = 1, n2.absoluteBox = y(n2);
          a2.sort(function(a3, c2) {
            return (c2.labelrank || 0) - (a3.labelrank || 0);
          });
          for (w = 0; w < e; w++) for (p = (y = a2[w]) && y.absoluteBox, n2 = w + 1; n2 < e; ++n2) if (h = (c = a2[n2]) && c.absoluteBox, p && h && y !== c && 0 !== y.newOpacity && 0 !== c.newOpacity && (h = k(p.x, p.y, p.width, p.height, h.x, h.y, h.width, h.height))) (y.labelrank < c.labelrank ? y : c).newOpacity = 0;
          F(a2, function(a3) {
            var c2, b;
            a3 && (b = a3.newOpacity, a3.oldOpacity !== b && (a3.alignAttr && a3.placed ? (b ? a3.show(true) : c2 = function() {
              a3.hide();
            }, a3.alignAttr.opacity = b, a3[a3.isOld ? "animate" : "attr"](a3.alignAttr, null, c2)) : a3.attr({
              opacity: b
            })), a3.isOld = true);
          });
        };
      })(K);
      (function(a) {
        var C = a.addEvent, F = a.Chart, I = a.createElement, n = a.css, f = a.defaultOptions, e = a.defaultPlotOptions, u = a.each, x = a.extend, t = a.fireEvent, w = a.hasTouch, y = a.inArray, c = a.isObject, h = a.Legend, p = a.merge, k = a.pick, q = a.Point, d = a.Series, b = a.seriesTypes, v = a.svg, J;
        J = a.TrackerMixin = {
          drawTrackerPoint: function() {
            var a2 = this, b2 = a2.chart.pointer, c2 = function(a3) {
              var c3 = b2.getPointFromEvent(a3);
              void 0 !== c3 && (b2.isDirectTouch = true, c3.onMouseOver(a3));
            };
            u(a2.points, function(a3) {
              a3.graphic && (a3.graphic.element.point = a3);
              a3.dataLabel && (a3.dataLabel.div ? a3.dataLabel.div.point = a3 : a3.dataLabel.element.point = a3);
            });
            a2._hasTracking || (u(a2.trackerGroups, function(d2) {
              if (a2[d2]) {
                a2[d2].addClass("highcharts-tracker").on("mouseover", c2).on("mouseout", function(a3) {
                  b2.onTrackerMouseOut(a3);
                });
                if (w) a2[d2].on("touchstart", c2);
                a2.options.cursor && a2[d2].css(n).css({
                  cursor: a2.options.cursor
                });
              }
            }), a2._hasTracking = true);
            t(this, "afterDrawTracker");
          },
          drawTrackerGraph: function() {
            var a2 = this, b2 = a2.options, c2 = b2.trackByArea, d2 = [].concat(c2 ? a2.areaPath : a2.graphPath), e2 = d2.length, f2 = a2.chart, h2 = f2.pointer, k2 = f2.renderer, n2 = f2.options.tooltip.snap, g = a2.tracker, q2, p2 = function() {
              if (f2.hoverSeries !== a2) a2.onMouseOver();
            }, x2 = "rgba(192,192,192," + (v ? 1e-4 : 2e-3) + ")";
            if (e2 && !c2) for (q2 = e2 + 1; q2--; ) "M" === d2[q2] && d2.splice(q2 + 1, 0, d2[q2 + 1] - n2, d2[q2 + 2], "L"), (q2 && "M" === d2[q2] || q2 === e2) && d2.splice(q2, 0, "L", d2[q2 - 2] + n2, d2[q2 - 1]);
            g ? g.attr({
              d: d2
            }) : a2.graph && (a2.tracker = k2.path(d2).attr({
              "stroke-linejoin": "round",
              stroke: x2,
              fill: c2 ? x2 : "none",
              "stroke-width": a2.graph.strokeWidth() + (c2 ? 0 : 2 * n2),
              visibility: a2.visible ? "visible" : "hidden",
              zIndex: 2
            }).addClass(c2 ? "highcharts-tracker-area" : "highcharts-tracker-line").add(a2.group), u([a2.tracker, a2.markerGroup], function(a3) {
              a3.addClass("highcharts-tracker").on("mouseover", p2).on("mouseout", function(a4) {
                h2.onTrackerMouseOut(a4);
              });
              b2.cursor && a3.css({
                cursor: b2.cursor
              });
              if (w) a3.on("touchstart", p2);
            }));
            t(this, "afterDrawTracker");
          }
        };
        b.column && (b.column.prototype.drawTracker = J.drawTrackerPoint);
        b.pie && (b.pie.prototype.drawTracker = J.drawTrackerPoint);
        b.scatter && (b.scatter.prototype.drawTracker = J.drawTrackerPoint);
        f.legend.itemStyle.cursor = "pointer";
        x(h.prototype, {
          setItemEvents: function(a2, b2, c2) {
            var d2 = this, e2 = d2.chart.renderer.boxWrapper, f2 = "highcharts-legend-" + (a2 instanceof q ? "point" : "series") + "-active";
            (c2 ? b2 : a2.legendGroup).on("mouseover", function() {
              a2.setState("hover");
              e2.addClass(f2);
              b2.css(d2.options.itemHoverStyle);
            }).on("mouseout", function() {
              b2.css(p(a2.visible ? d2.itemStyle : d2.itemHiddenStyle));
              e2.removeClass(f2);
              a2.setState();
            }).on("click", function(b3) {
              var c3 = function() {
                a2.setVisible && a2.setVisible();
              };
              e2.removeClass(f2);
              b3 = {
                browserEvent: b3
              };
              a2.firePointEvent ? a2.firePointEvent("legendItemClick", b3, c3) : t(a2, "legendItemClick", b3, c3);
            });
          },
          createCheckboxForItem: function(a2) {
            a2.checkbox = I("input", {
              type: "checkbox",
              className: "highcharts-legend-checkbox",
              checked: a2.selected,
              defaultChecked: a2.selected
            }, this.options.itemCheckboxStyle, this.chart.container);
            C(a2.checkbox, "click", function(b2) {
              t(a2.series || a2, "checkboxClick", {
                checked: b2.target.checked,
                item: a2
              }, function() {
                a2.select();
              });
            });
          }
        });
        x(F.prototype, {
          showResetZoom: function() {
            function a2() {
              b2.zoomOut();
            }
            var b2 = this, c2 = f.lang, d2 = b2.options.chart.resetZoomButton, e2 = d2.theme, h2 = e2.states, k2 = "chart" === d2.relativeTo ? null : "plotBox";
            t(this, "beforeShowResetZoom", null, function() {
              b2.resetZoomButton = b2.renderer.button(c2.resetZoom, null, null, a2, e2, h2 && h2.hover).attr({
                align: d2.position.align,
                title: c2.resetZoomTitle
              }).addClass("highcharts-reset-zoom").add().align(d2.position, false, k2);
            });
          },
          zoomOut: function() {
            t(this, "selection", {
              resetSelection: true
            }, this.zoom);
          },
          zoom: function(a2) {
            var b2, d2 = this.pointer, e2 = false, f2;
            !a2 || a2.resetSelection ? (u(this.axes, function(a3) {
              b2 = a3.zoom();
            }), d2.initiated = false) : u(a2.xAxis.concat(a2.yAxis), function(a3) {
              var c2 = a3.axis;
              d2[c2.isXAxis ? "zoomX" : "zoomY"] && (b2 = c2.zoom(a3.min, a3.max), c2.displayBtn && (e2 = true));
            });
            f2 = this.resetZoomButton;
            e2 && !f2 ? this.showResetZoom() : !e2 && c(f2) && (this.resetZoomButton = f2.destroy());
            b2 && this.redraw(k(this.options.chart.animation, a2 && a2.animation, 100 > this.pointCount));
          },
          pan: function(a2, b2) {
            var c2 = this, d2 = c2.hoverPoints, e2;
            d2 && u(d2, function(a3) {
              a3.setState();
            });
            u("xy" === b2 ? [1, 0] : [1], function(b3) {
              b3 = c2[b3 ? "xAxis" : "yAxis"][0];
              var d3 = b3.horiz, f2 = a2[d3 ? "chartX" : "chartY"], d3 = d3 ? "mouseDownX" : "mouseDownY", h2 = c2[d3], g = (b3.pointRange || 0) / 2, l = b3.reversed && !c2.inverted || !b3.reversed && c2.inverted ? -1 : 1, m = b3.getExtremes(), k2 = b3.toValue(h2 - f2, true) + g * l, l = b3.toValue(h2 + b3.len - f2, true) - g * l, n2 = l < k2, h2 = n2 ? l : k2, k2 = n2 ? k2 : l, l = Math.min(m.dataMin, g ? m.min : b3.toValue(b3.toPixels(m.min) - b3.minPixelPadding)), g = Math.max(m.dataMax, g ? m.max : b3.toValue(b3.toPixels(m.max) + b3.minPixelPadding)), n2 = l - h2;
              0 < n2 && (k2 += n2, h2 = l);
              n2 = k2 - g;
              0 < n2 && (k2 = g, h2 -= n2);
              b3.series.length && h2 !== m.min && k2 !== m.max && (b3.setExtremes(h2, k2, false, false, {
                trigger: "pan"
              }), e2 = true);
              c2[d3] = f2;
            });
            e2 && c2.redraw(false);
            n(c2.container, {
              cursor: "move"
            });
          }
        });
        x(q.prototype, {
          select: function(a2, b2) {
            var c2 = this, d2 = c2.series, e2 = d2.chart;
            a2 = k(a2, !c2.selected);
            c2.firePointEvent(a2 ? "select" : "unselect", {
              accumulate: b2
            }, function() {
              c2.selected = c2.options.selected = a2;
              d2.options.data[y(c2, d2.data)] = c2.options;
              c2.setState(a2 && "select");
              b2 || u(e2.getSelectedPoints(), function(a3) {
                a3.selected && a3 !== c2 && (a3.selected = a3.options.selected = false, d2.options.data[y(a3, d2.data)] = a3.options, a3.setState(""), a3.firePointEvent("unselect"));
              });
            });
          },
          onMouseOver: function(a2) {
            var b2 = this.series.chart, c2 = b2.pointer;
            a2 = a2 ? c2.normalize(a2) : c2.getChartCoordinatesFromPoint(this, b2.inverted);
            c2.runPointActions(a2, this);
          },
          onMouseOut: function() {
            var a2 = this.series.chart;
            this.firePointEvent("mouseOut");
            u(a2.hoverPoints || [], function(a3) {
              a3.setState();
            });
            a2.hoverPoints = a2.hoverPoint = null;
          },
          importEvents: function() {
            if (!this.hasImportedEvents) {
              var b2 = this, c2 = p(b2.series.options.point, b2.options).events;
              b2.events = c2;
              a.objectEach(c2, function(a2, c3) {
                C(b2, c3, a2);
              });
              this.hasImportedEvents = true;
            }
          },
          setState: function(a2, b2) {
            var c2 = Math.floor(this.plotX), d2 = this.plotY, f2 = this.series, h2 = f2.options.states[a2 || "normal"] || {}, l = e[f2.type].marker && f2.options.marker, n2 = l && false === l.enabled, q2 = l && l.states && l.states[a2 || "normal"] || {}, g = false === q2.enabled, p2 = f2.stateMarkerGraphic, v2 = this.marker || {}, u2 = f2.chart, w2 = f2.halo, y2, C2 = l && f2.markerAttribs;
            a2 = a2 || "";
            if (!(a2 === this.state && !b2 || this.selected && "select" !== a2 || false === h2.enabled || a2 && (g || n2 && false === q2.enabled) || a2 && v2.states && v2.states[a2] && false === v2.states[a2].enabled)) {
              C2 && (y2 = f2.markerAttribs(this, a2));
              if (this.graphic) this.state && this.graphic.removeClass("highcharts-point-" + this.state), a2 && this.graphic.addClass("highcharts-point-" + a2), this.graphic.animate(f2.pointAttribs(this, a2), k(u2.options.chart.animation, h2.animation)), y2 && this.graphic.animate(y2, k(u2.options.chart.animation, q2.animation, l.animation)), p2 && p2.hide();
              else {
                if (a2 && q2) {
                  l = v2.symbol || f2.symbol;
                  p2 && p2.currentSymbol !== l && (p2 = p2.destroy());
                  if (p2) p2[b2 ? "animate" : "attr"]({
                    x: y2.x,
                    y: y2.y
                  });
                  else l && (f2.stateMarkerGraphic = p2 = u2.renderer.symbol(l, y2.x, y2.y, y2.width, y2.height).add(f2.markerGroup), p2.currentSymbol = l);
                  p2 && p2.attr(f2.pointAttribs(this, a2));
                }
                p2 && (p2[a2 && u2.isInsidePlot(c2, d2, u2.inverted) ? "show" : "hide"](), p2.element.point = this);
              }
              (c2 = h2.halo) && c2.size ? (w2 || (f2.halo = w2 = u2.renderer.path().add((this.graphic || p2).parentGroup)), w2.show()[b2 ? "animate" : "attr"]({
                d: this.haloPath(c2.size)
              }), w2.attr({
                "class": "highcharts-halo highcharts-color-" + k(this.colorIndex, f2.colorIndex) + (this.className ? " " + this.className : ""),
                zIndex: -1
              }), w2.point = this, w2.attr(x({
                fill: this.color || f2.color,
                "fill-opacity": c2.opacity
              }, c2.attributes))) : w2 && w2.point && w2.point.haloPath && w2.animate({
                d: w2.point.haloPath(0)
              }, null, w2.hide);
              this.state = a2;
              t(this, "afterSetState");
            }
          },
          haloPath: function(a2) {
            return this.series.chart.renderer.symbols.circle(Math.floor(this.plotX) - a2, this.plotY - a2, 2 * a2, 2 * a2);
          }
        });
        x(d.prototype, {
          onMouseOver: function() {
            var a2 = this.chart, b2 = a2.hoverSeries;
            if (b2 && b2 !== this) b2.onMouseOut();
            this.options.events.mouseOver && t(this, "mouseOver");
            this.setState("hover");
            a2.hoverSeries = this;
          },
          onMouseOut: function() {
            var a2 = this.options, b2 = this.chart, c2 = b2.tooltip, d2 = b2.hoverPoint;
            b2.hoverSeries = null;
            if (d2) d2.onMouseOut();
            this && a2.events.mouseOut && t(this, "mouseOut");
            !c2 || this.stickyTracking || c2.shared && !this.noSharedTooltip || c2.hide();
            this.setState();
          },
          setState: function(a2) {
            var b2 = this, c2 = b2.options, d2 = b2.graph, e2 = c2.states, f2 = c2.lineWidth, c2 = 0;
            a2 = a2 || "";
            if (b2.state !== a2 && (u([b2.group, b2.markerGroup, b2.dataLabelsGroup], function(c3) {
              c3 && (b2.state && c3.removeClass("highcharts-series-" + b2.state), a2 && c3.addClass("highcharts-series-" + a2));
            }), b2.state = a2, !e2[a2] || false !== e2[a2].enabled) && (a2 && (f2 = e2[a2].lineWidth || f2 + (e2[a2].lineWidthPlus || 0)), d2 && !d2.dashstyle)) for (f2 = {
              "stroke-width": f2
            }, d2.animate(f2, k(e2[a2 || "normal"] && e2[a2 || "normal"].animation, b2.chart.options.chart.animation)); b2["zone-graph-" + c2]; ) b2["zone-graph-" + c2].attr(f2), c2 += 1;
          },
          setVisible: function(a2, b2) {
            var c2 = this, d2 = c2.chart, e2 = c2.legendItem, f2, h2 = d2.options.chart.ignoreHiddenSeries, k2 = c2.visible;
            f2 = (c2.visible = a2 = c2.options.visible = c2.userOptions.visible = void 0 === a2 ? !k2 : a2) ? "show" : "hide";
            u(["group", "dataLabelsGroup", "markerGroup", "tracker", "tt"], function(a3) {
              if (c2[a3]) c2[a3][f2]();
            });
            if (d2.hoverSeries === c2 || (d2.hoverPoint && d2.hoverPoint.series) === c2) c2.onMouseOut();
            e2 && d2.legend.colorizeItem(c2, a2);
            c2.isDirty = true;
            c2.options.stacking && u(d2.series, function(a3) {
              a3.options.stacking && a3.visible && (a3.isDirty = true);
            });
            u(c2.linkedSeries, function(b3) {
              b3.setVisible(a2, false);
            });
            h2 && (d2.isDirtyBox = true);
            t(c2, f2);
            false !== b2 && d2.redraw();
          },
          show: function() {
            this.setVisible(true);
          },
          hide: function() {
            this.setVisible(false);
          },
          select: function(a2) {
            this.selected = a2 = void 0 === a2 ? !this.selected : a2;
            this.checkbox && (this.checkbox.checked = a2);
            t(this, a2 ? "select" : "unselect");
          },
          drawTracker: J.drawTrackerGraph
        });
      })(K);
      (function(a) {
        var C = a.Chart, F = a.each, I = a.inArray, n = a.isArray, f = a.isObject, e = a.pick, u = a.splat;
        C.prototype.setResponsive = function(e2) {
          var f2 = this.options.responsive, n2 = [], u2 = this.currentResponsive;
          f2 && f2.rules && F(f2.rules, function(c2) {
            void 0 === c2._id && (c2._id = a.uniqueKey());
            this.matchResponsiveRule(c2, n2, e2);
          }, this);
          var c = a.merge.apply(0, a.map(n2, function(c2) {
            return a.find(f2.rules, function(a2) {
              return a2._id === c2;
            }).chartOptions;
          })), n2 = n2.toString() || void 0;
          n2 !== (u2 && u2.ruleIds) && (u2 && this.update(u2.undoOptions, e2), n2 ? (this.currentResponsive = {
            ruleIds: n2,
            mergedOptions: c,
            undoOptions: this.currentOptions(c)
          }, this.update(c, e2)) : this.currentResponsive = void 0);
        };
        C.prototype.matchResponsiveRule = function(a2, f2) {
          var n2 = a2.condition;
          (n2.callback || function() {
            return this.chartWidth <= e(n2.maxWidth, Number.MAX_VALUE) && this.chartHeight <= e(n2.maxHeight, Number.MAX_VALUE) && this.chartWidth >= e(n2.minWidth, 0) && this.chartHeight >= e(n2.minHeight, 0);
          }).call(this) && f2.push(a2._id);
        };
        C.prototype.currentOptions = function(e2) {
          function t(e3, c, h, p) {
            var k;
            a.objectEach(e3, function(a2, d) {
              if (!p && -1 < I(d, ["series", "xAxis", "yAxis"])) for (a2 = u(a2), h[d] = [], k = 0; k < a2.length; k++) c[d][k] && (h[d][k] = {}, t(a2[k], c[d][k], h[d][k], p + 1));
              else f(a2) ? (h[d] = n(a2) ? [] : {}, t(a2, c[d] || {}, h[d], p + 1)) : h[d] = c[d] || null;
            });
          }
          var w = {};
          t(e2, this.options, w, 0);
          return w;
        };
      })(K);
      return K;
    });
  }
});

// ../../../../node_modules/angular-highcharts/angular-highcharts.es5.js
var Highcharts = __toESM(require_highcharts());
var import_highcharts = __toESM(require_highcharts());

// ../../../../node_modules/tslib/tslib.es6.js
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function() {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = {
      error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
}
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
  return ar;
}

// ../../../../node_modules/rxjs/_esm5/internal/util/isFunction.js
function isFunction(x) {
  return typeof x === "function";
}

// ../../../../node_modules/rxjs/_esm5/internal/config.js
var _enable_super_gross_mode_that_will_cause_bad_things = false;
var config = {
  Promise: void 0,
  set useDeprecatedSynchronousErrorHandling(value) {
    if (value) {
      var error = new Error();
      console.warn("DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n" + error.stack);
    } else if (_enable_super_gross_mode_that_will_cause_bad_things) {
      console.log("RxJS: Back to a better error behavior. Thank you. <3");
    }
    _enable_super_gross_mode_that_will_cause_bad_things = value;
  },
  get useDeprecatedSynchronousErrorHandling() {
    return _enable_super_gross_mode_that_will_cause_bad_things;
  }
};

// ../../../../node_modules/rxjs/_esm5/internal/util/hostReportError.js
function hostReportError(err) {
  setTimeout(function() {
    throw err;
  }, 0);
}

// ../../../../node_modules/rxjs/_esm5/internal/Observer.js
var empty = {
  closed: true,
  next: function(value) {
  },
  error: function(err) {
    if (config.useDeprecatedSynchronousErrorHandling) {
      throw err;
    } else {
      hostReportError(err);
    }
  },
  complete: function() {
  }
};

// ../../../../node_modules/rxjs/_esm5/internal/util/isArray.js
var isArray = function() {
  return Array.isArray || function(x) {
    return x && typeof x.length === "number";
  };
}();

// ../../../../node_modules/rxjs/_esm5/internal/util/isObject.js
function isObject(x) {
  return x !== null && typeof x === "object";
}

// ../../../../node_modules/rxjs/_esm5/internal/util/UnsubscriptionError.js
var UnsubscriptionErrorImpl = function() {
  function UnsubscriptionErrorImpl2(errors) {
    Error.call(this);
    this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
      return i + 1 + ") " + err.toString();
    }).join("\n  ") : "";
    this.name = "UnsubscriptionError";
    this.errors = errors;
    return this;
  }
  UnsubscriptionErrorImpl2.prototype = Object.create(Error.prototype);
  return UnsubscriptionErrorImpl2;
}();
var UnsubscriptionError = UnsubscriptionErrorImpl;

// ../../../../node_modules/rxjs/_esm5/internal/Subscription.js
var Subscription = function() {
  function Subscription2(unsubscribe) {
    this.closed = false;
    this._parentOrParents = null;
    this._subscriptions = null;
    if (unsubscribe) {
      this._ctorUnsubscribe = true;
      this._unsubscribe = unsubscribe;
    }
  }
  Subscription2.prototype.unsubscribe = function() {
    var errors;
    if (this.closed) {
      return;
    }
    var _a = this, _parentOrParents = _a._parentOrParents, _ctorUnsubscribe = _a._ctorUnsubscribe, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
    this.closed = true;
    this._parentOrParents = null;
    this._subscriptions = null;
    if (_parentOrParents instanceof Subscription2) {
      _parentOrParents.remove(this);
    } else if (_parentOrParents !== null) {
      for (var index = 0; index < _parentOrParents.length; ++index) {
        var parent_1 = _parentOrParents[index];
        parent_1.remove(this);
      }
    }
    if (isFunction(_unsubscribe)) {
      if (_ctorUnsubscribe) {
        this._unsubscribe = void 0;
      }
      try {
        _unsubscribe.call(this);
      } catch (e) {
        errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
      }
    }
    if (isArray(_subscriptions)) {
      var index = -1;
      var len = _subscriptions.length;
      while (++index < len) {
        var sub = _subscriptions[index];
        if (isObject(sub)) {
          try {
            sub.unsubscribe();
          } catch (e) {
            errors = errors || [];
            if (e instanceof UnsubscriptionError) {
              errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
            } else {
              errors.push(e);
            }
          }
        }
      }
    }
    if (errors) {
      throw new UnsubscriptionError(errors);
    }
  };
  Subscription2.prototype.add = function(teardown) {
    var subscription = teardown;
    if (!teardown) {
      return Subscription2.EMPTY;
    }
    switch (typeof teardown) {
      case "function":
        subscription = new Subscription2(teardown);
      case "object":
        if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== "function") {
          return subscription;
        } else if (this.closed) {
          subscription.unsubscribe();
          return subscription;
        } else if (!(subscription instanceof Subscription2)) {
          var tmp = subscription;
          subscription = new Subscription2();
          subscription._subscriptions = [tmp];
        }
        break;
      default: {
        throw new Error("unrecognized teardown " + teardown + " added to Subscription.");
      }
    }
    var _parentOrParents = subscription._parentOrParents;
    if (_parentOrParents === null) {
      subscription._parentOrParents = this;
    } else if (_parentOrParents instanceof Subscription2) {
      if (_parentOrParents === this) {
        return subscription;
      }
      subscription._parentOrParents = [_parentOrParents, this];
    } else if (_parentOrParents.indexOf(this) === -1) {
      _parentOrParents.push(this);
    } else {
      return subscription;
    }
    var subscriptions = this._subscriptions;
    if (subscriptions === null) {
      this._subscriptions = [subscription];
    } else {
      subscriptions.push(subscription);
    }
    return subscription;
  };
  Subscription2.prototype.remove = function(subscription) {
    var subscriptions = this._subscriptions;
    if (subscriptions) {
      var subscriptionIndex = subscriptions.indexOf(subscription);
      if (subscriptionIndex !== -1) {
        subscriptions.splice(subscriptionIndex, 1);
      }
    }
  };
  Subscription2.EMPTY = function(empty3) {
    empty3.closed = true;
    return empty3;
  }(new Subscription2());
  return Subscription2;
}();
function flattenUnsubscriptionErrors(errors) {
  return errors.reduce(function(errs, err) {
    return errs.concat(err instanceof UnsubscriptionError ? err.errors : err);
  }, []);
}

// ../../../../node_modules/rxjs/_esm5/internal/symbol/rxSubscriber.js
var rxSubscriber = function() {
  return typeof Symbol === "function" ? Symbol("rxSubscriber") : "@@rxSubscriber_" + Math.random();
}();

// ../../../../node_modules/rxjs/_esm5/internal/Subscriber.js
var Subscriber = function(_super) {
  __extends(Subscriber2, _super);
  function Subscriber2(destinationOrNext, error, complete) {
    var _this = _super.call(this) || this;
    _this.syncErrorValue = null;
    _this.syncErrorThrown = false;
    _this.syncErrorThrowable = false;
    _this.isStopped = false;
    switch (arguments.length) {
      case 0:
        _this.destination = empty;
        break;
      case 1:
        if (!destinationOrNext) {
          _this.destination = empty;
          break;
        }
        if (typeof destinationOrNext === "object") {
          if (destinationOrNext instanceof Subscriber2) {
            _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
            _this.destination = destinationOrNext;
            destinationOrNext.add(_this);
          } else {
            _this.syncErrorThrowable = true;
            _this.destination = new SafeSubscriber(_this, destinationOrNext);
          }
          break;
        }
      default:
        _this.syncErrorThrowable = true;
        _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
        break;
    }
    return _this;
  }
  Subscriber2.prototype[rxSubscriber] = function() {
    return this;
  };
  Subscriber2.create = function(next, error, complete) {
    var subscriber = new Subscriber2(next, error, complete);
    subscriber.syncErrorThrowable = false;
    return subscriber;
  };
  Subscriber2.prototype.next = function(value) {
    if (!this.isStopped) {
      this._next(value);
    }
  };
  Subscriber2.prototype.error = function(err) {
    if (!this.isStopped) {
      this.isStopped = true;
      this._error(err);
    }
  };
  Subscriber2.prototype.complete = function() {
    if (!this.isStopped) {
      this.isStopped = true;
      this._complete();
    }
  };
  Subscriber2.prototype.unsubscribe = function() {
    if (this.closed) {
      return;
    }
    this.isStopped = true;
    _super.prototype.unsubscribe.call(this);
  };
  Subscriber2.prototype._next = function(value) {
    this.destination.next(value);
  };
  Subscriber2.prototype._error = function(err) {
    this.destination.error(err);
    this.unsubscribe();
  };
  Subscriber2.prototype._complete = function() {
    this.destination.complete();
    this.unsubscribe();
  };
  Subscriber2.prototype._unsubscribeAndRecycle = function() {
    var _parentOrParents = this._parentOrParents;
    this._parentOrParents = null;
    this.unsubscribe();
    this.closed = false;
    this.isStopped = false;
    this._parentOrParents = _parentOrParents;
    return this;
  };
  return Subscriber2;
}(Subscription);
var SafeSubscriber = function(_super) {
  __extends(SafeSubscriber2, _super);
  function SafeSubscriber2(_parentSubscriber, observerOrNext, error, complete) {
    var _this = _super.call(this) || this;
    _this._parentSubscriber = _parentSubscriber;
    var next;
    var context = _this;
    if (isFunction(observerOrNext)) {
      next = observerOrNext;
    } else if (observerOrNext) {
      next = observerOrNext.next;
      error = observerOrNext.error;
      complete = observerOrNext.complete;
      if (observerOrNext !== empty) {
        context = Object.create(observerOrNext);
        if (isFunction(context.unsubscribe)) {
          _this.add(context.unsubscribe.bind(context));
        }
        context.unsubscribe = _this.unsubscribe.bind(_this);
      }
    }
    _this._context = context;
    _this._next = next;
    _this._error = error;
    _this._complete = complete;
    return _this;
  }
  SafeSubscriber2.prototype.next = function(value) {
    if (!this.isStopped && this._next) {
      var _parentSubscriber = this._parentSubscriber;
      if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
        this.__tryOrUnsub(this._next, value);
      } else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
        this.unsubscribe();
      }
    }
  };
  SafeSubscriber2.prototype.error = function(err) {
    if (!this.isStopped) {
      var _parentSubscriber = this._parentSubscriber;
      var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
      if (this._error) {
        if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
          this.__tryOrUnsub(this._error, err);
          this.unsubscribe();
        } else {
          this.__tryOrSetError(_parentSubscriber, this._error, err);
          this.unsubscribe();
        }
      } else if (!_parentSubscriber.syncErrorThrowable) {
        this.unsubscribe();
        if (useDeprecatedSynchronousErrorHandling) {
          throw err;
        }
        hostReportError(err);
      } else {
        if (useDeprecatedSynchronousErrorHandling) {
          _parentSubscriber.syncErrorValue = err;
          _parentSubscriber.syncErrorThrown = true;
        } else {
          hostReportError(err);
        }
        this.unsubscribe();
      }
    }
  };
  SafeSubscriber2.prototype.complete = function() {
    var _this = this;
    if (!this.isStopped) {
      var _parentSubscriber = this._parentSubscriber;
      if (this._complete) {
        var wrappedComplete = function() {
          return _this._complete.call(_this._context);
        };
        if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
          this.__tryOrUnsub(wrappedComplete);
          this.unsubscribe();
        } else {
          this.__tryOrSetError(_parentSubscriber, wrappedComplete);
          this.unsubscribe();
        }
      } else {
        this.unsubscribe();
      }
    }
  };
  SafeSubscriber2.prototype.__tryOrUnsub = function(fn, value) {
    try {
      fn.call(this._context, value);
    } catch (err) {
      this.unsubscribe();
      if (config.useDeprecatedSynchronousErrorHandling) {
        throw err;
      } else {
        hostReportError(err);
      }
    }
  };
  SafeSubscriber2.prototype.__tryOrSetError = function(parent, fn, value) {
    if (!config.useDeprecatedSynchronousErrorHandling) {
      throw new Error("bad call");
    }
    try {
      fn.call(this._context, value);
    } catch (err) {
      if (config.useDeprecatedSynchronousErrorHandling) {
        parent.syncErrorValue = err;
        parent.syncErrorThrown = true;
        return true;
      } else {
        hostReportError(err);
        return true;
      }
    }
    return false;
  };
  SafeSubscriber2.prototype._unsubscribe = function() {
    var _parentSubscriber = this._parentSubscriber;
    this._context = null;
    this._parentSubscriber = null;
    _parentSubscriber.unsubscribe();
  };
  return SafeSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/util/canReportError.js
function canReportError(observer) {
  while (observer) {
    var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
    if (closed_1 || isStopped) {
      return false;
    } else if (destination && destination instanceof Subscriber) {
      observer = destination;
    } else {
      observer = null;
    }
  }
  return true;
}

// ../../../../node_modules/rxjs/_esm5/internal/util/toSubscriber.js
function toSubscriber(nextOrObserver, error, complete) {
  if (nextOrObserver) {
    if (nextOrObserver instanceof Subscriber) {
      return nextOrObserver;
    }
    if (nextOrObserver[rxSubscriber]) {
      return nextOrObserver[rxSubscriber]();
    }
  }
  if (!nextOrObserver && !error && !complete) {
    return new Subscriber(empty);
  }
  return new Subscriber(nextOrObserver, error, complete);
}

// ../../../../node_modules/rxjs/_esm5/internal/symbol/observable.js
var observable = function() {
  return typeof Symbol === "function" && Symbol.observable || "@@observable";
}();

// ../../../../node_modules/rxjs/_esm5/internal/util/identity.js
function identity(x) {
  return x;
}

// ../../../../node_modules/rxjs/_esm5/internal/util/pipe.js
function pipeFromArray(fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return function piped(input) {
    return fns.reduce(function(prev, fn) {
      return fn(prev);
    }, input);
  };
}

// ../../../../node_modules/rxjs/_esm5/internal/Observable.js
var Observable = function() {
  function Observable2(subscribe) {
    this._isScalar = false;
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  Observable2.prototype.lift = function(operator) {
    var observable2 = new Observable2();
    observable2.source = this;
    observable2.operator = operator;
    return observable2;
  };
  Observable2.prototype.subscribe = function(observerOrNext, error, complete) {
    var operator = this.operator;
    var sink = toSubscriber(observerOrNext, error, complete);
    if (operator) {
      sink.add(operator.call(sink, this.source));
    } else {
      sink.add(this.source || config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable ? this._subscribe(sink) : this._trySubscribe(sink));
    }
    if (config.useDeprecatedSynchronousErrorHandling) {
      if (sink.syncErrorThrowable) {
        sink.syncErrorThrowable = false;
        if (sink.syncErrorThrown) {
          throw sink.syncErrorValue;
        }
      }
    }
    return sink;
  };
  Observable2.prototype._trySubscribe = function(sink) {
    try {
      return this._subscribe(sink);
    } catch (err) {
      if (config.useDeprecatedSynchronousErrorHandling) {
        sink.syncErrorThrown = true;
        sink.syncErrorValue = err;
      }
      if (canReportError(sink)) {
        sink.error(err);
      } else {
        console.warn(err);
      }
    }
  };
  Observable2.prototype.forEach = function(next, promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var subscription;
      subscription = _this.subscribe(function(value) {
        try {
          next(value);
        } catch (err) {
          reject(err);
          if (subscription) {
            subscription.unsubscribe();
          }
        }
      }, reject, resolve);
    });
  };
  Observable2.prototype._subscribe = function(subscriber) {
    var source = this.source;
    return source && source.subscribe(subscriber);
  };
  Observable2.prototype[observable] = function() {
    return this;
  };
  Observable2.prototype.pipe = function() {
    var operations = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      operations[_i] = arguments[_i];
    }
    if (operations.length === 0) {
      return this;
    }
    return pipeFromArray(operations)(this);
  };
  Observable2.prototype.toPromise = function(promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var value;
      _this.subscribe(function(x) {
        return value = x;
      }, function(err) {
        return reject(err);
      }, function() {
        return resolve(value);
      });
    });
  };
  Observable2.create = function(subscribe) {
    return new Observable2(subscribe);
  };
  return Observable2;
}();
function getPromiseCtor(promiseCtor) {
  if (!promiseCtor) {
    promiseCtor = config.Promise || Promise;
  }
  if (!promiseCtor) {
    throw new Error("no Promise impl found");
  }
  return promiseCtor;
}

// ../../../../node_modules/rxjs/_esm5/internal/util/ObjectUnsubscribedError.js
var ObjectUnsubscribedErrorImpl = function() {
  function ObjectUnsubscribedErrorImpl2() {
    Error.call(this);
    this.message = "object unsubscribed";
    this.name = "ObjectUnsubscribedError";
    return this;
  }
  ObjectUnsubscribedErrorImpl2.prototype = Object.create(Error.prototype);
  return ObjectUnsubscribedErrorImpl2;
}();
var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;

// ../../../../node_modules/rxjs/_esm5/internal/SubjectSubscription.js
var SubjectSubscription = function(_super) {
  __extends(SubjectSubscription2, _super);
  function SubjectSubscription2(subject, subscriber) {
    var _this = _super.call(this) || this;
    _this.subject = subject;
    _this.subscriber = subscriber;
    _this.closed = false;
    return _this;
  }
  SubjectSubscription2.prototype.unsubscribe = function() {
    if (this.closed) {
      return;
    }
    this.closed = true;
    var subject = this.subject;
    var observers = subject.observers;
    this.subject = null;
    if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
      return;
    }
    var subscriberIndex = observers.indexOf(this.subscriber);
    if (subscriberIndex !== -1) {
      observers.splice(subscriberIndex, 1);
    }
  };
  return SubjectSubscription2;
}(Subscription);

// ../../../../node_modules/rxjs/_esm5/internal/Subject.js
var SubjectSubscriber = function(_super) {
  __extends(SubjectSubscriber2, _super);
  function SubjectSubscriber2(destination) {
    var _this = _super.call(this, destination) || this;
    _this.destination = destination;
    return _this;
  }
  return SubjectSubscriber2;
}(Subscriber);
var Subject = function(_super) {
  __extends(Subject2, _super);
  function Subject2() {
    var _this = _super.call(this) || this;
    _this.observers = [];
    _this.closed = false;
    _this.isStopped = false;
    _this.hasError = false;
    _this.thrownError = null;
    return _this;
  }
  Subject2.prototype[rxSubscriber] = function() {
    return new SubjectSubscriber(this);
  };
  Subject2.prototype.lift = function(operator) {
    var subject = new AnonymousSubject(this, this);
    subject.operator = operator;
    return subject;
  };
  Subject2.prototype.next = function(value) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (!this.isStopped) {
      var observers = this.observers;
      var len = observers.length;
      var copy = observers.slice();
      for (var i = 0; i < len; i++) {
        copy[i].next(value);
      }
    }
  };
  Subject2.prototype.error = function(err) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.hasError = true;
    this.thrownError = err;
    this.isStopped = true;
    var observers = this.observers;
    var len = observers.length;
    var copy = observers.slice();
    for (var i = 0; i < len; i++) {
      copy[i].error(err);
    }
    this.observers.length = 0;
  };
  Subject2.prototype.complete = function() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.isStopped = true;
    var observers = this.observers;
    var len = observers.length;
    var copy = observers.slice();
    for (var i = 0; i < len; i++) {
      copy[i].complete();
    }
    this.observers.length = 0;
  };
  Subject2.prototype.unsubscribe = function() {
    this.isStopped = true;
    this.closed = true;
    this.observers = null;
  };
  Subject2.prototype._trySubscribe = function(subscriber) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else {
      return _super.prototype._trySubscribe.call(this, subscriber);
    }
  };
  Subject2.prototype._subscribe = function(subscriber) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else if (this.hasError) {
      subscriber.error(this.thrownError);
      return Subscription.EMPTY;
    } else if (this.isStopped) {
      subscriber.complete();
      return Subscription.EMPTY;
    } else {
      this.observers.push(subscriber);
      return new SubjectSubscription(this, subscriber);
    }
  };
  Subject2.prototype.asObservable = function() {
    var observable2 = new Observable();
    observable2.source = this;
    return observable2;
  };
  Subject2.create = function(destination, source) {
    return new AnonymousSubject(destination, source);
  };
  return Subject2;
}(Observable);
var AnonymousSubject = function(_super) {
  __extends(AnonymousSubject2, _super);
  function AnonymousSubject2(destination, source) {
    var _this = _super.call(this) || this;
    _this.destination = destination;
    _this.source = source;
    return _this;
  }
  AnonymousSubject2.prototype.next = function(value) {
    var destination = this.destination;
    if (destination && destination.next) {
      destination.next(value);
    }
  };
  AnonymousSubject2.prototype.error = function(err) {
    var destination = this.destination;
    if (destination && destination.error) {
      this.destination.error(err);
    }
  };
  AnonymousSubject2.prototype.complete = function() {
    var destination = this.destination;
    if (destination && destination.complete) {
      this.destination.complete();
    }
  };
  AnonymousSubject2.prototype._subscribe = function(subscriber) {
    var source = this.source;
    if (source) {
      return this.source.subscribe(subscriber);
    } else {
      return Subscription.EMPTY;
    }
  };
  return AnonymousSubject2;
}(Subject);

// ../../../../node_modules/rxjs/_esm5/internal/operators/refCount.js
function refCount() {
  return function refCountOperatorFunction(source) {
    return source.lift(new RefCountOperator(source));
  };
}
var RefCountOperator = function() {
  function RefCountOperator3(connectable) {
    this.connectable = connectable;
  }
  RefCountOperator3.prototype.call = function(subscriber, source) {
    var connectable = this.connectable;
    connectable._refCount++;
    var refCounter = new RefCountSubscriber(subscriber, connectable);
    var subscription = source.subscribe(refCounter);
    if (!refCounter.closed) {
      refCounter.connection = connectable.connect();
    }
    return subscription;
  };
  return RefCountOperator3;
}();
var RefCountSubscriber = function(_super) {
  __extends(RefCountSubscriber3, _super);
  function RefCountSubscriber3(destination, connectable) {
    var _this = _super.call(this, destination) || this;
    _this.connectable = connectable;
    return _this;
  }
  RefCountSubscriber3.prototype._unsubscribe = function() {
    var connectable = this.connectable;
    if (!connectable) {
      this.connection = null;
      return;
    }
    this.connectable = null;
    var refCount2 = connectable._refCount;
    if (refCount2 <= 0) {
      this.connection = null;
      return;
    }
    connectable._refCount = refCount2 - 1;
    if (refCount2 > 1) {
      this.connection = null;
      return;
    }
    var connection = this.connection;
    var sharedConnection = connectable._connection;
    this.connection = null;
    if (sharedConnection && (!connection || sharedConnection === connection)) {
      sharedConnection.unsubscribe();
    }
  };
  return RefCountSubscriber3;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/observable/ConnectableObservable.js
var ConnectableObservable = function(_super) {
  __extends(ConnectableObservable2, _super);
  function ConnectableObservable2(source, subjectFactory) {
    var _this = _super.call(this) || this;
    _this.source = source;
    _this.subjectFactory = subjectFactory;
    _this._refCount = 0;
    _this._isComplete = false;
    return _this;
  }
  ConnectableObservable2.prototype._subscribe = function(subscriber) {
    return this.getSubject().subscribe(subscriber);
  };
  ConnectableObservable2.prototype.getSubject = function() {
    var subject = this._subject;
    if (!subject || subject.isStopped) {
      this._subject = this.subjectFactory();
    }
    return this._subject;
  };
  ConnectableObservable2.prototype.connect = function() {
    var connection = this._connection;
    if (!connection) {
      this._isComplete = false;
      connection = this._connection = new Subscription();
      connection.add(this.source.subscribe(new ConnectableSubscriber(this.getSubject(), this)));
      if (connection.closed) {
        this._connection = null;
        connection = Subscription.EMPTY;
      }
    }
    return connection;
  };
  ConnectableObservable2.prototype.refCount = function() {
    return refCount()(this);
  };
  return ConnectableObservable2;
}(Observable);
var connectableObservableDescriptor = function() {
  var connectableProto = ConnectableObservable.prototype;
  return {
    operator: {
      value: null
    },
    _refCount: {
      value: 0,
      writable: true
    },
    _subject: {
      value: null,
      writable: true
    },
    _connection: {
      value: null,
      writable: true
    },
    _subscribe: {
      value: connectableProto._subscribe
    },
    _isComplete: {
      value: connectableProto._isComplete,
      writable: true
    },
    getSubject: {
      value: connectableProto.getSubject
    },
    connect: {
      value: connectableProto.connect
    },
    refCount: {
      value: connectableProto.refCount
    }
  };
}();
var ConnectableSubscriber = function(_super) {
  __extends(ConnectableSubscriber2, _super);
  function ConnectableSubscriber2(destination, connectable) {
    var _this = _super.call(this, destination) || this;
    _this.connectable = connectable;
    return _this;
  }
  ConnectableSubscriber2.prototype._error = function(err) {
    this._unsubscribe();
    _super.prototype._error.call(this, err);
  };
  ConnectableSubscriber2.prototype._complete = function() {
    this.connectable._isComplete = true;
    this._unsubscribe();
    _super.prototype._complete.call(this);
  };
  ConnectableSubscriber2.prototype._unsubscribe = function() {
    var connectable = this.connectable;
    if (connectable) {
      this.connectable = null;
      var connection = connectable._connection;
      connectable._refCount = 0;
      connectable._subject = null;
      connectable._connection = null;
      if (connection) {
        connection.unsubscribe();
      }
    }
  };
  return ConnectableSubscriber2;
}(SubjectSubscriber);
var RefCountOperator2 = function() {
  function RefCountOperator3(connectable) {
    this.connectable = connectable;
  }
  RefCountOperator3.prototype.call = function(subscriber, source) {
    var connectable = this.connectable;
    connectable._refCount++;
    var refCounter = new RefCountSubscriber2(subscriber, connectable);
    var subscription = source.subscribe(refCounter);
    if (!refCounter.closed) {
      refCounter.connection = connectable.connect();
    }
    return subscription;
  };
  return RefCountOperator3;
}();
var RefCountSubscriber2 = function(_super) {
  __extends(RefCountSubscriber3, _super);
  function RefCountSubscriber3(destination, connectable) {
    var _this = _super.call(this, destination) || this;
    _this.connectable = connectable;
    return _this;
  }
  RefCountSubscriber3.prototype._unsubscribe = function() {
    var connectable = this.connectable;
    if (!connectable) {
      this.connection = null;
      return;
    }
    this.connectable = null;
    var refCount2 = connectable._refCount;
    if (refCount2 <= 0) {
      this.connection = null;
      return;
    }
    connectable._refCount = refCount2 - 1;
    if (refCount2 > 1) {
      this.connection = null;
      return;
    }
    var connection = this.connection;
    var sharedConnection = connectable._connection;
    this.connection = null;
    if (sharedConnection && (!connection || sharedConnection === connection)) {
      sharedConnection.unsubscribe();
    }
  };
  return RefCountSubscriber3;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/groupBy.js
var GroupByOperator = function() {
  function GroupByOperator2(keySelector, elementSelector, durationSelector, subjectSelector) {
    this.keySelector = keySelector;
    this.elementSelector = elementSelector;
    this.durationSelector = durationSelector;
    this.subjectSelector = subjectSelector;
  }
  GroupByOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new GroupBySubscriber(subscriber, this.keySelector, this.elementSelector, this.durationSelector, this.subjectSelector));
  };
  return GroupByOperator2;
}();
var GroupBySubscriber = function(_super) {
  __extends(GroupBySubscriber2, _super);
  function GroupBySubscriber2(destination, keySelector, elementSelector, durationSelector, subjectSelector) {
    var _this = _super.call(this, destination) || this;
    _this.keySelector = keySelector;
    _this.elementSelector = elementSelector;
    _this.durationSelector = durationSelector;
    _this.subjectSelector = subjectSelector;
    _this.groups = null;
    _this.attemptedToUnsubscribe = false;
    _this.count = 0;
    return _this;
  }
  GroupBySubscriber2.prototype._next = function(value) {
    var key;
    try {
      key = this.keySelector(value);
    } catch (err) {
      this.error(err);
      return;
    }
    this._group(value, key);
  };
  GroupBySubscriber2.prototype._group = function(value, key) {
    var groups = this.groups;
    if (!groups) {
      groups = this.groups = /* @__PURE__ */ new Map();
    }
    var group = groups.get(key);
    var element;
    if (this.elementSelector) {
      try {
        element = this.elementSelector(value);
      } catch (err) {
        this.error(err);
      }
    } else {
      element = value;
    }
    if (!group) {
      group = this.subjectSelector ? this.subjectSelector() : new Subject();
      groups.set(key, group);
      var groupedObservable = new GroupedObservable(key, group, this);
      this.destination.next(groupedObservable);
      if (this.durationSelector) {
        var duration = void 0;
        try {
          duration = this.durationSelector(new GroupedObservable(key, group));
        } catch (err) {
          this.error(err);
          return;
        }
        this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
      }
    }
    if (!group.closed) {
      group.next(element);
    }
  };
  GroupBySubscriber2.prototype._error = function(err) {
    var groups = this.groups;
    if (groups) {
      groups.forEach(function(group, key) {
        group.error(err);
      });
      groups.clear();
    }
    this.destination.error(err);
  };
  GroupBySubscriber2.prototype._complete = function() {
    var groups = this.groups;
    if (groups) {
      groups.forEach(function(group, key) {
        group.complete();
      });
      groups.clear();
    }
    this.destination.complete();
  };
  GroupBySubscriber2.prototype.removeGroup = function(key) {
    this.groups.delete(key);
  };
  GroupBySubscriber2.prototype.unsubscribe = function() {
    if (!this.closed) {
      this.attemptedToUnsubscribe = true;
      if (this.count === 0) {
        _super.prototype.unsubscribe.call(this);
      }
    }
  };
  return GroupBySubscriber2;
}(Subscriber);
var GroupDurationSubscriber = function(_super) {
  __extends(GroupDurationSubscriber2, _super);
  function GroupDurationSubscriber2(key, group, parent) {
    var _this = _super.call(this, group) || this;
    _this.key = key;
    _this.group = group;
    _this.parent = parent;
    return _this;
  }
  GroupDurationSubscriber2.prototype._next = function(value) {
    this.complete();
  };
  GroupDurationSubscriber2.prototype._unsubscribe = function() {
    var _a = this, parent = _a.parent, key = _a.key;
    this.key = this.parent = null;
    if (parent) {
      parent.removeGroup(key);
    }
  };
  return GroupDurationSubscriber2;
}(Subscriber);
var GroupedObservable = function(_super) {
  __extends(GroupedObservable2, _super);
  function GroupedObservable2(key, groupSubject, refCountSubscription) {
    var _this = _super.call(this) || this;
    _this.key = key;
    _this.groupSubject = groupSubject;
    _this.refCountSubscription = refCountSubscription;
    return _this;
  }
  GroupedObservable2.prototype._subscribe = function(subscriber) {
    var subscription = new Subscription();
    var _a = this, refCountSubscription = _a.refCountSubscription, groupSubject = _a.groupSubject;
    if (refCountSubscription && !refCountSubscription.closed) {
      subscription.add(new InnerRefCountSubscription(refCountSubscription));
    }
    subscription.add(groupSubject.subscribe(subscriber));
    return subscription;
  };
  return GroupedObservable2;
}(Observable);
var InnerRefCountSubscription = function(_super) {
  __extends(InnerRefCountSubscription2, _super);
  function InnerRefCountSubscription2(parent) {
    var _this = _super.call(this) || this;
    _this.parent = parent;
    parent.count++;
    return _this;
  }
  InnerRefCountSubscription2.prototype.unsubscribe = function() {
    var parent = this.parent;
    if (!parent.closed && !this.closed) {
      _super.prototype.unsubscribe.call(this);
      parent.count -= 1;
      if (parent.count === 0 && parent.attemptedToUnsubscribe) {
        parent.unsubscribe();
      }
    }
  };
  return InnerRefCountSubscription2;
}(Subscription);

// ../../../../node_modules/rxjs/_esm5/internal/BehaviorSubject.js
var BehaviorSubject = function(_super) {
  __extends(BehaviorSubject2, _super);
  function BehaviorSubject2(_value) {
    var _this = _super.call(this) || this;
    _this._value = _value;
    return _this;
  }
  Object.defineProperty(BehaviorSubject2.prototype, "value", {
    get: function() {
      return this.getValue();
    },
    enumerable: true,
    configurable: true
  });
  BehaviorSubject2.prototype._subscribe = function(subscriber) {
    var subscription = _super.prototype._subscribe.call(this, subscriber);
    if (subscription && !subscription.closed) {
      subscriber.next(this._value);
    }
    return subscription;
  };
  BehaviorSubject2.prototype.getValue = function() {
    if (this.hasError) {
      throw this.thrownError;
    } else if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else {
      return this._value;
    }
  };
  BehaviorSubject2.prototype.next = function(value) {
    _super.prototype.next.call(this, this._value = value);
  };
  return BehaviorSubject2;
}(Subject);

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/Action.js
var Action = function(_super) {
  __extends(Action2, _super);
  function Action2(scheduler, work) {
    return _super.call(this) || this;
  }
  Action2.prototype.schedule = function(state, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return this;
  };
  return Action2;
}(Subscription);

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/AsyncAction.js
var AsyncAction = function(_super) {
  __extends(AsyncAction2, _super);
  function AsyncAction2(scheduler, work) {
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    _this.pending = false;
    return _this;
  }
  AsyncAction2.prototype.schedule = function(state, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (this.closed) {
      return this;
    }
    this.state = state;
    var id = this.id;
    var scheduler = this.scheduler;
    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, delay2);
    }
    this.pending = true;
    this.delay = delay2;
    this.id = this.id || this.requestAsyncId(scheduler, this.id, delay2);
    return this;
  };
  AsyncAction2.prototype.requestAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return setInterval(scheduler.flush.bind(scheduler, this), delay2);
  };
  AsyncAction2.prototype.recycleAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 !== null && this.delay === delay2 && this.pending === false) {
      return id;
    }
    clearInterval(id);
    return void 0;
  };
  AsyncAction2.prototype.execute = function(state, delay2) {
    if (this.closed) {
      return new Error("executing a cancelled action");
    }
    this.pending = false;
    var error = this._execute(state, delay2);
    if (error) {
      return error;
    } else if (this.pending === false && this.id != null) {
      this.id = this.recycleAsyncId(this.scheduler, this.id, null);
    }
  };
  AsyncAction2.prototype._execute = function(state, delay2) {
    var errored = false;
    var errorValue = void 0;
    try {
      this.work(state);
    } catch (e) {
      errored = true;
      errorValue = !!e && e || new Error(e);
    }
    if (errored) {
      this.unsubscribe();
      return errorValue;
    }
  };
  AsyncAction2.prototype._unsubscribe = function() {
    var id = this.id;
    var scheduler = this.scheduler;
    var actions = scheduler.actions;
    var index = actions.indexOf(this);
    this.work = null;
    this.state = null;
    this.pending = false;
    this.scheduler = null;
    if (index !== -1) {
      actions.splice(index, 1);
    }
    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, null);
    }
    this.delay = null;
  };
  return AsyncAction2;
}(Action);

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/QueueAction.js
var QueueAction = function(_super) {
  __extends(QueueAction2, _super);
  function QueueAction2(scheduler, work) {
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    return _this;
  }
  QueueAction2.prototype.schedule = function(state, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 > 0) {
      return _super.prototype.schedule.call(this, state, delay2);
    }
    this.delay = delay2;
    this.state = state;
    this.scheduler.flush(this);
    return this;
  };
  QueueAction2.prototype.execute = function(state, delay2) {
    return delay2 > 0 || this.closed ? _super.prototype.execute.call(this, state, delay2) : this._execute(state, delay2);
  };
  QueueAction2.prototype.requestAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 !== null && delay2 > 0 || delay2 === null && this.delay > 0) {
      return _super.prototype.requestAsyncId.call(this, scheduler, id, delay2);
    }
    return scheduler.flush(this);
  };
  return QueueAction2;
}(AsyncAction);

// ../../../../node_modules/rxjs/_esm5/internal/Scheduler.js
var Scheduler = function() {
  function Scheduler2(SchedulerAction, now) {
    if (now === void 0) {
      now = Scheduler2.now;
    }
    this.SchedulerAction = SchedulerAction;
    this.now = now;
  }
  Scheduler2.prototype.schedule = function(work, delay2, state) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return new this.SchedulerAction(this, work).schedule(state, delay2);
  };
  Scheduler2.now = function() {
    return Date.now();
  };
  return Scheduler2;
}();

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/AsyncScheduler.js
var AsyncScheduler = function(_super) {
  __extends(AsyncScheduler2, _super);
  function AsyncScheduler2(SchedulerAction, now) {
    if (now === void 0) {
      now = Scheduler.now;
    }
    var _this = _super.call(this, SchedulerAction, function() {
      if (AsyncScheduler2.delegate && AsyncScheduler2.delegate !== _this) {
        return AsyncScheduler2.delegate.now();
      } else {
        return now();
      }
    }) || this;
    _this.actions = [];
    _this.active = false;
    _this.scheduled = void 0;
    return _this;
  }
  AsyncScheduler2.prototype.schedule = function(work, delay2, state) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (AsyncScheduler2.delegate && AsyncScheduler2.delegate !== this) {
      return AsyncScheduler2.delegate.schedule(work, delay2, state);
    } else {
      return _super.prototype.schedule.call(this, work, delay2, state);
    }
  };
  AsyncScheduler2.prototype.flush = function(action) {
    var actions = this.actions;
    if (this.active) {
      actions.push(action);
      return;
    }
    var error;
    this.active = true;
    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (action = actions.shift());
    this.active = false;
    if (error) {
      while (action = actions.shift()) {
        action.unsubscribe();
      }
      throw error;
    }
  };
  return AsyncScheduler2;
}(Scheduler);

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/QueueScheduler.js
var QueueScheduler = function(_super) {
  __extends(QueueScheduler2, _super);
  function QueueScheduler2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  return QueueScheduler2;
}(AsyncScheduler);

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/queue.js
var queueScheduler = new QueueScheduler(QueueAction);
var queue = queueScheduler;

// ../../../../node_modules/rxjs/_esm5/internal/observable/empty.js
var EMPTY = new Observable(function(subscriber) {
  return subscriber.complete();
});
function empty2(scheduler) {
  return scheduler ? emptyScheduled(scheduler) : EMPTY;
}
function emptyScheduled(scheduler) {
  return new Observable(function(subscriber) {
    return scheduler.schedule(function() {
      return subscriber.complete();
    });
  });
}

// ../../../../node_modules/rxjs/_esm5/internal/util/isScheduler.js
function isScheduler(value) {
  return value && typeof value.schedule === "function";
}

// ../../../../node_modules/rxjs/_esm5/internal/util/subscribeToArray.js
var subscribeToArray = function(array) {
  return function(subscriber) {
    for (var i = 0, len = array.length; i < len && !subscriber.closed; i++) {
      subscriber.next(array[i]);
    }
    subscriber.complete();
  };
};

// ../../../../node_modules/rxjs/_esm5/internal/scheduled/scheduleArray.js
function scheduleArray(input, scheduler) {
  return new Observable(function(subscriber) {
    var sub = new Subscription();
    var i = 0;
    sub.add(scheduler.schedule(function() {
      if (i === input.length) {
        subscriber.complete();
        return;
      }
      subscriber.next(input[i++]);
      if (!subscriber.closed) {
        sub.add(this.schedule());
      }
    }));
    return sub;
  });
}

// ../../../../node_modules/rxjs/_esm5/internal/observable/fromArray.js
function fromArray(input, scheduler) {
  if (!scheduler) {
    return new Observable(subscribeToArray(input));
  } else {
    return scheduleArray(input, scheduler);
  }
}

// ../../../../node_modules/rxjs/_esm5/internal/observable/of.js
function of() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  var scheduler = args[args.length - 1];
  if (isScheduler(scheduler)) {
    args.pop();
    return scheduleArray(args, scheduler);
  } else {
    return fromArray(args);
  }
}

// ../../../../node_modules/rxjs/_esm5/internal/observable/throwError.js
function throwError(error, scheduler) {
  if (!scheduler) {
    return new Observable(function(subscriber) {
      return subscriber.error(error);
    });
  } else {
    return new Observable(function(subscriber) {
      return scheduler.schedule(dispatch, 0, {
        error,
        subscriber
      });
    });
  }
}
function dispatch(_a) {
  var error = _a.error, subscriber = _a.subscriber;
  subscriber.error(error);
}

// ../../../../node_modules/rxjs/_esm5/internal/Notification.js
var NotificationKind;
(function(NotificationKind2) {
  NotificationKind2["NEXT"] = "N";
  NotificationKind2["ERROR"] = "E";
  NotificationKind2["COMPLETE"] = "C";
})(NotificationKind || (NotificationKind = {}));
var Notification = function() {
  function Notification2(kind, value, error) {
    this.kind = kind;
    this.value = value;
    this.error = error;
    this.hasValue = kind === "N";
  }
  Notification2.prototype.observe = function(observer) {
    switch (this.kind) {
      case "N":
        return observer.next && observer.next(this.value);
      case "E":
        return observer.error && observer.error(this.error);
      case "C":
        return observer.complete && observer.complete();
    }
  };
  Notification2.prototype.do = function(next, error, complete) {
    var kind = this.kind;
    switch (kind) {
      case "N":
        return next && next(this.value);
      case "E":
        return error && error(this.error);
      case "C":
        return complete && complete();
    }
  };
  Notification2.prototype.accept = function(nextOrObserver, error, complete) {
    if (nextOrObserver && typeof nextOrObserver.next === "function") {
      return this.observe(nextOrObserver);
    } else {
      return this.do(nextOrObserver, error, complete);
    }
  };
  Notification2.prototype.toObservable = function() {
    var kind = this.kind;
    switch (kind) {
      case "N":
        return of(this.value);
      case "E":
        return throwError(this.error);
      case "C":
        return empty2();
    }
    throw new Error("unexpected notification kind value");
  };
  Notification2.createNext = function(value) {
    if (typeof value !== "undefined") {
      return new Notification2("N", value);
    }
    return Notification2.undefinedValueNotification;
  };
  Notification2.createError = function(err) {
    return new Notification2("E", void 0, err);
  };
  Notification2.createComplete = function() {
    return Notification2.completeNotification;
  };
  Notification2.completeNotification = new Notification2("C");
  Notification2.undefinedValueNotification = new Notification2("N", void 0);
  return Notification2;
}();

// ../../../../node_modules/rxjs/_esm5/internal/operators/observeOn.js
var ObserveOnOperator = function() {
  function ObserveOnOperator2(scheduler, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    this.scheduler = scheduler;
    this.delay = delay2;
  }
  ObserveOnOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
  };
  return ObserveOnOperator2;
}();
var ObserveOnSubscriber = function(_super) {
  __extends(ObserveOnSubscriber2, _super);
  function ObserveOnSubscriber2(destination, scheduler, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    var _this = _super.call(this, destination) || this;
    _this.scheduler = scheduler;
    _this.delay = delay2;
    return _this;
  }
  ObserveOnSubscriber2.dispatch = function(arg) {
    var notification = arg.notification, destination = arg.destination;
    notification.observe(destination);
    this.unsubscribe();
  };
  ObserveOnSubscriber2.prototype.scheduleMessage = function(notification) {
    var destination = this.destination;
    destination.add(this.scheduler.schedule(ObserveOnSubscriber2.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
  };
  ObserveOnSubscriber2.prototype._next = function(value) {
    this.scheduleMessage(Notification.createNext(value));
  };
  ObserveOnSubscriber2.prototype._error = function(err) {
    this.scheduleMessage(Notification.createError(err));
    this.unsubscribe();
  };
  ObserveOnSubscriber2.prototype._complete = function() {
    this.scheduleMessage(Notification.createComplete());
    this.unsubscribe();
  };
  return ObserveOnSubscriber2;
}(Subscriber);
var ObserveOnMessage = /* @__PURE__ */ function() {
  function ObserveOnMessage2(notification, destination) {
    this.notification = notification;
    this.destination = destination;
  }
  return ObserveOnMessage2;
}();

// ../../../../node_modules/rxjs/_esm5/internal/ReplaySubject.js
var ReplaySubject = function(_super) {
  __extends(ReplaySubject2, _super);
  function ReplaySubject2(bufferSize, windowTime2, scheduler) {
    if (bufferSize === void 0) {
      bufferSize = Number.POSITIVE_INFINITY;
    }
    if (windowTime2 === void 0) {
      windowTime2 = Number.POSITIVE_INFINITY;
    }
    var _this = _super.call(this) || this;
    _this.scheduler = scheduler;
    _this._events = [];
    _this._infiniteTimeWindow = false;
    _this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
    _this._windowTime = windowTime2 < 1 ? 1 : windowTime2;
    if (windowTime2 === Number.POSITIVE_INFINITY) {
      _this._infiniteTimeWindow = true;
      _this.next = _this.nextInfiniteTimeWindow;
    } else {
      _this.next = _this.nextTimeWindow;
    }
    return _this;
  }
  ReplaySubject2.prototype.nextInfiniteTimeWindow = function(value) {
    if (!this.isStopped) {
      var _events = this._events;
      _events.push(value);
      if (_events.length > this._bufferSize) {
        _events.shift();
      }
    }
    _super.prototype.next.call(this, value);
  };
  ReplaySubject2.prototype.nextTimeWindow = function(value) {
    if (!this.isStopped) {
      this._events.push(new ReplayEvent(this._getNow(), value));
      this._trimBufferThenGetEvents();
    }
    _super.prototype.next.call(this, value);
  };
  ReplaySubject2.prototype._subscribe = function(subscriber) {
    var _infiniteTimeWindow = this._infiniteTimeWindow;
    var _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
    var scheduler = this.scheduler;
    var len = _events.length;
    var subscription;
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else if (this.isStopped || this.hasError) {
      subscription = Subscription.EMPTY;
    } else {
      this.observers.push(subscriber);
      subscription = new SubjectSubscription(this, subscriber);
    }
    if (scheduler) {
      subscriber.add(subscriber = new ObserveOnSubscriber(subscriber, scheduler));
    }
    if (_infiniteTimeWindow) {
      for (var i = 0; i < len && !subscriber.closed; i++) {
        subscriber.next(_events[i]);
      }
    } else {
      for (var i = 0; i < len && !subscriber.closed; i++) {
        subscriber.next(_events[i].value);
      }
    }
    if (this.hasError) {
      subscriber.error(this.thrownError);
    } else if (this.isStopped) {
      subscriber.complete();
    }
    return subscription;
  };
  ReplaySubject2.prototype._getNow = function() {
    return (this.scheduler || queue).now();
  };
  ReplaySubject2.prototype._trimBufferThenGetEvents = function() {
    var now = this._getNow();
    var _bufferSize = this._bufferSize;
    var _windowTime = this._windowTime;
    var _events = this._events;
    var eventsCount = _events.length;
    var spliceCount = 0;
    while (spliceCount < eventsCount) {
      if (now - _events[spliceCount].time < _windowTime) {
        break;
      }
      spliceCount++;
    }
    if (eventsCount > _bufferSize) {
      spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
    }
    if (spliceCount > 0) {
      _events.splice(0, spliceCount);
    }
    return _events;
  };
  return ReplaySubject2;
}(Subject);
var ReplayEvent = /* @__PURE__ */ function() {
  function ReplayEvent2(time, value) {
    this.time = time;
    this.value = value;
  }
  return ReplayEvent2;
}();

// ../../../../node_modules/rxjs/_esm5/internal/AsyncSubject.js
var AsyncSubject = function(_super) {
  __extends(AsyncSubject2, _super);
  function AsyncSubject2() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.value = null;
    _this.hasNext = false;
    _this.hasCompleted = false;
    return _this;
  }
  AsyncSubject2.prototype._subscribe = function(subscriber) {
    if (this.hasError) {
      subscriber.error(this.thrownError);
      return Subscription.EMPTY;
    } else if (this.hasCompleted && this.hasNext) {
      subscriber.next(this.value);
      subscriber.complete();
      return Subscription.EMPTY;
    }
    return _super.prototype._subscribe.call(this, subscriber);
  };
  AsyncSubject2.prototype.next = function(value) {
    if (!this.hasCompleted) {
      this.value = value;
      this.hasNext = true;
    }
  };
  AsyncSubject2.prototype.error = function(error) {
    if (!this.hasCompleted) {
      _super.prototype.error.call(this, error);
    }
  };
  AsyncSubject2.prototype.complete = function() {
    this.hasCompleted = true;
    if (this.hasNext) {
      _super.prototype.next.call(this, this.value);
    }
    _super.prototype.complete.call(this);
  };
  return AsyncSubject2;
}(Subject);

// ../../../../node_modules/rxjs/_esm5/internal/util/Immediate.js
var nextHandle = 1;
var RESOLVED = function() {
  return Promise.resolve();
}();
var activeHandles = {};
function findAndClearHandle(handle) {
  if (handle in activeHandles) {
    delete activeHandles[handle];
    return true;
  }
  return false;
}
var Immediate = {
  setImmediate: function(cb) {
    var handle = nextHandle++;
    activeHandles[handle] = true;
    RESOLVED.then(function() {
      return findAndClearHandle(handle) && cb();
    });
    return handle;
  },
  clearImmediate: function(handle) {
    findAndClearHandle(handle);
  }
};

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/AsapAction.js
var AsapAction = function(_super) {
  __extends(AsapAction2, _super);
  function AsapAction2(scheduler, work) {
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    return _this;
  }
  AsapAction2.prototype.requestAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 !== null && delay2 > 0) {
      return _super.prototype.requestAsyncId.call(this, scheduler, id, delay2);
    }
    scheduler.actions.push(this);
    return scheduler.scheduled || (scheduler.scheduled = Immediate.setImmediate(scheduler.flush.bind(scheduler, null)));
  };
  AsapAction2.prototype.recycleAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 !== null && delay2 > 0 || delay2 === null && this.delay > 0) {
      return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay2);
    }
    if (scheduler.actions.length === 0) {
      Immediate.clearImmediate(id);
      scheduler.scheduled = void 0;
    }
    return void 0;
  };
  return AsapAction2;
}(AsyncAction);

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/AsapScheduler.js
var AsapScheduler = function(_super) {
  __extends(AsapScheduler2, _super);
  function AsapScheduler2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  AsapScheduler2.prototype.flush = function(action) {
    this.active = true;
    this.scheduled = void 0;
    var actions = this.actions;
    var error;
    var index = -1;
    var count2 = actions.length;
    action = action || actions.shift();
    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (++index < count2 && (action = actions.shift()));
    this.active = false;
    if (error) {
      while (++index < count2 && (action = actions.shift())) {
        action.unsubscribe();
      }
      throw error;
    }
  };
  return AsapScheduler2;
}(AsyncScheduler);

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/asap.js
var asapScheduler = new AsapScheduler(AsapAction);
var asap = asapScheduler;

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/async.js
var asyncScheduler = new AsyncScheduler(AsyncAction);

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/AnimationFrameAction.js
var AnimationFrameAction = function(_super) {
  __extends(AnimationFrameAction2, _super);
  function AnimationFrameAction2(scheduler, work) {
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    return _this;
  }
  AnimationFrameAction2.prototype.requestAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 !== null && delay2 > 0) {
      return _super.prototype.requestAsyncId.call(this, scheduler, id, delay2);
    }
    scheduler.actions.push(this);
    return scheduler.scheduled || (scheduler.scheduled = requestAnimationFrame(function() {
      return scheduler.flush(null);
    }));
  };
  AnimationFrameAction2.prototype.recycleAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (delay2 !== null && delay2 > 0 || delay2 === null && this.delay > 0) {
      return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay2);
    }
    if (scheduler.actions.length === 0) {
      cancelAnimationFrame(id);
      scheduler.scheduled = void 0;
    }
    return void 0;
  };
  return AnimationFrameAction2;
}(AsyncAction);

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/AnimationFrameScheduler.js
var AnimationFrameScheduler = function(_super) {
  __extends(AnimationFrameScheduler2, _super);
  function AnimationFrameScheduler2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  AnimationFrameScheduler2.prototype.flush = function(action) {
    this.active = true;
    this.scheduled = void 0;
    var actions = this.actions;
    var error;
    var index = -1;
    var count2 = actions.length;
    action = action || actions.shift();
    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (++index < count2 && (action = actions.shift()));
    this.active = false;
    if (error) {
      while (++index < count2 && (action = actions.shift())) {
        action.unsubscribe();
      }
      throw error;
    }
  };
  return AnimationFrameScheduler2;
}(AsyncScheduler);

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/animationFrame.js
var animationFrameScheduler = new AnimationFrameScheduler(AnimationFrameAction);

// ../../../../node_modules/rxjs/_esm5/internal/scheduler/VirtualTimeScheduler.js
var VirtualTimeScheduler = function(_super) {
  __extends(VirtualTimeScheduler2, _super);
  function VirtualTimeScheduler2(SchedulerAction, maxFrames) {
    if (SchedulerAction === void 0) {
      SchedulerAction = VirtualAction;
    }
    if (maxFrames === void 0) {
      maxFrames = Number.POSITIVE_INFINITY;
    }
    var _this = _super.call(this, SchedulerAction, function() {
      return _this.frame;
    }) || this;
    _this.maxFrames = maxFrames;
    _this.frame = 0;
    _this.index = -1;
    return _this;
  }
  VirtualTimeScheduler2.prototype.flush = function() {
    var _a = this, actions = _a.actions, maxFrames = _a.maxFrames;
    var error, action;
    while ((action = actions[0]) && action.delay <= maxFrames) {
      actions.shift();
      this.frame = action.delay;
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    }
    if (error) {
      while (action = actions.shift()) {
        action.unsubscribe();
      }
      throw error;
    }
  };
  VirtualTimeScheduler2.frameTimeFactor = 10;
  return VirtualTimeScheduler2;
}(AsyncScheduler);
var VirtualAction = function(_super) {
  __extends(VirtualAction2, _super);
  function VirtualAction2(scheduler, work, index) {
    if (index === void 0) {
      index = scheduler.index += 1;
    }
    var _this = _super.call(this, scheduler, work) || this;
    _this.scheduler = scheduler;
    _this.work = work;
    _this.index = index;
    _this.active = true;
    _this.index = scheduler.index = index;
    return _this;
  }
  VirtualAction2.prototype.schedule = function(state, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (!this.id) {
      return _super.prototype.schedule.call(this, state, delay2);
    }
    this.active = false;
    var action = new VirtualAction2(this.scheduler, this.work);
    this.add(action);
    return action.schedule(state, delay2);
  };
  VirtualAction2.prototype.requestAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    this.delay = scheduler.frame + delay2;
    var actions = scheduler.actions;
    actions.push(this);
    actions.sort(VirtualAction2.sortActions);
    return true;
  };
  VirtualAction2.prototype.recycleAsyncId = function(scheduler, id, delay2) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    return void 0;
  };
  VirtualAction2.prototype._execute = function(state, delay2) {
    if (this.active === true) {
      return _super.prototype._execute.call(this, state, delay2);
    }
  };
  VirtualAction2.sortActions = function(a, b) {
    if (a.delay === b.delay) {
      if (a.index === b.index) {
        return 0;
      } else if (a.index > b.index) {
        return 1;
      } else {
        return -1;
      }
    } else if (a.delay > b.delay) {
      return 1;
    } else {
      return -1;
    }
  };
  return VirtualAction2;
}(AsyncAction);

// ../../../../node_modules/rxjs/_esm5/internal/util/noop.js
function noop() {
}

// ../../../../node_modules/rxjs/_esm5/internal/util/ArgumentOutOfRangeError.js
var ArgumentOutOfRangeErrorImpl = function() {
  function ArgumentOutOfRangeErrorImpl2() {
    Error.call(this);
    this.message = "argument out of range";
    this.name = "ArgumentOutOfRangeError";
    return this;
  }
  ArgumentOutOfRangeErrorImpl2.prototype = Object.create(Error.prototype);
  return ArgumentOutOfRangeErrorImpl2;
}();
var ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;

// ../../../../node_modules/rxjs/_esm5/internal/util/EmptyError.js
var EmptyErrorImpl = function() {
  function EmptyErrorImpl2() {
    Error.call(this);
    this.message = "no elements in sequence";
    this.name = "EmptyError";
    return this;
  }
  EmptyErrorImpl2.prototype = Object.create(Error.prototype);
  return EmptyErrorImpl2;
}();
var EmptyError = EmptyErrorImpl;

// ../../../../node_modules/rxjs/_esm5/internal/util/TimeoutError.js
var TimeoutErrorImpl = function() {
  function TimeoutErrorImpl2() {
    Error.call(this);
    this.message = "Timeout has occurred";
    this.name = "TimeoutError";
    return this;
  }
  TimeoutErrorImpl2.prototype = Object.create(Error.prototype);
  return TimeoutErrorImpl2;
}();

// ../../../../node_modules/rxjs/_esm5/internal/operators/map.js
function map(project, thisArg) {
  return function mapOperation(source) {
    if (typeof project !== "function") {
      throw new TypeError("argument is not a function. Are you looking for `mapTo()`?");
    }
    return source.lift(new MapOperator(project, thisArg));
  };
}
var MapOperator = function() {
  function MapOperator2(project, thisArg) {
    this.project = project;
    this.thisArg = thisArg;
  }
  MapOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
  };
  return MapOperator2;
}();
var MapSubscriber = function(_super) {
  __extends(MapSubscriber2, _super);
  function MapSubscriber2(destination, project, thisArg) {
    var _this = _super.call(this, destination) || this;
    _this.project = project;
    _this.count = 0;
    _this.thisArg = thisArg || _this;
    return _this;
  }
  MapSubscriber2.prototype._next = function(value) {
    var result;
    try {
      result = this.project.call(this.thisArg, value, this.count++);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  };
  return MapSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/OuterSubscriber.js
var OuterSubscriber = function(_super) {
  __extends(OuterSubscriber2, _super);
  function OuterSubscriber2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  OuterSubscriber2.prototype.notifyNext = function(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
    this.destination.next(innerValue);
  };
  OuterSubscriber2.prototype.notifyError = function(error, innerSub) {
    this.destination.error(error);
  };
  OuterSubscriber2.prototype.notifyComplete = function(innerSub) {
    this.destination.complete();
  };
  return OuterSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/InnerSubscriber.js
var InnerSubscriber = function(_super) {
  __extends(InnerSubscriber2, _super);
  function InnerSubscriber2(parent, outerValue, outerIndex) {
    var _this = _super.call(this) || this;
    _this.parent = parent;
    _this.outerValue = outerValue;
    _this.outerIndex = outerIndex;
    _this.index = 0;
    return _this;
  }
  InnerSubscriber2.prototype._next = function(value) {
    this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
  };
  InnerSubscriber2.prototype._error = function(error) {
    this.parent.notifyError(error, this);
    this.unsubscribe();
  };
  InnerSubscriber2.prototype._complete = function() {
    this.parent.notifyComplete(this);
    this.unsubscribe();
  };
  return InnerSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/util/subscribeToPromise.js
var subscribeToPromise = function(promise2) {
  return function(subscriber) {
    promise2.then(function(value) {
      if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
      }
    }, function(err) {
      return subscriber.error(err);
    }).then(null, hostReportError);
    return subscriber;
  };
};

// ../../../../node_modules/rxjs/_esm5/internal/symbol/iterator.js
function getSymbolIterator() {
  if (typeof Symbol !== "function" || !Symbol.iterator) {
    return "@@iterator";
  }
  return Symbol.iterator;
}
var iterator = getSymbolIterator();

// ../../../../node_modules/rxjs/_esm5/internal/util/subscribeToIterable.js
var subscribeToIterable = function(iterable) {
  return function(subscriber) {
    var iterator2 = iterable[iterator]();
    do {
      var item = void 0;
      try {
        item = iterator2.next();
      } catch (err) {
        subscriber.error(err);
        return subscriber;
      }
      if (item.done) {
        subscriber.complete();
        break;
      }
      subscriber.next(item.value);
      if (subscriber.closed) {
        break;
      }
    } while (true);
    if (typeof iterator2.return === "function") {
      subscriber.add(function() {
        if (iterator2.return) {
          iterator2.return();
        }
      });
    }
    return subscriber;
  };
};

// ../../../../node_modules/rxjs/_esm5/internal/util/subscribeToObservable.js
var subscribeToObservable = function(obj) {
  return function(subscriber) {
    var obs = obj[observable]();
    if (typeof obs.subscribe !== "function") {
      throw new TypeError("Provided object does not correctly implement Symbol.observable");
    } else {
      return obs.subscribe(subscriber);
    }
  };
};

// ../../../../node_modules/rxjs/_esm5/internal/util/isArrayLike.js
var isArrayLike = function(x) {
  return x && typeof x.length === "number" && typeof x !== "function";
};

// ../../../../node_modules/rxjs/_esm5/internal/util/isPromise.js
function isPromise(value) {
  return !!value && typeof value.subscribe !== "function" && typeof value.then === "function";
}

// ../../../../node_modules/rxjs/_esm5/internal/util/subscribeTo.js
var subscribeTo = function(result) {
  if (!!result && typeof result[observable] === "function") {
    return subscribeToObservable(result);
  } else if (isArrayLike(result)) {
    return subscribeToArray(result);
  } else if (isPromise(result)) {
    return subscribeToPromise(result);
  } else if (!!result && typeof result[iterator] === "function") {
    return subscribeToIterable(result);
  } else {
    var value = isObject(result) ? "an invalid object" : "'" + result + "'";
    var msg = "You provided " + value + " where a stream was expected. You can provide an Observable, Promise, Array, or Iterable.";
    throw new TypeError(msg);
  }
};

// ../../../../node_modules/rxjs/_esm5/internal/util/subscribeToResult.js
function subscribeToResult(outerSubscriber, result, outerValue, outerIndex, innerSubscriber) {
  if (innerSubscriber === void 0) {
    innerSubscriber = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);
  }
  if (innerSubscriber.closed) {
    return void 0;
  }
  if (result instanceof Observable) {
    return result.subscribe(innerSubscriber);
  }
  return subscribeTo(result)(innerSubscriber);
}

// ../../../../node_modules/rxjs/_esm5/internal/observable/combineLatest.js
var NONE = {};
var CombineLatestOperator = function() {
  function CombineLatestOperator2(resultSelector) {
    this.resultSelector = resultSelector;
  }
  CombineLatestOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new CombineLatestSubscriber(subscriber, this.resultSelector));
  };
  return CombineLatestOperator2;
}();
var CombineLatestSubscriber = function(_super) {
  __extends(CombineLatestSubscriber2, _super);
  function CombineLatestSubscriber2(destination, resultSelector) {
    var _this = _super.call(this, destination) || this;
    _this.resultSelector = resultSelector;
    _this.active = 0;
    _this.values = [];
    _this.observables = [];
    return _this;
  }
  CombineLatestSubscriber2.prototype._next = function(observable2) {
    this.values.push(NONE);
    this.observables.push(observable2);
  };
  CombineLatestSubscriber2.prototype._complete = function() {
    var observables = this.observables;
    var len = observables.length;
    if (len === 0) {
      this.destination.complete();
    } else {
      this.active = len;
      this.toRespond = len;
      for (var i = 0; i < len; i++) {
        var observable2 = observables[i];
        this.add(subscribeToResult(this, observable2, void 0, i));
      }
    }
  };
  CombineLatestSubscriber2.prototype.notifyComplete = function(unused) {
    if ((this.active -= 1) === 0) {
      this.destination.complete();
    }
  };
  CombineLatestSubscriber2.prototype.notifyNext = function(_outerValue, innerValue, outerIndex) {
    var values = this.values;
    var oldVal = values[outerIndex];
    var toRespond = !this.toRespond ? 0 : oldVal === NONE ? --this.toRespond : this.toRespond;
    values[outerIndex] = innerValue;
    if (toRespond === 0) {
      if (this.resultSelector) {
        this._tryResultSelector(values);
      } else {
        this.destination.next(values.slice());
      }
    }
  };
  CombineLatestSubscriber2.prototype._tryResultSelector = function(values) {
    var result;
    try {
      result = this.resultSelector.apply(this, values);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  };
  return CombineLatestSubscriber2;
}(OuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/scheduled/scheduleObservable.js
function scheduleObservable(input, scheduler) {
  return new Observable(function(subscriber) {
    var sub = new Subscription();
    sub.add(scheduler.schedule(function() {
      var observable2 = input[observable]();
      sub.add(observable2.subscribe({
        next: function(value) {
          sub.add(scheduler.schedule(function() {
            return subscriber.next(value);
          }));
        },
        error: function(err) {
          sub.add(scheduler.schedule(function() {
            return subscriber.error(err);
          }));
        },
        complete: function() {
          sub.add(scheduler.schedule(function() {
            return subscriber.complete();
          }));
        }
      }));
    }));
    return sub;
  });
}

// ../../../../node_modules/rxjs/_esm5/internal/scheduled/schedulePromise.js
function schedulePromise(input, scheduler) {
  return new Observable(function(subscriber) {
    var sub = new Subscription();
    sub.add(scheduler.schedule(function() {
      return input.then(function(value) {
        sub.add(scheduler.schedule(function() {
          subscriber.next(value);
          sub.add(scheduler.schedule(function() {
            return subscriber.complete();
          }));
        }));
      }, function(err) {
        sub.add(scheduler.schedule(function() {
          return subscriber.error(err);
        }));
      });
    }));
    return sub;
  });
}

// ../../../../node_modules/rxjs/_esm5/internal/scheduled/scheduleIterable.js
function scheduleIterable(input, scheduler) {
  if (!input) {
    throw new Error("Iterable cannot be null");
  }
  return new Observable(function(subscriber) {
    var sub = new Subscription();
    var iterator2;
    sub.add(function() {
      if (iterator2 && typeof iterator2.return === "function") {
        iterator2.return();
      }
    });
    sub.add(scheduler.schedule(function() {
      iterator2 = input[iterator]();
      sub.add(scheduler.schedule(function() {
        if (subscriber.closed) {
          return;
        }
        var value;
        var done;
        try {
          var result = iterator2.next();
          value = result.value;
          done = result.done;
        } catch (err) {
          subscriber.error(err);
          return;
        }
        if (done) {
          subscriber.complete();
        } else {
          subscriber.next(value);
          this.schedule();
        }
      }));
    }));
    return sub;
  });
}

// ../../../../node_modules/rxjs/_esm5/internal/util/isInteropObservable.js
function isInteropObservable(input) {
  return input && typeof input[observable] === "function";
}

// ../../../../node_modules/rxjs/_esm5/internal/util/isIterable.js
function isIterable(input) {
  return input && typeof input[iterator] === "function";
}

// ../../../../node_modules/rxjs/_esm5/internal/scheduled/scheduled.js
function scheduled(input, scheduler) {
  if (input != null) {
    if (isInteropObservable(input)) {
      return scheduleObservable(input, scheduler);
    } else if (isPromise(input)) {
      return schedulePromise(input, scheduler);
    } else if (isArrayLike(input)) {
      return scheduleArray(input, scheduler);
    } else if (isIterable(input) || typeof input === "string") {
      return scheduleIterable(input, scheduler);
    }
  }
  throw new TypeError((input !== null && typeof input || input) + " is not observable");
}

// ../../../../node_modules/rxjs/_esm5/internal/observable/from.js
function from(input, scheduler) {
  if (!scheduler) {
    if (input instanceof Observable) {
      return input;
    }
    return new Observable(subscribeTo(input));
  } else {
    return scheduled(input, scheduler);
  }
}

// ../../../../node_modules/rxjs/_esm5/internal/innerSubscribe.js
var SimpleInnerSubscriber = function(_super) {
  __extends(SimpleInnerSubscriber2, _super);
  function SimpleInnerSubscriber2(parent) {
    var _this = _super.call(this) || this;
    _this.parent = parent;
    return _this;
  }
  SimpleInnerSubscriber2.prototype._next = function(value) {
    this.parent.notifyNext(value);
  };
  SimpleInnerSubscriber2.prototype._error = function(error) {
    this.parent.notifyError(error);
    this.unsubscribe();
  };
  SimpleInnerSubscriber2.prototype._complete = function() {
    this.parent.notifyComplete();
    this.unsubscribe();
  };
  return SimpleInnerSubscriber2;
}(Subscriber);
var ComplexInnerSubscriber = function(_super) {
  __extends(ComplexInnerSubscriber2, _super);
  function ComplexInnerSubscriber2(parent, outerValue, outerIndex) {
    var _this = _super.call(this) || this;
    _this.parent = parent;
    _this.outerValue = outerValue;
    _this.outerIndex = outerIndex;
    return _this;
  }
  ComplexInnerSubscriber2.prototype._next = function(value) {
    this.parent.notifyNext(this.outerValue, value, this.outerIndex, this);
  };
  ComplexInnerSubscriber2.prototype._error = function(error) {
    this.parent.notifyError(error);
    this.unsubscribe();
  };
  ComplexInnerSubscriber2.prototype._complete = function() {
    this.parent.notifyComplete(this);
    this.unsubscribe();
  };
  return ComplexInnerSubscriber2;
}(Subscriber);
var SimpleOuterSubscriber = function(_super) {
  __extends(SimpleOuterSubscriber2, _super);
  function SimpleOuterSubscriber2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  SimpleOuterSubscriber2.prototype.notifyNext = function(innerValue) {
    this.destination.next(innerValue);
  };
  SimpleOuterSubscriber2.prototype.notifyError = function(err) {
    this.destination.error(err);
  };
  SimpleOuterSubscriber2.prototype.notifyComplete = function() {
    this.destination.complete();
  };
  return SimpleOuterSubscriber2;
}(Subscriber);
var ComplexOuterSubscriber = function(_super) {
  __extends(ComplexOuterSubscriber2, _super);
  function ComplexOuterSubscriber2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  ComplexOuterSubscriber2.prototype.notifyNext = function(_outerValue, innerValue, _outerIndex, _innerSub) {
    this.destination.next(innerValue);
  };
  ComplexOuterSubscriber2.prototype.notifyError = function(error) {
    this.destination.error(error);
  };
  ComplexOuterSubscriber2.prototype.notifyComplete = function(_innerSub) {
    this.destination.complete();
  };
  return ComplexOuterSubscriber2;
}(Subscriber);
function innerSubscribe(result, innerSubscriber) {
  if (innerSubscriber.closed) {
    return void 0;
  }
  if (result instanceof Observable) {
    return result.subscribe(innerSubscriber);
  }
  var subscription;
  try {
    subscription = subscribeTo(result)(innerSubscriber);
  } catch (error) {
    innerSubscriber.error(error);
  }
  return subscription;
}

// ../../../../node_modules/rxjs/_esm5/internal/operators/mergeMap.js
function mergeMap(project, resultSelector, concurrent) {
  if (concurrent === void 0) {
    concurrent = Number.POSITIVE_INFINITY;
  }
  if (typeof resultSelector === "function") {
    return function(source) {
      return source.pipe(mergeMap(function(a, i) {
        return from(project(a, i)).pipe(map(function(b, ii) {
          return resultSelector(a, b, i, ii);
        }));
      }, concurrent));
    };
  } else if (typeof resultSelector === "number") {
    concurrent = resultSelector;
  }
  return function(source) {
    return source.lift(new MergeMapOperator(project, concurrent));
  };
}
var MergeMapOperator = function() {
  function MergeMapOperator2(project, concurrent) {
    if (concurrent === void 0) {
      concurrent = Number.POSITIVE_INFINITY;
    }
    this.project = project;
    this.concurrent = concurrent;
  }
  MergeMapOperator2.prototype.call = function(observer, source) {
    return source.subscribe(new MergeMapSubscriber(observer, this.project, this.concurrent));
  };
  return MergeMapOperator2;
}();
var MergeMapSubscriber = function(_super) {
  __extends(MergeMapSubscriber2, _super);
  function MergeMapSubscriber2(destination, project, concurrent) {
    if (concurrent === void 0) {
      concurrent = Number.POSITIVE_INFINITY;
    }
    var _this = _super.call(this, destination) || this;
    _this.project = project;
    _this.concurrent = concurrent;
    _this.hasCompleted = false;
    _this.buffer = [];
    _this.active = 0;
    _this.index = 0;
    return _this;
  }
  MergeMapSubscriber2.prototype._next = function(value) {
    if (this.active < this.concurrent) {
      this._tryNext(value);
    } else {
      this.buffer.push(value);
    }
  };
  MergeMapSubscriber2.prototype._tryNext = function(value) {
    var result;
    var index = this.index++;
    try {
      result = this.project(value, index);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.active++;
    this._innerSub(result);
  };
  MergeMapSubscriber2.prototype._innerSub = function(ish) {
    var innerSubscriber = new SimpleInnerSubscriber(this);
    var destination = this.destination;
    destination.add(innerSubscriber);
    var innerSubscription = innerSubscribe(ish, innerSubscriber);
    if (innerSubscription !== innerSubscriber) {
      destination.add(innerSubscription);
    }
  };
  MergeMapSubscriber2.prototype._complete = function() {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      this.destination.complete();
    }
    this.unsubscribe();
  };
  MergeMapSubscriber2.prototype.notifyNext = function(innerValue) {
    this.destination.next(innerValue);
  };
  MergeMapSubscriber2.prototype.notifyComplete = function() {
    var buffer2 = this.buffer;
    this.active--;
    if (buffer2.length > 0) {
      this._next(buffer2.shift());
    } else if (this.active === 0 && this.hasCompleted) {
      this.destination.complete();
    }
  };
  return MergeMapSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/mergeAll.js
function mergeAll(concurrent) {
  if (concurrent === void 0) {
    concurrent = Number.POSITIVE_INFINITY;
  }
  return mergeMap(identity, concurrent);
}

// ../../../../node_modules/rxjs/_esm5/internal/util/isNumeric.js
function isNumeric(val) {
  return !isArray(val) && val - parseFloat(val) + 1 >= 0;
}

// ../../../../node_modules/rxjs/_esm5/internal/observable/merge.js
function merge() {
  var observables = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    observables[_i] = arguments[_i];
  }
  var concurrent = Number.POSITIVE_INFINITY;
  var scheduler = null;
  var last2 = observables[observables.length - 1];
  if (isScheduler(last2)) {
    scheduler = observables.pop();
    if (observables.length > 1 && typeof observables[observables.length - 1] === "number") {
      concurrent = observables.pop();
    }
  } else if (typeof last2 === "number") {
    concurrent = observables.pop();
  }
  if (scheduler === null && observables.length === 1 && observables[0] instanceof Observable) {
    return observables[0];
  }
  return mergeAll(concurrent)(fromArray(observables, scheduler));
}

// ../../../../node_modules/rxjs/_esm5/internal/observable/never.js
var NEVER = new Observable(noop);

// ../../../../node_modules/rxjs/_esm5/internal/operators/filter.js
var FilterOperator = function() {
  function FilterOperator2(predicate, thisArg) {
    this.predicate = predicate;
    this.thisArg = thisArg;
  }
  FilterOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
  };
  return FilterOperator2;
}();
var FilterSubscriber = function(_super) {
  __extends(FilterSubscriber2, _super);
  function FilterSubscriber2(destination, predicate, thisArg) {
    var _this = _super.call(this, destination) || this;
    _this.predicate = predicate;
    _this.thisArg = thisArg;
    _this.count = 0;
    return _this;
  }
  FilterSubscriber2.prototype._next = function(value) {
    var result;
    try {
      result = this.predicate.call(this.thisArg, value, this.count++);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    if (result) {
      this.destination.next(value);
    }
  };
  return FilterSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/observable/race.js
var RaceOperator = function() {
  function RaceOperator2() {
  }
  RaceOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new RaceSubscriber(subscriber));
  };
  return RaceOperator2;
}();
var RaceSubscriber = function(_super) {
  __extends(RaceSubscriber2, _super);
  function RaceSubscriber2(destination) {
    var _this = _super.call(this, destination) || this;
    _this.hasFirst = false;
    _this.observables = [];
    _this.subscriptions = [];
    return _this;
  }
  RaceSubscriber2.prototype._next = function(observable2) {
    this.observables.push(observable2);
  };
  RaceSubscriber2.prototype._complete = function() {
    var observables = this.observables;
    var len = observables.length;
    if (len === 0) {
      this.destination.complete();
    } else {
      for (var i = 0; i < len && !this.hasFirst; i++) {
        var observable2 = observables[i];
        var subscription = subscribeToResult(this, observable2, void 0, i);
        if (this.subscriptions) {
          this.subscriptions.push(subscription);
        }
        this.add(subscription);
      }
      this.observables = null;
    }
  };
  RaceSubscriber2.prototype.notifyNext = function(_outerValue, innerValue, outerIndex) {
    if (!this.hasFirst) {
      this.hasFirst = true;
      for (var i = 0; i < this.subscriptions.length; i++) {
        if (i !== outerIndex) {
          var subscription = this.subscriptions[i];
          subscription.unsubscribe();
          this.remove(subscription);
        }
      }
      this.subscriptions = null;
    }
    this.destination.next(innerValue);
  };
  return RaceSubscriber2;
}(OuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/observable/zip.js
var ZipOperator = function() {
  function ZipOperator2(resultSelector) {
    this.resultSelector = resultSelector;
  }
  ZipOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new ZipSubscriber(subscriber, this.resultSelector));
  };
  return ZipOperator2;
}();
var ZipSubscriber = function(_super) {
  __extends(ZipSubscriber2, _super);
  function ZipSubscriber2(destination, resultSelector, values) {
    if (values === void 0) {
      values = /* @__PURE__ */ Object.create(null);
    }
    var _this = _super.call(this, destination) || this;
    _this.resultSelector = resultSelector;
    _this.iterators = [];
    _this.active = 0;
    _this.resultSelector = typeof resultSelector === "function" ? resultSelector : void 0;
    return _this;
  }
  ZipSubscriber2.prototype._next = function(value) {
    var iterators = this.iterators;
    if (isArray(value)) {
      iterators.push(new StaticArrayIterator(value));
    } else if (typeof value[iterator] === "function") {
      iterators.push(new StaticIterator(value[iterator]()));
    } else {
      iterators.push(new ZipBufferIterator(this.destination, this, value));
    }
  };
  ZipSubscriber2.prototype._complete = function() {
    var iterators = this.iterators;
    var len = iterators.length;
    this.unsubscribe();
    if (len === 0) {
      this.destination.complete();
      return;
    }
    this.active = len;
    for (var i = 0; i < len; i++) {
      var iterator2 = iterators[i];
      if (iterator2.stillUnsubscribed) {
        var destination = this.destination;
        destination.add(iterator2.subscribe());
      } else {
        this.active--;
      }
    }
  };
  ZipSubscriber2.prototype.notifyInactive = function() {
    this.active--;
    if (this.active === 0) {
      this.destination.complete();
    }
  };
  ZipSubscriber2.prototype.checkIterators = function() {
    var iterators = this.iterators;
    var len = iterators.length;
    var destination = this.destination;
    for (var i = 0; i < len; i++) {
      var iterator2 = iterators[i];
      if (typeof iterator2.hasValue === "function" && !iterator2.hasValue()) {
        return;
      }
    }
    var shouldComplete = false;
    var args = [];
    for (var i = 0; i < len; i++) {
      var iterator2 = iterators[i];
      var result = iterator2.next();
      if (iterator2.hasCompleted()) {
        shouldComplete = true;
      }
      if (result.done) {
        destination.complete();
        return;
      }
      args.push(result.value);
    }
    if (this.resultSelector) {
      this._tryresultSelector(args);
    } else {
      destination.next(args);
    }
    if (shouldComplete) {
      destination.complete();
    }
  };
  ZipSubscriber2.prototype._tryresultSelector = function(args) {
    var result;
    try {
      result = this.resultSelector.apply(this, args);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  };
  return ZipSubscriber2;
}(Subscriber);
var StaticIterator = function() {
  function StaticIterator2(iterator2) {
    this.iterator = iterator2;
    this.nextResult = iterator2.next();
  }
  StaticIterator2.prototype.hasValue = function() {
    return true;
  };
  StaticIterator2.prototype.next = function() {
    var result = this.nextResult;
    this.nextResult = this.iterator.next();
    return result;
  };
  StaticIterator2.prototype.hasCompleted = function() {
    var nextResult = this.nextResult;
    return Boolean(nextResult && nextResult.done);
  };
  return StaticIterator2;
}();
var StaticArrayIterator = function() {
  function StaticArrayIterator2(array) {
    this.array = array;
    this.index = 0;
    this.length = 0;
    this.length = array.length;
  }
  StaticArrayIterator2.prototype[iterator] = function() {
    return this;
  };
  StaticArrayIterator2.prototype.next = function(value) {
    var i = this.index++;
    var array = this.array;
    return i < this.length ? {
      value: array[i],
      done: false
    } : {
      value: null,
      done: true
    };
  };
  StaticArrayIterator2.prototype.hasValue = function() {
    return this.array.length > this.index;
  };
  StaticArrayIterator2.prototype.hasCompleted = function() {
    return this.array.length === this.index;
  };
  return StaticArrayIterator2;
}();
var ZipBufferIterator = function(_super) {
  __extends(ZipBufferIterator2, _super);
  function ZipBufferIterator2(destination, parent, observable2) {
    var _this = _super.call(this, destination) || this;
    _this.parent = parent;
    _this.observable = observable2;
    _this.stillUnsubscribed = true;
    _this.buffer = [];
    _this.isComplete = false;
    return _this;
  }
  ZipBufferIterator2.prototype[iterator] = function() {
    return this;
  };
  ZipBufferIterator2.prototype.next = function() {
    var buffer2 = this.buffer;
    if (buffer2.length === 0 && this.isComplete) {
      return {
        value: null,
        done: true
      };
    } else {
      return {
        value: buffer2.shift(),
        done: false
      };
    }
  };
  ZipBufferIterator2.prototype.hasValue = function() {
    return this.buffer.length > 0;
  };
  ZipBufferIterator2.prototype.hasCompleted = function() {
    return this.buffer.length === 0 && this.isComplete;
  };
  ZipBufferIterator2.prototype.notifyComplete = function() {
    if (this.buffer.length > 0) {
      this.isComplete = true;
      this.parent.notifyInactive();
    } else {
      this.destination.complete();
    }
  };
  ZipBufferIterator2.prototype.notifyNext = function(innerValue) {
    this.buffer.push(innerValue);
    this.parent.checkIterators();
  };
  ZipBufferIterator2.prototype.subscribe = function() {
    return innerSubscribe(this.observable, new SimpleInnerSubscriber(this));
  };
  return ZipBufferIterator2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/audit.js
var AuditOperator = function() {
  function AuditOperator2(durationSelector) {
    this.durationSelector = durationSelector;
  }
  AuditOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new AuditSubscriber(subscriber, this.durationSelector));
  };
  return AuditOperator2;
}();
var AuditSubscriber = function(_super) {
  __extends(AuditSubscriber2, _super);
  function AuditSubscriber2(destination, durationSelector) {
    var _this = _super.call(this, destination) || this;
    _this.durationSelector = durationSelector;
    _this.hasValue = false;
    return _this;
  }
  AuditSubscriber2.prototype._next = function(value) {
    this.value = value;
    this.hasValue = true;
    if (!this.throttled) {
      var duration = void 0;
      try {
        var durationSelector = this.durationSelector;
        duration = durationSelector(value);
      } catch (err) {
        return this.destination.error(err);
      }
      var innerSubscription = innerSubscribe(duration, new SimpleInnerSubscriber(this));
      if (!innerSubscription || innerSubscription.closed) {
        this.clearThrottle();
      } else {
        this.add(this.throttled = innerSubscription);
      }
    }
  };
  AuditSubscriber2.prototype.clearThrottle = function() {
    var _a = this, value = _a.value, hasValue = _a.hasValue, throttled = _a.throttled;
    if (throttled) {
      this.remove(throttled);
      this.throttled = void 0;
      throttled.unsubscribe();
    }
    if (hasValue) {
      this.value = void 0;
      this.hasValue = false;
      this.destination.next(value);
    }
  };
  AuditSubscriber2.prototype.notifyNext = function() {
    this.clearThrottle();
  };
  AuditSubscriber2.prototype.notifyComplete = function() {
    this.clearThrottle();
  };
  return AuditSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/buffer.js
var BufferOperator = function() {
  function BufferOperator2(closingNotifier) {
    this.closingNotifier = closingNotifier;
  }
  BufferOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new BufferSubscriber(subscriber, this.closingNotifier));
  };
  return BufferOperator2;
}();
var BufferSubscriber = function(_super) {
  __extends(BufferSubscriber2, _super);
  function BufferSubscriber2(destination, closingNotifier) {
    var _this = _super.call(this, destination) || this;
    _this.buffer = [];
    _this.add(innerSubscribe(closingNotifier, new SimpleInnerSubscriber(_this)));
    return _this;
  }
  BufferSubscriber2.prototype._next = function(value) {
    this.buffer.push(value);
  };
  BufferSubscriber2.prototype.notifyNext = function() {
    var buffer2 = this.buffer;
    this.buffer = [];
    this.destination.next(buffer2);
  };
  return BufferSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/bufferCount.js
var BufferCountOperator = function() {
  function BufferCountOperator2(bufferSize, startBufferEvery) {
    this.bufferSize = bufferSize;
    this.startBufferEvery = startBufferEvery;
    if (!startBufferEvery || bufferSize === startBufferEvery) {
      this.subscriberClass = BufferCountSubscriber;
    } else {
      this.subscriberClass = BufferSkipCountSubscriber;
    }
  }
  BufferCountOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new this.subscriberClass(subscriber, this.bufferSize, this.startBufferEvery));
  };
  return BufferCountOperator2;
}();
var BufferCountSubscriber = function(_super) {
  __extends(BufferCountSubscriber2, _super);
  function BufferCountSubscriber2(destination, bufferSize) {
    var _this = _super.call(this, destination) || this;
    _this.bufferSize = bufferSize;
    _this.buffer = [];
    return _this;
  }
  BufferCountSubscriber2.prototype._next = function(value) {
    var buffer2 = this.buffer;
    buffer2.push(value);
    if (buffer2.length == this.bufferSize) {
      this.destination.next(buffer2);
      this.buffer = [];
    }
  };
  BufferCountSubscriber2.prototype._complete = function() {
    var buffer2 = this.buffer;
    if (buffer2.length > 0) {
      this.destination.next(buffer2);
    }
    _super.prototype._complete.call(this);
  };
  return BufferCountSubscriber2;
}(Subscriber);
var BufferSkipCountSubscriber = function(_super) {
  __extends(BufferSkipCountSubscriber2, _super);
  function BufferSkipCountSubscriber2(destination, bufferSize, startBufferEvery) {
    var _this = _super.call(this, destination) || this;
    _this.bufferSize = bufferSize;
    _this.startBufferEvery = startBufferEvery;
    _this.buffers = [];
    _this.count = 0;
    return _this;
  }
  BufferSkipCountSubscriber2.prototype._next = function(value) {
    var _a = this, bufferSize = _a.bufferSize, startBufferEvery = _a.startBufferEvery, buffers = _a.buffers, count2 = _a.count;
    this.count++;
    if (count2 % startBufferEvery === 0) {
      buffers.push([]);
    }
    for (var i = buffers.length; i--; ) {
      var buffer2 = buffers[i];
      buffer2.push(value);
      if (buffer2.length === bufferSize) {
        buffers.splice(i, 1);
        this.destination.next(buffer2);
      }
    }
  };
  BufferSkipCountSubscriber2.prototype._complete = function() {
    var _a = this, buffers = _a.buffers, destination = _a.destination;
    while (buffers.length > 0) {
      var buffer2 = buffers.shift();
      if (buffer2.length > 0) {
        destination.next(buffer2);
      }
    }
    _super.prototype._complete.call(this);
  };
  return BufferSkipCountSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/bufferTime.js
var BufferTimeOperator = function() {
  function BufferTimeOperator2(bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler) {
    this.bufferTimeSpan = bufferTimeSpan;
    this.bufferCreationInterval = bufferCreationInterval;
    this.maxBufferSize = maxBufferSize;
    this.scheduler = scheduler;
  }
  BufferTimeOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new BufferTimeSubscriber(subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.maxBufferSize, this.scheduler));
  };
  return BufferTimeOperator2;
}();
var Context = /* @__PURE__ */ function() {
  function Context2() {
    this.buffer = [];
  }
  return Context2;
}();
var BufferTimeSubscriber = function(_super) {
  __extends(BufferTimeSubscriber2, _super);
  function BufferTimeSubscriber2(destination, bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler) {
    var _this = _super.call(this, destination) || this;
    _this.bufferTimeSpan = bufferTimeSpan;
    _this.bufferCreationInterval = bufferCreationInterval;
    _this.maxBufferSize = maxBufferSize;
    _this.scheduler = scheduler;
    _this.contexts = [];
    var context = _this.openContext();
    _this.timespanOnly = bufferCreationInterval == null || bufferCreationInterval < 0;
    if (_this.timespanOnly) {
      var timeSpanOnlyState = {
        subscriber: _this,
        context,
        bufferTimeSpan
      };
      _this.add(context.closeAction = scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
    } else {
      var closeState = {
        subscriber: _this,
        context
      };
      var creationState = {
        bufferTimeSpan,
        bufferCreationInterval,
        subscriber: _this,
        scheduler
      };
      _this.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, closeState));
      _this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, creationState));
    }
    return _this;
  }
  BufferTimeSubscriber2.prototype._next = function(value) {
    var contexts = this.contexts;
    var len = contexts.length;
    var filledBufferContext;
    for (var i = 0; i < len; i++) {
      var context_1 = contexts[i];
      var buffer2 = context_1.buffer;
      buffer2.push(value);
      if (buffer2.length == this.maxBufferSize) {
        filledBufferContext = context_1;
      }
    }
    if (filledBufferContext) {
      this.onBufferFull(filledBufferContext);
    }
  };
  BufferTimeSubscriber2.prototype._error = function(err) {
    this.contexts.length = 0;
    _super.prototype._error.call(this, err);
  };
  BufferTimeSubscriber2.prototype._complete = function() {
    var _a = this, contexts = _a.contexts, destination = _a.destination;
    while (contexts.length > 0) {
      var context_2 = contexts.shift();
      destination.next(context_2.buffer);
    }
    _super.prototype._complete.call(this);
  };
  BufferTimeSubscriber2.prototype._unsubscribe = function() {
    this.contexts = null;
  };
  BufferTimeSubscriber2.prototype.onBufferFull = function(context) {
    this.closeContext(context);
    var closeAction = context.closeAction;
    closeAction.unsubscribe();
    this.remove(closeAction);
    if (!this.closed && this.timespanOnly) {
      context = this.openContext();
      var bufferTimeSpan = this.bufferTimeSpan;
      var timeSpanOnlyState = {
        subscriber: this,
        context,
        bufferTimeSpan
      };
      this.add(context.closeAction = this.scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
    }
  };
  BufferTimeSubscriber2.prototype.openContext = function() {
    var context = new Context();
    this.contexts.push(context);
    return context;
  };
  BufferTimeSubscriber2.prototype.closeContext = function(context) {
    this.destination.next(context.buffer);
    var contexts = this.contexts;
    var spliceIndex = contexts ? contexts.indexOf(context) : -1;
    if (spliceIndex >= 0) {
      contexts.splice(contexts.indexOf(context), 1);
    }
  };
  return BufferTimeSubscriber2;
}(Subscriber);
function dispatchBufferTimeSpanOnly(state) {
  var subscriber = state.subscriber;
  var prevContext = state.context;
  if (prevContext) {
    subscriber.closeContext(prevContext);
  }
  if (!subscriber.closed) {
    state.context = subscriber.openContext();
    state.context.closeAction = this.schedule(state, state.bufferTimeSpan);
  }
}
function dispatchBufferCreation(state) {
  var bufferCreationInterval = state.bufferCreationInterval, bufferTimeSpan = state.bufferTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler;
  var context = subscriber.openContext();
  var action = this;
  if (!subscriber.closed) {
    subscriber.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, {
      subscriber,
      context
    }));
    action.schedule(state, bufferCreationInterval);
  }
}
function dispatchBufferClose(arg) {
  var subscriber = arg.subscriber, context = arg.context;
  subscriber.closeContext(context);
}

// ../../../../node_modules/rxjs/_esm5/internal/operators/bufferToggle.js
var BufferToggleOperator = function() {
  function BufferToggleOperator2(openings, closingSelector) {
    this.openings = openings;
    this.closingSelector = closingSelector;
  }
  BufferToggleOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new BufferToggleSubscriber(subscriber, this.openings, this.closingSelector));
  };
  return BufferToggleOperator2;
}();
var BufferToggleSubscriber = function(_super) {
  __extends(BufferToggleSubscriber2, _super);
  function BufferToggleSubscriber2(destination, openings, closingSelector) {
    var _this = _super.call(this, destination) || this;
    _this.closingSelector = closingSelector;
    _this.contexts = [];
    _this.add(subscribeToResult(_this, openings));
    return _this;
  }
  BufferToggleSubscriber2.prototype._next = function(value) {
    var contexts = this.contexts;
    var len = contexts.length;
    for (var i = 0; i < len; i++) {
      contexts[i].buffer.push(value);
    }
  };
  BufferToggleSubscriber2.prototype._error = function(err) {
    var contexts = this.contexts;
    while (contexts.length > 0) {
      var context_1 = contexts.shift();
      context_1.subscription.unsubscribe();
      context_1.buffer = null;
      context_1.subscription = null;
    }
    this.contexts = null;
    _super.prototype._error.call(this, err);
  };
  BufferToggleSubscriber2.prototype._complete = function() {
    var contexts = this.contexts;
    while (contexts.length > 0) {
      var context_2 = contexts.shift();
      this.destination.next(context_2.buffer);
      context_2.subscription.unsubscribe();
      context_2.buffer = null;
      context_2.subscription = null;
    }
    this.contexts = null;
    _super.prototype._complete.call(this);
  };
  BufferToggleSubscriber2.prototype.notifyNext = function(outerValue, innerValue) {
    outerValue ? this.closeBuffer(outerValue) : this.openBuffer(innerValue);
  };
  BufferToggleSubscriber2.prototype.notifyComplete = function(innerSub) {
    this.closeBuffer(innerSub.context);
  };
  BufferToggleSubscriber2.prototype.openBuffer = function(value) {
    try {
      var closingSelector = this.closingSelector;
      var closingNotifier = closingSelector.call(this, value);
      if (closingNotifier) {
        this.trySubscribe(closingNotifier);
      }
    } catch (err) {
      this._error(err);
    }
  };
  BufferToggleSubscriber2.prototype.closeBuffer = function(context) {
    var contexts = this.contexts;
    if (contexts && context) {
      var buffer2 = context.buffer, subscription = context.subscription;
      this.destination.next(buffer2);
      contexts.splice(contexts.indexOf(context), 1);
      this.remove(subscription);
      subscription.unsubscribe();
    }
  };
  BufferToggleSubscriber2.prototype.trySubscribe = function(closingNotifier) {
    var contexts = this.contexts;
    var buffer2 = [];
    var subscription = new Subscription();
    var context = {
      buffer: buffer2,
      subscription
    };
    contexts.push(context);
    var innerSubscription = subscribeToResult(this, closingNotifier, context);
    if (!innerSubscription || innerSubscription.closed) {
      this.closeBuffer(context);
    } else {
      innerSubscription.context = context;
      this.add(innerSubscription);
      subscription.add(innerSubscription);
    }
  };
  return BufferToggleSubscriber2;
}(OuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/bufferWhen.js
var BufferWhenOperator = function() {
  function BufferWhenOperator2(closingSelector) {
    this.closingSelector = closingSelector;
  }
  BufferWhenOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new BufferWhenSubscriber(subscriber, this.closingSelector));
  };
  return BufferWhenOperator2;
}();
var BufferWhenSubscriber = function(_super) {
  __extends(BufferWhenSubscriber2, _super);
  function BufferWhenSubscriber2(destination, closingSelector) {
    var _this = _super.call(this, destination) || this;
    _this.closingSelector = closingSelector;
    _this.subscribing = false;
    _this.openBuffer();
    return _this;
  }
  BufferWhenSubscriber2.prototype._next = function(value) {
    this.buffer.push(value);
  };
  BufferWhenSubscriber2.prototype._complete = function() {
    var buffer2 = this.buffer;
    if (buffer2) {
      this.destination.next(buffer2);
    }
    _super.prototype._complete.call(this);
  };
  BufferWhenSubscriber2.prototype._unsubscribe = function() {
    this.buffer = void 0;
    this.subscribing = false;
  };
  BufferWhenSubscriber2.prototype.notifyNext = function() {
    this.openBuffer();
  };
  BufferWhenSubscriber2.prototype.notifyComplete = function() {
    if (this.subscribing) {
      this.complete();
    } else {
      this.openBuffer();
    }
  };
  BufferWhenSubscriber2.prototype.openBuffer = function() {
    var closingSubscription = this.closingSubscription;
    if (closingSubscription) {
      this.remove(closingSubscription);
      closingSubscription.unsubscribe();
    }
    var buffer2 = this.buffer;
    if (this.buffer) {
      this.destination.next(buffer2);
    }
    this.buffer = [];
    var closingNotifier;
    try {
      var closingSelector = this.closingSelector;
      closingNotifier = closingSelector();
    } catch (err) {
      return this.error(err);
    }
    closingSubscription = new Subscription();
    this.closingSubscription = closingSubscription;
    this.add(closingSubscription);
    this.subscribing = true;
    closingSubscription.add(innerSubscribe(closingNotifier, new SimpleInnerSubscriber(this)));
    this.subscribing = false;
  };
  return BufferWhenSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/catchError.js
var CatchOperator = function() {
  function CatchOperator2(selector) {
    this.selector = selector;
  }
  CatchOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));
  };
  return CatchOperator2;
}();
var CatchSubscriber = function(_super) {
  __extends(CatchSubscriber2, _super);
  function CatchSubscriber2(destination, selector, caught) {
    var _this = _super.call(this, destination) || this;
    _this.selector = selector;
    _this.caught = caught;
    return _this;
  }
  CatchSubscriber2.prototype.error = function(err) {
    if (!this.isStopped) {
      var result = void 0;
      try {
        result = this.selector(err, this.caught);
      } catch (err2) {
        _super.prototype.error.call(this, err2);
        return;
      }
      this._unsubscribeAndRecycle();
      var innerSubscriber = new SimpleInnerSubscriber(this);
      this.add(innerSubscriber);
      var innerSubscription = innerSubscribe(result, innerSubscriber);
      if (innerSubscription !== innerSubscriber) {
        this.add(innerSubscription);
      }
    }
  };
  return CatchSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/count.js
var CountOperator = function() {
  function CountOperator2(predicate, source) {
    this.predicate = predicate;
    this.source = source;
  }
  CountOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new CountSubscriber(subscriber, this.predicate, this.source));
  };
  return CountOperator2;
}();
var CountSubscriber = function(_super) {
  __extends(CountSubscriber2, _super);
  function CountSubscriber2(destination, predicate, source) {
    var _this = _super.call(this, destination) || this;
    _this.predicate = predicate;
    _this.source = source;
    _this.count = 0;
    _this.index = 0;
    return _this;
  }
  CountSubscriber2.prototype._next = function(value) {
    if (this.predicate) {
      this._tryPredicate(value);
    } else {
      this.count++;
    }
  };
  CountSubscriber2.prototype._tryPredicate = function(value) {
    var result;
    try {
      result = this.predicate(value, this.index++, this.source);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    if (result) {
      this.count++;
    }
  };
  CountSubscriber2.prototype._complete = function() {
    this.destination.next(this.count);
    this.destination.complete();
  };
  return CountSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/debounce.js
var DebounceOperator = function() {
  function DebounceOperator2(durationSelector) {
    this.durationSelector = durationSelector;
  }
  DebounceOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DebounceSubscriber(subscriber, this.durationSelector));
  };
  return DebounceOperator2;
}();
var DebounceSubscriber = function(_super) {
  __extends(DebounceSubscriber2, _super);
  function DebounceSubscriber2(destination, durationSelector) {
    var _this = _super.call(this, destination) || this;
    _this.durationSelector = durationSelector;
    _this.hasValue = false;
    return _this;
  }
  DebounceSubscriber2.prototype._next = function(value) {
    try {
      var result = this.durationSelector.call(this, value);
      if (result) {
        this._tryNext(value, result);
      }
    } catch (err) {
      this.destination.error(err);
    }
  };
  DebounceSubscriber2.prototype._complete = function() {
    this.emitValue();
    this.destination.complete();
  };
  DebounceSubscriber2.prototype._tryNext = function(value, duration) {
    var subscription = this.durationSubscription;
    this.value = value;
    this.hasValue = true;
    if (subscription) {
      subscription.unsubscribe();
      this.remove(subscription);
    }
    subscription = innerSubscribe(duration, new SimpleInnerSubscriber(this));
    if (subscription && !subscription.closed) {
      this.add(this.durationSubscription = subscription);
    }
  };
  DebounceSubscriber2.prototype.notifyNext = function() {
    this.emitValue();
  };
  DebounceSubscriber2.prototype.notifyComplete = function() {
    this.emitValue();
  };
  DebounceSubscriber2.prototype.emitValue = function() {
    if (this.hasValue) {
      var value = this.value;
      var subscription = this.durationSubscription;
      if (subscription) {
        this.durationSubscription = void 0;
        subscription.unsubscribe();
        this.remove(subscription);
      }
      this.value = void 0;
      this.hasValue = false;
      _super.prototype._next.call(this, value);
    }
  };
  return DebounceSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/debounceTime.js
var DebounceTimeOperator = function() {
  function DebounceTimeOperator2(dueTime, scheduler) {
    this.dueTime = dueTime;
    this.scheduler = scheduler;
  }
  DebounceTimeOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler));
  };
  return DebounceTimeOperator2;
}();
var DebounceTimeSubscriber = function(_super) {
  __extends(DebounceTimeSubscriber2, _super);
  function DebounceTimeSubscriber2(destination, dueTime, scheduler) {
    var _this = _super.call(this, destination) || this;
    _this.dueTime = dueTime;
    _this.scheduler = scheduler;
    _this.debouncedSubscription = null;
    _this.lastValue = null;
    _this.hasValue = false;
    return _this;
  }
  DebounceTimeSubscriber2.prototype._next = function(value) {
    this.clearDebounce();
    this.lastValue = value;
    this.hasValue = true;
    this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
  };
  DebounceTimeSubscriber2.prototype._complete = function() {
    this.debouncedNext();
    this.destination.complete();
  };
  DebounceTimeSubscriber2.prototype.debouncedNext = function() {
    this.clearDebounce();
    if (this.hasValue) {
      var lastValue = this.lastValue;
      this.lastValue = null;
      this.hasValue = false;
      this.destination.next(lastValue);
    }
  };
  DebounceTimeSubscriber2.prototype.clearDebounce = function() {
    var debouncedSubscription = this.debouncedSubscription;
    if (debouncedSubscription !== null) {
      this.remove(debouncedSubscription);
      debouncedSubscription.unsubscribe();
      this.debouncedSubscription = null;
    }
  };
  return DebounceTimeSubscriber2;
}(Subscriber);
function dispatchNext(subscriber) {
  subscriber.debouncedNext();
}

// ../../../../node_modules/rxjs/_esm5/internal/operators/defaultIfEmpty.js
var DefaultIfEmptyOperator = function() {
  function DefaultIfEmptyOperator2(defaultValue) {
    this.defaultValue = defaultValue;
  }
  DefaultIfEmptyOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
  };
  return DefaultIfEmptyOperator2;
}();
var DefaultIfEmptySubscriber = function(_super) {
  __extends(DefaultIfEmptySubscriber2, _super);
  function DefaultIfEmptySubscriber2(destination, defaultValue) {
    var _this = _super.call(this, destination) || this;
    _this.defaultValue = defaultValue;
    _this.isEmpty = true;
    return _this;
  }
  DefaultIfEmptySubscriber2.prototype._next = function(value) {
    this.isEmpty = false;
    this.destination.next(value);
  };
  DefaultIfEmptySubscriber2.prototype._complete = function() {
    if (this.isEmpty) {
      this.destination.next(this.defaultValue);
    }
    this.destination.complete();
  };
  return DefaultIfEmptySubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/delay.js
var DelayOperator = function() {
  function DelayOperator2(delay2, scheduler) {
    this.delay = delay2;
    this.scheduler = scheduler;
  }
  DelayOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DelaySubscriber(subscriber, this.delay, this.scheduler));
  };
  return DelayOperator2;
}();
var DelaySubscriber = function(_super) {
  __extends(DelaySubscriber2, _super);
  function DelaySubscriber2(destination, delay2, scheduler) {
    var _this = _super.call(this, destination) || this;
    _this.delay = delay2;
    _this.scheduler = scheduler;
    _this.queue = [];
    _this.active = false;
    _this.errored = false;
    return _this;
  }
  DelaySubscriber2.dispatch = function(state) {
    var source = state.source;
    var queue2 = source.queue;
    var scheduler = state.scheduler;
    var destination = state.destination;
    while (queue2.length > 0 && queue2[0].time - scheduler.now() <= 0) {
      queue2.shift().notification.observe(destination);
    }
    if (queue2.length > 0) {
      var delay_1 = Math.max(0, queue2[0].time - scheduler.now());
      this.schedule(state, delay_1);
    } else {
      this.unsubscribe();
      source.active = false;
    }
  };
  DelaySubscriber2.prototype._schedule = function(scheduler) {
    this.active = true;
    var destination = this.destination;
    destination.add(scheduler.schedule(DelaySubscriber2.dispatch, this.delay, {
      source: this,
      destination: this.destination,
      scheduler
    }));
  };
  DelaySubscriber2.prototype.scheduleNotification = function(notification) {
    if (this.errored === true) {
      return;
    }
    var scheduler = this.scheduler;
    var message = new DelayMessage(scheduler.now() + this.delay, notification);
    this.queue.push(message);
    if (this.active === false) {
      this._schedule(scheduler);
    }
  };
  DelaySubscriber2.prototype._next = function(value) {
    this.scheduleNotification(Notification.createNext(value));
  };
  DelaySubscriber2.prototype._error = function(err) {
    this.errored = true;
    this.queue = [];
    this.destination.error(err);
    this.unsubscribe();
  };
  DelaySubscriber2.prototype._complete = function() {
    this.scheduleNotification(Notification.createComplete());
    this.unsubscribe();
  };
  return DelaySubscriber2;
}(Subscriber);
var DelayMessage = /* @__PURE__ */ function() {
  function DelayMessage2(time, notification) {
    this.time = time;
    this.notification = notification;
  }
  return DelayMessage2;
}();

// ../../../../node_modules/rxjs/_esm5/internal/operators/delayWhen.js
var DelayWhenOperator = function() {
  function DelayWhenOperator2(delayDurationSelector) {
    this.delayDurationSelector = delayDurationSelector;
  }
  DelayWhenOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DelayWhenSubscriber(subscriber, this.delayDurationSelector));
  };
  return DelayWhenOperator2;
}();
var DelayWhenSubscriber = function(_super) {
  __extends(DelayWhenSubscriber2, _super);
  function DelayWhenSubscriber2(destination, delayDurationSelector) {
    var _this = _super.call(this, destination) || this;
    _this.delayDurationSelector = delayDurationSelector;
    _this.completed = false;
    _this.delayNotifierSubscriptions = [];
    _this.index = 0;
    return _this;
  }
  DelayWhenSubscriber2.prototype.notifyNext = function(outerValue, _innerValue, _outerIndex, _innerIndex, innerSub) {
    this.destination.next(outerValue);
    this.removeSubscription(innerSub);
    this.tryComplete();
  };
  DelayWhenSubscriber2.prototype.notifyError = function(error, innerSub) {
    this._error(error);
  };
  DelayWhenSubscriber2.prototype.notifyComplete = function(innerSub) {
    var value = this.removeSubscription(innerSub);
    if (value) {
      this.destination.next(value);
    }
    this.tryComplete();
  };
  DelayWhenSubscriber2.prototype._next = function(value) {
    var index = this.index++;
    try {
      var delayNotifier = this.delayDurationSelector(value, index);
      if (delayNotifier) {
        this.tryDelay(delayNotifier, value);
      }
    } catch (err) {
      this.destination.error(err);
    }
  };
  DelayWhenSubscriber2.prototype._complete = function() {
    this.completed = true;
    this.tryComplete();
    this.unsubscribe();
  };
  DelayWhenSubscriber2.prototype.removeSubscription = function(subscription) {
    subscription.unsubscribe();
    var subscriptionIdx = this.delayNotifierSubscriptions.indexOf(subscription);
    if (subscriptionIdx !== -1) {
      this.delayNotifierSubscriptions.splice(subscriptionIdx, 1);
    }
    return subscription.outerValue;
  };
  DelayWhenSubscriber2.prototype.tryDelay = function(delayNotifier, value) {
    var notifierSubscription = subscribeToResult(this, delayNotifier, value);
    if (notifierSubscription && !notifierSubscription.closed) {
      var destination = this.destination;
      destination.add(notifierSubscription);
      this.delayNotifierSubscriptions.push(notifierSubscription);
    }
  };
  DelayWhenSubscriber2.prototype.tryComplete = function() {
    if (this.completed && this.delayNotifierSubscriptions.length === 0) {
      this.destination.complete();
    }
  };
  return DelayWhenSubscriber2;
}(OuterSubscriber);
var SubscriptionDelayObservable = function(_super) {
  __extends(SubscriptionDelayObservable2, _super);
  function SubscriptionDelayObservable2(source, subscriptionDelay) {
    var _this = _super.call(this) || this;
    _this.source = source;
    _this.subscriptionDelay = subscriptionDelay;
    return _this;
  }
  SubscriptionDelayObservable2.prototype._subscribe = function(subscriber) {
    this.subscriptionDelay.subscribe(new SubscriptionDelaySubscriber(subscriber, this.source));
  };
  return SubscriptionDelayObservable2;
}(Observable);
var SubscriptionDelaySubscriber = function(_super) {
  __extends(SubscriptionDelaySubscriber2, _super);
  function SubscriptionDelaySubscriber2(parent, source) {
    var _this = _super.call(this) || this;
    _this.parent = parent;
    _this.source = source;
    _this.sourceSubscribed = false;
    return _this;
  }
  SubscriptionDelaySubscriber2.prototype._next = function(unused) {
    this.subscribeToSource();
  };
  SubscriptionDelaySubscriber2.prototype._error = function(err) {
    this.unsubscribe();
    this.parent.error(err);
  };
  SubscriptionDelaySubscriber2.prototype._complete = function() {
    this.unsubscribe();
    this.subscribeToSource();
  };
  SubscriptionDelaySubscriber2.prototype.subscribeToSource = function() {
    if (!this.sourceSubscribed) {
      this.sourceSubscribed = true;
      this.unsubscribe();
      this.source.subscribe(this.parent);
    }
  };
  return SubscriptionDelaySubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/dematerialize.js
var DeMaterializeOperator = function() {
  function DeMaterializeOperator2() {
  }
  DeMaterializeOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DeMaterializeSubscriber(subscriber));
  };
  return DeMaterializeOperator2;
}();
var DeMaterializeSubscriber = function(_super) {
  __extends(DeMaterializeSubscriber2, _super);
  function DeMaterializeSubscriber2(destination) {
    return _super.call(this, destination) || this;
  }
  DeMaterializeSubscriber2.prototype._next = function(value) {
    value.observe(this.destination);
  };
  return DeMaterializeSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/distinct.js
var DistinctOperator = function() {
  function DistinctOperator2(keySelector, flushes) {
    this.keySelector = keySelector;
    this.flushes = flushes;
  }
  DistinctOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DistinctSubscriber(subscriber, this.keySelector, this.flushes));
  };
  return DistinctOperator2;
}();
var DistinctSubscriber = function(_super) {
  __extends(DistinctSubscriber2, _super);
  function DistinctSubscriber2(destination, keySelector, flushes) {
    var _this = _super.call(this, destination) || this;
    _this.keySelector = keySelector;
    _this.values = /* @__PURE__ */ new Set();
    if (flushes) {
      _this.add(innerSubscribe(flushes, new SimpleInnerSubscriber(_this)));
    }
    return _this;
  }
  DistinctSubscriber2.prototype.notifyNext = function() {
    this.values.clear();
  };
  DistinctSubscriber2.prototype.notifyError = function(error) {
    this._error(error);
  };
  DistinctSubscriber2.prototype._next = function(value) {
    if (this.keySelector) {
      this._useKeySelector(value);
    } else {
      this._finalizeNext(value, value);
    }
  };
  DistinctSubscriber2.prototype._useKeySelector = function(value) {
    var key;
    var destination = this.destination;
    try {
      key = this.keySelector(value);
    } catch (err) {
      destination.error(err);
      return;
    }
    this._finalizeNext(key, value);
  };
  DistinctSubscriber2.prototype._finalizeNext = function(key, value) {
    var values = this.values;
    if (!values.has(key)) {
      values.add(key);
      this.destination.next(value);
    }
  };
  return DistinctSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/distinctUntilChanged.js
var DistinctUntilChangedOperator = function() {
  function DistinctUntilChangedOperator2(compare, keySelector) {
    this.compare = compare;
    this.keySelector = keySelector;
  }
  DistinctUntilChangedOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));
  };
  return DistinctUntilChangedOperator2;
}();
var DistinctUntilChangedSubscriber = function(_super) {
  __extends(DistinctUntilChangedSubscriber2, _super);
  function DistinctUntilChangedSubscriber2(destination, compare, keySelector) {
    var _this = _super.call(this, destination) || this;
    _this.keySelector = keySelector;
    _this.hasKey = false;
    if (typeof compare === "function") {
      _this.compare = compare;
    }
    return _this;
  }
  DistinctUntilChangedSubscriber2.prototype.compare = function(x, y) {
    return x === y;
  };
  DistinctUntilChangedSubscriber2.prototype._next = function(value) {
    var key;
    try {
      var keySelector = this.keySelector;
      key = keySelector ? keySelector(value) : value;
    } catch (err) {
      return this.destination.error(err);
    }
    var result = false;
    if (this.hasKey) {
      try {
        var compare = this.compare;
        result = compare(this.key, key);
      } catch (err) {
        return this.destination.error(err);
      }
    } else {
      this.hasKey = true;
    }
    if (!result) {
      this.key = key;
      this.destination.next(value);
    }
  };
  return DistinctUntilChangedSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/throwIfEmpty.js
var ThrowIfEmptyOperator = function() {
  function ThrowIfEmptyOperator2(errorFactory) {
    this.errorFactory = errorFactory;
  }
  ThrowIfEmptyOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new ThrowIfEmptySubscriber(subscriber, this.errorFactory));
  };
  return ThrowIfEmptyOperator2;
}();
var ThrowIfEmptySubscriber = function(_super) {
  __extends(ThrowIfEmptySubscriber2, _super);
  function ThrowIfEmptySubscriber2(destination, errorFactory) {
    var _this = _super.call(this, destination) || this;
    _this.errorFactory = errorFactory;
    _this.hasValue = false;
    return _this;
  }
  ThrowIfEmptySubscriber2.prototype._next = function(value) {
    this.hasValue = true;
    this.destination.next(value);
  };
  ThrowIfEmptySubscriber2.prototype._complete = function() {
    if (!this.hasValue) {
      var err = void 0;
      try {
        err = this.errorFactory();
      } catch (e) {
        err = e;
      }
      this.destination.error(err);
    } else {
      return this.destination.complete();
    }
  };
  return ThrowIfEmptySubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/take.js
var TakeOperator = function() {
  function TakeOperator2(total) {
    this.total = total;
    if (this.total < 0) {
      throw new ArgumentOutOfRangeError();
    }
  }
  TakeOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new TakeSubscriber(subscriber, this.total));
  };
  return TakeOperator2;
}();
var TakeSubscriber = function(_super) {
  __extends(TakeSubscriber2, _super);
  function TakeSubscriber2(destination, total) {
    var _this = _super.call(this, destination) || this;
    _this.total = total;
    _this.count = 0;
    return _this;
  }
  TakeSubscriber2.prototype._next = function(value) {
    var total = this.total;
    var count2 = ++this.count;
    if (count2 <= total) {
      this.destination.next(value);
      if (count2 === total) {
        this.destination.complete();
        this.unsubscribe();
      }
    }
  };
  return TakeSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/every.js
var EveryOperator = function() {
  function EveryOperator2(predicate, thisArg, source) {
    this.predicate = predicate;
    this.thisArg = thisArg;
    this.source = source;
  }
  EveryOperator2.prototype.call = function(observer, source) {
    return source.subscribe(new EverySubscriber(observer, this.predicate, this.thisArg, this.source));
  };
  return EveryOperator2;
}();
var EverySubscriber = function(_super) {
  __extends(EverySubscriber2, _super);
  function EverySubscriber2(destination, predicate, thisArg, source) {
    var _this = _super.call(this, destination) || this;
    _this.predicate = predicate;
    _this.thisArg = thisArg;
    _this.source = source;
    _this.index = 0;
    _this.thisArg = thisArg || _this;
    return _this;
  }
  EverySubscriber2.prototype.notifyComplete = function(everyValueMatch) {
    this.destination.next(everyValueMatch);
    this.destination.complete();
  };
  EverySubscriber2.prototype._next = function(value) {
    var result = false;
    try {
      result = this.predicate.call(this.thisArg, value, this.index++, this.source);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    if (!result) {
      this.notifyComplete(false);
    }
  };
  EverySubscriber2.prototype._complete = function() {
    this.notifyComplete(true);
  };
  return EverySubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/exhaust.js
var SwitchFirstOperator = function() {
  function SwitchFirstOperator2() {
  }
  SwitchFirstOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new SwitchFirstSubscriber(subscriber));
  };
  return SwitchFirstOperator2;
}();
var SwitchFirstSubscriber = function(_super) {
  __extends(SwitchFirstSubscriber2, _super);
  function SwitchFirstSubscriber2(destination) {
    var _this = _super.call(this, destination) || this;
    _this.hasCompleted = false;
    _this.hasSubscription = false;
    return _this;
  }
  SwitchFirstSubscriber2.prototype._next = function(value) {
    if (!this.hasSubscription) {
      this.hasSubscription = true;
      this.add(innerSubscribe(value, new SimpleInnerSubscriber(this)));
    }
  };
  SwitchFirstSubscriber2.prototype._complete = function() {
    this.hasCompleted = true;
    if (!this.hasSubscription) {
      this.destination.complete();
    }
  };
  SwitchFirstSubscriber2.prototype.notifyComplete = function() {
    this.hasSubscription = false;
    if (this.hasCompleted) {
      this.destination.complete();
    }
  };
  return SwitchFirstSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/exhaustMap.js
var ExhaustMapOperator = function() {
  function ExhaustMapOperator2(project) {
    this.project = project;
  }
  ExhaustMapOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new ExhaustMapSubscriber(subscriber, this.project));
  };
  return ExhaustMapOperator2;
}();
var ExhaustMapSubscriber = function(_super) {
  __extends(ExhaustMapSubscriber2, _super);
  function ExhaustMapSubscriber2(destination, project) {
    var _this = _super.call(this, destination) || this;
    _this.project = project;
    _this.hasSubscription = false;
    _this.hasCompleted = false;
    _this.index = 0;
    return _this;
  }
  ExhaustMapSubscriber2.prototype._next = function(value) {
    if (!this.hasSubscription) {
      this.tryNext(value);
    }
  };
  ExhaustMapSubscriber2.prototype.tryNext = function(value) {
    var result;
    var index = this.index++;
    try {
      result = this.project(value, index);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.hasSubscription = true;
    this._innerSub(result);
  };
  ExhaustMapSubscriber2.prototype._innerSub = function(result) {
    var innerSubscriber = new SimpleInnerSubscriber(this);
    var destination = this.destination;
    destination.add(innerSubscriber);
    var innerSubscription = innerSubscribe(result, innerSubscriber);
    if (innerSubscription !== innerSubscriber) {
      destination.add(innerSubscription);
    }
  };
  ExhaustMapSubscriber2.prototype._complete = function() {
    this.hasCompleted = true;
    if (!this.hasSubscription) {
      this.destination.complete();
    }
    this.unsubscribe();
  };
  ExhaustMapSubscriber2.prototype.notifyNext = function(innerValue) {
    this.destination.next(innerValue);
  };
  ExhaustMapSubscriber2.prototype.notifyError = function(err) {
    this.destination.error(err);
  };
  ExhaustMapSubscriber2.prototype.notifyComplete = function() {
    this.hasSubscription = false;
    if (this.hasCompleted) {
      this.destination.complete();
    }
  };
  return ExhaustMapSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/expand.js
var ExpandOperator = function() {
  function ExpandOperator2(project, concurrent, scheduler) {
    this.project = project;
    this.concurrent = concurrent;
    this.scheduler = scheduler;
  }
  ExpandOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new ExpandSubscriber(subscriber, this.project, this.concurrent, this.scheduler));
  };
  return ExpandOperator2;
}();
var ExpandSubscriber = function(_super) {
  __extends(ExpandSubscriber2, _super);
  function ExpandSubscriber2(destination, project, concurrent, scheduler) {
    var _this = _super.call(this, destination) || this;
    _this.project = project;
    _this.concurrent = concurrent;
    _this.scheduler = scheduler;
    _this.index = 0;
    _this.active = 0;
    _this.hasCompleted = false;
    if (concurrent < Number.POSITIVE_INFINITY) {
      _this.buffer = [];
    }
    return _this;
  }
  ExpandSubscriber2.dispatch = function(arg) {
    var subscriber = arg.subscriber, result = arg.result, value = arg.value, index = arg.index;
    subscriber.subscribeToProjection(result, value, index);
  };
  ExpandSubscriber2.prototype._next = function(value) {
    var destination = this.destination;
    if (destination.closed) {
      this._complete();
      return;
    }
    var index = this.index++;
    if (this.active < this.concurrent) {
      destination.next(value);
      try {
        var project = this.project;
        var result = project(value, index);
        if (!this.scheduler) {
          this.subscribeToProjection(result, value, index);
        } else {
          var state = {
            subscriber: this,
            result,
            value,
            index
          };
          var destination_1 = this.destination;
          destination_1.add(this.scheduler.schedule(ExpandSubscriber2.dispatch, 0, state));
        }
      } catch (e) {
        destination.error(e);
      }
    } else {
      this.buffer.push(value);
    }
  };
  ExpandSubscriber2.prototype.subscribeToProjection = function(result, value, index) {
    this.active++;
    var destination = this.destination;
    destination.add(innerSubscribe(result, new SimpleInnerSubscriber(this)));
  };
  ExpandSubscriber2.prototype._complete = function() {
    this.hasCompleted = true;
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
    this.unsubscribe();
  };
  ExpandSubscriber2.prototype.notifyNext = function(innerValue) {
    this._next(innerValue);
  };
  ExpandSubscriber2.prototype.notifyComplete = function() {
    var buffer2 = this.buffer;
    this.active--;
    if (buffer2 && buffer2.length > 0) {
      this._next(buffer2.shift());
    }
    if (this.hasCompleted && this.active === 0) {
      this.destination.complete();
    }
  };
  return ExpandSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/finalize.js
var FinallyOperator = function() {
  function FinallyOperator2(callback) {
    this.callback = callback;
  }
  FinallyOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new FinallySubscriber(subscriber, this.callback));
  };
  return FinallyOperator2;
}();
var FinallySubscriber = function(_super) {
  __extends(FinallySubscriber2, _super);
  function FinallySubscriber2(destination, callback) {
    var _this = _super.call(this, destination) || this;
    _this.add(new Subscription(callback));
    return _this;
  }
  return FinallySubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/find.js
var FindValueOperator = function() {
  function FindValueOperator2(predicate, source, yieldIndex, thisArg) {
    this.predicate = predicate;
    this.source = source;
    this.yieldIndex = yieldIndex;
    this.thisArg = thisArg;
  }
  FindValueOperator2.prototype.call = function(observer, source) {
    return source.subscribe(new FindValueSubscriber(observer, this.predicate, this.source, this.yieldIndex, this.thisArg));
  };
  return FindValueOperator2;
}();
var FindValueSubscriber = function(_super) {
  __extends(FindValueSubscriber2, _super);
  function FindValueSubscriber2(destination, predicate, source, yieldIndex, thisArg) {
    var _this = _super.call(this, destination) || this;
    _this.predicate = predicate;
    _this.source = source;
    _this.yieldIndex = yieldIndex;
    _this.thisArg = thisArg;
    _this.index = 0;
    return _this;
  }
  FindValueSubscriber2.prototype.notifyComplete = function(value) {
    var destination = this.destination;
    destination.next(value);
    destination.complete();
    this.unsubscribe();
  };
  FindValueSubscriber2.prototype._next = function(value) {
    var _a = this, predicate = _a.predicate, thisArg = _a.thisArg;
    var index = this.index++;
    try {
      var result = predicate.call(thisArg || this, value, index, this.source);
      if (result) {
        this.notifyComplete(this.yieldIndex ? index : value);
      }
    } catch (err) {
      this.destination.error(err);
    }
  };
  FindValueSubscriber2.prototype._complete = function() {
    this.notifyComplete(this.yieldIndex ? -1 : void 0);
  };
  return FindValueSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/ignoreElements.js
var IgnoreElementsOperator = function() {
  function IgnoreElementsOperator2() {
  }
  IgnoreElementsOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new IgnoreElementsSubscriber(subscriber));
  };
  return IgnoreElementsOperator2;
}();
var IgnoreElementsSubscriber = function(_super) {
  __extends(IgnoreElementsSubscriber2, _super);
  function IgnoreElementsSubscriber2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  IgnoreElementsSubscriber2.prototype._next = function(unused) {
  };
  return IgnoreElementsSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/isEmpty.js
var IsEmptyOperator = function() {
  function IsEmptyOperator2() {
  }
  IsEmptyOperator2.prototype.call = function(observer, source) {
    return source.subscribe(new IsEmptySubscriber(observer));
  };
  return IsEmptyOperator2;
}();
var IsEmptySubscriber = function(_super) {
  __extends(IsEmptySubscriber2, _super);
  function IsEmptySubscriber2(destination) {
    return _super.call(this, destination) || this;
  }
  IsEmptySubscriber2.prototype.notifyComplete = function(isEmpty2) {
    var destination = this.destination;
    destination.next(isEmpty2);
    destination.complete();
  };
  IsEmptySubscriber2.prototype._next = function(value) {
    this.notifyComplete(false);
  };
  IsEmptySubscriber2.prototype._complete = function() {
    this.notifyComplete(true);
  };
  return IsEmptySubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/takeLast.js
var TakeLastOperator = function() {
  function TakeLastOperator2(total) {
    this.total = total;
    if (this.total < 0) {
      throw new ArgumentOutOfRangeError();
    }
  }
  TakeLastOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new TakeLastSubscriber(subscriber, this.total));
  };
  return TakeLastOperator2;
}();
var TakeLastSubscriber = function(_super) {
  __extends(TakeLastSubscriber2, _super);
  function TakeLastSubscriber2(destination, total) {
    var _this = _super.call(this, destination) || this;
    _this.total = total;
    _this.ring = new Array();
    _this.count = 0;
    return _this;
  }
  TakeLastSubscriber2.prototype._next = function(value) {
    var ring = this.ring;
    var total = this.total;
    var count2 = this.count++;
    if (ring.length < total) {
      ring.push(value);
    } else {
      var index = count2 % total;
      ring[index] = value;
    }
  };
  TakeLastSubscriber2.prototype._complete = function() {
    var destination = this.destination;
    var count2 = this.count;
    if (count2 > 0) {
      var total = this.count >= this.total ? this.total : this.count;
      var ring = this.ring;
      for (var i = 0; i < total; i++) {
        var idx = count2++ % total;
        destination.next(ring[idx]);
      }
    }
    destination.complete();
  };
  return TakeLastSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/mapTo.js
var MapToOperator = function() {
  function MapToOperator2(value) {
    this.value = value;
  }
  MapToOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new MapToSubscriber(subscriber, this.value));
  };
  return MapToOperator2;
}();
var MapToSubscriber = function(_super) {
  __extends(MapToSubscriber2, _super);
  function MapToSubscriber2(destination, value) {
    var _this = _super.call(this, destination) || this;
    _this.value = value;
    return _this;
  }
  MapToSubscriber2.prototype._next = function(x) {
    this.destination.next(this.value);
  };
  return MapToSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/materialize.js
var MaterializeOperator = function() {
  function MaterializeOperator2() {
  }
  MaterializeOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new MaterializeSubscriber(subscriber));
  };
  return MaterializeOperator2;
}();
var MaterializeSubscriber = function(_super) {
  __extends(MaterializeSubscriber2, _super);
  function MaterializeSubscriber2(destination) {
    return _super.call(this, destination) || this;
  }
  MaterializeSubscriber2.prototype._next = function(value) {
    this.destination.next(Notification.createNext(value));
  };
  MaterializeSubscriber2.prototype._error = function(err) {
    var destination = this.destination;
    destination.next(Notification.createError(err));
    destination.complete();
  };
  MaterializeSubscriber2.prototype._complete = function() {
    var destination = this.destination;
    destination.next(Notification.createComplete());
    destination.complete();
  };
  return MaterializeSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/scan.js
var ScanOperator = function() {
  function ScanOperator2(accumulator, seed, hasSeed) {
    if (hasSeed === void 0) {
      hasSeed = false;
    }
    this.accumulator = accumulator;
    this.seed = seed;
    this.hasSeed = hasSeed;
  }
  ScanOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new ScanSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));
  };
  return ScanOperator2;
}();
var ScanSubscriber = function(_super) {
  __extends(ScanSubscriber2, _super);
  function ScanSubscriber2(destination, accumulator, _seed, hasSeed) {
    var _this = _super.call(this, destination) || this;
    _this.accumulator = accumulator;
    _this._seed = _seed;
    _this.hasSeed = hasSeed;
    _this.index = 0;
    return _this;
  }
  Object.defineProperty(ScanSubscriber2.prototype, "seed", {
    get: function() {
      return this._seed;
    },
    set: function(value) {
      this.hasSeed = true;
      this._seed = value;
    },
    enumerable: true,
    configurable: true
  });
  ScanSubscriber2.prototype._next = function(value) {
    if (!this.hasSeed) {
      this.seed = value;
      this.destination.next(value);
    } else {
      return this._tryNext(value);
    }
  };
  ScanSubscriber2.prototype._tryNext = function(value) {
    var index = this.index++;
    var result;
    try {
      result = this.accumulator(this.seed, value, index);
    } catch (err) {
      this.destination.error(err);
    }
    this.seed = result;
    this.destination.next(result);
  };
  return ScanSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/mergeScan.js
var MergeScanOperator = function() {
  function MergeScanOperator2(accumulator, seed, concurrent) {
    this.accumulator = accumulator;
    this.seed = seed;
    this.concurrent = concurrent;
  }
  MergeScanOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new MergeScanSubscriber(subscriber, this.accumulator, this.seed, this.concurrent));
  };
  return MergeScanOperator2;
}();
var MergeScanSubscriber = function(_super) {
  __extends(MergeScanSubscriber2, _super);
  function MergeScanSubscriber2(destination, accumulator, acc, concurrent) {
    var _this = _super.call(this, destination) || this;
    _this.accumulator = accumulator;
    _this.acc = acc;
    _this.concurrent = concurrent;
    _this.hasValue = false;
    _this.hasCompleted = false;
    _this.buffer = [];
    _this.active = 0;
    _this.index = 0;
    return _this;
  }
  MergeScanSubscriber2.prototype._next = function(value) {
    if (this.active < this.concurrent) {
      var index = this.index++;
      var destination = this.destination;
      var ish = void 0;
      try {
        var accumulator = this.accumulator;
        ish = accumulator(this.acc, value, index);
      } catch (e) {
        return destination.error(e);
      }
      this.active++;
      this._innerSub(ish);
    } else {
      this.buffer.push(value);
    }
  };
  MergeScanSubscriber2.prototype._innerSub = function(ish) {
    var innerSubscriber = new SimpleInnerSubscriber(this);
    var destination = this.destination;
    destination.add(innerSubscriber);
    var innerSubscription = innerSubscribe(ish, innerSubscriber);
    if (innerSubscription !== innerSubscriber) {
      destination.add(innerSubscription);
    }
  };
  MergeScanSubscriber2.prototype._complete = function() {
    this.hasCompleted = true;
    if (this.active === 0 && this.buffer.length === 0) {
      if (this.hasValue === false) {
        this.destination.next(this.acc);
      }
      this.destination.complete();
    }
    this.unsubscribe();
  };
  MergeScanSubscriber2.prototype.notifyNext = function(innerValue) {
    var destination = this.destination;
    this.acc = innerValue;
    this.hasValue = true;
    destination.next(innerValue);
  };
  MergeScanSubscriber2.prototype.notifyComplete = function() {
    var buffer2 = this.buffer;
    this.active--;
    if (buffer2.length > 0) {
      this._next(buffer2.shift());
    } else if (this.active === 0 && this.hasCompleted) {
      if (this.hasValue === false) {
        this.destination.next(this.acc);
      }
      this.destination.complete();
    }
  };
  return MergeScanSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/multicast.js
function multicast(subjectOrSubjectFactory, selector) {
  return function multicastOperatorFunction(source) {
    var subjectFactory;
    if (typeof subjectOrSubjectFactory === "function") {
      subjectFactory = subjectOrSubjectFactory;
    } else {
      subjectFactory = function subjectFactory2() {
        return subjectOrSubjectFactory;
      };
    }
    if (typeof selector === "function") {
      return source.lift(new MulticastOperator(subjectFactory, selector));
    }
    var connectable = Object.create(source, connectableObservableDescriptor);
    connectable.source = source;
    connectable.subjectFactory = subjectFactory;
    return connectable;
  };
}
var MulticastOperator = function() {
  function MulticastOperator2(subjectFactory, selector) {
    this.subjectFactory = subjectFactory;
    this.selector = selector;
  }
  MulticastOperator2.prototype.call = function(subscriber, source) {
    var selector = this.selector;
    var subject = this.subjectFactory();
    var subscription = selector(subject).subscribe(subscriber);
    subscription.add(source.subscribe(subject));
    return subscription;
  };
  return MulticastOperator2;
}();

// ../../../../node_modules/rxjs/_esm5/internal/operators/onErrorResumeNext.js
var OnErrorResumeNextOperator = function() {
  function OnErrorResumeNextOperator2(nextSources) {
    this.nextSources = nextSources;
  }
  OnErrorResumeNextOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new OnErrorResumeNextSubscriber(subscriber, this.nextSources));
  };
  return OnErrorResumeNextOperator2;
}();
var OnErrorResumeNextSubscriber = function(_super) {
  __extends(OnErrorResumeNextSubscriber2, _super);
  function OnErrorResumeNextSubscriber2(destination, nextSources) {
    var _this = _super.call(this, destination) || this;
    _this.destination = destination;
    _this.nextSources = nextSources;
    return _this;
  }
  OnErrorResumeNextSubscriber2.prototype.notifyError = function() {
    this.subscribeToNextSource();
  };
  OnErrorResumeNextSubscriber2.prototype.notifyComplete = function() {
    this.subscribeToNextSource();
  };
  OnErrorResumeNextSubscriber2.prototype._error = function(err) {
    this.subscribeToNextSource();
    this.unsubscribe();
  };
  OnErrorResumeNextSubscriber2.prototype._complete = function() {
    this.subscribeToNextSource();
    this.unsubscribe();
  };
  OnErrorResumeNextSubscriber2.prototype.subscribeToNextSource = function() {
    var next = this.nextSources.shift();
    if (!!next) {
      var innerSubscriber = new SimpleInnerSubscriber(this);
      var destination = this.destination;
      destination.add(innerSubscriber);
      var innerSubscription = innerSubscribe(next, innerSubscriber);
      if (innerSubscription !== innerSubscriber) {
        destination.add(innerSubscription);
      }
    } else {
      this.destination.complete();
    }
  };
  return OnErrorResumeNextSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/pairwise.js
var PairwiseOperator = function() {
  function PairwiseOperator2() {
  }
  PairwiseOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new PairwiseSubscriber(subscriber));
  };
  return PairwiseOperator2;
}();
var PairwiseSubscriber = function(_super) {
  __extends(PairwiseSubscriber2, _super);
  function PairwiseSubscriber2(destination) {
    var _this = _super.call(this, destination) || this;
    _this.hasPrev = false;
    return _this;
  }
  PairwiseSubscriber2.prototype._next = function(value) {
    var pair;
    if (this.hasPrev) {
      pair = [this.prev, value];
    } else {
      this.hasPrev = true;
    }
    this.prev = value;
    if (pair) {
      this.destination.next(pair);
    }
  };
  return PairwiseSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/repeat.js
var RepeatOperator = function() {
  function RepeatOperator2(count2, source) {
    this.count = count2;
    this.source = source;
  }
  RepeatOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new RepeatSubscriber(subscriber, this.count, this.source));
  };
  return RepeatOperator2;
}();
var RepeatSubscriber = function(_super) {
  __extends(RepeatSubscriber2, _super);
  function RepeatSubscriber2(destination, count2, source) {
    var _this = _super.call(this, destination) || this;
    _this.count = count2;
    _this.source = source;
    return _this;
  }
  RepeatSubscriber2.prototype.complete = function() {
    if (!this.isStopped) {
      var _a = this, source = _a.source, count2 = _a.count;
      if (count2 === 0) {
        return _super.prototype.complete.call(this);
      } else if (count2 > -1) {
        this.count = count2 - 1;
      }
      source.subscribe(this._unsubscribeAndRecycle());
    }
  };
  return RepeatSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/repeatWhen.js
var RepeatWhenOperator = function() {
  function RepeatWhenOperator2(notifier) {
    this.notifier = notifier;
  }
  RepeatWhenOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new RepeatWhenSubscriber(subscriber, this.notifier, source));
  };
  return RepeatWhenOperator2;
}();
var RepeatWhenSubscriber = function(_super) {
  __extends(RepeatWhenSubscriber2, _super);
  function RepeatWhenSubscriber2(destination, notifier, source) {
    var _this = _super.call(this, destination) || this;
    _this.notifier = notifier;
    _this.source = source;
    _this.sourceIsBeingSubscribedTo = true;
    return _this;
  }
  RepeatWhenSubscriber2.prototype.notifyNext = function() {
    this.sourceIsBeingSubscribedTo = true;
    this.source.subscribe(this);
  };
  RepeatWhenSubscriber2.prototype.notifyComplete = function() {
    if (this.sourceIsBeingSubscribedTo === false) {
      return _super.prototype.complete.call(this);
    }
  };
  RepeatWhenSubscriber2.prototype.complete = function() {
    this.sourceIsBeingSubscribedTo = false;
    if (!this.isStopped) {
      if (!this.retries) {
        this.subscribeToRetries();
      }
      if (!this.retriesSubscription || this.retriesSubscription.closed) {
        return _super.prototype.complete.call(this);
      }
      this._unsubscribeAndRecycle();
      this.notifications.next(void 0);
    }
  };
  RepeatWhenSubscriber2.prototype._unsubscribe = function() {
    var _a = this, notifications = _a.notifications, retriesSubscription = _a.retriesSubscription;
    if (notifications) {
      notifications.unsubscribe();
      this.notifications = void 0;
    }
    if (retriesSubscription) {
      retriesSubscription.unsubscribe();
      this.retriesSubscription = void 0;
    }
    this.retries = void 0;
  };
  RepeatWhenSubscriber2.prototype._unsubscribeAndRecycle = function() {
    var _unsubscribe = this._unsubscribe;
    this._unsubscribe = null;
    _super.prototype._unsubscribeAndRecycle.call(this);
    this._unsubscribe = _unsubscribe;
    return this;
  };
  RepeatWhenSubscriber2.prototype.subscribeToRetries = function() {
    this.notifications = new Subject();
    var retries;
    try {
      var notifier = this.notifier;
      retries = notifier(this.notifications);
    } catch (e) {
      return _super.prototype.complete.call(this);
    }
    this.retries = retries;
    this.retriesSubscription = innerSubscribe(retries, new SimpleInnerSubscriber(this));
  };
  return RepeatWhenSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/retry.js
var RetryOperator = function() {
  function RetryOperator2(count2, source) {
    this.count = count2;
    this.source = source;
  }
  RetryOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new RetrySubscriber(subscriber, this.count, this.source));
  };
  return RetryOperator2;
}();
var RetrySubscriber = function(_super) {
  __extends(RetrySubscriber2, _super);
  function RetrySubscriber2(destination, count2, source) {
    var _this = _super.call(this, destination) || this;
    _this.count = count2;
    _this.source = source;
    return _this;
  }
  RetrySubscriber2.prototype.error = function(err) {
    if (!this.isStopped) {
      var _a = this, source = _a.source, count2 = _a.count;
      if (count2 === 0) {
        return _super.prototype.error.call(this, err);
      } else if (count2 > -1) {
        this.count = count2 - 1;
      }
      source.subscribe(this._unsubscribeAndRecycle());
    }
  };
  return RetrySubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/retryWhen.js
var RetryWhenOperator = function() {
  function RetryWhenOperator2(notifier, source) {
    this.notifier = notifier;
    this.source = source;
  }
  RetryWhenOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new RetryWhenSubscriber(subscriber, this.notifier, this.source));
  };
  return RetryWhenOperator2;
}();
var RetryWhenSubscriber = function(_super) {
  __extends(RetryWhenSubscriber2, _super);
  function RetryWhenSubscriber2(destination, notifier, source) {
    var _this = _super.call(this, destination) || this;
    _this.notifier = notifier;
    _this.source = source;
    return _this;
  }
  RetryWhenSubscriber2.prototype.error = function(err) {
    if (!this.isStopped) {
      var errors = this.errors;
      var retries = this.retries;
      var retriesSubscription = this.retriesSubscription;
      if (!retries) {
        errors = new Subject();
        try {
          var notifier = this.notifier;
          retries = notifier(errors);
        } catch (e) {
          return _super.prototype.error.call(this, e);
        }
        retriesSubscription = innerSubscribe(retries, new SimpleInnerSubscriber(this));
      } else {
        this.errors = void 0;
        this.retriesSubscription = void 0;
      }
      this._unsubscribeAndRecycle();
      this.errors = errors;
      this.retries = retries;
      this.retriesSubscription = retriesSubscription;
      errors.next(err);
    }
  };
  RetryWhenSubscriber2.prototype._unsubscribe = function() {
    var _a = this, errors = _a.errors, retriesSubscription = _a.retriesSubscription;
    if (errors) {
      errors.unsubscribe();
      this.errors = void 0;
    }
    if (retriesSubscription) {
      retriesSubscription.unsubscribe();
      this.retriesSubscription = void 0;
    }
    this.retries = void 0;
  };
  RetryWhenSubscriber2.prototype.notifyNext = function() {
    var _unsubscribe = this._unsubscribe;
    this._unsubscribe = null;
    this._unsubscribeAndRecycle();
    this._unsubscribe = _unsubscribe;
    this.source.subscribe(this);
  };
  return RetryWhenSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/sample.js
var SampleOperator = function() {
  function SampleOperator2(notifier) {
    this.notifier = notifier;
  }
  SampleOperator2.prototype.call = function(subscriber, source) {
    var sampleSubscriber = new SampleSubscriber(subscriber);
    var subscription = source.subscribe(sampleSubscriber);
    subscription.add(innerSubscribe(this.notifier, new SimpleInnerSubscriber(sampleSubscriber)));
    return subscription;
  };
  return SampleOperator2;
}();
var SampleSubscriber = function(_super) {
  __extends(SampleSubscriber2, _super);
  function SampleSubscriber2() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.hasValue = false;
    return _this;
  }
  SampleSubscriber2.prototype._next = function(value) {
    this.value = value;
    this.hasValue = true;
  };
  SampleSubscriber2.prototype.notifyNext = function() {
    this.emitValue();
  };
  SampleSubscriber2.prototype.notifyComplete = function() {
    this.emitValue();
  };
  SampleSubscriber2.prototype.emitValue = function() {
    if (this.hasValue) {
      this.hasValue = false;
      this.destination.next(this.value);
    }
  };
  return SampleSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/sampleTime.js
var SampleTimeOperator = function() {
  function SampleTimeOperator2(period, scheduler) {
    this.period = period;
    this.scheduler = scheduler;
  }
  SampleTimeOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new SampleTimeSubscriber(subscriber, this.period, this.scheduler));
  };
  return SampleTimeOperator2;
}();
var SampleTimeSubscriber = function(_super) {
  __extends(SampleTimeSubscriber2, _super);
  function SampleTimeSubscriber2(destination, period, scheduler) {
    var _this = _super.call(this, destination) || this;
    _this.period = period;
    _this.scheduler = scheduler;
    _this.hasValue = false;
    _this.add(scheduler.schedule(dispatchNotification, period, {
      subscriber: _this,
      period
    }));
    return _this;
  }
  SampleTimeSubscriber2.prototype._next = function(value) {
    this.lastValue = value;
    this.hasValue = true;
  };
  SampleTimeSubscriber2.prototype.notifyNext = function() {
    if (this.hasValue) {
      this.hasValue = false;
      this.destination.next(this.lastValue);
    }
  };
  return SampleTimeSubscriber2;
}(Subscriber);
function dispatchNotification(state) {
  var subscriber = state.subscriber, period = state.period;
  subscriber.notifyNext();
  this.schedule(state, period);
}

// ../../../../node_modules/rxjs/_esm5/internal/operators/sequenceEqual.js
var SequenceEqualOperator = function() {
  function SequenceEqualOperator2(compareTo, comparator) {
    this.compareTo = compareTo;
    this.comparator = comparator;
  }
  SequenceEqualOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new SequenceEqualSubscriber(subscriber, this.compareTo, this.comparator));
  };
  return SequenceEqualOperator2;
}();
var SequenceEqualSubscriber = function(_super) {
  __extends(SequenceEqualSubscriber2, _super);
  function SequenceEqualSubscriber2(destination, compareTo, comparator) {
    var _this = _super.call(this, destination) || this;
    _this.compareTo = compareTo;
    _this.comparator = comparator;
    _this._a = [];
    _this._b = [];
    _this._oneComplete = false;
    _this.destination.add(compareTo.subscribe(new SequenceEqualCompareToSubscriber(destination, _this)));
    return _this;
  }
  SequenceEqualSubscriber2.prototype._next = function(value) {
    if (this._oneComplete && this._b.length === 0) {
      this.emit(false);
    } else {
      this._a.push(value);
      this.checkValues();
    }
  };
  SequenceEqualSubscriber2.prototype._complete = function() {
    if (this._oneComplete) {
      this.emit(this._a.length === 0 && this._b.length === 0);
    } else {
      this._oneComplete = true;
    }
    this.unsubscribe();
  };
  SequenceEqualSubscriber2.prototype.checkValues = function() {
    var _c = this, _a = _c._a, _b = _c._b, comparator = _c.comparator;
    while (_a.length > 0 && _b.length > 0) {
      var a = _a.shift();
      var b = _b.shift();
      var areEqual = false;
      try {
        areEqual = comparator ? comparator(a, b) : a === b;
      } catch (e) {
        this.destination.error(e);
      }
      if (!areEqual) {
        this.emit(false);
      }
    }
  };
  SequenceEqualSubscriber2.prototype.emit = function(value) {
    var destination = this.destination;
    destination.next(value);
    destination.complete();
  };
  SequenceEqualSubscriber2.prototype.nextB = function(value) {
    if (this._oneComplete && this._a.length === 0) {
      this.emit(false);
    } else {
      this._b.push(value);
      this.checkValues();
    }
  };
  SequenceEqualSubscriber2.prototype.completeB = function() {
    if (this._oneComplete) {
      this.emit(this._a.length === 0 && this._b.length === 0);
    } else {
      this._oneComplete = true;
    }
  };
  return SequenceEqualSubscriber2;
}(Subscriber);
var SequenceEqualCompareToSubscriber = function(_super) {
  __extends(SequenceEqualCompareToSubscriber2, _super);
  function SequenceEqualCompareToSubscriber2(destination, parent) {
    var _this = _super.call(this, destination) || this;
    _this.parent = parent;
    return _this;
  }
  SequenceEqualCompareToSubscriber2.prototype._next = function(value) {
    this.parent.nextB(value);
  };
  SequenceEqualCompareToSubscriber2.prototype._error = function(err) {
    this.parent.error(err);
    this.unsubscribe();
  };
  SequenceEqualCompareToSubscriber2.prototype._complete = function() {
    this.parent.completeB();
    this.unsubscribe();
  };
  return SequenceEqualCompareToSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/share.js
function shareSubjectFactory() {
  return new Subject();
}
function share() {
  return function(source) {
    return refCount()(multicast(shareSubjectFactory)(source));
  };
}

// ../../../../node_modules/rxjs/_esm5/internal/operators/single.js
var SingleOperator = function() {
  function SingleOperator2(predicate, source) {
    this.predicate = predicate;
    this.source = source;
  }
  SingleOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new SingleSubscriber(subscriber, this.predicate, this.source));
  };
  return SingleOperator2;
}();
var SingleSubscriber = function(_super) {
  __extends(SingleSubscriber2, _super);
  function SingleSubscriber2(destination, predicate, source) {
    var _this = _super.call(this, destination) || this;
    _this.predicate = predicate;
    _this.source = source;
    _this.seenValue = false;
    _this.index = 0;
    return _this;
  }
  SingleSubscriber2.prototype.applySingleValue = function(value) {
    if (this.seenValue) {
      this.destination.error("Sequence contains more than one element");
    } else {
      this.seenValue = true;
      this.singleValue = value;
    }
  };
  SingleSubscriber2.prototype._next = function(value) {
    var index = this.index++;
    if (this.predicate) {
      this.tryNext(value, index);
    } else {
      this.applySingleValue(value);
    }
  };
  SingleSubscriber2.prototype.tryNext = function(value, index) {
    try {
      if (this.predicate(value, index, this.source)) {
        this.applySingleValue(value);
      }
    } catch (err) {
      this.destination.error(err);
    }
  };
  SingleSubscriber2.prototype._complete = function() {
    var destination = this.destination;
    if (this.index > 0) {
      destination.next(this.seenValue ? this.singleValue : void 0);
      destination.complete();
    } else {
      destination.error(new EmptyError());
    }
  };
  return SingleSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/skip.js
var SkipOperator = function() {
  function SkipOperator2(total) {
    this.total = total;
  }
  SkipOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new SkipSubscriber(subscriber, this.total));
  };
  return SkipOperator2;
}();
var SkipSubscriber = function(_super) {
  __extends(SkipSubscriber2, _super);
  function SkipSubscriber2(destination, total) {
    var _this = _super.call(this, destination) || this;
    _this.total = total;
    _this.count = 0;
    return _this;
  }
  SkipSubscriber2.prototype._next = function(x) {
    if (++this.count > this.total) {
      this.destination.next(x);
    }
  };
  return SkipSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/skipLast.js
var SkipLastOperator = function() {
  function SkipLastOperator2(_skipCount) {
    this._skipCount = _skipCount;
    if (this._skipCount < 0) {
      throw new ArgumentOutOfRangeError();
    }
  }
  SkipLastOperator2.prototype.call = function(subscriber, source) {
    if (this._skipCount === 0) {
      return source.subscribe(new Subscriber(subscriber));
    } else {
      return source.subscribe(new SkipLastSubscriber(subscriber, this._skipCount));
    }
  };
  return SkipLastOperator2;
}();
var SkipLastSubscriber = function(_super) {
  __extends(SkipLastSubscriber2, _super);
  function SkipLastSubscriber2(destination, _skipCount) {
    var _this = _super.call(this, destination) || this;
    _this._skipCount = _skipCount;
    _this._count = 0;
    _this._ring = new Array(_skipCount);
    return _this;
  }
  SkipLastSubscriber2.prototype._next = function(value) {
    var skipCount = this._skipCount;
    var count2 = this._count++;
    if (count2 < skipCount) {
      this._ring[count2] = value;
    } else {
      var currentIndex = count2 % skipCount;
      var ring = this._ring;
      var oldValue = ring[currentIndex];
      ring[currentIndex] = value;
      this.destination.next(oldValue);
    }
  };
  return SkipLastSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/skipUntil.js
var SkipUntilOperator = function() {
  function SkipUntilOperator2(notifier) {
    this.notifier = notifier;
  }
  SkipUntilOperator2.prototype.call = function(destination, source) {
    return source.subscribe(new SkipUntilSubscriber(destination, this.notifier));
  };
  return SkipUntilOperator2;
}();
var SkipUntilSubscriber = function(_super) {
  __extends(SkipUntilSubscriber2, _super);
  function SkipUntilSubscriber2(destination, notifier) {
    var _this = _super.call(this, destination) || this;
    _this.hasValue = false;
    var innerSubscriber = new SimpleInnerSubscriber(_this);
    _this.add(innerSubscriber);
    _this.innerSubscription = innerSubscriber;
    var innerSubscription = innerSubscribe(notifier, innerSubscriber);
    if (innerSubscription !== innerSubscriber) {
      _this.add(innerSubscription);
      _this.innerSubscription = innerSubscription;
    }
    return _this;
  }
  SkipUntilSubscriber2.prototype._next = function(value) {
    if (this.hasValue) {
      _super.prototype._next.call(this, value);
    }
  };
  SkipUntilSubscriber2.prototype.notifyNext = function() {
    this.hasValue = true;
    if (this.innerSubscription) {
      this.innerSubscription.unsubscribe();
    }
  };
  SkipUntilSubscriber2.prototype.notifyComplete = function() {
  };
  return SkipUntilSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/skipWhile.js
var SkipWhileOperator = function() {
  function SkipWhileOperator2(predicate) {
    this.predicate = predicate;
  }
  SkipWhileOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new SkipWhileSubscriber(subscriber, this.predicate));
  };
  return SkipWhileOperator2;
}();
var SkipWhileSubscriber = function(_super) {
  __extends(SkipWhileSubscriber2, _super);
  function SkipWhileSubscriber2(destination, predicate) {
    var _this = _super.call(this, destination) || this;
    _this.predicate = predicate;
    _this.skipping = true;
    _this.index = 0;
    return _this;
  }
  SkipWhileSubscriber2.prototype._next = function(value) {
    var destination = this.destination;
    if (this.skipping) {
      this.tryCallPredicate(value);
    }
    if (!this.skipping) {
      destination.next(value);
    }
  };
  SkipWhileSubscriber2.prototype.tryCallPredicate = function(value) {
    try {
      var result = this.predicate(value, this.index++);
      this.skipping = Boolean(result);
    } catch (err) {
      this.destination.error(err);
    }
  };
  return SkipWhileSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/observable/SubscribeOnObservable.js
var SubscribeOnObservable = function(_super) {
  __extends(SubscribeOnObservable2, _super);
  function SubscribeOnObservable2(source, delayTime, scheduler) {
    if (delayTime === void 0) {
      delayTime = 0;
    }
    if (scheduler === void 0) {
      scheduler = asap;
    }
    var _this = _super.call(this) || this;
    _this.source = source;
    _this.delayTime = delayTime;
    _this.scheduler = scheduler;
    if (!isNumeric(delayTime) || delayTime < 0) {
      _this.delayTime = 0;
    }
    if (!scheduler || typeof scheduler.schedule !== "function") {
      _this.scheduler = asap;
    }
    return _this;
  }
  SubscribeOnObservable2.create = function(source, delay2, scheduler) {
    if (delay2 === void 0) {
      delay2 = 0;
    }
    if (scheduler === void 0) {
      scheduler = asap;
    }
    return new SubscribeOnObservable2(source, delay2, scheduler);
  };
  SubscribeOnObservable2.dispatch = function(arg) {
    var source = arg.source, subscriber = arg.subscriber;
    return this.add(source.subscribe(subscriber));
  };
  SubscribeOnObservable2.prototype._subscribe = function(subscriber) {
    var delay2 = this.delayTime;
    var source = this.source;
    var scheduler = this.scheduler;
    return scheduler.schedule(SubscribeOnObservable2.dispatch, delay2, {
      source,
      subscriber
    });
  };
  return SubscribeOnObservable2;
}(Observable);

// ../../../../node_modules/rxjs/_esm5/internal/operators/subscribeOn.js
var SubscribeOnOperator = function() {
  function SubscribeOnOperator2(scheduler, delay2) {
    this.scheduler = scheduler;
    this.delay = delay2;
  }
  SubscribeOnOperator2.prototype.call = function(subscriber, source) {
    return new SubscribeOnObservable(source, this.delay, this.scheduler).subscribe(subscriber);
  };
  return SubscribeOnOperator2;
}();

// ../../../../node_modules/rxjs/_esm5/internal/operators/switchMap.js
var SwitchMapOperator = function() {
  function SwitchMapOperator2(project) {
    this.project = project;
  }
  SwitchMapOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new SwitchMapSubscriber(subscriber, this.project));
  };
  return SwitchMapOperator2;
}();
var SwitchMapSubscriber = function(_super) {
  __extends(SwitchMapSubscriber2, _super);
  function SwitchMapSubscriber2(destination, project) {
    var _this = _super.call(this, destination) || this;
    _this.project = project;
    _this.index = 0;
    return _this;
  }
  SwitchMapSubscriber2.prototype._next = function(value) {
    var result;
    var index = this.index++;
    try {
      result = this.project(value, index);
    } catch (error) {
      this.destination.error(error);
      return;
    }
    this._innerSub(result);
  };
  SwitchMapSubscriber2.prototype._innerSub = function(result) {
    var innerSubscription = this.innerSubscription;
    if (innerSubscription) {
      innerSubscription.unsubscribe();
    }
    var innerSubscriber = new SimpleInnerSubscriber(this);
    var destination = this.destination;
    destination.add(innerSubscriber);
    this.innerSubscription = innerSubscribe(result, innerSubscriber);
    if (this.innerSubscription !== innerSubscriber) {
      destination.add(this.innerSubscription);
    }
  };
  SwitchMapSubscriber2.prototype._complete = function() {
    var innerSubscription = this.innerSubscription;
    if (!innerSubscription || innerSubscription.closed) {
      _super.prototype._complete.call(this);
    }
    this.unsubscribe();
  };
  SwitchMapSubscriber2.prototype._unsubscribe = function() {
    this.innerSubscription = void 0;
  };
  SwitchMapSubscriber2.prototype.notifyComplete = function() {
    this.innerSubscription = void 0;
    if (this.isStopped) {
      _super.prototype._complete.call(this);
    }
  };
  SwitchMapSubscriber2.prototype.notifyNext = function(innerValue) {
    this.destination.next(innerValue);
  };
  return SwitchMapSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/takeUntil.js
var TakeUntilOperator = function() {
  function TakeUntilOperator2(notifier) {
    this.notifier = notifier;
  }
  TakeUntilOperator2.prototype.call = function(subscriber, source) {
    var takeUntilSubscriber = new TakeUntilSubscriber(subscriber);
    var notifierSubscription = innerSubscribe(this.notifier, new SimpleInnerSubscriber(takeUntilSubscriber));
    if (notifierSubscription && !takeUntilSubscriber.seenValue) {
      takeUntilSubscriber.add(notifierSubscription);
      return source.subscribe(takeUntilSubscriber);
    }
    return takeUntilSubscriber;
  };
  return TakeUntilOperator2;
}();
var TakeUntilSubscriber = function(_super) {
  __extends(TakeUntilSubscriber2, _super);
  function TakeUntilSubscriber2(destination) {
    var _this = _super.call(this, destination) || this;
    _this.seenValue = false;
    return _this;
  }
  TakeUntilSubscriber2.prototype.notifyNext = function() {
    this.seenValue = true;
    this.complete();
  };
  TakeUntilSubscriber2.prototype.notifyComplete = function() {
  };
  return TakeUntilSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/takeWhile.js
var TakeWhileOperator = function() {
  function TakeWhileOperator2(predicate, inclusive) {
    this.predicate = predicate;
    this.inclusive = inclusive;
  }
  TakeWhileOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new TakeWhileSubscriber(subscriber, this.predicate, this.inclusive));
  };
  return TakeWhileOperator2;
}();
var TakeWhileSubscriber = function(_super) {
  __extends(TakeWhileSubscriber2, _super);
  function TakeWhileSubscriber2(destination, predicate, inclusive) {
    var _this = _super.call(this, destination) || this;
    _this.predicate = predicate;
    _this.inclusive = inclusive;
    _this.index = 0;
    return _this;
  }
  TakeWhileSubscriber2.prototype._next = function(value) {
    var destination = this.destination;
    var result;
    try {
      result = this.predicate(value, this.index++);
    } catch (err) {
      destination.error(err);
      return;
    }
    this.nextOrComplete(value, result);
  };
  TakeWhileSubscriber2.prototype.nextOrComplete = function(value, predicateResult) {
    var destination = this.destination;
    if (Boolean(predicateResult)) {
      destination.next(value);
    } else {
      if (this.inclusive) {
        destination.next(value);
      }
      destination.complete();
    }
  };
  return TakeWhileSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/tap.js
var DoOperator = function() {
  function DoOperator2(nextOrObserver, error, complete) {
    this.nextOrObserver = nextOrObserver;
    this.error = error;
    this.complete = complete;
  }
  DoOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new TapSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
  };
  return DoOperator2;
}();
var TapSubscriber = function(_super) {
  __extends(TapSubscriber2, _super);
  function TapSubscriber2(destination, observerOrNext, error, complete) {
    var _this = _super.call(this, destination) || this;
    _this._tapNext = noop;
    _this._tapError = noop;
    _this._tapComplete = noop;
    _this._tapError = error || noop;
    _this._tapComplete = complete || noop;
    if (isFunction(observerOrNext)) {
      _this._context = _this;
      _this._tapNext = observerOrNext;
    } else if (observerOrNext) {
      _this._context = observerOrNext;
      _this._tapNext = observerOrNext.next || noop;
      _this._tapError = observerOrNext.error || noop;
      _this._tapComplete = observerOrNext.complete || noop;
    }
    return _this;
  }
  TapSubscriber2.prototype._next = function(value) {
    try {
      this._tapNext.call(this._context, value);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(value);
  };
  TapSubscriber2.prototype._error = function(err) {
    try {
      this._tapError.call(this._context, err);
    } catch (err2) {
      this.destination.error(err2);
      return;
    }
    this.destination.error(err);
  };
  TapSubscriber2.prototype._complete = function() {
    try {
      this._tapComplete.call(this._context);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    return this.destination.complete();
  };
  return TapSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/throttle.js
var ThrottleOperator = function() {
  function ThrottleOperator2(durationSelector, leading, trailing) {
    this.durationSelector = durationSelector;
    this.leading = leading;
    this.trailing = trailing;
  }
  ThrottleOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new ThrottleSubscriber(subscriber, this.durationSelector, this.leading, this.trailing));
  };
  return ThrottleOperator2;
}();
var ThrottleSubscriber = function(_super) {
  __extends(ThrottleSubscriber2, _super);
  function ThrottleSubscriber2(destination, durationSelector, _leading, _trailing) {
    var _this = _super.call(this, destination) || this;
    _this.destination = destination;
    _this.durationSelector = durationSelector;
    _this._leading = _leading;
    _this._trailing = _trailing;
    _this._hasValue = false;
    return _this;
  }
  ThrottleSubscriber2.prototype._next = function(value) {
    this._hasValue = true;
    this._sendValue = value;
    if (!this._throttled) {
      if (this._leading) {
        this.send();
      } else {
        this.throttle(value);
      }
    }
  };
  ThrottleSubscriber2.prototype.send = function() {
    var _a = this, _hasValue = _a._hasValue, _sendValue = _a._sendValue;
    if (_hasValue) {
      this.destination.next(_sendValue);
      this.throttle(_sendValue);
    }
    this._hasValue = false;
    this._sendValue = void 0;
  };
  ThrottleSubscriber2.prototype.throttle = function(value) {
    var duration = this.tryDurationSelector(value);
    if (!!duration) {
      this.add(this._throttled = innerSubscribe(duration, new SimpleInnerSubscriber(this)));
    }
  };
  ThrottleSubscriber2.prototype.tryDurationSelector = function(value) {
    try {
      return this.durationSelector(value);
    } catch (err) {
      this.destination.error(err);
      return null;
    }
  };
  ThrottleSubscriber2.prototype.throttlingDone = function() {
    var _a = this, _throttled = _a._throttled, _trailing = _a._trailing;
    if (_throttled) {
      _throttled.unsubscribe();
    }
    this._throttled = void 0;
    if (_trailing) {
      this.send();
    }
  };
  ThrottleSubscriber2.prototype.notifyNext = function() {
    this.throttlingDone();
  };
  ThrottleSubscriber2.prototype.notifyComplete = function() {
    this.throttlingDone();
  };
  return ThrottleSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/throttleTime.js
var ThrottleTimeOperator = function() {
  function ThrottleTimeOperator2(duration, scheduler, leading, trailing) {
    this.duration = duration;
    this.scheduler = scheduler;
    this.leading = leading;
    this.trailing = trailing;
  }
  ThrottleTimeOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new ThrottleTimeSubscriber(subscriber, this.duration, this.scheduler, this.leading, this.trailing));
  };
  return ThrottleTimeOperator2;
}();
var ThrottleTimeSubscriber = function(_super) {
  __extends(ThrottleTimeSubscriber2, _super);
  function ThrottleTimeSubscriber2(destination, duration, scheduler, leading, trailing) {
    var _this = _super.call(this, destination) || this;
    _this.duration = duration;
    _this.scheduler = scheduler;
    _this.leading = leading;
    _this.trailing = trailing;
    _this._hasTrailingValue = false;
    _this._trailingValue = null;
    return _this;
  }
  ThrottleTimeSubscriber2.prototype._next = function(value) {
    if (this.throttled) {
      if (this.trailing) {
        this._trailingValue = value;
        this._hasTrailingValue = true;
      }
    } else {
      this.add(this.throttled = this.scheduler.schedule(dispatchNext2, this.duration, {
        subscriber: this
      }));
      if (this.leading) {
        this.destination.next(value);
      } else if (this.trailing) {
        this._trailingValue = value;
        this._hasTrailingValue = true;
      }
    }
  };
  ThrottleTimeSubscriber2.prototype._complete = function() {
    if (this._hasTrailingValue) {
      this.destination.next(this._trailingValue);
      this.destination.complete();
    } else {
      this.destination.complete();
    }
  };
  ThrottleTimeSubscriber2.prototype.clearThrottle = function() {
    var throttled = this.throttled;
    if (throttled) {
      if (this.trailing && this._hasTrailingValue) {
        this.destination.next(this._trailingValue);
        this._trailingValue = null;
        this._hasTrailingValue = false;
      }
      throttled.unsubscribe();
      this.remove(throttled);
      this.throttled = null;
    }
  };
  return ThrottleTimeSubscriber2;
}(Subscriber);
function dispatchNext2(arg) {
  var subscriber = arg.subscriber;
  subscriber.clearThrottle();
}

// ../../../../node_modules/rxjs/_esm5/internal/operators/timeoutWith.js
var TimeoutWithOperator = function() {
  function TimeoutWithOperator2(waitFor, absoluteTimeout, withObservable, scheduler) {
    this.waitFor = waitFor;
    this.absoluteTimeout = absoluteTimeout;
    this.withObservable = withObservable;
    this.scheduler = scheduler;
  }
  TimeoutWithOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new TimeoutWithSubscriber(subscriber, this.absoluteTimeout, this.waitFor, this.withObservable, this.scheduler));
  };
  return TimeoutWithOperator2;
}();
var TimeoutWithSubscriber = function(_super) {
  __extends(TimeoutWithSubscriber2, _super);
  function TimeoutWithSubscriber2(destination, absoluteTimeout, waitFor, withObservable, scheduler) {
    var _this = _super.call(this, destination) || this;
    _this.absoluteTimeout = absoluteTimeout;
    _this.waitFor = waitFor;
    _this.withObservable = withObservable;
    _this.scheduler = scheduler;
    _this.scheduleTimeout();
    return _this;
  }
  TimeoutWithSubscriber2.dispatchTimeout = function(subscriber) {
    var withObservable = subscriber.withObservable;
    subscriber._unsubscribeAndRecycle();
    subscriber.add(innerSubscribe(withObservable, new SimpleInnerSubscriber(subscriber)));
  };
  TimeoutWithSubscriber2.prototype.scheduleTimeout = function() {
    var action = this.action;
    if (action) {
      this.action = action.schedule(this, this.waitFor);
    } else {
      this.add(this.action = this.scheduler.schedule(TimeoutWithSubscriber2.dispatchTimeout, this.waitFor, this));
    }
  };
  TimeoutWithSubscriber2.prototype._next = function(value) {
    if (!this.absoluteTimeout) {
      this.scheduleTimeout();
    }
    _super.prototype._next.call(this, value);
  };
  TimeoutWithSubscriber2.prototype._unsubscribe = function() {
    this.action = void 0;
    this.scheduler = null;
    this.withObservable = null;
  };
  return TimeoutWithSubscriber2;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/window.js
var WindowOperator = function() {
  function WindowOperator3(windowBoundaries) {
    this.windowBoundaries = windowBoundaries;
  }
  WindowOperator3.prototype.call = function(subscriber, source) {
    var windowSubscriber = new WindowSubscriber(subscriber);
    var sourceSubscription = source.subscribe(windowSubscriber);
    if (!sourceSubscription.closed) {
      windowSubscriber.add(innerSubscribe(this.windowBoundaries, new SimpleInnerSubscriber(windowSubscriber)));
    }
    return sourceSubscription;
  };
  return WindowOperator3;
}();
var WindowSubscriber = function(_super) {
  __extends(WindowSubscriber3, _super);
  function WindowSubscriber3(destination) {
    var _this = _super.call(this, destination) || this;
    _this.window = new Subject();
    destination.next(_this.window);
    return _this;
  }
  WindowSubscriber3.prototype.notifyNext = function() {
    this.openWindow();
  };
  WindowSubscriber3.prototype.notifyError = function(error) {
    this._error(error);
  };
  WindowSubscriber3.prototype.notifyComplete = function() {
    this._complete();
  };
  WindowSubscriber3.prototype._next = function(value) {
    this.window.next(value);
  };
  WindowSubscriber3.prototype._error = function(err) {
    this.window.error(err);
    this.destination.error(err);
  };
  WindowSubscriber3.prototype._complete = function() {
    this.window.complete();
    this.destination.complete();
  };
  WindowSubscriber3.prototype._unsubscribe = function() {
    this.window = null;
  };
  WindowSubscriber3.prototype.openWindow = function() {
    var prevWindow = this.window;
    if (prevWindow) {
      prevWindow.complete();
    }
    var destination = this.destination;
    var newWindow = this.window = new Subject();
    destination.next(newWindow);
  };
  return WindowSubscriber3;
}(SimpleOuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/windowCount.js
var WindowCountOperator = function() {
  function WindowCountOperator2(windowSize, startWindowEvery) {
    this.windowSize = windowSize;
    this.startWindowEvery = startWindowEvery;
  }
  WindowCountOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new WindowCountSubscriber(subscriber, this.windowSize, this.startWindowEvery));
  };
  return WindowCountOperator2;
}();
var WindowCountSubscriber = function(_super) {
  __extends(WindowCountSubscriber2, _super);
  function WindowCountSubscriber2(destination, windowSize, startWindowEvery) {
    var _this = _super.call(this, destination) || this;
    _this.destination = destination;
    _this.windowSize = windowSize;
    _this.startWindowEvery = startWindowEvery;
    _this.windows = [new Subject()];
    _this.count = 0;
    destination.next(_this.windows[0]);
    return _this;
  }
  WindowCountSubscriber2.prototype._next = function(value) {
    var startWindowEvery = this.startWindowEvery > 0 ? this.startWindowEvery : this.windowSize;
    var destination = this.destination;
    var windowSize = this.windowSize;
    var windows = this.windows;
    var len = windows.length;
    for (var i = 0; i < len && !this.closed; i++) {
      windows[i].next(value);
    }
    var c = this.count - windowSize + 1;
    if (c >= 0 && c % startWindowEvery === 0 && !this.closed) {
      windows.shift().complete();
    }
    if (++this.count % startWindowEvery === 0 && !this.closed) {
      var window_1 = new Subject();
      windows.push(window_1);
      destination.next(window_1);
    }
  };
  WindowCountSubscriber2.prototype._error = function(err) {
    var windows = this.windows;
    if (windows) {
      while (windows.length > 0 && !this.closed) {
        windows.shift().error(err);
      }
    }
    this.destination.error(err);
  };
  WindowCountSubscriber2.prototype._complete = function() {
    var windows = this.windows;
    if (windows) {
      while (windows.length > 0 && !this.closed) {
        windows.shift().complete();
      }
    }
    this.destination.complete();
  };
  WindowCountSubscriber2.prototype._unsubscribe = function() {
    this.count = 0;
    this.windows = null;
  };
  return WindowCountSubscriber2;
}(Subscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/windowTime.js
var WindowTimeOperator = function() {
  function WindowTimeOperator2(windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler) {
    this.windowTimeSpan = windowTimeSpan;
    this.windowCreationInterval = windowCreationInterval;
    this.maxWindowSize = maxWindowSize;
    this.scheduler = scheduler;
  }
  WindowTimeOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new WindowTimeSubscriber(subscriber, this.windowTimeSpan, this.windowCreationInterval, this.maxWindowSize, this.scheduler));
  };
  return WindowTimeOperator2;
}();
var CountedSubject = function(_super) {
  __extends(CountedSubject2, _super);
  function CountedSubject2() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this._numberOfNextedValues = 0;
    return _this;
  }
  CountedSubject2.prototype.next = function(value) {
    this._numberOfNextedValues++;
    _super.prototype.next.call(this, value);
  };
  Object.defineProperty(CountedSubject2.prototype, "numberOfNextedValues", {
    get: function() {
      return this._numberOfNextedValues;
    },
    enumerable: true,
    configurable: true
  });
  return CountedSubject2;
}(Subject);
var WindowTimeSubscriber = function(_super) {
  __extends(WindowTimeSubscriber2, _super);
  function WindowTimeSubscriber2(destination, windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler) {
    var _this = _super.call(this, destination) || this;
    _this.destination = destination;
    _this.windowTimeSpan = windowTimeSpan;
    _this.windowCreationInterval = windowCreationInterval;
    _this.maxWindowSize = maxWindowSize;
    _this.scheduler = scheduler;
    _this.windows = [];
    var window3 = _this.openWindow();
    if (windowCreationInterval !== null && windowCreationInterval >= 0) {
      var closeState = {
        subscriber: _this,
        window: window3,
        context: null
      };
      var creationState = {
        windowTimeSpan,
        windowCreationInterval,
        subscriber: _this,
        scheduler
      };
      _this.add(scheduler.schedule(dispatchWindowClose, windowTimeSpan, closeState));
      _this.add(scheduler.schedule(dispatchWindowCreation, windowCreationInterval, creationState));
    } else {
      var timeSpanOnlyState = {
        subscriber: _this,
        window: window3,
        windowTimeSpan
      };
      _this.add(scheduler.schedule(dispatchWindowTimeSpanOnly, windowTimeSpan, timeSpanOnlyState));
    }
    return _this;
  }
  WindowTimeSubscriber2.prototype._next = function(value) {
    var windows = this.windows;
    var len = windows.length;
    for (var i = 0; i < len; i++) {
      var window_1 = windows[i];
      if (!window_1.closed) {
        window_1.next(value);
        if (window_1.numberOfNextedValues >= this.maxWindowSize) {
          this.closeWindow(window_1);
        }
      }
    }
  };
  WindowTimeSubscriber2.prototype._error = function(err) {
    var windows = this.windows;
    while (windows.length > 0) {
      windows.shift().error(err);
    }
    this.destination.error(err);
  };
  WindowTimeSubscriber2.prototype._complete = function() {
    var windows = this.windows;
    while (windows.length > 0) {
      var window_2 = windows.shift();
      if (!window_2.closed) {
        window_2.complete();
      }
    }
    this.destination.complete();
  };
  WindowTimeSubscriber2.prototype.openWindow = function() {
    var window3 = new CountedSubject();
    this.windows.push(window3);
    var destination = this.destination;
    destination.next(window3);
    return window3;
  };
  WindowTimeSubscriber2.prototype.closeWindow = function(window3) {
    window3.complete();
    var windows = this.windows;
    windows.splice(windows.indexOf(window3), 1);
  };
  return WindowTimeSubscriber2;
}(Subscriber);
function dispatchWindowTimeSpanOnly(state) {
  var subscriber = state.subscriber, windowTimeSpan = state.windowTimeSpan, window3 = state.window;
  if (window3) {
    subscriber.closeWindow(window3);
  }
  state.window = subscriber.openWindow();
  this.schedule(state, windowTimeSpan);
}
function dispatchWindowCreation(state) {
  var windowTimeSpan = state.windowTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler, windowCreationInterval = state.windowCreationInterval;
  var window3 = subscriber.openWindow();
  var action = this;
  var context = {
    action,
    subscription: null
  };
  var timeSpanState = {
    subscriber,
    window: window3,
    context
  };
  context.subscription = scheduler.schedule(dispatchWindowClose, windowTimeSpan, timeSpanState);
  action.add(context.subscription);
  action.schedule(state, windowCreationInterval);
}
function dispatchWindowClose(state) {
  var subscriber = state.subscriber, window3 = state.window, context = state.context;
  if (context && context.action && context.subscription) {
    context.action.remove(context.subscription);
  }
  subscriber.closeWindow(window3);
}

// ../../../../node_modules/rxjs/_esm5/internal/operators/windowToggle.js
var WindowToggleOperator = function() {
  function WindowToggleOperator2(openings, closingSelector) {
    this.openings = openings;
    this.closingSelector = closingSelector;
  }
  WindowToggleOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new WindowToggleSubscriber(subscriber, this.openings, this.closingSelector));
  };
  return WindowToggleOperator2;
}();
var WindowToggleSubscriber = function(_super) {
  __extends(WindowToggleSubscriber2, _super);
  function WindowToggleSubscriber2(destination, openings, closingSelector) {
    var _this = _super.call(this, destination) || this;
    _this.openings = openings;
    _this.closingSelector = closingSelector;
    _this.contexts = [];
    _this.add(_this.openSubscription = subscribeToResult(_this, openings, openings));
    return _this;
  }
  WindowToggleSubscriber2.prototype._next = function(value) {
    var contexts = this.contexts;
    if (contexts) {
      var len = contexts.length;
      for (var i = 0; i < len; i++) {
        contexts[i].window.next(value);
      }
    }
  };
  WindowToggleSubscriber2.prototype._error = function(err) {
    var contexts = this.contexts;
    this.contexts = null;
    if (contexts) {
      var len = contexts.length;
      var index = -1;
      while (++index < len) {
        var context_1 = contexts[index];
        context_1.window.error(err);
        context_1.subscription.unsubscribe();
      }
    }
    _super.prototype._error.call(this, err);
  };
  WindowToggleSubscriber2.prototype._complete = function() {
    var contexts = this.contexts;
    this.contexts = null;
    if (contexts) {
      var len = contexts.length;
      var index = -1;
      while (++index < len) {
        var context_2 = contexts[index];
        context_2.window.complete();
        context_2.subscription.unsubscribe();
      }
    }
    _super.prototype._complete.call(this);
  };
  WindowToggleSubscriber2.prototype._unsubscribe = function() {
    var contexts = this.contexts;
    this.contexts = null;
    if (contexts) {
      var len = contexts.length;
      var index = -1;
      while (++index < len) {
        var context_3 = contexts[index];
        context_3.window.unsubscribe();
        context_3.subscription.unsubscribe();
      }
    }
  };
  WindowToggleSubscriber2.prototype.notifyNext = function(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
    if (outerValue === this.openings) {
      var closingNotifier = void 0;
      try {
        var closingSelector = this.closingSelector;
        closingNotifier = closingSelector(innerValue);
      } catch (e) {
        return this.error(e);
      }
      var window_1 = new Subject();
      var subscription = new Subscription();
      var context_4 = {
        window: window_1,
        subscription
      };
      this.contexts.push(context_4);
      var innerSubscription = subscribeToResult(this, closingNotifier, context_4);
      if (innerSubscription.closed) {
        this.closeWindow(this.contexts.length - 1);
      } else {
        innerSubscription.context = context_4;
        subscription.add(innerSubscription);
      }
      this.destination.next(window_1);
    } else {
      this.closeWindow(this.contexts.indexOf(outerValue));
    }
  };
  WindowToggleSubscriber2.prototype.notifyError = function(err) {
    this.error(err);
  };
  WindowToggleSubscriber2.prototype.notifyComplete = function(inner) {
    if (inner !== this.openSubscription) {
      this.closeWindow(this.contexts.indexOf(inner.context));
    }
  };
  WindowToggleSubscriber2.prototype.closeWindow = function(index) {
    if (index === -1) {
      return;
    }
    var contexts = this.contexts;
    var context = contexts[index];
    var window3 = context.window, subscription = context.subscription;
    contexts.splice(index, 1);
    window3.complete();
    subscription.unsubscribe();
  };
  return WindowToggleSubscriber2;
}(OuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/windowWhen.js
var WindowOperator2 = function() {
  function WindowOperator3(closingSelector) {
    this.closingSelector = closingSelector;
  }
  WindowOperator3.prototype.call = function(subscriber, source) {
    return source.subscribe(new WindowSubscriber2(subscriber, this.closingSelector));
  };
  return WindowOperator3;
}();
var WindowSubscriber2 = function(_super) {
  __extends(WindowSubscriber3, _super);
  function WindowSubscriber3(destination, closingSelector) {
    var _this = _super.call(this, destination) || this;
    _this.destination = destination;
    _this.closingSelector = closingSelector;
    _this.openWindow();
    return _this;
  }
  WindowSubscriber3.prototype.notifyNext = function(_outerValue, _innerValue, _outerIndex, _innerIndex, innerSub) {
    this.openWindow(innerSub);
  };
  WindowSubscriber3.prototype.notifyError = function(error) {
    this._error(error);
  };
  WindowSubscriber3.prototype.notifyComplete = function(innerSub) {
    this.openWindow(innerSub);
  };
  WindowSubscriber3.prototype._next = function(value) {
    this.window.next(value);
  };
  WindowSubscriber3.prototype._error = function(err) {
    this.window.error(err);
    this.destination.error(err);
    this.unsubscribeClosingNotification();
  };
  WindowSubscriber3.prototype._complete = function() {
    this.window.complete();
    this.destination.complete();
    this.unsubscribeClosingNotification();
  };
  WindowSubscriber3.prototype.unsubscribeClosingNotification = function() {
    if (this.closingNotification) {
      this.closingNotification.unsubscribe();
    }
  };
  WindowSubscriber3.prototype.openWindow = function(innerSub) {
    if (innerSub === void 0) {
      innerSub = null;
    }
    if (innerSub) {
      this.remove(innerSub);
      innerSub.unsubscribe();
    }
    var prevWindow = this.window;
    if (prevWindow) {
      prevWindow.complete();
    }
    var window3 = this.window = new Subject();
    this.destination.next(window3);
    var closingNotifier;
    try {
      var closingSelector = this.closingSelector;
      closingNotifier = closingSelector();
    } catch (e) {
      this.destination.error(e);
      this.window.error(e);
      return;
    }
    this.add(this.closingNotification = subscribeToResult(this, closingNotifier));
  };
  return WindowSubscriber3;
}(OuterSubscriber);

// ../../../../node_modules/rxjs/_esm5/internal/operators/withLatestFrom.js
var WithLatestFromOperator = function() {
  function WithLatestFromOperator2(observables, project) {
    this.observables = observables;
    this.project = project;
  }
  WithLatestFromOperator2.prototype.call = function(subscriber, source) {
    return source.subscribe(new WithLatestFromSubscriber(subscriber, this.observables, this.project));
  };
  return WithLatestFromOperator2;
}();
var WithLatestFromSubscriber = function(_super) {
  __extends(WithLatestFromSubscriber2, _super);
  function WithLatestFromSubscriber2(destination, observables, project) {
    var _this = _super.call(this, destination) || this;
    _this.observables = observables;
    _this.project = project;
    _this.toRespond = [];
    var len = observables.length;
    _this.values = new Array(len);
    for (var i = 0; i < len; i++) {
      _this.toRespond.push(i);
    }
    for (var i = 0; i < len; i++) {
      var observable2 = observables[i];
      _this.add(subscribeToResult(_this, observable2, void 0, i));
    }
    return _this;
  }
  WithLatestFromSubscriber2.prototype.notifyNext = function(_outerValue, innerValue, outerIndex) {
    this.values[outerIndex] = innerValue;
    var toRespond = this.toRespond;
    if (toRespond.length > 0) {
      var found = toRespond.indexOf(outerIndex);
      if (found !== -1) {
        toRespond.splice(found, 1);
      }
    }
  };
  WithLatestFromSubscriber2.prototype.notifyComplete = function() {
  };
  WithLatestFromSubscriber2.prototype._next = function(value) {
    if (this.toRespond.length === 0) {
      var args = [value].concat(this.values);
      if (this.project) {
        this._tryProject(args);
      } else {
        this.destination.next(args);
      }
    }
  };
  WithLatestFromSubscriber2.prototype._tryProject = function(args) {
    var result;
    try {
      result = this.project.apply(this, args);
    } catch (err) {
      this.destination.error(err);
      return;
    }
    this.destination.next(result);
  };
  return WithLatestFromSubscriber2;
}(OuterSubscriber);

// ../../../../node_modules/@angular/core/fesm5/core.js
function defineInjectable(opts) {
  return {
    providedIn: opts.providedIn || null,
    factory: opts.factory,
    value: void 0
  };
}
function defineInjector(options) {
  return {
    factory: options.factory,
    providers: options.providers || [],
    imports: options.imports || []
  };
}
var InjectionToken = (
  /** @class */
  function() {
    function InjectionToken2(_desc, options) {
      this._desc = _desc;
      this.ngMetadataName = "InjectionToken";
      if (options !== void 0) {
        this.ngInjectableDef = defineInjectable({
          providedIn: options.providedIn || "root",
          factory: options.factory
        });
      } else {
        this.ngInjectableDef = void 0;
      }
    }
    InjectionToken2.prototype.toString = function() {
      return "InjectionToken " + this._desc;
    };
    return InjectionToken2;
  }()
);
var ANNOTATIONS = "__annotations__";
var PARAMETERS = "__parameters__";
var PROP_METADATA = "__prop__metadata__";
function makeDecorator(name, props, parentClass, chainFn, typeFn) {
  var metaCtor = makeMetadataCtor(props);
  function DecoratorFactory() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var _a;
    if (this instanceof DecoratorFactory) {
      metaCtor.call.apply(metaCtor, __spread([this], args));
      return this;
    }
    var annotationInstance = new ((_a = DecoratorFactory).bind.apply(_a, __spread([void 0], args)))();
    var TypeDecorator = function TypeDecorator2(cls) {
      typeFn && typeFn.apply(void 0, __spread([cls], args));
      var annotations = cls.hasOwnProperty(ANNOTATIONS) ? cls[ANNOTATIONS] : Object.defineProperty(cls, ANNOTATIONS, {
        value: []
      })[ANNOTATIONS];
      annotations.push(annotationInstance);
      return cls;
    };
    if (chainFn) chainFn(TypeDecorator);
    return TypeDecorator;
  }
  if (parentClass) {
    DecoratorFactory.prototype = Object.create(parentClass.prototype);
  }
  DecoratorFactory.prototype.ngMetadataName = name;
  DecoratorFactory.annotationCls = DecoratorFactory;
  return DecoratorFactory;
}
function makeMetadataCtor(props) {
  return function ctor() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    if (props) {
      var values = props.apply(void 0, __spread(args));
      for (var propName in values) {
        this[propName] = values[propName];
      }
    }
  };
}
function makeParamDecorator(name, props, parentClass) {
  var metaCtor = makeMetadataCtor(props);
  function ParamDecoratorFactory() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var _a;
    if (this instanceof ParamDecoratorFactory) {
      metaCtor.apply(this, args);
      return this;
    }
    var annotationInstance = new ((_a = ParamDecoratorFactory).bind.apply(_a, __spread([void 0], args)))();
    ParamDecorator.annotation = annotationInstance;
    return ParamDecorator;
    function ParamDecorator(cls, unusedKey, index) {
      var parameters = cls.hasOwnProperty(PARAMETERS) ? cls[PARAMETERS] : Object.defineProperty(cls, PARAMETERS, {
        value: []
      })[PARAMETERS];
      while (parameters.length <= index) {
        parameters.push(null);
      }
      (parameters[index] = parameters[index] || []).push(annotationInstance);
      return cls;
    }
  }
  if (parentClass) {
    ParamDecoratorFactory.prototype = Object.create(parentClass.prototype);
  }
  ParamDecoratorFactory.prototype.ngMetadataName = name;
  ParamDecoratorFactory.annotationCls = ParamDecoratorFactory;
  return ParamDecoratorFactory;
}
function makePropDecorator(name, props, parentClass) {
  var metaCtor = makeMetadataCtor(props);
  function PropDecoratorFactory() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var _a;
    if (this instanceof PropDecoratorFactory) {
      metaCtor.apply(this, args);
      return this;
    }
    var decoratorInstance = new ((_a = PropDecoratorFactory).bind.apply(_a, __spread([void 0], args)))();
    return function PropDecorator(target, name2) {
      var constructor = target.constructor;
      var meta = constructor.hasOwnProperty(PROP_METADATA) ? constructor[PROP_METADATA] : Object.defineProperty(constructor, PROP_METADATA, {
        value: {}
      })[PROP_METADATA];
      meta[name2] = meta.hasOwnProperty(name2) && meta[name2] || [];
      meta[name2].unshift(decoratorInstance);
    };
  }
  if (parentClass) {
    PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
  }
  PropDecoratorFactory.prototype.ngMetadataName = name;
  PropDecoratorFactory.annotationCls = PropDecoratorFactory;
  return PropDecoratorFactory;
}
var ANALYZE_FOR_ENTRY_COMPONENTS = new InjectionToken("AnalyzeForEntryComponents");
var Attribute = makeParamDecorator("Attribute", function(attributeName) {
  return {
    attributeName
  };
});
var Query = (
  /** @class */
  /* @__PURE__ */ function() {
    function Query2() {
    }
    return Query2;
  }()
);
var ContentChildren = makePropDecorator("ContentChildren", function(selector, data) {
  if (data === void 0) {
    data = {};
  }
  return __assign({
    selector,
    first: false,
    isViewQuery: false,
    descendants: false
  }, data);
}, Query);
var ContentChild = makePropDecorator("ContentChild", function(selector, data) {
  if (data === void 0) {
    data = {};
  }
  return __assign({
    selector,
    first: true,
    isViewQuery: false,
    descendants: true
  }, data);
}, Query);
var ViewChildren = makePropDecorator("ViewChildren", function(selector, data) {
  if (data === void 0) {
    data = {};
  }
  return __assign({
    selector,
    first: false,
    isViewQuery: true,
    descendants: true
  }, data);
}, Query);
var ViewChild = makePropDecorator("ViewChild", function(selector, data) {
  return __assign({
    selector,
    first: true,
    isViewQuery: true,
    descendants: true
  }, data);
}, Query);
var ChangeDetectionStrategy;
(function(ChangeDetectionStrategy2) {
  ChangeDetectionStrategy2[ChangeDetectionStrategy2["OnPush"] = 0] = "OnPush";
  ChangeDetectionStrategy2[ChangeDetectionStrategy2["Default"] = 1] = "Default";
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
var ChangeDetectorStatus;
(function(ChangeDetectorStatus2) {
  ChangeDetectorStatus2[ChangeDetectorStatus2["CheckOnce"] = 0] = "CheckOnce";
  ChangeDetectorStatus2[ChangeDetectorStatus2["Checked"] = 1] = "Checked";
  ChangeDetectorStatus2[ChangeDetectorStatus2["CheckAlways"] = 2] = "CheckAlways";
  ChangeDetectorStatus2[ChangeDetectorStatus2["Detached"] = 3] = "Detached";
  ChangeDetectorStatus2[ChangeDetectorStatus2["Errored"] = 4] = "Errored";
  ChangeDetectorStatus2[ChangeDetectorStatus2["Destroyed"] = 5] = "Destroyed";
})(ChangeDetectorStatus || (ChangeDetectorStatus = {}));
var Directive = makeDecorator("Directive", function(dir) {
  if (dir === void 0) {
    dir = {};
  }
  return dir;
}, void 0, void 0, function(type, meta) {
  return /* @__PURE__ */ function() {
  }(type, meta);
});
var Component = makeDecorator("Component", function(c) {
  if (c === void 0) {
    c = {};
  }
  return __assign({
    changeDetection: ChangeDetectionStrategy.Default
  }, c);
}, Directive, void 0, function(type, meta) {
  return /* @__PURE__ */ function() {
  }(type, meta);
});
var Pipe = makeDecorator("Pipe", function(p) {
  return __assign({
    pure: true
  }, p);
}, void 0, void 0, function(type, meta) {
  return /* @__PURE__ */ function() {
  }(type, meta);
});
var Input = makePropDecorator("Input", function(bindingPropertyName) {
  return {
    bindingPropertyName
  };
});
var Output = makePropDecorator("Output", function(bindingPropertyName) {
  return {
    bindingPropertyName
  };
});
var HostBinding = makePropDecorator("HostBinding", function(hostPropertyName) {
  return {
    hostPropertyName
  };
});
var HostListener = makePropDecorator("HostListener", function(eventName, args) {
  return {
    eventName,
    args
  };
});
var Type = Function;
function isType(v) {
  return typeof v === "function";
}
var __window = typeof window !== "undefined" && window;
var __self = typeof self !== "undefined" && typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope && self;
var __global = typeof global !== "undefined" && global;
var _global = __global || __window || __self;
var promise = Promise.resolve(0);
var _symbolIterator = null;
function getSymbolIterator2() {
  if (!_symbolIterator) {
    var Symbol_1 = _global["Symbol"];
    if (Symbol_1 && Symbol_1.iterator) {
      _symbolIterator = Symbol_1.iterator;
    } else {
      var keys = Object.getOwnPropertyNames(Map.prototype);
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (key !== "entries" && key !== "size" && Map.prototype[key] === Map.prototype["entries"]) {
          _symbolIterator = key;
        }
      }
    }
  }
  return _symbolIterator;
}
function scheduleMicroTask(fn) {
  if (typeof Zone === "undefined") {
    promise.then(function() {
      fn && fn.apply(null, null);
    });
  } else {
    Zone.current.scheduleMicroTask("scheduleMicrotask", fn);
  }
}
function looseIdentical(a, b) {
  return a === b || typeof a === "number" && typeof b === "number" && isNaN(a) && isNaN(b);
}
function stringify(token) {
  if (typeof token === "string") {
    return token;
  }
  if (token instanceof Array) {
    return "[" + token.map(stringify).join(", ") + "]";
  }
  if (token == null) {
    return "" + token;
  }
  if (token.overriddenName) {
    return "" + token.overriddenName;
  }
  if (token.name) {
    return "" + token.name;
  }
  var res = token.toString();
  if (res == null) {
    return "" + res;
  }
  var newLineIndex = res.indexOf("\n");
  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}
var DELEGATE_CTOR = /^function\s+\S+\(\)\s*{[\s\S]+\.apply\(this,\s*arguments\)/;
var INHERITED_CLASS = /^class\s+[A-Za-z\d$_]*\s*extends\s+[A-Za-z\d$_]+\s*{/;
var INHERITED_CLASS_WITH_CTOR = /^class\s+[A-Za-z\d$_]*\s*extends\s+[A-Za-z\d$_]+\s*{[\s\S]*constructor\s*\(/;
var ReflectionCapabilities = (
  /** @class */
  function() {
    function ReflectionCapabilities2(reflect) {
      this._reflect = reflect || _global["Reflect"];
    }
    ReflectionCapabilities2.prototype.isReflectionEnabled = function() {
      return true;
    };
    ReflectionCapabilities2.prototype.factory = function(t) {
      return function() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return new (t.bind.apply(t, __spread([void 0], args)))();
      };
    };
    ReflectionCapabilities2.prototype._zipTypesAndAnnotations = function(paramTypes, paramAnnotations) {
      var result;
      if (typeof paramTypes === "undefined") {
        result = new Array(paramAnnotations.length);
      } else {
        result = new Array(paramTypes.length);
      }
      for (var i = 0; i < result.length; i++) {
        if (typeof paramTypes === "undefined") {
          result[i] = [];
        } else if (paramTypes[i] != Object) {
          result[i] = [paramTypes[i]];
        } else {
          result[i] = [];
        }
        if (paramAnnotations && paramAnnotations[i] != null) {
          result[i] = result[i].concat(paramAnnotations[i]);
        }
      }
      return result;
    };
    ReflectionCapabilities2.prototype._ownParameters = function(type, parentCtor) {
      var typeStr = type.toString();
      if (DELEGATE_CTOR.exec(typeStr) || INHERITED_CLASS.exec(typeStr) && !INHERITED_CLASS_WITH_CTOR.exec(typeStr)) {
        return null;
      }
      if (type.parameters && type.parameters !== parentCtor.parameters) {
        return type.parameters;
      }
      var tsickleCtorParams = type.ctorParameters;
      if (tsickleCtorParams && tsickleCtorParams !== parentCtor.ctorParameters) {
        var ctorParameters = typeof tsickleCtorParams === "function" ? tsickleCtorParams() : tsickleCtorParams;
        var paramTypes_1 = ctorParameters.map(function(ctorParam) {
          return ctorParam && ctorParam.type;
        });
        var paramAnnotations_1 = ctorParameters.map(function(ctorParam) {
          return ctorParam && convertTsickleDecoratorIntoMetadata(ctorParam.decorators);
        });
        return this._zipTypesAndAnnotations(paramTypes_1, paramAnnotations_1);
      }
      var paramAnnotations = type.hasOwnProperty(PARAMETERS) && type[PARAMETERS];
      var paramTypes = this._reflect && this._reflect.getOwnMetadata && this._reflect.getOwnMetadata("design:paramtypes", type);
      if (paramTypes || paramAnnotations) {
        return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
      }
      return new Array(type.length).fill(void 0);
    };
    ReflectionCapabilities2.prototype.parameters = function(type) {
      if (!isType(type)) {
        return [];
      }
      var parentCtor = getParentCtor(type);
      var parameters = this._ownParameters(type, parentCtor);
      if (!parameters && parentCtor !== Object) {
        parameters = this.parameters(parentCtor);
      }
      return parameters || [];
    };
    ReflectionCapabilities2.prototype._ownAnnotations = function(typeOrFunc, parentCtor) {
      if (typeOrFunc.annotations && typeOrFunc.annotations !== parentCtor.annotations) {
        var annotations = typeOrFunc.annotations;
        if (typeof annotations === "function" && annotations.annotations) {
          annotations = annotations.annotations;
        }
        return annotations;
      }
      if (typeOrFunc.decorators && typeOrFunc.decorators !== parentCtor.decorators) {
        return convertTsickleDecoratorIntoMetadata(typeOrFunc.decorators);
      }
      if (typeOrFunc.hasOwnProperty(ANNOTATIONS)) {
        return typeOrFunc[ANNOTATIONS];
      }
      return null;
    };
    ReflectionCapabilities2.prototype.annotations = function(typeOrFunc) {
      if (!isType(typeOrFunc)) {
        return [];
      }
      var parentCtor = getParentCtor(typeOrFunc);
      var ownAnnotations = this._ownAnnotations(typeOrFunc, parentCtor) || [];
      var parentAnnotations = parentCtor !== Object ? this.annotations(parentCtor) : [];
      return parentAnnotations.concat(ownAnnotations);
    };
    ReflectionCapabilities2.prototype._ownPropMetadata = function(typeOrFunc, parentCtor) {
      if (typeOrFunc.propMetadata && typeOrFunc.propMetadata !== parentCtor.propMetadata) {
        var propMetadata = typeOrFunc.propMetadata;
        if (typeof propMetadata === "function" && propMetadata.propMetadata) {
          propMetadata = propMetadata.propMetadata;
        }
        return propMetadata;
      }
      if (typeOrFunc.propDecorators && typeOrFunc.propDecorators !== parentCtor.propDecorators) {
        var propDecorators_1 = typeOrFunc.propDecorators;
        var propMetadata_1 = {};
        Object.keys(propDecorators_1).forEach(function(prop) {
          propMetadata_1[prop] = convertTsickleDecoratorIntoMetadata(propDecorators_1[prop]);
        });
        return propMetadata_1;
      }
      if (typeOrFunc.hasOwnProperty(PROP_METADATA)) {
        return typeOrFunc[PROP_METADATA];
      }
      return null;
    };
    ReflectionCapabilities2.prototype.propMetadata = function(typeOrFunc) {
      if (!isType(typeOrFunc)) {
        return {};
      }
      var parentCtor = getParentCtor(typeOrFunc);
      var propMetadata = {};
      if (parentCtor !== Object) {
        var parentPropMetadata_1 = this.propMetadata(parentCtor);
        Object.keys(parentPropMetadata_1).forEach(function(propName) {
          propMetadata[propName] = parentPropMetadata_1[propName];
        });
      }
      var ownPropMetadata = this._ownPropMetadata(typeOrFunc, parentCtor);
      if (ownPropMetadata) {
        Object.keys(ownPropMetadata).forEach(function(propName) {
          var decorators = [];
          if (propMetadata.hasOwnProperty(propName)) {
            decorators.push.apply(decorators, __spread(propMetadata[propName]));
          }
          decorators.push.apply(decorators, __spread(ownPropMetadata[propName]));
          propMetadata[propName] = decorators;
        });
      }
      return propMetadata;
    };
    ReflectionCapabilities2.prototype.hasLifecycleHook = function(type, lcProperty) {
      return type instanceof Type && lcProperty in type.prototype;
    };
    ReflectionCapabilities2.prototype.guards = function(type) {
      return {};
    };
    ReflectionCapabilities2.prototype.getter = function(name) {
      return new Function("o", "return o." + name + ";");
    };
    ReflectionCapabilities2.prototype.setter = function(name) {
      return new Function("o", "v", "return o." + name + " = v;");
    };
    ReflectionCapabilities2.prototype.method = function(name) {
      var functionBody = "if (!o." + name + `) throw new Error('"` + name + `" is undefined');
        return o.` + name + ".apply(o, args);";
      return new Function("o", "args", functionBody);
    };
    ReflectionCapabilities2.prototype.importUri = function(type) {
      if (typeof type === "object" && type["filePath"]) {
        return type["filePath"];
      }
      return "./" + stringify(type);
    };
    ReflectionCapabilities2.prototype.resourceUri = function(type) {
      return "./" + stringify(type);
    };
    ReflectionCapabilities2.prototype.resolveIdentifier = function(name, moduleUrl, members, runtime) {
      return runtime;
    };
    ReflectionCapabilities2.prototype.resolveEnum = function(enumIdentifier, name) {
      return enumIdentifier[name];
    };
    return ReflectionCapabilities2;
  }()
);
function convertTsickleDecoratorIntoMetadata(decoratorInvocations) {
  if (!decoratorInvocations) {
    return [];
  }
  return decoratorInvocations.map(function(decoratorInvocation) {
    var decoratorType = decoratorInvocation.type;
    var annotationCls = decoratorType.annotationCls;
    var annotationArgs = decoratorInvocation.args ? decoratorInvocation.args : [];
    return new (annotationCls.bind.apply(annotationCls, __spread([void 0], annotationArgs)))();
  });
}
function getParentCtor(ctor) {
  var parentProto = ctor.prototype ? Object.getPrototypeOf(ctor.prototype) : null;
  var parentCtor = parentProto ? parentProto.constructor : null;
  return parentCtor || Object;
}
function getClosureSafeProperty(objWithPropertyToExtract, target) {
  for (var key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === target) {
      return key;
    }
  }
  throw Error("Could not find renamed property on target object.");
}
function forwardRef(forwardRefFn) {
  forwardRefFn.__forward_ref__ = forwardRef;
  forwardRefFn.toString = function() {
    return stringify(this());
  };
  return forwardRefFn;
}
function resolveForwardRef(type) {
  if (typeof type === "function" && type.hasOwnProperty("__forward_ref__") && type.__forward_ref__ === forwardRef) {
    return type();
  } else {
    return type;
  }
}
var Inject = makeParamDecorator("Inject", function(token) {
  return {
    token
  };
});
var Optional = makeParamDecorator("Optional");
var Self = makeParamDecorator("Self");
var SkipSelf = makeParamDecorator("SkipSelf");
var Host = makeParamDecorator("Host");
var SOURCE = "__source";
var _THROW_IF_NOT_FOUND = new Object();
var THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
var INJECTOR = new InjectionToken("INJECTOR");
var NullInjector = (
  /** @class */
  function() {
    function NullInjector2() {
    }
    NullInjector2.prototype.get = function(token, notFoundValue) {
      if (notFoundValue === void 0) {
        notFoundValue = _THROW_IF_NOT_FOUND;
      }
      if (notFoundValue === _THROW_IF_NOT_FOUND) {
        throw new Error("NullInjectorError: No provider for " + stringify(token) + "!");
      }
      return notFoundValue;
    };
    return NullInjector2;
  }()
);
var Injector = (
  /** @class */
  function() {
    function Injector2() {
    }
    Injector2.create = function(options, parent) {
      if (Array.isArray(options)) {
        return new StaticInjector(options, parent);
      } else {
        return new StaticInjector(options.providers, options.parent, options.name || null);
      }
    };
    Injector2.THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
    Injector2.NULL = new NullInjector();
    Injector2.ngInjectableDef = defineInjectable({
      providedIn: "any",
      factory: function() {
        return inject(INJECTOR);
      }
    });
    return Injector2;
  }()
);
var IDENT = function(value) {
  return value;
};
var EMPTY2 = [];
var CIRCULAR = IDENT;
var MULTI_PROVIDER_FN = function() {
  return Array.prototype.slice.call(arguments);
};
var GET_PROPERTY_NAME = {};
var USE_VALUE = getClosureSafeProperty$1({
  provide: String,
  useValue: GET_PROPERTY_NAME
});
var NG_TOKEN_PATH = "ngTokenPath";
var NG_TEMP_TOKEN_PATH = "ngTempTokenPath";
var NULL_INJECTOR = Injector.NULL;
var NEW_LINE = /\n/gm;
var NO_NEW_LINE = "ɵ";
var StaticInjector = (
  /** @class */
  function() {
    function StaticInjector2(providers, parent, source) {
      if (parent === void 0) {
        parent = NULL_INJECTOR;
      }
      if (source === void 0) {
        source = null;
      }
      this.parent = parent;
      this.source = source;
      var records = this._records = /* @__PURE__ */ new Map();
      records.set(Injector, {
        token: Injector,
        fn: IDENT,
        deps: EMPTY2,
        value: this,
        useNew: false
      });
      records.set(INJECTOR, {
        token: INJECTOR,
        fn: IDENT,
        deps: EMPTY2,
        value: this,
        useNew: false
      });
      recursivelyProcessProviders(records, providers);
    }
    StaticInjector2.prototype.get = function(token, notFoundValue, flags) {
      if (flags === void 0) {
        flags = 0;
      }
      var record = this._records.get(token);
      try {
        return tryResolveToken(token, record, this._records, this.parent, notFoundValue, flags);
      } catch (e) {
        var tokenPath = e[NG_TEMP_TOKEN_PATH];
        if (token[SOURCE]) {
          tokenPath.unshift(token[SOURCE]);
        }
        e.message = formatError("\n" + e.message, tokenPath, this.source);
        e[NG_TOKEN_PATH] = tokenPath;
        e[NG_TEMP_TOKEN_PATH] = null;
        throw e;
      }
    };
    StaticInjector2.prototype.toString = function() {
      var tokens = [], records = this._records;
      records.forEach(function(v, token) {
        return tokens.push(stringify(token));
      });
      return "StaticInjector[" + tokens.join(", ") + "]";
    };
    return StaticInjector2;
  }()
);
function resolveProvider(provider) {
  var deps = computeDeps(provider);
  var fn = IDENT;
  var value = EMPTY2;
  var useNew = false;
  var provide = resolveForwardRef(provider.provide);
  if (USE_VALUE in provider) {
    value = provider.useValue;
  } else if (provider.useFactory) {
    fn = provider.useFactory;
  } else if (provider.useExisting) ;
  else if (provider.useClass) {
    useNew = true;
    fn = resolveForwardRef(provider.useClass);
  } else if (typeof provide == "function") {
    useNew = true;
    fn = provide;
  } else {
    throw staticError("StaticProvider does not have [useValue|useFactory|useExisting|useClass] or [provide] is not newable", provider);
  }
  return {
    deps,
    fn,
    useNew,
    value
  };
}
function multiProviderMixError(token) {
  return staticError("Cannot mix multi providers and regular providers", token);
}
function recursivelyProcessProviders(records, provider) {
  if (provider) {
    provider = resolveForwardRef(provider);
    if (provider instanceof Array) {
      for (var i = 0; i < provider.length; i++) {
        recursivelyProcessProviders(records, provider[i]);
      }
    } else if (typeof provider === "function") {
      throw staticError("Function/Class not supported", provider);
    } else if (provider && typeof provider === "object" && provider.provide) {
      var token = resolveForwardRef(provider.provide);
      var resolvedProvider = resolveProvider(provider);
      if (provider.multi === true) {
        var multiProvider = records.get(token);
        if (multiProvider) {
          if (multiProvider.fn !== MULTI_PROVIDER_FN) {
            throw multiProviderMixError(token);
          }
        } else {
          records.set(token, multiProvider = {
            token: provider.provide,
            deps: [],
            useNew: false,
            fn: MULTI_PROVIDER_FN,
            value: EMPTY2
          });
        }
        token = provider;
        multiProvider.deps.push({
          token,
          options: 6
          /* Default */
        });
      }
      var record = records.get(token);
      if (record && record.fn == MULTI_PROVIDER_FN) {
        throw multiProviderMixError(token);
      }
      records.set(token, resolvedProvider);
    } else {
      throw staticError("Unexpected provider", provider);
    }
  }
}
function tryResolveToken(token, record, records, parent, notFoundValue, flags) {
  try {
    return resolveToken(token, record, records, parent, notFoundValue, flags);
  } catch (e) {
    if (!(e instanceof Error)) {
      e = new Error(e);
    }
    var path = e[NG_TEMP_TOKEN_PATH] = e[NG_TEMP_TOKEN_PATH] || [];
    path.unshift(token);
    if (record && record.value == CIRCULAR) {
      record.value = EMPTY2;
    }
    throw e;
  }
}
function resolveToken(token, record, records, parent, notFoundValue, flags) {
  var _a;
  var value;
  if (record && !(flags & 4)) {
    value = record.value;
    if (value == CIRCULAR) {
      throw Error(NO_NEW_LINE + "Circular dependency");
    } else if (value === EMPTY2) {
      record.value = CIRCULAR;
      var obj = void 0;
      var useNew = record.useNew;
      var fn = record.fn;
      var depRecords = record.deps;
      var deps = EMPTY2;
      if (depRecords.length) {
        deps = [];
        for (var i = 0; i < depRecords.length; i++) {
          var depRecord = depRecords[i];
          var options = depRecord.options;
          var childRecord = options & 2 ? records.get(depRecord.token) : void 0;
          deps.push(tryResolveToken(
            // Current Token to resolve
            depRecord.token,
            // A record which describes how to resolve the token.
            // If undefined, this means we don't have such a record
            childRecord,
            // Other records we know about.
            records,
            // If we don't know how to resolve dependency and we should not check parent for it,
            // than pass in Null injector.
            !childRecord && !(options & 4) ? NULL_INJECTOR : parent,
            options & 1 ? null : Injector.THROW_IF_NOT_FOUND,
            0
            /* Default */
          ));
        }
      }
      record.value = value = useNew ? new ((_a = fn).bind.apply(_a, __spread([void 0], deps)))() : fn.apply(obj, deps);
    }
  } else if (!(flags & 2)) {
    value = parent.get(
      token,
      notFoundValue,
      0
      /* Default */
    );
  }
  return value;
}
function computeDeps(provider) {
  var deps = EMPTY2;
  var providerDeps = provider.deps;
  if (providerDeps && providerDeps.length) {
    deps = [];
    for (var i = 0; i < providerDeps.length; i++) {
      var options = 6;
      var token = resolveForwardRef(providerDeps[i]);
      if (token instanceof Array) {
        for (var j = 0, annotations = token; j < annotations.length; j++) {
          var annotation = annotations[j];
          if (annotation instanceof Optional || annotation == Optional) {
            options = options | 1;
          } else if (annotation instanceof SkipSelf || annotation == SkipSelf) {
            options = options & ~2;
          } else if (annotation instanceof Self || annotation == Self) {
            options = options & ~4;
          } else if (annotation instanceof Inject) {
            token = annotation.token;
          } else {
            token = resolveForwardRef(annotation);
          }
        }
      }
      deps.push({
        token,
        options
      });
    }
  } else if (provider.useExisting) {
    var token = resolveForwardRef(provider.useExisting);
    deps = [{
      token,
      options: 6
      /* Default */
    }];
  } else if (!providerDeps && !(USE_VALUE in provider)) {
    throw staticError("'deps' required", provider);
  }
  return deps;
}
function formatError(text, obj, source) {
  if (source === void 0) {
    source = null;
  }
  text = text && text.charAt(0) === "\n" && text.charAt(1) == NO_NEW_LINE ? text.substr(2) : text;
  var context = stringify(obj);
  if (obj instanceof Array) {
    context = obj.map(stringify).join(" -> ");
  } else if (typeof obj === "object") {
    var parts = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var value = obj[key];
        parts.push(key + ":" + (typeof value === "string" ? JSON.stringify(value) : stringify(value)));
      }
    }
    context = "{" + parts.join(", ") + "}";
  }
  return "StaticInjectorError" + (source ? "(" + source + ")" : "") + "[" + context + "]: " + text.replace(NEW_LINE, "\n  ");
}
function staticError(text, obj) {
  return new Error(formatError(text, obj));
}
function getClosureSafeProperty$1(objWithPropertyToExtract) {
  for (var key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === GET_PROPERTY_NAME) {
      return key;
    }
  }
  throw Error("!prop");
}
var _currentInjector = void 0;
function setCurrentInjector(injector) {
  var former = _currentInjector;
  _currentInjector = injector;
  return former;
}
function inject(token, flags) {
  if (flags === void 0) {
    flags = 0;
  }
  if (_currentInjector === void 0) {
    throw new Error("inject() must be called from an injection context");
  } else if (_currentInjector === null) {
    var injectableDef = token.ngInjectableDef;
    if (injectableDef && injectableDef.providedIn == "root") {
      return injectableDef.value === void 0 ? injectableDef.value = injectableDef.factory() : injectableDef.value;
    }
    if (flags & 8) return null;
    throw new Error("Injector: NOT_FOUND [" + stringify(token) + "]");
  } else {
    return _currentInjector.get(token, flags & 8 ? null : void 0, flags);
  }
}
function injectArgs(types) {
  var args = [];
  for (var i = 0; i < types.length; i++) {
    var arg = types[i];
    if (Array.isArray(arg)) {
      if (arg.length === 0) {
        throw new Error("Arguments array must have arguments.");
      }
      var type = void 0;
      var flags = 0;
      for (var j = 0; j < arg.length; j++) {
        var meta = arg[j];
        if (meta instanceof Optional || meta.ngMetadataName === "Optional") {
          flags |= 8;
        } else if (meta instanceof SkipSelf || meta.ngMetadataName === "SkipSelf") {
          flags |= 4;
        } else if (meta instanceof Self || meta.ngMetadataName === "Self") {
          flags |= 2;
        } else if (meta instanceof Inject) {
          type = meta.token;
        } else {
          type = meta;
        }
      }
      args.push(inject(type, flags));
    } else {
      args.push(inject(arg));
    }
  }
  return args;
}
var GET_PROPERTY_NAME$1 = {};
var ɵ0$1 = GET_PROPERTY_NAME$1;
var USE_VALUE$1 = getClosureSafeProperty({
  provide: String,
  useValue: ɵ0$1
}, GET_PROPERTY_NAME$1);
var EMPTY_ARRAY = [];
function convertInjectableProviderToFactory(type, provider) {
  if (!provider) {
    var reflectionCapabilities = new ReflectionCapabilities();
    var deps_1 = reflectionCapabilities.parameters(type);
    return function() {
      return new (type.bind.apply(type, __spread([void 0], injectArgs(deps_1))))();
    };
  }
  if (USE_VALUE$1 in provider) {
    var valueProvider_1 = provider;
    return function() {
      return valueProvider_1.useValue;
    };
  } else if (provider.useExisting) {
    var existingProvider_1 = provider;
    return function() {
      return inject(existingProvider_1.useExisting);
    };
  } else if (provider.useFactory) {
    var factoryProvider_1 = provider;
    return function() {
      return factoryProvider_1.useFactory.apply(factoryProvider_1, __spread(injectArgs(factoryProvider_1.deps || EMPTY_ARRAY)));
    };
  } else if (provider.useClass) {
    var classProvider_1 = provider;
    var deps_2 = provider.deps;
    if (!deps_2) {
      var reflectionCapabilities = new ReflectionCapabilities();
      deps_2 = reflectionCapabilities.parameters(type);
    }
    return function() {
      var _a;
      return new ((_a = classProvider_1.useClass).bind.apply(_a, __spread([void 0], injectArgs(deps_2))))();
    };
  } else {
    var deps_3 = provider.deps;
    if (!deps_3) {
      var reflectionCapabilities = new ReflectionCapabilities();
      deps_3 = reflectionCapabilities.parameters(type);
    }
    return function() {
      return new (type.bind.apply(type, __spread([void 0], injectArgs(deps_3))))();
    };
  }
}
function preR3InjectableCompile(injectableType, options) {
  if (options && options.providedIn !== void 0 && injectableType.ngInjectableDef === void 0) {
    injectableType.ngInjectableDef = defineInjectable({
      providedIn: options.providedIn,
      factory: convertInjectableProviderToFactory(injectableType, options)
    });
  }
}
var Injectable = makeDecorator("Injectable", void 0, void 0, void 0, function(type, meta) {
  return preR3InjectableCompile(type, meta);
});
function preR3NgModuleCompile(moduleType, metadata) {
  var imports = metadata && metadata.imports || [];
  if (metadata && metadata.exports) {
    imports = __spread(imports, [metadata.exports]);
  }
  moduleType.ngInjectorDef = defineInjector({
    factory: convertInjectableProviderToFactory(moduleType, {
      useClass: moduleType
    }),
    providers: metadata && metadata.providers,
    imports
  });
}
var NgModule = makeDecorator(
  "NgModule",
  function(ngModule) {
    return ngModule;
  },
  void 0,
  void 0,
  /**
   * Decorator that marks the following class as an NgModule, and supplies
   * configuration metadata for it.
   *
   * * The `declarations` and `entryComponents` options configure the compiler
   * with information about what belongs to the NgModule.
   * * The `providers` options configures the NgModule's injector to provide
   * dependencies the NgModule members.
   * * The `imports` and `exports` options bring in members from other modules, and make
   * this module's members available to others.
   */
  function(type, meta) {
    return preR3NgModuleCompile(type, meta);
  }
);
var ViewEncapsulation;
(function(ViewEncapsulation2) {
  ViewEncapsulation2[ViewEncapsulation2["Emulated"] = 0] = "Emulated";
  ViewEncapsulation2[ViewEncapsulation2["Native"] = 1] = "Native";
  ViewEncapsulation2[ViewEncapsulation2["None"] = 2] = "None";
  ViewEncapsulation2[ViewEncapsulation2["ShadowDom"] = 3] = "ShadowDom";
})(ViewEncapsulation || (ViewEncapsulation = {}));
var Version = (
  /** @class */
  /* @__PURE__ */ function() {
    function Version2(full) {
      this.full = full;
      this.major = full.split(".")[0];
      this.minor = full.split(".")[1];
      this.patch = full.split(".").slice(2).join(".");
    }
    return Version2;
  }()
);
var VERSION = new Version("6.1.10");
var ERROR_DEBUG_CONTEXT = "ngDebugContext";
var ERROR_ORIGINAL_ERROR = "ngOriginalError";
var ERROR_LOGGER = "ngErrorLogger";
function getDebugContext(error) {
  return error[ERROR_DEBUG_CONTEXT];
}
function getOriginalError(error) {
  return error[ERROR_ORIGINAL_ERROR];
}
function getErrorLogger(error) {
  return error[ERROR_LOGGER] || defaultErrorLogger;
}
function defaultErrorLogger(console2) {
  var values = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    values[_i - 1] = arguments[_i];
  }
  console2.error.apply(console2, __spread(values));
}
var ErrorHandler = (
  /** @class */
  function() {
    function ErrorHandler2() {
      this._console = console;
    }
    ErrorHandler2.prototype.handleError = function(error) {
      var originalError = this._findOriginalError(error);
      var context = this._findContext(error);
      var errorLogger = getErrorLogger(error);
      errorLogger(this._console, "ERROR", error);
      if (originalError) {
        errorLogger(this._console, "ORIGINAL ERROR", originalError);
      }
      if (context) {
        errorLogger(this._console, "ERROR CONTEXT", context);
      }
    };
    ErrorHandler2.prototype._findContext = function(error) {
      if (error) {
        return getDebugContext(error) ? getDebugContext(error) : this._findContext(getOriginalError(error));
      }
      return null;
    };
    ErrorHandler2.prototype._findOriginalError = function(error) {
      var e = getOriginalError(error);
      while (e && getOriginalError(e)) {
        e = getOriginalError(e);
      }
      return e;
    };
    return ErrorHandler2;
  }()
);
function wrappedError(message, originalError) {
  var msg = message + " caused by: " + (originalError instanceof Error ? originalError.message : originalError);
  var error = Error(msg);
  error[ERROR_ORIGINAL_ERROR] = originalError;
  return error;
}
function findFirstClosedCycle(keys) {
  var res = [];
  for (var i = 0; i < keys.length; ++i) {
    if (res.indexOf(keys[i]) > -1) {
      res.push(keys[i]);
      return res;
    }
    res.push(keys[i]);
  }
  return res;
}
function constructResolvingPath(keys) {
  if (keys.length > 1) {
    var reversed = findFirstClosedCycle(keys.slice().reverse());
    var tokenStrs = reversed.map(function(k) {
      return stringify(k.token);
    });
    return " (" + tokenStrs.join(" -> ") + ")";
  }
  return "";
}
function injectionError(injector, key, constructResolvingMessage, originalError) {
  var keys = [key];
  var errMsg = constructResolvingMessage(keys);
  var error = originalError ? wrappedError(errMsg, originalError) : Error(errMsg);
  error.addKey = addKey;
  error.keys = keys;
  error.injectors = [injector];
  error.constructResolvingMessage = constructResolvingMessage;
  error[ERROR_ORIGINAL_ERROR] = originalError;
  return error;
}
function addKey(injector, key) {
  this.injectors.push(injector);
  this.keys.push(key);
  this.message = this.constructResolvingMessage(this.keys);
}
function noProviderError(injector, key) {
  return injectionError(injector, key, function(keys) {
    var first2 = stringify(keys[0].token);
    return "No provider for " + first2 + "!" + constructResolvingPath(keys);
  });
}
function cyclicDependencyError(injector, key) {
  return injectionError(injector, key, function(keys) {
    return "Cannot instantiate cyclic dependency!" + constructResolvingPath(keys);
  });
}
function instantiationError(injector, originalException, originalStack, key) {
  return injectionError(injector, key, function(keys) {
    var first2 = stringify(keys[0].token);
    return originalException.message + ": Error during instantiation of " + first2 + "!" + constructResolvingPath(keys) + ".";
  }, originalException);
}
function invalidProviderError(provider) {
  return Error("Invalid provider - only instances of Provider and Type are allowed, got: " + provider);
}
function noAnnotationError(typeOrFunc, params) {
  var signature = [];
  for (var i = 0, ii = params.length; i < ii; i++) {
    var parameter = params[i];
    if (!parameter || parameter.length == 0) {
      signature.push("?");
    } else {
      signature.push(parameter.map(stringify).join(" "));
    }
  }
  return Error("Cannot resolve all parameters for '" + stringify(typeOrFunc) + "'(" + signature.join(", ") + "). Make sure that all the parameters are decorated with Inject or have valid type annotations and that '" + stringify(typeOrFunc) + "' is decorated with Injectable.");
}
function outOfBoundsError(index) {
  return Error("Index " + index + " is out-of-bounds.");
}
function mixingMultiProvidersWithRegularProvidersError(provider1, provider2) {
  return Error("Cannot mix multi providers and regular providers, got: " + provider1 + " " + provider2);
}
var ReflectiveKey = (
  /** @class */
  function() {
    function ReflectiveKey2(token, id) {
      this.token = token;
      this.id = id;
      if (!token) {
        throw new Error("Token must be defined!");
      }
      this.displayName = stringify(this.token);
    }
    ReflectiveKey2.get = function(token) {
      return _globalKeyRegistry.get(resolveForwardRef(token));
    };
    Object.defineProperty(ReflectiveKey2, "numberOfKeys", {
      /**
       * @returns the number of keys registered in the system.
       */
      get: function() {
        return _globalKeyRegistry.numberOfKeys;
      },
      enumerable: true,
      configurable: true
    });
    return ReflectiveKey2;
  }()
);
var KeyRegistry = (
  /** @class */
  function() {
    function KeyRegistry2() {
      this._allKeys = /* @__PURE__ */ new Map();
    }
    KeyRegistry2.prototype.get = function(token) {
      if (token instanceof ReflectiveKey) return token;
      if (this._allKeys.has(token)) {
        return this._allKeys.get(token);
      }
      var newKey = new ReflectiveKey(token, ReflectiveKey.numberOfKeys);
      this._allKeys.set(token, newKey);
      return newKey;
    };
    Object.defineProperty(KeyRegistry2.prototype, "numberOfKeys", {
      get: function() {
        return this._allKeys.size;
      },
      enumerable: true,
      configurable: true
    });
    return KeyRegistry2;
  }()
);
var _globalKeyRegistry = new KeyRegistry();
var Reflector = (
  /** @class */
  function() {
    function Reflector2(reflectionCapabilities) {
      this.reflectionCapabilities = reflectionCapabilities;
    }
    Reflector2.prototype.updateCapabilities = function(caps) {
      this.reflectionCapabilities = caps;
    };
    Reflector2.prototype.factory = function(type) {
      return this.reflectionCapabilities.factory(type);
    };
    Reflector2.prototype.parameters = function(typeOrFunc) {
      return this.reflectionCapabilities.parameters(typeOrFunc);
    };
    Reflector2.prototype.annotations = function(typeOrFunc) {
      return this.reflectionCapabilities.annotations(typeOrFunc);
    };
    Reflector2.prototype.propMetadata = function(typeOrFunc) {
      return this.reflectionCapabilities.propMetadata(typeOrFunc);
    };
    Reflector2.prototype.hasLifecycleHook = function(type, lcProperty) {
      return this.reflectionCapabilities.hasLifecycleHook(type, lcProperty);
    };
    Reflector2.prototype.getter = function(name) {
      return this.reflectionCapabilities.getter(name);
    };
    Reflector2.prototype.setter = function(name) {
      return this.reflectionCapabilities.setter(name);
    };
    Reflector2.prototype.method = function(name) {
      return this.reflectionCapabilities.method(name);
    };
    Reflector2.prototype.importUri = function(type) {
      return this.reflectionCapabilities.importUri(type);
    };
    Reflector2.prototype.resourceUri = function(type) {
      return this.reflectionCapabilities.resourceUri(type);
    };
    Reflector2.prototype.resolveIdentifier = function(name, moduleUrl, members, runtime) {
      return this.reflectionCapabilities.resolveIdentifier(name, moduleUrl, members, runtime);
    };
    Reflector2.prototype.resolveEnum = function(identifier, name) {
      return this.reflectionCapabilities.resolveEnum(identifier, name);
    };
    return Reflector2;
  }()
);
var reflector = new Reflector(new ReflectionCapabilities());
var ReflectiveDependency = (
  /** @class */
  function() {
    function ReflectiveDependency2(key, optional, visibility) {
      this.key = key;
      this.optional = optional;
      this.visibility = visibility;
    }
    ReflectiveDependency2.fromKey = function(key) {
      return new ReflectiveDependency2(key, false, null);
    };
    return ReflectiveDependency2;
  }()
);
var _EMPTY_LIST = [];
var ResolvedReflectiveProvider_ = (
  /** @class */
  /* @__PURE__ */ function() {
    function ResolvedReflectiveProvider_2(key, resolvedFactories, multiProvider) {
      this.key = key;
      this.resolvedFactories = resolvedFactories;
      this.multiProvider = multiProvider;
      this.resolvedFactory = this.resolvedFactories[0];
    }
    return ResolvedReflectiveProvider_2;
  }()
);
var ResolvedReflectiveFactory = (
  /** @class */
  /* @__PURE__ */ function() {
    function ResolvedReflectiveFactory2(factory, dependencies) {
      this.factory = factory;
      this.dependencies = dependencies;
    }
    return ResolvedReflectiveFactory2;
  }()
);
function resolveReflectiveFactory(provider) {
  var factoryFn;
  var resolvedDeps;
  if (provider.useClass) {
    var useClass = resolveForwardRef(provider.useClass);
    factoryFn = reflector.factory(useClass);
    resolvedDeps = _dependenciesFor(useClass);
  } else if (provider.useExisting) {
    factoryFn = function(aliasInstance) {
      return aliasInstance;
    };
    resolvedDeps = [ReflectiveDependency.fromKey(ReflectiveKey.get(provider.useExisting))];
  } else if (provider.useFactory) {
    factoryFn = provider.useFactory;
    resolvedDeps = constructDependencies(provider.useFactory, provider.deps);
  } else {
    factoryFn = function() {
      return provider.useValue;
    };
    resolvedDeps = _EMPTY_LIST;
  }
  return new ResolvedReflectiveFactory(factoryFn, resolvedDeps);
}
function resolveReflectiveProvider(provider) {
  return new ResolvedReflectiveProvider_(ReflectiveKey.get(provider.provide), [resolveReflectiveFactory(provider)], provider.multi || false);
}
function resolveReflectiveProviders(providers) {
  var normalized = _normalizeProviders(providers, []);
  var resolved = normalized.map(resolveReflectiveProvider);
  var resolvedProviderMap = mergeResolvedReflectiveProviders(resolved, /* @__PURE__ */ new Map());
  return Array.from(resolvedProviderMap.values());
}
function mergeResolvedReflectiveProviders(providers, normalizedProvidersMap) {
  for (var i = 0; i < providers.length; i++) {
    var provider = providers[i];
    var existing = normalizedProvidersMap.get(provider.key.id);
    if (existing) {
      if (provider.multiProvider !== existing.multiProvider) {
        throw mixingMultiProvidersWithRegularProvidersError(existing, provider);
      }
      if (provider.multiProvider) {
        for (var j = 0; j < provider.resolvedFactories.length; j++) {
          existing.resolvedFactories.push(provider.resolvedFactories[j]);
        }
      } else {
        normalizedProvidersMap.set(provider.key.id, provider);
      }
    } else {
      var resolvedProvider = void 0;
      if (provider.multiProvider) {
        resolvedProvider = new ResolvedReflectiveProvider_(provider.key, provider.resolvedFactories.slice(), provider.multiProvider);
      } else {
        resolvedProvider = provider;
      }
      normalizedProvidersMap.set(provider.key.id, resolvedProvider);
    }
  }
  return normalizedProvidersMap;
}
function _normalizeProviders(providers, res) {
  providers.forEach(function(b) {
    if (b instanceof Type) {
      res.push({
        provide: b,
        useClass: b
      });
    } else if (b && typeof b == "object" && b.provide !== void 0) {
      res.push(b);
    } else if (b instanceof Array) {
      _normalizeProviders(b, res);
    } else {
      throw invalidProviderError(b);
    }
  });
  return res;
}
function constructDependencies(typeOrFunc, dependencies) {
  if (!dependencies) {
    return _dependenciesFor(typeOrFunc);
  } else {
    var params_1 = dependencies.map(function(t) {
      return [t];
    });
    return dependencies.map(function(t) {
      return _extractToken(typeOrFunc, t, params_1);
    });
  }
}
function _dependenciesFor(typeOrFunc) {
  var params = reflector.parameters(typeOrFunc);
  if (!params) return [];
  if (params.some(function(p) {
    return p == null;
  })) {
    throw noAnnotationError(typeOrFunc, params);
  }
  return params.map(function(p) {
    return _extractToken(typeOrFunc, p, params);
  });
}
function _extractToken(typeOrFunc, metadata, params) {
  var token = null;
  var optional = false;
  if (!Array.isArray(metadata)) {
    if (metadata instanceof Inject) {
      return _createDependency(metadata.token, optional, null);
    } else {
      return _createDependency(metadata, optional, null);
    }
  }
  var visibility = null;
  for (var i = 0; i < metadata.length; ++i) {
    var paramMetadata = metadata[i];
    if (paramMetadata instanceof Type) {
      token = paramMetadata;
    } else if (paramMetadata instanceof Inject) {
      token = paramMetadata.token;
    } else if (paramMetadata instanceof Optional) {
      optional = true;
    } else if (paramMetadata instanceof Self || paramMetadata instanceof SkipSelf) {
      visibility = paramMetadata;
    } else if (paramMetadata instanceof InjectionToken) {
      token = paramMetadata;
    }
  }
  token = resolveForwardRef(token);
  if (token != null) {
    return _createDependency(token, optional, visibility);
  } else {
    throw noAnnotationError(typeOrFunc, params);
  }
}
function _createDependency(token, optional, visibility) {
  return new ReflectiveDependency(ReflectiveKey.get(token), optional, visibility);
}
var UNDEFINED = new Object();
var ReflectiveInjector = (
  /** @class */
  function() {
    function ReflectiveInjector2() {
    }
    ReflectiveInjector2.resolve = function(providers) {
      return resolveReflectiveProviders(providers);
    };
    ReflectiveInjector2.resolveAndCreate = function(providers, parent) {
      var ResolvedReflectiveProviders = ReflectiveInjector2.resolve(providers);
      return ReflectiveInjector2.fromResolvedProviders(ResolvedReflectiveProviders, parent);
    };
    ReflectiveInjector2.fromResolvedProviders = function(providers, parent) {
      return new ReflectiveInjector_(providers, parent);
    };
    return ReflectiveInjector2;
  }()
);
var ReflectiveInjector_ = (
  /** @class */
  function() {
    function ReflectiveInjector_2(_providers, _parent) {
      this._constructionCounter = 0;
      this._providers = _providers;
      this.parent = _parent || null;
      var len = _providers.length;
      this.keyIds = new Array(len);
      this.objs = new Array(len);
      for (var i = 0; i < len; i++) {
        this.keyIds[i] = _providers[i].key.id;
        this.objs[i] = UNDEFINED;
      }
    }
    ReflectiveInjector_2.prototype.get = function(token, notFoundValue) {
      if (notFoundValue === void 0) {
        notFoundValue = THROW_IF_NOT_FOUND;
      }
      return this._getByKey(ReflectiveKey.get(token), null, notFoundValue);
    };
    ReflectiveInjector_2.prototype.resolveAndCreateChild = function(providers) {
      var ResolvedReflectiveProviders = ReflectiveInjector.resolve(providers);
      return this.createChildFromResolved(ResolvedReflectiveProviders);
    };
    ReflectiveInjector_2.prototype.createChildFromResolved = function(providers) {
      var inj = new ReflectiveInjector_2(providers);
      inj.parent = this;
      return inj;
    };
    ReflectiveInjector_2.prototype.resolveAndInstantiate = function(provider) {
      return this.instantiateResolved(ReflectiveInjector.resolve([provider])[0]);
    };
    ReflectiveInjector_2.prototype.instantiateResolved = function(provider) {
      return this._instantiateProvider(provider);
    };
    ReflectiveInjector_2.prototype.getProviderAtIndex = function(index) {
      if (index < 0 || index >= this._providers.length) {
        throw outOfBoundsError(index);
      }
      return this._providers[index];
    };
    ReflectiveInjector_2.prototype._new = function(provider) {
      if (this._constructionCounter++ > this._getMaxNumberOfObjects()) {
        throw cyclicDependencyError(this, provider.key);
      }
      return this._instantiateProvider(provider);
    };
    ReflectiveInjector_2.prototype._getMaxNumberOfObjects = function() {
      return this.objs.length;
    };
    ReflectiveInjector_2.prototype._instantiateProvider = function(provider) {
      if (provider.multiProvider) {
        var res = new Array(provider.resolvedFactories.length);
        for (var i = 0; i < provider.resolvedFactories.length; ++i) {
          res[i] = this._instantiate(provider, provider.resolvedFactories[i]);
        }
        return res;
      } else {
        return this._instantiate(provider, provider.resolvedFactories[0]);
      }
    };
    ReflectiveInjector_2.prototype._instantiate = function(provider, ResolvedReflectiveFactory$$1) {
      var _this = this;
      var factory = ResolvedReflectiveFactory$$1.factory;
      var deps;
      try {
        deps = ResolvedReflectiveFactory$$1.dependencies.map(function(dep) {
          return _this._getByReflectiveDependency(dep);
        });
      } catch (e) {
        if (e.addKey) {
          e.addKey(this, provider.key);
        }
        throw e;
      }
      var obj;
      try {
        obj = factory.apply(void 0, __spread(deps));
      } catch (e) {
        throw instantiationError(this, e, e.stack, provider.key);
      }
      return obj;
    };
    ReflectiveInjector_2.prototype._getByReflectiveDependency = function(dep) {
      return this._getByKey(dep.key, dep.visibility, dep.optional ? null : THROW_IF_NOT_FOUND);
    };
    ReflectiveInjector_2.prototype._getByKey = function(key, visibility, notFoundValue) {
      if (key === ReflectiveInjector_2.INJECTOR_KEY) {
        return this;
      }
      if (visibility instanceof Self) {
        return this._getByKeySelf(key, notFoundValue);
      } else {
        return this._getByKeyDefault(key, notFoundValue, visibility);
      }
    };
    ReflectiveInjector_2.prototype._getObjByKeyId = function(keyId) {
      for (var i = 0; i < this.keyIds.length; i++) {
        if (this.keyIds[i] === keyId) {
          if (this.objs[i] === UNDEFINED) {
            this.objs[i] = this._new(this._providers[i]);
          }
          return this.objs[i];
        }
      }
      return UNDEFINED;
    };
    ReflectiveInjector_2.prototype._throwOrNull = function(key, notFoundValue) {
      if (notFoundValue !== THROW_IF_NOT_FOUND) {
        return notFoundValue;
      } else {
        throw noProviderError(this, key);
      }
    };
    ReflectiveInjector_2.prototype._getByKeySelf = function(key, notFoundValue) {
      var obj = this._getObjByKeyId(key.id);
      return obj !== UNDEFINED ? obj : this._throwOrNull(key, notFoundValue);
    };
    ReflectiveInjector_2.prototype._getByKeyDefault = function(key, notFoundValue, visibility) {
      var inj;
      if (visibility instanceof SkipSelf) {
        inj = this.parent;
      } else {
        inj = this;
      }
      while (inj instanceof ReflectiveInjector_2) {
        var inj_ = inj;
        var obj = inj_._getObjByKeyId(key.id);
        if (obj !== UNDEFINED) return obj;
        inj = inj_.parent;
      }
      if (inj !== null) {
        return inj.get(key.token, notFoundValue);
      } else {
        return this._throwOrNull(key, notFoundValue);
      }
    };
    Object.defineProperty(ReflectiveInjector_2.prototype, "displayName", {
      get: function() {
        var providers = _mapProviders(this, function(b) {
          return ' "' + b.key.displayName + '" ';
        }).join(", ");
        return "ReflectiveInjector(providers: [" + providers + "])";
      },
      enumerable: true,
      configurable: true
    });
    ReflectiveInjector_2.prototype.toString = function() {
      return this.displayName;
    };
    ReflectiveInjector_2.INJECTOR_KEY = ReflectiveKey.get(Injector);
    return ReflectiveInjector_2;
  }()
);
function _mapProviders(injector, fn) {
  var res = new Array(injector._providers.length);
  for (var i = 0; i < injector._providers.length; ++i) {
    res[i] = fn(injector.getProviderAtIndex(i));
  }
  return res;
}
var APP_ROOT = new InjectionToken("The presence of this token marks an injector as being the root injector.");
var NOT_YET = {};
var CIRCULAR$1 = {};
var EMPTY_ARRAY$1 = [];
var NULL_INJECTOR$1 = void 0;
function getNullInjector() {
  if (NULL_INJECTOR$1 === void 0) {
    NULL_INJECTOR$1 = new NullInjector();
  }
  return NULL_INJECTOR$1;
}
function createInjector(defType, parent, additionalProviders) {
  if (parent === void 0) {
    parent = null;
  }
  if (additionalProviders === void 0) {
    additionalProviders = null;
  }
  parent = parent || getNullInjector();
  return new R3Injector(defType, additionalProviders, parent);
}
var R3Injector = (
  /** @class */
  function() {
    function R3Injector2(def, additionalProviders, parent) {
      var _this = this;
      this.parent = parent;
      this.records = /* @__PURE__ */ new Map();
      this.injectorDefTypes = /* @__PURE__ */ new Set();
      this.onDestroy = /* @__PURE__ */ new Set();
      this.destroyed = false;
      deepForEach([def], function(injectorDef) {
        return _this.processInjectorType(injectorDef, /* @__PURE__ */ new Set());
      });
      additionalProviders && deepForEach(additionalProviders, function(provider) {
        return _this.processProvider(provider);
      });
      this.records.set(INJECTOR, makeRecord(void 0, this));
      this.isRootInjector = this.records.has(APP_ROOT);
      this.injectorDefTypes.forEach(function(defType) {
        return _this.get(defType);
      });
    }
    R3Injector2.prototype.destroy = function() {
      this.assertNotDestroyed();
      this.destroyed = true;
      try {
        this.onDestroy.forEach(function(service) {
          return service.ngOnDestroy();
        });
      } finally {
        this.records.clear();
        this.onDestroy.clear();
        this.injectorDefTypes.clear();
      }
    };
    R3Injector2.prototype.get = function(token, notFoundValue, flags) {
      if (notFoundValue === void 0) {
        notFoundValue = THROW_IF_NOT_FOUND;
      }
      if (flags === void 0) {
        flags = 0;
      }
      this.assertNotDestroyed();
      var previousInjector = setCurrentInjector(this);
      try {
        if (!(flags & 4)) {
          var record = this.records.get(token);
          if (record === void 0) {
            var def = couldBeInjectableType(token) && token.ngInjectableDef || void 0;
            if (def !== void 0 && this.injectableDefInScope(def)) {
              record = injectableDefRecord(token);
              this.records.set(token, record);
            }
          }
          if (record !== void 0) {
            return this.hydrate(token, record);
          }
        }
        var next = !(flags & 2) ? this.parent : getNullInjector();
        return this.parent.get(token, notFoundValue);
      } finally {
        setCurrentInjector(previousInjector);
      }
    };
    R3Injector2.prototype.assertNotDestroyed = function() {
      if (this.destroyed) {
        throw new Error("Injector has already been destroyed.");
      }
    };
    R3Injector2.prototype.processInjectorType = function(defOrWrappedDef, parents) {
      var _this = this;
      defOrWrappedDef = resolveForwardRef(defOrWrappedDef);
      var def = defOrWrappedDef.ngInjectorDef;
      var ngModule = def == null && defOrWrappedDef.ngModule || void 0;
      var defType = ngModule === void 0 ? defOrWrappedDef : ngModule;
      var providers = ngModule !== void 0 && defOrWrappedDef.providers || EMPTY_ARRAY$1;
      if (ngModule !== void 0) {
        def = ngModule.ngInjectorDef;
      }
      if (def == null) {
        return;
      }
      if (parents.has(defType)) {
        throw new Error("Circular dependency: type " + stringify(defType) + " ends up importing itself.");
      }
      this.injectorDefTypes.add(defType);
      this.records.set(defType, makeRecord(def.factory));
      if (def.imports != null) {
        parents.add(defType);
        try {
          deepForEach(def.imports, function(imported) {
            return _this.processInjectorType(imported, parents);
          });
        } finally {
          parents.delete(defType);
        }
      }
      if (def.providers != null) {
        deepForEach(def.providers, function(provider) {
          return _this.processProvider(provider);
        });
      }
      deepForEach(providers, function(provider) {
        return _this.processProvider(provider);
      });
    };
    R3Injector2.prototype.processProvider = function(provider) {
      provider = resolveForwardRef(provider);
      var token = isTypeProvider(provider) ? provider : resolveForwardRef(provider.provide);
      var record = providerToRecord(provider);
      if (!isTypeProvider(provider) && provider.multi === true) {
        var multiRecord_1 = this.records.get(token);
        if (multiRecord_1) {
          if (multiRecord_1.multi === void 0) {
            throw new Error("Mixed multi-provider for " + token + ".");
          }
        } else {
          multiRecord_1 = makeRecord(void 0, NOT_YET, true);
          multiRecord_1.factory = function() {
            return injectArgs(multiRecord_1.multi);
          };
          this.records.set(token, multiRecord_1);
        }
        token = provider;
        multiRecord_1.multi.push(provider);
      } else {
        var existing = this.records.get(token);
        if (existing && existing.multi !== void 0) {
          throw new Error("Mixed multi-provider for " + stringify(token));
        }
      }
      this.records.set(token, record);
    };
    R3Injector2.prototype.hydrate = function(token, record) {
      if (record.value === CIRCULAR$1) {
        throw new Error("Circular dep for " + stringify(token));
      } else if (record.value === NOT_YET) {
        record.value = CIRCULAR$1;
        record.value = record.factory();
      }
      if (typeof record.value === "object" && record.value && hasOnDestroy(record.value)) {
        this.onDestroy.add(record.value);
      }
      return record.value;
    };
    R3Injector2.prototype.injectableDefInScope = function(def) {
      if (!def.providedIn) {
        return false;
      } else if (typeof def.providedIn === "string") {
        return def.providedIn === "any" || def.providedIn === "root" && this.isRootInjector;
      } else {
        return this.injectorDefTypes.has(def.providedIn);
      }
    };
    return R3Injector2;
  }()
);
function injectableDefRecord(token) {
  var def = token.ngInjectableDef;
  if (def === void 0) {
    if (token instanceof InjectionToken) {
      throw new Error("Token " + stringify(token) + " is missing an ngInjectableDef definition.");
    }
    return makeRecord(function() {
      return new token();
    });
  }
  return makeRecord(def.factory);
}
function providerToRecord(provider) {
  var token = resolveForwardRef(provider);
  var value = NOT_YET;
  var factory = void 0;
  if (isTypeProvider(provider)) {
    return injectableDefRecord(provider);
  } else {
    token = resolveForwardRef(provider.provide);
    if (isValueProvider(provider)) {
      value = provider.useValue;
    } else if (isExistingProvider(provider)) {
      factory = function() {
        return inject(provider.useExisting);
      };
    } else if (isFactoryProvider(provider)) {
      factory = function() {
        return provider.useFactory.apply(provider, __spread(injectArgs(provider.deps || [])));
      };
    } else {
      var classRef_1 = provider.useClass || token;
      if (hasDeps(provider)) {
        factory = function() {
          return new (classRef_1.bind.apply(classRef_1, __spread([void 0], injectArgs(provider.deps))))();
        };
      } else {
        return injectableDefRecord(classRef_1);
      }
    }
  }
  return makeRecord(factory, value);
}
function makeRecord(factory, value, multi) {
  if (value === void 0) {
    value = NOT_YET;
  }
  if (multi === void 0) {
    multi = false;
  }
  return {
    factory,
    value,
    multi: multi ? [] : void 0
  };
}
function deepForEach(input, fn) {
  input.forEach(function(value) {
    return Array.isArray(value) ? deepForEach(value, fn) : fn(value);
  });
}
function isValueProvider(value) {
  return USE_VALUE in value;
}
function isExistingProvider(value) {
  return !!value.useExisting;
}
function isFactoryProvider(value) {
  return !!value.useFactory;
}
function isTypeProvider(value) {
  return typeof value === "function";
}
function hasDeps(value) {
  return !!value.deps;
}
function hasOnDestroy(value) {
  return typeof value === "object" && value != null && value.ngOnDestroy && typeof value.ngOnDestroy === "function";
}
function couldBeInjectableType(value) {
  return typeof value === "function" || typeof value === "object" && value instanceof InjectionToken;
}
function isPromise2(obj) {
  return !!obj && typeof obj.then === "function";
}
var APP_INITIALIZER = new InjectionToken("Application Initializer");
var ApplicationInitStatus = (
  /** @class */
  function() {
    function ApplicationInitStatus2(appInits) {
      var _this = this;
      this.appInits = appInits;
      this.initialized = false;
      this.done = false;
      this.donePromise = new Promise(function(res, rej) {
        _this.resolve = res;
        _this.reject = rej;
      });
    }
    ApplicationInitStatus2.prototype.runInitializers = function() {
      var _this = this;
      if (this.initialized) {
        return;
      }
      var asyncInitPromises = [];
      var complete = function() {
        _this.done = true;
        _this.resolve();
      };
      if (this.appInits) {
        for (var i = 0; i < this.appInits.length; i++) {
          var initResult = this.appInits[i]();
          if (isPromise2(initResult)) {
            asyncInitPromises.push(initResult);
          }
        }
      }
      Promise.all(asyncInitPromises).then(function() {
        complete();
      }).catch(function(e) {
        _this.reject(e);
      });
      if (asyncInitPromises.length === 0) {
        complete();
      }
      this.initialized = true;
    };
    ApplicationInitStatus2 = __decorate([Injectable(), __param(0, Inject(APP_INITIALIZER)), __param(0, Optional()), __metadata("design:paramtypes", [Array])], ApplicationInitStatus2);
    return ApplicationInitStatus2;
  }()
);
var APP_ID = new InjectionToken("AppId");
function _appIdRandomProviderFactory() {
  return "" + _randomChar() + _randomChar() + _randomChar();
}
var APP_ID_RANDOM_PROVIDER = {
  provide: APP_ID,
  useFactory: _appIdRandomProviderFactory,
  deps: []
};
function _randomChar() {
  return String.fromCharCode(97 + Math.floor(Math.random() * 25));
}
var PLATFORM_INITIALIZER = new InjectionToken("Platform Initializer");
var PLATFORM_ID = new InjectionToken("Platform ID");
var APP_BOOTSTRAP_LISTENER = new InjectionToken("appBootstrapListener");
var PACKAGE_ROOT_URL = new InjectionToken("Application Packages Root URL");
var Console = (
  /** @class */
  function() {
    function Console2() {
    }
    Console2.prototype.log = function(message) {
      console.log(message);
    };
    Console2.prototype.warn = function(message) {
      console.warn(message);
    };
    Console2 = __decorate([Injectable()], Console2);
    return Console2;
  }()
);
function _throwError() {
  throw new Error("Runtime compiler is not loaded");
}
var Compiler = (
  /** @class */
  function() {
    function Compiler2() {
    }
    Compiler2.prototype.compileModuleSync = function(moduleType) {
      throw _throwError();
    };
    Compiler2.prototype.compileModuleAsync = function(moduleType) {
      throw _throwError();
    };
    Compiler2.prototype.compileModuleAndAllComponentsSync = function(moduleType) {
      throw _throwError();
    };
    Compiler2.prototype.compileModuleAndAllComponentsAsync = function(moduleType) {
      throw _throwError();
    };
    Compiler2.prototype.clearCache = function() {
    };
    Compiler2.prototype.clearCacheFor = function(type) {
    };
    Compiler2.prototype.getModuleId = function(moduleType) {
      return void 0;
    };
    Compiler2 = __decorate([Injectable()], Compiler2);
    return Compiler2;
  }()
);
var COMPILER_OPTIONS = new InjectionToken("compilerOptions");
var CompilerFactory = (
  /** @class */
  /* @__PURE__ */ function() {
    function CompilerFactory2() {
    }
    return CompilerFactory2;
  }()
);
var ComponentRef = (
  /** @class */
  /* @__PURE__ */ function() {
    function ComponentRef2() {
    }
    return ComponentRef2;
  }()
);
var ComponentFactory = (
  /** @class */
  /* @__PURE__ */ function() {
    function ComponentFactory2() {
    }
    return ComponentFactory2;
  }()
);
function noComponentFactoryError(component) {
  var error = Error("No component factory found for " + stringify(component) + ". Did you add it to @NgModule.entryComponents?");
  error[ERROR_COMPONENT] = component;
  return error;
}
var ERROR_COMPONENT = "ngComponent";
var _NullComponentFactoryResolver = (
  /** @class */
  function() {
    function _NullComponentFactoryResolver2() {
    }
    _NullComponentFactoryResolver2.prototype.resolveComponentFactory = function(component) {
      throw noComponentFactoryError(component);
    };
    return _NullComponentFactoryResolver2;
  }()
);
var ComponentFactoryResolver = (
  /** @class */
  function() {
    function ComponentFactoryResolver2() {
    }
    ComponentFactoryResolver2.NULL = new _NullComponentFactoryResolver();
    return ComponentFactoryResolver2;
  }()
);
var CodegenComponentFactoryResolver = (
  /** @class */
  function() {
    function CodegenComponentFactoryResolver2(factories, _parent, _ngModule) {
      this._parent = _parent;
      this._ngModule = _ngModule;
      this._factories = /* @__PURE__ */ new Map();
      for (var i = 0; i < factories.length; i++) {
        var factory = factories[i];
        this._factories.set(factory.componentType, factory);
      }
    }
    CodegenComponentFactoryResolver2.prototype.resolveComponentFactory = function(component) {
      var factory = this._factories.get(component);
      if (!factory && this._parent) {
        factory = this._parent.resolveComponentFactory(component);
      }
      if (!factory) {
        throw noComponentFactoryError(component);
      }
      return new ComponentFactoryBoundToModule(factory, this._ngModule);
    };
    return CodegenComponentFactoryResolver2;
  }()
);
var ComponentFactoryBoundToModule = (
  /** @class */
  function(_super) {
    __extends(ComponentFactoryBoundToModule2, _super);
    function ComponentFactoryBoundToModule2(factory, ngModule) {
      var _this = _super.call(this) || this;
      _this.factory = factory;
      _this.ngModule = ngModule;
      _this.selector = factory.selector;
      _this.componentType = factory.componentType;
      _this.ngContentSelectors = factory.ngContentSelectors;
      _this.inputs = factory.inputs;
      _this.outputs = factory.outputs;
      return _this;
    }
    ComponentFactoryBoundToModule2.prototype.create = function(injector, projectableNodes, rootSelectorOrNode, ngModule) {
      return this.factory.create(injector, projectableNodes, rootSelectorOrNode, ngModule || this.ngModule);
    };
    return ComponentFactoryBoundToModule2;
  }(ComponentFactory)
);
var NgModuleRef = (
  /** @class */
  /* @__PURE__ */ function() {
    function NgModuleRef2() {
    }
    return NgModuleRef2;
  }()
);
var NgModuleFactory = (
  /** @class */
  /* @__PURE__ */ function() {
    function NgModuleFactory2() {
    }
    return NgModuleFactory2;
  }()
);
var trace;
var events;
function detectWTF() {
  var wtf = _global["wtf"];
  if (wtf) {
    trace = wtf["trace"];
    if (trace) {
      events = trace["events"];
      return true;
    }
  }
  return false;
}
function createScope(signature, flags) {
  if (flags === void 0) {
    flags = null;
  }
  return events.createScope(signature, flags);
}
function leave(scope, returnValue) {
  trace.leaveScope(scope, returnValue);
  return returnValue;
}
var wtfEnabled = detectWTF();
function noopScope(arg0, arg1) {
  return null;
}
var wtfCreateScope = wtfEnabled ? createScope : function(signature, flags) {
  return noopScope;
};
var wtfLeave = wtfEnabled ? leave : function(s, r) {
  return r;
};
var EventEmitter = (
  /** @class */
  function(_super) {
    __extends(EventEmitter2, _super);
    function EventEmitter2(isAsync) {
      if (isAsync === void 0) {
        isAsync = false;
      }
      var _this = _super.call(this) || this;
      _this.__isAsync = isAsync;
      return _this;
    }
    EventEmitter2.prototype.emit = function(value) {
      _super.prototype.next.call(this, value);
    };
    EventEmitter2.prototype.subscribe = function(generatorOrNext, error, complete) {
      var schedulerFn;
      var errorFn = function(err) {
        return null;
      };
      var completeFn = function() {
        return null;
      };
      if (generatorOrNext && typeof generatorOrNext === "object") {
        schedulerFn = this.__isAsync ? function(value) {
          setTimeout(function() {
            return generatorOrNext.next(value);
          });
        } : function(value) {
          generatorOrNext.next(value);
        };
        if (generatorOrNext.error) {
          errorFn = this.__isAsync ? function(err) {
            setTimeout(function() {
              return generatorOrNext.error(err);
            });
          } : function(err) {
            generatorOrNext.error(err);
          };
        }
        if (generatorOrNext.complete) {
          completeFn = this.__isAsync ? function() {
            setTimeout(function() {
              return generatorOrNext.complete();
            });
          } : function() {
            generatorOrNext.complete();
          };
        }
      } else {
        schedulerFn = this.__isAsync ? function(value) {
          setTimeout(function() {
            return generatorOrNext(value);
          });
        } : function(value) {
          generatorOrNext(value);
        };
        if (error) {
          errorFn = this.__isAsync ? function(err) {
            setTimeout(function() {
              return error(err);
            });
          } : function(err) {
            error(err);
          };
        }
        if (complete) {
          completeFn = this.__isAsync ? function() {
            setTimeout(function() {
              return complete();
            });
          } : function() {
            complete();
          };
        }
      }
      var sink = _super.prototype.subscribe.call(this, schedulerFn, errorFn, completeFn);
      if (generatorOrNext instanceof Subscription) {
        generatorOrNext.add(sink);
      }
      return sink;
    };
    return EventEmitter2;
  }(Subject)
);
var NgZone = (
  /** @class */
  function() {
    function NgZone2(_a) {
      var _b = _a.enableLongStackTrace, enableLongStackTrace = _b === void 0 ? false : _b;
      this.hasPendingMicrotasks = false;
      this.hasPendingMacrotasks = false;
      this.isStable = true;
      this.onUnstable = new EventEmitter(false);
      this.onMicrotaskEmpty = new EventEmitter(false);
      this.onStable = new EventEmitter(false);
      this.onError = new EventEmitter(false);
      if (typeof Zone == "undefined") {
        throw new Error("In this configuration Angular requires Zone.js");
      }
      Zone.assertZonePatched();
      var self2 = this;
      self2._nesting = 0;
      self2._outer = self2._inner = Zone.current;
      if (Zone["wtfZoneSpec"]) {
        self2._inner = self2._inner.fork(Zone["wtfZoneSpec"]);
      }
      if (Zone["TaskTrackingZoneSpec"]) {
        self2._inner = self2._inner.fork(new Zone["TaskTrackingZoneSpec"]());
      }
      if (enableLongStackTrace && Zone["longStackTraceZoneSpec"]) {
        self2._inner = self2._inner.fork(Zone["longStackTraceZoneSpec"]);
      }
      forkInnerZoneWithAngularBehavior(self2);
    }
    NgZone2.isInAngularZone = function() {
      return Zone.current.get("isAngularZone") === true;
    };
    NgZone2.assertInAngularZone = function() {
      if (!NgZone2.isInAngularZone()) {
        throw new Error("Expected to be in Angular Zone, but it is not!");
      }
    };
    NgZone2.assertNotInAngularZone = function() {
      if (NgZone2.isInAngularZone()) {
        throw new Error("Expected to not be in Angular Zone, but it is!");
      }
    };
    NgZone2.prototype.run = function(fn, applyThis, applyArgs) {
      return this._inner.run(fn, applyThis, applyArgs);
    };
    NgZone2.prototype.runTask = function(fn, applyThis, applyArgs, name) {
      var zone = this._inner;
      var task = zone.scheduleEventTask("NgZoneEvent: " + name, fn, EMPTY_PAYLOAD, noop2, noop2);
      try {
        return zone.runTask(task, applyThis, applyArgs);
      } finally {
        zone.cancelTask(task);
      }
    };
    NgZone2.prototype.runGuarded = function(fn, applyThis, applyArgs) {
      return this._inner.runGuarded(fn, applyThis, applyArgs);
    };
    NgZone2.prototype.runOutsideAngular = function(fn) {
      return this._outer.run(fn);
    };
    return NgZone2;
  }()
);
function noop2() {
}
var EMPTY_PAYLOAD = {};
function checkStable(zone) {
  if (zone._nesting == 0 && !zone.hasPendingMicrotasks && !zone.isStable) {
    try {
      zone._nesting++;
      zone.onMicrotaskEmpty.emit(null);
    } finally {
      zone._nesting--;
      if (!zone.hasPendingMicrotasks) {
        try {
          zone.runOutsideAngular(function() {
            return zone.onStable.emit(null);
          });
        } finally {
          zone.isStable = true;
        }
      }
    }
  }
}
function forkInnerZoneWithAngularBehavior(zone) {
  zone._inner = zone._inner.fork({
    name: "angular",
    properties: {
      "isAngularZone": true
    },
    onInvokeTask: function(delegate, current, target, task, applyThis, applyArgs) {
      try {
        onEnter(zone);
        return delegate.invokeTask(target, task, applyThis, applyArgs);
      } finally {
        onLeave(zone);
      }
    },
    onInvoke: function(delegate, current, target, callback, applyThis, applyArgs, source) {
      try {
        onEnter(zone);
        return delegate.invoke(target, callback, applyThis, applyArgs, source);
      } finally {
        onLeave(zone);
      }
    },
    onHasTask: function(delegate, current, target, hasTaskState) {
      delegate.hasTask(target, hasTaskState);
      if (current === target) {
        if (hasTaskState.change == "microTask") {
          zone.hasPendingMicrotasks = hasTaskState.microTask;
          checkStable(zone);
        } else if (hasTaskState.change == "macroTask") {
          zone.hasPendingMacrotasks = hasTaskState.macroTask;
        }
      }
    },
    onHandleError: function(delegate, current, target, error) {
      delegate.handleError(target, error);
      zone.runOutsideAngular(function() {
        return zone.onError.emit(error);
      });
      return false;
    }
  });
}
function onEnter(zone) {
  zone._nesting++;
  if (zone.isStable) {
    zone.isStable = false;
    zone.onUnstable.emit(null);
  }
}
function onLeave(zone) {
  zone._nesting--;
  checkStable(zone);
}
var NoopNgZone = (
  /** @class */
  function() {
    function NoopNgZone2() {
      this.hasPendingMicrotasks = false;
      this.hasPendingMacrotasks = false;
      this.isStable = true;
      this.onUnstable = new EventEmitter();
      this.onMicrotaskEmpty = new EventEmitter();
      this.onStable = new EventEmitter();
      this.onError = new EventEmitter();
    }
    NoopNgZone2.prototype.run = function(fn) {
      return fn();
    };
    NoopNgZone2.prototype.runGuarded = function(fn) {
      return fn();
    };
    NoopNgZone2.prototype.runOutsideAngular = function(fn) {
      return fn();
    };
    NoopNgZone2.prototype.runTask = function(fn) {
      return fn();
    };
    return NoopNgZone2;
  }()
);
var Testability = (
  /** @class */
  function() {
    function Testability2(_ngZone) {
      var _this = this;
      this._ngZone = _ngZone;
      this._pendingCount = 0;
      this._isZoneStable = true;
      this._didWork = false;
      this._callbacks = [];
      this._watchAngularEvents();
      _ngZone.run(function() {
        _this.taskTrackingZone = Zone.current.get("TaskTrackingZone");
      });
    }
    Testability2.prototype._watchAngularEvents = function() {
      var _this = this;
      this._ngZone.onUnstable.subscribe({
        next: function() {
          _this._didWork = true;
          _this._isZoneStable = false;
        }
      });
      this._ngZone.runOutsideAngular(function() {
        _this._ngZone.onStable.subscribe({
          next: function() {
            NgZone.assertNotInAngularZone();
            scheduleMicroTask(function() {
              _this._isZoneStable = true;
              _this._runCallbacksIfReady();
            });
          }
        });
      });
    };
    Testability2.prototype.increasePendingRequestCount = function() {
      this._pendingCount += 1;
      this._didWork = true;
      return this._pendingCount;
    };
    Testability2.prototype.decreasePendingRequestCount = function() {
      this._pendingCount -= 1;
      if (this._pendingCount < 0) {
        throw new Error("pending async requests below zero");
      }
      this._runCallbacksIfReady();
      return this._pendingCount;
    };
    Testability2.prototype.isStable = function() {
      return this._isZoneStable && this._pendingCount === 0 && !this._ngZone.hasPendingMacrotasks;
    };
    Testability2.prototype._runCallbacksIfReady = function() {
      var _this = this;
      if (this.isStable()) {
        scheduleMicroTask(function() {
          while (_this._callbacks.length !== 0) {
            var cb = _this._callbacks.pop();
            clearTimeout(cb.timeoutId);
            cb.doneCb(_this._didWork);
          }
          _this._didWork = false;
        });
      } else {
        var pending_1 = this.getPendingTasks();
        this._callbacks = this._callbacks.filter(function(cb) {
          if (cb.updateCb && cb.updateCb(pending_1)) {
            clearTimeout(cb.timeoutId);
            return false;
          }
          return true;
        });
        this._didWork = true;
      }
    };
    Testability2.prototype.getPendingTasks = function() {
      if (!this.taskTrackingZone) {
        return [];
      }
      return this.taskTrackingZone.macroTasks.map(function(t) {
        return {
          source: t.source,
          isPeriodic: t.data.isPeriodic,
          delay: t.data.delay,
          // From TaskTrackingZone:
          // https://github.com/angular/zone.js/blob/master/lib/zone-spec/task-tracking.ts#L40
          creationLocation: t.creationLocation,
          // Added by Zones for XHRs
          // https://github.com/angular/zone.js/blob/master/lib/browser/browser.ts#L133
          xhr: t.data.target
        };
      });
    };
    Testability2.prototype.addCallback = function(cb, timeout2, updateCb) {
      var _this = this;
      var timeoutId = -1;
      if (timeout2 && timeout2 > 0) {
        timeoutId = setTimeout(function() {
          _this._callbacks = _this._callbacks.filter(function(cb2) {
            return cb2.timeoutId !== timeoutId;
          });
          cb(_this._didWork, _this.getPendingTasks());
        }, timeout2);
      }
      this._callbacks.push({
        doneCb: cb,
        timeoutId,
        updateCb
      });
    };
    Testability2.prototype.whenStable = function(doneCb, timeout2, updateCb) {
      if (updateCb && !this.taskTrackingZone) {
        throw new Error('Task tracking zone is required when passing an update callback to whenStable(). Is "zone.js/dist/task-tracking.js" loaded?');
      }
      this.addCallback(doneCb, timeout2, updateCb);
      this._runCallbacksIfReady();
    };
    Testability2.prototype.getPendingRequestCount = function() {
      return this._pendingCount;
    };
    Testability2.prototype.findProviders = function(using2, provider, exactMatch) {
      return [];
    };
    Testability2 = __decorate([Injectable(), __metadata("design:paramtypes", [NgZone])], Testability2);
    return Testability2;
  }()
);
var TestabilityRegistry = (
  /** @class */
  function() {
    function TestabilityRegistry2() {
      this._applications = /* @__PURE__ */ new Map();
      _testabilityGetter.addToWindow(this);
    }
    TestabilityRegistry2.prototype.registerApplication = function(token, testability) {
      this._applications.set(token, testability);
    };
    TestabilityRegistry2.prototype.unregisterApplication = function(token) {
      this._applications.delete(token);
    };
    TestabilityRegistry2.prototype.unregisterAllApplications = function() {
      this._applications.clear();
    };
    TestabilityRegistry2.prototype.getTestability = function(elem) {
      return this._applications.get(elem) || null;
    };
    TestabilityRegistry2.prototype.getAllTestabilities = function() {
      return Array.from(this._applications.values());
    };
    TestabilityRegistry2.prototype.getAllRootElements = function() {
      return Array.from(this._applications.keys());
    };
    TestabilityRegistry2.prototype.findTestabilityInTree = function(elem, findInAncestors) {
      if (findInAncestors === void 0) {
        findInAncestors = true;
      }
      return _testabilityGetter.findTestabilityInTree(this, elem, findInAncestors);
    };
    TestabilityRegistry2 = __decorate([Injectable(), __metadata("design:paramtypes", [])], TestabilityRegistry2);
    return TestabilityRegistry2;
  }()
);
var _NoopGetTestability = (
  /** @class */
  function() {
    function _NoopGetTestability2() {
    }
    _NoopGetTestability2.prototype.addToWindow = function(registry) {
    };
    _NoopGetTestability2.prototype.findTestabilityInTree = function(registry, elem, findInAncestors) {
      return null;
    };
    return _NoopGetTestability2;
  }()
);
var _testabilityGetter = new _NoopGetTestability();
var _devMode = true;
var _runModeLocked = false;
var _platform;
var ALLOW_MULTIPLE_PLATFORMS = new InjectionToken("AllowMultipleToken");
function isDevMode() {
  _runModeLocked = true;
  return _devMode;
}
function createPlatform(injector) {
  if (_platform && !_platform.destroyed && !_platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
    throw new Error("There can be only one platform. Destroy the previous one to create a new one.");
  }
  _platform = injector.get(PlatformRef);
  var inits = injector.get(PLATFORM_INITIALIZER, null);
  if (inits) inits.forEach(function(init) {
    return init();
  });
  return _platform;
}
function createPlatformFactory(parentPlatformFactory, name, providers) {
  if (providers === void 0) {
    providers = [];
  }
  var desc = "Platform: " + name;
  var marker = new InjectionToken(desc);
  return function(extraProviders) {
    if (extraProviders === void 0) {
      extraProviders = [];
    }
    var platform = getPlatform();
    if (!platform || platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
      if (parentPlatformFactory) {
        parentPlatformFactory(providers.concat(extraProviders).concat({
          provide: marker,
          useValue: true
        }));
      } else {
        var injectedProviders = providers.concat(extraProviders).concat({
          provide: marker,
          useValue: true
        });
        createPlatform(Injector.create({
          providers: injectedProviders,
          name: desc
        }));
      }
    }
    return assertPlatform(marker);
  };
}
function assertPlatform(requiredToken) {
  var platform = getPlatform();
  if (!platform) {
    throw new Error("No platform exists!");
  }
  if (!platform.injector.get(requiredToken, null)) {
    throw new Error("A platform with a different configuration has been created. Please destroy it first.");
  }
  return platform;
}
function getPlatform() {
  return _platform && !_platform.destroyed ? _platform : null;
}
var PlatformRef = (
  /** @class */
  function() {
    function PlatformRef2(_injector) {
      this._injector = _injector;
      this._modules = [];
      this._destroyListeners = [];
      this._destroyed = false;
    }
    PlatformRef2.prototype.bootstrapModuleFactory = function(moduleFactory, options) {
      var _this = this;
      var ngZoneOption = options ? options.ngZone : void 0;
      var ngZone = getNgZone(ngZoneOption);
      var providers = [{
        provide: NgZone,
        useValue: ngZone
      }];
      return ngZone.run(function() {
        var ngZoneInjector = Injector.create({
          providers,
          parent: _this.injector,
          name: moduleFactory.moduleType.name
        });
        var moduleRef = moduleFactory.create(ngZoneInjector);
        var exceptionHandler = moduleRef.injector.get(ErrorHandler, null);
        if (!exceptionHandler) {
          throw new Error("No ErrorHandler. Is platform module (BrowserModule) included?");
        }
        moduleRef.onDestroy(function() {
          return remove(_this._modules, moduleRef);
        });
        ngZone.runOutsideAngular(function() {
          return ngZone.onError.subscribe({
            next: function(error) {
              exceptionHandler.handleError(error);
            }
          });
        });
        return _callAndReportToErrorHandler(exceptionHandler, ngZone, function() {
          var initStatus = moduleRef.injector.get(ApplicationInitStatus);
          initStatus.runInitializers();
          return initStatus.donePromise.then(function() {
            _this._moduleDoBootstrap(moduleRef);
            return moduleRef;
          });
        });
      });
    };
    PlatformRef2.prototype.bootstrapModule = function(moduleType, compilerOptions) {
      var _this = this;
      if (compilerOptions === void 0) {
        compilerOptions = [];
      }
      var compilerFactory = this.injector.get(CompilerFactory);
      var options = optionsReducer({}, compilerOptions);
      var compiler = compilerFactory.createCompiler([options]);
      return compiler.compileModuleAsync(moduleType).then(function(moduleFactory) {
        return _this.bootstrapModuleFactory(moduleFactory, options);
      });
    };
    PlatformRef2.prototype._moduleDoBootstrap = function(moduleRef) {
      var appRef = moduleRef.injector.get(ApplicationRef);
      if (moduleRef._bootstrapComponents.length > 0) {
        moduleRef._bootstrapComponents.forEach(function(f) {
          return appRef.bootstrap(f);
        });
      } else if (moduleRef.instance.ngDoBootstrap) {
        moduleRef.instance.ngDoBootstrap(appRef);
      } else {
        throw new Error("The module " + stringify(moduleRef.instance.constructor) + ' was bootstrapped, but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. Please define one of these.');
      }
      this._modules.push(moduleRef);
    };
    PlatformRef2.prototype.onDestroy = function(callback) {
      this._destroyListeners.push(callback);
    };
    Object.defineProperty(PlatformRef2.prototype, "injector", {
      /**
       * Retrieve the platform {@link Injector}, which is the parent injector for
       * every Angular application on the page and provides singleton providers.
       */
      get: function() {
        return this._injector;
      },
      enumerable: true,
      configurable: true
    });
    PlatformRef2.prototype.destroy = function() {
      if (this._destroyed) {
        throw new Error("The platform has already been destroyed!");
      }
      this._modules.slice().forEach(function(module) {
        return module.destroy();
      });
      this._destroyListeners.forEach(function(listener) {
        return listener();
      });
      this._destroyed = true;
    };
    Object.defineProperty(PlatformRef2.prototype, "destroyed", {
      get: function() {
        return this._destroyed;
      },
      enumerable: true,
      configurable: true
    });
    PlatformRef2 = __decorate([Injectable(), __metadata("design:paramtypes", [Injector])], PlatformRef2);
    return PlatformRef2;
  }()
);
function getNgZone(ngZoneOption) {
  var ngZone;
  if (ngZoneOption === "noop") {
    ngZone = new NoopNgZone();
  } else {
    ngZone = (ngZoneOption === "zone.js" ? void 0 : ngZoneOption) || new NgZone({
      enableLongStackTrace: isDevMode()
    });
  }
  return ngZone;
}
function _callAndReportToErrorHandler(errorHandler, ngZone, callback) {
  try {
    var result = callback();
    if (isPromise2(result)) {
      return result.catch(function(e) {
        ngZone.runOutsideAngular(function() {
          return errorHandler.handleError(e);
        });
        throw e;
      });
    }
    return result;
  } catch (e) {
    ngZone.runOutsideAngular(function() {
      return errorHandler.handleError(e);
    });
    throw e;
  }
}
function optionsReducer(dst, objs) {
  if (Array.isArray(objs)) {
    dst = objs.reduce(optionsReducer, dst);
  } else {
    dst = __assign({}, dst, objs);
  }
  return dst;
}
var ApplicationRef = (
  /** @class */
  function() {
    function ApplicationRef2(_zone, _console, _injector, _exceptionHandler, _componentFactoryResolver, _initStatus) {
      var _this = this;
      this._zone = _zone;
      this._console = _console;
      this._injector = _injector;
      this._exceptionHandler = _exceptionHandler;
      this._componentFactoryResolver = _componentFactoryResolver;
      this._initStatus = _initStatus;
      this._bootstrapListeners = [];
      this._views = [];
      this._runningTick = false;
      this._enforceNoNewChanges = false;
      this._stable = true;
      this.componentTypes = [];
      this.components = [];
      this._enforceNoNewChanges = isDevMode();
      this._zone.onMicrotaskEmpty.subscribe({
        next: function() {
          _this._zone.run(function() {
            _this.tick();
          });
        }
      });
      var isCurrentlyStable = new Observable(function(observer) {
        _this._stable = _this._zone.isStable && !_this._zone.hasPendingMacrotasks && !_this._zone.hasPendingMicrotasks;
        _this._zone.runOutsideAngular(function() {
          observer.next(_this._stable);
          observer.complete();
        });
      });
      var isStable = new Observable(function(observer) {
        var stableSub;
        _this._zone.runOutsideAngular(function() {
          stableSub = _this._zone.onStable.subscribe(function() {
            NgZone.assertNotInAngularZone();
            scheduleMicroTask(function() {
              if (!_this._stable && !_this._zone.hasPendingMacrotasks && !_this._zone.hasPendingMicrotasks) {
                _this._stable = true;
                observer.next(true);
              }
            });
          });
        });
        var unstableSub = _this._zone.onUnstable.subscribe(function() {
          NgZone.assertInAngularZone();
          if (_this._stable) {
            _this._stable = false;
            _this._zone.runOutsideAngular(function() {
              observer.next(false);
            });
          }
        });
        return function() {
          stableSub.unsubscribe();
          unstableSub.unsubscribe();
        };
      });
      this.isStable = merge(isCurrentlyStable, isStable.pipe(share()));
    }
    ApplicationRef_1 = ApplicationRef2;
    ApplicationRef2.prototype.bootstrap = function(componentOrFactory, rootSelectorOrNode) {
      var _this = this;
      if (!this._initStatus.done) {
        throw new Error("Cannot bootstrap as there are still asynchronous initializers running. Bootstrap components in the `ngDoBootstrap` method of the root module.");
      }
      var componentFactory;
      if (componentOrFactory instanceof ComponentFactory) {
        componentFactory = componentOrFactory;
      } else {
        componentFactory = this._componentFactoryResolver.resolveComponentFactory(componentOrFactory);
      }
      this.componentTypes.push(componentFactory.componentType);
      var ngModule = componentFactory instanceof ComponentFactoryBoundToModule ? null : this._injector.get(NgModuleRef);
      var selectorOrNode = rootSelectorOrNode || componentFactory.selector;
      var compRef = componentFactory.create(Injector.NULL, [], selectorOrNode, ngModule);
      compRef.onDestroy(function() {
        _this._unloadComponent(compRef);
      });
      var testability = compRef.injector.get(Testability, null);
      if (testability) {
        compRef.injector.get(TestabilityRegistry).registerApplication(compRef.location.nativeElement, testability);
      }
      this._loadComponent(compRef);
      if (isDevMode()) {
        this._console.log("Angular is running in the development mode. Call enableProdMode() to enable the production mode.");
      }
      return compRef;
    };
    ApplicationRef2.prototype.tick = function() {
      var _this = this;
      if (this._runningTick) {
        throw new Error("ApplicationRef.tick is called recursively");
      }
      var scope = ApplicationRef_1._tickScope();
      try {
        this._runningTick = true;
        this._views.forEach(function(view) {
          return view.detectChanges();
        });
        if (this._enforceNoNewChanges) {
          this._views.forEach(function(view) {
            return view.checkNoChanges();
          });
        }
      } catch (e) {
        this._zone.runOutsideAngular(function() {
          return _this._exceptionHandler.handleError(e);
        });
      } finally {
        this._runningTick = false;
        wtfLeave(scope);
      }
    };
    ApplicationRef2.prototype.attachView = function(viewRef) {
      var view = viewRef;
      this._views.push(view);
      view.attachToAppRef(this);
    };
    ApplicationRef2.prototype.detachView = function(viewRef) {
      var view = viewRef;
      remove(this._views, view);
      view.detachFromAppRef();
    };
    ApplicationRef2.prototype._loadComponent = function(componentRef) {
      this.attachView(componentRef.hostView);
      this.tick();
      this.components.push(componentRef);
      var listeners = this._injector.get(APP_BOOTSTRAP_LISTENER, []).concat(this._bootstrapListeners);
      listeners.forEach(function(listener) {
        return listener(componentRef);
      });
    };
    ApplicationRef2.prototype._unloadComponent = function(componentRef) {
      this.detachView(componentRef.hostView);
      remove(this.components, componentRef);
    };
    ApplicationRef2.prototype.ngOnDestroy = function() {
      this._views.slice().forEach(function(view) {
        return view.destroy();
      });
    };
    Object.defineProperty(ApplicationRef2.prototype, "viewCount", {
      /**
       * Returns the number of attached views.
       */
      get: function() {
        return this._views.length;
      },
      enumerable: true,
      configurable: true
    });
    var ApplicationRef_1;
    ApplicationRef2._tickScope = wtfCreateScope("ApplicationRef#tick()");
    ApplicationRef2 = ApplicationRef_1 = __decorate([Injectable(), __metadata("design:paramtypes", [NgZone, Console, Injector, ErrorHandler, ComponentFactoryResolver, ApplicationInitStatus])], ApplicationRef2);
    return ApplicationRef2;
  }()
);
function remove(list, el) {
  var index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
  }
}
var Renderer = (
  /** @class */
  /* @__PURE__ */ function() {
    function Renderer3() {
    }
    return Renderer3;
  }()
);
var Renderer2Interceptor = new InjectionToken("Renderer2Interceptor");
var RendererFactory2 = (
  /** @class */
  /* @__PURE__ */ function() {
    function RendererFactory22() {
    }
    return RendererFactory22;
  }()
);
var RendererStyleFlags2;
(function(RendererStyleFlags22) {
  RendererStyleFlags22[RendererStyleFlags22["Important"] = 1] = "Important";
  RendererStyleFlags22[RendererStyleFlags22["DashCase"] = 2] = "DashCase";
})(RendererStyleFlags2 || (RendererStyleFlags2 = {}));
var Renderer2 = (
  /** @class */
  /* @__PURE__ */ function() {
    function Renderer22() {
    }
    return Renderer22;
  }()
);
var ElementRef = (
  /** @class */
  /* @__PURE__ */ function() {
    function ElementRef2(nativeElement) {
      this.nativeElement = nativeElement;
    }
    return ElementRef2;
  }()
);
var QueryList = (
  /** @class */
  function() {
    function QueryList2() {
      this.dirty = true;
      this._results = [];
      this.changes = new EventEmitter();
      this.length = 0;
    }
    QueryList2.prototype.map = function(fn) {
      return this._results.map(fn);
    };
    QueryList2.prototype.filter = function(fn) {
      return this._results.filter(fn);
    };
    QueryList2.prototype.find = function(fn) {
      return this._results.find(fn);
    };
    QueryList2.prototype.reduce = function(fn, init) {
      return this._results.reduce(fn, init);
    };
    QueryList2.prototype.forEach = function(fn) {
      this._results.forEach(fn);
    };
    QueryList2.prototype.some = function(fn) {
      return this._results.some(fn);
    };
    QueryList2.prototype.toArray = function() {
      return this._results.slice();
    };
    QueryList2.prototype[getSymbolIterator2()] = function() {
      return this._results[getSymbolIterator2()]();
    };
    QueryList2.prototype.toString = function() {
      return this._results.toString();
    };
    QueryList2.prototype.reset = function(res) {
      this._results = flatten(res);
      this.dirty = false;
      this.length = this._results.length;
      this.last = this._results[this.length - 1];
      this.first = this._results[0];
    };
    QueryList2.prototype.notifyOnChanges = function() {
      this.changes.emit(this);
    };
    QueryList2.prototype.setDirty = function() {
      this.dirty = true;
    };
    QueryList2.prototype.destroy = function() {
      this.changes.complete();
      this.changes.unsubscribe();
    };
    return QueryList2;
  }()
);
function flatten(list) {
  return list.reduce(function(flat, item) {
    var flatItem = Array.isArray(item) ? flatten(item) : item;
    return flat.concat(flatItem);
  }, []);
}
var _SEPARATOR = "#";
var FACTORY_CLASS_SUFFIX = "NgFactory";
var SystemJsNgModuleLoaderConfig = (
  /** @class */
  /* @__PURE__ */ function() {
    function SystemJsNgModuleLoaderConfig2() {
    }
    return SystemJsNgModuleLoaderConfig2;
  }()
);
var DEFAULT_CONFIG = {
  factoryPathPrefix: "",
  factoryPathSuffix: ".ngfactory"
};
var SystemJsNgModuleLoader = (
  /** @class */
  function() {
    function SystemJsNgModuleLoader2(_compiler, config2) {
      this._compiler = _compiler;
      this._config = config2 || DEFAULT_CONFIG;
    }
    SystemJsNgModuleLoader2.prototype.load = function(path) {
      var offlineMode = this._compiler instanceof Compiler;
      return offlineMode ? this.loadFactory(path) : this.loadAndCompile(path);
    };
    SystemJsNgModuleLoader2.prototype.loadAndCompile = function(path) {
      var _this = this;
      var _a = __read(path.split(_SEPARATOR), 2), module = _a[0], exportName = _a[1];
      if (exportName === void 0) {
        exportName = "default";
      }
      return System.import(module).then(function(module2) {
        return module2[exportName];
      }).then(function(type) {
        return checkNotEmpty(type, module, exportName);
      }).then(function(type) {
        return _this._compiler.compileModuleAsync(type);
      });
    };
    SystemJsNgModuleLoader2.prototype.loadFactory = function(path) {
      var _a = __read(path.split(_SEPARATOR), 2), module = _a[0], exportName = _a[1];
      var factoryClassSuffix = FACTORY_CLASS_SUFFIX;
      if (exportName === void 0) {
        exportName = "default";
        factoryClassSuffix = "";
      }
      return System.import(this._config.factoryPathPrefix + module + this._config.factoryPathSuffix).then(function(module2) {
        return module2[exportName + factoryClassSuffix];
      }).then(function(factory) {
        return checkNotEmpty(factory, module, exportName);
      });
    };
    SystemJsNgModuleLoader2 = __decorate([Injectable(), __param(1, Optional()), __metadata("design:paramtypes", [Compiler, SystemJsNgModuleLoaderConfig])], SystemJsNgModuleLoader2);
    return SystemJsNgModuleLoader2;
  }()
);
function checkNotEmpty(value, modulePath, exportName) {
  if (!value) {
    throw new Error("Cannot find '" + exportName + "' in '" + modulePath + "'");
  }
  return value;
}
var TemplateRef = (
  /** @class */
  /* @__PURE__ */ function() {
    function TemplateRef2() {
    }
    return TemplateRef2;
  }()
);
var ViewContainerRef = (
  /** @class */
  /* @__PURE__ */ function() {
    function ViewContainerRef2() {
    }
    return ViewContainerRef2;
  }()
);
var ChangeDetectorRef = (
  /** @class */
  /* @__PURE__ */ function() {
    function ChangeDetectorRef2() {
    }
    return ChangeDetectorRef2;
  }()
);
var ViewRef = (
  /** @class */
  function(_super) {
    __extends(ViewRef2, _super);
    function ViewRef2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    return ViewRef2;
  }(ChangeDetectorRef)
);
var EmbeddedViewRef = (
  /** @class */
  function(_super) {
    __extends(EmbeddedViewRef2, _super);
    function EmbeddedViewRef2() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    return EmbeddedViewRef2;
  }(ViewRef)
);
var EventListener = (
  /** @class */
  /* @__PURE__ */ function() {
    function EventListener2(name, callback) {
      this.name = name;
      this.callback = callback;
    }
    return EventListener2;
  }()
);
var DebugNode = (
  /** @class */
  function() {
    function DebugNode2(nativeNode, parent, _debugContext) {
      this._debugContext = _debugContext;
      this.nativeNode = nativeNode;
      if (parent && parent instanceof DebugElement) {
        parent.addChild(this);
      } else {
        this.parent = null;
      }
      this.listeners = [];
    }
    Object.defineProperty(DebugNode2.prototype, "injector", {
      get: function() {
        return this._debugContext.injector;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DebugNode2.prototype, "componentInstance", {
      get: function() {
        return this._debugContext.component;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DebugNode2.prototype, "context", {
      get: function() {
        return this._debugContext.context;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DebugNode2.prototype, "references", {
      get: function() {
        return this._debugContext.references;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DebugNode2.prototype, "providerTokens", {
      get: function() {
        return this._debugContext.providerTokens;
      },
      enumerable: true,
      configurable: true
    });
    return DebugNode2;
  }()
);
var DebugElement = (
  /** @class */
  function(_super) {
    __extends(DebugElement2, _super);
    function DebugElement2(nativeNode, parent, _debugContext) {
      var _this = _super.call(this, nativeNode, parent, _debugContext) || this;
      _this.properties = {};
      _this.attributes = {};
      _this.classes = {};
      _this.styles = {};
      _this.childNodes = [];
      _this.nativeElement = nativeNode;
      return _this;
    }
    DebugElement2.prototype.addChild = function(child) {
      if (child) {
        this.childNodes.push(child);
        child.parent = this;
      }
    };
    DebugElement2.prototype.removeChild = function(child) {
      var childIndex = this.childNodes.indexOf(child);
      if (childIndex !== -1) {
        child.parent = null;
        this.childNodes.splice(childIndex, 1);
      }
    };
    DebugElement2.prototype.insertChildrenAfter = function(child, newChildren) {
      var _this = this;
      var _a;
      var siblingIndex = this.childNodes.indexOf(child);
      if (siblingIndex !== -1) {
        (_a = this.childNodes).splice.apply(_a, __spread([siblingIndex + 1, 0], newChildren));
        newChildren.forEach(function(c) {
          if (c.parent) {
            c.parent.removeChild(c);
          }
          c.parent = _this;
        });
      }
    };
    DebugElement2.prototype.insertBefore = function(refChild, newChild) {
      var refIndex = this.childNodes.indexOf(refChild);
      if (refIndex === -1) {
        this.addChild(newChild);
      } else {
        if (newChild.parent) {
          newChild.parent.removeChild(newChild);
        }
        newChild.parent = this;
        this.childNodes.splice(refIndex, 0, newChild);
      }
    };
    DebugElement2.prototype.query = function(predicate) {
      var results = this.queryAll(predicate);
      return results[0] || null;
    };
    DebugElement2.prototype.queryAll = function(predicate) {
      var matches = [];
      _queryElementChildren(this, predicate, matches);
      return matches;
    };
    DebugElement2.prototype.queryAllNodes = function(predicate) {
      var matches = [];
      _queryNodeChildren(this, predicate, matches);
      return matches;
    };
    Object.defineProperty(DebugElement2.prototype, "children", {
      get: function() {
        return this.childNodes.filter(function(node) {
          return node instanceof DebugElement2;
        });
      },
      enumerable: true,
      configurable: true
    });
    DebugElement2.prototype.triggerEventHandler = function(eventName, eventObj) {
      this.listeners.forEach(function(listener) {
        if (listener.name == eventName) {
          listener.callback(eventObj);
        }
      });
    };
    return DebugElement2;
  }(DebugNode)
);
function _queryElementChildren(element, predicate, matches) {
  element.childNodes.forEach(function(node) {
    if (node instanceof DebugElement) {
      if (predicate(node)) {
        matches.push(node);
      }
      _queryElementChildren(node, predicate, matches);
    }
  });
}
function _queryNodeChildren(parentNode, predicate, matches) {
  if (parentNode instanceof DebugElement) {
    parentNode.childNodes.forEach(function(node) {
      if (predicate(node)) {
        matches.push(node);
      }
      if (node instanceof DebugElement) {
        _queryNodeChildren(node, predicate, matches);
      }
    });
  }
}
var _nativeNodeToDebugNode = /* @__PURE__ */ new Map();
function getDebugNode(nativeNode) {
  return _nativeNodeToDebugNode.get(nativeNode) || null;
}
function indexDebugNode(node) {
  _nativeNodeToDebugNode.set(node.nativeNode, node);
}
function removeDebugNodeFromIndex(node) {
  _nativeNodeToDebugNode.delete(node.nativeNode);
}
function devModeEqual(a, b) {
  var isListLikeIterableA = isListLikeIterable(a);
  var isListLikeIterableB = isListLikeIterable(b);
  if (isListLikeIterableA && isListLikeIterableB) {
    return areIterablesEqual(a, b, devModeEqual);
  } else {
    var isAObject = a && (typeof a === "object" || typeof a === "function");
    var isBObject = b && (typeof b === "object" || typeof b === "function");
    if (!isListLikeIterableA && isAObject && !isListLikeIterableB && isBObject) {
      return true;
    } else {
      return looseIdentical(a, b);
    }
  }
}
var WrappedValue = (
  /** @class */
  function() {
    function WrappedValue2(value) {
      this.wrapped = value;
    }
    WrappedValue2.wrap = function(value) {
      return new WrappedValue2(value);
    };
    WrappedValue2.unwrap = function(value) {
      return WrappedValue2.isWrapped(value) ? value.wrapped : value;
    };
    WrappedValue2.isWrapped = function(value) {
      return value instanceof WrappedValue2;
    };
    return WrappedValue2;
  }()
);
var SimpleChange = (
  /** @class */
  function() {
    function SimpleChange2(previousValue, currentValue, firstChange) {
      this.previousValue = previousValue;
      this.currentValue = currentValue;
      this.firstChange = firstChange;
    }
    SimpleChange2.prototype.isFirstChange = function() {
      return this.firstChange;
    };
    return SimpleChange2;
  }()
);
function isListLikeIterable(obj) {
  if (!isJsObject(obj)) return false;
  return Array.isArray(obj) || !(obj instanceof Map) && // JS Map are iterables but return entries as [k, v]
  getSymbolIterator2() in obj;
}
function areIterablesEqual(a, b, comparator) {
  var iterator1 = a[getSymbolIterator2()]();
  var iterator2 = b[getSymbolIterator2()]();
  while (true) {
    var item1 = iterator1.next();
    var item2 = iterator2.next();
    if (item1.done && item2.done) return true;
    if (item1.done || item2.done) return false;
    if (!comparator(item1.value, item2.value)) return false;
  }
}
function iterateListLike(obj, fn) {
  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      fn(obj[i]);
    }
  } else {
    var iterator2 = obj[getSymbolIterator2()]();
    var item = void 0;
    while (!(item = iterator2.next()).done) {
      fn(item.value);
    }
  }
}
function isJsObject(o) {
  return o !== null && (typeof o === "function" || typeof o === "object");
}
var DefaultIterableDifferFactory = (
  /** @class */
  function() {
    function DefaultIterableDifferFactory2() {
    }
    DefaultIterableDifferFactory2.prototype.supports = function(obj) {
      return isListLikeIterable(obj);
    };
    DefaultIterableDifferFactory2.prototype.create = function(trackByFn) {
      return new DefaultIterableDiffer(trackByFn);
    };
    return DefaultIterableDifferFactory2;
  }()
);
var trackByIdentity = function(index, item) {
  return item;
};
var DefaultIterableDiffer = (
  /** @class */
  function() {
    function DefaultIterableDiffer2(trackByFn) {
      this.length = 0;
      this._linkedRecords = null;
      this._unlinkedRecords = null;
      this._previousItHead = null;
      this._itHead = null;
      this._itTail = null;
      this._additionsHead = null;
      this._additionsTail = null;
      this._movesHead = null;
      this._movesTail = null;
      this._removalsHead = null;
      this._removalsTail = null;
      this._identityChangesHead = null;
      this._identityChangesTail = null;
      this._trackByFn = trackByFn || trackByIdentity;
    }
    DefaultIterableDiffer2.prototype.forEachItem = function(fn) {
      var record;
      for (record = this._itHead; record !== null; record = record._next) {
        fn(record);
      }
    };
    DefaultIterableDiffer2.prototype.forEachOperation = function(fn) {
      var nextIt = this._itHead;
      var nextRemove = this._removalsHead;
      var addRemoveOffset = 0;
      var moveOffsets = null;
      while (nextIt || nextRemove) {
        var record = !nextRemove || nextIt && nextIt.currentIndex < getPreviousIndex(nextRemove, addRemoveOffset, moveOffsets) ? nextIt : nextRemove;
        var adjPreviousIndex = getPreviousIndex(record, addRemoveOffset, moveOffsets);
        var currentIndex = record.currentIndex;
        if (record === nextRemove) {
          addRemoveOffset--;
          nextRemove = nextRemove._nextRemoved;
        } else {
          nextIt = nextIt._next;
          if (record.previousIndex == null) {
            addRemoveOffset++;
          } else {
            if (!moveOffsets) moveOffsets = [];
            var localMovePreviousIndex = adjPreviousIndex - addRemoveOffset;
            var localCurrentIndex = currentIndex - addRemoveOffset;
            if (localMovePreviousIndex != localCurrentIndex) {
              for (var i = 0; i < localMovePreviousIndex; i++) {
                var offset = i < moveOffsets.length ? moveOffsets[i] : moveOffsets[i] = 0;
                var index = offset + i;
                if (localCurrentIndex <= index && index < localMovePreviousIndex) {
                  moveOffsets[i] = offset + 1;
                }
              }
              var previousIndex = record.previousIndex;
              moveOffsets[previousIndex] = localCurrentIndex - localMovePreviousIndex;
            }
          }
        }
        if (adjPreviousIndex !== currentIndex) {
          fn(record, adjPreviousIndex, currentIndex);
        }
      }
    };
    DefaultIterableDiffer2.prototype.forEachPreviousItem = function(fn) {
      var record;
      for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
        fn(record);
      }
    };
    DefaultIterableDiffer2.prototype.forEachAddedItem = function(fn) {
      var record;
      for (record = this._additionsHead; record !== null; record = record._nextAdded) {
        fn(record);
      }
    };
    DefaultIterableDiffer2.prototype.forEachMovedItem = function(fn) {
      var record;
      for (record = this._movesHead; record !== null; record = record._nextMoved) {
        fn(record);
      }
    };
    DefaultIterableDiffer2.prototype.forEachRemovedItem = function(fn) {
      var record;
      for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
        fn(record);
      }
    };
    DefaultIterableDiffer2.prototype.forEachIdentityChange = function(fn) {
      var record;
      for (record = this._identityChangesHead; record !== null; record = record._nextIdentityChange) {
        fn(record);
      }
    };
    DefaultIterableDiffer2.prototype.diff = function(collection) {
      if (collection == null) collection = [];
      if (!isListLikeIterable(collection)) {
        throw new Error("Error trying to diff '" + stringify(collection) + "'. Only arrays and iterables are allowed");
      }
      if (this.check(collection)) {
        return this;
      } else {
        return null;
      }
    };
    DefaultIterableDiffer2.prototype.onDestroy = function() {
    };
    DefaultIterableDiffer2.prototype.check = function(collection) {
      var _this = this;
      this._reset();
      var record = this._itHead;
      var mayBeDirty = false;
      var index;
      var item;
      var itemTrackBy;
      if (Array.isArray(collection)) {
        this.length = collection.length;
        for (var index_1 = 0; index_1 < this.length; index_1++) {
          item = collection[index_1];
          itemTrackBy = this._trackByFn(index_1, item);
          if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
            record = this._mismatch(record, item, itemTrackBy, index_1);
            mayBeDirty = true;
          } else {
            if (mayBeDirty) {
              record = this._verifyReinsertion(record, item, itemTrackBy, index_1);
            }
            if (!looseIdentical(record.item, item)) this._addIdentityChange(record, item);
          }
          record = record._next;
        }
      } else {
        index = 0;
        iterateListLike(collection, function(item2) {
          itemTrackBy = _this._trackByFn(index, item2);
          if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
            record = _this._mismatch(record, item2, itemTrackBy, index);
            mayBeDirty = true;
          } else {
            if (mayBeDirty) {
              record = _this._verifyReinsertion(record, item2, itemTrackBy, index);
            }
            if (!looseIdentical(record.item, item2)) _this._addIdentityChange(record, item2);
          }
          record = record._next;
          index++;
        });
        this.length = index;
      }
      this._truncate(record);
      this.collection = collection;
      return this.isDirty;
    };
    Object.defineProperty(DefaultIterableDiffer2.prototype, "isDirty", {
      /* CollectionChanges is considered dirty if it has any additions, moves, removals, or identity
       * changes.
       */
      get: function() {
        return this._additionsHead !== null || this._movesHead !== null || this._removalsHead !== null || this._identityChangesHead !== null;
      },
      enumerable: true,
      configurable: true
    });
    DefaultIterableDiffer2.prototype._reset = function() {
      if (this.isDirty) {
        var record = void 0;
        var nextRecord = void 0;
        for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
          record._nextPrevious = record._next;
        }
        for (record = this._additionsHead; record !== null; record = record._nextAdded) {
          record.previousIndex = record.currentIndex;
        }
        this._additionsHead = this._additionsTail = null;
        for (record = this._movesHead; record !== null; record = nextRecord) {
          record.previousIndex = record.currentIndex;
          nextRecord = record._nextMoved;
        }
        this._movesHead = this._movesTail = null;
        this._removalsHead = this._removalsTail = null;
        this._identityChangesHead = this._identityChangesTail = null;
      }
    };
    DefaultIterableDiffer2.prototype._mismatch = function(record, item, itemTrackBy, index) {
      var previousRecord;
      if (record === null) {
        previousRecord = this._itTail;
      } else {
        previousRecord = record._prev;
        this._remove(record);
      }
      record = this._linkedRecords === null ? null : this._linkedRecords.get(itemTrackBy, index);
      if (record !== null) {
        if (!looseIdentical(record.item, item)) this._addIdentityChange(record, item);
        this._moveAfter(record, previousRecord, index);
      } else {
        record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy, null);
        if (record !== null) {
          if (!looseIdentical(record.item, item)) this._addIdentityChange(record, item);
          this._reinsertAfter(record, previousRecord, index);
        } else {
          record = this._addAfter(new IterableChangeRecord_(item, itemTrackBy), previousRecord, index);
        }
      }
      return record;
    };
    DefaultIterableDiffer2.prototype._verifyReinsertion = function(record, item, itemTrackBy, index) {
      var reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy, null);
      if (reinsertRecord !== null) {
        record = this._reinsertAfter(reinsertRecord, record._prev, index);
      } else if (record.currentIndex != index) {
        record.currentIndex = index;
        this._addToMoves(record, index);
      }
      return record;
    };
    DefaultIterableDiffer2.prototype._truncate = function(record) {
      while (record !== null) {
        var nextRecord = record._next;
        this._addToRemovals(this._unlink(record));
        record = nextRecord;
      }
      if (this._unlinkedRecords !== null) {
        this._unlinkedRecords.clear();
      }
      if (this._additionsTail !== null) {
        this._additionsTail._nextAdded = null;
      }
      if (this._movesTail !== null) {
        this._movesTail._nextMoved = null;
      }
      if (this._itTail !== null) {
        this._itTail._next = null;
      }
      if (this._removalsTail !== null) {
        this._removalsTail._nextRemoved = null;
      }
      if (this._identityChangesTail !== null) {
        this._identityChangesTail._nextIdentityChange = null;
      }
    };
    DefaultIterableDiffer2.prototype._reinsertAfter = function(record, prevRecord, index) {
      if (this._unlinkedRecords !== null) {
        this._unlinkedRecords.remove(record);
      }
      var prev = record._prevRemoved;
      var next = record._nextRemoved;
      if (prev === null) {
        this._removalsHead = next;
      } else {
        prev._nextRemoved = next;
      }
      if (next === null) {
        this._removalsTail = prev;
      } else {
        next._prevRemoved = prev;
      }
      this._insertAfter(record, prevRecord, index);
      this._addToMoves(record, index);
      return record;
    };
    DefaultIterableDiffer2.prototype._moveAfter = function(record, prevRecord, index) {
      this._unlink(record);
      this._insertAfter(record, prevRecord, index);
      this._addToMoves(record, index);
      return record;
    };
    DefaultIterableDiffer2.prototype._addAfter = function(record, prevRecord, index) {
      this._insertAfter(record, prevRecord, index);
      if (this._additionsTail === null) {
        this._additionsTail = this._additionsHead = record;
      } else {
        this._additionsTail = this._additionsTail._nextAdded = record;
      }
      return record;
    };
    DefaultIterableDiffer2.prototype._insertAfter = function(record, prevRecord, index) {
      var next = prevRecord === null ? this._itHead : prevRecord._next;
      record._next = next;
      record._prev = prevRecord;
      if (next === null) {
        this._itTail = record;
      } else {
        next._prev = record;
      }
      if (prevRecord === null) {
        this._itHead = record;
      } else {
        prevRecord._next = record;
      }
      if (this._linkedRecords === null) {
        this._linkedRecords = new _DuplicateMap();
      }
      this._linkedRecords.put(record);
      record.currentIndex = index;
      return record;
    };
    DefaultIterableDiffer2.prototype._remove = function(record) {
      return this._addToRemovals(this._unlink(record));
    };
    DefaultIterableDiffer2.prototype._unlink = function(record) {
      if (this._linkedRecords !== null) {
        this._linkedRecords.remove(record);
      }
      var prev = record._prev;
      var next = record._next;
      if (prev === null) {
        this._itHead = next;
      } else {
        prev._next = next;
      }
      if (next === null) {
        this._itTail = prev;
      } else {
        next._prev = prev;
      }
      return record;
    };
    DefaultIterableDiffer2.prototype._addToMoves = function(record, toIndex) {
      if (record.previousIndex === toIndex) {
        return record;
      }
      if (this._movesTail === null) {
        this._movesTail = this._movesHead = record;
      } else {
        this._movesTail = this._movesTail._nextMoved = record;
      }
      return record;
    };
    DefaultIterableDiffer2.prototype._addToRemovals = function(record) {
      if (this._unlinkedRecords === null) {
        this._unlinkedRecords = new _DuplicateMap();
      }
      this._unlinkedRecords.put(record);
      record.currentIndex = null;
      record._nextRemoved = null;
      if (this._removalsTail === null) {
        this._removalsTail = this._removalsHead = record;
        record._prevRemoved = null;
      } else {
        record._prevRemoved = this._removalsTail;
        this._removalsTail = this._removalsTail._nextRemoved = record;
      }
      return record;
    };
    DefaultIterableDiffer2.prototype._addIdentityChange = function(record, item) {
      record.item = item;
      if (this._identityChangesTail === null) {
        this._identityChangesTail = this._identityChangesHead = record;
      } else {
        this._identityChangesTail = this._identityChangesTail._nextIdentityChange = record;
      }
      return record;
    };
    return DefaultIterableDiffer2;
  }()
);
var IterableChangeRecord_ = (
  /** @class */
  /* @__PURE__ */ function() {
    function IterableChangeRecord_2(item, trackById) {
      this.item = item;
      this.trackById = trackById;
      this.currentIndex = null;
      this.previousIndex = null;
      this._nextPrevious = null;
      this._prev = null;
      this._next = null;
      this._prevDup = null;
      this._nextDup = null;
      this._prevRemoved = null;
      this._nextRemoved = null;
      this._nextAdded = null;
      this._nextMoved = null;
      this._nextIdentityChange = null;
    }
    return IterableChangeRecord_2;
  }()
);
var _DuplicateItemRecordList = (
  /** @class */
  function() {
    function _DuplicateItemRecordList2() {
      this._head = null;
      this._tail = null;
    }
    _DuplicateItemRecordList2.prototype.add = function(record) {
      if (this._head === null) {
        this._head = this._tail = record;
        record._nextDup = null;
        record._prevDup = null;
      } else {
        this._tail._nextDup = record;
        record._prevDup = this._tail;
        record._nextDup = null;
        this._tail = record;
      }
    };
    _DuplicateItemRecordList2.prototype.get = function(trackById, atOrAfterIndex) {
      var record;
      for (record = this._head; record !== null; record = record._nextDup) {
        if ((atOrAfterIndex === null || atOrAfterIndex <= record.currentIndex) && looseIdentical(record.trackById, trackById)) {
          return record;
        }
      }
      return null;
    };
    _DuplicateItemRecordList2.prototype.remove = function(record) {
      var prev = record._prevDup;
      var next = record._nextDup;
      if (prev === null) {
        this._head = next;
      } else {
        prev._nextDup = next;
      }
      if (next === null) {
        this._tail = prev;
      } else {
        next._prevDup = prev;
      }
      return this._head === null;
    };
    return _DuplicateItemRecordList2;
  }()
);
var _DuplicateMap = (
  /** @class */
  function() {
    function _DuplicateMap2() {
      this.map = /* @__PURE__ */ new Map();
    }
    _DuplicateMap2.prototype.put = function(record) {
      var key = record.trackById;
      var duplicates = this.map.get(key);
      if (!duplicates) {
        duplicates = new _DuplicateItemRecordList();
        this.map.set(key, duplicates);
      }
      duplicates.add(record);
    };
    _DuplicateMap2.prototype.get = function(trackById, atOrAfterIndex) {
      var key = trackById;
      var recordList = this.map.get(key);
      return recordList ? recordList.get(trackById, atOrAfterIndex) : null;
    };
    _DuplicateMap2.prototype.remove = function(record) {
      var key = record.trackById;
      var recordList = this.map.get(key);
      if (recordList.remove(record)) {
        this.map.delete(key);
      }
      return record;
    };
    Object.defineProperty(_DuplicateMap2.prototype, "isEmpty", {
      get: function() {
        return this.map.size === 0;
      },
      enumerable: true,
      configurable: true
    });
    _DuplicateMap2.prototype.clear = function() {
      this.map.clear();
    };
    return _DuplicateMap2;
  }()
);
function getPreviousIndex(item, addRemoveOffset, moveOffsets) {
  var previousIndex = item.previousIndex;
  if (previousIndex === null) return previousIndex;
  var moveOffset = 0;
  if (moveOffsets && previousIndex < moveOffsets.length) {
    moveOffset = moveOffsets[previousIndex];
  }
  return previousIndex + addRemoveOffset + moveOffset;
}
var DefaultKeyValueDifferFactory = (
  /** @class */
  function() {
    function DefaultKeyValueDifferFactory2() {
    }
    DefaultKeyValueDifferFactory2.prototype.supports = function(obj) {
      return obj instanceof Map || isJsObject(obj);
    };
    DefaultKeyValueDifferFactory2.prototype.create = function() {
      return new DefaultKeyValueDiffer();
    };
    return DefaultKeyValueDifferFactory2;
  }()
);
var DefaultKeyValueDiffer = (
  /** @class */
  function() {
    function DefaultKeyValueDiffer2() {
      this._records = /* @__PURE__ */ new Map();
      this._mapHead = null;
      this._appendAfter = null;
      this._previousMapHead = null;
      this._changesHead = null;
      this._changesTail = null;
      this._additionsHead = null;
      this._additionsTail = null;
      this._removalsHead = null;
      this._removalsTail = null;
    }
    Object.defineProperty(DefaultKeyValueDiffer2.prototype, "isDirty", {
      get: function() {
        return this._additionsHead !== null || this._changesHead !== null || this._removalsHead !== null;
      },
      enumerable: true,
      configurable: true
    });
    DefaultKeyValueDiffer2.prototype.forEachItem = function(fn) {
      var record;
      for (record = this._mapHead; record !== null; record = record._next) {
        fn(record);
      }
    };
    DefaultKeyValueDiffer2.prototype.forEachPreviousItem = function(fn) {
      var record;
      for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
        fn(record);
      }
    };
    DefaultKeyValueDiffer2.prototype.forEachChangedItem = function(fn) {
      var record;
      for (record = this._changesHead; record !== null; record = record._nextChanged) {
        fn(record);
      }
    };
    DefaultKeyValueDiffer2.prototype.forEachAddedItem = function(fn) {
      var record;
      for (record = this._additionsHead; record !== null; record = record._nextAdded) {
        fn(record);
      }
    };
    DefaultKeyValueDiffer2.prototype.forEachRemovedItem = function(fn) {
      var record;
      for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
        fn(record);
      }
    };
    DefaultKeyValueDiffer2.prototype.diff = function(map2) {
      if (!map2) {
        map2 = /* @__PURE__ */ new Map();
      } else if (!(map2 instanceof Map || isJsObject(map2))) {
        throw new Error("Error trying to diff '" + stringify(map2) + "'. Only maps and objects are allowed");
      }
      return this.check(map2) ? this : null;
    };
    DefaultKeyValueDiffer2.prototype.onDestroy = function() {
    };
    DefaultKeyValueDiffer2.prototype.check = function(map2) {
      var _this = this;
      this._reset();
      var insertBefore = this._mapHead;
      this._appendAfter = null;
      this._forEach(map2, function(value, key) {
        if (insertBefore && insertBefore.key === key) {
          _this._maybeAddToChanges(insertBefore, value);
          _this._appendAfter = insertBefore;
          insertBefore = insertBefore._next;
        } else {
          var record2 = _this._getOrCreateRecordForKey(key, value);
          insertBefore = _this._insertBeforeOrAppend(insertBefore, record2);
        }
      });
      if (insertBefore) {
        if (insertBefore._prev) {
          insertBefore._prev._next = null;
        }
        this._removalsHead = insertBefore;
        for (var record = insertBefore; record !== null; record = record._nextRemoved) {
          if (record === this._mapHead) {
            this._mapHead = null;
          }
          this._records.delete(record.key);
          record._nextRemoved = record._next;
          record.previousValue = record.currentValue;
          record.currentValue = null;
          record._prev = null;
          record._next = null;
        }
      }
      if (this._changesTail) this._changesTail._nextChanged = null;
      if (this._additionsTail) this._additionsTail._nextAdded = null;
      return this.isDirty;
    };
    DefaultKeyValueDiffer2.prototype._insertBeforeOrAppend = function(before, record) {
      if (before) {
        var prev = before._prev;
        record._next = before;
        record._prev = prev;
        before._prev = record;
        if (prev) {
          prev._next = record;
        }
        if (before === this._mapHead) {
          this._mapHead = record;
        }
        this._appendAfter = before;
        return before;
      }
      if (this._appendAfter) {
        this._appendAfter._next = record;
        record._prev = this._appendAfter;
      } else {
        this._mapHead = record;
      }
      this._appendAfter = record;
      return null;
    };
    DefaultKeyValueDiffer2.prototype._getOrCreateRecordForKey = function(key, value) {
      if (this._records.has(key)) {
        var record_1 = this._records.get(key);
        this._maybeAddToChanges(record_1, value);
        var prev = record_1._prev;
        var next = record_1._next;
        if (prev) {
          prev._next = next;
        }
        if (next) {
          next._prev = prev;
        }
        record_1._next = null;
        record_1._prev = null;
        return record_1;
      }
      var record = new KeyValueChangeRecord_(key);
      this._records.set(key, record);
      record.currentValue = value;
      this._addToAdditions(record);
      return record;
    };
    DefaultKeyValueDiffer2.prototype._reset = function() {
      if (this.isDirty) {
        var record = void 0;
        this._previousMapHead = this._mapHead;
        for (record = this._previousMapHead; record !== null; record = record._next) {
          record._nextPrevious = record._next;
        }
        for (record = this._changesHead; record !== null; record = record._nextChanged) {
          record.previousValue = record.currentValue;
        }
        for (record = this._additionsHead; record != null; record = record._nextAdded) {
          record.previousValue = record.currentValue;
        }
        this._changesHead = this._changesTail = null;
        this._additionsHead = this._additionsTail = null;
        this._removalsHead = null;
      }
    };
    DefaultKeyValueDiffer2.prototype._maybeAddToChanges = function(record, newValue) {
      if (!looseIdentical(newValue, record.currentValue)) {
        record.previousValue = record.currentValue;
        record.currentValue = newValue;
        this._addToChanges(record);
      }
    };
    DefaultKeyValueDiffer2.prototype._addToAdditions = function(record) {
      if (this._additionsHead === null) {
        this._additionsHead = this._additionsTail = record;
      } else {
        this._additionsTail._nextAdded = record;
        this._additionsTail = record;
      }
    };
    DefaultKeyValueDiffer2.prototype._addToChanges = function(record) {
      if (this._changesHead === null) {
        this._changesHead = this._changesTail = record;
      } else {
        this._changesTail._nextChanged = record;
        this._changesTail = record;
      }
    };
    DefaultKeyValueDiffer2.prototype._forEach = function(obj, fn) {
      if (obj instanceof Map) {
        obj.forEach(fn);
      } else {
        Object.keys(obj).forEach(function(k) {
          return fn(obj[k], k);
        });
      }
    };
    return DefaultKeyValueDiffer2;
  }()
);
var KeyValueChangeRecord_ = (
  /** @class */
  /* @__PURE__ */ function() {
    function KeyValueChangeRecord_2(key) {
      this.key = key;
      this.previousValue = null;
      this.currentValue = null;
      this._nextPrevious = null;
      this._next = null;
      this._prev = null;
      this._nextAdded = null;
      this._nextRemoved = null;
      this._nextChanged = null;
    }
    return KeyValueChangeRecord_2;
  }()
);
var IterableDiffers = (
  /** @class */
  function() {
    function IterableDiffers2(factories) {
      this.factories = factories;
    }
    IterableDiffers2.create = function(factories, parent) {
      if (parent != null) {
        var copied = parent.factories.slice();
        factories = factories.concat(copied);
      }
      return new IterableDiffers2(factories);
    };
    IterableDiffers2.extend = function(factories) {
      return {
        provide: IterableDiffers2,
        useFactory: function(parent) {
          if (!parent) {
            throw new Error("Cannot extend IterableDiffers without a parent injector");
          }
          return IterableDiffers2.create(factories, parent);
        },
        // Dependency technically isn't optional, but we can provide a better error message this way.
        deps: [[IterableDiffers2, new SkipSelf(), new Optional()]]
      };
    };
    IterableDiffers2.prototype.find = function(iterable) {
      var factory = this.factories.find(function(f) {
        return f.supports(iterable);
      });
      if (factory != null) {
        return factory;
      } else {
        throw new Error("Cannot find a differ supporting object '" + iterable + "' of type '" + getTypeNameForDebugging(iterable) + "'");
      }
    };
    IterableDiffers2.ngInjectableDef = defineInjectable({
      providedIn: "root",
      factory: function() {
        return new IterableDiffers2([new DefaultIterableDifferFactory()]);
      }
    });
    return IterableDiffers2;
  }()
);
function getTypeNameForDebugging(type) {
  return type["name"] || typeof type;
}
var KeyValueDiffers = (
  /** @class */
  function() {
    function KeyValueDiffers2(factories) {
      this.factories = factories;
    }
    KeyValueDiffers2.create = function(factories, parent) {
      if (parent) {
        var copied = parent.factories.slice();
        factories = factories.concat(copied);
      }
      return new KeyValueDiffers2(factories);
    };
    KeyValueDiffers2.extend = function(factories) {
      return {
        provide: KeyValueDiffers2,
        useFactory: function(parent) {
          if (!parent) {
            throw new Error("Cannot extend KeyValueDiffers without a parent injector");
          }
          return KeyValueDiffers2.create(factories, parent);
        },
        // Dependency technically isn't optional, but we can provide a better error message this way.
        deps: [[KeyValueDiffers2, new SkipSelf(), new Optional()]]
      };
    };
    KeyValueDiffers2.prototype.find = function(kv) {
      var factory = this.factories.find(function(f) {
        return f.supports(kv);
      });
      if (factory) {
        return factory;
      }
      throw new Error("Cannot find a differ supporting object '" + kv + "'");
    };
    return KeyValueDiffers2;
  }()
);
var keyValDiff = [new DefaultKeyValueDifferFactory()];
var iterableDiff = [new DefaultIterableDifferFactory()];
var defaultIterableDiffers = new IterableDiffers(iterableDiff);
var defaultKeyValueDiffers = new KeyValueDiffers(keyValDiff);
var _CORE_PLATFORM_PROVIDERS = [
  // Set a default platform name for platforms that don't set it explicitly.
  {
    provide: PLATFORM_ID,
    useValue: "unknown"
  },
  {
    provide: PlatformRef,
    deps: [Injector]
  },
  {
    provide: TestabilityRegistry,
    deps: []
  },
  {
    provide: Console,
    deps: []
  }
];
var platformCore = createPlatformFactory(null, "core", _CORE_PLATFORM_PROVIDERS);
var LOCALE_ID = new InjectionToken("LocaleId");
var TRANSLATIONS = new InjectionToken("Translations");
var TRANSLATIONS_FORMAT = new InjectionToken("TranslationsFormat");
var MissingTranslationStrategy;
(function(MissingTranslationStrategy2) {
  MissingTranslationStrategy2[MissingTranslationStrategy2["Error"] = 0] = "Error";
  MissingTranslationStrategy2[MissingTranslationStrategy2["Warning"] = 1] = "Warning";
  MissingTranslationStrategy2[MissingTranslationStrategy2["Ignore"] = 2] = "Ignore";
})(MissingTranslationStrategy || (MissingTranslationStrategy = {}));
function _iterableDiffersFactory() {
  return defaultIterableDiffers;
}
function _keyValueDiffersFactory() {
  return defaultKeyValueDiffers;
}
function _localeFactory(locale) {
  return locale || "en-US";
}
var APPLICATION_MODULE_PROVIDERS = [{
  provide: ApplicationRef,
  useClass: ApplicationRef,
  deps: [NgZone, Console, Injector, ErrorHandler, ComponentFactoryResolver, ApplicationInitStatus]
}, {
  provide: ApplicationInitStatus,
  useClass: ApplicationInitStatus,
  deps: [[new Optional(), APP_INITIALIZER]]
}, {
  provide: Compiler,
  useClass: Compiler,
  deps: []
}, APP_ID_RANDOM_PROVIDER, {
  provide: IterableDiffers,
  useFactory: _iterableDiffersFactory,
  deps: []
}, {
  provide: KeyValueDiffers,
  useFactory: _keyValueDiffersFactory,
  deps: []
}, {
  provide: LOCALE_ID,
  useFactory: _localeFactory,
  deps: [[new Inject(LOCALE_ID), new Optional(), new SkipSelf()]]
}];
var ApplicationModule = (
  /** @class */
  function() {
    function ApplicationModule2(appRef) {
    }
    ApplicationModule2 = __decorate([NgModule({
      providers: APPLICATION_MODULE_PROVIDERS
    }), __metadata("design:paramtypes", [ApplicationRef])], ApplicationModule2);
    return ApplicationModule2;
  }()
);
var InertBodyHelper = (
  /** @class */
  function() {
    function InertBodyHelper2(defaultDoc) {
      this.defaultDoc = defaultDoc;
      this.inertDocument = this.defaultDoc.implementation.createHTMLDocument("sanitization-inert");
      this.inertBodyElement = this.inertDocument.body;
      if (this.inertBodyElement == null) {
        var inertHtml = this.inertDocument.createElement("html");
        this.inertDocument.appendChild(inertHtml);
        this.inertBodyElement = this.inertDocument.createElement("body");
        inertHtml.appendChild(this.inertBodyElement);
      }
      this.inertBodyElement.innerHTML = '<svg><g onload="this.parentNode.remove()"></g></svg>';
      if (this.inertBodyElement.querySelector && !this.inertBodyElement.querySelector("svg")) {
        this.getInertBodyElement = this.getInertBodyElement_XHR;
        return;
      }
      this.inertBodyElement.innerHTML = '<svg><p><style><img src="</style><img src=x onerror=alert(1)//">';
      if (this.inertBodyElement.querySelector && this.inertBodyElement.querySelector("svg img")) {
        if (isDOMParserAvailable()) {
          this.getInertBodyElement = this.getInertBodyElement_DOMParser;
          return;
        }
      }
      this.getInertBodyElement = this.getInertBodyElement_InertDocument;
    }
    InertBodyHelper2.prototype.getInertBodyElement_XHR = function(html) {
      html = "<body><remove></remove>" + html + "</body>";
      try {
        html = encodeURI(html);
      } catch (e) {
        return null;
      }
      var xhr = new XMLHttpRequest();
      xhr.responseType = "document";
      xhr.open("GET", "data:text/html;charset=utf-8," + html, false);
      xhr.send(null);
      var body = xhr.response.body;
      body.removeChild(body.firstChild);
      return body;
    };
    InertBodyHelper2.prototype.getInertBodyElement_DOMParser = function(html) {
      html = "<body><remove></remove>" + html + "</body>";
      try {
        var body = new window.DOMParser().parseFromString(html, "text/html").body;
        body.removeChild(body.firstChild);
        return body;
      } catch (e) {
        return null;
      }
    };
    InertBodyHelper2.prototype.getInertBodyElement_InertDocument = function(html) {
      var templateEl = this.inertDocument.createElement("template");
      if ("content" in templateEl) {
        templateEl.innerHTML = html;
        return templateEl;
      }
      this.inertBodyElement.innerHTML = html;
      if (this.defaultDoc.documentMode) {
        this.stripCustomNsAttrs(this.inertBodyElement);
      }
      return this.inertBodyElement;
    };
    InertBodyHelper2.prototype.stripCustomNsAttrs = function(el) {
      var elAttrs = el.attributes;
      for (var i = elAttrs.length - 1; 0 < i; i--) {
        var attrib = elAttrs.item(i);
        var attrName = attrib.name;
        if (attrName === "xmlns:ns1" || attrName.indexOf("ns1:") === 0) {
          el.removeAttribute(attrName);
        }
      }
      var childNode = el.firstChild;
      while (childNode) {
        if (childNode.nodeType === Node.ELEMENT_NODE) this.stripCustomNsAttrs(childNode);
        childNode = childNode.nextSibling;
      }
    };
    return InertBodyHelper2;
  }()
);
function isDOMParserAvailable() {
  try {
    return !!window.DOMParser;
  } catch (e) {
    return false;
  }
}
var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;
var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+\/]+=*$/i;
function _sanitizeUrl(url) {
  url = String(url);
  if (url.match(SAFE_URL_PATTERN) || url.match(DATA_URL_PATTERN)) return url;
  if (isDevMode()) {
    console.warn("WARNING: sanitizing unsafe URL value " + url + " (see http://g.co/ng/security#xss)");
  }
  return "unsafe:" + url;
}
function sanitizeSrcset(srcset) {
  srcset = String(srcset);
  return srcset.split(",").map(function(srcset2) {
    return _sanitizeUrl(srcset2.trim());
  }).join(", ");
}
function tagSet(tags) {
  var e_1, _a;
  var res = {};
  try {
    for (var _b = __values(tags.split(",")), _c = _b.next(); !_c.done; _c = _b.next()) {
      var t = _c.value;
      res[t] = true;
    }
  } catch (e_1_1) {
    e_1 = {
      error: e_1_1
    };
  } finally {
    try {
      if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
  return res;
}
function merge$1() {
  var sets = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    sets[_i] = arguments[_i];
  }
  var e_2, _a;
  var res = {};
  try {
    for (var sets_1 = __values(sets), sets_1_1 = sets_1.next(); !sets_1_1.done; sets_1_1 = sets_1.next()) {
      var s = sets_1_1.value;
      for (var v in s) {
        if (s.hasOwnProperty(v)) res[v] = true;
      }
    }
  } catch (e_2_1) {
    e_2 = {
      error: e_2_1
    };
  } finally {
    try {
      if (sets_1_1 && !sets_1_1.done && (_a = sets_1.return)) _a.call(sets_1);
    } finally {
      if (e_2) throw e_2.error;
    }
  }
  return res;
}
var VOID_ELEMENTS = tagSet("area,br,col,hr,img,wbr");
var OPTIONAL_END_TAG_BLOCK_ELEMENTS = tagSet("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr");
var OPTIONAL_END_TAG_INLINE_ELEMENTS = tagSet("rp,rt");
var OPTIONAL_END_TAG_ELEMENTS = merge$1(OPTIONAL_END_TAG_INLINE_ELEMENTS, OPTIONAL_END_TAG_BLOCK_ELEMENTS);
var BLOCK_ELEMENTS = merge$1(OPTIONAL_END_TAG_BLOCK_ELEMENTS, tagSet("address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul"));
var INLINE_ELEMENTS = merge$1(OPTIONAL_END_TAG_INLINE_ELEMENTS, tagSet("a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video"));
var VALID_ELEMENTS = merge$1(VOID_ELEMENTS, BLOCK_ELEMENTS, INLINE_ELEMENTS, OPTIONAL_END_TAG_ELEMENTS);
var URI_ATTRS = tagSet("background,cite,href,itemtype,longdesc,poster,src,xlink:href");
var SRCSET_ATTRS = tagSet("srcset");
var HTML_ATTRS = tagSet("abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width");
var VALID_ATTRS = merge$1(URI_ATTRS, SRCSET_ATTRS, HTML_ATTRS);
var SanitizingHtmlSerializer = (
  /** @class */
  function() {
    function SanitizingHtmlSerializer2() {
      this.sanitizedSomething = false;
      this.buf = [];
    }
    SanitizingHtmlSerializer2.prototype.sanitizeChildren = function(el) {
      var current = el.firstChild;
      while (current) {
        if (current.nodeType === Node.ELEMENT_NODE) {
          this.startElement(current);
        } else if (current.nodeType === Node.TEXT_NODE) {
          this.chars(current.nodeValue);
        } else {
          this.sanitizedSomething = true;
        }
        if (current.firstChild) {
          current = current.firstChild;
          continue;
        }
        while (current) {
          if (current.nodeType === Node.ELEMENT_NODE) {
            this.endElement(current);
          }
          var next = this.checkClobberedElement(current, current.nextSibling);
          if (next) {
            current = next;
            break;
          }
          current = this.checkClobberedElement(current, current.parentNode);
        }
      }
      return this.buf.join("");
    };
    SanitizingHtmlSerializer2.prototype.startElement = function(element) {
      var tagName = element.nodeName.toLowerCase();
      if (!VALID_ELEMENTS.hasOwnProperty(tagName)) {
        this.sanitizedSomething = true;
        return;
      }
      this.buf.push("<");
      this.buf.push(tagName);
      var elAttrs = element.attributes;
      for (var i = 0; i < elAttrs.length; i++) {
        var elAttr = elAttrs.item(i);
        var attrName = elAttr.name;
        var lower = attrName.toLowerCase();
        if (!VALID_ATTRS.hasOwnProperty(lower)) {
          this.sanitizedSomething = true;
          continue;
        }
        var value = elAttr.value;
        if (URI_ATTRS[lower]) value = _sanitizeUrl(value);
        if (SRCSET_ATTRS[lower]) value = sanitizeSrcset(value);
        this.buf.push(" ", attrName, '="', encodeEntities(value), '"');
      }
      this.buf.push(">");
    };
    SanitizingHtmlSerializer2.prototype.endElement = function(current) {
      var tagName = current.nodeName.toLowerCase();
      if (VALID_ELEMENTS.hasOwnProperty(tagName) && !VOID_ELEMENTS.hasOwnProperty(tagName)) {
        this.buf.push("</");
        this.buf.push(tagName);
        this.buf.push(">");
      }
    };
    SanitizingHtmlSerializer2.prototype.chars = function(chars) {
      this.buf.push(encodeEntities(chars));
    };
    SanitizingHtmlSerializer2.prototype.checkClobberedElement = function(node, nextNode) {
      if (nextNode && (node.compareDocumentPosition(nextNode) & Node.DOCUMENT_POSITION_CONTAINED_BY) === Node.DOCUMENT_POSITION_CONTAINED_BY) {
        throw new Error("Failed to sanitize html because the element is clobbered: " + node.outerHTML);
      }
      return nextNode;
    };
    return SanitizingHtmlSerializer2;
  }()
);
var SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var NON_ALPHANUMERIC_REGEXP = /([^\#-~ |!])/g;
function encodeEntities(value) {
  return value.replace(/&/g, "&amp;").replace(SURROGATE_PAIR_REGEXP, function(match) {
    var hi = match.charCodeAt(0);
    var low = match.charCodeAt(1);
    return "&#" + ((hi - 55296) * 1024 + (low - 56320) + 65536) + ";";
  }).replace(NON_ALPHANUMERIC_REGEXP, function(match) {
    return "&#" + match.charCodeAt(0) + ";";
  }).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
var VALUES = `[-,."'%_!# a-zA-Z0-9]+`;
var TRANSFORMATION_FNS = "(?:matrix|translate|scale|rotate|skew|perspective)(?:X|Y|3d)?";
var COLOR_FNS = "(?:rgb|hsl)a?";
var GRADIENTS = "(?:repeating-)?(?:linear|radial)-gradient";
var CSS3_FNS = "(?:calc|attr)";
var FN_ARGS = "\\([-0-9.%, #a-zA-Z]+\\)";
var SAFE_STYLE_VALUE = new RegExp("^(" + VALUES + "|" + ("(?:" + TRANSFORMATION_FNS + "|" + COLOR_FNS + "|" + GRADIENTS + "|" + CSS3_FNS + ")") + (FN_ARGS + ")$"), "g");
var SecurityContext;
(function(SecurityContext2) {
  SecurityContext2[SecurityContext2["NONE"] = 0] = "NONE";
  SecurityContext2[SecurityContext2["HTML"] = 1] = "HTML";
  SecurityContext2[SecurityContext2["STYLE"] = 2] = "STYLE";
  SecurityContext2[SecurityContext2["SCRIPT"] = 3] = "SCRIPT";
  SecurityContext2[SecurityContext2["URL"] = 4] = "URL";
  SecurityContext2[SecurityContext2["RESOURCE_URL"] = 5] = "RESOURCE_URL";
})(SecurityContext || (SecurityContext = {}));
var Sanitizer = (
  /** @class */
  /* @__PURE__ */ function() {
    function Sanitizer2() {
    }
    return Sanitizer2;
  }()
);
function shiftInitState(view, priorInitState, newInitState) {
  var state = view.state;
  var initState = state & 1792;
  if (initState === priorInitState) {
    view.state = state & ~1792 | newInitState;
    view.initIndex = -1;
    return true;
  }
  return initState === newInitState;
}
function shouldCallLifecycleInitHook(view, initState, index) {
  if ((view.state & 1792) === initState && view.initIndex <= index) {
    view.initIndex = index + 1;
    return true;
  }
  return false;
}
function asTextData(view, index) {
  return view.nodes[index];
}
function asElementData(view, index) {
  return view.nodes[index];
}
function asProviderData(view, index) {
  return view.nodes[index];
}
function asPureExpressionData(view, index) {
  return view.nodes[index];
}
function asQueryList(view, index) {
  return view.nodes[index];
}
var Services = {
  setCurrentNode: void 0,
  createRootView: void 0,
  createEmbeddedView: void 0,
  createComponentView: void 0,
  createNgModuleRef: void 0,
  overrideProvider: void 0,
  overrideComponentView: void 0,
  clearOverrides: void 0,
  checkAndUpdateView: void 0,
  checkNoChangesView: void 0,
  destroyView: void 0,
  resolveDep: void 0,
  createDebugContext: void 0,
  handleEvent: void 0,
  updateDirectives: void 0,
  updateRenderer: void 0,
  dirtyParentQueries: void 0
};
function expressionChangedAfterItHasBeenCheckedError(context, oldValue, currValue, isFirstCheck) {
  var msg = "ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: '" + oldValue + "'. Current value: '" + currValue + "'.";
  if (isFirstCheck) {
    msg += " It seems like the view has been created after its parent and its children have been dirty checked. Has it been created in a change detection hook ?";
  }
  return viewDebugError(msg, context);
}
function viewWrappedDebugError(err, context) {
  if (!(err instanceof Error)) {
    err = new Error(err.toString());
  }
  _addDebugContext(err, context);
  return err;
}
function viewDebugError(msg, context) {
  var err = new Error(msg);
  _addDebugContext(err, context);
  return err;
}
function _addDebugContext(err, context) {
  err[ERROR_DEBUG_CONTEXT] = context;
  err[ERROR_LOGGER] = context.logError.bind(context);
}
function isViewDebugError(err) {
  return !!getDebugContext(err);
}
function viewDestroyedError(action) {
  return new Error("ViewDestroyedError: Attempt to use a destroyed view: " + action);
}
var NOOP = function() {
};
var _tokenKeyCache = /* @__PURE__ */ new Map();
function tokenKey(token) {
  var key = _tokenKeyCache.get(token);
  if (!key) {
    key = stringify(token) + "_" + _tokenKeyCache.size;
    _tokenKeyCache.set(token, key);
  }
  return key;
}
function checkBinding(view, def, bindingIdx, value) {
  var oldValues = view.oldValues;
  if (view.state & 2 || !looseIdentical(oldValues[def.bindingIndex + bindingIdx], value)) {
    return true;
  }
  return false;
}
function checkAndUpdateBinding(view, def, bindingIdx, value) {
  if (checkBinding(view, def, bindingIdx, value)) {
    view.oldValues[def.bindingIndex + bindingIdx] = value;
    return true;
  }
  return false;
}
function checkBindingNoChanges(view, def, bindingIdx, value) {
  var oldValue = view.oldValues[def.bindingIndex + bindingIdx];
  if (view.state & 1 || !devModeEqual(oldValue, value)) {
    var bindingName = def.bindings[bindingIdx].name;
    throw expressionChangedAfterItHasBeenCheckedError(Services.createDebugContext(view, def.nodeIndex), bindingName + ": " + oldValue, bindingName + ": " + value, (view.state & 1) !== 0);
  }
}
function markParentViewsForCheck(view) {
  var currView = view;
  while (currView) {
    if (currView.def.flags & 2) {
      currView.state |= 8;
    }
    currView = currView.viewContainerParent || currView.parent;
  }
}
function markParentViewsForCheckProjectedViews(view, endView) {
  var currView = view;
  while (currView && currView !== endView) {
    currView.state |= 64;
    currView = currView.viewContainerParent || currView.parent;
  }
}
function dispatchEvent(view, nodeIndex, eventName, event) {
  try {
    var nodeDef = view.def.nodes[nodeIndex];
    var startView = nodeDef.flags & 33554432 ? asElementData(view, nodeIndex).componentView : view;
    markParentViewsForCheck(startView);
    return Services.handleEvent(view, nodeIndex, eventName, event);
  } catch (e) {
    view.root.errorHandler.handleError(e);
  }
}
function declaredViewContainer(view) {
  if (view.parent) {
    var parentView = view.parent;
    return asElementData(parentView, view.parentNodeDef.nodeIndex);
  }
  return null;
}
function viewParentEl(view) {
  var parentView = view.parent;
  if (parentView) {
    return view.parentNodeDef.parent;
  } else {
    return null;
  }
}
function renderNode(view, def) {
  switch (def.flags & 201347067) {
    case 1:
      return asElementData(view, def.nodeIndex).renderElement;
    case 2:
      return asTextData(view, def.nodeIndex).renderText;
  }
}
function elementEventFullName(target, name) {
  return target ? target + ":" + name : name;
}
function isComponentView(view) {
  return !!view.parent && !!(view.parentNodeDef.flags & 32768);
}
function isEmbeddedView(view) {
  return !!view.parent && !(view.parentNodeDef.flags & 32768);
}
function splitDepsDsl(deps, sourceName) {
  return deps.map(function(value) {
    var _a;
    var token;
    var flags;
    if (Array.isArray(value)) {
      _a = __read(value, 2), flags = _a[0], token = _a[1];
    } else {
      flags = 0;
      token = value;
    }
    if (token && (typeof token === "function" || typeof token === "object") && sourceName) {
      Object.defineProperty(token, SOURCE, {
        value: sourceName,
        configurable: true
      });
    }
    return {
      flags,
      token,
      tokenKey: tokenKey(token)
    };
  });
}
function getParentRenderElement(view, renderHost, def) {
  var renderParent = def.renderParent;
  if (renderParent) {
    if ((renderParent.flags & 1) === 0 || (renderParent.flags & 33554432) === 0 || renderParent.element.componentRendererType && renderParent.element.componentRendererType.encapsulation === ViewEncapsulation.Native) {
      return asElementData(view, def.renderParent.nodeIndex).renderElement;
    }
  } else {
    return renderHost;
  }
}
var DEFINITION_CACHE = /* @__PURE__ */ new WeakMap();
function resolveDefinition(factory) {
  var value = DEFINITION_CACHE.get(factory);
  if (!value) {
    value = factory(function() {
      return NOOP;
    });
    value.factory = factory;
    DEFINITION_CACHE.set(factory, value);
  }
  return value;
}
function rootRenderNodes(view) {
  var renderNodes = [];
  visitRootRenderNodes(view, 0, void 0, void 0, renderNodes);
  return renderNodes;
}
function visitRootRenderNodes(view, action, parentNode, nextSibling, target) {
  if (action === 3) {
    parentNode = view.renderer.parentNode(renderNode(view, view.def.lastRenderRootNode));
  }
  visitSiblingRenderNodes(view, action, 0, view.def.nodes.length - 1, parentNode, nextSibling, target);
}
function visitSiblingRenderNodes(view, action, startIndex, endIndex, parentNode, nextSibling, target) {
  for (var i = startIndex; i <= endIndex; i++) {
    var nodeDef = view.def.nodes[i];
    if (nodeDef.flags & (1 | 2 | 8)) {
      visitRenderNode(view, nodeDef, action, parentNode, nextSibling, target);
    }
    i += nodeDef.childCount;
  }
}
function visitProjectedRenderNodes(view, ngContentIndex, action, parentNode, nextSibling, target) {
  var compView = view;
  while (compView && !isComponentView(compView)) {
    compView = compView.parent;
  }
  var hostView = compView.parent;
  var hostElDef = viewParentEl(compView);
  var startIndex = hostElDef.nodeIndex + 1;
  var endIndex = hostElDef.nodeIndex + hostElDef.childCount;
  for (var i = startIndex; i <= endIndex; i++) {
    var nodeDef = hostView.def.nodes[i];
    if (nodeDef.ngContentIndex === ngContentIndex) {
      visitRenderNode(hostView, nodeDef, action, parentNode, nextSibling, target);
    }
    i += nodeDef.childCount;
  }
  if (!hostView.parent) {
    var projectedNodes = view.root.projectableNodes[ngContentIndex];
    if (projectedNodes) {
      for (var i = 0; i < projectedNodes.length; i++) {
        execRenderNodeAction(view, projectedNodes[i], action, parentNode, nextSibling, target);
      }
    }
  }
}
function visitRenderNode(view, nodeDef, action, parentNode, nextSibling, target) {
  if (nodeDef.flags & 8) {
    visitProjectedRenderNodes(view, nodeDef.ngContent.index, action, parentNode, nextSibling, target);
  } else {
    var rn = renderNode(view, nodeDef);
    if (action === 3 && nodeDef.flags & 33554432 && nodeDef.bindingFlags & 48) {
      if (nodeDef.bindingFlags & 16) {
        execRenderNodeAction(view, rn, action, parentNode, nextSibling, target);
      }
      if (nodeDef.bindingFlags & 32) {
        var compView = asElementData(view, nodeDef.nodeIndex).componentView;
        execRenderNodeAction(compView, rn, action, parentNode, nextSibling, target);
      }
    } else {
      execRenderNodeAction(view, rn, action, parentNode, nextSibling, target);
    }
    if (nodeDef.flags & 16777216) {
      var embeddedViews = asElementData(view, nodeDef.nodeIndex).viewContainer._embeddedViews;
      for (var k = 0; k < embeddedViews.length; k++) {
        visitRootRenderNodes(embeddedViews[k], action, parentNode, nextSibling, target);
      }
    }
    if (nodeDef.flags & 1 && !nodeDef.element.name) {
      visitSiblingRenderNodes(view, action, nodeDef.nodeIndex + 1, nodeDef.nodeIndex + nodeDef.childCount, parentNode, nextSibling, target);
    }
  }
}
function execRenderNodeAction(view, renderNode2, action, parentNode, nextSibling, target) {
  var renderer2 = view.renderer;
  switch (action) {
    case 1:
      renderer2.appendChild(parentNode, renderNode2);
      break;
    case 2:
      renderer2.insertBefore(parentNode, renderNode2, nextSibling);
      break;
    case 3:
      renderer2.removeChild(parentNode, renderNode2);
      break;
    case 0:
      target.push(renderNode2);
      break;
  }
}
var NS_PREFIX_RE = /^:([^:]+):(.+)$/;
function splitNamespace(name) {
  if (name[0] === ":") {
    var match = name.match(NS_PREFIX_RE);
    return [match[1], match[2]];
  }
  return ["", name];
}
function createElement(view, renderHost, def) {
  var elDef = def.element;
  var rootSelectorOrNode = view.root.selectorOrNode;
  var renderer2 = view.renderer;
  var el;
  if (view.parent || !rootSelectorOrNode) {
    if (elDef.name) {
      el = renderer2.createElement(elDef.name, elDef.ns);
    } else {
      el = renderer2.createComment("");
    }
    var parentEl = getParentRenderElement(view, renderHost, def);
    if (parentEl) {
      renderer2.appendChild(parentEl, el);
    }
  } else {
    el = renderer2.selectRootElement(rootSelectorOrNode);
  }
  if (elDef.attrs) {
    for (var i = 0; i < elDef.attrs.length; i++) {
      var _a = __read(elDef.attrs[i], 3), ns = _a[0], name_2 = _a[1], value = _a[2];
      renderer2.setAttribute(el, name_2, value, ns);
    }
  }
  return el;
}
function listenToElementOutputs(view, compView, def, el) {
  for (var i = 0; i < def.outputs.length; i++) {
    var output = def.outputs[i];
    var handleEventClosure = renderEventHandlerClosure(view, def.nodeIndex, elementEventFullName(output.target, output.eventName));
    var listenTarget = output.target;
    var listenerView = view;
    if (output.target === "component") {
      listenTarget = null;
      listenerView = compView;
    }
    var disposable = listenerView.renderer.listen(listenTarget || el, output.eventName, handleEventClosure);
    view.disposables[def.outputIndex + i] = disposable;
  }
}
function renderEventHandlerClosure(view, index, eventName) {
  return function(event) {
    return dispatchEvent(view, index, eventName, event);
  };
}
function checkAndUpdateElementInline(view, def, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
  var bindLen = def.bindings.length;
  var changed = false;
  if (bindLen > 0 && checkAndUpdateElementValue(view, def, 0, v0)) changed = true;
  if (bindLen > 1 && checkAndUpdateElementValue(view, def, 1, v1)) changed = true;
  if (bindLen > 2 && checkAndUpdateElementValue(view, def, 2, v2)) changed = true;
  if (bindLen > 3 && checkAndUpdateElementValue(view, def, 3, v3)) changed = true;
  if (bindLen > 4 && checkAndUpdateElementValue(view, def, 4, v4)) changed = true;
  if (bindLen > 5 && checkAndUpdateElementValue(view, def, 5, v5)) changed = true;
  if (bindLen > 6 && checkAndUpdateElementValue(view, def, 6, v6)) changed = true;
  if (bindLen > 7 && checkAndUpdateElementValue(view, def, 7, v7)) changed = true;
  if (bindLen > 8 && checkAndUpdateElementValue(view, def, 8, v8)) changed = true;
  if (bindLen > 9 && checkAndUpdateElementValue(view, def, 9, v9)) changed = true;
  return changed;
}
function checkAndUpdateElementDynamic(view, def, values) {
  var changed = false;
  for (var i = 0; i < values.length; i++) {
    if (checkAndUpdateElementValue(view, def, i, values[i])) changed = true;
  }
  return changed;
}
function checkAndUpdateElementValue(view, def, bindingIdx, value) {
  if (!checkAndUpdateBinding(view, def, bindingIdx, value)) {
    return false;
  }
  var binding = def.bindings[bindingIdx];
  var elData = asElementData(view, def.nodeIndex);
  var renderNode$$1 = elData.renderElement;
  var name = binding.name;
  switch (binding.flags & 15) {
    case 1:
      setElementAttribute(view, binding, renderNode$$1, binding.ns, name, value);
      break;
    case 2:
      setElementClass(view, renderNode$$1, name, value);
      break;
    case 4:
      setElementStyle(view, binding, renderNode$$1, name, value);
      break;
    case 8:
      var bindView = def.flags & 33554432 && binding.flags & 32 ? elData.componentView : view;
      setElementProperty(bindView, binding, renderNode$$1, name, value);
      break;
  }
  return true;
}
function setElementAttribute(view, binding, renderNode$$1, ns, name, value) {
  var securityContext = binding.securityContext;
  var renderValue = securityContext ? view.root.sanitizer.sanitize(securityContext, value) : value;
  renderValue = renderValue != null ? renderValue.toString() : null;
  var renderer2 = view.renderer;
  if (value != null) {
    renderer2.setAttribute(renderNode$$1, name, renderValue, ns);
  } else {
    renderer2.removeAttribute(renderNode$$1, name, ns);
  }
}
function setElementClass(view, renderNode$$1, name, value) {
  var renderer2 = view.renderer;
  if (value) {
    renderer2.addClass(renderNode$$1, name);
  } else {
    renderer2.removeClass(renderNode$$1, name);
  }
}
function setElementStyle(view, binding, renderNode$$1, name, value) {
  var renderValue = view.root.sanitizer.sanitize(SecurityContext.STYLE, value);
  if (renderValue != null) {
    renderValue = renderValue.toString();
    var unit = binding.suffix;
    if (unit != null) {
      renderValue = renderValue + unit;
    }
  } else {
    renderValue = null;
  }
  var renderer2 = view.renderer;
  if (renderValue != null) {
    renderer2.setStyle(renderNode$$1, name, renderValue);
  } else {
    renderer2.removeStyle(renderNode$$1, name);
  }
}
function setElementProperty(view, binding, renderNode$$1, name, value) {
  var securityContext = binding.securityContext;
  var renderValue = securityContext ? view.root.sanitizer.sanitize(securityContext, value) : value;
  view.renderer.setProperty(renderNode$$1, name, renderValue);
}
var UNDEFINED_VALUE = new Object();
var InjectorRefTokenKey = tokenKey(Injector);
var INJECTORRefTokenKey = tokenKey(INJECTOR);
var NgModuleRefTokenKey = tokenKey(NgModuleRef);
function initNgModule(data) {
  var def = data._def;
  var providers = data._providers = new Array(def.providers.length);
  for (var i = 0; i < def.providers.length; i++) {
    var provDef = def.providers[i];
    if (!(provDef.flags & 4096)) {
      if (providers[i] === void 0) {
        providers[i] = _createProviderInstance(data, provDef);
      }
    }
  }
}
function resolveNgModuleDep(data, depDef, notFoundValue) {
  if (notFoundValue === void 0) {
    notFoundValue = Injector.THROW_IF_NOT_FOUND;
  }
  var former = setCurrentInjector(data);
  try {
    if (depDef.flags & 8) {
      return depDef.token;
    }
    if (depDef.flags & 2) {
      notFoundValue = null;
    }
    if (depDef.flags & 1) {
      return data._parent.get(depDef.token, notFoundValue);
    }
    var tokenKey_1 = depDef.tokenKey;
    switch (tokenKey_1) {
      case InjectorRefTokenKey:
      case INJECTORRefTokenKey:
      case NgModuleRefTokenKey:
        return data;
    }
    var providerDef = data._def.providersByKey[tokenKey_1];
    if (providerDef) {
      var providerInstance = data._providers[providerDef.index];
      if (providerInstance === void 0) {
        providerInstance = data._providers[providerDef.index] = _createProviderInstance(data, providerDef);
      }
      return providerInstance === UNDEFINED_VALUE ? void 0 : providerInstance;
    } else if (depDef.token.ngInjectableDef && targetsModule(data, depDef.token.ngInjectableDef)) {
      var injectableDef = depDef.token.ngInjectableDef;
      var index = data._providers.length;
      data._def.providersByKey[depDef.tokenKey] = {
        flags: 1024 | 4096,
        value: injectableDef.factory,
        deps: [],
        index,
        token: depDef.token
      };
      data._providers[index] = UNDEFINED_VALUE;
      return data._providers[index] = _createProviderInstance(data, data._def.providersByKey[depDef.tokenKey]);
    } else if (depDef.flags & 4) {
      return notFoundValue;
    }
    return data._parent.get(depDef.token, notFoundValue);
  } finally {
    setCurrentInjector(former);
  }
}
function moduleTransitivelyPresent(ngModule, scope) {
  return ngModule._def.modules.indexOf(scope) > -1;
}
function targetsModule(ngModule, def) {
  return def.providedIn != null && (moduleTransitivelyPresent(ngModule, def.providedIn) || def.providedIn === "root" && ngModule._def.isRoot);
}
function _createProviderInstance(ngModule, providerDef) {
  var injectable;
  switch (providerDef.flags & 201347067) {
    case 512:
      injectable = _createClass(ngModule, providerDef.value, providerDef.deps);
      break;
    case 1024:
      injectable = _callFactory(ngModule, providerDef.value, providerDef.deps);
      break;
    case 2048:
      injectable = resolveNgModuleDep(ngModule, providerDef.deps[0]);
      break;
    case 256:
      injectable = providerDef.value;
      break;
  }
  if (injectable !== UNDEFINED_VALUE && injectable != null && typeof injectable === "object" && !(providerDef.flags & 131072) && typeof injectable.ngOnDestroy === "function") {
    providerDef.flags |= 131072;
  }
  return injectable === void 0 ? UNDEFINED_VALUE : injectable;
}
function _createClass(ngModule, ctor, deps) {
  var len = deps.length;
  switch (len) {
    case 0:
      return new ctor();
    case 1:
      return new ctor(resolveNgModuleDep(ngModule, deps[0]));
    case 2:
      return new ctor(resolveNgModuleDep(ngModule, deps[0]), resolveNgModuleDep(ngModule, deps[1]));
    case 3:
      return new ctor(resolveNgModuleDep(ngModule, deps[0]), resolveNgModuleDep(ngModule, deps[1]), resolveNgModuleDep(ngModule, deps[2]));
    default:
      var depValues = new Array(len);
      for (var i = 0; i < len; i++) {
        depValues[i] = resolveNgModuleDep(ngModule, deps[i]);
      }
      return new (ctor.bind.apply(ctor, __spread([void 0], depValues)))();
  }
}
function _callFactory(ngModule, factory, deps) {
  var len = deps.length;
  switch (len) {
    case 0:
      return factory();
    case 1:
      return factory(resolveNgModuleDep(ngModule, deps[0]));
    case 2:
      return factory(resolveNgModuleDep(ngModule, deps[0]), resolveNgModuleDep(ngModule, deps[1]));
    case 3:
      return factory(resolveNgModuleDep(ngModule, deps[0]), resolveNgModuleDep(ngModule, deps[1]), resolveNgModuleDep(ngModule, deps[2]));
    default:
      var depValues = Array(len);
      for (var i = 0; i < len; i++) {
        depValues[i] = resolveNgModuleDep(ngModule, deps[i]);
      }
      return factory.apply(void 0, __spread(depValues));
  }
}
function callNgModuleLifecycle(ngModule, lifecycles) {
  var def = ngModule._def;
  var destroyed = /* @__PURE__ */ new Set();
  for (var i = 0; i < def.providers.length; i++) {
    var provDef = def.providers[i];
    if (provDef.flags & 131072) {
      var instance = ngModule._providers[i];
      if (instance && instance !== UNDEFINED_VALUE) {
        var onDestroy = instance.ngOnDestroy;
        if (typeof onDestroy === "function" && !destroyed.has(instance)) {
          onDestroy.apply(instance);
          destroyed.add(instance);
        }
      }
    }
  }
}
function attachEmbeddedView(parentView, elementData, viewIndex, view) {
  var embeddedViews = elementData.viewContainer._embeddedViews;
  if (viewIndex === null || viewIndex === void 0) {
    viewIndex = embeddedViews.length;
  }
  view.viewContainerParent = parentView;
  addToArray(embeddedViews, viewIndex, view);
  attachProjectedView(elementData, view);
  Services.dirtyParentQueries(view);
  var prevView = viewIndex > 0 ? embeddedViews[viewIndex - 1] : null;
  renderAttachEmbeddedView(elementData, prevView, view);
}
function attachProjectedView(vcElementData, view) {
  var dvcElementData = declaredViewContainer(view);
  if (!dvcElementData || dvcElementData === vcElementData || view.state & 16) {
    return;
  }
  view.state |= 16;
  var projectedViews = dvcElementData.template._projectedViews;
  if (!projectedViews) {
    projectedViews = dvcElementData.template._projectedViews = [];
  }
  projectedViews.push(view);
  markNodeAsProjectedTemplate(view.parent.def, view.parentNodeDef);
}
function markNodeAsProjectedTemplate(viewDef, nodeDef) {
  if (nodeDef.flags & 4) {
    return;
  }
  viewDef.nodeFlags |= 4;
  nodeDef.flags |= 4;
  var parentNodeDef = nodeDef.parent;
  while (parentNodeDef) {
    parentNodeDef.childFlags |= 4;
    parentNodeDef = parentNodeDef.parent;
  }
}
function detachEmbeddedView(elementData, viewIndex) {
  var embeddedViews = elementData.viewContainer._embeddedViews;
  if (viewIndex == null || viewIndex >= embeddedViews.length) {
    viewIndex = embeddedViews.length - 1;
  }
  if (viewIndex < 0) {
    return null;
  }
  var view = embeddedViews[viewIndex];
  view.viewContainerParent = null;
  removeFromArray(embeddedViews, viewIndex);
  Services.dirtyParentQueries(view);
  renderDetachView(view);
  return view;
}
function detachProjectedView(view) {
  if (!(view.state & 16)) {
    return;
  }
  var dvcElementData = declaredViewContainer(view);
  if (dvcElementData) {
    var projectedViews = dvcElementData.template._projectedViews;
    if (projectedViews) {
      removeFromArray(projectedViews, projectedViews.indexOf(view));
      Services.dirtyParentQueries(view);
    }
  }
}
function moveEmbeddedView(elementData, oldViewIndex, newViewIndex) {
  var embeddedViews = elementData.viewContainer._embeddedViews;
  var view = embeddedViews[oldViewIndex];
  removeFromArray(embeddedViews, oldViewIndex);
  if (newViewIndex == null) {
    newViewIndex = embeddedViews.length;
  }
  addToArray(embeddedViews, newViewIndex, view);
  Services.dirtyParentQueries(view);
  renderDetachView(view);
  var prevView = newViewIndex > 0 ? embeddedViews[newViewIndex - 1] : null;
  renderAttachEmbeddedView(elementData, prevView, view);
  return view;
}
function renderAttachEmbeddedView(elementData, prevView, view) {
  var prevRenderNode = prevView ? renderNode(prevView, prevView.def.lastRenderRootNode) : elementData.renderElement;
  var parentNode = view.renderer.parentNode(prevRenderNode);
  var nextSibling = view.renderer.nextSibling(prevRenderNode);
  visitRootRenderNodes(view, 2, parentNode, nextSibling, void 0);
}
function renderDetachView(view) {
  visitRootRenderNodes(view, 3, null, null, void 0);
}
function addToArray(arr, index, value) {
  if (index >= arr.length) {
    arr.push(value);
  } else {
    arr.splice(index, 0, value);
  }
}
function removeFromArray(arr, index) {
  if (index >= arr.length - 1) {
    arr.pop();
  } else {
    arr.splice(index, 1);
  }
}
var EMPTY_CONTEXT = new Object();
function getComponentViewDefinitionFactory(componentFactory) {
  return componentFactory.viewDefFactory;
}
var ComponentFactory_ = (
  /** @class */
  function(_super) {
    __extends(ComponentFactory_2, _super);
    function ComponentFactory_2(selector, componentType, viewDefFactory, _inputs, _outputs, ngContentSelectors) {
      var _this = (
        // Attention: this ctor is called as top level function.
        // Putting any logic in here will destroy closure tree shaking!
        _super.call(this) || this
      );
      _this.selector = selector;
      _this.componentType = componentType;
      _this._inputs = _inputs;
      _this._outputs = _outputs;
      _this.ngContentSelectors = ngContentSelectors;
      _this.viewDefFactory = viewDefFactory;
      return _this;
    }
    Object.defineProperty(ComponentFactory_2.prototype, "inputs", {
      get: function() {
        var inputsArr = [];
        var inputs = this._inputs;
        for (var propName in inputs) {
          var templateName = inputs[propName];
          inputsArr.push({
            propName,
            templateName
          });
        }
        return inputsArr;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ComponentFactory_2.prototype, "outputs", {
      get: function() {
        var outputsArr = [];
        for (var propName in this._outputs) {
          var templateName = this._outputs[propName];
          outputsArr.push({
            propName,
            templateName
          });
        }
        return outputsArr;
      },
      enumerable: true,
      configurable: true
    });
    ComponentFactory_2.prototype.create = function(injector, projectableNodes, rootSelectorOrNode, ngModule) {
      if (!ngModule) {
        throw new Error("ngModule should be provided");
      }
      var viewDef = resolveDefinition(this.viewDefFactory);
      var componentNodeIndex = viewDef.nodes[0].element.componentProvider.nodeIndex;
      var view = Services.createRootView(injector, projectableNodes || [], rootSelectorOrNode, viewDef, ngModule, EMPTY_CONTEXT);
      var component = asProviderData(view, componentNodeIndex).instance;
      if (rootSelectorOrNode) {
        view.renderer.setAttribute(asElementData(view, 0).renderElement, "ng-version", VERSION.full);
      }
      return new ComponentRef_(view, new ViewRef_(view), component);
    };
    return ComponentFactory_2;
  }(ComponentFactory)
);
var ComponentRef_ = (
  /** @class */
  function(_super) {
    __extends(ComponentRef_2, _super);
    function ComponentRef_2(_view, _viewRef, _component) {
      var _this = _super.call(this) || this;
      _this._view = _view;
      _this._viewRef = _viewRef;
      _this._component = _component;
      _this._elDef = _this._view.def.nodes[0];
      _this.hostView = _viewRef;
      _this.changeDetectorRef = _viewRef;
      _this.instance = _component;
      return _this;
    }
    Object.defineProperty(ComponentRef_2.prototype, "location", {
      get: function() {
        return new ElementRef(asElementData(this._view, this._elDef.nodeIndex).renderElement);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ComponentRef_2.prototype, "injector", {
      get: function() {
        return new Injector_(this._view, this._elDef);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ComponentRef_2.prototype, "componentType", {
      get: function() {
        return this._component.constructor;
      },
      enumerable: true,
      configurable: true
    });
    ComponentRef_2.prototype.destroy = function() {
      this._viewRef.destroy();
    };
    ComponentRef_2.prototype.onDestroy = function(callback) {
      this._viewRef.onDestroy(callback);
    };
    return ComponentRef_2;
  }(ComponentRef)
);
function createViewContainerData(view, elDef, elData) {
  return new ViewContainerRef_(view, elDef, elData);
}
var ViewContainerRef_ = (
  /** @class */
  function() {
    function ViewContainerRef_2(_view, _elDef, _data) {
      this._view = _view;
      this._elDef = _elDef;
      this._data = _data;
      this._embeddedViews = [];
    }
    Object.defineProperty(ViewContainerRef_2.prototype, "element", {
      get: function() {
        return new ElementRef(this._data.renderElement);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ViewContainerRef_2.prototype, "injector", {
      get: function() {
        return new Injector_(this._view, this._elDef);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ViewContainerRef_2.prototype, "parentInjector", {
      get: function() {
        var view = this._view;
        var elDef = this._elDef.parent;
        while (!elDef && view) {
          elDef = viewParentEl(view);
          view = view.parent;
        }
        return view ? new Injector_(view, elDef) : new Injector_(this._view, null);
      },
      enumerable: true,
      configurable: true
    });
    ViewContainerRef_2.prototype.clear = function() {
      var len = this._embeddedViews.length;
      for (var i = len - 1; i >= 0; i--) {
        var view = detachEmbeddedView(this._data, i);
        Services.destroyView(view);
      }
    };
    ViewContainerRef_2.prototype.get = function(index) {
      var view = this._embeddedViews[index];
      if (view) {
        var ref = new ViewRef_(view);
        ref.attachToViewContainerRef(this);
        return ref;
      }
      return null;
    };
    Object.defineProperty(ViewContainerRef_2.prototype, "length", {
      get: function() {
        return this._embeddedViews.length;
      },
      enumerable: true,
      configurable: true
    });
    ViewContainerRef_2.prototype.createEmbeddedView = function(templateRef, context, index) {
      var viewRef = templateRef.createEmbeddedView(context || {});
      this.insert(viewRef, index);
      return viewRef;
    };
    ViewContainerRef_2.prototype.createComponent = function(componentFactory, index, injector, projectableNodes, ngModuleRef) {
      var contextInjector = injector || this.parentInjector;
      if (!ngModuleRef && !(componentFactory instanceof ComponentFactoryBoundToModule)) {
        ngModuleRef = contextInjector.get(NgModuleRef);
      }
      var componentRef = componentFactory.create(contextInjector, projectableNodes, void 0, ngModuleRef);
      this.insert(componentRef.hostView, index);
      return componentRef;
    };
    ViewContainerRef_2.prototype.insert = function(viewRef, index) {
      if (viewRef.destroyed) {
        throw new Error("Cannot insert a destroyed View in a ViewContainer!");
      }
      var viewRef_ = viewRef;
      var viewData2 = viewRef_._view;
      attachEmbeddedView(this._view, this._data, index, viewData2);
      viewRef_.attachToViewContainerRef(this);
      return viewRef;
    };
    ViewContainerRef_2.prototype.move = function(viewRef, currentIndex) {
      if (viewRef.destroyed) {
        throw new Error("Cannot move a destroyed View in a ViewContainer!");
      }
      var previousIndex = this._embeddedViews.indexOf(viewRef._view);
      moveEmbeddedView(this._data, previousIndex, currentIndex);
      return viewRef;
    };
    ViewContainerRef_2.prototype.indexOf = function(viewRef) {
      return this._embeddedViews.indexOf(viewRef._view);
    };
    ViewContainerRef_2.prototype.remove = function(index) {
      var viewData2 = detachEmbeddedView(this._data, index);
      if (viewData2) {
        Services.destroyView(viewData2);
      }
    };
    ViewContainerRef_2.prototype.detach = function(index) {
      var view = detachEmbeddedView(this._data, index);
      return view ? new ViewRef_(view) : null;
    };
    return ViewContainerRef_2;
  }()
);
function createChangeDetectorRef(view) {
  return new ViewRef_(view);
}
var ViewRef_ = (
  /** @class */
  function() {
    function ViewRef_2(_view) {
      this._view = _view;
      this._viewContainerRef = null;
      this._appRef = null;
    }
    Object.defineProperty(ViewRef_2.prototype, "rootNodes", {
      get: function() {
        return rootRenderNodes(this._view);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ViewRef_2.prototype, "context", {
      get: function() {
        return this._view.context;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ViewRef_2.prototype, "destroyed", {
      get: function() {
        return (this._view.state & 128) !== 0;
      },
      enumerable: true,
      configurable: true
    });
    ViewRef_2.prototype.markForCheck = function() {
      markParentViewsForCheck(this._view);
    };
    ViewRef_2.prototype.detach = function() {
      this._view.state &= ~4;
    };
    ViewRef_2.prototype.detectChanges = function() {
      var fs = this._view.root.rendererFactory;
      if (fs.begin) {
        fs.begin();
      }
      try {
        Services.checkAndUpdateView(this._view);
      } finally {
        if (fs.end) {
          fs.end();
        }
      }
    };
    ViewRef_2.prototype.checkNoChanges = function() {
      Services.checkNoChangesView(this._view);
    };
    ViewRef_2.prototype.reattach = function() {
      this._view.state |= 4;
    };
    ViewRef_2.prototype.onDestroy = function(callback) {
      if (!this._view.disposables) {
        this._view.disposables = [];
      }
      this._view.disposables.push(callback);
    };
    ViewRef_2.prototype.destroy = function() {
      if (this._appRef) {
        this._appRef.detachView(this);
      } else if (this._viewContainerRef) {
        this._viewContainerRef.detach(this._viewContainerRef.indexOf(this));
      }
      Services.destroyView(this._view);
    };
    ViewRef_2.prototype.detachFromAppRef = function() {
      this._appRef = null;
      renderDetachView(this._view);
      Services.dirtyParentQueries(this._view);
    };
    ViewRef_2.prototype.attachToAppRef = function(appRef) {
      if (this._viewContainerRef) {
        throw new Error("This view is already attached to a ViewContainer!");
      }
      this._appRef = appRef;
    };
    ViewRef_2.prototype.attachToViewContainerRef = function(vcRef) {
      if (this._appRef) {
        throw new Error("This view is already attached directly to the ApplicationRef!");
      }
      this._viewContainerRef = vcRef;
    };
    return ViewRef_2;
  }()
);
function createTemplateData(view, def) {
  return new TemplateRef_(view, def);
}
var TemplateRef_ = (
  /** @class */
  function(_super) {
    __extends(TemplateRef_2, _super);
    function TemplateRef_2(_parentView, _def) {
      var _this = _super.call(this) || this;
      _this._parentView = _parentView;
      _this._def = _def;
      return _this;
    }
    TemplateRef_2.prototype.createEmbeddedView = function(context) {
      return new ViewRef_(Services.createEmbeddedView(this._parentView, this._def, this._def.element.template, context));
    };
    Object.defineProperty(TemplateRef_2.prototype, "elementRef", {
      get: function() {
        return new ElementRef(asElementData(this._parentView, this._def.nodeIndex).renderElement);
      },
      enumerable: true,
      configurable: true
    });
    return TemplateRef_2;
  }(TemplateRef)
);
function createInjector$1(view, elDef) {
  return new Injector_(view, elDef);
}
var Injector_ = (
  /** @class */
  function() {
    function Injector_2(view, elDef) {
      this.view = view;
      this.elDef = elDef;
    }
    Injector_2.prototype.get = function(token, notFoundValue) {
      if (notFoundValue === void 0) {
        notFoundValue = Injector.THROW_IF_NOT_FOUND;
      }
      var allowPrivateServices = this.elDef ? (this.elDef.flags & 33554432) !== 0 : false;
      return Services.resolveDep(this.view, this.elDef, allowPrivateServices, {
        flags: 0,
        token,
        tokenKey: tokenKey(token)
      }, notFoundValue);
    };
    return Injector_2;
  }()
);
function createRendererV1(view) {
  return new RendererAdapter(view.renderer);
}
var RendererAdapter = (
  /** @class */
  function() {
    function RendererAdapter2(delegate) {
      this.delegate = delegate;
    }
    RendererAdapter2.prototype.selectRootElement = function(selectorOrNode) {
      return this.delegate.selectRootElement(selectorOrNode);
    };
    RendererAdapter2.prototype.createElement = function(parent, namespaceAndName) {
      var _a = __read(splitNamespace(namespaceAndName), 2), ns = _a[0], name = _a[1];
      var el = this.delegate.createElement(name, ns);
      if (parent) {
        this.delegate.appendChild(parent, el);
      }
      return el;
    };
    RendererAdapter2.prototype.createViewRoot = function(hostElement2) {
      return hostElement2;
    };
    RendererAdapter2.prototype.createTemplateAnchor = function(parentElement) {
      var comment = this.delegate.createComment("");
      if (parentElement) {
        this.delegate.appendChild(parentElement, comment);
      }
      return comment;
    };
    RendererAdapter2.prototype.createText = function(parentElement, value) {
      var node = this.delegate.createText(value);
      if (parentElement) {
        this.delegate.appendChild(parentElement, node);
      }
      return node;
    };
    RendererAdapter2.prototype.projectNodes = function(parentElement, nodes) {
      for (var i = 0; i < nodes.length; i++) {
        this.delegate.appendChild(parentElement, nodes[i]);
      }
    };
    RendererAdapter2.prototype.attachViewAfter = function(node, viewRootNodes) {
      var parentElement = this.delegate.parentNode(node);
      var nextSibling = this.delegate.nextSibling(node);
      for (var i = 0; i < viewRootNodes.length; i++) {
        this.delegate.insertBefore(parentElement, viewRootNodes[i], nextSibling);
      }
    };
    RendererAdapter2.prototype.detachView = function(viewRootNodes) {
      for (var i = 0; i < viewRootNodes.length; i++) {
        var node = viewRootNodes[i];
        var parentElement = this.delegate.parentNode(node);
        this.delegate.removeChild(parentElement, node);
      }
    };
    RendererAdapter2.prototype.destroyView = function(hostElement2, viewAllNodes) {
      for (var i = 0; i < viewAllNodes.length; i++) {
        this.delegate.destroyNode(viewAllNodes[i]);
      }
    };
    RendererAdapter2.prototype.listen = function(renderElement, name, callback) {
      return this.delegate.listen(renderElement, name, callback);
    };
    RendererAdapter2.prototype.listenGlobal = function(target, name, callback) {
      return this.delegate.listen(target, name, callback);
    };
    RendererAdapter2.prototype.setElementProperty = function(renderElement, propertyName, propertyValue) {
      this.delegate.setProperty(renderElement, propertyName, propertyValue);
    };
    RendererAdapter2.prototype.setElementAttribute = function(renderElement, namespaceAndName, attributeValue) {
      var _a = __read(splitNamespace(namespaceAndName), 2), ns = _a[0], name = _a[1];
      if (attributeValue != null) {
        this.delegate.setAttribute(renderElement, name, attributeValue, ns);
      } else {
        this.delegate.removeAttribute(renderElement, name, ns);
      }
    };
    RendererAdapter2.prototype.setBindingDebugInfo = function(renderElement, propertyName, propertyValue) {
    };
    RendererAdapter2.prototype.setElementClass = function(renderElement, className, isAdd) {
      if (isAdd) {
        this.delegate.addClass(renderElement, className);
      } else {
        this.delegate.removeClass(renderElement, className);
      }
    };
    RendererAdapter2.prototype.setElementStyle = function(renderElement, styleName, styleValue) {
      if (styleValue != null) {
        this.delegate.setStyle(renderElement, styleName, styleValue);
      } else {
        this.delegate.removeStyle(renderElement, styleName);
      }
    };
    RendererAdapter2.prototype.invokeElementMethod = function(renderElement, methodName, args) {
      renderElement[methodName].apply(renderElement, args);
    };
    RendererAdapter2.prototype.setText = function(renderNode$$1, text) {
      this.delegate.setValue(renderNode$$1, text);
    };
    RendererAdapter2.prototype.animate = function() {
      throw new Error("Renderer.animate is no longer supported!");
    };
    return RendererAdapter2;
  }()
);
function createNgModuleRef(moduleType, parent, bootstrapComponents, def) {
  return new NgModuleRef_(moduleType, parent, bootstrapComponents, def);
}
var NgModuleRef_ = (
  /** @class */
  function() {
    function NgModuleRef_2(_moduleType, _parent, _bootstrapComponents, _def) {
      this._moduleType = _moduleType;
      this._parent = _parent;
      this._bootstrapComponents = _bootstrapComponents;
      this._def = _def;
      this._destroyListeners = [];
      this._destroyed = false;
      this.injector = this;
      initNgModule(this);
    }
    NgModuleRef_2.prototype.get = function(token, notFoundValue, injectFlags) {
      if (notFoundValue === void 0) {
        notFoundValue = Injector.THROW_IF_NOT_FOUND;
      }
      if (injectFlags === void 0) {
        injectFlags = 0;
      }
      var flags = 0;
      if (injectFlags & 4) {
        flags |= 1;
      } else if (injectFlags & 2) {
        flags |= 4;
      }
      return resolveNgModuleDep(this, {
        token,
        tokenKey: tokenKey(token),
        flags
      }, notFoundValue);
    };
    Object.defineProperty(NgModuleRef_2.prototype, "instance", {
      get: function() {
        return this.get(this._moduleType);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(NgModuleRef_2.prototype, "componentFactoryResolver", {
      get: function() {
        return this.get(ComponentFactoryResolver);
      },
      enumerable: true,
      configurable: true
    });
    NgModuleRef_2.prototype.destroy = function() {
      if (this._destroyed) {
        throw new Error("The ng module " + stringify(this.instance.constructor) + " has already been destroyed.");
      }
      this._destroyed = true;
      callNgModuleLifecycle(
        this,
        131072
        /* OnDestroy */
      );
      this._destroyListeners.forEach(function(listener) {
        return listener();
      });
    };
    NgModuleRef_2.prototype.onDestroy = function(callback) {
      this._destroyListeners.push(callback);
    };
    return NgModuleRef_2;
  }()
);
var RendererV1TokenKey = tokenKey(Renderer);
var Renderer2TokenKey = tokenKey(Renderer2);
var ElementRefTokenKey = tokenKey(ElementRef);
var ViewContainerRefTokenKey = tokenKey(ViewContainerRef);
var TemplateRefTokenKey = tokenKey(TemplateRef);
var ChangeDetectorRefTokenKey = tokenKey(ChangeDetectorRef);
var InjectorRefTokenKey$1 = tokenKey(Injector);
var INJECTORRefTokenKey$1 = tokenKey(INJECTOR);
function createProviderInstance(view, def) {
  return _createProviderInstance$1(view, def);
}
function createPipeInstance(view, def) {
  var compView = view;
  while (compView.parent && !isComponentView(compView)) {
    compView = compView.parent;
  }
  var allowPrivateServices = true;
  return createClass(compView.parent, viewParentEl(compView), allowPrivateServices, def.provider.value, def.provider.deps);
}
function createDirectiveInstance(view, def) {
  var allowPrivateServices = (def.flags & 32768) > 0;
  var instance = createClass(view, def.parent, allowPrivateServices, def.provider.value, def.provider.deps);
  if (def.outputs.length) {
    for (var i = 0; i < def.outputs.length; i++) {
      var output = def.outputs[i];
      var subscription = instance[output.propName].subscribe(eventHandlerClosure(view, def.parent.nodeIndex, output.eventName));
      view.disposables[def.outputIndex + i] = subscription.unsubscribe.bind(subscription);
    }
  }
  return instance;
}
function eventHandlerClosure(view, index, eventName) {
  return function(event) {
    return dispatchEvent(view, index, eventName, event);
  };
}
function checkAndUpdateDirectiveInline(view, def, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
  var providerData = asProviderData(view, def.nodeIndex);
  var directive = providerData.instance;
  var changed = false;
  var changes = void 0;
  var bindLen = def.bindings.length;
  if (bindLen > 0 && checkBinding(view, def, 0, v0)) {
    changed = true;
    changes = updateProp(view, providerData, def, 0, v0, changes);
  }
  if (bindLen > 1 && checkBinding(view, def, 1, v1)) {
    changed = true;
    changes = updateProp(view, providerData, def, 1, v1, changes);
  }
  if (bindLen > 2 && checkBinding(view, def, 2, v2)) {
    changed = true;
    changes = updateProp(view, providerData, def, 2, v2, changes);
  }
  if (bindLen > 3 && checkBinding(view, def, 3, v3)) {
    changed = true;
    changes = updateProp(view, providerData, def, 3, v3, changes);
  }
  if (bindLen > 4 && checkBinding(view, def, 4, v4)) {
    changed = true;
    changes = updateProp(view, providerData, def, 4, v4, changes);
  }
  if (bindLen > 5 && checkBinding(view, def, 5, v5)) {
    changed = true;
    changes = updateProp(view, providerData, def, 5, v5, changes);
  }
  if (bindLen > 6 && checkBinding(view, def, 6, v6)) {
    changed = true;
    changes = updateProp(view, providerData, def, 6, v6, changes);
  }
  if (bindLen > 7 && checkBinding(view, def, 7, v7)) {
    changed = true;
    changes = updateProp(view, providerData, def, 7, v7, changes);
  }
  if (bindLen > 8 && checkBinding(view, def, 8, v8)) {
    changed = true;
    changes = updateProp(view, providerData, def, 8, v8, changes);
  }
  if (bindLen > 9 && checkBinding(view, def, 9, v9)) {
    changed = true;
    changes = updateProp(view, providerData, def, 9, v9, changes);
  }
  if (changes) {
    directive.ngOnChanges(changes);
  }
  if (def.flags & 65536 && shouldCallLifecycleInitHook(view, 256, def.nodeIndex)) {
    directive.ngOnInit();
  }
  if (def.flags & 262144) {
    directive.ngDoCheck();
  }
  return changed;
}
function checkAndUpdateDirectiveDynamic(view, def, values) {
  var providerData = asProviderData(view, def.nodeIndex);
  var directive = providerData.instance;
  var changed = false;
  var changes = void 0;
  for (var i = 0; i < values.length; i++) {
    if (checkBinding(view, def, i, values[i])) {
      changed = true;
      changes = updateProp(view, providerData, def, i, values[i], changes);
    }
  }
  if (changes) {
    directive.ngOnChanges(changes);
  }
  if (def.flags & 65536 && shouldCallLifecycleInitHook(view, 256, def.nodeIndex)) {
    directive.ngOnInit();
  }
  if (def.flags & 262144) {
    directive.ngDoCheck();
  }
  return changed;
}
function _createProviderInstance$1(view, def) {
  var allowPrivateServices = (def.flags & 8192) > 0;
  var providerDef = def.provider;
  switch (def.flags & 201347067) {
    case 512:
      return createClass(view, def.parent, allowPrivateServices, providerDef.value, providerDef.deps);
    case 1024:
      return callFactory(view, def.parent, allowPrivateServices, providerDef.value, providerDef.deps);
    case 2048:
      return resolveDep(view, def.parent, allowPrivateServices, providerDef.deps[0]);
    case 256:
      return providerDef.value;
  }
}
function createClass(view, elDef, allowPrivateServices, ctor, deps) {
  var len = deps.length;
  switch (len) {
    case 0:
      return new ctor();
    case 1:
      return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]));
    case 2:
      return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]));
    case 3:
      return new ctor(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]), resolveDep(view, elDef, allowPrivateServices, deps[2]));
    default:
      var depValues = new Array(len);
      for (var i = 0; i < len; i++) {
        depValues[i] = resolveDep(view, elDef, allowPrivateServices, deps[i]);
      }
      return new (ctor.bind.apply(ctor, __spread([void 0], depValues)))();
  }
}
function callFactory(view, elDef, allowPrivateServices, factory, deps) {
  var len = deps.length;
  switch (len) {
    case 0:
      return factory();
    case 1:
      return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]));
    case 2:
      return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]));
    case 3:
      return factory(resolveDep(view, elDef, allowPrivateServices, deps[0]), resolveDep(view, elDef, allowPrivateServices, deps[1]), resolveDep(view, elDef, allowPrivateServices, deps[2]));
    default:
      var depValues = Array(len);
      for (var i = 0; i < len; i++) {
        depValues[i] = resolveDep(view, elDef, allowPrivateServices, deps[i]);
      }
      return factory.apply(void 0, __spread(depValues));
  }
}
var NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR = {};
function resolveDep(view, elDef, allowPrivateServices, depDef, notFoundValue) {
  if (notFoundValue === void 0) {
    notFoundValue = Injector.THROW_IF_NOT_FOUND;
  }
  if (depDef.flags & 8) {
    return depDef.token;
  }
  var startView = view;
  if (depDef.flags & 2) {
    notFoundValue = null;
  }
  var tokenKey$$1 = depDef.tokenKey;
  if (tokenKey$$1 === ChangeDetectorRefTokenKey) {
    allowPrivateServices = !!(elDef && elDef.element.componentView);
  }
  if (elDef && depDef.flags & 1) {
    allowPrivateServices = false;
    elDef = elDef.parent;
  }
  var searchView = view;
  while (searchView) {
    if (elDef) {
      switch (tokenKey$$1) {
        case RendererV1TokenKey: {
          var compView = findCompView(searchView, elDef, allowPrivateServices);
          return createRendererV1(compView);
        }
        case Renderer2TokenKey: {
          var compView = findCompView(searchView, elDef, allowPrivateServices);
          return compView.renderer;
        }
        case ElementRefTokenKey:
          return new ElementRef(asElementData(searchView, elDef.nodeIndex).renderElement);
        case ViewContainerRefTokenKey:
          return asElementData(searchView, elDef.nodeIndex).viewContainer;
        case TemplateRefTokenKey: {
          if (elDef.element.template) {
            return asElementData(searchView, elDef.nodeIndex).template;
          }
          break;
        }
        case ChangeDetectorRefTokenKey: {
          var cdView = findCompView(searchView, elDef, allowPrivateServices);
          return createChangeDetectorRef(cdView);
        }
        case InjectorRefTokenKey$1:
        case INJECTORRefTokenKey$1:
          return createInjector$1(searchView, elDef);
        default:
          var providerDef_1 = (allowPrivateServices ? elDef.element.allProviders : elDef.element.publicProviders)[tokenKey$$1];
          if (providerDef_1) {
            var providerData = asProviderData(searchView, providerDef_1.nodeIndex);
            if (!providerData) {
              providerData = {
                instance: _createProviderInstance$1(searchView, providerDef_1)
              };
              searchView.nodes[providerDef_1.nodeIndex] = providerData;
            }
            return providerData.instance;
          }
      }
    }
    allowPrivateServices = isComponentView(searchView);
    elDef = viewParentEl(searchView);
    searchView = searchView.parent;
    if (depDef.flags & 4) {
      searchView = null;
    }
  }
  var value = startView.root.injector.get(depDef.token, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR);
  if (value !== NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR || notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
    return value;
  }
  return startView.root.ngModule.injector.get(depDef.token, notFoundValue);
}
function findCompView(view, elDef, allowPrivateServices) {
  var compView;
  if (allowPrivateServices) {
    compView = asElementData(view, elDef.nodeIndex).componentView;
  } else {
    compView = view;
    while (compView.parent && !isComponentView(compView)) {
      compView = compView.parent;
    }
  }
  return compView;
}
function updateProp(view, providerData, def, bindingIdx, value, changes) {
  if (def.flags & 32768) {
    var compView = asElementData(view, def.parent.nodeIndex).componentView;
    if (compView.def.flags & 2) {
      compView.state |= 8;
    }
  }
  var binding = def.bindings[bindingIdx];
  var propName = binding.name;
  providerData.instance[propName] = value;
  if (def.flags & 524288) {
    changes = changes || {};
    var oldValue = WrappedValue.unwrap(view.oldValues[def.bindingIndex + bindingIdx]);
    var binding_1 = def.bindings[bindingIdx];
    changes[binding_1.nonMinifiedName] = new SimpleChange(oldValue, value, (view.state & 2) !== 0);
  }
  view.oldValues[def.bindingIndex + bindingIdx] = value;
  return changes;
}
function callLifecycleHooksChildrenFirst(view, lifecycles) {
  if (!(view.def.nodeFlags & lifecycles)) {
    return;
  }
  var nodes = view.def.nodes;
  var initIndex = 0;
  for (var i = 0; i < nodes.length; i++) {
    var nodeDef = nodes[i];
    var parent_1 = nodeDef.parent;
    if (!parent_1 && nodeDef.flags & lifecycles) {
      callProviderLifecycles(view, i, nodeDef.flags & lifecycles, initIndex++);
    }
    if ((nodeDef.childFlags & lifecycles) === 0) {
      i += nodeDef.childCount;
    }
    while (parent_1 && parent_1.flags & 1 && i === parent_1.nodeIndex + parent_1.childCount) {
      if (parent_1.directChildFlags & lifecycles) {
        initIndex = callElementProvidersLifecycles(view, parent_1, lifecycles, initIndex);
      }
      parent_1 = parent_1.parent;
    }
  }
}
function callElementProvidersLifecycles(view, elDef, lifecycles, initIndex) {
  for (var i = elDef.nodeIndex + 1; i <= elDef.nodeIndex + elDef.childCount; i++) {
    var nodeDef = view.def.nodes[i];
    if (nodeDef.flags & lifecycles) {
      callProviderLifecycles(view, i, nodeDef.flags & lifecycles, initIndex++);
    }
    i += nodeDef.childCount;
  }
  return initIndex;
}
function callProviderLifecycles(view, index, lifecycles, initIndex) {
  var providerData = asProviderData(view, index);
  if (!providerData) {
    return;
  }
  var provider = providerData.instance;
  if (!provider) {
    return;
  }
  Services.setCurrentNode(view, index);
  if (lifecycles & 1048576 && shouldCallLifecycleInitHook(view, 512, initIndex)) {
    provider.ngAfterContentInit();
  }
  if (lifecycles & 2097152) {
    provider.ngAfterContentChecked();
  }
  if (lifecycles & 4194304 && shouldCallLifecycleInitHook(view, 768, initIndex)) {
    provider.ngAfterViewInit();
  }
  if (lifecycles & 8388608) {
    provider.ngAfterViewChecked();
  }
  if (lifecycles & 131072) {
    provider.ngOnDestroy();
  }
}
function createQuery() {
  return new QueryList();
}
function dirtyParentQueries(view) {
  var queryIds = view.def.nodeMatchedQueries;
  while (view.parent && isEmbeddedView(view)) {
    var tplDef = view.parentNodeDef;
    view = view.parent;
    var end = tplDef.nodeIndex + tplDef.childCount;
    for (var i = 0; i <= end; i++) {
      var nodeDef = view.def.nodes[i];
      if (nodeDef.flags & 67108864 && nodeDef.flags & 536870912 && (nodeDef.query.filterId & queryIds) === nodeDef.query.filterId) {
        asQueryList(view, i).setDirty();
      }
      if (nodeDef.flags & 1 && i + nodeDef.childCount < tplDef.nodeIndex || !(nodeDef.childFlags & 67108864) || !(nodeDef.childFlags & 536870912)) {
        i += nodeDef.childCount;
      }
    }
  }
  if (view.def.nodeFlags & 134217728) {
    for (var i = 0; i < view.def.nodes.length; i++) {
      var nodeDef = view.def.nodes[i];
      if (nodeDef.flags & 134217728 && nodeDef.flags & 536870912) {
        asQueryList(view, i).setDirty();
      }
      i += nodeDef.childCount;
    }
  }
}
function checkAndUpdateQuery(view, nodeDef) {
  var queryList = asQueryList(view, nodeDef.nodeIndex);
  if (!queryList.dirty) {
    return;
  }
  var directiveInstance;
  var newValues = void 0;
  if (nodeDef.flags & 67108864) {
    var elementDef = nodeDef.parent.parent;
    newValues = calcQueryValues(view, elementDef.nodeIndex, elementDef.nodeIndex + elementDef.childCount, nodeDef.query, []);
    directiveInstance = asProviderData(view, nodeDef.parent.nodeIndex).instance;
  } else if (nodeDef.flags & 134217728) {
    newValues = calcQueryValues(view, 0, view.def.nodes.length - 1, nodeDef.query, []);
    directiveInstance = view.component;
  }
  queryList.reset(newValues);
  var bindings = nodeDef.query.bindings;
  var notify = false;
  for (var i = 0; i < bindings.length; i++) {
    var binding = bindings[i];
    var boundValue = void 0;
    switch (binding.bindingType) {
      case 0:
        boundValue = queryList.first;
        break;
      case 1:
        boundValue = queryList;
        notify = true;
        break;
    }
    directiveInstance[binding.propName] = boundValue;
  }
  if (notify) {
    queryList.notifyOnChanges();
  }
}
function calcQueryValues(view, startIndex, endIndex, queryDef, values) {
  for (var i = startIndex; i <= endIndex; i++) {
    var nodeDef = view.def.nodes[i];
    var valueType = nodeDef.matchedQueries[queryDef.id];
    if (valueType != null) {
      values.push(getQueryValue(view, nodeDef, valueType));
    }
    if (nodeDef.flags & 1 && nodeDef.element.template && (nodeDef.element.template.nodeMatchedQueries & queryDef.filterId) === queryDef.filterId) {
      var elementData = asElementData(view, i);
      if ((nodeDef.childMatchedQueries & queryDef.filterId) === queryDef.filterId) {
        calcQueryValues(view, i + 1, i + nodeDef.childCount, queryDef, values);
        i += nodeDef.childCount;
      }
      if (nodeDef.flags & 16777216) {
        var embeddedViews = elementData.viewContainer._embeddedViews;
        for (var k = 0; k < embeddedViews.length; k++) {
          var embeddedView = embeddedViews[k];
          var dvc = declaredViewContainer(embeddedView);
          if (dvc && dvc === elementData) {
            calcQueryValues(embeddedView, 0, embeddedView.def.nodes.length - 1, queryDef, values);
          }
        }
      }
      var projectedViews = elementData.template._projectedViews;
      if (projectedViews) {
        for (var k = 0; k < projectedViews.length; k++) {
          var projectedView = projectedViews[k];
          calcQueryValues(projectedView, 0, projectedView.def.nodes.length - 1, queryDef, values);
        }
      }
    }
    if ((nodeDef.childMatchedQueries & queryDef.filterId) !== queryDef.filterId) {
      i += nodeDef.childCount;
    }
  }
  return values;
}
function getQueryValue(view, nodeDef, queryValueType) {
  if (queryValueType != null) {
    switch (queryValueType) {
      case 1:
        return asElementData(view, nodeDef.nodeIndex).renderElement;
      case 0:
        return new ElementRef(asElementData(view, nodeDef.nodeIndex).renderElement);
      case 2:
        return asElementData(view, nodeDef.nodeIndex).template;
      case 3:
        return asElementData(view, nodeDef.nodeIndex).viewContainer;
      case 4:
        return asProviderData(view, nodeDef.nodeIndex).instance;
    }
  }
}
function appendNgContent(view, renderHost, def) {
  var parentEl = getParentRenderElement(view, renderHost, def);
  if (!parentEl) {
    return;
  }
  var ngContentIndex = def.ngContent.index;
  visitProjectedRenderNodes(view, ngContentIndex, 1, parentEl, null, void 0);
}
function createPureExpression(view, def) {
  return {
    value: void 0
  };
}
function checkAndUpdatePureExpressionInline(view, def, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
  var bindings = def.bindings;
  var changed = false;
  var bindLen = bindings.length;
  if (bindLen > 0 && checkAndUpdateBinding(view, def, 0, v0)) changed = true;
  if (bindLen > 1 && checkAndUpdateBinding(view, def, 1, v1)) changed = true;
  if (bindLen > 2 && checkAndUpdateBinding(view, def, 2, v2)) changed = true;
  if (bindLen > 3 && checkAndUpdateBinding(view, def, 3, v3)) changed = true;
  if (bindLen > 4 && checkAndUpdateBinding(view, def, 4, v4)) changed = true;
  if (bindLen > 5 && checkAndUpdateBinding(view, def, 5, v5)) changed = true;
  if (bindLen > 6 && checkAndUpdateBinding(view, def, 6, v6)) changed = true;
  if (bindLen > 7 && checkAndUpdateBinding(view, def, 7, v7)) changed = true;
  if (bindLen > 8 && checkAndUpdateBinding(view, def, 8, v8)) changed = true;
  if (bindLen > 9 && checkAndUpdateBinding(view, def, 9, v9)) changed = true;
  if (changed) {
    var data = asPureExpressionData(view, def.nodeIndex);
    var value = void 0;
    switch (def.flags & 201347067) {
      case 32:
        value = new Array(bindings.length);
        if (bindLen > 0) value[0] = v0;
        if (bindLen > 1) value[1] = v1;
        if (bindLen > 2) value[2] = v2;
        if (bindLen > 3) value[3] = v3;
        if (bindLen > 4) value[4] = v4;
        if (bindLen > 5) value[5] = v5;
        if (bindLen > 6) value[6] = v6;
        if (bindLen > 7) value[7] = v7;
        if (bindLen > 8) value[8] = v8;
        if (bindLen > 9) value[9] = v9;
        break;
      case 64:
        value = {};
        if (bindLen > 0) value[bindings[0].name] = v0;
        if (bindLen > 1) value[bindings[1].name] = v1;
        if (bindLen > 2) value[bindings[2].name] = v2;
        if (bindLen > 3) value[bindings[3].name] = v3;
        if (bindLen > 4) value[bindings[4].name] = v4;
        if (bindLen > 5) value[bindings[5].name] = v5;
        if (bindLen > 6) value[bindings[6].name] = v6;
        if (bindLen > 7) value[bindings[7].name] = v7;
        if (bindLen > 8) value[bindings[8].name] = v8;
        if (bindLen > 9) value[bindings[9].name] = v9;
        break;
      case 128:
        var pipe2 = v0;
        switch (bindLen) {
          case 1:
            value = pipe2.transform(v0);
            break;
          case 2:
            value = pipe2.transform(v1);
            break;
          case 3:
            value = pipe2.transform(v1, v2);
            break;
          case 4:
            value = pipe2.transform(v1, v2, v3);
            break;
          case 5:
            value = pipe2.transform(v1, v2, v3, v4);
            break;
          case 6:
            value = pipe2.transform(v1, v2, v3, v4, v5);
            break;
          case 7:
            value = pipe2.transform(v1, v2, v3, v4, v5, v6);
            break;
          case 8:
            value = pipe2.transform(v1, v2, v3, v4, v5, v6, v7);
            break;
          case 9:
            value = pipe2.transform(v1, v2, v3, v4, v5, v6, v7, v8);
            break;
          case 10:
            value = pipe2.transform(v1, v2, v3, v4, v5, v6, v7, v8, v9);
            break;
        }
        break;
    }
    data.value = value;
  }
  return changed;
}
function checkAndUpdatePureExpressionDynamic(view, def, values) {
  var bindings = def.bindings;
  var changed = false;
  for (var i = 0; i < values.length; i++) {
    if (checkAndUpdateBinding(view, def, i, values[i])) {
      changed = true;
    }
  }
  if (changed) {
    var data = asPureExpressionData(view, def.nodeIndex);
    var value = void 0;
    switch (def.flags & 201347067) {
      case 32:
        value = values;
        break;
      case 64:
        value = {};
        for (var i = 0; i < values.length; i++) {
          value[bindings[i].name] = values[i];
        }
        break;
      case 128:
        var pipe2 = values[0];
        var params = values.slice(1);
        value = pipe2.transform.apply(pipe2, __spread(params));
        break;
    }
    data.value = value;
  }
  return changed;
}
function createText(view, renderHost, def) {
  var renderNode$$1;
  var renderer2 = view.renderer;
  renderNode$$1 = renderer2.createText(def.text.prefix);
  var parentEl = getParentRenderElement(view, renderHost, def);
  if (parentEl) {
    renderer2.appendChild(parentEl, renderNode$$1);
  }
  return {
    renderText: renderNode$$1
  };
}
function checkAndUpdateTextInline(view, def, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
  var changed = false;
  var bindings = def.bindings;
  var bindLen = bindings.length;
  if (bindLen > 0 && checkAndUpdateBinding(view, def, 0, v0)) changed = true;
  if (bindLen > 1 && checkAndUpdateBinding(view, def, 1, v1)) changed = true;
  if (bindLen > 2 && checkAndUpdateBinding(view, def, 2, v2)) changed = true;
  if (bindLen > 3 && checkAndUpdateBinding(view, def, 3, v3)) changed = true;
  if (bindLen > 4 && checkAndUpdateBinding(view, def, 4, v4)) changed = true;
  if (bindLen > 5 && checkAndUpdateBinding(view, def, 5, v5)) changed = true;
  if (bindLen > 6 && checkAndUpdateBinding(view, def, 6, v6)) changed = true;
  if (bindLen > 7 && checkAndUpdateBinding(view, def, 7, v7)) changed = true;
  if (bindLen > 8 && checkAndUpdateBinding(view, def, 8, v8)) changed = true;
  if (bindLen > 9 && checkAndUpdateBinding(view, def, 9, v9)) changed = true;
  if (changed) {
    var value = def.text.prefix;
    if (bindLen > 0) value += _addInterpolationPart(v0, bindings[0]);
    if (bindLen > 1) value += _addInterpolationPart(v1, bindings[1]);
    if (bindLen > 2) value += _addInterpolationPart(v2, bindings[2]);
    if (bindLen > 3) value += _addInterpolationPart(v3, bindings[3]);
    if (bindLen > 4) value += _addInterpolationPart(v4, bindings[4]);
    if (bindLen > 5) value += _addInterpolationPart(v5, bindings[5]);
    if (bindLen > 6) value += _addInterpolationPart(v6, bindings[6]);
    if (bindLen > 7) value += _addInterpolationPart(v7, bindings[7]);
    if (bindLen > 8) value += _addInterpolationPart(v8, bindings[8]);
    if (bindLen > 9) value += _addInterpolationPart(v9, bindings[9]);
    var renderNode$$1 = asTextData(view, def.nodeIndex).renderText;
    view.renderer.setValue(renderNode$$1, value);
  }
  return changed;
}
function checkAndUpdateTextDynamic(view, def, values) {
  var bindings = def.bindings;
  var changed = false;
  for (var i = 0; i < values.length; i++) {
    if (checkAndUpdateBinding(view, def, i, values[i])) {
      changed = true;
    }
  }
  if (changed) {
    var value = "";
    for (var i = 0; i < values.length; i++) {
      value = value + _addInterpolationPart(values[i], bindings[i]);
    }
    value = def.text.prefix + value;
    var renderNode$$1 = asTextData(view, def.nodeIndex).renderText;
    view.renderer.setValue(renderNode$$1, value);
  }
  return changed;
}
function _addInterpolationPart(value, binding) {
  var valueStr = value != null ? value.toString() : "";
  return valueStr + binding.suffix;
}
function createEmbeddedView(parent, anchorDef$$1, viewDef, context) {
  var view = createView(parent.root, parent.renderer, parent, anchorDef$$1, viewDef);
  initView(view, parent.component, context);
  createViewNodes(view);
  return view;
}
function createRootView(root, def, context) {
  var view = createView(root, root.renderer, null, null, def);
  initView(view, context, context);
  createViewNodes(view);
  return view;
}
function createComponentView(parentView, nodeDef, viewDef, hostElement2) {
  var rendererType = nodeDef.element.componentRendererType;
  var compRenderer;
  if (!rendererType) {
    compRenderer = parentView.root.renderer;
  } else {
    compRenderer = parentView.root.rendererFactory.createRenderer(hostElement2, rendererType);
  }
  return createView(parentView.root, compRenderer, parentView, nodeDef.element.componentProvider, viewDef);
}
function createView(root, renderer2, parent, parentNodeDef, def) {
  var nodes = new Array(def.nodes.length);
  var disposables = def.outputCount ? new Array(def.outputCount) : null;
  var view = {
    def,
    parent,
    viewContainerParent: null,
    parentNodeDef,
    context: null,
    component: null,
    nodes,
    state: 13,
    root,
    renderer: renderer2,
    oldValues: new Array(def.bindingCount),
    disposables,
    initIndex: -1
  };
  return view;
}
function initView(view, component, context) {
  view.component = component;
  view.context = context;
}
function createViewNodes(view) {
  var renderHost;
  if (isComponentView(view)) {
    var hostDef = view.parentNodeDef;
    renderHost = asElementData(view.parent, hostDef.parent.nodeIndex).renderElement;
  }
  var def = view.def;
  var nodes = view.nodes;
  for (var i = 0; i < def.nodes.length; i++) {
    var nodeDef = def.nodes[i];
    Services.setCurrentNode(view, i);
    var nodeData = void 0;
    switch (nodeDef.flags & 201347067) {
      case 1:
        var el = createElement(view, renderHost, nodeDef);
        var componentView = void 0;
        if (nodeDef.flags & 33554432) {
          var compViewDef = resolveDefinition(nodeDef.element.componentView);
          componentView = Services.createComponentView(view, nodeDef, compViewDef, el);
        }
        listenToElementOutputs(view, componentView, nodeDef, el);
        nodeData = {
          renderElement: el,
          componentView,
          viewContainer: null,
          template: nodeDef.element.template ? createTemplateData(view, nodeDef) : void 0
        };
        if (nodeDef.flags & 16777216) {
          nodeData.viewContainer = createViewContainerData(view, nodeDef, nodeData);
        }
        break;
      case 2:
        nodeData = createText(view, renderHost, nodeDef);
        break;
      case 512:
      case 1024:
      case 2048:
      case 256: {
        nodeData = nodes[i];
        if (!nodeData && !(nodeDef.flags & 4096)) {
          var instance = createProviderInstance(view, nodeDef);
          nodeData = {
            instance
          };
        }
        break;
      }
      case 16: {
        var instance = createPipeInstance(view, nodeDef);
        nodeData = {
          instance
        };
        break;
      }
      case 16384: {
        nodeData = nodes[i];
        if (!nodeData) {
          var instance = createDirectiveInstance(view, nodeDef);
          nodeData = {
            instance
          };
        }
        if (nodeDef.flags & 32768) {
          var compView = asElementData(view, nodeDef.parent.nodeIndex).componentView;
          initView(compView, nodeData.instance, nodeData.instance);
        }
        break;
      }
      case 32:
      case 64:
      case 128:
        nodeData = createPureExpression(view, nodeDef);
        break;
      case 67108864:
      case 134217728:
        nodeData = createQuery();
        break;
      case 8:
        appendNgContent(view, renderHost, nodeDef);
        nodeData = void 0;
        break;
    }
    nodes[i] = nodeData;
  }
  execComponentViewsAction(view, ViewAction.CreateViewNodes);
  execQueriesAction(
    view,
    67108864 | 134217728,
    268435456,
    0
    /* CheckAndUpdate */
  );
}
function checkNoChangesView(view) {
  markProjectedViewsForCheck(view);
  Services.updateDirectives(
    view,
    1
    /* CheckNoChanges */
  );
  execEmbeddedViewsAction(view, ViewAction.CheckNoChanges);
  Services.updateRenderer(
    view,
    1
    /* CheckNoChanges */
  );
  execComponentViewsAction(view, ViewAction.CheckNoChanges);
  view.state &= ~(64 | 32);
}
function checkAndUpdateView(view) {
  if (view.state & 1) {
    view.state &= ~1;
    view.state |= 2;
  } else {
    view.state &= ~2;
  }
  shiftInitState(
    view,
    0,
    256
    /* InitState_CallingOnInit */
  );
  markProjectedViewsForCheck(view);
  Services.updateDirectives(
    view,
    0
    /* CheckAndUpdate */
  );
  execEmbeddedViewsAction(view, ViewAction.CheckAndUpdate);
  execQueriesAction(
    view,
    67108864,
    536870912,
    0
    /* CheckAndUpdate */
  );
  var callInit = shiftInitState(
    view,
    256,
    512
    /* InitState_CallingAfterContentInit */
  );
  callLifecycleHooksChildrenFirst(view, 2097152 | (callInit ? 1048576 : 0));
  Services.updateRenderer(
    view,
    0
    /* CheckAndUpdate */
  );
  execComponentViewsAction(view, ViewAction.CheckAndUpdate);
  execQueriesAction(
    view,
    134217728,
    536870912,
    0
    /* CheckAndUpdate */
  );
  callInit = shiftInitState(
    view,
    512,
    768
    /* InitState_CallingAfterViewInit */
  );
  callLifecycleHooksChildrenFirst(view, 8388608 | (callInit ? 4194304 : 0));
  if (view.def.flags & 2) {
    view.state &= ~8;
  }
  view.state &= ~(64 | 32);
  shiftInitState(
    view,
    768,
    1024
    /* InitState_AfterInit */
  );
}
function checkAndUpdateNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
  if (argStyle === 0) {
    return checkAndUpdateNodeInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
  } else {
    return checkAndUpdateNodeDynamic(view, nodeDef, v0);
  }
}
function markProjectedViewsForCheck(view) {
  var def = view.def;
  if (!(def.nodeFlags & 4)) {
    return;
  }
  for (var i = 0; i < def.nodes.length; i++) {
    var nodeDef = def.nodes[i];
    if (nodeDef.flags & 4) {
      var projectedViews = asElementData(view, i).template._projectedViews;
      if (projectedViews) {
        for (var i_1 = 0; i_1 < projectedViews.length; i_1++) {
          var projectedView = projectedViews[i_1];
          projectedView.state |= 32;
          markParentViewsForCheckProjectedViews(projectedView, view);
        }
      }
    } else if ((nodeDef.childFlags & 4) === 0) {
      i += nodeDef.childCount;
    }
  }
}
function checkAndUpdateNodeInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
  switch (nodeDef.flags & 201347067) {
    case 1:
      return checkAndUpdateElementInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    case 2:
      return checkAndUpdateTextInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    case 16384:
      return checkAndUpdateDirectiveInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    case 32:
    case 64:
    case 128:
      return checkAndUpdatePureExpressionInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
    default:
      throw "unreachable";
  }
}
function checkAndUpdateNodeDynamic(view, nodeDef, values) {
  switch (nodeDef.flags & 201347067) {
    case 1:
      return checkAndUpdateElementDynamic(view, nodeDef, values);
    case 2:
      return checkAndUpdateTextDynamic(view, nodeDef, values);
    case 16384:
      return checkAndUpdateDirectiveDynamic(view, nodeDef, values);
    case 32:
    case 64:
    case 128:
      return checkAndUpdatePureExpressionDynamic(view, nodeDef, values);
    default:
      throw "unreachable";
  }
}
function checkNoChangesNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
  if (argStyle === 0) {
    checkNoChangesNodeInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
  } else {
    checkNoChangesNodeDynamic(view, nodeDef, v0);
  }
  return false;
}
function checkNoChangesNodeInline(view, nodeDef, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
  var bindLen = nodeDef.bindings.length;
  if (bindLen > 0) checkBindingNoChanges(view, nodeDef, 0, v0);
  if (bindLen > 1) checkBindingNoChanges(view, nodeDef, 1, v1);
  if (bindLen > 2) checkBindingNoChanges(view, nodeDef, 2, v2);
  if (bindLen > 3) checkBindingNoChanges(view, nodeDef, 3, v3);
  if (bindLen > 4) checkBindingNoChanges(view, nodeDef, 4, v4);
  if (bindLen > 5) checkBindingNoChanges(view, nodeDef, 5, v5);
  if (bindLen > 6) checkBindingNoChanges(view, nodeDef, 6, v6);
  if (bindLen > 7) checkBindingNoChanges(view, nodeDef, 7, v7);
  if (bindLen > 8) checkBindingNoChanges(view, nodeDef, 8, v8);
  if (bindLen > 9) checkBindingNoChanges(view, nodeDef, 9, v9);
}
function checkNoChangesNodeDynamic(view, nodeDef, values) {
  for (var i = 0; i < values.length; i++) {
    checkBindingNoChanges(view, nodeDef, i, values[i]);
  }
}
function checkNoChangesQuery(view, nodeDef) {
  var queryList = asQueryList(view, nodeDef.nodeIndex);
  if (queryList.dirty) {
    throw expressionChangedAfterItHasBeenCheckedError(Services.createDebugContext(view, nodeDef.nodeIndex), "Query " + nodeDef.query.id + " not dirty", "Query " + nodeDef.query.id + " dirty", (view.state & 1) !== 0);
  }
}
function destroyView(view) {
  if (view.state & 128) {
    return;
  }
  execEmbeddedViewsAction(view, ViewAction.Destroy);
  execComponentViewsAction(view, ViewAction.Destroy);
  callLifecycleHooksChildrenFirst(
    view,
    131072
    /* OnDestroy */
  );
  if (view.disposables) {
    for (var i = 0; i < view.disposables.length; i++) {
      view.disposables[i]();
    }
  }
  detachProjectedView(view);
  if (view.renderer.destroyNode) {
    destroyViewNodes(view);
  }
  if (isComponentView(view)) {
    view.renderer.destroy();
  }
  view.state |= 128;
}
function destroyViewNodes(view) {
  var len = view.def.nodes.length;
  for (var i = 0; i < len; i++) {
    var def = view.def.nodes[i];
    if (def.flags & 1) {
      view.renderer.destroyNode(asElementData(view, i).renderElement);
    } else if (def.flags & 2) {
      view.renderer.destroyNode(asTextData(view, i).renderText);
    } else if (def.flags & 67108864 || def.flags & 134217728) {
      asQueryList(view, i).destroy();
    }
  }
}
var ViewAction;
(function(ViewAction2) {
  ViewAction2[ViewAction2["CreateViewNodes"] = 0] = "CreateViewNodes";
  ViewAction2[ViewAction2["CheckNoChanges"] = 1] = "CheckNoChanges";
  ViewAction2[ViewAction2["CheckNoChangesProjectedViews"] = 2] = "CheckNoChangesProjectedViews";
  ViewAction2[ViewAction2["CheckAndUpdate"] = 3] = "CheckAndUpdate";
  ViewAction2[ViewAction2["CheckAndUpdateProjectedViews"] = 4] = "CheckAndUpdateProjectedViews";
  ViewAction2[ViewAction2["Destroy"] = 5] = "Destroy";
})(ViewAction || (ViewAction = {}));
function execComponentViewsAction(view, action) {
  var def = view.def;
  if (!(def.nodeFlags & 33554432)) {
    return;
  }
  for (var i = 0; i < def.nodes.length; i++) {
    var nodeDef = def.nodes[i];
    if (nodeDef.flags & 33554432) {
      callViewAction(asElementData(view, i).componentView, action);
    } else if ((nodeDef.childFlags & 33554432) === 0) {
      i += nodeDef.childCount;
    }
  }
}
function execEmbeddedViewsAction(view, action) {
  var def = view.def;
  if (!(def.nodeFlags & 16777216)) {
    return;
  }
  for (var i = 0; i < def.nodes.length; i++) {
    var nodeDef = def.nodes[i];
    if (nodeDef.flags & 16777216) {
      var embeddedViews = asElementData(view, i).viewContainer._embeddedViews;
      for (var k = 0; k < embeddedViews.length; k++) {
        callViewAction(embeddedViews[k], action);
      }
    } else if ((nodeDef.childFlags & 16777216) === 0) {
      i += nodeDef.childCount;
    }
  }
}
function callViewAction(view, action) {
  var viewState = view.state;
  switch (action) {
    case ViewAction.CheckNoChanges:
      if ((viewState & 128) === 0) {
        if ((viewState & 12) === 12) {
          checkNoChangesView(view);
        } else if (viewState & 64) {
          execProjectedViewsAction(view, ViewAction.CheckNoChangesProjectedViews);
        }
      }
      break;
    case ViewAction.CheckNoChangesProjectedViews:
      if ((viewState & 128) === 0) {
        if (viewState & 32) {
          checkNoChangesView(view);
        } else if (viewState & 64) {
          execProjectedViewsAction(view, action);
        }
      }
      break;
    case ViewAction.CheckAndUpdate:
      if ((viewState & 128) === 0) {
        if ((viewState & 12) === 12) {
          checkAndUpdateView(view);
        } else if (viewState & 64) {
          execProjectedViewsAction(view, ViewAction.CheckAndUpdateProjectedViews);
        }
      }
      break;
    case ViewAction.CheckAndUpdateProjectedViews:
      if ((viewState & 128) === 0) {
        if (viewState & 32) {
          checkAndUpdateView(view);
        } else if (viewState & 64) {
          execProjectedViewsAction(view, action);
        }
      }
      break;
    case ViewAction.Destroy:
      destroyView(view);
      break;
    case ViewAction.CreateViewNodes:
      createViewNodes(view);
      break;
  }
}
function execProjectedViewsAction(view, action) {
  execEmbeddedViewsAction(view, action);
  execComponentViewsAction(view, action);
}
function execQueriesAction(view, queryFlags, staticDynamicQueryFlag, checkType) {
  if (!(view.def.nodeFlags & queryFlags) || !(view.def.nodeFlags & staticDynamicQueryFlag)) {
    return;
  }
  var nodeCount = view.def.nodes.length;
  for (var i = 0; i < nodeCount; i++) {
    var nodeDef = view.def.nodes[i];
    if (nodeDef.flags & queryFlags && nodeDef.flags & staticDynamicQueryFlag) {
      Services.setCurrentNode(view, nodeDef.nodeIndex);
      switch (checkType) {
        case 0:
          checkAndUpdateQuery(view, nodeDef);
          break;
        case 1:
          checkNoChangesQuery(view, nodeDef);
          break;
      }
    }
    if (!(nodeDef.childFlags & queryFlags) || !(nodeDef.childFlags & staticDynamicQueryFlag)) {
      i += nodeDef.childCount;
    }
  }
}
var initialized = false;
function initServicesIfNeeded() {
  if (initialized) {
    return;
  }
  initialized = true;
  var services = isDevMode() ? createDebugServices() : createProdServices();
  Services.setCurrentNode = services.setCurrentNode;
  Services.createRootView = services.createRootView;
  Services.createEmbeddedView = services.createEmbeddedView;
  Services.createComponentView = services.createComponentView;
  Services.createNgModuleRef = services.createNgModuleRef;
  Services.overrideProvider = services.overrideProvider;
  Services.overrideComponentView = services.overrideComponentView;
  Services.clearOverrides = services.clearOverrides;
  Services.checkAndUpdateView = services.checkAndUpdateView;
  Services.checkNoChangesView = services.checkNoChangesView;
  Services.destroyView = services.destroyView;
  Services.resolveDep = resolveDep;
  Services.createDebugContext = services.createDebugContext;
  Services.handleEvent = services.handleEvent;
  Services.updateDirectives = services.updateDirectives;
  Services.updateRenderer = services.updateRenderer;
  Services.dirtyParentQueries = dirtyParentQueries;
}
function createProdServices() {
  return {
    setCurrentNode: function() {
    },
    createRootView: createProdRootView,
    createEmbeddedView,
    createComponentView,
    createNgModuleRef,
    overrideProvider: NOOP,
    overrideComponentView: NOOP,
    clearOverrides: NOOP,
    checkAndUpdateView,
    checkNoChangesView,
    destroyView,
    createDebugContext: function(view, nodeIndex) {
      return new DebugContext_(view, nodeIndex);
    },
    handleEvent: function(view, nodeIndex, eventName, event) {
      return view.def.handleEvent(view, nodeIndex, eventName, event);
    },
    updateDirectives: function(view, checkType) {
      return view.def.updateDirectives(checkType === 0 ? prodCheckAndUpdateNode : prodCheckNoChangesNode, view);
    },
    updateRenderer: function(view, checkType) {
      return view.def.updateRenderer(checkType === 0 ? prodCheckAndUpdateNode : prodCheckNoChangesNode, view);
    }
  };
}
function createDebugServices() {
  return {
    setCurrentNode: debugSetCurrentNode,
    createRootView: debugCreateRootView,
    createEmbeddedView: debugCreateEmbeddedView,
    createComponentView: debugCreateComponentView,
    createNgModuleRef: debugCreateNgModuleRef,
    overrideProvider: debugOverrideProvider,
    overrideComponentView: debugOverrideComponentView,
    clearOverrides: debugClearOverrides,
    checkAndUpdateView: debugCheckAndUpdateView,
    checkNoChangesView: debugCheckNoChangesView,
    destroyView: debugDestroyView,
    createDebugContext: function(view, nodeIndex) {
      return new DebugContext_(view, nodeIndex);
    },
    handleEvent: debugHandleEvent,
    updateDirectives: debugUpdateDirectives,
    updateRenderer: debugUpdateRenderer
  };
}
function createProdRootView(elInjector, projectableNodes, rootSelectorOrNode, def, ngModule, context) {
  var rendererFactory2 = ngModule.injector.get(RendererFactory2);
  return createRootView(createRootData(elInjector, ngModule, rendererFactory2, projectableNodes, rootSelectorOrNode), def, context);
}
function debugCreateRootView(elInjector, projectableNodes, rootSelectorOrNode, def, ngModule, context) {
  var rendererFactory2 = ngModule.injector.get(RendererFactory2);
  var root = createRootData(elInjector, ngModule, new DebugRendererFactory2(rendererFactory2), projectableNodes, rootSelectorOrNode);
  var defWithOverride = applyProviderOverridesToView(def);
  return callWithDebugContext(DebugAction.create, createRootView, null, [root, defWithOverride, context]);
}
function createRootData(elInjector, ngModule, rendererFactory2, projectableNodes, rootSelectorOrNode) {
  var sanitizer = ngModule.injector.get(Sanitizer);
  var errorHandler = ngModule.injector.get(ErrorHandler);
  var renderer2 = rendererFactory2.createRenderer(null, null);
  return {
    ngModule,
    injector: elInjector,
    projectableNodes,
    selectorOrNode: rootSelectorOrNode,
    sanitizer,
    rendererFactory: rendererFactory2,
    renderer: renderer2,
    errorHandler
  };
}
function debugCreateEmbeddedView(parentView, anchorDef, viewDef$$1, context) {
  var defWithOverride = applyProviderOverridesToView(viewDef$$1);
  return callWithDebugContext(DebugAction.create, createEmbeddedView, null, [parentView, anchorDef, defWithOverride, context]);
}
function debugCreateComponentView(parentView, nodeDef, viewDef$$1, hostElement2) {
  var overrideComponentView = viewDefOverrides.get(nodeDef.element.componentProvider.provider.token);
  if (overrideComponentView) {
    viewDef$$1 = overrideComponentView;
  } else {
    viewDef$$1 = applyProviderOverridesToView(viewDef$$1);
  }
  return callWithDebugContext(DebugAction.create, createComponentView, null, [parentView, nodeDef, viewDef$$1, hostElement2]);
}
function debugCreateNgModuleRef(moduleType, parentInjector, bootstrapComponents, def) {
  var defWithOverride = applyProviderOverridesToNgModule(def);
  return createNgModuleRef(moduleType, parentInjector, bootstrapComponents, defWithOverride);
}
var providerOverrides = /* @__PURE__ */ new Map();
var providerOverridesWithScope = /* @__PURE__ */ new Map();
var viewDefOverrides = /* @__PURE__ */ new Map();
function debugOverrideProvider(override) {
  providerOverrides.set(override.token, override);
  if (typeof override.token === "function" && override.token.ngInjectableDef && typeof override.token.ngInjectableDef.providedIn === "function") {
    providerOverridesWithScope.set(override.token, override);
  }
}
function debugOverrideComponentView(comp, compFactory) {
  var hostViewDef = resolveDefinition(getComponentViewDefinitionFactory(compFactory));
  var compViewDef = resolveDefinition(hostViewDef.nodes[0].element.componentView);
  viewDefOverrides.set(comp, compViewDef);
}
function debugClearOverrides() {
  providerOverrides.clear();
  providerOverridesWithScope.clear();
  viewDefOverrides.clear();
}
function applyProviderOverridesToView(def) {
  if (providerOverrides.size === 0) {
    return def;
  }
  var elementIndicesWithOverwrittenProviders = findElementIndicesWithOverwrittenProviders(def);
  if (elementIndicesWithOverwrittenProviders.length === 0) {
    return def;
  }
  def = def.factory(function() {
    return NOOP;
  });
  for (var i = 0; i < elementIndicesWithOverwrittenProviders.length; i++) {
    applyProviderOverridesToElement(def, elementIndicesWithOverwrittenProviders[i]);
  }
  return def;
  function findElementIndicesWithOverwrittenProviders(def2) {
    var elIndicesWithOverwrittenProviders = [];
    var lastElementDef = null;
    for (var i2 = 0; i2 < def2.nodes.length; i2++) {
      var nodeDef = def2.nodes[i2];
      if (nodeDef.flags & 1) {
        lastElementDef = nodeDef;
      }
      if (lastElementDef && nodeDef.flags & 3840 && providerOverrides.has(nodeDef.provider.token)) {
        elIndicesWithOverwrittenProviders.push(lastElementDef.nodeIndex);
        lastElementDef = null;
      }
    }
    return elIndicesWithOverwrittenProviders;
  }
  function applyProviderOverridesToElement(viewDef$$1, elIndex) {
    for (var i2 = elIndex + 1; i2 < viewDef$$1.nodes.length; i2++) {
      var nodeDef = viewDef$$1.nodes[i2];
      if (nodeDef.flags & 1) {
        return;
      }
      if (nodeDef.flags & 3840) {
        var provider = nodeDef.provider;
        var override = providerOverrides.get(provider.token);
        if (override) {
          nodeDef.flags = nodeDef.flags & ~3840 | override.flags;
          provider.deps = splitDepsDsl(override.deps);
          provider.value = override.value;
        }
      }
    }
  }
}
function applyProviderOverridesToNgModule(def) {
  var _a = calcHasOverrides(def), hasOverrides = _a.hasOverrides, hasDeprecatedOverrides = _a.hasDeprecatedOverrides;
  if (!hasOverrides) {
    return def;
  }
  def = def.factory(function() {
    return NOOP;
  });
  applyProviderOverrides(def);
  return def;
  function calcHasOverrides(def2) {
    var hasOverrides2 = false;
    var hasDeprecatedOverrides2 = false;
    if (providerOverrides.size === 0) {
      return {
        hasOverrides: hasOverrides2,
        hasDeprecatedOverrides: hasDeprecatedOverrides2
      };
    }
    def2.providers.forEach(function(node) {
      var override = providerOverrides.get(node.token);
      if (node.flags & 3840 && override) {
        hasOverrides2 = true;
        hasDeprecatedOverrides2 = hasDeprecatedOverrides2 || override.deprecatedBehavior;
      }
    });
    def2.modules.forEach(function(module) {
      providerOverridesWithScope.forEach(function(override, token) {
        if (token.ngInjectableDef.providedIn === module) {
          hasOverrides2 = true;
          hasDeprecatedOverrides2 = hasDeprecatedOverrides2 || override.deprecatedBehavior;
        }
      });
    });
    return {
      hasOverrides: hasOverrides2,
      hasDeprecatedOverrides: hasDeprecatedOverrides2
    };
  }
  function applyProviderOverrides(def2) {
    for (var i = 0; i < def2.providers.length; i++) {
      var provider = def2.providers[i];
      if (hasDeprecatedOverrides) {
        provider.flags |= 4096;
      }
      var override = providerOverrides.get(provider.token);
      if (override) {
        provider.flags = provider.flags & ~3840 | override.flags;
        provider.deps = splitDepsDsl(override.deps);
        provider.value = override.value;
      }
    }
    if (providerOverridesWithScope.size > 0) {
      var moduleSet_1 = new Set(def2.modules);
      providerOverridesWithScope.forEach(function(override2, token) {
        if (moduleSet_1.has(token.ngInjectableDef.providedIn)) {
          var provider2 = {
            token,
            flags: override2.flags | (hasDeprecatedOverrides ? 4096 : 0),
            deps: splitDepsDsl(override2.deps),
            value: override2.value,
            index: def2.providers.length
          };
          def2.providers.push(provider2);
          def2.providersByKey[tokenKey(token)] = provider2;
        }
      });
    }
  }
}
function prodCheckAndUpdateNode(view, checkIndex, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
  var nodeDef = view.def.nodes[checkIndex];
  checkAndUpdateNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
  return nodeDef.flags & 224 ? asPureExpressionData(view, checkIndex).value : void 0;
}
function prodCheckNoChangesNode(view, checkIndex, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
  var nodeDef = view.def.nodes[checkIndex];
  checkNoChangesNode(view, nodeDef, argStyle, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9);
  return nodeDef.flags & 224 ? asPureExpressionData(view, checkIndex).value : void 0;
}
function debugCheckAndUpdateView(view) {
  return callWithDebugContext(DebugAction.detectChanges, checkAndUpdateView, null, [view]);
}
function debugCheckNoChangesView(view) {
  return callWithDebugContext(DebugAction.checkNoChanges, checkNoChangesView, null, [view]);
}
function debugDestroyView(view) {
  return callWithDebugContext(DebugAction.destroy, destroyView, null, [view]);
}
var DebugAction;
(function(DebugAction2) {
  DebugAction2[DebugAction2["create"] = 0] = "create";
  DebugAction2[DebugAction2["detectChanges"] = 1] = "detectChanges";
  DebugAction2[DebugAction2["checkNoChanges"] = 2] = "checkNoChanges";
  DebugAction2[DebugAction2["destroy"] = 3] = "destroy";
  DebugAction2[DebugAction2["handleEvent"] = 4] = "handleEvent";
})(DebugAction || (DebugAction = {}));
var _currentAction;
var _currentView;
var _currentNodeIndex;
function debugSetCurrentNode(view, nodeIndex) {
  _currentView = view;
  _currentNodeIndex = nodeIndex;
}
function debugHandleEvent(view, nodeIndex, eventName, event) {
  debugSetCurrentNode(view, nodeIndex);
  return callWithDebugContext(DebugAction.handleEvent, view.def.handleEvent, null, [view, nodeIndex, eventName, event]);
}
function debugUpdateDirectives(view, checkType) {
  if (view.state & 128) {
    throw viewDestroyedError(DebugAction[_currentAction]);
  }
  debugSetCurrentNode(view, nextDirectiveWithBinding(view, 0));
  return view.def.updateDirectives(debugCheckDirectivesFn, view);
  function debugCheckDirectivesFn(view2, nodeIndex, argStyle) {
    var values = [];
    for (var _i = 3; _i < arguments.length; _i++) {
      values[_i - 3] = arguments[_i];
    }
    var nodeDef = view2.def.nodes[nodeIndex];
    if (checkType === 0) {
      debugCheckAndUpdateNode(view2, nodeDef, argStyle, values);
    } else {
      debugCheckNoChangesNode(view2, nodeDef, argStyle, values);
    }
    if (nodeDef.flags & 16384) {
      debugSetCurrentNode(view2, nextDirectiveWithBinding(view2, nodeIndex));
    }
    return nodeDef.flags & 224 ? asPureExpressionData(view2, nodeDef.nodeIndex).value : void 0;
  }
}
function debugUpdateRenderer(view, checkType) {
  if (view.state & 128) {
    throw viewDestroyedError(DebugAction[_currentAction]);
  }
  debugSetCurrentNode(view, nextRenderNodeWithBinding(view, 0));
  return view.def.updateRenderer(debugCheckRenderNodeFn, view);
  function debugCheckRenderNodeFn(view2, nodeIndex, argStyle) {
    var values = [];
    for (var _i = 3; _i < arguments.length; _i++) {
      values[_i - 3] = arguments[_i];
    }
    var nodeDef = view2.def.nodes[nodeIndex];
    if (checkType === 0) {
      debugCheckAndUpdateNode(view2, nodeDef, argStyle, values);
    } else {
      debugCheckNoChangesNode(view2, nodeDef, argStyle, values);
    }
    if (nodeDef.flags & 3) {
      debugSetCurrentNode(view2, nextRenderNodeWithBinding(view2, nodeIndex));
    }
    return nodeDef.flags & 224 ? asPureExpressionData(view2, nodeDef.nodeIndex).value : void 0;
  }
}
function debugCheckAndUpdateNode(view, nodeDef, argStyle, givenValues) {
  var changed = checkAndUpdateNode.apply(void 0, __spread([view, nodeDef, argStyle], givenValues));
  if (changed) {
    var values = argStyle === 1 ? givenValues[0] : givenValues;
    if (nodeDef.flags & 16384) {
      var bindingValues = {};
      for (var i = 0; i < nodeDef.bindings.length; i++) {
        var binding = nodeDef.bindings[i];
        var value = values[i];
        if (binding.flags & 8) {
          bindingValues[normalizeDebugBindingName(binding.nonMinifiedName)] = normalizeDebugBindingValue(value);
        }
      }
      var elDef = nodeDef.parent;
      var el = asElementData(view, elDef.nodeIndex).renderElement;
      if (!elDef.element.name) {
        view.renderer.setValue(el, "bindings=" + JSON.stringify(bindingValues, null, 2));
      } else {
        for (var attr in bindingValues) {
          var value = bindingValues[attr];
          if (value != null) {
            view.renderer.setAttribute(el, attr, value);
          } else {
            view.renderer.removeAttribute(el, attr);
          }
        }
      }
    }
  }
}
function debugCheckNoChangesNode(view, nodeDef, argStyle, values) {
  checkNoChangesNode.apply(void 0, __spread([view, nodeDef, argStyle], values));
}
function normalizeDebugBindingName(name) {
  name = camelCaseToDashCase(name.replace(/[$@]/g, "_"));
  return "ng-reflect-" + name;
}
var CAMEL_CASE_REGEXP = /([A-Z])/g;
function camelCaseToDashCase(input) {
  return input.replace(CAMEL_CASE_REGEXP, function() {
    var m = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      m[_i] = arguments[_i];
    }
    return "-" + m[1].toLowerCase();
  });
}
function normalizeDebugBindingValue(value) {
  try {
    return value != null ? value.toString().slice(0, 30) : value;
  } catch (e) {
    return "[ERROR] Exception while trying to serialize the value";
  }
}
function nextDirectiveWithBinding(view, nodeIndex) {
  for (var i = nodeIndex; i < view.def.nodes.length; i++) {
    var nodeDef = view.def.nodes[i];
    if (nodeDef.flags & 16384 && nodeDef.bindings && nodeDef.bindings.length) {
      return i;
    }
  }
  return null;
}
function nextRenderNodeWithBinding(view, nodeIndex) {
  for (var i = nodeIndex; i < view.def.nodes.length; i++) {
    var nodeDef = view.def.nodes[i];
    if (nodeDef.flags & 3 && nodeDef.bindings && nodeDef.bindings.length) {
      return i;
    }
  }
  return null;
}
var DebugContext_ = (
  /** @class */
  function() {
    function DebugContext_2(view, nodeIndex) {
      this.view = view;
      this.nodeIndex = nodeIndex;
      if (nodeIndex == null) {
        this.nodeIndex = nodeIndex = 0;
      }
      this.nodeDef = view.def.nodes[nodeIndex];
      var elDef = this.nodeDef;
      var elView = view;
      while (elDef && (elDef.flags & 1) === 0) {
        elDef = elDef.parent;
      }
      if (!elDef) {
        while (!elDef && elView) {
          elDef = viewParentEl(elView);
          elView = elView.parent;
        }
      }
      this.elDef = elDef;
      this.elView = elView;
    }
    Object.defineProperty(DebugContext_2.prototype, "elOrCompView", {
      get: function() {
        return asElementData(this.elView, this.elDef.nodeIndex).componentView || this.view;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DebugContext_2.prototype, "injector", {
      get: function() {
        return createInjector$1(this.elView, this.elDef);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DebugContext_2.prototype, "component", {
      get: function() {
        return this.elOrCompView.component;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DebugContext_2.prototype, "context", {
      get: function() {
        return this.elOrCompView.context;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DebugContext_2.prototype, "providerTokens", {
      get: function() {
        var tokens = [];
        if (this.elDef) {
          for (var i = this.elDef.nodeIndex + 1; i <= this.elDef.nodeIndex + this.elDef.childCount; i++) {
            var childDef = this.elView.def.nodes[i];
            if (childDef.flags & 20224) {
              tokens.push(childDef.provider.token);
            }
            i += childDef.childCount;
          }
        }
        return tokens;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DebugContext_2.prototype, "references", {
      get: function() {
        var references = {};
        if (this.elDef) {
          collectReferences(this.elView, this.elDef, references);
          for (var i = this.elDef.nodeIndex + 1; i <= this.elDef.nodeIndex + this.elDef.childCount; i++) {
            var childDef = this.elView.def.nodes[i];
            if (childDef.flags & 20224) {
              collectReferences(this.elView, childDef, references);
            }
            i += childDef.childCount;
          }
        }
        return references;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DebugContext_2.prototype, "componentRenderElement", {
      get: function() {
        var elData = findHostElement(this.elOrCompView);
        return elData ? elData.renderElement : void 0;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DebugContext_2.prototype, "renderNode", {
      get: function() {
        return this.nodeDef.flags & 2 ? renderNode(this.view, this.nodeDef) : renderNode(this.elView, this.elDef);
      },
      enumerable: true,
      configurable: true
    });
    DebugContext_2.prototype.logError = function(console2) {
      var values = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
      }
      var logViewDef;
      var logNodeIndex;
      if (this.nodeDef.flags & 2) {
        logViewDef = this.view.def;
        logNodeIndex = this.nodeDef.nodeIndex;
      } else {
        logViewDef = this.elView.def;
        logNodeIndex = this.elDef.nodeIndex;
      }
      var renderNodeIndex = getRenderNodeIndex(logViewDef, logNodeIndex);
      var currRenderNodeIndex = -1;
      var nodeLogger = function() {
        var _a;
        currRenderNodeIndex++;
        if (currRenderNodeIndex === renderNodeIndex) {
          return (_a = console2.error).bind.apply(_a, __spread([console2], values));
        } else {
          return NOOP;
        }
      };
      logViewDef.factory(nodeLogger);
      if (currRenderNodeIndex < renderNodeIndex) {
        console2.error("Illegal state: the ViewDefinitionFactory did not call the logger!");
        console2.error.apply(console2, __spread(values));
      }
    };
    return DebugContext_2;
  }()
);
function getRenderNodeIndex(viewDef$$1, nodeIndex) {
  var renderNodeIndex = -1;
  for (var i = 0; i <= nodeIndex; i++) {
    var nodeDef = viewDef$$1.nodes[i];
    if (nodeDef.flags & 3) {
      renderNodeIndex++;
    }
  }
  return renderNodeIndex;
}
function findHostElement(view) {
  while (view && !isComponentView(view)) {
    view = view.parent;
  }
  if (view.parent) {
    return asElementData(view.parent, viewParentEl(view).nodeIndex);
  }
  return null;
}
function collectReferences(view, nodeDef, references) {
  for (var refName in nodeDef.references) {
    references[refName] = getQueryValue(view, nodeDef, nodeDef.references[refName]);
  }
}
function callWithDebugContext(action, fn, self2, args) {
  var oldAction = _currentAction;
  var oldView = _currentView;
  var oldNodeIndex = _currentNodeIndex;
  try {
    _currentAction = action;
    var result = fn.apply(self2, args);
    _currentView = oldView;
    _currentNodeIndex = oldNodeIndex;
    _currentAction = oldAction;
    return result;
  } catch (e) {
    if (isViewDebugError(e) || !_currentView) {
      throw e;
    }
    throw viewWrappedDebugError(e, getCurrentDebugContext());
  }
}
function getCurrentDebugContext() {
  return _currentView ? new DebugContext_(_currentView, _currentNodeIndex) : null;
}
var DebugRendererFactory2 = (
  /** @class */
  function() {
    function DebugRendererFactory22(delegate) {
      this.delegate = delegate;
    }
    DebugRendererFactory22.prototype.createRenderer = function(element, renderData) {
      return new DebugRenderer2(this.delegate.createRenderer(element, renderData));
    };
    DebugRendererFactory22.prototype.begin = function() {
      if (this.delegate.begin) {
        this.delegate.begin();
      }
    };
    DebugRendererFactory22.prototype.end = function() {
      if (this.delegate.end) {
        this.delegate.end();
      }
    };
    DebugRendererFactory22.prototype.whenRenderingDone = function() {
      if (this.delegate.whenRenderingDone) {
        return this.delegate.whenRenderingDone();
      }
      return Promise.resolve(null);
    };
    return DebugRendererFactory22;
  }()
);
var DebugRenderer2 = (
  /** @class */
  function() {
    function DebugRenderer22(delegate) {
      this.delegate = delegate;
      this.data = this.delegate.data;
    }
    DebugRenderer22.prototype.destroyNode = function(node) {
      removeDebugNodeFromIndex(getDebugNode(node));
      if (this.delegate.destroyNode) {
        this.delegate.destroyNode(node);
      }
    };
    DebugRenderer22.prototype.destroy = function() {
      this.delegate.destroy();
    };
    DebugRenderer22.prototype.createElement = function(name, namespace) {
      var el = this.delegate.createElement(name, namespace);
      var debugCtx = getCurrentDebugContext();
      if (debugCtx) {
        var debugEl = new DebugElement(el, null, debugCtx);
        debugEl.name = name;
        indexDebugNode(debugEl);
      }
      return el;
    };
    DebugRenderer22.prototype.createComment = function(value) {
      var comment = this.delegate.createComment(value);
      var debugCtx = getCurrentDebugContext();
      if (debugCtx) {
        indexDebugNode(new DebugNode(comment, null, debugCtx));
      }
      return comment;
    };
    DebugRenderer22.prototype.createText = function(value) {
      var text = this.delegate.createText(value);
      var debugCtx = getCurrentDebugContext();
      if (debugCtx) {
        indexDebugNode(new DebugNode(text, null, debugCtx));
      }
      return text;
    };
    DebugRenderer22.prototype.appendChild = function(parent, newChild) {
      var debugEl = getDebugNode(parent);
      var debugChildEl = getDebugNode(newChild);
      if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
        debugEl.addChild(debugChildEl);
      }
      this.delegate.appendChild(parent, newChild);
    };
    DebugRenderer22.prototype.insertBefore = function(parent, newChild, refChild) {
      var debugEl = getDebugNode(parent);
      var debugChildEl = getDebugNode(newChild);
      var debugRefEl = getDebugNode(refChild);
      if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
        debugEl.insertBefore(debugRefEl, debugChildEl);
      }
      this.delegate.insertBefore(parent, newChild, refChild);
    };
    DebugRenderer22.prototype.removeChild = function(parent, oldChild) {
      var debugEl = getDebugNode(parent);
      var debugChildEl = getDebugNode(oldChild);
      if (debugEl && debugChildEl && debugEl instanceof DebugElement) {
        debugEl.removeChild(debugChildEl);
      }
      this.delegate.removeChild(parent, oldChild);
    };
    DebugRenderer22.prototype.selectRootElement = function(selectorOrNode) {
      var el = this.delegate.selectRootElement(selectorOrNode);
      var debugCtx = getCurrentDebugContext();
      if (debugCtx) {
        indexDebugNode(new DebugElement(el, null, debugCtx));
      }
      return el;
    };
    DebugRenderer22.prototype.setAttribute = function(el, name, value, namespace) {
      var debugEl = getDebugNode(el);
      if (debugEl && debugEl instanceof DebugElement) {
        var fullName = namespace ? namespace + ":" + name : name;
        debugEl.attributes[fullName] = value;
      }
      this.delegate.setAttribute(el, name, value, namespace);
    };
    DebugRenderer22.prototype.removeAttribute = function(el, name, namespace) {
      var debugEl = getDebugNode(el);
      if (debugEl && debugEl instanceof DebugElement) {
        var fullName = namespace ? namespace + ":" + name : name;
        debugEl.attributes[fullName] = null;
      }
      this.delegate.removeAttribute(el, name, namespace);
    };
    DebugRenderer22.prototype.addClass = function(el, name) {
      var debugEl = getDebugNode(el);
      if (debugEl && debugEl instanceof DebugElement) {
        debugEl.classes[name] = true;
      }
      this.delegate.addClass(el, name);
    };
    DebugRenderer22.prototype.removeClass = function(el, name) {
      var debugEl = getDebugNode(el);
      if (debugEl && debugEl instanceof DebugElement) {
        debugEl.classes[name] = false;
      }
      this.delegate.removeClass(el, name);
    };
    DebugRenderer22.prototype.setStyle = function(el, style, value, flags) {
      var debugEl = getDebugNode(el);
      if (debugEl && debugEl instanceof DebugElement) {
        debugEl.styles[style] = value;
      }
      this.delegate.setStyle(el, style, value, flags);
    };
    DebugRenderer22.prototype.removeStyle = function(el, style, flags) {
      var debugEl = getDebugNode(el);
      if (debugEl && debugEl instanceof DebugElement) {
        debugEl.styles[style] = null;
      }
      this.delegate.removeStyle(el, style, flags);
    };
    DebugRenderer22.prototype.setProperty = function(el, name, value) {
      var debugEl = getDebugNode(el);
      if (debugEl && debugEl instanceof DebugElement) {
        debugEl.properties[name] = value;
      }
      this.delegate.setProperty(el, name, value);
    };
    DebugRenderer22.prototype.listen = function(target, eventName, callback) {
      if (typeof target !== "string") {
        var debugEl = getDebugNode(target);
        if (debugEl) {
          debugEl.listeners.push(new EventListener(eventName, callback));
        }
      }
      return this.delegate.listen(target, eventName, callback);
    };
    DebugRenderer22.prototype.parentNode = function(node) {
      return this.delegate.parentNode(node);
    };
    DebugRenderer22.prototype.nextSibling = function(node) {
      return this.delegate.nextSibling(node);
    };
    DebugRenderer22.prototype.setValue = function(node, value) {
      return this.delegate.setValue(node, value);
    };
    return DebugRenderer22;
  }()
);
function cloneNgModuleDefinition(def) {
  var providers = Array.from(def.providers);
  var modules = Array.from(def.modules);
  var providersByKey = {};
  for (var key in def.providersByKey) {
    providersByKey[key] = def.providersByKey[key];
  }
  return {
    factory: def.factory,
    isRoot: def.isRoot,
    providers,
    modules,
    providersByKey
  };
}
var NgModuleFactory_ = (
  /** @class */
  function(_super) {
    __extends(NgModuleFactory_2, _super);
    function NgModuleFactory_2(moduleType, _bootstrapComponents, _ngModuleDefFactory) {
      var _this = (
        // Attention: this ctor is called as top level function.
        // Putting any logic in here will destroy closure tree shaking!
        _super.call(this) || this
      );
      _this.moduleType = moduleType;
      _this._bootstrapComponents = _bootstrapComponents;
      _this._ngModuleDefFactory = _ngModuleDefFactory;
      return _this;
    }
    NgModuleFactory_2.prototype.create = function(parentInjector) {
      initServicesIfNeeded();
      var def = cloneNgModuleDefinition(resolveDefinition(this._ngModuleDefFactory));
      return Services.createNgModuleRef(this.moduleType, parentInjector || Injector.NULL, this._bootstrapComponents, def);
    };
    return NgModuleFactory_2;
  }(NgModuleFactory)
);
function assertEqual(actual, expected, msg) {
  if (actual != expected) {
    throwError2(msg);
  }
}
function assertNotEqual(actual, expected, msg) {
  if (actual == expected) {
    throwError2(msg);
  }
}
function assertLessThan(actual, expected, msg) {
  if (actual >= expected) {
    throwError2(msg);
  }
}
function assertGreaterThan(actual, expected, msg) {
  if (actual <= expected) {
    throwError2(msg);
  }
}
function assertNotDefined(actual, msg) {
  if (actual != null) {
    throwError2(msg);
  }
}
function assertDefined(actual, msg) {
  if (actual == null) {
    throwError2(msg);
  }
}
function assertComponentType(actual, msg) {
  if (msg === void 0) {
    msg = "Type passed in is not ComponentType, it does not have 'ngComponentDef' property.";
  }
  if (!actual.ngComponentDef) {
    debugger;
    throwError2(msg);
  }
}
function throwError2(msg) {
  debugger;
  throw new Error("ASSERTION ERROR: " + msg);
}
var HEADER_OFFSET = 16;
var TVIEW = 0;
var PARENT = 1;
var NEXT = 2;
var QUERIES = 3;
var FLAGS = 4;
var HOST_NODE = 5;
var BINDING_INDEX = 6;
var DIRECTIVES = 7;
var CLEANUP = 8;
var CONTEXT = 9;
var INJECTOR$1 = 10;
var RENDERER = 11;
var SANITIZER = 12;
var CONTAINER_INDEX = 14;
function queueInitHooks(index, onInit, doCheck, tView2) {
  ngDevMode && assertEqual(tView2.firstTemplatePass, true, "Should only be called on first template pass");
  if (onInit) {
    (tView2.initHooks || (tView2.initHooks = [])).push(index, onInit);
  }
  if (doCheck) {
    (tView2.initHooks || (tView2.initHooks = [])).push(index, doCheck);
    (tView2.checkHooks || (tView2.checkHooks = [])).push(index, doCheck);
  }
}
function queueLifecycleHooks(flags, tView2) {
  if (tView2.firstTemplatePass) {
    var start = flags >> 14;
    var count2 = flags & 4095;
    var end = start + count2;
    for (var i = start; i < end; i++) {
      var def = tView2.directives[i];
      queueContentHooks(def, tView2, i);
      queueViewHooks(def, tView2, i);
      queueDestroyHooks(def, tView2, i);
    }
  }
}
function queueContentHooks(def, tView2, i) {
  if (def.afterContentInit) {
    (tView2.contentHooks || (tView2.contentHooks = [])).push(i, def.afterContentInit);
  }
  if (def.afterContentChecked) {
    (tView2.contentHooks || (tView2.contentHooks = [])).push(i, def.afterContentChecked);
    (tView2.contentCheckHooks || (tView2.contentCheckHooks = [])).push(i, def.afterContentChecked);
  }
}
function queueViewHooks(def, tView2, i) {
  if (def.afterViewInit) {
    (tView2.viewHooks || (tView2.viewHooks = [])).push(i, def.afterViewInit);
  }
  if (def.afterViewChecked) {
    (tView2.viewHooks || (tView2.viewHooks = [])).push(i, def.afterViewChecked);
    (tView2.viewCheckHooks || (tView2.viewCheckHooks = [])).push(i, def.afterViewChecked);
  }
}
function queueDestroyHooks(def, tView2, i) {
  if (def.onDestroy != null) {
    (tView2.destroyHooks || (tView2.destroyHooks = [])).push(i, def.onDestroy);
  }
}
function executeInitHooks(currentView, tView2, creationMode2) {
  if (currentView[FLAGS] & 16) {
    executeHooks(currentView[DIRECTIVES], tView2.initHooks, tView2.checkHooks, creationMode2);
    currentView[FLAGS] &= ~16;
  }
}
function executeHooks(data, allHooks, checkHooks, creationMode2) {
  var hooksToCall = creationMode2 ? allHooks : checkHooks;
  if (hooksToCall) {
    callHooks(data, hooksToCall);
  }
}
function callHooks(data, arr) {
  for (var i = 0; i < arr.length; i += 2) {
    arr[i + 1].call(data[arr[i]]);
  }
}
function ngDevModeResetPerfCounters() {
  var newCounters = {
    firstTemplatePass: 0,
    tNode: 0,
    tView: 0,
    rendererCreateTextNode: 0,
    rendererSetText: 0,
    rendererCreateElement: 0,
    rendererAddEventListener: 0,
    rendererSetAttribute: 0,
    rendererRemoveAttribute: 0,
    rendererSetProperty: 0,
    rendererSetClassName: 0,
    rendererAddClass: 0,
    rendererRemoveClass: 0,
    rendererSetStyle: 0,
    rendererRemoveStyle: 0,
    rendererDestroy: 0,
    rendererDestroyNode: 0,
    rendererMoveNode: 0,
    rendererRemoveNode: 0
  };
  if (typeof window != "undefined") {
    window["ngDevMode"] = newCounters;
  }
  if (typeof global != "undefined") {
    global["ngDevMode"] = newCounters;
  }
  if (typeof self != "undefined") {
    self["ngDevMode"] = newCounters;
  }
  return newCounters;
}
if (typeof ngDevMode === "undefined" || ngDevMode) {
  ngDevModeResetPerfCounters();
}
var ACTIVE_INDEX = 0;
var VIEWS = 4;
var RENDER_PARENT = 5;
var NG_PROJECT_AS_ATTR_NAME = "ngProjectAs";
var RendererStyleFlags3;
(function(RendererStyleFlags32) {
  RendererStyleFlags32[RendererStyleFlags32["Important"] = 1] = "Important";
  RendererStyleFlags32[RendererStyleFlags32["DashCase"] = 2] = "DashCase";
})(RendererStyleFlags3 || (RendererStyleFlags3 = {}));
function isProceduralRenderer(renderer2) {
  return !!renderer2.listen;
}
var domRendererFactory3 = {
  createRenderer: function(hostElement2, rendererType) {
    return document;
  }
};
function assertNodeType(node, type) {
  assertDefined(node, "should be called with a node");
  assertEqual(node.tNode.type, type, "should be a " + typeName(type));
}
function typeName(type) {
  if (type == 1) return "Projection";
  if (type == 0) return "Container";
  if (type == 2) return "View";
  if (type == 3) return "Element";
  return "<unknown>";
}
function stringify$1(value) {
  if (typeof value == "function") return value.name || value;
  if (typeof value == "string") return value;
  if (value == null) return "";
  return "" + value;
}
function flatten$1(list) {
  var result = [];
  var i = 0;
  while (i < list.length) {
    var item = list[i];
    if (Array.isArray(item)) {
      if (item.length > 0) {
        list = item.concat(list.slice(i + 1));
        i = 0;
      } else {
        i++;
      }
    } else {
      result.push(item);
      i++;
    }
  }
  return result;
}
function assertDataInRangeInternal(index, arr) {
  assertLessThan(index, arr ? arr.length : 0, "index expected to be a valid data index");
}
function readElementValue(value) {
  return Array.isArray(value) ? value[0] : value;
}
function getNextLNode(node) {
  if (node.tNode.type === 2) {
    var viewData2 = node.data;
    return viewData2[NEXT] ? viewData2[NEXT][HOST_NODE] : null;
  }
  return node.tNode.next ? node.view[node.tNode.next.index] : null;
}
function getChildLNode(node) {
  if (node.tNode.child) {
    var viewData2 = node.tNode.type === 2 ? node.data : node.view;
    return readElementValue(viewData2[node.tNode.child.index]);
  }
  return null;
}
function getParentLNode(node) {
  if (node.tNode.index === -1 && node.tNode.type === 2) {
    var containerHostIndex = node.data[CONTAINER_INDEX];
    return containerHostIndex === -1 ? null : node.view[containerHostIndex].dynamicLContainerNode;
  }
  var parent = node.tNode.parent;
  return readElementValue(parent ? node.view[parent.index] : node.view[HOST_NODE]);
}
var projectionNodeStack = [];
function walkLNodeTree(startingNode, rootNode, action, renderer2, renderParentNode, beforeNode) {
  var node = startingNode;
  var projectionNodeIndex = -1;
  while (node) {
    var nextNode = null;
    var parent_1 = renderParentNode ? renderParentNode.native : null;
    var nodeType = node.tNode.type;
    if (nodeType === 3) {
      executeNodeAction(action, renderer2, parent_1, node.native, beforeNode);
      if (node.dynamicLContainerNode) {
        executeNodeAction(action, renderer2, parent_1, node.dynamicLContainerNode.native, beforeNode);
      }
    } else if (nodeType === 0) {
      executeNodeAction(action, renderer2, parent_1, node.native, beforeNode);
      var lContainerNode = node;
      var childContainerData = lContainerNode.dynamicLContainerNode ? lContainerNode.dynamicLContainerNode.data : lContainerNode.data;
      if (renderParentNode) {
        childContainerData[RENDER_PARENT] = renderParentNode;
      }
      nextNode = childContainerData[VIEWS].length ? getChildLNode(childContainerData[VIEWS][0]) : null;
      if (nextNode) {
        beforeNode = lContainerNode.dynamicLContainerNode ? lContainerNode.dynamicLContainerNode.native : lContainerNode.native;
      }
    } else if (nodeType === 1) {
      var componentHost = findComponentHost(node.view);
      var head = componentHost.tNode.projection[node.tNode.projection];
      projectionNodeStack[++projectionNodeIndex] = node;
      nextNode = head ? componentHost.data[PARENT][head.index] : null;
    } else {
      nextNode = getChildLNode(node);
    }
    if (nextNode === null) {
      nextNode = getNextLNode(node);
      if (nextNode === null && node.tNode.flags & 8192) {
        nextNode = getNextLNode(projectionNodeStack[projectionNodeIndex--]);
      }
      while (node && !nextNode) {
        node = getParentLNode(node);
        if (node === null || node === rootNode) return null;
        if (!node.tNode.next && nodeType === 0) {
          beforeNode = node.native;
        }
        nextNode = getNextLNode(node);
      }
    }
    node = nextNode;
  }
}
function findComponentHost(lViewData) {
  var viewRootLNode = lViewData[HOST_NODE];
  while (viewRootLNode.tNode.type === 2) {
    ngDevMode && assertDefined(lViewData[PARENT], "lViewData.parent");
    lViewData = lViewData[PARENT];
    viewRootLNode = lViewData[HOST_NODE];
  }
  ngDevMode && assertNodeType(
    viewRootLNode,
    3
    /* Element */
  );
  ngDevMode && assertDefined(viewRootLNode.data, "node.data");
  return viewRootLNode;
}
function executeNodeAction(action, renderer2, parent, node, beforeNode) {
  if (action === 0) {
    isProceduralRenderer(renderer2) ? renderer2.insertBefore(parent, node, beforeNode) : parent.insertBefore(node, beforeNode, true);
  } else if (action === 1) {
    isProceduralRenderer(renderer2) ? renderer2.removeChild(parent, node) : parent.removeChild(node);
  } else if (action === 2) {
    ngDevMode && ngDevMode.rendererDestroyNode++;
    renderer2.destroyNode(node);
  }
}
function addRemoveViewFromContainer(container, rootNode, insertMode, beforeNode) {
  ngDevMode && assertNodeType(
    container,
    0
    /* Container */
  );
  ngDevMode && assertNodeType(
    rootNode,
    2
    /* View */
  );
  var parentNode = container.data[RENDER_PARENT];
  var parent = parentNode ? parentNode.native : null;
  if (parent) {
    var node = getChildLNode(rootNode);
    var renderer2 = container.view[RENDERER];
    walkLNodeTree(node, rootNode, insertMode ? 0 : 1, renderer2, parentNode, beforeNode);
  }
}
function destroyViewTree(rootView) {
  if (rootView[TVIEW].childIndex === -1) {
    return cleanUpView(rootView);
  }
  var viewOrContainer = getLViewChild(rootView);
  while (viewOrContainer) {
    var next = null;
    if (viewOrContainer.length >= HEADER_OFFSET) {
      var view = viewOrContainer;
      if (view[TVIEW].childIndex > -1) next = getLViewChild(view);
    } else {
      var container = viewOrContainer;
      if (container[VIEWS].length) next = container[VIEWS][0].data;
    }
    if (next == null) {
      while (viewOrContainer && !viewOrContainer[NEXT] && viewOrContainer !== rootView) {
        cleanUpView(viewOrContainer);
        viewOrContainer = getParentState(viewOrContainer, rootView);
      }
      cleanUpView(viewOrContainer || rootView);
      next = viewOrContainer && viewOrContainer[NEXT];
    }
    viewOrContainer = next;
  }
}
function insertView(container, viewNode, index) {
  var state = container.data;
  var views = state[VIEWS];
  var lView = viewNode.data;
  if (index > 0) {
    views[index - 1].data[NEXT] = lView;
  }
  if (index < views.length) {
    lView[NEXT] = views[index].data;
    views.splice(index, 0, viewNode);
  } else {
    views.push(viewNode);
    lView[NEXT] = null;
  }
  if (viewNode.tNode.index === -1) {
    lView[CONTAINER_INDEX] = container.tNode.parent.index;
    viewNode.view = container.view;
  }
  if (lView[QUERIES]) {
    lView[QUERIES].insertView(index);
  }
  lView[FLAGS] |= 8;
  return viewNode;
}
function detachView(container, removeIndex) {
  var views = container.data[VIEWS];
  var viewNode = views[removeIndex];
  if (removeIndex > 0) {
    views[removeIndex - 1].data[NEXT] = viewNode.data[NEXT];
  }
  views.splice(removeIndex, 1);
  if (!container.tNode.detached) {
    addRemoveViewFromContainer(container, viewNode, false);
  }
  var removedLView = viewNode.data;
  if (removedLView[QUERIES]) {
    removedLView[QUERIES].removeView();
  }
  removedLView[CONTAINER_INDEX] = -1;
  viewNode.view = null;
  viewNode.data[FLAGS] &= ~8;
  return viewNode;
}
function removeView(container, removeIndex) {
  var viewNode = container.data[VIEWS][removeIndex];
  detachView(container, removeIndex);
  destroyLView(viewNode.data);
  return viewNode;
}
function getLViewChild(viewData2) {
  if (viewData2[TVIEW].childIndex === -1) return null;
  var hostNode = viewData2[viewData2[TVIEW].childIndex];
  return hostNode.data ? hostNode.data : hostNode.dynamicLContainerNode.data;
}
function destroyLView(view) {
  var renderer2 = view[RENDERER];
  if (isProceduralRenderer(renderer2) && renderer2.destroyNode) {
    walkLNodeTree(view[HOST_NODE], view[HOST_NODE], 2, renderer2);
  }
  destroyViewTree(view);
  view[FLAGS] |= 32;
}
function getParentState(state, rootView) {
  var node;
  if ((node = state[HOST_NODE]) && node.tNode.type === 2) {
    return getParentLNode(node).data;
  } else {
    return state[PARENT] === rootView ? null : state[PARENT];
  }
}
function cleanUpView(viewOrContainer) {
  if (viewOrContainer[TVIEW]) {
    var view = viewOrContainer;
    removeListeners(view);
    executeOnDestroys(view);
    executePipeOnDestroys(view);
    if (view[TVIEW].id === -1 && isProceduralRenderer(view[RENDERER])) {
      ngDevMode && ngDevMode.rendererDestroy++;
      view[RENDERER].destroy();
    }
  }
}
function removeListeners(viewData2) {
  var cleanup = viewData2[TVIEW].cleanup;
  if (cleanup != null) {
    for (var i = 0; i < cleanup.length - 1; i += 2) {
      if (typeof cleanup[i] === "string") {
        var native = readElementValue(viewData2[cleanup[i + 1]]).native;
        var listener = viewData2[CLEANUP][cleanup[i + 2]];
        native.removeEventListener(cleanup[i], listener, cleanup[i + 3]);
        i += 2;
      } else if (typeof cleanup[i] === "number") {
        var cleanupFn = viewData2[CLEANUP][cleanup[i]];
        cleanupFn();
      } else {
        var context = viewData2[CLEANUP][cleanup[i + 1]];
        cleanup[i].call(context);
      }
    }
    viewData2[CLEANUP] = null;
  }
}
function executeOnDestroys(view) {
  var tView2 = view[TVIEW];
  var destroyHooks;
  if (tView2 != null && (destroyHooks = tView2.destroyHooks) != null) {
    callHooks(view[DIRECTIVES], destroyHooks);
  }
}
function executePipeOnDestroys(viewData2) {
  var pipeDestroyHooks = viewData2[TVIEW] && viewData2[TVIEW].pipeDestroyHooks;
  if (pipeDestroyHooks) {
    callHooks(viewData2, pipeDestroyHooks);
  }
}
var NG_HOST_SYMBOL = "__ngHostLNode__";
var _CLEAN_PROMISE = Promise.resolve(null);
var _ROOT_DIRECTIVE_INDICES = [0, 0];
var HEADER_FILLER = new Array(HEADER_OFFSET).fill(null);
var renderer;
var rendererFactory;
function getCurrentSanitizer() {
  return viewData && viewData[SANITIZER];
}
var previousOrParentNode;
var isParent;
var tView;
var currentQueries;
var creationMode;
var viewData;
var directives;
function getCleanup(view) {
  return view[CLEANUP] || (view[CLEANUP] = []);
}
function getTViewCleanup(view) {
  return view[TVIEW].cleanup || (view[TVIEW].cleanup = []);
}
var checkNoChangesMode = false;
var firstTemplatePass = true;
function enterView(newView, host) {
  var oldView = viewData;
  directives = newView && newView[DIRECTIVES];
  tView = newView && newView[TVIEW];
  creationMode = newView && (newView[FLAGS] & 1) === 1;
  firstTemplatePass = newView && tView.firstTemplatePass;
  renderer = newView && newView[RENDERER];
  if (host != null) {
    previousOrParentNode = host;
    isParent = true;
  }
  viewData = newView;
  currentQueries = newView && newView[QUERIES];
  return oldView;
}
function leaveView(newView, creationOnly) {
  if (!creationOnly) {
    if (!checkNoChangesMode) {
      executeHooks(directives, tView.viewHooks, tView.viewCheckHooks, creationMode);
    }
    viewData[FLAGS] &= ~(1 | 4);
  }
  viewData[FLAGS] |= 16;
  viewData[BINDING_INDEX] = -1;
  enterView(newView, null);
}
function refreshView() {
  if (!checkNoChangesMode) {
    executeInitHooks(viewData, tView, creationMode);
  }
  refreshDynamicEmbeddedViews(viewData);
  if (!checkNoChangesMode) {
    executeHooks(directives, tView.contentHooks, tView.contentCheckHooks, creationMode);
  }
  tView.firstTemplatePass = firstTemplatePass = false;
  setHostBindings(tView.hostBindings);
  refreshContentQueries(tView);
  refreshChildComponents(tView.components);
}
function setHostBindings(bindings) {
  if (bindings != null) {
    var defs = tView.directives;
    for (var i = 0; i < bindings.length; i += 2) {
      var dirIndex = bindings[i];
      var def = defs[dirIndex];
      def.hostBindings && def.hostBindings(dirIndex, bindings[i + 1]);
    }
  }
}
function refreshContentQueries(tView2) {
  if (tView2.contentQueries != null) {
    for (var i = 0; i < tView2.contentQueries.length; i += 2) {
      var directiveDefIdx = tView2.contentQueries[i];
      var directiveDef = tView2.directives[directiveDefIdx];
      directiveDef.contentQueriesRefresh(directiveDefIdx, tView2.contentQueries[i + 1]);
    }
  }
}
function refreshChildComponents(components) {
  if (components != null) {
    for (var i = 0; i < components.length; i += 2) {
      componentRefresh(components[i], components[i + 1]);
    }
  }
}
function executeInitAndContentHooks() {
  if (!checkNoChangesMode) {
    executeInitHooks(viewData, tView, creationMode);
    executeHooks(directives, tView.contentHooks, tView.contentCheckHooks, creationMode);
  }
}
function createLViewData(renderer2, tView2, context, flags, sanitizer) {
  return [tView2, viewData, null, null, flags | 1 | 8 | 16, null, -1, null, null, context, viewData && viewData[INJECTOR$1], renderer2, sanitizer || null, null, -1, null];
}
function createLNodeObject(type, currentView, parent, native, state, queries) {
  return {
    native,
    view: currentView,
    nodeInjector: parent ? parent.nodeInjector : null,
    data: state,
    queries,
    tNode: null,
    dynamicLContainerNode: null
  };
}
function createLNode(index, type, native, name, attrs, state) {
  var parent = isParent ? previousOrParentNode : previousOrParentNode && getParentLNode(previousOrParentNode);
  var tParent = parent && parent.view === viewData ? parent.tNode : null;
  var queries = (isParent ? currentQueries : previousOrParentNode && previousOrParentNode.queries) || parent && parent.queries && parent.queries.child();
  var isState = state != null;
  var node = createLNodeObject(type, viewData, parent, native, isState ? state : null, queries);
  if (index === -1 || type === 2) {
    node.tNode = (state ? state[TVIEW].node : null) || createTNode(type, index, null, null, tParent, null);
  } else {
    var adjustedIndex = index + HEADER_OFFSET;
    ngDevMode && assertDataNext(adjustedIndex);
    var tData = tView.data;
    viewData[adjustedIndex] = node;
    if (adjustedIndex >= tData.length) {
      var tNode = tData[adjustedIndex] = createTNode(type, adjustedIndex, name, attrs, tParent, null);
      if (!isParent && previousOrParentNode) {
        var previousTNode = previousOrParentNode.tNode;
        previousTNode.next = tNode;
        if (previousTNode.dynamicContainerNode) previousTNode.dynamicContainerNode.next = tNode;
      }
    }
    node.tNode = tData[adjustedIndex];
    if (isParent) {
      currentQueries = null;
      if (previousOrParentNode.tNode.child == null && previousOrParentNode.view === viewData || previousOrParentNode.tNode.type === 2) {
        previousOrParentNode.tNode.child = node.tNode;
      }
    }
  }
  if ((type & 2) === 2 && isState) {
    var lViewData = state;
    ngDevMode && assertNotDefined(lViewData[HOST_NODE], "lViewData[HOST_NODE] should not have been initialized");
    lViewData[HOST_NODE] = node;
    if (firstTemplatePass) lViewData[TVIEW].node = node.tNode;
  }
  previousOrParentNode = node;
  isParent = true;
  return node;
}
function resetApplicationState() {
  isParent = false;
  previousOrParentNode = null;
}
function createEmbeddedViewNode(tView2, context, renderer2, queries) {
  var _isParent = isParent;
  var _previousOrParentNode = previousOrParentNode;
  isParent = true;
  previousOrParentNode = null;
  var lView = createLViewData(renderer2, tView2, context, 2, getCurrentSanitizer());
  if (queries) {
    lView[QUERIES] = queries.createView();
  }
  var viewNode = createLNode(-1, 2, null, null, null, lView);
  isParent = _isParent;
  previousOrParentNode = _previousOrParentNode;
  return viewNode;
}
function renderEmbeddedTemplate(viewNode, tView2, context, rf) {
  var _isParent = isParent;
  var _previousOrParentNode = previousOrParentNode;
  var oldView;
  if (viewNode.data[PARENT] == null && viewNode.data[CONTEXT] && !tView2.template) {
    tickRootContext(viewNode.data[CONTEXT]);
  } else {
    try {
      isParent = true;
      previousOrParentNode = null;
      oldView = enterView(viewNode.data, viewNode);
      namespaceHTML();
      tView2.template(rf, context);
      if (rf & 2) {
        refreshView();
      } else {
        viewNode.data[TVIEW].firstTemplatePass = firstTemplatePass = false;
      }
    } finally {
      var isCreationOnly = (rf & 1) === 1;
      leaveView(oldView, isCreationOnly);
      isParent = _isParent;
      previousOrParentNode = _previousOrParentNode;
    }
  }
  return viewNode;
}
function renderComponentOrTemplate(node, hostView, componentOrContext, template) {
  var oldView = enterView(hostView, node);
  try {
    if (rendererFactory.begin) {
      rendererFactory.begin();
    }
    if (template) {
      namespaceHTML();
      template(getRenderFlags(hostView), componentOrContext);
      refreshView();
    } else {
      executeInitAndContentHooks();
      setHostBindings(_ROOT_DIRECTIVE_INDICES);
      componentRefresh(0, HEADER_OFFSET);
    }
  } finally {
    if (rendererFactory.end) {
      rendererFactory.end();
    }
    leaveView(oldView);
  }
}
function getRenderFlags(view) {
  return view[FLAGS] & 1 ? 1 | 2 : 2;
}
var _currentNamespace = null;
function namespaceHTML() {
  _currentNamespace = null;
}
function elementCreate(name, overriddenRenderer) {
  var native;
  var rendererToUse = overriddenRenderer || renderer;
  if (isProceduralRenderer(rendererToUse)) {
    native = rendererToUse.createElement(name, _currentNamespace);
  } else {
    if (_currentNamespace === null) {
      native = rendererToUse.createElement(name);
    } else {
      native = rendererToUse.createElementNS(_currentNamespace, name);
    }
  }
  return native;
}
function initChangeDetectorIfExisting(injector, instance, view) {
  if (injector && injector.changeDetectorRef != null) {
    injector.changeDetectorRef._setComponentContext(view, instance);
  }
}
function getOrCreateTView(template, directives2, pipes, viewQuery) {
  return template.ngPrivateData || (template.ngPrivateData = createTView(-1, template, directives2, pipes, viewQuery));
}
function createTView(viewIndex, template, directives2, pipes, viewQuery) {
  ngDevMode && ngDevMode.tView++;
  return {
    id: viewIndex,
    template,
    viewQuery,
    node: null,
    data: HEADER_FILLER.slice(),
    childIndex: -1,
    bindingStartIndex: -1,
    directives: null,
    firstTemplatePass: true,
    initHooks: null,
    checkHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null,
    pipeDestroyHooks: null,
    cleanup: null,
    hostBindings: null,
    contentQueries: null,
    components: null,
    directiveRegistry: typeof directives2 === "function" ? directives2() : directives2,
    pipeRegistry: typeof pipes === "function" ? pipes() : pipes,
    currentMatches: null
  };
}
function setUpAttributes(native, attrs) {
  var isProc = isProceduralRenderer(renderer);
  var i = 0;
  while (i < attrs.length) {
    var attrName = attrs[i];
    if (attrName === 1) break;
    if (attrName === NG_PROJECT_AS_ATTR_NAME) {
      i += 2;
    } else {
      ngDevMode && ngDevMode.rendererSetAttribute++;
      if (attrName === 0) {
        var namespaceURI = attrs[i + 1];
        var attrName_1 = attrs[i + 2];
        var attrVal = attrs[i + 3];
        isProc ? renderer.setAttribute(native, attrName_1, attrVal, namespaceURI) : native.setAttributeNS(namespaceURI, attrName_1, attrVal);
        i += 4;
      } else {
        var attrVal = attrs[i + 1];
        isProc ? renderer.setAttribute(native, attrName, attrVal) : native.setAttribute(attrName, attrVal);
        i += 2;
      }
    }
  }
}
function createError(text, token) {
  return new Error("Renderer: " + text + " [" + stringify$1(token) + "]");
}
function locateHostElement(factory, elementOrSelector) {
  ngDevMode && assertDataInRange(-1);
  rendererFactory = factory;
  var defaultRenderer = factory.createRenderer(null, null);
  var rNode = typeof elementOrSelector === "string" ? isProceduralRenderer(defaultRenderer) ? defaultRenderer.selectRootElement(elementOrSelector) : defaultRenderer.querySelector(elementOrSelector) : elementOrSelector;
  if (ngDevMode && !rNode) {
    if (typeof elementOrSelector === "string") {
      throw createError("Host node with selector not found:", elementOrSelector);
    } else {
      throw createError("Host node is required:", elementOrSelector);
    }
  }
  return rNode;
}
function hostElement(tag, rNode, def, sanitizer) {
  resetApplicationState();
  var node = createLNode(0, 3, rNode, null, null, createLViewData(renderer, getOrCreateTView(def.template, def.directiveDefs, def.pipeDefs, def.viewQuery), null, def.onPush ? 4 : 2, sanitizer));
  if (firstTemplatePass) {
    node.tNode.flags = 4096;
    if (def.diPublic) def.diPublic(def);
    tView.directives = [def];
  }
  return node;
}
function storeCleanupFn(view, cleanupFn) {
  getCleanup(view).push(cleanupFn);
  if (view[TVIEW].firstTemplatePass) {
    getTViewCleanup(view).push(view[CLEANUP].length - 1, null);
  }
}
function createTNode(type, adjustedIndex, tagName, attrs, parent, tViews) {
  ngDevMode && ngDevMode.tNode++;
  return {
    type,
    index: adjustedIndex,
    flags: 0,
    tagName,
    attrs,
    localNames: null,
    initialInputs: void 0,
    inputs: void 0,
    outputs: void 0,
    tViews,
    next: null,
    child: null,
    parent,
    dynamicContainerNode: null,
    detached: null,
    stylingTemplate: null,
    projection: null
  };
}
function baseDirectiveCreate(index, directive, directiveDef) {
  ngDevMode && assertEqual(viewData[BINDING_INDEX], -1, "directives should be created before any bindings");
  ngDevMode && assertPreviousIsParent();
  Object.defineProperty(directive, NG_HOST_SYMBOL, {
    enumerable: false,
    value: previousOrParentNode
  });
  if (directives == null) viewData[DIRECTIVES] = directives = [];
  ngDevMode && assertDataNext(index, directives);
  directives[index] = directive;
  if (firstTemplatePass) {
    var flags = previousOrParentNode.tNode.flags;
    if ((flags & 4095) === 0) {
      previousOrParentNode.tNode.flags = index << 14 | flags & 4096 | 1;
    } else {
      ngDevMode && assertNotEqual(flags & 4095, 4095, "Reached the max number of directives");
      previousOrParentNode.tNode.flags++;
    }
  } else {
    var diPublic = directiveDef.diPublic;
    if (diPublic) diPublic(directiveDef);
  }
  if (directiveDef.attributes != null && previousOrParentNode.tNode.type == 3) {
    setUpAttributes(previousOrParentNode.native, directiveDef.attributes);
  }
  return directive;
}
function refreshDynamicEmbeddedViews(lViewData) {
  for (var current = getLViewChild(lViewData); current !== null; current = current[NEXT]) {
    if (current.length < HEADER_OFFSET && current[ACTIVE_INDEX] === null) {
      var container_1 = current;
      for (var i = 0; i < container_1[VIEWS].length; i++) {
        var lViewNode = container_1[VIEWS][i];
        var dynamicViewData = lViewNode.data;
        ngDevMode && assertDefined(dynamicViewData[TVIEW], "TView must be allocated");
        renderEmbeddedTemplate(
          lViewNode,
          dynamicViewData[TVIEW],
          dynamicViewData[CONTEXT],
          2
          /* Update */
        );
      }
    }
  }
}
function componentRefresh(directiveIndex, adjustedElementIndex) {
  ngDevMode && assertDataInRange(adjustedElementIndex);
  var element = viewData[adjustedElementIndex];
  ngDevMode && assertNodeType(
    element,
    3
    /* Element */
  );
  ngDevMode && assertDefined(element.data, "Component's host node should have an LViewData attached.");
  var hostView = element.data;
  if (viewAttached(hostView) && hostView[FLAGS] & (2 | 4)) {
    ngDevMode && assertDataInRange(directiveIndex, directives);
    detectChangesInternal(hostView, element, directives[directiveIndex]);
  }
}
function viewAttached(view) {
  return (view[FLAGS] & 8) === 8;
}
function markViewDirty(view) {
  var currentView = view;
  while (currentView[PARENT] != null) {
    currentView[FLAGS] |= 4;
    currentView = currentView[PARENT];
  }
  currentView[FLAGS] |= 4;
  ngDevMode && assertDefined(currentView[CONTEXT], "rootContext");
  scheduleTick(currentView[CONTEXT]);
}
function scheduleTick(rootContext) {
  if (rootContext.clean == _CLEAN_PROMISE) {
    var res_1;
    rootContext.clean = new Promise(function(r) {
      return res_1 = r;
    });
    rootContext.scheduler(function() {
      tickRootContext(rootContext);
      res_1(null);
      rootContext.clean = _CLEAN_PROMISE;
    });
  }
}
function tickRootContext(rootContext) {
  for (var i = 0; i < rootContext.components.length; i++) {
    var rootComponent = rootContext.components[i];
    var hostNode = _getComponentHostLElementNode(rootComponent);
    ngDevMode && assertDefined(hostNode.data, "Component host node should be attached to an LView");
    renderComponentOrTemplate(hostNode, getRootView(rootComponent), rootComponent);
  }
}
function getRootView(component) {
  ngDevMode && assertDefined(component, "component");
  var lElementNode = _getComponentHostLElementNode(component);
  var lViewData = lElementNode.view;
  while (lViewData[PARENT]) {
    lViewData = lViewData[PARENT];
  }
  return lViewData;
}
function detectChanges(component) {
  var hostNode = _getComponentHostLElementNode(component);
  ngDevMode && assertDefined(hostNode.data, "Component host node should be attached to an LViewData instance.");
  detectChangesInternal(hostNode.data, hostNode, component);
}
function checkNoChanges(component) {
  checkNoChangesMode = true;
  try {
    detectChanges(component);
  } finally {
    checkNoChangesMode = false;
  }
}
function detectChangesInternal(hostView, hostNode, component) {
  var oldView = enterView(hostView, hostNode);
  var hostTView = hostView[TVIEW];
  var template = hostTView.template;
  var viewQuery = hostTView.viewQuery;
  try {
    namespaceHTML();
    createViewQuery(viewQuery, hostView[FLAGS], component);
    template(getRenderFlags(hostView), component);
    refreshView();
    updateViewQuery(viewQuery, component);
  } finally {
    leaveView(oldView);
  }
}
function createViewQuery(viewQuery, flags, component) {
  if (viewQuery && flags & 1) {
    viewQuery(1, component);
  }
}
function updateViewQuery(viewQuery, component) {
  if (viewQuery) {
    viewQuery(2, component);
  }
}
function assertPreviousIsParent() {
  assertEqual(isParent, true, "previousOrParentNode should be a parent");
}
function assertDataInRange(index, arr) {
  if (arr == null) arr = viewData;
  assertDataInRangeInternal(index, arr || viewData);
}
function assertDataNext(index, arr) {
  if (arr == null) arr = viewData;
  assertEqual(arr.length, index, "index " + index + " expected to be at the end of arr (length " + arr.length + ")");
}
function _getComponentHostLElementNode(component) {
  ngDevMode && assertDefined(component, "expecting component got null");
  var lElementNode = component[NG_HOST_SYMBOL];
  ngDevMode && assertDefined(component, "object is not a component");
  return lElementNode;
}
var CLEAN_PROMISE = _CLEAN_PROMISE;
function createRootContext(scheduler) {
  return {
    components: [],
    scheduler,
    clean: CLEAN_PROMISE
  };
}
function LifecycleHooksFeature(component, def) {
  var elementNode = _getComponentHostLElementNode(component);
  var tView2 = elementNode.view[TVIEW];
  queueInitHooks(0, def.onInit, def.doCheck, tView2);
  queueLifecycleHooks(elementNode.tNode.flags, tView2);
}
var ViewRef$1 = (
  /** @class */
  function() {
    function ViewRef2(_view, context) {
      this._view = _view;
      this._appRef = null;
      this._viewContainerRef = null;
      this._lViewNode = null;
      this.context = context;
    }
    ViewRef2.prototype._setComponentContext = function(view, context) {
      this._view = view;
      this.context = context;
    };
    Object.defineProperty(ViewRef2.prototype, "destroyed", {
      get: function() {
        return (this._view[FLAGS] & 32) === 32;
      },
      enumerable: true,
      configurable: true
    });
    ViewRef2.prototype.destroy = function() {
      if (this._viewContainerRef && viewAttached(this._view)) {
        this._viewContainerRef.detach(this._viewContainerRef.indexOf(this));
        this._viewContainerRef = null;
      }
      destroyLView(this._view);
    };
    ViewRef2.prototype.onDestroy = function(callback) {
      storeCleanupFn(this._view, callback);
    };
    ViewRef2.prototype.markForCheck = function() {
      markViewDirty(this._view);
    };
    ViewRef2.prototype.detach = function() {
      this._view[FLAGS] &= ~8;
    };
    ViewRef2.prototype.reattach = function() {
      this._view[FLAGS] |= 8;
    };
    ViewRef2.prototype.detectChanges = function() {
      detectChanges(this.context);
    };
    ViewRef2.prototype.checkNoChanges = function() {
      checkNoChanges(this.context);
    };
    ViewRef2.prototype.attachToViewContainerRef = function(vcRef) {
      this._viewContainerRef = vcRef;
    };
    ViewRef2.prototype.detachFromAppRef = function() {
      this._appRef = null;
    };
    ViewRef2.prototype.attachToAppRef = function(appRef) {
      this._appRef = appRef;
    };
    return ViewRef2;
  }()
);
var ComponentFactoryResolver$1 = (
  /** @class */
  function(_super) {
    __extends(ComponentFactoryResolver$$1, _super);
    function ComponentFactoryResolver$$1() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    ComponentFactoryResolver$$1.prototype.resolveComponentFactory = function(component) {
      ngDevMode && assertComponentType(component);
      var componentDef = component.ngComponentDef;
      return new ComponentFactory$1(componentDef);
    };
    return ComponentFactoryResolver$$1;
  }(ComponentFactoryResolver)
);
function toRefArray(map2) {
  var array = [];
  for (var nonMinified in map2) {
    if (map2.hasOwnProperty(nonMinified)) {
      var minified = map2[nonMinified];
      array.push({
        propName: minified,
        templateName: nonMinified
      });
    }
  }
  return array;
}
var ROOT_CONTEXT = new InjectionToken("ROOT_CONTEXT_TOKEN", {
  providedIn: "root",
  factory: function() {
    return createRootContext(inject(SCHEDULER));
  }
});
var SCHEDULER = new InjectionToken("SCHEDULER_TOKEN", {
  providedIn: "root",
  factory: function() {
    return requestAnimationFrame.bind(window);
  }
});
var ComponentFactory$1 = (
  /** @class */
  function(_super) {
    __extends(ComponentFactory$$1, _super);
    function ComponentFactory$$1(componentDef) {
      var _this = _super.call(this) || this;
      _this.componentDef = componentDef;
      _this.componentType = componentDef.type;
      _this.selector = componentDef.selectors[0][0];
      _this.ngContentSelectors = [];
      return _this;
    }
    Object.defineProperty(ComponentFactory$$1.prototype, "inputs", {
      get: function() {
        return toRefArray(this.componentDef.inputs);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ComponentFactory$$1.prototype, "outputs", {
      get: function() {
        return toRefArray(this.componentDef.outputs);
      },
      enumerable: true,
      configurable: true
    });
    ComponentFactory$$1.prototype.create = function(injector, projectableNodes, rootSelectorOrNode, ngModule) {
      var isInternalRootView = rootSelectorOrNode === void 0;
      var rendererFactory2 = ngModule ? ngModule.injector.get(RendererFactory2) : domRendererFactory3;
      var hostNode = isInternalRootView ? elementCreate(this.selector, rendererFactory2.createRenderer(null, this.componentDef.rendererType)) : locateHostElement(rendererFactory2, rootSelectorOrNode);
      var componentTag = this.componentDef.selectors[0][0];
      var rootContext = ngModule && !isInternalRootView ? ngModule.injector.get(ROOT_CONTEXT) : createRootContext(requestAnimationFrame.bind(window));
      var rootView = createLViewData(
        rendererFactory2.createRenderer(hostNode, this.componentDef.rendererType),
        createTView(-1, null, null, null, null),
        rootContext,
        this.componentDef.onPush ? 4 : 2
        /* CheckAlways */
      );
      rootView[INJECTOR$1] = ngModule && ngModule.injector || null;
      var oldView = enterView(rootView, null);
      var component;
      var elementNode;
      try {
        if (rendererFactory2.begin) rendererFactory2.begin();
        elementNode = hostElement(componentTag, hostNode, this.componentDef);
        rootContext.components.push(component = baseDirectiveCreate(0, this.componentDef.factory(), this.componentDef));
        initChangeDetectorIfExisting(elementNode.nodeInjector, component, elementNode.data);
        LifecycleHooksFeature(component, this.componentDef);
        if (projectableNodes) {
          var index = 0;
          var projection$$1 = elementNode.tNode.projection = [];
          for (var i = 0; i < projectableNodes.length; i++) {
            var nodeList = projectableNodes[i];
            var firstTNode = null;
            var previousTNode = null;
            for (var j = 0; j < nodeList.length; j++) {
              var lNode = createLNode(++index, 3, nodeList[j], null, null);
              if (previousTNode) {
                previousTNode.next = lNode.tNode;
              } else {
                firstTNode = lNode.tNode;
              }
              previousTNode = lNode.tNode;
            }
            projection$$1.push(firstTNode);
          }
        }
        renderEmbeddedTemplate(
          elementNode,
          elementNode.data[TVIEW],
          component,
          1
          /* Create */
        );
        elementNode.data[FLAGS] &= ~1;
      } finally {
        enterView(oldView, null);
        if (rendererFactory2.end) rendererFactory2.end();
      }
      var componentRef = new ComponentRef$1(this.componentType, component, rootView, injector, hostNode);
      if (isInternalRootView) {
        componentRef.hostView._lViewNode.tNode.child = elementNode.tNode;
      }
      return componentRef;
    };
    return ComponentFactory$$1;
  }(ComponentFactory)
);
var ComponentRef$1 = (
  /** @class */
  function(_super) {
    __extends(ComponentRef$$1, _super);
    function ComponentRef$$1(componentType, instance, rootView, injector, hostNode) {
      var _this = _super.call(this) || this;
      _this.destroyCbs = [];
      _this.instance = instance;
      _this.hostView = _this.changeDetectorRef = new ViewRef$1(rootView, instance);
      _this.hostView._lViewNode = createLNode(-1, 2, null, null, null, rootView);
      _this.injector = injector;
      _this.location = new ElementRef(hostNode);
      _this.componentType = componentType;
      return _this;
    }
    ComponentRef$$1.prototype.destroy = function() {
      ngDevMode && assertDefined(this.destroyCbs, "NgModule already destroyed");
      this.destroyCbs.forEach(function(fn) {
        return fn();
      });
      this.destroyCbs = null;
    };
    ComponentRef$$1.prototype.onDestroy = function(callback) {
      ngDevMode && assertDefined(this.destroyCbs, "NgModule already destroyed");
      this.destroyCbs.push(callback);
    };
    return ComponentRef$$1;
  }(ComponentRef)
);
function getOrCreateNodeInjectorForNode(node) {
  var nodeInjector = node.nodeInjector;
  var parent = getParentLNode(node);
  var parentInjector = parent && parent.nodeInjector;
  if (nodeInjector != parentInjector) {
    return nodeInjector;
  }
  return node.nodeInjector = {
    parent: parentInjector,
    node,
    bf0: 0,
    bf1: 0,
    bf2: 0,
    bf3: 0,
    bf4: 0,
    bf5: 0,
    bf6: 0,
    bf7: 0,
    cbf0: parentInjector == null ? 0 : parentInjector.cbf0 | parentInjector.bf0,
    cbf1: parentInjector == null ? 0 : parentInjector.cbf1 | parentInjector.bf1,
    cbf2: parentInjector == null ? 0 : parentInjector.cbf2 | parentInjector.bf2,
    cbf3: parentInjector == null ? 0 : parentInjector.cbf3 | parentInjector.bf3,
    cbf4: parentInjector == null ? 0 : parentInjector.cbf4 | parentInjector.bf4,
    cbf5: parentInjector == null ? 0 : parentInjector.cbf5 | parentInjector.bf5,
    cbf6: parentInjector == null ? 0 : parentInjector.cbf6 | parentInjector.bf6,
    cbf7: parentInjector == null ? 0 : parentInjector.cbf7 | parentInjector.bf7,
    templateRef: null,
    viewContainerRef: null,
    elementRef: null,
    changeDetectorRef: null
  };
}
var componentFactoryResolver = new ComponentFactoryResolver$1();
var ReadFromInjectorFn = (
  /** @class */
  /* @__PURE__ */ function() {
    function ReadFromInjectorFn2(read) {
      this.read = read;
    }
    return ReadFromInjectorFn2;
  }()
);
var ViewContainerRef$1 = (
  /** @class */
  function() {
    function ViewContainerRef2(_lContainerNode) {
      this._lContainerNode = _lContainerNode;
      this._viewRefs = [];
    }
    ViewContainerRef2.prototype.clear = function() {
      var lContainer = this._lContainerNode.data;
      while (lContainer[VIEWS].length) {
        this.remove(0);
      }
    };
    ViewContainerRef2.prototype.get = function(index) {
      return this._viewRefs[index] || null;
    };
    Object.defineProperty(ViewContainerRef2.prototype, "length", {
      get: function() {
        var lContainer = this._lContainerNode.data;
        return lContainer[VIEWS].length;
      },
      enumerable: true,
      configurable: true
    });
    ViewContainerRef2.prototype.createEmbeddedView = function(templateRef, context, index) {
      var adjustedIdx = this._adjustIndex(index);
      var viewRef = templateRef.createEmbeddedView(context || {}, this._lContainerNode, adjustedIdx);
      viewRef.attachToViewContainerRef(this);
      this._viewRefs.splice(adjustedIdx, 0, viewRef);
      return viewRef;
    };
    ViewContainerRef2.prototype.createComponent = function(componentFactory, index, injector, projectableNodes, ngModuleRef) {
      var contextInjector = injector || this.parentInjector;
      if (!ngModuleRef && contextInjector) {
        ngModuleRef = contextInjector.get(NgModuleRef);
      }
      var componentRef = componentFactory.create(contextInjector, projectableNodes, void 0, ngModuleRef);
      this.insert(componentRef.hostView, index);
      return componentRef;
    };
    ViewContainerRef2.prototype.insert = function(viewRef, index) {
      if (viewRef.destroyed) {
        throw new Error("Cannot insert a destroyed View in a ViewContainer!");
      }
      var lViewNode = viewRef._lViewNode;
      var adjustedIdx = this._adjustIndex(index);
      insertView(this._lContainerNode, lViewNode, adjustedIdx);
      var views = this._lContainerNode.data[VIEWS];
      var beforeNode = adjustedIdx + 1 < views.length ? getChildLNode(views[adjustedIdx + 1]).native : this._lContainerNode.native;
      addRemoveViewFromContainer(this._lContainerNode, lViewNode, true, beforeNode);
      viewRef.attachToViewContainerRef(this);
      this._viewRefs.splice(adjustedIdx, 0, viewRef);
      return viewRef;
    };
    ViewContainerRef2.prototype.move = function(viewRef, newIndex) {
      var index = this.indexOf(viewRef);
      this.detach(index);
      this.insert(viewRef, this._adjustIndex(newIndex));
      return viewRef;
    };
    ViewContainerRef2.prototype.indexOf = function(viewRef) {
      return this._viewRefs.indexOf(viewRef);
    };
    ViewContainerRef2.prototype.remove = function(index) {
      var adjustedIdx = this._adjustIndex(index, -1);
      removeView(this._lContainerNode, adjustedIdx);
      this._viewRefs.splice(adjustedIdx, 1);
    };
    ViewContainerRef2.prototype.detach = function(index) {
      var adjustedIdx = this._adjustIndex(index, -1);
      var lViewNode = detachView(this._lContainerNode, adjustedIdx);
      return this._viewRefs.splice(adjustedIdx, 1)[0] || null;
    };
    ViewContainerRef2.prototype._adjustIndex = function(index, shift) {
      if (shift === void 0) {
        shift = 0;
      }
      if (index == null) {
        return this._lContainerNode.data[VIEWS].length + shift;
      }
      if (ngDevMode) {
        assertGreaterThan(index, -1, "index must be positive");
        assertLessThan(index, this._lContainerNode.data[VIEWS].length + 1 + shift, "index");
      }
      return index;
    };
    return ViewContainerRef2;
  }()
);
var TemplateRef$1 = (
  /** @class */
  function() {
    function TemplateRef2(elementRef, _tView, _renderer, _queries) {
      this._tView = _tView;
      this._renderer = _renderer;
      this._queries = _queries;
      this.elementRef = elementRef;
    }
    TemplateRef2.prototype.createEmbeddedView = function(context, containerNode, index) {
      var viewNode = createEmbeddedViewNode(this._tView, context, this._renderer, this._queries);
      if (containerNode) {
        insertView(containerNode, viewNode, index);
      }
      renderEmbeddedTemplate(
        viewNode,
        this._tView,
        context,
        1
        /* Create */
      );
      var viewRef = new ViewRef$1(viewNode.data, context);
      viewRef._lViewNode = viewNode;
      return viewRef;
    };
    return TemplateRef2;
  }()
);
var COMPONENT_FACTORY_RESOLVER = {
  provide: ComponentFactoryResolver,
  useFactory: function() {
    return new ComponentFactoryResolver$1();
  },
  deps: []
};
var NgModuleRef$1 = (
  /** @class */
  function(_super) {
    __extends(NgModuleRef$$1, _super);
    function NgModuleRef$$1(ngModuleType, parentInjector) {
      var _this = _super.call(this) || this;
      _this._bootstrapComponents = [];
      _this.destroyCbs = [];
      var ngModuleDef = ngModuleType.ngModuleDef;
      ngDevMode && assertDefined(ngModuleDef, "NgModule '" + stringify(ngModuleType) + "' is not a subtype of 'NgModuleType'.");
      _this._bootstrapComponents = ngModuleDef.bootstrap;
      var additionalProviders = [COMPONENT_FACTORY_RESOLVER, {
        provide: NgModuleRef,
        useValue: _this
      }];
      _this.injector = createInjector(ngModuleType, parentInjector, additionalProviders);
      _this.instance = _this.injector.get(ngModuleType);
      _this.componentFactoryResolver = new ComponentFactoryResolver$1();
      return _this;
    }
    NgModuleRef$$1.prototype.destroy = function() {
      ngDevMode && assertDefined(this.destroyCbs, "NgModule already destroyed");
      this.destroyCbs.forEach(function(fn) {
        return fn();
      });
      this.destroyCbs = null;
    };
    NgModuleRef$$1.prototype.onDestroy = function(callback) {
      ngDevMode && assertDefined(this.destroyCbs, "NgModule already destroyed");
      this.destroyCbs.push(callback);
    };
    return NgModuleRef$$1;
  }(NgModuleRef)
);
var NgModuleFactory$1 = (
  /** @class */
  function(_super) {
    __extends(NgModuleFactory$$1, _super);
    function NgModuleFactory$$1(moduleType) {
      var _this = _super.call(this) || this;
      _this.moduleType = moduleType;
      return _this;
    }
    NgModuleFactory$$1.prototype.create = function(parentInjector) {
      return new NgModuleRef$1(this.moduleType, parentInjector);
    };
    return NgModuleFactory$$1;
  }(NgModuleFactory)
);
var LQueries_ = (
  /** @class */
  function() {
    function LQueries_2(deep) {
      this.shallow = null;
      this.deep = null;
      this.deep = deep == null ? null : deep;
    }
    LQueries_2.prototype.track = function(queryList, predicate, descend, read) {
      if (descend) {
        this.deep = createQuery$1(this.deep, queryList, predicate, read != null ? read : null);
      } else {
        this.shallow = createQuery$1(this.shallow, queryList, predicate, read != null ? read : null);
      }
    };
    LQueries_2.prototype.clone = function() {
      return this.deep ? new LQueries_2(this.deep) : null;
    };
    LQueries_2.prototype.child = function() {
      if (this.deep === null) {
        return null;
      }
      if (this.shallow === null) {
        return this;
      } else {
        return new LQueries_2(this.deep);
      }
    };
    LQueries_2.prototype.container = function() {
      var result = null;
      var query = this.deep;
      while (query) {
        var containerValues = [];
        query.values.push(containerValues);
        var clonedQuery = {
          next: null,
          list: query.list,
          predicate: query.predicate,
          values: containerValues,
          containerValues: null
        };
        clonedQuery.next = result;
        result = clonedQuery;
        query = query.next;
      }
      return result ? new LQueries_2(result) : null;
    };
    LQueries_2.prototype.createView = function() {
      var result = null;
      var query = this.deep;
      while (query) {
        var clonedQuery = {
          next: null,
          list: query.list,
          predicate: query.predicate,
          values: [],
          containerValues: query.values
        };
        clonedQuery.next = result;
        result = clonedQuery;
        query = query.next;
      }
      return result ? new LQueries_2(result) : null;
    };
    LQueries_2.prototype.insertView = function(index) {
      var query = this.deep;
      while (query) {
        ngDevMode && assertDefined(query.containerValues, "View queries need to have a pointer to container values.");
        query.containerValues.splice(index, 0, query.values);
        query = query.next;
      }
    };
    LQueries_2.prototype.addNode = function(node) {
      add(this.shallow, node);
      add(this.deep, node);
    };
    LQueries_2.prototype.removeView = function() {
      var query = this.deep;
      while (query) {
        ngDevMode && assertDefined(query.containerValues, "View queries need to have a pointer to container values.");
        var containerValues = query.containerValues;
        var viewValuesIdx = containerValues.indexOf(query.values);
        var removed = containerValues.splice(viewValuesIdx, 1);
        ngDevMode && assertEqual(removed.length, 1, "removed.length");
        if (removed[0].length) {
          query.list.setDirty();
        }
        query = query.next;
      }
    };
    return LQueries_2;
  }()
);
function getIdxOfMatchingSelector(tNode, selector) {
  var localNames = tNode.localNames;
  if (localNames) {
    for (var i = 0; i < localNames.length; i += 2) {
      if (localNames[i] === selector) {
        return localNames[i + 1];
      }
    }
  }
  return null;
}
function getIdxOfMatchingDirective(node, type) {
  var defs = node.view[TVIEW].directives;
  var flags = node.tNode.flags;
  var count2 = flags & 4095;
  var start = flags >> 14;
  var end = start + count2;
  for (var i = start; i < end; i++) {
    var def = defs[i];
    if (def.type === type && def.diPublic) {
      return i;
    }
  }
  return null;
}
function readFromNodeInjector(nodeInjector, node, read, directiveIdx) {
  if (read instanceof ReadFromInjectorFn) {
    return read.read(nodeInjector, node, directiveIdx);
  } else {
    var matchingIdx = getIdxOfMatchingDirective(node, read);
    if (matchingIdx !== null) {
      return node.view[DIRECTIVES][matchingIdx];
    }
  }
  return null;
}
function add(query, node) {
  var nodeInjector = getOrCreateNodeInjectorForNode(node);
  while (query) {
    var predicate = query.predicate;
    var type = predicate.type;
    if (type) {
      var directiveIdx = getIdxOfMatchingDirective(node, type);
      if (directiveIdx !== null) {
        var result = readFromNodeInjector(nodeInjector, node, predicate.read || type, directiveIdx);
        if (result !== null) {
          addMatch(query, result);
        }
      }
    } else {
      var selector = predicate.selector;
      for (var i = 0; i < selector.length; i++) {
        var directiveIdx = getIdxOfMatchingSelector(node.tNode, selector[i]);
        if (directiveIdx !== null) {
          ngDevMode && assertDefined(predicate.read, "the node should have a predicate");
          var result = readFromNodeInjector(nodeInjector, node, predicate.read, directiveIdx);
          if (result !== null) {
            addMatch(query, result);
          }
        }
      }
    }
    query = query.next;
  }
}
function addMatch(query, matchingValue) {
  query.values.push(matchingValue);
  query.list.setDirty();
}
function createPredicate(predicate, read) {
  var isArray2 = Array.isArray(predicate);
  return {
    type: isArray2 ? null : predicate,
    selector: isArray2 ? predicate : null,
    read
  };
}
function createQuery$1(previous, queryList, predicate, read) {
  return {
    next: previous,
    list: queryList,
    predicate: createPredicate(predicate, read),
    values: queryList._valuesTree,
    containerValues: null
  };
}
var QueryList_ = (
  /** @class */
  function() {
    function QueryList_2() {
      this.dirty = true;
      this.changes = new EventEmitter();
      this._values = [];
      this._valuesTree = [];
    }
    Object.defineProperty(QueryList_2.prototype, "length", {
      get: function() {
        return this._values.length;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(QueryList_2.prototype, "first", {
      get: function() {
        var values = this._values;
        return values.length ? values[0] : null;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(QueryList_2.prototype, "last", {
      get: function() {
        var values = this._values;
        return values.length ? values[values.length - 1] : null;
      },
      enumerable: true,
      configurable: true
    });
    QueryList_2.prototype.map = function(fn) {
      return this._values.map(fn);
    };
    QueryList_2.prototype.filter = function(fn) {
      return this._values.filter(fn);
    };
    QueryList_2.prototype.find = function(fn) {
      return this._values.find(fn);
    };
    QueryList_2.prototype.reduce = function(fn, init) {
      return this._values.reduce(fn, init);
    };
    QueryList_2.prototype.forEach = function(fn) {
      this._values.forEach(fn);
    };
    QueryList_2.prototype.some = function(fn) {
      return this._values.some(fn);
    };
    QueryList_2.prototype.toArray = function() {
      return this._values.slice(0);
    };
    QueryList_2.prototype[getSymbolIterator2()] = function() {
      return this._values[getSymbolIterator2()]();
    };
    QueryList_2.prototype.toString = function() {
      return this._values.toString();
    };
    QueryList_2.prototype.reset = function(res) {
      this._values = flatten$1(res);
      this.dirty = false;
    };
    QueryList_2.prototype.notifyOnChanges = function() {
      this.changes.emit(this);
    };
    QueryList_2.prototype.setDirty = function() {
      this.dirty = true;
    };
    QueryList_2.prototype.destroy = function() {
      this.changes.complete();
      this.changes.unsubscribe();
    };
    return QueryList_2;
  }()
);

// ../../../../node_modules/angular-highcharts/angular-highcharts.es5.js
var Chart = (
  /** @class */
  function() {
    function Chart2(options) {
      if (options === void 0) {
        options = {
          series: []
        };
      }
      this.options = options;
      this.refSubject = new AsyncSubject();
      this.ref$ = this.refSubject.asObservable();
    }
    Chart2.prototype.addPoint = /**
    * Add Point
    * \@memberof Chart
    * @param {?} point         Highcharts.DataPoint, number touple or number
    * @param {?=} serieIndex    Index position of series. This defaults to 0.
    * @param {?=} redraw        Flag whether or not to redraw point. This defaults to true.
    * @param {?=} shift         Shift point to the start of series. This defaults to false.
    * @return {?}
    */
    function(point, serieIndex, redraw, shift) {
      if (serieIndex === void 0) {
        serieIndex = 0;
      }
      if (redraw === void 0) {
        redraw = true;
      }
      if (shift === void 0) {
        shift = false;
      }
      this.ref$.subscribe(function(chart$$1) {
        if (chart$$1.series.length > serieIndex) {
          chart$$1.series[serieIndex].addPoint(point, redraw, shift);
        }
      });
    };
    Chart2.prototype.addSerie = /**
    * Add Series
    * \@memberof Chart
    * @param {?} serie         Series Configuration
    * @param {?=} redraw        Flag whether or not to redraw series. This defaults to true.
    * @param {?=} animation     Whether to apply animation, and optionally animation configuration. This defaults to false.
    * @return {?}
    */
    function(serie, redraw, animation) {
      if (redraw === void 0) {
        redraw = true;
      }
      if (animation === void 0) {
        animation = false;
      }
      this.ref$.subscribe(function(chart$$1) {
        chart$$1.addSeries(serie, redraw, animation);
      });
    };
    Chart2.prototype.removePoint = /**
    * Remove Point
    * \@memberof Chart
    * @param {?} pointIndex    Index of Point
    * @param {?=} serieIndex    Specified Index of Series. Defaults to 0.
    * @return {?}
    */
    function(pointIndex, serieIndex) {
      if (serieIndex === void 0) {
        serieIndex = 0;
      }
      this.ref$.subscribe(function(chart$$1) {
        if (chart$$1.series.length > serieIndex && chart$$1.series[serieIndex].data.length > pointIndex) {
          chart$$1.series[serieIndex].removePoint(pointIndex, true);
        }
      });
    };
    Chart2.prototype.removeSerie = /**
    * Remove Series
    * \@memberof Chart
    * @param {?} serieIndex    Index position of series to remove.
    * @return {?}
    */
    function(serieIndex) {
      this.ref$.subscribe(function(chart$$1) {
        if (chart$$1.series.length > serieIndex) {
          chart$$1.series[serieIndex].remove(true);
        }
      });
    };
    Chart2.prototype.init = /**
    * @param {?} el
    * @return {?}
    */
    function(el) {
      var _this = this;
      (0, import_highcharts.chart)(el.nativeElement, this.options, function(chart$$1) {
        _this.refSubject.next(chart$$1);
        _this.ref = chart$$1;
        _this.refSubject.complete();
      });
    };
    Chart2.prototype.destroy = /**
    * @return {?}
    */
    function() {
      if (this.ref) {
        this.options = this.ref.options;
        this.ref.destroy();
        this.ref = void 0;
        this.refSubject = new AsyncSubject();
        this.ref$ = this.refSubject.asObservable();
      }
    };
    return Chart2;
  }()
);
var MapChart = (
  /** @class */
  function() {
    function MapChart2(options) {
      this.options = options;
      this.refSubject = new AsyncSubject();
      this.ref$ = this.refSubject.asObservable();
    }
    MapChart2.prototype.init = /**
    * @param {?} el
    * @return {?}
    */
    function(el) {
      var _this = this;
      (0, import_highcharts.mapChart)(el.nativeElement, this.options, function(chart$$1) {
        _this.refSubject.next(chart$$1);
        _this.ref = chart$$1;
        _this.refSubject.complete();
      });
    };
    MapChart2.prototype.destroy = /**
    * @return {?}
    */
    function() {
      if (this.ref) {
        this.options = this.ref.options;
        this.ref.destroy();
        this.ref = void 0;
        this.refSubject = new AsyncSubject();
        this.ref$ = this.refSubject.asObservable();
      }
    };
    return MapChart2;
  }()
);
var StockChart = (
  /** @class */
  function() {
    function StockChart2(options) {
      if (options === void 0) {
        options = {
          series: []
        };
      }
      this.options = options;
      this.refSubject = new AsyncSubject();
      this.ref$ = this.refSubject.asObservable();
    }
    StockChart2.prototype.init = /**
    * @param {?} el
    * @return {?}
    */
    function(el) {
      var _this = this;
      (0, import_highcharts.stockChart)(el.nativeElement, this.options, function(chart$$1) {
        _this.refSubject.next(chart$$1);
        _this.ref = chart$$1;
        _this.refSubject.complete();
      });
    };
    StockChart2.prototype.destroy = /**
    * @return {?}
    */
    function() {
      if (this.ref) {
        this.options = this.ref.options;
        this.ref.destroy();
        this.ref = void 0;
        this.refSubject = new AsyncSubject();
        this.ref$ = this.refSubject.asObservable();
      }
    };
    return StockChart2;
  }()
);
var ChartDirective = (
  /** @class */
  function() {
    function ChartDirective2(el) {
      this.el = el;
    }
    ChartDirective2.prototype.ngOnChanges = /**
    * @param {?} changes
    * @return {?}
    */
    function(changes) {
      if (!changes["chart"].isFirstChange()) {
        this.destroy();
        this.init();
      }
    };
    ChartDirective2.prototype.ngOnInit = /**
    * @return {?}
    */
    function() {
      this.init();
    };
    ChartDirective2.prototype.ngOnDestroy = /**
    * @return {?}
    */
    function() {
      this.destroy();
    };
    ChartDirective2.prototype.init = /**
    * @return {?}
    */
    function() {
      if (this.chart instanceof Chart || this.chart instanceof StockChart || this.chart instanceof MapChart) {
        this.chart.init(this.el);
      }
    };
    ChartDirective2.prototype.destroy = /**
    * @return {?}
    */
    function() {
      if (this.chart instanceof Chart || this.chart instanceof StockChart || this.chart instanceof MapChart) {
        this.chart.destroy();
      }
    };
    ChartDirective2.decorators = [{
      type: Directive,
      args: [{
        selector: "[chart]"
      }]
    }];
    ChartDirective2.ctorParameters = function() {
      return [{
        type: ElementRef
      }];
    };
    ChartDirective2.propDecorators = {
      chart: [{
        type: Input
      }]
    };
    return ChartDirective2;
  }()
);
var HIGHCHARTS_MODULES = new InjectionToken("HighchartsModules");
var ChartService = (
  /** @class */
  function() {
    function ChartService2(chartModules) {
      this.chartModules = chartModules;
    }
    ChartService2.prototype.initModules = /**
    * @return {?}
    */
    function() {
      this.chartModules.forEach(function(chartModule) {
        chartModule(Highcharts);
      });
    };
    ChartService2.decorators = [{
      type: Injectable
    }];
    ChartService2.ctorParameters = function() {
      return [{
        type: Array,
        decorators: [{
          type: Inject,
          args: [HIGHCHARTS_MODULES]
        }]
      }];
    };
    return ChartService2;
  }()
);
var ɵ0 = [];
var ChartModule = (
  /** @class */
  function() {
    function ChartModule2(cs) {
      this.cs = cs;
      this.cs.initModules();
    }
    ChartModule2.decorators = [{
      type: NgModule,
      args: [{
        exports: [ChartDirective],
        declarations: [ChartDirective],
        providers: [{
          provide: HIGHCHARTS_MODULES,
          useValue: ɵ0
        }, ChartService]
      }]
    }];
    ChartModule2.ctorParameters = function() {
      return [{
        type: ChartService
      }];
    };
    return ChartModule2;
  }()
);
export {
  Chart,
  ChartModule,
  HIGHCHARTS_MODULES,
  Highcharts,
  MapChart,
  StockChart,
  ChartService as ɵa,
  ChartDirective as ɵb
};
/*! Bundled license information:

tslib/tslib.es6.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** *)

@angular/core/fesm5/core.js:
  (**
   * @license Angular v6.1.10
   * (c) 2010-2018 Google, Inc. https://angular.io/
   * License: MIT
   *)
  (**
   * @license
   * Copyright Google Inc. All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.io/license
   *)

@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
@angular/core/fesm5/core.js:
  (**
   * @license
   * Copyright Google Inc. All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.io/license
   *)

angular-highcharts/angular-highcharts.es5.js:
  (**
   * @license
   * Copyright Felix Itzenplitz. All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at
   * https://github.com/cebor/angular-highcharts/blob/master/LICENSE
   *)
  (**
   * @license
   * Copyright Felix Itzenplitz. All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at
   * https://github.com/cebor/angular-highcharts/blob/master/LICENSE
   *
   * @author Felix Itzenplitz
   * @author Timothy A. Perez (contributor)
   *)
*/
//# sourceMappingURL=angular-highcharts.js.map
