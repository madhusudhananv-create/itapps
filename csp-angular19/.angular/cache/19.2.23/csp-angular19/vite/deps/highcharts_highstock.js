import {
  __commonJS,
  __spreadProps,
  __spreadValues
} from "./chunk-WOR4A3D2.js";

// node_modules/highcharts/highstock.js
var require_highstock = __commonJS({
  "node_modules/highcharts/highstock.js"(exports, module) {
    !/**
    * Highchart Stock v12.5.0 (2026-01-12)
    * @module highcharts/highstock
    *
    * (c) 2009-2026 Highsoft AS
    *
    * A commercial license may be required depending on use.
    * See www.highcharts.com/license
    */
    function(t, e) {
      "object" == typeof exports && "object" == typeof module ? (t._Highcharts = e(), module.exports = t._Highcharts) : "function" == typeof define && define.amd ? define("highcharts/highcharts", [], e) : "object" == typeof exports ? (t._Highcharts = e(), exports.highcharts = t._Highcharts) : (t.Highcharts && t.Highcharts.error(16, true), t.Highcharts = e());
    }("u" < typeof window ? exports : window, () => (() => {
      "use strict";
      let t, e, i, s, o, r, a, n, h, l;
      var d, c, p, u, g, f, m, x, y, b, v, k, M, w, S, A, T, C, P, O, E, L, B, D, I, z, R, N, W, G, X, H, F, Y, j = {};
      j.d = (t10, e10) => {
        for (var i10 in e10) j.o(e10, i10) && !j.o(t10, i10) && Object.defineProperty(t10, i10, {
          enumerable: true,
          get: e10[i10]
        });
      }, j.o = (t10, e10) => Object.prototype.hasOwnProperty.call(t10, e10);
      var U = {};
      j.d(U, {
        default: () => gm
      }), (d = v || (v = {})).SVG_NS = "http://www.w3.org/2000/svg", d.product = "Highcharts", d.version = "12.5.0", d.win = "u" > typeof window ? window : {}, d.doc = d.win.document, d.svg = !!d.doc?.createElementNS?.(d.SVG_NS, "svg")?.createSVGRect, d.pageLang = d.doc?.documentElement?.closest("[lang]")?.lang, d.userAgent = d.win.navigator?.userAgent || "", d.isChrome = d.win.chrome, d.isFirefox = -1 !== d.userAgent.indexOf("Firefox"), d.isMS = /(edge|msie|trident)/i.test(d.userAgent) && !d.win.opera, d.isSafari = !d.isChrome && -1 !== d.userAgent.indexOf("Safari"), d.isTouchDevice = /(Mobile|Android|Windows Phone)/.test(d.userAgent), d.isWebKit = -1 !== d.userAgent.indexOf("AppleWebKit"), d.deg2rad = 2 * Math.PI / 360, d.marginNames = ["plotTop", "marginRight", "marginBottom", "plotLeft"], d.noop = function() {
      }, d.supportsPassiveEvents = function() {
        let t10 = false;
        if (!d.isMS) {
          let e10 = Object.defineProperty({}, "passive", {
            get: function() {
              t10 = true;
            }
          });
          d.win.addEventListener && d.win.removeEventListener && (d.win.addEventListener("testPassive", d.noop, e10), d.win.removeEventListener("testPassive", d.noop, e10));
        }
        return t10;
      }(), d.charts = [], d.composed = [], d.dateFormats = {}, d.seriesTypes = {}, d.symbolSizes = {}, d.chartCount = 0;
      let V = v, {
        charts: $,
        doc: _,
        win: Z
      } = V;
      function q(t10, e10, i10, s10) {
        let o10 = e10 ? "Highcharts error" : "Highcharts warning";
        32 === t10 && (t10 = `${o10}: Deprecated member`);
        let r10 = ts(t10), a10 = r10 ? `${o10} #${t10}: www.highcharts.com/errors/${t10}/` : t10.toString();
        if (void 0 !== s10) {
          let t11 = "";
          r10 && (a10 += "?"), tu(s10, function(e11, i11) {
            t11 += `
 - ${i11}: ${e11}`, r10 && (a10 += encodeURI(i11) + "=" + encodeURI(e11));
          }), a10 += t11;
        }
        tf(V, "displayError", {
          chart: i10,
          code: t10,
          message: a10,
          params: s10
        }, function() {
          if (e10) throw Error(a10);
          Z.console && -1 === q.messages.indexOf(a10) && console.warn(a10);
        }), q.messages.push(a10);
      }
      function K(t10, e10) {
        return parseInt(t10, e10 || 10);
      }
      function J(t10) {
        return "string" == typeof t10;
      }
      function Q(t10) {
        let e10 = Object.prototype.toString.call(t10);
        return "[object Array]" === e10 || "[object Array Iterator]" === e10;
      }
      function tt(t10, e10) {
        return !!t10 && "object" == typeof t10 && (!e10 || !Q(t10));
      }
      function te(t10) {
        return tt(t10) && "number" == typeof t10.nodeType;
      }
      function ti(t10) {
        let e10 = t10?.constructor;
        return !!(tt(t10, true) && !te(t10) && e10?.name && "Object" !== e10.name);
      }
      function ts(t10) {
        return "number" == typeof t10 && !isNaN(t10) && t10 < 1 / 0 && t10 > -1 / 0;
      }
      function to(t10) {
        return null != t10;
      }
      function tr(t10, e10, i10) {
        let s10, o10 = J(e10) && !to(i10), r10 = (e11, i11) => {
          to(e11) ? t10.setAttribute(i11, e11) : o10 ? (s10 = t10.getAttribute(i11)) || "class" !== i11 || (s10 = t10.getAttribute(i11 + "Name")) : t10.removeAttribute(i11);
        };
        return J(e10) ? r10(i10, e10) : tu(e10, r10), s10;
      }
      function ta(t10) {
        return Q(t10) ? t10 : [t10];
      }
      function tn(t10, e10) {
        let i10;
        for (i10 in t10 || (t10 = {}), e10) t10[i10] = e10[i10];
        return t10;
      }
      function th() {
        let t10 = arguments, e10 = t10.length;
        for (let i10 = 0; i10 < e10; i10++) {
          let e11 = t10[i10];
          if (null != e11) return e11;
        }
      }
      function tl(t10, e10) {
        tn(t10.style, e10);
      }
      function td(t10) {
        return Math.pow(10, Math.floor(Math.log(t10) / Math.LN10));
      }
      function tc(t10, e10) {
        return t10 > 1e14 ? t10 : parseFloat(t10.toPrecision(e10 || 14));
      }
      (q || (q = {})).messages = [], Math.easeInOutSine = function(t10) {
        return -0.5 * (Math.cos(Math.PI * t10) - 1);
      };
      let tp = Array.prototype.find ? function(t10, e10) {
        return t10.find(e10);
      } : function(t10, e10) {
        let i10, s10 = t10.length;
        for (i10 = 0; i10 < s10; i10++) if (e10(t10[i10], i10)) return t10[i10];
      };
      function tu(t10, e10, i10) {
        for (let s10 in t10) Object.hasOwnProperty.call(t10, s10) && e10.call(i10 || t10[s10], t10[s10], s10, t10);
      }
      function tg(t10, e10, i10) {
        function s10(e11, i11) {
          let s11 = t10.removeEventListener;
          s11 && s11.call(t10, e11, i11, false);
        }
        function o10(i11) {
          let o11, r11;
          t10.nodeName && (e10 ? (o11 = {})[e10] = true : o11 = i11, tu(o11, function(t11, e11) {
            if (i11[e11]) for (r11 = i11[e11].length; r11--; ) s10(e11, i11[e11][r11].fn);
          }));
        }
        let r10 = "function" == typeof t10 && t10.prototype || t10;
        if (Object.hasOwnProperty.call(r10, "hcEvents")) {
          let t11 = r10.hcEvents;
          if (e10) {
            let r11 = t11[e10] || [];
            i10 ? (t11[e10] = r11.filter(function(t12) {
              return i10 !== t12.fn;
            }), s10(e10, i10)) : (o10(t11), t11[e10] = []);
          } else o10(t11), delete r10.hcEvents;
        }
      }
      function tf(t10, e10, i10, s10) {
        if (i10 = i10 || {}, _?.createEvent && (t10.dispatchEvent || t10.fireEvent && t10 !== V)) {
          let s11 = _.createEvent("Events");
          s11.initEvent(e10, true, true), i10 = tn(s11, i10), t10.dispatchEvent ? t10.dispatchEvent(i10) : t10.fireEvent(e10, i10);
        } else if (t10.hcEvents) {
          i10.target || tn(i10, {
            preventDefault: function() {
              i10.defaultPrevented = true;
            },
            target: t10,
            type: e10
          });
          let s11 = [], o10 = t10, r10 = false;
          for (; o10.hcEvents; ) Object.hasOwnProperty.call(o10, "hcEvents") && o10.hcEvents[e10] && (s11.length && (r10 = true), s11.unshift.apply(s11, o10.hcEvents[e10])), o10 = Object.getPrototypeOf(o10);
          r10 && s11.sort((t11, e11) => t11.order - e11.order), s11.forEach((e11) => {
            false === e11.fn.call(t10, i10) && i10.preventDefault();
          });
        }
        s10 && !i10.defaultPrevented && s10.call(t10, i10);
      }
      let tm = (a = Math.random().toString(36).substring(2, 9) + "-", n = 0, function() {
        return "highcharts-" + (t ? "" : a) + n++;
      });
      Z.jQuery && (Z.jQuery.fn.highcharts = function() {
        let t10 = [].slice.call(arguments);
        if (this[0]) return t10[0] ? (new V[J(t10[0]) ? t10.shift() : "Chart"](this[0], t10[0], t10[1]), this) : $[tr(this[0], "data-highcharts-chart")];
      });
      let tx = {
        addEvent: function(t10, e10, i10, s10 = {}) {
          let o10 = "function" == typeof t10 && t10.prototype || t10;
          Object.hasOwnProperty.call(o10, "hcEvents") || (o10.hcEvents = {});
          let r10 = o10.hcEvents;
          V.Point && t10 instanceof V.Point && t10.series && t10.series.chart && (t10.series.chart.runTrackerClick = true);
          let a10 = t10.addEventListener;
          a10 && a10.call(t10, e10, i10, !!V.supportsPassiveEvents && {
            passive: void 0 === s10.passive ? -1 !== e10.indexOf("touch") : s10.passive,
            capture: false
          }), r10[e10] || (r10[e10] = []);
          let n10 = {
            fn: i10,
            order: "number" == typeof s10.order ? s10.order : 1 / 0
          };
          return r10[e10].push(n10), r10[e10].sort((t11, e11) => t11.order - e11.order), function() {
            tg(t10, e10, i10);
          };
        },
        arrayMax: function(t10) {
          let e10 = t10.length, i10 = t10[0];
          for (; e10--; ) t10[e10] > i10 && (i10 = t10[e10]);
          return i10;
        },
        arrayMin: function(t10) {
          let e10 = t10.length, i10 = t10[0];
          for (; e10--; ) t10[e10] < i10 && (i10 = t10[e10]);
          return i10;
        },
        attr: tr,
        clamp: function(t10, e10, i10) {
          return t10 > e10 ? t10 < i10 ? t10 : i10 : e10;
        },
        clearTimeout: function(t10) {
          to(t10) && clearTimeout(t10);
        },
        correctFloat: tc,
        createElement: function(t10, e10, i10, s10, o10) {
          let r10 = _.createElement(t10);
          return e10 && tn(r10, e10), o10 && tl(r10, {
            padding: "0",
            border: "none",
            margin: "0"
          }), i10 && tl(r10, i10), s10 && s10.appendChild(r10), r10;
        },
        crisp: function(t10, e10 = 0, i10) {
          let s10 = e10 % 2 / 2, o10 = i10 ? -1 : 1;
          return (Math.round(t10 * o10 - s10) + s10) * o10;
        },
        css: tl,
        defined: to,
        destroyObjectProperties: function(t10, e10, i10) {
          tu(t10, function(s10, o10) {
            s10 !== e10 && s10?.destroy && s10.destroy(), (s10?.destroy || !i10) && delete t10[o10];
          });
        },
        diffObjects: function(t10, e10, i10, s10) {
          let o10 = {};
          return !function t11(e11, o11, r10, a10) {
            let n10 = i10 ? o11 : e11;
            tu(e11, function(i11, h10) {
              if (!a10 && s10 && s10.indexOf(h10) > -1 && o11[h10]) {
                i11 = ta(i11), r10[h10] = [];
                for (let e12 = 0; e12 < Math.max(i11.length, o11[h10].length); e12++) o11[h10][e12] && (void 0 === i11[e12] ? r10[h10][e12] = o11[h10][e12] : (r10[h10][e12] = {}, t11(i11[e12], o11[h10][e12], r10[h10][e12], a10 + 1)));
              } else tt(i11, true) && !i11.nodeType ? (r10[h10] = Q(i11) ? [] : {}, t11(i11, o11[h10] || {}, r10[h10], a10 + 1), 0 === Object.keys(r10[h10]).length && ("colorAxis" !== h10 || 0 !== a10) && delete r10[h10]) : (e11[h10] !== o11[h10] || h10 in e11 && !(h10 in o11)) && "__proto__" !== h10 && "constructor" !== h10 && (r10[h10] = n10[h10]);
            });
          }(t10, e10, o10, 0), o10;
        },
        discardElement: function(t10) {
          t10?.parentElement?.removeChild(t10);
        },
        erase: function(t10, e10) {
          let i10 = t10.length;
          for (; i10--; ) if (t10[i10] === e10) {
            t10.splice(i10, 1);
            break;
          }
        },
        error: q,
        extend: tn,
        extendClass: function(t10, e10) {
          let i10 = function() {
          };
          return i10.prototype = new t10(), tn(i10.prototype, e10), i10;
        },
        find: tp,
        fireEvent: tf,
        getAlignFactor: (t10 = "") => ({
          center: 0.5,
          right: 1,
          middle: 0.5,
          bottom: 1
        })[t10] || 0,
        getClosestDistance: function(t10, e10) {
          let i10, s10, o10, r10, a10 = !e10;
          return t10.forEach((t11) => {
            if (t11.length > 1) for (r10 = s10 = t11.length - 1; r10 > 0; r10--) (o10 = t11[r10] - t11[r10 - 1]) < 0 && !a10 ? (e10?.(), e10 = void 0) : o10 && (void 0 === i10 || o10 < i10) && (i10 = o10);
          }), i10;
        },
        getMagnitude: td,
        getNestedProperty: function(t10, e10) {
          let i10 = t10.split(".");
          for (; i10.length && to(e10); ) {
            let t11 = i10.shift();
            if (void 0 === t11 || "__proto__" === t11) return;
            if ("this" === t11) {
              let t12;
              return tt(e10) && (t12 = e10["@this"]), t12 ?? e10;
            }
            let s10 = e10[t11.replace(/[\\'"]/g, "")];
            if (!to(s10) || "function" == typeof s10 || "number" == typeof s10.nodeType || s10 === Z) return;
            e10 = s10;
          }
          return e10;
        },
        getStyle: function t10(e10, i10, s10) {
          let o10;
          if ("width" === i10) {
            let i11 = Math.min(e10.offsetWidth, e10.scrollWidth), s11 = e10.getBoundingClientRect?.().width;
            return s11 < i11 && s11 >= i11 - 1 && (i11 = Math.floor(s11)), Math.max(0, i11 - (t10(e10, "padding-left", true) || 0) - (t10(e10, "padding-right", true) || 0));
          }
          if ("height" === i10) return Math.max(0, Math.min(e10.offsetHeight, e10.scrollHeight) - (t10(e10, "padding-top", true) || 0) - (t10(e10, "padding-bottom", true) || 0));
          let r10 = Z.getComputedStyle(e10, void 0);
          return r10 && (o10 = r10.getPropertyValue(i10), th(s10, "opacity" !== i10) && (o10 = K(o10))), o10;
        },
        insertItem: function(t10, e10) {
          let i10, s10 = t10.options.index, o10 = e10.length;
          for (i10 = t10.options.isInternal ? o10 : 0; i10 < o10 + 1; i10++) if (!e10[i10] || ts(s10) && s10 < th(e10[i10].options.index, e10[i10]._i) || e10[i10].options.isInternal) {
            e10.splice(i10, 0, t10);
            break;
          }
          return i10;
        },
        isArray: Q,
        isClass: ti,
        isDOMElement: te,
        isFunction: function(t10) {
          return "function" == typeof t10;
        },
        isNumber: ts,
        isObject: tt,
        isString: J,
        merge: function(t10, ...e10) {
          let i10, s10 = [t10, ...e10], o10 = {}, r10 = function(t11, e11) {
            return "object" != typeof t11 && (t11 = {}), tu(e11, function(i11, s11) {
              "__proto__" !== s11 && "constructor" !== s11 && (!tt(i11, true) || ti(i11) || te(i11) ? t11[s11] = e11[s11] : t11[s11] = r10(t11[s11] || {}, i11));
            }), t11;
          };
          true === t10 && (o10 = s10[1], s10 = Array.prototype.slice.call(s10, 2));
          let a10 = s10.length;
          for (i10 = 0; i10 < a10; i10++) o10 = r10(o10, s10[i10]);
          return o10;
        },
        normalizeTickInterval: function(t10, e10, i10, s10, o10) {
          let r10, a10 = t10;
          i10 = th(i10, td(t10));
          let n10 = t10 / i10;
          for (!e10 && (e10 = o10 ? [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] : [1, 2, 2.5, 5, 10], false === s10 && (1 === i10 ? e10 = e10.filter(function(t11) {
            return t11 % 1 == 0;
          }) : i10 <= 0.1 && (e10 = [1 / i10]))), r10 = 0; r10 < e10.length && (a10 = e10[r10], (!o10 || !(a10 * i10 >= t10)) && (o10 || !(n10 <= (e10[r10] + (e10[r10 + 1] || e10[r10])) / 2))); r10++) ;
          return tc(a10 * i10, -Math.round(Math.log(1e-3) / Math.LN10));
        },
        objectEach: tu,
        offset: function(t10) {
          let e10 = _.documentElement, i10 = t10.parentElement || t10.parentNode ? t10.getBoundingClientRect() : {
            top: 0,
            left: 0,
            width: 0,
            height: 0
          };
          return {
            top: i10.top + (Z.pageYOffset || e10.scrollTop) - (e10.clientTop || 0),
            left: i10.left + (Z.pageXOffset || e10.scrollLeft) - (e10.clientLeft || 0),
            width: i10.width,
            height: i10.height
          };
        },
        pad: function(t10, e10, i10) {
          return Array((e10 || 2) + 1 - String(t10).replace("-", "").length).join(i10 || "0") + t10;
        },
        pick: th,
        pInt: K,
        pushUnique: function(t10, e10) {
          return 0 > t10.indexOf(e10) && !!t10.push(e10);
        },
        relativeLength: function(t10, e10, i10) {
          return /%$/.test(t10) ? e10 * parseFloat(t10) / 100 + (i10 || 0) : parseFloat(t10);
        },
        removeEvent: tg,
        replaceNested: function(t10, ...e10) {
          let i10, s10;
          do
            for (s10 of (i10 = t10, e10)) t10 = t10.replace(s10[0], s10[1]);
          while (t10 !== i10);
          return t10;
        },
        splat: ta,
        stableSort: function(t10, e10) {
          let i10, s10, o10 = t10.length;
          for (s10 = 0; s10 < o10; s10++) t10[s10].safeI = s10;
          for (t10.sort(function(t11, s11) {
            return 0 === (i10 = e10(t11, s11)) ? t11.safeI - s11.safeI : i10;
          }), s10 = 0; s10 < o10; s10++) delete t10[s10].safeI;
        },
        syncTimeout: function(t10, e10, i10) {
          return e10 > 0 ? setTimeout(t10, e10, i10) : (t10.call(0, i10), -1);
        },
        timeUnits: {
          millisecond: 1,
          second: 1e3,
          minute: 6e4,
          hour: 36e5,
          day: 864e5,
          week: 6048e5,
          month: 24192e5,
          year: 314496e5
        },
        ucfirst: function(t10) {
          return J(t10) ? t10.substring(0, 1).toUpperCase() + t10.substring(1) : String(t10);
        },
        uniqueKey: tm,
        useSerialIds: function(e10) {
          return t = th(e10, t);
        },
        wrap: function(t10, e10, i10) {
          let s10 = t10[e10];
          t10[e10] = function() {
            let t11 = arguments, e11 = this;
            return i10.apply(this, [function() {
              return s10.apply(e11, arguments.length ? arguments : t11);
            }].concat([].slice.call(arguments)));
          };
        }
      }, {
        pageLang: ty,
        win: tb
      } = V, {
        defined: tv,
        error: tk,
        extend: tM,
        isNumber: tw,
        isObject: tS,
        isString: tA,
        merge: tT,
        objectEach: tC,
        pad: tP,
        splat: tO,
        timeUnits: tE,
        ucfirst: tL
      } = tx, tB = V.isSafari && tb.Intl && !tb.Intl.DateTimeFormat.prototype.formatRange, tD = class {
        constructor(t10, e10) {
          this.options = {
            timezone: "UTC"
          }, this.variableTimezone = false, this.Date = tb.Date, this.update(t10), this.lang = e10;
        }
        update(t10 = {}) {
          this.dTLCache = {}, this.options = t10 = tT(true, this.options, t10);
          let {
            timezoneOffset: e10,
            useUTC: i10,
            locale: s10
          } = t10;
          this.Date = t10.Date || tb.Date || Date;
          let o10 = t10.timezone;
          tv(i10) && (o10 = i10 ? "UTC" : void 0), e10 && e10 % 60 == 0 && (o10 = "Etc/GMT" + (e10 > 0 ? "+" : "") + e10 / 60), this.variableTimezone = "UTC" !== o10 && o10?.indexOf("Etc/GMT") !== 0, this.timezone = o10, this.lang && s10 && (this.lang.locale = s10), ["months", "shortMonths", "weekdays", "shortWeekdays"].forEach((t11) => {
            let e11 = /months/i.test(t11), i11 = /short/.test(t11), s11 = {
              timeZone: "UTC"
            };
            s11[e11 ? "month" : "weekday"] = i11 ? "short" : "long", this[t11] = (e11 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [3, 4, 5, 6, 7, 8, 9]).map((t12) => this.dateFormat(s11, (e11 ? 31 : 1) * 24 * 36e5 * t12));
          });
        }
        toParts(t10) {
          let [e10, i10, s10, o10, r10, a10, n10] = this.dateTimeFormat({
            weekday: "narrow",
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
          }, t10, "es").split(/(?:, | |\/|:)/g);
          return [o10, s10 - 1, i10, r10, a10, n10, Math.floor(Number(t10) || 0) % 1e3, "DLMXJVS".indexOf(e10)].map(Number);
        }
        dateTimeFormat(t10, e10, i10 = this.options.locale || ty) {
          let s10 = JSON.stringify(t10) + i10;
          tA(t10) && (t10 = this.str2dtf(t10));
          let o10 = this.dTLCache[s10];
          if (!o10) {
            t10.timeZone ?? (t10.timeZone = this.timezone);
            try {
              o10 = new Intl.DateTimeFormat(i10, t10);
            } catch (e11) {
              /Invalid time zone/i.test(e11.message) ? (tk(34), t10.timeZone = "UTC", o10 = new Intl.DateTimeFormat(i10, t10)) : tk(e11.message, false);
            }
          }
          return this.dTLCache[s10] = o10, o10?.format(e10) || "";
        }
        str2dtf(t10, e10 = {}) {
          let i10 = {
            L: {
              fractionalSecondDigits: 3
            },
            S: {
              second: "2-digit"
            },
            M: {
              minute: "numeric"
            },
            H: {
              hour: "2-digit"
            },
            k: {
              hour: "numeric"
            },
            E: {
              weekday: "narrow"
            },
            a: {
              weekday: "short"
            },
            A: {
              weekday: "long"
            },
            d: {
              day: "2-digit"
            },
            e: {
              day: "numeric"
            },
            b: {
              month: "short"
            },
            B: {
              month: "long"
            },
            m: {
              month: "2-digit"
            },
            o: {
              month: "numeric"
            },
            y: {
              year: "2-digit"
            },
            Y: {
              year: "numeric"
            }
          };
          return Object.keys(i10).forEach((s10) => {
            -1 !== t10.indexOf(s10) && tM(e10, i10[s10]);
          }), e10;
        }
        makeTime(t10, e10, i10 = 1, s10 = 0, o10, r10, a10) {
          let n10 = this.Date.UTC(t10, e10, i10, s10, o10 || 0, r10 || 0, a10 || 0);
          if ("UTC" !== this.timezone) {
            let t11 = this.getTimezoneOffset(n10);
            if (n10 += t11, -1 !== [2, 3, 8, 9, 10, 11].indexOf(e10) && (s10 < 5 || s10 > 20)) {
              let e11 = this.getTimezoneOffset(n10);
              t11 !== e11 ? n10 += e11 - t11 : t11 - 36e5 !== this.getTimezoneOffset(n10 - 36e5) || tB || (n10 -= 36e5);
            }
          }
          return n10;
        }
        parse(t10) {
          if (!tA(t10)) return t10 ?? void 0;
          let e10 = (t10 = t10.replace(/\//g, "-").replace(/(GMT|UTC)/, "")).indexOf("Z") > -1 || /([+-][0-9]{2}):?[0-9]{2}$/.test(t10), i10 = /^[0-9]{4}-[0-9]{2}(-[0-9]{2}|)$/.test(t10);
          e10 || i10 || (t10 += "Z");
          let s10 = Date.parse(t10);
          if (tw(s10)) return s10 + (!e10 || i10 ? this.getTimezoneOffset(s10) : 0);
        }
        getTimezoneOffset(t10) {
          if ("UTC" !== this.timezone) {
            let [e10, i10, s10, o10, r10 = 0] = this.dateTimeFormat({
              timeZoneName: "shortOffset"
            }, t10, "en").split(/(GMT|:)/).map(Number), a10 = -(60 * (s10 + r10 / 60) * 6e4);
            if (tw(a10)) return a10;
          }
          return 0;
        }
        dateFormat(t10, e10, i10) {
          let s10 = this.lang;
          if (!tv(e10) || isNaN(e10)) return s10?.invalidDate || "";
          if (tA(t10 = t10 ?? "%Y-%m-%d %H:%M:%S")) {
            let i11, o10 = /%\[([a-zA-Z]+)\]/g;
            for (; i11 = o10.exec(t10); ) t10 = t10.replace(i11[0], this.dateTimeFormat(i11[1], e10, s10?.locale));
          }
          if (tA(t10) && -1 !== t10.indexOf("%")) {
            let i11 = this, [o10, r10, a10, n10, h10, l10, d10, c10] = this.toParts(e10), p10 = s10?.weekdays || this.weekdays, u10 = s10?.shortWeekdays || this.shortWeekdays, g2 = s10?.months || this.months, f2 = s10?.shortMonths || this.shortMonths;
            tC(tM({
              a: u10 ? u10[c10] : p10[c10].substr(0, 3),
              A: p10[c10],
              d: tP(a10),
              e: tP(a10, 2, " "),
              w: c10,
              v: s10?.weekFrom ?? "",
              b: f2[r10],
              B: g2[r10],
              m: tP(r10 + 1),
              o: r10 + 1,
              y: o10.toString().substr(2, 2),
              Y: o10,
              H: tP(n10),
              k: n10,
              I: tP(n10 % 12 || 12),
              l: n10 % 12 || 12,
              M: tP(h10),
              p: n10 < 12 ? "AM" : "PM",
              P: n10 < 12 ? "am" : "pm",
              S: tP(l10),
              L: tP(d10, 3)
            }, V.dateFormats), function(s11, o11) {
              if (tA(t10)) for (; -1 !== t10.indexOf("%" + o11); ) t10 = t10.replace("%" + o11, "function" == typeof s11 ? s11.call(i11, e10) : s11);
            });
          } else if (tS(t10)) {
            let i11 = (this.getTimezoneOffset(e10) || 0) / 36e5, s11 = this.timezone || "Etc/GMT" + (i11 >= 0 ? "+" : "") + i11, {
              prefix: o10 = "",
              suffix: r10 = ""
            } = t10;
            t10 = o10 + this.dateTimeFormat(tM({
              timeZone: s11
            }, t10), e10) + r10;
          }
          return i10 ? tL(t10) : t10;
        }
        resolveDTLFormat(t10) {
          return tS(t10, true) ? tS(t10, true) && void 0 === t10.main ? {
            main: t10
          } : t10 : {
            main: (t10 = tO(t10))[0],
            from: t10[1],
            to: t10[2]
          };
        }
        getDateFormat(t10, e10, i10, s10) {
          let o10 = this.dateFormat("%m-%d %H:%M:%S.%L", e10), r10 = "01-01 00:00:00.000", a10 = {
            millisecond: 15,
            second: 12,
            minute: 9,
            hour: 6,
            day: 3
          }, n10 = "millisecond", h10 = n10;
          for (n10 in tE) {
            if (t10 && t10 === tE.week && +this.dateFormat("%w", e10) === i10 && o10.substr(6) === r10.substr(6)) {
              n10 = "week";
              break;
            }
            if (t10 && tE[n10] > t10) {
              n10 = h10;
              break;
            }
            if (a10[n10] && o10.substr(a10[n10]) !== r10.substr(a10[n10])) break;
            "week" !== n10 && (h10 = n10);
          }
          return this.resolveDTLFormat(s10[n10]).main;
        }
      }, {
        defined: tI,
        extend: tz,
        timeUnits: tR
      } = tx, tN = class extends tD {
        getTimeTicks(t10, e10, i10, s10) {
          let o10 = this, r10 = [], a10 = {}, {
            count: n10 = 1,
            unitRange: h10
          } = t10, [l10, d10, c10, p10, u10, g2] = o10.toParts(e10), f2 = (e10 || 0) % 1e3, m2;
          if (s10 ?? (s10 = 1), tI(e10)) {
            if (f2 = h10 >= tR.second ? 0 : n10 * Math.floor(f2 / n10), h10 >= tR.second && (g2 = h10 >= tR.minute ? 0 : n10 * Math.floor(g2 / n10)), h10 >= tR.minute && (u10 = h10 >= tR.hour ? 0 : n10 * Math.floor(u10 / n10)), h10 >= tR.hour && (p10 = h10 >= tR.day ? 0 : n10 * Math.floor(p10 / n10)), h10 >= tR.day && (c10 = h10 >= tR.month ? 1 : Math.max(1, n10 * Math.floor(c10 / n10))), h10 >= tR.month && (d10 = h10 >= tR.year ? 0 : n10 * Math.floor(d10 / n10)), h10 >= tR.year && (l10 -= l10 % n10), h10 === tR.week) {
              n10 && (e10 = o10.makeTime(l10, d10, c10, p10, u10, g2, f2));
              let t12 = this.dateTimeFormat({
                timeZone: this.timezone,
                weekday: "narrow"
              }, e10, "es"), i11 = "DLMXJVS".indexOf(t12);
              c10 += -i11 + s10 + (i11 < s10 ? -7 : 0);
            }
            e10 = o10.makeTime(l10, d10, c10, p10, u10, g2, f2), o10.variableTimezone && tI(i10) && (m2 = i10 - e10 > 4 * tR.month || o10.getTimezoneOffset(e10) !== o10.getTimezoneOffset(i10));
            let t11 = e10, x2 = 1;
            for (; t11 < i10; ) r10.push(t11), h10 === tR.year ? t11 = o10.makeTime(l10 + x2 * n10, 0) : h10 === tR.month ? t11 = o10.makeTime(l10, d10 + x2 * n10) : m2 && (h10 === tR.day || h10 === tR.week) ? t11 = o10.makeTime(l10, d10, c10 + x2 * n10 * (h10 === tR.day ? 1 : 7)) : m2 && h10 === tR.hour && n10 > 1 ? t11 = o10.makeTime(l10, d10, c10, p10 + x2 * n10) : t11 += h10 * n10, x2++;
            r10.push(t11), h10 <= tR.hour && r10.length < 1e4 && r10.forEach((t12) => {
              t12 % 18e5 == 0 && "000000000" === o10.dateFormat("%H%M%S%L", t12) && (a10[t12] = "day");
            });
          }
          return r10.info = tz(t10, {
            higherRanks: a10,
            totalRange: h10 * n10
          }), r10;
        }
      }, {
        isTouchDevice: tW
      } = V, {
        fireEvent: tG,
        merge: tX
      } = tx, tH = {
        colors: ["#2caffe", "#544fc5", "#00e272", "#fe6a35", "#6b8abc", "#d568fb", "#2ee0ca", "#fa4b42", "#feb56a", "#91e8e1"],
        symbols: ["circle", "diamond", "square", "triangle", "triangle-down"],
        lang: {
          weekFrom: "week from",
          chartTitle: "Chart title",
          locale: void 0,
          loading: "Loading...",
          months: void 0,
          seriesName: "Series {add index 1}",
          shortMonths: void 0,
          weekdays: void 0,
          numericSymbols: ["k", "M", "G", "T", "P", "E"],
          pieSliceName: "Slice",
          resetZoom: "Reset zoom",
          yAxisTitle: "Values",
          resetZoomTitle: "Reset zoom level 1:1"
        },
        global: {
          buttonTheme: {
            fill: "#f7f7f7",
            padding: 8,
            r: 2,
            stroke: "#cccccc",
            "stroke-width": 1,
            style: {
              color: "#333333",
              cursor: "pointer",
              fontSize: "0.8em",
              fontWeight: "normal"
            },
            states: {
              hover: {
                fill: "#e6e6e6"
              },
              select: {
                fill: "#e6e9ff",
                style: {
                  color: "#000000",
                  fontWeight: "bold"
                }
              },
              disabled: {
                style: {
                  color: "#cccccc"
                }
              }
            }
          }
        },
        time: {
          Date: void 0,
          timezone: "UTC",
          timezoneOffset: 0,
          useUTC: void 0
        },
        chart: {
          alignThresholds: false,
          panning: {
            enabled: false,
            type: "x"
          },
          styledMode: false,
          borderRadius: 0,
          colorCount: 10,
          allowMutatingData: true,
          ignoreHiddenSeries: true,
          spacing: [10, 10, 15, 10],
          resetZoomButton: {
            theme: {},
            position: {}
          },
          reflow: true,
          type: "line",
          zooming: {
            singleTouch: false,
            resetButton: {
              theme: {
                zIndex: 6
              },
              position: {
                align: "right",
                x: -10,
                y: 10
              }
            }
          },
          width: null,
          height: null,
          borderColor: "#334eff",
          backgroundColor: "#ffffff",
          plotBorderColor: "#cccccc"
        },
        title: {
          style: {
            color: "#333333",
            fontWeight: "bold"
          },
          text: "Chart title",
          margin: 15,
          minScale: 0.67
        },
        subtitle: {
          style: {
            color: "#666666",
            fontSize: "0.8em"
          },
          text: ""
        },
        caption: {
          margin: 15,
          style: {
            color: "#666666",
            fontSize: "0.8em"
          },
          text: "",
          align: "left",
          verticalAlign: "bottom"
        },
        plotOptions: {},
        legend: {
          enabled: true,
          align: "center",
          alignColumns: true,
          className: "highcharts-no-tooltip",
          events: {},
          layout: "horizontal",
          itemMarginBottom: 2,
          itemMarginTop: 2,
          labelFormatter: function() {
            return this.name;
          },
          borderColor: "#999999",
          borderRadius: 0,
          navigation: {
            style: {
              fontSize: "0.8em"
            },
            activeColor: "#0022ff",
            inactiveColor: "#cccccc"
          },
          itemStyle: {
            color: "#333333",
            cursor: "pointer",
            fontSize: "0.8em",
            textDecoration: "none",
            textOverflow: "ellipsis"
          },
          itemHoverStyle: {
            color: "#000000"
          },
          itemHiddenStyle: {
            color: "#666666",
            textDecoration: "line-through"
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
              color: "#333333",
              fontSize: "0.8em",
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
          animation: {
            duration: 300,
            easing: (t10) => Math.sqrt(1 - Math.pow(t10 - 1, 2))
          },
          borderRadius: 3,
          dateTimeLabelFormats: {
            millisecond: "%[AebHMSL]",
            second: "%[AebHMS]",
            minute: "%[AebHM]",
            hour: "%[AebHM]",
            day: "%[AebY]",
            week: "%v %[AebY]",
            month: "%[BY]",
            year: "%Y"
          },
          footerFormat: "",
          headerShape: "callout",
          hideDelay: 500,
          padding: 8,
          position: {
            x: 0,
            y: 3
          },
          shared: false,
          snap: tW ? 25 : 10,
          headerFormat: '<span style="font-size: 0.8em">{ucfirst point.key}</span><br/>',
          pointFormat: '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y}</b><br/>',
          backgroundColor: "#ffffff",
          borderWidth: void 0,
          stickOnContact: false,
          style: {
            color: "#333333",
            cursor: "default",
            fontSize: "0.8em"
          },
          useHTML: false
        },
        credits: {
          enabled: true,
          href: "https://www.highcharts.com?credits",
          position: {
            align: "right",
            x: -10,
            verticalAlign: "bottom",
            y: -5
          },
          style: {
            cursor: "pointer",
            color: "#999999",
            fontSize: "0.6em"
          },
          text: "Highcharts.com"
        }
      }, tF = new tN(tH.time, tH.lang), tY = {
        defaultOptions: tH,
        defaultTime: tF,
        getOptions: function() {
          return tH;
        },
        setOptions: function(t10) {
          return tG(V, "setOptions", {
            options: t10
          }), tX(true, tH, t10), t10.time && tF.update(tH.time), t10.lang && "locale" in t10.lang && tF.update({
            locale: t10.lang.locale
          }), t10.lang?.chartTitle && (tH.title = __spreadProps(__spreadValues({}, tH.title), {
            text: t10.lang.chartTitle
          })), tH;
        }
      }, {
        win: tj
      } = V, {
        isNumber: tU,
        isString: tV,
        merge: t$,
        pInt: t_,
        defined: tZ
      } = tx, tq = (t10, e10, i10) => `color-mix(in srgb,${t10},${e10} ${100 * i10}%)`, tK = (t10) => tV(t10) && !!t10 && "none" !== t10;
      class tJ {
        static parse(t10) {
          return t10 ? new tJ(t10) : tJ.None;
        }
        constructor(t10) {
          let e10, i10, s10, o10;
          this.rgba = [NaN, NaN, NaN, NaN], this.input = t10;
          const r10 = V.Color;
          if (r10 && r10 !== tJ) return new r10(t10);
          if ("object" == typeof t10 && void 0 !== t10.stops) this.stops = t10.stops.map((t11) => new tJ(t11[1]));
          else if ("string" == typeof t10) for (this.input = t10 = tJ.names[t10.toLowerCase()] || t10, s10 = tJ.parsers.length; s10-- && !i10; ) (e10 = (o10 = tJ.parsers[s10]).regex.exec(t10)) && (i10 = o10.parse(e10));
          i10 && (this.rgba = i10);
        }
        get(t10) {
          let e10 = this.input, i10 = this.rgba;
          if (this.output) return this.output;
          if ("object" == typeof e10 && void 0 !== this.stops) {
            let i11 = t$(e10);
            return i11.stops = [].slice.call(i11.stops), this.stops.forEach((e11, s10) => {
              i11.stops[s10] = [i11.stops[s10][0], e11.get(t10)];
            }), i11;
          }
          return i10 && tU(i10[0]) ? "rgb" !== t10 && (t10 || 1 !== i10[3]) ? "a" === t10 ? `${i10[3]}` : "rgba(" + i10.join(",") + ")" : "rgb(" + i10[0] + "," + i10[1] + "," + i10[2] + ")" : e10;
        }
        brighten(t10) {
          let e10 = this.rgba;
          if (this.stops) this.stops.forEach(function(e11) {
            e11.brighten(t10);
          });
          else if (tU(t10) && 0 !== t10) if (tU(e10[0])) for (let i10 = 0; i10 < 3; i10++) e10[i10] += t_(255 * t10), e10[i10] < 0 && (e10[i10] = 0), e10[i10] > 255 && (e10[i10] = 255);
          else tJ.useColorMix && tK(this.input) && (this.output = tq(this.input, t10 > 0 ? "white" : "black", Math.abs(t10)));
          return this;
        }
        setOpacity(t10) {
          return this.rgba[3] = t10, this;
        }
        tweenTo(t10, e10) {
          let i10 = this.rgba, s10 = t10.rgba;
          if (!tU(i10[0]) || !tU(s10[0])) return tJ.useColorMix && tK(this.input) && tK(t10.input) && e10 < 0.99 ? tq(this.input, t10.input, e10) : t10.input || "none";
          let o10 = 1 !== s10[3] || 1 !== i10[3], r10 = (t11, s11) => t11 + (i10[s11] - t11) * (1 - e10), a10 = s10.slice(0, 3).map(r10).map(Math.round);
          return o10 && a10.push(r10(s10[3], 3)), (o10 ? "rgba(" : "rgb(") + a10.join(",") + ")";
        }
      }
      tJ.names = {
        white: "#ffffff",
        black: "#000000"
      }, tJ.parsers = [{
        regex: /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d?(?:\.\d+)?)\s*\)/,
        parse: function(t10) {
          return [t_(t10[1]), t_(t10[2]), t_(t10[3]), parseFloat(t10[4], 10)];
        }
      }, {
        regex: /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/,
        parse: function(t10) {
          return [t_(t10[1]), t_(t10[2]), t_(t10[3]), 1];
        }
      }, {
        regex: /^#([a-f0-9])([a-f0-9])([a-f0-9])([a-f0-9])?$/i,
        parse: function(t10) {
          return [t_(t10[1] + t10[1], 16), t_(t10[2] + t10[2], 16), t_(t10[3] + t10[3], 16), tZ(t10[4]) ? t_(t10[4] + t10[4], 16) / 255 : 1];
        }
      }, {
        regex: /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})?$/i,
        parse: function(t10) {
          return [t_(t10[1], 16), t_(t10[2], 16), t_(t10[3], 16), tZ(t10[4]) ? t_(t10[4], 16) / 255 : 1];
        }
      }], tJ.useColorMix = tj.CSS?.supports("color", "color-mix(in srgb,red,blue 9%)"), tJ.None = new tJ("");
      let {
        parse: tQ
      } = tJ, {
        win: t0
      } = V, {
        isNumber: t1,
        objectEach: t2
      } = tx;
      class t3 {
        constructor(t10, e10, i10) {
          this.pos = NaN, this.options = e10, this.elem = t10, this.prop = i10;
        }
        dSetter() {
          let t10 = this.paths, e10 = t10?.[0], i10 = t10?.[1], s10 = this.now || 0, o10 = [];
          if (1 !== s10 && e10 && i10) {
            if (e10.length === i10.length && s10 < 1) for (let t11 = 0; t11 < i10.length; t11++) {
              let r10 = e10[t11], a10 = i10[t11], n10 = [];
              for (let t12 = 0; t12 < a10.length; t12++) {
                let e11 = r10[t12], i11 = a10[t12];
                t1(e11) && t1(i11) && ("A" !== a10[0] || 4 !== t12 && 5 !== t12) ? n10[t12] = e11 + s10 * (i11 - e11) : n10[t12] = i11;
              }
              o10.push(n10);
            }
            else o10 = i10;
          } else o10 = this.toD || [];
          this.elem.attr("d", o10, void 0, true);
        }
        update() {
          let t10 = this.elem, e10 = this.prop, i10 = this.now, s10 = this.options.step;
          this[e10 + "Setter"] ? this[e10 + "Setter"]() : t10.attr ? t10.element && t10.attr(e10, i10, null, true) : t10.style[e10] = i10 + this.unit, s10 && s10.call(t10, i10, this);
        }
        run(t10, e10, i10) {
          let s10 = this, o10 = s10.options, r10 = function(t11) {
            return !r10.stopped && s10.step(t11);
          }, a10 = t0.requestAnimationFrame || function(t11) {
            setTimeout(t11, 13);
          }, n10 = function() {
            for (let t11 = 0; t11 < t3.timers.length; t11++) t3.timers[t11]() || t3.timers.splice(t11--, 1);
            t3.timers.length && a10(n10);
          };
          t10 !== e10 || this.elem["forceAnimate:" + this.prop] ? (this.startTime = +/* @__PURE__ */ new Date(), this.start = t10, this.end = e10, this.unit = i10, this.now = this.start, this.pos = 0, r10.elem = this.elem, r10.prop = this.prop, r10() && 1 === t3.timers.push(r10) && a10(n10)) : (delete o10.curAnim[this.prop], o10.complete && 0 === Object.keys(o10.curAnim).length && o10.complete.call(this.elem));
        }
        step(t10) {
          let e10, i10, s10 = +/* @__PURE__ */ new Date(), o10 = this.options, r10 = this.elem, a10 = o10.complete, n10 = o10.duration, h10 = o10.curAnim;
          return r10.attr && !r10.element ? e10 = false : t10 || s10 >= n10 + this.startTime ? (this.now = this.end, this.pos = 1, this.update(), h10[this.prop] = true, i10 = true, t2(h10, function(t11) {
            true !== t11 && (i10 = false);
          }), i10 && a10 && a10.call(r10), e10 = false) : (this.pos = o10.easing((s10 - this.startTime) / n10), this.now = this.start + (this.end - this.start) * this.pos, this.update(), e10 = true), e10;
        }
        initPath(t10, e10, i10) {
          let s10 = t10.startX, o10 = t10.endX, r10 = i10.slice(), a10 = t10.isArea, n10 = a10 ? 2 : 1, h10 = e10 && i10.length > e10.length && i10.hasStackedCliffs, l10, d10, c10, p10, u10 = e10?.slice();
          if (!u10 || h10) return [r10, r10];
          function g2(t11, e11) {
            for (; t11.length < d10; ) {
              let i11 = t11[0], s11 = e11[d10 - t11.length];
              if (s11 && "M" === i11[0] && ("C" === s11[0] ? t11[0] = ["C", i11[1], i11[2], i11[1], i11[2], i11[1], i11[2]] : t11[0] = ["L", i11[1], i11[2]]), t11.unshift(i11), a10) {
                let e12 = t11.pop();
                t11.push(t11[t11.length - 1], e12);
              }
            }
          }
          function f2(t11) {
            for (; t11.length < d10; ) {
              let e11 = t11[Math.floor(t11.length / n10) - 1].slice();
              if ("C" === e11[0] && (e11[1] = e11[5], e11[2] = e11[6]), a10) {
                let i11 = t11[Math.floor(t11.length / n10)].slice();
                t11.splice(t11.length / 2, 0, e11, i11);
              } else t11.push(e11);
            }
          }
          if (s10 && o10 && o10.length) {
            for (c10 = 0; c10 < s10.length; c10++) if (s10[c10] === o10[0]) {
              l10 = c10;
              break;
            } else if (s10[0] === o10[o10.length - s10.length + c10]) {
              l10 = c10, p10 = true;
              break;
            } else if (s10[s10.length - 1] === o10[o10.length - s10.length + c10]) {
              l10 = s10.length - c10;
              break;
            }
            void 0 === l10 && (u10 = []);
          }
          return u10.length && t1(l10) && (d10 = r10.length + l10 * n10, p10 ? (g2(u10, r10), f2(r10)) : (g2(r10, u10), f2(u10))), [u10, r10];
        }
        fillSetter() {
          t3.prototype.strokeSetter.apply(this, arguments);
        }
        strokeSetter() {
          this.elem.attr(this.prop, tQ(this.start).tweenTo(tQ(this.end), this.pos), void 0, true);
        }
      }
      t3.timers = [];
      let {
        defined: t5,
        getStyle: t6,
        isArray: t9,
        isNumber: t4,
        isObject: t8,
        merge: t7,
        objectEach: et,
        pick: ee
      } = tx;
      function ei(t10) {
        return t8(t10) ? t7({
          duration: 500,
          defer: 0
        }, t10) : {
          duration: 500 * !!t10,
          defer: 0
        };
      }
      function es(t10, e10) {
        let i10 = t3.timers.length;
        for (; i10--; ) t3.timers[i10].elem !== t10 || e10 && e10 !== t3.timers[i10].prop || (t3.timers[i10].stopped = true);
      }
      let eo = {
        animate: function(t10, e10, i10) {
          let s10, o10 = "", r10, a10, n10;
          t8(i10) || (n10 = arguments, i10 = {
            duration: n10[2],
            easing: n10[3],
            complete: n10[4]
          }), t4(i10.duration) || (i10.duration = 400), i10.easing = "function" == typeof i10.easing ? i10.easing : Math[i10.easing] || Math.easeInOutSine, i10.curAnim = t7(e10), et(e10, function(n11, h10) {
            es(t10, h10), a10 = new t3(t10, i10, h10), r10 = void 0, "d" === h10 && t9(e10.d) ? (a10.paths = a10.initPath(t10, t10.pathArray, e10.d), a10.toD = e10.d, s10 = 0, r10 = 1) : t10.attr ? s10 = t10.attr(h10) : (s10 = parseFloat(t6(t10, h10)) || 0, "opacity" !== h10 && (o10 = "px")), r10 || (r10 = n11), "string" == typeof r10 && r10.match("px") && (r10 = r10.replace(/px/g, "")), a10.run(s10, r10, o10);
          });
        },
        animObject: ei,
        getDeferredAnimation: function(t10, e10, i10) {
          let s10 = ei(e10), o10 = i10 ? [i10] : t10.series, r10 = 0, a10 = 0;
          return o10.forEach((t11) => {
            let i11 = ei(t11.options.animation);
            r10 = t8(e10) && t5(e10.defer) ? s10.defer : Math.max(r10, i11.duration + i11.defer), a10 = Math.min(s10.duration, i11.duration);
          }), t10.renderer.forExport && (r10 = 0), {
            defer: Math.max(0, r10 - a10),
            duration: Math.min(r10, a10)
          };
        },
        setAnimation: function(t10, e10) {
          e10.renderer.globalAnimation = ee(t10, e10.options.chart.animation, true);
        },
        stop: es
      }, {
        SVG_NS: er,
        win: ea
      } = V, {
        attr: en,
        createElement: eh,
        css: el,
        error: ed,
        isFunction: ec,
        isString: ep,
        objectEach: eu,
        splat: eg
      } = tx, {
        trustedTypes: ef
      } = ea, em = ef && ec(ef.createPolicy) && ef.createPolicy("highcharts", {
        createHTML: (t10) => t10
      }), ex = em ? em.createHTML("") : "";
      class ey {
        static filterUserAttributes(t10) {
          return eu(t10, (e10, i10) => {
            let s10 = true;
            -1 === ey.allowedAttributes.indexOf(i10) && (s10 = false), -1 !== ["background", "dynsrc", "href", "lowsrc", "src"].indexOf(i10) && (s10 = ep(e10) && ey.allowedReferences.some((t11) => 0 === e10.indexOf(t11))), s10 || (ed(33, false, void 0, {
              "Invalid attribute in config": `${i10}`
            }), delete t10[i10]), ep(e10) && t10[i10] && (t10[i10] = e10.replace(/</g, "&lt;"));
          }), t10;
        }
        static parseStyle(t10) {
          return t10.split(";").reduce((t11, e10) => {
            let i10 = e10.split(":").map((t12) => t12.trim()), s10 = i10.shift();
            return s10 && i10.length && (t11[s10.replace(/-([a-z])/g, (t12) => t12[1].toUpperCase())] = i10.join(":")), t11;
          }, {});
        }
        static setElementHTML(t10, e10) {
          t10.innerHTML = ey.emptyHTML, e10 && new ey(e10).addToDOM(t10);
        }
        constructor(t10) {
          this.nodes = "string" == typeof t10 ? this.parseMarkup(t10) : t10;
        }
        addToDOM(t10) {
          return function t11(e10, i10) {
            let s10;
            return eg(e10).forEach(function(e11) {
              let o10, r10 = e11.tagName, a10 = e11.textContent ? V.doc.createTextNode(e11.textContent) : void 0, n10 = ey.bypassHTMLFiltering;
              if (r10) if ("#text" === r10) o10 = a10;
              else if (-1 !== ey.allowedTags.indexOf(r10) || n10) {
                let s11 = "svg" === r10 ? er : i10.namespaceURI || er, h10 = V.doc.createElementNS(s11, r10), l10 = e11.attributes || {};
                eu(e11, function(t12, e12) {
                  "tagName" !== e12 && "attributes" !== e12 && "children" !== e12 && "style" !== e12 && "textContent" !== e12 && (l10[e12] = t12);
                }), en(h10, n10 ? l10 : ey.filterUserAttributes(l10)), e11.style && el(h10, e11.style), a10 && h10.appendChild(a10), t11(e11.children || [], h10), o10 = h10;
              } else ed(33, false, void 0, {
                "Invalid tagName in config": r10
              });
              o10 && i10.appendChild(o10), s10 = o10;
            }), s10;
          }(this.nodes, t10);
        }
        parseMarkup(t10) {
          let e10, i10 = [];
          t10 = t10.trim().replace(/ style=(["'])/g, " data-style=$1");
          try {
            e10 = new DOMParser().parseFromString(em ? em.createHTML(t10) : t10, "text/html");
          } catch {
          }
          if (!e10) {
            let i11 = eh("div");
            i11.innerHTML = t10, e10 = {
              body: i11
            };
          }
          let s10 = (t11, e11) => {
            let i11 = t11.nodeName.toLowerCase(), o10 = {
              tagName: i11
            };
            "#text" === i11 && (o10.textContent = t11.textContent || "");
            let r10 = t11.attributes;
            if (r10) {
              let t12 = {};
              [].forEach.call(r10, (e12) => {
                "data-style" === e12.name ? o10.style = ey.parseStyle(e12.value) : t12[e12.name] = e12.value;
              }), o10.attributes = t12;
            }
            if (t11.childNodes.length) {
              let e12 = [];
              [].forEach.call(t11.childNodes, (t12) => {
                s10(t12, e12);
              }), e12.length && (o10.children = e12);
            }
            e11.push(o10);
          };
          return [].forEach.call(e10.body.childNodes, (t11) => s10(t11, i10)), i10;
        }
      }
      ey.allowedAttributes = ["alt", "aria-controls", "aria-describedby", "aria-expanded", "aria-haspopup", "aria-hidden", "aria-label", "aria-labelledby", "aria-live", "aria-pressed", "aria-readonly", "aria-roledescription", "aria-selected", "class", "clip-path", "color", "colspan", "cx", "cy", "d", "disabled", "dx", "dy", "fill", "filterUnits", "flood-color", "flood-opacity", "height", "href", "id", "in", "in2", "markerHeight", "markerWidth", "offset", "opacity", "operator", "orient", "padding", "paddingLeft", "paddingRight", "patternUnits", "r", "radius", "refX", "refY", "result", "role", "rowspan", "scope", "slope", "src", "startOffset", "stdDeviation", "stroke-linecap", "stroke-width", "stroke", "style", "summary", "tabindex", "tableValues", "target", "text-align", "text-anchor", "textAnchor", "textLength", "title", "type", "valign", "width", "x", "x1", "x2", "xlink:href", "y", "y1", "y2", "zIndex"], ey.allowedReferences = ["https://", "http://", "mailto:", "/", "../", "./", "#"], ey.allowedTags = ["#text", "a", "abbr", "b", "br", "button", "caption", "circle", "clipPath", "code", "dd", "defs", "div", "dl", "dt", "em", "feComponentTransfer", "feComposite", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feMerge", "feMergeNode", "feMorphology", "feOffset", "filter", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "li", "linearGradient", "marker", "ol", "p", "path", "pattern", "pre", "rect", "small", "span", "stop", "strong", "style", "sub", "sup", "svg", "table", "tbody", "td", "text", "textPath", "th", "thead", "title", "tr", "tspan", "u", "ul"], ey.emptyHTML = ex, ey.bypassHTMLFiltering = false;
      let {
        defaultOptions: eb,
        defaultTime: ev
      } = tY, {
        pageLang: ek
      } = V, {
        extend: eM,
        getNestedProperty: ew,
        isArray: eS,
        isNumber: eA,
        isObject: eT,
        isString: eC,
        pick: eP,
        ucfirst: eO
      } = tx, eE = {
        add: (t10, e10) => t10 + e10,
        divide: (t10, e10) => 0 !== e10 ? t10 / e10 : "",
        eq: (t10, e10) => t10 == e10,
        each: function(t10) {
          let e10 = arguments[arguments.length - 1];
          return !!eS(t10) && t10.map((i10, s10) => eB(e10.body, eM(eT(i10) ? i10 : {
            "@this": i10
          }, {
            "@index": s10,
            "@first": 0 === s10,
            "@last": s10 === t10.length - 1
          }))).join("");
        },
        ge: (t10, e10) => t10 >= e10,
        gt: (t10, e10) => t10 > e10,
        if: (t10) => !!t10,
        le: (t10, e10) => t10 <= e10,
        lt: (t10, e10) => t10 < e10,
        multiply: (t10, e10) => t10 * e10,
        ne: (t10, e10) => t10 != e10,
        subtract: (t10, e10) => t10 - e10,
        ucfirst: eO,
        unless: (t10) => !t10
      }, eL = {};
      function eB(t10 = "", e10, i10) {
        let s10 = RegExp(`\\{([\\p{L}\\d:\\.,;\\-\\/<>\\[\\]%_@+"'’= #\\(\\)]+)\\}`, "gu"), o10 = RegExp(`\\(([\\p{L}\\d:\\.,;\\-\\/<>\\[\\]%_@+"'= ]+)\\)`, "gu"), r10 = [], a10 = /f$/, n10 = /\.(\d)/, h10 = i10?.options?.lang || eb.lang, l10 = i10?.time || ev, d10 = i10?.numberFormatter || eD.bind(i10), c10 = (t11 = "") => {
          let i11;
          return "true" === t11 || "false" !== t11 && ((i11 = Number(t11)).toString() === t11 ? i11 : /^["'].+["']$/.test(t11) ? t11.slice(1, -1) : ew(t11, e10));
        }, p10, u10, g2 = 0, f2;
        for (; null !== (p10 = s10.exec(t10)); ) {
          let i11 = p10, s11 = o10.exec(p10[1]);
          s11 && (p10 = s11, f2 = true), u10?.isBlock || (u10 = {
            ctx: e10,
            expression: p10[1],
            find: p10[0],
            isBlock: "#" === p10[1].charAt(0),
            start: p10.index,
            startInner: p10.index + p10[0].length,
            length: p10[0].length
          });
          let a11 = (u10.isBlock ? i11 : p10)[1].split(" ")[0].replace("#", "");
          eE[a11] && (u10.isBlock && a11 === u10.fn && g2++, u10.fn || (u10.fn = a11));
          let n11 = "else" === p10[1];
          if (u10.isBlock && u10.fn && (p10[1] === `/${u10.fn}` || n11)) {
            if (g2) !n11 && g2--;
            else {
              let e11 = u10.startInner, i12 = t10.substr(e11, p10.index - e11);
              void 0 === u10.body ? (u10.body = i12, u10.startInner = p10.index + p10[0].length) : u10.elseBody = i12, u10.find += i12 + p10[0], n11 || (r10.push(u10), u10 = void 0);
            }
          } else u10.isBlock || r10.push(u10);
          if (s11 && !u10?.isBlock) break;
        }
        return r10.forEach((s11) => {
          let r11, p11, {
            body: u11,
            elseBody: g3,
            expression: f3,
            fn: m2
          } = s11;
          if (m2) {
            let t11 = [s11], o11 = [], a11 = f3.length, n11 = 0, h11;
            for (p11 = 0; p11 <= a11; p11++) {
              let t12 = f3.charAt(p11);
              h11 || '"' !== t12 && "'" !== t12 ? h11 === t12 && (h11 = "") : h11 = t12, h11 || " " !== t12 && p11 !== a11 || (o11.push(f3.substr(n11, p11 - n11)), n11 = p11 + 1);
            }
            for (p11 = eE[m2].length; p11--; ) t11.unshift(c10(o11[p11 + 1]));
            r11 = eE[m2].apply(e10, t11), s11.isBlock && "boolean" == typeof r11 && (r11 = eB(r11 ? u11 : g3, e10, i10));
          } else {
            let t11 = /^["'].+["']$/.test(f3) ? [f3] : f3.split(":");
            if (r11 = c10(t11.shift() || ""), t11.length && "number" == typeof r11) {
              let e11 = t11.join(":");
              if (a10.test(e11)) {
                let t12 = parseInt((e11.match(n10) || ["", "-1"])[1], 10);
                null !== r11 && (r11 = d10(r11, t12, h10.decimalPoint, e11.indexOf(",") > -1 ? h10.thousandsSep : ""));
              } else r11 = l10.dateFormat(e11, r11);
            }
            o10.lastIndex = 0, o10.test(s11.find) && eC(r11) && (r11 = `"${r11}"`);
          }
          t10 = t10.replace(s11.find, eP(r11, ""));
        }), f2 ? eB(t10, e10, i10) : t10;
      }
      function eD(t10, e10, i10, s10) {
        e10 *= 1;
        let o10, r10, [a10, n10] = (t10 = +t10 || 0).toString().split("e").map(Number), h10 = this?.options?.lang || eb.lang, l10 = (t10.toString().split(".")[1] || "").split("e")[0].length, d10 = e10, c10 = {};
        i10 ?? (i10 = h10.decimalPoint), s10 ?? (s10 = h10.thousandsSep), -1 === e10 ? e10 = Math.min(l10, 20) : eA(e10) ? e10 && n10 < 0 && ((r10 = e10 + n10) >= 0 ? (a10 = +a10.toExponential(r10).split("e")[0], e10 = r10) : (a10 = Math.floor(a10), t10 = e10 < 20 ? +(a10 * Math.pow(10, n10)).toFixed(e10) : 0, n10 = 0)) : e10 = 2, n10 && (e10 ?? (e10 = 2), t10 = a10), eA(e10) && e10 >= 0 && (c10.minimumFractionDigits = e10, c10.maximumFractionDigits = e10), "" === s10 && (c10.useGrouping = false);
        let p10 = s10 || i10, u10 = p10 ? "en" : this?.locale || h10.locale || ek, g2 = JSON.stringify(c10) + u10;
        return o10 = (eL[g2] ?? (eL[g2] = new Intl.NumberFormat(u10, c10))).format(t10), p10 && (o10 = o10.replace(/([,\.])/g, "_$1").replace(/_\,/g, s10 ?? ",").replace("_.", i10 ?? ".")), (e10 || 0 != +o10) && (!(n10 < 0) || d10) || (o10 = "0"), n10 && 0 != +o10 && (o10 += "e" + (n10 < 0 ? "" : "+") + n10), o10;
      }
      let eI = {
        dateFormat: function(t10, e10, i10) {
          return ev.dateFormat(t10, e10, i10);
        },
        format: eB,
        helpers: eE,
        numberFormat: eD
      };
      (c = k || (k = {})).rendererTypes = {}, c.getRendererType = function(t10 = h) {
        return c.rendererTypes[t10] || c.rendererTypes[h];
      }, c.registerRendererType = function(t10, e10, i10) {
        c.rendererTypes[t10] = e10, (!h || i10) && (h = t10, V.Renderer = e10);
      };
      let ez = k, {
        clamp: eR,
        pick: eN,
        pushUnique: eW,
        stableSort: eG
      } = tx;
      (M || (M = {})).distribute = function t10(e10, i10, s10) {
        let o10 = e10, r10 = o10.reducedLen || i10, a10 = (t11, e11) => t11.target - e11.target, n10 = [], h10 = e10.length, l10 = [], d10 = n10.push, c10, p10, u10, g2 = true, f2, m2, x2 = 0, y2;
        for (c10 = h10; c10--; ) x2 += e10[c10].size;
        if (x2 > r10) {
          for (eG(e10, (t11, e11) => (e11.rank || 0) - (t11.rank || 0)), u10 = (y2 = e10[0].rank === e10[e10.length - 1].rank) ? h10 / 2 : -1, p10 = y2 ? u10 : h10 - 1; u10 && x2 > r10; ) f2 = e10[c10 = Math.floor(p10)], eW(l10, c10) && (x2 -= f2.size), p10 += u10, y2 && p10 >= e10.length && (u10 /= 2, p10 = u10);
          l10.sort((t11, e11) => e11 - t11).forEach((t11) => d10.apply(n10, e10.splice(t11, 1)));
        }
        for (eG(e10, a10), e10 = e10.map((t11) => ({
          size: t11.size,
          targets: [t11.target],
          align: eN(t11.align, 0.5)
        })); g2; ) {
          for (c10 = e10.length; c10--; ) f2 = e10[c10], m2 = (Math.min.apply(0, f2.targets) + Math.max.apply(0, f2.targets)) / 2, f2.pos = eR(m2 - f2.size * f2.align, 0, i10 - f2.size);
          for (c10 = e10.length, g2 = false; c10--; ) c10 > 0 && e10[c10 - 1].pos + e10[c10 - 1].size > e10[c10].pos && (e10[c10 - 1].size += e10[c10].size, e10[c10 - 1].targets = e10[c10 - 1].targets.concat(e10[c10].targets), e10[c10 - 1].align = 0.5, e10[c10 - 1].pos + e10[c10 - 1].size > i10 && (e10[c10 - 1].pos = i10 - e10[c10 - 1].size), e10.splice(c10, 1), g2 = true);
        }
        return d10.apply(o10, n10), c10 = 0, e10.some((e11) => {
          let r11 = 0;
          return (e11.targets || []).some(() => (o10[c10].pos = e11.pos + r11, void 0 !== s10 && Math.abs(o10[c10].pos - o10[c10].target) > s10) ? (o10.slice(0, c10 + 1).forEach((t11) => delete t11.pos), o10.reducedLen = (o10.reducedLen || i10) - 0.1 * i10, o10.reducedLen > 0.1 * i10 && t10(o10, i10, s10), true) : (r11 += o10[c10].size, c10++, false));
        }), eG(o10, a10), o10;
      };
      let eX = M, {
        animate: eH,
        animObject: eF,
        stop: eY
      } = eo, {
        deg2rad: ej,
        doc: eU,
        svg: eV,
        SVG_NS: e$,
        win: e_,
        isFirefox: eZ
      } = V, {
        addEvent: eq,
        attr: eK,
        createElement: eJ,
        crisp: eQ,
        css: e0,
        defined: e1,
        erase: e2,
        extend: e3,
        fireEvent: e5,
        getAlignFactor: e6,
        isArray: e9,
        isFunction: e4,
        isNumber: e8,
        isObject: e7,
        isString: it,
        merge: ie,
        objectEach: ii,
        pick: is,
        pInt: io,
        pushUnique: ir,
        replaceNested: ia,
        syncTimeout: ih,
        uniqueKey: il
      } = tx;
      class id {
        _defaultGetter(t10) {
          let e10 = is(this[t10 + "Value"], this[t10], this.element ? this.element.getAttribute(t10) : null, 0);
          return /^-?[\d\.]+$/.test(e10) && (e10 = parseFloat(e10)), e10;
        }
        _defaultSetter(t10, e10, i10) {
          i10.setAttribute(e10, t10);
        }
        add(t10) {
          let e10, i10 = this.renderer, s10 = this.element;
          return t10 && (this.parentGroup = t10), void 0 !== this.textStr && "text" === this.element.nodeName && i10.buildText(this), this.added = true, (!t10 || t10.handleZ || this.zIndex) && (e10 = this.zIndexSetter()), e10 || (t10 ? t10.element : i10.box).appendChild(s10), this.onAdd && this.onAdd(), this;
        }
        addClass(t10, e10) {
          let i10 = e10 ? "" : this.attr("class") || "";
          return (t10 = (t10 || "").split(/ /g).reduce(function(t11, e11) {
            return -1 === i10.indexOf(e11) && t11.push(e11), t11;
          }, i10 ? [i10] : []).join(" ")) !== i10 && this.attr("class", t10), this;
        }
        afterSetters() {
          this.doTransform && (this.updateTransform(), this.doTransform = false);
        }
        align(t10, e10, i10, s10 = true) {
          let o10 = this.renderer, r10 = o10.alignedObjects, a10 = !!t10;
          t10 ? (this.alignOptions = t10, this.alignByTranslate = e10, this.alignTo = i10) : (t10 = this.alignOptions || {}, e10 = this.alignByTranslate, i10 = this.alignTo);
          let n10 = !i10 || it(i10) ? i10 || "renderer" : void 0;
          n10 && (a10 && ir(r10, this), i10 = void 0);
          let h10 = is(i10, o10[n10], o10), l10 = (h10.x || 0) + (t10.x || 0) + ((h10.width || 0) - (t10.width || 0)) * e6(t10.align), d10 = (h10.y || 0) + (t10.y || 0) + ((h10.height || 0) - (t10.height || 0)) * e6(t10.verticalAlign), c10 = {};
          return t10.align && (c10["text-align"] = t10.align), c10[e10 ? "translateX" : "x"] = Math.round(l10), c10[e10 ? "translateY" : "y"] = Math.round(d10), s10 && (this[this.placed ? "animate" : "attr"](c10), this.placed = true), this.alignAttr = c10, this;
        }
        alignSetter(t10) {
          let e10 = {
            left: "start",
            center: "middle",
            right: "end"
          };
          e10[t10] && (this.alignValue = t10, this.element.setAttribute("text-anchor", e10[t10]));
        }
        animate(t10, e10, i10) {
          let s10 = eF(is(e10, this.renderer.globalAnimation, true)), o10 = s10.defer;
          return eU.hidden && (s10.duration = 0), 0 !== s10.duration ? (i10 && (s10.complete = i10), ih(() => {
            this.element && eH(this, t10, s10);
          }, o10)) : (this.attr(t10, void 0, i10 || s10.complete), ii(t10, function(t11, e11) {
            s10.step && s10.step.call(this, t11, {
              prop: e11,
              pos: 1,
              elem: this
            });
          }, this)), this;
        }
        applyTextOutline(t10) {
          let e10 = this.element;
          -1 !== t10.indexOf("contrast") && (t10 = t10.replace(/contrast/g, this.renderer.getContrast(e10.style.fill)));
          let i10 = t10.indexOf(" "), s10 = t10.substring(i10 + 1), o10 = t10.substring(0, i10);
          if (o10 && "none" !== o10 && V.svg) {
            this.fakeTS = true, o10 = o10.replace(/(^[\d\.]+)(.*?)$/g, function(t12, e11, i12) {
              return 2 * Number(e11) + i12;
            }), this.removeTextOutline();
            let t11 = eU.createElementNS(e$, "tspan");
            eK(t11, {
              class: "highcharts-text-outline",
              fill: s10,
              stroke: s10,
              "stroke-width": o10,
              "stroke-linejoin": "round"
            });
            let i11 = e10.querySelector("textPath") || e10;
            [].forEach.call(i11.childNodes, (e11) => {
              let i12 = e11.cloneNode(true);
              i12.removeAttribute && ["fill", "stroke", "stroke-width", "stroke"].forEach((t12) => i12.removeAttribute(t12)), t11.appendChild(i12);
            });
            let r10 = 0;
            [].forEach.call(i11.querySelectorAll("text tspan"), (t12) => {
              r10 += Number(t12.getAttribute("dy"));
            });
            let a10 = eU.createElementNS(e$, "tspan");
            a10.textContent = "​", eK(a10, {
              x: Number(e10.getAttribute("x")),
              dy: -r10
            }), t11.appendChild(a10), i11.insertBefore(t11, i11.firstChild);
          }
        }
        attr(t10, e10, i10, s10) {
          let {
            element: o10
          } = this, r10 = id.symbolCustomAttribs, a10, n10, h10 = this, l10;
          return "string" == typeof t10 && void 0 !== e10 && (a10 = t10, (t10 = {})[a10] = e10), "string" == typeof t10 ? h10 = (this[t10 + "Getter"] || this._defaultGetter).call(this, t10, o10) : (ii(t10, function(e11, i11) {
            l10 = false, s10 || eY(this, i11), this.symbolName && -1 !== r10.indexOf(i11) && (n10 || (this.symbolAttr(t10), n10 = true), l10 = true), this.rotation && ("x" === i11 || "y" === i11) && (this.doTransform = true), l10 || (this[i11 + "Setter"] || this._defaultSetter).call(this, e11, i11, o10);
          }, this), this.afterSetters()), i10 && i10.call(this), h10;
        }
        clip(t10) {
          if (t10 && !t10.clipPath) {
            let e10 = il() + "-", i10 = this.renderer.createElement("clipPath").attr({
              id: e10
            }).add(this.renderer.defs);
            e3(t10, {
              clipPath: i10,
              id: e10,
              count: 0
            }), t10.add(i10);
          }
          return this.attr("clip-path", t10 ? `url(${this.renderer.url}#${t10.id})` : "none");
        }
        crisp(t10, e10) {
          e10 = Math.round(e10 || t10.strokeWidth || 0);
          let i10 = t10.x || this.x || 0, s10 = t10.y || this.y || 0, o10 = (t10.width || this.width || 0) + i10, r10 = (t10.height || this.height || 0) + s10, a10 = eQ(i10, e10), n10 = eQ(s10, e10);
          return e3(t10, {
            x: a10,
            y: n10,
            width: eQ(o10, e10) - a10,
            height: eQ(r10, e10) - n10
          }), e1(t10.strokeWidth) && (t10.strokeWidth = e10), t10;
        }
        complexColor(t10, e10, i10) {
          let s10 = this.renderer, o10, r10, a10, n10, h10, l10, d10, c10, p10, u10, g2 = [], f2;
          e5(this.renderer, "complexColor", {
            args: arguments
          }, function() {
            if (t10.radialGradient ? r10 = "radialGradient" : t10.linearGradient && (r10 = "linearGradient"), r10) {
              if (a10 = t10[r10], h10 = s10.gradients, l10 = t10.stops, p10 = i10.radialReference, e9(a10) && (t10[r10] = a10 = {
                x1: a10[0],
                y1: a10[1],
                x2: a10[2],
                y2: a10[3],
                gradientUnits: "userSpaceOnUse"
              }), "radialGradient" === r10 && p10 && !e1(a10.gradientUnits) && (n10 = a10, a10 = ie(a10, s10.getRadialAttr(p10, n10), {
                gradientUnits: "userSpaceOnUse"
              })), ii(a10, function(t11, e11) {
                "id" !== e11 && g2.push(e11, t11);
              }), ii(l10, function(t11) {
                g2.push(t11);
              }), h10[g2 = g2.join(",")]) u10 = h10[g2].attr("id");
              else {
                a10.id = u10 = il();
                let t11 = h10[g2] = s10.createElement(r10).attr(a10).add(s10.defs);
                t11.radAttr = n10, t11.stops = [], l10.forEach(function(e11) {
                  0 === e11[1].indexOf("rgba") ? (d10 = (o10 = tJ.parse(e11[1])).get("rgb"), c10 = o10.get("a")) : (d10 = e11[1], c10 = 1);
                  let i11 = s10.createElement("stop").attr({
                    offset: e11[0],
                    "stop-color": d10,
                    "stop-opacity": c10
                  }).add(t11);
                  t11.stops.push(i11);
                });
              }
              f2 = "url(" + s10.url + "#" + u10 + ")", i10.setAttribute(e10, f2), i10.gradient = g2, t10.toString = function() {
                return f2;
              };
            }
          });
        }
        css(t10) {
          let e10 = this.styles, i10 = {}, s10 = this.element, o10, r10 = !e10;
          if (e10 && ii(t10, function(t11, s11) {
            e10 && e10[s11] !== t11 && (i10[s11] = t11, r10 = true);
          }), r10) {
            e10 && (t10 = e3(e10, i10)), null === t10.width || "auto" === t10.width ? delete this.textWidth : "text" === s10.nodeName.toLowerCase() && t10.width && (o10 = this.textWidth = io(t10.width)), e3(this.styles, t10), o10 && !eV && this.renderer.forExport && delete t10.width;
            let r11 = eZ && t10.fontSize || null;
            r11 && (e8(r11) || /^\d+$/.test(r11)) && (t10.fontSize += "px");
            let a10 = ie(t10);
            s10.namespaceURI === this.SVG_NS && (["textOutline", "textOverflow", "whiteSpace", "width"].forEach((t11) => a10 && delete a10[t11]), a10.color && (a10.fill = a10.color, delete a10.color)), e0(s10, a10);
          }
          return this.added && ("text" === this.element.nodeName && this.renderer.buildText(this), t10.textOutline && this.applyTextOutline(t10.textOutline)), this;
        }
        dashstyleSetter(t10) {
          let e10, i10 = this["stroke-width"];
          if ("inherit" === i10 && (i10 = 1), t10) {
            let s10 = (t10 = t10.toLowerCase()).replace("shortdashdotdot", "3,1,1,1,1,1,").replace("shortdashdot", "3,1,1,1").replace("shortdot", "1,1,").replace("shortdash", "3,1,").replace("longdash", "8,3,").replace(/dot/g, "1,3,").replace("dash", "4,3,").replace(/,$/, "").split(",");
            for (e10 = s10.length; e10--; ) s10[e10] = "" + io(s10[e10]) * is(i10, NaN);
            t10 = s10.join(",").replace(/NaN/g, "none"), this.element.setAttribute("stroke-dasharray", t10);
          }
        }
        destroy() {
          let t10 = this, {
            element: e10 = {},
            renderer: i10,
            stops: s10
          } = t10, o10 = e10.ownerSVGElement, r10 = "SPAN" === e10.nodeName && t10.parentGroup || void 0, a10;
          if (e10.onclick = e10.onmouseout = e10.onmouseover = e10.onmousemove = e10.point = null, eY(t10), t10.clipPath && o10) {
            let e11 = t10.clipPath;
            [].forEach.call(o10.querySelectorAll("[clip-path],[CLIP-PATH]"), function(t11) {
              t11.getAttribute("clip-path").indexOf(e11.element.id) > -1 && t11.removeAttribute("clip-path");
            }), t10.clipPath = e11.destroy();
          }
          if (s10) {
            for (let t11 of s10) t11.destroy();
            s10.length = 0;
          }
          for (t10.safeRemoveChild(e10); r10?.div && 0 === r10.div.childNodes.length; ) a10 = r10.parentGroup, t10.safeRemoveChild(r10.div), delete r10.div, r10 = a10;
          t10.alignOptions && e2(i10.alignedObjects, t10), ii(t10, (e11, i11) => {
            (t10[i11]?.parentGroup === t10 || -1 !== ["connector", "foreignObject"].indexOf(i11)) && t10[i11]?.destroy?.(), delete t10[i11];
          });
        }
        dSetter(t10, e10, i10) {
          e9(t10) && ("string" == typeof t10[0] && (t10 = this.renderer.pathToSegments(t10)), this.pathArray = t10, t10 = t10.reduce((t11, e11, i11) => e11?.join ? (i11 ? t11 + " " : "") + e11.join(" ") : (e11 || "").toString(), "")), /(NaN| {2}|^$)/.test(t10) && (t10 = "M 0 0"), this[e10] !== t10 && (i10.setAttribute(e10, t10), this[e10] = t10);
        }
        fillSetter(t10, e10, i10) {
          "string" == typeof t10 ? i10.setAttribute(e10, t10) : t10 && this.complexColor(t10, e10, i10);
        }
        hrefSetter(t10, e10, i10) {
          i10.setAttributeNS("http://www.w3.org/1999/xlink", e10, t10);
        }
        getBBox(t10, e10) {
          let i10, s10, o10, {
            element: r10,
            renderer: a10,
            styles: n10,
            textStr: h10
          } = this, {
            cache: l10,
            cacheKeys: d10
          } = a10, c10 = r10.namespaceURI === this.SVG_NS, p10 = is(e10, this.rotation, 0), u10 = a10.styledMode ? r10 && id.prototype.getStyle.call(r10, "font-size") : n10.fontSize, g2 = this.getBBoxCacheKey([a10.rootFontSize, this.textWidth, this.alignValue, n10.fontWeight, n10.lineClamp, n10.textOverflow, u10, p10]);
          if (g2 && !t10 && (i10 = l10[g2]), !i10 || i10.polygon) {
            if (c10 || a10.forExport) {
              try {
                o10 = this.fakeTS && function(t12) {
                  let e11 = r10.querySelector(".highcharts-text-outline");
                  e11 && e0(e11, {
                    display: t12
                  });
                }, e4(o10) && o10("none"), i10 = r10.getBBox ? e3({}, r10.getBBox()) : {
                  width: r10.offsetWidth,
                  height: r10.offsetHeight,
                  x: 0,
                  y: 0
                }, e4(o10) && o10("");
              } catch {
              }
              (!i10 || i10.width < 0) && (i10 = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
              });
            } else i10 = this.htmlGetBBox();
            s10 = i10.height, c10 && (i10.height = s10 = {
              "11px,17": 14,
              "13px,20": 16
            }[`${u10 || ""},${Math.round(s10)}`] || s10), p10 && (i10 = this.getRotatedBox(i10, p10));
            let t11 = {
              bBox: i10
            };
            e5(this, "afterGetBBox", t11), i10 = t11.bBox;
          }
          if (g2 && ("" === h10 || i10.height > 0)) {
            for (; d10.length > 250; ) delete l10[d10.shift()];
            l10[g2] || d10.push(g2), l10[g2] = i10;
          }
          return i10;
        }
        getBBoxCacheKey(t10) {
          if (e1(this.textStr)) {
            let e10 = "" + this.textStr;
            return -1 === e10.indexOf("<") && (e10 = e10.replace(/\d/g, "0")), [e10, ...t10].join(",");
          }
        }
        getRotatedBox(t10, e10) {
          let {
            x: i10,
            y: s10,
            width: o10,
            height: r10
          } = t10, {
            alignValue: a10,
            translateY: n10,
            rotationOriginX: h10 = 0,
            rotationOriginY: l10 = 0
          } = this, d10 = e6(a10), c10 = Number(this.element.getAttribute("y") || 0) - (n10 ? 0 : s10), p10 = e10 * ej, u10 = (e10 - 90) * ej, g2 = Math.cos(p10), f2 = Math.sin(p10), m2 = o10 * g2, x2 = o10 * f2, y2 = Math.cos(u10), b2 = Math.sin(u10), [[v2, k2], [M2, w2]] = [h10, l10].map((t11) => [t11 - t11 * g2, t11 * f2]), S2 = i10 + d10 * (o10 - m2) + v2 + w2 + c10 * y2, A2 = S2 + m2, T2 = A2 - r10 * y2, C2 = T2 - m2, P2 = s10 + c10 - d10 * x2 - k2 + M2 + c10 * b2, O2 = P2 + x2, E2 = O2 - r10 * b2, L2 = E2 - x2, B2 = Math.min(S2, A2, T2, C2), D2 = Math.min(P2, O2, E2, L2), I2 = Math.max(S2, A2, T2, C2) - B2, z2 = Math.max(P2, O2, E2, L2) - D2;
          return {
            x: B2,
            y: D2,
            width: I2,
            height: z2,
            polygon: [[S2, P2], [A2, O2], [T2, E2], [C2, L2]]
          };
        }
        getStyle(t10) {
          return e_.getComputedStyle(this.element || this, "").getPropertyValue(t10);
        }
        hasClass(t10) {
          return -1 !== ("" + this.attr("class")).split(" ").indexOf(t10);
        }
        hide() {
          return this.attr({
            visibility: "hidden"
          });
        }
        htmlGetBBox() {
          return {
            height: 0,
            width: 0,
            x: 0,
            y: 0
          };
        }
        constructor(t10, e10) {
          this.onEvents = {}, this.opacity = 1, this.SVG_NS = e$, this.element = "span" === e10 || "body" === e10 ? eJ(e10) : eU.createElementNS(this.SVG_NS, e10), this.renderer = t10, this.styles = {}, e5(this, "afterInit");
        }
        on(t10, e10) {
          let {
            onEvents: i10
          } = this;
          return i10[t10] && i10[t10](), i10[t10] = eq(this.element, t10, e10), this;
        }
        opacitySetter(t10, e10, i10) {
          let s10 = Number(Number(t10).toFixed(3));
          this.opacity = s10, i10.setAttribute(e10, s10);
        }
        reAlign() {
          this.alignOptions?.width && "left" !== this.alignOptions.align && (this.alignOptions.width = this.getBBox().width, this.placed = false, this.align());
        }
        removeClass(t10) {
          return this.attr("class", ("" + this.attr("class")).replace(it(t10) ? RegExp(`(^| )${t10}( |$)`) : t10, " ").replace(/ +/g, " ").trim());
        }
        removeTextOutline() {
          let t10 = this.element.querySelector("tspan.highcharts-text-outline");
          t10 && this.safeRemoveChild(t10);
        }
        safeRemoveChild(t10) {
          let e10 = t10.parentNode;
          e10 && e10.removeChild(t10);
        }
        setRadialReference(t10) {
          let e10 = this.element.gradient && this.renderer.gradients[this.element.gradient] || void 0;
          return this.element.radialReference = t10, e10?.radAttr && e10.animate(this.renderer.getRadialAttr(t10, e10.radAttr)), this;
        }
        shadow(t10) {
          let {
            renderer: e10
          } = this, i10 = ie(this.parentGroup?.rotation === 90 ? {
            offsetX: -1,
            offsetY: -1
          } : {}, e7(t10) ? t10 : {}), s10 = e10.shadowDefinition(i10);
          return this.attr({
            filter: t10 ? `url(${e10.url}#${s10})` : "none"
          });
        }
        show(t10 = true) {
          return this.attr({
            visibility: t10 ? "inherit" : "visible"
          });
        }
        "stroke-widthSetter"(t10, e10, i10) {
          this[e10] = t10, i10.setAttribute(e10, t10);
        }
        strokeWidth() {
          if (!this.renderer.styledMode) return this["stroke-width"] || 0;
          let t10 = this.getStyle("stroke-width"), e10 = 0, i10;
          return /px$/.test(t10) ? e10 = io(t10) : "" !== t10 && (eK(i10 = eU.createElementNS(e$, "rect"), {
            width: t10,
            "stroke-width": 0
          }), this.element.parentNode.appendChild(i10), e10 = i10.getBBox().width, i10.parentNode.removeChild(i10)), e10;
        }
        symbolAttr(t10) {
          let e10 = this;
          id.symbolCustomAttribs.forEach(function(i10) {
            e10[i10] = is(t10[i10], e10[i10]);
          }), e10.attr({
            d: e10.renderer.symbols[e10.symbolName](e10.x, e10.y, e10.width, e10.height, e10)
          });
        }
        textSetter(t10) {
          t10 !== this.textStr && (delete this.textPxLength, this.textStr = t10, this.added && this.renderer.buildText(this), this.reAlign());
        }
        titleSetter(t10) {
          let e10 = this.element, i10 = e10.getElementsByTagName("title")[0] || eU.createElementNS(this.SVG_NS, "title");
          e10.insertBefore ? e10.insertBefore(i10, e10.firstChild) : e10.appendChild(i10), i10.textContent = ia(is(t10, ""), [/<[^>]*>/g, ""]).replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        }
        toFront() {
          let t10 = this.element;
          return t10.parentNode.appendChild(t10), this;
        }
        translate(t10, e10) {
          return this.attr({
            translateX: t10,
            translateY: e10
          });
        }
        updateTransform(t10 = "transform") {
          let {
            element: e10,
            foreignObject: i10,
            matrix: s10,
            padding: o10,
            rotation: r10 = 0,
            rotationOriginX: a10,
            rotationOriginY: n10,
            scaleX: h10,
            scaleY: l10,
            text: d10,
            translateX: c10 = 0,
            translateY: p10 = 0
          } = this, u10 = [`translate(${c10},${p10})`];
          e1(s10) && u10.push("matrix(" + s10.join(",") + ")"), r10 && (u10.push("rotate(" + r10 + " " + (a10 ?? e10.getAttribute("x") ?? this.x ?? 0) + " " + (n10 ?? e10.getAttribute("y") ?? this.y ?? 0) + ")"), d10?.element.tagName !== "SPAN" || d10?.foreignObject || d10.attr({
            rotation: r10,
            rotationOriginX: (a10 || 0) - o10,
            rotationOriginY: (n10 || 0) - o10
          })), (e1(h10) || e1(l10)) && u10.push(`scale(${h10 ?? 1} ${l10 ?? 1})`), u10.length && !(d10 || this).textPath && (i10?.element || e10).setAttribute(t10, u10.join(" "));
        }
        visibilitySetter(t10, e10, i10) {
          "inherit" === t10 ? i10.removeAttribute(e10) : this[e10] !== t10 && i10.setAttribute(e10, t10), this[e10] = t10;
        }
        xGetter(t10) {
          return "circle" === this.element.nodeName && ("x" === t10 ? t10 = "cx" : "y" === t10 && (t10 = "cy")), this._defaultGetter(t10);
        }
        zIndexSetter(t10, e10) {
          let i10 = this.renderer, s10 = this.parentGroup, o10 = (s10 || i10).element || i10.box, r10 = this.element, a10 = o10 === i10.box, n10, h10, l10, d10 = false, c10, p10 = this.added, u10;
          if (e1(t10) ? (r10.setAttribute("data-z-index", t10), t10 *= 1, this[e10] === t10 && (p10 = false)) : e1(this[e10]) && r10.removeAttribute("data-z-index"), this[e10] = t10, p10) {
            for ((t10 = this.zIndex) && s10 && (s10.handleZ = true), u10 = (n10 = o10.childNodes).length - 1; u10 >= 0 && !d10; u10--) c10 = !e1(l10 = (h10 = n10[u10]).getAttribute("data-z-index")), h10 !== r10 && (t10 < 0 && c10 && !a10 && !u10 ? (o10.insertBefore(r10, n10[u10]), d10 = true) : (io(l10) <= t10 || c10 && (!e1(t10) || t10 >= 0)) && (o10.insertBefore(r10, n10[u10 + 1]), d10 = true));
            d10 || (o10.insertBefore(r10, n10[3 * !!a10]), d10 = true);
          }
          return d10;
        }
      }
      id.symbolCustomAttribs = ["anchorX", "anchorY", "clockwise", "end", "height", "innerR", "r", "start", "width", "x", "y"], id.prototype.strokeSetter = id.prototype.fillSetter, id.prototype.yGetter = id.prototype.xGetter, id.prototype.matrixSetter = id.prototype.rotationOriginXSetter = id.prototype.rotationOriginYSetter = id.prototype.rotationSetter = id.prototype.scaleXSetter = id.prototype.scaleYSetter = id.prototype.translateXSetter = id.prototype.translateYSetter = id.prototype.verticalAlignSetter = function(t10, e10) {
        this[e10] = t10, this.doTransform = true;
      };
      let ic = id, {
        defined: ip,
        extend: iu,
        getAlignFactor: ig,
        isNumber: im,
        merge: ix,
        pick: iy,
        removeEvent: ib
      } = tx;
      class iv extends ic {
        constructor(t10, e10, i10, s10, o10, r10, a10, n10, h10, l10) {
          let d10;
          super(t10, "g"), this.paddingLeftSetter = this.paddingSetter, this.paddingRightSetter = this.paddingSetter, this.doUpdate = false, this.textStr = e10, this.x = i10, this.y = s10, this.anchorX = r10, this.anchorY = a10, this.baseline = h10, this.className = l10, this.addClass("button" === l10 ? "highcharts-no-tooltip" : "highcharts-label"), l10 && this.addClass("highcharts-" + l10), this.text = t10.text(void 0, 0, 0, n10).attr({
            zIndex: 1
          }), "string" == typeof o10 && ((d10 = /^url\((.*?)\)$/.test(o10)) || this.renderer.symbols[o10]) && (this.symbolKey = o10), this.bBox = iv.emptyBBox, this.padding = 3, this.baselineOffset = 0, this.needsBox = t10.styledMode || d10, this.deferredAttr = {}, this.alignFactor = 0;
        }
        alignSetter(t10) {
          let e10 = ig(t10);
          this.textAlign = t10, e10 !== this.alignFactor && (this.alignFactor = e10, this.bBox && im(this.xSetting) && this.attr({
            x: this.xSetting
          }), this.updateTextPadding());
        }
        anchorXSetter(t10, e10) {
          this.anchorX = t10, this.boxAttr(e10, Math.round(t10) - this.getCrispAdjust() - this.xSetting);
        }
        anchorYSetter(t10, e10) {
          this.anchorY = t10, this.boxAttr(e10, t10 - this.ySetting);
        }
        boxAttr(t10, e10) {
          this.box ? this.box.attr(t10, e10) : this.deferredAttr[t10] = e10;
        }
        css(t10) {
          if (t10) {
            let e10 = {};
            t10 = ix(t10), iv.textProps.forEach((i10) => {
              void 0 !== t10[i10] && (e10[i10] = t10[i10], delete t10[i10]);
            }), this.text.css(e10), "fontSize" in e10 || "fontWeight" in e10 || "width" in e10 ? this.updateTextPadding() : "textOverflow" in e10 && this.updateBoxSize();
          }
          return ic.prototype.css.call(this, t10);
        }
        destroy() {
          ib(this.element, "mouseenter"), ib(this.element, "mouseleave"), this.text && this.text.destroy(), this.box && (this.box = this.box.destroy()), ic.prototype.destroy.call(this);
        }
        fillSetter(t10, e10) {
          t10 && (this.needsBox = true), this.fill = t10, this.boxAttr(e10, t10);
        }
        getBBox(t10, e10) {
          (this.textStr && 0 === this.bBox.width && 0 === this.bBox.height || this.rotation) && this.updateBoxSize();
          let {
            padding: i10,
            height: s10 = 0,
            translateX: o10 = 0,
            translateY: r10 = 0,
            width: a10 = 0
          } = this, n10 = iy(this.paddingLeft, i10), h10 = e10 ?? (this.rotation || 0), l10 = {
            width: a10,
            height: s10,
            x: o10 + this.bBox.x - n10,
            y: r10 + this.bBox.y - i10 + this.baselineOffset
          };
          return h10 && (l10 = this.getRotatedBox(l10, h10)), l10;
        }
        getCrispAdjust() {
          return (this.renderer.styledMode && this.box ? this.box.strokeWidth() : this["stroke-width"] ? parseInt(this["stroke-width"], 10) : 0) % 2 / 2;
        }
        heightSetter(t10) {
          this.heightSetting = t10, this.doUpdate = true;
        }
        afterSetters() {
          super.afterSetters(), this.doUpdate && (this.updateBoxSize(), this.doUpdate = false);
        }
        onAdd() {
          this.text.add(this), this.attr({
            text: iy(this.textStr, ""),
            x: this.x || 0,
            y: this.y || 0
          }), this.box && ip(this.anchorX) && this.attr({
            anchorX: this.anchorX,
            anchorY: this.anchorY
          });
        }
        paddingSetter(t10, e10) {
          im(t10) ? t10 !== this[e10] && (this[e10] = t10, this.updateTextPadding()) : this[e10] = void 0;
        }
        rSetter(t10, e10) {
          this.boxAttr(e10, t10);
        }
        strokeSetter(t10, e10) {
          this.stroke = t10, this.boxAttr(e10, t10);
        }
        "stroke-widthSetter"(t10, e10) {
          t10 && (this.needsBox = true), this["stroke-width"] = t10, this.boxAttr(e10, t10);
        }
        "text-alignSetter"(t10) {
          this.textAlign = this["text-align"] = t10, this.updateTextPadding();
        }
        textSetter(t10) {
          void 0 !== t10 && this.text.attr({
            text: t10
          }), this.updateTextPadding(), this.reAlign();
        }
        updateBoxSize() {
          let t10, e10 = this.text, i10 = {}, s10 = this.padding, o10 = this.bBox = (!im(this.widthSetting) || !im(this.heightSetting) || this.textAlign) && ip(e10.textStr) ? e10.getBBox(void 0, 0) : iv.emptyBBox;
          this.width = this.getPaddedWidth(), this.height = (this.heightSetting || o10.height || 0) + 2 * s10;
          let r10 = this.renderer.fontMetrics(e10);
          if (this.baselineOffset = s10 + Math.min((this.text.firstLineMetrics || r10).b, o10.height || 1 / 0), this.heightSetting && (this.baselineOffset += (this.heightSetting - r10.h) / 2), this.needsBox && !e10.textPath) {
            if (!this.box) {
              let t11 = this.box = this.symbolKey ? this.renderer.symbol(this.symbolKey) : this.renderer.rect();
              t11.addClass(("button" === this.className ? "" : "highcharts-label-box") + (this.className ? " highcharts-" + this.className + "-box" : "")), t11.add(this);
            }
            i10.x = t10 = this.getCrispAdjust(), i10.y = (this.baseline ? -this.baselineOffset : 0) + t10, i10.width = Math.round(this.width), i10.height = Math.round(this.height), this.box.attr(iu(i10, this.deferredAttr)), this.deferredAttr = {};
          }
        }
        updateTextPadding() {
          let t10 = this.text, e10 = t10.styles.textAlign || this.textAlign;
          if (!t10.textPath) {
            this.updateBoxSize();
            let i10 = this.baseline ? 0 : this.baselineOffset, s10 = (this.paddingLeft ?? this.padding) + ig(e10) * (this.widthSetting ?? this.bBox.width);
            (s10 !== t10.x || i10 !== t10.y) && (t10.attr({
              align: e10,
              x: s10
            }), void 0 !== i10 && t10.attr("y", i10)), t10.x = s10, t10.y = i10;
          }
        }
        widthSetter(t10) {
          this.widthSetting = im(t10) ? t10 : void 0, this.doUpdate = true;
        }
        getPaddedWidth() {
          let t10 = this.padding, e10 = iy(this.paddingLeft, t10), i10 = iy(this.paddingRight, t10);
          return (this.widthSetting || this.bBox.width || 0) + e10 + i10;
        }
        xSetter(t10) {
          this.x = t10, this.alignFactor && (t10 -= this.alignFactor * this.getPaddedWidth(), this["forceAnimate:x"] = true), this.anchorX && (this["forceAnimate:anchorX"] = true), this.xSetting = Math.round(t10), this.attr("translateX", this.xSetting);
        }
        ySetter(t10) {
          this.anchorY && (this["forceAnimate:anchorY"] = true), this.ySetting = this.y = Math.round(t10), this.attr("translateY", this.ySetting);
        }
      }
      iv.emptyBBox = {
        width: 0,
        height: 0,
        x: 0,
        y: 0
      }, iv.textProps = ["color", "direction", "fontFamily", "fontSize", "fontStyle", "fontWeight", "lineClamp", "lineHeight", "textAlign", "textDecoration", "textOutline", "textOverflow", "whiteSpace", "width"];
      let {
        defined: ik,
        isNumber: iM,
        pick: iw
      } = tx;
      function iS(t10, e10, i10, s10, o10) {
        let r10 = [];
        if (o10) {
          let a10 = o10.start || 0, n10 = o10.end || 0, h10 = iw(o10.r, i10), l10 = iw(o10.r, s10 || i10), d10 = 2e-4 / (o10.borderRadius ? 1 : Math.max(h10, 1)), c10 = Math.abs(n10 - a10 - 2 * Math.PI) < d10;
          c10 && (a10 = Math.PI / 2, n10 = 2.5 * Math.PI - d10);
          let p10 = o10.innerR, u10 = iw(o10.open, c10), g2 = Math.cos(a10), f2 = Math.sin(a10), m2 = Math.cos(n10), x2 = Math.sin(n10), y2 = iw(o10.longArc, n10 - a10 - Math.PI < d10 ? 0 : 1), b2 = ["A", h10, l10, 0, y2, iw(o10.clockwise, 1), t10 + h10 * m2, e10 + l10 * x2];
          b2.params = {
            start: a10,
            end: n10,
            cx: t10,
            cy: e10
          }, r10.push(["M", t10 + h10 * g2, e10 + l10 * f2], b2), ik(p10) && ((b2 = ["A", p10, p10, 0, y2, ik(o10.clockwise) ? 1 - o10.clockwise : 0, t10 + p10 * g2, e10 + p10 * f2]).params = {
            start: n10,
            end: a10,
            cx: t10,
            cy: e10
          }, r10.push(u10 ? ["M", t10 + p10 * m2, e10 + p10 * x2] : ["L", t10 + p10 * m2, e10 + p10 * x2], b2)), u10 || r10.push(["Z"]);
        }
        return r10;
      }
      function iA(t10, e10, i10, s10, o10) {
        return o10?.r ? iT(t10, e10, i10, s10, o10) : [["M", t10, e10], ["L", t10 + i10, e10], ["L", t10 + i10, e10 + s10], ["L", t10, e10 + s10], ["Z"]];
      }
      function iT(t10, e10, i10, s10, o10) {
        let r10 = o10?.r || 0;
        return [["M", t10 + r10, e10], ["L", t10 + i10 - r10, e10], ["A", r10, r10, 0, 0, 1, t10 + i10, e10 + r10], ["L", t10 + i10, e10 + s10 - r10], ["A", r10, r10, 0, 0, 1, t10 + i10 - r10, e10 + s10], ["L", t10 + r10, e10 + s10], ["A", r10, r10, 0, 0, 1, t10, e10 + s10 - r10], ["L", t10, e10 + r10], ["A", r10, r10, 0, 0, 1, t10 + r10, e10], ["Z"]];
      }
      let iC = {
        arc: iS,
        callout: function(t10, e10, i10, s10, o10) {
          let r10 = Math.min(o10?.r || 0, i10, s10), a10 = r10 + 6, n10 = o10?.anchorX, h10 = o10?.anchorY || 0, l10 = iT(t10, e10, i10, s10, {
            r: r10
          });
          if (!iM(n10) || n10 < i10 && n10 > 0 && h10 < s10 && h10 > 0) return l10;
          if (t10 + n10 > i10 - a10) {
            if (h10 > e10 + a10 && h10 < e10 + s10 - a10) l10.splice(3, 1, ["L", t10 + i10, h10 - 6], ["L", t10 + i10 + 6, h10], ["L", t10 + i10, h10 + 6], ["L", t10 + i10, e10 + s10 - r10]);
            else if (n10 < i10) {
              let o11 = h10 < e10 + a10, d10 = o11 ? e10 : e10 + s10;
              l10.splice(o11 ? 2 : 5, 0, ["L", n10, h10], ["L", t10 + i10 - r10, d10]);
            } else l10.splice(3, 1, ["L", t10 + i10, s10 / 2], ["L", n10, h10], ["L", t10 + i10, s10 / 2], ["L", t10 + i10, e10 + s10 - r10]);
          } else if (t10 + n10 < a10) {
            if (h10 > e10 + a10 && h10 < e10 + s10 - a10) l10.splice(7, 1, ["L", t10, h10 + 6], ["L", t10 - 6, h10], ["L", t10, h10 - 6], ["L", t10, e10 + r10]);
            else if (n10 > 0) {
              let i11 = h10 < e10 + a10, o11 = i11 ? e10 : e10 + s10;
              l10.splice(i11 ? 1 : 6, 0, ["L", n10, h10], ["L", t10 + r10, o11]);
            } else l10.splice(7, 1, ["L", t10, s10 / 2], ["L", n10, h10], ["L", t10, s10 / 2], ["L", t10, e10 + r10]);
          } else h10 > s10 && n10 < i10 - a10 ? l10.splice(5, 1, ["L", n10 + 6, e10 + s10], ["L", n10, e10 + s10 + 6], ["L", n10 - 6, e10 + s10], ["L", t10 + r10, e10 + s10]) : h10 < 0 && n10 > a10 && l10.splice(1, 1, ["L", n10 - 6, e10], ["L", n10, e10 - 6], ["L", n10 + 6, e10], ["L", i10 - r10, e10]);
          return l10;
        },
        circle: function(t10, e10, i10, s10) {
          return iS(t10 + i10 / 2, e10 + s10 / 2, i10 / 2, s10 / 2, {
            start: 0.5 * Math.PI,
            end: 2.5 * Math.PI,
            open: false
          });
        },
        diamond: function(t10, e10, i10, s10) {
          return [["M", t10 + i10 / 2, e10], ["L", t10 + i10, e10 + s10 / 2], ["L", t10 + i10 / 2, e10 + s10], ["L", t10, e10 + s10 / 2], ["Z"]];
        },
        rect: iA,
        roundedRect: iT,
        square: iA,
        triangle: function(t10, e10, i10, s10) {
          return [["M", t10 + i10 / 2, e10], ["L", t10 + i10, e10 + s10], ["L", t10, e10 + s10], ["Z"]];
        },
        "triangle-down": function(t10, e10, i10, s10) {
          return [["M", t10, e10], ["L", t10 + i10, e10], ["L", t10 + i10 / 2, e10 + s10], ["Z"]];
        }
      }, {
        doc: iP,
        SVG_NS: iO,
        win: iE
      } = V, {
        attr: iL,
        extend: iB,
        fireEvent: iD,
        isString: iI,
        objectEach: iz,
        pick: iR
      } = tx, iN = (t10, e10) => t10.substring(0, e10) + "…", iW = class {
        constructor(t10) {
          const e10 = t10.styles;
          this.renderer = t10.renderer, this.svgElement = t10, this.width = t10.textWidth, this.textLineHeight = e10?.lineHeight, this.textOutline = e10?.textOutline, this.ellipsis = e10?.textOverflow === "ellipsis", this.lineClamp = e10?.lineClamp, this.noWrap = e10?.whiteSpace === "nowrap";
        }
        buildSVG() {
          let t10 = this.svgElement, e10 = t10.element, i10 = t10.renderer, s10 = iR(t10.textStr, "").toString(), o10 = -1 !== s10.indexOf("<"), r10 = e10.childNodes, a10 = !t10.added && i10.box, n10 = [s10, this.ellipsis, this.noWrap, this.textLineHeight, this.textOutline, t10.getStyle("font-size"), t10.styles.lineClamp, this.width].join(",");
          if (n10 !== t10.textCache) {
            t10.textCache = n10, delete t10.actualWidth;
            for (let t11 = r10.length; t11--; ) e10.removeChild(r10[t11]);
            if (o10 || this.ellipsis || this.width || t10.textPath || -1 !== s10.indexOf(" ") && (!this.noWrap || /<br.*?>/g.test(s10))) {
              if ("" !== s10) {
                a10 && a10.appendChild(e10);
                let i11 = new ey(s10);
                this.modifyTree(i11.nodes), i11.addToDOM(e10), this.modifyDOM(), this.ellipsis && -1 !== (e10.textContent || "").indexOf("…") && t10.attr("title", this.unescapeEntities(t10.textStr || "", ["&lt;", "&gt;"])), a10 && a10.removeChild(e10);
              }
            } else e10.appendChild(iP.createTextNode(this.unescapeEntities(s10)));
            iI(this.textOutline) && t10.applyTextOutline && t10.applyTextOutline(this.textOutline);
          }
        }
        modifyDOM() {
          let t10, e10 = this.svgElement, i10 = iL(e10.element, "x");
          for (e10.firstLineMetrics = void 0; t10 = e10.element.firstChild; ) if (/^[\s\u200B]*$/.test(t10.textContent || " ")) e10.element.removeChild(t10);
          else break;
          [].forEach.call(e10.element.querySelectorAll("tspan.highcharts-br"), (t11, s11) => {
            t11.nextSibling && t11.previousSibling && (0 === s11 && 1 === t11.previousSibling.nodeType && (e10.firstLineMetrics = e10.renderer.fontMetrics(t11.previousSibling)), iL(t11, {
              dy: this.getLineHeight(t11.nextSibling),
              x: i10
            }));
          });
          let s10 = this.width || 0;
          if (!s10) return;
          let o10 = (t11, o11) => {
            let r11 = t11.textContent || "", a10 = r11.replace(/([^\^])-/g, "$1- ").split(" "), n10 = !this.noWrap && (a10.length > 1 || e10.element.childNodes.length > 1), h10 = this.getLineHeight(o11), l10 = Math.max(0, s10 - 0.8 * h10), d10 = 0, c10 = e10.actualWidth;
            if (n10) {
              let r12 = [], n11 = [];
              for (; o11.firstChild && o11.firstChild !== t11; ) n11.push(o11.firstChild), o11.removeChild(o11.firstChild);
              for (; a10.length; ) if (a10.length && !this.noWrap && d10 > 0 && (r12.push(t11.textContent || ""), t11.textContent = a10.join(" ").replace(/- /g, "-")), this.truncate(t11, void 0, a10, 0 === d10 && c10 || 0, s10, l10, (t12, e11) => a10.slice(0, e11).join(" ").replace(/- /g, "-")), c10 = e10.actualWidth, d10++, this.lineClamp && d10 >= this.lineClamp) {
                a10.length && (this.truncate(t11, t11.textContent || "", void 0, 0, s10, l10, iN), t11.textContent = t11.textContent?.replace("…", "") + "…");
                break;
              }
              n11.forEach((e11) => {
                o11.insertBefore(e11, t11);
              }), r12.forEach((e11) => {
                o11.insertBefore(iP.createTextNode(e11), t11);
                let s11 = iP.createElementNS(iO, "tspan");
                s11.textContent = "​", iL(s11, {
                  dy: h10,
                  x: i10
                }), o11.insertBefore(s11, t11);
              });
            } else this.ellipsis && r11 && this.truncate(t11, r11, void 0, 0, s10, l10, iN);
          }, r10 = (t11) => {
            [].slice.call(t11.childNodes).forEach((i11) => {
              i11.nodeType === iE.Node.TEXT_NODE ? o10(i11, t11) : (-1 !== i11.className.baseVal.indexOf("highcharts-br") && (e10.actualWidth = 0), r10(i11));
            });
          };
          r10(e10.element);
        }
        getLineHeight(t10) {
          let e10 = t10.nodeType === iE.Node.TEXT_NODE ? t10.parentElement : t10;
          return this.textLineHeight ? parseInt(this.textLineHeight.toString(), 10) : this.renderer.fontMetrics(e10 || this.svgElement.element).h;
        }
        modifyTree(t10) {
          let e10 = (i10, s10) => {
            let {
              attributes: o10 = {},
              children: r10,
              style: a10 = {},
              tagName: n10
            } = i10, h10 = this.renderer.styledMode;
            if ("b" === n10 || "strong" === n10 ? h10 ? o10.class = "highcharts-strong" : a10.fontWeight = "bold" : ("i" === n10 || "em" === n10) && (h10 ? o10.class = "highcharts-emphasized" : a10.fontStyle = "italic"), a10?.color && (a10.fill = a10.color), "br" === n10) {
              o10.class = "highcharts-br", i10.textContent = "​";
              let e11 = t10[s10 + 1];
              e11?.textContent && (e11.textContent = e11.textContent.replace(/^ +/gm, ""));
            } else "a" === n10 && r10 && r10.some((t11) => "#text" === t11.tagName) && (i10.children = [{
              children: r10,
              tagName: "tspan"
            }]);
            "#text" !== n10 && "a" !== n10 && (i10.tagName = "tspan"), iB(i10, {
              attributes: o10,
              style: a10
            }), r10 && r10.filter((t11) => "#text" !== t11.tagName).forEach(e10);
          };
          t10.forEach(e10), iD(this.svgElement, "afterModifyTree", {
            nodes: t10
          });
        }
        truncate(t10, e10, i10, s10, o10, r10, a10) {
          let n10, h10, l10 = this.svgElement, {
            rotation: d10
          } = l10, c10 = [], p10 = i10 && !s10 ? 1 : 0, u10 = (e10 || i10 || "").length, g2 = u10;
          i10 || (o10 = r10);
          let f2 = function(e11, o11) {
            let r11 = o11 || e11, a11 = t10.parentNode;
            if (a11 && void 0 === c10[r11] && a11.getSubStringLength) try {
              c10[r11] = s10 + a11.getSubStringLength(0, i10 ? r11 + 1 : r11);
            } catch {
            }
            return c10[r11];
          };
          if (l10.rotation = 0, s10 + (h10 = f2(t10.textContent.length)) > o10) {
            for (; p10 <= u10; ) g2 = Math.ceil((p10 + u10) / 2), i10 && (n10 = a10(i10, g2)), h10 = f2(g2, n10 && n10.length - 1), p10 === u10 ? p10 = u10 + 1 : h10 > o10 ? u10 = g2 - 1 : p10 = g2;
            0 === u10 ? t10.textContent = "" : e10 && u10 === e10.length - 1 || (t10.textContent = n10 || a10(e10 || i10, g2)), this.ellipsis && h10 > o10 && this.truncate(t10, t10.textContent || "", void 0, 0, o10, r10, iN);
          }
          i10 && i10.splice(0, g2), l10.actualWidth = h10, l10.rotation = d10;
        }
        unescapeEntities(t10, e10) {
          return iz(this.renderer.escapes, function(i10, s10) {
            e10 && -1 !== e10.indexOf(i10) || (t10 = t10.toString().replace(RegExp(i10, "g"), s10));
          }), t10;
        }
      }, {
        defaultOptions: iG
      } = tY, {
        charts: iX,
        deg2rad: iH,
        doc: iF,
        isFirefox: iY,
        isMS: ij,
        isWebKit: iU,
        noop: iV,
        SVG_NS: i$,
        symbolSizes: i_,
        win: iZ
      } = V, {
        addEvent: iq,
        attr: iK,
        createElement: iJ,
        crisp: iQ,
        css: i0,
        defined: i1,
        destroyObjectProperties: i2,
        extend: i3,
        isArray: i5,
        isNumber: i6,
        isObject: i9,
        isString: i4,
        merge: i8,
        pick: i7,
        pInt: st,
        replaceNested: se,
        uniqueKey: si
      } = tx;
      class ss {
        constructor(t10, e10, i10, s10, o10, r10, a10) {
          let n10, h10;
          this.x = 0, this.y = 0;
          const l10 = this.createElement("svg").attr({
            version: "1.1",
            class: "highcharts-root"
          }), d10 = l10.element;
          a10 || l10.css(this.getStyle(s10 || {})), t10.appendChild(d10), iK(t10, "dir", "ltr"), -1 === t10.innerHTML.indexOf("xmlns") && iK(d10, "xmlns", this.SVG_NS), this.box = d10, this.boxWrapper = l10, this.alignedObjects = [], this.url = this.getReferenceURL(), this.createElement("desc").add().element.appendChild(iF.createTextNode("Created with Highcharts 12.5.0")), this.defs = this.createElement("defs").add(), this.allowHTML = r10, this.forExport = o10, this.styledMode = a10, this.gradients = {}, this.cache = {}, this.cacheKeys = [], this.imgCount = 0, this.rootFontSize = l10.getStyle("font-size"), this.setSize(e10, i10, false), iY && t10.getBoundingClientRect && ((n10 = function() {
            i0(t10, {
              left: 0,
              top: 0
            }), h10 = t10.getBoundingClientRect(), i0(t10, {
              left: Math.ceil(h10.left) - h10.left + "px",
              top: Math.ceil(h10.top) - h10.top + "px"
            });
          })(), this.unSubPixelFix = iq(iZ, "resize", n10));
        }
        definition(t10) {
          return new ey([t10]).addToDOM(this.defs.element);
        }
        getReferenceURL() {
          if ((iY || iU) && iF.getElementsByTagName("base").length) {
            if (!i1(e)) {
              let t10 = si(), i10 = new ey([{
                tagName: "svg",
                attributes: {
                  width: 8,
                  height: 8
                },
                children: [{
                  tagName: "defs",
                  children: [{
                    tagName: "clipPath",
                    attributes: {
                      id: t10
                    },
                    children: [{
                      tagName: "rect",
                      attributes: {
                        width: 4,
                        height: 4
                      }
                    }]
                  }]
                }, {
                  tagName: "rect",
                  attributes: {
                    id: "hitme",
                    width: 8,
                    height: 8,
                    "clip-path": `url(#${t10})`,
                    fill: "rgba(0,0,0,0.001)"
                  }
                }]
              }]).addToDOM(iF.body);
              i0(i10, {
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 9e5
              });
              let s10 = iF.elementFromPoint(6, 6);
              e = s10?.id === "hitme", iF.body.removeChild(i10);
            }
            if (e) return se(iZ.location.href.split("#")[0], [/<[^>]*>/g, ""], [/([\('\)])/g, "\\$1"], [/ /g, "%20"]);
          }
          return "";
        }
        getStyle(t10) {
          return this.style = i3({
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
            fontSize: "1rem"
          }, t10), this.style;
        }
        setStyle(t10) {
          this.boxWrapper.css(this.getStyle(t10));
        }
        isHidden() {
          return !this.boxWrapper.getBBox().width;
        }
        destroy() {
          let t10 = this.defs;
          return this.box = null, this.boxWrapper = this.boxWrapper.destroy(), i2(this.gradients || {}), this.gradients = null, this.defs = t10.destroy(), this.unSubPixelFix && this.unSubPixelFix(), this.alignedObjects = null, null;
        }
        createElement(t10) {
          return new this.Element(this, t10);
        }
        getRadialAttr(t10, e10) {
          return {
            cx: t10[0] - t10[2] / 2 + (e10.cx || 0) * t10[2],
            cy: t10[1] - t10[2] / 2 + (e10.cy || 0) * t10[2],
            r: (e10.r || 0) * t10[2]
          };
        }
        shadowDefinition(t10) {
          let e10 = [`highcharts-drop-shadow-${this.chartIndex}`, ...Object.keys(t10).map((e11) => `${e11}-${t10[e11]}`)].join("-").toLowerCase().replace(/[^a-z\d\-]/g, ""), i10 = i8({
            color: "#000000",
            offsetX: 1,
            offsetY: 1,
            opacity: 0.15,
            width: 5
          }, t10);
          return this.defs.element.querySelector(`#${e10}`) || this.definition({
            tagName: "filter",
            attributes: {
              id: e10,
              filterUnits: i10.filterUnits
            },
            children: this.getShadowFilterContent(i10)
          }), e10;
        }
        getShadowFilterContent(t10) {
          return [{
            tagName: "feDropShadow",
            attributes: {
              dx: t10.offsetX,
              dy: t10.offsetY,
              "flood-color": t10.color,
              "flood-opacity": Math.min(5 * t10.opacity, 1),
              stdDeviation: t10.width / 2
            }
          }];
        }
        buildText(t10) {
          new iW(t10).buildSVG();
        }
        getContrast(t10) {
          if ("transparent" === t10) return "#000000";
          let e10 = tJ.parse(t10).rgba, i10 = " clamp(0,calc(9e9*(0.5 - (0.2126*r + 0.7152*g + 0.0722*b))),1)";
          if (i6(e10[0]) || !tJ.useColorMix) {
            let t11 = e10.map((t12) => {
              let e11 = t12 / 255;
              return e11 <= 0.04 ? e11 / 12.92 : Math.pow((e11 + 0.055) / 1.055, 2.4);
            }), i11 = 0.2126 * t11[0] + 0.7152 * t11[1] + 0.0722 * t11[2];
            return 1.05 / (i11 + 0.05) > (i11 + 0.05) / 0.05 ? "#FFFFFF" : "#000000";
          }
          return "color(from " + t10 + " srgb" + i10 + i10 + i10 + ")";
        }
        button(t10, e10, i10, s10, o10 = {}, r10, a10, n10, h10, l10) {
          let d10 = this.label(t10, e10, i10, h10, void 0, void 0, l10, void 0, "button"), c10 = this.styledMode, p10 = arguments, u10 = 0;
          o10 = i8(iG.global.buttonTheme, o10), c10 && (delete o10.fill, delete o10.stroke, delete o10["stroke-width"]);
          let g2 = o10.states || {}, f2 = o10.style || {};
          delete o10.states, delete o10.style;
          let m2 = [ey.filterUserAttributes(o10)], x2 = [f2];
          return c10 || ["hover", "select", "disabled"].forEach((t11, e11) => {
            m2.push(i8(m2[0], ey.filterUserAttributes(p10[e11 + 5] || g2[t11] || {}))), x2.push(m2[e11 + 1].style), delete m2[e11 + 1].style;
          }), iq(d10.element, ij ? "mouseover" : "mouseenter", function() {
            3 !== u10 && d10.setState(1);
          }), iq(d10.element, ij ? "mouseout" : "mouseleave", function() {
            3 !== u10 && d10.setState(u10);
          }), d10.setState = (t11 = 0) => {
            if (1 !== t11 && (d10.state = u10 = t11), d10.removeClass(/highcharts-button-(normal|hover|pressed|disabled)/).addClass("highcharts-button-" + ["normal", "hover", "pressed", "disabled"][t11]), !c10) {
              d10.attr(m2[t11]);
              let e11 = x2[t11];
              i9(e11) && d10.css(e11);
            }
          }, d10.attr(m2[0]), !c10 && (d10.css(i3({
            cursor: "default"
          }, f2)), l10 && d10.text.css({
            pointerEvents: "none"
          })), d10.on("touchstart", (t11) => t11.stopPropagation()).on("click", function(t11) {
            3 !== u10 && s10?.call(d10, t11);
          });
        }
        crispLine(t10, e10) {
          let [i10, s10] = t10;
          return i1(i10[1]) && i10[1] === s10[1] && (i10[1] = s10[1] = iQ(i10[1], e10)), i1(i10[2]) && i10[2] === s10[2] && (i10[2] = s10[2] = iQ(i10[2], e10)), t10;
        }
        path(t10) {
          let e10 = this.styledMode ? {} : {
            fill: "none"
          };
          return i5(t10) ? e10.d = t10 : i9(t10) && i3(e10, t10), this.createElement("path").attr(e10);
        }
        circle(t10, e10, i10) {
          let s10 = i9(t10) ? t10 : void 0 === t10 ? {} : {
            x: t10,
            y: e10,
            r: i10
          }, o10 = this.createElement("circle");
          return o10.xSetter = o10.ySetter = function(t11, e11, i11) {
            i11.setAttribute("c" + e11, t11);
          }, o10.attr(s10);
        }
        arc(t10, e10, i10, s10, o10, r10) {
          let a10;
          i9(t10) ? (e10 = (a10 = t10).y, i10 = a10.r, s10 = a10.innerR, o10 = a10.start, r10 = a10.end, t10 = a10.x) : a10 = {
            innerR: s10,
            start: o10,
            end: r10
          };
          let n10 = this.symbol("arc", t10, e10, i10, i10, a10);
          return n10.r = i10, n10;
        }
        rect(t10, e10, i10, s10, o10, r10) {
          let a10 = i9(t10) ? t10 : void 0 === t10 ? {} : {
            x: t10,
            y: e10,
            r: o10,
            width: Math.max(i10 || 0, 0),
            height: Math.max(s10 || 0, 0)
          }, n10 = this.createElement("rect");
          return this.styledMode || (void 0 !== r10 && (a10["stroke-width"] = r10, i3(a10, n10.crisp(a10))), a10.fill = "none"), n10.rSetter = function(t11, e11, i11) {
            n10.r = t11, iK(i11, {
              rx: t11,
              ry: t11
            });
          }, n10.rGetter = function() {
            return n10.r || 0;
          }, n10.attr(a10);
        }
        roundedRect(t10) {
          return this.symbol("roundedRect").attr(t10);
        }
        setSize(t10, e10, i10) {
          this.width = t10, this.height = e10, this.boxWrapper.animate({
            width: t10,
            height: e10
          }, {
            step: function() {
              this.attr({
                viewBox: "0 0 " + this.attr("width") + " " + this.attr("height")
              });
            },
            duration: i7(i10, true) ? void 0 : 0
          }), this.alignElements();
        }
        g(t10) {
          let e10 = this.createElement("g");
          return t10 ? e10.attr({
            class: "highcharts-" + t10
          }) : e10;
        }
        image(t10, e10, i10, s10, o10, r10) {
          let a10 = {
            preserveAspectRatio: "none"
          };
          i6(e10) && (a10.x = e10), i6(i10) && (a10.y = i10), i6(s10) && (a10.width = s10), i6(o10) && (a10.height = o10);
          let n10 = this.createElement("image").attr(a10), h10 = function(e11) {
            n10.attr({
              href: t10
            }), r10.call(n10, e11);
          };
          if (r10) {
            n10.attr({
              href: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
            });
            let e11 = new iZ.Image();
            iq(e11, "load", h10), e11.src = t10, e11.complete && h10({});
          } else n10.attr({
            href: t10
          });
          return n10;
        }
        symbol(t10, e10, i10, s10, o10, r10) {
          let a10, n10, h10, l10, d10 = this, c10 = /^url\((.*?)\)$/, p10 = c10.test(t10), u10 = !p10 && (this.symbols[t10] ? t10 : "circle"), g2 = u10 && this.symbols[u10];
          if (g2) "number" == typeof e10 && (n10 = g2.call(this.symbols, e10 || 0, i10 || 0, s10 || 0, o10 || 0, r10)), a10 = this.path(n10), d10.styledMode || a10.attr("fill", "none"), i3(a10, {
            symbolName: u10 || void 0,
            x: e10,
            y: i10,
            width: s10,
            height: o10
          }), r10 && i3(a10, r10);
          else if (p10) {
            h10 = t10.match(c10)[1];
            let s11 = a10 = this.image(h10);
            s11.imgwidth = i7(r10?.width, i_[h10]?.width), s11.imgheight = i7(r10?.height, i_[h10]?.height), l10 = (t11) => t11.attr({
              width: t11.width,
              height: t11.height
            }), ["width", "height"].forEach((t11) => {
              s11[`${t11}Setter`] = function(t12, e11) {
                this[e11] = t12;
                let {
                  alignByTranslate: i11,
                  element: s12,
                  width: o11,
                  height: a11,
                  imgwidth: n11,
                  imgheight: h11
                } = this, l11 = "width" === e11 ? n11 : h11, d11 = 1;
                r10 && "within" === r10.backgroundSize && o11 && a11 && n11 && h11 ? (d11 = Math.min(o11 / n11, a11 / h11), iK(s12, {
                  width: Math.round(n11 * d11),
                  height: Math.round(h11 * d11)
                })) : s12 && l11 && s12.setAttribute(e11, l11), !i11 && n11 && h11 && this.translate(((o11 || 0) - n11 * d11) / 2, ((a11 || 0) - h11 * d11) / 2);
              };
            }), i1(e10) && s11.attr({
              x: e10,
              y: i10
            }), s11.isImg = true, s11.symbolUrl = t10, i1(s11.imgwidth) && i1(s11.imgheight) ? l10(s11) : (s11.attr({
              width: 0,
              height: 0
            }), iJ("img", {
              onload: function() {
                let t11 = iX[d10.chartIndex];
                0 === this.width && (i0(this, {
                  position: "absolute",
                  top: "-999em"
                }), iF.body.appendChild(this)), i_[h10] = {
                  width: this.width,
                  height: this.height
                }, s11.imgwidth = this.width, s11.imgheight = this.height, s11.element && l10(s11), this.parentNode && this.parentNode.removeChild(this), d10.imgCount--, d10.imgCount || !t11 || t11.hasLoaded || t11.onload();
              },
              src: h10
            }), this.imgCount++);
          }
          return a10;
        }
        clipRect(t10, e10, i10, s10) {
          return this.rect(t10, e10, i10, s10, 0);
        }
        text(t10, e10, i10, s10) {
          let o10 = {};
          if (s10 && (this.allowHTML || !this.forExport)) return this.html(t10, e10, i10);
          o10.x = Math.round(e10 || 0), i10 && (o10.y = Math.round(i10)), i1(t10) && (o10.text = t10);
          let r10 = this.createElement("text").attr(o10);
          return s10 && (!this.forExport || this.allowHTML) || (r10.xSetter = function(t11, e11, i11) {
            let s11 = i11.getElementsByTagName("tspan"), o11 = i11.getAttribute(e11);
            for (let i12 = 0, r11; i12 < s11.length; i12++) (r11 = s11[i12]).getAttribute(e11) === o11 && r11.setAttribute(e11, t11);
            i11.setAttribute(e11, t11);
          }), r10;
        }
        fontMetrics(t10) {
          let e10 = i6(t10) ? t10 : st(ic.prototype.getStyle.call(t10, "font-size") || 0), i10 = e10 < 24 ? e10 + 3 : Math.round(1.2 * e10), s10 = Math.round(0.8 * i10);
          return {
            h: i10,
            b: s10,
            f: e10
          };
        }
        rotCorr(t10, e10, i10) {
          let s10 = t10;
          return e10 && i10 && (s10 = Math.max(s10 * Math.cos(e10 * iH), 4)), {
            x: -t10 / 3 * Math.sin(e10 * iH),
            y: s10
          };
        }
        pathToSegments(t10) {
          let e10 = [], i10 = [], s10 = {
            A: 8,
            C: 7,
            H: 2,
            L: 3,
            M: 3,
            Q: 5,
            S: 5,
            T: 3,
            V: 2
          };
          for (let o10 = 0; o10 < t10.length; o10++) i4(i10[0]) && i6(t10[o10]) && i10.length === s10[i10[0].toUpperCase()] && t10.splice(o10, 0, i10[0].replace("M", "L").replace("m", "l")), "string" == typeof t10[o10] && (i10.length && e10.push(i10.slice(0)), i10.length = 0), i10.push(t10[o10]);
          return e10.push(i10.slice(0)), e10;
        }
        label(t10, e10, i10, s10, o10, r10, a10, n10, h10) {
          return new iv(this, t10, e10, i10, s10, o10, r10, a10, n10, h10);
        }
        alignElements() {
          this.alignedObjects.forEach((t10) => t10.align());
        }
      }
      i3(ss.prototype, {
        Element: ic,
        SVG_NS: i$,
        escapes: {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        },
        symbols: iC,
        draw: iV
      }), ez.registerRendererType("svg", ss, true);
      let {
        composed: so,
        isFirefox: sr
      } = V, {
        attr: sa,
        css: sn,
        createElement: sh,
        defined: sl,
        extend: sd,
        getAlignFactor: sc,
        isNumber: sp,
        pInt: su,
        pushUnique: sg
      } = tx;
      function sf(t10, e10, i10) {
        let s10 = this.div?.style;
        ic.prototype[`${e10}Setter`].call(this, t10, e10, i10), s10 && (i10.style[e10] = s10[e10] = t10);
      }
      let sm = (t10, e10) => {
        if (!t10.div) {
          let i10 = sa(t10.element, "class"), s10 = t10.css, o10 = sh("div", i10 ? {
            className: i10
          } : void 0, __spreadProps(__spreadValues({
            position: "absolute",
            left: `${t10.translateX || 0}px`,
            top: `${t10.translateY || 0}px`
          }, t10.styles), {
            display: t10.display,
            opacity: t10.opacity,
            visibility: t10.visibility
          }), t10.parentGroup?.div || e10);
          t10.classSetter = (t11, e11, i11) => {
            i11.setAttribute("class", t11), o10.className = t11;
          }, t10.translateXSetter = t10.translateYSetter = (e11, i11) => {
            t10[i11] = e11, o10.style["translateX" === i11 ? "left" : "top"] = `${e11}px`, t10.doTransform = true;
          }, t10.scaleXSetter = t10.scaleYSetter = (e11, i11) => {
            t10[i11] = e11, t10.doTransform = true;
          }, t10.opacitySetter = t10.visibilitySetter = sf, t10.css = (e11) => (s10.call(t10, e11), e11.cursor && (o10.style.cursor = e11.cursor), e11.pointerEvents && (o10.style.pointerEvents = e11.pointerEvents), t10), t10.on = function() {
            return ic.prototype.on.apply({
              element: o10,
              onEvents: t10.onEvents
            }, arguments), t10;
          }, t10.div = o10;
        }
        return t10.div;
      };
      class sx extends ic {
        static compose(t10) {
          sg(so, this.compose) && (t10.prototype.html = function(t11, e10, i10) {
            return new sx(this, "span").attr({
              text: t11,
              x: Math.round(e10),
              y: Math.round(i10)
            });
          });
        }
        constructor(t10, e10) {
          super(t10, e10), sx.useForeignObject ? this.foreignObject = t10.createElement("foreignObject").attr({
            zIndex: 2
          }) : this.css(__spreadValues({
            position: "absolute"
          }, t10.styledMode ? {} : {
            fontFamily: t10.style.fontFamily,
            fontSize: t10.style.fontSize
          })), this.element.style.whiteSpace = "nowrap";
        }
        getSpanCorrection(t10, e10, i10) {
          this.xCorr = -t10 * i10, this.yCorr = -e10;
        }
        css(t10) {
          let e10, {
            element: i10
          } = this, s10 = "SPAN" === i10.tagName && t10 && "width" in t10, o10 = s10 && t10.width;
          return s10 && (delete t10.width, this.textWidth = su(o10) || void 0, e10 = true), t10?.textOverflow === "ellipsis" && (t10.overflow = "hidden", t10.whiteSpace = "nowrap"), t10?.lineClamp && (t10.display = "-webkit-box", t10.WebkitLineClamp = t10.lineClamp, t10.WebkitBoxOrient = "vertical", t10.overflow = "hidden"), sp(Number(t10?.fontSize)) && (t10.fontSize += "px"), sd(this.styles, t10), sn(i10, t10), e10 && this.updateTransform(), this;
        }
        htmlGetBBox() {
          let {
            element: t10
          } = this;
          return {
            x: t10.offsetLeft,
            y: t10.offsetTop,
            width: t10.offsetWidth,
            height: t10.offsetHeight
          };
        }
        updateTransform() {
          if (!this.added) {
            this.alignOnAdd = true;
            return;
          }
          let {
            element: t10,
            foreignObject: e10,
            oldTextWidth: i10,
            renderer: s10,
            rotation: o10,
            rotationOriginX: r10,
            rotationOriginY: a10,
            scaleX: n10,
            scaleY: h10,
            styles: {
              display: l10 = "inline-block",
              whiteSpace: d10
            },
            textAlign: c10 = "left",
            textWidth: p10,
            translateX: u10 = 0,
            translateY: g2 = 0,
            x: f2 = 0,
            y: m2 = 0
          } = this, x2 = () => this.textPxLength ? this.textPxLength : (sn(t10, {
            width: "",
            whiteSpace: d10 || "nowrap"
          }), t10.offsetWidth);
          if (e10 || sn(t10, {
            marginLeft: `${u10}px`,
            marginTop: `${g2}px`
          }), "SPAN" === t10.tagName) {
            let u11, g3 = [o10, c10, t10.innerHTML, p10, this.textAlign].join(","), y2 = -(this.parentGroup?.padding * 1) || 0;
            if (p10 !== i10) {
              let e11 = x2(), r11 = p10 || 0, a11 = !s10.styledMode && "" === t10.style.textOverflow && t10.style.webkitLineClamp;
              (r11 > i10 || e11 > r11 || a11) && (/[\-\s\u00AD]/.test(t10.textContent || t10.innerText) || "ellipsis" === t10.style.textOverflow) && (sn(t10, {
                width: (o10 || n10 || e11 > r11 || a11) && sp(p10) ? p10 + "px" : "auto",
                display: l10,
                whiteSpace: d10 || "normal"
              }), this.oldTextWidth = p10);
            }
            e10 && (sn(t10, {
              display: "inline-block",
              verticalAlign: "top"
            }), e10.attr({
              width: s10.width,
              height: s10.height
            })), g3 !== this.cTT && (u11 = s10.fontMetrics(t10).b, sl(o10) && !e10 && (o10 !== (this.oldRotation || 0) || c10 !== this.oldAlign) && sn(t10, {
              transform: `rotate(${o10}deg)`,
              transformOrigin: `${y2}% ${y2}px`
            }), this.getSpanCorrection(!sl(o10) && !this.textWidth && this.textPxLength || t10.offsetWidth, u11, sc(c10)));
            let {
              xCorr: b2 = 0,
              yCorr: v2 = 0
            } = this, k2 = {
              left: `${f2 + b2}px`,
              top: `${m2 + v2}px`,
              textAlign: c10,
              transformOrigin: `${(r10 ?? f2) - b2 - f2 - y2}px ${(a10 ?? m2) - v2 - m2 - y2}px`
            };
            (n10 || h10) && (k2.transform = `scale(${n10 ?? 1},${h10 ?? 1})`), e10 ? (super.updateTransform(), sp(f2) && sp(m2) ? (e10.attr({
              x: f2 + b2,
              y: m2 + v2,
              width: t10.offsetWidth + 3,
              height: t10.offsetHeight,
              "transform-origin": t10.getAttribute("transform-origin") || "0 0"
            }), sn(t10, {
              display: l10,
              textAlign: c10
            })) : sr && e10.attr({
              width: 0,
              height: 0
            })) : sn(t10, k2), this.cTT = g3, this.oldRotation = o10, this.oldAlign = c10;
          }
        }
        add(t10) {
          let {
            foreignObject: e10,
            renderer: i10
          } = this, s10 = i10.box.parentNode, o10 = [];
          if (e10) e10.add(t10), super.add(i10.createElement("body").attr({
            xmlns: "http://www.w3.org/1999/xhtml"
          }).css({
            background: "transparent",
            margin: "0 3px 0 0"
          }).add(e10));
          else {
            let e11;
            if (this.parentGroup = t10, t10 && !(e11 = t10.div)) {
              let i11 = t10;
              for (; i11; ) o10.push(i11), i11 = i11.parentGroup;
              for (let t11 of o10.reverse()) e11 = sm(t11, s10);
            }
            (e11 || s10).appendChild(this.element);
          }
          return this.added = true, this.alignOnAdd && this.updateTransform(), this;
        }
        textSetter(t10) {
          t10 !== this.textStr && (delete this.bBox, delete this.oldTextWidth, ey.setElementHTML(this.element, t10 ?? ""), this.textStr = t10, this.doTransform = true);
        }
        alignSetter(t10) {
          this.alignValue = this.textAlign = t10, this.doTransform = true;
        }
        xSetter(t10, e10) {
          this[e10] = t10, this.doTransform = true;
        }
      }
      let sy = sx.prototype;
      sy.visibilitySetter = sy.opacitySetter = sf, sy.ySetter = sy.rotationSetter = sy.rotationOriginXSetter = sy.rotationOriginYSetter = sy.xSetter, (p = w || (w = {})).xAxis = {
        alignTicks: true,
        allowDecimals: void 0,
        panningEnabled: true,
        zIndex: 2,
        zoomEnabled: true,
        dateTimeLabelFormats: {
          millisecond: {
            main: "%[HMSL]",
            range: false
          },
          second: {
            main: "%[HMS]",
            range: false
          },
          minute: {
            main: "%[HM]",
            range: false
          },
          hour: {
            main: "%[HM]",
            range: false
          },
          day: {
            main: "%[eb]"
          },
          week: {
            main: "%[eb]"
          },
          month: {
            main: "%[bY]"
          },
          year: {
            main: "%Y"
          }
        },
        endOnTick: false,
        gridLineDashStyle: "Solid",
        gridZIndex: 1,
        labels: {
          autoRotationLimit: 80,
          distance: 15,
          enabled: true,
          indentation: 10,
          overflow: "justify",
          reserveSpace: void 0,
          rotation: void 0,
          staggerLines: 0,
          step: 0,
          useHTML: false,
          zIndex: 7,
          style: {
            color: "#333333",
            cursor: "default",
            fontSize: "0.8em",
            textOverflow: "ellipsis"
          }
        },
        maxPadding: 0.01,
        minorGridLineDashStyle: "Solid",
        minorTickLength: 2,
        minorTickPosition: "outside",
        minorTicksPerMajor: 5,
        minPadding: 0.01,
        offset: void 0,
        reversed: void 0,
        reversedStacks: false,
        showEmpty: true,
        showFirstLabel: true,
        showLastLabel: true,
        startOfWeek: 1,
        startOnTick: false,
        tickLength: 10,
        tickmarkPlacement: "between",
        tickPixelInterval: 100,
        tickPosition: "outside",
        title: {
          align: "middle",
          useHTML: false,
          x: 0,
          y: 0,
          style: {
            color: "#666666",
            fontSize: "0.8em"
          }
        },
        visible: true,
        minorGridLineColor: "#f2f2f2",
        minorGridLineWidth: 1,
        minorTickColor: "#999999",
        lineColor: "#333333",
        lineWidth: 1,
        gridLineColor: "#e6e6e6",
        gridLineWidth: void 0,
        tickColor: "#333333"
      }, p.yAxis = {
        reversedStacks: true,
        endOnTick: true,
        maxPadding: 0.05,
        minPadding: 0.05,
        tickPixelInterval: 72,
        showLastLabel: true,
        labels: {
          x: void 0
        },
        startOnTick: true,
        title: {},
        stackLabels: {
          animation: {},
          allowOverlap: false,
          enabled: false,
          crop: true,
          overflow: "justify",
          formatter: function() {
            let {
              numberFormatter: t10
            } = this.axis.chart;
            return t10(this.total || 0, -1);
          },
          style: {
            color: "#000000",
            fontSize: "0.7em",
            fontWeight: "bold",
            textOutline: "1px contrast"
          }
        },
        gridLineWidth: 1,
        lineWidth: 0
      };
      let sb = w, {
        addEvent: sv,
        isFunction: sk,
        objectEach: sM,
        removeEvent: sw
      } = tx;
      (S || (S = {})).registerEventOptions = function(t10, e10) {
        t10.eventOptions = t10.eventOptions || {}, sM(e10.events, function(e11, i10) {
          t10.eventOptions[i10] !== e11 && (t10.eventOptions[i10] && (sw(t10, i10, t10.eventOptions[i10]), delete t10.eventOptions[i10]), sk(e11) && (t10.eventOptions[i10] = e11, sv(t10, i10, e11, {
            order: 0
          })));
        });
      };
      let sS = S, {
        deg2rad: sA
      } = V, {
        clamp: sT,
        correctFloat: sC,
        defined: sP,
        destroyObjectProperties: sO,
        extend: sE,
        fireEvent: sL,
        getAlignFactor: sB,
        isNumber: sD,
        merge: sI,
        objectEach: sz,
        pick: sR
      } = tx, sN = class {
        constructor(t10, e10, i10, s10, o10) {
          this.isNew = true, this.isNewLabel = true, this.axis = t10, this.pos = e10, this.type = i10 || "", this.parameters = o10 || {}, this.tickmarkOffset = this.parameters.tickmarkOffset, this.options = this.parameters.options, sL(this, "init"), i10 || s10 || this.addLabel();
        }
        addLabel() {
          let t10 = this, e10 = t10.axis, i10 = e10.options, s10 = e10.chart, o10 = e10.categories, r10 = e10.logarithmic, a10 = e10.names, n10 = t10.pos, h10 = sR(t10.options?.labels, i10.labels), l10 = e10.tickPositions, d10 = n10 === l10[0], c10 = n10 === l10[l10.length - 1], p10 = (!h10.step || 1 === h10.step) && 1 === e10.tickInterval, u10 = l10.info, g2 = t10.label, f2, m2, x2, y2 = this.parameters.category || (o10 ? sR(o10[n10], a10[n10], n10) : n10);
          r10 && sD(y2) && (y2 = sC(r10.lin2log(y2))), e10.dateTime && (u10 ? f2 = (m2 = s10.time.resolveDTLFormat(i10.dateTimeLabelFormats[!i10.grid?.enabled && u10.higherRanks[n10] || u10.unitName])).main : sD(y2) && (f2 = e10.dateTime.getXDateFormat(y2, i10.dateTimeLabelFormats || {}))), t10.isFirst = d10, t10.isLast = c10;
          let b2 = {
            axis: e10,
            chart: s10,
            dateTimeLabelFormat: f2,
            isFirst: d10,
            isLast: c10,
            pos: n10,
            tick: t10,
            tickPositionInfo: u10,
            value: y2
          };
          sL(this, "labelFormat", b2);
          let v2 = (t11) => h10.formatter ? h10.formatter.call(t11, t11) : h10.format ? (t11.text = e10.defaultLabelFormatter.call(t11), eI.format(h10.format, t11, s10)) : e10.defaultLabelFormatter.call(t11), k2 = v2.call(b2, b2), M2 = m2?.list;
          M2 ? t10.shortenLabel = function() {
            for (x2 = 0; x2 < M2.length; x2++) if (sE(b2, {
              dateTimeLabelFormat: M2[x2]
            }), g2.attr({
              text: v2.call(b2, b2)
            }), g2.getBBox().width < e10.getSlotWidth(t10) - 2 * (h10.padding || 0)) return;
            g2.attr({
              text: ""
            });
          } : t10.shortenLabel = void 0, p10 && e10._addedPlotLB && t10.moveLabel(k2, h10), sP(g2) || t10.movedLabel ? g2 && g2.textStr !== k2 && !p10 && (!g2.textWidth || h10.style.width || g2.styles.width || g2.css({
            width: null
          }), g2.attr({
            text: k2
          }), g2.textPxLength = g2.getBBox().width) : (t10.label = g2 = t10.createLabel(k2, h10), t10.rotation = 0);
        }
        createLabel(t10, e10, i10) {
          let s10 = this.axis, {
            renderer: o10,
            styledMode: r10
          } = s10.chart, a10 = e10.style.whiteSpace, n10 = sP(t10) && e10.enabled ? o10.text(t10, i10?.x, i10?.y, e10.useHTML).add(s10.labelGroup) : void 0;
          return n10 && (r10 || n10.css(sI(e10.style)), n10.textPxLength = n10.getBBox().width, !r10 && a10 && n10.css({
            whiteSpace: a10
          })), n10;
        }
        destroy() {
          sO(this, this.axis);
        }
        getPosition(t10, e10, i10, s10) {
          let o10 = this.axis, r10 = o10.chart, a10 = s10 && r10.oldChartHeight || r10.chartHeight, n10 = {
            x: t10 ? sC(o10.translate(e10 + i10, void 0, void 0, s10) + o10.transB) : o10.left + o10.offset + (o10.opposite ? (s10 && r10.oldChartWidth || r10.chartWidth) - o10.right - o10.left : 0),
            y: t10 ? a10 - o10.bottom + o10.offset - (o10.opposite ? o10.height : 0) : sC(a10 - o10.translate(e10 + i10, void 0, void 0, s10) - o10.transB)
          };
          return n10.y = sT(n10.y, -1e9, 1e9), sL(this, "afterGetPosition", {
            pos: n10
          }), n10;
        }
        getLabelPosition(t10, e10, i10, s10, o10, r10, a10, n10) {
          let h10, l10, d10 = this.axis, c10 = d10.transA, p10 = d10.isLinked && d10.linkedParent ? d10.linkedParent.reversed : d10.reversed, u10 = d10.staggerLines, g2 = d10.tickRotCorr || {
            x: 0,
            y: 0
          }, f2 = s10 || d10.reserveSpaceDefault ? 0 : -d10.labelOffset * ("center" === d10.labelAlign ? 0.5 : 1), m2 = o10.distance, x2 = {};
          return h10 = 0 === d10.side ? i10.rotation ? -m2 : -i10.getBBox().height : 2 === d10.side ? g2.y + m2 : Math.cos(i10.rotation * sA) * (g2.y - i10.getBBox(false, 0).height / 2), sP(o10.y) && (h10 = 0 === d10.side && d10.horiz ? o10.y + h10 : o10.y), t10 = t10 + sR(o10.x, [0, 1, 0, -1][d10.side] * m2) + f2 + g2.x - (r10 && s10 ? r10 * c10 * (p10 ? -1 : 1) : 0), e10 = e10 + h10 - (r10 && !s10 ? r10 * c10 * (p10 ? 1 : -1) : 0), u10 && (l10 = a10 / (n10 || 1) % u10, d10.opposite && (l10 = u10 - l10 - 1), e10 += l10 * (d10.labelOffset / u10)), x2.x = t10, x2.y = Math.round(e10), sL(this, "afterGetLabelPosition", {
            pos: x2,
            tickmarkOffset: r10,
            index: a10
          }), x2;
        }
        getLabelSize() {
          return this.label ? this.label.getBBox()[this.axis.horiz ? "height" : "width"] : 0;
        }
        getMarkPath(t10, e10, i10, s10, o10 = false, r10) {
          return r10.crispLine([["M", t10, e10], ["L", t10 + (o10 ? 0 : -i10), e10 + (o10 ? i10 : 0)]], s10);
        }
        handleOverflow(t10) {
          let e10 = this.axis, i10 = e10.options.labels, s10 = t10.x, o10 = e10.chart.chartWidth, r10 = e10.chart.spacing, a10 = sR(e10.labelLeft, Math.min(e10.pos, r10[3])), n10 = sR(e10.labelRight, Math.max(e10.isRadial ? 0 : e10.pos + e10.len, o10 - r10[1])), h10 = this.label, l10 = this.rotation, d10 = sB(e10.labelAlign || h10.attr("align")), c10 = h10.getBBox().width, p10 = e10.getSlotWidth(this), u10 = p10, g2 = 1, f2;
          l10 || "justify" !== i10.overflow ? l10 < 0 && s10 - d10 * c10 < a10 ? f2 = Math.round(s10 / Math.cos(l10 * sA) - a10) : l10 > 0 && s10 + d10 * c10 > n10 && (f2 = Math.round((o10 - s10) / Math.cos(l10 * sA))) : (s10 - d10 * c10 < a10 ? u10 = t10.x + u10 * (1 - d10) - a10 : s10 + (1 - d10) * c10 > n10 && (u10 = n10 - t10.x + u10 * d10, g2 = -1), (u10 = Math.min(p10, u10)) < p10 && "center" === e10.labelAlign && (t10.x += g2 * (p10 - u10 - d10 * (p10 - Math.min(c10, u10)))), (c10 > u10 || e10.autoRotation && h10?.styles?.width) && (f2 = u10)), f2 && h10 && (this.shortenLabel ? this.shortenLabel() : h10.css(sE({}, {
            width: Math.floor(f2) + "px",
            lineClamp: +!e10.isRadial
          })));
        }
        moveLabel(t10, e10) {
          let i10 = this, s10 = i10.label, o10 = i10.axis, r10 = false, a10;
          s10 && s10.textStr === t10 ? (i10.movedLabel = s10, r10 = true, delete i10.label) : sz(o10.ticks, function(e11) {
            r10 || e11.isNew || e11 === i10 || !e11.label || e11.label.textStr !== t10 || (i10.movedLabel = e11.label, r10 = true, e11.labelPos = i10.movedLabel.xy, delete e11.label);
          }), !r10 && (i10.labelPos || s10) && (a10 = i10.labelPos || s10.xy, i10.movedLabel = i10.createLabel(t10, e10, a10), i10.movedLabel && i10.movedLabel.attr({
            opacity: 0
          }));
        }
        render(t10, e10, i10) {
          let s10 = this.axis, o10 = s10.horiz, r10 = this.pos, a10 = sR(this.tickmarkOffset, s10.tickmarkOffset), n10 = this.getPosition(o10, r10, a10, e10), h10 = n10.x, l10 = n10.y, d10 = s10.pos, c10 = d10 + s10.len, p10 = o10 ? h10 : l10, u10 = sR(i10, this.label?.newOpacity, 1);
          !s10.chart.polar && (sC(p10) < d10 || p10 > c10) && (i10 = 0), i10 ?? (i10 = 1), this.isActive = true, this.renderGridLine(e10, i10), this.renderMark(n10, i10), this.renderLabel(n10, e10, u10, t10), this.isNew = false, sL(this, "afterRender");
        }
        renderGridLine(t10, e10) {
          let i10 = this.axis, s10 = i10.options, o10 = {}, r10 = this.pos, a10 = this.type, n10 = sR(this.tickmarkOffset, i10.tickmarkOffset), h10 = i10.chart.renderer, l10 = this.gridLine, d10, c10 = s10.gridLineWidth, p10 = s10.gridLineColor, u10 = s10.gridLineDashStyle;
          "minor" === this.type && (c10 = s10.minorGridLineWidth, p10 = s10.minorGridLineColor, u10 = s10.minorGridLineDashStyle), l10 || (i10.chart.styledMode || (o10.stroke = p10, o10["stroke-width"] = c10 || 0, o10.dashstyle = u10), a10 || (o10.zIndex = 1), t10 && (e10 = 0), this.gridLine = l10 = h10.path().attr(o10).addClass("highcharts-" + (a10 ? a10 + "-" : "") + "grid-line").add(i10.gridGroup)), l10 && (d10 = i10.getPlotLinePath({
            value: r10 + n10,
            lineWidth: l10.strokeWidth(),
            force: "pass",
            old: t10,
            acrossPanes: false
          })) && l10[t10 || this.isNew ? "attr" : "animate"]({
            d: d10,
            opacity: e10
          });
        }
        renderMark(t10, e10) {
          let i10 = this.axis, s10 = i10.options, o10 = i10.chart.renderer, r10 = this.type, a10 = i10.tickSize(r10 ? r10 + "Tick" : "tick"), n10 = t10.x, h10 = t10.y, l10 = sR(s10["minor" !== r10 ? "tickWidth" : "minorTickWidth"], !r10 && i10.isXAxis ? 1 : 0), d10 = s10["minor" !== r10 ? "tickColor" : "minorTickColor"], c10 = this.mark, p10 = !c10;
          a10 && (i10.opposite && (a10[0] = -a10[0]), !c10 && (this.mark = c10 = o10.path().addClass("highcharts-" + (r10 ? r10 + "-" : "") + "tick").add(i10.axisGroup), i10.chart.styledMode || c10.attr({
            stroke: d10,
            "stroke-width": l10
          })), c10[p10 ? "attr" : "animate"]({
            d: this.getMarkPath(n10, h10, a10[0], c10.strokeWidth(), i10.horiz, o10),
            opacity: e10
          }));
        }
        renderLabel(t10, e10, i10, s10) {
          let o10 = this.axis, r10 = o10.horiz, a10 = o10.options, n10 = this.label, h10 = a10.labels, l10 = h10.step, d10 = sR(this.tickmarkOffset, o10.tickmarkOffset), c10 = t10.x, p10 = t10.y, u10 = true;
          n10 && sD(c10) && (n10.xy = t10 = this.getLabelPosition(c10, p10, n10, r10, h10, d10, s10, l10), (!this.isFirst || this.isLast || a10.showFirstLabel) && (!this.isLast || this.isFirst || a10.showLastLabel) ? !r10 || h10.step || h10.rotation || e10 || 0 === i10 || this.handleOverflow(t10) : u10 = false, l10 && s10 % l10 && (u10 = false), u10 && sD(t10.y) ? (t10.opacity = i10, n10[this.isNewLabel ? "attr" : "animate"](t10).show(true), this.isNewLabel = false) : (n10.hide(), this.isNewLabel = true));
        }
        replaceMovedLabel() {
          let t10 = this.label, e10 = this.axis;
          t10 && !this.isNew && (t10.animate({
            opacity: 0
          }, void 0, t10.destroy), delete this.label), e10.isDirty = true, this.label = this.movedLabel, delete this.movedLabel;
        }
      }, {
        animObject: sW
      } = eo, {
        xAxis: sG,
        yAxis: sX
      } = sb, {
        defaultOptions: sH
      } = tY, {
        registerEventOptions: sF
      } = sS, {
        deg2rad: sY
      } = V, {
        arrayMax: sj,
        arrayMin: sU,
        clamp: sV,
        correctFloat: s$,
        defined: s_,
        destroyObjectProperties: sZ,
        erase: sq,
        error: sK,
        extend: sJ,
        fireEvent: sQ,
        getClosestDistance: s0,
        insertItem: s1,
        isArray: s2,
        isNumber: s3,
        isString: s5,
        merge: s6,
        normalizeTickInterval: s9,
        objectEach: s4,
        pick: s8,
        relativeLength: s7,
        removeEvent: ot,
        splat: oe,
        syncTimeout: oi
      } = tx, os = (t10, e10) => s9(e10, void 0, void 0, s8(t10.options.allowDecimals, e10 < 0.5 || void 0 !== t10.tickAmount), !!t10.tickAmount);
      sJ(sH, {
        xAxis: sG,
        yAxis: s6(sG, sX)
      });
      class oo {
        constructor(t10, e10, i10) {
          this.init(t10, e10, i10);
        }
        init(t10, e10, i10 = this.coll) {
          let s10 = "xAxis" === i10, o10 = this.isZAxis || (t10.inverted ? !s10 : s10);
          this.chart = t10, this.horiz = o10, this.isXAxis = s10, this.coll = i10, sQ(this, "init", {
            userOptions: e10
          }), this.opposite = s8(e10.opposite, this.opposite), this.side = s8(e10.side, this.side, o10 ? 2 * !this.opposite : this.opposite ? 1 : 3), this.setOptions(e10);
          let r10 = this.options, a10 = r10.labels;
          this.type ?? (this.type = r10.type || "linear"), this.uniqueNames ?? (this.uniqueNames = r10.uniqueNames ?? true), sQ(this, "afterSetType"), this.userOptions = e10, this.minPixelPadding = 0, this.reversed = s8(r10.reversed, this.reversed), this.visible = r10.visible, this.zoomEnabled = r10.zoomEnabled, this.hasNames = "category" === this.type || true === r10.categories, this.categories = s2(r10.categories) && r10.categories || (this.hasNames ? [] : void 0), this.names || (this.names = [], this.names.keys = {}), this.plotLinesAndBandsGroups = {}, this.positiveValuesOnly = !!this.logarithmic, this.isLinked = s_(r10.linkedTo), this.ticks = {}, this.labelEdge = [], this.minorTicks = {}, this.plotLinesAndBands = [], this.alternateBands = {}, this.len ?? (this.len = 0), this.minRange = this.userMinRange = r10.minRange || r10.maxZoom, this.range = r10.range, this.offset = r10.offset || 0, this.max = void 0, this.min = void 0;
          let n10 = s8(r10.crosshair, oe(t10.options.tooltip.crosshairs)[+!s10]);
          this.crosshair = true === n10 ? {} : n10, -1 === t10.axes.indexOf(this) && (s10 ? t10.axes.splice(t10.xAxis.length, 0, this) : t10.axes.push(this), s1(this, t10[this.coll])), t10.orderItems(this.coll), this.series = this.series || [], t10.inverted && !this.isZAxis && s10 && !s_(this.reversed) && (this.reversed = true), this.labelRotation = s3(a10.rotation) ? a10.rotation : void 0, sF(this, r10), sQ(this, "afterInit");
        }
        setOptions(t10) {
          let e10 = this.horiz ? {
            labels: {
              autoRotation: [-45],
              padding: 3
            },
            margin: 15
          } : {
            labels: {
              padding: 1
            },
            title: {
              rotation: 90 * this.side
            }
          };
          this.options = s6(e10, "yAxis" === this.coll ? {
            title: {
              text: this.chart.options.lang.yAxisTitle
            }
          } : {}, sH[this.coll], t10), sQ(this, "afterSetOptions", {
            userOptions: t10
          });
        }
        defaultLabelFormatter() {
          let t10 = this.axis, {
            numberFormatter: e10
          } = this.chart, i10 = s3(this.value) ? this.value : NaN, s10 = t10.chart.time, o10 = t10.categories, r10 = this.dateTimeLabelFormat, a10 = sH.lang, n10 = a10.numericSymbols, h10 = a10.numericSymbolMagnitude || 1e3, l10 = t10.logarithmic ? Math.abs(i10) : t10.tickInterval, d10 = n10?.length, c10, p10;
          if (o10) p10 = `${this.value}`;
          else if (r10) p10 = s10.dateFormat(r10, i10, true);
          else if (d10 && n10 && l10 >= 1e3) for (; d10-- && void 0 === p10; ) l10 >= (c10 = Math.pow(h10, d10 + 1)) && 10 * i10 % c10 == 0 && null !== n10[d10] && 0 !== i10 && (p10 = e10(i10 / c10, -1) + n10[d10]);
          return void 0 === p10 && (p10 = Math.abs(i10) >= 1e4 ? e10(i10, -1) : e10(i10, -1, void 0, "")), p10;
        }
        getSeriesExtremes() {
          let t10, e10 = this;
          sQ(this, "getSeriesExtremes", null, function() {
            e10.hasVisibleSeries = false, e10.dataMin = e10.dataMax = e10.threshold = void 0, e10.softThreshold = !e10.isXAxis, e10.series.forEach((i10) => {
              if (i10.reserveSpace()) {
                let s10 = i10.options, o10, r10 = s10.threshold, a10, n10;
                if (e10.hasVisibleSeries = true, e10.positiveValuesOnly && 0 >= (r10 || 0) && (r10 = void 0), e10.isXAxis) (o10 = i10.getColumn("x")).length && (o10 = e10.logarithmic ? o10.filter((t11) => t11 > 0) : o10, a10 = (t10 = i10.getXExtremes(o10)).min, n10 = t10.max, s3(a10) || a10 instanceof Date || (o10 = o10.filter(s3), a10 = (t10 = i10.getXExtremes(o10)).min, n10 = t10.max), o10.length && (e10.dataMin = Math.min(s8(e10.dataMin, a10), a10), e10.dataMax = Math.max(s8(e10.dataMax, n10), n10)));
                else {
                  let t11 = i10.applyExtremes();
                  s3(t11.dataMin) && (a10 = t11.dataMin, e10.dataMin = Math.min(s8(e10.dataMin, a10), a10)), s3(t11.dataMax) && (n10 = t11.dataMax, e10.dataMax = Math.max(s8(e10.dataMax, n10), n10)), s_(r10) && (e10.threshold = r10), (!s10.softThreshold || e10.positiveValuesOnly) && (e10.softThreshold = false);
                }
              }
            });
          }), sQ(this, "afterGetSeriesExtremes");
        }
        translate(t10, e10, i10, s10, o10, r10) {
          let a10 = this.linkedParent || this, n10 = s10 && a10.old ? a10.old.min : a10.min;
          if (!s3(n10)) return NaN;
          let h10 = a10.minPixelPadding, l10 = (a10.isOrdinal || a10.brokenAxis?.hasBreaks || a10.logarithmic && o10) && !!a10.lin2val, d10 = 1, c10 = 0, p10 = s10 && a10.old ? a10.old.transA : a10.transA, u10 = 0;
          return p10 || (p10 = a10.transA), i10 && (d10 *= -1, c10 = a10.len), a10.reversed && (d10 *= -1, c10 -= d10 * (a10.sector || a10.len)), e10 ? (u10 = (t10 = t10 * d10 + c10 - h10) / p10 + n10, l10 && (u10 = a10.lin2val(u10))) : (l10 && (t10 = a10.val2lin(t10)), u10 = d10 * (t10 - n10) * p10 + c10 + d10 * h10 + (s3(r10) ? p10 * r10 : 0), a10.isRadial || (u10 = s$(u10))), u10;
        }
        toPixels(t10, e10) {
          return this.translate(this.chart?.time.parse(t10) ?? NaN, false, !this.horiz, void 0, true) + (e10 ? 0 : this.pos);
        }
        toValue(t10, e10) {
          return this.translate(t10 - (e10 ? 0 : this.pos), true, !this.horiz, void 0, true);
        }
        getPlotLinePath(t10) {
          let e10 = this, i10 = e10.chart, s10 = e10.left, o10 = e10.top, r10 = t10.old, a10 = t10.value, n10 = t10.lineWidth, h10 = r10 && i10.oldChartHeight || i10.chartHeight, l10 = r10 && i10.oldChartWidth || i10.chartWidth, d10 = e10.transB, c10 = t10.translatedValue, p10 = t10.force, u10, g2, f2, m2, x2;
          function y2(t11, e11, i11) {
            return "pass" !== p10 && (t11 < e11 || t11 > i11) && (p10 ? t11 = sV(t11, e11, i11) : x2 = true), t11;
          }
          let b2 = {
            value: a10,
            lineWidth: n10,
            old: r10,
            force: p10,
            acrossPanes: t10.acrossPanes,
            translatedValue: c10
          };
          return sQ(this, "getPlotLinePath", b2, function(t11) {
            u10 = f2 = (c10 = sV(c10 = s8(c10, e10.translate(a10, void 0, void 0, r10)), -1e9, 1e9)) + d10, g2 = m2 = h10 - c10 - d10, s3(c10) ? e10.horiz ? (g2 = o10, m2 = h10 - e10.bottom + (e10.options.isInternal ? 0 : i10.scrollablePixelsY || 0), u10 = f2 = y2(u10, s10, s10 + e10.width)) : (u10 = s10, f2 = l10 - e10.right + (i10.scrollablePixelsX || 0), g2 = m2 = y2(g2, o10, o10 + e10.height)) : (x2 = true, p10 = false), t11.path = x2 && !p10 ? void 0 : i10.renderer.crispLine([["M", u10, g2], ["L", f2, m2]], n10 || 1);
          }), b2.path;
        }
        getLinearTickPositions(t10, e10, i10) {
          let s10, o10, r10, a10 = s$(Math.floor(e10 / t10) * t10), n10 = s$(Math.ceil(i10 / t10) * t10), h10 = [];
          if (s$(a10 + t10) === a10 && (r10 = 20), this.single) return [e10];
          for (s10 = a10; s10 <= n10 && (h10.push(s10), (s10 = s$(s10 + t10, r10)) !== o10); ) o10 = s10;
          return h10;
        }
        getMinorTickInterval() {
          let {
            minorTicks: t10,
            minorTickInterval: e10
          } = this.options;
          return true === t10 ? s8(e10, "auto") : false !== t10 ? e10 : void 0;
        }
        getMinorTickPositions() {
          let t10 = this.options, e10 = this.tickPositions, i10 = this.minorTickInterval, s10 = this.pointRangePadding || 0, o10 = (this.min || 0) - s10, r10 = (this.max || 0) + s10, a10 = this.brokenAxis?.hasBreaks ? this.brokenAxis.unitLength : r10 - o10, n10 = [], h10;
          if (a10 && a10 / i10 < this.len / 3) {
            let s11 = this.logarithmic;
            if (s11) this.paddedTicks.forEach(function(t11, e11, o11) {
              e11 && n10.push.apply(n10, s11.getLogTickPositions(i10, o11[e11 - 1], o11[e11], true));
            });
            else if (this.dateTime && "auto" === this.getMinorTickInterval()) n10 = n10.concat(this.getTimeTicks(this.dateTime.normalizeTimeTickInterval(i10), o10, r10, t10.startOfWeek));
            else for (h10 = o10 + (e10[0] - o10) % i10; h10 <= r10 && h10 !== n10[0]; h10 += i10) n10.push(h10);
          }
          return 0 !== n10.length && this.trimTicks(n10), n10;
        }
        adjustForMinRange() {
          let t10 = this.options, e10 = this.logarithmic, i10 = this.chart.time, {
            max: s10,
            min: o10,
            minRange: r10
          } = this, a10, n10, h10, l10;
          this.isXAxis && void 0 === r10 && !e10 && (r10 = s_(t10.min) || s_(t10.max) || s_(t10.floor) || s_(t10.ceiling) ? null : Math.min(5 * (s0(this.series.map((t11) => {
            let e11 = t11.getColumn("x");
            return t11.xIncrement ? e11.slice(0, 2) : e11;
          })) || 0), this.dataMax - this.dataMin)), s3(s10) && s3(o10) && s3(r10) && s10 - o10 < r10 && (n10 = this.dataMax - this.dataMin >= r10, a10 = (r10 - s10 + o10) / 2, h10 = [o10 - a10, i10.parse(t10.min) ?? o10 - a10], n10 && (h10[2] = e10 ? e10.log2lin(this.dataMin) : this.dataMin), l10 = [(o10 = sj(h10)) + r10, i10.parse(t10.max) ?? o10 + r10], n10 && (l10[2] = e10 ? e10.log2lin(this.dataMax) : this.dataMax), (s10 = sU(l10)) - o10 < r10 && (h10[0] = s10 - r10, h10[1] = i10.parse(t10.min) ?? s10 - r10, o10 = sj(h10))), this.minRange = r10, this.min = o10, this.max = s10;
        }
        getClosest() {
          let t10, e10;
          if (this.categories) e10 = 1;
          else {
            let i10 = [];
            this.series.forEach(function(t11) {
              let s10 = t11.closestPointRange, o10 = t11.getColumn("x");
              1 === o10.length ? i10.push(o10[0]) : t11.sorted && s_(s10) && t11.reserveSpace() && (e10 = s_(e10) ? Math.min(e10, s10) : s10);
            }), i10.length && (i10.sort((t11, e11) => t11 - e11), t10 = s0([i10]));
          }
          return t10 && e10 ? Math.min(t10, e10) : t10 || e10;
        }
        nameToX(t10) {
          let e10 = s2(this.options.categories), i10 = e10 ? this.categories : this.names, s10 = t10.options.x, o10;
          return t10.series.requireSorting = false, s_(s10) || (s10 = this.uniqueNames && i10 ? e10 ? i10.indexOf(t10.name) : s8(i10.keys[t10.name], -1) : t10.series.autoIncrement()), -1 === s10 ? !e10 && i10 && (o10 = i10.length) : s3(s10) && (o10 = s10), void 0 !== o10 ? (this.names[o10] = t10.name, this.names.keys[t10.name] = o10) : t10.x && (o10 = t10.x), o10;
        }
        updateNames() {
          let t10 = this, e10 = this.names;
          e10.length > 0 && (Object.keys(e10.keys).forEach(function(t11) {
            delete e10.keys[t11];
          }), e10.length = 0, this.minRange = this.userMinRange, (this.series || []).forEach((e11) => {
            e11.xIncrement = null, (!e11.points || e11.isDirtyData) && (t10.max = Math.max(t10.max || 0, e11.dataTable.rowCount - 1), e11.processData(), e11.generatePoints());
            let i10 = e11.getColumn("x").slice();
            e11.data.forEach((e12, s10) => {
              let o10 = i10[s10];
              e12?.options && void 0 !== e12.name && void 0 !== (o10 = t10.nameToX(e12)) && o10 !== e12.x && (i10[s10] = e12.x = o10);
            }), e11.dataTable.setColumn("x", i10);
          }));
        }
        setAxisTranslation() {
          let t10 = this, e10 = t10.max - t10.min, i10 = t10.linkedParent, s10 = !!t10.categories, o10 = t10.isXAxis, r10 = t10.axisPointRange || 0, a10, n10 = 0, h10 = 0, l10, d10 = t10.transA;
          (o10 || s10 || r10) && (a10 = t10.getClosest(), i10 ? (n10 = i10.minPointOffset, h10 = i10.pointRangePadding) : t10.series.forEach(function(e11) {
            let i11 = s10 ? 1 : o10 ? s8(e11.options.pointRange, a10, 0) : t10.axisPointRange || 0, l11 = e11.options.pointPlacement;
            if (r10 = Math.max(r10, i11), !t10.single || s10) {
              let t11 = e11.is("xrange") ? !o10 : o10;
              n10 = Math.max(n10, t11 && s5(l11) ? 0 : i11 / 2), h10 = Math.max(h10, t11 && "on" === l11 ? 0 : i11);
            }
          }), l10 = t10.ordinal?.slope && a10 ? t10.ordinal.slope / a10 : 1, t10.minPointOffset = n10 *= l10, t10.pointRangePadding = h10 *= l10, t10.pointRange = Math.min(r10, t10.single && s10 ? 1 : e10), o10 && (t10.closestPointRange = a10)), t10.translationSlope = t10.transA = d10 = t10.staticScale || t10.len / (e10 + h10 || 1), t10.transB = t10.horiz ? t10.left : t10.bottom, t10.minPixelPadding = d10 * n10, sQ(this, "afterSetAxisTranslation");
        }
        minFromRange() {
          let {
            max: t10,
            min: e10
          } = this;
          return s3(t10) && s3(e10) && t10 - e10 || void 0;
        }
        setTickInterval(t10) {
          let {
            categories: e10,
            chart: i10,
            dataMax: s10,
            dataMin: o10,
            dateTime: r10,
            isXAxis: a10,
            logarithmic: n10,
            options: h10,
            softThreshold: l10
          } = this, d10 = i10.time, c10 = s3(this.threshold) ? this.threshold : void 0, p10 = this.minRange || 0, {
            ceiling: u10,
            floor: g2,
            linkedTo: f2,
            softMax: m2,
            softMin: x2
          } = h10, y2 = s3(f2) && i10[this.coll]?.[f2], b2 = h10.tickPixelInterval, v2 = h10.maxPadding, k2 = h10.minPadding, M2 = 0, w2, S2 = s3(h10.tickInterval) && h10.tickInterval >= 0 ? h10.tickInterval : void 0, A2, T2, C2, P2;
          if (r10 || e10 || y2 || this.getTickAmount(), C2 = s8(this.userMin, d10.parse(h10.min)), P2 = s8(this.userMax, d10.parse(h10.max)), y2 ? (this.linkedParent = y2, w2 = y2.getExtremes(), this.min = s8(w2.min, w2.dataMin), this.max = s8(w2.max, w2.dataMax), this.type !== y2.type && sK(11, true, i10)) : (l10 && s_(c10) && s3(s10) && s3(o10) && (o10 >= c10 ? (A2 = c10, k2 = 0) : s10 <= c10 && (T2 = c10, v2 = 0)), this.min = s8(C2, A2, o10), this.max = s8(P2, T2, s10)), s3(this.max) && s3(this.min) && (n10 && (this.positiveValuesOnly && !t10 && 0 >= Math.min(this.min, s8(o10, this.min)) && sK(10, true, i10), this.min = s$(n10.log2lin(this.min), 16), this.max = s$(n10.log2lin(this.max), 16)), this.range && s3(o10) && (this.userMin = this.min = C2 = Math.max(o10, this.minFromRange() || 0), this.userMax = P2 = this.max, this.range = void 0)), sQ(this, "foundExtremes"), this.adjustForMinRange(), s3(this.min) && s3(this.max)) {
            if (!s3(this.userMin) && s3(x2) && x2 < this.min && (this.min = C2 = x2), !s3(this.userMax) && s3(m2) && m2 > this.max && (this.max = P2 = m2), e10 || this.axisPointRange || this.stacking?.usePercentage || y2 || (M2 = this.max - this.min) && (!s_(C2) && k2 && (this.min -= M2 * k2), !s_(P2) && v2 && (this.max += M2 * v2)), !s3(this.userMin) && s3(g2) && (this.min = Math.max(this.min, g2)), !s3(this.userMax) && s3(u10) && (this.max = Math.min(this.max, u10)), l10 && s3(o10) && s3(s10)) {
              let t11 = c10 || 0;
              !s_(C2) && this.min < t11 && o10 >= t11 ? this.min = h10.minRange ? Math.min(t11, this.max - p10) : t11 : !s_(P2) && this.max > t11 && s10 <= t11 && (this.max = h10.minRange ? Math.max(t11, this.min + p10) : t11);
            }
            !i10.polar && this.min > this.max && (s_(h10.min) ? this.max = this.min : s_(h10.max) && (this.min = this.max)), M2 = this.max - this.min;
          }
          if (this.min !== this.max && s3(this.min) && s3(this.max) ? y2 && !S2 && b2 === y2.options.tickPixelInterval ? this.tickInterval = S2 = y2.tickInterval : this.tickInterval = s8(S2, this.tickAmount ? M2 / Math.max(this.tickAmount - 1, 1) : void 0, e10 ? 1 : M2 * b2 / Math.max(this.len, b2)) : this.tickInterval = 1, a10 && !t10) {
            let t11 = this.min !== this.old?.min || this.max !== this.old?.max;
            this.series.forEach(function(e11) {
              e11.forceCrop = e11.forceCropping?.(), e11.processData(t11);
            }), sQ(this, "postProcessData", {
              hasExtremesChanged: t11
            });
          }
          this.setAxisTranslation(), sQ(this, "initialAxisTranslation"), this.pointRange && !S2 && (this.tickInterval = Math.max(this.pointRange, this.tickInterval));
          let O2 = s8(h10.minTickInterval, r10 && !this.series.some((t11) => !t11.sorted) ? this.closestPointRange : 0);
          !S2 && O2 && this.tickInterval < O2 && (this.tickInterval = O2), r10 || n10 || S2 || (this.tickInterval = os(this, this.tickInterval)), this.tickAmount || (this.tickInterval = this.unsquish()), this.setTickPositions();
        }
        setTickPositions() {
          let t10 = this.options, e10 = t10.tickPositions, i10 = t10.tickPositioner, s10 = this.getMinorTickInterval(), o10 = !this.isPanning, r10 = o10 && t10.startOnTick, a10 = o10 && t10.endOnTick, n10 = [], h10;
          if (this.tickmarkOffset = this.categories && "between" === t10.tickmarkPlacement && 1 === this.tickInterval ? 0.5 : 0, this.single = this.min === this.max && s_(this.min) && !this.tickAmount && (this.min % 1 == 0 || false !== t10.allowDecimals), e10) n10 = e10.slice();
          else if (s3(this.min) && s3(this.max)) {
            if (!this.ordinal?.positions && (this.max - this.min) / this.tickInterval > Math.max(2 * this.len, 200)) n10 = [this.min, this.max], sK(19, false, this.chart);
            else if (this.dateTime) n10 = this.getTimeTicks(this.dateTime.normalizeTimeTickInterval(this.tickInterval, t10.units), this.min, this.max, t10.startOfWeek, this.ordinal?.positions, this.closestPointRange, true);
            else if (this.logarithmic) n10 = this.logarithmic.getLogTickPositions(this.tickInterval, this.min, this.max);
            else {
              let t11 = this.tickInterval, e11 = t11;
              for (; e11 <= 2 * t11; ) if (n10 = this.getLinearTickPositions(this.tickInterval, this.min, this.max), this.tickAmount && n10.length > this.tickAmount) this.tickInterval = os(this, e11 *= 1.1);
              else break;
            }
            n10.length > this.len && (n10 = [n10[0], n10[n10.length - 1]])[0] === n10[1] && (n10.length = 1), i10 && (this.tickPositions = n10, (h10 = i10.apply(this, [this.min, this.max])) && (n10 = h10));
          }
          this.tickPositions = n10, this.minorTickInterval = "auto" === s10 && this.tickInterval ? this.tickInterval / t10.minorTicksPerMajor : s10, this.paddedTicks = n10.slice(0), this.trimTicks(n10, r10, a10), !this.isLinked && s3(this.min) && s3(this.max) && (this.single && n10.length < 2 && !this.categories && !this.series.some((t11) => t11.is("heatmap") && "between" === t11.options.pointPlacement) && (this.min -= 0.5, this.max += 0.5), e10 || h10 || this.adjustTickAmount()), sQ(this, "afterSetTickPositions");
        }
        trimTicks(t10, e10, i10) {
          let s10 = t10[0], o10 = t10[t10.length - 1], r10 = !this.isOrdinal && this.minPointOffset || 0;
          if (sQ(this, "trimTicks"), !this.isLinked || !this.grid) {
            if (e10 && s10 !== -1 / 0) this.min = s10;
            else for (; this.min - r10 > t10[0]; ) t10.shift();
            if (i10) this.max = o10;
            else for (; this.max + r10 < t10[t10.length - 1]; ) t10.pop();
            0 === t10.length && s_(s10) && !this.options.tickPositions && t10.push((o10 + s10) / 2);
          }
        }
        alignToOthers() {
          let t10, e10 = this, i10 = e10.chart, s10 = [this], o10 = e10.options, r10 = i10.options.chart, a10 = "yAxis" === this.coll && r10.alignThresholds, n10 = [];
          if (e10.thresholdAlignment = void 0, (false !== r10.alignTicks && o10.alignTicks || a10) && false !== o10.startOnTick && false !== o10.endOnTick && !e10.logarithmic) {
            let o11 = (t11) => {
              let {
                horiz: e11,
                options: i11
              } = t11;
              return [e11 ? i11.left : i11.top, i11.width, i11.height, i11.pane].join(",");
            }, r11 = o11(this);
            i10[this.coll].forEach(function(i11) {
              let {
                series: a11
              } = i11;
              a11.length && a11.some((t11) => t11.visible) && i11 !== e10 && o11(i11) === r11 && (t10 = true, s10.push(i11));
            });
          }
          if (t10 && a10) {
            s10.forEach((t12) => {
              let i11 = t12.getThresholdAlignment(e10);
              s3(i11) && n10.push(i11);
            });
            let t11 = n10.length > 1 ? n10.reduce((t12, e11) => t12 += e11, 0) / n10.length : void 0;
            s10.forEach((e11) => {
              e11.thresholdAlignment = t11;
            });
          }
          return t10;
        }
        getThresholdAlignment(t10) {
          if ((!s3(this.dataMin) || this !== t10 && this.series.some((t11) => t11.isDirty || t11.isDirtyData || t11.xAxis?.isDirty)) && this.getSeriesExtremes(), s3(this.threshold)) {
            let t11 = sV((this.threshold - (this.dataMin || 0)) / ((this.dataMax || 0) - (this.dataMin || 0)), 0, 1);
            return this.options.reversed && (t11 = 1 - t11), t11;
          }
        }
        getTickAmount() {
          let t10 = this.options, e10 = t10.tickPixelInterval, i10 = t10.tickAmount;
          s_(t10.tickInterval) || i10 || !(this.len < e10) || this.isRadial || this.logarithmic || !t10.startOnTick || !t10.endOnTick || (i10 = 2), !i10 && this.alignToOthers() && (i10 = Math.ceil(this.len / e10) + 1), i10 < 4 && (this.finalTickAmt = i10, i10 = 5), this.tickAmount = i10;
        }
        adjustTickAmount() {
          let t10 = this, {
            finalTickAmt: e10,
            max: i10,
            min: s10,
            options: o10,
            tickPositions: r10,
            tickAmount: a10,
            thresholdAlignment: n10
          } = t10, h10 = r10?.length, l10 = s8(t10.threshold, t10.softThreshold ? 0 : null), d10, c10, p10 = t10.tickInterval, u10, g2 = () => r10.push(s$(r10[r10.length - 1] + p10)), f2 = () => r10.unshift(s$(r10[0] - p10));
          if (s3(n10) && (u10 = 0 === n10 ? 0 : 1 === n10 ? a10 - 1 : Math.round(sV(n10 * (a10 - 1), 1, a10 - 2)), o10.reversed && (u10 = a10 - 1 - u10)), t10.hasData() && s3(s10) && s3(i10)) {
            let n11 = () => {
              t10.transA *= (h10 - 1) / (a10 - 1), t10.min = o10.startOnTick ? r10[0] : Math.min(s10, r10[0]), t10.max = o10.endOnTick ? r10[r10.length - 1] : Math.max(i10, r10[r10.length - 1]);
            };
            if (s3(u10) && s3(t10.threshold)) {
              for (; r10[u10] !== l10 || r10.length !== a10 || r10[0] > s10 || r10[r10.length - 1] < i10; ) {
                for (r10.length = 0, r10.push(t10.threshold); r10.length < a10; ) void 0 === r10[u10] || r10[u10] > t10.threshold ? f2() : g2();
                if (p10 > 8 * t10.tickInterval) break;
                p10 *= 2;
              }
              n11();
            } else if (h10 < a10) {
              for (; r10.length < a10; ) r10.length % 2 || s10 === l10 ? g2() : f2();
              n11();
            }
            if (s_(e10)) {
              for (c10 = d10 = r10.length; c10--; ) (3 === e10 && c10 % 2 == 1 || e10 <= 2 && c10 > 0 && c10 < d10 - 1) && r10.splice(c10, 1);
              t10.finalTickAmt = void 0;
            }
          }
        }
        setScale() {
          let {
            coll: t10,
            stacking: e10
          } = this, i10 = false, s10 = false;
          this.series.forEach((t11) => {
            i10 = i10 || t11.isDirtyData || t11.isDirty, s10 = s10 || t11.xAxis?.isDirty || false;
          }), this.setAxisSize();
          let o10 = this.len !== this.old?.len;
          o10 || i10 || s10 || this.isLinked || this.forceRedraw || this.userMin !== this.old?.userMin || this.userMax !== this.old?.userMax || this.alignToOthers() ? (e10 && "yAxis" === t10 && e10.buildStacks(), this.forceRedraw = false, this.userMinRange || (this.minRange = void 0), this.getSeriesExtremes(), this.setTickInterval(), e10 && "xAxis" === t10 && e10.buildStacks(), this.isDirty || (this.isDirty = o10 || this.min !== this.old?.min || this.max !== this.old?.max)) : e10 && e10.cleanStacks(), i10 && delete this.allExtremes, sQ(this, "afterSetScale");
        }
        setExtremes(t10, e10, i10 = true, s10, o10) {
          let r10 = this.chart;
          this.series.forEach((t11) => {
            delete t11.kdTree;
          }), t10 = r10.time.parse(t10), e10 = r10.time.parse(e10), sQ(this, "setExtremes", o10 = sJ(o10, {
            min: t10,
            max: e10
          }), (t11) => {
            this.userMin = t11.min, this.userMax = t11.max, this.eventArgs = t11, i10 && r10.redraw(s10);
          });
        }
        setAxisSize() {
          let t10 = this.chart, e10 = this.options, i10 = e10.offsets || [0, 0, 0, 0], s10 = this.horiz, o10 = this.width = Math.round(s7(s8(e10.width, t10.plotWidth - i10[3] + i10[1]), t10.plotWidth)), r10 = this.height = Math.round(s7(s8(e10.height, t10.plotHeight - i10[0] + i10[2]), t10.plotHeight)), a10 = this.top = Math.round(s7(s8(e10.top, t10.plotTop + i10[0]), t10.plotHeight, t10.plotTop)), n10 = this.left = Math.round(s7(s8(e10.left, t10.plotLeft + i10[3]), t10.plotWidth, t10.plotLeft));
          this.bottom = t10.chartHeight - r10 - a10, this.right = t10.chartWidth - o10 - n10, this.len = Math.max(s10 ? o10 : r10, 0), this.pos = s10 ? n10 : a10;
        }
        getExtremes() {
          let t10 = this.logarithmic;
          return {
            min: t10 ? s$(t10.lin2log(this.min)) : this.min,
            max: t10 ? s$(t10.lin2log(this.max)) : this.max,
            dataMin: this.dataMin,
            dataMax: this.dataMax,
            userMin: this.userMin,
            userMax: this.userMax
          };
        }
        getThreshold(t10) {
          let e10 = this.logarithmic, i10 = e10 ? e10.lin2log(this.min) : this.min, s10 = e10 ? e10.lin2log(this.max) : this.max;
          return null === t10 || t10 === -1 / 0 ? t10 = i10 : t10 === 1 / 0 ? t10 = s10 : i10 > t10 ? t10 = i10 : s10 < t10 && (t10 = s10), this.translate(t10, 0, 1, 0, 1);
        }
        autoLabelAlign(t10) {
          let e10 = ((t10 - 90 * this.side) % 360 + 360) % 360, i10 = {
            align: "center"
          };
          return sQ(this, "autoLabelAlign", i10, function(t11) {
            e10 > 15 && e10 < 165 ? t11.align = "right" : e10 > 195 && e10 < 345 && (t11.align = "left");
          }), i10.align;
        }
        tickSize(t10) {
          let e10 = this.options, i10 = s8(e10["tick" === t10 ? "tickWidth" : "minorTickWidth"], "tick" === t10 && this.isXAxis && !this.categories ? 1 : 0), s10 = e10["tick" === t10 ? "tickLength" : "minorTickLength"], o10;
          i10 && s10 && ("inside" === e10[t10 + "Position"] && (s10 = -s10), o10 = [s10, i10]);
          let r10 = {
            tickSize: o10
          };
          return sQ(this, "afterTickSize", r10), r10.tickSize;
        }
        labelMetrics() {
          let t10 = this.chart.renderer, e10 = this.ticks, i10 = e10[Object.keys(e10)[0]] || {};
          return this.chart.renderer.fontMetrics(i10.label || i10.movedLabel || t10.box);
        }
        unsquish() {
          let t10 = this.options.labels, e10 = t10.padding || 0, i10 = this.horiz, s10 = this.tickInterval, o10 = this.len / ((+!!this.categories + this.max - this.min) / s10), r10 = t10.rotation, a10 = s$(0.8 * this.labelMetrics().h), n10 = Math.max(this.max - this.min, 0), h10 = function(t11) {
            let i11 = (t11 + 2 * e10) / (o10 || 1);
            return (i11 = i11 > 1 ? Math.ceil(i11) : 1) * s10 > n10 && t11 !== 1 / 0 && o10 !== 1 / 0 && n10 && (i11 = Math.ceil(n10 / s10)), s$(i11 * s10);
          }, l10 = s10, d10, c10 = Number.MAX_VALUE, p10;
          if (i10) {
            if (!t10.staggerLines && (s3(r10) ? p10 = [r10] : o10 < t10.autoRotationLimit && (p10 = t10.autoRotation)), p10) {
              let t11, e11;
              for (let i11 of p10) (i11 === r10 || i11 && i11 >= -90 && i11 <= 90) && (e11 = (t11 = h10(Math.abs(a10 / Math.sin(sY * i11)))) + Math.abs(i11 / 360)) < c10 && (c10 = e11, d10 = i11, l10 = t11);
            }
          } else l10 = h10(0.75 * a10);
          return this.autoRotation = p10, this.labelRotation = s8(d10, s3(r10) ? r10 : 0), t10.step ? s10 : l10;
        }
        getSlotWidth(t10) {
          let e10 = this.chart, i10 = this.horiz, s10 = this.options.labels, o10 = Math.max(this.tickPositions.length - !this.categories, 1), r10 = e10.margin[3];
          if (t10 && s3(t10.slotWidth)) return t10.slotWidth;
          if (i10 && s10.step < 2 && !this.isRadial) return s10.rotation ? 0 : (this.staggerLines || 1) * this.len / o10;
          if (!i10) {
            let t11 = s10.style.width;
            if (void 0 !== t11) return parseInt(String(t11), 10);
            if (!this.opposite && r10) return r10 - e10.spacing[3];
          }
          return 0.33 * e10.chartWidth;
        }
        renderUnsquish() {
          let t10 = this.chart, e10 = t10.renderer, i10 = this.tickPositions, s10 = this.ticks, o10 = this.options.labels, r10 = o10.style, a10 = this.horiz, n10 = this.getSlotWidth(), h10 = Math.max(1, Math.round(n10 - (a10 ? 2 * (o10.padding || 0) : o10.distance || 0))), l10 = {}, d10 = this.labelMetrics(), c10 = r10.lineClamp, p10, u10 = c10 ?? (Math.floor(this.len / (i10.length * d10.h)) || 1), g2 = 0;
          s5(o10.rotation) || (l10.rotation = o10.rotation || 0), i10.forEach(function(t11) {
            let e11 = s10[t11];
            e11.movedLabel && e11.replaceMovedLabel();
            let i11 = e11.label?.textPxLength || 0;
            i11 > g2 && (g2 = i11);
          }), this.maxLabelLength = g2, this.autoRotation ? g2 > h10 && g2 > d10.h ? l10.rotation = this.labelRotation : this.labelRotation = 0 : n10 && (p10 = h10), l10.rotation && (p10 = g2 > 0.5 * t10.chartHeight ? 0.33 * t10.chartHeight : g2, c10 || (u10 = 1)), this.labelAlign = o10.align || this.autoLabelAlign(this.labelRotation || 0), this.labelAlign && (l10.align = this.labelAlign), i10.forEach(function(t11) {
            let e11 = s10[t11], i11 = e11?.label, o11 = r10.width, a11 = {};
            i11 && (i11.attr(l10), e11.shortenLabel ? e11.shortenLabel() : p10 && !o11 && "nowrap" !== r10.whiteSpace && (p10 < (i11.textPxLength || 0) || "SPAN" === i11.element.tagName) ? i11.css(sJ(a11, {
              width: `${p10}px`,
              lineClamp: u10
            })) : !i11.styles.width || a11.width || o11 || i11.css({
              width: "auto"
            }), e11.rotation = l10.rotation);
          }, this), this.tickRotCorr = e10.rotCorr(d10.b, this.labelRotation || 0, 0 !== this.side);
        }
        hasData() {
          return this.series.some(function(t10) {
            return t10.hasData();
          }) || this.options.showEmpty && s_(this.min) && s_(this.max);
        }
        addTitle(t10) {
          let e10, i10 = this.chart.renderer, s10 = this.horiz, o10 = this.opposite, r10 = this.options.title, a10 = this.chart.styledMode;
          this.axisTitle || ((e10 = r10.textAlign) || (e10 = (s10 ? {
            low: "left",
            middle: "center",
            high: "right"
          } : {
            low: o10 ? "right" : "left",
            middle: "center",
            high: o10 ? "left" : "right"
          })[r10.align]), this.axisTitle = i10.text(r10.text || "", 0, 0, r10.useHTML).attr({
            zIndex: 7,
            rotation: r10.rotation || 0,
            align: e10
          }).addClass("highcharts-axis-title"), a10 || this.axisTitle.css(s6(r10.style)), this.axisTitle.add(this.axisGroup), this.axisTitle.isNew = true), a10 || r10.style.width || this.isRadial || this.axisTitle.css({
            width: this.len + "px"
          }), this.axisTitle[t10 ? "show" : "hide"](t10);
        }
        generateTick(t10) {
          let e10 = this.ticks;
          e10[t10] ? e10[t10].addLabel() : e10[t10] = new sN(this, t10);
        }
        createGroups() {
          let {
            axisParent: t10,
            chart: e10,
            coll: i10,
            options: s10
          } = this, o10 = e10.renderer, r10 = (e11, r11, a10) => o10.g(e11).attr({
            zIndex: a10
          }).addClass(`highcharts-${i10.toLowerCase()}${r11} ` + (this.isRadial ? `highcharts-radial-axis${r11} ` : "") + (s10.className || "")).add(t10);
          this.axisGroup || (this.gridGroup = r10("grid", "-grid", s10.gridZIndex), this.axisGroup = r10("axis", "", s10.zIndex), this.labelGroup = r10("axis-labels", "-labels", s10.labels.zIndex));
        }
        getOffset() {
          let t10 = this, {
            chart: e10,
            horiz: i10,
            options: s10,
            side: o10,
            ticks: r10,
            tickPositions: a10,
            coll: n10
          } = t10, h10 = e10.inverted && !t10.isZAxis ? [1, 0, 3, 2][o10] : o10, l10 = t10.hasData(), d10 = s10.title, c10 = s10.labels, p10 = s3(s10.crossing), u10 = e10.axisOffset, g2 = e10.clipOffset, f2 = [-1, 1, 1, -1][o10], m2, x2 = 0, y2, b2 = 0, v2 = 0, k2, M2;
          if (t10.showAxis = m2 = l10 || s10.showEmpty, t10.staggerLines = t10.horiz && c10.staggerLines || void 0, t10.createGroups(), l10 || t10.isLinked ? (a10.forEach(function(e11) {
            t10.generateTick(e11);
          }), t10.renderUnsquish(), t10.reserveSpaceDefault = 0 === o10 || 2 === o10 || {
            1: "left",
            3: "right"
          }[o10] === t10.labelAlign, s8(c10.reserveSpace, !p10 && null, "center" === t10.labelAlign || null, t10.reserveSpaceDefault) && a10.forEach(function(t11) {
            v2 = Math.max(r10[t11].getLabelSize(), v2);
          }), t10.staggerLines && (v2 *= t10.staggerLines), t10.labelOffset = v2 * (t10.opposite ? -1 : 1)) : s4(r10, function(t11, e11) {
            t11.destroy(), delete r10[e11];
          }), d10?.text && false !== d10.enabled && (t10.addTitle(m2), m2 && !p10 && false !== d10.reserveSpace && (t10.titleOffset = x2 = t10.axisTitle.getBBox()[i10 ? "height" : "width"], b2 = s_(y2 = d10.offset) ? 0 : s8(d10.margin, i10 ? 5 : 10))), t10.renderLine(), t10.offset = f2 * s8(s10.offset, u10[o10] ? u10[o10] + (s10.margin || 0) : 0), t10.tickRotCorr = t10.tickRotCorr || {
            x: 0,
            y: 0
          }, M2 = 0 === o10 ? -t10.labelMetrics().h : 2 === o10 ? t10.tickRotCorr.y : 0, k2 = Math.abs(v2) + b2, v2 && (k2 -= M2, k2 += f2 * (i10 ? s8(c10.y, t10.tickRotCorr.y + f2 * c10.distance) : s8(c10.x, f2 * c10.distance))), t10.axisTitleMargin = s8(y2, k2), t10.getMaxLabelDimensions && (t10.maxLabelDimensions = t10.getMaxLabelDimensions(r10, a10)), "colorAxis" !== n10 && g2) {
            let e11 = this.tickSize("tick");
            u10[o10] = Math.max(u10[o10], (t10.axisTitleMargin || 0) + x2 + f2 * t10.offset, k2, a10?.length && e11 ? e11[0] + f2 * t10.offset : 0);
            let i11 = !t10.axisLine || s10.offset ? 0 : t10.axisLine.strokeWidth() / 2;
            g2[h10] = Math.max(g2[h10], i11);
          }
          sQ(this, "afterGetOffset");
        }
        getLinePath(t10) {
          let e10 = this.chart, i10 = this.opposite, s10 = this.offset, o10 = this.horiz, r10 = this.left + (i10 ? this.width : 0) + s10, a10 = e10.chartHeight - this.bottom - (i10 ? this.height : 0) + s10;
          return i10 && (t10 *= -1), e10.renderer.crispLine([["M", o10 ? this.left : r10, o10 ? a10 : this.top], ["L", o10 ? e10.chartWidth - this.right : r10, o10 ? a10 : e10.chartHeight - this.bottom]], t10);
        }
        renderLine() {
          !this.axisLine && (this.axisLine = this.chart.renderer.path().addClass("highcharts-axis-line").add(this.axisGroup), this.chart.styledMode || this.axisLine.attr({
            stroke: this.options.lineColor,
            "stroke-width": this.options.lineWidth,
            zIndex: 7
          }));
        }
        getTitlePosition(t10) {
          let e10 = this.horiz, i10 = this.left, s10 = this.top, o10 = this.len, r10 = this.options.title, a10 = e10 ? i10 : s10, n10 = this.opposite, h10 = this.offset, l10 = r10.x, d10 = r10.y, c10 = this.chart.renderer.fontMetrics(t10), p10 = t10 ? Math.max(t10.getBBox(false, 0).height - c10.h - 1, 0) : 0, u10 = {
            low: a10 + (e10 ? 0 : o10),
            middle: a10 + o10 / 2,
            high: a10 + (e10 ? o10 : 0)
          }[r10.align], g2 = (e10 ? s10 + this.height : i10) + (e10 ? 1 : -1) * (n10 ? -1 : 1) * (this.axisTitleMargin || 0) + [-p10, p10, c10.f, -p10][this.side], f2 = {
            x: e10 ? u10 + l10 : g2 + (n10 ? this.width : 0) + h10 + l10,
            y: e10 ? g2 + d10 - (n10 ? this.height : 0) + h10 : u10 + d10
          };
          return sQ(this, "afterGetTitlePosition", {
            titlePosition: f2
          }), f2;
        }
        renderMinorTick(t10, e10) {
          let i10 = this.minorTicks;
          i10[t10] || (i10[t10] = new sN(this, t10, "minor")), e10 && i10[t10].isNew && i10[t10].render(null, true), i10[t10].render(null, false, 1);
        }
        renderTick(t10, e10, i10) {
          let s10 = this.isLinked, o10 = this.ticks;
          (!s10 || t10 >= this.min && t10 <= this.max || this.grid?.isColumn) && (o10[t10] || (o10[t10] = new sN(this, t10)), i10 && o10[t10].isNew && o10[t10].render(e10, true, -1), o10[t10].render(e10));
        }
        render() {
          let t10, e10, i10 = this, s10 = i10.chart, o10 = i10.logarithmic, r10 = s10.renderer, a10 = i10.options, n10 = i10.isLinked, h10 = i10.tickPositions, l10 = i10.axisTitle, d10 = i10.ticks, c10 = i10.minorTicks, p10 = i10.alternateBands, u10 = a10.stackLabels, g2 = a10.alternateGridColor, f2 = a10.crossing, m2 = i10.tickmarkOffset, x2 = i10.axisLine, y2 = i10.showAxis, b2 = sW(r10.globalAnimation);
          if (i10.labelEdge.length = 0, i10.overlap = false, [d10, c10, p10].forEach(function(t11) {
            s4(t11, function(t12) {
              t12.isActive = false;
            });
          }), s3(f2)) {
            let t11 = this.isXAxis ? s10.yAxis[0] : s10.xAxis[0], e11 = [1, -1, -1, 1][this.side];
            if (t11) {
              let s11 = t11.toPixels(f2, true);
              i10.horiz && (s11 = t11.len - s11), i10.offset = e11 * s11;
            }
          }
          if (i10.hasData() || n10) {
            let r11 = i10.chart.hasRendered && i10.old && s3(i10.old.min);
            i10.minorTickInterval && !i10.categories && i10.getMinorTickPositions().forEach(function(t11) {
              i10.renderMinorTick(t11, r11);
            }), h10.length && (h10.forEach(function(t11, e11) {
              i10.renderTick(t11, e11, r11);
            }), m2 && (0 === i10.min || i10.single) && (d10[-1] || (d10[-1] = new sN(i10, -1, null, true)), d10[-1].render(-1))), g2 && h10.forEach(function(r12, a11) {
              e10 = void 0 !== h10[a11 + 1] ? h10[a11 + 1] + m2 : i10.max - m2, a11 % 2 == 0 && r12 < i10.max && e10 <= i10.max + (s10.polar ? -m2 : m2) && (p10[r12] || (p10[r12] = new V.PlotLineOrBand(i10, {})), t10 = r12 + m2, p10[r12].options = {
                from: o10 ? o10.lin2log(t10) : t10,
                to: o10 ? o10.lin2log(e10) : e10,
                color: g2,
                className: "highcharts-alternate-grid"
              }, p10[r12].render(), p10[r12].isActive = true);
            }), i10._addedPlotLB || (i10._addedPlotLB = true, (a10.plotLines || []).concat(a10.plotBands || []).forEach(function(t11) {
              i10.addPlotBandOrLine(t11);
            }));
          }
          [d10, c10, p10].forEach(function(t11) {
            let e11 = [], i11 = b2.duration;
            s4(t11, function(t12, i12) {
              t12.isActive || (t12.render(i12, false, 0), t12.isActive = false, e11.push(i12));
            }), oi(function() {
              let i12 = e11.length;
              for (; i12--; ) t11[e11[i12]] && !t11[e11[i12]].isActive && (t11[e11[i12]].destroy(), delete t11[e11[i12]]);
            }, t11 !== p10 && s10.hasRendered && i11 ? i11 : 0);
          }), x2 && (x2[x2.isPlaced ? "animate" : "attr"]({
            d: this.getLinePath(x2.strokeWidth())
          }), x2.isPlaced = true, x2[y2 ? "show" : "hide"](y2)), l10 && y2 && (l10[l10.isNew ? "attr" : "animate"](i10.getTitlePosition(l10)), l10.isNew = false), u10?.enabled && i10.stacking && i10.stacking.renderStackTotals(), i10.old = {
            len: i10.len,
            max: i10.max,
            min: i10.min,
            transA: i10.transA,
            userMax: i10.userMax,
            userMin: i10.userMin
          }, i10.isDirty = false, sQ(this, "afterRender");
        }
        redraw() {
          this.visible && (this.render(), this.plotLinesAndBands.forEach(function(t10) {
            t10.render();
          })), this.series.forEach(function(t10) {
            t10.isDirty = true;
          });
        }
        getKeepProps() {
          return this.keepProps || oo.keepProps;
        }
        destroy(t10) {
          let e10 = this, i10 = e10.plotLinesAndBands, s10 = this.eventOptions;
          if (sQ(this, "destroy", {
            keepEvents: t10
          }), t10 || ot(e10), [e10.ticks, e10.minorTicks, e10.alternateBands].forEach(function(t11) {
            sZ(t11);
          }), i10) {
            let t11 = i10.length;
            for (; t11--; ) i10[t11].destroy();
          }
          for (let t11 in ["axisLine", "axisTitle", "axisGroup", "gridGroup", "labelGroup", "cross", "scrollbar"].forEach(function(t12) {
            e10[t12] && (e10[t12] = e10[t12].destroy());
          }), e10.plotLinesAndBandsGroups) e10.plotLinesAndBandsGroups[t11] = e10.plotLinesAndBandsGroups[t11].destroy();
          s4(e10, function(t11, i11) {
            -1 === e10.getKeepProps().indexOf(i11) && delete e10[i11];
          }), this.eventOptions = s10;
        }
        drawCrosshair(t10, e10) {
          let i10 = this.crosshair, s10 = i10?.snap ?? true, o10 = this.chart, r10, a10, n10, h10 = this.cross, l10;
          if (sQ(this, "drawCrosshair", {
            e: t10,
            point: e10
          }), t10 || (t10 = this.cross?.e), i10 && false !== (s_(e10) || !s10)) {
            if (s10 ? s_(e10) && (a10 = s8("colorAxis" !== this.coll ? e10.crosshairPos : null, this.isXAxis ? e10.plotX : this.len - e10.plotY)) : a10 = t10 && (this.horiz ? t10.chartX - this.pos : this.len - t10.chartY + this.pos), s_(a10) && (l10 = {
              value: e10 && (this.isXAxis ? e10.x : s8(e10.stackY, e10.y)),
              translatedValue: a10
            }, o10.polar && sJ(l10, {
              isCrosshair: true,
              chartX: t10?.chartX,
              chartY: t10?.chartY,
              point: e10
            }), r10 = this.getPlotLinePath(l10) || null), !s_(r10)) return void this.hideCrosshair();
            n10 = this.categories && !this.isRadial, h10 || (this.cross = h10 = o10.renderer.path().addClass("highcharts-crosshair highcharts-crosshair-" + (n10 ? "category " : "thin ") + (i10.className || "")).attr({
              zIndex: s8(i10.zIndex, 2)
            }).add(), !o10.styledMode && (h10.attr({
              stroke: i10.color || (n10 ? tJ.parse("#ccd3ff").setOpacity(0.25).get() : "#cccccc"),
              "stroke-width": s8(i10.width, 1)
            }).css({
              "pointer-events": "none"
            }), i10.dashStyle && h10.attr({
              dashstyle: i10.dashStyle
            }))), h10.show().attr({
              d: r10
            }), n10 && !i10.width && h10.attr({
              "stroke-width": this.transA
            }), this.cross.e = t10;
          } else this.hideCrosshair();
          sQ(this, "afterDrawCrosshair", {
            e: t10,
            point: e10
          });
        }
        hideCrosshair() {
          this.cross && this.cross.hide(), sQ(this, "afterHideCrosshair");
        }
        update(t10, e10) {
          let i10 = this.chart;
          t10 = s6(this.userOptions, t10), this.destroy(true), this.init(i10, t10), i10.isDirtyBox = true, s8(e10, true) && i10.redraw();
        }
        remove(t10) {
          let e10 = this.chart, i10 = this.coll, s10 = this.series, o10 = s10.length;
          for (; o10--; ) s10[o10] && s10[o10].remove(false);
          sq(e10.axes, this), sq(e10[i10] || [], this), e10.orderItems(i10), this.destroy(), e10.isDirtyBox = true, s8(t10, true) && e10.redraw();
        }
        setTitle(t10, e10) {
          this.update({
            title: t10
          }, e10);
        }
        setCategories(t10, e10) {
          this.update({
            categories: t10
          }, e10);
        }
      }
      oo.keepProps = ["coll", "extKey", "hcEvents", "len", "names", "series", "userMax", "userMin"];
      let {
        addEvent: or,
        getMagnitude: oa,
        normalizeTickInterval: on,
        timeUnits: oh
      } = tx;
      !function(t10) {
        function e10() {
          return this.chart.time.getTimeTicks.apply(this.chart.time, arguments);
        }
        function i10() {
          if ("datetime" !== this.type) {
            this.dateTime = void 0;
            return;
          }
          this.dateTime || (this.dateTime = new s10(this));
        }
        t10.compose = function(t11) {
          return t11.keepProps.includes("dateTime") || (t11.keepProps.push("dateTime"), t11.prototype.getTimeTicks = e10, or(t11, "afterSetType", i10)), t11;
        };
        class s10 {
          constructor(t11) {
            this.axis = t11;
          }
          normalizeTimeTickInterval(t11, e11) {
            let i11 = e11 || [["millisecond", [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]], ["second", [1, 2, 5, 10, 15, 30]], ["minute", [1, 2, 5, 10, 15, 30]], ["hour", [1, 2, 3, 4, 6, 8, 12]], ["day", [1, 2]], ["week", [1, 2]], ["month", [1, 2, 3, 4, 6]], ["year", null]], s11 = i11[i11.length - 1], o10 = oh[s11[0]], r10 = s11[1], a10;
            for (a10 = 0; a10 < i11.length && (o10 = oh[(s11 = i11[a10])[0]], r10 = s11[1], !i11[a10 + 1] || !(t11 <= (o10 * r10[r10.length - 1] + oh[i11[a10 + 1][0]]) / 2)); a10++) ;
            o10 === oh.year && t11 < 5 * o10 && (r10 = [1, 2, 5]);
            let n10 = on(t11 / o10, r10, "year" === s11[0] ? Math.max(oa(t11 / o10), 1) : 1);
            return {
              unitRange: o10,
              count: n10,
              unitName: s11[0]
            };
          }
          getXDateFormat(t11, e11) {
            let {
              axis: i11
            } = this, s11 = i11.chart.time;
            return i11.closestPointRange ? s11.getDateFormat(i11.closestPointRange, t11, i11.options.startOfWeek, e11) || s11.resolveDTLFormat(e11.year).main : s11.resolveDTLFormat(e11.day).main;
          }
        }
        t10.Additions = s10;
      }(A || (A = {}));
      let ol = A, {
        addEvent: od,
        normalizeTickInterval: oc,
        pick: op
      } = tx;
      !function(t10) {
        function e10() {
          "logarithmic" !== this.type ? this.logarithmic = void 0 : this.logarithmic ?? (this.logarithmic = new s10(this));
        }
        function i10() {
          let t11 = this.logarithmic;
          t11 && (this.lin2val = function(e11) {
            return t11.lin2log(e11);
          }, this.val2lin = function(e11) {
            return t11.log2lin(e11);
          });
        }
        t10.compose = function(t11) {
          return t11.keepProps.includes("logarithmic") || (t11.keepProps.push("logarithmic"), od(t11, "afterSetType", e10), od(t11, "afterInit", i10)), t11;
        };
        class s10 {
          constructor(t11) {
            this.axis = t11;
          }
          getLogTickPositions(t11, e11, i11, s11) {
            let o10 = this.axis, r10 = o10.len, a10 = o10.options, n10 = [];
            if (s11 || (this.minorAutoInterval = void 0), t11 >= 0.5) t11 = Math.round(t11), n10 = o10.getLinearTickPositions(t11, e11, i11);
            else if (t11 >= 0.08) {
              let o11, r11, a11, h10, l10, d10, c10, p10 = Math.floor(e11);
              for (o11 = t11 > 0.3 ? [1, 2, 4] : t11 > 0.15 ? [1, 2, 4, 6, 8] : [1, 2, 3, 4, 5, 6, 7, 8, 9], r11 = p10; r11 < i11 + 1 && !c10; r11++) for (a11 = 0, h10 = o11.length; a11 < h10 && !c10; a11++) (l10 = this.log2lin(this.lin2log(r11) * o11[a11])) > e11 && (!s11 || d10 <= i11) && void 0 !== d10 && n10.push(d10), d10 > i11 && (c10 = true), d10 = l10;
            } else {
              let h10 = this.lin2log(e11), l10 = this.lin2log(i11), d10 = s11 ? o10.getMinorTickInterval() : a10.tickInterval, c10 = a10.tickPixelInterval / (s11 ? 5 : 1), p10 = s11 ? r10 / o10.tickPositions.length : r10;
              t11 = oc(t11 = op("auto" === d10 ? null : d10, this.minorAutoInterval, (l10 - h10) * c10 / (p10 || 1))), n10 = o10.getLinearTickPositions(t11, h10, l10).map(this.log2lin), s11 || (this.minorAutoInterval = t11 / 5);
            }
            return s11 || (o10.tickInterval = t11), n10;
          }
          lin2log(t11) {
            return Math.pow(10, t11);
          }
          log2lin(t11) {
            return Math.log(t11) / Math.LN10;
          }
        }
        t10.Additions = s10;
      }(T || (T = {}));
      let ou = T, {
        erase: og,
        extend: of,
        isNumber: om
      } = tx;
      !function(t10) {
        let e10;
        function i10(t11) {
          return this.addPlotBandOrLine(t11, "plotBands");
        }
        function s10(t11, i11) {
          let s11 = this.userOptions, o11 = new e10(this, t11);
          if (this.visible && (o11 = o11.render()), o11) {
            if (this._addedPlotLB || (this._addedPlotLB = true, (s11.plotLines || []).concat(s11.plotBands || []).forEach((t12) => {
              this.addPlotBandOrLine(t12);
            })), i11) {
              let e11 = s11[i11] || [];
              e11.push(t11), s11[i11] = e11;
            }
            this.plotLinesAndBands.push(o11);
          }
          return o11;
        }
        function o10(t11) {
          return this.addPlotBandOrLine(t11, "plotLines");
        }
        function r10(t11, e11, i11) {
          i11 = i11 || this.options;
          let s11 = this.getPlotLinePath({
            value: e11,
            force: true,
            acrossPanes: i11.acrossPanes
          }), o11 = [], r11 = this.horiz, a11 = !om(this.min) || !om(this.max) || t11 < this.min && e11 < this.min || t11 > this.max && e11 > this.max, n11 = this.getPlotLinePath({
            value: t11,
            force: true,
            acrossPanes: i11.acrossPanes
          }), h11, l10 = 1, d10;
          if (n11 && s11) for (a11 && (d10 = n11.toString() === s11.toString(), l10 = 0), h11 = 0; h11 < n11.length; h11 += 2) {
            let t12 = n11[h11], e12 = n11[h11 + 1], i12 = s11[h11], a12 = s11[h11 + 1];
            ("M" === t12[0] || "L" === t12[0]) && ("M" === e12[0] || "L" === e12[0]) && ("M" === i12[0] || "L" === i12[0]) && ("M" === a12[0] || "L" === a12[0]) && (r11 && i12[1] === t12[1] ? (i12[1] += l10, a12[1] += l10) : r11 || i12[2] !== t12[2] || (i12[2] += l10, a12[2] += l10), o11.push(["M", t12[1], t12[2]], ["L", e12[1], e12[2]], ["L", a12[1], a12[2]], ["L", i12[1], i12[2]], ["Z"])), o11.isFlat = d10;
          }
          return o11;
        }
        function a10(t11) {
          this.removePlotBandOrLine(t11);
        }
        function n10(t11) {
          let e11 = this.plotLinesAndBands, i11 = this.options, s11 = this.userOptions;
          if (e11) {
            let o11 = e11.length;
            for (; o11--; ) e11[o11].id === t11 && e11[o11].destroy();
            [i11.plotLines || [], s11.plotLines || [], i11.plotBands || [], s11.plotBands || []].forEach(function(e12) {
              for (o11 = e12.length; o11--; ) e12[o11]?.id === t11 && og(e12, e12[o11]);
            });
          }
        }
        function h10(t11) {
          this.removePlotBandOrLine(t11);
        }
        t10.compose = function(t11, l10) {
          let d10 = l10.prototype;
          return d10.addPlotBand || (e10 = t11, of(d10, {
            addPlotBand: i10,
            addPlotLine: o10,
            addPlotBandOrLine: s10,
            getPlotBandPath: r10,
            removePlotBand: a10,
            removePlotLine: h10,
            removePlotBandOrLine: n10
          })), l10;
        };
      }(C || (C = {}));
      let ox = C, {
        addEvent: oy,
        arrayMax: ob,
        arrayMin: ov,
        defined: ok,
        destroyObjectProperties: oM,
        erase: ow,
        fireEvent: oS,
        merge: oA,
        objectEach: oT,
        pick: oC
      } = tx;
      class oP {
        static compose(t10, e10) {
          return oy(t10, "afterInit", function() {
            this.labelCollectors.push(() => {
              let t11 = [];
              for (let e11 of this.axes) for (let {
                label: i10,
                options: s10
              } of e11.plotLinesAndBands) i10 && !s10?.label?.allowOverlap && t11.push(i10);
              return t11;
            });
          }), ox.compose(oP, e10);
        }
        constructor(t10, e10) {
          this.axis = t10, this.options = e10, this.id = e10.id;
        }
        render() {
          oS(this, "render");
          let {
            axis: t10,
            options: e10
          } = this, {
            horiz: i10,
            logarithmic: s10
          } = t10, {
            color: o10,
            events: r10,
            zIndex: a10 = 0
          } = e10, {
            renderer: n10,
            time: h10
          } = t10.chart, l10 = {}, d10 = h10.parse(e10.to), c10 = h10.parse(e10.from), p10 = h10.parse(e10.value), u10 = e10.borderWidth, g2 = e10.label, {
            label: f2,
            svgElem: m2
          } = this, x2 = [], y2, b2 = ok(c10) && ok(d10), v2 = ok(p10), k2 = !m2, M2 = {
            class: "highcharts-plot-" + (b2 ? "band " : "line ") + (e10.className || "")
          }, w2 = b2 ? "bands" : "lines";
          if (!t10.chart.styledMode && (v2 ? (M2.stroke = o10 || "#999999", M2["stroke-width"] = oC(e10.width, 1), e10.dashStyle && (M2.dashstyle = e10.dashStyle)) : b2 && (M2.fill = o10 || "#e6e9ff", u10 && (M2.stroke = e10.borderColor, M2["stroke-width"] = u10))), l10.zIndex = a10, w2 += "-" + a10, (y2 = t10.plotLinesAndBandsGroups[w2]) || (t10.plotLinesAndBandsGroups[w2] = y2 = n10.g("plot-" + w2).attr(l10).add()), m2 || (this.svgElem = m2 = n10.path().attr(M2).add(y2)), ok(p10)) x2 = t10.getPlotLinePath({
            value: s10?.log2lin(p10) ?? p10,
            lineWidth: m2.strokeWidth(),
            acrossPanes: e10.acrossPanes
          });
          else {
            if (!(ok(c10) && ok(d10))) return;
            x2 = t10.getPlotBandPath(s10?.log2lin(c10) ?? c10, s10?.log2lin(d10) ?? d10, e10);
          }
          return !this.eventsAdded && r10 && (oT(r10, (t11, e11) => {
            m2?.on(e11, (t12) => {
              r10[e11].apply(this, [t12]);
            });
          }), this.eventsAdded = true), (k2 || !m2.d) && x2?.length ? m2.attr({
            d: x2
          }) : m2 && (x2 ? (m2.show(), m2.animate({
            d: x2
          })) : m2.d && (m2.hide(), f2 && (this.label = f2 = f2.destroy()))), g2 && (ok(g2.text) || ok(g2.formatter)) && x2?.length && t10.width > 0 && t10.height > 0 && !x2.isFlat ? (g2 = oA(__spreadValues({
            align: i10 && b2 ? "center" : void 0,
            x: i10 ? !b2 && 4 : 10,
            verticalAlign: !i10 && b2 ? "middle" : void 0,
            y: i10 ? b2 ? 16 : 10 : b2 ? 6 : -4,
            rotation: i10 && !b2 ? 90 : 0
          }, b2 ? {
            inside: true
          } : {}), g2), this.renderLabel(g2, x2, b2, a10)) : f2 && f2.hide(), this;
        }
        renderLabel(t10, e10, i10, s10) {
          let o10 = this.axis, r10 = o10.chart.renderer, a10 = t10.inside, n10 = this.label;
          n10 || (this.label = n10 = r10.text(this.getLabelText(t10), 0, 0, t10.useHTML).attr({
            align: t10.textAlign || t10.align,
            rotation: t10.rotation,
            class: "highcharts-plot-" + (i10 ? "band" : "line") + "-label " + (t10.className || ""),
            zIndex: s10
          }), o10.chart.styledMode || n10.css(oA({
            color: o10.chart.options.title?.style?.color,
            fontSize: "0.8em",
            textOverflow: i10 && !a10 ? "" : "ellipsis"
          }, t10.style)), n10.add());
          let h10 = e10.xBounds || [e10[0][1], e10[1][1], i10 ? e10[2][1] : e10[0][1]], l10 = e10.yBounds || [e10[0][2], e10[1][2], i10 ? e10[2][2] : e10[0][2]], d10 = ov(h10), c10 = ov(l10), p10 = ob(h10) - d10;
          n10.align(t10, false, {
            x: d10,
            y: c10,
            width: p10,
            height: ob(l10) - c10
          }), n10.alignAttr.y -= r10.fontMetrics(n10).b, (!n10.alignValue || "left" === n10.alignValue || ok(a10)) && n10.css({
            width: (t10.style?.width || (i10 && a10 ? p10 : 90 === n10.rotation ? o10.height - (n10.alignAttr.y - o10.top) : (t10.clip ? o10.width : o10.chart.chartWidth) - (n10.alignAttr.x - o10.left))) + "px"
          }), n10.show(true);
        }
        getLabelText(t10) {
          return ok(t10.formatter) ? t10.formatter.call(this) : t10.text;
        }
        destroy() {
          ow(this.axis.plotLinesAndBands, this), delete this.axis, oM(this);
        }
      }
      let {
        animObject: oO
      } = eo, {
        format: oE
      } = eI, {
        composed: oL,
        dateFormats: oB,
        doc: oD,
        isSafari: oI
      } = V, {
        distribute: oz
      } = eX, {
        addEvent: oR,
        clamp: oN,
        css: oW,
        clearTimeout: oG,
        discardElement: oX,
        extend: oH,
        fireEvent: oF,
        getAlignFactor: oY,
        isArray: oj,
        isNumber: oU,
        isObject: oV,
        isString: o$,
        merge: o_,
        pick: oZ,
        pushUnique: oq,
        splat: oK,
        syncTimeout: oJ
      } = tx;
      class oQ {
        constructor(t10, e10, i10) {
          this.allowShared = true, this.crosshairs = [], this.distance = 0, this.isHidden = true, this.isSticky = false, this.options = {}, this.outside = false, this.chart = t10, this.init(t10, e10), this.pointer = i10;
        }
        bodyFormatter(t10) {
          return t10.map((t11) => {
            let e10 = t11.series.tooltipOptions, i10 = t11.formatPrefix || "point";
            return (e10[i10 + "Formatter"] || t11.tooltipFormatter).call(t11, e10[i10 + "Format"] || "");
          });
        }
        cleanSplit(t10) {
          this.chart.series.forEach(function(e10) {
            let i10 = e10?.tt;
            i10 && (!i10.isActive || t10 ? e10.tt = i10.destroy() : i10.isActive = false);
          });
        }
        defaultFormatter(t10) {
          let e10, i10 = this.points || oK(this);
          return (e10 = (e10 = [t10.headerFooterFormatter(i10[0])]).concat(t10.bodyFormatter(i10))).push(t10.headerFooterFormatter(i10[0], true)), e10;
        }
        destroy() {
          this.label && (this.label = this.label.destroy()), this.split && (this.cleanSplit(true), this.tt && (this.tt = this.tt.destroy())), this.renderer && (this.renderer = this.renderer.destroy(), oX(this.container)), oG(this.hideTimer);
        }
        getAnchor(t10, e10) {
          let i10, {
            chart: s10,
            pointer: o10
          } = this, r10 = s10.inverted, a10 = s10.plotTop, n10 = s10.plotLeft;
          if (t10 = oK(t10), t10[0].series?.yAxis && !t10[0].series.yAxis.options.reversedStacks && (t10 = t10.slice().reverse()), this.followPointer && e10) void 0 === e10.chartX && (e10 = o10.normalize(e10)), i10 = [e10.chartX - n10, e10.chartY - a10];
          else if (t10[0].tooltipPos) i10 = t10[0].tooltipPos;
          else {
            let s11 = 0, o11 = 0;
            t10.forEach(function(t11) {
              let e11 = t11.pos(true);
              e11 && (s11 += e11[0], o11 += e11[1]);
            }), s11 /= t10.length, o11 /= t10.length, this.shared && t10.length > 1 && e10 && (r10 ? s11 = e10.chartX : o11 = e10.chartY), i10 = [s11 - n10, o11 - a10];
          }
          let h10 = {
            point: t10[0],
            ret: i10
          };
          return oF(this, "getAnchor", h10), h10.ret.map(Math.round);
        }
        getClassName(t10, e10, i10) {
          let s10 = this.options, o10 = t10.series, r10 = o10.options;
          return [s10.className, "highcharts-label", i10 && "highcharts-tooltip-header", e10 ? "highcharts-tooltip-box" : "highcharts-tooltip", !i10 && "highcharts-color-" + oZ(t10.colorIndex, o10.colorIndex), r10?.className].filter(o$).join(" ");
        }
        getLabel({
          anchorX: t10,
          anchorY: e10
        } = {
          anchorX: 0,
          anchorY: 0
        }) {
          let i10 = this, s10 = this.chart.styledMode, o10 = this.options, r10 = this.split && this.allowShared, a10 = this.container, n10 = this.chart.renderer;
          if (this.label) {
            let t11 = !this.label.hasClass("highcharts-label");
            (!r10 && t11 || r10 && !t11) && this.destroy();
          }
          if (!this.label) {
            if (this.outside) {
              let t11 = this.chart, e11 = t11.options.chart.style, i11 = ez.getRendererType();
              this.container = a10 = V.doc.createElement("div"), a10.className = "highcharts-tooltip-container " + (t11.renderTo.className.match(/(highcharts[a-zA-Z0-9-]+)\s?/gm) || ""), oW(a10, {
                position: "absolute",
                top: "1px",
                pointerEvents: "none",
                zIndex: Math.max(this.options.style.zIndex || 0, (e11?.zIndex || 0) + 3)
              }), this.renderer = n10 = new i11(a10, 0, 0, e11, void 0, void 0, n10.styledMode);
            }
            if (r10 ? this.label = n10.g("tooltip") : (this.label = n10.label("", t10, e10, o10.shape || "callout", void 0, void 0, o10.useHTML, void 0, "tooltip").attr({
              padding: o10.padding,
              r: o10.borderRadius
            }), s10 || this.label.attr({
              fill: o10.backgroundColor,
              "stroke-width": o10.borderWidth || 0
            }).css(o10.style).css({
              pointerEvents: o10.style.pointerEvents || (this.shouldStickOnContact() ? "auto" : "none")
            })), i10.outside) {
              let t11 = this.label;
              [t11.xSetter, t11.ySetter].forEach((e11, s11) => {
                t11[s11 ? "ySetter" : "xSetter"] = (o11) => {
                  e11.call(t11, i10.distance), t11[s11 ? "y" : "x"] = o11, a10 && (a10.style[s11 ? "top" : "left"] = `${o11}px`);
                };
              });
            }
            this.label.attr({
              zIndex: 8
            }).shadow(o10.shadow ?? !o10.fixed).add();
          }
          return a10 && !a10.parentElement && V.doc.body.appendChild(a10), this.label;
        }
        getPlayingField() {
          let {
            body: t10,
            documentElement: e10
          } = oD, {
            chart: i10,
            distance: s10,
            outside: o10
          } = this;
          return {
            width: o10 ? Math.max(t10.scrollWidth, e10.scrollWidth, t10.offsetWidth, e10.offsetWidth, e10.clientWidth) - 2 * s10 - 2 : i10.chartWidth,
            height: o10 ? Math.max(t10.scrollHeight, e10.scrollHeight, t10.offsetHeight, e10.offsetHeight, e10.clientHeight) : i10.chartHeight
          };
        }
        getPosition(t10, e10, i10) {
          let {
            distance: s10,
            chart: o10,
            outside: r10,
            pointer: a10
          } = this, {
            inverted: n10,
            plotLeft: h10,
            plotTop: l10,
            polar: d10
          } = o10, {
            plotX: c10 = 0,
            plotY: p10 = 0
          } = i10, u10 = {}, g2 = n10 && i10.h || 0, {
            height: f2,
            width: m2
          } = this.getPlayingField(), x2 = a10.getChartPosition(), y2 = (i11) => {
            let a11 = "x" === i11;
            return [i11, a11 ? m2 : f2, a11 ? t10 : e10].concat(r10 ? [a11 ? t10 * x2.scaleX : e10 * x2.scaleY, a11 ? x2.left - s10 + (c10 + h10) * x2.scaleX : x2.top - s10 + (p10 + l10) * x2.scaleY, 0, a11 ? m2 : f2] : [a11 ? t10 : e10, a11 ? c10 + h10 : p10 + l10, a11 ? h10 : l10, a11 ? h10 + o10.plotWidth : l10 + o10.plotHeight]);
          }, b2 = y2("y"), v2 = y2("x"), k2, M2 = !!i10.negative;
          !d10 && o10.hoverSeries?.yAxis?.reversed && (M2 = !M2);
          let w2 = !this.followPointer && oZ(i10.ttBelow, !d10 && !n10 === M2), S2 = function(t11, e11, i11, o11, a11, n11, h11) {
            let l11 = r10 ? "y" === t11 ? s10 * x2.scaleY : s10 * x2.scaleX : s10, d11 = (i11 - o11) / 2, c11 = o11 < a11 - s10, p11 = a11 + s10 + o11 < e11, f3 = a11 - l11 - i11 + d11, m3 = a11 + l11 - d11;
            if (w2 && p11) u10[t11] = m3;
            else if (!w2 && c11) u10[t11] = f3;
            else if (c11) u10[t11] = Math.min(h11 - o11, f3 - g2 < 0 ? f3 : f3 - g2);
            else {
              if (!p11) return u10[t11] = 0, false;
              u10[t11] = Math.max(n11, m3 + g2 + i11 > e11 ? m3 : m3 + g2);
            }
          }, A2 = function(t11, e11, i11, o11, r11) {
            if (r11 < s10 || r11 > e11 - s10) return false;
            r11 < i11 / 2 ? u10[t11] = 1 : r11 > e11 - o11 / 2 ? u10[t11] = e11 - o11 - 2 : u10[t11] = r11 - i11 / 2;
          }, T2 = function(t11) {
            [b2, v2] = [v2, b2], k2 = t11;
          }, C2 = () => {
            false !== S2.apply(0, b2) ? false !== A2.apply(0, v2) || k2 || (T2(true), C2()) : k2 ? u10.x = u10.y = 0 : (T2(true), C2());
          };
          return (n10 && !d10 || this.len > 1) && T2(), C2(), u10;
        }
        getFixedPosition(t10, e10, i10) {
          let s10 = i10.series, {
            chart: o10,
            options: r10,
            split: a10
          } = this, n10 = r10.position, h10 = n10.relativeTo, l10 = r10.shared || s10?.yAxis?.isRadial && ("pane" === h10 || !h10) ? "plotBox" : h10, d10 = "chart" === l10 ? o10.renderer : o10[l10] || o10.getClipBox(s10, true);
          return {
            x: d10.x + (d10.width - t10) * oY(n10.align) + n10.x,
            y: d10.y + (d10.height - e10) * oY(n10.verticalAlign) + (!a10 && n10.y || 0)
          };
        }
        hide(t10) {
          let e10 = this;
          oG(this.hideTimer), t10 = oZ(t10, this.options.hideDelay), this.isHidden || (this.hideTimer = oJ(function() {
            let i10 = e10.getLabel();
            e10.getLabel().animate({
              opacity: 0
            }, {
              duration: t10 ? 150 : t10,
              complete: () => {
                i10.hide(), e10.container && e10.container.remove();
              }
            }), e10.isHidden = true;
          }, t10));
        }
        init(t10, e10) {
          this.chart = t10, this.options = e10, this.crosshairs = [], this.isHidden = true, this.split = e10.split && !t10.inverted && !t10.polar, this.shared = e10.shared || this.split, this.outside = oZ(e10.outside, !!(t10.scrollablePixelsX || t10.scrollablePixelsY));
        }
        shouldStickOnContact(t10) {
          return !!(!this.followPointer && this.options.stickOnContact && (!t10 || this.pointer.inClass(t10.target, "highcharts-tooltip")));
        }
        move(t10, e10, i10, s10) {
          let {
            followPointer: o10,
            options: r10
          } = this, a10 = oO(!o10 && !this.isHidden && !r10.fixed && r10.animation), n10 = o10 || (this.len || 0) > 1, h10 = {
            x: t10,
            y: e10
          };
          n10 ? h10.anchorX = h10.anchorY = NaN : (h10.anchorX = i10, h10.anchorY = s10), a10.step = () => this.drawTracker(), this.getLabel().animate(h10, a10);
        }
        refresh(t10, e10) {
          let {
            chart: i10,
            options: s10,
            pointer: o10,
            shared: r10
          } = this, a10 = oK(t10), n10 = a10[0], h10 = s10.format, l10 = s10.formatter || this.defaultFormatter, d10 = i10.styledMode, c10 = this.allowShared;
          if (!s10.enabled || !n10.series) return;
          oG(this.hideTimer), this.allowShared = !(!oj(t10) && t10.series && t10.series.noSharedTooltip), c10 = c10 && !this.allowShared, this.followPointer = !this.split && n10.series.tooltipOptions.followPointer;
          let p10 = this.getAnchor(t10, e10), u10 = p10[0], g2 = p10[1];
          r10 && this.allowShared && (o10.applyInactiveState(a10), a10.forEach((t11) => t11.setState("hover")), n10.points = a10), this.len = a10.length;
          let f2 = o$(h10) ? oE(h10, n10, i10) : l10.call(n10, this);
          n10.points = void 0;
          let m2 = n10.series;
          if (this.distance = oZ(m2.tooltipOptions.distance, 16), false === f2) this.hide();
          else {
            if (this.split && this.allowShared) this.renderSplit(f2, a10);
            else {
              let t11 = u10, r11 = g2;
              if (e10 && o10.isDirectTouch && (t11 = e10.chartX - i10.plotLeft, r11 = e10.chartY - i10.plotTop), !(i10.polar || false === m2.options.clip || a10.some((e11) => o10.isDirectTouch || e11.series.shouldShowTooltip(t11, r11)))) return void this.hide();
              {
                let t12 = this.getLabel(c10 && this.tt || {});
                (!s10.style.width || d10) && t12.css({
                  width: (this.outside ? this.getPlayingField() : i10.spacingBox).width + "px"
                }), t12.attr({
                  class: this.getClassName(n10),
                  text: f2 && f2.join ? f2.join("") : f2
                }), this.outside && t12.attr({
                  x: oN(t12.x || 0, 0, this.getPlayingField().width - (t12.width || 0) - 1)
                }), d10 || t12.attr({
                  stroke: s10.borderColor || n10.color || m2.color || "#666666"
                }), this.updatePosition({
                  plotX: u10,
                  plotY: g2,
                  negative: n10.negative,
                  ttBelow: n10.ttBelow,
                  series: m2,
                  h: p10[2] || 0
                });
              }
            }
            this.isHidden && this.label && this.label.attr({
              opacity: 1
            }).show(), this.isHidden = false;
          }
          oF(this, "refresh");
        }
        renderSplit(t10, e10) {
          let i10 = this, {
            chart: s10,
            chart: {
              chartWidth: o10,
              chartHeight: r10,
              plotHeight: a10,
              plotLeft: n10,
              plotTop: h10,
              scrollablePixelsY: l10 = 0,
              scrollablePixelsX: d10,
              styledMode: c10
            },
            distance: p10,
            options: u10,
            options: {
              fixed: g2,
              position: f2,
              positioner: m2
            },
            pointer: x2
          } = i10, {
            scrollLeft: y2 = 0,
            scrollTop: b2 = 0
          } = s10.scrollablePlotArea?.scrollingContainer || {}, v2 = i10.outside && "number" != typeof d10 ? oD.documentElement.getBoundingClientRect() : {
            left: y2,
            right: y2 + o10,
            top: b2,
            bottom: b2 + r10
          }, k2 = i10.getLabel(), M2 = this.renderer || s10.renderer, w2 = !!s10.xAxis[0]?.opposite, {
            left: S2,
            top: A2
          } = x2.getChartPosition(), T2 = m2 || g2, C2 = h10 + b2, P2 = 0, O2 = a10 - l10, E2 = function(t11, e11, s11, o11 = [0, 0], r11 = true) {
            let a11, n11;
            if (s11.isHeader) n11 = w2 ? 0 : O2, a11 = oN(o11[0] - t11 / 2, v2.left, v2.right - t11 - (i10.outside ? S2 : 0));
            else if (g2 && s11) {
              let o12 = i10.getFixedPosition(t11, e11, s11);
              a11 = o12.x, n11 = o12.y - C2;
            } else n11 = o11[1] - C2, a11 = oN(a11 = r11 ? o11[0] - t11 - p10 : o11[0] + p10, r11 ? a11 : v2.left, v2.right);
            return {
              x: a11,
              y: n11
            };
          };
          o$(t10) && (t10 = [false, t10]);
          let L2 = t10.slice(0, e10.length + 1).reduce(function(t11, s11, o11) {
            if (false !== s11 && "" !== s11) {
              let r11 = e10[o11 - 1] || {
                isHeader: true,
                plotX: e10[0].plotX,
                plotY: a10,
                series: {}
              }, l11 = r11.isHeader, d11 = l11 ? i10 : r11.series, f3 = d11.tt = function(t12, e11, s12) {
                let o12 = t12, {
                  isHeader: r12,
                  series: a11
                } = e11, n11 = a11.tooltipOptions || u10;
                if (!o12) {
                  let t13 = {
                    padding: n11.padding,
                    r: n11.borderRadius
                  };
                  c10 || (t13.fill = n11.backgroundColor, t13["stroke-width"] = n11.borderWidth ?? (g2 && !r12 ? 0 : 1)), o12 = M2.label("", 0, 0, n11[r12 ? "headerShape" : "shape"] || (g2 && !r12 ? "rect" : "callout"), void 0, void 0, n11.useHTML).addClass(i10.getClassName(e11, true, r12)).attr(t13).add(k2);
                }
                return o12.isActive = true, o12.attr({
                  text: s12
                }), c10 || o12.css(n11.style).attr({
                  stroke: n11.borderColor || e11.color || a11.color || "#333333"
                }), o12;
              }(d11.tt, r11, s11.toString()), x3 = f3.getBBox(), y3 = x3.width + f3.strokeWidth();
              l11 && (P2 = x3.height, O2 += P2, w2 && (C2 -= P2));
              let {
                anchorX: b3,
                anchorY: S3
              } = function(t12) {
                let e11, i11, {
                  isHeader: s12,
                  plotX: o12 = 0,
                  plotY: r12 = 0,
                  series: l12
                } = t12;
                if (s12) e11 = Math.max(n10 + o12, n10), i11 = h10 + a10 / 2;
                else {
                  let {
                    xAxis: t13,
                    yAxis: s13
                  } = l12;
                  e11 = t13.pos + oN(o12, -p10, t13.len + p10), l12.shouldShowTooltip(0, s13.pos - h10 + r12, {
                    ignoreX: true
                  }) && (i11 = s13.pos + r12);
                }
                return {
                  anchorX: e11 = oN(e11, v2.left - p10, v2.right + p10),
                  anchorY: i11
                };
              }(r11);
              if ("number" == typeof S3) {
                let e11 = x3.height + 1, s12 = (m2 || E2).call(i10, y3, e11, r11, [b3, S3]);
                t11.push({
                  align: T2 ? 0 : void 0,
                  anchorX: b3,
                  anchorY: S3,
                  boxWidth: y3,
                  point: r11,
                  rank: oZ(s12.rank, +!!l11),
                  size: e11,
                  target: s12.y,
                  tt: f3,
                  x: s12.x
                });
              } else f3.isActive = false;
            }
            return t11;
          }, []);
          !T2 && L2.some((t11) => {
            let {
              outside: e11
            } = i10, s11 = (e11 ? S2 : 0) + t11.anchorX;
            return s11 < v2.left && s11 + t11.boxWidth < v2.right || s11 < S2 - v2.left + t11.boxWidth && v2.right - s11 > s11;
          }) && (L2 = L2.map((t11) => {
            let {
              x: e11,
              y: i11
            } = E2.call(this, t11.boxWidth, t11.size, t11.point, [t11.anchorX, t11.anchorY], false);
            return oH(t11, {
              target: i11,
              x: e11
            });
          })), i10.cleanSplit(), oz(L2, O2);
          let B2 = {
            left: S2,
            right: S2
          };
          L2.forEach(function(t11) {
            let {
              x: e11,
              boxWidth: s11,
              isHeader: o11
            } = t11;
            !o11 && (i10.outside && S2 + e11 < B2.left && (B2.left = S2 + e11), !o11 && i10.outside && B2.left + s11 > B2.right && (B2.right = S2 + e11));
          }), L2.forEach(function(t11) {
            let {
              x: e11,
              anchorX: s11,
              anchorY: o11,
              pos: r11,
              point: {
                isHeader: a11
              }
            } = t11, n11 = {
              visibility: void 0 === r11 ? "hidden" : "inherit",
              x: e11,
              y: (r11 || 0) + C2 + (g2 && f2.y || 0),
              anchorX: s11,
              anchorY: o11
            };
            if (i10.outside && e11 < s11) {
              let t12 = S2 - B2.left;
              t12 > 0 && (a11 || (n11.x = e11 + t12, n11.anchorX = s11 + t12), a11 && (n11.x = (B2.right - B2.left) / 2, n11.anchorX = s11 + t12));
            }
            t11.tt.attr(n11);
          });
          let {
            container: D2,
            outside: I2,
            renderer: z2
          } = i10;
          if (I2 && D2 && z2) {
            let {
              width: t11,
              height: e11,
              x: i11,
              y: s11
            } = k2.getBBox();
            z2.setSize(t11 + i11, e11 + s11, false), D2.style.left = B2.left + "px", D2.style.top = A2 + "px";
          }
          oI && k2.attr({
            opacity: 1 === k2.opacity ? 0.999 : 1
          });
        }
        drawTracker() {
          let t10 = this;
          if (!this.shouldStickOnContact()) {
            t10.tracker && (t10.tracker = t10.tracker.destroy());
            return;
          }
          let e10 = t10.chart, i10 = t10.label, s10 = t10.shared ? e10.hoverPoints : e10.hoverPoint;
          if (!i10 || !s10) return;
          let o10 = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
          }, r10 = this.getAnchor(s10), a10 = i10.getBBox();
          r10[0] += e10.plotLeft - (i10.translateX || 0), r10[1] += e10.plotTop - (i10.translateY || 0), o10.x = Math.min(0, r10[0]), o10.y = Math.min(0, r10[1]), o10.width = r10[0] < 0 ? Math.max(Math.abs(r10[0]), a10.width - r10[0]) : Math.max(Math.abs(r10[0]), a10.width), o10.height = r10[1] < 0 ? Math.max(Math.abs(r10[1]), a10.height - Math.abs(r10[1])) : Math.max(Math.abs(r10[1]), a10.height), t10.tracker ? t10.tracker.attr(o10) : (t10.tracker = i10.renderer.rect(o10).addClass("highcharts-tracker").add(i10), oR(t10.tracker.element, "mouseenter", () => {
            oG(t10.hideTimer);
          }), e10.styledMode || t10.tracker.attr({
            fill: "rgba(0,0,0,0)"
          }));
        }
        styledModeFormat(t10) {
          return t10.replace('style="font-size: 0.8em"', 'class="highcharts-header"').replace(/style="color:{(point|series)\.color}"/g, 'class="highcharts-color-{$1.colorIndex} {series.options.className} {point.options.className}"');
        }
        headerFooterFormatter(t10, e10) {
          let i10 = t10.series, s10 = i10.tooltipOptions, o10 = i10.xAxis, r10 = o10?.dateTime, a10 = {
            isFooter: e10,
            point: t10
          }, n10 = s10.xDateFormat || "", h10 = s10[e10 ? "footerFormat" : "headerFormat"];
          return oF(this, "headerFormatter", a10, function(e11) {
            if (r10 && !n10 && oU(t10.key) && (n10 = r10.getXDateFormat(t10.key, s10.dateTimeLabelFormats)), r10 && n10) {
              if (oV(n10)) {
                let t11 = n10;
                oB[0] = (e12) => i10.chart.time.dateFormat(t11, e12), n10 = "%0";
              }
              (t10.tooltipDateKeys || ["key"]).forEach((t11) => {
                h10 = h10.replace(RegExp("point\\." + t11 + "([ \\)}])"), `(point.${t11}:${n10})$1`);
              });
            }
            i10.chart.styledMode && (h10 = this.styledModeFormat(h10)), e11.text = oE(h10, t10, this.chart);
          }), a10.text || "";
        }
        update(t10) {
          this.destroy(), this.init(this.chart, o_(true, this.options, t10));
        }
        updatePosition(t10) {
          let {
            chart: e10,
            container: i10,
            distance: s10,
            options: o10,
            pointer: r10,
            renderer: a10
          } = this, {
            height: n10 = 0,
            width: h10 = 0
          } = this.getLabel(), {
            fixed: l10,
            positioner: d10
          } = o10, {
            left: c10,
            top: p10,
            scaleX: u10,
            scaleY: g2
          } = r10.getChartPosition(), f2 = (d10 || l10 && this.getFixedPosition || this.getPosition).call(this, h10, n10, t10), m2 = V.doc, x2 = (t10.plotX || 0) + e10.plotLeft, y2 = (t10.plotY || 0) + e10.plotTop, b2;
          if (a10 && i10) {
            if (d10 || l10) {
              let {
                scrollLeft: t11 = 0,
                scrollTop: i11 = 0
              } = e10.scrollablePlotArea?.scrollingContainer || {};
              f2.x += t11 + c10 - s10, f2.y += i11 + p10 - s10;
            }
            b2 = (o10.borderWidth || 0) + 2 * s10 + 2, a10.setSize(oN(h10 + b2, 0, m2.documentElement.clientWidth) - 1, n10 + b2, false), (1 !== u10 || 1 !== g2) && (oW(i10, {
              transform: `scale(${u10}, ${g2})`
            }), x2 *= u10, y2 *= g2), x2 += c10 - f2.x, y2 += p10 - f2.y;
          }
          this.move(Math.round(f2.x), Math.round(f2.y || 0), x2, y2);
        }
      }
      (u = oQ || (oQ = {})).compose = function(t10) {
        oq(oL, "Core.Tooltip") && oR(t10, "afterInit", function() {
          let t11 = this.chart;
          t11.options.tooltip && (t11.tooltip = new u(t11, t11.options.tooltip, this));
        });
      };
      let o0 = oQ, {
        animObject: o1
      } = eo, {
        defaultOptions: o2
      } = tY, {
        format: o3
      } = eI, {
        addEvent: o5,
        crisp: o6,
        erase: o9,
        extend: o4,
        fireEvent: o8,
        getNestedProperty: o7,
        isArray: rt,
        isFunction: re,
        isNumber: ri,
        isObject: rs,
        merge: ro,
        pick: rr,
        syncTimeout: ra,
        removeEvent: rn,
        uniqueKey: rh
      } = tx;
      class rl {
        constructor(t10, e10, i10) {
          this.formatPrefix = "point", this.visible = true, this.point = this, this.series = t10, this.applyOptions(e10, i10), this.id ?? (this.id = rh()), this.resolveColor(), this.dataLabelOnNull ?? (this.dataLabelOnNull = t10.options.nullInteraction), t10.chart.pointCount++, this.category = t10.xAxis?.categories?.[this.x] ?? this.x, this.key = this.name ?? this.category, o8(this, "afterInit");
        }
        animateBeforeDestroy() {
          let t10 = this, e10 = {
            x: t10.startXPos,
            opacity: 0
          }, i10 = t10.getGraphicalProps();
          i10.singular.forEach(function(i11) {
            t10[i11] = t10[i11].animate("dataLabel" === i11 ? {
              x: t10[i11].startXPos,
              y: t10[i11].startYPos,
              opacity: 0
            } : e10);
          }), i10.plural.forEach(function(e11) {
            t10[e11].forEach(function(e12) {
              e12.element && e12.animate(o4({
                x: t10.startXPos
              }, e12.startYPos ? {
                x: e12.startXPos,
                y: e12.startYPos
              } : {}));
            });
          });
        }
        applyOptions(t10, e10) {
          let i10 = this.series, s10 = i10.options.pointValKey || i10.pointValKey;
          return o4(this, t10 = rl.prototype.optionsToObject.call(this, t10)), this.options = this.options ? o4(this.options, t10) : t10, t10.group && delete this.group, t10.dataLabels && delete this.dataLabels, s10 && (this.y = rl.prototype.getNestedProperty.call(this, s10)), this.selected && (this.state = "select"), "name" in this && void 0 === e10 && i10.xAxis && i10.xAxis.hasNames && (this.x = i10.xAxis.nameToX(this)), void 0 === this.x && i10 ? this.x = e10 ?? i10.autoIncrement() : ri(t10.x) && i10.options.relativeXValue ? this.x = i10.autoIncrement(t10.x) : "string" == typeof this.x && (e10 ?? (e10 = i10.chart.time.parse(this.x)), ri(e10) && (this.x = e10)), this.isNull = this.isValid && !this.isValid(), this.formatPrefix = this.isNull ? "null" : "point", this;
        }
        destroy() {
          if (!this.destroyed) {
            let t10 = this, e10 = t10.series, i10 = e10.chart, s10 = e10.options.dataSorting, o10 = i10.hoverPoints, r10 = o1(t10.series.chart.renderer.globalAnimation), a10 = () => {
              for (let e11 in (t10.graphic || t10.graphics || t10.dataLabel || t10.dataLabels) && (rn(t10), t10.destroyElements()), t10) delete t10[e11];
            };
            t10.legendItem && i10.legend.destroyItem(t10), o10 && (t10.setState(), o9(o10, t10), o10.length || (i10.hoverPoints = null)), t10 === i10.hoverPoint && t10.onMouseOut(), s10?.enabled ? (this.animateBeforeDestroy(), ra(a10, r10.duration)) : a10(), i10.pointCount--;
          }
          this.destroyed = true;
        }
        destroyElements(t10) {
          let e10 = this, i10 = e10.getGraphicalProps(t10);
          i10.singular.forEach(function(t11) {
            e10[t11] = e10[t11].destroy();
          }), i10.plural.forEach(function(t11) {
            e10[t11].forEach(function(t12) {
              t12?.element && t12.destroy();
            }), delete e10[t11];
          });
        }
        firePointEvent(t10, e10, i10) {
          let s10 = this, o10 = this.series.options;
          s10.manageEvent(t10), "click" === t10 && o10.allowPointSelect && (i10 = function(t11) {
            !s10.destroyed && s10.select && s10.select(null, t11.ctrlKey || t11.metaKey || t11.shiftKey);
          }), o8(s10, t10, e10, i10);
        }
        getClassName() {
          return "highcharts-point" + (this.selected ? " highcharts-point-select" : "") + (this.negative ? " highcharts-negative" : "") + (this.isNull ? " highcharts-null-point" : "") + (void 0 !== this.colorIndex ? " highcharts-color-" + this.colorIndex : "") + (this.options.className ? " " + this.options.className : "") + (this.zone?.className ? " " + this.zone.className.replace("highcharts-negative", "") : "");
        }
        getGraphicalProps(t10) {
          let e10, i10, s10 = this, o10 = [], r10 = {
            singular: [],
            plural: []
          };
          for ((t10 = t10 || {
            graphic: 1,
            dataLabel: 1
          }).graphic && o10.push("graphic", "connector"), t10.dataLabel && o10.push("dataLabel", "dataLabelPath", "dataLabelUpper"), i10 = o10.length; i10--; ) s10[e10 = o10[i10]] && r10.singular.push(e10);
          return ["graphic", "dataLabel"].forEach(function(e11) {
            let i11 = e11 + "s";
            t10[e11] && s10[i11] && r10.plural.push(i11);
          }), r10;
        }
        getNestedProperty(t10) {
          if (t10) return 0 === t10.indexOf("custom.") ? o7(t10, this.options) : this[t10];
        }
        getZone() {
          let t10 = this.series, e10 = t10.zones, i10 = t10.zoneAxis || "y", s10, o10 = 0;
          for (s10 = e10[0]; this[i10] >= s10.value; ) s10 = e10[++o10];
          return this.nonZonedColor || (this.nonZonedColor = this.color), s10?.color && !this.options.color ? this.color = s10.color : this.color = this.nonZonedColor, s10;
        }
        hasNewShapeType() {
          return (this.graphic && (this.graphic.symbolName || this.graphic.element.nodeName)) !== this.shapeType;
        }
        isValid() {
          return (ri(this.x) || this.x instanceof Date) && ri(this.y);
        }
        optionsToObject(t10) {
          let e10 = this.series, i10 = e10.options.keys, s10 = i10 || e10.pointArrayMap || ["y"], o10 = s10.length, r10 = {}, a10, n10 = 0, h10 = 0;
          if (ri(t10) || null === t10) r10[s10[0]] = t10;
          else if (rt(t10)) for (!i10 && t10.length > o10 && ("string" == (a10 = typeof t10[0]) ? e10.xAxis?.dateTime ? r10.x = e10.chart.time.parse(t10[0]) : r10.name = t10[0] : "number" === a10 && (r10.x = t10[0]), n10++); h10 < o10; ) i10 && void 0 === t10[n10] || (s10[h10].indexOf(".") > 0 ? rl.prototype.setNestedProperty(r10, t10[n10], s10[h10]) : r10[s10[h10]] = t10[n10]), n10++, h10++;
          else "object" == typeof t10 && (r10 = t10, t10.dataLabels && (e10.hasDataLabels = () => true), t10.marker && (e10._hasPointMarkers = true));
          return r10;
        }
        pos(t10, e10 = this.plotY) {
          if (!this.destroyed) {
            let {
              plotX: i10,
              series: s10
            } = this, {
              chart: o10,
              xAxis: r10,
              yAxis: a10
            } = s10, n10 = 0, h10 = 0;
            if (ri(i10) && ri(e10)) return t10 && (n10 = r10 ? r10.pos : o10.plotLeft, h10 = a10 ? a10.pos : o10.plotTop), o10.inverted && r10 && a10 ? [a10.len - e10 + h10, r10.len - i10 + n10] : [i10 + n10, e10 + h10];
          }
        }
        resolveColor() {
          let t10 = this.series, e10 = t10.chart.options.chart, i10 = t10.chart.styledMode, s10, o10, r10 = e10.colorCount, a10;
          delete this.nonZonedColor, t10.options.colorByPoint ? (i10 || (s10 = (o10 = t10.options.colors || t10.chart.options.colors)[t10.colorCounter], r10 = o10.length), a10 = t10.colorCounter, t10.colorCounter++, t10.colorCounter === r10 && (t10.colorCounter = 0)) : (i10 || (s10 = t10.color), a10 = t10.colorIndex), this.colorIndex = rr(this.options.colorIndex, a10), this.color = rr(this.options.color, s10);
        }
        setNestedProperty(t10, e10, i10) {
          return i10.split(".").reduce(function(t11, i11, s10, o10) {
            let r10 = o10.length - 1 === s10;
            return t11[i11] = r10 ? e10 : rs(t11[i11], true) ? t11[i11] : {}, t11[i11];
          }, t10), t10;
        }
        shouldDraw() {
          return !this.isNull;
        }
        tooltipFormatter(t10) {
          let {
            chart: e10,
            pointArrayMap: i10 = ["y"],
            tooltipOptions: s10
          } = this.series, {
            valueDecimals: o10 = "",
            valuePrefix: r10 = "",
            valueSuffix: a10 = ""
          } = s10;
          return e10.styledMode && (t10 = e10.tooltip?.styledModeFormat(t10) || t10), i10.forEach((e11) => {
            e11 = "{point." + e11, (r10 || a10) && (t10 = t10.replace(RegExp(e11 + "}", "g"), r10 + e11 + "}" + a10)), t10 = t10.replace(RegExp(e11 + "}", "g"), e11 + ":,." + o10 + "f}");
          }), o3(t10, this, e10);
        }
        update(t10, e10, i10, s10) {
          let o10, r10 = this, a10 = r10.series, n10 = r10.graphic, h10 = a10.chart, l10 = a10.options;
          function d10() {
            r10.applyOptions(t10);
            let s11 = n10 && r10.hasMockGraphic, d11 = null === r10.y ? !s11 : s11;
            n10 && d11 && (r10.graphic = n10.destroy(), delete r10.hasMockGraphic), rs(t10, true) && (n10?.element && t10 && t10.marker && void 0 !== t10.marker.symbol && (r10.graphic = n10.destroy()), t10?.dataLabels && r10.dataLabel && (r10.dataLabel = r10.dataLabel.destroy())), o10 = r10.index;
            let c10 = {};
            for (let t11 of a10.dataColumnKeys()) c10[t11] = r10[t11];
            a10.dataTable.setRow(c10, o10), l10.data[o10] = rs(l10.data[o10], true) || rs(t10, true) ? r10.options : rr(t10, l10.data[o10]), a10.isDirty = a10.isDirtyData = true, !a10.fixedBox && a10.hasCartesianSeries && (h10.isDirtyBox = true), "point" === l10.legendType && (h10.isDirtyLegend = true), e10 && h10.redraw(i10);
          }
          e10 = rr(e10, true), false === s10 ? d10() : r10.firePointEvent("update", {
            options: t10
          }, d10);
        }
        remove(t10, e10) {
          this.series.removePoint(this.series.data.indexOf(this), t10, e10);
        }
        select(t10, e10) {
          let i10 = this, s10 = i10.series, o10 = s10.chart;
          t10 = rr(t10, !i10.selected), this.selectedStaging = t10, i10.firePointEvent(t10 ? "select" : "unselect", {
            accumulate: e10
          }, function() {
            i10.selected = i10.options.selected = t10, s10.options.data[s10.data.indexOf(i10)] = i10.options, i10.setState(t10 && "select"), e10 || o10.getSelectedPoints().forEach(function(t11) {
              let e11 = t11.series;
              t11.selected && t11 !== i10 && (t11.selected = t11.options.selected = false, e11.options.data[e11.data.indexOf(t11)] = t11.options, t11.setState(o10.hoverPoints && e11.options.inactiveOtherPoints ? "inactive" : ""), t11.firePointEvent("unselect"));
            });
          }), delete this.selectedStaging;
        }
        onMouseOver(t10) {
          let {
            inverted: e10,
            pointer: i10
          } = this.series.chart;
          i10 && (t10 = t10 ? i10.normalize(t10) : i10.getChartCoordinatesFromPoint(this, e10), i10.runPointActions(t10, this));
        }
        onMouseOut() {
          let t10 = this.series.chart;
          this.firePointEvent("mouseOut"), this.series.options.inactiveOtherPoints || (t10.hoverPoints || []).forEach(function(t11) {
            t11.setState();
          }), t10.hoverPoints = t10.hoverPoint = null;
        }
        manageEvent(t10) {
          let e10 = ro(this.series.options.point, this.options), i10 = e10.events?.[t10];
          re(i10) && (!this.hcEvents?.[t10] || this.hcEvents?.[t10]?.map((t11) => t11.fn).indexOf(i10) === -1) ? (this.importedUserEvent?.(), this.importedUserEvent = o5(this, t10, i10), this.hcEvents && (this.hcEvents[t10].userEvent = true)) : this.importedUserEvent && !i10 && this.hcEvents?.[t10] && this.hcEvents?.[t10].userEvent && (rn(this, t10), delete this.hcEvents[t10], Object.keys(this.hcEvents) || delete this.importedUserEvent);
        }
        setState(t10, e10) {
          let i10 = this.series, s10 = this.state, o10 = i10.options.states[t10 || "normal"] || {}, r10 = o2.plotOptions[i10.type].marker && i10.options.marker, a10 = r10 && false === r10.enabled, n10 = r10?.states?.[t10 || "normal"] || {}, h10 = false === n10.enabled, l10 = this.marker || {}, d10 = i10.chart, c10 = r10 && i10.markerAttribs, p10 = i10.halo, u10, g2, f2, m2 = i10.stateMarkerGraphic, x2;
          if ((t10 = t10 || "") === this.state && !e10 || this.selected && "select" !== t10 || false === o10.enabled || t10 && (h10 || a10 && false === n10.enabled) || t10 && l10.states && l10.states[t10] && false === l10.states[t10].enabled) return;
          if (this.state = t10, c10 && (u10 = i10.markerAttribs(this, t10)), this.graphic && !this.hasMockGraphic) {
            if (s10 && this.graphic.removeClass("highcharts-point-" + s10), t10 && this.graphic.addClass("highcharts-point-" + t10), !d10.styledMode) {
              g2 = i10.pointAttribs(this, t10), f2 = rr(d10.options.chart.animation, o10.animation);
              let e11 = g2.opacity;
              i10.options.inactiveOtherPoints && ri(e11) && (this.dataLabels || []).forEach(function(t11) {
                t11 && !t11.hasClass("highcharts-data-label-hidden") && (t11.animate({
                  opacity: e11
                }, f2), t11.connector && t11.connector.animate({
                  opacity: e11
                }, f2));
              }), this.graphic.animate(g2, f2);
            }
            u10 && this.graphic.animate(u10, rr(d10.options.chart.animation, n10.animation, r10.animation)), m2 && m2.hide();
          } else t10 && n10 && (x2 = l10.symbol || i10.symbol, m2 && m2.currentSymbol !== x2 && (m2 = m2.destroy()), u10 && (m2 ? m2[e10 ? "animate" : "attr"]({
            x: u10.x,
            y: u10.y
          }) : x2 && (i10.stateMarkerGraphic = m2 = d10.renderer.symbol(x2, u10.x, u10.y, u10.width, u10.height, ro(r10, n10)).add(i10.markerGroup), m2.currentSymbol = x2)), !d10.styledMode && m2 && "inactive" !== this.state && m2.attr(i10.pointAttribs(this, t10))), m2 && (m2[t10 && this.isInside ? "show" : "hide"](), m2.element.point = this, m2.addClass(this.getClassName(), true));
          let y2 = o10.halo, b2 = this.graphic || m2, v2 = b2?.visibility || "inherit";
          y2?.size && b2 && "hidden" !== v2 && !this.isCluster ? (p10 || (i10.halo = p10 = d10.renderer.path().add(b2.parentGroup)), p10.show()[e10 ? "animate" : "attr"]({
            d: this.haloPath(y2.size)
          }), p10.attr({
            class: "highcharts-halo highcharts-color-" + rr(this.colorIndex, i10.colorIndex) + (this.className ? " " + this.className : ""),
            visibility: v2,
            zIndex: -1
          }), p10.point = this, d10.styledMode || p10.attr(o4({
            fill: this.color || i10.color,
            "fill-opacity": y2.opacity
          }, ey.filterUserAttributes(y2.attributes || {})))) : p10?.point?.haloPath && !p10.point.destroyed && p10.animate({
            d: p10.point.haloPath(0)
          }, null, p10.hide), o8(this, "afterSetState", {
            state: t10
          });
        }
        haloPath(t10) {
          let e10 = this.pos();
          return e10 ? this.series.chart.renderer.symbols.circle(o6(e10[0], 1) - t10, e10[1] - t10, 2 * t10, 2 * t10) : [];
        }
      }
      let rd = rl, {
        parse: rc
      } = tJ, {
        charts: rp,
        composed: ru,
        isTouchDevice: rg
      } = V, {
        addEvent: rf,
        attr: rm,
        css: rx,
        extend: ry,
        find: rb,
        fireEvent: rv,
        isNumber: rk,
        isObject: rM,
        objectEach: rw,
        offset: rS,
        pick: rA,
        pushUnique: rT,
        splat: rC
      } = tx;
      class rP {
        applyInactiveState(t10 = []) {
          let e10 = [];
          for (let i10 of (t10.forEach((t11) => {
            let i11 = t11.series;
            e10.push(i11), i11.linkedParent && e10.push(i11.linkedParent), i11.linkedSeries && e10.push.apply(e10, i11.linkedSeries), i11.navigatorSeries && e10.push(i11.navigatorSeries), i11.boosted && i11.markerGroup && e10.push.apply(e10, this.chart.series.filter((t12) => t12.markerGroup === i11.markerGroup));
          }), this.chart.series)) {
            let t11 = i10.options;
            t11.states?.inactive?.enabled !== false && (-1 === e10.indexOf(i10) ? i10.setState("inactive", true) : t11.inactiveOtherPoints && i10.setAllPointsToState("inactive"));
          }
        }
        destroy() {
          let t10 = this;
          this.eventsToUnbind.forEach((t11) => t11()), this.eventsToUnbind = [], !V.chartCount && (rP.unbindDocumentMouseUp.forEach((t11) => t11.unbind()), rP.unbindDocumentMouseUp.length = 0, rP.unbindDocumentTouchEnd && (rP.unbindDocumentTouchEnd = rP.unbindDocumentTouchEnd())), rw(t10, function(e10, i10) {
            t10[i10] = void 0;
          });
        }
        getSelectionMarkerAttrs(t10, e10) {
          let i10 = {
            args: {
              chartX: t10,
              chartY: e10
            },
            attrs: {},
            shapeType: "rect"
          };
          return rv(this, "getSelectionMarkerAttrs", i10, (i11) => {
            let s10, {
              chart: o10,
              zoomHor: r10,
              zoomVert: a10
            } = this, {
              mouseDownX: n10 = 0,
              mouseDownY: h10 = 0
            } = o10, l10 = i11.attrs;
            l10.x = o10.plotLeft, l10.y = o10.plotTop, l10.width = r10 ? 1 : o10.plotWidth, l10.height = a10 ? 1 : o10.plotHeight, r10 && (l10.width = Math.max(1, Math.abs(s10 = t10 - n10)), l10.x = (s10 > 0 ? 0 : s10) + n10), a10 && (l10.height = Math.max(1, Math.abs(s10 = e10 - h10)), l10.y = (s10 > 0 ? 0 : s10) + h10);
          }), i10;
        }
        drag(t10) {
          let {
            chart: e10
          } = this, {
            mouseDownX: i10 = 0,
            mouseDownY: s10 = 0
          } = e10, {
            panning: o10,
            panKey: r10,
            selectionMarkerFill: a10
          } = e10.options.chart, n10 = e10.plotLeft, h10 = e10.plotTop, l10 = e10.plotWidth, d10 = e10.plotHeight, c10 = rM(o10) ? o10.enabled : o10, p10 = r10 && t10[`${r10}Key`], u10 = t10.chartX, g2 = t10.chartY, f2, m2 = this.selectionMarker;
          if ((!m2 || !m2.touch) && (u10 < n10 ? u10 = n10 : u10 > n10 + l10 && (u10 = n10 + l10), g2 < h10 ? g2 = h10 : g2 > h10 + d10 && (g2 = h10 + d10), this.hasDragged = Math.sqrt(Math.pow(i10 - u10, 2) + Math.pow(s10 - g2, 2)), this.hasDragged > 10)) {
            f2 = e10.isInsidePlot(i10 - n10, s10 - h10, {
              visiblePlotOnly: true
            });
            let {
              shapeType: r11,
              attrs: l11
            } = this.getSelectionMarkerAttrs(u10, g2);
            this.hasZoom && f2 && !p10 && !m2 && (this.selectionMarker = m2 = e10.renderer[r11](), m2.attr({
              class: "highcharts-selection-marker",
              zIndex: 7
            }).add(), e10.styledMode || m2.attr({
              fill: a10 || rc("#334eff").setOpacity(0.25).get()
            })), m2 && m2.attr(l11), f2 && !m2 && c10 && e10.pan(t10, o10);
          }
        }
        dragStart(t10) {
          let e10 = this.chart;
          e10.mouseIsDown = t10.type, e10.cancelClick = false, e10.mouseDownX = t10.chartX, e10.mouseDownY = t10.chartY;
        }
        getSelectionBox(t10) {
          let e10 = {
            args: {
              marker: t10
            },
            result: t10.getBBox()
          };
          return rv(this, "getSelectionBox", e10), e10.result;
        }
        drop(t10) {
          let e10, {
            chart: i10,
            selectionMarker: s10
          } = this;
          for (let t11 of i10.axes) t11.isPanning && (t11.isPanning = false, (t11.options.startOnTick || t11.options.endOnTick || t11.series.some((t12) => t12.boosted)) && (t11.forceRedraw = true, t11.setExtremes(t11.userMin, t11.userMax, false), e10 = true));
          if (e10 && i10.redraw(), s10 && t10) {
            if (this.hasDragged) {
              let e11 = this.getSelectionBox(s10);
              i10.transform({
                axes: i10.axes.filter((t11) => t11.zoomEnabled && ("xAxis" === t11.coll && this.zoomX || "yAxis" === t11.coll && this.zoomY)),
                selection: __spreadValues({
                  originalEvent: t10,
                  xAxis: [],
                  yAxis: []
                }, e11),
                from: e11
              });
            }
            rk(i10.index) && (this.selectionMarker = s10.destroy());
          }
          i10 && rk(i10.index) && (rx(i10.container, {
            cursor: i10._cursor
          }), i10.cancelClick = this.hasDragged > 10, i10.mouseIsDown = false, this.hasDragged = 0, this.pinchDown = [], this.hasPinchMoved = false);
        }
        findNearestKDPoint(t10, e10, i10) {
          let s10;
          return t10.forEach(function(t11) {
            var o10;
            let r10, a10, n10, h10 = !(t11.noSharedTooltip && e10) && 0 > t11.options.findNearestPointBy.indexOf("y"), l10 = t11.searchPoint(i10, h10);
            rM(l10, true) && l10.series && (!rM(s10, true) || (r10 = (o10 = s10).distX - l10.distX, a10 = o10.dist - l10.dist, n10 = l10.series.group?.zIndex - o10.series.group?.zIndex, (0 !== r10 && e10 ? r10 : 0 !== a10 ? a10 : 0 !== n10 ? n10 : o10.series.index > l10.series.index ? -1 : 1) > 0)) && (s10 = l10);
          }), s10;
        }
        getChartCoordinatesFromPoint(t10, e10) {
          let {
            xAxis: i10,
            yAxis: s10
          } = t10.series, o10 = t10.shapeArgs;
          if (i10 && s10) {
            let r10 = t10.clientX ?? t10.plotX ?? 0, a10 = t10.plotY || 0;
            return t10.isNode && o10 && rk(o10.x) && rk(o10.y) && (r10 = o10.x, a10 = o10.y), e10 ? {
              chartX: s10.len + s10.pos - a10,
              chartY: i10.len + i10.pos - r10
            } : {
              chartX: r10 + i10.pos,
              chartY: a10 + s10.pos
            };
          }
          if (o10?.x && o10.y) return {
            chartX: o10.x,
            chartY: o10.y
          };
        }
        getChartPosition() {
          if (this.chartPosition) return this.chartPosition;
          let {
            container: t10
          } = this.chart, e10 = rS(t10);
          this.chartPosition = {
            left: e10.left,
            top: e10.top,
            scaleX: 1,
            scaleY: 1
          };
          let {
            offsetHeight: i10,
            offsetWidth: s10
          } = t10;
          return s10 > 2 && i10 > 2 && (this.chartPosition.scaleX = e10.width / s10, this.chartPosition.scaleY = e10.height / i10), this.chartPosition;
        }
        getCoordinates(t10) {
          let e10 = {
            xAxis: [],
            yAxis: []
          };
          for (let i10 of this.chart.axes) e10[i10.isXAxis ? "xAxis" : "yAxis"].push({
            axis: i10,
            value: i10.toValue(t10[i10.horiz ? "chartX" : "chartY"])
          });
          return e10;
        }
        getHoverData(t10, e10, i10, s10, o10, r10) {
          let a10 = [], n10 = function(t11) {
            return t11.visible && !(!o10 && t11.directTouch) && rA(t11.options.enableMouseTracking, true);
          }, h10 = e10, l10, d10 = {
            chartX: r10 ? r10.chartX : void 0,
            chartY: r10 ? r10.chartY : void 0,
            shared: o10
          };
          rv(this, "beforeGetHoverData", d10), l10 = h10 && !h10.stickyTracking ? [h10] : i10.filter((t11) => t11.stickyTracking && (d10.filter || n10)(t11));
          let c10 = s10 && t10 || !r10 ? t10 : this.findNearestKDPoint(l10, o10, r10);
          return h10 = c10?.series, c10 && (o10 && !h10.noSharedTooltip ? (l10 = i10.filter(function(t11) {
            return d10.filter ? d10.filter(t11) : n10(t11) && !t11.noSharedTooltip;
          })).forEach(function(t11) {
            let e11 = t11.options?.nullInteraction, i11 = rb(t11.points, function(t12) {
              return t12.x === c10.x && (!t12.isNull || !!e11);
            });
            rM(i11) && (t11.boosted && t11.boost && (i11 = t11.boost.getPoint(i11)), a10.push(i11));
          }) : a10.push(c10)), rv(this, "afterGetHoverData", d10 = {
            hoverPoint: c10
          }), {
            hoverPoint: d10.hoverPoint,
            hoverSeries: h10,
            hoverPoints: a10
          };
        }
        getPointFromEvent(t10) {
          let e10 = t10.target, i10;
          for (; e10 && !i10; ) i10 = e10.point, e10 = e10.parentNode;
          return i10;
        }
        onTrackerMouseOut(t10) {
          let e10 = this.chart, i10 = t10.relatedTarget, s10 = e10.hoverSeries;
          this.isDirectTouch = false, !s10 || !i10 || s10.stickyTracking || this.inClass(i10, "highcharts-tooltip") || this.inClass(i10, "highcharts-series-" + s10.index) && this.inClass(i10, "highcharts-tracker") || s10.onMouseOut();
        }
        inClass(t10, e10) {
          let i10 = t10, s10;
          for (; i10; ) {
            if (s10 = rm(i10, "class")) {
              if (-1 !== s10.indexOf(e10)) return true;
              if (-1 !== s10.indexOf("highcharts-container")) return false;
            }
            i10 = i10.parentElement;
          }
        }
        constructor(t10, e10) {
          this.hasDragged = 0, this.pointerCaptureEventsToUnbind = [], this.eventsToUnbind = [], this.options = e10, this.chart = t10, this.runChartClick = !!e10.chart.events?.click, this.pinchDown = [], this.setDOMEvents(), rv(this, "afterInit");
        }
        normalize(t10, e10) {
          let i10 = t10.touches, s10 = i10 ? i10.length ? i10.item(0) : rA(i10.changedTouches, t10.changedTouches)[0] : t10;
          e10 || (e10 = this.getChartPosition());
          let o10 = s10.pageX - e10.left, r10 = s10.pageY - e10.top;
          return ry(t10, {
            chartX: Math.round(o10 /= e10.scaleX),
            chartY: Math.round(r10 /= e10.scaleY)
          });
        }
        onContainerClick(t10) {
          let e10 = this.chart, i10 = e10.hoverPoint, s10 = this.normalize(t10), o10 = e10.plotLeft, r10 = e10.plotTop;
          !e10.cancelClick && (i10 && this.inClass(s10.target, "highcharts-tracker") ? (rv(i10.series, "click", ry(s10, {
            point: i10
          })), e10.hoverPoint && i10.firePointEvent("click", s10)) : (ry(s10, this.getCoordinates(s10)), e10.isInsidePlot(s10.chartX - o10, s10.chartY - r10, {
            visiblePlotOnly: true
          }) && rv(e10, "click", s10)));
        }
        onContainerMouseDown(t10) {
          let e10 = (1 & (t10.buttons || t10.button)) == 1;
          t10 = this.normalize(t10), V.isFirefox && 0 !== t10.button && this.onContainerMouseMove(t10), (void 0 === t10.button || e10) && (this.zoomOption(t10), e10 && t10.preventDefault?.(), this.dragStart(t10));
        }
        onContainerMouseLeave(t10) {
          let {
            pointer: e10
          } = rp[rA(rP.hoverChartIndex, -1)] || {};
          t10 = this.normalize(t10), this.onContainerMouseMove(t10), e10 && !this.inClass(t10.relatedTarget, "highcharts-tooltip") && (e10.reset(), e10.chartPosition = void 0);
        }
        onContainerMouseEnter() {
          delete this.chartPosition;
        }
        onContainerMouseMove(t10) {
          let e10 = this.chart, i10 = e10.tooltip, s10 = this.normalize(t10);
          this.setHoverChartIndex(t10), ("mousedown" === e10.mouseIsDown || this.touchSelect(s10)) && this.drag(s10), !e10.exporting?.openMenu && (this.inClass(s10.target, "highcharts-tracker") || e10.isInsidePlot(s10.chartX - e10.plotLeft, s10.chartY - e10.plotTop, {
            visiblePlotOnly: true
          })) && !i10?.shouldStickOnContact(s10) && (this.inClass(s10.target, "highcharts-no-tooltip") ? this.reset(false, 0) : this.runPointActions(s10));
        }
        onDocumentTouchEnd(t10) {
          this.onDocumentMouseUp(t10);
        }
        onContainerTouchMove(t10) {
          this.touchSelect(t10) ? this.onContainerMouseMove(t10) : this.touch(t10);
        }
        onContainerTouchStart(t10) {
          this.touchSelect(t10) ? this.onContainerMouseDown(t10) : (this.zoomOption(t10), this.touch(t10, true));
        }
        onDocumentMouseMove(t10) {
          let e10 = this.chart, i10 = e10.tooltip, s10 = this.chartPosition, o10 = this.normalize(t10, s10);
          !s10 || e10.isInsidePlot(o10.chartX - e10.plotLeft, o10.chartY - e10.plotTop, {
            visiblePlotOnly: true
          }) || i10?.shouldStickOnContact(o10) || o10.target !== e10.container.ownerDocument && this.inClass(o10.target, "highcharts-tracker") || this.reset();
        }
        onDocumentMouseUp(t10) {
          t10?.touches && this.hasPinchMoved && t10?.preventDefault?.(), rp[rA(rP.hoverChartIndex, -1)]?.pointer?.drop(t10);
        }
        pinch(t10) {
          let e10 = this, {
            chart: i10,
            hasZoom: s10,
            lastTouches: o10
          } = e10, r10 = [].map.call(t10.touches || [], (t11) => e10.normalize(t11)), a10 = r10.length, n10 = 1 === a10 && (e10.inClass(t10.target, "highcharts-tracker") && i10.runTrackerClick || e10.runChartClick), h10 = i10.tooltip, l10 = 1 === a10 && rA(h10?.options.followTouchMove, true);
          a10 > 1 ? e10.initiated = true : l10 && (e10.initiated = false), s10 && e10.initiated && !n10 && false !== t10.cancelable && t10.preventDefault(), "touchstart" === t10.type ? (e10.pinchDown = r10, e10.res = true, i10.mouseDownX = t10.chartX) : l10 ? this.runPointActions(e10.normalize(t10)) : o10 && (rv(i10, "touchpan", {
            originalEvent: t10,
            touches: r10
          }, () => {
            let e11 = (t11) => {
              let e12 = t11[0], i11 = t11[1] || e12;
              return {
                x: e12.chartX,
                y: e12.chartY,
                width: i11.chartX - e12.chartX,
                height: i11.chartY - e12.chartY
              };
            };
            i10.transform({
              axes: i10.axes.filter((t11) => t11.zoomEnabled && (this.zoomHor && t11.horiz || this.zoomVert && !t11.horiz)),
              to: e11(r10),
              from: e11(o10),
              trigger: t10.type
            });
          }), e10.res && (e10.res = false, this.reset(false, 0))), e10.lastTouches = r10;
        }
        reset(t10, e10) {
          let i10 = this.chart, s10 = i10.hoverSeries, o10 = i10.hoverPoint, r10 = i10.hoverPoints, a10 = i10.tooltip, n10 = a10?.shared ? r10 : o10;
          t10 && n10 && rC(n10).forEach(function(e11) {
            e11.series.isCartesian && void 0 === e11.plotX && (t10 = false);
          }), t10 ? a10 && n10 && rC(n10).length && (a10.refresh(n10), a10.shared && r10 ? r10.forEach(function(t11) {
            t11.setState(t11.state, true), t11.series.isCartesian && (t11.series.xAxis.crosshair && t11.series.xAxis.drawCrosshair(null, t11), t11.series.yAxis.crosshair && t11.series.yAxis.drawCrosshair(null, t11));
          }) : o10 && (o10.setState(o10.state, true), i10.axes.forEach(function(t11) {
            t11.crosshair && o10.series[t11.coll] === t11 && t11.drawCrosshair(null, o10);
          }))) : (o10 && o10.onMouseOut(), r10 && r10.forEach(function(t11) {
            t11.setState();
          }), s10 && s10.onMouseOut(), a10 && a10.hide(e10), this.unDocMouseMove && (this.unDocMouseMove = this.unDocMouseMove()), i10.axes.forEach(function(t11) {
            t11.hideCrosshair();
          }), i10.hoverPoints = i10.hoverPoint = void 0);
        }
        runPointActions(t10, e10, i10) {
          let s10 = this.chart, o10 = s10.series, r10 = s10.tooltip?.options.enabled ? s10.tooltip : void 0, a10 = !!r10 && r10.shared, n10 = e10 || s10.hoverPoint, h10 = n10?.series || s10.hoverSeries, l10 = (!t10 || "touchmove" !== t10.type) && (!!e10 || h10?.directTouch && this.isDirectTouch), d10 = this.getHoverData(n10, h10, o10, l10, a10, t10);
          n10 = d10.hoverPoint, h10 = d10.hoverSeries;
          let c10 = d10.hoverPoints, p10 = h10?.tooltipOptions.followPointer && !h10.tooltipOptions.split, u10 = a10 && h10 && !h10.noSharedTooltip;
          if (n10 && (i10 || n10 !== s10.hoverPoint || r10?.isHidden)) {
            if ((s10.hoverPoints || []).forEach(function(t11) {
              -1 === c10.indexOf(t11) && t11.setState();
            }), s10.hoverSeries !== h10 && h10.onMouseOver(), this.applyInactiveState(c10), (c10 || []).forEach(function(t11) {
              t11.setState("hover");
            }), s10.hoverPoint && s10.hoverPoint.firePointEvent("mouseOut"), !n10.series) return;
            s10.hoverPoints = c10, s10.hoverPoint = n10, n10.firePointEvent("mouseOver", void 0, () => {
              r10 && n10 && r10.refresh(u10 ? c10 : n10, t10);
            });
          } else if (p10 && r10 && !r10.isHidden) {
            let e11 = r10.getAnchor([{}], t10);
            s10.isInsidePlot(e11[0], e11[1], {
              visiblePlotOnly: true
            }) && r10.updatePosition({
              plotX: e11[0],
              plotY: e11[1]
            });
          }
          this.unDocMouseMove || (this.unDocMouseMove = rf(s10.container.ownerDocument, "mousemove", (t11) => rp[rP.hoverChartIndex ?? -1]?.pointer?.onDocumentMouseMove(t11)), this.eventsToUnbind.push(this.unDocMouseMove)), s10.axes.forEach(function(e11) {
            let i11, o11 = e11.crosshair?.snap ?? true;
            o11 && ((i11 = s10.hoverPoint) && i11.series[e11.coll] === e11 || (i11 = rb(c10, (t11) => t11.series?.[e11.coll] === e11))), i11 || !o11 ? e11.drawCrosshair(t10, i11) : e11.hideCrosshair();
          });
        }
        setDOMEvents() {
          let t10 = this.chart.container, e10 = t10.ownerDocument, i10 = (t11) => t11.parentElement || t11.getRootNode()?.host?.parentElement;
          t10.onmousedown = this.onContainerMouseDown.bind(this), t10.onmousemove = this.onContainerMouseMove.bind(this), t10.onclick = this.onContainerClick.bind(this), this.eventsToUnbind.push(rf(t10, "mouseenter", this.onContainerMouseEnter.bind(this)), rf(t10, "mouseleave", this.onContainerMouseLeave.bind(this))), rP.unbindDocumentMouseUp.some((t11) => t11.doc === e10) || rP.unbindDocumentMouseUp.push({
            doc: e10,
            unbind: rf(e10, "mouseup", this.onDocumentMouseUp.bind(this))
          });
          let s10 = i10(this.chart.renderTo);
          for (; s10 && "BODY" !== s10.tagName; ) this.eventsToUnbind.push(rf(s10, "scroll", () => {
            delete this.chartPosition;
          })), s10 = i10(s10);
          this.eventsToUnbind.push(rf(t10, "touchstart", this.onContainerTouchStart.bind(this), {
            passive: false
          }), rf(t10, "touchmove", this.onContainerTouchMove.bind(this), {
            passive: false
          })), rP.unbindDocumentTouchEnd || (rP.unbindDocumentTouchEnd = rf(e10, "touchend", this.onDocumentTouchEnd.bind(this), {
            passive: false
          })), this.setPointerCapture(), rf(this.chart, "redraw", this.setPointerCapture.bind(this));
        }
        setPointerCapture() {
          if (!rg) return;
          let t10 = this.pointerCaptureEventsToUnbind, e10 = this.chart, i10 = e10.container, s10 = rA(e10.options.tooltip?.followTouchMove, true) && e10.series.some((t11) => t11.options.findNearestPointBy.indexOf("y") > -1);
          !this.hasPointerCapture && s10 ? (t10.push(rf(i10, "pointerdown", (t11) => {
            t11.target?.hasPointerCapture(t11.pointerId) && t11.target?.releasePointerCapture(t11.pointerId);
          }), rf(i10, "pointermove", (t11) => {
            e10.pointer?.getPointFromEvent(t11)?.onMouseOver(t11);
          })), e10.styledMode || rx(i10, {
            "touch-action": "none"
          }), i10.className += " highcharts-no-touch-action", this.hasPointerCapture = true) : this.hasPointerCapture && !s10 && (t10.forEach((t11) => t11()), t10.length = 0, e10.styledMode || rx(i10, {
            "touch-action": rA(e10.options.chart.style?.["touch-action"], "manipulation")
          }), i10.className = i10.className.replace(" highcharts-no-touch-action", ""), this.hasPointerCapture = false);
        }
        setHoverChartIndex(t10) {
          let e10 = this.chart, i10 = V.charts[rA(rP.hoverChartIndex, -1)];
          if (i10 && i10 !== e10) {
            let s10 = {
              relatedTarget: e10.container
            };
            t10 && !t10?.relatedTarget && Object.assign({}, t10, s10), i10.pointer?.onContainerMouseLeave(t10 || s10);
          }
          i10?.mouseIsDown || (rP.hoverChartIndex = e10.index);
        }
        touch(t10, e10) {
          let i10, {
            chart: s10,
            pinchDown: o10 = []
          } = this;
          this.setHoverChartIndex(), 1 === (t10 = this.normalize(t10)).touches.length ? s10.isInsidePlot(t10.chartX - s10.plotLeft, t10.chartY - s10.plotTop, {
            visiblePlotOnly: true
          }) && !s10.exporting?.openMenu ? (e10 && this.runPointActions(t10), "touchmove" === t10.type && (this.hasPinchMoved = i10 = !!o10[0] && Math.pow(o10[0].chartX - t10.chartX, 2) + Math.pow(o10[0].chartY - t10.chartY, 2) >= 16), rA(i10, true) && this.pinch(t10)) : e10 && this.reset() : 2 === t10.touches.length && this.pinch(t10);
        }
        touchSelect(t10) {
          return !!(this.chart.zooming.singleTouch && t10.touches && 1 === t10.touches.length);
        }
        zoomOption(t10) {
          let e10 = this.chart, i10 = e10.inverted, s10 = e10.zooming.type || "", o10, r10;
          /touch/.test(t10.type) && (s10 = rA(e10.zooming.pinchType, s10)), this.zoomX = o10 = /x/.test(s10), this.zoomY = r10 = /y/.test(s10), this.zoomHor = o10 && !i10 || r10 && i10, this.zoomVert = r10 && !i10 || o10 && i10, this.hasZoom = o10 || r10;
        }
      }
      rP.unbindDocumentMouseUp = [], (g = rP || (rP = {})).compose = function(t10) {
        rT(ru, "Core.Pointer") && rf(t10, "beforeRender", function() {
          this.pointer = new g(this, this.options);
        });
      };
      let rO = rP;
      (f = P || (P = {})).setLength = function(t10, e10, i10) {
        return Array.isArray(t10) ? (t10.length = e10, t10) : t10[i10 ? "subarray" : "slice"](0, e10);
      }, f.splice = function(t10, e10, i10, s10, o10 = []) {
        if (Array.isArray(t10)) return Array.isArray(o10) || (o10 = Array.from(o10)), {
          removed: t10.splice(e10, i10, ...o10),
          array: t10
        };
        let r10 = Object.getPrototypeOf(t10).constructor, a10 = t10[s10 ? "subarray" : "slice"](e10, e10 + i10), n10 = new r10(t10.length - i10 + o10.length);
        return n10.set(t10.subarray(0, e10), 0), n10.set(o10, e10), n10.set(t10.subarray(e10 + i10), e10 + o10.length), {
          removed: a10,
          array: n10
        };
      }, f.convertToNumber = function(t10, e10) {
        switch (typeof t10) {
          case "boolean":
            return +!!t10;
          case "number":
            return isNaN(t10) && !e10 ? null : t10;
          default:
            return isNaN(t10 = parseFloat(`${t10 ?? ""}`)) && !e10 ? null : t10;
        }
      };
      let {
        setLength: rE,
        splice: rL
      } = P, {
        fireEvent: rB,
        objectEach: rD,
        uniqueKey: rI
      } = tx, rz = class {
        constructor(t10 = {}) {
          this.autoId = !t10.id, this.columns = {}, this.id = t10.id || rI(), this.rowCount = 0, this.versionTag = rI();
          let e10 = 0;
          rD(t10.columns || {}, (t11, i10) => {
            this.columns[i10] = t11.slice(), e10 = Math.max(e10, t11.length);
          }), this.applyRowCount(e10);
        }
        applyRowCount(t10) {
          this.rowCount = t10, rD(this.columns, (e10, i10) => {
            e10.length !== t10 && (this.columns[i10] = rE(e10, t10));
          });
        }
        deleteRows(t10, e10 = 1) {
          if (e10 > 0 && t10 < this.rowCount) {
            let i10 = 0;
            rD(this.columns, (s10, o10) => {
              this.columns[o10] = rL(s10, t10, e10).array, i10 = s10.length;
            }), this.rowCount = i10;
          }
          rB(this, "afterDeleteRows", {
            rowIndex: t10,
            rowCount: e10
          }), this.versionTag = rI();
        }
        getColumn(t10, e10) {
          return this.columns[t10];
        }
        getColumns(t10, e10) {
          return (t10 || Object.keys(this.columns)).reduce((t11, e11) => (t11[e11] = this.columns[e11], t11), {});
        }
        getRow(t10, e10) {
          return (e10 || Object.keys(this.columns)).map((e11) => this.columns[e11]?.[t10]);
        }
        setColumn(t10, e10 = [], i10 = 0, s10) {
          this.setColumns({
            [t10]: e10
          }, i10, s10);
        }
        setColumns(t10, e10, i10) {
          let s10 = this.rowCount;
          rD(t10, (t11, e11) => {
            this.columns[e11] = t11.slice(), s10 = t11.length;
          }), this.applyRowCount(s10), i10?.silent || (rB(this, "afterSetColumns"), this.versionTag = rI());
        }
        setRow(t10, e10 = this.rowCount, i10, s10) {
          let {
            columns: o10
          } = this, r10 = i10 ? this.rowCount + 1 : e10 + 1, a10 = Object.keys(t10);
          if (s10?.addColumns !== false) for (let t11 = 0, e11 = a10.length; t11 < e11; t11++) {
            let e12 = a10[t11];
            o10[e12] || (o10[e12] = []);
          }
          rD(o10, (a11, n10) => {
            a11 || s10?.addColumns === false || (a11 = Array(r10)), a11 && (i10 ? a11 = rL(a11, e10, 0, true, [t10[n10] ?? null]).array : a11[e10] = t10[n10] ?? null, o10[n10] = a11);
          }), r10 > this.rowCount && this.applyRowCount(r10), s10?.silent || (rB(this, "afterSetRows"), this.versionTag = rI());
        }
        getModified() {
          return this.modified || this;
        }
      }, {
        extend: rR,
        merge: rN,
        pick: rW
      } = tx;
      var rG = O || (O = {});
      function rX(t10, e10, i10) {
        let s10 = this.legendItem = this.legendItem || {}, {
          chart: o10,
          options: r10
        } = this, {
          baseline: a10 = 0,
          symbolWidth: n10,
          symbolHeight: h10
        } = t10, l10 = this.symbol || "circle", d10 = h10 / 2, c10 = o10.renderer, p10 = s10.group, u10 = a10 - Math.round((t10.fontMetrics?.b || h10) * (i10 ? 0.4 : 0.3)), g2 = {}, f2, m2 = r10.marker, x2 = 0;
        if (o10.styledMode || (g2["stroke-width"] = Math.min(r10.lineWidth || 0, 24), r10.dashStyle ? g2.dashstyle = r10.dashStyle : "square" !== r10.linecap && (g2["stroke-linecap"] = "round")), s10.line = c10.path().addClass("highcharts-graph").attr(g2).add(p10), i10 && (s10.area = c10.path().addClass("highcharts-area").add(p10)), g2["stroke-linecap"] && (x2 = Math.min(s10.line.strokeWidth(), n10) / 2), n10) {
          let t11 = [["M", x2, u10], ["L", n10 - x2, u10]];
          s10.line.attr({
            d: t11
          }), s10.area?.attr({
            d: [...t11, ["L", n10 - x2, a10], ["L", x2, a10]]
          });
        }
        if (m2 && false !== m2.enabled && n10) {
          let t11 = Math.min(rW(m2.radius, d10), d10);
          0 === l10.indexOf("url") && (m2 = rN(m2, {
            width: h10,
            height: h10
          }), t11 = 0), s10.symbol = f2 = c10.symbol(l10, n10 / 2 - t11, u10 - t11, 2 * t11, 2 * t11, rR({
            context: "legend"
          }, m2)).addClass("highcharts-point").add(p10), f2.isMarker = true;
        }
      }
      rG.areaMarker = function(t10, e10) {
        rX.call(this, t10, e10, true);
      }, rG.lineMarker = rX, rG.rectangle = function(t10, e10) {
        let i10 = e10.legendItem || {}, s10 = t10.options, o10 = t10.symbolHeight, r10 = s10.squareSymbol, a10 = r10 ? o10 : t10.symbolWidth;
        i10.symbol = this.chart.renderer.rect(r10 ? (t10.symbolWidth - o10) / 2 : 0, t10.baseline - o10 + 1, a10, o10, rW(t10.options.symbolRadius, o10 / 2)).addClass("highcharts-point").attr({
          zIndex: 3
        }).add(i10.group);
      };
      let rH = O, {
        defaultOptions: rF
      } = tY, {
        extend: rY,
        extendClass: rj,
        merge: rU
      } = tx;
      var rV = E || (E = {});
      function r$(t10, e10) {
        let i10 = rF.plotOptions || {}, s10 = e10.defaultOptions, o10 = e10.prototype;
        return o10.type = t10, o10.pointClass || (o10.pointClass = rd), !rV.seriesTypes[t10] && (s10 && (i10[t10] = s10), rV.seriesTypes[t10] = e10, true);
      }
      rV.seriesTypes = V.seriesTypes, rV.registerSeriesType = r$, rV.seriesType = function(t10, e10, i10, s10, o10) {
        let r10 = rF.plotOptions || {};
        if (e10 = e10 || "", r10[t10] = rU(r10[e10], i10), delete rV.seriesTypes[t10], r$(t10, rj(rV.seriesTypes[e10] || V.Series, s10)), rV.seriesTypes[t10].prototype.type = t10, o10) {
          class e11 extends rd {
          }
          rY(e11.prototype, o10), rV.seriesTypes[t10].prototype.pointClass = e11;
        }
        return rV.seriesTypes[t10];
      };
      let r_ = E, {
        animObject: rZ,
        setAnimation: rq
      } = eo, {
        defaultOptions: rK
      } = tY, {
        registerEventOptions: rJ
      } = sS, {
        svg: rQ,
        win: r0
      } = V, {
        seriesTypes: r1
      } = r_, {
        format: r2
      } = eI, {
        arrayMax: r3,
        arrayMin: r5,
        clamp: r6,
        correctFloat: r9,
        crisp: r4,
        defined: r8,
        destroyObjectProperties: r7,
        diffObjects: at,
        erase: ae,
        error: ai,
        extend: as,
        find: ao,
        fireEvent: ar,
        getClosestDistance: aa,
        getNestedProperty: an,
        insertItem: ah,
        isArray: al,
        isNumber: ad,
        isString: ac,
        merge: ap,
        objectEach: au,
        pick: ag,
        removeEvent: af,
        syncTimeout: am
      } = tx;
      class ax {
        constructor() {
          this.zoneAxis = "y";
        }
        init(t10, e10) {
          let i10;
          ar(this, "init", {
            options: e10
          }), this.dataTable ?? (this.dataTable = new rz());
          let s10 = t10.series;
          this.eventsToUnbind = [], this.chart = t10, this.options = this.setOptions(e10);
          let o10 = this.options, r10 = false !== o10.visible;
          this.linkedSeries = [], this.bindAxes(), as(this, {
            name: o10.name,
            state: "",
            visible: r10,
            selected: true === o10.selected
          }), rJ(this, o10);
          let a10 = o10.events;
          (a10?.click || o10.point?.events?.click || o10.allowPointSelect) && (t10.runTrackerClick = true), this.getColor(), this.getSymbol(), this.isCartesian && (t10.hasCartesianSeries = true), s10.length && (i10 = s10[s10.length - 1]), this._i = ag(i10?._i, -1) + 1, this.opacity = this.options.opacity, t10.orderItems("series", ah(this, s10)), o10.dataSorting?.enabled ? this.setDataSortingOptions() : this.points || this.data || this.setData(o10.data, false), ar(this, "afterInit");
        }
        is(t10) {
          return r1[t10] && this instanceof r1[t10];
        }
        bindAxes() {
          let t10, e10 = this, i10 = e10.options, s10 = e10.chart;
          ar(this, "bindAxes", null, function() {
            (e10.axisTypes || []).forEach(function(o10) {
              (s10[o10] || []).forEach(function(s11) {
                t10 = s11.options, (ag(i10[o10], 0) === s11.index || void 0 !== i10[o10] && i10[o10] === t10.id) && (ah(e10, s11.series), e10[o10] = s11, s11.isDirty = true);
              }), e10[o10] || e10.optionalAxis === o10 || ai(18, true, s10);
            });
          }), ar(this, "afterBindAxes");
        }
        hasData() {
          return this.visible && void 0 !== this.dataMax && void 0 !== this.dataMin || this.visible && this.dataTable.rowCount > 0;
        }
        hasMarkerChanged(t10, e10) {
          let i10 = t10.marker, s10 = e10.marker || {};
          return i10 && (s10.enabled && !i10.enabled || s10.symbol !== i10.symbol || s10.height !== i10.height || s10.width !== i10.width);
        }
        autoIncrement(t10) {
          let e10, i10 = this.options, {
            pointIntervalUnit: s10,
            relativeXValue: o10
          } = this.options, r10 = this.chart.time, a10 = this.xIncrement ?? r10.parse(i10.pointStart) ?? 0;
          if (this.pointInterval = e10 = ag(this.pointInterval, i10.pointInterval, 1), o10 && ad(t10) && (e10 *= t10), s10) {
            let t11 = r10.toParts(a10);
            "day" === s10 ? t11[2] += e10 : "month" === s10 ? t11[1] += e10 : "year" === s10 && (t11[0] += e10), e10 = r10.makeTime.apply(r10, t11) - a10;
          }
          return o10 && ad(t10) ? a10 + e10 : (this.xIncrement = a10 + e10, a10);
        }
        setDataSortingOptions() {
          let t10 = this.options;
          as(this, {
            requireSorting: false,
            sorted: false,
            enabledDataSorting: true,
            allowDG: false
          }), r8(t10.pointRange) || (t10.pointRange = 1);
        }
        setOptions(t10) {
          let e10, i10 = this.chart, s10 = i10.options.plotOptions, o10 = i10.userOptions || {}, r10 = ap(t10), a10 = i10.styledMode, n10 = {
            plotOptions: s10,
            userOptions: r10
          };
          ar(this, "setOptions", n10);
          let h10 = n10.plotOptions[this.type], l10 = o10.plotOptions || {}, d10 = l10.series || {}, c10 = rK.plotOptions[this.type] || {}, p10 = l10[this.type] || {};
          h10.dataLabels = this.mergeArrays(c10.dataLabels, h10.dataLabels), this.userOptions = n10.userOptions;
          let u10 = ap(h10, s10.series, p10, r10);
          this.tooltipOptions = ap(rK.tooltip, rK.plotOptions.series?.tooltip, c10?.tooltip, i10.userOptions.tooltip, l10.series?.tooltip, p10.tooltip, r10.tooltip), this.stickyTracking = ag(r10.stickyTracking, p10.stickyTracking, d10.stickyTracking, !!this.tooltipOptions.shared && !this.noSharedTooltip || u10.stickyTracking), null === h10.marker && delete u10.marker, this.zoneAxis = u10.zoneAxis || "y";
          let g2 = this.zones = (u10.zones || []).map((t11) => __spreadValues({}, t11));
          return (u10.negativeColor || u10.negativeFillColor) && !u10.zones && (e10 = {
            value: u10[this.zoneAxis + "Threshold"] || u10.threshold || 0,
            className: "highcharts-negative"
          }, a10 || (e10.color = u10.negativeColor, e10.fillColor = u10.negativeFillColor), g2.push(e10)), g2.length && r8(g2[g2.length - 1].value) && g2.push(a10 ? {} : {
            color: this.color,
            fillColor: this.fillColor
          }), ar(this, "afterSetOptions", {
            options: u10
          }), u10;
        }
        getName() {
          return this.options.name ?? r2(this.chart.options.lang.seriesName, this, this.chart);
        }
        getCyclic(t10, e10, i10) {
          let s10, o10, r10 = this.chart, a10 = `${t10}Index`, n10 = `${t10}Counter`, h10 = i10?.length || r10.options.chart.colorCount;
          !e10 && (r8(o10 = ag("color" === t10 ? this.options.colorIndex : void 0, this[a10])) ? s10 = o10 : (r10.series.length || (r10[n10] = 0), s10 = r10[n10] % h10, r10[n10] += 1), i10 && (e10 = i10[s10])), void 0 !== s10 && (this[a10] = s10), this[t10] = e10;
        }
        getColor() {
          this.chart.styledMode ? this.getCyclic("color") : this.options.colorByPoint ? this.color = "#cccccc" : this.getCyclic("color", this.options.color || rK.plotOptions[this.type].color, this.chart.options.colors);
        }
        getPointsCollection() {
          return (this.hasGroupedData ? this.points : this.data) || [];
        }
        getSymbol() {
          let t10 = this.options.marker;
          this.getCyclic("symbol", t10.symbol, this.chart.options.symbols);
        }
        getColumn(t10, e10) {
          return (e10 ? this.dataTable.getModified() : this.dataTable).getColumn(t10, true) || [];
        }
        findPointIndex(t10, e10) {
          let i10, s10, o10, {
            id: r10,
            x: a10
          } = t10, n10 = this.points, h10 = this.options.dataSorting, l10 = this.cropStart || 0;
          if (r10) {
            let t11 = this.chart.get(r10);
            t11 instanceof rd && (i10 = t11);
          } else if (this.linkedParent || this.enabledDataSorting || this.options.relativeXValue) {
            let e11 = (e12) => !e12.touched && e12.index === t10.index;
            if (h10?.matchByName ? e11 = (e12) => !e12.touched && e12.name === t10.name : this.options.relativeXValue && (e11 = (e12) => !e12.touched && e12.options.x === t10.x), !(i10 = ao(n10, e11))) return;
          }
          return i10 && void 0 !== (o10 = i10?.index) && (s10 = true), void 0 === o10 && ad(a10) && (o10 = this.getColumn("x").indexOf(a10, e10)), -1 !== o10 && void 0 !== o10 && this.cropped && (o10 = o10 >= l10 ? o10 - l10 : o10), !s10 && ad(o10) && n10[o10]?.touched && (o10 = void 0), o10;
        }
        updateData(t10, e10) {
          let {
            options: i10,
            requireSorting: s10
          } = this, o10 = i10.dataSorting, r10 = this.points, a10 = [], n10 = t10.length === r10.length, h10 = this.xIncrement, l10, d10, c10, p10, u10 = true;
          if (this.xIncrement = null, t10.forEach((t11, e11) => {
            let h11, d11 = r8(t11) && this.pointClass.prototype.optionsToObject.call({
              series: this
            }, t11) || {}, {
              id: c11,
              x: u11
            } = d11;
            c11 || ad(u11) ? (-1 === (h11 = this.findPointIndex(d11, p10)) || void 0 === h11 ? a10.push(t11) : r10[h11] && t11 !== i10.data?.[h11] ? (r10[h11].update(t11, false, void 0, false), r10[h11].touched = true, s10 && (p10 = h11 + 1)) : r10[h11] && (r10[h11].touched = true), (!n10 || e11 !== h11 || o10?.enabled || this.hasDerivedData) && (l10 = true)) : a10.push(t11);
          }, this), l10) for (d10 = r10.length; d10--; ) (c10 = r10[d10]) && !c10.touched && c10.remove?.(false, e10);
          else n10 && !o10?.enabled ? (t10.forEach((t11, e11) => {
            t11 === r10[e11].y || r10[e11].destroyed || r10[e11].update(t11, false, void 0, false);
          }), a10.length = 0) : u10 = false;
          if (r10.forEach((t11) => {
            t11 && (t11.touched = false);
          }), !u10) return false;
          a10.forEach((t11) => {
            this.addPoint(t11, false, void 0, void 0, false);
          }, this);
          let g2 = this.getColumn("x");
          return null !== h10 && null === this.xIncrement && g2.length && (this.xIncrement = r3(g2), this.autoIncrement()), true;
        }
        dataColumnKeys() {
          return ["x", ...this.pointArrayMap || ["y"]];
        }
        setData(t10, e10 = true, i10, s10) {
          let o10 = this.points, r10 = o10?.length || 0, a10 = this.options, n10 = this.chart, h10 = a10.dataSorting, l10 = this.xAxis, d10 = a10.turboThreshold, c10 = this.dataTable, p10 = this.dataColumnKeys(), u10 = this.pointValKey || "y", g2 = (this.pointArrayMap || []).length, f2 = a10.keys, m2, x2, y2 = 0, b2 = 1, v2;
          n10.options.chart.allowMutatingData || (a10.data && delete this.options.data, this.userOptions.data && delete this.userOptions.data, v2 = ap(true, t10));
          let k2 = (t10 = v2 || t10 || []).length;
          if (h10?.enabled && (t10 = this.sortData(t10)), n10.options.chart.allowMutatingData && false !== s10 && k2 && r10 && !this.cropped && !this.hasGroupedData && this.visible && !this.boosted && (x2 = this.updateData(t10, i10)), !x2) {
            this.xIncrement = null, this.colorCounter = 0;
            let e11 = d10 && !a10.relativeXValue && k2 > d10;
            if (e11) {
              let i11 = this.getFirstValidPoint(t10), s11 = this.getFirstValidPoint(t10, k2 - 1, -1), o11 = (t11) => !!(al(t11) && (f2 || ad(t11[0])));
              if (ad(i11) && ad(s11)) {
                let e12 = [], i12 = [];
                for (let s12 of t10) e12.push(this.autoIncrement()), i12.push(s12);
                c10.setColumns({
                  x: e12,
                  [u10]: i12
                });
              } else if (o11(i11) && o11(s11)) {
                if (g2) {
                  let e12 = +(i11.length === g2), s12 = Array(p10.length).fill(0).map(() => []);
                  for (let i12 of t10) {
                    e12 && s12[0].push(this.autoIncrement());
                    for (let t11 = e12; t11 <= g2; t11++) s12[t11]?.push(i12[t11 - e12]);
                  }
                  c10.setColumns(p10.reduce((t11, e13, i12) => (t11[e13] = s12[i12], t11), {}));
                } else {
                  f2 && (y2 = f2.indexOf("x"), b2 = f2.indexOf("y"), y2 = y2 >= 0 ? y2 : 0, b2 = b2 >= 0 ? b2 : 1), 1 === i11.length && (b2 = 0);
                  let e12 = [], s12 = [];
                  if (y2 === b2) for (let i12 of t10) e12.push(this.autoIncrement()), s12.push(i12[b2]);
                  else for (let i12 of t10) e12.push(i12[y2]), s12.push(i12[b2]);
                  c10.setColumns({
                    x: e12,
                    [u10]: s12
                  });
                }
              } else e11 = false;
            }
            if (!e11) {
              let e12 = p10.reduce((t11, e13) => (t11[e13] = [], t11), {});
              for (m2 = 0; m2 < k2; m2++) {
                let i11 = this.pointClass.prototype.applyOptions.apply({
                  series: this
                }, [t10[m2]]);
                for (let t11 of p10) e12[t11][m2] = i11[t11];
              }
              c10.setColumns(e12);
            }
            for (ac(this.getColumn("y")[0]) && ai(14, true, n10), this.data = [], this.options.data = this.userOptions.data = t10, m2 = r10; m2--; ) o10[m2]?.destroy();
            l10 && (l10.minRange = l10.userMinRange), this.isDirty = n10.isDirtyBox = true, this.isDirtyData = !!o10, i10 = false;
          }
          "point" === a10.legendType && (this.processData(), this.generatePoints()), e10 && n10.redraw(i10);
        }
        sortData(t10) {
          let e10 = this, i10 = e10.options.dataSorting.sortKey || "y", s10 = function(t11, e11) {
            return r8(e11) && t11.pointClass.prototype.optionsToObject.call({
              series: t11
            }, e11) || {};
          };
          return t10.forEach(function(i11, o10) {
            t10[o10] = s10(e10, i11), t10[o10].index = o10;
          }, this), t10.concat().sort((t11, e11) => {
            let s11 = an(i10, t11), o10 = an(i10, e11);
            return o10 < s11 ? -1 : +(o10 > s11);
          }).forEach(function(t11, e11) {
            t11.x = e11;
          }, this), e10.linkedSeries && e10.linkedSeries.forEach(function(e11) {
            let i11 = e11.options, o10 = i11.data;
            !i11.dataSorting?.enabled && o10 && (o10.forEach(function(i12, r10) {
              o10[r10] = s10(e11, i12), t10[r10] && (o10[r10].x = t10[r10].x, o10[r10].index = r10);
            }), e11.setData(o10, false));
          }), t10;
        }
        getProcessedData(t10) {
          let e10 = this, {
            dataTable: i10,
            isCartesian: s10,
            options: o10,
            xAxis: r10
          } = e10, a10 = o10.cropThreshold, n10 = t10 || e10.getExtremesFromAll, h10 = r10?.logarithmic, l10 = i10.rowCount, d10, c10, p10 = 0, u10, g2, f2, m2 = e10.getColumn("x"), x2 = i10, y2 = false;
          return r10 && (g2 = (u10 = r10.getExtremes()).min, f2 = u10.max, y2 = !!(r10.categories && !r10.names.length), s10 && e10.sorted && !n10 && (!a10 || l10 > a10 || e10.forceCrop) && (m2[l10 - 1] < g2 || m2[0] > f2 ? x2 = new rz() : e10.getColumn(e10.pointValKey || "y").length && (m2[0] < g2 || m2[l10 - 1] > f2) && (x2 = (d10 = this.cropData(i10, g2, f2)).modified, p10 = d10.start, c10 = true))), m2 = x2.getColumn("x") || [], {
            modified: x2,
            cropped: c10,
            cropStart: p10,
            closestPointRange: aa([h10 ? m2.map(h10.log2lin) : m2], () => e10.requireSorting && !y2 && ai(15, false, e10.chart))
          };
        }
        processData(t10) {
          let e10 = this.xAxis, i10 = this.dataTable;
          if (this.isCartesian && !this.isDirty && !e10.isDirty && !this.yAxis.isDirty && !t10) return false;
          let s10 = this.getProcessedData();
          i10.modified = s10.modified, this.cropped = s10.cropped, this.cropStart = s10.cropStart, this.closestPointRange = this.basePointRange = s10.closestPointRange, ar(this, "afterProcessData");
        }
        cropData(t10, e10, i10) {
          let s10 = t10.getColumn("x", true) || [], o10 = s10.length, r10 = {}, a10, n10, h10 = 0, l10 = o10;
          for (a10 = 0; a10 < o10; a10++) if (s10[a10] >= e10) {
            h10 = Math.max(0, a10 - 1);
            break;
          }
          for (n10 = a10; n10 < o10; n10++) if (s10[n10] > i10) {
            l10 = n10 + 1;
            break;
          }
          for (let e11 of this.dataColumnKeys()) {
            let i11 = t10.getColumn(e11, true);
            i11 && (r10[e11] = i11.slice(h10, l10));
          }
          return {
            modified: new rz({
              columns: r10
            }),
            start: h10,
            end: l10
          };
        }
        generatePoints() {
          let t10 = this.options, e10 = this.processedData || t10.data, i10 = this.dataTable.getModified(), s10 = this.getColumn("x", true), o10 = this.pointClass, r10 = i10.rowCount, a10 = this.cropStart || 0, n10 = this.hasGroupedData, h10 = t10.keys, l10 = [], d10 = t10.dataGrouping?.groupAll ? a10 : 0, c10 = this.pointArrayMap || ["y"], p10 = this.dataColumnKeys(), u10, g2, f2, m2, x2 = this.data, y2;
          if (!x2 && !n10) {
            let t11 = [];
            t11.length = e10?.length || 0, x2 = this.data = t11;
          }
          for (h10 && n10 && (this.options.keys = false), m2 = 0; m2 < r10; m2++) g2 = a10 + m2, n10 ? ((f2 = new o10(this, i10.getRow(m2, p10) || [])).dataGroup = this.groupMap?.[d10 + m2], f2.dataGroup?.options && (f2.options = f2.dataGroup.options, as(f2, f2.dataGroup.options), delete f2.dataLabels, f2.key = f2.name ?? f2.category)) : (f2 = x2[g2], y2 = e10 ? e10[g2] : i10.getRow(m2, c10), f2 || void 0 === y2 ? f2 && (f2.category = this.xAxis?.categories?.[f2.x] ?? f2.x, f2.key = f2.name ?? f2.category) : x2[g2] = f2 = new o10(this, y2, s10[m2])), f2 && (f2.index = n10 ? d10 + m2 : g2, l10[m2] = f2);
          if (this.options.keys = h10, x2 && (r10 !== (u10 = x2.length) || n10)) for (m2 = 0; m2 < u10; m2++) m2 !== a10 || n10 || (m2 += r10), x2[m2] && (x2[m2].destroyElements(), x2[m2].plotX = void 0);
          this.data = x2, this.points = l10, ar(this, "afterGeneratePoints");
        }
        getXExtremes(t10) {
          return {
            min: r5(t10),
            max: r3(t10)
          };
        }
        getExtremes(t10, e10) {
          let {
            xAxis: i10,
            yAxis: s10
          } = this, o10 = e10 || this.getExtremesFromAll || this.options.getExtremesFromAll, r10 = o10 && this.cropped ? this.dataTable : this.dataTable.getModified(), a10 = r10.rowCount, n10 = t10 || this.stackedYData, h10 = n10 ? [n10] : (this.keysAffectYAxis || this.pointArrayMap || ["y"])?.map((t11) => r10.getColumn(t11, true) || []) || [], l10 = this.getColumn("x", true), d10 = [], c10 = this.requireSorting && !this.is("column") ? 1 : 0, p10 = !!s10 && s10.positiveValuesOnly, u10 = o10 || this.cropped || !i10, g2, f2, m2, x2 = 0, y2 = 0;
          for (i10 && (x2 = (g2 = i10.getExtremes()).min, y2 = g2.max), m2 = 0; m2 < a10; m2++) if (f2 = l10[m2], u10 || (l10[m2 + c10] || f2) >= x2 && (l10[m2 - c10] || f2) <= y2) for (let t11 of h10) {
            let e11 = t11[m2];
            ad(e11) && (e11 > 0 || !p10) && d10.push(e11);
          }
          let b2 = {
            activeYData: d10,
            dataMin: r5(d10),
            dataMax: r3(d10)
          };
          return ar(this, "afterGetExtremes", {
            dataExtremes: b2
          }), b2;
        }
        applyExtremes() {
          let t10 = this.getExtremes();
          return this.dataMin = t10.dataMin, this.dataMax = t10.dataMax, t10;
        }
        getFirstValidPoint(t10, e10 = 0, i10 = 1) {
          let s10 = t10.length, o10 = e10;
          for (; o10 >= 0 && o10 < s10; ) {
            if (r8(t10[o10])) return t10[o10];
            o10 += i10;
          }
        }
        translate() {
          this.generatePoints();
          let t10 = this.options, e10 = t10.stacking, i10 = this.xAxis, s10 = this.enabledDataSorting, o10 = this.yAxis, r10 = this.points, a10 = r10.length, n10 = this.pointPlacementToXValue(), h10 = !!n10, l10 = t10.threshold, d10 = t10.startFromThreshold ? l10 : 0, c10 = t10?.nullInteraction && o10.len, p10, u10, g2, f2, m2 = Number.MAX_VALUE;
          function x2(t11) {
            return r6(t11, -1e9, 1e9);
          }
          for (p10 = 0; p10 < a10; p10++) {
            let t11, a11 = r10[p10], y2 = a11.x, b2, v2, k2 = a11.y, M2 = a11.low, w2 = e10 && o10.stacking?.stacks[(this.negStacks && k2 < (d10 ? 0 : l10) ? "-" : "") + this.stackKey];
            a11.plotX = ad(u10 = i10.translate(y2, false, false, false, true, n10)) ? r9(x2(u10)) : void 0, e10 && this.visible && w2 && w2[y2] && (f2 = this.getStackIndicator(f2, y2, this.index), !a11.isNull && f2.key && (v2 = (b2 = w2[y2]).points[f2.key]), b2 && al(v2) && (M2 = v2[0], k2 = v2[1], M2 === d10 && f2.key === w2[y2].base && (M2 = ag(ad(l10) ? l10 : o10.min)), o10.positiveValuesOnly && r8(M2) && M2 <= 0 && (M2 = void 0), a11.total = a11.stackTotal = ag(b2.total), a11.percentage = r8(a11.y) && b2.total ? a11.y / b2.total * 100 : void 0, a11.stackY = k2, this.irregularWidths || b2.setOffset(this.pointXOffset || 0, this.barW || 0, void 0, void 0, void 0, this.xAxis))), a11.yBottom = r8(M2) ? x2(o10.translate(M2, false, true, false, true)) : void 0, this.dataModify && (k2 = this.dataModify.modifyValue(k2, p10)), ad(k2) && void 0 !== a11.plotX ? t11 = ad(t11 = o10.translate(k2, false, true, false, true)) ? x2(t11) : void 0 : !ad(k2) && c10 && (t11 = c10), a11.plotY = t11, a11.isInside = this.isPointInside(a11), a11.clientX = h10 ? r9(i10.translate(y2, false, false, false, true, n10)) : u10, a11.negative = (a11.y || 0) < (l10 || 0), a11.isNull || false === a11.visible || (void 0 !== g2 && (m2 = Math.min(m2, Math.abs(u10 - g2))), g2 = u10), a11.zone = this.zones.length ? a11.getZone() : void 0, !a11.graphic && this.group && s10 && (a11.isNew = true);
          }
          this.closestPointRangePx = m2, ar(this, "afterTranslate");
        }
        getValidPoints(t10, e10, i10) {
          let s10 = this.chart;
          return (t10 || this.points || []).filter(function(t11) {
            let {
              plotX: o10,
              plotY: r10
            } = t11;
            return (!!i10 || !t11.isNull && !!ad(r10)) && (!e10 || !!s10.isInsidePlot(o10, r10, {
              inverted: s10.inverted
            })) && false !== t11.visible;
          });
        }
        getSharedClipKey() {
          return this.sharedClipKey = (this.options.xAxis || 0) + "," + (this.options.yAxis || 0), this.sharedClipKey;
        }
        setClip() {
          let {
            chart: t10,
            group: e10,
            markerGroup: i10
          } = this, s10 = t10.sharedClips, o10 = t10.renderer, r10 = t10.getClipBox(this), a10 = this.getSharedClipKey(), n10 = s10[a10];
          ar(this, "setClip", {
            clipBox: r10
          }), n10 ? n10.animate(r10) : s10[a10] = n10 = o10.clipRect(r10), e10 && e10.clip(false === this.options.clip ? void 0 : n10), i10 && i10.clip();
        }
        animate(t10) {
          let {
            chart: e10,
            group: i10,
            markerGroup: s10
          } = this, o10 = e10.inverted, r10 = rZ(this.options.animation), a10 = [this.getSharedClipKey(), r10.duration, r10.easing, r10.defer].join(","), n10 = e10.sharedClips[a10], h10 = e10.sharedClips[a10 + "m"];
          if (t10 && i10) {
            let t11 = e10.getClipBox(this);
            if (n10) n10.attr("height", t11.height);
            else {
              t11.width = 0, o10 && (t11.x = e10.plotHeight), n10 = e10.renderer.clipRect(t11), e10.sharedClips[a10] = n10;
              let i11 = {
                x: -99,
                y: -99,
                width: o10 ? e10.plotWidth + 199 : 99,
                height: o10 ? 99 : e10.plotHeight + 199
              };
              h10 = e10.renderer.clipRect(i11), e10.sharedClips[a10 + "m"] = h10;
            }
            i10.clip(n10), s10?.clip(h10);
          } else if (n10 && !n10.hasClass("highcharts-animating")) {
            let t11 = e10.getClipBox(this), i11 = r10.step;
            (s10?.element.childNodes.length || e10.series.length > 1) && (r10.step = function(t12, e11) {
              i11 && i11.apply(e11, arguments), "width" === e11.prop && h10?.element && h10.attr(o10 ? "height" : "width", t12 + 99);
            }), n10.addClass("highcharts-animating").animate(t11, r10);
          }
        }
        afterAnimate() {
          this.setClip(), au(this.chart.sharedClips, (t10, e10, i10) => {
            t10 && !this.chart.container.querySelector(`[clip-path="url(#${t10.id})"]`) && (t10.destroy(), delete i10[e10]);
          }), this.finishedAnimating = true, ar(this, "afterAnimate");
        }
        drawPoints(t10 = this.points) {
          let e10, i10, s10, o10, r10, a10, n10, h10 = this.chart, l10 = h10.styledMode, {
            colorAxis: d10,
            options: c10
          } = this, p10 = c10.marker, u10 = c10.nullInteraction, g2 = this[this.specialGroup || "markerGroup"], f2 = this.xAxis, m2 = ag(p10.enabled, !f2 || !!f2.isRadial || null, this.closestPointRangePx >= p10.enabledThreshold * p10.radius);
          if (false !== p10.enabled || this._hasPointMarkers) for (e10 = 0; e10 < t10.length; e10++) {
            o10 = (s10 = (i10 = t10[e10]).graphic) ? "animate" : "attr", r10 = i10.marker || {}, a10 = !!i10.marker;
            let c11 = i10.isNull;
            if ((m2 && !r8(r10.enabled) || r10.enabled) && (!c11 || u10) && false !== i10.visible) {
              let t11 = ag(r10.symbol, this.symbol, "rect");
              n10 = this.markerAttribs(i10, i10.selected && "select"), this.enabledDataSorting && (i10.startXPos = f2.reversed ? -(n10.width || 0) : f2.width);
              let e11 = false !== i10.isInside;
              if (!s10 && e11 && ((n10.width || 0) > 0 || i10.hasImage) && (i10.graphic = s10 = h10.renderer.symbol(t11, n10.x, n10.y, n10.width, n10.height, a10 ? r10 : p10).add(g2), this.enabledDataSorting && h10.hasRendered && (s10.attr({
                x: i10.startXPos
              }), o10 = "animate")), s10 && "animate" === o10 && s10[e11 ? "show" : "hide"](e11).animate(n10), s10) {
                let t12 = this.pointAttribs(i10, l10 || !i10.selected ? void 0 : "select");
                l10 ? d10 && s10.css({
                  fill: t12.fill
                }) : s10[o10](t12);
              }
              s10 && s10.addClass(i10.getClassName(), true);
            } else s10 && (i10.graphic = s10.destroy());
          }
        }
        markerAttribs(t10, e10) {
          let i10 = this.options, s10 = i10.marker, o10 = t10.marker || {}, r10 = o10.symbol || s10.symbol, a10 = {}, n10, h10, l10 = ag(o10.radius, s10?.radius);
          e10 && (n10 = s10.states[e10], h10 = o10.states && o10.states[e10], l10 = ag(h10?.radius, n10?.radius, l10 && l10 + (n10?.radiusPlus || 0))), t10.hasImage = r10 && 0 === r10.indexOf("url"), t10.hasImage && (l10 = 0);
          let d10 = t10.pos();
          return ad(l10) && d10 && (i10.crisp && (d10[0] = r4(d10[0], t10.hasImage ? 0 : "rect" === r10 ? s10?.lineWidth || 0 : 1)), a10.x = d10[0] - l10, a10.y = d10[1] - l10), l10 && (a10.width = a10.height = 2 * l10), a10;
        }
        pointAttribs(t10, e10) {
          let i10 = this.options, s10 = i10.marker, o10 = t10?.options, r10 = o10?.marker || {}, a10 = o10?.color, n10 = t10?.color, h10 = t10?.zone?.color, l10, d10, c10 = this.color, p10, u10, g2 = ag(r10.lineWidth, s10.lineWidth), f2 = t10?.isNull && i10.nullInteraction ? 0 : 1;
          return c10 = a10 || h10 || n10 || c10, p10 = r10.fillColor || s10.fillColor || c10, u10 = r10.lineColor || s10.lineColor || c10, e10 = e10 || "normal", l10 = s10.states[e10] || {}, g2 = ag((d10 = r10.states && r10.states[e10] || {}).lineWidth, l10.lineWidth, g2 + ag(d10.lineWidthPlus, l10.lineWidthPlus, 0)), p10 = d10.fillColor || l10.fillColor || p10, u10 = d10.lineColor || l10.lineColor || u10, {
            stroke: u10,
            "stroke-width": g2,
            fill: p10,
            opacity: f2 = ag(d10.opacity, l10.opacity, f2)
          };
        }
        destroy(t10) {
          let e10, i10, s10 = this, o10 = s10.chart, r10 = /AppleWebKit\/533/.test(r0.navigator.userAgent), a10 = s10.data || [];
          for (ar(s10, "destroy", {
            keepEventsForUpdate: t10
          }), this.removeEvents(t10), (s10.axisTypes || []).forEach(function(t11) {
            i10 = s10[t11], i10?.series && (ae(i10.series, s10), i10.isDirty = i10.forceRedraw = true);
          }), s10.legendItem && s10.chart.legend.destroyItem(s10), e10 = a10.length; e10--; ) a10[e10]?.destroy?.();
          for (let t11 of s10.zones) r7(t11, void 0, true);
          tx.clearTimeout(s10.animationTimeout), au(s10, function(t11, e11) {
            t11 instanceof ic && !t11.survive && t11[r10 && "group" === e11 ? "hide" : "destroy"]();
          }), o10.hoverSeries === s10 && (o10.hoverSeries = void 0), ae(o10.series, s10), o10.orderItems("series"), au(s10, function(e11, i11) {
            t10 && "hcEvents" === i11 || delete s10[i11];
          });
        }
        applyZones() {
          let {
            area: t10,
            chart: e10,
            graph: i10,
            zones: s10,
            points: o10,
            xAxis: r10,
            yAxis: a10,
            zoneAxis: n10
          } = this, {
            inverted: h10,
            renderer: l10
          } = e10, d10 = this[`${n10}Axis`], {
            isXAxis: c10,
            len: p10 = 0,
            minPointOffset: u10 = 0
          } = d10 || {}, g2 = (i10?.strokeWidth() || 0) / 2 + 1, f2 = (t11, e11 = 0, i11 = 0) => {
            h10 && (i11 = p10 - i11);
            let {
              translated: s11 = 0,
              lineClip: o11
            } = t11, r11 = i11 - s11;
            o11?.push(["L", e11, Math.abs(r11) < g2 ? i11 - g2 * (r11 <= 0 ? -1 : 1) : s11]);
          };
          if (s10.length && (i10 || t10) && d10 && ad(d10.min)) {
            let e11 = d10.getExtremes().max + u10, g3 = (t11) => {
              t11.forEach((e12, i11) => {
                ("M" === e12[0] || "L" === e12[0]) && (t11[i11] = [e12[0], c10 ? p10 - e12[1] : e12[1], c10 ? e12[2] : p10 - e12[2]]);
              });
            };
            if (s10.forEach((t11) => {
              t11.lineClip = [], t11.translated = r6(d10.toPixels(ag(t11.value, e11), true) || 0, 0, p10);
            }), i10 && !this.showLine && i10.hide(), t10 && t10.hide(), "y" === n10 && o10.length < r10.len) for (let t11 of o10) {
              let {
                plotX: e12,
                plotY: i11,
                zone: o11
              } = t11, r11 = o11 && s10[s10.indexOf(o11) - 1];
              o11 && f2(o11, e12, i11), r11 && f2(r11, e12, i11);
            }
            let m2 = [], x2 = d10.toPixels(d10.getExtremes().min - u10, true);
            s10.forEach((e12) => {
              let s11 = e12.lineClip || [], o11 = Math.round(e12.translated || 0);
              r10.reversed && s11.reverse();
              let {
                clip: n11,
                simpleClip: d11
              } = e12, p11 = 0, u11 = 0, f3 = r10.len, y2 = a10.len;
              c10 ? (p11 = o11, f3 = x2) : (u11 = o11, y2 = x2);
              let b2 = [["M", p11, u11], ["L", f3, u11], ["L", f3, y2], ["L", p11, y2], ["Z"]], v2 = [b2[0], ...s11, b2[1], b2[2], ...m2, b2[3], b2[4]];
              m2 = s11.reverse(), x2 = o11, h10 && (g3(v2), t10 && g3(b2)), n11 ? (n11.animate({
                d: v2
              }), d11?.animate({
                d: b2
              })) : (n11 = e12.clip = l10.path(v2), t10 && (d11 = e12.simpleClip = l10.path(b2))), i10 && e12.graph?.clip(n11), t10 && e12.area?.clip(d11);
            });
          } else this.visible && (i10 && i10.show(), t10 && t10.show());
        }
        plotGroup(t10, e10, i10, s10, o10) {
          let r10 = this[t10], a10 = !r10, n10 = {
            visibility: i10,
            zIndex: s10 || 0.1
          };
          return r8(this.opacity) && !this.chart.styledMode && "inactive" !== this.state && (n10.opacity = this.opacity), r10 || (this[t10] = r10 = this.chart.renderer.g().add(o10)), r10.addClass("highcharts-" + e10 + " highcharts-series-" + this.index + " highcharts-" + this.type + "-series " + (r8(this.colorIndex) ? "highcharts-color-" + this.colorIndex + " " : "") + (this.options.className || "") + (r10.hasClass("highcharts-tracker") ? " highcharts-tracker" : ""), true), r10.attr(n10)[a10 ? "attr" : "animate"](this.getPlotBox(e10)), r10;
        }
        getPlotBox(t10) {
          let e10 = this.xAxis, i10 = this.yAxis, s10 = this.chart, o10 = s10.inverted && !s10.polar && e10 && this.invertible && "series" === t10;
          s10.inverted && (e10 = i10, i10 = this.xAxis);
          let r10 = {
            scale: 1,
            translateX: e10 ? e10.left : s10.plotLeft,
            translateY: i10 ? i10.top : s10.plotTop,
            name: t10
          };
          ar(this, "getPlotBox", r10);
          let {
            scale: a10,
            translateX: n10,
            translateY: h10
          } = r10;
          return {
            translateX: n10,
            translateY: h10,
            rotation: 90 * !!o10,
            rotationOriginX: o10 ? a10 * (e10.len - i10.len) / 2 : 0,
            rotationOriginY: o10 ? a10 * (e10.len + i10.len) / 2 : 0,
            scaleX: o10 ? -a10 : a10,
            scaleY: a10
          };
        }
        removeEvents(t10) {
          let {
            eventsToUnbind: e10
          } = this;
          t10 || af(this), e10.length && (e10.forEach((t11) => {
            t11();
          }), e10.length = 0);
        }
        render() {
          let t10 = this, {
            chart: e10,
            options: i10,
            hasRendered: s10
          } = t10, o10 = rZ(i10.animation), r10 = t10.visible ? "inherit" : "hidden", a10 = i10.zIndex, n10 = e10.seriesGroup, h10 = t10.finishedAnimating ? 0 : o10.duration;
          ar(this, "render"), t10.plotGroup("group", "series", r10, a10, n10), t10.markerGroup = t10.plotGroup("markerGroup", "markers", r10, a10, n10), false !== i10.clip && t10.setClip(), h10 && t10.animate?.(true), t10.drawGraph && (t10.drawGraph(), t10.applyZones()), t10.visible && t10.drawPoints(), t10.drawDataLabels?.(), t10.redrawPoints?.(), i10.enableMouseTracking && t10.drawTracker?.(), h10 && t10.animate?.(), s10 || (h10 && o10.defer && (h10 += o10.defer), t10.animationTimeout = am(() => {
            t10.afterAnimate();
          }, h10 || 0)), t10.isDirty = false, t10.hasRendered = true, ar(t10, "afterRender");
        }
        redraw() {
          let t10 = this.isDirty || this.isDirtyData;
          this.translate(), this.render(), t10 && delete this.kdTree;
        }
        reserveSpace() {
          return this.visible || !this.chart.options.chart.ignoreHiddenSeries;
        }
        searchPoint(t10, e10) {
          let {
            xAxis: i10,
            yAxis: s10
          } = this, o10 = this.chart.inverted;
          return this.searchKDTree({
            clientX: o10 ? i10.len - t10.chartY + i10.pos : t10.chartX - i10.pos,
            plotY: o10 ? s10.len - t10.chartX + s10.pos : t10.chartY - s10.pos
          }, e10, t10);
        }
        buildKDTree(t10) {
          this.buildingKdTree = true;
          let e10 = this, i10 = e10.options, s10 = i10.findNearestPointBy.indexOf("y") > -1 ? 2 : 1;
          delete e10.kdTree, am(function() {
            e10.kdTree = function t11(i11, s11, o10) {
              let r10, a10, n10 = i11?.length;
              if (n10) return r10 = e10.kdAxisArray[s11 % o10], i11.sort((t12, e11) => (t12[r10] || 0) - (e11[r10] || 0)), {
                point: i11[a10 = Math.floor(n10 / 2)],
                left: t11(i11.slice(0, a10), s11 + 1, o10),
                right: t11(i11.slice(a10 + 1), s11 + 1, o10)
              };
            }(e10.getValidPoints(void 0, !e10.directTouch, i10?.nullInteraction), s10, s10), e10.buildingKdTree = false;
          }, i10.kdNow || t10?.type === "touchstart" ? 0 : 1);
        }
        searchKDTree(t10, e10, i10, s10, o10) {
          let r10 = this, [a10, n10] = this.kdAxisArray, h10 = e10 ? "distX" : "dist", l10 = (r10.options.findNearestPointBy || "").indexOf("y") > -1 ? 2 : 1, d10 = !!r10.isBubble, c10 = s10 || ((t11, e11, i11) => {
            let s11 = t11[i11] || 0, o11 = e11[i11] || 0;
            return [s11 === o11 && t11.index > e11.index || s11 < o11 ? t11 : e11, false];
          }), p10 = o10 || ((t11, e11) => t11 < e11);
          if (this.kdTree || this.buildingKdTree || this.buildKDTree(i10), this.kdTree) return function t11(e11, i11, s11, o11) {
            let l11, u10, g2, f2, m2, x2, y2, b2 = i11.point, v2 = r10.kdAxisArray[s11 % o11], k2 = b2, M2 = false;
            l11 = e11[a10], u10 = b2[a10], g2 = r8(l11) && r8(u10) ? l11 - u10 : null, f2 = e11[n10], m2 = b2[n10], x2 = r8(f2) && r8(m2) ? f2 - m2 : 0, y2 = d10 && b2.marker?.radius || 0, b2.dist = Math.sqrt((g2 && g2 * g2 || 0) + x2 * x2) - y2, b2.distX = r8(g2) ? Math.abs(g2) - y2 : Number.MAX_VALUE;
            let w2 = (e11[v2] || 0) - (b2[v2] || 0) + (d10 && b2.marker?.radius || 0), S2 = w2 < 0 ? "left" : "right", A2 = w2 < 0 ? "right" : "left";
            return i11[S2] && ([k2, M2] = c10(b2, t11(e11, i11[S2], s11 + 1, o11), h10)), i11[A2] && p10(Math.sqrt(w2 * w2), k2[h10], M2) && (k2 = c10(k2, t11(e11, i11[A2], s11 + 1, o11), h10)[0]), k2;
          }(t10, this.kdTree, l10, l10);
        }
        pointPlacementToXValue() {
          let {
            options: t10,
            xAxis: e10
          } = this, i10 = t10.pointPlacement;
          return "between" === i10 && (i10 = e10.reversed ? -0.5 : 0.5), ad(i10) ? i10 * (t10.pointRange || e10.pointRange) : 0;
        }
        isPointInside(t10) {
          let {
            chart: e10,
            xAxis: i10,
            yAxis: s10
          } = this, {
            plotX: o10 = -1,
            plotY: r10 = -1
          } = t10;
          return r10 >= 0 && r10 <= (s10 ? s10.len : e10.plotHeight) && o10 >= 0 && o10 <= (i10 ? i10.len : e10.plotWidth);
        }
        drawTracker() {
          let t10 = this, e10 = t10.options, i10 = e10.trackByArea, s10 = [].concat((i10 ? t10.areaPath : t10.graphPath) || []), o10 = t10.chart, r10 = o10.pointer, a10 = o10.renderer, n10 = o10.options.tooltip?.snap || 0, h10 = () => {
            e10.enableMouseTracking && o10.hoverSeries !== t10 && t10.onMouseOver();
          }, l10 = "rgba(192,192,192," + (rQ ? 1e-4 : 2e-3) + ")", d10 = t10.tracker;
          d10 ? d10.attr({
            d: s10
          }) : t10.graph && (t10.tracker = d10 = a10.path(s10).attr({
            visibility: t10.visible ? "inherit" : "hidden",
            zIndex: 2
          }).addClass(i10 ? "highcharts-tracker-area" : "highcharts-tracker-line").add(t10.group), o10.styledMode || d10.attr({
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            stroke: l10,
            fill: i10 ? l10 : "none",
            "stroke-width": t10.graph.strokeWidth() + (i10 ? 0 : 2 * n10)
          }), [t10.tracker, t10.markerGroup, ...t10.dataLabelsGroups || []].forEach((t11) => {
            t11 && (t11.addClass("highcharts-tracker").on("mouseover", h10).on("mouseout", (t12) => {
              r10?.onTrackerMouseOut(t12);
            }), e10.cursor && !o10.styledMode && t11.css({
              cursor: e10.cursor
            }), t11.on("touchstart", h10));
          })), ar(this, "afterDrawTracker");
        }
        addPoint(t10, e10, i10, s10, o10) {
          let r10, a10, n10 = this.options, {
            chart: h10,
            data: l10,
            dataTable: d10,
            xAxis: c10
          } = this, p10 = c10?.hasNames && c10.names, u10 = n10.data, g2 = this.getColumn("x");
          e10 = ag(e10, true);
          let f2 = {
            series: this
          };
          this.pointClass.prototype.applyOptions.apply(f2, [t10]);
          let m2 = f2.x;
          if (a10 = g2.length, this.requireSorting && m2 < g2[a10 - 1]) for (r10 = true; a10 && g2[a10 - 1] > m2; ) a10--;
          d10.setRow(f2, a10, true, {
            addColumns: false
          }), p10 && f2.name && (p10[m2] = f2.name), u10?.splice(a10, 0, t10), (r10 || this.processedData) && (this.data.splice(a10, 0, null), this.processData()), "point" === n10.legendType && this.generatePoints(), i10 && (l10[0] && l10[0].remove ? l10[0].remove(false) : ([l10, u10].filter(r8).forEach((t11) => {
            t11.shift();
          }), d10.deleteRows(0))), false !== o10 && ar(this, "addPoint", {
            point: f2
          }), this.isDirty = true, this.isDirtyData = true, e10 && h10.redraw(s10);
        }
        removePoint(t10, e10, i10) {
          let s10 = this, {
            chart: o10,
            data: r10,
            points: a10,
            dataTable: n10
          } = s10, h10 = r10[t10], l10 = function() {
            [a10?.length === r10.length ? a10 : void 0, r10, s10.options.data].filter(r8).forEach((e11) => {
              e11.splice(t10, 1);
            }), n10.deleteRows(t10), h10?.destroy(), s10.isDirty = true, s10.isDirtyData = true, e10 && o10.redraw();
          };
          rq(i10, o10), e10 = ag(e10, true), h10 ? h10.firePointEvent("remove", null, l10) : l10();
        }
        remove(t10, e10, i10, s10) {
          let o10 = this, r10 = o10.chart;
          function a10() {
            o10.destroy(s10), r10.isDirtyLegend = r10.isDirtyBox = true, r10.linkSeries(s10), ag(t10, true) && r10.redraw(e10);
          }
          false !== i10 ? ar(o10, "remove", null, a10) : a10();
        }
        update(t10, e10) {
          ar(this, "update", {
            options: t10 = at(t10, this.userOptions)
          });
          let i10 = this, s10 = i10.chart, o10 = i10.userOptions, r10 = i10.initialType || i10.type, a10 = s10.options.plotOptions, n10 = r1[r10].prototype, h10 = i10.finishedAnimating && {
            animation: false
          }, l10 = {}, d10, c10, p10 = ax.keepProps.slice(), u10 = t10.type || o10.type || s10.options.chart.type, g2 = !(this.hasDerivedData || u10 && u10 !== this.type || void 0 !== t10.keys || void 0 !== t10.pointStart || void 0 !== t10.pointInterval || void 0 !== t10.relativeXValue || t10.joinBy || t10.mapData || ["dataGrouping", "pointStart", "pointInterval", "pointIntervalUnit", "keys"].some((t11) => i10.hasOptionChanged(t11)));
          u10 = u10 || r10, g2 ? (p10.push.apply(p10, ax.keepPropsForPoints), false !== t10.visible && p10.push("area", "graph"), i10.parallelArrays.forEach(function(t11) {
            p10.push(t11 + "Data");
          }), t10.data && (t10.dataSorting && as(i10.options.dataSorting, t10.dataSorting), this.setData(t10.data, false))) : this.dataTable.modified = this.dataTable, t10.dataLabels && o10.dataLabels && (t10.dataLabels = this.mergeArrays(o10.dataLabels, t10.dataLabels)), t10 = ap(o10, {
            index: void 0 === o10.index ? i10.index : o10.index,
            pointStart: a10?.series?.pointStart ?? o10.pointStart ?? i10.getColumn("x")[0]
          }, !g2 && {
            data: i10.options.data
          }, t10, h10), g2 && t10.data && (t10.data = i10.options.data), (p10 = ["dataLabelsGroup", "dataLabelsGroups", "dataLabelsParentGroups", "group", "markerGroup", "transformGroup"].concat(p10)).forEach(function(t11) {
            p10[t11] = i10[t11], delete i10[t11];
          });
          let f2 = false;
          if (r1[u10]) {
            if (f2 = u10 !== i10.type, i10.remove(false, false, false, true), f2) if (s10.propFromSeries(), Object.setPrototypeOf) Object.setPrototypeOf(i10, r1[u10].prototype);
            else {
              let t11 = Object.hasOwnProperty.call(i10, "hcEvents") && i10.hcEvents;
              for (c10 in n10) i10[c10] = void 0;
              as(i10, r1[u10].prototype), t11 ? i10.hcEvents = t11 : delete i10.hcEvents;
            }
          } else ai(17, true, s10, {
            missingModuleFor: u10
          });
          if (p10.forEach(function(t11) {
            i10[t11] = p10[t11];
          }), i10.init(s10, t10), g2 && this.points) for (let t11 of (false === (d10 = i10.options).visible ? (l10.graphic = 1, l10.dataLabel = 1) : (this.hasMarkerChanged(d10, o10) && (l10.graphic = 1), i10.hasDataLabels?.() || (l10.dataLabel = 1)), this.points)) t11?.series && (t11.resolveColor(), Object.keys(l10).length && t11.destroyElements(l10), false === d10.showInLegend && t11.legendItem && s10.legend.destroyItem(t11));
          i10.initialType = r10, s10.linkSeries(), s10.setSortedData(), f2 && i10.linkedSeries.length && (i10.isDirtyData = true), ar(this, "afterUpdate"), ag(e10, true) && s10.redraw(!!g2 && void 0);
        }
        setName(t10) {
          this.name = this.options.name = this.userOptions.name = t10, this.chart.isDirtyLegend = true;
        }
        hasOptionChanged(t10) {
          let e10 = this.chart, i10 = this.options[t10], s10 = e10.options.plotOptions, o10 = this.userOptions[t10], r10 = ag(s10?.[this.type]?.[t10], s10?.series?.[t10]);
          return o10 && !r8(r10) ? i10 !== o10 : i10 !== ag(r10, i10);
        }
        onMouseOver() {
          let t10 = this.chart, e10 = t10.hoverSeries, i10 = t10.pointer;
          i10?.setHoverChartIndex(), e10 && e10 !== this && e10.onMouseOut(), this.options.events.mouseOver && ar(this, "mouseOver"), this.setState("hover"), t10.hoverSeries = this;
        }
        onMouseOut() {
          let t10 = this.options, e10 = this.chart, i10 = e10.tooltip, s10 = e10.hoverPoint;
          e10.hoverSeries = null, s10 && s10.onMouseOut(), this && t10.events.mouseOut && ar(this, "mouseOut"), i10 && !this.stickyTracking && (!i10.shared || this.noSharedTooltip) && i10.hide(), e10.series.forEach(function(t11) {
            t11.setState("", true);
          });
        }
        setState(t10, e10) {
          let i10 = this, {
            graph: s10,
            options: o10
          } = i10, {
            inactiveOtherPoints: r10,
            states: a10
          } = o10, n10 = ag(a10?.[t10 || "normal"]?.animation, i10.chart.options.chart.animation), {
            lineWidth: h10,
            opacity: l10
          } = o10;
          if (t10 = t10 || "", i10.state !== t10 && ([i10.group, i10.markerGroup, ...i10.dataLabelsGroups || []].forEach(function(e11) {
            e11 && (i10.state && e11.removeClass("highcharts-series-" + i10.state), t10 && e11.addClass("highcharts-series-" + t10));
          }), i10.state = t10, !i10.chart.styledMode)) {
            if (a10[t10]?.enabled === false) return;
            if (t10 && (h10 = a10[t10].lineWidth || h10 + (a10[t10].lineWidthPlus || 0), l10 = ag(a10[t10].opacity, l10)), s10 && !s10.dashstyle && ad(h10)) for (let t11 of [s10, ...this.zones.map((t12) => t12.graph)]) t11?.animate({
              "stroke-width": h10
            }, n10);
            r10 || [i10.group, i10.markerGroup, ...i10.dataLabelsGroups || [], i10.labelBySeries].forEach(function(t11) {
              t11?.animate({
                opacity: l10
              }, n10);
            });
          }
          e10 && r10 && i10.points && i10.setAllPointsToState(t10 || void 0);
        }
        setAllPointsToState(t10) {
          this.points.forEach(function(e10) {
            e10.setState && e10.setState(t10);
          });
        }
        setVisible(t10, e10) {
          let i10 = this, s10 = i10.chart, o10 = s10.options.chart.ignoreHiddenSeries, r10 = i10.visible;
          i10.visible = t10 = i10.options.visible = i10.userOptions.visible = void 0 === t10 ? !r10 : t10;
          let a10 = t10 ? "show" : "hide";
          ["group", "markerGroup", "tracker", "tt"].forEach((t11) => {
            i10[t11]?.[a10]();
          }), i10.dataLabelsGroups?.forEach((t11) => {
            t11?.[a10]();
          }), (s10.hoverSeries === i10 || s10.hoverPoint?.series === i10) && i10.onMouseOut(), i10.legendItem && s10.legend.colorizeItem(i10, t10), i10.isDirty = true, i10.options.stacking && s10.series.forEach((t11) => {
            t11.options.stacking && t11.visible && (t11.isDirty = true);
          }), i10.linkedSeries.forEach((e11) => {
            e11.setVisible(t10, false);
          }), o10 && (s10.isDirtyBox = true), ar(i10, a10), false !== e10 && s10.redraw();
        }
        show() {
          this.setVisible(true);
        }
        hide() {
          this.setVisible(false);
        }
        select(t10) {
          this.selected = t10 = this.options.selected = void 0 === t10 ? !this.selected : t10, this.checkbox && (this.checkbox.checked = t10), ar(this, t10 ? "select" : "unselect");
        }
        shouldShowTooltip(t10, e10, i10 = {}) {
          return i10.series = this, i10.visiblePlotOnly = true, this.chart.isInsidePlot(t10, e10, i10);
        }
        drawLegendSymbol(t10, e10) {
          rH[this.options.legendSymbol || "rectangle"]?.call(this, t10, e10);
        }
      }
      ax.defaultOptions = {
        lineWidth: 2,
        allowPointSelect: false,
        crisp: true,
        showCheckbox: false,
        animation: {
          duration: 1e3
        },
        enableMouseTracking: true,
        events: {},
        marker: {
          enabledThreshold: 2,
          lineColor: "#ffffff",
          lineWidth: 0,
          radius: 4,
          states: {
            normal: {
              animation: true
            },
            hover: {
              animation: {
                duration: 150
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
          animation: {},
          align: "center",
          borderWidth: 0,
          defer: true,
          formatter: function() {
            let {
              numberFormatter: t10
            } = this.series.chart;
            return "number" != typeof this.y ? "" : t10(this.y, -1);
          },
          padding: 5,
          style: {
            fontSize: "0.7em",
            fontWeight: "bold",
            color: "contrast",
            textOutline: "1px contrast"
          },
          verticalAlign: "bottom",
          x: 0,
          y: 0
        },
        cropThreshold: 300,
        opacity: 1,
        pointRange: 0,
        softThreshold: true,
        states: {
          normal: {
            animation: true
          },
          hover: {
            animation: {
              duration: 150
            },
            lineWidthPlus: 1,
            marker: {},
            halo: {
              size: 10,
              opacity: 0.25
            }
          },
          select: {
            animation: {
              duration: 0
            }
          },
          inactive: {
            animation: {
              duration: 150
            },
            opacity: 0.2
          }
        },
        stickyTracking: true,
        turboThreshold: 1e3,
        findNearestPointBy: "x"
      }, ax.types = r_.seriesTypes, ax.registerType = r_.registerSeriesType, ax.keepProps = ["colorIndex", "eventOptions", "navigatorSeries", "symbolIndex", "baseSeries"], ax.keepPropsForPoints = ["data", "isDirtyData", "isDirtyCanvas", "points", "dataTable", "processedData", "xIncrement", "cropped", "_hasPointMarkers", "hasDataLabels", "nodes", "layout", "level", "mapMap", "mapData", "minY", "maxY", "minX", "maxX", "transformGroups"], as(ax.prototype, {
        axisTypes: ["xAxis", "yAxis"],
        coll: "series",
        colorCounter: 0,
        directTouch: false,
        invertible: true,
        isCartesian: true,
        kdAxisArray: ["clientX", "plotY"],
        parallelArrays: ["x", "y"],
        pointClass: rd,
        requireSorting: true,
        sorted: true
      }), r_.series = ax;
      let ay = ax, {
        animObject: ab,
        setAnimation: av
      } = eo, {
        registerEventOptions: ak
      } = sS, {
        composed: aM,
        marginNames: aw
      } = V, {
        distribute: aS
      } = eX, {
        format: aA
      } = eI, {
        addEvent: aT,
        createElement: aC,
        css: aP,
        defined: aO,
        discardElement: aE,
        find: aL,
        fireEvent: aB,
        isNumber: aD,
        merge: aI,
        pick: az,
        pushUnique: aR,
        relativeLength: aN,
        stableSort: aW,
        syncTimeout: aG
      } = tx;
      class aX {
        constructor(t10, e10) {
          this.allItems = [], this.initialItemY = 0, this.itemHeight = 0, this.itemMarginBottom = 0, this.itemMarginTop = 0, this.itemX = 0, this.itemY = 0, this.lastItemY = 0, this.lastLineHeight = 0, this.legendHeight = 0, this.legendWidth = 0, this.maxItemWidth = 0, this.maxLegendWidth = 0, this.offsetWidth = 0, this.padding = 0, this.pages = [], this.symbolHeight = 0, this.symbolWidth = 0, this.titleHeight = 0, this.totalItemWidth = 0, this.widthOption = 0, this.chart = t10, this.setOptions(e10), e10.enabled && (this.render(), ak(this, e10), aT(this.chart, "endResize", function() {
            this.legend.positionCheckboxes();
          })), aT(this.chart, "render", () => {
            this.options.enabled && this.proximate && (this.proximatePositions(), this.positionItems());
          });
        }
        setOptions(t10) {
          let e10 = az(t10.padding, 8);
          this.options = t10, this.chart.styledMode || (this.itemStyle = t10.itemStyle, this.itemHiddenStyle = aI(this.itemStyle, t10.itemHiddenStyle)), this.itemMarginTop = t10.itemMarginTop, this.itemMarginBottom = t10.itemMarginBottom, this.padding = e10, this.initialItemY = e10 - 5, this.symbolWidth = az(t10.symbolWidth, 16), this.pages = [], this.proximate = "proximate" === t10.layout && !this.chart.inverted, this.baseline = void 0;
        }
        update(t10, e10) {
          let i10 = this.chart;
          this.setOptions(aI(true, this.options, t10)), "events" in this.options && ak(this, this.options), this.destroy(), i10.isDirtyLegend = i10.isDirtyBox = true, az(e10, true) && i10.redraw(), aB(this, "afterUpdate", {
            redraw: e10
          });
        }
        colorizeItem(t10, e10) {
          let i10 = t10.color, {
            area: s10,
            group: o10,
            label: r10,
            line: a10,
            symbol: n10
          } = t10.legendItem || {};
          if ((t10 instanceof ay || t10 instanceof rd) && (t10.color = t10.options?.legendSymbolColor || i10), o10?.[e10 ? "removeClass" : "addClass"]("highcharts-legend-item-hidden"), !this.chart.styledMode) {
            let {
              itemHiddenStyle: i11 = {}
            } = this, o11 = i11.color, {
              fillColor: h10,
              fillOpacity: l10,
              lineColor: d10,
              marker: c10
            } = t10.options, p10 = (t11) => (!e10 && (t11.fill && (t11.fill = o11), t11.stroke && (t11.stroke = o11)), t11);
            r10?.css(aI(e10 ? this.itemStyle : i11)), a10?.attr(p10({
              stroke: d10 || t10.color
            })), n10 && n10.attr(p10(c10 && n10.isMarker ? t10.pointAttribs() : {
              fill: t10.color
            })), s10?.attr(p10({
              fill: h10 || t10.color,
              "fill-opacity": h10 ? 1 : l10 ?? 0.75
            }));
          }
          t10.color = i10, aB(this, "afterColorizeItem", {
            item: t10,
            visible: e10
          });
        }
        positionItems() {
          this.allItems.forEach(this.positionItem, this), this.chart.isResizing || this.positionCheckboxes();
        }
        positionItem(t10) {
          let {
            group: e10,
            x: i10 = 0,
            y: s10 = 0
          } = t10.legendItem || {}, o10 = this.options, r10 = o10.symbolPadding, a10 = !o10.rtl, n10 = t10.checkbox;
          if (e10?.element) {
            let o11 = {
              translateX: a10 ? i10 : this.legendWidth - i10 - 2 * r10 - 4,
              translateY: s10
            }, n11 = () => {
              aB(this, "afterPositionItem", {
                item: t10
              });
            };
            e10[aO(e10.translateY) ? "animate" : "attr"](o11, void 0, n11);
          }
          n10 && (n10.x = i10, n10.y = s10);
        }
        destroyItem(t10) {
          let e10 = t10.legendItem || {};
          for (let t11 of ["group", "label", "line", "symbol"]) e10[t11] && (e10[t11] = e10[t11].destroy());
          t10.checkbox = aE(t10.checkbox), t10.legendItem = void 0;
        }
        destroy() {
          for (let t10 of this.getAllItems()) this.destroyItem(t10);
          for (let t10 of ["clipRect", "up", "down", "pager", "nav", "box", "title", "group"]) this[t10] && (this[t10] = this[t10].destroy());
          this.display = null;
        }
        positionCheckboxes() {
          let t10, e10 = this.group?.alignAttr, i10 = this.clipHeight || this.legendHeight, s10 = this.titleHeight;
          e10 && (t10 = e10.translateY, this.allItems.forEach(function(o10) {
            let r10, a10 = o10.checkbox;
            a10 && (r10 = t10 + s10 + a10.y + (this.scrollOffset || 0) + 3, aP(a10, {
              left: e10.translateX + o10.checkboxOffset + a10.x - 20 + "px",
              top: r10 + "px",
              display: this.proximate || r10 > t10 - 6 && r10 < t10 + i10 - 6 ? "" : "none"
            }));
          }, this));
        }
        renderTitle() {
          let t10 = this.options, e10 = this.padding, i10 = t10.title, s10, o10 = 0;
          i10.text && (this.title || (this.title = this.chart.renderer.label(i10.text, e10 - 3, e10 - 4, void 0, void 0, void 0, t10.useHTML, void 0, "legend-title").attr({
            zIndex: 1
          }), this.chart.styledMode || this.title.css(i10.style), this.title.add(this.group)), i10.width || this.title.css({
            width: this.maxLegendWidth + "px"
          }), o10 = (s10 = this.title.getBBox()).height, this.offsetWidth = s10.width, this.contentGroup.attr({
            translateY: o10
          })), this.titleHeight = o10;
        }
        setText(t10) {
          let e10 = this.options;
          t10.legendItem.label.attr({
            text: e10.labelFormat ? aA(e10.labelFormat, t10, this.chart) : e10.labelFormatter.call(t10)
          });
        }
        renderItem(t10) {
          let e10 = t10.legendItem = t10.legendItem || {}, i10 = this.chart, s10 = i10.renderer, o10 = this.options, r10 = "horizontal" === o10.layout, a10 = this.symbolWidth, n10 = o10.symbolPadding || 0, h10 = this.itemStyle, l10 = this.itemHiddenStyle, d10 = r10 ? az(o10.itemDistance, 20) : 0, c10 = !o10.rtl, p10 = !t10.series, u10 = !p10 && t10.series.drawLegendSymbol ? t10.series : t10, g2 = u10.options, f2 = !!this.createCheckboxForItem && g2 && g2.showCheckbox, m2 = o10.useHTML, x2 = t10.options.className, y2 = e10.label, b2 = a10 + n10 + d10 + 20 * !!f2;
          !y2 && (e10.group = s10.g("legend-item").addClass("highcharts-" + u10.type + "-series highcharts-color-" + t10.colorIndex + (x2 ? " " + x2 : "") + (p10 ? " highcharts-series-" + t10.index : "")).attr({
            zIndex: 1
          }).add(this.scrollGroup), e10.label = y2 = s10.text("", c10 ? a10 + n10 : -n10, this.baseline || 0, m2), i10.styledMode || y2.css(aI(t10.visible ? h10 : l10)), y2.attr({
            align: c10 ? "left" : "right",
            zIndex: 2
          }).add(e10.group), !this.baseline && (this.fontMetrics = s10.fontMetrics(y2), this.baseline = this.fontMetrics.f + 3 + this.itemMarginTop, y2.attr("y", this.baseline), this.symbolHeight = az(o10.symbolHeight, this.fontMetrics.f), o10.squareSymbol && (this.symbolWidth = az(o10.symbolWidth, Math.max(this.symbolHeight, 16)), b2 = this.symbolWidth + n10 + d10 + 20 * !!f2, c10 && y2.attr("x", this.symbolWidth + n10))), u10.drawLegendSymbol(this, t10), this.setItemEvents && this.setItemEvents(t10, y2, m2)), f2 && !t10.checkbox && this.createCheckboxForItem && this.createCheckboxForItem(t10), this.colorizeItem(t10, t10.visible), (i10.styledMode || !h10.width) && y2.css({
            width: Math.min(o10.itemWidth || this.widthOption || i10.spacingBox.width, o10.maxWidth ? aN(o10.maxWidth, i10.chartWidth) : 1 / 0) - b2 + "px"
          }), this.setText(t10);
          let v2 = y2.getBBox(), k2 = this.fontMetrics?.h || 0;
          t10.itemWidth = t10.checkboxOffset = o10.itemWidth || e10.labelWidth || v2.width + b2, this.maxItemWidth = Math.max(this.maxItemWidth, t10.itemWidth), this.totalItemWidth += t10.itemWidth, this.itemHeight = t10.itemHeight = Math.round(e10.labelHeight || (v2.height > 1.5 * k2 ? v2.height : k2));
        }
        layoutItem(t10) {
          let e10 = this.options, i10 = this.padding, s10 = "horizontal" === e10.layout, o10 = t10.itemHeight, r10 = this.itemMarginBottom, a10 = this.itemMarginTop, n10 = s10 ? az(e10.itemDistance, 20) : 0, h10 = this.maxLegendWidth, l10 = e10.alignColumns && this.totalItemWidth > h10 ? this.maxItemWidth : t10.itemWidth, d10 = t10.legendItem || {};
          s10 && this.itemX - i10 + l10 > h10 && (this.itemX = i10, this.lastLineHeight && (this.itemY += a10 + this.lastLineHeight + r10), this.lastLineHeight = 0), this.lastItemY = a10 + this.itemY + r10, this.lastLineHeight = Math.max(o10, this.lastLineHeight), d10.x = this.itemX, d10.y = this.itemY, s10 ? this.itemX += l10 : (this.itemY += a10 + o10 + r10, this.lastLineHeight = o10), this.offsetWidth = this.widthOption || Math.max((s10 ? this.itemX - i10 - (t10.checkbox ? 0 : n10) : l10) + i10, this.offsetWidth);
        }
        getAllItems() {
          let t10 = [];
          return this.chart.series.forEach(function(e10) {
            let i10 = e10?.options;
            e10 && az(i10.showInLegend, !aO(i10.linkedTo) && void 0, true) && (t10 = t10.concat(e10.legendItem?.labels || ("point" === i10.legendType ? e10.data : e10)));
          }), aB(this, "afterGetAllItems", {
            allItems: t10
          }), t10;
        }
        getAlignment() {
          let t10 = this.options;
          return this.proximate ? t10.align.charAt(0) + "tv" : t10.floating ? "" : t10.align.charAt(0) + t10.verticalAlign.charAt(0) + t10.layout.charAt(0);
        }
        adjustMargins(t10, e10) {
          let i10 = this.chart, s10 = this.options, o10 = this.getAlignment();
          o10 && [/(lth|ct|rth)/, /(rtv|rm|rbv)/, /(rbh|cb|lbh)/, /(lbv|lm|ltv)/].forEach((r10, a10) => {
            r10.test(o10) && !aO(t10[a10]) && (i10[aw[a10]] = Math.max(i10[aw[a10]], i10.legend[(a10 + 1) % 2 ? "legendHeight" : "legendWidth"] + [1, -1, -1, 1][a10] * s10[a10 % 2 ? "x" : "y"] + (s10.margin ?? 12) + e10[a10] + (i10.titleOffset[a10] || 0)));
          });
        }
        proximatePositions() {
          let t10, e10 = this.chart, i10 = [], s10 = "left" === this.options.align;
          for (let o10 of (this.allItems.forEach(function(t11) {
            let o11, r10, a10 = s10, n10, h10;
            t11.yAxis && (t11.xAxis.options.reversed && (a10 = !a10), t11.points && (o11 = aL(a10 ? t11.points : t11.points.slice(0).reverse(), function(t12) {
              return aD(t12.plotY);
            })), r10 = this.itemMarginTop + t11.legendItem.label.getBBox().height + this.itemMarginBottom, h10 = t11.yAxis.top - e10.plotTop, n10 = t11.visible ? (o11 ? o11.plotY : t11.yAxis.height) + (h10 - 0.3 * r10) : h10 + t11.yAxis.height, i10.push({
              target: n10,
              size: r10,
              item: t11
            }));
          }, this), aS(i10, e10.plotHeight))) t10 = o10.item.legendItem || {}, aD(o10.pos) && (t10.y = e10.plotTop - e10.spacing[0] + o10.pos);
        }
        render() {
          let t10 = this.chart, e10 = t10.spacingBox.width, i10 = t10.renderer, s10 = this.options, o10 = this.padding, r10 = this.getAllItems(), a10, n10, h10, l10 = this.group, d10, c10 = this.box;
          this.itemX = o10, this.itemY = this.initialItemY, this.offsetWidth = 0, this.lastItemY = 0, this.widthOption = aN(s10.width, e10 - o10), d10 = e10 - 2 * o10 - s10.x, ["rm", "lm"].indexOf(this.getAlignment().substring(0, 2)) > -1 && (d10 /= 2), this.maxLegendWidth = this.widthOption || d10, l10 || (this.group = l10 = i10.g("legend").addClass(s10.className || "").attr({
            zIndex: 7
          }).add(), this.contentGroup = i10.g().attr({
            zIndex: 1
          }).add(l10), this.scrollGroup = i10.g().add(this.contentGroup)), this.renderTitle(), aW(r10, (t11, e11) => (t11.options?.legendIndex || 0) - (e11.options?.legendIndex || 0)), s10.reversed && r10.reverse(), this.allItems = r10, this.display = a10 = !!r10.length, this.lastLineHeight = 0, this.maxItemWidth = 0, this.totalItemWidth = 0, this.itemHeight = 0, r10.forEach(this.renderItem, this), r10.forEach(this.layoutItem, this), n10 = (s10.maxWidth ? Math.min(this.widthOption || this.offsetWidth, d10, aN(s10.maxWidth, t10.chartWidth) || 1 / 0) : this.widthOption || this.offsetWidth) + o10, h10 = this.lastItemY + this.lastLineHeight + this.titleHeight, h10 = this.handleOverflow(h10) + o10, c10 || (this.box = c10 = i10.rect().addClass("highcharts-legend-box").attr({
            r: s10.borderRadius
          }).add(l10)), t10.styledMode || c10.attr({
            stroke: s10.borderColor,
            "stroke-width": s10.borderWidth || 0,
            fill: s10.backgroundColor || "none"
          }).shadow(s10.shadow), n10 > 0 && h10 > 0 && c10[c10.placed ? "animate" : "attr"](c10.crisp.call({}, {
            x: 0,
            y: 0,
            width: n10,
            height: h10
          }, c10.strokeWidth())), l10[a10 ? "show" : "hide"](), t10.styledMode && "none" === l10.getStyle("display") && (n10 = h10 = 0), this.legendWidth = n10, this.legendHeight = h10, a10 && this.align(), this.proximate || this.positionItems(), aB(this, "afterRender");
        }
        align(t10 = this.chart.spacingBox) {
          let e10 = this.chart, i10 = this.options, s10 = t10.y;
          /(lth|ct|rth)/.test(this.getAlignment()) && e10.titleOffset[0] > 0 ? s10 += e10.titleOffset[0] : /(lbh|cb|rbh)/.test(this.getAlignment()) && e10.titleOffset[2] > 0 && (s10 -= e10.titleOffset[2]), s10 !== t10.y && (t10 = aI(t10, {
            y: s10
          })), e10.hasRendered || (this.group.placed = false), this.group.align(aI(i10, {
            width: this.legendWidth,
            height: this.legendHeight,
            verticalAlign: this.proximate ? "top" : i10.verticalAlign
          }), true, t10);
        }
        handleOverflow(t10) {
          let e10 = this, i10 = this.chart, s10 = i10.renderer, o10 = this.options, r10 = o10.y, a10 = "top" === o10.verticalAlign, n10 = this.padding, h10 = o10.maxHeight, l10 = o10.navigation, d10 = az(l10.animation, true), c10 = l10.arrowSize || 12, p10 = this.pages, u10 = this.allItems, g2 = function(t11) {
            "number" == typeof t11 ? M2.attr({
              height: t11
            }) : M2 && (e10.clipRect = M2.destroy(), e10.contentGroup.clip()), e10.contentGroup.div && (e10.contentGroup.div.style.clip = t11 ? "rect(" + n10 + "px,9999px," + (n10 + t11) + "px,0)" : "auto");
          }, f2 = function(t11) {
            return e10[t11] = s10.circle(0, 0, 1.3 * c10).translate(c10 / 2, c10 / 2).add(k2), i10.styledMode || e10[t11].attr("fill", "rgba(0,0,0,0.0001)"), e10[t11];
          }, m2, x2, y2, b2, v2 = i10.spacingBox.height + (a10 ? -r10 : r10) - n10, k2 = this.nav, M2 = this.clipRect;
          return "horizontal" !== o10.layout || "middle" === o10.verticalAlign || o10.floating || (v2 /= 2), h10 && (v2 = Math.min(v2, h10)), p10.length = 0, t10 && v2 > 0 && t10 > v2 && false !== l10.enabled ? (this.clipHeight = m2 = Math.max(v2 - 20 - this.titleHeight - n10, 0), this.currentPage = az(this.currentPage, 1), this.fullHeight = t10, u10.forEach((t11, e11) => {
            let i11 = (y2 = t11.legendItem || {}).y || 0, s11 = Math.round(y2.label.getBBox().height), o11 = p10.length;
            (!o11 || i11 - p10[o11 - 1] > m2 && (x2 || i11) !== p10[o11 - 1]) && (p10.push(x2 || i11), o11++), y2.pageIx = o11 - 1, x2 && b2 && (b2.pageIx = o11 - 1), e11 === u10.length - 1 && i11 + s11 - p10[o11 - 1] > m2 && i11 > p10[o11 - 1] && (p10.push(i11), y2.pageIx = o11), i11 !== x2 && (x2 = i11), b2 = y2;
          }), M2 || (M2 = e10.clipRect = s10.clipRect(0, n10 - 2, 9999, 0), e10.contentGroup.clip(M2)), g2(m2), k2 || (this.nav = k2 = s10.g().attr({
            zIndex: 1
          }).add(this.group), this.up = s10.symbol("triangle", 0, 0, c10, c10).add(k2), f2("upTracker").on("click", function() {
            e10.scroll(-1, d10);
          }), this.pager = s10.text("", 15, 10).addClass("highcharts-legend-navigation"), !i10.styledMode && l10.style && this.pager.css(l10.style), this.pager.add(k2), this.down = s10.symbol("triangle-down", 0, 0, c10, c10).add(k2), f2("downTracker").on("click", function() {
            e10.scroll(1, d10);
          })), e10.scroll(0), t10 = v2) : k2 && (g2(), this.nav = k2.destroy(), this.scrollGroup.attr({
            translateY: 1
          }), this.clipHeight = 0), t10;
        }
        scroll(t10, e10) {
          let i10 = this.chart, s10 = this.pages, o10 = s10.length, r10 = this.clipHeight, a10 = this.options.navigation, n10 = this.pager, h10 = this.padding, l10 = this.currentPage + t10;
          l10 > o10 && (l10 = o10), l10 > 0 && (void 0 !== e10 && av(e10, i10), this.nav.attr({
            translateX: h10,
            translateY: r10 + this.padding + 7 + this.titleHeight,
            visibility: "inherit"
          }), [this.up, this.upTracker].forEach(function(t11) {
            t11.attr({
              class: 1 === l10 ? "highcharts-legend-nav-inactive" : "highcharts-legend-nav-active"
            });
          }), n10.attr({
            text: l10 + "/" + o10
          }), [this.down, this.downTracker].forEach(function(t11) {
            t11.attr({
              x: 18 + this.pager.getBBox().width,
              class: l10 === o10 ? "highcharts-legend-nav-inactive" : "highcharts-legend-nav-active"
            });
          }, this), i10.styledMode || (this.up.attr({
            fill: 1 === l10 ? a10.inactiveColor : a10.activeColor
          }), this.upTracker.css({
            cursor: 1 === l10 ? "default" : "pointer"
          }), this.down.attr({
            fill: l10 === o10 ? a10.inactiveColor : a10.activeColor
          }), this.downTracker.css({
            cursor: l10 === o10 ? "default" : "pointer"
          })), this.scrollOffset = -s10[l10 - 1] + this.initialItemY, this.scrollGroup.animate({
            translateY: this.scrollOffset
          }), this.currentPage = l10, this.positionCheckboxes(), aG(() => {
            aB(this, "afterScroll", {
              currentPage: l10
            });
          }, ab(az(e10, i10.renderer.globalAnimation, true)).duration));
        }
        setItemEvents(t10, e10, i10) {
          let s10 = this, o10 = t10.legendItem || {}, r10 = s10.chart.renderer.boxWrapper, a10 = t10 instanceof rd, n10 = t10 instanceof ay, h10 = "highcharts-legend-" + (a10 ? "point" : "series") + "-active", l10 = s10.chart.styledMode, d10 = i10 ? [e10, o10.symbol] : [o10.group], c10 = (e11) => {
            s10.allItems.forEach((i11) => {
              t10 !== i11 && [i11].concat(i11.linkedSeries || []).forEach((t11) => {
                t11.setState(e11, !a10);
              });
            });
          };
          for (let i11 of d10) i11 && i11.on("mouseover", function() {
            t10.visible && c10("inactive"), t10.setState("hover"), t10.visible && r10.addClass(h10), l10 || e10.css(s10.options.itemHoverStyle);
          }).on("mouseout", function() {
            s10.chart.styledMode || e10.css(aI(t10.visible ? s10.itemStyle : s10.itemHiddenStyle)), c10(""), r10.removeClass(h10), t10.setState();
          }).on("click", function(e11) {
            let i12 = function() {
              t10.setVisible && t10.setVisible(), c10(t10.visible ? "inactive" : "");
            };
            r10.removeClass(h10), aB(s10, "itemClick", {
              browserEvent: e11,
              legendItem: t10
            }, i12), a10 ? t10.firePointEvent("legendItemClick", {
              browserEvent: e11
            }) : n10 && aB(t10, "legendItemClick", {
              browserEvent: e11
            });
          });
        }
        createCheckboxForItem(t10) {
          t10.checkbox = aC("input", {
            type: "checkbox",
            className: "highcharts-legend-checkbox",
            checked: t10.selected,
            defaultChecked: t10.selected
          }, this.options.itemCheckboxStyle, this.chart.container), aT(t10.checkbox, "click", function(e10) {
            let i10 = e10.target;
            aB(t10.series || t10, "checkboxClick", {
              checked: i10.checked,
              item: t10
            }, function() {
              t10.select();
            });
          });
        }
      }
      (m = aX || (aX = {})).compose = function(t10) {
        aR(aM, "Core.Legend") && aT(t10, "beforeMargins", function() {
          this.legend = new m(this, this.options.legend);
        });
      };
      let aH = aX, {
        animate: aF,
        animObject: aY,
        setAnimation: aj
      } = eo, {
        defaultOptions: aU
      } = tY, {
        numberFormat: aV
      } = eI, {
        registerEventOptions: a$
      } = sS, {
        charts: a_,
        doc: aZ,
        marginNames: aq,
        svg: aK,
        win: aJ
      } = V, {
        seriesTypes: aQ
      } = r_, {
        addEvent: a0,
        attr: a1,
        createElement: a2,
        css: a3,
        defined: a5,
        diffObjects: a6,
        discardElement: a9,
        erase: a4,
        error: a8,
        extend: a7,
        find: nt,
        fireEvent: ne,
        getAlignFactor: ni,
        getStyle: ns,
        isArray: no,
        isNumber: nr,
        isObject: na,
        isString: nn,
        merge: nh,
        objectEach: nl,
        pick: nd,
        pInt: nc,
        relativeLength: np,
        removeEvent: nu,
        splat: ng,
        syncTimeout: nf,
        uniqueKey: nm
      } = tx;
      class nx {
        static chart(t10, e10, i10) {
          return new nx(t10, e10, i10);
        }
        constructor(t10, e10, i10) {
          this.sharedClips = {};
          const s10 = [...arguments];
          (nn(t10) || t10.nodeName) && (this.renderTo = s10.shift()), this.init(s10[0], s10[1]);
        }
        setZoomOptions() {
          let t10 = this.options.chart, e10 = t10.zooming;
          this.zooming = __spreadProps(__spreadValues({}, e10), {
            type: nd(t10.zoomType, e10.type),
            key: nd(t10.zoomKey, e10.key),
            pinchType: nd(t10.pinchType, e10.pinchType),
            singleTouch: nd(t10.zoomBySingleTouch, e10.singleTouch, false),
            resetButton: nh(e10.resetButton, t10.resetZoomButton)
          });
        }
        init(t10, e10) {
          ne(this, "init", {
            args: arguments
          }, function() {
            let i10 = nh(aU, t10), s10 = i10.chart, o10 = this.renderTo || s10.renderTo;
            this.userOptions = a7({}, t10), (this.renderTo = nn(o10) ? aZ.getElementById(o10) : o10) || a8(13, true, this), this.margin = [], this.spacing = [], this.labelCollectors = [], this.callback = e10, this.isResizing = 0, this.options = i10, this.axes = [], this.series = [], this.locale = i10.lang.locale ?? this.renderTo.closest("[lang]")?.lang, this.time = new tN(a7(i10.time || {}, {
              locale: this.locale
            }), i10.lang), i10.time = this.time.options, this.numberFormatter = (s10.numberFormatter || aV).bind(this), this.styledMode = s10.styledMode, this.hasCartesianSeries = s10.showAxes, this.index = a_.length, a_.push(this), V.chartCount++, a$(this, s10), this.xAxis = [], this.yAxis = [], this.pointCount = this.colorCounter = this.symbolCounter = 0, this.setZoomOptions(), ne(this, "afterInit"), this.firstRender();
          });
        }
        initSeries(t10) {
          let e10 = this.options.chart, i10 = t10.type || e10.type, s10 = aQ[i10];
          s10 || a8(17, true, this, {
            missingModuleFor: i10
          });
          let o10 = new s10();
          return "function" == typeof o10.init && o10.init(this, t10), o10;
        }
        setSortedData() {
          this.getSeriesOrderByLinks().forEach(function(t10) {
            t10.points || t10.data || !t10.enabledDataSorting || t10.setData(t10.options.data, false);
          });
        }
        getSeriesOrderByLinks() {
          return this.series.concat().sort(function(t10, e10) {
            return t10.linkedSeries.length || e10.linkedSeries.length ? e10.linkedSeries.length - t10.linkedSeries.length : 0;
          });
        }
        orderItems(t10, e10 = 0) {
          let i10 = this[t10], s10 = this.options[t10] = ng(this.options[t10]).slice(), o10 = this.userOptions[t10] = this.userOptions[t10] ? ng(this.userOptions[t10]).slice() : [];
          if (this.hasRendered && (s10.splice(e10), o10.splice(e10)), i10) for (let t11 = e10, r10 = i10.length; t11 < r10; ++t11) {
            let e11 = i10[t11];
            e11 && (e11.index = t11, e11 instanceof ay && (e11.name = e11.getName()), e11.options.isInternal || (s10[t11] = e11.options, o10[t11] = e11.userOptions));
          }
        }
        getClipBox(t10, e10) {
          let i10 = this.inverted, {
            xAxis: s10,
            yAxis: o10
          } = t10 || {}, {
            x: r10,
            y: a10,
            width: n10,
            height: h10
          } = nh(this.clipBox);
          return t10 && (s10 && s10.len !== this.plotSizeX && (n10 = s10.len), o10 && o10.len !== this.plotSizeY && (h10 = o10.len), i10 && !t10.invertible && ([n10, h10] = [h10, n10])), e10 && (r10 += (i10 ? o10 : s10)?.pos ?? this.plotLeft, a10 += (i10 ? s10 : o10)?.pos ?? this.plotTop), {
            x: r10,
            y: a10,
            width: n10,
            height: h10
          };
        }
        isInsidePlot(t10, e10, i10 = {}) {
          let {
            inverted: s10,
            plotBox: o10,
            plotLeft: r10,
            plotTop: a10,
            scrollablePlotBox: n10
          } = this, {
            scrollLeft: h10 = 0,
            scrollTop: l10 = 0
          } = i10.visiblePlotOnly && this.scrollablePlotArea?.scrollingContainer || {}, d10 = i10.series, c10 = i10.visiblePlotOnly && n10 || o10, p10 = i10.inverted ? e10 : t10, u10 = i10.inverted ? t10 : e10, g2 = {
            x: p10,
            y: u10,
            isInsidePlot: true,
            options: i10
          };
          if (!i10.ignoreX) {
            let t11 = d10 && (s10 && !this.polar ? d10.yAxis : d10.xAxis) || {
              pos: r10,
              len: 1 / 0
            }, e11 = i10.paneCoordinates ? t11.pos + p10 : r10 + p10;
            e11 >= Math.max(h10 + r10, t11.pos) && e11 <= Math.min(h10 + r10 + c10.width, t11.pos + t11.len) || (g2.isInsidePlot = false);
          }
          if (!i10.ignoreY && g2.isInsidePlot) {
            let t11 = !s10 && i10.axis && !i10.axis.isXAxis && i10.axis || d10 && (s10 ? d10.xAxis : d10.yAxis) || {
              pos: a10,
              len: 1 / 0
            }, e11 = i10.paneCoordinates ? t11.pos + u10 : a10 + u10;
            e11 >= Math.max(l10 + a10, t11.pos) && e11 <= Math.min(l10 + a10 + c10.height, t11.pos + t11.len) || (g2.isInsidePlot = false);
          }
          return ne(this, "afterIsInsidePlot", g2), g2.isInsidePlot;
        }
        redraw(t10) {
          ne(this, "beforeRedraw");
          let e10 = this.hasCartesianSeries ? this.axes : this.colorAxis || [], i10 = this.series, s10 = this.pointer, o10 = this.legend, r10 = this.userOptions.legend, a10 = this.renderer, n10 = a10.isHidden(), h10 = [], l10, d10, c10, p10 = this.isDirtyBox, u10 = this.isDirtyLegend, g2;
          for (a10.rootFontSize = a10.boxWrapper.getStyle("font-size"), this.setResponsive && this.setResponsive(false), aj(!!this.hasRendered && t10, this), n10 && this.temporaryDisplay(), this.layOutTitles(false), c10 = i10.length; c10--; ) if (((g2 = i10[c10]).options.stacking || g2.options.centerInCategory) && (d10 = true, g2.isDirty)) {
            l10 = true;
            break;
          }
          if (l10) for (c10 = i10.length; c10--; ) (g2 = i10[c10]).options.stacking && (g2.isDirty = true);
          i10.forEach(function(t11) {
            t11.isDirty && ("point" === t11.options.legendType ? ("function" == typeof t11.updateTotals && t11.updateTotals(), u10 = true) : r10 && (r10.labelFormatter || r10.labelFormat) && (u10 = true)), t11.isDirtyData && ne(t11, "updatedData");
          }), u10 && o10 && o10.options.enabled && (o10.render(), this.isDirtyLegend = false), d10 && this.getStacks(), e10.forEach(function(t11) {
            t11.updateNames(), t11.setScale();
          }), this.getMargins(), e10.forEach(function(t11) {
            t11.isDirty && (p10 = true);
          }), e10.forEach(function(t11) {
            let e11 = t11.min + "," + t11.max;
            t11.extKey !== e11 && (t11.extKey = e11, h10.push(function() {
              ne(t11, "afterSetExtremes", a7(t11.eventArgs, t11.getExtremes())), delete t11.eventArgs;
            })), (p10 || d10) && t11.redraw();
          }), p10 && this.drawChartBox(), ne(this, "predraw"), i10.forEach(function(t11) {
            (p10 || t11.isDirty) && t11.visible && t11.redraw(), t11.isDirtyData = false;
          }), s10 && s10.reset(true), a10.draw(), ne(this, "redraw"), ne(this, "render"), n10 && this.temporaryDisplay(true), h10.forEach(function(t11) {
            t11.call();
          });
        }
        get(t10) {
          let e10 = this.series;
          function i10(e11) {
            return e11.id === t10 || e11.options && e11.options.id === t10;
          }
          let s10 = nt(this.axes, i10) || nt(this.series, i10);
          for (let t11 = 0; !s10 && t11 < e10.length; t11++) s10 = nt(e10[t11].points || [], i10);
          return s10;
        }
        createAxes() {
          let t10 = this.userOptions;
          for (let e10 of (ne(this, "createAxes"), ["xAxis", "yAxis"])) for (let i10 of t10[e10] = ng(t10[e10] || {})) new oo(this, i10, e10);
          ne(this, "afterCreateAxes");
        }
        getSelectedPoints() {
          return this.series.reduce((t10, e10) => (e10.getPointsCollection().forEach((e11) => {
            nd(e11.selectedStaging, e11.selected) && t10.push(e11);
          }), t10), []);
        }
        getSelectedSeries() {
          return this.series.filter((t10) => t10.selected);
        }
        setTitle(t10, e10, i10) {
          this.applyDescription("title", t10), this.applyDescription("subtitle", e10), this.applyDescription("caption", void 0), this.layOutTitles(i10);
        }
        applyDescription(t10, e10) {
          let i10 = this, s10 = this.options[t10] = nh(this.options[t10], e10), o10 = this[t10];
          o10 && e10 && (this[t10] = o10 = o10.destroy()), s10 && !o10 && ((o10 = this.renderer.text(s10.text, 0, 0, s10.useHTML).attr({
            align: s10.align,
            class: "highcharts-" + t10,
            zIndex: s10.zIndex || 4
          }).css({
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }).add()).update = function(e11, s11) {
            i10.applyDescription(t10, e11), i10.layOutTitles(s11);
          }, this.styledMode || o10.css(a7("title" === t10 ? {
            fontSize: this.options.isStock ? "1em" : "1.2em"
          } : {}, s10.style)), o10.textPxLength = o10.getBBox().width, o10.css({
            whiteSpace: s10.style?.whiteSpace
          }), this[t10] = o10);
        }
        layOutTitles(t10 = true) {
          let e10 = [0, 0, 0], {
            options: i10,
            renderer: s10,
            spacingBox: o10
          } = this;
          ["title", "subtitle", "caption"].forEach((t11) => {
            let i11 = this[t11], r11 = this.options[t11], a10 = nh(o10), n10 = i11?.textPxLength || 0;
            if (i11 && r11) {
              ne(this, "layOutTitle", {
                alignTo: a10,
                key: t11,
                textPxLength: n10
              });
              let o11 = s10.fontMetrics(i11), h10 = o11.b, l10 = o11.h, d10 = r11.verticalAlign || "top", c10 = "top" === d10, p10 = c10 && r11.minScale || 1, u10 = "title" === t11 ? c10 ? -3 : 0 : c10 ? e10[0] + 2 : 0, g2 = Math.min(a10.width / n10, 1), f2 = Math.max(p10, g2), m2 = nh({
                y: "bottom" === d10 ? h10 : u10 + h10
              }, {
                align: "title" === t11 ? g2 < p10 ? "left" : "center" : this.title?.alignValue
              }, r11), x2 = (r11.width || (g2 > p10 ? this.chartWidth : a10.width) / f2) + "px";
              i11.alignValue !== m2.align && (i11.placed = false);
              let y2 = Math.round(i11.css({
                width: x2
              }).getBBox(r11.useHTML).height);
              if (m2.height = y2, i11.align(m2, false, a10).attr({
                align: m2.align,
                scaleX: f2,
                scaleY: f2,
                "transform-origin": `${a10.x + n10 * f2 * ni(m2.align)} ${l10}`
              }), !r11.floating) {
                let t12 = y2 * (y2 < 1.2 * l10 ? 1 : f2);
                "top" === d10 ? e10[0] = Math.ceil(e10[0] + t12) : "bottom" === d10 && (e10[2] = Math.ceil(e10[2] + t12));
              }
            }
          }, this), e10[0] && "top" === (i10.title?.verticalAlign || "top") && (e10[0] += i10.title?.margin || 0), e10[2] && i10.caption?.verticalAlign === "bottom" && (e10[2] += i10.caption?.margin || 0);
          let r10 = !this.titleOffset || this.titleOffset.join(",") !== e10.join(",");
          this.titleOffset = e10, ne(this, "afterLayOutTitles"), !this.isDirtyBox && r10 && (this.isDirtyBox = this.isDirtyLegend = r10, this.hasRendered && t10 && this.isDirtyBox && this.redraw());
        }
        getContainerBox() {
          let t10 = [].map.call(this.renderTo.children, (t11) => {
            if (t11 !== this.container) {
              let e11 = t11.style.display;
              return t11.style.display = "none", [t11, e11];
            }
          }), e10 = {
            width: ns(this.renderTo, "width", true) || 0,
            height: ns(this.renderTo, "height", true) || 0
          };
          return t10.filter(Boolean).forEach(([t11, e11]) => {
            t11.style.display = e11;
          }), e10;
        }
        getChartSize() {
          let t10 = this.options.chart, e10 = t10.width, i10 = t10.height, s10 = this.getContainerBox(), o10 = s10.height <= 1 || !this.renderTo.parentElement?.style.height && "100%" === this.renderTo.style.height;
          this.chartWidth = Math.max(0, e10 || s10.width || 600), this.chartHeight = Math.max(0, np(i10, this.chartWidth) || (o10 ? 400 : s10.height)), this.containerBox = s10;
        }
        temporaryDisplay(t10) {
          let e10 = this.renderTo, i10;
          if (t10) for (; e10?.style; ) e10.hcOrigStyle && (a3(e10, e10.hcOrigStyle), delete e10.hcOrigStyle), e10.hcOrigDetached && (aZ.body.removeChild(e10), e10.hcOrigDetached = false), e10 = e10.parentNode;
          else for (; e10?.style && (aZ.body.contains(e10) || e10.parentNode || (e10.hcOrigDetached = true, aZ.body.appendChild(e10)), ("none" === ns(e10, "display", false) || e10.hcOricDetached) && (e10.hcOrigStyle = {
            display: e10.style.display,
            height: e10.style.height,
            overflow: e10.style.overflow
          }, i10 = {
            display: "block",
            overflow: "hidden"
          }, e10 !== this.renderTo && (i10.height = 0), a3(e10, i10), e10.offsetWidth || e10.style.setProperty("display", "block", "important")), (e10 = e10.parentNode) !== aZ.body); ) ;
        }
        setClassName(t10) {
          this.container.className = "highcharts-container " + (t10 || "");
        }
        getContainer() {
          let t10, e10 = this.options, i10 = e10.chart, s10 = "data-highcharts-chart", o10 = nm(), r10 = this.renderTo, a10 = nc(a1(r10, s10));
          nr(a10) && a_[a10] && a_[a10].hasRendered && a_[a10].destroy(), a1(r10, s10, this.index), r10.innerHTML = ey.emptyHTML, i10.skipClone || r10.offsetWidth || this.temporaryDisplay(), this.getChartSize();
          let n10 = this.chartHeight, h10 = this.chartWidth;
          a3(r10, {
            overflow: "hidden"
          }), this.styledMode || (t10 = a7({
            position: "relative",
            overflow: "hidden",
            width: h10 + "px",
            height: n10 + "px",
            textAlign: "left",
            lineHeight: "normal",
            zIndex: 0,
            "-webkit-tap-highlight-color": "rgba(0,0,0,0)",
            userSelect: "none",
            "touch-action": "manipulation",
            outline: "none",
            padding: "0px"
          }, i10.style || {}));
          let l10 = a2("div", {
            id: o10
          }, t10, r10);
          this.container = l10, this.getChartSize(), h10 !== this.chartWidth && (h10 = this.chartWidth, this.styledMode || a3(l10, {
            width: nd(i10.style?.width, h10 + "px")
          })), this.containerBox = this.getContainerBox(), this._cursor = l10.style.cursor;
          let d10 = i10.renderer || !aK ? ez.getRendererType(i10.renderer) : ss;
          if (this.renderer = new d10(l10, h10, n10, void 0, i10.forExport, e10.exporting?.allowHTML, this.styledMode), aj(void 0, this), this.setClassName(i10.className), this.styledMode) for (let t11 in e10.defs) this.renderer.definition(e10.defs[t11]);
          else this.renderer.setStyle(i10.style);
          this.renderer.chartIndex = this.index, ne(this, "afterGetContainer");
        }
        getMargins(t10) {
          let {
            spacing: e10,
            margin: i10,
            titleOffset: s10
          } = this;
          this.resetMargins(), s10[0] && !a5(i10[0]) && (this.plotTop = Math.max(this.plotTop, s10[0] + e10[0])), s10[2] && !a5(i10[2]) && (this.marginBottom = Math.max(this.marginBottom, s10[2] + e10[2])), this.legend?.display && this.legend.adjustMargins(i10, e10), ne(this, "getMargins"), t10 || this.getAxisMargins();
        }
        getAxisMargins() {
          let t10 = this, e10 = t10.axisOffset = [0, 0, 0, 0], i10 = t10.colorAxis, s10 = t10.margin, o10 = (t11) => {
            t11.forEach((t12) => {
              t12.visible && t12.getOffset();
            });
          };
          t10.hasCartesianSeries ? o10(t10.axes) : i10?.length && o10(i10), aq.forEach((i11, o11) => {
            a5(s10[o11]) || (t10[i11] += e10[o11]);
          }), t10.setChartSize();
        }
        getOptions() {
          return a6(this.userOptions, aU);
        }
        reflow(t10) {
          let e10 = this, i10 = e10.containerBox, s10 = e10.getContainerBox();
          delete e10.pointer?.chartPosition, !e10.exporting?.isPrinting && !e10.isResizing && i10 && s10.width && ((s10.width !== i10.width || s10.height !== i10.height) && (tx.clearTimeout(e10.reflowTimeout), e10.reflowTimeout = nf(function() {
            e10.container && e10.setSize(void 0, void 0, false);
          }, 100 * !!t10)), e10.containerBox = s10);
        }
        setReflow() {
          let t10 = this, e10 = (e11) => {
            t10.options?.chart.reflow && t10.hasLoaded && t10.reflow(e11);
          };
          if ("function" == typeof ResizeObserver) new ResizeObserver(e10).observe(t10.renderTo);
          else {
            let t11 = a0(aJ, "resize", e10);
            a0(this, "destroy", t11);
          }
        }
        setSize(t10, e10, i10) {
          let s10 = this, o10 = s10.renderer;
          s10.isResizing += 1, aj(i10, s10);
          let r10 = o10.globalAnimation;
          s10.oldChartHeight = s10.chartHeight, s10.oldChartWidth = s10.chartWidth, void 0 !== t10 && (s10.options.chart.width = t10), void 0 !== e10 && (s10.options.chart.height = e10), s10.getChartSize();
          let {
            chartWidth: a10,
            chartHeight: n10,
            scrollablePixelsX: h10 = 0,
            scrollablePixelsY: l10 = 0
          } = s10;
          (s10.isDirtyBox || a10 !== s10.oldChartWidth || n10 !== s10.oldChartHeight) && (s10.styledMode || (r10 ? aF : a3)(s10.container, {
            width: `${a10 + h10}px`,
            height: `${n10 + l10}px`
          }, r10), s10.setChartSize(true), o10.setSize(a10, n10, r10), s10.axes.forEach(function(t11) {
            t11.isDirty = true, t11.setScale();
          }), s10.isDirtyLegend = true, s10.isDirtyBox = true, s10.layOutTitles(), s10.getMargins(), s10.redraw(r10), s10.oldChartHeight = void 0, ne(s10, "resize"), setTimeout(() => {
            s10 && ne(s10, "endResize");
          }, aY(r10).duration)), s10.isResizing -= 1;
        }
        setChartSize(t10) {
          let e10, i10, s10, o10, {
            chartHeight: r10,
            chartWidth: a10,
            inverted: n10,
            spacing: h10,
            renderer: l10
          } = this, d10 = this.clipOffset, c10 = Math[n10 ? "floor" : "round"];
          this.plotLeft = e10 = Math.round(this.plotLeft), this.plotTop = i10 = Math.round(this.plotTop), this.plotWidth = s10 = Math.max(0, Math.round(a10 - e10 - (this.marginRight ?? 0))), this.plotHeight = o10 = Math.max(0, Math.round(r10 - i10 - (this.marginBottom ?? 0))), this.plotSizeX = n10 ? o10 : s10, this.plotSizeY = n10 ? s10 : o10, this.spacingBox = l10.spacingBox = {
            x: h10[3],
            y: h10[0],
            width: a10 - h10[3] - h10[1],
            height: r10 - h10[0] - h10[2]
          }, this.plotBox = l10.plotBox = {
            x: e10,
            y: i10,
            width: s10,
            height: o10
          }, d10 && (this.clipBox = {
            x: c10(d10[3]),
            y: c10(d10[0]),
            width: c10(this.plotSizeX - d10[1] - d10[3]),
            height: c10(this.plotSizeY - d10[0] - d10[2])
          }), t10 || (this.axes.forEach(function(t11) {
            t11.setAxisSize(), t11.setAxisTranslation();
          }), l10.alignElements()), ne(this, "afterSetChartSize", {
            skipAxes: t10
          });
        }
        resetMargins() {
          ne(this, "resetMargins");
          let t10 = this, e10 = t10.options.chart, i10 = e10.plotBorderWidth || 0, s10 = Math.round(i10) / 2;
          ["margin", "spacing"].forEach((i11) => {
            let s11 = e10[i11], o10 = na(s11) ? s11 : [s11, s11, s11, s11];
            ["Top", "Right", "Bottom", "Left"].forEach((s12, r10) => {
              t10[i11][r10] = e10[`${i11}${s12}`] ?? o10[r10];
            });
          }), aq.forEach((e11, i11) => {
            t10[e11] = t10.margin[i11] ?? t10.spacing[i11];
          }), t10.axisOffset = [0, 0, 0, 0], t10.clipOffset = [s10, s10, s10, s10], t10.plotBorderWidth = i10;
        }
        drawChartBox() {
          let t10 = this.options.chart, e10 = this.renderer, i10 = this.chartWidth, s10 = this.chartHeight, o10 = this.styledMode, r10 = this.plotBGImage, a10 = t10.backgroundColor, n10 = t10.plotBackgroundColor, h10 = t10.plotBackgroundImage, l10 = this.plotLeft, d10 = this.plotTop, c10 = this.plotWidth, p10 = this.plotHeight, u10 = this.plotBox, g2 = this.clipRect, f2 = this.clipBox, m2 = this.chartBackground, x2 = this.plotBackground, y2 = this.plotBorder, b2, v2, k2, M2 = "animate";
          m2 || (this.chartBackground = m2 = e10.rect().addClass("highcharts-background").add(), M2 = "attr"), o10 ? b2 = v2 = m2.strokeWidth() : (v2 = (b2 = t10.borderWidth || 0) + 8 * !!t10.shadow, k2 = {
            fill: a10 || "none"
          }, (b2 || m2["stroke-width"]) && (k2.stroke = t10.borderColor, k2["stroke-width"] = b2), m2.attr(k2).shadow(t10.shadow)), m2[M2]({
            x: v2 / 2,
            y: v2 / 2,
            width: i10 - v2 - b2 % 2,
            height: s10 - v2 - b2 % 2,
            r: t10.borderRadius
          }), M2 = "animate", x2 || (M2 = "attr", this.plotBackground = x2 = e10.rect().addClass("highcharts-plot-background").add()), x2[M2](u10), !o10 && (x2.attr({
            fill: n10 || "none"
          }).shadow(t10.plotShadow), h10 && (r10 ? (h10 !== r10.attr("href") && r10.attr("href", h10), r10.animate(u10)) : this.plotBGImage = e10.image(h10, l10, d10, c10, p10).add())), g2 ? g2.animate({
            width: f2.width,
            height: f2.height
          }) : this.clipRect = e10.clipRect(f2), M2 = "animate", y2 || (M2 = "attr", this.plotBorder = y2 = e10.rect().addClass("highcharts-plot-border").attr({
            zIndex: 1
          }).add()), o10 || y2.attr({
            stroke: t10.plotBorderColor,
            "stroke-width": t10.plotBorderWidth || 0,
            fill: "none"
          }), y2[M2](y2.crisp(u10, -y2.strokeWidth())), this.isDirtyBox = false, ne(this, "afterDrawChartBox");
        }
        propFromSeries() {
          let t10, e10, i10, s10 = this, o10 = s10.options.chart, r10 = s10.options.series;
          ["inverted", "angular", "polar"].forEach(function(a10) {
            for (e10 = aQ[o10.type], i10 = o10[a10] || e10 && e10.prototype[a10], t10 = r10?.length; !i10 && t10--; ) (e10 = aQ[r10[t10].type]) && e10.prototype[a10] && (i10 = true);
            s10[a10] = i10;
          });
        }
        linkSeries(t10) {
          let e10 = this, i10 = e10.series;
          i10.forEach(function(t11) {
            t11.linkedSeries.length = 0;
          }), i10.forEach(function(t11) {
            let {
              linkedTo: s10
            } = t11.options, o10 = nn(s10) && (":previous" === s10 ? i10[t11.index - 1] : e10.get(s10));
            o10 && o10.linkedParent !== t11 && (o10.linkedSeries.push(t11), t11.linkedParent = o10, o10.enabledDataSorting && t11.setDataSortingOptions(), t11.visible = t11.options.visible ?? o10.options.visible ?? t11.visible);
          }), ne(this, "afterLinkSeries", {
            isUpdating: t10
          });
        }
        renderSeries() {
          this.series.forEach(function(t10) {
            t10.translate(), t10.render();
          });
        }
        render() {
          let t10 = this.axes, e10 = this.colorAxis, i10 = this.renderer, s10 = this.options.chart.axisLayoutRuns || 2, o10 = (t11) => {
            t11.forEach((t12) => {
              t12.visible && t12.render();
            });
          }, r10 = 0, a10 = true, n10, h10 = 0;
          for (let e11 of (this.setTitle(), ne(this, "beforeMargins"), this.getStacks?.(), this.getMargins(true), this.setChartSize(), t10)) {
            let {
              options: t11
            } = e11, {
              labels: i11
            } = t11;
            if (this.hasCartesianSeries && e11.horiz && e11.visible && i11.enabled && e11.series.length && "colorAxis" !== e11.coll && !this.polar) {
              r10 = t11.tickLength, e11.createGroups();
              let s11 = new sN(e11, 0, "", true), o11 = s11.createLabel("x", i11);
              if (s11.destroy(), o11 && nd(i11.reserveSpace, !nr(t11.crossing)) && (r10 = o11.getBBox().height + i11.distance + Math.max(t11.offset || 0, 0)), r10) {
                o11?.destroy();
                break;
              }
            }
          }
          for (this.plotHeight = Math.max(this.plotHeight - r10, 0); (a10 || n10 || s10 > 1) && h10 < s10; ) {
            let e11 = this.plotWidth, i11 = this.plotHeight;
            for (let e12 of t10) 0 === h10 ? e12.setScale() : (e12.horiz && a10 || !e12.horiz && n10) && e12.setTickInterval(true);
            0 === h10 ? this.getAxisMargins() : this.getMargins(), a10 = e11 / this.plotWidth > (h10 ? 1 : 1.1), n10 = i11 / this.plotHeight > (h10 ? 1 : 1.05), h10++;
          }
          this.drawChartBox(), this.hasCartesianSeries ? o10(t10) : e10?.length && o10(e10), this.seriesGroup || (this.seriesGroup = i10.g("series-group").attr({
            zIndex: 3
          }).shadow(this.options.chart.seriesGroupShadow).add()), this.renderSeries(), this.addCredits(), this.setResponsive && this.setResponsive(), this.hasRendered = true;
        }
        addCredits(t10) {
          let e10 = this, i10 = nh(true, this.options.credits, t10);
          i10.enabled && !this.credits && (this.credits = this.renderer.text(i10.text + (this.mapCredits || ""), 0, 0).addClass("highcharts-credits").on("click", function() {
            i10.href && (aJ.location.href = i10.href);
          }).attr({
            align: i10.position.align,
            zIndex: 8
          }), e10.styledMode || this.credits.css(i10.style), this.credits.add().align(i10.position), this.credits.update = function(t11) {
            e10.credits = e10.credits.destroy(), e10.addCredits(t11);
          });
        }
        destroy() {
          let t10, e10 = this, i10 = e10.axes, s10 = e10.series, o10 = e10.container, r10 = o10?.parentNode;
          for (ne(e10, "destroy"), e10.renderer.forExport ? a4(a_, e10) : a_[e10.index] = void 0, V.chartCount--, e10.renderTo.removeAttribute("data-highcharts-chart"), nu(e10), t10 = i10.length; t10--; ) i10[t10] = i10[t10].destroy();
          for (this.scroller?.destroy?.(), t10 = s10.length; t10--; ) s10[t10] = s10[t10].destroy();
          ["title", "subtitle", "chartBackground", "plotBackground", "plotBGImage", "plotBorder", "seriesGroup", "clipRect", "credits", "pointer", "rangeSelector", "legend", "resetZoomButton", "tooltip", "renderer"].forEach((t11) => {
            e10[t11] = e10[t11]?.destroy?.();
          }), o10 && (o10.innerHTML = ey.emptyHTML, nu(o10), r10 && a9(o10)), nl(e10, function(t11, i11) {
            delete e10[i11];
          });
        }
        firstRender() {
          let t10 = this, e10 = t10.options;
          t10.getContainer(), t10.resetMargins(), t10.setChartSize(), t10.propFromSeries(), t10.createAxes();
          let i10 = no(e10.series) ? e10.series : [];
          e10.series = [], i10.forEach(function(e11) {
            t10.initSeries(e11);
          }), t10.linkSeries(), t10.setSortedData(), ne(t10, "beforeRender"), t10.render(), t10.pointer?.getChartPosition(), t10.renderer.imgCount || t10.hasLoaded || t10.onload(), t10.temporaryDisplay(true);
        }
        onload() {
          this.callbacks.concat([this.callback]).forEach(function(t10) {
            t10 && void 0 !== this.index && t10.apply(this, [this]);
          }, this), ne(this, "load"), ne(this, "render"), a5(this.index) && this.setReflow(), this.warnIfA11yModuleNotLoaded(), this.warnIfCSSNotLoaded(), this.hasLoaded = true;
        }
        warnIfA11yModuleNotLoaded() {
          let {
            options: t10,
            title: e10
          } = this;
          t10 && !this.accessibility && (this.renderer.boxWrapper.attr({
            role: "img",
            "aria-label": (e10?.element.textContent || "").replace(/</g, "&lt;")
          }), t10.accessibility && false === t10.accessibility.enabled || a8('Highcharts warning: Consider including the "accessibility.js" module to make your chart more usable for people with disabilities. Set the "accessibility.enabled" option to false to remove this warning. See https://www.highcharts.com/docs/accessibility/accessibility-module.', false, this));
        }
        warnIfCSSNotLoaded() {
          this.styledMode && "0" !== aJ.getComputedStyle(this.container).zIndex && a8(35, false, this);
        }
        addSeries(t10, e10, i10) {
          let s10, o10 = this;
          return t10 && (e10 = nd(e10, true), ne(o10, "addSeries", {
            options: t10
          }, function() {
            s10 = o10.initSeries(t10), o10.isDirtyLegend = true, o10.linkSeries(), s10.enabledDataSorting && s10.setData(t10.data, false), ne(o10, "afterAddSeries", {
              series: s10
            }), e10 && o10.redraw(i10);
          })), s10;
        }
        addAxis(t10, e10, i10, s10) {
          return this.createAxis(e10 ? "xAxis" : "yAxis", {
            axis: t10,
            redraw: i10,
            animation: s10
          });
        }
        addColorAxis(t10, e10, i10) {
          return this.createAxis("colorAxis", {
            axis: t10,
            redraw: e10,
            animation: i10
          });
        }
        createAxis(t10, e10) {
          let i10 = new oo(this, e10.axis, t10);
          return nd(e10.redraw, true) && this.redraw(e10.animation), i10;
        }
        showLoading(t10) {
          let e10 = this, i10 = e10.options, s10 = i10.loading, o10 = function() {
            r10 && a3(r10, {
              left: e10.plotLeft + "px",
              top: e10.plotTop + "px",
              width: e10.plotWidth + "px",
              height: e10.plotHeight + "px"
            });
          }, r10 = e10.loadingDiv, a10 = e10.loadingSpan;
          r10 || (e10.loadingDiv = r10 = a2("div", {
            className: "highcharts-loading highcharts-loading-hidden"
          }, null, e10.container)), a10 || (e10.loadingSpan = a10 = a2("span", {
            className: "highcharts-loading-inner"
          }, null, r10), a0(e10, "redraw", o10)), r10.className = "highcharts-loading", ey.setElementHTML(a10, nd(t10, i10.lang.loading, "")), !e10.styledMode && (a3(r10, a7(s10.style, {
            zIndex: 10
          })), a3(a10, s10.labelStyle), e10.loadingShown || (a3(r10, {
            opacity: 0,
            display: ""
          }), aF(r10, {
            opacity: s10.style.opacity || 0.5
          }, {
            duration: s10.showDuration || 0
          }))), e10.loadingShown = true, o10();
        }
        hideLoading() {
          let t10 = this.options, e10 = this.loadingDiv;
          e10 && (e10.className = "highcharts-loading highcharts-loading-hidden", this.styledMode || aF(e10, {
            opacity: 0
          }, {
            duration: t10.loading.hideDuration || 100,
            complete: function() {
              a3(e10, {
                display: "none"
              });
            }
          })), this.loadingShown = false;
        }
        update(t10, e10, i10, s10) {
          let o10, r10, a10, n10 = this, h10 = {
            credits: "addCredits",
            title: "setTitle",
            subtitle: "setSubtitle",
            caption: "setCaption"
          }, l10 = t10.isResponsiveOptions, d10 = [];
          ne(n10, "update", {
            options: t10
          }), l10 || n10.setResponsive(false, true), t10 = a6(t10, n10.options), n10.userOptions = nh(n10.userOptions, t10);
          let c10 = t10.chart;
          c10 && (nh(true, n10.options.chart, c10), this.setZoomOptions(), "className" in c10 && n10.setClassName(c10.className), ("inverted" in c10 || "polar" in c10 || "type" in c10) && (n10.propFromSeries(), o10 = true), "alignTicks" in c10 && (o10 = true), "events" in c10 && a$(this, c10), nl(c10, function(t11, e11) {
            -1 !== n10.propsRequireUpdateSeries.indexOf("chart." + e11) && (r10 = true), -1 !== n10.propsRequireDirtyBox.indexOf(e11) && (n10.isDirtyBox = true), -1 !== n10.propsRequireReflow.indexOf(e11) && (n10.isDirtyBox = true, l10 || (a10 = true));
          }), !n10.styledMode && c10.style && n10.renderer.setStyle(n10.options.chart.style || {})), !n10.styledMode && t10.colors && (this.options.colors = t10.colors), nl(t10, function(e11, i11) {
            n10[i11] && "function" == typeof n10[i11].update ? n10[i11].update(e11, false) : "function" == typeof n10[h10[i11]] ? n10[h10[i11]](e11) : "colors" !== i11 && -1 === n10.collectionsWithUpdate.indexOf(i11) && nh(true, n10.options[i11], t10[i11]), "chart" !== i11 && -1 !== n10.propsRequireUpdateSeries.indexOf(i11) && (r10 = true);
          }), this.collectionsWithUpdate.forEach(function(e11) {
            t10[e11] && (ng(t10[e11]).forEach(function(t11, s11) {
              let o11, r11 = a5(t11.id);
              r11 && (o11 = n10.get(t11.id)), !o11 && n10[e11] && (o11 = n10[e11][nd(t11.index, s11)]) && (r11 && a5(o11.options.id) || o11.options.isInternal) && (o11 = void 0), o11 && o11.coll === e11 && (o11.update(t11, false), i10 && (o11.touched = true)), !o11 && i10 && n10.collectionsWithInit[e11] && (n10.collectionsWithInit[e11][0].apply(n10, [t11].concat(n10.collectionsWithInit[e11][1] || []).concat([false])).touched = true);
            }), i10 && n10[e11].forEach(function(t11) {
              t11.touched || t11.options.isInternal ? delete t11.touched : d10.push(t11);
            }));
          }), d10.forEach(function(t11) {
            t11.chart && t11.remove && t11.remove(false);
          }), o10 && n10.axes.forEach(function(t11) {
            t11.update({}, false);
          }), r10 && n10.getSeriesOrderByLinks().forEach(function(t11) {
            t11.chart && t11.update({}, false);
          }, this);
          let p10 = c10?.width, u10 = c10 && (nn(c10.height) ? np(c10.height, p10 || n10.chartWidth) : c10.height);
          a10 || nr(p10) && p10 !== n10.chartWidth || nr(u10) && u10 !== n10.chartHeight ? n10.setSize(p10, u10, s10) : nd(e10, true) && n10.redraw(s10), ne(n10, "afterUpdate", {
            options: t10,
            redraw: e10,
            animation: s10
          });
        }
        setSubtitle(t10, e10) {
          this.applyDescription("subtitle", t10), this.layOutTitles(e10);
        }
        setCaption(t10, e10) {
          this.applyDescription("caption", t10), this.layOutTitles(e10);
        }
        showResetZoom() {
          let t10 = this, e10 = aU.lang, i10 = t10.zooming.resetButton, s10 = i10.theme, o10 = "chart" === i10.relativeTo || "spacingBox" === i10.relativeTo ? null : "plotBox";
          function r10() {
            t10.zoomOut();
          }
          ne(this, "beforeShowResetZoom", null, function() {
            t10.resetZoomButton = t10.renderer.button(e10.resetZoom, null, null, r10, s10).attr({
              align: i10.position.align,
              title: e10.resetZoomTitle
            }).addClass("highcharts-reset-zoom").add().align(i10.position, false, o10);
          }), ne(this, "afterShowResetZoom");
        }
        zoomOut() {
          ne(this, "selection", {
            resetSelection: true
          }, () => this.transform({
            reset: true,
            trigger: "zoom"
          }));
        }
        pan(t10, e10) {
          let i10 = this, s10 = "object" == typeof e10 ? e10 : {
            enabled: e10,
            type: "x"
          }, o10 = s10.type, r10 = o10 && i10[{
            x: "xAxis",
            xy: "axes",
            y: "yAxis"
          }[o10]].filter((t11) => t11.options.panningEnabled && !t11.options.isInternal), a10 = i10.options.chart;
          a10?.panning && (a10.panning = s10), ne(this, "pan", {
            originalEvent: t10
          }, () => {
            i10.transform({
              axes: r10,
              event: t10,
              to: {
                x: t10.chartX - (i10.mouseDownX || 0),
                y: t10.chartY - (i10.mouseDownY || 0)
              },
              trigger: "pan"
            }), a3(i10.container, {
              cursor: "move"
            });
          });
        }
        transform(t10) {
          let {
            axes: e10 = this.axes,
            event: i10,
            from: s10 = {},
            reset: o10,
            selection: r10,
            to: a10 = {},
            trigger: n10,
            allowResetButton: h10 = true
          } = t10, {
            inverted: l10,
            time: d10
          } = this;
          this.hoverPoints?.forEach((t11) => t11.setState()), ne(this, "transform", t10);
          let c10 = t10.hasZoomed || false, p10, u10;
          for (let t11 of e10) {
            let {
              horiz: e11,
              len: g2,
              minPointOffset: f2 = 0,
              options: m2,
              reversed: x2
            } = t11, y2 = e11 ? "width" : "height", b2 = e11 ? "x" : "y", v2 = nd(a10[y2], t11.len), k2 = nd(s10[y2], t11.len), M2 = 10 > Math.abs(v2) ? 1 : v2 / k2, w2 = (s10[b2] || 0) + k2 / 2 - t11.pos, S2 = w2 - ((a10[b2] ?? t11.pos) + v2 / 2 - t11.pos) / M2, A2 = x2 && !l10 || !x2 && l10 ? -1 : 1;
            if (!o10 && (w2 < 0 || w2 > t11.len)) continue;
            let T2 = t11.chart.polar || t11.isOrdinal ? 0 : f2 * A2 || 0, C2 = t11.toValue(S2, true), P2 = t11.toValue(S2 + g2 / M2, true), O2 = C2 + T2, E2 = P2 - T2, L2 = t11.allExtremes;
            if (r10 && r10[t11.coll].push({
              axis: t11,
              min: Math.min(C2, P2),
              max: Math.max(C2, P2)
            }), O2 > E2 && ([O2, E2] = [E2, O2]), 1 === M2 && !o10 && "yAxis" === t11.coll && !L2) {
              for (let e12 of t11.series) {
                let t12 = e12.getExtremes(e12.getProcessedData(true).modified.getColumn(e12.pointValKey || "y") || [], true);
                L2 ?? (L2 = {
                  dataMin: Number.MAX_VALUE,
                  dataMax: -Number.MAX_VALUE
                }), nr(t12.dataMin) && nr(t12.dataMax) && (L2.dataMin = Math.min(t12.dataMin, L2.dataMin), L2.dataMax = Math.max(t12.dataMax, L2.dataMax));
              }
              t11.allExtremes = L2;
            }
            let {
              dataMin: B2,
              dataMax: D2,
              min: I2,
              max: z2
            } = a7(t11.getExtremes(), L2 || {}), R2 = d10.parse(m2.min), N2 = d10.parse(m2.max), W2 = B2 ?? R2, G2 = D2 ?? N2, X2 = E2 - O2, H2 = t11.categories ? 0 : Math.min(X2, G2 - W2), F2 = W2 - H2 * (a5(R2) ? 0 : m2.minPadding), Y2 = G2 + H2 * (a5(N2) ? 0 : m2.maxPadding), j2 = t11.allowZoomOutside || 1 === M2 || "zoom" !== n10 && M2 > 1, U2 = Math.min(R2 ?? F2, F2, j2 ? I2 : F2), V2 = Math.max(N2 ?? Y2, Y2, j2 ? z2 : Y2);
            (!t11.isOrdinal || 1 !== M2 || o10) && (O2 < U2 && (O2 = U2, M2 >= 1 && (E2 = O2 + X2)), E2 > V2 && (E2 = V2, M2 >= 1 && (O2 = E2 - X2)), (o10 || t11.series.length && (O2 !== I2 || E2 !== z2) && O2 >= U2 && E2 <= V2) && (r10 ? r10[t11.coll].push({
              axis: t11,
              min: O2,
              max: E2
            }) : (t11.isPanning = "zoom" !== n10, t11.isPanning && "mousewheel" !== n10 && (u10 = true), t11.setExtremes(o10 ? void 0 : O2, o10 ? void 0 : E2, false, false, {
              move: S2,
              trigger: n10,
              scale: M2
            }), !o10 && (O2 > U2 || E2 < V2) && (p10 = h10)), c10 = true), this.hasCartesianSeries || o10 || (p10 = h10), i10 && (this[e11 ? "mouseDownX" : "mouseDownY"] = i10[e11 ? "chartX" : "chartY"]));
          }
          return c10 && (r10 ? ne(this, "selection", r10, () => {
            delete t10.selection, t10.trigger = "zoom", this.transform(t10);
          }) : (!p10 || u10 || this.resetZoomButton ? !p10 && this.resetZoomButton && (this.resetZoomButton = this.resetZoomButton.destroy()) : this.showResetZoom(), this.redraw("zoom" === n10 && (this.options.chart.animation ?? this.pointCount < 100)))), c10;
        }
      }
      a7(nx.prototype, {
        callbacks: [],
        collectionsWithInit: {
          xAxis: [nx.prototype.addAxis, [true]],
          yAxis: [nx.prototype.addAxis, [false]],
          series: [nx.prototype.addSeries]
        },
        collectionsWithUpdate: ["xAxis", "yAxis", "series"],
        propsRequireDirtyBox: ["backgroundColor", "borderColor", "borderWidth", "borderRadius", "plotBackgroundColor", "plotBackgroundImage", "plotBorderColor", "plotBorderWidth", "plotShadow", "shadow"],
        propsRequireReflow: ["margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "spacing", "spacingTop", "spacingRight", "spacingBottom", "spacingLeft"],
        propsRequireUpdateSeries: ["chart.inverted", "chart.polar", "chart.ignoreHiddenSeries", "chart.type", "colors", "plotOptions", "time", "tooltip"]
      });
      let ny = nx, {
        stop: nb
      } = eo, {
        composed: nv
      } = V, {
        addEvent: nk,
        createElement: nM,
        css: nw,
        defined: nS,
        erase: nA,
        merge: nT,
        pushUnique: nC
      } = tx;
      function nP() {
        let t10 = this.scrollablePlotArea;
        (this.scrollablePixelsX || this.scrollablePixelsY) && !t10 && (this.scrollablePlotArea = t10 = new nE(this)), t10?.applyFixed();
      }
      function nO() {
        this.chart.scrollablePlotArea && (this.chart.scrollablePlotArea.isDirty = true);
      }
      class nE {
        static compose(t10, e10, i10) {
          nC(nv, this.compose) && (nk(t10, "afterInit", nO), nk(e10, "afterSetChartSize", (t11) => this.afterSetSize(t11.target, t11)), nk(e10, "render", nP), nk(i10, "show", nO));
        }
        static afterSetSize(t10, e10) {
          let i10, s10, o10, {
            minWidth: r10,
            minHeight: a10
          } = t10.options.chart.scrollablePlotArea || {}, {
            clipBox: n10,
            plotBox: h10,
            inverted: l10,
            renderer: d10
          } = t10;
          if (!d10.forExport) if (r10 ? (t10.scrollablePixelsX = i10 = Math.max(0, r10 - t10.chartWidth), i10 && (t10.scrollablePlotBox = nT(t10.plotBox), h10.width = t10.plotWidth += i10, n10[l10 ? "height" : "width"] += i10, o10 = true)) : a10 && (t10.scrollablePixelsY = s10 = Math.max(0, a10 - t10.chartHeight), nS(s10) && (t10.scrollablePlotBox = nT(t10.plotBox), h10.height = t10.plotHeight += s10, n10[l10 ? "width" : "height"] += s10, o10 = false)), nS(o10)) {
            if (!e10.skipAxes) for (let e11 of t10.axes) (e11.horiz === o10 || t10.hasParallelCoordinates && "yAxis" === e11.coll) && (e11.setAxisSize(), e11.setAxisTranslation());
          } else delete t10.scrollablePlotBox;
        }
        constructor(t10) {
          let e10;
          const i10 = t10.options.chart, s10 = ez.getRendererType(), o10 = i10.scrollablePlotArea || {}, r10 = this.moveFixedElements.bind(this), a10 = {
            WebkitOverflowScrolling: "touch",
            overflowX: "hidden",
            overflowY: "hidden"
          };
          t10.scrollablePixelsX && (a10.overflowX = "auto"), t10.scrollablePixelsY && (a10.overflowY = "auto"), this.chart = t10;
          const n10 = this.parentDiv = nM("div", {
            className: "highcharts-scrolling-parent"
          }, {
            position: "relative"
          }, t10.renderTo), h10 = this.scrollingContainer = nM("div", {
            className: "highcharts-scrolling"
          }, a10, n10), l10 = this.innerContainer = nM("div", {
            className: "highcharts-inner-container"
          }, void 0, h10), d10 = this.fixedDiv = nM("div", {
            className: "highcharts-fixed"
          }, {
            position: "absolute",
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: (i10.style?.zIndex || 0) + 2,
            top: 0
          }, void 0, true), c10 = this.fixedRenderer = new s10(d10, t10.chartWidth, t10.chartHeight, i10.style);
          this.mask = c10.path().attr({
            fill: i10.backgroundColor || "#fff",
            "fill-opacity": o10.opacity ?? 0.85,
            zIndex: -1
          }).addClass("highcharts-scrollable-mask").add(), h10.parentNode.insertBefore(d10, h10), nw(t10.renderTo, {
            overflow: "visible"
          }), nk(t10, "afterShowResetZoom", r10), nk(t10, "afterApplyDrilldown", r10), nk(t10, "afterLayOutTitles", r10), nk(h10, "scroll", () => {
            let {
              pointer: i11,
              hoverPoint: s11
            } = t10;
            i11 && (delete i11.chartPosition, s11 && (e10 = s11), i11.runPointActions(void 0, e10, true));
          }), l10.appendChild(t10.container);
        }
        applyFixed() {
          let {
            chart: t10,
            fixedRenderer: e10,
            isDirty: i10,
            scrollingContainer: s10
          } = this, {
            axisOffset: o10,
            chartWidth: r10,
            chartHeight: a10,
            container: n10,
            plotHeight: h10,
            plotLeft: l10,
            plotTop: d10,
            plotWidth: c10,
            scrollablePixelsX: p10 = 0,
            scrollablePixelsY: u10 = 0
          } = t10, {
            scrollPositionX: g2 = 0,
            scrollPositionY: f2 = 0
          } = t10.options.chart.scrollablePlotArea || {}, m2 = r10 + p10, x2 = a10 + u10;
          e10.setSize(r10, a10), (i10 ?? true) && (this.isDirty = false, this.moveFixedElements()), nb(t10.container), nw(n10, {
            width: `${m2}px`,
            height: `${x2}px`
          }), t10.renderer.boxWrapper.attr({
            width: m2,
            height: x2,
            viewBox: ["0 0", m2, x2].join(" ")
          }), t10.chartBackground?.attr({
            width: m2,
            height: x2
          }), nw(s10, {
            width: `${r10}px`,
            height: `${a10}px`
          }), nS(i10) || (s10.scrollLeft = p10 * g2, s10.scrollTop = u10 * f2);
          let y2 = d10 - o10[0] - 1, b2 = l10 - o10[3] - 1, v2 = d10 + h10 + o10[2] + 1, k2 = l10 + c10 + o10[1] + 1, M2 = l10 + c10 - p10, w2 = d10 + h10 - u10, S2 = [["M", 0, 0]];
          p10 ? S2 = [["M", 0, y2], ["L", l10 - 1, y2], ["L", l10 - 1, v2], ["L", 0, v2], ["Z"], ["M", M2, y2], ["L", r10, y2], ["L", r10, v2], ["L", M2, v2], ["Z"]] : u10 && (S2 = [["M", b2, 0], ["L", b2, d10 - 1], ["L", k2, d10 - 1], ["L", k2, 0], ["Z"], ["M", b2, w2], ["L", b2, a10], ["L", k2, a10], ["L", k2, w2], ["Z"]]), "adjustHeight" !== t10.redrawTrigger && this.mask.attr({
            d: S2
          });
        }
        moveFixedElements() {
          let t10, {
            container: e10,
            inverted: i10,
            scrollablePixelsX: s10,
            scrollablePixelsY: o10
          } = this.chart, r10 = this.fixedRenderer, a10 = nE.fixedSelectors;
          if (s10 && !i10 ? t10 = ".highcharts-yaxis" : s10 && i10 || o10 && !i10 ? t10 = ".highcharts-xaxis" : o10 && i10 && (t10 = ".highcharts-yaxis"), t10 && !(this.chart.hasParallelCoordinates && ".highcharts-yaxis" === t10)) for (let e11 of [`${t10}:not(.highcharts-radial-axis)`, `${t10}-labels:not(.highcharts-radial-axis-labels)`]) nC(a10, e11);
          else for (let t11 of [".highcharts-xaxis", ".highcharts-yaxis"]) for (let e11 of [`${t11}:not(.highcharts-radial-axis)`, `${t11}-labels:not(.highcharts-radial-axis-labels)`]) nA(a10, e11);
          for (let t11 of a10) [].forEach.call(e10.querySelectorAll(t11), (t12) => {
            (t12.namespaceURI === r10.SVG_NS ? r10.box : r10.box.parentNode).appendChild(t12), t12.style.pointerEvents = "auto";
          });
        }
      }
      nE.fixedSelectors = [".highcharts-breadcrumbs-group", ".highcharts-contextbutton", ".highcharts-caption", ".highcharts-credits", ".highcharts-drillup-button", ".highcharts-legend", ".highcharts-legend-checkbox", ".highcharts-navigator-series", ".highcharts-navigator-xaxis", ".highcharts-navigator-yaxis", ".highcharts-navigator", ".highcharts-range-selector-group", ".highcharts-reset-zoom", ".highcharts-scrollbar", ".highcharts-subtitle", ".highcharts-title"];
      let {
        format: nL
      } = eI, {
        series: nB
      } = r_, {
        destroyObjectProperties: nD,
        fireEvent: nI,
        getAlignFactor: nz,
        isNumber: nR,
        pick: nN
      } = tx, nW = class {
        constructor(t10, e10, i10, s10, o10) {
          const r10 = t10.chart.inverted, a10 = t10.reversed;
          this.axis = t10;
          const n10 = this.isNegative = !!i10 != !!a10;
          this.options = e10 = e10 || {}, this.x = s10, this.total = null, this.cumulative = null, this.points = {}, this.hasValidPoints = false, this.stack = o10, this.leftCliff = 0, this.rightCliff = 0, this.alignOptions = {
            align: e10.align || (r10 ? n10 ? "left" : "right" : "center"),
            verticalAlign: e10.verticalAlign || (r10 ? "middle" : n10 ? "bottom" : "top"),
            y: e10.y,
            x: e10.x
          }, this.textAlign = e10.textAlign || (r10 ? n10 ? "right" : "left" : "center");
        }
        destroy() {
          nD(this, this.axis);
        }
        render(t10) {
          let e10 = this.axis.chart, i10 = this.options, s10 = i10.format, o10 = s10 ? nL(s10, this, e10) : i10.formatter.call(this);
          if (this.label) this.label.attr({
            text: o10,
            visibility: "hidden"
          });
          else {
            this.label = e10.renderer.label(o10, null, void 0, i10.shape, void 0, void 0, i10.useHTML, false, "stack-labels");
            let s11 = {
              r: i10.borderRadius || 0,
              text: o10,
              padding: nN(i10.padding, 5),
              visibility: "hidden"
            };
            e10.styledMode || (s11.fill = i10.backgroundColor, s11.stroke = i10.borderColor, s11["stroke-width"] = i10.borderWidth, this.label.css(i10.style || {})), this.label.attr(s11), this.label.added || this.label.add(t10);
          }
          this.label.labelrank = e10.plotSizeY, nI(this, "afterRender");
        }
        setOffset(t10, e10, i10, s10, o10, r10) {
          let {
            alignOptions: a10,
            axis: n10,
            label: h10,
            options: l10,
            textAlign: d10
          } = this, c10 = n10.chart, p10 = this.getStackBox({
            xOffset: t10,
            width: e10,
            boxBottom: i10,
            boxTop: s10,
            defaultX: o10,
            xAxis: r10
          }), {
            verticalAlign: u10
          } = a10;
          if (h10 && p10) {
            let t11 = h10.getBBox(void 0, 0), e11 = h10.padding, i11 = "justify" === nN(l10.overflow, "justify"), s11;
            a10.x = l10.x || 0, a10.y = l10.y || 0;
            let {
              x: o11,
              y: r11
            } = this.adjustStackPosition({
              labelBox: t11,
              verticalAlign: u10,
              textAlign: d10
            });
            p10.x -= o11, p10.y -= r11, h10.align(a10, false, p10), (s11 = c10.isInsidePlot(h10.alignAttr.x + a10.x + o11, h10.alignAttr.y + a10.y + r11)) || (i11 = false), i11 && nB.prototype.justifyDataLabel.call(n10, h10, a10, h10.alignAttr, t11, p10), h10.attr({
              x: h10.alignAttr.x,
              y: h10.alignAttr.y,
              rotation: l10.rotation,
              rotationOriginX: t11.width * nz(l10.textAlign || "center"),
              rotationOriginY: t11.height / 2
            }), nN(!i11 && l10.crop, true) && (s11 = nR(h10.x) && nR(h10.y) && c10.isInsidePlot(h10.x - e11 + (h10.width || 0), h10.y) && c10.isInsidePlot(h10.x + e11, h10.y)), h10[s11 ? "show" : "hide"]();
          }
          nI(this, "afterSetOffset", {
            xOffset: t10,
            width: e10
          });
        }
        adjustStackPosition({
          labelBox: t10,
          verticalAlign: e10,
          textAlign: i10
        }) {
          return {
            x: t10.width / 2 + t10.width / 2 * (2 * nz(i10) - 1),
            y: t10.height / 2 * 2 * (1 - nz(e10))
          };
        }
        getStackBox(t10) {
          let e10 = this.axis, i10 = e10.chart, {
            boxTop: s10,
            defaultX: o10,
            xOffset: r10,
            width: a10,
            boxBottom: n10
          } = t10, h10 = e10.stacking.usePercentage ? 100 : nN(s10, this.total, 0), l10 = e10.toPixels(h10), d10 = t10.xAxis || i10.xAxis[0], c10 = nN(o10, d10.translate(this.x)) + r10, p10 = Math.abs(l10 - e10.toPixels(n10 || nR(e10.min) && e10.logarithmic && e10.logarithmic.lin2log(e10.min) || 0)), u10 = i10.inverted, g2 = this.isNegative;
          return u10 ? {
            x: (g2 ? l10 : l10 - p10) - i10.plotLeft,
            y: d10.height - c10 - a10 + d10.top - i10.plotTop,
            width: p10,
            height: a10
          } : {
            x: c10 + d10.transB - i10.plotLeft,
            y: (g2 ? l10 - p10 : l10) - i10.plotTop,
            width: a10,
            height: p10
          };
        }
      }, {
        getDeferredAnimation: nG
      } = eo, {
        series: {
          prototype: nX
        }
      } = r_, {
        addEvent: nH,
        correctFloat: nF,
        defined: nY,
        destroyObjectProperties: nj,
        fireEvent: nU,
        isNumber: nV,
        objectEach: n$,
        pick: n_
      } = tx;
      function nZ() {
        let t10 = this.inverted;
        this.axes.forEach((t11) => {
          t11.stacking?.stacks && t11.hasVisibleSeries && (t11.stacking.oldStacks = t11.stacking.stacks);
        }), this.series.forEach((e10) => {
          let i10 = e10.xAxis?.options || {};
          e10.options.stacking && e10.reserveSpace() && (e10.stackKey = [e10.type, n_(e10.options.stack, ""), t10 ? i10.top : i10.left, t10 ? i10.height : i10.width].join(","));
        });
      }
      function nq() {
        let t10 = this.stacking;
        if (t10) {
          let e10 = t10.stacks;
          n$(e10, (t11, i10) => {
            nj(t11), delete e10[i10];
          }), t10.stackTotalGroup?.destroy();
        }
      }
      function nK() {
        this.stacking || (this.stacking = new n3(this));
      }
      function nJ(t10, e10, i10, s10) {
        return !nY(t10) || t10.x !== e10 || s10 && t10.stackKey !== s10 ? t10 = {
          x: e10,
          index: 0,
          key: s10,
          stackKey: s10
        } : t10.index++, t10.key = [i10, e10, t10.index].join(","), t10;
      }
      function nQ() {
        let t10, e10 = this, i10 = e10.yAxis, s10 = e10.stackKey || "", o10 = i10.stacking.stacks, r10 = e10.getColumn("x", true), a10 = e10.options.stacking, n10 = e10[a10 + "Stacker"];
        n10 && [s10, "-" + s10].forEach((i11) => {
          let s11 = r10.length, a11, h10, l10;
          for (; s11--; ) a11 = r10[s11], t10 = e10.getStackIndicator(t10, a11, e10.index, i11), h10 = o10[i11]?.[a11], (l10 = h10?.points[t10.key || ""]) && n10.call(e10, l10, h10, s11);
        });
      }
      function n0(t10, e10, i10) {
        let s10 = e10.total ? 100 / e10.total : 0;
        t10[0] = nF(t10[0] * s10), t10[1] = nF(t10[1] * s10), this.stackedYData[i10] = t10[1];
      }
      function n1(t10) {
        (this.is("column") || this.is("columnrange")) && (this.options.centerInCategory && this.chart.series.length > 1 ? nX.setStackedPoints.call(this, t10, "group") : t10.stacking.resetStacks());
      }
      function n2(t10, e10) {
        let i10, s10, o10, r10, a10, n10, h10, l10 = e10 || this.options.stacking;
        if (!l10 || !this.reserveSpace() || ({
          group: "xAxis"
        }[l10] || "yAxis") !== t10.coll) return;
        let d10 = this.getColumn("x", true), c10 = this.getColumn(this.pointValKey || "y", true), p10 = [], u10 = c10.length, g2 = this.options, f2 = g2.threshold || 0, m2 = g2.startFromThreshold ? f2 : 0, x2 = g2.stack, y2 = e10 ? `${this.type},${l10}` : this.stackKey || "", b2 = "-" + y2, v2 = this.negStacks, k2 = t10.stacking, M2 = k2.stacks, w2 = k2.oldStacks;
        for (k2.stacksTouched += 1, h10 = 0; h10 < u10; h10++) {
          let e11 = d10[h10] || 0, u11 = c10[h10], g3 = nV(u11) && u11 || 0;
          n10 = (i10 = this.getStackIndicator(i10, e11, this.index)).key || "", M2[a10 = (s10 = v2 && g3 < (m2 ? 0 : f2)) ? b2 : y2] || (M2[a10] = {}), M2[a10][e11] || (w2[a10]?.[e11] ? (M2[a10][e11] = w2[a10][e11], M2[a10][e11].total = null) : M2[a10][e11] = new nW(t10, t10.options.stackLabels, !!s10, e11, x2)), o10 = M2[a10][e11], null !== u11 ? (o10.points[n10] = o10.points[this.index] = [n_(o10.cumulative, m2)], nY(o10.cumulative) || (o10.base = n10), o10.touched = k2.stacksTouched, i10.index > 0 && false === this.singleStacks && (o10.points[n10][0] = o10.points[this.index + "," + e11 + ",0"][0])) : (delete o10.points[n10], delete o10.points[this.index]);
          let S2 = o10.total || 0;
          "percent" === l10 ? (r10 = s10 ? y2 : b2, S2 = v2 && M2[r10]?.[e11] ? (r10 = M2[r10][e11]).total = Math.max(r10.total || 0, S2) + Math.abs(g3) : nF(S2 + Math.abs(g3))) : "group" === l10 ? nV(u11) && S2++ : S2 = nF(S2 + g3), "group" === l10 ? o10.cumulative = (S2 || 1) - 1 : o10.cumulative = nF(n_(o10.cumulative, m2) + g3), o10.total = S2, null !== u11 && (o10.points[n10].push(o10.cumulative), p10[h10] = o10.cumulative, o10.hasValidPoints = true);
        }
        "percent" === l10 && (k2.usePercentage = true), "group" !== l10 && (this.stackedYData = p10), k2.oldStacks = {};
      }
      class n3 {
        constructor(t10) {
          this.oldStacks = {}, this.stacks = {}, this.stacksTouched = 0, this.axis = t10;
        }
        buildStacks() {
          let t10, e10, i10 = this.axis, s10 = i10.series, o10 = "xAxis" === i10.coll, r10 = i10.options.reversedStacks, a10 = s10.length;
          for (this.resetStacks(), this.usePercentage = false, e10 = a10; e10--; ) t10 = s10[r10 ? e10 : a10 - e10 - 1], o10 && t10.setGroupedPoints(i10), t10.setStackedPoints(i10);
          if (!o10) for (e10 = 0; e10 < a10; e10++) s10[e10].modifyStacks();
          nU(i10, "afterBuildStacks");
        }
        cleanStacks() {
          this.oldStacks && (this.stacks = this.oldStacks, n$(this.stacks, (t10) => {
            n$(t10, (t11) => {
              t11.cumulative = t11.total;
            });
          }));
        }
        resetStacks() {
          n$(this.stacks, (t10) => {
            n$(t10, (e10, i10) => {
              nV(e10.touched) && e10.touched < this.stacksTouched ? (e10.destroy(), delete t10[i10]) : (e10.total = null, e10.cumulative = null);
            });
          });
        }
        renderStackTotals() {
          let t10 = this.axis, e10 = t10.chart, i10 = e10.renderer, s10 = this.stacks, o10 = nG(e10, t10.options.stackLabels?.animation || false), r10 = this.stackTotalGroup = this.stackTotalGroup || i10.g("stack-labels").attr({
            zIndex: 6,
            opacity: 0
          }).add();
          r10.translate(e10.plotLeft, e10.plotTop), n$(s10, (t11) => {
            n$(t11, (t12) => {
              t12.render(r10);
            });
          }), r10.animate({
            opacity: 1
          }, o10);
        }
      }
      (L || (L = {})).compose = function(t10, e10, i10) {
        let s10 = e10.prototype, o10 = i10.prototype;
        s10.getStacks || (nH(t10, "init", nK), nH(t10, "destroy", nq), s10.getStacks = nZ, o10.getStackIndicator = nJ, o10.modifyStacks = nQ, o10.percentStacker = n0, o10.setGroupedPoints = n1, o10.setStackedPoints = n2);
      };
      let n5 = L, {
        defined: n6,
        merge: n9,
        isObject: n4
      } = tx;
      class n8 extends ay {
        drawGraph() {
          let t10 = this.options, e10 = (this.gappedPath || this.getGraphPath).call(this), i10 = this.chart.styledMode;
          [this, ...this.zones].forEach((s10, o10) => {
            let r10, a10 = s10.graph, n10 = a10 ? "animate" : "attr", h10 = s10.dashStyle || t10.dashStyle;
            a10 ? (a10.endX = this.preventGraphAnimation ? null : e10.xMap, a10.animate({
              d: e10
            })) : e10.length && (s10.graph = a10 = this.chart.renderer.path(e10).addClass("highcharts-graph" + (o10 ? ` highcharts-zone-graph-${o10 - 1} ` : " ") + (o10 && s10.className || "")).attr({
              zIndex: 1
            }).add(this.group)), a10 && !i10 && (r10 = {
              stroke: !o10 && t10.lineColor || s10.color || this.color || "#cccccc",
              "stroke-width": t10.lineWidth || 0,
              fill: this.fillGraph && this.color || "none"
            }, h10 ? r10.dashstyle = h10 : "square" !== t10.linecap && (r10["stroke-linecap"] = r10["stroke-linejoin"] = "round"), a10[n10](r10).shadow(t10.shadow && n9({
              filterUnits: "userSpaceOnUse"
            }, n4(t10.shadow) ? t10.shadow : {}))), a10 && (a10.startX = e10.xMap, a10.isArea = e10.isArea);
          });
        }
        getGraphPath(t10, e10, i10) {
          let s10 = this, o10 = s10.options, r10 = [], a10 = [], n10, h10 = o10.step, l10 = (t10 = t10 || s10.points).reversed;
          return l10 && t10.reverse(), (h10 = {
            right: 1,
            center: 2
          }[h10] || h10 && 3) && l10 && (h10 = 4 - h10), (t10 = this.getValidPoints(t10, false, o10.nullInteraction || !(o10.connectNulls && !e10 && !i10))).forEach(function(l11, d10) {
            let c10, p10 = l11.plotX, u10 = l11.plotY, g2 = t10[d10 - 1], f2 = l11.isNull || "number" != typeof u10;
            (l11.leftCliff || g2?.rightCliff) && !i10 && (n10 = true), f2 && !n6(e10) && d10 > 0 ? n10 = !o10.connectNulls : f2 && !e10 ? n10 = true : (0 === d10 || n10 ? c10 = [["M", l11.plotX, l11.plotY]] : s10.getPointSpline ? c10 = [s10.getPointSpline(t10, l11, d10)] : h10 ? (c10 = 1 === h10 ? [["L", g2.plotX, u10]] : 2 === h10 ? [["L", (g2.plotX + p10) / 2, g2.plotY], ["L", (g2.plotX + p10) / 2, u10]] : [["L", p10, g2.plotY]]).push(["L", p10, u10]) : c10 = [["L", p10, u10]], a10.push(l11.x), h10 && (a10.push(l11.x), 2 === h10 && a10.push(l11.x)), r10.push.apply(r10, c10), n10 = false);
          }), r10.xMap = a10, s10.graphPath = r10, r10;
        }
      }
      n8.defaultOptions = n9(ay.defaultOptions, {
        legendSymbol: "lineMarker"
      }), r_.registerSeriesType("line", n8);
      let {
        seriesTypes: {
          line: n7
        }
      } = r_, {
        extend: ht,
        merge: he,
        objectEach: hi,
        pick: hs
      } = tx;
      class ho extends n7 {
        drawGraph() {
          this.areaPath = [], super.drawGraph.apply(this);
          let {
            areaPath: t10,
            options: e10
          } = this;
          [this, ...this.zones].forEach((i10, s10) => {
            let o10 = {}, r10 = i10.fillColor || e10.fillColor, a10 = i10.area, n10 = a10 ? "animate" : "attr";
            a10 ? (a10.endX = this.preventGraphAnimation ? null : t10.xMap, a10.animate({
              d: t10
            })) : (o10.zIndex = 0, (a10 = i10.area = this.chart.renderer.path(t10).addClass("highcharts-area" + (s10 ? ` highcharts-zone-area-${s10 - 1} ` : " ") + (s10 && i10.className || "")).add(this.group)).isArea = true), this.chart.styledMode || (o10.fill = r10 || i10.color || this.color, o10["fill-opacity"] = r10 ? 1 : e10.fillOpacity ?? 0.75, a10.css({
              pointerEvents: this.stickyTracking ? "none" : "auto"
            })), a10[n10](o10), a10.startX = t10.xMap, a10.shiftUnit = e10.step ? 2 : 1;
          });
        }
        getGraphPath(t10) {
          let e10, i10, s10, o10 = n7.prototype.getGraphPath, r10 = this.options, a10 = r10.stacking, n10 = this.yAxis, h10 = [], l10 = [], d10 = this.index, c10 = n10.stacking.stacks[this.stackKey], p10 = r10.threshold, u10 = Math.round(n10.getThreshold(r10.threshold)), g2 = hs(r10.connectNulls, "percent" === a10), f2 = function(i11, s11, o11) {
            let r11 = t10[i11], g3 = a10 && c10[r11.x].points[d10], f3 = r11[o11 + "Null"] || 0, m3 = r11[o11 + "Cliff"] || 0, x3, y3, b3 = true;
            m3 || f3 ? (x3 = (f3 ? g3[0] : g3[1]) + m3, y3 = g3[0] + m3, b3 = !!f3) : !a10 && t10[s11] && t10[s11].isNull && (x3 = y3 = p10), void 0 !== x3 && (l10.push({
              plotX: e10,
              plotY: null === x3 ? u10 : n10.getThreshold(x3),
              isNull: b3,
              isCliff: true
            }), h10.push({
              plotX: e10,
              plotY: null === y3 ? u10 : n10.getThreshold(y3),
              doCurve: false
            }));
          };
          t10 = t10 || this.points, a10 && (t10 = this.getStackPoints(t10));
          for (let o11 = 0, r11 = t10.length; o11 < r11; ++o11) a10 || (t10[o11].leftCliff = t10[o11].rightCliff = t10[o11].leftNull = t10[o11].rightNull = void 0), i10 = t10[o11].isNull, e10 = hs(t10[o11].rectPlotX, t10[o11].plotX), s10 = a10 ? hs(t10[o11].yBottom, u10) : u10, (!i10 || g2) && (g2 || f2(o11, o11 - 1, "left"), i10 && !a10 && g2 || (l10.push(t10[o11]), h10.push({
            x: o11,
            plotX: e10,
            plotY: s10
          })), g2 || f2(o11, o11 + 1, "right"));
          let m2 = o10.call(this, l10, true, true);
          h10.reversed = true;
          let x2 = o10.call(this, h10, true, true), y2 = x2[0];
          y2 && "M" === y2[0] && (x2[0] = ["L", y2[1], y2[2]]);
          let b2 = m2.concat(x2);
          b2.length && b2.push(["Z"]);
          let v2 = o10.call(this, l10, false, g2);
          return this.chart.series.length > 1 && a10 && l10.some((t11) => t11.isCliff) && (b2.hasStackedCliffs = v2.hasStackedCliffs = true), b2.xMap = m2.xMap, this.areaPath = b2, v2;
        }
        getStackPoints(t10) {
          let e10 = this, i10 = [], s10 = [], o10 = this.xAxis, r10 = this.yAxis, a10 = r10.stacking.stacks[this.stackKey], n10 = {}, h10 = r10.series, l10 = h10.length, d10 = r10.options.reversedStacks ? 1 : -1, c10 = h10.indexOf(e10);
          if (t10 = t10 || this.points, this.options.stacking) {
            for (let e11 = 0; e11 < t10.length; e11++) t10[e11].leftNull = t10[e11].rightNull = void 0, n10[t10[e11].x] = t10[e11];
            hi(a10, function(t11, e11) {
              null !== t11.total && s10.push(e11);
            }), s10.sort(function(t11, e11) {
              return t11 - e11;
            });
            let p10 = h10.map((t11) => t11.visible);
            s10.forEach(function(t11, u10) {
              let g2 = 0, f2, m2;
              if (n10[t11] && !n10[t11].isNull) i10.push(n10[t11]), [-1, 1].forEach(function(i11) {
                let o11 = 1 === i11 ? "rightNull" : "leftNull", r11 = a10[s10[u10 + i11]], g3 = 0;
                if (r11) {
                  let i12 = c10;
                  for (; i12 >= 0 && i12 < l10; ) {
                    let s11 = h10[i12].index;
                    !(f2 = r11.points[s11]) && (s11 === e10.index ? n10[t11][o11] = true : p10[i12] && (m2 = a10[t11].points[s11]) && (g3 -= m2[1] - m2[0])), i12 += d10;
                  }
                }
                n10[t11][1 === i11 ? "rightCliff" : "leftCliff"] = g3;
              });
              else {
                let e11 = c10;
                for (; e11 >= 0 && e11 < l10; ) {
                  let i11 = h10[e11].index;
                  if (f2 = a10[t11].points[i11]) {
                    g2 = f2[1];
                    break;
                  }
                  e11 += d10;
                }
                g2 = hs(g2, 0), g2 = r10.translate(g2, 0, 1, 0, 1), i10.push({
                  isNull: true,
                  plotX: o10.translate(t11, 0, 0, 0, 1),
                  x: t11,
                  plotY: g2,
                  yBottom: g2
                });
              }
            });
          }
          return i10;
        }
      }
      ho.defaultOptions = he(n7.defaultOptions, {
        threshold: 0,
        legendSymbol: "areaMarker"
      }), ht(ho.prototype, {
        singleStacks: false
      }), r_.registerSeriesType("area", ho);
      let {
        line: hr
      } = r_.seriesTypes, {
        merge: ha,
        pick: hn
      } = tx;
      class hh extends hr {
        getPointSpline(t10, e10, i10) {
          let s10, o10, r10, a10, n10 = e10.plotX || 0, h10 = e10.plotY || 0, l10 = t10[i10 - 1], d10 = t10[i10 + 1];
          function c10(t11) {
            return t11 && !t11.isNull && false !== t11.doCurve && !e10.isCliff;
          }
          if (c10(l10) && c10(d10)) {
            let t11 = l10.plotX || 0, i11 = l10.plotY || 0, c11 = d10.plotX || 0, p11 = d10.plotY || 0, u10 = 0;
            s10 = (1.5 * n10 + t11) / 2.5, o10 = (1.5 * h10 + i11) / 2.5, r10 = (1.5 * n10 + c11) / 2.5, a10 = (1.5 * h10 + p11) / 2.5, r10 !== s10 && (u10 = (a10 - o10) * (r10 - n10) / (r10 - s10) + h10 - a10), o10 += u10, a10 += u10, o10 > i11 && o10 > h10 ? (o10 = Math.max(i11, h10), a10 = 2 * h10 - o10) : o10 < i11 && o10 < h10 && (o10 = Math.min(i11, h10), a10 = 2 * h10 - o10), a10 > p11 && a10 > h10 ? (a10 = Math.max(p11, h10), o10 = 2 * h10 - a10) : a10 < p11 && a10 < h10 && (a10 = Math.min(p11, h10), o10 = 2 * h10 - a10), e10.rightContX = r10, e10.rightContY = a10, e10.controlPoints = {
              low: [s10, o10],
              high: [r10, a10]
            };
          }
          let p10 = ["C", hn(l10.rightContX, l10.plotX, 0), hn(l10.rightContY, l10.plotY, 0), hn(s10, n10, 0), hn(o10, h10, 0), n10, h10];
          return l10.rightContX = l10.rightContY = void 0, p10;
        }
      }
      hh.defaultOptions = ha(hr.defaultOptions), r_.registerSeriesType("spline", hh);
      let hl = hh, {
        area: hd,
        area: {
          prototype: hc
        }
      } = r_.seriesTypes, {
        extend: hp,
        merge: hu
      } = tx;
      class hg extends hl {
      }
      hg.defaultOptions = hu(hl.defaultOptions, hd.defaultOptions), hp(hg.prototype, {
        getGraphPath: hc.getGraphPath,
        getStackPoints: hc.getStackPoints,
        drawGraph: hc.drawGraph
      }), r_.registerSeriesType("areaspline", hg);
      let {
        animObject: hf
      } = eo, {
        parse: hm
      } = tJ, {
        noop: hx
      } = V, {
        clamp: hy,
        crisp: hb,
        defined: hv,
        extend: hk,
        fireEvent: hM,
        isArray: hw,
        isNumber: hS,
        merge: hA,
        pick: hT,
        objectEach: hC
      } = tx;
      class hP extends ay {
        animate(t10) {
          let e10, i10, s10 = this, o10 = this.yAxis, r10 = o10.pos, a10 = o10.reversed, n10 = s10.options, {
            clipOffset: h10,
            inverted: l10
          } = this.chart, d10 = {}, c10 = l10 ? "translateX" : "translateY";
          t10 && h10 ? (d10.scaleY = 1e-3, i10 = hy(o10.toPixels(n10.threshold || 0), r10, r10 + o10.len), l10 ? d10.translateX = (i10 += a10 ? -Math.floor(h10[0]) : Math.ceil(h10[2])) - o10.len : d10.translateY = i10 += a10 ? Math.ceil(h10[0]) : -Math.floor(h10[2]), s10.clipBox && s10.setClip(), s10.group.attr(d10)) : (e10 = Number(s10.group.attr(c10)), s10.group.animate({
            scaleY: 1
          }, hk(hf(s10.options.animation), {
            step: function(t11, i11) {
              s10.group && (d10[c10] = e10 + i11.pos * (r10 - e10), s10.group.attr(d10));
            }
          })));
        }
        init(t10, e10) {
          super.init.apply(this, arguments);
          let i10 = this;
          (t10 = i10.chart).hasRendered && t10.series.forEach(function(t11) {
            t11.type === i10.type && (t11.isDirty = true);
          });
        }
        getColumnMetrics() {
          let t10 = this, e10 = t10.options, i10 = t10.xAxis, s10 = t10.yAxis, o10 = i10.options.reversedStacks, r10 = i10.reversed && !o10 || !i10.reversed && o10, a10 = {}, n10, h10 = 0;
          false === e10.grouping ? h10 = 1 : t10.chart.series.forEach(function(e11) {
            let i11, o11 = e11.yAxis, r11 = e11.options;
            e11.type === t10.type && e11.reserveSpace() && s10.len === o11.len && s10.pos === o11.pos && (r11.stacking && "group" !== r11.stacking ? (void 0 === a10[n10 = e11.stackKey] && (a10[n10] = h10++), i11 = a10[n10]) : false !== r11.grouping && (i11 = h10++), e11.columnIndex = i11);
          });
          let l10 = Math.min(Math.abs(i10.transA) * (!i10.brokenAxis?.hasBreaks && i10.ordinal?.slope || e10.pointRange || i10.closestPointRange || i10.tickInterval || 1), i10.len), d10 = l10 * e10.groupPadding, c10 = (l10 - 2 * d10) / (h10 || 1), p10 = Math.min(e10.maxPointWidth || i10.len, hT(e10.pointWidth, c10 * (1 - 2 * e10.pointPadding))), u10 = (t10.columnIndex || 0) + +!!r10;
          return t10.columnMetrics = {
            width: p10,
            offset: (c10 - p10) / 2 + (d10 + u10 * c10 - l10 / 2) * (r10 ? -1 : 1),
            paddedWidth: c10,
            columnCount: h10
          }, t10.columnMetrics;
        }
        crispCol(t10, e10, i10, s10) {
          let o10 = this.borderWidth, r10 = this.chart.inverted;
          return s10 = hb(e10 + s10, o10, r10) - (e10 = hb(e10, o10, r10)), this.options.crisp && (i10 = hb(t10 + i10, o10) - (t10 = hb(t10, o10))), {
            x: t10,
            y: e10,
            width: i10,
            height: s10
          };
        }
        adjustForMissingColumns(t10, e10, i10, s10) {
          if (!i10.isNull && s10.columnCount > 1) {
            let o10 = this.xAxis.series.filter((t11) => t11.visible).map((t11) => t11.index), r10 = 0, a10 = 0;
            hC(this.xAxis.stacking?.stacks, (t11) => {
              let e11 = "number" == typeof i10.x ? t11[i10.x.toString()]?.points : void 0, s11 = e11?.[this.index], n11 = {};
              if (e11 && hw(s11)) {
                let t12 = this.index, i11 = Object.keys(e11).filter((t13) => !t13.match(",") && e11[t13] && e11[t13].length > 1).map(parseFloat).filter((t13) => -1 !== o10.indexOf(t13)).filter((e12) => {
                  let i12 = this.chart.series[e12].options, s12 = i12.stacking && i12.stack;
                  if (hv(s12)) {
                    if (hS(n11[s12])) return t12 === e12 && (t12 = n11[s12]), false;
                    n11[s12] = e12;
                  }
                  return true;
                }).sort((t13, e12) => e12 - t13);
                r10 = i11.indexOf(t12), a10 = i11.length;
              }
            }), r10 = this.xAxis.reversed ? a10 - 1 - r10 : r10;
            let n10 = (a10 - 1) * s10.paddedWidth + e10;
            t10 = (i10.plotX || 0) + n10 / 2 - e10 - r10 * s10.paddedWidth;
          }
          return t10;
        }
        translate() {
          let t10 = this, e10 = t10.chart, i10 = t10.options, s10 = t10.dense = t10.closestPointRange * t10.xAxis.transA < 2, o10 = t10.borderWidth = hT(i10.borderWidth, +!s10), r10 = t10.xAxis, a10 = t10.yAxis, n10 = i10.threshold, h10 = hT(i10.minPointLength, 5), l10 = t10.getColumnMetrics(), d10 = l10.width, c10 = t10.pointXOffset = l10.offset, p10 = t10.dataMin, u10 = t10.dataMax, g2 = t10.translatedThreshold = a10.getThreshold(n10), f2 = t10.barW = Math.max(d10, 1 + 2 * o10);
          i10.pointPadding && i10.crisp && (f2 = Math.ceil(f2)), ay.prototype.translate.apply(t10), t10.points.forEach(function(s11) {
            let o11 = hT(s11.yBottom, g2), m2 = 999 + Math.abs(o11), x2 = s11.plotX || 0, y2 = hy(s11.plotY, -m2, a10.len + m2), b2, v2 = Math.min(y2, o11), k2 = Math.max(y2, o11) - v2, M2 = d10, w2 = x2 + c10, S2 = f2;
            h10 && Math.abs(k2) < h10 && (k2 = h10, b2 = !a10.reversed && !s11.negative || a10.reversed && s11.negative, hS(n10) && hS(u10) && s11.y === n10 && u10 <= n10 && (a10.min || 0) < n10 && (p10 !== u10 || (a10.max || 0) <= n10) && (b2 = !b2, s11.negative = !s11.negative), v2 = Math.abs(v2 - g2) > h10 ? o11 - h10 : g2 - (b2 ? h10 : 0)), hv(s11.options.pointWidth) && (w2 -= Math.round(((M2 = S2 = Math.ceil(s11.options.pointWidth)) - d10) / 2)), i10.centerInCategory && (w2 = t10.adjustForMissingColumns(w2, M2, s11, l10)), s11.barX = w2, s11.pointWidth = M2, s11.tooltipPos = e10.inverted ? [hy(a10.len + a10.pos - e10.plotLeft - y2, a10.pos - e10.plotLeft, a10.len + a10.pos - e10.plotLeft), r10.len + r10.pos - e10.plotTop - w2 - S2 / 2, k2] : [r10.left - e10.plotLeft + w2 + S2 / 2, hy(y2 + a10.pos - e10.plotTop, a10.pos - e10.plotTop, a10.len + a10.pos - e10.plotTop), k2], s11.shapeType = t10.pointClass.prototype.shapeType || "roundedRect", s11.shapeArgs = t10.crispCol(w2, v2, S2, s11.isNull ? 0 : k2);
          }), hM(this, "afterColumnTranslate");
        }
        drawGraph() {
          this.group[this.dense ? "addClass" : "removeClass"]("highcharts-dense-data");
        }
        pointAttribs(t10, e10) {
          let i10 = this.options, s10 = this.pointAttrToOptions || {}, o10 = s10.stroke || "borderColor", r10 = s10["stroke-width"] || "borderWidth", a10, n10, h10, l10 = t10 && t10.color || this.color, d10 = t10 && t10[o10] || i10[o10] || l10, c10 = t10 && t10.options.dashStyle || i10.dashStyle, p10 = t10 && t10[r10] || i10[r10] || this[r10] || 0, u10 = t10?.isNull && i10.nullInteraction ? 0 : t10?.opacity ?? i10.opacity ?? 1;
          t10 && this.zones.length && (n10 = t10.getZone(), l10 = t10.options.color || n10 && (n10.color || t10.nonZonedColor) || this.color, n10 && (d10 = n10.borderColor || d10, c10 = n10.dashStyle || c10, p10 = n10.borderWidth || p10)), e10 && t10 && (h10 = (a10 = hA(i10.states[e10], t10.options.states?.[e10] || {})).brightness, l10 = a10.color || void 0 !== h10 && hm(l10).brighten(a10.brightness).get() || l10, d10 = a10[o10] || d10, p10 = a10[r10] || p10, c10 = a10.dashStyle || c10, u10 = hT(a10.opacity, u10));
          let g2 = {
            fill: l10,
            stroke: d10,
            "stroke-width": p10,
            opacity: u10
          };
          return c10 && (g2.dashstyle = c10), g2;
        }
        drawPoints(t10 = this.points) {
          let e10, i10 = this, s10 = this.chart, o10 = i10.options, r10 = o10.nullInteraction, a10 = s10.renderer, n10 = o10.animationLimit || 250;
          t10.forEach(function(t11) {
            let h10 = t11.plotY, l10 = t11.graphic, d10 = !!l10, c10 = l10 && s10.pointCount < n10 ? "animate" : "attr";
            hS(h10) && (null !== t11.y || r10) ? (e10 = t11.shapeArgs, l10 && t11.hasNewShapeType() && (l10 = l10.destroy()), i10.enabledDataSorting && (t11.startXPos = i10.xAxis.reversed ? -(e10 && e10.width || 0) : i10.xAxis.width), !l10 && (t11.graphic = l10 = a10[t11.shapeType](e10).add(t11.group || i10.group), l10 && i10.enabledDataSorting && s10.hasRendered && s10.pointCount < n10 && (l10.attr({
              x: t11.startXPos
            }), d10 = true, c10 = "animate")), l10 && d10 && l10[c10](hA(e10)), s10.styledMode || l10[c10](i10.pointAttribs(t11, t11.selected && "select")).shadow(false !== t11.allowShadow && o10.shadow), l10 && (l10.addClass(t11.getClassName(), true), l10.attr({
              visibility: t11.visible ? "inherit" : "hidden"
            }))) : l10 && (t11.graphic = l10.destroy());
          });
        }
        drawTracker(t10 = this.points) {
          let e10, i10 = this, s10 = i10.chart, o10 = s10.pointer, r10 = function(t11) {
            o10?.normalize(t11);
            let e11 = o10?.getPointFromEvent(t11);
            o10 && e11 && i10.options.enableMouseTracking && (s10.isInsidePlot(t11.chartX - s10.plotLeft, t11.chartY - s10.plotTop, {
              visiblePlotOnly: true
            }) || o10?.inClass(t11.target, "highcharts-data-label")) && (o10.isDirectTouch = true, e11.onMouseOver(t11));
          };
          t10.forEach(function(t11) {
            e10 = hw(t11.dataLabels) ? t11.dataLabels : t11.dataLabel ? [t11.dataLabel] : [], t11.graphic && (t11.graphic.element.point = t11), e10.forEach(function(e11) {
              (e11.div || e11.element).point = t11;
            });
          }), i10._hasTracking || (i10.trackerGroups?.reduce((t11, e11) => ("dataLabelsGroup" === e11 ? t11.push(...i10.dataLabelsGroups || []) : t11.push(i10[e11]), t11), []).forEach((t11) => {
            t11 && (t11.addClass("highcharts-tracker").on("mouseover", r10).on("mouseout", function(t12) {
              o10?.onTrackerMouseOut(t12);
            }).on("touchstart", r10), !s10.styledMode && i10.options.cursor && t11.css({
              cursor: i10.options.cursor
            }));
          }), i10._hasTracking = true), hM(this, "afterDrawTracker");
        }
        remove() {
          let t10 = this, e10 = t10.chart;
          e10.hasRendered && e10.series.forEach(function(e11) {
            e11.type === t10.type && (e11.isDirty = true);
          }), ay.prototype.remove.apply(t10, arguments);
        }
      }
      hP.defaultOptions = hA(ay.defaultOptions, {
        borderRadius: 3,
        centerInCategory: false,
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
          align: void 0,
          verticalAlign: void 0,
          y: void 0
        },
        startFromThreshold: true,
        stickyTracking: false,
        tooltip: {
          distance: 6
        },
        threshold: 0,
        borderColor: "#ffffff"
      }), hk(hP.prototype, {
        directTouch: true,
        getSymbol: hx,
        negStacks: true,
        trackerGroups: ["group", "dataLabelsGroup"]
      }), r_.registerSeriesType("column", hP);
      let hO = hP, {
        getDeferredAnimation: hE
      } = eo, {
        format: hL
      } = eI, {
        defined: hB,
        extend: hD,
        fireEvent: hI,
        getAlignFactor: hz,
        isArray: hR,
        isString: hN,
        merge: hW,
        objectEach: hG,
        pick: hX,
        pInt: hH,
        splat: hF
      } = tx;
      !function(t10) {
        function e10() {
          return h10(this).some((t11) => t11?.enabled);
        }
        function i10(t11, e11, i11, s11, o11) {
          let {
            chart: r11,
            enabledDataSorting: a11
          } = this, n11 = this.isCartesian && r11.inverted, h11 = t11.plotX, l11 = t11.plotY, d10 = i11.rotation || 0, c10 = hB(h11) && hB(l11) && r11.isInsidePlot(h11, Math.round(l11), {
            inverted: n11,
            paneCoordinates: true,
            series: this
          }), p10 = 0 === d10 && "justify" === hX(i11.overflow, a11 ? "none" : "justify"), u10 = this.visible && false !== t11.visible && hB(h11) && (t11.series.forceDL || a11 && !p10 || c10 || hX(i11.inside, !!this.options.stacking) && s11 && r11.isInsidePlot(h11, n11 ? s11.x + 1 : s11.y + s11.height - 1, {
            inverted: n11,
            paneCoordinates: true,
            series: this
          })), g2 = t11.pos();
          if (u10 && g2) {
            var f2;
            let h12 = e11.getBBox(), l12 = e11.getBBox(void 0, 0);
            if (s11 = hD({
              x: g2[0],
              y: Math.round(g2[1]),
              width: 0,
              height: 0
            }, s11 || {}), "plotEdges" === i11.alignTo && this.isCartesian && (s11[n11 ? "x" : "y"] = 0, s11[n11 ? "width" : "height"] = this.yAxis?.len || 0), hD(i11, {
              width: h12.width,
              height: h12.height
            }), f2 = s11, a11 && this.xAxis && !p10 && this.setDataLabelStartPos(t11, e11, o11, c10, f2), e11.align(hW(i11, {
              width: l12.width,
              height: l12.height
            }), false, s11, false), e11.alignAttr.x += hz(i11.align) * (l12.width - h12.width), e11.alignAttr.y += hz(i11.verticalAlign) * (l12.height - h12.height), e11[e11.placed ? "animate" : "attr"]({
              "text-align": e11.alignAttr["text-align"] || "center",
              x: e11.alignAttr.x + (h12.width - l12.width) / 2,
              y: e11.alignAttr.y + (h12.height - l12.height) / 2,
              rotationOriginX: (e11.width || 0) / 2,
              rotationOriginY: (e11.height || 0) / 2
            }), p10 && s11.height >= 0) this.justifyDataLabel(e11, i11, e11.alignAttr, h12, s11, o11);
            else if (hX(i11.crop, true)) {
              let {
                x: t12,
                y: i12
              } = e11.alignAttr;
              u10 = r11.isInsidePlot(t12, i12, {
                paneCoordinates: true,
                series: this
              }) && r11.isInsidePlot(t12 + h12.width - 1, i12 + h12.height - 1, {
                paneCoordinates: true,
                series: this
              });
            }
            i11.shape && !d10 && e11[o11 ? "attr" : "animate"]({
              anchorX: g2[0],
              anchorY: g2[1]
            });
          }
          o11 && a11 && (e11.placed = false), u10 || a11 && !p10 ? (e11.show(), e11.placed = true) : (e11.hide(), e11.placed = false);
        }
        function s10(t11, e11) {
          hI(this, "initDataLabelsGroup", {
            index: t11,
            zIndex: e11?.zIndex ?? 6
          }), this.dataLabelsGroup = this.dataLabelsGroups?.[t11];
          let i11 = this.plotGroup("dataLabelsGroup", "data-labels", this.hasRendered ? "inherit" : "hidden", e11?.zIndex ?? 6, this.dataLabelsParentGroups?.[t11]);
          return this.dataLabelsGroups || (this.dataLabelsGroups = []), this.dataLabelsGroups[t11] = i11, this.dataLabelsGroup = this.dataLabelsGroups[0], i11;
        }
        function o10(t11, e11, i11) {
          let s11 = !!this.hasRendered, o11 = this.initDataLabelsGroup(t11, i11).attr({
            opacity: +s11
          });
          return !s11 && o11 && (this.visible && o11.show(), this.options.animation ? o11.animate({
            opacity: 1
          }, e11) : o11.attr({
            opacity: 1
          })), o11;
        }
        function r10(t11) {
          let e11;
          t11 = t11 || this.points;
          let i11 = this, s11 = i11.chart, o11 = i11.options, r11 = s11.renderer, {
            backgroundColor: a11,
            plotBackgroundColor: l11
          } = s11.options.chart, d10 = r11.getContrast(hN(l11) && l11 || hN(a11) && a11 || "#000000"), c10 = h10(i11), {
            animation: p10,
            defer: u10
          } = c10[0], g2 = u10 ? hE(s11, p10, i11) : {
            defer: 0,
            duration: 0
          };
          hI(this, "drawDataLabels"), i11.hasDataLabels?.() && t11.forEach((t12) => {
            let a12 = t12.dataLabels || [], h11 = t12.color || i11.color;
            hF(n10(c10, t12.dlOptions || t12.options?.dataLabels)).forEach((n11, l13) => {
              e11 = this.initDataLabels(l13, g2, n11);
              let c11 = n11.enabled && (t12.visible || t12.dataLabelOnHidden) && (!t12.isNull || t12.dataLabelOnNull) && function(t13, e12) {
                let i12 = e12.filter;
                if (i12) {
                  let e13 = i12.operator, s12 = t13[i12.property], o12 = i12.value;
                  return ">" === e13 && s12 > o12 || "<" === e13 && s12 < o12 || ">=" === e13 && s12 >= o12 || "<=" === e13 && s12 <= o12 || "==" === e13 && s12 == o12 || "===" === e13 && s12 === o12 || "!=" === e13 && s12 != o12 || "!==" === e13 && s12 !== o12 || false;
                }
                return true;
              }(t12, n11), {
                backgroundColor: p11,
                borderColor: u11,
                distance: f2,
                style: m2 = {}
              } = n11, x2, y2, b2, v2 = {}, k2 = a12[l13], M2 = !k2, w2;
              c11 && (y2 = hB(x2 = hX(n11[t12.formatPrefix + "Format"], n11.format)) ? hL(x2, t12, s11) : (n11[t12.formatPrefix + "Formatter"] || n11.formatter).call(t12, n11), b2 = n11.rotation, !s11.styledMode && (m2.color = hX(n11.color, m2.color, hN(i11.color) ? i11.color : void 0, "#000000"), "contrast" === m2.color ? ("none" !== p11 && (w2 = p11), t12.contrastColor = r11.getContrast("auto" !== w2 && hN(w2) && w2 || (hN(h11) ? h11 : "")), m2.color = w2 || !hB(f2) && n11.inside || 0 > hH(f2 || 0) || o11.stacking ? t12.contrastColor : d10) : delete t12.contrastColor, o11.cursor && (m2.cursor = o11.cursor)), v2 = {
                r: n11.borderRadius || 0,
                rotation: b2,
                padding: n11.padding,
                zIndex: 1
              }, s11.styledMode || (v2.fill = "auto" === p11 ? t12.color : p11, v2.stroke = "auto" === u11 ? t12.color : u11, v2["stroke-width"] = n11.borderWidth), hG(v2, (t13, e12) => {
                void 0 === t13 && delete v2[e12];
              })), !k2 || c11 && hB(y2) && !!(k2.div || k2.text?.foreignObject) == !!n11.useHTML && (k2.rotation && n11.rotation || k2.rotation === n11.rotation) || (k2 = void 0, M2 = true), c11 && hB(y2) && "" !== y2 && (k2 ? v2.text = y2 : (k2 = r11.label(y2, 0, 0, n11.shape, void 0, void 0, n11.useHTML, void 0, "data-label")).addClass(" highcharts-data-label-color-" + t12.colorIndex + " " + (n11.className || "") + (n11.useHTML ? " highcharts-tracker" : "")), k2 && (k2.options = n11, k2.attr(v2), s11.styledMode ? m2.width && k2.css({
                width: m2.width,
                textOverflow: m2.textOverflow,
                whiteSpace: m2.whiteSpace
              }) : k2.css(m2).shadow(n11.shadow), hI(k2, "beforeAddingDataLabel", {
                labelOptions: n11,
                point: t12
              }), k2.added || k2.add(e11), i11.alignDataLabel(t12, k2, n11, void 0, M2), k2.isActive = true, a12[l13] && a12[l13] !== k2 && a12[l13].destroy(), a12[l13] = k2));
            });
            let l12 = a12.length;
            for (; l12--; ) a12[l12]?.isActive ? a12[l12].isActive = false : (a12[l12]?.destroy(), a12.splice(l12, 1));
            t12.dataLabel = a12[0], t12.dataLabels = a12;
          }), hI(this, "afterDrawDataLabels");
        }
        function a10(t11, e11, i11, s11, o11, r11) {
          let a11 = this.chart, n11 = e11.align, h11 = e11.verticalAlign, l11 = t11.box ? 0 : t11.padding || 0, d10 = a11.inverted ? this.yAxis : this.xAxis, c10 = d10 ? d10.left - a11.plotLeft : 0, p10 = a11.inverted ? this.xAxis : this.yAxis, u10 = p10 ? p10.top - a11.plotTop : 0, {
            x: g2 = 0,
            y: f2 = 0
          } = e11, m2, x2;
          return (m2 = (i11.x || 0) + l11 + c10) < 0 && ("right" === n11 && g2 >= 0 ? (e11.align = "left", e11.inside = true) : g2 -= m2, x2 = true), (m2 = (i11.x || 0) + s11.width - l11 + c10) > a11.plotWidth && ("left" === n11 && g2 <= 0 ? (e11.align = "right", e11.inside = true) : g2 += a11.plotWidth - m2, x2 = true), (m2 = i11.y + l11 + u10) < 0 && ("bottom" === h11 && f2 >= 0 ? (e11.verticalAlign = "top", e11.inside = true) : f2 -= m2, x2 = true), (m2 = (i11.y || 0) + s11.height - l11 + u10) > a11.plotHeight && ("top" === h11 && f2 <= 0 ? (e11.verticalAlign = "bottom", e11.inside = true) : f2 += a11.plotHeight - m2, x2 = true), x2 && (e11.x = g2, e11.y = f2, t11.placed = !r11, t11.align(e11, void 0, o11)), x2;
        }
        function n10(t11, e11) {
          let i11 = [], s11;
          if (hR(t11) && !hR(e11)) i11 = t11.map(function(t12) {
            return hW(t12, e11);
          });
          else if (hR(e11) && !hR(t11)) i11 = e11.map(function(e12) {
            return hW(t11, e12);
          });
          else if (hR(t11) || hR(e11)) {
            if (hR(t11) && hR(e11)) for (s11 = Math.max(t11.length, e11.length); s11--; ) i11[s11] = hW(t11[s11], e11[s11]);
          } else i11 = hW(t11, e11);
          return i11;
        }
        function h10(t11) {
          let e11 = t11.chart.options.plotOptions;
          return hF(n10(n10(e11?.series?.dataLabels, e11?.[t11.type]?.dataLabels), t11.options.dataLabels));
        }
        function l10(t11, e11, i11, s11, o11) {
          let r11 = this.chart, a11 = r11.inverted, n11 = this.xAxis, h11 = n11.reversed, l11 = ((a11 ? e11.height : e11.width) || 0) / 2, d10 = t11.pointWidth, c10 = d10 ? d10 / 2 : 0;
          e11.startXPos = a11 ? o11.x : h11 ? -l11 - c10 : n11.width - l11 + c10, e11.startYPos = a11 ? h11 ? this.yAxis.height - l11 + c10 : -l11 - c10 : o11.y, s11 ? "hidden" === e11.visibility && (e11.show(), e11.attr({
            opacity: 0
          }).animate({
            opacity: 1
          })) : e11.attr({
            opacity: 1
          }).animate({
            opacity: 0
          }, void 0, e11.hide), r11.hasRendered && (i11 && e11.attr({
            x: e11.startXPos,
            y: e11.startYPos
          }), e11.placed = true);
        }
        t10.compose = function(t11) {
          let h11 = t11.prototype;
          h11.initDataLabels || (h11.initDataLabels = o10, h11.initDataLabelsGroup = s10, h11.alignDataLabel = i10, h11.drawDataLabels = r10, h11.justifyDataLabel = a10, h11.mergeArrays = n10, h11.setDataLabelStartPos = l10, h11.hasDataLabels = e10);
        };
      }(B || (B = {}));
      let hY = B, {
        composed: hj
      } = V, {
        series: hU
      } = r_, {
        merge: hV,
        pushUnique: h$
      } = tx;
      function h_(t10, e10, i10, s10, o10) {
        let {
          chart: r10,
          options: a10
        } = this, n10 = r10.inverted, h10 = this.xAxis?.len || r10.plotSizeX || 0, l10 = this.yAxis?.len || r10.plotSizeY || 0, d10 = t10.dlBox || t10.shapeArgs, c10 = t10.below ?? (t10.plotY || 0) > (this.translatedThreshold ?? l10), p10 = i10.inside ?? !!a10.stacking;
        if (d10) {
          if (s10 = hV(d10), "allow" !== i10.overflow || false !== i10.crop || false !== a10.clip) {
            s10.y < 0 && (s10.height += s10.y, s10.y = 0);
            let t11 = s10.y + s10.height - l10;
            t11 > 0 && t11 < s10.height - 1 && (s10.height -= t11);
          }
          n10 && (s10 = {
            x: l10 - s10.y - s10.height,
            y: h10 - s10.x - s10.width,
            width: s10.height,
            height: s10.width
          }), p10 || (n10 ? (s10.x += c10 ? 0 : s10.width, s10.width = 0) : (s10.y += c10 ? s10.height : 0, s10.height = 0));
        }
        i10.align ?? (i10.align = !n10 || p10 ? "center" : c10 ? "right" : "left"), i10.verticalAlign ?? (i10.verticalAlign = n10 || p10 ? "middle" : c10 ? "top" : "bottom"), hU.prototype.alignDataLabel.call(this, t10, e10, i10, s10, o10), i10.inside && t10.contrastColor && e10.css({
          color: t10.contrastColor
        });
      }
      (D || (D = {})).compose = function(t10) {
        hY.compose(hU), h$(hj, "ColumnDataLabel") && (t10.prototype.alignDataLabel = h_);
      };
      let hZ = D, {
        extend: hq,
        merge: hK
      } = tx;
      class hJ extends hO {
      }
      hJ.defaultOptions = hK(hO.defaultOptions, {}), hq(hJ.prototype, {
        inverted: true
      }), r_.registerSeriesType("bar", hJ);
      let {
        column: hQ,
        line: h0
      } = r_.seriesTypes, {
        addEvent: h1,
        extend: h2,
        merge: h3
      } = tx;
      class h5 extends h0 {
        applyJitter() {
          let t10 = this, e10 = this.options.jitter, i10 = this.points.length;
          e10 && this.points.forEach(function(s10, o10) {
            ["x", "y"].forEach(function(r10, a10) {
              if (e10[r10] && !s10.isNull) {
                let n10 = `plot${r10.toUpperCase()}`, h10 = t10[`${r10}Axis`], l10 = e10[r10] * h10.transA;
                if (h10 && !h10.logarithmic) {
                  let t11, e11 = Math.max(0, (s10[n10] || 0) - l10), d10 = Math.min(h10.len, (s10[n10] || 0) + l10);
                  s10[n10] = e11 + (d10 - e11) * ((t11 = 1e4 * Math.sin(o10 + a10 * i10)) - Math.floor(t11)), "x" === r10 && (s10.clientX = s10.plotX);
                }
              }
            });
          });
        }
        drawGraph() {
          this.options.lineWidth ? super.drawGraph() : this.graph && (this.graph = this.graph.destroy());
        }
      }
      h5.defaultOptions = h3(h0.defaultOptions, {
        lineWidth: 0,
        findNearestPointBy: "xy",
        jitter: {
          x: 0,
          y: 0
        },
        marker: {
          enabled: true
        },
        tooltip: {
          headerFormat: '<span style="color:{point.color}">●</span> <span style="font-size: 0.8em"> {series.name}</span><br/>',
          pointFormat: "x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>"
        }
      }), h2(h5.prototype, {
        drawTracker: hQ.prototype.drawTracker,
        sorted: false,
        requireSorting: false,
        noSharedTooltip: true,
        trackerGroups: ["group", "markerGroup", "dataLabelsGroup"]
      }), h1(h5, "afterTranslate", function() {
        this.applyJitter();
      }), r_.registerSeriesType("scatter", h5);
      let {
        deg2rad: h6
      } = V, {
        fireEvent: h9,
        isNumber: h4,
        pick: h8,
        relativeLength: h7
      } = tx;
      (x = I || (I = {})).getCenter = function() {
        let t10 = this.options, e10 = this.chart, i10 = 2 * (t10.slicedOffset || 0), s10 = e10.plotWidth - 2 * i10, o10 = e10.plotHeight - 2 * i10, r10 = t10.center, a10 = Math.min(s10, o10), n10 = t10.thickness, h10, l10 = t10.size, d10 = t10.innerSize || 0, c10, p10;
        "string" == typeof l10 && (l10 = parseFloat(l10)), "string" == typeof d10 && (d10 = parseFloat(d10));
        let u10 = [h8(r10?.[0], "50%"), h8(r10?.[1], "50%"), h8(l10 && l10 < 0 ? void 0 : t10.size, "100%"), h8(d10 && d10 < 0 ? void 0 : t10.innerSize || 0, "0%")];
        for (!e10.angular || this instanceof ay || (u10[3] = 0), c10 = 0; c10 < 4; ++c10) p10 = u10[c10], h10 = c10 < 2 || 2 === c10 && /%$/.test(p10), u10[c10] = h7(p10, [s10, o10, a10, u10[2]][c10]) + (h10 ? i10 : 0);
        return u10[3] > u10[2] && (u10[3] = u10[2]), h4(n10) && 2 * n10 < u10[2] && n10 > 0 && (u10[3] = u10[2] - 2 * n10), h9(this, "afterGetCenter", {
          positions: u10
        }), u10;
      }, x.getStartAndEndRadians = function(t10, e10) {
        let i10 = h4(t10) ? t10 : 0, s10 = h4(e10) && e10 > i10 && e10 - i10 < 360 ? e10 : i10 + 360;
        return {
          start: h6 * (i10 + -90),
          end: h6 * (s10 + -90)
        };
      };
      let lt = I, {
        setAnimation: le
      } = eo, {
        addEvent: li,
        defined: ls,
        extend: lo,
        isNumber: lr,
        pick: la,
        relativeLength: ln
      } = tx;
      class lh extends rd {
        getConnectorPath(t10) {
          let e10 = t10.dataLabelPosition, i10 = t10.options || {}, s10 = i10.connectorShape, o10 = this.connectorShapes[s10] || s10;
          return e10 && o10.call(this, __spreadProps(__spreadValues({}, e10.computed), {
            alignment: e10.alignment
          }), e10.connectorPosition, i10) || [];
        }
        getTranslate() {
          return this.sliced && this.slicedTranslation || {
            translateX: 0,
            translateY: 0
          };
        }
        haloPath(t10) {
          let e10 = this.shapeArgs;
          return this.sliced || !this.visible ? [] : this.series.chart.renderer.symbols.arc(e10.x, e10.y, e10.r + t10, e10.r + t10, {
            innerR: e10.r - 1,
            start: e10.start,
            end: e10.end,
            borderRadius: e10.borderRadius
          });
        }
        constructor(t10, e10, i10) {
          super(t10, e10, i10), this.half = 0, this.name ?? (this.name = t10.chart.options.lang.pieSliceName);
          const s10 = (t11) => {
            this.slice("select" === t11.type);
          };
          li(this, "select", s10), li(this, "unselect", s10);
        }
        isValid() {
          return lr(this.y) && this.y >= 0;
        }
        setVisible(t10, e10 = true) {
          t10 !== this.visible && this.update({
            visible: t10 ?? !this.visible
          }, e10, void 0, false);
        }
        slice(t10, e10, i10) {
          let s10 = this.series;
          le(i10, s10.chart), e10 = la(e10, true), this.sliced = this.options.sliced = t10 = ls(t10) ? t10 : !this.sliced, s10.options.data[s10.data.indexOf(this)] = this.options, this.graphic && this.graphic.animate(this.getTranslate());
        }
      }
      lo(lh.prototype, {
        connectorShapes: {
          fixedOffset: function(t10, e10, i10) {
            let s10 = e10.breakAt, o10 = e10.touchingSliceAt, r10 = i10.softConnector ? ["C", t10.x + ("left" === t10.alignment ? -5 : 5), t10.y, 2 * s10.x - o10.x, 2 * s10.y - o10.y, s10.x, s10.y] : ["L", s10.x, s10.y];
            return [["M", t10.x, t10.y], r10, ["L", o10.x, o10.y]];
          },
          straight: function(t10, e10) {
            let i10 = e10.touchingSliceAt;
            return [["M", t10.x, t10.y], ["L", i10.x, i10.y]];
          },
          crookedLine: function(t10, e10, i10) {
            let {
              angle: s10 = this.angle || 0,
              breakAt: o10,
              touchingSliceAt: r10
            } = e10, {
              series: a10
            } = this, [n10, h10, l10] = a10.center, d10 = l10 / 2, {
              plotLeft: c10,
              plotWidth: p10
            } = a10.chart, u10 = "left" === t10.alignment, {
              x: g2,
              y: f2
            } = t10, m2 = o10.x;
            if (i10.crookDistance) {
              let t11 = ln(i10.crookDistance, 1);
              m2 = u10 ? n10 + d10 + (p10 + c10 - n10 - d10) * (1 - t11) : c10 + (n10 - d10) * t11;
            } else m2 = n10 + (h10 - f2) * Math.tan(s10 - Math.PI / 2);
            let x2 = [["M", g2, f2]];
            return (u10 ? m2 <= g2 && m2 >= o10.x : m2 >= g2 && m2 <= o10.x) && x2.push(["L", m2, f2]), x2.push(["L", o10.x, o10.y], ["L", r10.x, r10.y]), x2;
          }
        }
      });
      let {
        getStartAndEndRadians: ll
      } = lt, {
        noop: ld
      } = V, {
        clamp: lc,
        extend: lp,
        fireEvent: lu,
        merge: lg,
        pick: lf
      } = tx;
      class lm extends ay {
        animate(t10) {
          let e10 = this, i10 = e10.points, s10 = e10.startAngleRad;
          t10 || i10.forEach(function(t11) {
            let i11 = t11.graphic, o10 = t11.shapeArgs;
            i11 && o10 && (i11.attr({
              r: lf(t11.startR, e10.center && e10.center[3] / 2),
              start: s10,
              end: s10
            }), i11.animate({
              r: o10.r,
              start: o10.start,
              end: o10.end
            }, e10.options.animation));
          });
        }
        drawEmpty() {
          let t10, e10, i10 = this.startAngleRad, s10 = this.endAngleRad, o10 = this.options;
          0 === this.total && this.center ? (t10 = this.center[0], e10 = this.center[1], this.graph || (this.graph = this.chart.renderer.arc(t10, e10, this.center[1] / 2, 0, i10, s10).addClass("highcharts-empty-series").add(this.group)), this.graph.attr({
            d: iC.arc(t10, e10, this.center[2] / 2, 0, {
              start: i10,
              end: s10,
              innerR: this.center[3] / 2
            })
          }), this.chart.styledMode || this.graph.attr({
            "stroke-width": o10.borderWidth,
            fill: o10.fillColor || "none",
            stroke: o10.color || "#cccccc"
          })) : this.graph && (this.graph = this.graph.destroy());
        }
        drawPoints() {
          let t10 = this.chart.renderer;
          this.points.forEach(function(e10) {
            e10.graphic && e10.hasNewShapeType() && (e10.graphic = e10.graphic.destroy()), e10.graphic || (e10.graphic = t10[e10.shapeType](e10.shapeArgs).add(e10.series.group), e10.delayedRendering = true);
          });
        }
        generatePoints() {
          super.generatePoints(), this.updateTotals();
        }
        getX(t10, e10, i10, s10) {
          let o10 = this.center, r10 = this.radii ? this.radii[i10.index] || 0 : o10[2] / 2, a10 = s10.dataLabelPosition, n10 = a10?.distance || 0, h10 = Math.asin(lc((t10 - o10[1]) / (r10 + n10), -1, 1));
          return o10[0] + Math.cos(h10) * (r10 + n10) * (e10 ? -1 : 1) + (n10 > 0 ? (e10 ? -1 : 1) * (s10.padding || 0) : 0);
        }
        hasData() {
          return this.points.some((t10) => t10.visible);
        }
        redrawPoints() {
          let t10, e10, i10, s10, o10 = this, r10 = o10.chart;
          this.drawEmpty(), o10.group && !r10.styledMode && o10.group.shadow(o10.options.shadow), o10.points.forEach(function(a10) {
            let n10 = {};
            e10 = a10.graphic, !a10.isNull && e10 ? (s10 = a10.shapeArgs, t10 = a10.getTranslate(), r10.styledMode || (i10 = o10.pointAttribs(a10, a10.selected && "select")), a10.delayedRendering ? (e10.setRadialReference(o10.center).attr(s10).attr(t10), r10.styledMode || e10.attr(i10).attr({
              "stroke-linejoin": "round"
            }), a10.delayedRendering = false) : (e10.setRadialReference(o10.center), r10.styledMode || lg(true, n10, i10), lg(true, n10, s10, t10), e10.animate(n10)), e10.attr({
              visibility: a10.visible ? "inherit" : "hidden"
            }), e10.addClass(a10.getClassName(), true)) : e10 && (a10.graphic = e10.destroy());
          });
        }
        sortByAngle(t10, e10) {
          t10.sort(function(t11, i10) {
            return void 0 !== t11.angle && (i10.angle - t11.angle) * e10;
          });
        }
        translate(t10) {
          lu(this, "translate"), this.generatePoints();
          let e10 = this.options, i10 = e10.slicedOffset, s10 = ll(e10.startAngle, e10.endAngle), o10 = this.startAngleRad = s10.start, r10 = (this.endAngleRad = s10.end) - o10, a10 = this.points, n10 = e10.ignoreHiddenPoint, h10 = a10.length, l10, d10, c10, p10, u10, g2, f2, m2 = 0;
          for (t10 || (this.center = t10 = this.getCenter()), g2 = 0; g2 < h10; g2++) {
            f2 = a10[g2], l10 = o10 + m2 * r10, f2.isValid() && (!n10 || f2.visible) && (m2 += f2.percentage / 100), d10 = o10 + m2 * r10;
            let e11 = {
              x: t10[0],
              y: t10[1],
              r: t10[2] / 2,
              innerR: t10[3] / 2,
              start: Math.round(1e3 * l10) / 1e3,
              end: Math.round(1e3 * d10) / 1e3
            };
            f2.shapeType = "arc", f2.shapeArgs = e11, (c10 = (d10 + l10) / 2) > 1.5 * Math.PI ? c10 -= 2 * Math.PI : c10 < -Math.PI / 2 && (c10 += 2 * Math.PI), f2.slicedTranslation = {
              translateX: Math.round(Math.cos(c10) * i10),
              translateY: Math.round(Math.sin(c10) * i10)
            }, p10 = Math.cos(c10) * t10[2] / 2, u10 = Math.sin(c10) * t10[2] / 2, f2.tooltipPos = [t10[0] + 0.7 * p10, t10[1] + 0.7 * u10], f2.half = +(c10 < -Math.PI / 2 || c10 > Math.PI / 2), f2.angle = c10;
          }
          lu(this, "afterTranslate");
        }
        updateTotals() {
          let t10 = this.points, e10 = t10.length, i10 = this.options.ignoreHiddenPoint, s10, o10, r10 = 0;
          for (s10 = 0; s10 < e10; s10++) (o10 = t10[s10]).isValid() && (!i10 || o10.visible) && (r10 += o10.y);
          for (s10 = 0, this.total = r10; s10 < e10; s10++) (o10 = t10[s10]).percentage = r10 > 0 && (o10.visible || !i10) ? o10.y / r10 * 100 : 0, o10.total = r10;
        }
      }
      lm.defaultOptions = lg(ay.defaultOptions, {
        borderRadius: 3,
        center: [null, null],
        clip: false,
        colorByPoint: true,
        dataLabels: {
          connectorPadding: 5,
          connectorShape: "crookedLine",
          crookDistance: void 0,
          distance: 30,
          enabled: true,
          formatter: function() {
            return this.isNull ? void 0 : this.name;
          },
          softConnector: true,
          x: 0
        },
        fillColor: void 0,
        ignoreHiddenPoint: true,
        inactiveOtherPoints: true,
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
        lineWidth: void 0,
        states: {
          hover: {
            brightness: 0.1
          }
        }
      }), lp(lm.prototype, {
        axisTypes: [],
        directTouch: true,
        drawGraph: void 0,
        drawTracker: hO.prototype.drawTracker,
        getCenter: lt.getCenter,
        getSymbol: ld,
        invertible: false,
        isCartesian: false,
        noSharedTooltip: true,
        pointAttribs: hO.prototype.pointAttribs,
        pointClass: lh,
        requireSorting: false,
        searchPoint: ld,
        trackerGroups: ["group", "dataLabelsGroup"]
      }), r_.registerSeriesType("pie", lm);
      let {
        composed: lx,
        noop: ly
      } = V, {
        distribute: lb
      } = eX, {
        series: lv
      } = r_, {
        arrayMax: lk,
        clamp: lM,
        defined: lw,
        isNumber: lS,
        pick: lA,
        pushUnique: lT,
        relativeLength: lC
      } = tx;
      !function(t10) {
        let e10 = {
          radialDistributionY: function(t11, e11) {
            return (e11.dataLabelPosition?.top || 0) + t11.distributeBox.pos;
          },
          radialDistributionX: function(t11, e11, i11, s11, o11) {
            let r11 = o11.dataLabelPosition;
            return t11.getX(i11 < (r11?.top || 0) + 2 || i11 > (r11?.bottom || 0) - 2 ? s11 : i11, e11.half, e11, o11);
          },
          justify: function(t11, e11, i11, s11) {
            return s11[0] + (t11.half ? -1 : 1) * (i11 + (e11.dataLabelPosition?.distance || 0));
          },
          alignToPlotEdges: function(t11, e11, i11, s11) {
            let o11 = t11.getBBox().width;
            return e11 ? o11 + s11 : i11 - o11 - s11;
          },
          alignToConnectors: function(t11, e11, i11, s11) {
            let o11 = 0, r11;
            return t11.forEach(function(t12) {
              (r11 = t12.dataLabel.getBBox().width) > o11 && (o11 = r11);
            }), e11 ? o11 + s11 : i11 - o11 - s11;
          }
        };
        function i10(t11, e11) {
          let i11 = Math.PI / 2, {
            start: s11 = 0,
            end: o11 = 0
          } = t11.shapeArgs || {}, r11 = t11.angle || 0;
          e11 > 0 && s11 < i11 && o11 > i11 && r11 > i11 / 2 && r11 < 1.5 * i11 && (r11 = r11 <= i11 ? Math.max(i11 / 2, (s11 + i11) / 2) : Math.min(1.5 * i11, (i11 + o11) / 2));
          let {
            center: a10,
            options: n10
          } = this, h10 = a10[2] / 2, l10 = Math.cos(r11), d10 = Math.sin(r11), c10 = a10[0] + l10 * h10, p10 = a10[1] + d10 * h10, u10 = Math.min((n10.slicedOffset || 0) + (n10.borderWidth || 0), e11 / 5);
          return {
            natural: {
              x: c10 + l10 * e11,
              y: p10 + d10 * e11
            },
            computed: {},
            alignment: e11 < 0 ? "center" : t11.half ? "right" : "left",
            connectorPosition: {
              angle: r11,
              breakAt: {
                x: c10 + l10 * u10,
                y: p10 + d10 * u10
              },
              touchingSliceAt: {
                x: c10,
                y: p10
              }
            },
            distance: e11
          };
        }
        function s10() {
          let t11 = this, e11 = t11.points, i11 = t11.chart, s11 = i11.plotWidth, o11 = i11.plotHeight, r11 = i11.plotLeft, a10 = Math.round(i11.chartWidth / 3), n10 = t11.center, h10 = n10[2] / 2, l10 = n10[1], d10 = [[], []], c10 = [0, 0, 0, 0], p10 = t11.dataLabelPositioners, u10, g2, f2, m2 = 0;
          t11.visible && t11.hasDataLabels?.() && (e11.forEach((t12) => {
            (t12.dataLabels || []).forEach((t13) => {
              t13.shortened && (t13.attr({
                width: "auto"
              }).css({
                width: "auto",
                textOverflow: "clip"
              }), t13.shortened = false);
            });
          }), lv.prototype.drawDataLabels.apply(t11), e11.forEach((t12) => {
            (t12.dataLabels || []).forEach((e12, i12) => {
              let s12 = n10[2] / 2, o12 = e12.options, r12 = lC(o12?.distance || 0, s12);
              0 === i12 && d10[t12.half].push(t12), !lw(o12?.style?.width) && e12.getBBox().width > a10 && (e12.css({
                width: Math.round(0.7 * a10) + "px"
              }), e12.shortened = true), e12.dataLabelPosition = this.getDataLabelPosition(t12, r12), m2 = Math.max(m2, r12);
            });
          }), d10.forEach((e12, a11) => {
            let d11 = e12.length, u11 = [], x2, y2, b2 = 0, v2;
            d11 && (t11.sortByAngle(e12, a11 - 0.5), m2 > 0 && (x2 = Math.max(0, l10 - h10 - m2), y2 = Math.min(l10 + h10 + m2, i11.plotHeight), e12.forEach((t12) => {
              (t12.dataLabels || []).forEach((e13) => {
                let s12 = e13.dataLabelPosition;
                s12 && s12.distance > 0 && (s12.top = Math.max(0, l10 - h10 - s12.distance), s12.bottom = Math.min(l10 + h10 + s12.distance, i11.plotHeight), b2 = e13.getBBox().height || 21, e13.lineHeight = i11.renderer.fontMetrics(e13.text || e13).h + 2 * e13.padding, t12.distributeBox = {
                  target: (e13.dataLabelPosition?.natural.y || 0) - s12.top + e13.lineHeight / 2,
                  size: b2,
                  rank: t12.y
                }, u11.push(t12.distributeBox));
              });
            }), lb(u11, v2 = y2 + b2 - x2, v2 / 5)), e12.forEach((i12) => {
              (i12.dataLabels || []).forEach((l11) => {
                let d12 = l11.options || {}, m3 = i12.distributeBox, x3 = l11.dataLabelPosition, y3 = x3?.natural.y || 0, b3 = d12.connectorPadding || 0, v3 = l11.lineHeight || 21, k2 = (v3 - l11.getBBox().height) / 2, M2 = 0, w2 = y3, S2 = "inherit";
                if (x3) {
                  if (u11 && lw(m3) && x3.distance > 0 && (void 0 === m3.pos ? S2 = "hidden" : (f2 = m3.size, w2 = p10.radialDistributionY(i12, l11))), d12.justify) M2 = p10.justify(i12, l11, h10, n10);
                  else switch (d12.alignTo) {
                    case "connectors":
                      M2 = p10.alignToConnectors(e12, a11, s11, r11);
                      break;
                    case "plotEdges":
                      M2 = p10.alignToPlotEdges(l11, a11, s11, r11);
                      break;
                    default:
                      M2 = p10.radialDistributionX(t11, i12, w2 - k2, y3, l11);
                  }
                  if (x3.attribs = {
                    visibility: S2,
                    align: x3.alignment
                  }, x3.posAttribs = {
                    x: M2 + (d12.x || 0) + ({
                      left: b3,
                      right: -b3
                    }[x3.alignment] || 0),
                    y: w2 + (d12.y || 0) - v3 / 2
                  }, x3.computed.x = M2, x3.computed.y = w2 - k2, lA(d12.crop, true)) {
                    let t12;
                    M2 - (g2 = l11.getBBox().width) < b3 && 1 === a11 ? (t12 = Math.round(g2 - M2 + b3), c10[3] = Math.max(t12, c10[3])) : M2 + g2 > s11 - b3 && 0 === a11 && (t12 = Math.round(M2 + g2 - s11 + b3), c10[1] = Math.max(t12, c10[1])), w2 - f2 / 2 < 0 ? c10[0] = Math.max(Math.round(-w2 + f2 / 2), c10[0]) : w2 + f2 / 2 > o11 && (c10[2] = Math.max(Math.round(w2 + f2 / 2 - o11), c10[2])), x3.sideOverflow = t12;
                  }
                }
              });
            }));
          }), (0 === lk(c10) || this.verifyDataLabelOverflow(c10)) && (this.placeDataLabels(), this.points.forEach((e12) => {
            e12.dataLabels?.forEach((s12, o12) => {
              let {
                connectorColor: r12,
                connectorWidth: a11 = 1
              } = s12.options || {}, n11 = s12.dataLabelPosition;
              if (lS(a11)) {
                let h11;
                u10 = s12.connector, n11 && n11.distance > 0 ? (h11 = !u10, u10 || (s12.connector = u10 = i11.renderer.path().addClass("highcharts-data-label-connector  highcharts-color-" + e12.colorIndex + (e12.className ? " " + e12.className : "")).add(t11.dataLabelsGroups?.[o12])), i11.styledMode || u10.attr({
                  "stroke-width": a11,
                  stroke: r12 || e12.color || "#666666"
                }), u10[h11 ? "attr" : "animate"]({
                  d: e12.getConnectorPath(s12)
                }), u10.attr({
                  visibility: n11.attribs?.visibility
                })) : u10 && (s12.connector = u10.destroy());
              }
            });
          })));
        }
        function o10() {
          this.points.forEach((t11) => {
            (t11.dataLabels || []).forEach((t12) => {
              let e11 = t12.dataLabelPosition;
              e11 ? (e11.sideOverflow && (t12.css({
                width: Math.max(t12.getBBox().width - e11.sideOverflow, 0) + "px",
                textOverflow: t12.options?.style?.textOverflow || "ellipsis"
              }), t12.shortened = true), t12.attr(e11.attribs), t12[t12.moved ? "animate" : "attr"](e11.posAttribs), t12.moved = true) : t12 && t12.attr({
                y: -9999
              });
            }), delete t11.distributeBox;
          }, this);
        }
        function r10(t11) {
          let e11 = this.center, i11 = this.options, s11 = i11.center, o11 = i11.minSize || 80, r11 = o11, a10 = null !== i11.size;
          return !a10 && (null !== s11[0] ? r11 = Math.max(e11[2] - Math.max(t11[1], t11[3]), o11) : (r11 = Math.max(e11[2] - t11[1] - t11[3], o11), e11[0] += (t11[3] - t11[1]) / 2), null !== s11[1] ? r11 = lM(r11, o11, e11[2] - Math.max(t11[0], t11[2])) : (r11 = lM(r11, o11, e11[2] - t11[0] - t11[2]), e11[1] += (t11[0] - t11[2]) / 2), r11 < e11[2] ? (e11[2] = r11, e11[3] = Math.min(i11.thickness ? Math.max(0, r11 - 2 * i11.thickness) : Math.max(0, lC(i11.innerSize || 0, r11)), r11), this.translate(e11), this.drawDataLabels && this.drawDataLabels()) : a10 = true), a10;
        }
        t10.compose = function(t11) {
          if (hY.compose(lv), lT(lx, "PieDataLabel")) {
            let a10 = t11.prototype;
            a10.dataLabelPositioners = e10, a10.alignDataLabel = ly, a10.drawDataLabels = s10, a10.getDataLabelPosition = i10, a10.placeDataLabels = o10, a10.verifyDataLabelOverflow = r10;
          }
        };
      }(z || (z = {}));
      let lP = z;
      (y = R || (R = {})).getCenterOfPoints = function(t10) {
        let e10 = t10.reduce((t11, e11) => (t11.x += e11.x, t11.y += e11.y, t11), {
          x: 0,
          y: 0
        });
        return {
          x: e10.x / t10.length,
          y: e10.y / t10.length
        };
      }, y.getDistanceBetweenPoints = function(t10, e10) {
        return Math.sqrt(Math.pow(e10.x - t10.x, 2) + Math.pow(e10.y - t10.y, 2));
      }, y.getAngleBetweenPoints = function(t10, e10) {
        return Math.atan2(e10.x - t10.x, e10.y - t10.y);
      }, y.pointInPolygon = function({
        x: t10,
        y: e10
      }, i10) {
        let s10 = i10.length, o10, r10, a10 = false;
        for (o10 = 0, r10 = s10 - 1; o10 < s10; r10 = o10++) {
          let [s11, n10] = i10[o10], [h10, l10] = i10[r10];
          n10 > e10 != l10 > e10 && t10 < (h10 - s11) * (e10 - n10) / (l10 - n10) + s11 && (a10 = !a10);
        }
        return a10;
      };
      let {
        pointInPolygon: lO
      } = R, {
        addEvent: lE,
        getAlignFactor: lL,
        fireEvent: lB,
        objectEach: lD,
        pick: lI
      } = tx;
      function lz(t10, e10) {
        let i10, s10 = false;
        return t10 && (i10 = t10.newOpacity, t10.oldOpacity !== i10 && (t10.hasClass("highcharts-data-label") ? (t10[i10 ? "removeClass" : "addClass"]("highcharts-data-label-hidden"), s10 = true, t10[t10.isOld ? "animate" : "attr"]({
          opacity: i10
        }, void 0, function() {
          e10.styledMode || t10.css({
            pointerEvents: i10 ? "auto" : "none"
          });
        }), lB(e10, "afterHideOverlappingLabel")) : t10.attr({
          opacity: i10
        })), t10.isOld = true), s10;
      }
      let {
        defaultOptions: lR
      } = tY, {
        noop: lN
      } = V, {
        addEvent: lW,
        extend: lG,
        isObject: lX,
        merge: lH,
        relativeLength: lF
      } = tx, lY = {
        radius: 0,
        scope: "stack",
        where: void 0
      }, lj = lN, lU = lN;
      function lV(t10, e10, i10, s10, o10 = {}) {
        let r10 = lj(t10, e10, i10, s10, o10), {
          brStart: a10 = true,
          brEnd: n10 = true,
          innerR: h10 = 0,
          r: l10 = i10,
          start: d10 = 0,
          end: c10 = 0
        } = o10;
        if (o10.open || !o10.borderRadius) return r10;
        let p10 = c10 - d10, u10 = Math.sin(p10 / 2), g2 = Math.max(Math.min(lF(o10.borderRadius || 0, l10 - h10), (l10 - h10) / 2, l10 * u10 / (1 + u10)), 0), f2 = Math.min(g2, p10 / Math.PI * 2 * h10), m2 = r10.length - 1;
        for (; m2--; ) (a10 || 0 !== m2 && 3 !== m2) && (n10 || 1 !== m2 && 2 !== m2) && !function(t11, e11, i11) {
          let s11, o11, r11, a11 = t11[e11], n11 = t11[e11 + 1];
          if ("Z" === n11[0] && (n11 = t11[0]), ("M" === a11[0] || "L" === a11[0]) && "A" === n11[0] ? (s11 = a11, o11 = n11, r11 = true) : "A" === a11[0] && ("M" === n11[0] || "L" === n11[0]) && (s11 = n11, o11 = a11), s11 && o11 && o11.params) {
            let a12 = o11[1], n12 = o11[5], h11 = o11.params, {
              start: l11,
              end: d11,
              cx: c11,
              cy: p11
            } = h11, u11 = n12 ? a12 - i11 : a12 + i11, g3 = u11 ? Math.asin(i11 / u11) : 0, f3 = n12 ? g3 : -g3, m3 = Math.cos(g3) * u11;
            r11 ? (h11.start = l11 + f3, s11[1] = c11 + m3 * Math.cos(l11), s11[2] = p11 + m3 * Math.sin(l11), t11.splice(e11 + 1, 0, ["A", i11, i11, 0, 0, 1, c11 + a12 * Math.cos(h11.start), p11 + a12 * Math.sin(h11.start)])) : (h11.end = d11 - f3, o11[6] = c11 + a12 * Math.cos(h11.end), o11[7] = p11 + a12 * Math.sin(h11.end), t11.splice(e11 + 1, 0, ["A", i11, i11, 0, 0, 1, c11 + m3 * Math.cos(d11), p11 + m3 * Math.sin(d11)])), o11[4] = Math.abs(h11.end - h11.start) < Math.PI ? 0 : 1;
          }
        }(r10, m2, m2 > 1 ? f2 : g2);
        return r10;
      }
      function l$() {
        if (this.options.borderRadius && !(this.chart.is3d && this.chart.is3d())) {
          let {
            options: t10,
            yAxis: e10
          } = this, i10 = "percent" === t10.stacking, s10 = lR.plotOptions?.[this.type]?.borderRadius, o10 = l_(t10.borderRadius, lX(s10) ? s10 : {}), r10 = e10.options.reversed;
          for (let s11 of this.points) {
            let {
              shapeArgs: a10
            } = s11;
            if ("roundedRect" === s11.shapeType && a10) {
              let {
                width: n10 = 0,
                height: h10 = 0,
                y: l10 = 0
              } = a10, d10 = l10, c10 = h10;
              if ("stack" === o10.scope && s11.stackTotal) {
                let o11 = e10.translate(i10 ? 100 : s11.stackTotal, false, true, false, true), r11 = e10.translate(t10.threshold || 0, false, true, false, true), a11 = this.crispCol(0, Math.min(o11, r11), 0, Math.abs(o11 - r11));
                d10 = a11.y, c10 = a11.height;
              }
              let p10 = (s11.negative ? -1 : 1) * (r10 ? -1 : 1) == -1, u10 = o10.where;
              !u10 && this.is("waterfall") && Math.abs((s11.yBottom || 0) - (this.translatedThreshold || 0)) > this.borderWidth && (u10 = "all"), u10 || (u10 = "end");
              let g2 = Math.min(lF(o10.radius, n10), n10 / 2, "all" === u10 ? h10 / 2 : 1 / 0) || 0;
              "end" === u10 && (p10 && (d10 -= g2), c10 += g2), lG(a10, {
                brBoxHeight: c10,
                brBoxY: d10,
                r: g2
              });
            }
          }
        }
      }
      function l_(t10, e10) {
        return lX(t10) || (t10 = {
          radius: t10 || 0
        }), lH(lY, e10, t10);
      }
      function lZ() {
        let t10 = l_(this.options.borderRadius);
        for (let e10 of this.points) {
          let i10 = e10.shapeArgs;
          i10 && (i10.borderRadius = lF(t10.radius, (i10.r || 0) - (i10.innerR || 0)));
        }
      }
      function lq(t10, e10, i10, s10, o10 = {}) {
        let r10 = lU(t10, e10, i10, s10, o10), {
          r: a10 = 0,
          brBoxHeight: n10 = s10,
          brBoxY: h10 = e10
        } = o10, l10 = e10 - h10, d10 = h10 + n10 - (e10 + s10), c10 = l10 - a10 > -0.1 ? 0 : a10, p10 = d10 - a10 > -0.1 ? 0 : a10, u10 = Math.max(c10 && l10, 0), g2 = Math.max(p10 && d10, 0), f2 = [t10 + c10, e10], m2 = [t10 + i10 - c10, e10], x2 = [t10 + i10, e10 + c10], y2 = [t10 + i10, e10 + s10 - p10], b2 = [t10 + i10 - p10, e10 + s10], v2 = [t10 + p10, e10 + s10], k2 = [t10, e10 + s10 - p10], M2 = [t10, e10 + c10], w2 = (t11, e11) => Math.sqrt(Math.pow(t11, 2) - Math.pow(e11, 2));
        if (u10) {
          let t11 = w2(c10, c10 - u10);
          f2[0] -= t11, m2[0] += t11, x2[1] = M2[1] = e10 + c10 - u10;
        }
        if (s10 < c10 - u10) {
          let o11 = w2(c10, c10 - u10 - s10);
          x2[0] = y2[0] = t10 + i10 - c10 + o11, b2[0] = Math.min(x2[0], b2[0]), v2[0] = Math.max(y2[0], v2[0]), k2[0] = M2[0] = t10 + c10 - o11, x2[1] = M2[1] = e10 + s10;
        }
        if (g2) {
          let t11 = w2(p10, p10 - g2);
          b2[0] += t11, v2[0] -= t11, y2[1] = k2[1] = e10 + s10 - p10 + g2;
        }
        if (s10 < p10 - g2) {
          let o11 = w2(p10, p10 - g2 - s10);
          x2[0] = y2[0] = t10 + i10 - p10 + o11, m2[0] = Math.min(x2[0], m2[0]), f2[0] = Math.max(y2[0], f2[0]), k2[0] = M2[0] = t10 + p10 - o11, y2[1] = k2[1] = e10;
        }
        return r10.length = 0, r10.push(["M", ...f2], ["L", ...m2], ["A", c10, c10, 0, 0, 1, ...x2], ["L", ...y2], ["A", p10, p10, 0, 0, 1, ...b2], ["L", ...v2], ["A", p10, p10, 0, 0, 1, ...k2], ["L", ...M2], ["A", c10, c10, 0, 0, 1, ...f2], ["Z"]), r10;
      }
      let {
        diffObjects: lK,
        extend: lJ,
        find: lQ,
        merge: l0,
        pick: l1,
        uniqueKey: l2
      } = tx;
      function l3(t10, e10) {
        let i10 = t10.condition;
        (i10.callback || function() {
          return this.chartWidth <= l1(i10.maxWidth, Number.MAX_VALUE) && this.chartHeight <= l1(i10.maxHeight, Number.MAX_VALUE) && this.chartWidth >= l1(i10.minWidth, 0) && this.chartHeight >= l1(i10.minHeight, 0);
        }).call(this) && e10.push(t10._id);
      }
      function l5(t10, e10) {
        let i10 = this.options.responsive, s10 = this.currentResponsive, o10 = [], r10;
        !e10 && i10 && i10.rules && i10.rules.forEach((t11) => {
          void 0 === t11._id && (t11._id = l2()), this.matchResponsiveRule(t11, o10);
        }, this);
        let a10 = l0(...o10.map((t11) => lQ(i10?.rules || [], (e11) => e11._id === t11)).map((t11) => t11?.chartOptions));
        a10.isResponsiveOptions = true, o10 = o10.toString() || void 0;
        let n10 = s10?.ruleIds;
        o10 !== n10 && (s10 && (this.currentResponsive = void 0, this.updatingResponsive = true, this.update(s10.undoOptions, t10, true), this.updatingResponsive = false), o10 ? ((r10 = lK(a10, this.options, true, this.collectionsWithUpdate)).isResponsiveOptions = true, this.currentResponsive = {
          ruleIds: o10,
          mergedOptions: a10,
          undoOptions: r10
        }, this.updatingResponsive || this.update(a10, t10, true)) : this.currentResponsive = void 0);
      }
      (N || (N = {})).compose = function(t10) {
        let e10 = t10.prototype;
        return e10.matchResponsiveRule || lJ(e10, {
          matchResponsiveRule: l3,
          setResponsive: l5
        }), t10;
      };
      let l6 = N;
      V.AST = ey, V.Axis = oo, V.Chart = ny, V.Color = tJ, V.DataLabel = hY, V.DataTableCore = rz, V.Fx = t3, V.HTMLElement = sx, V.Legend = aH, V.LegendSymbol = rH, V.PlotLineOrBand = oP, V.Point = rd, V.Pointer = rO, V.RendererRegistry = ez, V.Series = ay, V.SeriesRegistry = r_, V.StackItem = nW, V.SVGElement = ic, V.SVGRenderer = ss, V.Templating = eI, V.Tick = sN, V.Time = tN, V.Tooltip = o0, V.animate = eo.animate, V.animObject = eo.animObject, V.chart = ny.chart, V.color = tJ.parse, V.dateFormat = eI.dateFormat, V.defaultOptions = tY.defaultOptions, V.distribute = eX.distribute, V.format = eI.format, V.getDeferredAnimation = eo.getDeferredAnimation, V.getOptions = tY.getOptions, V.numberFormat = eI.numberFormat, V.seriesType = r_.seriesType, V.setAnimation = eo.setAnimation, V.setOptions = tY.setOptions, V.stop = eo.stop, V.time = tY.defaultTime, V.timers = t3.timers, {
        compose: function(t10, e10, i10) {
          let s10 = t10.types.pie;
          if (!e10.symbolCustomAttribs.includes("borderRadius")) {
            let o10 = i10.prototype.symbols;
            lW(t10, "afterColumnTranslate", l$, {
              order: 9
            }), lW(s10, "afterTranslate", lZ), e10.symbolCustomAttribs.push("borderRadius", "brBoxHeight", "brBoxY", "brEnd", "brStart"), lj = o10.arc, lU = o10.roundedRect, o10.arc = lV, o10.roundedRect = lq;
          }
        },
        optionsToObject: l_
      }.compose(V.Series, V.SVGElement, V.SVGRenderer), hZ.compose(V.Series.types.column), hY.compose(V.Series), ol.compose(V.Axis), sx.compose(V.SVGRenderer), aH.compose(V.Chart), ou.compose(V.Axis), (l = (b = V.Chart).prototype).hideOverlappingLabels || (l.hideOverlappingLabels = function(t10) {
        let e10 = t10.length, i10 = (t11, e11) => !(e11.x >= t11.x + t11.width || e11.x + e11.width <= t11.x || e11.y >= t11.y + t11.height || e11.y + e11.height <= t11.y), s10 = (t11, e11) => {
          for (let i11 of t11) if (lO({
            x: i11[0],
            y: i11[1]
          }, e11)) return true;
          return false;
        }, o10, r10, a10, n10, h10, l10 = false;
        for (let i11 = 0; i11 < e10; i11++) (o10 = t10[i11]) && (o10.oldOpacity = o10.opacity, o10.newOpacity = 1, o10.absoluteBox = function(t11) {
          if (t11 && (!t11.alignAttr || t11.placed)) {
            let e11 = t11.box ? 0 : t11.padding || 0, i12 = t11.alignAttr || {
              x: t11.attr("x"),
              y: t11.attr("y")
            }, {
              height: s11,
              polygon: o11,
              width: r11
            } = t11.getBBox(), a11 = lL(t11.alignValue) * r11;
            return t11.width = r11, t11.height = s11, {
              x: i12.x + (t11.parentGroup?.translateX || 0) + e11 - a11,
              y: i12.y + (t11.parentGroup?.translateY || 0) + e11,
              width: r11 - 2 * e11,
              height: s11 - 2 * e11,
              polygon: o11
            };
          }
        }(o10));
        t10.sort((t11, e11) => (e11?.labelrank || 0) - (t11?.labelrank || 0));
        for (let o11 = 0; o11 < e10; ++o11) {
          n10 = (r10 = t10[o11]) && r10.absoluteBox;
          let l11 = n10?.polygon;
          for (let d10 = o11 + 1; d10 < e10; ++d10) {
            h10 = (a10 = t10[d10]) && a10.absoluteBox;
            let e11 = false;
            if (n10 && h10 && r10 !== a10 && r10?.newOpacity !== 0 && a10?.newOpacity !== 0 && r10?.visibility !== "hidden" && a10?.visibility !== "hidden") {
              let t11 = h10.polygon;
              if (l11 && t11 && l11 !== t11 ? s10(l11, t11) && (e11 = true) : i10(n10, h10) && (e11 = true), e11) {
                let t12 = r10?.labelrank < a10?.labelrank ? r10 : a10, e12 = t12?.text;
                t12 && (t12.newOpacity = 0), e12?.element.querySelector("textPath") && e12.hide();
              }
            }
          }
        }
        for (let e11 of t10) e11 && lz(e11, this) && (l10 = true);
        l10 && lB(this, "afterHideAllOverlappingLabels");
      }, lE(b, "render", function() {
        let t10 = this, e10 = [];
        for (let i10 of t10.labelCollectors || []) e10 = e10.concat(i10());
        for (let i10 of t10.yAxis || []) i10.stacking && i10.options.stackLabels && !i10.options.stackLabels.allowOverlap && lD(i10.stacking.stacks, (t11) => {
          lD(t11, (t12) => {
            t12.label && e10.push(t12.label);
          });
        });
        for (let i10 of t10.series || []) if (i10.visible && i10.hasDataLabels?.()) {
          let s10 = (i11) => {
            for (let s11 of i11) s11.visible && (s11.dataLabels || []).forEach((i12) => {
              let o10 = i12.options || {};
              i12.labelrank = lI(o10.labelrank, s11.labelrank, s11.shapeArgs?.height), o10.allowOverlap ?? Number(o10.distance) > 0 ? (i12.oldOpacity = i12.opacity, i12.newOpacity = 1, lz(i12, t10)) : e10.push(i12);
            });
          };
          s10(i10.nodes || []), s10(i10.points);
        }
        this.hideOverlappingLabels(e10);
      })), lP.compose(V.Series.types.pie), oP.compose(V.Chart, V.Axis), rO.compose(V.Chart), l6.compose(V.Chart), nE.compose(V.Axis, V.Chart, V.Series), n5.compose(V.Axis, V.Chart, V.Series), o0.compose(V.Pointer), tx.extend(V, tx);
      let {
        tooltipFormatter: l9
      } = rd.prototype, {
        addEvent: l4,
        arrayMax: l8,
        arrayMin: l7,
        correctFloat: dt,
        defined: de,
        isArray: di,
        isNumber: ds,
        isString: dr,
        pick: da
      } = tx;
      !function(t10) {
        function e10(t11, e11, i11) {
          !this.isXAxis && (this.series.forEach(function(i12) {
            "compare" === t11 && "boolean" != typeof e11 ? i12.setCompare(e11, false) : "cumulative" !== t11 || dr(e11) || i12.setCumulative(e11, false);
          }), da(i11, true) && this.chart.redraw());
        }
        function i10(t11) {
          let e11 = this, {
            numberFormatter: i11
          } = e11.series.chart, s11 = function(s12) {
            t11 = t11.replace("{point." + s12 + "}", (e11[s12] > 0 && "change" === s12 ? "+" : "") + i11(e11[s12], da(e11.series.tooltipOptions.changeDecimals, 2)));
          };
          return de(e11.change) && s11("change"), de(e11.cumulativeSum) && s11("cumulativeSum"), l9.apply(this, [t11]);
        }
        function s10() {
          let t11, e11 = this.options.linkedTo, i11 = this.chart;
          if (e11) {
            let t12 = ":previous" === e11 ? i11.series[this.index - 1] : i11.get(e11);
            t12 instanceof ay && (this.options.compare = da(this.userOptions.compare, t12.options.compare));
          }
          let s11 = this.options.compare;
          ("percent" === s11 || "value" === s11 || this.options.cumulative) && (t11 = new d10(this), "percent" === s11 || "value" === s11 ? t11.initCompare(s11) : t11.initCumulative()), this.dataModify = t11;
        }
        function o10(t11) {
          let e11 = t11.dataExtremes, i11 = e11.activeYData;
          if (this.dataModify && e11) {
            let t12;
            this.options.compare ? t12 = [this.dataModify.modifyValue(e11.dataMin), this.dataModify.modifyValue(e11.dataMax)] : this.options.cumulative && di(i11) && i11.length >= 2 && (t12 = d10.getCumulativeExtremes(i11)), t12 && (e11.dataMin = l7(t12), e11.dataMax = l8(t12));
          }
        }
        function r10(t11, e11) {
          this.options.compare = this.userOptions.compare = t11, this.update({}, da(e11, true)), this.dataModify && ("value" === t11 || "percent" === t11) ? this.dataModify.initCompare(t11) : this.points.forEach((t12) => {
            delete t12.change;
          });
        }
        function a10() {
          let t11 = this.getColumn(this.pointArrayMap && (this.options.pointValKey || this.pointValKey) || "y", true);
          if (this.xAxis && t11.length && this.dataModify) {
            let e11 = this.getColumn("x", true), i11 = this.dataTable.rowCount, s11 = +(true !== this.options.compareStart);
            for (let o11 = 0; o11 < i11 - s11; o11++) {
              let i12 = t11[o11];
              if (ds(i12) && 0 !== i12 && e11[o11 + s11] >= (this.xAxis.min || 0)) {
                this.dataModify.compareValue = i12;
                break;
              }
            }
          }
        }
        function n10(t11, e11) {
          this.setModifier("compare", t11, e11);
        }
        function h10(t11, e11) {
          t11 = da(t11, false), this.options.cumulative = this.userOptions.cumulative = t11, this.update({}, da(e11, true)), this.dataModify ? this.dataModify.initCumulative() : this.points.forEach((t12) => {
            delete t12.cumulativeSum;
          });
        }
        function l10(t11, e11) {
          this.setModifier("cumulative", t11, e11);
        }
        t10.compose = function(t11, d11, c10) {
          let p10 = d11.prototype, u10 = c10.prototype, g2 = t11.prototype;
          return g2.setCompare || (g2.setCompare = r10, g2.setCumulative = h10, l4(t11, "afterInit", s10), l4(t11, "afterGetExtremes", o10), l4(t11, "afterProcessData", a10)), p10.setCompare || (p10.setCompare = n10, p10.setModifier = e10, p10.setCumulative = l10, u10.tooltipFormatter = i10), t11;
        };
        class d10 {
          constructor(t11) {
            this.series = t11;
          }
          modifyValue() {
            return 0;
          }
          static getCumulativeExtremes(t11) {
            let e11 = 1 / 0, i11 = -1 / 0;
            return t11.reduce((t12, s11) => {
              let o11 = t12 + s11;
              return e11 = Math.min(e11, o11, t12), i11 = Math.max(i11, o11, t12), o11;
            }), [e11, i11];
          }
          initCompare(t11) {
            this.modifyValue = function(e11, i11) {
              null === e11 && (e11 = 0);
              let s11 = this.compareValue;
              if (void 0 !== e11 && void 0 !== s11) {
                if ("value" === t11 ? e11 -= s11 : e11 = e11 / s11 * 100 - 100 * (100 !== this.series.options.compareBase), void 0 !== i11) {
                  let t12 = this.series.points[i11];
                  t12 && (t12.change = e11);
                }
                return e11;
              }
              return 0;
            };
          }
          initCumulative() {
            this.modifyValue = function(t11, e11) {
              if (null === t11 && (t11 = 0), void 0 !== t11 && void 0 !== e11) {
                let i11 = e11 > 0 ? this.series.points[e11 - 1] : null;
                i11 && i11.cumulativeSum && (t11 = dt(i11.cumulativeSum + t11));
                let s11 = this.series.points[e11], o11 = s11.series.options.cumulativeStart, r11 = s11.x <= this.series.xAxis.max && s11.x >= this.series.xAxis.min;
                return s11 && (!o11 || r11 ? s11.cumulativeSum = t11 : s11.cumulativeSum = void 0), t11;
              }
              return 0;
            };
          }
        }
        t10.Additions = d10;
      }(W || (W = {}));
      let dn = W, {
        isTouchDevice: dh
      } = V, {
        addEvent: dl,
        merge: dd,
        pick: dc
      } = tx, dp = [];
      function du() {
        this.navigator && this.navigator.setBaseSeries(null, false);
      }
      function dg() {
        let t10, e10, i10, s10 = this.legend, o10 = this.navigator;
        if (o10) {
          t10 = s10 && s10.options, e10 = o10.xAxis, i10 = o10.yAxis;
          let {
            scrollbarHeight: r10,
            scrollButtonSize: a10
          } = o10;
          this.inverted ? (o10.left = o10.opposite ? this.chartWidth - r10 - o10.height : this.spacing[3] + r10, o10.top = this.plotTop + a10) : (o10.left = dc(e10.left, this.plotLeft + a10), o10.top = o10.navigatorOptions.top || this.chartHeight - o10.height - r10 - (this.scrollbar?.options.margin || 0) - this.spacing[2] - (this.rangeSelector && this.extraBottomMargin ? this.rangeSelector.getHeight() : 0) - (t10 && "bottom" === t10.verticalAlign && "proximate" !== t10.layout && t10.enabled && !t10.floating ? s10.legendHeight + dc(t10.margin, 10) : 0) - (this.titleOffset ? this.titleOffset[2] : 0)), e10 && i10 && (this.inverted ? e10.options.left = i10.options.left = o10.left : e10.options.top = i10.options.top = o10.top, e10.setAxisSize(), i10.setAxisSize());
        }
      }
      function df(t10) {
        !this.navigator && !this.scroller && (this.options.navigator.enabled || this.options.scrollbar.enabled) && (this.scroller = this.navigator = new i(this), dc(t10.redraw, true) && this.redraw(t10.animation));
      }
      function dm() {
        let t10 = this.options;
        (t10.navigator.enabled || t10.scrollbar.enabled) && (this.scroller = this.navigator = new i(this));
      }
      function dx() {
        let t10 = this.options, e10 = t10.navigator, i10 = t10.rangeSelector;
        if ((e10 && e10.enabled || i10 && i10.enabled) && (!dh && "x" === this.zooming.type || dh && "x" === this.zooming.pinchType)) return false;
      }
      function dy(t10) {
        let e10 = t10.navigator;
        if (e10 && t10.xAxis[0]) {
          let i10 = t10.xAxis[0].getExtremes();
          e10.render(i10.min, i10.max);
        }
      }
      function db(t10) {
        let e10 = t10.options.navigator || {}, i10 = t10.options.scrollbar || {};
        !this.navigator && !this.scroller && (e10.enabled || i10.enabled) && (dd(true, this.options.navigator, e10), dd(true, this.options.scrollbar, i10), delete t10.options.navigator, delete t10.options.scrollbar);
      }
      let dv = function(t10, e10) {
        if (tx.pushUnique(dp, t10)) {
          let s10 = t10.prototype;
          i = e10, s10.callbacks.push(dy), dl(t10, "afterAddSeries", du), dl(t10, "afterSetChartSize", dg), dl(t10, "afterUpdate", df), dl(t10, "beforeRender", dm), dl(t10, "beforeShowResetZoom", dx), dl(t10, "update", db);
        }
      }, {
        isTouchDevice: dk
      } = V, {
        addEvent: dM,
        correctFloat: dw,
        defined: dS,
        isNumber: dA,
        pick: dT
      } = tx;
      function dC() {
        this.navigatorAxis || (this.navigatorAxis = new dO(this));
      }
      function dP(t10) {
        let e10, i10 = this.chart, s10 = i10.options, o10 = s10.navigator, r10 = this.navigatorAxis, a10 = i10.zooming.pinchType, n10 = s10.rangeSelector, h10 = i10.zooming.type;
        if (this.isXAxis && (o10?.enabled || n10?.enabled)) {
          if ("y" === h10 && "zoom" === t10.trigger) e10 = false;
          else if (("zoom" === t10.trigger && "xy" === h10 || dk && "xy" === a10) && this.options.range) {
            let e11 = r10.previousZoom;
            dS(t10.min) ? r10.previousZoom = [this.min, this.max] : e11 && (t10.min = e11[0], t10.max = e11[1], r10.previousZoom = void 0);
          }
        }
        void 0 !== e10 && t10.preventDefault();
      }
      class dO {
        static compose(t10) {
          t10.keepProps.includes("navigatorAxis") || (t10.keepProps.push("navigatorAxis"), dM(t10, "init", dC), dM(t10, "setExtremes", dP));
        }
        constructor(t10) {
          this.axis = t10;
        }
        destroy() {
          this.axis = void 0;
        }
        toFixedRange(t10, e10, i10, s10) {
          let o10 = this.axis, r10 = (o10.pointRange || 0) / 2, a10 = dT(i10, o10.translate(t10, true, !o10.horiz)), n10 = dT(s10, o10.translate(e10, true, !o10.horiz));
          return dS(i10) || (a10 = dw(a10 + r10)), dS(s10) || (n10 = dw(n10 - r10)), dA(a10) && dA(n10) || (a10 = n10 = void 0), {
            min: a10,
            max: n10
          };
        }
      }
      let {
        parse: dE
      } = tJ, {
        seriesTypes: dL
      } = r_, dB = {
        height: 40,
        margin: 22,
        maskInside: true,
        handles: {
          width: 7,
          borderRadius: 0,
          height: 15,
          symbols: ["navigator-handle", "navigator-handle"],
          enabled: true,
          lineWidth: 1,
          backgroundColor: "#f2f2f2",
          borderColor: "#999999"
        },
        maskFill: dE("#667aff").setOpacity(0.3).get(),
        outlineColor: "#999999",
        outlineWidth: 1,
        series: {
          type: void 0 === dL.areaspline ? "line" : "areaspline",
          fillOpacity: 0.05,
          lineWidth: 1,
          compare: null,
          sonification: {
            enabled: false
          },
          dataGrouping: {
            approximation: "average",
            enabled: true,
            groupPixelWidth: 2,
            firstAnchor: "firstPoint",
            anchor: "middle",
            lastAnchor: "lastPoint",
            units: [["millisecond", [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]], ["second", [1, 2, 5, 10, 15, 30]], ["minute", [1, 2, 5, 10, 15, 30]], ["hour", [1, 2, 3, 4, 6, 8, 12]], ["day", [1, 2, 3, 4]], ["week", [1, 2, 3]], ["month", [1, 3, 6]], ["year", null]]
          },
          dataLabels: {
            enabled: false,
            zIndex: 2
          },
          id: "highcharts-navigator-series",
          className: "highcharts-navigator-series",
          lineColor: null,
          marker: {
            enabled: false
          },
          threshold: null
        },
        xAxis: {
          className: "highcharts-navigator-xaxis",
          tickLength: 0,
          lineWidth: 0,
          gridLineColor: "#e6e6e6",
          id: "navigator-x-axis",
          gridLineWidth: 1,
          tickPixelInterval: 200,
          labels: {
            align: "left",
            style: {
              color: "#000000",
              fontSize: "0.7em",
              opacity: 0.6,
              textOutline: "2px contrast"
            },
            x: 3,
            y: -4
          },
          crosshair: false
        },
        yAxis: {
          className: "highcharts-navigator-yaxis",
          gridLineWidth: 0,
          startOnTick: false,
          endOnTick: false,
          minPadding: 0.1,
          id: "navigator-y-axis",
          maxPadding: 0.1,
          labels: {
            enabled: false
          },
          crosshair: false,
          title: {
            text: void 0
          },
          tickLength: 0,
          tickWidth: 0
        }
      }, {
        relativeLength: dD
      } = tx, dI = {
        "navigator-handle": function(t10, e10, i10, s10, o10 = {}) {
          let r10 = o10.width ? o10.width / 2 : i10, a10 = dD(o10.borderRadius || 0, Math.min(2 * r10, s10));
          return [["M", -1.5, (s10 = o10.height || s10) / 2 - 3.5], ["L", -1.5, s10 / 2 + 4.5], ["M", 0.5, s10 / 2 - 3.5], ["L", 0.5, s10 / 2 + 4.5], ...iC.rect(-r10 - 1, 0.5, 2 * r10 + 1, s10, {
            r: a10
          })];
        }
      }, {
        defined: dz
      } = tx, dR = {
        setFixedRange: function(t10) {
          let e10 = this.xAxis[0];
          dz(e10.dataMax) && dz(e10.dataMin) && t10 ? this.fixedRange = Math.min(t10, e10.dataMax - e10.dataMin) : this.fixedRange = t10;
        }
      }, {
        defaultOptions: dN
      } = tY, {
        composed: dW
      } = V, {
        getRendererType: dG
      } = ez, {
        setFixedRange: dX
      } = dR, {
        addEvent: dH,
        extend: dF,
        pushUnique: dY
      } = tx;
      function dj() {
        this.chart.navigator && !this.options.isInternal && this.chart.navigator.setBaseSeries(null, false);
      }
      let dU = function(t10, e10, i10) {
        dO.compose(e10), dY(dW, "Navigator") && (t10.prototype.setFixedRange = dX, dF(dG().prototype.symbols, dI), dF(dN, {
          navigator: dB
        }), dH(i10, "afterUpdate", dj));
      }, {
        composed: dV
      } = V, {
        addEvent: d$,
        correctFloat: d_,
        defined: dZ,
        pick: dq,
        pushUnique: dK
      } = tx;
      !function(t10) {
        let e10;
        function i10(t11) {
          let e11 = dq(t11.options?.min, t11.min), i11 = dq(t11.options?.max, t11.max);
          return {
            axisMin: e11,
            axisMax: i11,
            scrollMin: dZ(t11.dataMin) ? Math.min(e11, t11.min ?? 1 / 0, t11.dataMin, t11.threshold ?? 1 / 0) : e11,
            scrollMax: t11.treeGrid?.adjustedMax ?? (dZ(t11.dataMax) ? Math.max(i11, t11.max ?? -1 / 0, t11.dataMax, t11.threshold ?? -1 / 0) : i11)
          };
        }
        function s10() {
          let t11 = this.scrollbar, e11 = t11 && !t11.options.opposite, i11 = this.horiz ? 2 : e11 ? 3 : 1;
          t11 && (this.chart.scrollbarsOffsets = [0, 0], this.chart.axisOffset[i11] += t11.size + (t11.options.margin || 0));
        }
        function o10() {
          let t11 = this;
          t11.options?.scrollbar?.enabled && (t11.options.scrollbar.vertical = !t11.horiz, t11.options.startOnTick = t11.options.endOnTick = false, t11.scrollbar = new e10(t11.chart.renderer, t11.options.scrollbar, t11.chart), d$(t11.scrollbar, "changed", function(e11) {
            let s11, o11, {
              axisMin: r11,
              axisMax: a10,
              scrollMin: n10,
              scrollMax: h10
            } = i10(t11), l10 = t11.toPixels(n10), d10 = t11.toPixels(h10) - l10;
            if (dZ(r11) && dZ(a10)) if (t11.horiz && !t11.reversed || !t11.horiz && t11.reversed ? (s11 = Math.min(h10, t11.toValue(l10 + d10 * this.to)), o11 = Math.max(n10, t11.toValue(l10 + d10 * this.from))) : (s11 = Math.min(h10, t11.toValue(l10 + d10 * (1 - this.from))), o11 = Math.max(n10, t11.toValue(l10 + d10 * (1 - this.to)))), this.shouldUpdateExtremes(e11.DOMType)) {
              let i11 = "mousemove" !== e11.DOMType && "touchmove" !== e11.DOMType && void 0;
              t11.setExtremes(d_(o11), d_(s11), true, i11, e11);
            } else this.setRange(this.from, this.to);
          }));
        }
        function r10() {
          let t11, e11, s11, {
            scrollMin: o11,
            scrollMax: r11
          } = i10(this), a10 = this.scrollbar, n10 = (this.axisTitleMargin || 0) + (this.titleOffset || 0), h10 = this.chart.scrollbarsOffsets, l10 = this.options.margin || 0;
          if (a10 && h10) {
            if (this.horiz) this.opposite || (h10[1] += n10), a10.position(this.left, this.top + this.height + 2 + h10[1] - (this.opposite ? l10 : 0), this.width, this.height), this.opposite || (h10[1] += l10), t11 = 1;
            else {
              let e12;
              this.opposite && (h10[0] += n10), e12 = a10.options.opposite ? this.left + this.width + 2 + h10[0] - (this.opposite ? 0 : l10) : this.opposite ? 0 : l10, a10.position(e12, this.top, this.width, this.height), this.opposite && (h10[0] += l10), t11 = 0;
            }
            if (h10[t11] += a10.size + (a10.options.margin || 0), isNaN(o11) || isNaN(r11) || !dZ(this.min) || !dZ(this.max) || dZ(this.dataMin) && this.dataMin === this.dataMax) a10.setRange(0, 1);
            else if (this.min === this.max) {
              let t12 = this.pointRange / (this.dataMax + 1);
              e11 = t12 * this.min, s11 = t12 * (this.max + 1), a10.setRange(e11, s11);
            } else e11 = (this.toPixels(this.min) - this.toPixels(o11)) / (this.toPixels(r11) - this.toPixels(o11)), s11 = (this.toPixels(this.max) - this.toPixels(o11)) / (this.toPixels(r11) - this.toPixels(o11)), this.horiz && !this.reversed || !this.horiz && this.reversed ? a10.setRange(e11, s11) : a10.setRange(1 - s11, 1 - e11);
          }
        }
        t10.compose = function(t11, i11) {
          dK(dV, "Axis.Scrollbar") && (e10 = i11, d$(t11, "afterGetOffset", s10), d$(t11, "afterInit", o10), d$(t11, "afterRender", r10));
        };
      }(G || (G = {}));
      let dJ = G, dQ = {
        height: 10,
        barBorderRadius: 5,
        buttonBorderRadius: 0,
        buttonsEnabled: false,
        liveRedraw: void 0,
        margin: void 0,
        minWidth: 6,
        opposite: true,
        step: 0.2,
        zIndex: 3,
        barBackgroundColor: "#cccccc",
        barBorderWidth: 0,
        barBorderColor: "#cccccc",
        buttonArrowColor: "#333333",
        buttonBackgroundColor: "#e6e6e6",
        buttonBorderColor: "#cccccc",
        buttonBorderWidth: 1,
        rifleColor: "none",
        trackBackgroundColor: "rgba(255, 255, 255, 0.001)",
        trackBorderColor: "#cccccc",
        trackBorderRadius: 5,
        trackBorderWidth: 1
      }, {
        defaultOptions: d0
      } = tY, {
        composed: d1
      } = V, {
        addEvent: d2,
        correctFloat: d3,
        crisp: d5,
        defined: d6,
        destroyObjectProperties: d9,
        extend: d4,
        fireEvent: d8,
        merge: d7,
        pick: ct,
        pushUnique: ce,
        removeEvent: ci
      } = tx;
      class cs {
        static compose(t10) {
          dJ.compose(t10, cs), ce(d1, "Scrollbar") && d4(d0, {
            scrollbar: dQ
          });
        }
        static swapXY(t10, e10) {
          return e10 && t10.forEach((t11) => {
            let e11, i10 = t11.length;
            for (let s10 = 0; s10 < i10; s10 += 2) "number" == typeof (e11 = t11[s10 + 1]) && (t11[s10 + 1] = t11[s10 + 2], t11[s10 + 2] = e11);
          }), t10;
        }
        constructor(t10, e10, i10) {
          this._events = [], this.chartX = 0, this.chartY = 0, this.from = 0, this.scrollbarButtons = [], this.scrollbarLeft = 0, this.scrollbarStrokeWidth = 1, this.scrollbarTop = 0, this.size = 0, this.to = 0, this.trackBorderWidth = 1, this.x = 0, this.y = 0, this.init(t10, e10, i10);
        }
        addEvents() {
          let t10 = this.options.inverted ? [1, 0] : [0, 1], e10 = this.scrollbarButtons, i10 = this.scrollbarGroup.element, s10 = this.track.element, o10 = this.mouseDownHandler.bind(this), r10 = this.mouseMoveHandler.bind(this), a10 = this.mouseUpHandler.bind(this), n10 = [[e10[t10[0]].element, "click", this.buttonToMinClick.bind(this)], [e10[t10[1]].element, "click", this.buttonToMaxClick.bind(this)], [s10, "click", this.trackClick.bind(this)], [i10, "mousedown", o10], [i10.ownerDocument, "mousemove", r10], [i10.ownerDocument, "mouseup", a10], [i10, "touchstart", o10], [i10.ownerDocument, "touchmove", r10], [i10.ownerDocument, "touchend", a10]];
          n10.forEach(function(t11) {
            d2.apply(null, t11);
          }), this._events = n10;
        }
        buttonToMaxClick(t10) {
          let e10 = (this.to - this.from) * ct(this.options.step, 0.2);
          this.updatePosition(this.from + e10, this.to + e10), d8(this, "changed", {
            from: this.from,
            to: this.to,
            trigger: "scrollbar",
            DOMEvent: t10
          });
        }
        buttonToMinClick(t10) {
          let e10 = d3(this.to - this.from) * ct(this.options.step, 0.2);
          this.updatePosition(d3(this.from - e10), d3(this.to - e10)), d8(this, "changed", {
            from: this.from,
            to: this.to,
            trigger: "scrollbar",
            DOMEvent: t10
          });
        }
        cursorToScrollbarPosition(t10) {
          let e10 = this.options, i10 = e10.minWidth > this.calculatedWidth ? e10.minWidth : 0;
          return {
            chartX: (t10.chartX - this.x - this.xOffset) / (this.barWidth - i10),
            chartY: (t10.chartY - this.y - this.yOffset) / (this.barWidth - i10)
          };
        }
        destroy() {
          let t10 = this, e10 = t10.chart.scroller;
          t10.removeEvents(), ["track", "scrollbarRifles", "scrollbar", "scrollbarGroup", "group"].forEach(function(e11) {
            t10[e11] && t10[e11].destroy && (t10[e11] = t10[e11].destroy());
          }), e10 && t10 === e10.scrollbar && (e10.scrollbar = null, d9(e10.scrollbarButtons));
        }
        drawScrollbarButton(t10) {
          let e10 = this.renderer, i10 = this.scrollbarButtons, s10 = this.options, o10 = this.size, r10 = e10.g().add(this.group);
          if (i10.push(r10), s10.buttonsEnabled) {
            let a10 = e10.rect().addClass("highcharts-scrollbar-button").add(r10);
            this.chart.styledMode || a10.attr({
              stroke: s10.buttonBorderColor,
              "stroke-width": s10.buttonBorderWidth,
              fill: s10.buttonBackgroundColor
            }), a10.attr(a10.crisp({
              x: -0.5,
              y: -0.5,
              width: o10,
              height: o10,
              r: s10.buttonBorderRadius
            }, a10.strokeWidth()));
            let n10 = e10.path(cs.swapXY([["M", o10 / 2 + (t10 ? -1 : 1), o10 / 2 - 3], ["L", o10 / 2 + (t10 ? -1 : 1), o10 / 2 + 3], ["L", o10 / 2 + (t10 ? 2 : -2), o10 / 2]], s10.vertical)).addClass("highcharts-scrollbar-arrow").add(i10[t10]);
            this.chart.styledMode || n10.attr({
              fill: s10.buttonArrowColor
            });
          }
        }
        init(t10, e10, i10) {
          this.scrollbarButtons = [], this.renderer = t10, this.userOptions = e10, this.options = d7(dQ, d0.scrollbar, e10), this.options.margin = ct(this.options.margin, 10), this.chart = i10, this.size = ct(this.options.size, this.options.height), e10.enabled && (this.render(), this.addEvents());
        }
        mouseDownHandler(t10) {
          let e10 = this.chart.pointer?.normalize(t10) || t10, i10 = this.cursorToScrollbarPosition(e10);
          this.chartX = i10.chartX, this.chartY = i10.chartY, this.initPositions = [this.from, this.to], this.grabbedCenter = true;
        }
        mouseMoveHandler(t10) {
          let e10, i10 = this.chart.pointer?.normalize(t10) || t10, s10 = this.options.vertical ? "chartY" : "chartX", o10 = this.initPositions || [];
          this.grabbedCenter && (!t10.touches || 0 !== t10.touches[0][s10]) && (e10 = this.cursorToScrollbarPosition(i10)[s10] - this[s10], this.hasDragged = true, this.updatePosition(o10[0] + e10, o10[1] + e10), this.hasDragged && d8(this, "changed", {
            from: this.from,
            to: this.to,
            trigger: "scrollbar",
            DOMType: t10.type,
            DOMEvent: t10
          }));
        }
        mouseUpHandler(t10) {
          this.hasDragged && d8(this, "changed", {
            from: this.from,
            to: this.to,
            trigger: "scrollbar",
            DOMType: t10.type,
            DOMEvent: t10
          }), this.grabbedCenter = this.hasDragged = this.chartX = this.chartY = null;
        }
        position(t10, e10, i10, s10) {
          let {
            buttonsEnabled: o10,
            margin: r10 = 0,
            vertical: a10
          } = this.options, n10 = this.rendered ? "animate" : "attr", h10 = s10, l10 = 0;
          this.group.show(), this.x = t10, this.y = e10 + this.trackBorderWidth, this.width = i10, this.height = s10, this.xOffset = h10, this.yOffset = l10, a10 ? (this.width = this.yOffset = i10 = l10 = this.size, this.xOffset = h10 = 0, this.yOffset = l10 = o10 ? this.size : 0, this.barWidth = s10 - (o10 ? 2 * i10 : 0), this.x = t10 += r10) : (this.height = s10 = this.size, this.xOffset = h10 = o10 ? this.size : 0, this.barWidth = i10 - (o10 ? 2 * s10 : 0), this.y = this.y + r10), this.group[n10]({
            translateX: t10,
            translateY: this.y
          }), this.track[n10]({
            width: i10,
            height: s10
          }), this.scrollbarButtons[1][n10]({
            translateX: a10 ? 0 : i10 - h10,
            translateY: a10 ? s10 - l10 : 0
          });
        }
        removeEvents() {
          this._events.forEach(function(t10) {
            ci.apply(null, t10);
          }), this._events.length = 0;
        }
        render() {
          let t10 = this.renderer, e10 = this.options, i10 = this.size, s10 = this.chart.styledMode, o10 = t10.g("scrollbar").attr({
            zIndex: e10.zIndex
          }).hide().add();
          this.group = o10, this.track = t10.rect().addClass("highcharts-scrollbar-track").attr({
            r: e10.trackBorderRadius || 0,
            height: i10,
            width: i10
          }).add(o10), s10 || this.track.attr({
            fill: e10.trackBackgroundColor,
            stroke: e10.trackBorderColor,
            "stroke-width": e10.trackBorderWidth
          });
          let r10 = this.trackBorderWidth = this.track.strokeWidth();
          this.track.attr({
            x: -d5(0, r10),
            y: -d5(0, r10)
          }), this.scrollbarGroup = t10.g().add(o10), this.scrollbar = t10.rect().addClass("highcharts-scrollbar-thumb").attr({
            height: i10 - r10,
            width: i10 - r10,
            r: e10.barBorderRadius || 0
          }).add(this.scrollbarGroup), this.scrollbarRifles = t10.path(cs.swapXY([["M", -3, i10 / 4], ["L", -3, 2 * i10 / 3], ["M", 0, i10 / 4], ["L", 0, 2 * i10 / 3], ["M", 3, i10 / 4], ["L", 3, 2 * i10 / 3]], e10.vertical)).addClass("highcharts-scrollbar-rifles").add(this.scrollbarGroup), s10 || (this.scrollbar.attr({
            fill: e10.barBackgroundColor,
            stroke: e10.barBorderColor,
            "stroke-width": e10.barBorderWidth
          }), this.scrollbarRifles.attr({
            stroke: e10.rifleColor,
            "stroke-width": 1
          })), this.scrollbarStrokeWidth = this.scrollbar.strokeWidth(), this.scrollbarGroup.translate(-d5(0, this.scrollbarStrokeWidth), -d5(0, this.scrollbarStrokeWidth)), this.drawScrollbarButton(0), this.drawScrollbarButton(1);
        }
        setRange(t10, e10) {
          let i10, s10, o10 = this.options, r10 = o10.vertical, a10 = o10.minWidth, n10 = this.barWidth, h10 = !this.rendered || this.hasDragged || this.chart.navigator && this.chart.navigator.hasDragged ? "attr" : "animate";
          if (!d6(n10)) return;
          let l10 = n10 * Math.min(e10, 1);
          i10 = Math.ceil(n10 * (t10 = Math.max(t10, 0))), this.calculatedWidth = s10 = d3(l10 - i10), s10 < a10 && (i10 = (n10 - a10 + s10) * t10, s10 = a10);
          let d10 = Math.floor(i10 + this.xOffset + this.yOffset), c10 = s10 / 2 - 0.5;
          this.from = t10, this.to = e10, r10 ? (this.scrollbarGroup[h10]({
            translateY: d10
          }), this.scrollbar[h10]({
            height: s10
          }), this.scrollbarRifles[h10]({
            translateY: c10
          }), this.scrollbarTop = d10, this.scrollbarLeft = 0) : (this.scrollbarGroup[h10]({
            translateX: d10
          }), this.scrollbar[h10]({
            width: s10
          }), this.scrollbarRifles[h10]({
            translateX: c10
          }), this.scrollbarLeft = d10, this.scrollbarTop = 0), s10 <= 12 ? this.scrollbarRifles.hide() : this.scrollbarRifles.show(), false === o10.showFull && (t10 <= 0 && e10 >= 1 ? this.group.hide() : this.group.show()), this.rendered = true;
        }
        shouldUpdateExtremes(t10) {
          return ct(this.options.liveRedraw, V.svg && !V.isTouchDevice && !this.chart.boosted) || "mouseup" === t10 || "touchend" === t10 || !d6(t10);
        }
        trackClick(t10) {
          let e10 = this.chart.pointer?.normalize(t10) || t10, i10 = this.to - this.from, s10 = this.y + this.scrollbarTop, o10 = this.x + this.scrollbarLeft;
          this.options.vertical && e10.chartY > s10 || !this.options.vertical && e10.chartX > o10 ? this.updatePosition(this.from + i10, this.to + i10) : this.updatePosition(this.from - i10, this.to - i10), d8(this, "changed", {
            from: this.from,
            to: this.to,
            trigger: "scrollbar",
            DOMEvent: t10
          });
        }
        update(t10) {
          this.destroy(), this.init(this.chart.renderer, d7(true, this.options, t10), this.chart);
        }
        updatePosition(t10, e10) {
          e10 > 1 && (t10 = d3(1 - d3(e10 - t10)), e10 = 1), t10 < 0 && (e10 = d3(e10 - t10), t10 = 0), this.from = t10, this.to = e10;
        }
      }
      cs.defaultOptions = dQ;
      let {
        defaultOptions: co
      } = tY, {
        isTouchDevice: cr
      } = V, {
        prototype: {
          symbols: ca
        }
      } = ss, {
        addEvent: cn,
        clamp: ch,
        correctFloat: cl,
        defined: cd,
        destroyObjectProperties: cc,
        erase: cp,
        extend: cu,
        find: cg,
        fireEvent: cf,
        isArray: cm,
        isNumber: cx,
        merge: cy,
        pick: cb,
        removeEvent: cv,
        splat: ck
      } = tx;
      function cM(t10, ...e10) {
        let i10 = [].filter.call(e10, cx);
        if (i10.length) return Math[t10].apply(0, i10);
      }
      class cw {
        static compose(t10, e10, i10) {
          dv(t10, cw), dU(t10, e10, i10);
        }
        constructor(t10) {
          this.isDirty = false, this.scrollbarHeight = 0, this.init(t10);
        }
        drawHandle(t10, e10, i10, s10) {
          let o10 = this.navigatorOptions.handles.height;
          this.handles[e10][s10](i10 ? {
            translateX: Math.round(this.left + this.height / 2),
            translateY: Math.round(this.top + parseInt(t10, 10) + 0.5 - o10)
          } : {
            translateX: Math.round(this.left + parseInt(t10, 10)),
            translateY: Math.round(this.top + this.height / 2 - o10 / 2 - 1)
          });
        }
        drawOutline(t10, e10, i10, s10) {
          let o10 = this.navigatorOptions.maskInside, r10 = this.outline.strokeWidth(), a10 = r10 / 2, n10 = r10 % 2 / 2, h10 = this.scrollButtonSize, l10 = this.size, d10 = this.top, c10 = this.height, p10 = d10 - a10, u10 = d10 + c10, g2 = this.left, f2, m2;
          i10 ? (f2 = d10 + e10 + n10, e10 = d10 + t10 + n10, m2 = [["M", g2 + c10, d10 - h10 - n10], ["L", g2 + c10, f2], ["L", g2, f2], ["M", g2, e10], ["L", g2 + c10, e10], ["L", g2 + c10, d10 + l10 + h10]], o10 && m2.push(["M", g2 + c10, f2 - a10], ["L", g2 + c10, e10 + a10])) : (g2 -= h10, t10 += g2 + h10 - n10, e10 += g2 + h10 - n10, m2 = [["M", g2, p10], ["L", t10, p10], ["L", t10, u10], ["M", e10, u10], ["L", e10, p10], ["L", g2 + l10 + 2 * h10, p10]], o10 && m2.push(["M", t10 - a10, p10], ["L", e10 + a10, p10])), this.outline[s10]({
            d: m2
          });
        }
        drawMasks(t10, e10, i10, s10) {
          let o10, r10, a10, n10, h10 = this.left, l10 = this.top, d10 = this.height;
          i10 ? (a10 = [h10, h10, h10], n10 = [l10, l10 + t10, l10 + e10], r10 = [d10, d10, d10], o10 = [t10, e10 - t10, this.size - e10]) : (a10 = [h10, h10 + t10, h10 + e10], n10 = [l10, l10, l10], r10 = [t10, e10 - t10, this.size - e10], o10 = [d10, d10, d10]), this.shades.forEach((t11, e11) => {
            t11[s10]({
              x: a10[e11],
              y: n10[e11],
              width: r10[e11],
              height: o10[e11]
            });
          });
        }
        renderElements() {
          let t10 = this, e10 = t10.navigatorOptions, i10 = e10.maskInside, s10 = t10.chart, o10 = s10.inverted, r10 = s10.renderer, a10 = {
            cursor: o10 ? "ns-resize" : "ew-resize"
          }, n10 = t10.navigatorGroup ?? (t10.navigatorGroup = r10.g("navigator").attr({
            zIndex: 8,
            visibility: "hidden"
          }).add());
          if ([!i10, i10, !i10].forEach((i11, o11) => {
            let h10 = t10.shades[o11] ?? (t10.shades[o11] = r10.rect().addClass("highcharts-navigator-mask" + (1 === o11 ? "-inside" : "-outside")).add(n10));
            s10.styledMode || (h10.attr({
              fill: i11 ? e10.maskFill : "rgba(0,0,0,0)"
            }), 1 === o11 && h10.css(a10));
          }), t10.outline || (t10.outline = r10.path().addClass("highcharts-navigator-outline").add(n10)), s10.styledMode || t10.outline.attr({
            "stroke-width": e10.outlineWidth,
            stroke: e10.outlineColor
          }), e10.handles?.enabled) {
            let i11 = e10.handles, {
              height: o11,
              width: h10
            } = i11;
            [0, 1].forEach((e11) => {
              let l10 = i11.symbols[e11];
              if (t10.handles[e11] && t10.handles[e11].symbolUrl === l10) {
                if (!t10.handles[e11].isImg && t10.handles[e11].symbolName !== l10) {
                  let i12 = ca[l10].call(ca, -h10 / 2 - 1, 0, h10, o11);
                  t10.handles[e11].attr({
                    d: i12
                  }), t10.handles[e11].symbolName = l10;
                }
              } else t10.handles[e11]?.destroy(), t10.handles[e11] = r10.symbol(l10, -h10 / 2 - 1, 0, h10, o11, i11), t10.handles[e11].attr({
                zIndex: 7 - e11
              }).addClass("highcharts-navigator-handle highcharts-navigator-handle-" + ["left", "right"][e11]).add(n10), t10.addMouseEvents();
              s10.inverted && t10.handles[e11].attr({
                rotation: 90,
                rotationOriginX: Math.floor(-h10 / 2),
                rotationOriginY: (o11 + h10) / 2
              }), s10.styledMode || t10.handles[e11].attr({
                fill: i11.backgroundColor,
                stroke: i11.borderColor,
                "stroke-width": i11.lineWidth,
                width: i11.width,
                height: i11.height,
                x: -h10 / 2 - 1,
                y: 0
              }).css(a10);
            });
          }
        }
        update(t10, e10 = false) {
          let i10 = this.chart, s10 = i10.options.chart.inverted !== i10.scrollbar?.options.vertical;
          if (cy(true, i10.options.navigator, t10), this.navigatorOptions = i10.options.navigator || {}, this.setOpposite(), cd(t10.enabled) || s10) return this.destroy(), this.navigatorEnabled = t10.enabled || this.navigatorEnabled, this.init(i10);
          if (this.navigatorEnabled && (this.isDirty = true, false === t10.adaptToUpdatedData && this.baseSeries.forEach((t11) => {
            cv(t11, "updatedData", this.updatedDataHandler);
          }, this), t10.adaptToUpdatedData && this.baseSeries.forEach((t11) => {
            t11.eventsToUnbind.push(cn(t11, "updatedData", this.updatedDataHandler));
          }, this), (t10.series || t10.baseSeries) && this.setBaseSeries(void 0, false), t10.height || t10.xAxis || t10.yAxis)) {
            this.height = t10.height ?? this.height;
            let e11 = this.getXAxisOffsets();
            this.xAxis.update(__spreadProps(__spreadValues({}, t10.xAxis), {
              offsets: e11,
              [i10.inverted ? "width" : "height"]: this.height,
              [i10.inverted ? "height" : "width"]: void 0
            }), false), this.yAxis.update(__spreadProps(__spreadValues({}, t10.yAxis), {
              [i10.inverted ? "width" : "height"]: this.height
            }), false);
          }
          e10 && i10.redraw();
        }
        render(t10, e10, i10, s10) {
          let o10 = this.chart, r10 = this.xAxis, a10 = r10.pointRange || 0, n10 = r10.navigatorAxis.fake ? o10.xAxis[0] : r10, h10 = this.navigatorEnabled, l10 = this.rendered, d10 = o10.inverted, c10 = o10.xAxis[0].minRange, p10 = o10.xAxis[0].options.maxRange, u10 = this.scrollButtonSize, g2, f2, m2, x2 = this.scrollbarHeight, y2, b2;
          if (this.hasDragged && !cd(i10)) return;
          if (this.isDirty && this.renderElements(), t10 = cl(t10 - a10 / 2), e10 = cl(e10 + a10 / 2), !cx(t10) || !cx(e10)) if (!l10) return;
          else i10 = 0, s10 = cb(r10.width, n10.width);
          this.left = cb(r10.left, o10.plotLeft + u10 + (d10 ? o10.plotWidth : 0));
          let v2 = this.size = y2 = cb(r10.len, (d10 ? o10.plotHeight : o10.plotWidth) - 2 * u10);
          g2 = d10 ? x2 : y2 + 2 * u10, i10 = cb(i10, r10.toPixels(t10, true)), s10 = cb(s10, r10.toPixels(e10, true)), cx(i10) && Math.abs(i10) !== 1 / 0 || (i10 = 0, s10 = g2);
          let k2 = r10.toValue(i10, true), M2 = r10.toValue(s10, true), w2 = Math.abs(cl(M2 - k2));
          w2 < c10 ? this.grabbedLeft ? i10 = r10.toPixels(M2 - c10 - a10, true) : this.grabbedRight && (s10 = r10.toPixels(k2 + c10 + a10, true)) : cd(p10) && cl(w2 - a10) > p10 && (this.grabbedLeft ? i10 = r10.toPixels(M2 - p10 - a10, true) : this.grabbedRight && (s10 = r10.toPixels(k2 + p10 + a10, true))), this.zoomedMax = ch(Math.max(i10, s10), 0, v2), this.zoomedMin = ch(this.fixedWidth ? this.zoomedMax - this.fixedWidth : Math.min(i10, s10), 0, v2), this.range = this.zoomedMax - this.zoomedMin, v2 = Math.round(this.zoomedMax);
          let S2 = Math.round(this.zoomedMin);
          h10 && (this.navigatorGroup.attr({
            visibility: "inherit"
          }), b2 = l10 && !this.hasDragged ? "animate" : "attr", this.drawMasks(S2, v2, d10, b2), this.drawOutline(S2, v2, d10, b2), this.navigatorOptions.handles.enabled && (this.drawHandle(S2, 0, d10, b2), this.drawHandle(v2, 1, d10, b2))), this.scrollbar && (d10 ? (m2 = this.top - u10, f2 = this.left - x2 + (h10 || !n10.opposite ? 0 : (n10.titleOffset || 0) + n10.axisTitleMargin), x2 = y2 + 2 * u10) : (m2 = this.top + (h10 ? this.height : -x2), f2 = this.left - u10), this.scrollbar.position(f2, m2, g2, x2), this.scrollbar.setRange(this.zoomedMin / (y2 || 1), this.zoomedMax / (y2 || 1))), this.rendered = true, this.isDirty = false, cf(this, "afterRender");
        }
        addMouseEvents() {
          let t10 = this, e10 = t10.chart, i10 = e10.container, s10 = [], o10, r10;
          t10.mouseMoveHandler = o10 = function(e11) {
            t10.onMouseMove(e11);
          }, t10.mouseUpHandler = r10 = function(e11) {
            t10.onMouseUp(e11);
          }, (s10 = t10.getPartsEvents("mousedown")).push(cn(e10.renderTo, "mousemove", o10), cn(i10.ownerDocument, "mouseup", r10), cn(e10.renderTo, "touchmove", o10), cn(i10.ownerDocument, "touchend", r10)), s10.concat(t10.getPartsEvents("touchstart")), t10.eventsToUnbind = s10, t10.series && t10.series[0] && s10.push(cn(t10.series[0].xAxis, "foundExtremes", function() {
            e10.navigator.modifyNavigatorAxisExtremes();
          }));
        }
        getPartsEvents(t10) {
          let e10 = this, i10 = [];
          return ["shades", "handles"].forEach(function(s10) {
            e10[s10].forEach(function(o10, r10) {
              i10.push(cn(o10.element, t10, function(t11) {
                e10[s10 + "Mousedown"](t11, r10);
              }));
            });
          }), i10;
        }
        shadesMousedown(t10, e10) {
          t10 = this.chart.pointer?.normalize(t10) || t10;
          let i10 = this.chart, s10 = this.xAxis, o10 = this.zoomedMin, r10 = this.size, a10 = this.range, n10 = this.left, h10 = t10.chartX, l10, d10, c10, p10;
          i10.inverted && (h10 = t10.chartY, n10 = this.top), 1 === e10 ? (this.grabbedCenter = h10, this.fixedWidth = a10, this.dragOffset = h10 - o10) : (p10 = h10 - n10 - a10 / 2, 0 === e10 ? p10 = Math.max(0, p10) : 2 === e10 && p10 + a10 >= r10 && (p10 = r10 - a10, this.reversedExtremes ? (p10 -= a10, d10 = this.getUnionExtremes().dataMin) : l10 = this.getUnionExtremes().dataMax), p10 !== o10 && (this.fixedWidth = a10, cd((c10 = s10.navigatorAxis.toFixedRange(p10, p10 + a10, d10, l10)).min) && cf(this, "setRange", {
            min: Math.min(c10.min, c10.max),
            max: Math.max(c10.min, c10.max),
            redraw: true,
            eventArguments: {
              trigger: "navigator"
            }
          })));
        }
        handlesMousedown(t10, e10) {
          t10 = this.chart.pointer?.normalize(t10) || t10;
          let i10 = this.chart, s10 = i10.xAxis[0], o10 = this.reversedExtremes;
          0 === e10 ? (this.grabbedLeft = true, this.otherHandlePos = this.zoomedMax, this.fixedExtreme = o10 ? s10.min : s10.max) : (this.grabbedRight = true, this.otherHandlePos = this.zoomedMin, this.fixedExtreme = o10 ? s10.max : s10.min), i10.setFixedRange(void 0);
        }
        onMouseMove(t10) {
          let e10 = this, i10 = e10.chart, s10 = e10.navigatorSize, o10 = e10.range, r10 = e10.dragOffset, a10 = i10.inverted, n10 = e10.left, h10;
          (!t10.touches || 0 !== t10.touches[0].pageX) && (h10 = (t10 = i10.pointer?.normalize(t10) || t10).chartX, a10 && (n10 = e10.top, h10 = t10.chartY), e10.grabbedLeft ? (e10.hasDragged = true, e10.render(0, 0, h10 - n10, e10.otherHandlePos)) : e10.grabbedRight ? (e10.hasDragged = true, e10.render(0, 0, e10.otherHandlePos, h10 - n10)) : e10.grabbedCenter && (e10.hasDragged = true, h10 < r10 ? h10 = r10 : h10 > s10 + r10 - o10 && (h10 = s10 + r10 - o10), e10.render(0, 0, h10 - r10, h10 - r10 + o10)), e10.hasDragged && e10.scrollbar && cb(e10.scrollbar.options.liveRedraw, !cr && !this.chart.boosted) && (t10.DOMType = t10.type, setTimeout(function() {
            e10.onMouseUp(t10);
          }, 0)));
        }
        onMouseUp(t10) {
          let e10, i10, s10, o10, r10, a10, n10 = this.chart, h10 = this.xAxis, l10 = this.scrollbar, d10 = t10.DOMEvent || t10, c10 = n10.inverted, p10 = this.rendered && !this.hasDragged ? "animate" : "attr";
          (this.hasDragged && (!l10 || !l10.hasDragged) || "scrollbar" === t10.trigger) && (s10 = this.getUnionExtremes(), this.zoomedMin === this.otherHandlePos ? o10 = this.fixedExtreme : this.zoomedMax === this.otherHandlePos && (r10 = this.fixedExtreme), this.zoomedMax === this.size && (r10 = this.reversedExtremes ? s10.dataMin : s10.dataMax), 0 === this.zoomedMin && (o10 = this.reversedExtremes ? s10.dataMax : s10.dataMin), cd((a10 = h10.navigatorAxis.toFixedRange(this.zoomedMin, this.zoomedMax, o10, r10)).min) && cf(this, "setRange", {
            min: Math.min(a10.min, a10.max),
            max: Math.max(a10.min, a10.max),
            redraw: true,
            animation: !this.hasDragged && null,
            eventArguments: {
              trigger: "navigator",
              triggerOp: "navigator-drag",
              DOMEvent: d10
            }
          })), "mousemove" !== t10.DOMType && "touchmove" !== t10.DOMType && (this.grabbedLeft = this.grabbedRight = this.grabbedCenter = this.fixedWidth = this.fixedExtreme = this.otherHandlePos = this.hasDragged = this.dragOffset = null), this.navigatorEnabled && cx(this.zoomedMin) && cx(this.zoomedMax) && (i10 = Math.round(this.zoomedMin), e10 = Math.round(this.zoomedMax), this.shades && this.drawMasks(i10, e10, c10, p10), this.outline && this.drawOutline(i10, e10, c10, p10), this.navigatorOptions.handles.enabled && Object.keys(this.handles).length === this.handles.length && (this.drawHandle(i10, 0, c10, p10), this.drawHandle(e10, 1, c10, p10)));
        }
        removeEvents() {
          this.eventsToUnbind && (this.eventsToUnbind.forEach(function(t10) {
            t10();
          }), this.eventsToUnbind = void 0), this.removeBaseSeriesEvents();
        }
        removeBaseSeriesEvents() {
          let t10 = this.baseSeries || [];
          this.navigatorEnabled && t10[0] && (false !== this.navigatorOptions.adaptToUpdatedData && t10.forEach(function(t11) {
            cv(t11, "updatedData", this.updatedDataHandler);
          }, this), t10[0].xAxis && cv(t10[0].xAxis, "foundExtremes", this.modifyBaseAxisExtremes));
        }
        getXAxisOffsets() {
          return this.chart.inverted ? [this.scrollButtonSize, 0, -this.scrollButtonSize, 0] : [0, -this.scrollButtonSize, 0, this.scrollButtonSize];
        }
        init(t10) {
          let e10 = t10.options, i10 = e10.navigator || {}, s10 = i10.enabled, o10 = e10.scrollbar || {}, r10 = o10.enabled, a10 = s10 && i10.height || 0, n10 = r10 && o10.height || 0, h10 = o10.buttonsEnabled && n10 || 0;
          this.handles = [], this.shades = [], this.chart = t10, this.setBaseSeries(), this.height = a10, this.scrollbarHeight = n10, this.scrollButtonSize = h10, this.scrollbarEnabled = r10, this.navigatorEnabled = s10, this.navigatorOptions = i10, this.scrollbarOptions = o10, this.setOpposite();
          let l10 = this, d10 = l10.baseSeries, c10 = t10.xAxis.length, p10 = t10.yAxis.length, u10 = d10 && d10[0] && d10[0].xAxis || t10.xAxis[0] || {
            options: {}
          };
          if (t10.isDirtyBox = true, l10.navigatorEnabled) {
            let e11 = this.getXAxisOffsets();
            l10.xAxis = new oo(t10, cy({
              breaks: u10.options.breaks,
              ordinal: u10.options.ordinal,
              overscroll: u10.options.overscroll
            }, i10.xAxis, {
              type: "datetime",
              yAxis: i10.yAxis?.id,
              index: c10,
              isInternal: true,
              offset: 0,
              keepOrdinalPadding: true,
              startOnTick: false,
              endOnTick: false,
              minPadding: u10.options.ordinal ? 0 : u10.options.minPadding,
              maxPadding: u10.options.ordinal ? 0 : u10.options.maxPadding,
              zoomEnabled: false
            }, t10.inverted ? {
              offsets: e11,
              width: a10
            } : {
              offsets: e11,
              height: a10
            }), "xAxis"), l10.yAxis = new oo(t10, cy(i10.yAxis, {
              alignTicks: false,
              offset: 0,
              index: p10,
              isInternal: true,
              reversed: cb(i10.yAxis && i10.yAxis.reversed, t10.yAxis[0] && t10.yAxis[0].reversed, false),
              zoomEnabled: false
            }, t10.inverted ? {
              width: a10
            } : {
              height: a10
            }), "yAxis"), d10 || i10.series.data ? l10.updateNavigatorSeries(false) : 0 === t10.series.length && (l10.unbindRedraw = cn(t10, "beforeRedraw", function() {
              t10.series.length > 0 && !l10.series && (l10.setBaseSeries(), l10.unbindRedraw());
            })), l10.reversedExtremes = t10.inverted && !l10.xAxis.reversed || !t10.inverted && l10.xAxis.reversed, l10.renderElements(), l10.addMouseEvents();
          } else l10.xAxis = {
            chart: t10,
            navigatorAxis: {
              fake: true
            },
            translate: function(e11, i11) {
              let s11 = t10.xAxis[0], o11 = s11.getExtremes(), r11 = s11.len - 2 * h10, a11 = cM("min", s11.options.min, o11.dataMin), n11 = cM("max", s11.options.max, o11.dataMax) - a11;
              return i11 ? e11 * n11 / r11 + a11 : r11 * (e11 - a11) / n11;
            },
            toPixels: function(t11) {
              return this.translate(t11);
            },
            toValue: function(t11) {
              return this.translate(t11, true);
            }
          }, l10.xAxis.navigatorAxis.axis = l10.xAxis, l10.xAxis.navigatorAxis.toFixedRange = dO.prototype.toFixedRange.bind(l10.xAxis.navigatorAxis);
          if (t10.options.scrollbar?.enabled) {
            let e11 = cy(t10.options.scrollbar, {
              vertical: t10.inverted
            });
            cx(e11.margin) || (e11.margin = t10.inverted ? -3 : 3), t10.scrollbar = l10.scrollbar = new cs(t10.renderer, e11, t10), cn(l10.scrollbar, "changed", function(t11) {
              let e12 = l10.size, i11 = e12 * this.to, s11 = e12 * this.from;
              l10.hasDragged = l10.scrollbar.hasDragged, l10.render(0, 0, s11, i11), this.shouldUpdateExtremes(t11.DOMType) && setTimeout(function() {
                l10.onMouseUp(t11);
              });
            });
          }
          l10.addBaseSeriesEvents(), l10.addChartEvents();
        }
        setOpposite() {
          let t10 = this.navigatorOptions, e10 = this.navigatorEnabled, i10 = this.chart;
          this.opposite = cb(t10.opposite, !!(!e10 && i10.inverted));
        }
        getUnionExtremes(t10) {
          let e10, i10 = this.chart.xAxis[0], s10 = this.chart.time, o10 = this.xAxis, r10 = o10.options, a10 = i10.options;
          return t10 && null === i10.dataMin || (e10 = {
            dataMin: cb(s10.parse(r10?.min), cM("min", s10.parse(a10.min), i10.dataMin, o10.dataMin, o10.min)),
            dataMax: cb(s10.parse(r10?.max), cM("max", s10.parse(a10.max), i10.dataMax, o10.dataMax, o10.max))
          }), e10;
        }
        setBaseSeries(t10, e10) {
          let i10 = this.chart, s10 = this.baseSeries = [];
          t10 = t10 || i10.options && i10.options.navigator.baseSeries || (i10.series.length ? cg(i10.series, (t11) => !t11.options.isInternal).index : 0), (i10.series || []).forEach((e11, i11) => {
            !e11.options.isInternal && (e11.options.showInNavigator || (i11 === t10 || e11.options.id === t10) && false !== e11.options.showInNavigator) && s10.push(e11);
          }), this.xAxis && !this.xAxis.navigatorAxis.fake && this.updateNavigatorSeries(true, e10);
        }
        updateNavigatorSeries(t10, e10) {
          let i10 = this, s10 = i10.chart, o10 = i10.baseSeries, r10 = {
            enableMouseTracking: false,
            index: null,
            linkedTo: null,
            group: "nav",
            padXAxis: false,
            xAxis: this.navigatorOptions.xAxis?.id,
            yAxis: this.navigatorOptions.yAxis?.id,
            showInLegend: false,
            stacking: void 0,
            isInternal: true,
            states: {
              inactive: {
                opacity: 1
              }
            }
          }, a10 = i10.series = (i10.series || []).filter((t11) => {
            let e11 = t11.baseSeries;
            return !(0 > o10.indexOf(e11)) || (e11 && (cv(e11, "updatedData", i10.updatedDataHandler), delete e11.navigatorSeries), t11.chart && t11.destroy(), false);
          }), n10, h10, l10 = i10.navigatorOptions.series, d10;
          o10 && o10.length && o10.forEach((t11) => {
            let c10 = t11.navigatorSeries, p10 = cu({
              color: t11.color,
              visible: t11.visible
            }, cm(l10) ? co.navigator.series : l10);
            if (c10 && false === i10.navigatorOptions.adaptToUpdatedData) return;
            r10.name = "Navigator " + o10.length, d10 = (n10 = t11.options || {}).navigatorOptions || {}, p10.dataLabels = ck(p10.dataLabels), (h10 = cy(n10, r10, p10, d10)).pointRange = cb(p10.pointRange, d10.pointRange, co.plotOptions[h10.type || "line"].pointRange);
            let u10 = d10.data || p10.data;
            i10.hasNavigatorData = i10.hasNavigatorData || !!u10, h10.data = u10 || n10.data?.slice(0), c10 && c10.options ? c10.update(h10, e10) : (t11.navigatorSeries = s10.initSeries(h10), s10.setSortedData(), t11.navigatorSeries.baseSeries = t11, a10.push(t11.navigatorSeries));
          }), (l10.data && !(o10 && o10.length) || cm(l10)) && (i10.hasNavigatorData = false, (l10 = ck(l10)).forEach((t11, e11) => {
            r10.name = "Navigator " + (a10.length + 1), (h10 = cy(co.navigator.series, {
              color: s10.series[e11] && !s10.series[e11].options.isInternal && s10.series[e11].color || s10.options.colors[e11] || s10.options.colors[0]
            }, r10, t11)).data = t11.data, h10.data && (i10.hasNavigatorData = true, a10.push(s10.initSeries(h10)));
          })), t10 && this.addBaseSeriesEvents();
        }
        addBaseSeriesEvents() {
          let t10 = this, e10 = t10.baseSeries || [];
          e10[0] && e10[0].xAxis && e10[0].eventsToUnbind.push(cn(e10[0].xAxis, "foundExtremes", this.modifyBaseAxisExtremes)), e10.forEach((i10) => {
            i10.eventsToUnbind.push(cn(i10, "show", function() {
              this.navigatorSeries && this.navigatorSeries.setVisible(true, false);
            })), i10.eventsToUnbind.push(cn(i10, "hide", function() {
              this.navigatorSeries && this.navigatorSeries.setVisible(false, false);
            })), false !== this.navigatorOptions.adaptToUpdatedData && i10.xAxis && i10.eventsToUnbind.push(cn(i10, "updatedData", this.updatedDataHandler)), i10.eventsToUnbind.push(cn(i10, "remove", function() {
              e10 && cp(e10, i10), this.navigatorSeries && t10.series && (cp(t10.series, this.navigatorSeries), cd(this.navigatorSeries.options) && this.navigatorSeries.remove(false), delete this.navigatorSeries);
            }));
          });
        }
        getBaseSeriesMin(t10) {
          return this.baseSeries.reduce(function(t11, e10) {
            return Math.min(t11, e10.getColumn("x")[0] ?? t11);
          }, t10);
        }
        modifyNavigatorAxisExtremes() {
          let t10 = this.xAxis;
          if (void 0 !== t10.getExtremes) {
            let e10 = this.getUnionExtremes(true);
            e10 && (e10.dataMin !== t10.min || e10.dataMax !== t10.max) && (t10.min = e10.dataMin, t10.max = e10.dataMax);
          }
        }
        modifyBaseAxisExtremes() {
          let t10, e10, i10 = this.chart.navigator, s10 = this.getExtremes(), o10 = s10.min, r10 = s10.max, a10 = s10.dataMin, n10 = s10.dataMax, h10 = r10 - o10, l10 = i10.stickToMin, d10 = i10.stickToMax, c10 = cb(this.ordinal?.convertOverscroll(this.options.overscroll), 0), p10 = i10.series && i10.series[0], u10 = !!this.setExtremes;
          !(this.eventArgs && "rangeSelectorButton" === this.eventArgs.trigger) && (l10 && (t10 = (e10 = a10) + h10), d10 && (t10 = n10 + c10, l10 || (e10 = Math.max(a10, t10 - h10, i10.getBaseSeriesMin(p10 && p10.xData ? p10.xData[0] : -Number.MAX_VALUE)))), u10 && (l10 || d10) && cx(e10) && (this.min = this.userMin = e10, this.max = this.userMax = t10)), i10.stickToMin = i10.stickToMax = null;
        }
        updatedDataHandler() {
          let t10 = this.chart.navigator, e10 = this.navigatorSeries, i10 = t10.reversedExtremes ? 0 === Math.round(t10.zoomedMin) : Math.round(t10.zoomedMax) >= Math.round(t10.size);
          t10.stickToMax = cb(this.chart.options.navigator && this.chart.options.navigator.stickToMax, i10), t10.stickToMin = t10.shouldStickToMin(this, t10), e10 && !t10.hasNavigatorData && (e10.options.pointStart = this.getColumn("x")[0], e10.setData(this.options.data, false, null, false));
        }
        shouldStickToMin(t10, e10) {
          let i10 = e10.getBaseSeriesMin(t10.getColumn("x")[0]), s10 = t10.xAxis, o10 = s10.max, r10 = s10.min, a10 = s10.options.range;
          return !!(cx(o10) && cx(r10)) && (a10 && o10 - i10 > 0 ? o10 - i10 < a10 : r10 <= i10);
        }
        addChartEvents() {
          this.eventsToUnbind || (this.eventsToUnbind = []), this.eventsToUnbind.push(cn(this.chart, "redraw", function() {
            let t10 = this.navigator, e10 = t10 && (t10.baseSeries && t10.baseSeries[0] && t10.baseSeries[0].xAxis || this.xAxis[0]);
            e10 && t10.render(e10.min, e10.max);
          }), cn(this.chart, "getMargins", function() {
            let t10 = this.navigator, e10 = t10.opposite ? "plotTop" : "marginBottom";
            this.inverted && (e10 = t10.opposite ? "marginRight" : "plotLeft"), this[e10] = (this[e10] || 0) + (t10.navigatorEnabled || !this.inverted ? t10.height + (this.scrollbar?.options.margin || 0) + t10.scrollbarHeight : 0) + (t10.navigatorOptions.margin || 0);
          }), cn(cw, "setRange", function(t10) {
            this.chart.xAxis[0].setExtremes(t10.min, t10.max, t10.redraw, t10.animation, t10.eventArguments);
          }));
        }
        destroy() {
          this.removeEvents(), this.xAxis && (cp(this.chart.xAxis, this.xAxis), cp(this.chart.axes, this.xAxis)), this.yAxis && (cp(this.chart.yAxis, this.yAxis), cp(this.chart.axes, this.yAxis)), (this.series || []).forEach((t10) => {
            t10.destroy && t10.destroy();
          }), ["series", "xAxis", "yAxis", "shades", "outline", "scrollbarTrack", "scrollbarRifles", "scrollbarGroup", "scrollbar", "navigatorGroup", "rendered"].forEach((t10) => {
            this[t10] && this[t10].destroy && this[t10].destroy(), this[t10] = null;
          }), [this.handles].forEach((t10) => {
            cc(t10);
          }), this.baseSeries.forEach((t10) => {
            t10.navigatorSeries = void 0;
          }), this.navigatorEnabled = false;
        }
      }
      let {
        addEvent: cS,
        correctFloat: cA,
        css: cT,
        defined: cC,
        error: cP,
        isNumber: cO,
        pick: cE,
        timeUnits: cL,
        isString: cB
      } = tx;
      !function(t10) {
        function e10(t11, i11, s11, o11, r11 = [], a11 = 0, n11) {
          let h11 = {}, l11 = this.options.tickPixelInterval, d11 = this.chart.time, c11 = [], p10, u10, g2, f2, m2, x2 = 0, y2 = [], b2 = -Number.MAX_VALUE;
          if (!this.options.ordinal && !this.options.breaks || !r11 || r11.length < 3 || void 0 === i11) return d11.getTimeTicks.apply(d11, arguments);
          let v2 = r11.length;
          for (p10 = 0; p10 < v2; p10++) {
            if (m2 = p10 && r11[p10 - 1] > s11, r11[p10] < i11 && (x2 = p10), p10 === v2 - 1 || r11[p10 + 1] - r11[p10] > 5 * a11 || m2) {
              if (r11[p10] > b2) {
                for (u10 = d11.getTimeTicks(t11, r11[x2], r11[p10], o11); u10.length && u10[0] <= b2; ) u10.shift();
                u10.length && (b2 = u10[u10.length - 1]), c11.push(y2.length), y2 = y2.concat(u10);
              }
              x2 = p10 + 1;
            }
            if (m2) break;
          }
          if (u10) {
            if (f2 = u10.info, n11 && f2.unitRange <= cL.hour) {
              for (x2 = 1, p10 = y2.length - 1; x2 < p10; x2++) d11.dateFormat("%d", y2[x2]) !== d11.dateFormat("%d", y2[x2 - 1]) && (h11[y2[x2]] = "day", g2 = true);
              g2 && (h11[y2[0]] = "day"), f2.higherRanks = h11;
            }
            f2.segmentStarts = c11, y2.info = f2;
          } else cP(12, false, this.chart);
          if (n11 && cC(l11)) {
            let t12 = y2.length, e11 = [], i12 = [], o12, r12, a12, n12, d12, c12 = t12;
            for (; c12--; ) r12 = this.translate(y2[c12]), a12 && (i12[c12] = a12 - r12), e11[c12] = a12 = r12;
            for (i12.sort((t13, e12) => t13 - e12), (n12 = i12[Math.floor(i12.length / 2)]) < 0.6 * l11 && (n12 = null), c12 = y2[t12 - 1] > s11 ? t12 - 1 : t12, a12 = void 0; c12--; ) d12 = Math.abs(a12 - (r12 = e11[c12])), a12 && d12 < 0.8 * l11 && (null === n12 || d12 < 0.8 * n12) ? (h11[y2[c12]] && !h11[y2[c12 + 1]] ? (o12 = c12 + 1, a12 = r12) : o12 = c12, y2.splice(o12, 1)) : a12 = r12;
          }
          return y2;
        }
        function i10(t11) {
          let e11 = this.ordinal.positions;
          if (!e11) return t11;
          let i11 = e11.length - 1, s11;
          return (t11 < 0 ? t11 = e11[0] : t11 > i11 ? t11 = e11[i11] : (i11 = Math.floor(t11), s11 = t11 - i11), void 0 !== s11 && void 0 !== e11[i11]) ? e11[i11] + (s11 ? s11 * (e11[i11 + 1] - e11[i11]) : 0) : t11;
        }
        function s10(t11) {
          let e11 = this.ordinal, i11 = this.old ? this.old.min : this.min, s11 = this.old ? this.old.transA : this.transA, o11 = e11.getExtendedPositions();
          if (o11?.length) {
            let r11 = cA((t11 - i11) * s11 + this.minPixelPadding), a11 = cA(e11.getIndexOfPoint(r11, o11)), n11 = cA(a11 % 1);
            if (a11 >= 0 && a11 <= o11.length - 1) {
              let t12 = o11[Math.floor(a11)], e12 = o11[Math.ceil(a11)];
              return o11[Math.floor(a11)] + n11 * (e12 - t12);
            }
          }
          return t11;
        }
        function o10(e11, i11) {
          let s11 = t10.Additions.findIndexOf(e11, i11, true);
          if (e11[s11] === i11) return s11;
          let o11 = (i11 - e11[s11]) / (e11[s11 + 1] - e11[s11]);
          return s11 + o11;
        }
        function r10() {
          this.ordinal || (this.ordinal = new t10.Additions(this));
        }
        function a10() {
          let {
            eventArgs: t11,
            options: e11
          } = this;
          if (this.isXAxis && cC(e11.overscroll) && 0 !== e11.overscroll && cO(this.max) && cO(this.min) && (this.options.ordinal && !this.ordinal.originalOrdinalRange && this.ordinal.getExtendedPositions(false), this.isFullRange = cC(this.dataMin) && cC(this.dataMax) && this.max - this.min == this.dataMax - this.dataMin, this.max === this.dataMax && (t11?.trigger !== "pan" || this.isInternal) && t11?.trigger !== "navigator")) {
            let i11 = this.ordinal.convertOverscroll(e11.overscroll);
            this.max += i11, !this.isInternal && cC(this.userMin) && t11?.trigger !== "mousewheel" && (this.min += i11);
          }
        }
        function n10() {
          this.horiz && !this.isDirty && (this.isDirty = this.isOrdinal && this.chart.navigator && !this.chart.navigator.adaptToUpdatedData);
        }
        function h10() {
          this.ordinal && (this.ordinal.beforeSetTickPositions(), this.tickInterval = this.ordinal.postProcessTickInterval(this.tickInterval));
        }
        function l10(t11) {
          let e11 = this.xAxis[0], i11 = e11.ordinal.convertOverscroll(e11.options.overscroll), s11 = t11.originalEvent.chartX, o11 = this.options.chart.panning, r11 = false;
          if (o11?.type !== "y" && e11.options.ordinal && e11.series.length && (!t11.touches || t11.touches.length <= 1)) {
            let o12, a11, n11 = this.mouseDownX, h11 = e11.getExtremes(), l11 = h11.dataMin, d11 = h11.dataMax, c11 = h11.min, p10 = h11.max, u10 = this.hoverPoints, g2 = e11.closestPointRange || e11.ordinal?.overscrollPointsRange, f2 = Math.round((n11 - s11) / (e11.translationSlope * (e11.ordinal.slope || g2))), m2 = e11.ordinal.getExtendedPositions(), x2 = {
              ordinal: {
                positions: m2,
                extendedOrdinalPositions: m2
              }
            }, y2 = e11.index2val, b2 = e11.val2lin;
            if (c11 <= l11 && f2 <= 0 || p10 >= d11 + i11 && f2 >= 0) return void t11.preventDefault();
            x2.ordinal.positions ? Math.abs(f2) > 1 && (u10 && u10.forEach(function(t12) {
              t12.setState();
            }), a11 = x2.ordinal.positions, i11 && (a11 = x2.ordinal.positions = a11.concat(e11.ordinal.getOverscrollPositions())), d11 > a11[a11.length - 1] && a11.push(d11), this.setFixedRange(p10 - c11), (o12 = e11.navigatorAxis.toFixedRange(void 0, void 0, y2.apply(x2, [b2.apply(x2, [c11, true]) + f2]), y2.apply(x2, [b2.apply(x2, [p10, true]) + f2]))).min >= Math.min(a11[0], c11) && o12.max <= Math.max(a11[a11.length - 1], p10) + i11 && e11.setExtremes(o12.min, o12.max, true, false, {
              trigger: "pan"
            }), this.mouseDownX = s11, cT(this.container, {
              cursor: "move"
            })) : r11 = true;
          } else r11 = true;
          r11 || o11 && /y/.test(o11.type) ? i11 && cO(e11.dataMax) && (e11.max = e11.dataMax + i11) : t11.preventDefault();
        }
        function d10() {
          let t11 = this.xAxis;
          t11?.options.ordinal && (delete t11.ordinal.index, delete t11.ordinal.originalOrdinalRange);
        }
        function c10(t11, e11) {
          let i11, s11 = this.ordinal, r11 = s11.positions, a11 = s11.slope, n11;
          if (!r11) return t11;
          let h11 = r11.length;
          if (r11[0] <= t11 && r11[h11 - 1] >= t11) i11 = o10(r11, t11);
          else {
            if (n11 = s11.getExtendedPositions?.(), !n11?.length) return t11;
            let h12 = n11.length;
            a11 || (a11 = (n11[h12 - 1] - n11[0]) / h12);
            let l11 = o10(n11, r11[0]);
            if (t11 >= n11[0] && t11 <= n11[h12 - 1]) i11 = o10(n11, t11) - l11;
            else {
              if (!e11) return t11;
              i11 = t11 < n11[0] ? -l11 - (n11[0] - t11) / a11 : (t11 - n11[h12 - 1]) / a11 + h12 - l11;
            }
          }
          return e11 ? i11 : a11 * (i11 || 0) + s11.offset;
        }
        t10.compose = function(t11, o11, p10) {
          let u10 = t11.prototype;
          return u10.ordinal2lin || (u10.getTimeTicks = e10, u10.index2val = i10, u10.lin2val = s10, u10.val2lin = c10, u10.ordinal2lin = u10.val2lin, cS(t11, "afterInit", r10), cS(t11, "foundExtremes", a10), cS(t11, "afterSetScale", n10), cS(t11, "initialAxisTranslation", h10), cS(p10, "pan", l10), cS(p10, "touchpan", l10), cS(o11, "updatedData", d10)), t11;
        }, t10.Additions = class {
          constructor(t11) {
            this.index = {}, this.axis = t11;
          }
          beforeSetTickPositions() {
            let t11 = this.axis, e11 = t11.ordinal, i11 = t11.getExtremes(), s11 = i11.min, o11 = i11.max, r11 = t11.brokenAxis?.hasBreaks, a11 = t11.options.ordinal, n11 = t11.options.overscroll && t11.ordinal.convertOverscroll(t11.options.overscroll) || 0, h11, l11, d11, c11, p10, u10, g2, f2 = [], m2 = Number.MAX_VALUE, x2 = false, y2 = false, b2 = false;
            if (a11 || r11) {
              let i12 = 0;
              if (t11.series.forEach(function(t12, e12) {
                let s12 = t12.getColumn("x", true);
                if (l11 = [], e12 > 0 && "highcharts-navigator-series" !== t12.options.id && s12.length > 1 && (y2 = i12 !== s12[1] - s12[0]), i12 = s12[1] - s12[0], t12.boosted && (b2 = t12.boosted), t12.reserveSpace() && (false !== t12.takeOrdinalPosition || r11) && (h11 = (f2 = f2.concat(s12)).length, f2.sort(function(t13, e13) {
                  return t13 - e13;
                }), m2 = Math.min(m2, cE(t12.closestPointRange, m2)), h11)) {
                  for (e12 = 0; e12 < h11 - 1; ) f2[e12] !== f2[e12 + 1] && l11.push(f2[e12 + 1]), e12++;
                  l11[0] !== f2[0] && l11.unshift(f2[0]), f2 = l11;
                }
              }), t11.ordinal.originalOrdinalRange || (t11.ordinal.originalOrdinalRange = (f2.length - 1) * m2), y2 && b2 && (f2.pop(), f2.shift()), (h11 = f2.length) > 2) {
                for (d11 = f2[1] - f2[0], g2 = h11 - 1; g2-- && !x2; ) f2[g2 + 1] - f2[g2] !== d11 && (x2 = true);
                !t11.options.keepOrdinalPadding && (f2[0] - s11 > d11 || o11 - n11 - f2[h11 - 1] > d11) && (x2 = true);
              } else t11.options.overscroll && (2 === h11 ? m2 = f2[1] - f2[0] : 1 === h11 ? (m2 = n11, f2 = [f2[0], f2[0] + m2]) : m2 = e11.overscrollPointsRange);
              x2 || t11.forceOrdinal ? (t11.options.overscroll && (e11.overscrollPointsRange = m2, f2 = f2.concat(e11.getOverscrollPositions())), e11.positions = f2, c11 = t11.ordinal2lin(Math.max(s11, f2[0]), true), p10 = Math.max(t11.ordinal2lin(Math.min(o11, f2[f2.length - 1]), true), 1), e11.slope = u10 = (o11 - s11) / (p10 - c11), e11.offset = s11 - c11 * u10) : (e11.overscrollPointsRange = cE(t11.closestPointRange, e11.overscrollPointsRange), e11.positions = t11.ordinal.slope = e11.offset = void 0);
            }
            t11.isOrdinal = a11 && x2, e11.groupIntervalFactor = null;
          }
          static findIndexOf(t11, e11, i11) {
            let s11 = 0, o11 = t11.length - 1, r11;
            for (; s11 < o11; ) t11[r11 = Math.ceil((s11 + o11) / 2)] <= e11 ? s11 = r11 : o11 = r11 - 1;
            return t11[s11] === e11 || i11 ? s11 : -1;
          }
          getExtendedPositions(t11 = true) {
            let e11 = this, i11 = e11.axis, s11 = i11.constructor.prototype, o11 = i11.chart, r11 = i11.series.reduce((t12, e12) => {
              let i12 = e12.currentDataGrouping;
              return t12 + (i12 ? i12.count + i12.unitName : "raw");
            }, ""), a11 = t11 ? i11.ordinal.convertOverscroll(i11.options.overscroll) : 0, n11 = i11.getExtremes(), h11, l11, d11 = e11.index;
            return d11 || (d11 = e11.index = {}), !d11[r11] && ((h11 = {
              series: [],
              chart: o11,
              forceOrdinal: false,
              getExtremes: function() {
                return {
                  min: n11.dataMin,
                  max: n11.dataMax + a11
                };
              },
              applyGrouping: s11.applyGrouping,
              getGroupPixelWidth: s11.getGroupPixelWidth,
              getTimeTicks: s11.getTimeTicks,
              options: {
                ordinal: true
              },
              ordinal: {
                getGroupIntervalFactor: this.getGroupIntervalFactor
              },
              ordinal2lin: s11.ordinal2lin,
              getIndexOfPoint: s11.getIndexOfPoint,
              val2lin: s11.val2lin
            }).ordinal.axis = h11, i11.series.forEach((i12) => {
              if (false === i12.takeOrdinalPosition) return;
              l11 = {
                xAxis: h11,
                chart: o11,
                groupPixelWidth: i12.groupPixelWidth,
                destroyGroupedData: V.noop,
                getColumn: i12.getColumn,
                applyGrouping: i12.applyGrouping,
                getProcessedData: i12.getProcessedData,
                reserveSpace: i12.reserveSpace,
                visible: i12.visible
              };
              let s12 = i12.getColumn("x").concat(t11 ? e11.getOverscrollPositions() : []);
              l11.dataTable = new rz({
                columns: {
                  x: s12
                }
              }), l11.options = __spreadProps(__spreadValues({}, i12.options), {
                dataGrouping: i12.currentDataGrouping ? {
                  firstAnchor: i12.options.dataGrouping?.firstAnchor,
                  anchor: i12.options.dataGrouping?.anchor,
                  lastAnchor: i12.options.dataGrouping?.firstAnchor,
                  enabled: true,
                  forced: true,
                  approximation: "open",
                  units: [[i12.currentDataGrouping.unitName, [i12.currentDataGrouping.count]]]
                } : {
                  enabled: false
                }
              }), h11.series.push(l11), i12.processData.apply(l11);
            }), h11.applyGrouping({
              hasExtremesChanged: true
            }), l11?.closestPointRange !== l11?.basePointRange && l11.currentDataGrouping && (h11.forceOrdinal = true), i11.ordinal.beforeSetTickPositions.apply({
              axis: h11
            }), !i11.ordinal.originalOrdinalRange && h11.ordinal.originalOrdinalRange && (i11.ordinal.originalOrdinalRange = h11.ordinal.originalOrdinalRange), h11.ordinal.positions && (d11[r11] = h11.ordinal.positions)), d11[r11];
          }
          getGroupIntervalFactor(t11, e11, i11) {
            let s11 = i11.getColumn("x", true), o11 = s11.length, r11 = [], a11, n11, h11 = this.groupIntervalFactor;
            if (!h11) {
              for (n11 = 0; n11 < o11 - 1; n11++) r11[n11] = s11[n11 + 1] - s11[n11];
              r11.sort(function(t12, e12) {
                return t12 - e12;
              }), a11 = r11[Math.floor(o11 / 2)], t11 = Math.max(t11, s11[0]), e11 = Math.min(e11, s11[o11 - 1]), this.groupIntervalFactor = h11 = o11 * a11 / (e11 - t11);
            }
            return h11;
          }
          getIndexOfPoint(t11, e11) {
            let i11 = this.axis, s11 = i11.min, r11 = i11.minPixelPadding;
            return o10(e11, s11) + cA((t11 - r11) / (i11.translationSlope * (this.slope || i11.closestPointRange || this.overscrollPointsRange)));
          }
          getOverscrollPositions() {
            let t11 = this.axis, e11 = this.convertOverscroll(t11.options.overscroll), i11 = this.overscrollPointsRange, s11 = [], o11 = t11.dataMax;
            if (cC(i11)) for (; o11 < t11.dataMax + e11; ) s11.push(o11 += i11);
            return s11;
          }
          postProcessTickInterval(t11) {
            let e11 = this.axis, i11 = this.slope, s11 = e11.closestPointRange;
            return i11 && s11 ? e11.options.breaks ? s11 || t11 : t11 / (i11 / s11) : t11;
          }
          convertOverscroll(t11 = 0) {
            let e11 = this, i11 = e11.axis, s11 = function(t12) {
              return cE(e11.originalOrdinalRange, cC(i11.dataMax) && cC(i11.dataMin) ? i11.dataMax - i11.dataMin : 0) * t12;
            };
            if (cB(t11)) {
              let e12 = parseInt(t11, 10);
              if (false === i11.isFullRange && cO(i11.min) && cO(i11.max) && (this.originalOrdinalRange = i11.max - i11.min), /%$/.test(t11)) return s11(e12 / 100);
              if (/px/.test(t11)) {
                let t12 = Math.min(e12, 0.9 * i11.len) / i11.len;
                return s11(t12 / (i11.isFullRange ? 1 - t12 : 1));
              }
              return 0;
            }
            return t11;
          }
        };
      }(X || (X = {}));
      let cD = X, cI = {
        rangeSelectorZoom: "Zoom",
        rangeSelectorFrom: "",
        rangeSelectorTo: "→",
        rangeSelector: {
          allText: "All",
          allTitle: "View all",
          monthText: "{count}m",
          monthTitle: "View {count} {#eq count 1}month{else}months{/eq}",
          yearText: "{count}y",
          yearTitle: "View {count} {#eq count 1}year{else}years{/eq}",
          ytdText: "YTD",
          ytdTitle: "View year to date"
        }
      }, cz = {
        allButtonsEnabled: false,
        buttons: [{
          type: "month",
          count: 1
        }, {
          type: "month",
          count: 3
        }, {
          type: "month",
          count: 6
        }, {
          type: "ytd"
        }, {
          type: "year",
          count: 1
        }, {
          type: "all"
        }],
        buttonSpacing: 5,
        dropdown: "responsive",
        enabled: void 0,
        verticalAlign: "top",
        buttonTheme: {
          width: 28,
          height: 18,
          padding: 2,
          zIndex: 7
        },
        floating: false,
        x: 0,
        y: 0,
        height: void 0,
        inputBoxBorderColor: "none",
        inputBoxHeight: 17,
        inputBoxWidth: void 0,
        inputDateFormat: "%[ebY]",
        inputDateParser: void 0,
        inputEditDateFormat: "%Y-%m-%d",
        inputEnabled: true,
        inputPosition: {
          align: "right",
          x: 0,
          y: 0
        },
        inputSpacing: 5,
        selected: void 0,
        buttonPosition: {
          align: "left",
          x: 0,
          y: 0
        },
        inputStyle: {
          color: "#334eff",
          cursor: "pointer",
          fontSize: "0.8em"
        },
        labelStyle: {
          color: "#666666",
          fontSize: "0.8em"
        }
      }, {
        defaultOptions: cR
      } = tY, {
        composed: cN
      } = V, {
        addEvent: cW,
        defined: cG,
        extend: cX,
        isNumber: cH,
        merge: cF,
        pick: cY,
        pushUnique: cj
      } = tx, cU = [];
      function cV() {
        let t10, e10, i10 = this.range, s10 = i10.type, o10 = this.max, r10 = this.chart.time, a10 = function(t11, e11) {
          let i11 = r10.toParts(t11), o11 = i11.slice();
          "year" === s10 ? o11[0] += e11 : o11[1] += e11;
          let a11 = r10.makeTime.apply(r10, o11), n11 = r10.toParts(a11);
          return "month" === s10 && i11[1] === n11[1] && 1 === Math.abs(e11) && (o11[0] = i11[0], o11[1] = i11[1], o11[2] = 0), (a11 = r10.makeTime.apply(r10, o11)) - t11;
        };
        cH(i10) ? (t10 = o10 - i10, e10 = i10) : i10 && (t10 = o10 + a10(o10, -(i10.count || 1)), this.chart && this.chart.setFixedRange(o10 - t10));
        let n10 = cY(this.dataMin, 5e-324);
        return cH(t10) || (t10 = n10), t10 <= n10 && (t10 = n10, void 0 === e10 && (e10 = a10(t10, i10.count)), this.newMax = Math.min(t10 + e10, cY(this.dataMax, Number.MAX_VALUE))), cH(o10) ? !cH(i10) && i10 && i10._offsetMin && (t10 += i10._offsetMin) : t10 = void 0, t10;
      }
      function c$() {
        this.rangeSelector?.redrawElements();
      }
      function c_() {
        this.options.rangeSelector && this.options.rangeSelector.enabled && (this.rangeSelector = new s(this));
      }
      function cZ() {
        let t10 = this.rangeSelector;
        if (t10) {
          cH(t10.deferredYTDClick) && (t10.clickButton(t10.deferredYTDClick), delete t10.deferredYTDClick);
          let e10 = t10.options.verticalAlign;
          t10.options.floating || ("bottom" === e10 ? this.extraBottomMargin = true : "top" === e10 && (this.extraTopMargin = true));
        }
      }
      function cq() {
        let t10, e10 = this.rangeSelector;
        if (!e10) return;
        let i10 = this.xAxis[0].getExtremes(), s10 = this.legend, o10 = e10 && e10.options.verticalAlign;
        cH(i10.min) && e10.render(i10.min, i10.max), s10.display && "top" === o10 && o10 === s10.options.verticalAlign && (t10 = cF(this.spacingBox), "vertical" === s10.options.layout ? t10.y = this.plotTop : t10.y += e10.getHeight(), s10.group.placed = false, s10.align(t10));
      }
      function cK() {
        for (let t10 = 0, e10 = cU.length; t10 < e10; ++t10) {
          let e11 = cU[t10];
          if (e11[0] === this) {
            e11[1].forEach((t11) => t11()), cU.splice(t10, 1);
            return;
          }
        }
      }
      function cJ() {
        let t10 = this.rangeSelector;
        if (t10?.options?.enabled) {
          let {
            min: e10,
            max: i10
          } = this.xAxis[0].getExtremes();
          cH(e10) && t10.inputGroup && t10.inputGroup.getBBox().width < 20 && t10.render(e10, i10);
          let s10 = t10.getHeight(), o10 = t10.options.verticalAlign;
          t10.options.floating || ("bottom" === o10 ? this.marginBottom += s10 : "middle" !== o10 && (this.plotTop += s10));
        }
      }
      function cQ(t10) {
        let e10 = t10.options.rangeSelector, i10 = this.extraBottomMargin, o10 = this.extraTopMargin, r10 = this.rangeSelector;
        if (e10 && e10.enabled && !cG(r10) && this.options.rangeSelector && (this.options.rangeSelector.enabled = true, this.rangeSelector = r10 = new s(this)), this.extraBottomMargin = false, this.extraTopMargin = false, r10) {
          let t11 = e10 && e10.verticalAlign || r10.options && r10.options.verticalAlign;
          r10.options.floating || ("bottom" === t11 ? this.extraBottomMargin = true : "middle" !== t11 && (this.extraTopMargin = true)), (this.extraBottomMargin !== i10 || this.extraTopMargin !== o10) && (this.isDirtyBox = true);
        }
      }
      let c0 = function(t10, e10, i10) {
        if (s = i10, cj(cN, "RangeSelector")) {
          let i11 = e10.prototype;
          t10.prototype.minFromRange = cV, cW(e10, "afterGetContainer", c_), cW(e10, "beforeRender", cZ), cW(e10, "destroy", cK), cW(e10, "getMargins", cJ), cW(e10, "redraw", cq), cW(e10, "update", cQ), cW(e10, "beforeRedraw", c$), i11.callbacks.push(cq), cX(cR, {
            rangeSelector: cz
          }), cX(cR.lang, cI);
        }
      }, {
        defaultOptions: c1
      } = tY, {
        format: c2
      } = eI, {
        addEvent: c3,
        createElement: c5,
        css: c6,
        defined: c9,
        destroyObjectProperties: c4,
        discardElement: c8,
        extend: c7,
        fireEvent: pt,
        isNumber: pe,
        isString: pi,
        merge: ps,
        objectEach: po,
        pick: pr,
        splat: pa
      } = tx;
      function pn(t10) {
        let e10 = (e11) => RegExp(`%[[a-zA-Z]*${e11}`).test(t10);
        if (pi(t10) ? -1 !== t10.indexOf("%L") : t10.fractionalSecondDigits) return "text";
        let i10 = pi(t10) ? ["a", "A", "d", "e", "w", "b", "B", "m", "o", "y", "Y"].some(e10) : t10.dateStyle || t10.day || t10.month || t10.year, s10 = pi(t10) ? ["H", "k", "I", "l", "M", "S"].some(e10) : t10.timeStyle || t10.hour || t10.minute || t10.second;
        return i10 && s10 ? "datetime-local" : i10 ? "date" : s10 ? "time" : "text";
      }
      class ph {
        static compose(t10, e10) {
          c0(t10, e10, ph);
        }
        constructor(t10) {
          this.isDirty = false, this.buttonOptions = [], this.initialButtonGroupWidth = 0, this.maxButtonWidth = () => {
            let t11 = 0;
            return this.buttons.forEach((e10) => {
              let i10 = e10.getBBox();
              i10.width > t11 && (t11 = i10.width);
            }), t11;
          }, this.init(t10);
        }
        clickButton(t10, e10) {
          let i10 = this.chart, s10 = this.buttonOptions[t10], o10 = i10.xAxis[0], r10 = i10.scroller && i10.scroller.getUnionExtremes() || o10 || {}, a10 = s10.type, n10 = s10.dataGrouping, h10 = r10.dataMin, l10 = r10.dataMax, d10, c10 = pe(o10?.max) ? Math.round(Math.min(o10.max, l10 ?? o10.max)) : void 0, p10, u10 = s10._range, g2, f2, m2, x2 = true;
          if (null !== h10 && null !== l10) {
            if (this.setSelected(t10), n10 && (this.forcedDataGrouping = true, oo.prototype.setDataGrouping.call(o10 || {
              chart: this.chart
            }, n10, false), this.frozenStates = s10.preserveDataGrouping), "month" === a10 || "year" === a10) o10 ? (f2 = {
              range: s10,
              max: c10,
              chart: i10,
              dataMin: h10,
              dataMax: l10
            }, d10 = o10.minFromRange.call(f2), pe(f2.newMax) && (c10 = f2.newMax), x2 = false) : u10 = s10;
            else if (u10) pe(c10) && (c10 = Math.min((d10 = Math.max(c10 - u10, h10)) + u10, l10), x2 = false);
            else if ("ytd" === a10) {
              if (o10) !o10.hasData() || pe(l10) && pe(h10) || (h10 = Number.MAX_VALUE, l10 = -Number.MAX_VALUE, i10.series.forEach((t11) => {
                let e11 = t11.getColumn("x");
                e11.length && (h10 = Math.min(e11[0], h10), l10 = Math.max(e11[e11.length - 1], l10));
              }), e10 = false), pe(l10) && pe(h10) && (d10 = g2 = (m2 = this.getYTDExtremes(l10, h10)).min, c10 = m2.max);
              else {
                this.deferredYTDClick = t10;
                return;
              }
            } else "all" === a10 && o10 && (i10.navigator && i10.navigator.baseSeries[0] && (i10.navigator.baseSeries[0].xAxis.options.range = void 0), d10 = h10, c10 = l10);
            if (x2 && s10._offsetMin && c9(d10) && (d10 += s10._offsetMin), s10._offsetMax && c9(c10) && (c10 += s10._offsetMax), this.dropdown && (this.dropdown.selectedIndex = t10 + 1), o10) (pe(d10) || pe(c10)) && (o10.setExtremes(d10, c10, pr(e10, true), void 0, {
              trigger: "rangeSelectorButton",
              rangeSelectorButton: s10
            }), i10.setFixedRange(s10._range));
            else {
              p10 = pa(i10.options.xAxis || {})[0];
              let t11 = c3(i10, "afterCreateAxes", function() {
                let t12 = i10.xAxis[0];
                t12.range = t12.options.range = u10, t12.min = t12.options.min = g2;
              });
              c3(i10, "load", function() {
                let e11 = i10.xAxis[0];
                i10.setFixedRange(s10._range), e11.options.range = p10.range, e11.options.min = p10.min, t11();
              });
            }
            pt(this, "afterBtnClick");
          }
        }
        setSelected(t10) {
          this.selected = this.options.selected = t10;
        }
        init(t10) {
          let e10 = this, i10 = t10.options.rangeSelector, s10 = t10.options.lang, o10 = i10.buttons, r10 = i10.selected, a10 = function() {
            let t11 = e10.minInput, i11 = e10.maxInput;
            t11 && t11.blur && pt(t11, "blur"), i11 && i11.blur && pt(i11, "blur");
          };
          e10.chart = t10, e10.options = i10, e10.buttons = [], e10.buttonOptions = o10.map((t11) => (t11.type && s10.rangeSelector && (t11.text ?? (t11.text = s10.rangeSelector[`${t11.type}Text`]), t11.title ?? (t11.title = s10.rangeSelector[`${t11.type}Title`])), t11.text = c2(t11.text, {
            count: t11.count || 1
          }), t11.title = c2(t11.title, {
            count: t11.count || 1
          }), t11)), this.eventsToUnbind = [], this.eventsToUnbind.push(c3(t10.container, "mousedown", a10)), this.eventsToUnbind.push(c3(t10, "resize", a10)), o10.forEach(e10.computeButtonRange), void 0 !== r10 && o10[r10] && this.clickButton(r10, false), this.eventsToUnbind.push(c3(t10, "load", function() {
            t10.xAxis && t10.xAxis[0] && c3(t10.xAxis[0], "setExtremes", function(i11) {
              pe(this.max) && pe(this.min) && this.max - this.min !== t10.fixedRange && "rangeSelectorButton" !== i11.trigger && "updatedData" !== i11.trigger && e10.forcedDataGrouping && !e10.frozenStates && this.setDataGrouping(false, false);
            });
          })), this.createElements();
        }
        updateButtonStates() {
          let t10 = this, e10 = this.chart, i10 = this.dropdown, s10 = this.dropdownLabel, o10 = e10.xAxis[0], r10 = Math.round(o10.max - o10.min), a10 = !o10.hasVisibleSeries, n10 = 24 * 36e5, h10 = e10.scroller && e10.scroller.getUnionExtremes() || o10, l10 = h10.dataMin, d10 = h10.dataMax, c10 = t10.getYTDExtremes(d10, l10), p10 = c10.min, u10 = c10.max, g2 = t10.selected, f2 = t10.options.allButtonsEnabled, m2 = Array(t10.buttonOptions.length).fill(0), x2 = pe(g2), y2 = t10.buttons, b2 = false, v2 = null;
          t10.buttonOptions.forEach((e11, i11) => {
            let s11 = e11._range, h11 = e11.type, c11 = e11.count || 1, y3 = e11._offsetMax - e11._offsetMin, k2 = i11 === g2, M2 = s11 > d10 - l10, w2 = s11 < o10.minRange, S2 = false, A2 = s11 === r10;
            if (k2 && M2 && (b2 = true), o10.isOrdinal && o10.ordinal?.positions && s11 && r10 < s11) {
              let t11 = o10.ordinal.positions;
              t11[t11.length - 1] - t11[0] > s11 && (A2 = true);
            } else ("month" === h11 || "year" === h11) && r10 + 36e5 >= {
              month: 28,
              year: 365
            }[h11] * n10 * c11 - y3 && r10 - 36e5 <= {
              month: 31,
              year: 366
            }[h11] * n10 * c11 + y3 ? A2 = true : "ytd" === h11 ? (A2 = u10 - p10 + y3 === r10, S2 = !k2) : "all" === h11 && (A2 = o10.max - o10.min >= d10 - l10);
            let T2 = !f2 && !(b2 && "all" === h11) && (M2 || w2 || a10), C2 = b2 && "all" === h11 || !S2 && A2 || k2 && t10.frozenStates;
            T2 ? m2[i11] = 3 : C2 && (!x2 || i11 === g2) && (v2 = i11);
          }), null !== v2 ? (m2[v2] = 2, t10.setSelected(v2), this.dropdown && (this.dropdown.selectedIndex = v2 + 1)) : (t10.setSelected(), this.dropdown && (this.dropdown.selectedIndex = -1), s10 && (s10.setState(0), s10.attr({
            text: (c1.lang.rangeSelectorZoom || "") + " ▾"
          })));
          for (let e11 = 0; e11 < m2.length; e11++) {
            let o11 = m2[e11], r11 = y2[e11];
            if (r11.state !== o11 && (r11.setState(o11), i10)) {
              i10.options[e11 + 1].disabled = 3 === o11, 2 === o11 && (s10 && (s10.setState(2), s10.attr({
                text: t10.buttonOptions[e11].text + " ▾"
              })), i10.selectedIndex = e11 + 1);
              let r12 = s10.getBBox();
              c6(i10, {
                width: `${r12.width}px`,
                height: `${r12.height}px`
              });
            }
          }
        }
        computeButtonRange(t10) {
          let e10 = t10.type, i10 = t10.count || 1, s10 = {
            millisecond: 1,
            second: 1e3,
            minute: 6e4,
            hour: 36e5,
            day: 864e5,
            week: 6048e5
          };
          s10[e10] ? t10._range = s10[e10] * i10 : ("month" === e10 || "year" === e10) && (t10._range = 24 * {
            month: 30,
            year: 365
          }[e10] * 36e5 * i10), t10._offsetMin = pr(t10.offsetMin, 0), t10._offsetMax = pr(t10.offsetMax, 0), t10._range += t10._offsetMax - t10._offsetMin;
        }
        getInputValue(t10) {
          let e10 = "min" === t10 ? this.minInput : this.maxInput, i10 = this.chart.options.rangeSelector, s10 = this.chart.time;
          return e10 ? ("text" === e10.type && i10.inputDateParser || this.defaultInputDateParser)(e10.value, "UTC" === s10.timezone, s10) : 0;
        }
        setInputValue(t10, e10) {
          let i10 = this.options, s10 = this.chart.time, o10 = "min" === t10 ? this.minInput : this.maxInput, r10 = "min" === t10 ? this.minDateBox : this.maxDateBox;
          if (o10) {
            o10.setAttribute("type", pn(i10.inputDateFormat || "%e %b %Y"));
            let t11 = o10.getAttribute("data-hc-time"), a10 = c9(t11) ? Number(t11) : void 0;
            if (c9(e10)) {
              let t12 = a10;
              c9(t12) && o10.setAttribute("data-hc-time-previous", t12), o10.setAttribute("data-hc-time", e10), a10 = e10;
            }
            o10.value = s10.dateFormat(this.inputTypeFormats[o10.type] || i10.inputEditDateFormat, a10), r10 && r10.attr({
              text: s10.dateFormat(i10.inputDateFormat, a10)
            });
          }
        }
        setInputExtremes(t10, e10, i10) {
          let s10 = "min" === t10 ? this.minInput : this.maxInput;
          if (s10) {
            let t11 = this.inputTypeFormats[s10.type], o10 = this.chart.time;
            if (t11) {
              let r10 = o10.dateFormat(t11, e10);
              s10.min !== r10 && (s10.min = r10);
              let a10 = o10.dateFormat(t11, i10);
              s10.max !== a10 && (s10.max = a10);
            }
          }
        }
        showInput(t10) {
          let e10 = "min" === t10 ? this.minDateBox : this.maxDateBox, i10 = "min" === t10 ? this.minInput : this.maxInput;
          if (i10 && e10 && this.inputGroup) {
            let t11 = "text" === i10.type, {
              translateX: s10 = 0,
              translateY: o10 = 0
            } = this.inputGroup, {
              x: r10 = 0,
              width: a10 = 0,
              height: n10 = 0
            } = e10, {
              inputBoxWidth: h10
            } = this.options;
            c6(i10, {
              width: t11 ? a10 + (h10 ? -2 : 20) + "px" : "auto",
              height: n10 - 2 + "px",
              border: "2px solid silver"
            }), t11 && h10 ? c6(i10, {
              left: s10 + r10 + "px",
              top: o10 + "px"
            }) : c6(i10, {
              left: Math.min(Math.round(r10 + s10 - (i10.offsetWidth - a10) / 2), this.chart.chartWidth - i10.offsetWidth) + "px",
              top: o10 - (i10.offsetHeight - n10) / 2 + "px"
            });
          }
        }
        hideInput(t10) {
          let e10 = "min" === t10 ? this.minInput : this.maxInput;
          e10 && c6(e10, {
            top: "-9999em",
            border: 0,
            width: "1px",
            height: "1px"
          });
        }
        defaultInputDateParser(t10, e10, i10) {
          return i10?.parse(t10) || 0;
        }
        drawInput(t10) {
          let {
            chart: e10,
            div: i10,
            inputGroup: s10
          } = this, o10 = this, r10 = e10.renderer.style || {}, a10 = e10.renderer, n10 = e10.options.rangeSelector, h10 = c1.lang, l10 = "min" === t10;
          function d10(t11) {
            let {
              maxInput: i11,
              minInput: s11
            } = o10, r11 = e10.xAxis[0], a11 = e10.scroller?.getUnionExtremes() || r11, n11 = a11.dataMin, h11 = a11.dataMax, d11 = e10.xAxis[0].getExtremes()[t11], c11 = o10.getInputValue(t11);
            pe(c11) && c11 !== d11 && (l10 && i11 && pe(n11) ? c11 > Number(i11.getAttribute("data-hc-time")) ? c11 = void 0 : c11 < n11 && (c11 = n11) : s11 && pe(h11) && (c11 < Number(s11.getAttribute("data-hc-time")) ? c11 = void 0 : c11 > h11 && (c11 = h11)), void 0 !== c11 && r11.setExtremes(l10 ? c11 : r11.min, l10 ? r11.max : c11, void 0, void 0, {
              trigger: "rangeSelectorInput"
            }));
          }
          let c10 = h10[l10 ? "rangeSelectorFrom" : "rangeSelectorTo"] || "", p10 = a10.label(c10, 0).addClass("highcharts-range-label").attr({
            padding: 2 * !!c10,
            height: c10 ? n10.inputBoxHeight : 0
          }).add(s10), u10 = a10.label("", 0).addClass("highcharts-range-input").attr({
            padding: 2,
            width: n10.inputBoxWidth,
            height: n10.inputBoxHeight,
            "text-align": "center"
          }).on("click", function() {
            o10.showInput(t10), o10[t10 + "Input"].focus();
          });
          e10.styledMode || u10.attr({
            stroke: n10.inputBoxBorderColor,
            "stroke-width": 1
          }), u10.add(s10);
          let g2 = c5("input", {
            name: t10,
            className: "highcharts-range-selector"
          }, void 0, i10);
          g2.setAttribute("type", pn(n10.inputDateFormat || "%e %b %Y")), e10.styledMode || (p10.css(ps(r10, n10.labelStyle)), u10.css(ps({
            color: "#333333"
          }, r10, n10.inputStyle)), c6(g2, c7({
            position: "absolute",
            border: 0,
            boxShadow: "0 0 15px rgba(0,0,0,0.3)",
            width: "1px",
            height: "1px",
            padding: 0,
            textAlign: "center",
            fontSize: r10.fontSize,
            fontFamily: r10.fontFamily,
            top: "-9999em"
          }, n10.inputStyle))), g2.onfocus = () => {
            o10.showInput(t10);
          }, g2.onblur = () => {
            g2 === V.doc.activeElement && d10(t10), o10.hideInput(t10), o10.setInputValue(t10), g2.blur();
          };
          let f2 = false;
          return g2.onchange = () => {
            f2 || (d10(t10), o10.hideInput(t10), g2.blur());
          }, g2.onkeypress = (e11) => {
            13 === e11.keyCode && d10(t10);
          }, g2.onkeydown = (e11) => {
            f2 = true, ("ArrowUp" === e11.key || "ArrowDown" === e11.key || "Tab" === e11.key) && d10(t10);
          }, g2.onkeyup = () => {
            f2 = false;
          }, {
            dateBox: u10,
            input: g2,
            label: p10
          };
        }
        getPosition() {
          let t10 = this.chart, e10 = t10.options.rangeSelector, i10 = "top" === e10.verticalAlign ? t10.plotTop - t10.axisOffset[0] : 0;
          return {
            buttonTop: i10 + e10.buttonPosition.y,
            inputTop: i10 + e10.inputPosition.y - 10
          };
        }
        getYTDExtremes(t10, e10) {
          let i10 = this.chart.time, s10 = i10.toParts(t10)[0];
          return {
            max: t10,
            min: Math.max(e10, i10.makeTime(s10, 0))
          };
        }
        createElements() {
          let t10 = this.chart, e10 = t10.renderer, i10 = t10.container, s10 = t10.options, o10 = s10.rangeSelector, r10 = o10.inputEnabled, a10 = pr(s10.chart.style?.zIndex, 0) + 1;
          false !== o10.enabled && (this.group = e10.g("range-selector-group").attr({
            zIndex: 7
          }).add(), this.div = c5("div", void 0, {
            position: "relative",
            height: 0,
            zIndex: a10
          }), this.buttonOptions.length && this.renderButtons(), i10.parentNode && i10.parentNode.insertBefore(this.div, i10), r10 && this.createInputs());
        }
        createInputs() {
          this.inputGroup = this.chart.renderer.g("input-group").add(this.group);
          let t10 = this.drawInput("min");
          this.minDateBox = t10.dateBox, this.minLabel = t10.label, this.minInput = t10.input;
          let e10 = this.drawInput("max");
          this.maxDateBox = e10.dateBox, this.maxLabel = e10.label, this.maxInput = e10.input;
        }
        render(t10, e10) {
          if (false === this.options.enabled) return;
          let i10 = this.chart, s10 = i10.options.rangeSelector;
          if (s10.inputEnabled) {
            this.inputGroup || this.createInputs(), this.setInputValue("min", t10), this.setInputValue("max", e10), this.chart.styledMode || (this.maxLabel?.css(s10.labelStyle), this.minLabel?.css(s10.labelStyle));
            let o10 = i10.scroller && i10.scroller.getUnionExtremes() || i10.xAxis[0] || {};
            if (c9(o10.dataMin) && c9(o10.dataMax)) {
              let t11 = i10.xAxis[0].minRange || 0;
              this.setInputExtremes("min", o10.dataMin, Math.min(o10.dataMax, this.getInputValue("max")) - t11), this.setInputExtremes("max", Math.max(o10.dataMin, this.getInputValue("min")) + t11, o10.dataMax);
            }
            if (this.inputGroup) {
              let t11 = 0;
              [this.minLabel, this.minDateBox, this.maxLabel, this.maxDateBox].forEach((e11) => {
                if (e11) {
                  let {
                    width: i11
                  } = e11.getBBox();
                  i11 && (e11.attr({
                    x: t11
                  }), t11 += i11 + s10.inputSpacing);
                }
              });
            }
          } else this.inputGroup && (this.inputGroup.destroy(), delete this.inputGroup);
          !this.chart.styledMode && this.zoomText && this.zoomText.css(s10.labelStyle), this.alignElements(), this.updateButtonStates();
        }
        renderButtons() {
          var t10;
          let {
            chart: e10,
            options: i10
          } = this, s10 = c1.lang, o10 = e10.renderer, r10 = ps(i10.buttonTheme), a10 = r10 && r10.states;
          delete r10.width, delete r10.states, this.buttonGroup = o10.g("range-selector-buttons").add(this.group);
          let n10 = this.dropdown = c5("select", void 0, {
            position: "absolute",
            padding: 0,
            border: 0,
            cursor: "pointer",
            opacity: 1e-4
          }, this.div), h10 = e10.userOptions.rangeSelector?.buttonTheme;
          this.dropdownLabel = o10.button("", 0, 0, () => {
          }, ps(r10, {
            "stroke-width": pr(r10["stroke-width"], 0),
            width: "auto",
            paddingLeft: pr(i10.buttonTheme.paddingLeft, h10?.padding, 8),
            paddingRight: pr(i10.buttonTheme.paddingRight, h10?.padding, 8)
          }), a10 && a10.hover, a10 && a10.select, a10 && a10.disabled).hide().add(this.group), c3(n10, "touchstart", () => {
            n10.style.fontSize = "16px";
          });
          let l10 = V.isMS ? "mouseover" : "mouseenter", d10 = V.isMS ? "mouseout" : "mouseleave";
          c3(n10, l10, () => {
            pt(this.dropdownLabel.element, l10);
          }), c3(n10, d10, () => {
            pt(this.dropdownLabel.element, d10);
          }), c3(n10, "change", () => {
            pt(this.buttons[n10.selectedIndex - 1].element, "click");
          }), this.zoomText = o10.label(s10.rangeSelectorZoom || "", 0).attr({
            padding: i10.buttonTheme.padding,
            height: i10.buttonTheme.height,
            paddingLeft: 0,
            paddingRight: 0
          }).add(this.buttonGroup), this.chart.styledMode || (this.zoomText.css(i10.labelStyle), (t10 = i10.buttonTheme)["stroke-width"] ?? (t10["stroke-width"] = 0)), c5("option", {
            textContent: this.zoomText.textStr,
            disabled: true
          }, void 0, n10), this.createButtons();
        }
        createButtons() {
          let {
            options: t10
          } = this, e10 = ps(t10.buttonTheme), i10 = e10 && e10.states, s10 = e10.width || 28;
          delete e10.width, delete e10.states, this.buttonOptions.forEach((t11, e11) => {
            this.createButton(t11, e11, s10, i10);
          });
        }
        createButton(t10, e10, i10, s10) {
          let {
            dropdown: o10,
            buttons: r10,
            chart: a10,
            options: n10
          } = this, h10 = a10.renderer, l10 = ps(n10.buttonTheme);
          o10?.add(c5("option", {
            textContent: t10.title || t10.text
          }), e10 + 2), r10[e10] = h10.button(t10.text ?? "", 0, 0, (i11) => {
            let s11, o11 = t10.events && t10.events.click;
            o11 && (s11 = o11.call(t10, i11)), false !== s11 && this.clickButton(e10), this.isActive = true;
          }, l10, s10 && s10.hover, s10 && s10.select, s10 && s10.disabled).attr({
            "text-align": "center",
            width: i10
          }).add(this.buttonGroup), t10.title && r10[e10].attr("title", t10.title);
        }
        alignElements() {
          let {
            buttonGroup: t10,
            buttons: e10,
            chart: i10,
            group: s10,
            inputGroup: o10,
            options: r10,
            zoomText: a10
          } = this, n10 = i10.options, h10 = n10.exporting && false !== n10.exporting.enabled && n10.navigation && n10.navigation.buttonOptions, {
            buttonPosition: l10,
            inputPosition: d10,
            verticalAlign: c10
          } = r10, p10 = (t11, e11, s11) => h10 && this.titleCollision(i10) && "top" === c10 && s11 && e11.y - t11.getBBox().height - 12 < (h10.y || 0) + (h10.height || 0) + i10.spacing[0] ? -40 : 0, u10 = i10.plotLeft;
          if (s10 && l10 && d10) {
            let n11 = l10.x - i10.spacing[3];
            if (t10) {
              if (this.positionButtons(), !this.initialButtonGroupWidth) {
                let t11 = 0;
                a10 && (t11 += a10.getBBox().width + 5), e10.forEach((i11, s11) => {
                  t11 += i11.width || 0, s11 !== e10.length - 1 && (t11 += r10.buttonSpacing);
                }), this.initialButtonGroupWidth = t11;
              }
              u10 -= i10.spacing[3];
              let o11 = p10(t10, l10, "right" === l10.align || "right" === d10.align);
              this.alignButtonGroup(o11), this.buttonGroup?.translateY && this.dropdownLabel.attr({
                y: this.buttonGroup.translateY
              }), s10.placed = t10.placed = i10.hasLoaded;
            }
            let h11 = 0;
            r10.inputEnabled && o10 && (h11 = p10(o10, d10, "right" === l10.align || "right" === d10.align), "left" === d10.align ? n11 = u10 : "right" === d10.align && (n11 = -Math.max(i10.axisOffset[1], -h11)), o10.align({
              y: d10.y,
              width: o10.getBBox().width,
              align: d10.align,
              x: d10.x + n11 - 2
            }, true, i10.spacingBox), o10.placed = i10.hasLoaded), this.handleCollision(h11), s10.align({
              verticalAlign: c10
            }, true, i10.spacingBox);
            let g2 = s10.alignAttr.translateY, f2 = s10.getBBox().height + 20, m2 = 0;
            if ("bottom" === c10) {
              let t11 = i10.legend && i10.legend.options;
              m2 = g2 - (f2 = f2 + (t11 && "bottom" === t11.verticalAlign && t11.enabled && !t11.floating ? i10.legend.legendHeight + pr(t11.margin, 10) : 0) - 20) - (r10.floating ? 0 : r10.y) - (i10.titleOffset ? i10.titleOffset[2] : 0) - 10;
            }
            "top" === c10 ? (r10.floating && (m2 = 0), i10.titleOffset && i10.titleOffset[0] && (m2 = i10.titleOffset[0]), m2 += i10.margin[0] - i10.spacing[0] || 0) : "middle" === c10 && (d10.y === l10.y ? m2 = g2 : (d10.y || l10.y) && (d10.y < 0 || l10.y < 0 ? m2 -= Math.min(d10.y, l10.y) : m2 = g2 - f2)), s10.translate(r10.x, r10.y + Math.floor(m2));
            let {
              minInput: x2,
              maxInput: y2,
              dropdown: b2
            } = this;
            r10.inputEnabled && x2 && y2 && (x2.style.marginTop = s10.translateY + "px", y2.style.marginTop = s10.translateY + "px"), b2 && (b2.style.marginTop = s10.translateY + "px");
          }
        }
        redrawElements() {
          let t10 = this.chart, {
            inputBoxHeight: e10,
            inputBoxBorderColor: i10
          } = this.options;
          if (this.maxDateBox?.attr({
            height: e10
          }), this.minDateBox?.attr({
            height: e10
          }), t10.styledMode || (this.maxDateBox?.attr({
            stroke: i10
          }), this.minDateBox?.attr({
            stroke: i10
          })), this.isDirty) {
            this.isDirty = false, this.isCollapsed = void 0;
            let t11 = this.options.buttons ?? [], e11 = Math.min(t11.length, this.buttonOptions.length), {
              dropdown: i11,
              options: s10
            } = this, o10 = ps(s10.buttonTheme), r10 = o10 && o10.states, a10 = o10.width || 28;
            if (t11.length < this.buttonOptions.length) for (let e12 = this.buttonOptions.length - 1; e12 >= t11.length; e12--) {
              let t12 = this.buttons.pop();
              t12?.destroy(), this.dropdown?.options.remove(e12 + 1);
            }
            for (let s11 = e11 - 1; s11 >= 0; s11--) {
              let e12 = t11[s11];
              this.buttons[s11].destroy(), i11?.options.remove(s11 + 1), this.createButton(e12, s11, a10, r10), this.computeButtonRange(e12);
            }
            if (t11.length > this.buttonOptions.length) for (let e12 = this.buttonOptions.length; e12 < t11.length; e12++) this.createButton(t11[e12], e12, a10, r10), this.computeButtonRange(t11[e12]);
            this.buttonOptions = this.options.buttons ?? [], c9(this.options.selected) && this.buttons.length && this.clickButton(this.options.selected, false);
          }
        }
        alignButtonGroup(t10, e10) {
          let {
            chart: i10,
            options: s10,
            buttonGroup: o10,
            dropdown: r10,
            dropdownLabel: a10
          } = this, {
            buttonPosition: n10
          } = s10, h10 = i10.plotLeft - i10.spacing[3], l10 = n10.x - i10.spacing[3], d10 = i10.plotLeft;
          "right" === n10.align ? (l10 += t10 - h10, this.hasVisibleDropdown && (d10 = i10.chartWidth + t10 - this.maxButtonWidth() - 20)) : "center" === n10.align && (l10 -= h10 / 2, this.hasVisibleDropdown && (d10 = i10.chartWidth / 2 - this.maxButtonWidth())), r10 && c6(r10, {
            left: d10 + "px",
            top: o10?.translateY + "px"
          }), a10?.attr({
            x: d10
          }), o10 && o10.align({
            y: n10.y,
            width: pr(e10, this.initialButtonGroupWidth),
            align: n10.align,
            x: l10
          }, true, i10.spacingBox);
        }
        positionButtons() {
          let {
            buttons: t10,
            chart: e10,
            options: i10,
            zoomText: s10
          } = this, o10 = e10.hasLoaded ? "animate" : "attr", {
            buttonPosition: r10
          } = i10, a10 = e10.plotLeft, n10 = a10;
          s10 && "hidden" !== s10.visibility && (s10[o10]({
            x: pr(a10 + r10.x, a10)
          }), n10 += r10.x + s10.getBBox().width + 5);
          for (let e11 = 0, s11 = this.buttonOptions.length; e11 < s11; ++e11) "hidden" !== t10[e11].visibility ? (t10[e11][o10]({
            x: n10
          }), n10 += (t10[e11].width || 0) + i10.buttonSpacing) : t10[e11][o10]({
            x: a10
          });
        }
        handleCollision(t10) {
          let {
            chart: e10,
            buttonGroup: i10,
            inputGroup: s10,
            initialButtonGroupWidth: o10
          } = this, {
            buttonPosition: r10,
            dropdown: a10,
            inputPosition: n10
          } = this.options, h10 = () => {
            s10 && i10 && s10.attr({
              translateX: s10.alignAttr.translateX + (e10.axisOffset[1] >= -t10 ? 0 : -t10),
              translateY: s10.alignAttr.translateY + i10.getBBox().height + 10
            });
          };
          s10 && i10 ? n10.align === r10.align ? (h10(), o10 > e10.plotWidth + t10 - 20 ? this.collapseButtons() : this.expandButtons()) : o10 - t10 + s10.getBBox().width > e10.plotWidth ? "responsive" === a10 || "always" === a10 ? this.collapseButtons() : h10() : this.expandButtons() : i10 && "responsive" === a10 && (o10 > e10.plotWidth ? this.collapseButtons() : this.expandButtons()), i10 && ("always" === a10 && this.collapseButtons(), "never" === a10 && this.expandButtons()), this.alignButtonGroup(t10);
        }
        collapseButtons() {
          let {
            buttons: t10,
            zoomText: e10
          } = this;
          true !== this.isCollapsed && (this.isCollapsed = true, e10.hide(), t10.forEach((t11) => void t11.hide()), this.showDropdown());
        }
        expandButtons() {
          let {
            buttons: t10,
            zoomText: e10
          } = this;
          false !== this.isCollapsed && (this.isCollapsed = false, this.hideDropdown(), e10.show(), t10.forEach((t11) => void t11.show()), this.positionButtons());
        }
        showDropdown() {
          let {
            buttonGroup: t10,
            dropdownLabel: e10,
            dropdown: i10
          } = this;
          t10 && i10 && (e10.show(), c6(i10, {
            visibility: "inherit"
          }), this.hasVisibleDropdown = true);
        }
        hideDropdown() {
          let {
            dropdown: t10
          } = this;
          t10 && (this.dropdownLabel.hide(), c6(t10, {
            visibility: "hidden"
          }), this.hasVisibleDropdown = false);
        }
        getHeight() {
          let t10 = this.options, e10 = this.group, i10 = t10.inputPosition, s10 = t10.buttonPosition, o10 = t10.y, r10 = s10.y, a10 = i10.y, n10 = 0;
          if (t10.height) return t10.height;
          this.alignElements(), n10 = e10 ? e10.getBBox(true).height + 13 + o10 : 0;
          let h10 = Math.min(a10, r10);
          return (a10 < 0 && r10 < 0 || a10 > 0 && r10 > 0) && (n10 += Math.abs(h10)), n10;
        }
        titleCollision(t10) {
          return !(t10.options.title.text || t10.options.subtitle.text);
        }
        update(t10, e10 = true) {
          let i10 = this.chart;
          if (ps(true, this.options, t10), this.options.selected && this.options.selected >= this.options.buttons.length && (this.options.selected = void 0, i10.options.rangeSelector.selected = void 0), c9(t10.enabled)) return this.destroy(), this.init(i10);
          this.isDirty = !!t10.buttons || !!t10.buttonTheme, e10 && this.render();
        }
        destroy() {
          let t10 = this, e10 = t10.minInput, i10 = t10.maxInput;
          t10.eventsToUnbind && (t10.eventsToUnbind.forEach((t11) => t11()), t10.eventsToUnbind = void 0), c4(t10.buttons), e10 && (e10.onfocus = e10.onblur = e10.onchange = null), i10 && (i10.onfocus = i10.onblur = i10.onchange = null), po(t10, function(e11, i11) {
            e11 && "chart" !== i11 && (e11 instanceof ic ? e11.destroy() : e11 instanceof window.HTMLElement && c8(e11), delete t10[i11]), e11 !== ph.prototype[i11] && (t10[i11] = null);
          }, this), this.buttons = [];
        }
      }
      c7(ph.prototype, {
        inputTypeFormats: {
          "datetime-local": "%Y-%m-%dT%H:%M:%S",
          date: "%Y-%m-%d",
          time: "%H:%M:%S"
        }
      });
      let {
        format: pl
      } = eI, {
        getOptions: pd
      } = tY, {
        setFixedRange: pc
      } = dR, {
        addEvent: pp,
        clamp: pu,
        crisp: pg,
        defined: pf,
        extend: pm,
        find: px,
        isNumber: py,
        isString: pb,
        merge: pv,
        pick: pk,
        splat: pM
      } = tx;
      function pw(t10, e10, i10) {
        return "xAxis" === t10 ? {
          minPadding: 0,
          maxPadding: 0,
          overscroll: 0,
          ordinal: true
        } : "yAxis" === t10 ? {
          labels: {
            y: -2
          },
          opposite: i10.opposite ?? e10.opposite ?? true,
          showLastLabel: !!(e10.categories || "category" === e10.type),
          title: {
            text: void 0
          }
        } : {};
      }
      function pS(t10, e10) {
        if ("xAxis" === t10) {
          let t11 = pk(e10.navigator?.enabled, dB.enabled, true), i10 = {
            type: "datetime",
            categories: void 0
          };
          return t11 && (i10.startOnTick = false, i10.endOnTick = false), i10;
        }
        return {};
      }
      class pA extends ny {
        init(t10, e10) {
          let i10 = pd(), s10 = t10.xAxis, o10 = t10.yAxis, r10 = pk(t10.navigator?.enabled, dB.enabled, true);
          t10.xAxis = t10.yAxis = void 0;
          let a10 = pv({
            chart: {
              panning: {
                enabled: true,
                type: "x"
              },
              zooming: {
                pinchType: "x",
                mouseWheel: {
                  type: "x"
                }
              }
            },
            navigator: {
              enabled: r10
            },
            scrollbar: {
              enabled: pk(dQ.enabled, true)
            },
            rangeSelector: {
              enabled: pk(cz.enabled, true)
            },
            title: {
              text: null
            },
            tooltip: {
              split: pk(i10.tooltip?.split, true),
              crosshairs: true
            },
            legend: {
              enabled: false
            }
          }, t10, {
            isStock: true
          });
          t10.xAxis = s10, t10.yAxis = o10, a10.xAxis = pM(t10.xAxis || {}).map((e11) => pv(pw("xAxis", e11, i10.xAxis), e11, pS("xAxis", t10))), a10.yAxis = pM(t10.yAxis || {}).map((t11) => pv(pw("yAxis", t11, i10.yAxis), t11)), super.init(a10, e10);
        }
        createAxis(t10, e10) {
          return e10.axis = pv(pw(t10, e10.axis, pd()[t10]), e10.axis, pS(t10, this.userOptions)), super.createAxis(t10, e10);
        }
      }
      pp(ny, "update", function(t10) {
        let e10 = t10.options;
        "scrollbar" in e10 && this.navigator && (pv(true, this.options.scrollbar, e10.scrollbar), this.navigator.update({
          enabled: !!this.navigator.navigatorEnabled
        }), delete e10.scrollbar);
      }), function(t10) {
        function e10(t11) {
          if (!(this.crosshair?.label?.enabled && this.cross && py(this.min) && py(this.max))) return;
          let e11 = this.chart, i11 = this.logarithmic, s11 = this.crosshair.label, o11 = this.horiz, r11 = this.opposite, a11 = this.left, n11 = this.top, h11 = this.width, l10 = "inside" === this.options.tickPosition, d10 = false !== this.crosshair.snap, c10 = t11.e || this.cross?.e, p10 = t11.point, u10 = this.crossLabel, g2, f2, m2 = s11.format, x2 = "", y2, b2 = 0, v2 = this.min, k2 = this.max;
          i11 && (v2 = i11.lin2log(this.min), k2 = i11.lin2log(this.max));
          let M2 = o11 ? "center" : r11 ? "right" === this.labelAlign ? "right" : "left" : "left" === this.labelAlign ? "left" : "center";
          !u10 && (u10 = this.crossLabel = e11.renderer.label("", 0, void 0, s11.shape || "callout").addClass("highcharts-crosshair-label highcharts-color-" + (p10?.series ? p10.series.colorIndex : this.series[0] && this.series[0].colorIndex)).attr({
            align: s11.align || M2,
            padding: pk(s11.padding, 8),
            r: pk(s11.borderRadius, 3),
            zIndex: 2
          }).add(this.labelGroup), e11.styledMode || u10.attr({
            fill: s11.backgroundColor || p10?.series?.color || "#666666",
            stroke: s11.borderColor || "",
            "stroke-width": s11.borderWidth || 0
          }).css(pm({
            color: "#ffffff",
            fontWeight: "normal",
            fontSize: "0.7em",
            textAlign: "center"
          }, s11.style || {}))), o11 ? (g2 = d10 ? (p10.plotX || 0) + a11 : c10.chartX, f2 = n11 + (r11 ? 0 : this.height)) : (g2 = a11 + this.offset + (r11 ? h11 : 0), f2 = d10 ? (p10.plotY || 0) + n11 : c10.chartY), m2 || s11.formatter || (this.dateTime && (x2 = "%b %d, %Y"), m2 = "{value" + (x2 ? ":" + x2 : "") + "}");
          let w2 = d10 ? this.isXAxis ? p10.x : p10.y : this.toValue(o11 ? c10.chartX : c10.chartY), S2 = p10?.series ? p10.series.isPointInside(p10) : py(w2) && w2 > v2 && w2 < k2, A2 = "";
          m2 ? A2 = pl(m2, {
            value: w2
          }, e11) : s11.formatter && py(w2) && (A2 = s11.formatter.call(this, w2)), u10.attr({
            text: A2,
            x: g2,
            y: f2,
            visibility: S2 ? "inherit" : "hidden"
          });
          let T2 = u10.getBBox();
          !py(u10.x) || o11 || r11 || (g2 = u10.x - T2.width / 2), py(u10.y) && (o11 ? (l10 && !r11 || !l10 && r11) && (f2 = u10.y - T2.height) : f2 = u10.y - T2.height / 2), y2 = o11 ? {
            left: a11,
            right: a11 + this.width
          } : {
            left: "left" === this.labelAlign ? a11 : 0,
            right: "right" === this.labelAlign ? a11 + this.width : e11.chartWidth
          };
          let C2 = u10.translateX || 0;
          C2 < y2.left && (b2 = y2.left - C2), C2 + T2.width >= y2.right && (b2 = -(C2 + T2.width - y2.right)), u10.attr({
            x: Math.max(0, g2 + b2),
            y: Math.max(0, f2),
            anchorX: o11 ? g2 : this.opposite ? 0 : e11.chartWidth,
            anchorY: o11 ? this.opposite ? e11.chartHeight : 0 : f2 + T2.height / 2
          });
        }
        function i10() {
          this.crossLabel && (this.crossLabel = this.crossLabel.hide());
        }
        function s10(t11) {
          let e11 = this.chart, i11 = this.options, s11 = e11._labelPanes = e11._labelPanes || {}, o11 = i11.labels;
          if (e11.options.isStock && "yAxis" === this.coll) {
            let e12 = i11.top + "," + i11.height;
            !s11[e12] && o11.enabled && (15 === o11.distance && 1 === this.side && (o11.distance = 0), void 0 === o11.align && (o11.align = "right"), s11[e12] = this, t11.align = "right", t11.preventDefault());
          }
        }
        function o10() {
          let t11 = this.chart, e11 = this.options && this.options.top + "," + this.options.height;
          e11 && t11._labelPanes && t11._labelPanes[e11] === this && delete t11._labelPanes[e11];
        }
        function r10(t11) {
          let e11 = this.isLinked && !this.series && this.linkedParent ? this.linkedParent.series : this.series, {
            chart: i11,
            horiz: s11
          } = this, o11 = i11.renderer, r11 = [], {
            acrossPanes: a11 = true,
            force: n11,
            translatedValue: h11,
            value: l10
          } = t11, d10 = (this.isXAxis ? i11.yAxis : i11.xAxis) || [];
          function c10(t12, e12, i12) {
            r11.push(["M", s11 ? t12 : e12, s11 ? e12 : t12], ["L", s11 ? t12 : i12, s11 ? i12 : t12]);
          }
          let p10 = [], u10, g2;
          if (i11.options.isStock && ("xAxis" === this.coll || "yAxis" === this.coll)) {
            let f2, m2;
            for (let s12 of (t11.preventDefault(), f2 = "xAxis" === this.coll ? "yAxis" : "xAxis", m2 = this.options[f2], p10 = a11 && !this.options.isInternal ? d10.filter((t12) => !t12.options.isInternal) : py(m2) ? [i11[f2][m2]] : pb(m2) ? [i11.get(m2)] : e11.map((t12) => t12[f2]), d10)) if (!s12.options.isInternal) {
              let t12 = s12.isXAxis ? "yAxis" : "xAxis";
              this === (pf(s12.options[t12]) && i11[t12][s12.options[t12]]) && p10.push(s12);
            }
            for (let t12 of (u10 = p10.length ? [] : [this.isXAxis ? i11.yAxis[0] : i11.xAxis[0]], p10)) -1 !== u10.indexOf(t12) || px(u10, (e12) => e12.pos === t12.pos && e12.len === t12.len) || u10.push(t12);
            if (py(g2 = pk(h11, this.translate(l10 || 0, void 0, void 0, t11.old)))) {
              let t12, e12 = s11 ? g2 + this.pos : this.pos + this.len - g2;
              if ("pass" !== n11 && (e12 < this.pos || e12 > this.pos + this.len) && (n11 ? e12 = pu(e12, this.pos, this.pos + this.len) : t12 = true), !t12) {
                let t13 = s11 ? "top" : "left", i12 = s11 ? "height" : "width";
                if (!a11 && (this.options[t13] || this.options[i12])) c10(e12, this[t13], this[t13] + this[i12]);
                else for (let t14 of u10) c10(e12, t14.pos, t14.pos + t14.len);
              }
            }
            t11.path = r11.length > 0 ? o11.crispPolyLine(r11, t11.lineWidth || 1) : void 0;
          }
        }
        function a10(t11) {
          if (this.chart.options.isStock) {
            let e11;
            this.is("column") || this.is("columnrange") ? e11 = {
              borderWidth: 0,
              shadow: false
            } : this.is("scatter") || this.is("sma") || (e11 = {
              marker: {
                enabled: false,
                radius: 2
              }
            }), e11 && (t11.plotOptions[this.type] = pv(t11.plotOptions[this.type], e11));
          }
        }
        function n10() {
          let t11 = this.chart, e11 = this.options.dataGrouping;
          return false !== this.allowDG && e11 && pk(e11.enabled, t11.options.isStock);
        }
        function h10(t11, e11) {
          for (let i11 = 0; i11 < t11.length; i11 += 2) {
            let s11 = t11[i11], o11 = t11[i11 + 1];
            pf(s11[1]) && s11[1] === o11[1] && (s11[1] = o11[1] = pg(s11[1], e11)), pf(s11[2]) && s11[2] === o11[2] && (s11[2] = o11[2] = pg(s11[2], e11));
          }
          return t11;
        }
        t10.compose = function(t11, l10, d10, c10) {
          let p10 = d10.prototype;
          p10.forceCropping || (pp(l10, "afterDrawCrosshair", e10), pp(l10, "afterHideCrosshair", i10), pp(l10, "autoLabelAlign", s10), pp(l10, "destroy", o10), pp(l10, "getPlotLinePath", r10), t11.prototype.setFixedRange = pc, p10.forceCropping = n10, pp(d10, "setOptions", a10), c10.prototype.crispPolyLine = h10);
        }, t10.stockChart = function(e11, i11, s11) {
          return new t10(e11, i11, s11);
        };
      }(pA || (pA = {}));
      let pT = pA, {
        column: {
          prototype: {
            pointClass: pC
          }
        }
      } = r_.seriesTypes, {
        column: pP
      } = r_.seriesTypes, {
        crisp: pO,
        extend: pE,
        merge: pL
      } = tx, {
        defaultOptions: pB
      } = tY;
      class pD extends pP {
        extendStem(t10, e10, i10) {
          let s10 = t10[0], o10 = t10[1];
          "number" == typeof s10[2] && (s10[2] = Math.max(i10 + e10, s10[2])), "number" == typeof o10[2] && (o10[2] = Math.min(i10 - e10, o10[2]));
        }
        getPointPath(t10, e10) {
          let i10 = e10.strokeWidth(), s10 = t10.series, o10 = pO(t10.plotX || 0, i10), r10 = Math.round(t10.shapeArgs.width / 2), a10 = [["M", o10, Math.round(t10.yBottom)], ["L", o10, Math.round(t10.plotHigh)]];
          if (null !== t10.close) {
            let e11 = pO(t10.plotClose, i10);
            a10.push(["M", o10, e11], ["L", o10 + r10, e11]), s10.extendStem(a10, i10 / 2, e11);
          }
          return a10;
        }
        drawSinglePoint(t10) {
          let e10 = t10.series, i10 = e10.chart, s10, o10 = t10.graphic;
          void 0 !== t10.plotY && (o10 || (t10.graphic = o10 = i10.renderer.path().add(e10.group)), i10.styledMode || o10.attr(e10.pointAttribs(t10, t10.selected && "select")), s10 = e10.getPointPath(t10, o10), o10[!o10 ? "attr" : "animate"]({
            d: s10
          }).addClass(t10.getClassName(), true));
        }
        drawPoints() {
          this.points.forEach(this.drawSinglePoint);
        }
        init() {
          super.init.apply(this, arguments), this.options.stacking = void 0;
        }
        pointAttribs(t10, e10) {
          let i10 = super.pointAttribs.call(this, t10, e10);
          return delete i10.fill, i10;
        }
        toYData(t10) {
          return [t10.high, t10.low, t10.close];
        }
        translate() {
          let t10 = this, e10 = t10.yAxis, i10 = this.pointArrayMap && this.pointArrayMap.slice() || [], s10 = i10.map((t11) => `plot${t11.charAt(0).toUpperCase() + t11.slice(1)}`);
          s10.push("yBottom"), i10.push("low"), super.translate.apply(t10), t10.points.forEach(function(o10) {
            i10.forEach(function(i11, r10) {
              let a10 = o10[i11];
              null !== a10 && (t10.dataModify && (a10 = t10.dataModify.modifyValue(a10)), o10[s10[r10]] = e10.toPixels(a10, true));
            }), o10.tooltipPos[1] = o10.plotHigh + e10.pos - t10.chart.plotTop;
          });
        }
      }
      pD.defaultOptions = pL(pP.defaultOptions, {
        lineWidth: 1,
        tooltip: {
          pointFormat: '<span style="color:{point.color}">●</span> <b> {series.name}</b><br/>{series.chart.options.lang.stockHigh}: {point.high}<br/>{series.chart.options.lang.stockLow}: {point.low}<br/>{series.chart.options.lang.stockClose}: {point.close}<br/>'
        },
        threshold: null,
        states: {
          hover: {
            lineWidth: 3
          }
        },
        stickyTracking: true
      }), pE(pD.prototype, {
        pointClass: class extends pC {
        },
        animate: null,
        directTouch: false,
        keysAffectYAxis: ["low", "high"],
        pointArrayMap: ["high", "low", "close"],
        pointAttrToOptions: {
          stroke: "color",
          "stroke-width": "lineWidth"
        },
        pointValKey: "close"
      }), pE(pB.lang, {
        stockOpen: "Open",
        stockHigh: "High",
        stockLow: "Low",
        stockClose: "Close"
      }), r_.registerSeriesType("hlc", pD);
      let {
        seriesTypes: {
          hlc: pI
        }
      } = r_;
      class pz extends pI.prototype.pointClass {
        getClassName() {
          return super.getClassName.call(this) + (this.open < this.close ? " highcharts-point-up" : " highcharts-point-down");
        }
        resolveUpColor() {
          this.open < this.close && !this.options.color && this.series.options.upColor && (this.color = this.series.options.upColor);
        }
        resolveColor() {
          super.resolveColor(), this.series.is("heikinashi") || this.resolveUpColor();
        }
        getZone() {
          let t10 = super.getZone();
          return this.resolveUpColor(), t10;
        }
        applyOptions() {
          return super.applyOptions.apply(this, arguments), this.resolveColor && this.resolveColor(), this;
        }
      }
      let {
        composed: pR
      } = V, {
        hlc: pN
      } = r_.seriesTypes, {
        addEvent: pW,
        crisp: pG,
        extend: pX,
        merge: pH,
        pushUnique: pF
      } = tx;
      function pY(t10) {
        let e10 = t10.options, i10 = e10.dataGrouping;
        i10 && e10.useOhlcData && "highcharts-navigator-series" !== e10.id && (i10.approximation = "ohlc");
      }
      function pj(t10) {
        let e10 = t10.options;
        e10.useOhlcData && "highcharts-navigator-series" !== e10.id && pX(this, {
          pointValKey: pU.prototype.pointValKey,
          pointArrayMap: pU.prototype.pointArrayMap,
          toYData: pU.prototype.toYData
        });
      }
      class pU extends pN {
        static compose(t10) {
          pF(pR, "OHLCSeries") && (pW(t10, "afterSetOptions", pY), pW(t10, "init", pj));
        }
        getPointPath(t10, e10) {
          let i10 = super.getPointPath(t10, e10), s10 = e10.strokeWidth(), o10 = pG(t10.plotX || 0, s10), r10 = Math.round(t10.shapeArgs.width / 2);
          if (null !== t10.open) {
            let e11 = pG(t10.plotOpen, s10);
            i10.push(["M", o10, e11], ["L", o10 - r10, e11]), super.extendStem(i10, s10 / 2, e11);
          }
          return i10;
        }
        pointAttribs(t10, e10) {
          let i10 = super.pointAttribs.call(this, t10, e10), s10 = this.options;
          return delete i10.fill, !t10.options.color && s10.upColor && t10.open < t10.close && (i10.stroke = s10.upColor), i10;
        }
        toYData(t10) {
          return [t10.open, t10.high, t10.low, t10.close];
        }
      }
      pU.defaultOptions = pH(pN.defaultOptions, {
        tooltip: {
          pointFormat: '<span style="color:{point.color}">●</span> <b> {series.name}</b><br/>{series.chart.options.lang.stockOpen}: {point.open}<br/>{series.chart.options.lang.stockHigh}: {point.high}<br/>{series.chart.options.lang.stockLow}: {point.low}<br/>{series.chart.options.lang.stockClose}: {point.close}<br/>'
        }
      }), pX(pU.prototype, {
        pointClass: pz,
        pointArrayMap: ["open", "high", "low", "close"]
      }), r_.registerSeriesType("ohlc", pU);
      let {
        column: pV,
        ohlc: p$
      } = r_.seriesTypes, {
        crisp: p_,
        merge: pZ
      } = tx;
      class pq extends p$ {
        pointAttribs(t10, e10) {
          let i10 = pV.prototype.pointAttribs.call(this, t10, e10), s10 = this.options, o10 = t10.open < t10.close, r10 = s10.lineColor || this.color, a10 = t10.color || this.color;
          if (i10["stroke-width"] = s10.lineWidth, i10.fill = t10.options.color || o10 && s10.upColor || a10, i10.stroke = t10.options.lineColor || o10 && s10.upLineColor || r10, e10) {
            let t11 = s10.states[e10];
            i10.fill = t11.color || i10.fill, i10.stroke = t11.lineColor || i10.stroke, i10["stroke-width"] = t11.lineWidth || i10["stroke-width"];
          }
          return i10;
        }
        drawPoints() {
          let t10 = this.points, e10 = this.chart, i10 = this.yAxis.reversed;
          for (let s10 of t10) {
            let t11 = s10.graphic, o10, r10, a10, n10, h10, l10, d10, c10, p10, u10 = !t11;
            if (void 0 !== s10.plotY) {
              t11 || (s10.graphic = t11 = e10.renderer.path().add(this.group)), this.chart.styledMode || t11.attr(this.pointAttribs(s10, s10.selected && "select")).shadow(this.options.shadow);
              let g2 = t11.strokeWidth();
              d10 = p_(s10.plotX || 0, g2), a10 = Math.min(o10 = s10.plotOpen, r10 = s10.plotClose), n10 = Math.max(o10, r10), p10 = Math.round(s10.shapeArgs.width / 2), h10 = i10 ? n10 !== s10.yBottom : Math.round(a10) !== Math.round(s10.plotHigh || 0), l10 = i10 ? Math.round(a10) !== Math.round(s10.plotHigh || 0) : n10 !== s10.yBottom, a10 = p_(a10, g2), n10 = p_(n10, g2), (c10 = []).push(["M", d10 - p10, n10], ["L", d10 - p10, a10], ["L", d10 + p10, a10], ["L", d10 + p10, n10], ["Z"], ["M", d10, a10], ["L", d10, h10 ? Math.round(i10 ? s10.yBottom : s10.plotHigh) : a10], ["M", d10, n10], ["L", d10, l10 ? Math.round(i10 ? s10.plotHigh : s10.yBottom) : n10]), t11[u10 ? "attr" : "animate"]({
                d: c10
              }).addClass(s10.getClassName(), true);
            }
          }
        }
      }
      pq.defaultOptions = pZ(p$.defaultOptions, {
        tooltip: p$.defaultOptions.tooltip
      }, {
        states: {
          hover: {
            lineWidth: 2
          }
        },
        threshold: null,
        lineColor: "#000000",
        lineWidth: 1,
        upColor: "#ffffff",
        stickyTracking: true
      }), r_.registerSeriesType("candlestick", pq);
      let {
        column: {
          prototype: {
            pointClass: pK
          }
        }
      } = r_.seriesTypes, {
        isNumber: pJ
      } = tx, pQ = class extends pK {
        constructor() {
          super(...arguments), this.ttBelow = false;
        }
        isValid() {
          return pJ(this.y) || void 0 === this.y;
        }
        hasNewShapeType() {
          let t10 = this.options.shape || this.series.options.shape;
          return this.graphic && t10 && t10 !== this.graphic.symbolKey;
        }
      };
      !function(t10) {
        let e10 = [];
        function i10(t11, e11, i11, s11, o10) {
          let r10 = o10 && o10.anchorX || t11, a10 = o10 && o10.anchorY || e11, n10 = this.circle(r10 - 1, a10 - 1, 2, 2);
          return n10.push(["M", r10, a10], ["L", t11, e11 + s11], ["L", t11, e11], ["L", t11 + i11, e11], ["L", t11 + i11, e11 + s11], ["L", t11, e11 + s11], ["Z"]), n10;
        }
        function s10(t11, e11) {
          t11[e11 + "pin"] = function(i11, s11, o10, r10, a10) {
            let n10, h10 = a10 && a10.anchorX, l10 = a10 && a10.anchorY;
            if ("circle" === e11 && r10 > o10 && (i11 -= Math.round((r10 - o10) / 2), o10 = r10), n10 = t11[e11](i11, s11, o10, r10, a10), h10 && l10) {
              let a11 = h10;
              if ("circle" === e11) a11 = i11 + o10 / 2;
              else {
                let t12 = n10[0], e12 = n10[1];
                "M" === t12[0] && "L" === e12[0] && (a11 = (t12[1] + e12[1]) / 2);
              }
              let d10 = s11 > l10 ? s11 : s11 + r10;
              n10.push(["M", a11, d10], ["L", h10, l10]), n10 = n10.concat(t11.circle(h10 - 1, l10 - 1, 2, 2));
            }
            return n10;
          };
        }
        t10.compose = function(t11) {
          if (-1 === e10.indexOf(t11)) {
            e10.push(t11);
            let o11 = t11.prototype.symbols;
            o11.flag = i10, s10(o11, "circle"), s10(o11, "square");
          }
          let o10 = ez.getRendererType();
          e10.indexOf(o10) && e10.push(o10);
        };
      }(H || (H = {}));
      let p0 = H, {
        composed: p1
      } = V, {
        prototype: p2
      } = hO, {
        prototype: p3
      } = ay, {
        defined: p5,
        pushUnique: p6,
        stableSort: p9
      } = tx;
      var p4 = F || (F = {});
      function p8(t10) {
        return p3.getPlotBox.call(this.options.onSeries && this.chart.get(this.options.onSeries) || this, t10);
      }
      function p7() {
        p2.translate.apply(this);
        let t10 = this, e10 = t10.options, i10 = t10.chart, s10 = t10.points, o10 = e10.onSeries, r10 = o10 && i10.get(o10), a10 = r10 && r10.options.step, n10 = r10 && r10.points, h10 = i10.inverted, l10 = t10.xAxis, d10 = t10.yAxis, c10 = s10.length - 1, p10, u10, g2 = e10.onKey || "y", f2 = n10 && n10.length, m2 = 0, x2, y2, b2, v2, k2;
        if (r10 && r10.visible && f2) {
          for (m2 = (r10.pointXOffset || 0) + (r10.barW || 0) / 2, v2 = r10.currentDataGrouping, y2 = n10[f2 - 1].x + (v2 ? v2.totalRange : 0), p9(s10, (t11, e11) => t11.x - e11.x), g2 = "plot" + g2[0].toUpperCase() + g2.substr(1); f2-- && s10[c10]; ) if (x2 = n10[f2], (p10 = s10[c10]).y = x2.y, x2.x <= p10.x && void 0 !== x2[g2]) {
            if (p10.x <= y2 && (p10.plotY = x2[g2], x2.x < p10.x && !a10 && (b2 = n10[f2 + 1])) && void 0 !== b2[g2]) if (p5(p10.plotX) && r10.is("spline")) {
              let t11 = [x2.plotX || 0, x2.plotY || 0], e11 = [b2.plotX || 0, b2.plotY || 0], i11 = x2.controlPoints?.high || t11, s11 = b2.controlPoints?.low || e11, o11 = (o12, r12) => Math.pow(1 - o12, 3) * t11[r12] + 3 * (1 - o12) * (1 - o12) * o12 * i11[r12] + 3 * (1 - o12) * o12 * o12 * s11[r12] + o12 * o12 * o12 * e11[r12], r11 = 0, a11 = 1, n11;
              for (let t12 = 0; t12 < 100; t12++) {
                let t13 = (r11 + a11) / 2, e12 = o11(t13, 0);
                if (null === e12) break;
                if (0.25 > Math.abs(e12 - p10.plotX)) {
                  n11 = t13;
                  break;
                }
                e12 < p10.plotX ? r11 = t13 : a11 = t13;
              }
              p5(n11) && (p10.plotY = o11(n11, 1), p10.y = d10.toValue(p10.plotY, true));
            } else k2 = (p10.x - x2.x) / (b2.x - x2.x), p10.plotY += k2 * (b2[g2] - x2[g2]), p10.y += k2 * (b2.y - x2.y);
            if (c10--, f2++, c10 < 0) break;
          }
        }
        s10.forEach((e11, i11) => {
          let o11;
          e11.plotX += m2, (void 0 === e11.plotY || h10) && (e11.plotX >= 0 && e11.plotX <= l10.len ? h10 ? (e11.plotY = l10.translate(e11.x, 0, 1, 0, 1), e11.plotX = p5(e11.y) ? d10.translate(e11.y, 0, 0, 0, 1) : 0) : e11.plotY = (l10.opposite ? 0 : t10.yAxis.len) + l10.offset : e11.shapeArgs = {}), (u10 = s10[i11 - 1]) && u10.plotX === e11.plotX && (void 0 === u10.stackIndex && (u10.stackIndex = 0), o11 = u10.stackIndex + 1), e11.stackIndex = o11;
        }), this.onSeries = r10;
      }
      p4.compose = function(t10) {
        if (p6(p1, "OnSeries")) {
          let e10 = t10.prototype;
          e10.getPlotBox = p8, e10.translate = p7;
        }
        return t10;
      }, p4.getPlotBox = p8, p4.translate = p7;
      let ut = F, {
        noop: ue
      } = V, {
        distribute: ui
      } = eX, {
        series: us,
        seriesTypes: {
          column: uo
        }
      } = r_, {
        addEvent: ur,
        defined: ua,
        extend: un,
        isNumber: uh,
        merge: ul,
        objectEach: ud,
        wrap: uc
      } = tx;
      class up extends uo {
        animate(t10) {
          t10 && this.setClip();
        }
        drawPoints() {
          let t10, e10, i10, s10, o10, r10, a10, n10, h10, l10, d10, c10 = this.points, p10 = this.chart, u10 = p10.renderer, g2 = p10.inverted, f2 = this.options, m2 = f2.y, x2 = this.yAxis, y2 = {}, b2 = [], v2 = uh(f2.borderRadius) ? f2.borderRadius : 0;
          for (s10 = c10.length; s10--; ) o10 = c10[s10], l10 = (g2 ? o10.plotY : o10.plotX) > this.xAxis.len, t10 = o10.plotX, a10 = o10.stackIndex, i10 = o10.options.shape || f2.shape, void 0 !== (e10 = o10.plotY) && (e10 = o10.plotY + m2 - (void 0 !== a10 && a10 * f2.stackDistance)), o10.anchorX = a10 ? void 0 : o10.plotX, n10 = a10 ? void 0 : o10.plotY, d10 = "flag" !== i10, r10 = o10.graphic, void 0 !== e10 && t10 >= 0 && !l10 ? (r10 && o10.hasNewShapeType() && (r10 = r10.destroy()), r10 || (r10 = o10.graphic = u10.label("", 0, void 0, i10, void 0, void 0, f2.useHTML).addClass(o10.getClassName()).add(this.markerGroup), o10.graphic.div && (o10.graphic.div.point = o10), r10.isNew = true), r10.attr({
            align: d10 ? "center" : "left",
            width: f2.width,
            height: f2.height,
            "text-align": f2.textAlign,
            r: v2
          }), p10.styledMode || r10.attr(this.pointAttribs(o10)).css(ul(f2.style, o10.style)).shadow(f2.shadow), t10 > 0 && (t10 -= r10.strokeWidth() % 2), h10 = {
            y: e10,
            anchorY: n10
          }, f2.allowOverlapX && (h10.x = t10, h10.anchorX = o10.anchorX), r10.attr({
            text: o10.options.title ?? f2.title ?? "A"
          })[r10.isNew ? "attr" : "animate"](h10), f2.allowOverlapX || (y2[o10.plotX] ? y2[o10.plotX].size = Math.max(y2[o10.plotX].size, r10.width || 0) : y2[o10.plotX] = {
            align: 0.5 * !!d10,
            size: r10.width || 0,
            target: t10,
            anchorX: t10
          }), o10.tooltipPos = [t10, e10 + x2.pos - p10.plotTop]) : r10 && (o10.graphic = r10.destroy());
          if (!f2.allowOverlapX) {
            let t11 = 100;
            for (let e11 of (ud(y2, function(e12) {
              e12.plotX = e12.anchorX, b2.push(e12), t11 = Math.max(e12.size, t11);
            }), ui(b2, g2 ? x2.len : this.xAxis.len, t11), c10)) {
              let t12 = e11.plotX, i11 = e11.graphic, s11 = i11 && y2[t12];
              s11 && i11 && (ua(s11.pos) ? i11[i11.isNew ? "attr" : "animate"]({
                x: s11.pos + (s11.align || 0) * s11.size,
                anchorX: e11.anchorX
              }).show().isNew = false : i11.hide().isNew = true);
            }
          }
          f2.useHTML && this.markerGroup && uc(this.markerGroup, "on", function(t11) {
            return ic.prototype.on.apply(t11.apply(this, [].slice.call(arguments, 1)), [].slice.call(arguments, 1));
          });
        }
        drawTracker() {
          let t10 = this.points;
          for (let e10 of (super.drawTracker(), t10)) {
            let i10 = e10.graphic;
            i10 && (e10.unbindMouseOver && e10.unbindMouseOver(), e10.unbindMouseOver = ur(i10.element, "mouseover", function() {
              for (let s10 of (e10.stackIndex > 0 && !e10.raised && (e10._y = i10.y, i10.attr({
                y: e10._y - 8
              }), e10.raised = true), t10)) s10 !== e10 && s10.raised && s10.graphic && (s10.graphic.attr({
                y: s10._y
              }), s10.raised = false);
            }));
          }
        }
        pointAttribs(t10, e10) {
          let i10 = this.options, s10 = t10 && t10.color || this.color, o10 = i10.lineColor, r10 = t10 && t10.lineWidth, a10 = t10 && t10.fillColor || i10.fillColor;
          return e10 && (a10 = i10.states[e10].fillColor, o10 = i10.states[e10].lineColor, r10 = i10.states[e10].lineWidth), {
            fill: a10 || s10,
            stroke: o10 || s10,
            "stroke-width": r10 || i10.lineWidth || 0
          };
        }
        setClip() {
          us.prototype.setClip.apply(this, arguments), false !== this.options.clip && this.sharedClipKey && this.markerGroup && this.markerGroup.clip(this.chart.sharedClips[this.sharedClipKey]);
        }
      }
      up.compose = p0.compose, up.defaultOptions = ul(uo.defaultOptions, {
        borderRadius: 0,
        pointRange: 0,
        allowOverlapX: false,
        shape: "flag",
        stackDistance: 12,
        textAlign: "center",
        tooltip: {
          pointFormat: "{point.text}"
        },
        threshold: null,
        y: -30,
        fillColor: "#ffffff",
        lineWidth: 1,
        states: {
          hover: {
            lineColor: "#000000",
            fillColor: "#ccd3ff"
          }
        },
        style: {
          color: "#000000",
          fontSize: "0.7em",
          fontWeight: "bold"
        }
      }), ut.compose(up), un(up.prototype, {
        allowDG: false,
        forceCrop: true,
        invertible: false,
        noSharedTooltip: true,
        pointClass: pQ,
        sorted: false,
        takeOrdinalPosition: false,
        trackerGroups: ["markerGroup"],
        buildKDTree: ue,
        init: us.prototype.init
      }), r_.registerSeriesType("flags", up);
      let {
        addEvent: uu,
        find: ug,
        fireEvent: uf,
        isArray: um,
        isNumber: ux,
        pick: uy
      } = tx;
      !function(t10) {
        function e10() {
          void 0 !== this.brokenAxis && this.brokenAxis.setBreaks(this.options.breaks, false);
        }
        function i10() {
          Object.keys(this.options.breaks?.[0] || {}).length && (this.options.ordinal = false);
        }
        function s10() {
          let t11 = this.brokenAxis;
          if (t11?.hasBreaks) {
            let e11 = this.tickPositions, i11 = this.tickPositions.info, s11 = [];
            for (let i12 = 0; i12 < e11.length; i12++) t11.isInAnyBreak(e11[i12]) || s11.push(e11[i12]);
            this.tickPositions = s11, this.tickPositions.info = i11;
          }
        }
        function o10() {
          this.brokenAxis || (this.brokenAxis = new l10(this));
        }
        function r10() {
          let {
            isDirty: t11,
            options: {
              connectNulls: e11
            },
            points: i11,
            xAxis: s11,
            yAxis: o11
          } = this;
          if (t11) {
            let t12 = i11.length;
            for (; t12--; ) {
              let r11 = i11[t12], a11 = (null !== r11.y || false !== e11) && (s11?.brokenAxis?.isInAnyBreak(r11.x, true) || o11?.brokenAxis?.isInAnyBreak(r11.y, true));
              r11.visible = !a11 && false !== r11.options.visible;
            }
          }
        }
        function a10() {
          this.drawBreaks(this.xAxis, ["x"]), this.drawBreaks(this.yAxis, uy(this.pointArrayMap, ["y"]));
        }
        function n10(t11, e11) {
          let i11, s11, o11, r11 = this, a11 = r11.points;
          if (t11?.brokenAxis?.hasBreaks) {
            let n11 = t11.brokenAxis;
            e11.forEach(function(e12) {
              i11 = n11?.breakArray || [], s11 = t11.isXAxis ? t11.min : uy(r11.options.threshold, t11.min), a11.forEach(function(r12) {
                o11 = r12["stack" + e12.toUpperCase()] ?? r12[e12], i11.forEach(function(e13) {
                  if (ux(s11) && ux(o11)) {
                    let i12 = "";
                    s11 < e13.from && o11 > e13.to || s11 > e13.from && o11 < e13.from ? i12 = "pointBreak" : (s11 < e13.from && o11 > e13.from && o11 < e13.to || s11 > e13.from && o11 > e13.to && o11 < e13.from) && (i12 = "pointInBreak"), i12 && uf(t11, i12, {
                      point: r12,
                      brk: e13
                    });
                  }
                });
              });
            });
          }
        }
        function h10() {
          let t11 = this.currentDataGrouping, e11 = t11?.gapSize, i11 = this.points.slice(), s11 = this.yAxis, o11 = this.options.gapSize, r11 = i11.length - 1;
          if (o11 && r11 > 0) {
            let t12, a11;
            for ("value" !== this.options.gapUnit && (o11 *= this.basePointRange), e11 && e11 > o11 && e11 >= this.basePointRange && (o11 = e11); r11--; ) if (a11 && false !== a11.visible || (a11 = i11[r11 + 1]), t12 = i11[r11], false !== a11.visible && false !== t12.visible) {
              if (a11.x - t12.x > o11) {
                let e12 = (t12.x + a11.x) / 2;
                i11.splice(r11 + 1, 0, {
                  isNull: true,
                  x: e12
                }), s11.stacking && this.options.stacking && ((s11.stacking.stacks[this.stackKey][e12] = new nW(s11, s11.options.stackLabels, false, e12, this.stack ?? "")).total = 0);
              }
              a11 = t12;
            }
          }
          return this.getGraphPath(i11);
        }
        t10.compose = function(t11, l11) {
          if (!t11.keepProps.includes("brokenAxis")) {
            t11.keepProps.push("brokenAxis"), uu(t11, "init", o10), uu(t11, "afterInit", e10), uu(t11, "afterSetTickPositions", s10), uu(t11, "afterSetOptions", i10);
            let d10 = l11.prototype;
            d10.drawBreaks = n10, d10.gappedPath = h10, uu(l11, "afterGeneratePoints", r10), uu(l11, "afterRender", a10);
          }
          return t11;
        };
        class l10 {
          static isInBreak(t11, e11) {
            let i11 = t11.repeat || 1 / 0, s11 = t11.from, o11 = t11.to - t11.from, r11 = e11 >= s11 ? (e11 - s11) % i11 : i11 - (s11 - e11) % i11;
            return t11.inclusive ? r11 <= o11 : r11 < o11 && 0 !== r11;
          }
          static lin2Val(t11) {
            let e11 = this.min || 0, i11 = this.brokenAxis, s11 = i11?.breakArray;
            if (!s11?.length || !ux(t11)) return t11;
            let o11 = t11;
            if (t11 > e11) {
              for (let t12 of s11) if (t12.from > o11) break;
              else t12.to <= o11 && t12.to > e11 ? o11 += t12.len : l10.isInBreak(t12, o11) && (o11 += t12.len);
            } else if (t11 < e11) for (let t12 of s11) if (t12.from > e11) break;
            else t12.from >= o11 && t12.from < e11 ? o11 -= t12.len : l10.isInBreak(t12, o11) && (o11 -= t12.len);
            return o11;
          }
          static val2Lin(t11) {
            let e11 = this.min || 0, i11 = this.brokenAxis, s11 = i11?.breakArray;
            if (!s11?.length || !ux(t11)) return t11;
            let o11 = t11;
            if (t11 > e11) {
              for (let i12 of s11) if (i12.to <= t11 && i12.to > e11) o11 -= i12.len;
              else if (i12.from > t11) break;
              else if (l10.isInBreak(i12, t11)) {
                o11 -= t11 - i12.from;
                break;
              }
            } else if (t11 < e11) {
              for (let i12 of s11) if (i12.from >= t11 && i12.from < e11) o11 += i12.len;
              else if (i12.from > e11) break;
              else if (l10.isInBreak(i12, t11)) {
                o11 += i12.to - t11;
                break;
              }
            }
            return o11;
          }
          constructor(t11) {
            this.axis = t11;
          }
          findBreakAt(t11, e11) {
            return ug(e11, function(e12) {
              return e12.from < t11 && t11 < e12.to;
            });
          }
          isInAnyBreak(t11, e11) {
            let i11 = this.axis, s11 = i11.options.breaks || [], o11 = s11.length, r11, a11, n11;
            if (o11 && ux(t11)) {
              for (; o11--; ) l10.isInBreak(s11[o11], t11) && (r11 = true, a11 || (a11 = uy(s11[o11].showPoints, !i11.isXAxis)));
              n11 = r11 && e11 ? r11 && !a11 : r11;
            }
            return n11;
          }
          setBreaks(t11, e11) {
            let i11 = this, s11 = i11.axis, o11 = s11.chart.time, r11 = um(t11) && !!Object.keys(t11?.[0] || {}).length;
            s11.isDirty = (i11.hasBreaks ?? false) !== r11, i11.hasBreaks = r11, t11?.forEach((t12) => {
              t12.from = o11.parse(t12.from) || 0, t12.to = o11.parse(t12.to) || 0;
            }), t11 !== s11.options.breaks && (s11.options.breaks = s11.userOptions.breaks = t11), s11.forceRedraw = true, s11.series.forEach(function(t12) {
              t12.isDirty = true;
            }), r11 || s11.val2lin !== l10.val2Lin || (delete s11.val2lin, delete s11.lin2val), r11 && (s11.userOptions.ordinal = false, s11.lin2val = l10.lin2Val, s11.val2lin = l10.val2Lin, s11.setExtremes = function(t12, e12, o12, r12, a11) {
              if (i11.hasBreaks && !s11.treeGrid?.tree) {
                let s12, o13 = this.brokenAxis.breakArray || [];
                for (; s12 = i11.findBreakAt(t12, o13); ) t12 = s12.to;
                for (; s12 = i11.findBreakAt(e12, o13); ) e12 = s12.from;
                e12 < t12 && (e12 = t12);
              }
              s11.constructor.prototype.setExtremes.call(this, t12, e12, o12, r12, a11);
            }, s11.setAxisTranslation = function() {
              if (s11.constructor.prototype.setAxisTranslation.call(this), i11.unitLength = void 0, i11.hasBreaks) {
                let t12 = s11.options.breaks || [], e12 = [], o12 = [], r12 = s11.pointRangePadding ?? 0, a11 = 0, n11, h11, d10 = s11.userMin ?? s11.min, c10 = s11.userMax ?? s11.max, p10 = s11.dataMin ?? d10, u10 = s11.dataMax ?? c10, g2, f2;
                ux(s11.threshold) && (p10 = Math.min(p10 ?? s11.threshold, s11.threshold), u10 = Math.max(u10 ?? s11.threshold, s11.threshold)), s11.treeGrid?.tree || t12.forEach(function(t13) {
                  h11 = t13.repeat || 1 / 0, ux(d10) && ux(c10) && (l10.isInBreak(t13, d10) && (d10 += t13.to % h11 - d10 % h11), l10.isInBreak(t13, c10) && (c10 -= c10 % h11 - t13.from % h11));
                }), ux(p10) && ux(u10) && t12.forEach(function(t13) {
                  for (g2 = t13.from, h11 = t13.repeat || 1 / 0; g2 - h11 > p10; ) g2 -= h11;
                  for (; g2 < p10; ) g2 += h11;
                  for (f2 = g2; f2 < u10; f2 += h11) e12.push({
                    value: f2,
                    move: "in"
                  }), e12.push({
                    value: f2 + t13.to - t13.from,
                    move: "out",
                    size: t13.breakSize
                  });
                }), e12.sort(function(t13, e13) {
                  return t13.value === e13.value ? ("in" !== t13.move) - ("in" !== e13.move) : t13.value - e13.value;
                }), n11 = 0, g2 = p10, e12.forEach((t13) => {
                  1 === (n11 += "in" === t13.move ? 1 : -1) && "in" === t13.move && (g2 = t13.value), 0 === n11 && ux(g2) && (o12.push({
                    from: g2,
                    to: t13.value,
                    len: t13.value - g2 - (t13.size || 0)
                  }), ux(d10) && ux(c10) && g2 < c10 && t13.value > d10 && (a11 += t13.value - g2 - (t13.size || 0)));
                }), i11.breakArray = o12, ux(d10) && ux(c10) && ux(s11.min) && (i11.unitLength = c10 - d10 - a11 + r12, uf(s11, "afterBreaks"), s11.staticScale ? s11.transA = s11.staticScale : i11.unitLength && (s11.transA *= (c10 - s11.min + r12) / i11.unitLength), r12 && (s11.minPixelPadding = s11.transA * (s11.minPointOffset || 0)), s11.min = d10, s11.max = c10);
              }
            }), uy(e11, true) && s11.chart.redraw();
          }
        }
        t10.Additions = l10;
      }(Y || (Y = {}));
      let ub = Y;
      V.BrokenAxis = V.BrokenAxis || ub, V.BrokenAxis.compose(V.Axis, V.Series);
      let uv = {}, {
        arrayMax: uk,
        arrayMin: uM,
        correctFloat: uw,
        extend: uS,
        isNumber: uA
      } = tx;
      function uT(t10) {
        let e10 = t10.length, i10 = uC(t10);
        return uA(i10) && e10 && (i10 = uw(i10 / e10)), i10;
      }
      function uC(t10) {
        let e10 = t10.length, i10;
        if (!e10 && t10.hasNulls) i10 = null;
        else if (e10) for (i10 = 0; e10--; ) i10 += t10[e10];
        return i10;
      }
      let uP = {
        average: uT,
        averages: function() {
          let t10 = [];
          return [].forEach.call(arguments, function(e10) {
            t10.push(uT(e10));
          }), void 0 === t10[0] ? void 0 : t10;
        },
        close: function(t10) {
          return t10.length ? t10[t10.length - 1] : t10.hasNulls ? null : void 0;
        },
        high: function(t10) {
          return t10.length ? uk(t10) : t10.hasNulls ? null : void 0;
        },
        hlc: function(t10, e10, i10) {
          if (t10 = uv.high(t10), e10 = uv.low(e10), i10 = uv.close(i10), uA(t10) || uA(e10) || uA(i10)) return [t10, e10, i10];
        },
        low: function(t10) {
          return t10.length ? uM(t10) : t10.hasNulls ? null : void 0;
        },
        ohlc: function(t10, e10, i10, s10) {
          if (t10 = uv.open(t10), e10 = uv.high(e10), i10 = uv.low(i10), s10 = uv.close(s10), uA(t10) || uA(e10) || uA(i10) || uA(s10)) return [t10, e10, i10, s10];
        },
        open: function(t10) {
          return t10.length ? t10[0] : t10.hasNulls ? null : void 0;
        },
        range: function(t10, e10) {
          return (t10 = uv.low(t10), e10 = uv.high(e10), uA(t10) || uA(e10)) ? [t10, e10] : null === t10 && null === e10 ? null : void 0;
        },
        sum: uC
      };
      uS(uv, uP);
      let uO = {
        groupPixelWidth: 2,
        dateTimeLabelFormats: {
          millisecond: ["%[AebHMSL]", "%[AebHMSL]", "-%[HMSL]"],
          second: ["%[AebHMS]", "%[AebHMS]", "-%[HMS]"],
          minute: ["%[AebHM]", "%[AebHM]", "-%[HM]"],
          hour: ["%[AebHM]", "%[AebHM]", "-%[HM]"],
          day: ["%[AebY]", "%[Aeb]", "-%[AebY]"],
          week: ["%v %[AebY]", "%[Aeb]", "-%[AebY]"],
          month: ["%[BY]", "%[B]", "-%[BY]"],
          year: ["%Y", "%Y", "-%Y"]
        }
      }, uE = {
        line: {},
        spline: {},
        area: {},
        areaspline: {},
        arearange: {},
        column: {
          groupPixelWidth: 10
        },
        columnrange: {
          groupPixelWidth: 10
        },
        candlestick: {
          groupPixelWidth: 10
        },
        ohlc: {
          groupPixelWidth: 5
        },
        hlc: {
          groupPixelWidth: 5
        },
        heikinashi: {
          groupPixelWidth: 10
        }
      }, uL = [["millisecond", [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]], ["second", [1, 2, 5, 10, 15, 30]], ["minute", [1, 2, 5, 10, 15, 30]], ["hour", [1, 2, 3, 4, 6, 8, 12]], ["day", [1]], ["week", [1]], ["month", [1, 3, 6]], ["year", null]], {
        addEvent: uB,
        extend: uD,
        merge: uI,
        pick: uz
      } = tx;
      function uR(t10) {
        let e10 = this, i10 = e10.series;
        i10.forEach(function(t11) {
          t11.groupPixelWidth = void 0;
        }), i10.forEach(function(i11) {
          i11.groupPixelWidth = e10.getGroupPixelWidth && e10.getGroupPixelWidth(), i11.groupPixelWidth && (i11.hasProcessed = true), i11.applyGrouping(!!t10.hasExtremesChanged);
        });
      }
      function uN() {
        let t10 = this.series, e10 = t10.length, i10 = 0, s10 = false, o10, r10;
        for (; e10--; ) (r10 = t10[e10].options.dataGrouping) && (i10 = Math.max(i10, uz(r10.groupPixelWidth, uO.groupPixelWidth)), o10 = (t10[e10].dataTable.getModified() || t10[e10].dataTable).rowCount, (t10[e10].groupPixelWidth || o10 > this.chart.plotSizeX / i10 || o10 && r10.forced) && (s10 = true));
        return s10 ? i10 : 0;
      }
      function uW() {
        this.series.forEach(function(t10) {
          t10.hasProcessed = false;
        });
      }
      function uG(t10, e10) {
        let i10;
        if (e10 = uz(e10, true), t10 || (t10 = {
          forced: false,
          units: null
        }), this instanceof o) for (i10 = this.series.length; i10--; ) this.series[i10].update({
          dataGrouping: t10
        }, false);
        else this.chart.options.series.forEach(function(e11) {
          e11.dataGrouping = "boolean" == typeof t10 ? t10 : uI(t10, e11.dataGrouping);
        });
        this.ordinal && (this.ordinal.slope = void 0), e10 && this.chart.redraw();
      }
      let uX = function(t10) {
        o = t10;
        let e10 = t10.prototype;
        e10.applyGrouping || (uB(t10, "afterSetScale", uW), uB(t10, "postProcessData", uR), uD(e10, {
          applyGrouping: uR,
          getGroupPixelWidth: uN,
          setDataGrouping: uG
        }));
      }, {
        series: {
          prototype: uH
        }
      } = r_, {
        addEvent: uF,
        defined: uY,
        error: uj,
        extend: uU,
        isNumber: uV,
        merge: u$,
        pick: u_,
        splat: uZ
      } = tx, uq = uH.generatePoints;
      function uK(t10) {
        var e10, i10, s10;
        let o10, r10, a10 = this.chart, n10 = this.options.dataGrouping, h10 = false !== this.allowDG && n10 && u_(n10.enabled, a10.options.isStock), l10 = this.reserveSpace(), d10 = this.currentDataGrouping, c10, p10, u10 = false;
        h10 && !this.requireSorting && (this.requireSorting = u10 = true);
        let g2 = false == (e10 = this, i10 = t10, !(e10.isCartesian && !e10.isDirty && !e10.xAxis.isDirty && !e10.yAxis.isDirty && !i10)) || !h10;
        if (u10 && (this.requireSorting = false), g2) return;
        this.destroyGroupedData();
        let f2 = n10.groupAll ? this.dataTable : this.dataTable.getModified() || this.dataTable, m2 = this.getColumn("x", !n10.groupAll), x2 = a10.plotSizeX, y2 = this.xAxis, b2 = y2.getExtremes(), v2 = y2.options.ordinal, k2 = this.groupPixelWidth;
        if (k2 && m2 && f2.rowCount && x2 && uV(b2.min)) {
          r10 = true, this.isDirty = true, this.points = null;
          let t11 = b2.min, e11 = b2.max, i11 = v2 && y2.ordinal && y2.ordinal.getGroupIntervalFactor(t11, e11, this) || 1, h11 = k2 * (e11 - t11) / x2 * i11, d11 = y2.getTimeTicks(ol.Additions.prototype.normalizeTimeTickInterval(h11, n10.units || uL), Math.min(t11, m2[0]), Math.max(e11, m2[m2.length - 1]), y2.options.startOfWeek, m2, this.closestPointRange), u11 = uH.groupData.apply(this, [f2, d11, n10.approximation]), g3 = u11.modified, M2 = g3.getColumn("x", true), w2 = 0;
          for (n10?.smoothed && g3.rowCount && (n10.firstAnchor = "firstPoint", n10.anchor = "middle", n10.lastAnchor = "lastPoint", uj(32, false, a10, {
            "dataGrouping.smoothed": "use dataGrouping.anchor"
          })), o10 = 1; o10 < d11.length; o10++) d11.info.segmentStarts && -1 !== d11.info.segmentStarts.indexOf(o10) || (w2 = Math.max(d11[o10] - d11[o10 - 1], w2));
          (c10 = d11.info).gapSize = w2, this.closestPointRange = d11.info.totalRange, this.groupMap = u11.groupMap, this.currentDataGrouping = c10, function(t12, e12, i12) {
            let s11 = t12.options.dataGrouping, o11 = t12.currentDataGrouping && t12.currentDataGrouping.gapSize, r11 = t12.getColumn("x");
            if (!(s11 && r11.length && o11 && t12.groupMap)) return;
            let a11 = e12.length - 1, n11 = s11.anchor, h12 = s11.firstAnchor, l11 = s11.lastAnchor, d12 = e12.length - 1, c11 = 0;
            if (h12 && r11[0] >= e12[0]) {
              let i13;
              c11++;
              let s12 = t12.groupMap[0].start, a12 = t12.groupMap[0].length;
              uV(s12) && uV(a12) && (i13 = s12 + (a12 - 1)), e12[0] = {
                start: e12[0],
                middle: e12[0] + 0.5 * o11,
                end: e12[0] + o11,
                firstPoint: r11[0],
                lastPoint: i13 && r11[i13]
              }[h12];
            }
            if (a11 > 0 && l11 && o11 && e12[a11] >= i12 - o11) {
              d12--;
              let i13 = t12.groupMap[t12.groupMap.length - 1].start;
              e12[a11] = {
                start: e12[a11],
                middle: e12[a11] + 0.5 * o11,
                end: e12[a11] + o11,
                firstPoint: i13 && r11[i13],
                lastPoint: r11[r11.length - 1]
              }[l11];
            }
            if (n11 && "start" !== n11) {
              let t13 = o11 * {
                middle: 0.5,
                end: 1
              }[n11];
              for (; d12 >= c11; ) e12[d12] += t13, d12--;
            }
          }(this, M2 || [], e11), l10 && M2 && (uY((s10 = M2)[0]) && uV(y2.min) && uV(y2.dataMin) && s10[0] < y2.min && ((!uY(y2.options.min) && y2.min <= y2.dataMin || y2.min === y2.dataMin) && (y2.min = Math.min(s10[0], y2.min)), y2.dataMin = Math.min(s10[0], y2.dataMin)), uY(s10[s10.length - 1]) && uV(y2.max) && uV(y2.dataMax) && s10[s10.length - 1] > y2.max && ((!uY(y2.options.max) && uV(y2.dataMax) && y2.max >= y2.dataMax || y2.max === y2.dataMax) && (y2.max = Math.max(s10[s10.length - 1], y2.max)), y2.dataMax = Math.max(s10[s10.length - 1], y2.dataMax))), n10.groupAll && (this.allGroupedTable = g3, M2 = (g3 = (p10 = this.cropData(g3, y2.min || 0, y2.max || 0)).modified).getColumn("x"), this.cropStart = p10.start), this.dataTable.modified = g3;
        } else this.groupMap = void 0, this.currentDataGrouping = void 0;
        this.hasGroupedData = r10, this.preventGraphAnimation = (d10 && d10.totalRange) !== (c10 && c10.totalRange);
      }
      function uJ() {
        this.groupedData && (this.groupedData.forEach(function(t10, e10) {
          t10 && (this.groupedData[e10] = t10.destroy ? t10.destroy() : null);
        }, this), this.groupedData.length = 0, delete this.allGroupedTable);
      }
      function uQ() {
        uq.apply(this), this.destroyGroupedData(), this.groupedData = this.hasGroupedData ? this.points : null;
      }
      function u0() {
        return this.is("arearange") ? "range" : this.is("ohlc") ? "ohlc" : this.is("hlc") ? "hlc" : this.is("column") || this.options.cumulative ? "sum" : "average";
      }
      function u1(t10, e10, i10) {
        let s10 = t10.getColumn("x", true) || [], o10 = t10.getColumn("y", true), r10 = this, a10 = r10.data, n10 = r10.options && r10.options.data, h10 = [], l10 = new rz(), d10 = [], c10 = t10.rowCount, p10 = !!o10, u10 = [], g2 = r10.pointArrayMap, f2 = g2 && g2.length, m2 = ["x"].concat(g2 || ["y"]), x2 = (g2 || ["y"]).map(() => []), y2 = this.options.dataGrouping && this.options.dataGrouping.groupAll, b2, v2, k2, M2 = 0, w2 = 0, S2 = "function" == typeof i10 ? i10 : i10 && uv[i10] ? uv[i10] : uv[r10.getDGApproximation && r10.getDGApproximation() || "average"];
        if (f2) {
          let t11 = g2.length;
          for (; t11--; ) u10.push([]);
        } else u10.push([]);
        let A2 = f2 || 1;
        for (let t11 = 0; t11 <= c10; t11++) if (!(s10[t11] < e10[0])) {
          for (; void 0 !== e10[M2 + 1] && s10[t11] >= e10[M2 + 1] || t11 === c10; ) {
            if (b2 = e10[M2], r10.dataGroupInfo = {
              start: y2 ? w2 : r10.cropStart + w2,
              length: u10[0].length,
              groupStart: b2
            }, k2 = S2.apply(r10, u10), r10.pointClass && !uY(r10.dataGroupInfo.options) && (r10.dataGroupInfo.options = u$(r10.pointClass.prototype.optionsToObject.call({
              series: r10
            }, r10.options.data[r10.cropStart + w2])), m2.forEach(function(t12) {
              delete r10.dataGroupInfo.options[t12];
            })), void 0 !== k2) {
              h10.push(b2);
              let t12 = uZ(k2);
              for (let e11 = 0; e11 < t12.length; e11++) x2[e11].push(t12[e11]);
              d10.push(r10.dataGroupInfo);
            }
            w2 = t11;
            for (let t12 = 0; t12 < A2; t12++) u10[t12].length = 0, u10[t12].hasNulls = false;
            if (M2 += 1, t11 === c10) break;
          }
          if (t11 === c10) break;
          if (g2) {
            let e11, i11 = y2 ? t11 : r10.cropStart + t11, s11 = a10 && a10[i11] || r10.pointClass.prototype.applyOptions.apply({
              series: r10
            }, [n10[i11]]);
            for (let t12 = 0; t12 < f2; t12++) uV(e11 = s11[g2[t12]]) ? u10[t12].push(e11) : null === e11 && (u10[t12].hasNulls = true);
          } else uV(v2 = p10 ? o10[t11] : null) ? u10[0].push(v2) : null === v2 && (u10[0].hasNulls = true);
        }
        let T2 = {
          x: h10
        };
        return (g2 || ["y"]).forEach((t11, e11) => {
          T2[t11] = x2[e11];
        }), l10.setColumns(T2), {
          groupMap: d10,
          modified: l10
        };
      }
      function u2(t10) {
        let e10 = t10.options, i10 = this.type, s10 = this.chart.options.plotOptions, o10 = this.useCommonDataGrouping && uO, r10 = tY.defaultOptions.plotOptions[i10].dataGrouping;
        if (s10 && (uE[i10] || o10)) {
          let t11 = this.chart.rangeSelector;
          r10 || (r10 = u$(uO, uE[i10])), e10.dataGrouping = u$(o10, r10, s10.series && s10.series.dataGrouping, s10[i10].dataGrouping, this.userOptions.dataGrouping, !e10.isInternal && t11 && uV(t11.selected) && t11.buttonOptions[t11.selected].dataGrouping);
        }
      }
      let u3 = function(t10) {
        let e10 = t10.prototype;
        e10.applyGrouping || (uF(t10.prototype.pointClass, "update", function() {
          if (this.dataGroup) return uj(24, false, this.series.chart), false;
        }), uF(t10, "afterSetOptions", u2), uF(t10, "destroy", uJ), uU(e10, {
          applyGrouping: uK,
          destroyGroupedData: uJ,
          generatePoints: uQ,
          getDGApproximation: u0,
          groupData: u1
        }));
      }, {
        format: u5
      } = eI, {
        composed: u6
      } = V, {
        addEvent: u9,
        extend: u4,
        isNumber: u8,
        pick: u7,
        pushUnique: gt
      } = tx;
      function ge(t10) {
        let e10 = this.chart, i10 = e10.time, s10 = t10.point, o10 = s10.series, r10 = o10.options, a10 = o10.tooltipOptions, n10 = r10.dataGrouping, h10 = o10.xAxis, l10 = a10.xDateFormat || "", d10, c10, p10, u10, g2, f2 = a10[t10.isFooter ? "footerFormat" : "headerFormat"];
        if (h10 && "datetime" === h10.options.type && n10 && u8(s10.key)) {
          c10 = o10.currentDataGrouping, p10 = n10.dateTimeLabelFormats || uO.dateTimeLabelFormats, c10 ? (u10 = p10[c10.unitName], 1 === c10.count ? l10 = u10[0] : (l10 = u10[1], d10 = u10[2])) : !l10 && p10 && h10.dateTime && (l10 = h10.dateTime.getXDateFormat(s10.x, a10.dateTimeLabelFormats));
          let r11 = u7(o10.groupMap?.[s10.index].groupStart, s10.key), m2 = r11 + (c10?.totalRange || 0) - 1;
          g2 = i10.dateFormat(l10, r11), d10 && (g2 += i10.dateFormat(d10, m2)), o10.chart.styledMode && (f2 = this.styledModeFormat(f2)), t10.text = u5(f2, {
            point: u4(s10, {
              key: g2
            }),
            series: o10
          }, e10), t10.preventDefault();
        }
      }
      V.dataGrouping = V.dataGrouping || {}, V.dataGrouping.approximationDefaults = V.dataGrouping.approximationDefaults || uP, V.dataGrouping.approximations = V.dataGrouping.approximations || uv, {
        compose: function(t10, e10, i10) {
          uX(t10), u3(e10), i10 && gt(u6, "DataGrouping") && u9(i10, "headerFormatter", ge);
        },
        groupData: u1
      }.compose(V.Axis, V.Series, V.Tooltip);
      let {
        defined: gi,
        isNumber: gs,
        pick: go
      } = tx, gr = {
        backgroundColor: "string",
        borderColor: "string",
        borderRadius: "string",
        color: "string",
        fill: "string",
        fontSize: "string",
        labels: "string",
        name: "string",
        stroke: "string",
        title: "string"
      }, {
        addEvent: ga,
        isObject: gn,
        pick: gh,
        defined: gl,
        merge: gd
      } = tx, {
        getAssignedAxis: gc
      } = {
        annotationsFieldsTypes: gr,
        getAssignedAxis: function(t10) {
          return t10.filter((t11) => {
            let e10 = t11.axis.getExtremes(), i10 = e10.min, s10 = e10.max, o10 = go(t11.axis.minPointOffset, 0);
            return gs(i10) && gs(s10) && t11.value >= i10 - o10 && t11.value <= s10 + o10 && !t11.axis.options.isInternal;
          })[0];
        },
        getFieldType: function(t10, e10) {
          let i10 = gr[t10], s10 = typeof e10;
          return gi(i10) && (s10 = i10), {
            string: "text",
            number: "number",
            boolean: "checkbox"
          }[s10];
        }
      }, gp = [], gu = {
        enabled: true,
        sensitivity: 1.1,
        showResetButton: false
      }, gg = function(t10, e10, i10, s10, o10, a10, n10) {
        let h10 = gh(n10.type, t10.zooming.type, ""), l10 = [];
        "x" === h10 ? l10 = i10 : "y" === h10 ? l10 = s10 : "xy" === h10 && (l10 = t10.axes);
        let d10 = t10.transform({
          axes: l10,
          to: {
            x: o10 - 5,
            y: a10 - 5,
            width: 10,
            height: 10
          },
          from: {
            x: o10 - 5 * e10,
            y: a10 - 5 * e10,
            width: 10 * e10,
            height: 10 * e10
          },
          trigger: "mousewheel",
          allowResetButton: n10.showResetButton
        });
        return d10 && (gl(r) && clearTimeout(r), r = setTimeout(() => {
          t10.pointer?.drop();
        }, 400)), d10;
      };
      function gf() {
        var t10;
        let e10 = (gn(t10 = this.zooming.mouseWheel) || (t10 = {
          enabled: t10 ?? true
        }), gd(gu, t10));
        e10.enabled && ga(this.container, "wheel", (t11) => {
          t11 = this.pointer?.normalize(t11) || t11;
          let {
            pointer: i10
          } = this, s10 = i10 && !i10.inClass(t11.target, "highcharts-no-mousewheel");
          if (this.isInsidePlot(t11.chartX - this.plotLeft, t11.chartY - this.plotTop) && s10) {
            let s11 = e10.sensitivity || 1.1, o10 = t11.detail || (t11.deltaY || 0) / 120, r10 = gc(i10.getCoordinates(t11).xAxis), a10 = gc(i10.getCoordinates(t11).yAxis);
            gg(this, Math.pow(s11, o10), r10 ? [r10.axis] : this.xAxis, a10 ? [a10.axis] : this.yAxis, t11.chartX, t11.chartY, e10) && t11.preventDefault?.();
          }
        });
      }
      V.MouseWheelZoom = V.MouseWheelZoom || {
        compose: function(t10) {
          -1 === gp.indexOf(t10) && (gp.push(t10), ga(t10, "afterGetContainer", gf));
        }
      }, V.MouseWheelZoom.compose(V.Chart), V.Navigator = V.Navigator || cw, V.OrdinalAxis = V.OrdinalAxis || cD, V.RangeSelector = V.RangeSelector || ph, V.Scrollbar = V.Scrollbar || cs, V.stockChart = V.stockChart || pT.stockChart, V.StockChart = V.StockChart || V.stockChart, V.extend(V.StockChart, pT), dn.compose(V.Series, V.Axis, V.Point), up.compose(V.Renderer), pU.compose(V.Series), V.Navigator.compose(V.Chart, V.Axis, V.Series), V.OrdinalAxis.compose(V.Axis, V.Series, V.Chart), V.RangeSelector.compose(V.Axis, V.Chart), V.Scrollbar.compose(V.Axis), V.StockChart.compose(V.Chart, V.Axis, V.Series, V.SVGRenderer), V.product = "Highstock";
      let gm = V;
      return U.default;
    })());
  }
});
export default require_highstock();
//# sourceMappingURL=highcharts_highstock.js.map
