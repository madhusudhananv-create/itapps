import {
  __spreadProps,
  __spreadValues
} from "./chunk-WOR4A3D2.js";

// node_modules/highcharts/esm/highcharts.js
var t;
var e;
var i;
var s;
var o;
var r;
var a;
var n;
var h;
var l;
var d;
var c;
var p;
var g;
var u;
var f;
var m;
var x;
var y;
var b;
var v;
var k;
var M;
var w;
var S;
var T;
var C;
var A;
var P;
var L;
var O;
var E;
var I;
var D;
var B = {};
B.d = (t11, e10) => {
  for (var i10 in e10) B.o(e10, i10) && !B.o(t11, i10) && Object.defineProperty(t11, i10, {
    enumerable: true,
    get: e10[i10]
  });
}, B.o = (t11, e10) => Object.prototype.hasOwnProperty.call(t11, e10), (a = m || (m = {})).SVG_NS = "http://www.w3.org/2000/svg", a.product = "Highcharts", a.version = "12.5.0", a.win = "u" > typeof window ? window : {}, a.doc = a.win.document, a.svg = !!a.doc?.createElementNS?.(a.SVG_NS, "svg")?.createSVGRect, a.pageLang = a.doc?.documentElement?.closest("[lang]")?.lang, a.userAgent = a.win.navigator?.userAgent || "", a.isChrome = a.win.chrome, a.isFirefox = -1 !== a.userAgent.indexOf("Firefox"), a.isMS = /(edge|msie|trident)/i.test(a.userAgent) && !a.win.opera, a.isSafari = !a.isChrome && -1 !== a.userAgent.indexOf("Safari"), a.isTouchDevice = /(Mobile|Android|Windows Phone)/.test(a.userAgent), a.isWebKit = -1 !== a.userAgent.indexOf("AppleWebKit"), a.deg2rad = 2 * Math.PI / 360, a.marginNames = ["plotTop", "marginRight", "marginBottom", "plotLeft"], a.noop = function() {
}, a.supportsPassiveEvents = function() {
  let t11 = false;
  if (!a.isMS) {
    let e10 = Object.defineProperty({}, "passive", {
      get: function() {
        t11 = true;
      }
    });
    a.win.addEventListener && a.win.removeEventListener && (a.win.addEventListener("testPassive", a.noop, e10), a.win.removeEventListener("testPassive", a.noop, e10));
  }
  return t11;
}(), a.charts = [], a.composed = [], a.dateFormats = {}, a.seriesTypes = {}, a.symbolSizes = {}, a.chartCount = 0;
var N = m;
var {
  charts: z,
  doc: R,
  win: W
} = N;
function X(t11, e10, i10, s10) {
  let o10 = e10 ? "Highcharts error" : "Highcharts warning";
  32 === t11 && (t11 = `${o10}: Deprecated member`);
  let r10 = $(t11), a10 = r10 ? `${o10} #${t11}: www.highcharts.com/errors/${t11}/` : t11.toString();
  if (void 0 !== s10) {
    let t12 = "";
    r10 && (a10 += "?"), ti(s10, function(e11, i11) {
      t12 += `
 - ${i11}: ${e11}`, r10 && (a10 += encodeURI(i11) + "=" + encodeURI(e11));
    }), a10 += t12;
  }
  to(N, "displayError", {
    chart: i10,
    code: t11,
    message: a10,
    params: s10
  }, function() {
    if (e10) throw Error(a10);
    W.console && -1 === X.messages.indexOf(a10) && console.warn(a10);
  }), X.messages.push(a10);
}
function F(t11, e10) {
  return parseInt(t11, e10 || 10);
}
function G(t11) {
  return "string" == typeof t11;
}
function H(t11) {
  let e10 = Object.prototype.toString.call(t11);
  return "[object Array]" === e10 || "[object Array Iterator]" === e10;
}
function Y(t11, e10) {
  return !!t11 && "object" == typeof t11 && (!e10 || !H(t11));
}
function j(t11) {
  return Y(t11) && "number" == typeof t11.nodeType;
}
function U(t11) {
  let e10 = t11?.constructor;
  return !!(Y(t11, true) && !j(t11) && e10?.name && "Object" !== e10.name);
}
function $(t11) {
  return "number" == typeof t11 && !isNaN(t11) && t11 < 1 / 0 && t11 > -1 / 0;
}
function V(t11) {
  return null != t11;
}
function Z(t11, e10, i10) {
  let s10, o10 = G(e10) && !V(i10), r10 = (e11, i11) => {
    V(e11) ? t11.setAttribute(i11, e11) : o10 ? (s10 = t11.getAttribute(i11)) || "class" !== i11 || (s10 = t11.getAttribute(i11 + "Name")) : t11.removeAttribute(i11);
  };
  return G(e10) ? r10(i10, e10) : ti(e10, r10), s10;
}
function q(t11) {
  return H(t11) ? t11 : [t11];
}
function _(t11, e10) {
  let i10;
  for (i10 in t11 || (t11 = {}), e10) t11[i10] = e10[i10];
  return t11;
}
function K() {
  let t11 = arguments, e10 = t11.length;
  for (let i10 = 0; i10 < e10; i10++) {
    let e11 = t11[i10];
    if (null != e11) return e11;
  }
}
function J(t11, e10) {
  _(t11.style, e10);
}
function Q(t11) {
  return Math.pow(10, Math.floor(Math.log(t11) / Math.LN10));
}
function tt(t11, e10) {
  return t11 > 1e14 ? t11 : parseFloat(t11.toPrecision(e10 || 14));
}
(X || (X = {})).messages = [], Math.easeInOutSine = function(t11) {
  return -0.5 * (Math.cos(Math.PI * t11) - 1);
};
var te = Array.prototype.find ? function(t11, e10) {
  return t11.find(e10);
} : function(t11, e10) {
  let i10, s10 = t11.length;
  for (i10 = 0; i10 < s10; i10++) if (e10(t11[i10], i10)) return t11[i10];
};
function ti(t11, e10, i10) {
  for (let s10 in t11) Object.hasOwnProperty.call(t11, s10) && e10.call(i10 || t11[s10], t11[s10], s10, t11);
}
function ts(t11, e10, i10) {
  function s10(e11, i11) {
    let s11 = t11.removeEventListener;
    s11 && s11.call(t11, e11, i11, false);
  }
  function o10(i11) {
    let o11, r11;
    t11.nodeName && (e10 ? (o11 = {})[e10] = true : o11 = i11, ti(o11, function(t12, e11) {
      if (i11[e11]) for (r11 = i11[e11].length; r11--; ) s10(e11, i11[e11][r11].fn);
    }));
  }
  let r10 = "function" == typeof t11 && t11.prototype || t11;
  if (Object.hasOwnProperty.call(r10, "hcEvents")) {
    let t12 = r10.hcEvents;
    if (e10) {
      let r11 = t12[e10] || [];
      i10 ? (t12[e10] = r11.filter(function(t13) {
        return i10 !== t13.fn;
      }), s10(e10, i10)) : (o10(t12), t12[e10] = []);
    } else o10(t12), delete r10.hcEvents;
  }
}
function to(t11, e10, i10, s10) {
  if (i10 = i10 || {}, R?.createEvent && (t11.dispatchEvent || t11.fireEvent && t11 !== N)) {
    let s11 = R.createEvent("Events");
    s11.initEvent(e10, true, true), i10 = _(s11, i10), t11.dispatchEvent ? t11.dispatchEvent(i10) : t11.fireEvent(e10, i10);
  } else if (t11.hcEvents) {
    i10.target || _(i10, {
      preventDefault: function() {
        i10.defaultPrevented = true;
      },
      target: t11,
      type: e10
    });
    let s11 = [], o10 = t11, r10 = false;
    for (; o10.hcEvents; ) Object.hasOwnProperty.call(o10, "hcEvents") && o10.hcEvents[e10] && (s11.length && (r10 = true), s11.unshift.apply(s11, o10.hcEvents[e10])), o10 = Object.getPrototypeOf(o10);
    r10 && s11.sort((t12, e11) => t12.order - e11.order), s11.forEach((e11) => {
      false === e11.fn.call(t11, i10) && i10.preventDefault();
    });
  }
  s10 && !i10.defaultPrevented && s10.call(t11, i10);
}
var tr = (i = Math.random().toString(36).substring(2, 9) + "-", s = 0, function() {
  return "highcharts-" + (t ? "" : i) + s++;
});
W.jQuery && (W.jQuery.fn.highcharts = function() {
  let t11 = [].slice.call(arguments);
  if (this[0]) return t11[0] ? (new N[G(t11[0]) ? t11.shift() : "Chart"](this[0], t11[0], t11[1]), this) : z[Z(this[0], "data-highcharts-chart")];
});
var ta = {
  addEvent: function(t11, e10, i10, s10 = {}) {
    let o10 = "function" == typeof t11 && t11.prototype || t11;
    Object.hasOwnProperty.call(o10, "hcEvents") || (o10.hcEvents = {});
    let r10 = o10.hcEvents;
    N.Point && t11 instanceof N.Point && t11.series && t11.series.chart && (t11.series.chart.runTrackerClick = true);
    let a10 = t11.addEventListener;
    a10 && a10.call(t11, e10, i10, !!N.supportsPassiveEvents && {
      passive: void 0 === s10.passive ? -1 !== e10.indexOf("touch") : s10.passive,
      capture: false
    }), r10[e10] || (r10[e10] = []);
    let n10 = {
      fn: i10,
      order: "number" == typeof s10.order ? s10.order : 1 / 0
    };
    return r10[e10].push(n10), r10[e10].sort((t12, e11) => t12.order - e11.order), function() {
      ts(t11, e10, i10);
    };
  },
  arrayMax: function(t11) {
    let e10 = t11.length, i10 = t11[0];
    for (; e10--; ) t11[e10] > i10 && (i10 = t11[e10]);
    return i10;
  },
  arrayMin: function(t11) {
    let e10 = t11.length, i10 = t11[0];
    for (; e10--; ) t11[e10] < i10 && (i10 = t11[e10]);
    return i10;
  },
  attr: Z,
  clamp: function(t11, e10, i10) {
    return t11 > e10 ? t11 < i10 ? t11 : i10 : e10;
  },
  clearTimeout: function(t11) {
    V(t11) && clearTimeout(t11);
  },
  correctFloat: tt,
  createElement: function(t11, e10, i10, s10, o10) {
    let r10 = R.createElement(t11);
    return e10 && _(r10, e10), o10 && J(r10, {
      padding: "0",
      border: "none",
      margin: "0"
    }), i10 && J(r10, i10), s10 && s10.appendChild(r10), r10;
  },
  crisp: function(t11, e10 = 0, i10) {
    let s10 = e10 % 2 / 2, o10 = i10 ? -1 : 1;
    return (Math.round(t11 * o10 - s10) + s10) * o10;
  },
  css: J,
  defined: V,
  destroyObjectProperties: function(t11, e10, i10) {
    ti(t11, function(s10, o10) {
      s10 !== e10 && s10?.destroy && s10.destroy(), (s10?.destroy || !i10) && delete t11[o10];
    });
  },
  diffObjects: function(t11, e10, i10, s10) {
    let o10 = {};
    return !function t12(e11, o11, r10, a10) {
      let n10 = i10 ? o11 : e11;
      ti(e11, function(i11, h10) {
        if (!a10 && s10 && s10.indexOf(h10) > -1 && o11[h10]) {
          i11 = q(i11), r10[h10] = [];
          for (let e12 = 0; e12 < Math.max(i11.length, o11[h10].length); e12++) o11[h10][e12] && (void 0 === i11[e12] ? r10[h10][e12] = o11[h10][e12] : (r10[h10][e12] = {}, t12(i11[e12], o11[h10][e12], r10[h10][e12], a10 + 1)));
        } else Y(i11, true) && !i11.nodeType ? (r10[h10] = H(i11) ? [] : {}, t12(i11, o11[h10] || {}, r10[h10], a10 + 1), 0 === Object.keys(r10[h10]).length && ("colorAxis" !== h10 || 0 !== a10) && delete r10[h10]) : (e11[h10] !== o11[h10] || h10 in e11 && !(h10 in o11)) && "__proto__" !== h10 && "constructor" !== h10 && (r10[h10] = n10[h10]);
      });
    }(t11, e10, o10, 0), o10;
  },
  discardElement: function(t11) {
    t11?.parentElement?.removeChild(t11);
  },
  erase: function(t11, e10) {
    let i10 = t11.length;
    for (; i10--; ) if (t11[i10] === e10) {
      t11.splice(i10, 1);
      break;
    }
  },
  error: X,
  extend: _,
  extendClass: function(t11, e10) {
    let i10 = function() {
    };
    return i10.prototype = new t11(), _(i10.prototype, e10), i10;
  },
  find: te,
  fireEvent: to,
  getAlignFactor: (t11 = "") => ({
    center: 0.5,
    right: 1,
    middle: 0.5,
    bottom: 1
  })[t11] || 0,
  getClosestDistance: function(t11, e10) {
    let i10, s10, o10, r10, a10 = !e10;
    return t11.forEach((t12) => {
      if (t12.length > 1) for (r10 = s10 = t12.length - 1; r10 > 0; r10--) (o10 = t12[r10] - t12[r10 - 1]) < 0 && !a10 ? (e10?.(), e10 = void 0) : o10 && (void 0 === i10 || o10 < i10) && (i10 = o10);
    }), i10;
  },
  getMagnitude: Q,
  getNestedProperty: function(t11, e10) {
    let i10 = t11.split(".");
    for (; i10.length && V(e10); ) {
      let t12 = i10.shift();
      if (void 0 === t12 || "__proto__" === t12) return;
      if ("this" === t12) {
        let t13;
        return Y(e10) && (t13 = e10["@this"]), t13 ?? e10;
      }
      let s10 = e10[t12.replace(/[\\'"]/g, "")];
      if (!V(s10) || "function" == typeof s10 || "number" == typeof s10.nodeType || s10 === W) return;
      e10 = s10;
    }
    return e10;
  },
  getStyle: function t2(e10, i10, s10) {
    let o10;
    if ("width" === i10) {
      let i11 = Math.min(e10.offsetWidth, e10.scrollWidth), s11 = e10.getBoundingClientRect?.().width;
      return s11 < i11 && s11 >= i11 - 1 && (i11 = Math.floor(s11)), Math.max(0, i11 - (t2(e10, "padding-left", true) || 0) - (t2(e10, "padding-right", true) || 0));
    }
    if ("height" === i10) return Math.max(0, Math.min(e10.offsetHeight, e10.scrollHeight) - (t2(e10, "padding-top", true) || 0) - (t2(e10, "padding-bottom", true) || 0));
    let r10 = W.getComputedStyle(e10, void 0);
    return r10 && (o10 = r10.getPropertyValue(i10), K(s10, "opacity" !== i10) && (o10 = F(o10))), o10;
  },
  insertItem: function(t11, e10) {
    let i10, s10 = t11.options.index, o10 = e10.length;
    for (i10 = t11.options.isInternal ? o10 : 0; i10 < o10 + 1; i10++) if (!e10[i10] || $(s10) && s10 < K(e10[i10].options.index, e10[i10]._i) || e10[i10].options.isInternal) {
      e10.splice(i10, 0, t11);
      break;
    }
    return i10;
  },
  isArray: H,
  isClass: U,
  isDOMElement: j,
  isFunction: function(t11) {
    return "function" == typeof t11;
  },
  isNumber: $,
  isObject: Y,
  isString: G,
  merge: function(t11, ...e10) {
    let i10, s10 = [t11, ...e10], o10 = {}, r10 = function(t12, e11) {
      return "object" != typeof t12 && (t12 = {}), ti(e11, function(i11, s11) {
        "__proto__" !== s11 && "constructor" !== s11 && (!Y(i11, true) || U(i11) || j(i11) ? t12[s11] = e11[s11] : t12[s11] = r10(t12[s11] || {}, i11));
      }), t12;
    };
    true === t11 && (o10 = s10[1], s10 = Array.prototype.slice.call(s10, 2));
    let a10 = s10.length;
    for (i10 = 0; i10 < a10; i10++) o10 = r10(o10, s10[i10]);
    return o10;
  },
  normalizeTickInterval: function(t11, e10, i10, s10, o10) {
    let r10, a10 = t11;
    i10 = K(i10, Q(t11));
    let n10 = t11 / i10;
    for (!e10 && (e10 = o10 ? [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] : [1, 2, 2.5, 5, 10], false === s10 && (1 === i10 ? e10 = e10.filter(function(t12) {
      return t12 % 1 == 0;
    }) : i10 <= 0.1 && (e10 = [1 / i10]))), r10 = 0; r10 < e10.length && (a10 = e10[r10], (!o10 || !(a10 * i10 >= t11)) && (o10 || !(n10 <= (e10[r10] + (e10[r10 + 1] || e10[r10])) / 2))); r10++) ;
    return tt(a10 * i10, -Math.round(Math.log(1e-3) / Math.LN10));
  },
  objectEach: ti,
  offset: function(t11) {
    let e10 = R.documentElement, i10 = t11.parentElement || t11.parentNode ? t11.getBoundingClientRect() : {
      top: 0,
      left: 0,
      width: 0,
      height: 0
    };
    return {
      top: i10.top + (W.pageYOffset || e10.scrollTop) - (e10.clientTop || 0),
      left: i10.left + (W.pageXOffset || e10.scrollLeft) - (e10.clientLeft || 0),
      width: i10.width,
      height: i10.height
    };
  },
  pad: function(t11, e10, i10) {
    return Array((e10 || 2) + 1 - String(t11).replace("-", "").length).join(i10 || "0") + t11;
  },
  pick: K,
  pInt: F,
  pushUnique: function(t11, e10) {
    return 0 > t11.indexOf(e10) && !!t11.push(e10);
  },
  relativeLength: function(t11, e10, i10) {
    return /%$/.test(t11) ? e10 * parseFloat(t11) / 100 + (i10 || 0) : parseFloat(t11);
  },
  removeEvent: ts,
  replaceNested: function(t11, ...e10) {
    let i10, s10;
    do
      for (s10 of (i10 = t11, e10)) t11 = t11.replace(s10[0], s10[1]);
    while (t11 !== i10);
    return t11;
  },
  splat: q,
  stableSort: function(t11, e10) {
    let i10, s10, o10 = t11.length;
    for (s10 = 0; s10 < o10; s10++) t11[s10].safeI = s10;
    for (t11.sort(function(t12, s11) {
      return 0 === (i10 = e10(t12, s11)) ? t12.safeI - s11.safeI : i10;
    }), s10 = 0; s10 < o10; s10++) delete t11[s10].safeI;
  },
  syncTimeout: function(t11, e10, i10) {
    return e10 > 0 ? setTimeout(t11, e10, i10) : (t11.call(0, i10), -1);
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
  ucfirst: function(t11) {
    return G(t11) ? t11.substring(0, 1).toUpperCase() + t11.substring(1) : String(t11);
  },
  uniqueKey: tr,
  useSerialIds: function(e10) {
    return t = K(e10, t);
  },
  wrap: function(t11, e10, i10) {
    let s10 = t11[e10];
    t11[e10] = function() {
      let t12 = arguments, e11 = this;
      return i10.apply(this, [function() {
        return s10.apply(e11, arguments.length ? arguments : t12);
      }].concat([].slice.call(arguments)));
    };
  }
};
var {
  pageLang: tn,
  win: th
} = N;
var {
  defined: tl,
  error: td,
  extend: tc,
  isNumber: tp,
  isObject: tg,
  isString: tu,
  merge: tf,
  objectEach: tm,
  pad: tx,
  splat: ty,
  timeUnits: tb,
  ucfirst: tv
} = ta;
var tk = N.isSafari && th.Intl && !th.Intl.DateTimeFormat.prototype.formatRange;
var tM = class {
  constructor(t11, e10) {
    this.options = {
      timezone: "UTC"
    }, this.variableTimezone = false, this.Date = th.Date, this.update(t11), this.lang = e10;
  }
  update(t11 = {}) {
    this.dTLCache = {}, this.options = t11 = tf(true, this.options, t11);
    let {
      timezoneOffset: e10,
      useUTC: i10,
      locale: s10
    } = t11;
    this.Date = t11.Date || th.Date || Date;
    let o10 = t11.timezone;
    tl(i10) && (o10 = i10 ? "UTC" : void 0), e10 && e10 % 60 == 0 && (o10 = "Etc/GMT" + (e10 > 0 ? "+" : "") + e10 / 60), this.variableTimezone = "UTC" !== o10 && o10?.indexOf("Etc/GMT") !== 0, this.timezone = o10, this.lang && s10 && (this.lang.locale = s10), ["months", "shortMonths", "weekdays", "shortWeekdays"].forEach((t12) => {
      let e11 = /months/i.test(t12), i11 = /short/.test(t12), s11 = {
        timeZone: "UTC"
      };
      s11[e11 ? "month" : "weekday"] = i11 ? "short" : "long", this[t12] = (e11 ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [3, 4, 5, 6, 7, 8, 9]).map((t13) => this.dateFormat(s11, (e11 ? 31 : 1) * 24 * 36e5 * t13));
    });
  }
  toParts(t11) {
    let [e10, i10, s10, o10, r10, a10, n10] = this.dateTimeFormat({
      weekday: "narrow",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    }, t11, "es").split(/(?:, | |\/|:)/g);
    return [o10, s10 - 1, i10, r10, a10, n10, Math.floor(Number(t11) || 0) % 1e3, "DLMXJVS".indexOf(e10)].map(Number);
  }
  dateTimeFormat(t11, e10, i10 = this.options.locale || tn) {
    let s10 = JSON.stringify(t11) + i10;
    tu(t11) && (t11 = this.str2dtf(t11));
    let o10 = this.dTLCache[s10];
    if (!o10) {
      t11.timeZone ?? (t11.timeZone = this.timezone);
      try {
        o10 = new Intl.DateTimeFormat(i10, t11);
      } catch (e11) {
        /Invalid time zone/i.test(e11.message) ? (td(34), t11.timeZone = "UTC", o10 = new Intl.DateTimeFormat(i10, t11)) : td(e11.message, false);
      }
    }
    return this.dTLCache[s10] = o10, o10?.format(e10) || "";
  }
  str2dtf(t11, e10 = {}) {
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
      -1 !== t11.indexOf(s10) && tc(e10, i10[s10]);
    }), e10;
  }
  makeTime(t11, e10, i10 = 1, s10 = 0, o10, r10, a10) {
    let n10 = this.Date.UTC(t11, e10, i10, s10, o10 || 0, r10 || 0, a10 || 0);
    if ("UTC" !== this.timezone) {
      let t12 = this.getTimezoneOffset(n10);
      if (n10 += t12, -1 !== [2, 3, 8, 9, 10, 11].indexOf(e10) && (s10 < 5 || s10 > 20)) {
        let e11 = this.getTimezoneOffset(n10);
        t12 !== e11 ? n10 += e11 - t12 : t12 - 36e5 !== this.getTimezoneOffset(n10 - 36e5) || tk || (n10 -= 36e5);
      }
    }
    return n10;
  }
  parse(t11) {
    if (!tu(t11)) return t11 ?? void 0;
    let e10 = (t11 = t11.replace(/\//g, "-").replace(/(GMT|UTC)/, "")).indexOf("Z") > -1 || /([+-][0-9]{2}):?[0-9]{2}$/.test(t11), i10 = /^[0-9]{4}-[0-9]{2}(-[0-9]{2}|)$/.test(t11);
    e10 || i10 || (t11 += "Z");
    let s10 = Date.parse(t11);
    if (tp(s10)) return s10 + (!e10 || i10 ? this.getTimezoneOffset(s10) : 0);
  }
  getTimezoneOffset(t11) {
    if ("UTC" !== this.timezone) {
      let [e10, i10, s10, o10, r10 = 0] = this.dateTimeFormat({
        timeZoneName: "shortOffset"
      }, t11, "en").split(/(GMT|:)/).map(Number), a10 = -(60 * (s10 + r10 / 60) * 6e4);
      if (tp(a10)) return a10;
    }
    return 0;
  }
  dateFormat(t11, e10, i10) {
    let s10 = this.lang;
    if (!tl(e10) || isNaN(e10)) return s10?.invalidDate || "";
    if (tu(t11 = t11 ?? "%Y-%m-%d %H:%M:%S")) {
      let i11, o10 = /%\[([a-zA-Z]+)\]/g;
      for (; i11 = o10.exec(t11); ) t11 = t11.replace(i11[0], this.dateTimeFormat(i11[1], e10, s10?.locale));
    }
    if (tu(t11) && -1 !== t11.indexOf("%")) {
      let i11 = this, [o10, r10, a10, n10, h10, l2, d2, c2] = this.toParts(e10), p2 = s10?.weekdays || this.weekdays, g2 = s10?.shortWeekdays || this.shortWeekdays, u2 = s10?.months || this.months, f2 = s10?.shortMonths || this.shortMonths;
      tm(tc({
        a: g2 ? g2[c2] : p2[c2].substr(0, 3),
        A: p2[c2],
        d: tx(a10),
        e: tx(a10, 2, " "),
        w: c2,
        v: s10?.weekFrom ?? "",
        b: f2[r10],
        B: u2[r10],
        m: tx(r10 + 1),
        o: r10 + 1,
        y: o10.toString().substr(2, 2),
        Y: o10,
        H: tx(n10),
        k: n10,
        I: tx(n10 % 12 || 12),
        l: n10 % 12 || 12,
        M: tx(h10),
        p: n10 < 12 ? "AM" : "PM",
        P: n10 < 12 ? "am" : "pm",
        S: tx(l2),
        L: tx(d2, 3)
      }, N.dateFormats), function(s11, o11) {
        if (tu(t11)) for (; -1 !== t11.indexOf("%" + o11); ) t11 = t11.replace("%" + o11, "function" == typeof s11 ? s11.call(i11, e10) : s11);
      });
    } else if (tg(t11)) {
      let i11 = (this.getTimezoneOffset(e10) || 0) / 36e5, s11 = this.timezone || "Etc/GMT" + (i11 >= 0 ? "+" : "") + i11, {
        prefix: o10 = "",
        suffix: r10 = ""
      } = t11;
      t11 = o10 + this.dateTimeFormat(tc({
        timeZone: s11
      }, t11), e10) + r10;
    }
    return i10 ? tv(t11) : t11;
  }
  resolveDTLFormat(t11) {
    return tg(t11, true) ? tg(t11, true) && void 0 === t11.main ? {
      main: t11
    } : t11 : {
      main: (t11 = ty(t11))[0],
      from: t11[1],
      to: t11[2]
    };
  }
  getDateFormat(t11, e10, i10, s10) {
    let o10 = this.dateFormat("%m-%d %H:%M:%S.%L", e10), r10 = "01-01 00:00:00.000", a10 = {
      millisecond: 15,
      second: 12,
      minute: 9,
      hour: 6,
      day: 3
    }, n10 = "millisecond", h10 = n10;
    for (n10 in tb) {
      if (t11 && t11 === tb.week && +this.dateFormat("%w", e10) === i10 && o10.substr(6) === r10.substr(6)) {
        n10 = "week";
        break;
      }
      if (t11 && tb[n10] > t11) {
        n10 = h10;
        break;
      }
      if (a10[n10] && o10.substr(a10[n10]) !== r10.substr(a10[n10])) break;
      "week" !== n10 && (h10 = n10);
    }
    return this.resolveDTLFormat(s10[n10]).main;
  }
};
var {
  defined: tw,
  extend: tS,
  timeUnits: tT
} = ta;
var tC = class extends tM {
  getTimeTicks(t11, e10, i10, s10) {
    let o10 = this, r10 = [], a10 = {}, {
      count: n10 = 1,
      unitRange: h10
    } = t11, [l2, d2, c2, p2, g2, u2] = o10.toParts(e10), f2 = (e10 || 0) % 1e3, m2;
    if (s10 ?? (s10 = 1), tw(e10)) {
      if (f2 = h10 >= tT.second ? 0 : n10 * Math.floor(f2 / n10), h10 >= tT.second && (u2 = h10 >= tT.minute ? 0 : n10 * Math.floor(u2 / n10)), h10 >= tT.minute && (g2 = h10 >= tT.hour ? 0 : n10 * Math.floor(g2 / n10)), h10 >= tT.hour && (p2 = h10 >= tT.day ? 0 : n10 * Math.floor(p2 / n10)), h10 >= tT.day && (c2 = h10 >= tT.month ? 1 : Math.max(1, n10 * Math.floor(c2 / n10))), h10 >= tT.month && (d2 = h10 >= tT.year ? 0 : n10 * Math.floor(d2 / n10)), h10 >= tT.year && (l2 -= l2 % n10), h10 === tT.week) {
        n10 && (e10 = o10.makeTime(l2, d2, c2, p2, g2, u2, f2));
        let t13 = this.dateTimeFormat({
          timeZone: this.timezone,
          weekday: "narrow"
        }, e10, "es"), i11 = "DLMXJVS".indexOf(t13);
        c2 += -i11 + s10 + (i11 < s10 ? -7 : 0);
      }
      e10 = o10.makeTime(l2, d2, c2, p2, g2, u2, f2), o10.variableTimezone && tw(i10) && (m2 = i10 - e10 > 4 * tT.month || o10.getTimezoneOffset(e10) !== o10.getTimezoneOffset(i10));
      let t12 = e10, x2 = 1;
      for (; t12 < i10; ) r10.push(t12), h10 === tT.year ? t12 = o10.makeTime(l2 + x2 * n10, 0) : h10 === tT.month ? t12 = o10.makeTime(l2, d2 + x2 * n10) : m2 && (h10 === tT.day || h10 === tT.week) ? t12 = o10.makeTime(l2, d2, c2 + x2 * n10 * (h10 === tT.day ? 1 : 7)) : m2 && h10 === tT.hour && n10 > 1 ? t12 = o10.makeTime(l2, d2, c2, p2 + x2 * n10) : t12 += h10 * n10, x2++;
      r10.push(t12), h10 <= tT.hour && r10.length < 1e4 && r10.forEach((t13) => {
        t13 % 18e5 == 0 && "000000000" === o10.dateFormat("%H%M%S%L", t13) && (a10[t13] = "day");
      });
    }
    return r10.info = tS(t11, {
      higherRanks: a10,
      totalRange: h10 * n10
    }), r10;
  }
};
var {
  isTouchDevice: tA
} = N;
var {
  fireEvent: tP,
  merge: tL
} = ta;
var tO = {
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
      easing: (t11) => Math.sqrt(1 - Math.pow(t11 - 1, 2))
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
    snap: tA ? 25 : 10,
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
};
var tE = new tC(tO.time, tO.lang);
var tI = {
  defaultOptions: tO,
  defaultTime: tE,
  getOptions: function() {
    return tO;
  },
  setOptions: function(t11) {
    return tP(N, "setOptions", {
      options: t11
    }), tL(true, tO, t11), t11.time && tE.update(tO.time), t11.lang && "locale" in t11.lang && tE.update({
      locale: t11.lang.locale
    }), t11.lang?.chartTitle && (tO.title = __spreadProps(__spreadValues({}, tO.title), {
      text: t11.lang.chartTitle
    })), tO;
  }
};
var {
  win: tD
} = N;
var {
  isNumber: tB,
  isString: tN,
  merge: tz,
  pInt: tR,
  defined: tW
} = ta;
var tX = (t11, e10, i10) => `color-mix(in srgb,${t11},${e10} ${100 * i10}%)`;
var tF = (t11) => tN(t11) && !!t11 && "none" !== t11;
var tG = class _tG {
  static parse(t11) {
    return t11 ? new _tG(t11) : _tG.None;
  }
  constructor(t11) {
    let e10, i10, s10, o10;
    this.rgba = [NaN, NaN, NaN, NaN], this.input = t11;
    let r10 = N.Color;
    if (r10 && r10 !== _tG) return new r10(t11);
    if ("object" == typeof t11 && void 0 !== t11.stops) this.stops = t11.stops.map((t12) => new _tG(t12[1]));
    else if ("string" == typeof t11) for (this.input = t11 = _tG.names[t11.toLowerCase()] || t11, s10 = _tG.parsers.length; s10-- && !i10; ) (e10 = (o10 = _tG.parsers[s10]).regex.exec(t11)) && (i10 = o10.parse(e10));
    i10 && (this.rgba = i10);
  }
  get(t11) {
    let e10 = this.input, i10 = this.rgba;
    if (this.output) return this.output;
    if ("object" == typeof e10 && void 0 !== this.stops) {
      let i11 = tz(e10);
      return i11.stops = [].slice.call(i11.stops), this.stops.forEach((e11, s10) => {
        i11.stops[s10] = [i11.stops[s10][0], e11.get(t11)];
      }), i11;
    }
    return i10 && tB(i10[0]) ? "rgb" !== t11 && (t11 || 1 !== i10[3]) ? "a" === t11 ? `${i10[3]}` : "rgba(" + i10.join(",") + ")" : "rgb(" + i10[0] + "," + i10[1] + "," + i10[2] + ")" : e10;
  }
  brighten(t11) {
    let e10 = this.rgba;
    if (this.stops) this.stops.forEach(function(e11) {
      e11.brighten(t11);
    });
    else if (tB(t11) && 0 !== t11) if (tB(e10[0])) for (let i10 = 0; i10 < 3; i10++) e10[i10] += tR(255 * t11), e10[i10] < 0 && (e10[i10] = 0), e10[i10] > 255 && (e10[i10] = 255);
    else _tG.useColorMix && tF(this.input) && (this.output = tX(this.input, t11 > 0 ? "white" : "black", Math.abs(t11)));
    return this;
  }
  setOpacity(t11) {
    return this.rgba[3] = t11, this;
  }
  tweenTo(t11, e10) {
    let i10 = this.rgba, s10 = t11.rgba;
    if (!tB(i10[0]) || !tB(s10[0])) return _tG.useColorMix && tF(this.input) && tF(t11.input) && e10 < 0.99 ? tX(this.input, t11.input, e10) : t11.input || "none";
    let o10 = 1 !== s10[3] || 1 !== i10[3], r10 = (t12, s11) => t12 + (i10[s11] - t12) * (1 - e10), a10 = s10.slice(0, 3).map(r10).map(Math.round);
    return o10 && a10.push(r10(s10[3], 3)), (o10 ? "rgba(" : "rgb(") + a10.join(",") + ")";
  }
};
tG.names = {
  white: "#ffffff",
  black: "#000000"
}, tG.parsers = [{
  regex: /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d?(?:\.\d+)?)\s*\)/,
  parse: function(t11) {
    return [tR(t11[1]), tR(t11[2]), tR(t11[3]), parseFloat(t11[4], 10)];
  }
}, {
  regex: /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/,
  parse: function(t11) {
    return [tR(t11[1]), tR(t11[2]), tR(t11[3]), 1];
  }
}, {
  regex: /^#([a-f0-9])([a-f0-9])([a-f0-9])([a-f0-9])?$/i,
  parse: function(t11) {
    return [tR(t11[1] + t11[1], 16), tR(t11[2] + t11[2], 16), tR(t11[3] + t11[3], 16), tW(t11[4]) ? tR(t11[4] + t11[4], 16) / 255 : 1];
  }
}, {
  regex: /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})?$/i,
  parse: function(t11) {
    return [tR(t11[1], 16), tR(t11[2], 16), tR(t11[3], 16), tW(t11[4]) ? tR(t11[4], 16) / 255 : 1];
  }
}], tG.useColorMix = tD.CSS?.supports("color", "color-mix(in srgb,red,blue 9%)"), tG.None = new tG("");
var {
  parse: tH
} = tG;
var {
  win: tY
} = N;
var {
  isNumber: tj,
  objectEach: tU
} = ta;
var t$ = class _t$ {
  constructor(t11, e10, i10) {
    this.pos = NaN, this.options = e10, this.elem = t11, this.prop = i10;
  }
  dSetter() {
    let t11 = this.paths, e10 = t11?.[0], i10 = t11?.[1], s10 = this.now || 0, o10 = [];
    if (1 !== s10 && e10 && i10) {
      if (e10.length === i10.length && s10 < 1) for (let t12 = 0; t12 < i10.length; t12++) {
        let r10 = e10[t12], a10 = i10[t12], n10 = [];
        for (let t13 = 0; t13 < a10.length; t13++) {
          let e11 = r10[t13], i11 = a10[t13];
          tj(e11) && tj(i11) && ("A" !== a10[0] || 4 !== t13 && 5 !== t13) ? n10[t13] = e11 + s10 * (i11 - e11) : n10[t13] = i11;
        }
        o10.push(n10);
      }
      else o10 = i10;
    } else o10 = this.toD || [];
    this.elem.attr("d", o10, void 0, true);
  }
  update() {
    let t11 = this.elem, e10 = this.prop, i10 = this.now, s10 = this.options.step;
    this[e10 + "Setter"] ? this[e10 + "Setter"]() : t11.attr ? t11.element && t11.attr(e10, i10, null, true) : t11.style[e10] = i10 + this.unit, s10 && s10.call(t11, i10, this);
  }
  run(t11, e10, i10) {
    let s10 = this, o10 = s10.options, r10 = function(t12) {
      return !r10.stopped && s10.step(t12);
    }, a10 = tY.requestAnimationFrame || function(t12) {
      setTimeout(t12, 13);
    }, n10 = function() {
      for (let t12 = 0; t12 < _t$.timers.length; t12++) _t$.timers[t12]() || _t$.timers.splice(t12--, 1);
      _t$.timers.length && a10(n10);
    };
    t11 !== e10 || this.elem["forceAnimate:" + this.prop] ? (this.startTime = +/* @__PURE__ */ new Date(), this.start = t11, this.end = e10, this.unit = i10, this.now = this.start, this.pos = 0, r10.elem = this.elem, r10.prop = this.prop, r10() && 1 === _t$.timers.push(r10) && a10(n10)) : (delete o10.curAnim[this.prop], o10.complete && 0 === Object.keys(o10.curAnim).length && o10.complete.call(this.elem));
  }
  step(t11) {
    let e10, i10, s10 = +/* @__PURE__ */ new Date(), o10 = this.options, r10 = this.elem, a10 = o10.complete, n10 = o10.duration, h10 = o10.curAnim;
    return r10.attr && !r10.element ? e10 = false : t11 || s10 >= n10 + this.startTime ? (this.now = this.end, this.pos = 1, this.update(), h10[this.prop] = true, i10 = true, tU(h10, function(t12) {
      true !== t12 && (i10 = false);
    }), i10 && a10 && a10.call(r10), e10 = false) : (this.pos = o10.easing((s10 - this.startTime) / n10), this.now = this.start + (this.end - this.start) * this.pos, this.update(), e10 = true), e10;
  }
  initPath(t11, e10, i10) {
    let s10 = t11.startX, o10 = t11.endX, r10 = i10.slice(), a10 = t11.isArea, n10 = a10 ? 2 : 1, h10 = e10 && i10.length > e10.length && i10.hasStackedCliffs, l2, d2, c2, p2, g2 = e10?.slice();
    if (!g2 || h10) return [r10, r10];
    function u2(t12, e11) {
      for (; t12.length < d2; ) {
        let i11 = t12[0], s11 = e11[d2 - t12.length];
        if (s11 && "M" === i11[0] && ("C" === s11[0] ? t12[0] = ["C", i11[1], i11[2], i11[1], i11[2], i11[1], i11[2]] : t12[0] = ["L", i11[1], i11[2]]), t12.unshift(i11), a10) {
          let e12 = t12.pop();
          t12.push(t12[t12.length - 1], e12);
        }
      }
    }
    function f2(t12) {
      for (; t12.length < d2; ) {
        let e11 = t12[Math.floor(t12.length / n10) - 1].slice();
        if ("C" === e11[0] && (e11[1] = e11[5], e11[2] = e11[6]), a10) {
          let i11 = t12[Math.floor(t12.length / n10)].slice();
          t12.splice(t12.length / 2, 0, e11, i11);
        } else t12.push(e11);
      }
    }
    if (s10 && o10 && o10.length) {
      for (c2 = 0; c2 < s10.length; c2++) if (s10[c2] === o10[0]) {
        l2 = c2;
        break;
      } else if (s10[0] === o10[o10.length - s10.length + c2]) {
        l2 = c2, p2 = true;
        break;
      } else if (s10[s10.length - 1] === o10[o10.length - s10.length + c2]) {
        l2 = s10.length - c2;
        break;
      }
      void 0 === l2 && (g2 = []);
    }
    return g2.length && tj(l2) && (d2 = r10.length + l2 * n10, p2 ? (u2(g2, r10), f2(r10)) : (u2(r10, g2), f2(g2))), [g2, r10];
  }
  fillSetter() {
    _t$.prototype.strokeSetter.apply(this, arguments);
  }
  strokeSetter() {
    this.elem.attr(this.prop, tH(this.start).tweenTo(tH(this.end), this.pos), void 0, true);
  }
};
t$.timers = [];
var {
  defined: tV,
  getStyle: tZ,
  isArray: tq,
  isNumber: t_,
  isObject: tK,
  merge: tJ,
  objectEach: tQ,
  pick: t0
} = ta;
function t1(t11) {
  return tK(t11) ? tJ({
    duration: 500,
    defer: 0
  }, t11) : {
    duration: 500 * !!t11,
    defer: 0
  };
}
function t22(t11, e10) {
  let i10 = t$.timers.length;
  for (; i10--; ) t$.timers[i10].elem !== t11 || e10 && e10 !== t$.timers[i10].prop || (t$.timers[i10].stopped = true);
}
var t3 = {
  animate: function(t11, e10, i10) {
    let s10, o10 = "", r10, a10, n10;
    tK(i10) || (n10 = arguments, i10 = {
      duration: n10[2],
      easing: n10[3],
      complete: n10[4]
    }), t_(i10.duration) || (i10.duration = 400), i10.easing = "function" == typeof i10.easing ? i10.easing : Math[i10.easing] || Math.easeInOutSine, i10.curAnim = tJ(e10), tQ(e10, function(n11, h10) {
      t22(t11, h10), a10 = new t$(t11, i10, h10), r10 = void 0, "d" === h10 && tq(e10.d) ? (a10.paths = a10.initPath(t11, t11.pathArray, e10.d), a10.toD = e10.d, s10 = 0, r10 = 1) : t11.attr ? s10 = t11.attr(h10) : (s10 = parseFloat(tZ(t11, h10)) || 0, "opacity" !== h10 && (o10 = "px")), r10 || (r10 = n11), "string" == typeof r10 && r10.match("px") && (r10 = r10.replace(/px/g, "")), a10.run(s10, r10, o10);
    });
  },
  animObject: t1,
  getDeferredAnimation: function(t11, e10, i10) {
    let s10 = t1(e10), o10 = i10 ? [i10] : t11.series, r10 = 0, a10 = 0;
    return o10.forEach((t12) => {
      let i11 = t1(t12.options.animation);
      r10 = tK(e10) && tV(e10.defer) ? s10.defer : Math.max(r10, i11.duration + i11.defer), a10 = Math.min(s10.duration, i11.duration);
    }), t11.renderer.forExport && (r10 = 0), {
      defer: Math.max(0, r10 - a10),
      duration: Math.min(r10, a10)
    };
  },
  setAnimation: function(t11, e10) {
    e10.renderer.globalAnimation = t0(t11, e10.options.chart.animation, true);
  },
  stop: t22
};
var {
  SVG_NS: t5,
  win: t6
} = N;
var {
  attr: t9,
  createElement: t4,
  css: t8,
  error: t7,
  isFunction: et,
  isString: ee,
  objectEach: ei,
  splat: es
} = ta;
var {
  trustedTypes: eo
} = t6;
var er = eo && et(eo.createPolicy) && eo.createPolicy("highcharts", {
  createHTML: (t11) => t11
});
var ea = er ? er.createHTML("") : "";
var en = class _en {
  static filterUserAttributes(t11) {
    return ei(t11, (e10, i10) => {
      let s10 = true;
      -1 === _en.allowedAttributes.indexOf(i10) && (s10 = false), -1 !== ["background", "dynsrc", "href", "lowsrc", "src"].indexOf(i10) && (s10 = ee(e10) && _en.allowedReferences.some((t12) => 0 === e10.indexOf(t12))), s10 || (t7(33, false, void 0, {
        "Invalid attribute in config": `${i10}`
      }), delete t11[i10]), ee(e10) && t11[i10] && (t11[i10] = e10.replace(/</g, "&lt;"));
    }), t11;
  }
  static parseStyle(t11) {
    return t11.split(";").reduce((t12, e10) => {
      let i10 = e10.split(":").map((t13) => t13.trim()), s10 = i10.shift();
      return s10 && i10.length && (t12[s10.replace(/-([a-z])/g, (t13) => t13[1].toUpperCase())] = i10.join(":")), t12;
    }, {});
  }
  static setElementHTML(t11, e10) {
    t11.innerHTML = _en.emptyHTML, e10 && new _en(e10).addToDOM(t11);
  }
  constructor(t11) {
    this.nodes = "string" == typeof t11 ? this.parseMarkup(t11) : t11;
  }
  addToDOM(t11) {
    return function t12(e10, i10) {
      let s10;
      return es(e10).forEach(function(e11) {
        let o10, r10 = e11.tagName, a10 = e11.textContent ? N.doc.createTextNode(e11.textContent) : void 0, n10 = _en.bypassHTMLFiltering;
        if (r10) if ("#text" === r10) o10 = a10;
        else if (-1 !== _en.allowedTags.indexOf(r10) || n10) {
          let s11 = "svg" === r10 ? t5 : i10.namespaceURI || t5, h10 = N.doc.createElementNS(s11, r10), l2 = e11.attributes || {};
          ei(e11, function(t13, e12) {
            "tagName" !== e12 && "attributes" !== e12 && "children" !== e12 && "style" !== e12 && "textContent" !== e12 && (l2[e12] = t13);
          }), t9(h10, n10 ? l2 : _en.filterUserAttributes(l2)), e11.style && t8(h10, e11.style), a10 && h10.appendChild(a10), t12(e11.children || [], h10), o10 = h10;
        } else t7(33, false, void 0, {
          "Invalid tagName in config": r10
        });
        o10 && i10.appendChild(o10), s10 = o10;
      }), s10;
    }(this.nodes, t11);
  }
  parseMarkup(t11) {
    let e10, i10 = [];
    t11 = t11.trim().replace(/ style=(["'])/g, " data-style=$1");
    try {
      e10 = new DOMParser().parseFromString(er ? er.createHTML(t11) : t11, "text/html");
    } catch {
    }
    if (!e10) {
      let i11 = t4("div");
      i11.innerHTML = t11, e10 = {
        body: i11
      };
    }
    let s10 = (t12, e11) => {
      let i11 = t12.nodeName.toLowerCase(), o10 = {
        tagName: i11
      };
      "#text" === i11 && (o10.textContent = t12.textContent || "");
      let r10 = t12.attributes;
      if (r10) {
        let t13 = {};
        [].forEach.call(r10, (e12) => {
          "data-style" === e12.name ? o10.style = _en.parseStyle(e12.value) : t13[e12.name] = e12.value;
        }), o10.attributes = t13;
      }
      if (t12.childNodes.length) {
        let e12 = [];
        [].forEach.call(t12.childNodes, (t13) => {
          s10(t13, e12);
        }), e12.length && (o10.children = e12);
      }
      e11.push(o10);
    };
    return [].forEach.call(e10.body.childNodes, (t12) => s10(t12, i10)), i10;
  }
};
en.allowedAttributes = ["alt", "aria-controls", "aria-describedby", "aria-expanded", "aria-haspopup", "aria-hidden", "aria-label", "aria-labelledby", "aria-live", "aria-pressed", "aria-readonly", "aria-roledescription", "aria-selected", "class", "clip-path", "color", "colspan", "cx", "cy", "d", "disabled", "dx", "dy", "fill", "filterUnits", "flood-color", "flood-opacity", "height", "href", "id", "in", "in2", "markerHeight", "markerWidth", "offset", "opacity", "operator", "orient", "padding", "paddingLeft", "paddingRight", "patternUnits", "r", "radius", "refX", "refY", "result", "role", "rowspan", "scope", "slope", "src", "startOffset", "stdDeviation", "stroke-linecap", "stroke-width", "stroke", "style", "summary", "tabindex", "tableValues", "target", "text-align", "text-anchor", "textAnchor", "textLength", "title", "type", "valign", "width", "x", "x1", "x2", "xlink:href", "y", "y1", "y2", "zIndex"], en.allowedReferences = ["https://", "http://", "mailto:", "/", "../", "./", "#"], en.allowedTags = ["#text", "a", "abbr", "b", "br", "button", "caption", "circle", "clipPath", "code", "dd", "defs", "div", "dl", "dt", "em", "feComponentTransfer", "feComposite", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feMerge", "feMergeNode", "feMorphology", "feOffset", "filter", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "li", "linearGradient", "marker", "ol", "p", "path", "pattern", "pre", "rect", "small", "span", "stop", "strong", "style", "sub", "sup", "svg", "table", "tbody", "td", "text", "textPath", "th", "thead", "title", "tr", "tspan", "u", "ul"], en.emptyHTML = ea, en.bypassHTMLFiltering = false;
var {
  defaultOptions: eh,
  defaultTime: el
} = tI;
var {
  pageLang: ed
} = N;
var {
  extend: ec,
  getNestedProperty: ep,
  isArray: eg,
  isNumber: eu,
  isObject: ef,
  isString: em,
  pick: ex,
  ucfirst: ey
} = ta;
var eb = {
  add: (t11, e10) => t11 + e10,
  divide: (t11, e10) => 0 !== e10 ? t11 / e10 : "",
  eq: (t11, e10) => t11 == e10,
  each: function(t11) {
    let e10 = arguments[arguments.length - 1];
    return !!eg(t11) && t11.map((i10, s10) => ek(e10.body, ec(ef(i10) ? i10 : {
      "@this": i10
    }, {
      "@index": s10,
      "@first": 0 === s10,
      "@last": s10 === t11.length - 1
    }))).join("");
  },
  ge: (t11, e10) => t11 >= e10,
  gt: (t11, e10) => t11 > e10,
  if: (t11) => !!t11,
  le: (t11, e10) => t11 <= e10,
  lt: (t11, e10) => t11 < e10,
  multiply: (t11, e10) => t11 * e10,
  ne: (t11, e10) => t11 != e10,
  subtract: (t11, e10) => t11 - e10,
  ucfirst: ey,
  unless: (t11) => !t11
};
var ev = {};
function ek(t11 = "", e10, i10) {
  let s10 = RegExp(`\\{([\\p{L}\\d:\\.,;\\-\\/<>\\[\\]%_@+"'’= #\\(\\)]+)\\}`, "gu"), o10 = RegExp(`\\(([\\p{L}\\d:\\.,;\\-\\/<>\\[\\]%_@+"'= ]+)\\)`, "gu"), r10 = [], a10 = /f$/, n10 = /\.(\d)/, h10 = i10?.options?.lang || eh.lang, l2 = i10?.time || el, d2 = i10?.numberFormatter || eM.bind(i10), c2 = (t12 = "") => {
    let i11;
    return "true" === t12 || "false" !== t12 && ((i11 = Number(t12)).toString() === t12 ? i11 : /^["'].+["']$/.test(t12) ? t12.slice(1, -1) : ep(t12, e10));
  }, p2, g2, u2 = 0, f2;
  for (; null !== (p2 = s10.exec(t11)); ) {
    let i11 = p2, s11 = o10.exec(p2[1]);
    s11 && (p2 = s11, f2 = true), g2?.isBlock || (g2 = {
      ctx: e10,
      expression: p2[1],
      find: p2[0],
      isBlock: "#" === p2[1].charAt(0),
      start: p2.index,
      startInner: p2.index + p2[0].length,
      length: p2[0].length
    });
    let a11 = (g2.isBlock ? i11 : p2)[1].split(" ")[0].replace("#", "");
    eb[a11] && (g2.isBlock && a11 === g2.fn && u2++, g2.fn || (g2.fn = a11));
    let n11 = "else" === p2[1];
    if (g2.isBlock && g2.fn && (p2[1] === `/${g2.fn}` || n11)) {
      if (u2) !n11 && u2--;
      else {
        let e11 = g2.startInner, i12 = t11.substr(e11, p2.index - e11);
        void 0 === g2.body ? (g2.body = i12, g2.startInner = p2.index + p2[0].length) : g2.elseBody = i12, g2.find += i12 + p2[0], n11 || (r10.push(g2), g2 = void 0);
      }
    } else g2.isBlock || r10.push(g2);
    if (s11 && !g2?.isBlock) break;
  }
  return r10.forEach((s11) => {
    let r11, p3, {
      body: g3,
      elseBody: u3,
      expression: f3,
      fn: m2
    } = s11;
    if (m2) {
      let t12 = [s11], o11 = [], a11 = f3.length, n11 = 0, h11;
      for (p3 = 0; p3 <= a11; p3++) {
        let t13 = f3.charAt(p3);
        h11 || '"' !== t13 && "'" !== t13 ? h11 === t13 && (h11 = "") : h11 = t13, h11 || " " !== t13 && p3 !== a11 || (o11.push(f3.substr(n11, p3 - n11)), n11 = p3 + 1);
      }
      for (p3 = eb[m2].length; p3--; ) t12.unshift(c2(o11[p3 + 1]));
      r11 = eb[m2].apply(e10, t12), s11.isBlock && "boolean" == typeof r11 && (r11 = ek(r11 ? g3 : u3, e10, i10));
    } else {
      let t12 = /^["'].+["']$/.test(f3) ? [f3] : f3.split(":");
      if (r11 = c2(t12.shift() || ""), t12.length && "number" == typeof r11) {
        let e11 = t12.join(":");
        if (a10.test(e11)) {
          let t13 = parseInt((e11.match(n10) || ["", "-1"])[1], 10);
          null !== r11 && (r11 = d2(r11, t13, h10.decimalPoint, e11.indexOf(",") > -1 ? h10.thousandsSep : ""));
        } else r11 = l2.dateFormat(e11, r11);
      }
      o10.lastIndex = 0, o10.test(s11.find) && em(r11) && (r11 = `"${r11}"`);
    }
    t11 = t11.replace(s11.find, ex(r11, ""));
  }), f2 ? ek(t11, e10, i10) : t11;
}
function eM(t11, e10, i10, s10) {
  e10 *= 1;
  let o10, r10, [a10, n10] = (t11 = +t11 || 0).toString().split("e").map(Number), h10 = this?.options?.lang || eh.lang, l2 = (t11.toString().split(".")[1] || "").split("e")[0].length, d2 = e10, c2 = {};
  i10 ?? (i10 = h10.decimalPoint), s10 ?? (s10 = h10.thousandsSep), -1 === e10 ? e10 = Math.min(l2, 20) : eu(e10) ? e10 && n10 < 0 && ((r10 = e10 + n10) >= 0 ? (a10 = +a10.toExponential(r10).split("e")[0], e10 = r10) : (a10 = Math.floor(a10), t11 = e10 < 20 ? +(a10 * Math.pow(10, n10)).toFixed(e10) : 0, n10 = 0)) : e10 = 2, n10 && (e10 ?? (e10 = 2), t11 = a10), eu(e10) && e10 >= 0 && (c2.minimumFractionDigits = e10, c2.maximumFractionDigits = e10), "" === s10 && (c2.useGrouping = false);
  let p2 = s10 || i10, g2 = p2 ? "en" : this?.locale || h10.locale || ed, u2 = JSON.stringify(c2) + g2;
  return o10 = (ev[u2] ?? (ev[u2] = new Intl.NumberFormat(g2, c2))).format(t11), p2 && (o10 = o10.replace(/([,\.])/g, "_$1").replace(/_\,/g, s10 ?? ",").replace("_.", i10 ?? ".")), (e10 || 0 != +o10) && (!(n10 < 0) || d2) || (o10 = "0"), n10 && 0 != +o10 && (o10 += "e" + (n10 < 0 ? "" : "+") + n10), o10;
}
var ew = {
  dateFormat: function(t11, e10, i10) {
    return el.dateFormat(t11, e10, i10);
  },
  format: ek,
  helpers: eb,
  numberFormat: eM
};
(n = x || (x = {})).rendererTypes = {}, n.getRendererType = function(t11 = o) {
  return n.rendererTypes[t11] || n.rendererTypes[o];
}, n.registerRendererType = function(t11, e10, i10) {
  n.rendererTypes[t11] = e10, (!o || i10) && (o = t11, N.Renderer = e10);
};
var eS = x;
var {
  clamp: eT,
  pick: eC,
  pushUnique: eA,
  stableSort: eP
} = ta;
(y || (y = {})).distribute = function t10(e10, i10, s10) {
  let o10 = e10, r10 = o10.reducedLen || i10, a10 = (t11, e11) => t11.target - e11.target, n10 = [], h10 = e10.length, l2 = [], d2 = n10.push, c2, p2, g2, u2 = true, f2, m2, x2 = 0, y2;
  for (c2 = h10; c2--; ) x2 += e10[c2].size;
  if (x2 > r10) {
    for (eP(e10, (t11, e11) => (e11.rank || 0) - (t11.rank || 0)), g2 = (y2 = e10[0].rank === e10[e10.length - 1].rank) ? h10 / 2 : -1, p2 = y2 ? g2 : h10 - 1; g2 && x2 > r10; ) f2 = e10[c2 = Math.floor(p2)], eA(l2, c2) && (x2 -= f2.size), p2 += g2, y2 && p2 >= e10.length && (g2 /= 2, p2 = g2);
    l2.sort((t11, e11) => e11 - t11).forEach((t11) => d2.apply(n10, e10.splice(t11, 1)));
  }
  for (eP(e10, a10), e10 = e10.map((t11) => ({
    size: t11.size,
    targets: [t11.target],
    align: eC(t11.align, 0.5)
  })); u2; ) {
    for (c2 = e10.length; c2--; ) f2 = e10[c2], m2 = (Math.min.apply(0, f2.targets) + Math.max.apply(0, f2.targets)) / 2, f2.pos = eT(m2 - f2.size * f2.align, 0, i10 - f2.size);
    for (c2 = e10.length, u2 = false; c2--; ) c2 > 0 && e10[c2 - 1].pos + e10[c2 - 1].size > e10[c2].pos && (e10[c2 - 1].size += e10[c2].size, e10[c2 - 1].targets = e10[c2 - 1].targets.concat(e10[c2].targets), e10[c2 - 1].align = 0.5, e10[c2 - 1].pos + e10[c2 - 1].size > i10 && (e10[c2 - 1].pos = i10 - e10[c2 - 1].size), e10.splice(c2, 1), u2 = true);
  }
  return d2.apply(o10, n10), c2 = 0, e10.some((e11) => {
    let r11 = 0;
    return (e11.targets || []).some(() => (o10[c2].pos = e11.pos + r11, void 0 !== s10 && Math.abs(o10[c2].pos - o10[c2].target) > s10) ? (o10.slice(0, c2 + 1).forEach((t11) => delete t11.pos), o10.reducedLen = (o10.reducedLen || i10) - 0.1 * i10, o10.reducedLen > 0.1 * i10 && t10(o10, i10, s10), true) : (r11 += o10[c2].size, c2++, false));
  }), eP(o10, a10), o10;
};
var eL = y;
var {
  animate: eO,
  animObject: eE,
  stop: eI
} = t3;
var {
  deg2rad: eD,
  doc: eB,
  svg: eN,
  SVG_NS: ez,
  win: eR,
  isFirefox: eW
} = N;
var {
  addEvent: eX,
  attr: eF,
  createElement: eG,
  crisp: eH,
  css: eY,
  defined: ej,
  erase: eU,
  extend: e$,
  fireEvent: eV,
  getAlignFactor: eZ,
  isArray: eq,
  isFunction: e_,
  isNumber: eK,
  isObject: eJ,
  isString: eQ,
  merge: e0,
  objectEach: e1,
  pick: e2,
  pInt: e3,
  pushUnique: e5,
  replaceNested: e6,
  syncTimeout: e9,
  uniqueKey: e4
} = ta;
var e8 = class _e8 {
  _defaultGetter(t11) {
    let e10 = e2(this[t11 + "Value"], this[t11], this.element ? this.element.getAttribute(t11) : null, 0);
    return /^-?[\d\.]+$/.test(e10) && (e10 = parseFloat(e10)), e10;
  }
  _defaultSetter(t11, e10, i10) {
    i10.setAttribute(e10, t11);
  }
  add(t11) {
    let e10, i10 = this.renderer, s10 = this.element;
    return t11 && (this.parentGroup = t11), void 0 !== this.textStr && "text" === this.element.nodeName && i10.buildText(this), this.added = true, (!t11 || t11.handleZ || this.zIndex) && (e10 = this.zIndexSetter()), e10 || (t11 ? t11.element : i10.box).appendChild(s10), this.onAdd && this.onAdd(), this;
  }
  addClass(t11, e10) {
    let i10 = e10 ? "" : this.attr("class") || "";
    return (t11 = (t11 || "").split(/ /g).reduce(function(t12, e11) {
      return -1 === i10.indexOf(e11) && t12.push(e11), t12;
    }, i10 ? [i10] : []).join(" ")) !== i10 && this.attr("class", t11), this;
  }
  afterSetters() {
    this.doTransform && (this.updateTransform(), this.doTransform = false);
  }
  align(t11, e10, i10, s10 = true) {
    let o10 = this.renderer, r10 = o10.alignedObjects, a10 = !!t11;
    t11 ? (this.alignOptions = t11, this.alignByTranslate = e10, this.alignTo = i10) : (t11 = this.alignOptions || {}, e10 = this.alignByTranslate, i10 = this.alignTo);
    let n10 = !i10 || eQ(i10) ? i10 || "renderer" : void 0;
    n10 && (a10 && e5(r10, this), i10 = void 0);
    let h10 = e2(i10, o10[n10], o10), l2 = (h10.x || 0) + (t11.x || 0) + ((h10.width || 0) - (t11.width || 0)) * eZ(t11.align), d2 = (h10.y || 0) + (t11.y || 0) + ((h10.height || 0) - (t11.height || 0)) * eZ(t11.verticalAlign), c2 = {};
    return t11.align && (c2["text-align"] = t11.align), c2[e10 ? "translateX" : "x"] = Math.round(l2), c2[e10 ? "translateY" : "y"] = Math.round(d2), s10 && (this[this.placed ? "animate" : "attr"](c2), this.placed = true), this.alignAttr = c2, this;
  }
  alignSetter(t11) {
    let e10 = {
      left: "start",
      center: "middle",
      right: "end"
    };
    e10[t11] && (this.alignValue = t11, this.element.setAttribute("text-anchor", e10[t11]));
  }
  animate(t11, e10, i10) {
    let s10 = eE(e2(e10, this.renderer.globalAnimation, true)), o10 = s10.defer;
    return eB.hidden && (s10.duration = 0), 0 !== s10.duration ? (i10 && (s10.complete = i10), e9(() => {
      this.element && eO(this, t11, s10);
    }, o10)) : (this.attr(t11, void 0, i10 || s10.complete), e1(t11, function(t12, e11) {
      s10.step && s10.step.call(this, t12, {
        prop: e11,
        pos: 1,
        elem: this
      });
    }, this)), this;
  }
  applyTextOutline(t11) {
    let e10 = this.element;
    -1 !== t11.indexOf("contrast") && (t11 = t11.replace(/contrast/g, this.renderer.getContrast(e10.style.fill)));
    let i10 = t11.indexOf(" "), s10 = t11.substring(i10 + 1), o10 = t11.substring(0, i10);
    if (o10 && "none" !== o10 && N.svg) {
      this.fakeTS = true, o10 = o10.replace(/(^[\d\.]+)(.*?)$/g, function(t13, e11, i12) {
        return 2 * Number(e11) + i12;
      }), this.removeTextOutline();
      let t12 = eB.createElementNS(ez, "tspan");
      eF(t12, {
        class: "highcharts-text-outline",
        fill: s10,
        stroke: s10,
        "stroke-width": o10,
        "stroke-linejoin": "round"
      });
      let i11 = e10.querySelector("textPath") || e10;
      [].forEach.call(i11.childNodes, (e11) => {
        let i12 = e11.cloneNode(true);
        i12.removeAttribute && ["fill", "stroke", "stroke-width", "stroke"].forEach((t13) => i12.removeAttribute(t13)), t12.appendChild(i12);
      });
      let r10 = 0;
      [].forEach.call(i11.querySelectorAll("text tspan"), (t13) => {
        r10 += Number(t13.getAttribute("dy"));
      });
      let a10 = eB.createElementNS(ez, "tspan");
      a10.textContent = "​", eF(a10, {
        x: Number(e10.getAttribute("x")),
        dy: -r10
      }), t12.appendChild(a10), i11.insertBefore(t12, i11.firstChild);
    }
  }
  attr(t11, e10, i10, s10) {
    let {
      element: o10
    } = this, r10 = _e8.symbolCustomAttribs, a10, n10, h10 = this, l2;
    return "string" == typeof t11 && void 0 !== e10 && (a10 = t11, (t11 = {})[a10] = e10), "string" == typeof t11 ? h10 = (this[t11 + "Getter"] || this._defaultGetter).call(this, t11, o10) : (e1(t11, function(e11, i11) {
      l2 = false, s10 || eI(this, i11), this.symbolName && -1 !== r10.indexOf(i11) && (n10 || (this.symbolAttr(t11), n10 = true), l2 = true), this.rotation && ("x" === i11 || "y" === i11) && (this.doTransform = true), l2 || (this[i11 + "Setter"] || this._defaultSetter).call(this, e11, i11, o10);
    }, this), this.afterSetters()), i10 && i10.call(this), h10;
  }
  clip(t11) {
    if (t11 && !t11.clipPath) {
      let e10 = e4() + "-", i10 = this.renderer.createElement("clipPath").attr({
        id: e10
      }).add(this.renderer.defs);
      e$(t11, {
        clipPath: i10,
        id: e10,
        count: 0
      }), t11.add(i10);
    }
    return this.attr("clip-path", t11 ? `url(${this.renderer.url}#${t11.id})` : "none");
  }
  crisp(t11, e10) {
    e10 = Math.round(e10 || t11.strokeWidth || 0);
    let i10 = t11.x || this.x || 0, s10 = t11.y || this.y || 0, o10 = (t11.width || this.width || 0) + i10, r10 = (t11.height || this.height || 0) + s10, a10 = eH(i10, e10), n10 = eH(s10, e10);
    return e$(t11, {
      x: a10,
      y: n10,
      width: eH(o10, e10) - a10,
      height: eH(r10, e10) - n10
    }), ej(t11.strokeWidth) && (t11.strokeWidth = e10), t11;
  }
  complexColor(t11, e10, i10) {
    let s10 = this.renderer, o10, r10, a10, n10, h10, l2, d2, c2, p2, g2, u2 = [], f2;
    eV(this.renderer, "complexColor", {
      args: arguments
    }, function() {
      if (t11.radialGradient ? r10 = "radialGradient" : t11.linearGradient && (r10 = "linearGradient"), r10) {
        if (a10 = t11[r10], h10 = s10.gradients, l2 = t11.stops, p2 = i10.radialReference, eq(a10) && (t11[r10] = a10 = {
          x1: a10[0],
          y1: a10[1],
          x2: a10[2],
          y2: a10[3],
          gradientUnits: "userSpaceOnUse"
        }), "radialGradient" === r10 && p2 && !ej(a10.gradientUnits) && (n10 = a10, a10 = e0(a10, s10.getRadialAttr(p2, n10), {
          gradientUnits: "userSpaceOnUse"
        })), e1(a10, function(t12, e11) {
          "id" !== e11 && u2.push(e11, t12);
        }), e1(l2, function(t12) {
          u2.push(t12);
        }), h10[u2 = u2.join(",")]) g2 = h10[u2].attr("id");
        else {
          a10.id = g2 = e4();
          let t12 = h10[u2] = s10.createElement(r10).attr(a10).add(s10.defs);
          t12.radAttr = n10, t12.stops = [], l2.forEach(function(e11) {
            0 === e11[1].indexOf("rgba") ? (d2 = (o10 = tG.parse(e11[1])).get("rgb"), c2 = o10.get("a")) : (d2 = e11[1], c2 = 1);
            let i11 = s10.createElement("stop").attr({
              offset: e11[0],
              "stop-color": d2,
              "stop-opacity": c2
            }).add(t12);
            t12.stops.push(i11);
          });
        }
        f2 = "url(" + s10.url + "#" + g2 + ")", i10.setAttribute(e10, f2), i10.gradient = u2, t11.toString = function() {
          return f2;
        };
      }
    });
  }
  css(t11) {
    let e10 = this.styles, i10 = {}, s10 = this.element, o10, r10 = !e10;
    if (e10 && e1(t11, function(t12, s11) {
      e10 && e10[s11] !== t12 && (i10[s11] = t12, r10 = true);
    }), r10) {
      e10 && (t11 = e$(e10, i10)), null === t11.width || "auto" === t11.width ? delete this.textWidth : "text" === s10.nodeName.toLowerCase() && t11.width && (o10 = this.textWidth = e3(t11.width)), e$(this.styles, t11), o10 && !eN && this.renderer.forExport && delete t11.width;
      let r11 = eW && t11.fontSize || null;
      r11 && (eK(r11) || /^\d+$/.test(r11)) && (t11.fontSize += "px");
      let a10 = e0(t11);
      s10.namespaceURI === this.SVG_NS && (["textOutline", "textOverflow", "whiteSpace", "width"].forEach((t12) => a10 && delete a10[t12]), a10.color && (a10.fill = a10.color, delete a10.color)), eY(s10, a10);
    }
    return this.added && ("text" === this.element.nodeName && this.renderer.buildText(this), t11.textOutline && this.applyTextOutline(t11.textOutline)), this;
  }
  dashstyleSetter(t11) {
    let e10, i10 = this["stroke-width"];
    if ("inherit" === i10 && (i10 = 1), t11) {
      let s10 = (t11 = t11.toLowerCase()).replace("shortdashdotdot", "3,1,1,1,1,1,").replace("shortdashdot", "3,1,1,1").replace("shortdot", "1,1,").replace("shortdash", "3,1,").replace("longdash", "8,3,").replace(/dot/g, "1,3,").replace("dash", "4,3,").replace(/,$/, "").split(",");
      for (e10 = s10.length; e10--; ) s10[e10] = "" + e3(s10[e10]) * e2(i10, NaN);
      t11 = s10.join(",").replace(/NaN/g, "none"), this.element.setAttribute("stroke-dasharray", t11);
    }
  }
  destroy() {
    let t11 = this, {
      element: e10 = {},
      renderer: i10,
      stops: s10
    } = t11, o10 = e10.ownerSVGElement, r10 = "SPAN" === e10.nodeName && t11.parentGroup || void 0, a10;
    if (e10.onclick = e10.onmouseout = e10.onmouseover = e10.onmousemove = e10.point = null, eI(t11), t11.clipPath && o10) {
      let e11 = t11.clipPath;
      [].forEach.call(o10.querySelectorAll("[clip-path],[CLIP-PATH]"), function(t12) {
        t12.getAttribute("clip-path").indexOf(e11.element.id) > -1 && t12.removeAttribute("clip-path");
      }), t11.clipPath = e11.destroy();
    }
    if (s10) {
      for (let t12 of s10) t12.destroy();
      s10.length = 0;
    }
    for (t11.safeRemoveChild(e10); r10?.div && 0 === r10.div.childNodes.length; ) a10 = r10.parentGroup, t11.safeRemoveChild(r10.div), delete r10.div, r10 = a10;
    t11.alignOptions && eU(i10.alignedObjects, t11), e1(t11, (e11, i11) => {
      (t11[i11]?.parentGroup === t11 || -1 !== ["connector", "foreignObject"].indexOf(i11)) && t11[i11]?.destroy?.(), delete t11[i11];
    });
  }
  dSetter(t11, e10, i10) {
    eq(t11) && ("string" == typeof t11[0] && (t11 = this.renderer.pathToSegments(t11)), this.pathArray = t11, t11 = t11.reduce((t12, e11, i11) => e11?.join ? (i11 ? t12 + " " : "") + e11.join(" ") : (e11 || "").toString(), "")), /(NaN| {2}|^$)/.test(t11) && (t11 = "M 0 0"), this[e10] !== t11 && (i10.setAttribute(e10, t11), this[e10] = t11);
  }
  fillSetter(t11, e10, i10) {
    "string" == typeof t11 ? i10.setAttribute(e10, t11) : t11 && this.complexColor(t11, e10, i10);
  }
  hrefSetter(t11, e10, i10) {
    i10.setAttributeNS("http://www.w3.org/1999/xlink", e10, t11);
  }
  getBBox(t11, e10) {
    let i10, s10, o10, {
      element: r10,
      renderer: a10,
      styles: n10,
      textStr: h10
    } = this, {
      cache: l2,
      cacheKeys: d2
    } = a10, c2 = r10.namespaceURI === this.SVG_NS, p2 = e2(e10, this.rotation, 0), g2 = a10.styledMode ? r10 && _e8.prototype.getStyle.call(r10, "font-size") : n10.fontSize, u2 = this.getBBoxCacheKey([a10.rootFontSize, this.textWidth, this.alignValue, n10.fontWeight, n10.lineClamp, n10.textOverflow, g2, p2]);
    if (u2 && !t11 && (i10 = l2[u2]), !i10 || i10.polygon) {
      if (c2 || a10.forExport) {
        try {
          o10 = this.fakeTS && function(t13) {
            let e11 = r10.querySelector(".highcharts-text-outline");
            e11 && eY(e11, {
              display: t13
            });
          }, e_(o10) && o10("none"), i10 = r10.getBBox ? e$({}, r10.getBBox()) : {
            width: r10.offsetWidth,
            height: r10.offsetHeight,
            x: 0,
            y: 0
          }, e_(o10) && o10("");
        } catch {
        }
        (!i10 || i10.width < 0) && (i10 = {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        });
      } else i10 = this.htmlGetBBox();
      s10 = i10.height, c2 && (i10.height = s10 = {
        "11px,17": 14,
        "13px,20": 16
      }[`${g2 || ""},${Math.round(s10)}`] || s10), p2 && (i10 = this.getRotatedBox(i10, p2));
      let t12 = {
        bBox: i10
      };
      eV(this, "afterGetBBox", t12), i10 = t12.bBox;
    }
    if (u2 && ("" === h10 || i10.height > 0)) {
      for (; d2.length > 250; ) delete l2[d2.shift()];
      l2[u2] || d2.push(u2), l2[u2] = i10;
    }
    return i10;
  }
  getBBoxCacheKey(t11) {
    if (ej(this.textStr)) {
      let e10 = "" + this.textStr;
      return -1 === e10.indexOf("<") && (e10 = e10.replace(/\d/g, "0")), [e10, ...t11].join(",");
    }
  }
  getRotatedBox(t11, e10) {
    let {
      x: i10,
      y: s10,
      width: o10,
      height: r10
    } = t11, {
      alignValue: a10,
      translateY: n10,
      rotationOriginX: h10 = 0,
      rotationOriginY: l2 = 0
    } = this, d2 = eZ(a10), c2 = Number(this.element.getAttribute("y") || 0) - (n10 ? 0 : s10), p2 = e10 * eD, g2 = (e10 - 90) * eD, u2 = Math.cos(p2), f2 = Math.sin(p2), m2 = o10 * u2, x2 = o10 * f2, y2 = Math.cos(g2), b2 = Math.sin(g2), [[v2, k2], [M2, w2]] = [h10, l2].map((t12) => [t12 - t12 * u2, t12 * f2]), S2 = i10 + d2 * (o10 - m2) + v2 + w2 + c2 * y2, T2 = S2 + m2, C2 = T2 - r10 * y2, A2 = C2 - m2, P2 = s10 + c2 - d2 * x2 - k2 + M2 + c2 * b2, L2 = P2 + x2, O2 = L2 - r10 * b2, E2 = O2 - x2, I2 = Math.min(S2, T2, C2, A2), D2 = Math.min(P2, L2, O2, E2), B2 = Math.max(S2, T2, C2, A2) - I2, N2 = Math.max(P2, L2, O2, E2) - D2;
    return {
      x: I2,
      y: D2,
      width: B2,
      height: N2,
      polygon: [[S2, P2], [T2, L2], [C2, O2], [A2, E2]]
    };
  }
  getStyle(t11) {
    return eR.getComputedStyle(this.element || this, "").getPropertyValue(t11);
  }
  hasClass(t11) {
    return -1 !== ("" + this.attr("class")).split(" ").indexOf(t11);
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
  constructor(t11, e10) {
    this.onEvents = {}, this.opacity = 1, this.SVG_NS = ez, this.element = "span" === e10 || "body" === e10 ? eG(e10) : eB.createElementNS(this.SVG_NS, e10), this.renderer = t11, this.styles = {}, eV(this, "afterInit");
  }
  on(t11, e10) {
    let {
      onEvents: i10
    } = this;
    return i10[t11] && i10[t11](), i10[t11] = eX(this.element, t11, e10), this;
  }
  opacitySetter(t11, e10, i10) {
    let s10 = Number(Number(t11).toFixed(3));
    this.opacity = s10, i10.setAttribute(e10, s10);
  }
  reAlign() {
    this.alignOptions?.width && "left" !== this.alignOptions.align && (this.alignOptions.width = this.getBBox().width, this.placed = false, this.align());
  }
  removeClass(t11) {
    return this.attr("class", ("" + this.attr("class")).replace(eQ(t11) ? RegExp(`(^| )${t11}( |$)`) : t11, " ").replace(/ +/g, " ").trim());
  }
  removeTextOutline() {
    let t11 = this.element.querySelector("tspan.highcharts-text-outline");
    t11 && this.safeRemoveChild(t11);
  }
  safeRemoveChild(t11) {
    let e10 = t11.parentNode;
    e10 && e10.removeChild(t11);
  }
  setRadialReference(t11) {
    let e10 = this.element.gradient && this.renderer.gradients[this.element.gradient] || void 0;
    return this.element.radialReference = t11, e10?.radAttr && e10.animate(this.renderer.getRadialAttr(t11, e10.radAttr)), this;
  }
  shadow(t11) {
    let {
      renderer: e10
    } = this, i10 = e0(this.parentGroup?.rotation === 90 ? {
      offsetX: -1,
      offsetY: -1
    } : {}, eJ(t11) ? t11 : {}), s10 = e10.shadowDefinition(i10);
    return this.attr({
      filter: t11 ? `url(${e10.url}#${s10})` : "none"
    });
  }
  show(t11 = true) {
    return this.attr({
      visibility: t11 ? "inherit" : "visible"
    });
  }
  "stroke-widthSetter"(t11, e10, i10) {
    this[e10] = t11, i10.setAttribute(e10, t11);
  }
  strokeWidth() {
    if (!this.renderer.styledMode) return this["stroke-width"] || 0;
    let t11 = this.getStyle("stroke-width"), e10 = 0, i10;
    return /px$/.test(t11) ? e10 = e3(t11) : "" !== t11 && (eF(i10 = eB.createElementNS(ez, "rect"), {
      width: t11,
      "stroke-width": 0
    }), this.element.parentNode.appendChild(i10), e10 = i10.getBBox().width, i10.parentNode.removeChild(i10)), e10;
  }
  symbolAttr(t11) {
    let e10 = this;
    _e8.symbolCustomAttribs.forEach(function(i10) {
      e10[i10] = e2(t11[i10], e10[i10]);
    }), e10.attr({
      d: e10.renderer.symbols[e10.symbolName](e10.x, e10.y, e10.width, e10.height, e10)
    });
  }
  textSetter(t11) {
    t11 !== this.textStr && (delete this.textPxLength, this.textStr = t11, this.added && this.renderer.buildText(this), this.reAlign());
  }
  titleSetter(t11) {
    let e10 = this.element, i10 = e10.getElementsByTagName("title")[0] || eB.createElementNS(this.SVG_NS, "title");
    e10.insertBefore ? e10.insertBefore(i10, e10.firstChild) : e10.appendChild(i10), i10.textContent = e6(e2(t11, ""), [/<[^>]*>/g, ""]).replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  }
  toFront() {
    let t11 = this.element;
    return t11.parentNode.appendChild(t11), this;
  }
  translate(t11, e10) {
    return this.attr({
      translateX: t11,
      translateY: e10
    });
  }
  updateTransform(t11 = "transform") {
    let {
      element: e10,
      foreignObject: i10,
      matrix: s10,
      padding: o10,
      rotation: r10 = 0,
      rotationOriginX: a10,
      rotationOriginY: n10,
      scaleX: h10,
      scaleY: l2,
      text: d2,
      translateX: c2 = 0,
      translateY: p2 = 0
    } = this, g2 = [`translate(${c2},${p2})`];
    ej(s10) && g2.push("matrix(" + s10.join(",") + ")"), r10 && (g2.push("rotate(" + r10 + " " + (a10 ?? e10.getAttribute("x") ?? this.x ?? 0) + " " + (n10 ?? e10.getAttribute("y") ?? this.y ?? 0) + ")"), d2?.element.tagName !== "SPAN" || d2?.foreignObject || d2.attr({
      rotation: r10,
      rotationOriginX: (a10 || 0) - o10,
      rotationOriginY: (n10 || 0) - o10
    })), (ej(h10) || ej(l2)) && g2.push(`scale(${h10 ?? 1} ${l2 ?? 1})`), g2.length && !(d2 || this).textPath && (i10?.element || e10).setAttribute(t11, g2.join(" "));
  }
  visibilitySetter(t11, e10, i10) {
    "inherit" === t11 ? i10.removeAttribute(e10) : this[e10] !== t11 && i10.setAttribute(e10, t11), this[e10] = t11;
  }
  xGetter(t11) {
    return "circle" === this.element.nodeName && ("x" === t11 ? t11 = "cx" : "y" === t11 && (t11 = "cy")), this._defaultGetter(t11);
  }
  zIndexSetter(t11, e10) {
    let i10 = this.renderer, s10 = this.parentGroup, o10 = (s10 || i10).element || i10.box, r10 = this.element, a10 = o10 === i10.box, n10, h10, l2, d2 = false, c2, p2 = this.added, g2;
    if (ej(t11) ? (r10.setAttribute("data-z-index", t11), t11 *= 1, this[e10] === t11 && (p2 = false)) : ej(this[e10]) && r10.removeAttribute("data-z-index"), this[e10] = t11, p2) {
      for ((t11 = this.zIndex) && s10 && (s10.handleZ = true), g2 = (n10 = o10.childNodes).length - 1; g2 >= 0 && !d2; g2--) c2 = !ej(l2 = (h10 = n10[g2]).getAttribute("data-z-index")), h10 !== r10 && (t11 < 0 && c2 && !a10 && !g2 ? (o10.insertBefore(r10, n10[g2]), d2 = true) : (e3(l2) <= t11 || c2 && (!ej(t11) || t11 >= 0)) && (o10.insertBefore(r10, n10[g2 + 1]), d2 = true));
      d2 || (o10.insertBefore(r10, n10[3 * !!a10]), d2 = true);
    }
    return d2;
  }
};
e8.symbolCustomAttribs = ["anchorX", "anchorY", "clockwise", "end", "height", "innerR", "r", "start", "width", "x", "y"], e8.prototype.strokeSetter = e8.prototype.fillSetter, e8.prototype.yGetter = e8.prototype.xGetter, e8.prototype.matrixSetter = e8.prototype.rotationOriginXSetter = e8.prototype.rotationOriginYSetter = e8.prototype.rotationSetter = e8.prototype.scaleXSetter = e8.prototype.scaleYSetter = e8.prototype.translateXSetter = e8.prototype.translateYSetter = e8.prototype.verticalAlignSetter = function(t11, e10) {
  this[e10] = t11, this.doTransform = true;
};
var e7 = e8;
var {
  defined: it,
  extend: ie,
  getAlignFactor: ii,
  isNumber: is,
  merge: io,
  pick: ir,
  removeEvent: ia
} = ta;
var ih = class _ih extends e7 {
  constructor(t11, e10, i10, s10, o10, r10, a10, n10, h10, l2) {
    let d2;
    super(t11, "g"), this.paddingLeftSetter = this.paddingSetter, this.paddingRightSetter = this.paddingSetter, this.doUpdate = false, this.textStr = e10, this.x = i10, this.y = s10, this.anchorX = r10, this.anchorY = a10, this.baseline = h10, this.className = l2, this.addClass("button" === l2 ? "highcharts-no-tooltip" : "highcharts-label"), l2 && this.addClass("highcharts-" + l2), this.text = t11.text(void 0, 0, 0, n10).attr({
      zIndex: 1
    }), "string" == typeof o10 && ((d2 = /^url\((.*?)\)$/.test(o10)) || this.renderer.symbols[o10]) && (this.symbolKey = o10), this.bBox = _ih.emptyBBox, this.padding = 3, this.baselineOffset = 0, this.needsBox = t11.styledMode || d2, this.deferredAttr = {}, this.alignFactor = 0;
  }
  alignSetter(t11) {
    let e10 = ii(t11);
    this.textAlign = t11, e10 !== this.alignFactor && (this.alignFactor = e10, this.bBox && is(this.xSetting) && this.attr({
      x: this.xSetting
    }), this.updateTextPadding());
  }
  anchorXSetter(t11, e10) {
    this.anchorX = t11, this.boxAttr(e10, Math.round(t11) - this.getCrispAdjust() - this.xSetting);
  }
  anchorYSetter(t11, e10) {
    this.anchorY = t11, this.boxAttr(e10, t11 - this.ySetting);
  }
  boxAttr(t11, e10) {
    this.box ? this.box.attr(t11, e10) : this.deferredAttr[t11] = e10;
  }
  css(t11) {
    if (t11) {
      let e10 = {};
      t11 = io(t11), _ih.textProps.forEach((i10) => {
        void 0 !== t11[i10] && (e10[i10] = t11[i10], delete t11[i10]);
      }), this.text.css(e10), "fontSize" in e10 || "fontWeight" in e10 || "width" in e10 ? this.updateTextPadding() : "textOverflow" in e10 && this.updateBoxSize();
    }
    return e7.prototype.css.call(this, t11);
  }
  destroy() {
    ia(this.element, "mouseenter"), ia(this.element, "mouseleave"), this.text && this.text.destroy(), this.box && (this.box = this.box.destroy()), e7.prototype.destroy.call(this);
  }
  fillSetter(t11, e10) {
    t11 && (this.needsBox = true), this.fill = t11, this.boxAttr(e10, t11);
  }
  getBBox(t11, e10) {
    (this.textStr && 0 === this.bBox.width && 0 === this.bBox.height || this.rotation) && this.updateBoxSize();
    let {
      padding: i10,
      height: s10 = 0,
      translateX: o10 = 0,
      translateY: r10 = 0,
      width: a10 = 0
    } = this, n10 = ir(this.paddingLeft, i10), h10 = e10 ?? (this.rotation || 0), l2 = {
      width: a10,
      height: s10,
      x: o10 + this.bBox.x - n10,
      y: r10 + this.bBox.y - i10 + this.baselineOffset
    };
    return h10 && (l2 = this.getRotatedBox(l2, h10)), l2;
  }
  getCrispAdjust() {
    return (this.renderer.styledMode && this.box ? this.box.strokeWidth() : this["stroke-width"] ? parseInt(this["stroke-width"], 10) : 0) % 2 / 2;
  }
  heightSetter(t11) {
    this.heightSetting = t11, this.doUpdate = true;
  }
  afterSetters() {
    super.afterSetters(), this.doUpdate && (this.updateBoxSize(), this.doUpdate = false);
  }
  onAdd() {
    this.text.add(this), this.attr({
      text: ir(this.textStr, ""),
      x: this.x || 0,
      y: this.y || 0
    }), this.box && it(this.anchorX) && this.attr({
      anchorX: this.anchorX,
      anchorY: this.anchorY
    });
  }
  paddingSetter(t11, e10) {
    is(t11) ? t11 !== this[e10] && (this[e10] = t11, this.updateTextPadding()) : this[e10] = void 0;
  }
  rSetter(t11, e10) {
    this.boxAttr(e10, t11);
  }
  strokeSetter(t11, e10) {
    this.stroke = t11, this.boxAttr(e10, t11);
  }
  "stroke-widthSetter"(t11, e10) {
    t11 && (this.needsBox = true), this["stroke-width"] = t11, this.boxAttr(e10, t11);
  }
  "text-alignSetter"(t11) {
    this.textAlign = this["text-align"] = t11, this.updateTextPadding();
  }
  textSetter(t11) {
    void 0 !== t11 && this.text.attr({
      text: t11
    }), this.updateTextPadding(), this.reAlign();
  }
  updateBoxSize() {
    let t11, e10 = this.text, i10 = {}, s10 = this.padding, o10 = this.bBox = (!is(this.widthSetting) || !is(this.heightSetting) || this.textAlign) && it(e10.textStr) ? e10.getBBox(void 0, 0) : _ih.emptyBBox;
    this.width = this.getPaddedWidth(), this.height = (this.heightSetting || o10.height || 0) + 2 * s10;
    let r10 = this.renderer.fontMetrics(e10);
    if (this.baselineOffset = s10 + Math.min((this.text.firstLineMetrics || r10).b, o10.height || 1 / 0), this.heightSetting && (this.baselineOffset += (this.heightSetting - r10.h) / 2), this.needsBox && !e10.textPath) {
      if (!this.box) {
        let t12 = this.box = this.symbolKey ? this.renderer.symbol(this.symbolKey) : this.renderer.rect();
        t12.addClass(("button" === this.className ? "" : "highcharts-label-box") + (this.className ? " highcharts-" + this.className + "-box" : "")), t12.add(this);
      }
      i10.x = t11 = this.getCrispAdjust(), i10.y = (this.baseline ? -this.baselineOffset : 0) + t11, i10.width = Math.round(this.width), i10.height = Math.round(this.height), this.box.attr(ie(i10, this.deferredAttr)), this.deferredAttr = {};
    }
  }
  updateTextPadding() {
    let t11 = this.text, e10 = t11.styles.textAlign || this.textAlign;
    if (!t11.textPath) {
      this.updateBoxSize();
      let i10 = this.baseline ? 0 : this.baselineOffset, s10 = (this.paddingLeft ?? this.padding) + ii(e10) * (this.widthSetting ?? this.bBox.width);
      (s10 !== t11.x || i10 !== t11.y) && (t11.attr({
        align: e10,
        x: s10
      }), void 0 !== i10 && t11.attr("y", i10)), t11.x = s10, t11.y = i10;
    }
  }
  widthSetter(t11) {
    this.widthSetting = is(t11) ? t11 : void 0, this.doUpdate = true;
  }
  getPaddedWidth() {
    let t11 = this.padding, e10 = ir(this.paddingLeft, t11), i10 = ir(this.paddingRight, t11);
    return (this.widthSetting || this.bBox.width || 0) + e10 + i10;
  }
  xSetter(t11) {
    this.x = t11, this.alignFactor && (t11 -= this.alignFactor * this.getPaddedWidth(), this["forceAnimate:x"] = true), this.anchorX && (this["forceAnimate:anchorX"] = true), this.xSetting = Math.round(t11), this.attr("translateX", this.xSetting);
  }
  ySetter(t11) {
    this.anchorY && (this["forceAnimate:anchorY"] = true), this.ySetting = this.y = Math.round(t11), this.attr("translateY", this.ySetting);
  }
};
ih.emptyBBox = {
  width: 0,
  height: 0,
  x: 0,
  y: 0
}, ih.textProps = ["color", "direction", "fontFamily", "fontSize", "fontStyle", "fontWeight", "lineClamp", "lineHeight", "textAlign", "textDecoration", "textOutline", "textOverflow", "whiteSpace", "width"];
var {
  defined: il,
  isNumber: id,
  pick: ic
} = ta;
function ip(t11, e10, i10, s10, o10) {
  let r10 = [];
  if (o10) {
    let a10 = o10.start || 0, n10 = o10.end || 0, h10 = ic(o10.r, i10), l2 = ic(o10.r, s10 || i10), d2 = 2e-4 / (o10.borderRadius ? 1 : Math.max(h10, 1)), c2 = Math.abs(n10 - a10 - 2 * Math.PI) < d2;
    c2 && (a10 = Math.PI / 2, n10 = 2.5 * Math.PI - d2);
    let p2 = o10.innerR, g2 = ic(o10.open, c2), u2 = Math.cos(a10), f2 = Math.sin(a10), m2 = Math.cos(n10), x2 = Math.sin(n10), y2 = ic(o10.longArc, n10 - a10 - Math.PI < d2 ? 0 : 1), b2 = ["A", h10, l2, 0, y2, ic(o10.clockwise, 1), t11 + h10 * m2, e10 + l2 * x2];
    b2.params = {
      start: a10,
      end: n10,
      cx: t11,
      cy: e10
    }, r10.push(["M", t11 + h10 * u2, e10 + l2 * f2], b2), il(p2) && ((b2 = ["A", p2, p2, 0, y2, il(o10.clockwise) ? 1 - o10.clockwise : 0, t11 + p2 * u2, e10 + p2 * f2]).params = {
      start: n10,
      end: a10,
      cx: t11,
      cy: e10
    }, r10.push(g2 ? ["M", t11 + p2 * m2, e10 + p2 * x2] : ["L", t11 + p2 * m2, e10 + p2 * x2], b2)), g2 || r10.push(["Z"]);
  }
  return r10;
}
function ig(t11, e10, i10, s10, o10) {
  return o10?.r ? iu(t11, e10, i10, s10, o10) : [["M", t11, e10], ["L", t11 + i10, e10], ["L", t11 + i10, e10 + s10], ["L", t11, e10 + s10], ["Z"]];
}
function iu(t11, e10, i10, s10, o10) {
  let r10 = o10?.r || 0;
  return [["M", t11 + r10, e10], ["L", t11 + i10 - r10, e10], ["A", r10, r10, 0, 0, 1, t11 + i10, e10 + r10], ["L", t11 + i10, e10 + s10 - r10], ["A", r10, r10, 0, 0, 1, t11 + i10 - r10, e10 + s10], ["L", t11 + r10, e10 + s10], ["A", r10, r10, 0, 0, 1, t11, e10 + s10 - r10], ["L", t11, e10 + r10], ["A", r10, r10, 0, 0, 1, t11 + r10, e10], ["Z"]];
}
var im = {
  arc: ip,
  callout: function(t11, e10, i10, s10, o10) {
    let r10 = Math.min(o10?.r || 0, i10, s10), a10 = r10 + 6, n10 = o10?.anchorX, h10 = o10?.anchorY || 0, l2 = iu(t11, e10, i10, s10, {
      r: r10
    });
    if (!id(n10) || n10 < i10 && n10 > 0 && h10 < s10 && h10 > 0) return l2;
    if (t11 + n10 > i10 - a10) {
      if (h10 > e10 + a10 && h10 < e10 + s10 - a10) l2.splice(3, 1, ["L", t11 + i10, h10 - 6], ["L", t11 + i10 + 6, h10], ["L", t11 + i10, h10 + 6], ["L", t11 + i10, e10 + s10 - r10]);
      else if (n10 < i10) {
        let o11 = h10 < e10 + a10, d2 = o11 ? e10 : e10 + s10;
        l2.splice(o11 ? 2 : 5, 0, ["L", n10, h10], ["L", t11 + i10 - r10, d2]);
      } else l2.splice(3, 1, ["L", t11 + i10, s10 / 2], ["L", n10, h10], ["L", t11 + i10, s10 / 2], ["L", t11 + i10, e10 + s10 - r10]);
    } else if (t11 + n10 < a10) {
      if (h10 > e10 + a10 && h10 < e10 + s10 - a10) l2.splice(7, 1, ["L", t11, h10 + 6], ["L", t11 - 6, h10], ["L", t11, h10 - 6], ["L", t11, e10 + r10]);
      else if (n10 > 0) {
        let i11 = h10 < e10 + a10, o11 = i11 ? e10 : e10 + s10;
        l2.splice(i11 ? 1 : 6, 0, ["L", n10, h10], ["L", t11 + r10, o11]);
      } else l2.splice(7, 1, ["L", t11, s10 / 2], ["L", n10, h10], ["L", t11, s10 / 2], ["L", t11, e10 + r10]);
    } else h10 > s10 && n10 < i10 - a10 ? l2.splice(5, 1, ["L", n10 + 6, e10 + s10], ["L", n10, e10 + s10 + 6], ["L", n10 - 6, e10 + s10], ["L", t11 + r10, e10 + s10]) : h10 < 0 && n10 > a10 && l2.splice(1, 1, ["L", n10 - 6, e10], ["L", n10, e10 - 6], ["L", n10 + 6, e10], ["L", i10 - r10, e10]);
    return l2;
  },
  circle: function(t11, e10, i10, s10) {
    return ip(t11 + i10 / 2, e10 + s10 / 2, i10 / 2, s10 / 2, {
      start: 0.5 * Math.PI,
      end: 2.5 * Math.PI,
      open: false
    });
  },
  diamond: function(t11, e10, i10, s10) {
    return [["M", t11 + i10 / 2, e10], ["L", t11 + i10, e10 + s10 / 2], ["L", t11 + i10 / 2, e10 + s10], ["L", t11, e10 + s10 / 2], ["Z"]];
  },
  rect: ig,
  roundedRect: iu,
  square: ig,
  triangle: function(t11, e10, i10, s10) {
    return [["M", t11 + i10 / 2, e10], ["L", t11 + i10, e10 + s10], ["L", t11, e10 + s10], ["Z"]];
  },
  "triangle-down": function(t11, e10, i10, s10) {
    return [["M", t11, e10], ["L", t11 + i10, e10], ["L", t11 + i10 / 2, e10 + s10], ["Z"]];
  }
};
var {
  doc: ix,
  SVG_NS: iy,
  win: ib
} = N;
var {
  attr: iv,
  extend: ik,
  fireEvent: iM,
  isString: iw,
  objectEach: iS,
  pick: iT
} = ta;
var iC = (t11, e10) => t11.substring(0, e10) + "…";
var iA = class {
  constructor(t11) {
    let e10 = t11.styles;
    this.renderer = t11.renderer, this.svgElement = t11, this.width = t11.textWidth, this.textLineHeight = e10?.lineHeight, this.textOutline = e10?.textOutline, this.ellipsis = e10?.textOverflow === "ellipsis", this.lineClamp = e10?.lineClamp, this.noWrap = e10?.whiteSpace === "nowrap";
  }
  buildSVG() {
    let t11 = this.svgElement, e10 = t11.element, i10 = t11.renderer, s10 = iT(t11.textStr, "").toString(), o10 = -1 !== s10.indexOf("<"), r10 = e10.childNodes, a10 = !t11.added && i10.box, n10 = [s10, this.ellipsis, this.noWrap, this.textLineHeight, this.textOutline, t11.getStyle("font-size"), t11.styles.lineClamp, this.width].join(",");
    if (n10 !== t11.textCache) {
      t11.textCache = n10, delete t11.actualWidth;
      for (let t12 = r10.length; t12--; ) e10.removeChild(r10[t12]);
      if (o10 || this.ellipsis || this.width || t11.textPath || -1 !== s10.indexOf(" ") && (!this.noWrap || /<br.*?>/g.test(s10))) {
        if ("" !== s10) {
          a10 && a10.appendChild(e10);
          let i11 = new en(s10);
          this.modifyTree(i11.nodes), i11.addToDOM(e10), this.modifyDOM(), this.ellipsis && -1 !== (e10.textContent || "").indexOf("…") && t11.attr("title", this.unescapeEntities(t11.textStr || "", ["&lt;", "&gt;"])), a10 && a10.removeChild(e10);
        }
      } else e10.appendChild(ix.createTextNode(this.unescapeEntities(s10)));
      iw(this.textOutline) && t11.applyTextOutline && t11.applyTextOutline(this.textOutline);
    }
  }
  modifyDOM() {
    let t11, e10 = this.svgElement, i10 = iv(e10.element, "x");
    for (e10.firstLineMetrics = void 0; t11 = e10.element.firstChild; ) if (/^[\s\u200B]*$/.test(t11.textContent || " ")) e10.element.removeChild(t11);
    else break;
    [].forEach.call(e10.element.querySelectorAll("tspan.highcharts-br"), (t12, s11) => {
      t12.nextSibling && t12.previousSibling && (0 === s11 && 1 === t12.previousSibling.nodeType && (e10.firstLineMetrics = e10.renderer.fontMetrics(t12.previousSibling)), iv(t12, {
        dy: this.getLineHeight(t12.nextSibling),
        x: i10
      }));
    });
    let s10 = this.width || 0;
    if (!s10) return;
    let o10 = (t12, o11) => {
      let r11 = t12.textContent || "", a10 = r11.replace(/([^\^])-/g, "$1- ").split(" "), n10 = !this.noWrap && (a10.length > 1 || e10.element.childNodes.length > 1), h10 = this.getLineHeight(o11), l2 = Math.max(0, s10 - 0.8 * h10), d2 = 0, c2 = e10.actualWidth;
      if (n10) {
        let r12 = [], n11 = [];
        for (; o11.firstChild && o11.firstChild !== t12; ) n11.push(o11.firstChild), o11.removeChild(o11.firstChild);
        for (; a10.length; ) if (a10.length && !this.noWrap && d2 > 0 && (r12.push(t12.textContent || ""), t12.textContent = a10.join(" ").replace(/- /g, "-")), this.truncate(t12, void 0, a10, 0 === d2 && c2 || 0, s10, l2, (t13, e11) => a10.slice(0, e11).join(" ").replace(/- /g, "-")), c2 = e10.actualWidth, d2++, this.lineClamp && d2 >= this.lineClamp) {
          a10.length && (this.truncate(t12, t12.textContent || "", void 0, 0, s10, l2, iC), t12.textContent = t12.textContent?.replace("…", "") + "…");
          break;
        }
        n11.forEach((e11) => {
          o11.insertBefore(e11, t12);
        }), r12.forEach((e11) => {
          o11.insertBefore(ix.createTextNode(e11), t12);
          let s11 = ix.createElementNS(iy, "tspan");
          s11.textContent = "​", iv(s11, {
            dy: h10,
            x: i10
          }), o11.insertBefore(s11, t12);
        });
      } else this.ellipsis && r11 && this.truncate(t12, r11, void 0, 0, s10, l2, iC);
    }, r10 = (t12) => {
      [].slice.call(t12.childNodes).forEach((i11) => {
        i11.nodeType === ib.Node.TEXT_NODE ? o10(i11, t12) : (-1 !== i11.className.baseVal.indexOf("highcharts-br") && (e10.actualWidth = 0), r10(i11));
      });
    };
    r10(e10.element);
  }
  getLineHeight(t11) {
    let e10 = t11.nodeType === ib.Node.TEXT_NODE ? t11.parentElement : t11;
    return this.textLineHeight ? parseInt(this.textLineHeight.toString(), 10) : this.renderer.fontMetrics(e10 || this.svgElement.element).h;
  }
  modifyTree(t11) {
    let e10 = (i10, s10) => {
      let {
        attributes: o10 = {},
        children: r10,
        style: a10 = {},
        tagName: n10
      } = i10, h10 = this.renderer.styledMode;
      if ("b" === n10 || "strong" === n10 ? h10 ? o10.class = "highcharts-strong" : a10.fontWeight = "bold" : ("i" === n10 || "em" === n10) && (h10 ? o10.class = "highcharts-emphasized" : a10.fontStyle = "italic"), a10?.color && (a10.fill = a10.color), "br" === n10) {
        o10.class = "highcharts-br", i10.textContent = "​";
        let e11 = t11[s10 + 1];
        e11?.textContent && (e11.textContent = e11.textContent.replace(/^ +/gm, ""));
      } else "a" === n10 && r10 && r10.some((t12) => "#text" === t12.tagName) && (i10.children = [{
        children: r10,
        tagName: "tspan"
      }]);
      "#text" !== n10 && "a" !== n10 && (i10.tagName = "tspan"), ik(i10, {
        attributes: o10,
        style: a10
      }), r10 && r10.filter((t12) => "#text" !== t12.tagName).forEach(e10);
    };
    t11.forEach(e10), iM(this.svgElement, "afterModifyTree", {
      nodes: t11
    });
  }
  truncate(t11, e10, i10, s10, o10, r10, a10) {
    let n10, h10, l2 = this.svgElement, {
      rotation: d2
    } = l2, c2 = [], p2 = i10 && !s10 ? 1 : 0, g2 = (e10 || i10 || "").length, u2 = g2;
    i10 || (o10 = r10);
    let f2 = function(e11, o11) {
      let r11 = o11 || e11, a11 = t11.parentNode;
      if (a11 && void 0 === c2[r11] && a11.getSubStringLength) try {
        c2[r11] = s10 + a11.getSubStringLength(0, i10 ? r11 + 1 : r11);
      } catch {
      }
      return c2[r11];
    };
    if (l2.rotation = 0, s10 + (h10 = f2(t11.textContent.length)) > o10) {
      for (; p2 <= g2; ) u2 = Math.ceil((p2 + g2) / 2), i10 && (n10 = a10(i10, u2)), h10 = f2(u2, n10 && n10.length - 1), p2 === g2 ? p2 = g2 + 1 : h10 > o10 ? g2 = u2 - 1 : p2 = u2;
      0 === g2 ? t11.textContent = "" : e10 && g2 === e10.length - 1 || (t11.textContent = n10 || a10(e10 || i10, u2)), this.ellipsis && h10 > o10 && this.truncate(t11, t11.textContent || "", void 0, 0, o10, r10, iC);
    }
    i10 && i10.splice(0, u2), l2.actualWidth = h10, l2.rotation = d2;
  }
  unescapeEntities(t11, e10) {
    return iS(this.renderer.escapes, function(i10, s10) {
      e10 && -1 !== e10.indexOf(i10) || (t11 = t11.toString().replace(RegExp(i10, "g"), s10));
    }), t11;
  }
};
var {
  defaultOptions: iP
} = tI;
var {
  charts: iL,
  deg2rad: iO,
  doc: iE,
  isFirefox: iI,
  isMS: iD,
  isWebKit: iB,
  noop: iN,
  SVG_NS: iz,
  symbolSizes: iR,
  win: iW
} = N;
var {
  addEvent: iX,
  attr: iF,
  createElement: iG,
  crisp: iH,
  css: iY,
  defined: ij,
  destroyObjectProperties: iU,
  extend: i$,
  isArray: iV,
  isNumber: iZ,
  isObject: iq,
  isString: i_,
  merge: iK,
  pick: iJ,
  pInt: iQ,
  replaceNested: i0,
  uniqueKey: i1
} = ta;
var i2 = class {
  constructor(t11, e10, i10, s10, o10, r10, a10) {
    let n10, h10;
    this.x = 0, this.y = 0;
    let l2 = this.createElement("svg").attr({
      version: "1.1",
      class: "highcharts-root"
    }), d2 = l2.element;
    a10 || l2.css(this.getStyle(s10 || {})), t11.appendChild(d2), iF(t11, "dir", "ltr"), -1 === t11.innerHTML.indexOf("xmlns") && iF(d2, "xmlns", this.SVG_NS), this.box = d2, this.boxWrapper = l2, this.alignedObjects = [], this.url = this.getReferenceURL(), this.createElement("desc").add().element.appendChild(iE.createTextNode("Created with Highcharts 12.5.0")), this.defs = this.createElement("defs").add(), this.allowHTML = r10, this.forExport = o10, this.styledMode = a10, this.gradients = {}, this.cache = {}, this.cacheKeys = [], this.imgCount = 0, this.rootFontSize = l2.getStyle("font-size"), this.setSize(e10, i10, false), iI && t11.getBoundingClientRect && ((n10 = function() {
      iY(t11, {
        left: 0,
        top: 0
      }), h10 = t11.getBoundingClientRect(), iY(t11, {
        left: Math.ceil(h10.left) - h10.left + "px",
        top: Math.ceil(h10.top) - h10.top + "px"
      });
    })(), this.unSubPixelFix = iX(iW, "resize", n10));
  }
  definition(t11) {
    return new en([t11]).addToDOM(this.defs.element);
  }
  getReferenceURL() {
    if ((iI || iB) && iE.getElementsByTagName("base").length) {
      if (!ij(e)) {
        let t11 = i1(), i10 = new en([{
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
                id: t11
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
              "clip-path": `url(#${t11})`,
              fill: "rgba(0,0,0,0.001)"
            }
          }]
        }]).addToDOM(iE.body);
        iY(i10, {
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9e5
        });
        let s10 = iE.elementFromPoint(6, 6);
        e = s10?.id === "hitme", iE.body.removeChild(i10);
      }
      if (e) return i0(iW.location.href.split("#")[0], [/<[^>]*>/g, ""], [/([\('\)])/g, "\\$1"], [/ /g, "%20"]);
    }
    return "";
  }
  getStyle(t11) {
    return this.style = i$({
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
      fontSize: "1rem"
    }, t11), this.style;
  }
  setStyle(t11) {
    this.boxWrapper.css(this.getStyle(t11));
  }
  isHidden() {
    return !this.boxWrapper.getBBox().width;
  }
  destroy() {
    let t11 = this.defs;
    return this.box = null, this.boxWrapper = this.boxWrapper.destroy(), iU(this.gradients || {}), this.gradients = null, this.defs = t11.destroy(), this.unSubPixelFix && this.unSubPixelFix(), this.alignedObjects = null, null;
  }
  createElement(t11) {
    return new this.Element(this, t11);
  }
  getRadialAttr(t11, e10) {
    return {
      cx: t11[0] - t11[2] / 2 + (e10.cx || 0) * t11[2],
      cy: t11[1] - t11[2] / 2 + (e10.cy || 0) * t11[2],
      r: (e10.r || 0) * t11[2]
    };
  }
  shadowDefinition(t11) {
    let e10 = [`highcharts-drop-shadow-${this.chartIndex}`, ...Object.keys(t11).map((e11) => `${e11}-${t11[e11]}`)].join("-").toLowerCase().replace(/[^a-z\d\-]/g, ""), i10 = iK({
      color: "#000000",
      offsetX: 1,
      offsetY: 1,
      opacity: 0.15,
      width: 5
    }, t11);
    return this.defs.element.querySelector(`#${e10}`) || this.definition({
      tagName: "filter",
      attributes: {
        id: e10,
        filterUnits: i10.filterUnits
      },
      children: this.getShadowFilterContent(i10)
    }), e10;
  }
  getShadowFilterContent(t11) {
    return [{
      tagName: "feDropShadow",
      attributes: {
        dx: t11.offsetX,
        dy: t11.offsetY,
        "flood-color": t11.color,
        "flood-opacity": Math.min(5 * t11.opacity, 1),
        stdDeviation: t11.width / 2
      }
    }];
  }
  buildText(t11) {
    new iA(t11).buildSVG();
  }
  getContrast(t11) {
    if ("transparent" === t11) return "#000000";
    let e10 = tG.parse(t11).rgba, i10 = " clamp(0,calc(9e9*(0.5 - (0.2126*r + 0.7152*g + 0.0722*b))),1)";
    if (iZ(e10[0]) || !tG.useColorMix) {
      let t12 = e10.map((t13) => {
        let e11 = t13 / 255;
        return e11 <= 0.04 ? e11 / 12.92 : Math.pow((e11 + 0.055) / 1.055, 2.4);
      }), i11 = 0.2126 * t12[0] + 0.7152 * t12[1] + 0.0722 * t12[2];
      return 1.05 / (i11 + 0.05) > (i11 + 0.05) / 0.05 ? "#FFFFFF" : "#000000";
    }
    return "color(from " + t11 + " srgb" + i10 + i10 + i10 + ")";
  }
  button(t11, e10, i10, s10, o10 = {}, r10, a10, n10, h10, l2) {
    let d2 = this.label(t11, e10, i10, h10, void 0, void 0, l2, void 0, "button"), c2 = this.styledMode, p2 = arguments, g2 = 0;
    o10 = iK(iP.global.buttonTheme, o10), c2 && (delete o10.fill, delete o10.stroke, delete o10["stroke-width"]);
    let u2 = o10.states || {}, f2 = o10.style || {};
    delete o10.states, delete o10.style;
    let m2 = [en.filterUserAttributes(o10)], x2 = [f2];
    return c2 || ["hover", "select", "disabled"].forEach((t12, e11) => {
      m2.push(iK(m2[0], en.filterUserAttributes(p2[e11 + 5] || u2[t12] || {}))), x2.push(m2[e11 + 1].style), delete m2[e11 + 1].style;
    }), iX(d2.element, iD ? "mouseover" : "mouseenter", function() {
      3 !== g2 && d2.setState(1);
    }), iX(d2.element, iD ? "mouseout" : "mouseleave", function() {
      3 !== g2 && d2.setState(g2);
    }), d2.setState = (t12 = 0) => {
      if (1 !== t12 && (d2.state = g2 = t12), d2.removeClass(/highcharts-button-(normal|hover|pressed|disabled)/).addClass("highcharts-button-" + ["normal", "hover", "pressed", "disabled"][t12]), !c2) {
        d2.attr(m2[t12]);
        let e11 = x2[t12];
        iq(e11) && d2.css(e11);
      }
    }, d2.attr(m2[0]), !c2 && (d2.css(i$({
      cursor: "default"
    }, f2)), l2 && d2.text.css({
      pointerEvents: "none"
    })), d2.on("touchstart", (t12) => t12.stopPropagation()).on("click", function(t12) {
      3 !== g2 && s10?.call(d2, t12);
    });
  }
  crispLine(t11, e10) {
    let [i10, s10] = t11;
    return ij(i10[1]) && i10[1] === s10[1] && (i10[1] = s10[1] = iH(i10[1], e10)), ij(i10[2]) && i10[2] === s10[2] && (i10[2] = s10[2] = iH(i10[2], e10)), t11;
  }
  path(t11) {
    let e10 = this.styledMode ? {} : {
      fill: "none"
    };
    return iV(t11) ? e10.d = t11 : iq(t11) && i$(e10, t11), this.createElement("path").attr(e10);
  }
  circle(t11, e10, i10) {
    let s10 = iq(t11) ? t11 : void 0 === t11 ? {} : {
      x: t11,
      y: e10,
      r: i10
    }, o10 = this.createElement("circle");
    return o10.xSetter = o10.ySetter = function(t12, e11, i11) {
      i11.setAttribute("c" + e11, t12);
    }, o10.attr(s10);
  }
  arc(t11, e10, i10, s10, o10, r10) {
    let a10;
    iq(t11) ? (e10 = (a10 = t11).y, i10 = a10.r, s10 = a10.innerR, o10 = a10.start, r10 = a10.end, t11 = a10.x) : a10 = {
      innerR: s10,
      start: o10,
      end: r10
    };
    let n10 = this.symbol("arc", t11, e10, i10, i10, a10);
    return n10.r = i10, n10;
  }
  rect(t11, e10, i10, s10, o10, r10) {
    let a10 = iq(t11) ? t11 : void 0 === t11 ? {} : {
      x: t11,
      y: e10,
      r: o10,
      width: Math.max(i10 || 0, 0),
      height: Math.max(s10 || 0, 0)
    }, n10 = this.createElement("rect");
    return this.styledMode || (void 0 !== r10 && (a10["stroke-width"] = r10, i$(a10, n10.crisp(a10))), a10.fill = "none"), n10.rSetter = function(t12, e11, i11) {
      n10.r = t12, iF(i11, {
        rx: t12,
        ry: t12
      });
    }, n10.rGetter = function() {
      return n10.r || 0;
    }, n10.attr(a10);
  }
  roundedRect(t11) {
    return this.symbol("roundedRect").attr(t11);
  }
  setSize(t11, e10, i10) {
    this.width = t11, this.height = e10, this.boxWrapper.animate({
      width: t11,
      height: e10
    }, {
      step: function() {
        this.attr({
          viewBox: "0 0 " + this.attr("width") + " " + this.attr("height")
        });
      },
      duration: iJ(i10, true) ? void 0 : 0
    }), this.alignElements();
  }
  g(t11) {
    let e10 = this.createElement("g");
    return t11 ? e10.attr({
      class: "highcharts-" + t11
    }) : e10;
  }
  image(t11, e10, i10, s10, o10, r10) {
    let a10 = {
      preserveAspectRatio: "none"
    };
    iZ(e10) && (a10.x = e10), iZ(i10) && (a10.y = i10), iZ(s10) && (a10.width = s10), iZ(o10) && (a10.height = o10);
    let n10 = this.createElement("image").attr(a10), h10 = function(e11) {
      n10.attr({
        href: t11
      }), r10.call(n10, e11);
    };
    if (r10) {
      n10.attr({
        href: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
      });
      let e11 = new iW.Image();
      iX(e11, "load", h10), e11.src = t11, e11.complete && h10({});
    } else n10.attr({
      href: t11
    });
    return n10;
  }
  symbol(t11, e10, i10, s10, o10, r10) {
    let a10, n10, h10, l2, d2 = this, c2 = /^url\((.*?)\)$/, p2 = c2.test(t11), g2 = !p2 && (this.symbols[t11] ? t11 : "circle"), u2 = g2 && this.symbols[g2];
    if (u2) "number" == typeof e10 && (n10 = u2.call(this.symbols, e10 || 0, i10 || 0, s10 || 0, o10 || 0, r10)), a10 = this.path(n10), d2.styledMode || a10.attr("fill", "none"), i$(a10, {
      symbolName: g2 || void 0,
      x: e10,
      y: i10,
      width: s10,
      height: o10
    }), r10 && i$(a10, r10);
    else if (p2) {
      h10 = t11.match(c2)[1];
      let s11 = a10 = this.image(h10);
      s11.imgwidth = iJ(r10?.width, iR[h10]?.width), s11.imgheight = iJ(r10?.height, iR[h10]?.height), l2 = (t12) => t12.attr({
        width: t12.width,
        height: t12.height
      }), ["width", "height"].forEach((t12) => {
        s11[`${t12}Setter`] = function(t13, e11) {
          this[e11] = t13;
          let {
            alignByTranslate: i11,
            element: s12,
            width: o11,
            height: a11,
            imgwidth: n11,
            imgheight: h11
          } = this, l3 = "width" === e11 ? n11 : h11, d3 = 1;
          r10 && "within" === r10.backgroundSize && o11 && a11 && n11 && h11 ? (d3 = Math.min(o11 / n11, a11 / h11), iF(s12, {
            width: Math.round(n11 * d3),
            height: Math.round(h11 * d3)
          })) : s12 && l3 && s12.setAttribute(e11, l3), !i11 && n11 && h11 && this.translate(((o11 || 0) - n11 * d3) / 2, ((a11 || 0) - h11 * d3) / 2);
        };
      }), ij(e10) && s11.attr({
        x: e10,
        y: i10
      }), s11.isImg = true, s11.symbolUrl = t11, ij(s11.imgwidth) && ij(s11.imgheight) ? l2(s11) : (s11.attr({
        width: 0,
        height: 0
      }), iG("img", {
        onload: function() {
          let t12 = iL[d2.chartIndex];
          0 === this.width && (iY(this, {
            position: "absolute",
            top: "-999em"
          }), iE.body.appendChild(this)), iR[h10] = {
            width: this.width,
            height: this.height
          }, s11.imgwidth = this.width, s11.imgheight = this.height, s11.element && l2(s11), this.parentNode && this.parentNode.removeChild(this), d2.imgCount--, d2.imgCount || !t12 || t12.hasLoaded || t12.onload();
        },
        src: h10
      }), this.imgCount++);
    }
    return a10;
  }
  clipRect(t11, e10, i10, s10) {
    return this.rect(t11, e10, i10, s10, 0);
  }
  text(t11, e10, i10, s10) {
    let o10 = {};
    if (s10 && (this.allowHTML || !this.forExport)) return this.html(t11, e10, i10);
    o10.x = Math.round(e10 || 0), i10 && (o10.y = Math.round(i10)), ij(t11) && (o10.text = t11);
    let r10 = this.createElement("text").attr(o10);
    return s10 && (!this.forExport || this.allowHTML) || (r10.xSetter = function(t12, e11, i11) {
      let s11 = i11.getElementsByTagName("tspan"), o11 = i11.getAttribute(e11);
      for (let i12 = 0, r11; i12 < s11.length; i12++) (r11 = s11[i12]).getAttribute(e11) === o11 && r11.setAttribute(e11, t12);
      i11.setAttribute(e11, t12);
    }), r10;
  }
  fontMetrics(t11) {
    let e10 = iZ(t11) ? t11 : iQ(e7.prototype.getStyle.call(t11, "font-size") || 0), i10 = e10 < 24 ? e10 + 3 : Math.round(1.2 * e10), s10 = Math.round(0.8 * i10);
    return {
      h: i10,
      b: s10,
      f: e10
    };
  }
  rotCorr(t11, e10, i10) {
    let s10 = t11;
    return e10 && i10 && (s10 = Math.max(s10 * Math.cos(e10 * iO), 4)), {
      x: -t11 / 3 * Math.sin(e10 * iO),
      y: s10
    };
  }
  pathToSegments(t11) {
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
    for (let o10 = 0; o10 < t11.length; o10++) i_(i10[0]) && iZ(t11[o10]) && i10.length === s10[i10[0].toUpperCase()] && t11.splice(o10, 0, i10[0].replace("M", "L").replace("m", "l")), "string" == typeof t11[o10] && (i10.length && e10.push(i10.slice(0)), i10.length = 0), i10.push(t11[o10]);
    return e10.push(i10.slice(0)), e10;
  }
  label(t11, e10, i10, s10, o10, r10, a10, n10, h10) {
    return new ih(this, t11, e10, i10, s10, o10, r10, a10, n10, h10);
  }
  alignElements() {
    this.alignedObjects.forEach((t11) => t11.align());
  }
};
i$(i2.prototype, {
  Element: e7,
  SVG_NS: iz,
  escapes: {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  },
  symbols: im,
  draw: iN
}), eS.registerRendererType("svg", i2, true);
var {
  composed: i3,
  isFirefox: i5
} = N;
var {
  attr: i6,
  css: i9,
  createElement: i4,
  defined: i8,
  extend: i7,
  getAlignFactor: st,
  isNumber: se,
  pInt: si,
  pushUnique: ss
} = ta;
function so(t11, e10, i10) {
  let s10 = this.div?.style;
  e7.prototype[`${e10}Setter`].call(this, t11, e10, i10), s10 && (i10.style[e10] = s10[e10] = t11);
}
var sr = (t11, e10) => {
  if (!t11.div) {
    let i10 = i6(t11.element, "class"), s10 = t11.css, o10 = i4("div", i10 ? {
      className: i10
    } : void 0, __spreadProps(__spreadValues({
      position: "absolute",
      left: `${t11.translateX || 0}px`,
      top: `${t11.translateY || 0}px`
    }, t11.styles), {
      display: t11.display,
      opacity: t11.opacity,
      visibility: t11.visibility
    }), t11.parentGroup?.div || e10);
    t11.classSetter = (t12, e11, i11) => {
      i11.setAttribute("class", t12), o10.className = t12;
    }, t11.translateXSetter = t11.translateYSetter = (e11, i11) => {
      t11[i11] = e11, o10.style["translateX" === i11 ? "left" : "top"] = `${e11}px`, t11.doTransform = true;
    }, t11.scaleXSetter = t11.scaleYSetter = (e11, i11) => {
      t11[i11] = e11, t11.doTransform = true;
    }, t11.opacitySetter = t11.visibilitySetter = so, t11.css = (e11) => (s10.call(t11, e11), e11.cursor && (o10.style.cursor = e11.cursor), e11.pointerEvents && (o10.style.pointerEvents = e11.pointerEvents), t11), t11.on = function() {
      return e7.prototype.on.apply({
        element: o10,
        onEvents: t11.onEvents
      }, arguments), t11;
    }, t11.div = o10;
  }
  return t11.div;
};
var sa = class _sa extends e7 {
  static compose(t11) {
    ss(i3, this.compose) && (t11.prototype.html = function(t12, e10, i10) {
      return new _sa(this, "span").attr({
        text: t12,
        x: Math.round(e10),
        y: Math.round(i10)
      });
    });
  }
  constructor(t11, e10) {
    super(t11, e10), _sa.useForeignObject ? this.foreignObject = t11.createElement("foreignObject").attr({
      zIndex: 2
    }) : this.css(__spreadValues({
      position: "absolute"
    }, t11.styledMode ? {} : {
      fontFamily: t11.style.fontFamily,
      fontSize: t11.style.fontSize
    })), this.element.style.whiteSpace = "nowrap";
  }
  getSpanCorrection(t11, e10, i10) {
    this.xCorr = -t11 * i10, this.yCorr = -e10;
  }
  css(t11) {
    let e10, {
      element: i10
    } = this, s10 = "SPAN" === i10.tagName && t11 && "width" in t11, o10 = s10 && t11.width;
    return s10 && (delete t11.width, this.textWidth = si(o10) || void 0, e10 = true), t11?.textOverflow === "ellipsis" && (t11.overflow = "hidden", t11.whiteSpace = "nowrap"), t11?.lineClamp && (t11.display = "-webkit-box", t11.WebkitLineClamp = t11.lineClamp, t11.WebkitBoxOrient = "vertical", t11.overflow = "hidden"), se(Number(t11?.fontSize)) && (t11.fontSize += "px"), i7(this.styles, t11), i9(i10, t11), e10 && this.updateTransform(), this;
  }
  htmlGetBBox() {
    let {
      element: t11
    } = this;
    return {
      x: t11.offsetLeft,
      y: t11.offsetTop,
      width: t11.offsetWidth,
      height: t11.offsetHeight
    };
  }
  updateTransform() {
    if (!this.added) {
      this.alignOnAdd = true;
      return;
    }
    let {
      element: t11,
      foreignObject: e10,
      oldTextWidth: i10,
      renderer: s10,
      rotation: o10,
      rotationOriginX: r10,
      rotationOriginY: a10,
      scaleX: n10,
      scaleY: h10,
      styles: {
        display: l2 = "inline-block",
        whiteSpace: d2
      },
      textAlign: c2 = "left",
      textWidth: p2,
      translateX: g2 = 0,
      translateY: u2 = 0,
      x: f2 = 0,
      y: m2 = 0
    } = this, x2 = () => this.textPxLength ? this.textPxLength : (i9(t11, {
      width: "",
      whiteSpace: d2 || "nowrap"
    }), t11.offsetWidth);
    if (e10 || i9(t11, {
      marginLeft: `${g2}px`,
      marginTop: `${u2}px`
    }), "SPAN" === t11.tagName) {
      let g3, u3 = [o10, c2, t11.innerHTML, p2, this.textAlign].join(","), y2 = -(this.parentGroup?.padding * 1) || 0;
      if (p2 !== i10) {
        let e11 = x2(), r11 = p2 || 0, a11 = !s10.styledMode && "" === t11.style.textOverflow && t11.style.webkitLineClamp;
        (r11 > i10 || e11 > r11 || a11) && (/[\-\s\u00AD]/.test(t11.textContent || t11.innerText) || "ellipsis" === t11.style.textOverflow) && (i9(t11, {
          width: (o10 || n10 || e11 > r11 || a11) && se(p2) ? p2 + "px" : "auto",
          display: l2,
          whiteSpace: d2 || "normal"
        }), this.oldTextWidth = p2);
      }
      e10 && (i9(t11, {
        display: "inline-block",
        verticalAlign: "top"
      }), e10.attr({
        width: s10.width,
        height: s10.height
      })), u3 !== this.cTT && (g3 = s10.fontMetrics(t11).b, i8(o10) && !e10 && (o10 !== (this.oldRotation || 0) || c2 !== this.oldAlign) && i9(t11, {
        transform: `rotate(${o10}deg)`,
        transformOrigin: `${y2}% ${y2}px`
      }), this.getSpanCorrection(!i8(o10) && !this.textWidth && this.textPxLength || t11.offsetWidth, g3, st(c2)));
      let {
        xCorr: b2 = 0,
        yCorr: v2 = 0
      } = this, k2 = {
        left: `${f2 + b2}px`,
        top: `${m2 + v2}px`,
        textAlign: c2,
        transformOrigin: `${(r10 ?? f2) - b2 - f2 - y2}px ${(a10 ?? m2) - v2 - m2 - y2}px`
      };
      (n10 || h10) && (k2.transform = `scale(${n10 ?? 1},${h10 ?? 1})`), e10 ? (super.updateTransform(), se(f2) && se(m2) ? (e10.attr({
        x: f2 + b2,
        y: m2 + v2,
        width: t11.offsetWidth + 3,
        height: t11.offsetHeight,
        "transform-origin": t11.getAttribute("transform-origin") || "0 0"
      }), i9(t11, {
        display: l2,
        textAlign: c2
      })) : i5 && e10.attr({
        width: 0,
        height: 0
      })) : i9(t11, k2), this.cTT = u3, this.oldRotation = o10, this.oldAlign = c2;
    }
  }
  add(t11) {
    let {
      foreignObject: e10,
      renderer: i10
    } = this, s10 = i10.box.parentNode, o10 = [];
    if (e10) e10.add(t11), super.add(i10.createElement("body").attr({
      xmlns: "http://www.w3.org/1999/xhtml"
    }).css({
      background: "transparent",
      margin: "0 3px 0 0"
    }).add(e10));
    else {
      let e11;
      if (this.parentGroup = t11, t11 && !(e11 = t11.div)) {
        let i11 = t11;
        for (; i11; ) o10.push(i11), i11 = i11.parentGroup;
        for (let t12 of o10.reverse()) e11 = sr(t12, s10);
      }
      (e11 || s10).appendChild(this.element);
    }
    return this.added = true, this.alignOnAdd && this.updateTransform(), this;
  }
  textSetter(t11) {
    t11 !== this.textStr && (delete this.bBox, delete this.oldTextWidth, en.setElementHTML(this.element, t11 ?? ""), this.textStr = t11, this.doTransform = true);
  }
  alignSetter(t11) {
    this.alignValue = this.textAlign = t11, this.doTransform = true;
  }
  xSetter(t11, e10) {
    this[e10] = t11, this.doTransform = true;
  }
};
var sn = sa.prototype;
sn.visibilitySetter = sn.opacitySetter = so, sn.ySetter = sn.rotationSetter = sn.rotationOriginXSetter = sn.rotationOriginYSetter = sn.xSetter, (h = b || (b = {})).xAxis = {
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
}, h.yAxis = {
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
        numberFormatter: t11
      } = this.axis.chart;
      return t11(this.total || 0, -1);
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
var sh = b;
var {
  addEvent: sl,
  isFunction: sd,
  objectEach: sc,
  removeEvent: sp
} = ta;
(v || (v = {})).registerEventOptions = function(t11, e10) {
  t11.eventOptions = t11.eventOptions || {}, sc(e10.events, function(e11, i10) {
    t11.eventOptions[i10] !== e11 && (t11.eventOptions[i10] && (sp(t11, i10, t11.eventOptions[i10]), delete t11.eventOptions[i10]), sd(e11) && (t11.eventOptions[i10] = e11, sl(t11, i10, e11, {
      order: 0
    })));
  });
};
var sg = v;
var {
  deg2rad: su
} = N;
var {
  clamp: sf,
  correctFloat: sm,
  defined: sx,
  destroyObjectProperties: sy,
  extend: sb,
  fireEvent: sv,
  getAlignFactor: sk,
  isNumber: sM,
  merge: sw,
  objectEach: sS,
  pick: sT
} = ta;
var sC = class {
  constructor(t11, e10, i10, s10, o10) {
    this.isNew = true, this.isNewLabel = true, this.axis = t11, this.pos = e10, this.type = i10 || "", this.parameters = o10 || {}, this.tickmarkOffset = this.parameters.tickmarkOffset, this.options = this.parameters.options, sv(this, "init"), i10 || s10 || this.addLabel();
  }
  addLabel() {
    let t11 = this, e10 = t11.axis, i10 = e10.options, s10 = e10.chart, o10 = e10.categories, r10 = e10.logarithmic, a10 = e10.names, n10 = t11.pos, h10 = sT(t11.options?.labels, i10.labels), l2 = e10.tickPositions, d2 = n10 === l2[0], c2 = n10 === l2[l2.length - 1], p2 = (!h10.step || 1 === h10.step) && 1 === e10.tickInterval, g2 = l2.info, u2 = t11.label, f2, m2, x2, y2 = this.parameters.category || (o10 ? sT(o10[n10], a10[n10], n10) : n10);
    r10 && sM(y2) && (y2 = sm(r10.lin2log(y2))), e10.dateTime && (g2 ? f2 = (m2 = s10.time.resolveDTLFormat(i10.dateTimeLabelFormats[!i10.grid?.enabled && g2.higherRanks[n10] || g2.unitName])).main : sM(y2) && (f2 = e10.dateTime.getXDateFormat(y2, i10.dateTimeLabelFormats || {}))), t11.isFirst = d2, t11.isLast = c2;
    let b2 = {
      axis: e10,
      chart: s10,
      dateTimeLabelFormat: f2,
      isFirst: d2,
      isLast: c2,
      pos: n10,
      tick: t11,
      tickPositionInfo: g2,
      value: y2
    };
    sv(this, "labelFormat", b2);
    let v2 = (t12) => h10.formatter ? h10.formatter.call(t12, t12) : h10.format ? (t12.text = e10.defaultLabelFormatter.call(t12), ew.format(h10.format, t12, s10)) : e10.defaultLabelFormatter.call(t12), k2 = v2.call(b2, b2), M2 = m2?.list;
    M2 ? t11.shortenLabel = function() {
      for (x2 = 0; x2 < M2.length; x2++) if (sb(b2, {
        dateTimeLabelFormat: M2[x2]
      }), u2.attr({
        text: v2.call(b2, b2)
      }), u2.getBBox().width < e10.getSlotWidth(t11) - 2 * (h10.padding || 0)) return;
      u2.attr({
        text: ""
      });
    } : t11.shortenLabel = void 0, p2 && e10._addedPlotLB && t11.moveLabel(k2, h10), sx(u2) || t11.movedLabel ? u2 && u2.textStr !== k2 && !p2 && (!u2.textWidth || h10.style.width || u2.styles.width || u2.css({
      width: null
    }), u2.attr({
      text: k2
    }), u2.textPxLength = u2.getBBox().width) : (t11.label = u2 = t11.createLabel(k2, h10), t11.rotation = 0);
  }
  createLabel(t11, e10, i10) {
    let s10 = this.axis, {
      renderer: o10,
      styledMode: r10
    } = s10.chart, a10 = e10.style.whiteSpace, n10 = sx(t11) && e10.enabled ? o10.text(t11, i10?.x, i10?.y, e10.useHTML).add(s10.labelGroup) : void 0;
    return n10 && (r10 || n10.css(sw(e10.style)), n10.textPxLength = n10.getBBox().width, !r10 && a10 && n10.css({
      whiteSpace: a10
    })), n10;
  }
  destroy() {
    sy(this, this.axis);
  }
  getPosition(t11, e10, i10, s10) {
    let o10 = this.axis, r10 = o10.chart, a10 = s10 && r10.oldChartHeight || r10.chartHeight, n10 = {
      x: t11 ? sm(o10.translate(e10 + i10, void 0, void 0, s10) + o10.transB) : o10.left + o10.offset + (o10.opposite ? (s10 && r10.oldChartWidth || r10.chartWidth) - o10.right - o10.left : 0),
      y: t11 ? a10 - o10.bottom + o10.offset - (o10.opposite ? o10.height : 0) : sm(a10 - o10.translate(e10 + i10, void 0, void 0, s10) - o10.transB)
    };
    return n10.y = sf(n10.y, -1e9, 1e9), sv(this, "afterGetPosition", {
      pos: n10
    }), n10;
  }
  getLabelPosition(t11, e10, i10, s10, o10, r10, a10, n10) {
    let h10, l2, d2 = this.axis, c2 = d2.transA, p2 = d2.isLinked && d2.linkedParent ? d2.linkedParent.reversed : d2.reversed, g2 = d2.staggerLines, u2 = d2.tickRotCorr || {
      x: 0,
      y: 0
    }, f2 = s10 || d2.reserveSpaceDefault ? 0 : -d2.labelOffset * ("center" === d2.labelAlign ? 0.5 : 1), m2 = o10.distance, x2 = {};
    return h10 = 0 === d2.side ? i10.rotation ? -m2 : -i10.getBBox().height : 2 === d2.side ? u2.y + m2 : Math.cos(i10.rotation * su) * (u2.y - i10.getBBox(false, 0).height / 2), sx(o10.y) && (h10 = 0 === d2.side && d2.horiz ? o10.y + h10 : o10.y), t11 = t11 + sT(o10.x, [0, 1, 0, -1][d2.side] * m2) + f2 + u2.x - (r10 && s10 ? r10 * c2 * (p2 ? -1 : 1) : 0), e10 = e10 + h10 - (r10 && !s10 ? r10 * c2 * (p2 ? 1 : -1) : 0), g2 && (l2 = a10 / (n10 || 1) % g2, d2.opposite && (l2 = g2 - l2 - 1), e10 += l2 * (d2.labelOffset / g2)), x2.x = t11, x2.y = Math.round(e10), sv(this, "afterGetLabelPosition", {
      pos: x2,
      tickmarkOffset: r10,
      index: a10
    }), x2;
  }
  getLabelSize() {
    return this.label ? this.label.getBBox()[this.axis.horiz ? "height" : "width"] : 0;
  }
  getMarkPath(t11, e10, i10, s10, o10 = false, r10) {
    return r10.crispLine([["M", t11, e10], ["L", t11 + (o10 ? 0 : -i10), e10 + (o10 ? i10 : 0)]], s10);
  }
  handleOverflow(t11) {
    let e10 = this.axis, i10 = e10.options.labels, s10 = t11.x, o10 = e10.chart.chartWidth, r10 = e10.chart.spacing, a10 = sT(e10.labelLeft, Math.min(e10.pos, r10[3])), n10 = sT(e10.labelRight, Math.max(e10.isRadial ? 0 : e10.pos + e10.len, o10 - r10[1])), h10 = this.label, l2 = this.rotation, d2 = sk(e10.labelAlign || h10.attr("align")), c2 = h10.getBBox().width, p2 = e10.getSlotWidth(this), g2 = p2, u2 = 1, f2;
    l2 || "justify" !== i10.overflow ? l2 < 0 && s10 - d2 * c2 < a10 ? f2 = Math.round(s10 / Math.cos(l2 * su) - a10) : l2 > 0 && s10 + d2 * c2 > n10 && (f2 = Math.round((o10 - s10) / Math.cos(l2 * su))) : (s10 - d2 * c2 < a10 ? g2 = t11.x + g2 * (1 - d2) - a10 : s10 + (1 - d2) * c2 > n10 && (g2 = n10 - t11.x + g2 * d2, u2 = -1), (g2 = Math.min(p2, g2)) < p2 && "center" === e10.labelAlign && (t11.x += u2 * (p2 - g2 - d2 * (p2 - Math.min(c2, g2)))), (c2 > g2 || e10.autoRotation && h10?.styles?.width) && (f2 = g2)), f2 && h10 && (this.shortenLabel ? this.shortenLabel() : h10.css(sb({}, {
      width: Math.floor(f2) + "px",
      lineClamp: +!e10.isRadial
    })));
  }
  moveLabel(t11, e10) {
    let i10 = this, s10 = i10.label, o10 = i10.axis, r10 = false, a10;
    s10 && s10.textStr === t11 ? (i10.movedLabel = s10, r10 = true, delete i10.label) : sS(o10.ticks, function(e11) {
      r10 || e11.isNew || e11 === i10 || !e11.label || e11.label.textStr !== t11 || (i10.movedLabel = e11.label, r10 = true, e11.labelPos = i10.movedLabel.xy, delete e11.label);
    }), !r10 && (i10.labelPos || s10) && (a10 = i10.labelPos || s10.xy, i10.movedLabel = i10.createLabel(t11, e10, a10), i10.movedLabel && i10.movedLabel.attr({
      opacity: 0
    }));
  }
  render(t11, e10, i10) {
    let s10 = this.axis, o10 = s10.horiz, r10 = this.pos, a10 = sT(this.tickmarkOffset, s10.tickmarkOffset), n10 = this.getPosition(o10, r10, a10, e10), h10 = n10.x, l2 = n10.y, d2 = s10.pos, c2 = d2 + s10.len, p2 = o10 ? h10 : l2, g2 = sT(i10, this.label?.newOpacity, 1);
    !s10.chart.polar && (sm(p2) < d2 || p2 > c2) && (i10 = 0), i10 ?? (i10 = 1), this.isActive = true, this.renderGridLine(e10, i10), this.renderMark(n10, i10), this.renderLabel(n10, e10, g2, t11), this.isNew = false, sv(this, "afterRender");
  }
  renderGridLine(t11, e10) {
    let i10 = this.axis, s10 = i10.options, o10 = {}, r10 = this.pos, a10 = this.type, n10 = sT(this.tickmarkOffset, i10.tickmarkOffset), h10 = i10.chart.renderer, l2 = this.gridLine, d2, c2 = s10.gridLineWidth, p2 = s10.gridLineColor, g2 = s10.gridLineDashStyle;
    "minor" === this.type && (c2 = s10.minorGridLineWidth, p2 = s10.minorGridLineColor, g2 = s10.minorGridLineDashStyle), l2 || (i10.chart.styledMode || (o10.stroke = p2, o10["stroke-width"] = c2 || 0, o10.dashstyle = g2), a10 || (o10.zIndex = 1), t11 && (e10 = 0), this.gridLine = l2 = h10.path().attr(o10).addClass("highcharts-" + (a10 ? a10 + "-" : "") + "grid-line").add(i10.gridGroup)), l2 && (d2 = i10.getPlotLinePath({
      value: r10 + n10,
      lineWidth: l2.strokeWidth(),
      force: "pass",
      old: t11,
      acrossPanes: false
    })) && l2[t11 || this.isNew ? "attr" : "animate"]({
      d: d2,
      opacity: e10
    });
  }
  renderMark(t11, e10) {
    let i10 = this.axis, s10 = i10.options, o10 = i10.chart.renderer, r10 = this.type, a10 = i10.tickSize(r10 ? r10 + "Tick" : "tick"), n10 = t11.x, h10 = t11.y, l2 = sT(s10["minor" !== r10 ? "tickWidth" : "minorTickWidth"], !r10 && i10.isXAxis ? 1 : 0), d2 = s10["minor" !== r10 ? "tickColor" : "minorTickColor"], c2 = this.mark, p2 = !c2;
    a10 && (i10.opposite && (a10[0] = -a10[0]), !c2 && (this.mark = c2 = o10.path().addClass("highcharts-" + (r10 ? r10 + "-" : "") + "tick").add(i10.axisGroup), i10.chart.styledMode || c2.attr({
      stroke: d2,
      "stroke-width": l2
    })), c2[p2 ? "attr" : "animate"]({
      d: this.getMarkPath(n10, h10, a10[0], c2.strokeWidth(), i10.horiz, o10),
      opacity: e10
    }));
  }
  renderLabel(t11, e10, i10, s10) {
    let o10 = this.axis, r10 = o10.horiz, a10 = o10.options, n10 = this.label, h10 = a10.labels, l2 = h10.step, d2 = sT(this.tickmarkOffset, o10.tickmarkOffset), c2 = t11.x, p2 = t11.y, g2 = true;
    n10 && sM(c2) && (n10.xy = t11 = this.getLabelPosition(c2, p2, n10, r10, h10, d2, s10, l2), (!this.isFirst || this.isLast || a10.showFirstLabel) && (!this.isLast || this.isFirst || a10.showLastLabel) ? !r10 || h10.step || h10.rotation || e10 || 0 === i10 || this.handleOverflow(t11) : g2 = false, l2 && s10 % l2 && (g2 = false), g2 && sM(t11.y) ? (t11.opacity = i10, n10[this.isNewLabel ? "attr" : "animate"](t11).show(true), this.isNewLabel = false) : (n10.hide(), this.isNewLabel = true));
  }
  replaceMovedLabel() {
    let t11 = this.label, e10 = this.axis;
    t11 && !this.isNew && (t11.animate({
      opacity: 0
    }, void 0, t11.destroy), delete this.label), e10.isDirty = true, this.label = this.movedLabel, delete this.movedLabel;
  }
};
var {
  animObject: sA
} = t3;
var {
  xAxis: sP,
  yAxis: sL
} = sh;
var {
  defaultOptions: sO
} = tI;
var {
  registerEventOptions: sE
} = sg;
var {
  deg2rad: sI
} = N;
var {
  arrayMax: sD,
  arrayMin: sB,
  clamp: sN,
  correctFloat: sz,
  defined: sR,
  destroyObjectProperties: sW,
  erase: sX,
  error: sF,
  extend: sG,
  fireEvent: sH,
  getClosestDistance: sY,
  insertItem: sj,
  isArray: sU,
  isNumber: s$,
  isString: sV,
  merge: sZ,
  normalizeTickInterval: sq,
  objectEach: s_,
  pick: sK,
  relativeLength: sJ,
  removeEvent: sQ,
  splat: s0,
  syncTimeout: s1
} = ta;
var s2 = (t11, e10) => sq(e10, void 0, void 0, sK(t11.options.allowDecimals, e10 < 0.5 || void 0 !== t11.tickAmount), !!t11.tickAmount);
sG(sO, {
  xAxis: sP,
  yAxis: sZ(sP, sL)
});
var s3 = class _s3 {
  constructor(t11, e10, i10) {
    this.init(t11, e10, i10);
  }
  init(t11, e10, i10 = this.coll) {
    let s10 = "xAxis" === i10, o10 = this.isZAxis || (t11.inverted ? !s10 : s10);
    this.chart = t11, this.horiz = o10, this.isXAxis = s10, this.coll = i10, sH(this, "init", {
      userOptions: e10
    }), this.opposite = sK(e10.opposite, this.opposite), this.side = sK(e10.side, this.side, o10 ? 2 * !this.opposite : this.opposite ? 1 : 3), this.setOptions(e10);
    let r10 = this.options, a10 = r10.labels;
    this.type ?? (this.type = r10.type || "linear"), this.uniqueNames ?? (this.uniqueNames = r10.uniqueNames ?? true), sH(this, "afterSetType"), this.userOptions = e10, this.minPixelPadding = 0, this.reversed = sK(r10.reversed, this.reversed), this.visible = r10.visible, this.zoomEnabled = r10.zoomEnabled, this.hasNames = "category" === this.type || true === r10.categories, this.categories = sU(r10.categories) && r10.categories || (this.hasNames ? [] : void 0), this.names || (this.names = [], this.names.keys = {}), this.plotLinesAndBandsGroups = {}, this.positiveValuesOnly = !!this.logarithmic, this.isLinked = sR(r10.linkedTo), this.ticks = {}, this.labelEdge = [], this.minorTicks = {}, this.plotLinesAndBands = [], this.alternateBands = {}, this.len ?? (this.len = 0), this.minRange = this.userMinRange = r10.minRange || r10.maxZoom, this.range = r10.range, this.offset = r10.offset || 0, this.max = void 0, this.min = void 0;
    let n10 = sK(r10.crosshair, s0(t11.options.tooltip.crosshairs)[+!s10]);
    this.crosshair = true === n10 ? {} : n10, -1 === t11.axes.indexOf(this) && (s10 ? t11.axes.splice(t11.xAxis.length, 0, this) : t11.axes.push(this), sj(this, t11[this.coll])), t11.orderItems(this.coll), this.series = this.series || [], t11.inverted && !this.isZAxis && s10 && !sR(this.reversed) && (this.reversed = true), this.labelRotation = s$(a10.rotation) ? a10.rotation : void 0, sE(this, r10), sH(this, "afterInit");
  }
  setOptions(t11) {
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
    this.options = sZ(e10, "yAxis" === this.coll ? {
      title: {
        text: this.chart.options.lang.yAxisTitle
      }
    } : {}, sO[this.coll], t11), sH(this, "afterSetOptions", {
      userOptions: t11
    });
  }
  defaultLabelFormatter() {
    let t11 = this.axis, {
      numberFormatter: e10
    } = this.chart, i10 = s$(this.value) ? this.value : NaN, s10 = t11.chart.time, o10 = t11.categories, r10 = this.dateTimeLabelFormat, a10 = sO.lang, n10 = a10.numericSymbols, h10 = a10.numericSymbolMagnitude || 1e3, l2 = t11.logarithmic ? Math.abs(i10) : t11.tickInterval, d2 = n10?.length, c2, p2;
    if (o10) p2 = `${this.value}`;
    else if (r10) p2 = s10.dateFormat(r10, i10, true);
    else if (d2 && n10 && l2 >= 1e3) for (; d2-- && void 0 === p2; ) l2 >= (c2 = Math.pow(h10, d2 + 1)) && 10 * i10 % c2 == 0 && null !== n10[d2] && 0 !== i10 && (p2 = e10(i10 / c2, -1) + n10[d2]);
    return void 0 === p2 && (p2 = Math.abs(i10) >= 1e4 ? e10(i10, -1) : e10(i10, -1, void 0, "")), p2;
  }
  getSeriesExtremes() {
    let t11, e10 = this;
    sH(this, "getSeriesExtremes", null, function() {
      e10.hasVisibleSeries = false, e10.dataMin = e10.dataMax = e10.threshold = void 0, e10.softThreshold = !e10.isXAxis, e10.series.forEach((i10) => {
        if (i10.reserveSpace()) {
          let s10 = i10.options, o10, r10 = s10.threshold, a10, n10;
          if (e10.hasVisibleSeries = true, e10.positiveValuesOnly && 0 >= (r10 || 0) && (r10 = void 0), e10.isXAxis) (o10 = i10.getColumn("x")).length && (o10 = e10.logarithmic ? o10.filter((t12) => t12 > 0) : o10, a10 = (t11 = i10.getXExtremes(o10)).min, n10 = t11.max, s$(a10) || a10 instanceof Date || (o10 = o10.filter(s$), a10 = (t11 = i10.getXExtremes(o10)).min, n10 = t11.max), o10.length && (e10.dataMin = Math.min(sK(e10.dataMin, a10), a10), e10.dataMax = Math.max(sK(e10.dataMax, n10), n10)));
          else {
            let t12 = i10.applyExtremes();
            s$(t12.dataMin) && (a10 = t12.dataMin, e10.dataMin = Math.min(sK(e10.dataMin, a10), a10)), s$(t12.dataMax) && (n10 = t12.dataMax, e10.dataMax = Math.max(sK(e10.dataMax, n10), n10)), sR(r10) && (e10.threshold = r10), (!s10.softThreshold || e10.positiveValuesOnly) && (e10.softThreshold = false);
          }
        }
      });
    }), sH(this, "afterGetSeriesExtremes");
  }
  translate(t11, e10, i10, s10, o10, r10) {
    let a10 = this.linkedParent || this, n10 = s10 && a10.old ? a10.old.min : a10.min;
    if (!s$(n10)) return NaN;
    let h10 = a10.minPixelPadding, l2 = (a10.isOrdinal || a10.brokenAxis?.hasBreaks || a10.logarithmic && o10) && !!a10.lin2val, d2 = 1, c2 = 0, p2 = s10 && a10.old ? a10.old.transA : a10.transA, g2 = 0;
    return p2 || (p2 = a10.transA), i10 && (d2 *= -1, c2 = a10.len), a10.reversed && (d2 *= -1, c2 -= d2 * (a10.sector || a10.len)), e10 ? (g2 = (t11 = t11 * d2 + c2 - h10) / p2 + n10, l2 && (g2 = a10.lin2val(g2))) : (l2 && (t11 = a10.val2lin(t11)), g2 = d2 * (t11 - n10) * p2 + c2 + d2 * h10 + (s$(r10) ? p2 * r10 : 0), a10.isRadial || (g2 = sz(g2))), g2;
  }
  toPixels(t11, e10) {
    return this.translate(this.chart?.time.parse(t11) ?? NaN, false, !this.horiz, void 0, true) + (e10 ? 0 : this.pos);
  }
  toValue(t11, e10) {
    return this.translate(t11 - (e10 ? 0 : this.pos), true, !this.horiz, void 0, true);
  }
  getPlotLinePath(t11) {
    let e10 = this, i10 = e10.chart, s10 = e10.left, o10 = e10.top, r10 = t11.old, a10 = t11.value, n10 = t11.lineWidth, h10 = r10 && i10.oldChartHeight || i10.chartHeight, l2 = r10 && i10.oldChartWidth || i10.chartWidth, d2 = e10.transB, c2 = t11.translatedValue, p2 = t11.force, g2, u2, f2, m2, x2;
    function y2(t12, e11, i11) {
      return "pass" !== p2 && (t12 < e11 || t12 > i11) && (p2 ? t12 = sN(t12, e11, i11) : x2 = true), t12;
    }
    let b2 = {
      value: a10,
      lineWidth: n10,
      old: r10,
      force: p2,
      acrossPanes: t11.acrossPanes,
      translatedValue: c2
    };
    return sH(this, "getPlotLinePath", b2, function(t12) {
      g2 = f2 = (c2 = sN(c2 = sK(c2, e10.translate(a10, void 0, void 0, r10)), -1e9, 1e9)) + d2, u2 = m2 = h10 - c2 - d2, s$(c2) ? e10.horiz ? (u2 = o10, m2 = h10 - e10.bottom + (e10.options.isInternal ? 0 : i10.scrollablePixelsY || 0), g2 = f2 = y2(g2, s10, s10 + e10.width)) : (g2 = s10, f2 = l2 - e10.right + (i10.scrollablePixelsX || 0), u2 = m2 = y2(u2, o10, o10 + e10.height)) : (x2 = true, p2 = false), t12.path = x2 && !p2 ? void 0 : i10.renderer.crispLine([["M", g2, u2], ["L", f2, m2]], n10 || 1);
    }), b2.path;
  }
  getLinearTickPositions(t11, e10, i10) {
    let s10, o10, r10, a10 = sz(Math.floor(e10 / t11) * t11), n10 = sz(Math.ceil(i10 / t11) * t11), h10 = [];
    if (sz(a10 + t11) === a10 && (r10 = 20), this.single) return [e10];
    for (s10 = a10; s10 <= n10 && (h10.push(s10), (s10 = sz(s10 + t11, r10)) !== o10); ) o10 = s10;
    return h10;
  }
  getMinorTickInterval() {
    let {
      minorTicks: t11,
      minorTickInterval: e10
    } = this.options;
    return true === t11 ? sK(e10, "auto") : false !== t11 ? e10 : void 0;
  }
  getMinorTickPositions() {
    let t11 = this.options, e10 = this.tickPositions, i10 = this.minorTickInterval, s10 = this.pointRangePadding || 0, o10 = (this.min || 0) - s10, r10 = (this.max || 0) + s10, a10 = this.brokenAxis?.hasBreaks ? this.brokenAxis.unitLength : r10 - o10, n10 = [], h10;
    if (a10 && a10 / i10 < this.len / 3) {
      let s11 = this.logarithmic;
      if (s11) this.paddedTicks.forEach(function(t12, e11, o11) {
        e11 && n10.push.apply(n10, s11.getLogTickPositions(i10, o11[e11 - 1], o11[e11], true));
      });
      else if (this.dateTime && "auto" === this.getMinorTickInterval()) n10 = n10.concat(this.getTimeTicks(this.dateTime.normalizeTimeTickInterval(i10), o10, r10, t11.startOfWeek));
      else for (h10 = o10 + (e10[0] - o10) % i10; h10 <= r10 && h10 !== n10[0]; h10 += i10) n10.push(h10);
    }
    return 0 !== n10.length && this.trimTicks(n10), n10;
  }
  adjustForMinRange() {
    let t11 = this.options, e10 = this.logarithmic, i10 = this.chart.time, {
      max: s10,
      min: o10,
      minRange: r10
    } = this, a10, n10, h10, l2;
    this.isXAxis && void 0 === r10 && !e10 && (r10 = sR(t11.min) || sR(t11.max) || sR(t11.floor) || sR(t11.ceiling) ? null : Math.min(5 * (sY(this.series.map((t12) => {
      let e11 = t12.getColumn("x");
      return t12.xIncrement ? e11.slice(0, 2) : e11;
    })) || 0), this.dataMax - this.dataMin)), s$(s10) && s$(o10) && s$(r10) && s10 - o10 < r10 && (n10 = this.dataMax - this.dataMin >= r10, a10 = (r10 - s10 + o10) / 2, h10 = [o10 - a10, i10.parse(t11.min) ?? o10 - a10], n10 && (h10[2] = e10 ? e10.log2lin(this.dataMin) : this.dataMin), l2 = [(o10 = sD(h10)) + r10, i10.parse(t11.max) ?? o10 + r10], n10 && (l2[2] = e10 ? e10.log2lin(this.dataMax) : this.dataMax), (s10 = sB(l2)) - o10 < r10 && (h10[0] = s10 - r10, h10[1] = i10.parse(t11.min) ?? s10 - r10, o10 = sD(h10))), this.minRange = r10, this.min = o10, this.max = s10;
  }
  getClosest() {
    let t11, e10;
    if (this.categories) e10 = 1;
    else {
      let i10 = [];
      this.series.forEach(function(t12) {
        let s10 = t12.closestPointRange, o10 = t12.getColumn("x");
        1 === o10.length ? i10.push(o10[0]) : t12.sorted && sR(s10) && t12.reserveSpace() && (e10 = sR(e10) ? Math.min(e10, s10) : s10);
      }), i10.length && (i10.sort((t12, e11) => t12 - e11), t11 = sY([i10]));
    }
    return t11 && e10 ? Math.min(t11, e10) : t11 || e10;
  }
  nameToX(t11) {
    let e10 = sU(this.options.categories), i10 = e10 ? this.categories : this.names, s10 = t11.options.x, o10;
    return t11.series.requireSorting = false, sR(s10) || (s10 = this.uniqueNames && i10 ? e10 ? i10.indexOf(t11.name) : sK(i10.keys[t11.name], -1) : t11.series.autoIncrement()), -1 === s10 ? !e10 && i10 && (o10 = i10.length) : s$(s10) && (o10 = s10), void 0 !== o10 ? (this.names[o10] = t11.name, this.names.keys[t11.name] = o10) : t11.x && (o10 = t11.x), o10;
  }
  updateNames() {
    let t11 = this, e10 = this.names;
    e10.length > 0 && (Object.keys(e10.keys).forEach(function(t12) {
      delete e10.keys[t12];
    }), e10.length = 0, this.minRange = this.userMinRange, (this.series || []).forEach((e11) => {
      e11.xIncrement = null, (!e11.points || e11.isDirtyData) && (t11.max = Math.max(t11.max || 0, e11.dataTable.rowCount - 1), e11.processData(), e11.generatePoints());
      let i10 = e11.getColumn("x").slice();
      e11.data.forEach((e12, s10) => {
        let o10 = i10[s10];
        e12?.options && void 0 !== e12.name && void 0 !== (o10 = t11.nameToX(e12)) && o10 !== e12.x && (i10[s10] = e12.x = o10);
      }), e11.dataTable.setColumn("x", i10);
    }));
  }
  setAxisTranslation() {
    let t11 = this, e10 = t11.max - t11.min, i10 = t11.linkedParent, s10 = !!t11.categories, o10 = t11.isXAxis, r10 = t11.axisPointRange || 0, a10, n10 = 0, h10 = 0, l2, d2 = t11.transA;
    (o10 || s10 || r10) && (a10 = t11.getClosest(), i10 ? (n10 = i10.minPointOffset, h10 = i10.pointRangePadding) : t11.series.forEach(function(e11) {
      let i11 = s10 ? 1 : o10 ? sK(e11.options.pointRange, a10, 0) : t11.axisPointRange || 0, l3 = e11.options.pointPlacement;
      if (r10 = Math.max(r10, i11), !t11.single || s10) {
        let t12 = e11.is("xrange") ? !o10 : o10;
        n10 = Math.max(n10, t12 && sV(l3) ? 0 : i11 / 2), h10 = Math.max(h10, t12 && "on" === l3 ? 0 : i11);
      }
    }), l2 = t11.ordinal?.slope && a10 ? t11.ordinal.slope / a10 : 1, t11.minPointOffset = n10 *= l2, t11.pointRangePadding = h10 *= l2, t11.pointRange = Math.min(r10, t11.single && s10 ? 1 : e10), o10 && (t11.closestPointRange = a10)), t11.translationSlope = t11.transA = d2 = t11.staticScale || t11.len / (e10 + h10 || 1), t11.transB = t11.horiz ? t11.left : t11.bottom, t11.minPixelPadding = d2 * n10, sH(this, "afterSetAxisTranslation");
  }
  minFromRange() {
    let {
      max: t11,
      min: e10
    } = this;
    return s$(t11) && s$(e10) && t11 - e10 || void 0;
  }
  setTickInterval(t11) {
    let {
      categories: e10,
      chart: i10,
      dataMax: s10,
      dataMin: o10,
      dateTime: r10,
      isXAxis: a10,
      logarithmic: n10,
      options: h10,
      softThreshold: l2
    } = this, d2 = i10.time, c2 = s$(this.threshold) ? this.threshold : void 0, p2 = this.minRange || 0, {
      ceiling: g2,
      floor: u2,
      linkedTo: f2,
      softMax: m2,
      softMin: x2
    } = h10, y2 = s$(f2) && i10[this.coll]?.[f2], b2 = h10.tickPixelInterval, v2 = h10.maxPadding, k2 = h10.minPadding, M2 = 0, w2, S2 = s$(h10.tickInterval) && h10.tickInterval >= 0 ? h10.tickInterval : void 0, T2, C2, A2, P2;
    if (r10 || e10 || y2 || this.getTickAmount(), A2 = sK(this.userMin, d2.parse(h10.min)), P2 = sK(this.userMax, d2.parse(h10.max)), y2 ? (this.linkedParent = y2, w2 = y2.getExtremes(), this.min = sK(w2.min, w2.dataMin), this.max = sK(w2.max, w2.dataMax), this.type !== y2.type && sF(11, true, i10)) : (l2 && sR(c2) && s$(s10) && s$(o10) && (o10 >= c2 ? (T2 = c2, k2 = 0) : s10 <= c2 && (C2 = c2, v2 = 0)), this.min = sK(A2, T2, o10), this.max = sK(P2, C2, s10)), s$(this.max) && s$(this.min) && (n10 && (this.positiveValuesOnly && !t11 && 0 >= Math.min(this.min, sK(o10, this.min)) && sF(10, true, i10), this.min = sz(n10.log2lin(this.min), 16), this.max = sz(n10.log2lin(this.max), 16)), this.range && s$(o10) && (this.userMin = this.min = A2 = Math.max(o10, this.minFromRange() || 0), this.userMax = P2 = this.max, this.range = void 0)), sH(this, "foundExtremes"), this.adjustForMinRange(), s$(this.min) && s$(this.max)) {
      if (!s$(this.userMin) && s$(x2) && x2 < this.min && (this.min = A2 = x2), !s$(this.userMax) && s$(m2) && m2 > this.max && (this.max = P2 = m2), e10 || this.axisPointRange || this.stacking?.usePercentage || y2 || (M2 = this.max - this.min) && (!sR(A2) && k2 && (this.min -= M2 * k2), !sR(P2) && v2 && (this.max += M2 * v2)), !s$(this.userMin) && s$(u2) && (this.min = Math.max(this.min, u2)), !s$(this.userMax) && s$(g2) && (this.max = Math.min(this.max, g2)), l2 && s$(o10) && s$(s10)) {
        let t12 = c2 || 0;
        !sR(A2) && this.min < t12 && o10 >= t12 ? this.min = h10.minRange ? Math.min(t12, this.max - p2) : t12 : !sR(P2) && this.max > t12 && s10 <= t12 && (this.max = h10.minRange ? Math.max(t12, this.min + p2) : t12);
      }
      !i10.polar && this.min > this.max && (sR(h10.min) ? this.max = this.min : sR(h10.max) && (this.min = this.max)), M2 = this.max - this.min;
    }
    if (this.min !== this.max && s$(this.min) && s$(this.max) ? y2 && !S2 && b2 === y2.options.tickPixelInterval ? this.tickInterval = S2 = y2.tickInterval : this.tickInterval = sK(S2, this.tickAmount ? M2 / Math.max(this.tickAmount - 1, 1) : void 0, e10 ? 1 : M2 * b2 / Math.max(this.len, b2)) : this.tickInterval = 1, a10 && !t11) {
      let t12 = this.min !== this.old?.min || this.max !== this.old?.max;
      this.series.forEach(function(e11) {
        e11.forceCrop = e11.forceCropping?.(), e11.processData(t12);
      }), sH(this, "postProcessData", {
        hasExtremesChanged: t12
      });
    }
    this.setAxisTranslation(), sH(this, "initialAxisTranslation"), this.pointRange && !S2 && (this.tickInterval = Math.max(this.pointRange, this.tickInterval));
    let L2 = sK(h10.minTickInterval, r10 && !this.series.some((t12) => !t12.sorted) ? this.closestPointRange : 0);
    !S2 && L2 && this.tickInterval < L2 && (this.tickInterval = L2), r10 || n10 || S2 || (this.tickInterval = s2(this, this.tickInterval)), this.tickAmount || (this.tickInterval = this.unsquish()), this.setTickPositions();
  }
  setTickPositions() {
    let t11 = this.options, e10 = t11.tickPositions, i10 = t11.tickPositioner, s10 = this.getMinorTickInterval(), o10 = !this.isPanning, r10 = o10 && t11.startOnTick, a10 = o10 && t11.endOnTick, n10 = [], h10;
    if (this.tickmarkOffset = this.categories && "between" === t11.tickmarkPlacement && 1 === this.tickInterval ? 0.5 : 0, this.single = this.min === this.max && sR(this.min) && !this.tickAmount && (this.min % 1 == 0 || false !== t11.allowDecimals), e10) n10 = e10.slice();
    else if (s$(this.min) && s$(this.max)) {
      if (!this.ordinal?.positions && (this.max - this.min) / this.tickInterval > Math.max(2 * this.len, 200)) n10 = [this.min, this.max], sF(19, false, this.chart);
      else if (this.dateTime) n10 = this.getTimeTicks(this.dateTime.normalizeTimeTickInterval(this.tickInterval, t11.units), this.min, this.max, t11.startOfWeek, this.ordinal?.positions, this.closestPointRange, true);
      else if (this.logarithmic) n10 = this.logarithmic.getLogTickPositions(this.tickInterval, this.min, this.max);
      else {
        let t12 = this.tickInterval, e11 = t12;
        for (; e11 <= 2 * t12; ) if (n10 = this.getLinearTickPositions(this.tickInterval, this.min, this.max), this.tickAmount && n10.length > this.tickAmount) this.tickInterval = s2(this, e11 *= 1.1);
        else break;
      }
      n10.length > this.len && (n10 = [n10[0], n10[n10.length - 1]])[0] === n10[1] && (n10.length = 1), i10 && (this.tickPositions = n10, (h10 = i10.apply(this, [this.min, this.max])) && (n10 = h10));
    }
    this.tickPositions = n10, this.minorTickInterval = "auto" === s10 && this.tickInterval ? this.tickInterval / t11.minorTicksPerMajor : s10, this.paddedTicks = n10.slice(0), this.trimTicks(n10, r10, a10), !this.isLinked && s$(this.min) && s$(this.max) && (this.single && n10.length < 2 && !this.categories && !this.series.some((t12) => t12.is("heatmap") && "between" === t12.options.pointPlacement) && (this.min -= 0.5, this.max += 0.5), e10 || h10 || this.adjustTickAmount()), sH(this, "afterSetTickPositions");
  }
  trimTicks(t11, e10, i10) {
    let s10 = t11[0], o10 = t11[t11.length - 1], r10 = !this.isOrdinal && this.minPointOffset || 0;
    if (sH(this, "trimTicks"), !this.isLinked || !this.grid) {
      if (e10 && s10 !== -1 / 0) this.min = s10;
      else for (; this.min - r10 > t11[0]; ) t11.shift();
      if (i10) this.max = o10;
      else for (; this.max + r10 < t11[t11.length - 1]; ) t11.pop();
      0 === t11.length && sR(s10) && !this.options.tickPositions && t11.push((o10 + s10) / 2);
    }
  }
  alignToOthers() {
    let t11, e10 = this, i10 = e10.chart, s10 = [this], o10 = e10.options, r10 = i10.options.chart, a10 = "yAxis" === this.coll && r10.alignThresholds, n10 = [];
    if (e10.thresholdAlignment = void 0, (false !== r10.alignTicks && o10.alignTicks || a10) && false !== o10.startOnTick && false !== o10.endOnTick && !e10.logarithmic) {
      let o11 = (t12) => {
        let {
          horiz: e11,
          options: i11
        } = t12;
        return [e11 ? i11.left : i11.top, i11.width, i11.height, i11.pane].join(",");
      }, r11 = o11(this);
      i10[this.coll].forEach(function(i11) {
        let {
          series: a11
        } = i11;
        a11.length && a11.some((t12) => t12.visible) && i11 !== e10 && o11(i11) === r11 && (t11 = true, s10.push(i11));
      });
    }
    if (t11 && a10) {
      s10.forEach((t13) => {
        let i11 = t13.getThresholdAlignment(e10);
        s$(i11) && n10.push(i11);
      });
      let t12 = n10.length > 1 ? n10.reduce((t13, e11) => t13 += e11, 0) / n10.length : void 0;
      s10.forEach((e11) => {
        e11.thresholdAlignment = t12;
      });
    }
    return t11;
  }
  getThresholdAlignment(t11) {
    if ((!s$(this.dataMin) || this !== t11 && this.series.some((t12) => t12.isDirty || t12.isDirtyData || t12.xAxis?.isDirty)) && this.getSeriesExtremes(), s$(this.threshold)) {
      let t12 = sN((this.threshold - (this.dataMin || 0)) / ((this.dataMax || 0) - (this.dataMin || 0)), 0, 1);
      return this.options.reversed && (t12 = 1 - t12), t12;
    }
  }
  getTickAmount() {
    let t11 = this.options, e10 = t11.tickPixelInterval, i10 = t11.tickAmount;
    sR(t11.tickInterval) || i10 || !(this.len < e10) || this.isRadial || this.logarithmic || !t11.startOnTick || !t11.endOnTick || (i10 = 2), !i10 && this.alignToOthers() && (i10 = Math.ceil(this.len / e10) + 1), i10 < 4 && (this.finalTickAmt = i10, i10 = 5), this.tickAmount = i10;
  }
  adjustTickAmount() {
    let t11 = this, {
      finalTickAmt: e10,
      max: i10,
      min: s10,
      options: o10,
      tickPositions: r10,
      tickAmount: a10,
      thresholdAlignment: n10
    } = t11, h10 = r10?.length, l2 = sK(t11.threshold, t11.softThreshold ? 0 : null), d2, c2, p2 = t11.tickInterval, g2, u2 = () => r10.push(sz(r10[r10.length - 1] + p2)), f2 = () => r10.unshift(sz(r10[0] - p2));
    if (s$(n10) && (g2 = 0 === n10 ? 0 : 1 === n10 ? a10 - 1 : Math.round(sN(n10 * (a10 - 1), 1, a10 - 2)), o10.reversed && (g2 = a10 - 1 - g2)), t11.hasData() && s$(s10) && s$(i10)) {
      let n11 = () => {
        t11.transA *= (h10 - 1) / (a10 - 1), t11.min = o10.startOnTick ? r10[0] : Math.min(s10, r10[0]), t11.max = o10.endOnTick ? r10[r10.length - 1] : Math.max(i10, r10[r10.length - 1]);
      };
      if (s$(g2) && s$(t11.threshold)) {
        for (; r10[g2] !== l2 || r10.length !== a10 || r10[0] > s10 || r10[r10.length - 1] < i10; ) {
          for (r10.length = 0, r10.push(t11.threshold); r10.length < a10; ) void 0 === r10[g2] || r10[g2] > t11.threshold ? f2() : u2();
          if (p2 > 8 * t11.tickInterval) break;
          p2 *= 2;
        }
        n11();
      } else if (h10 < a10) {
        for (; r10.length < a10; ) r10.length % 2 || s10 === l2 ? u2() : f2();
        n11();
      }
      if (sR(e10)) {
        for (c2 = d2 = r10.length; c2--; ) (3 === e10 && c2 % 2 == 1 || e10 <= 2 && c2 > 0 && c2 < d2 - 1) && r10.splice(c2, 1);
        t11.finalTickAmt = void 0;
      }
    }
  }
  setScale() {
    let {
      coll: t11,
      stacking: e10
    } = this, i10 = false, s10 = false;
    this.series.forEach((t12) => {
      i10 = i10 || t12.isDirtyData || t12.isDirty, s10 = s10 || t12.xAxis?.isDirty || false;
    }), this.setAxisSize();
    let o10 = this.len !== this.old?.len;
    o10 || i10 || s10 || this.isLinked || this.forceRedraw || this.userMin !== this.old?.userMin || this.userMax !== this.old?.userMax || this.alignToOthers() ? (e10 && "yAxis" === t11 && e10.buildStacks(), this.forceRedraw = false, this.userMinRange || (this.minRange = void 0), this.getSeriesExtremes(), this.setTickInterval(), e10 && "xAxis" === t11 && e10.buildStacks(), this.isDirty || (this.isDirty = o10 || this.min !== this.old?.min || this.max !== this.old?.max)) : e10 && e10.cleanStacks(), i10 && delete this.allExtremes, sH(this, "afterSetScale");
  }
  setExtremes(t11, e10, i10 = true, s10, o10) {
    let r10 = this.chart;
    this.series.forEach((t12) => {
      delete t12.kdTree;
    }), t11 = r10.time.parse(t11), e10 = r10.time.parse(e10), sH(this, "setExtremes", o10 = sG(o10, {
      min: t11,
      max: e10
    }), (t12) => {
      this.userMin = t12.min, this.userMax = t12.max, this.eventArgs = t12, i10 && r10.redraw(s10);
    });
  }
  setAxisSize() {
    let t11 = this.chart, e10 = this.options, i10 = e10.offsets || [0, 0, 0, 0], s10 = this.horiz, o10 = this.width = Math.round(sJ(sK(e10.width, t11.plotWidth - i10[3] + i10[1]), t11.plotWidth)), r10 = this.height = Math.round(sJ(sK(e10.height, t11.plotHeight - i10[0] + i10[2]), t11.plotHeight)), a10 = this.top = Math.round(sJ(sK(e10.top, t11.plotTop + i10[0]), t11.plotHeight, t11.plotTop)), n10 = this.left = Math.round(sJ(sK(e10.left, t11.plotLeft + i10[3]), t11.plotWidth, t11.plotLeft));
    this.bottom = t11.chartHeight - r10 - a10, this.right = t11.chartWidth - o10 - n10, this.len = Math.max(s10 ? o10 : r10, 0), this.pos = s10 ? n10 : a10;
  }
  getExtremes() {
    let t11 = this.logarithmic;
    return {
      min: t11 ? sz(t11.lin2log(this.min)) : this.min,
      max: t11 ? sz(t11.lin2log(this.max)) : this.max,
      dataMin: this.dataMin,
      dataMax: this.dataMax,
      userMin: this.userMin,
      userMax: this.userMax
    };
  }
  getThreshold(t11) {
    let e10 = this.logarithmic, i10 = e10 ? e10.lin2log(this.min) : this.min, s10 = e10 ? e10.lin2log(this.max) : this.max;
    return null === t11 || t11 === -1 / 0 ? t11 = i10 : t11 === 1 / 0 ? t11 = s10 : i10 > t11 ? t11 = i10 : s10 < t11 && (t11 = s10), this.translate(t11, 0, 1, 0, 1);
  }
  autoLabelAlign(t11) {
    let e10 = ((t11 - 90 * this.side) % 360 + 360) % 360, i10 = {
      align: "center"
    };
    return sH(this, "autoLabelAlign", i10, function(t12) {
      e10 > 15 && e10 < 165 ? t12.align = "right" : e10 > 195 && e10 < 345 && (t12.align = "left");
    }), i10.align;
  }
  tickSize(t11) {
    let e10 = this.options, i10 = sK(e10["tick" === t11 ? "tickWidth" : "minorTickWidth"], "tick" === t11 && this.isXAxis && !this.categories ? 1 : 0), s10 = e10["tick" === t11 ? "tickLength" : "minorTickLength"], o10;
    i10 && s10 && ("inside" === e10[t11 + "Position"] && (s10 = -s10), o10 = [s10, i10]);
    let r10 = {
      tickSize: o10
    };
    return sH(this, "afterTickSize", r10), r10.tickSize;
  }
  labelMetrics() {
    let t11 = this.chart.renderer, e10 = this.ticks, i10 = e10[Object.keys(e10)[0]] || {};
    return this.chart.renderer.fontMetrics(i10.label || i10.movedLabel || t11.box);
  }
  unsquish() {
    let t11 = this.options.labels, e10 = t11.padding || 0, i10 = this.horiz, s10 = this.tickInterval, o10 = this.len / ((+!!this.categories + this.max - this.min) / s10), r10 = t11.rotation, a10 = sz(0.8 * this.labelMetrics().h), n10 = Math.max(this.max - this.min, 0), h10 = function(t12) {
      let i11 = (t12 + 2 * e10) / (o10 || 1);
      return (i11 = i11 > 1 ? Math.ceil(i11) : 1) * s10 > n10 && t12 !== 1 / 0 && o10 !== 1 / 0 && n10 && (i11 = Math.ceil(n10 / s10)), sz(i11 * s10);
    }, l2 = s10, d2, c2 = Number.MAX_VALUE, p2;
    if (i10) {
      if (!t11.staggerLines && (s$(r10) ? p2 = [r10] : o10 < t11.autoRotationLimit && (p2 = t11.autoRotation)), p2) {
        let t12, e11;
        for (let i11 of p2) (i11 === r10 || i11 && i11 >= -90 && i11 <= 90) && (e11 = (t12 = h10(Math.abs(a10 / Math.sin(sI * i11)))) + Math.abs(i11 / 360)) < c2 && (c2 = e11, d2 = i11, l2 = t12);
      }
    } else l2 = h10(0.75 * a10);
    return this.autoRotation = p2, this.labelRotation = sK(d2, s$(r10) ? r10 : 0), t11.step ? s10 : l2;
  }
  getSlotWidth(t11) {
    let e10 = this.chart, i10 = this.horiz, s10 = this.options.labels, o10 = Math.max(this.tickPositions.length - !this.categories, 1), r10 = e10.margin[3];
    if (t11 && s$(t11.slotWidth)) return t11.slotWidth;
    if (i10 && s10.step < 2 && !this.isRadial) return s10.rotation ? 0 : (this.staggerLines || 1) * this.len / o10;
    if (!i10) {
      let t12 = s10.style.width;
      if (void 0 !== t12) return parseInt(String(t12), 10);
      if (!this.opposite && r10) return r10 - e10.spacing[3];
    }
    return 0.33 * e10.chartWidth;
  }
  renderUnsquish() {
    let t11 = this.chart, e10 = t11.renderer, i10 = this.tickPositions, s10 = this.ticks, o10 = this.options.labels, r10 = o10.style, a10 = this.horiz, n10 = this.getSlotWidth(), h10 = Math.max(1, Math.round(n10 - (a10 ? 2 * (o10.padding || 0) : o10.distance || 0))), l2 = {}, d2 = this.labelMetrics(), c2 = r10.lineClamp, p2, g2 = c2 ?? (Math.floor(this.len / (i10.length * d2.h)) || 1), u2 = 0;
    sV(o10.rotation) || (l2.rotation = o10.rotation || 0), i10.forEach(function(t12) {
      let e11 = s10[t12];
      e11.movedLabel && e11.replaceMovedLabel();
      let i11 = e11.label?.textPxLength || 0;
      i11 > u2 && (u2 = i11);
    }), this.maxLabelLength = u2, this.autoRotation ? u2 > h10 && u2 > d2.h ? l2.rotation = this.labelRotation : this.labelRotation = 0 : n10 && (p2 = h10), l2.rotation && (p2 = u2 > 0.5 * t11.chartHeight ? 0.33 * t11.chartHeight : u2, c2 || (g2 = 1)), this.labelAlign = o10.align || this.autoLabelAlign(this.labelRotation || 0), this.labelAlign && (l2.align = this.labelAlign), i10.forEach(function(t12) {
      let e11 = s10[t12], i11 = e11?.label, o11 = r10.width, a11 = {};
      i11 && (i11.attr(l2), e11.shortenLabel ? e11.shortenLabel() : p2 && !o11 && "nowrap" !== r10.whiteSpace && (p2 < (i11.textPxLength || 0) || "SPAN" === i11.element.tagName) ? i11.css(sG(a11, {
        width: `${p2}px`,
        lineClamp: g2
      })) : !i11.styles.width || a11.width || o11 || i11.css({
        width: "auto"
      }), e11.rotation = l2.rotation);
    }, this), this.tickRotCorr = e10.rotCorr(d2.b, this.labelRotation || 0, 0 !== this.side);
  }
  hasData() {
    return this.series.some(function(t11) {
      return t11.hasData();
    }) || this.options.showEmpty && sR(this.min) && sR(this.max);
  }
  addTitle(t11) {
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
    }).addClass("highcharts-axis-title"), a10 || this.axisTitle.css(sZ(r10.style)), this.axisTitle.add(this.axisGroup), this.axisTitle.isNew = true), a10 || r10.style.width || this.isRadial || this.axisTitle.css({
      width: this.len + "px"
    }), this.axisTitle[t11 ? "show" : "hide"](t11);
  }
  generateTick(t11) {
    let e10 = this.ticks;
    e10[t11] ? e10[t11].addLabel() : e10[t11] = new sC(this, t11);
  }
  createGroups() {
    let {
      axisParent: t11,
      chart: e10,
      coll: i10,
      options: s10
    } = this, o10 = e10.renderer, r10 = (e11, r11, a10) => o10.g(e11).attr({
      zIndex: a10
    }).addClass(`highcharts-${i10.toLowerCase()}${r11} ` + (this.isRadial ? `highcharts-radial-axis${r11} ` : "") + (s10.className || "")).add(t11);
    this.axisGroup || (this.gridGroup = r10("grid", "-grid", s10.gridZIndex), this.axisGroup = r10("axis", "", s10.zIndex), this.labelGroup = r10("axis-labels", "-labels", s10.labels.zIndex));
  }
  getOffset() {
    let t11 = this, {
      chart: e10,
      horiz: i10,
      options: s10,
      side: o10,
      ticks: r10,
      tickPositions: a10,
      coll: n10
    } = t11, h10 = e10.inverted && !t11.isZAxis ? [1, 0, 3, 2][o10] : o10, l2 = t11.hasData(), d2 = s10.title, c2 = s10.labels, p2 = s$(s10.crossing), g2 = e10.axisOffset, u2 = e10.clipOffset, f2 = [-1, 1, 1, -1][o10], m2, x2 = 0, y2, b2 = 0, v2 = 0, k2, M2;
    if (t11.showAxis = m2 = l2 || s10.showEmpty, t11.staggerLines = t11.horiz && c2.staggerLines || void 0, t11.createGroups(), l2 || t11.isLinked ? (a10.forEach(function(e11) {
      t11.generateTick(e11);
    }), t11.renderUnsquish(), t11.reserveSpaceDefault = 0 === o10 || 2 === o10 || {
      1: "left",
      3: "right"
    }[o10] === t11.labelAlign, sK(c2.reserveSpace, !p2 && null, "center" === t11.labelAlign || null, t11.reserveSpaceDefault) && a10.forEach(function(t12) {
      v2 = Math.max(r10[t12].getLabelSize(), v2);
    }), t11.staggerLines && (v2 *= t11.staggerLines), t11.labelOffset = v2 * (t11.opposite ? -1 : 1)) : s_(r10, function(t12, e11) {
      t12.destroy(), delete r10[e11];
    }), d2?.text && false !== d2.enabled && (t11.addTitle(m2), m2 && !p2 && false !== d2.reserveSpace && (t11.titleOffset = x2 = t11.axisTitle.getBBox()[i10 ? "height" : "width"], b2 = sR(y2 = d2.offset) ? 0 : sK(d2.margin, i10 ? 5 : 10))), t11.renderLine(), t11.offset = f2 * sK(s10.offset, g2[o10] ? g2[o10] + (s10.margin || 0) : 0), t11.tickRotCorr = t11.tickRotCorr || {
      x: 0,
      y: 0
    }, M2 = 0 === o10 ? -t11.labelMetrics().h : 2 === o10 ? t11.tickRotCorr.y : 0, k2 = Math.abs(v2) + b2, v2 && (k2 -= M2, k2 += f2 * (i10 ? sK(c2.y, t11.tickRotCorr.y + f2 * c2.distance) : sK(c2.x, f2 * c2.distance))), t11.axisTitleMargin = sK(y2, k2), t11.getMaxLabelDimensions && (t11.maxLabelDimensions = t11.getMaxLabelDimensions(r10, a10)), "colorAxis" !== n10 && u2) {
      let e11 = this.tickSize("tick");
      g2[o10] = Math.max(g2[o10], (t11.axisTitleMargin || 0) + x2 + f2 * t11.offset, k2, a10?.length && e11 ? e11[0] + f2 * t11.offset : 0);
      let i11 = !t11.axisLine || s10.offset ? 0 : t11.axisLine.strokeWidth() / 2;
      u2[h10] = Math.max(u2[h10], i11);
    }
    sH(this, "afterGetOffset");
  }
  getLinePath(t11) {
    let e10 = this.chart, i10 = this.opposite, s10 = this.offset, o10 = this.horiz, r10 = this.left + (i10 ? this.width : 0) + s10, a10 = e10.chartHeight - this.bottom - (i10 ? this.height : 0) + s10;
    return i10 && (t11 *= -1), e10.renderer.crispLine([["M", o10 ? this.left : r10, o10 ? a10 : this.top], ["L", o10 ? e10.chartWidth - this.right : r10, o10 ? a10 : e10.chartHeight - this.bottom]], t11);
  }
  renderLine() {
    !this.axisLine && (this.axisLine = this.chart.renderer.path().addClass("highcharts-axis-line").add(this.axisGroup), this.chart.styledMode || this.axisLine.attr({
      stroke: this.options.lineColor,
      "stroke-width": this.options.lineWidth,
      zIndex: 7
    }));
  }
  getTitlePosition(t11) {
    let e10 = this.horiz, i10 = this.left, s10 = this.top, o10 = this.len, r10 = this.options.title, a10 = e10 ? i10 : s10, n10 = this.opposite, h10 = this.offset, l2 = r10.x, d2 = r10.y, c2 = this.chart.renderer.fontMetrics(t11), p2 = t11 ? Math.max(t11.getBBox(false, 0).height - c2.h - 1, 0) : 0, g2 = {
      low: a10 + (e10 ? 0 : o10),
      middle: a10 + o10 / 2,
      high: a10 + (e10 ? o10 : 0)
    }[r10.align], u2 = (e10 ? s10 + this.height : i10) + (e10 ? 1 : -1) * (n10 ? -1 : 1) * (this.axisTitleMargin || 0) + [-p2, p2, c2.f, -p2][this.side], f2 = {
      x: e10 ? g2 + l2 : u2 + (n10 ? this.width : 0) + h10 + l2,
      y: e10 ? u2 + d2 - (n10 ? this.height : 0) + h10 : g2 + d2
    };
    return sH(this, "afterGetTitlePosition", {
      titlePosition: f2
    }), f2;
  }
  renderMinorTick(t11, e10) {
    let i10 = this.minorTicks;
    i10[t11] || (i10[t11] = new sC(this, t11, "minor")), e10 && i10[t11].isNew && i10[t11].render(null, true), i10[t11].render(null, false, 1);
  }
  renderTick(t11, e10, i10) {
    let s10 = this.isLinked, o10 = this.ticks;
    (!s10 || t11 >= this.min && t11 <= this.max || this.grid?.isColumn) && (o10[t11] || (o10[t11] = new sC(this, t11)), i10 && o10[t11].isNew && o10[t11].render(e10, true, -1), o10[t11].render(e10));
  }
  render() {
    let t11, e10, i10 = this, s10 = i10.chart, o10 = i10.logarithmic, r10 = s10.renderer, a10 = i10.options, n10 = i10.isLinked, h10 = i10.tickPositions, l2 = i10.axisTitle, d2 = i10.ticks, c2 = i10.minorTicks, p2 = i10.alternateBands, g2 = a10.stackLabels, u2 = a10.alternateGridColor, f2 = a10.crossing, m2 = i10.tickmarkOffset, x2 = i10.axisLine, y2 = i10.showAxis, b2 = sA(r10.globalAnimation);
    if (i10.labelEdge.length = 0, i10.overlap = false, [d2, c2, p2].forEach(function(t12) {
      s_(t12, function(t13) {
        t13.isActive = false;
      });
    }), s$(f2)) {
      let t12 = this.isXAxis ? s10.yAxis[0] : s10.xAxis[0], e11 = [1, -1, -1, 1][this.side];
      if (t12) {
        let s11 = t12.toPixels(f2, true);
        i10.horiz && (s11 = t12.len - s11), i10.offset = e11 * s11;
      }
    }
    if (i10.hasData() || n10) {
      let r11 = i10.chart.hasRendered && i10.old && s$(i10.old.min);
      i10.minorTickInterval && !i10.categories && i10.getMinorTickPositions().forEach(function(t12) {
        i10.renderMinorTick(t12, r11);
      }), h10.length && (h10.forEach(function(t12, e11) {
        i10.renderTick(t12, e11, r11);
      }), m2 && (0 === i10.min || i10.single) && (d2[-1] || (d2[-1] = new sC(i10, -1, null, true)), d2[-1].render(-1))), u2 && h10.forEach(function(r12, a11) {
        e10 = void 0 !== h10[a11 + 1] ? h10[a11 + 1] + m2 : i10.max - m2, a11 % 2 == 0 && r12 < i10.max && e10 <= i10.max + (s10.polar ? -m2 : m2) && (p2[r12] || (p2[r12] = new N.PlotLineOrBand(i10, {})), t11 = r12 + m2, p2[r12].options = {
          from: o10 ? o10.lin2log(t11) : t11,
          to: o10 ? o10.lin2log(e10) : e10,
          color: u2,
          className: "highcharts-alternate-grid"
        }, p2[r12].render(), p2[r12].isActive = true);
      }), i10._addedPlotLB || (i10._addedPlotLB = true, (a10.plotLines || []).concat(a10.plotBands || []).forEach(function(t12) {
        i10.addPlotBandOrLine(t12);
      }));
    }
    [d2, c2, p2].forEach(function(t12) {
      let e11 = [], i11 = b2.duration;
      s_(t12, function(t13, i12) {
        t13.isActive || (t13.render(i12, false, 0), t13.isActive = false, e11.push(i12));
      }), s1(function() {
        let i12 = e11.length;
        for (; i12--; ) t12[e11[i12]] && !t12[e11[i12]].isActive && (t12[e11[i12]].destroy(), delete t12[e11[i12]]);
      }, t12 !== p2 && s10.hasRendered && i11 ? i11 : 0);
    }), x2 && (x2[x2.isPlaced ? "animate" : "attr"]({
      d: this.getLinePath(x2.strokeWidth())
    }), x2.isPlaced = true, x2[y2 ? "show" : "hide"](y2)), l2 && y2 && (l2[l2.isNew ? "attr" : "animate"](i10.getTitlePosition(l2)), l2.isNew = false), g2?.enabled && i10.stacking && i10.stacking.renderStackTotals(), i10.old = {
      len: i10.len,
      max: i10.max,
      min: i10.min,
      transA: i10.transA,
      userMax: i10.userMax,
      userMin: i10.userMin
    }, i10.isDirty = false, sH(this, "afterRender");
  }
  redraw() {
    this.visible && (this.render(), this.plotLinesAndBands.forEach(function(t11) {
      t11.render();
    })), this.series.forEach(function(t11) {
      t11.isDirty = true;
    });
  }
  getKeepProps() {
    return this.keepProps || _s3.keepProps;
  }
  destroy(t11) {
    let e10 = this, i10 = e10.plotLinesAndBands, s10 = this.eventOptions;
    if (sH(this, "destroy", {
      keepEvents: t11
    }), t11 || sQ(e10), [e10.ticks, e10.minorTicks, e10.alternateBands].forEach(function(t12) {
      sW(t12);
    }), i10) {
      let t12 = i10.length;
      for (; t12--; ) i10[t12].destroy();
    }
    for (let t12 in ["axisLine", "axisTitle", "axisGroup", "gridGroup", "labelGroup", "cross", "scrollbar"].forEach(function(t13) {
      e10[t13] && (e10[t13] = e10[t13].destroy());
    }), e10.plotLinesAndBandsGroups) e10.plotLinesAndBandsGroups[t12] = e10.plotLinesAndBandsGroups[t12].destroy();
    s_(e10, function(t12, i11) {
      -1 === e10.getKeepProps().indexOf(i11) && delete e10[i11];
    }), this.eventOptions = s10;
  }
  drawCrosshair(t11, e10) {
    let i10 = this.crosshair, s10 = i10?.snap ?? true, o10 = this.chart, r10, a10, n10, h10 = this.cross, l2;
    if (sH(this, "drawCrosshair", {
      e: t11,
      point: e10
    }), t11 || (t11 = this.cross?.e), i10 && false !== (sR(e10) || !s10)) {
      if (s10 ? sR(e10) && (a10 = sK("colorAxis" !== this.coll ? e10.crosshairPos : null, this.isXAxis ? e10.plotX : this.len - e10.plotY)) : a10 = t11 && (this.horiz ? t11.chartX - this.pos : this.len - t11.chartY + this.pos), sR(a10) && (l2 = {
        value: e10 && (this.isXAxis ? e10.x : sK(e10.stackY, e10.y)),
        translatedValue: a10
      }, o10.polar && sG(l2, {
        isCrosshair: true,
        chartX: t11?.chartX,
        chartY: t11?.chartY,
        point: e10
      }), r10 = this.getPlotLinePath(l2) || null), !sR(r10)) return void this.hideCrosshair();
      n10 = this.categories && !this.isRadial, h10 || (this.cross = h10 = o10.renderer.path().addClass("highcharts-crosshair highcharts-crosshair-" + (n10 ? "category " : "thin ") + (i10.className || "")).attr({
        zIndex: sK(i10.zIndex, 2)
      }).add(), !o10.styledMode && (h10.attr({
        stroke: i10.color || (n10 ? tG.parse("#ccd3ff").setOpacity(0.25).get() : "#cccccc"),
        "stroke-width": sK(i10.width, 1)
      }).css({
        "pointer-events": "none"
      }), i10.dashStyle && h10.attr({
        dashstyle: i10.dashStyle
      }))), h10.show().attr({
        d: r10
      }), n10 && !i10.width && h10.attr({
        "stroke-width": this.transA
      }), this.cross.e = t11;
    } else this.hideCrosshair();
    sH(this, "afterDrawCrosshair", {
      e: t11,
      point: e10
    });
  }
  hideCrosshair() {
    this.cross && this.cross.hide(), sH(this, "afterHideCrosshair");
  }
  update(t11, e10) {
    let i10 = this.chart;
    t11 = sZ(this.userOptions, t11), this.destroy(true), this.init(i10, t11), i10.isDirtyBox = true, sK(e10, true) && i10.redraw();
  }
  remove(t11) {
    let e10 = this.chart, i10 = this.coll, s10 = this.series, o10 = s10.length;
    for (; o10--; ) s10[o10] && s10[o10].remove(false);
    sX(e10.axes, this), sX(e10[i10] || [], this), e10.orderItems(i10), this.destroy(), e10.isDirtyBox = true, sK(t11, true) && e10.redraw();
  }
  setTitle(t11, e10) {
    this.update({
      title: t11
    }, e10);
  }
  setCategories(t11, e10) {
    this.update({
      categories: t11
    }, e10);
  }
};
s3.keepProps = ["coll", "extKey", "hcEvents", "len", "names", "series", "userMax", "userMin"];
var {
  addEvent: s5,
  getMagnitude: s6,
  normalizeTickInterval: s9,
  timeUnits: s4
} = ta;
!function(t11) {
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
  t11.compose = function(t12) {
    return t12.keepProps.includes("dateTime") || (t12.keepProps.push("dateTime"), t12.prototype.getTimeTicks = e10, s5(t12, "afterSetType", i10)), t12;
  };
  class s10 {
    constructor(t12) {
      this.axis = t12;
    }
    normalizeTimeTickInterval(t12, e11) {
      let i11 = e11 || [["millisecond", [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]], ["second", [1, 2, 5, 10, 15, 30]], ["minute", [1, 2, 5, 10, 15, 30]], ["hour", [1, 2, 3, 4, 6, 8, 12]], ["day", [1, 2]], ["week", [1, 2]], ["month", [1, 2, 3, 4, 6]], ["year", null]], s11 = i11[i11.length - 1], o10 = s4[s11[0]], r10 = s11[1], a10;
      for (a10 = 0; a10 < i11.length && (o10 = s4[(s11 = i11[a10])[0]], r10 = s11[1], !i11[a10 + 1] || !(t12 <= (o10 * r10[r10.length - 1] + s4[i11[a10 + 1][0]]) / 2)); a10++) ;
      o10 === s4.year && t12 < 5 * o10 && (r10 = [1, 2, 5]);
      let n10 = s9(t12 / o10, r10, "year" === s11[0] ? Math.max(s6(t12 / o10), 1) : 1);
      return {
        unitRange: o10,
        count: n10,
        unitName: s11[0]
      };
    }
    getXDateFormat(t12, e11) {
      let {
        axis: i11
      } = this, s11 = i11.chart.time;
      return i11.closestPointRange ? s11.getDateFormat(i11.closestPointRange, t12, i11.options.startOfWeek, e11) || s11.resolveDTLFormat(e11.year).main : s11.resolveDTLFormat(e11.day).main;
    }
  }
  t11.Additions = s10;
}(k || (k = {}));
var s8 = k;
var {
  addEvent: s7,
  normalizeTickInterval: ot,
  pick: oe
} = ta;
!function(t11) {
  function e10() {
    "logarithmic" !== this.type ? this.logarithmic = void 0 : this.logarithmic ?? (this.logarithmic = new s10(this));
  }
  function i10() {
    let t12 = this.logarithmic;
    t12 && (this.lin2val = function(e11) {
      return t12.lin2log(e11);
    }, this.val2lin = function(e11) {
      return t12.log2lin(e11);
    });
  }
  t11.compose = function(t12) {
    return t12.keepProps.includes("logarithmic") || (t12.keepProps.push("logarithmic"), s7(t12, "afterSetType", e10), s7(t12, "afterInit", i10)), t12;
  };
  class s10 {
    constructor(t12) {
      this.axis = t12;
    }
    getLogTickPositions(t12, e11, i11, s11) {
      let o10 = this.axis, r10 = o10.len, a10 = o10.options, n10 = [];
      if (s11 || (this.minorAutoInterval = void 0), t12 >= 0.5) t12 = Math.round(t12), n10 = o10.getLinearTickPositions(t12, e11, i11);
      else if (t12 >= 0.08) {
        let o11, r11, a11, h10, l2, d2, c2, p2 = Math.floor(e11);
        for (o11 = t12 > 0.3 ? [1, 2, 4] : t12 > 0.15 ? [1, 2, 4, 6, 8] : [1, 2, 3, 4, 5, 6, 7, 8, 9], r11 = p2; r11 < i11 + 1 && !c2; r11++) for (a11 = 0, h10 = o11.length; a11 < h10 && !c2; a11++) (l2 = this.log2lin(this.lin2log(r11) * o11[a11])) > e11 && (!s11 || d2 <= i11) && void 0 !== d2 && n10.push(d2), d2 > i11 && (c2 = true), d2 = l2;
      } else {
        let h10 = this.lin2log(e11), l2 = this.lin2log(i11), d2 = s11 ? o10.getMinorTickInterval() : a10.tickInterval, c2 = a10.tickPixelInterval / (s11 ? 5 : 1), p2 = s11 ? r10 / o10.tickPositions.length : r10;
        t12 = ot(t12 = oe("auto" === d2 ? null : d2, this.minorAutoInterval, (l2 - h10) * c2 / (p2 || 1))), n10 = o10.getLinearTickPositions(t12, h10, l2).map(this.log2lin), s11 || (this.minorAutoInterval = t12 / 5);
      }
      return s11 || (o10.tickInterval = t12), n10;
    }
    lin2log(t12) {
      return Math.pow(10, t12);
    }
    log2lin(t12) {
      return Math.log(t12) / Math.LN10;
    }
  }
  t11.Additions = s10;
}(M || (M = {}));
var oi = M;
var {
  erase: os,
  extend: oo,
  isNumber: or
} = ta;
!function(t11) {
  let e10;
  function i10(t12) {
    return this.addPlotBandOrLine(t12, "plotBands");
  }
  function s10(t12, i11) {
    let s11 = this.userOptions, o11 = new e10(this, t12);
    if (this.visible && (o11 = o11.render()), o11) {
      if (this._addedPlotLB || (this._addedPlotLB = true, (s11.plotLines || []).concat(s11.plotBands || []).forEach((t13) => {
        this.addPlotBandOrLine(t13);
      })), i11) {
        let e11 = s11[i11] || [];
        e11.push(t12), s11[i11] = e11;
      }
      this.plotLinesAndBands.push(o11);
    }
    return o11;
  }
  function o10(t12) {
    return this.addPlotBandOrLine(t12, "plotLines");
  }
  function r10(t12, e11, i11) {
    i11 = i11 || this.options;
    let s11 = this.getPlotLinePath({
      value: e11,
      force: true,
      acrossPanes: i11.acrossPanes
    }), o11 = [], r11 = this.horiz, a11 = !or(this.min) || !or(this.max) || t12 < this.min && e11 < this.min || t12 > this.max && e11 > this.max, n11 = this.getPlotLinePath({
      value: t12,
      force: true,
      acrossPanes: i11.acrossPanes
    }), h11, l2 = 1, d2;
    if (n11 && s11) for (a11 && (d2 = n11.toString() === s11.toString(), l2 = 0), h11 = 0; h11 < n11.length; h11 += 2) {
      let t13 = n11[h11], e12 = n11[h11 + 1], i12 = s11[h11], a12 = s11[h11 + 1];
      ("M" === t13[0] || "L" === t13[0]) && ("M" === e12[0] || "L" === e12[0]) && ("M" === i12[0] || "L" === i12[0]) && ("M" === a12[0] || "L" === a12[0]) && (r11 && i12[1] === t13[1] ? (i12[1] += l2, a12[1] += l2) : r11 || i12[2] !== t13[2] || (i12[2] += l2, a12[2] += l2), o11.push(["M", t13[1], t13[2]], ["L", e12[1], e12[2]], ["L", a12[1], a12[2]], ["L", i12[1], i12[2]], ["Z"])), o11.isFlat = d2;
    }
    return o11;
  }
  function a10(t12) {
    this.removePlotBandOrLine(t12);
  }
  function n10(t12) {
    let e11 = this.plotLinesAndBands, i11 = this.options, s11 = this.userOptions;
    if (e11) {
      let o11 = e11.length;
      for (; o11--; ) e11[o11].id === t12 && e11[o11].destroy();
      [i11.plotLines || [], s11.plotLines || [], i11.plotBands || [], s11.plotBands || []].forEach(function(e12) {
        for (o11 = e12.length; o11--; ) e12[o11]?.id === t12 && os(e12, e12[o11]);
      });
    }
  }
  function h10(t12) {
    this.removePlotBandOrLine(t12);
  }
  t11.compose = function(t12, l2) {
    let d2 = l2.prototype;
    return d2.addPlotBand || (e10 = t12, oo(d2, {
      addPlotBand: i10,
      addPlotLine: o10,
      addPlotBandOrLine: s10,
      getPlotBandPath: r10,
      removePlotBand: a10,
      removePlotLine: h10,
      removePlotBandOrLine: n10
    })), l2;
  };
}(w || (w = {}));
var oa = w;
var {
  addEvent: on,
  arrayMax: oh,
  arrayMin: ol,
  defined: od,
  destroyObjectProperties: oc,
  erase: op,
  fireEvent: og,
  merge: ou,
  objectEach: of,
  pick: om
} = ta;
var ox = class _ox {
  static compose(t11, e10) {
    return on(t11, "afterInit", function() {
      this.labelCollectors.push(() => {
        let t12 = [];
        for (let e11 of this.axes) for (let {
          label: i10,
          options: s10
        } of e11.plotLinesAndBands) i10 && !s10?.label?.allowOverlap && t12.push(i10);
        return t12;
      });
    }), oa.compose(_ox, e10);
  }
  constructor(t11, e10) {
    this.axis = t11, this.options = e10, this.id = e10.id;
  }
  render() {
    og(this, "render");
    let {
      axis: t11,
      options: e10
    } = this, {
      horiz: i10,
      logarithmic: s10
    } = t11, {
      color: o10,
      events: r10,
      zIndex: a10 = 0
    } = e10, {
      renderer: n10,
      time: h10
    } = t11.chart, l2 = {}, d2 = h10.parse(e10.to), c2 = h10.parse(e10.from), p2 = h10.parse(e10.value), g2 = e10.borderWidth, u2 = e10.label, {
      label: f2,
      svgElem: m2
    } = this, x2 = [], y2, b2 = od(c2) && od(d2), v2 = od(p2), k2 = !m2, M2 = {
      class: "highcharts-plot-" + (b2 ? "band " : "line ") + (e10.className || "")
    }, w2 = b2 ? "bands" : "lines";
    if (!t11.chart.styledMode && (v2 ? (M2.stroke = o10 || "#999999", M2["stroke-width"] = om(e10.width, 1), e10.dashStyle && (M2.dashstyle = e10.dashStyle)) : b2 && (M2.fill = o10 || "#e6e9ff", g2 && (M2.stroke = e10.borderColor, M2["stroke-width"] = g2))), l2.zIndex = a10, w2 += "-" + a10, (y2 = t11.plotLinesAndBandsGroups[w2]) || (t11.plotLinesAndBandsGroups[w2] = y2 = n10.g("plot-" + w2).attr(l2).add()), m2 || (this.svgElem = m2 = n10.path().attr(M2).add(y2)), od(p2)) x2 = t11.getPlotLinePath({
      value: s10?.log2lin(p2) ?? p2,
      lineWidth: m2.strokeWidth(),
      acrossPanes: e10.acrossPanes
    });
    else {
      if (!(od(c2) && od(d2))) return;
      x2 = t11.getPlotBandPath(s10?.log2lin(c2) ?? c2, s10?.log2lin(d2) ?? d2, e10);
    }
    return !this.eventsAdded && r10 && (of(r10, (t12, e11) => {
      m2?.on(e11, (t13) => {
        r10[e11].apply(this, [t13]);
      });
    }), this.eventsAdded = true), (k2 || !m2.d) && x2?.length ? m2.attr({
      d: x2
    }) : m2 && (x2 ? (m2.show(), m2.animate({
      d: x2
    })) : m2.d && (m2.hide(), f2 && (this.label = f2 = f2.destroy()))), u2 && (od(u2.text) || od(u2.formatter)) && x2?.length && t11.width > 0 && t11.height > 0 && !x2.isFlat ? (u2 = ou(__spreadValues({
      align: i10 && b2 ? "center" : void 0,
      x: i10 ? !b2 && 4 : 10,
      verticalAlign: !i10 && b2 ? "middle" : void 0,
      y: i10 ? b2 ? 16 : 10 : b2 ? 6 : -4,
      rotation: i10 && !b2 ? 90 : 0
    }, b2 ? {
      inside: true
    } : {}), u2), this.renderLabel(u2, x2, b2, a10)) : f2 && f2.hide(), this;
  }
  renderLabel(t11, e10, i10, s10) {
    let o10 = this.axis, r10 = o10.chart.renderer, a10 = t11.inside, n10 = this.label;
    n10 || (this.label = n10 = r10.text(this.getLabelText(t11), 0, 0, t11.useHTML).attr({
      align: t11.textAlign || t11.align,
      rotation: t11.rotation,
      class: "highcharts-plot-" + (i10 ? "band" : "line") + "-label " + (t11.className || ""),
      zIndex: s10
    }), o10.chart.styledMode || n10.css(ou({
      color: o10.chart.options.title?.style?.color,
      fontSize: "0.8em",
      textOverflow: i10 && !a10 ? "" : "ellipsis"
    }, t11.style)), n10.add());
    let h10 = e10.xBounds || [e10[0][1], e10[1][1], i10 ? e10[2][1] : e10[0][1]], l2 = e10.yBounds || [e10[0][2], e10[1][2], i10 ? e10[2][2] : e10[0][2]], d2 = ol(h10), c2 = ol(l2), p2 = oh(h10) - d2;
    n10.align(t11, false, {
      x: d2,
      y: c2,
      width: p2,
      height: oh(l2) - c2
    }), n10.alignAttr.y -= r10.fontMetrics(n10).b, (!n10.alignValue || "left" === n10.alignValue || od(a10)) && n10.css({
      width: (t11.style?.width || (i10 && a10 ? p2 : 90 === n10.rotation ? o10.height - (n10.alignAttr.y - o10.top) : (t11.clip ? o10.width : o10.chart.chartWidth) - (n10.alignAttr.x - o10.left))) + "px"
    }), n10.show(true);
  }
  getLabelText(t11) {
    return od(t11.formatter) ? t11.formatter.call(this) : t11.text;
  }
  destroy() {
    op(this.axis.plotLinesAndBands, this), delete this.axis, oc(this);
  }
};
var {
  animObject: oy
} = t3;
var {
  format: ob
} = ew;
var {
  composed: ov,
  dateFormats: ok,
  doc: oM,
  isSafari: ow
} = N;
var {
  distribute: oS
} = eL;
var {
  addEvent: oT,
  clamp: oC,
  css: oA,
  clearTimeout: oP,
  discardElement: oL,
  extend: oO,
  fireEvent: oE,
  getAlignFactor: oI,
  isArray: oD,
  isNumber: oB,
  isObject: oN,
  isString: oz,
  merge: oR,
  pick: oW,
  pushUnique: oX,
  splat: oF,
  syncTimeout: oG
} = ta;
var oH = class {
  constructor(t11, e10, i10) {
    this.allowShared = true, this.crosshairs = [], this.distance = 0, this.isHidden = true, this.isSticky = false, this.options = {}, this.outside = false, this.chart = t11, this.init(t11, e10), this.pointer = i10;
  }
  bodyFormatter(t11) {
    return t11.map((t12) => {
      let e10 = t12.series.tooltipOptions, i10 = t12.formatPrefix || "point";
      return (e10[i10 + "Formatter"] || t12.tooltipFormatter).call(t12, e10[i10 + "Format"] || "");
    });
  }
  cleanSplit(t11) {
    this.chart.series.forEach(function(e10) {
      let i10 = e10?.tt;
      i10 && (!i10.isActive || t11 ? e10.tt = i10.destroy() : i10.isActive = false);
    });
  }
  defaultFormatter(t11) {
    let e10, i10 = this.points || oF(this);
    return (e10 = (e10 = [t11.headerFooterFormatter(i10[0])]).concat(t11.bodyFormatter(i10))).push(t11.headerFooterFormatter(i10[0], true)), e10;
  }
  destroy() {
    this.label && (this.label = this.label.destroy()), this.split && (this.cleanSplit(true), this.tt && (this.tt = this.tt.destroy())), this.renderer && (this.renderer = this.renderer.destroy(), oL(this.container)), oP(this.hideTimer);
  }
  getAnchor(t11, e10) {
    let i10, {
      chart: s10,
      pointer: o10
    } = this, r10 = s10.inverted, a10 = s10.plotTop, n10 = s10.plotLeft;
    if (t11 = oF(t11), t11[0].series?.yAxis && !t11[0].series.yAxis.options.reversedStacks && (t11 = t11.slice().reverse()), this.followPointer && e10) void 0 === e10.chartX && (e10 = o10.normalize(e10)), i10 = [e10.chartX - n10, e10.chartY - a10];
    else if (t11[0].tooltipPos) i10 = t11[0].tooltipPos;
    else {
      let s11 = 0, o11 = 0;
      t11.forEach(function(t12) {
        let e11 = t12.pos(true);
        e11 && (s11 += e11[0], o11 += e11[1]);
      }), s11 /= t11.length, o11 /= t11.length, this.shared && t11.length > 1 && e10 && (r10 ? s11 = e10.chartX : o11 = e10.chartY), i10 = [s11 - n10, o11 - a10];
    }
    let h10 = {
      point: t11[0],
      ret: i10
    };
    return oE(this, "getAnchor", h10), h10.ret.map(Math.round);
  }
  getClassName(t11, e10, i10) {
    let s10 = this.options, o10 = t11.series, r10 = o10.options;
    return [s10.className, "highcharts-label", i10 && "highcharts-tooltip-header", e10 ? "highcharts-tooltip-box" : "highcharts-tooltip", !i10 && "highcharts-color-" + oW(t11.colorIndex, o10.colorIndex), r10?.className].filter(oz).join(" ");
  }
  getLabel({
    anchorX: t11,
    anchorY: e10
  } = {
    anchorX: 0,
    anchorY: 0
  }) {
    let i10 = this, s10 = this.chart.styledMode, o10 = this.options, r10 = this.split && this.allowShared, a10 = this.container, n10 = this.chart.renderer;
    if (this.label) {
      let t12 = !this.label.hasClass("highcharts-label");
      (!r10 && t12 || r10 && !t12) && this.destroy();
    }
    if (!this.label) {
      if (this.outside) {
        let t12 = this.chart, e11 = t12.options.chart.style, i11 = eS.getRendererType();
        this.container = a10 = N.doc.createElement("div"), a10.className = "highcharts-tooltip-container " + (t12.renderTo.className.match(/(highcharts[a-zA-Z0-9-]+)\s?/gm) || ""), oA(a10, {
          position: "absolute",
          top: "1px",
          pointerEvents: "none",
          zIndex: Math.max(this.options.style.zIndex || 0, (e11?.zIndex || 0) + 3)
        }), this.renderer = n10 = new i11(a10, 0, 0, e11, void 0, void 0, n10.styledMode);
      }
      if (r10 ? this.label = n10.g("tooltip") : (this.label = n10.label("", t11, e10, o10.shape || "callout", void 0, void 0, o10.useHTML, void 0, "tooltip").attr({
        padding: o10.padding,
        r: o10.borderRadius
      }), s10 || this.label.attr({
        fill: o10.backgroundColor,
        "stroke-width": o10.borderWidth || 0
      }).css(o10.style).css({
        pointerEvents: o10.style.pointerEvents || (this.shouldStickOnContact() ? "auto" : "none")
      })), i10.outside) {
        let t12 = this.label;
        [t12.xSetter, t12.ySetter].forEach((e11, s11) => {
          t12[s11 ? "ySetter" : "xSetter"] = (o11) => {
            e11.call(t12, i10.distance), t12[s11 ? "y" : "x"] = o11, a10 && (a10.style[s11 ? "top" : "left"] = `${o11}px`);
          };
        });
      }
      this.label.attr({
        zIndex: 8
      }).shadow(o10.shadow ?? !o10.fixed).add();
    }
    return a10 && !a10.parentElement && N.doc.body.appendChild(a10), this.label;
  }
  getPlayingField() {
    let {
      body: t11,
      documentElement: e10
    } = oM, {
      chart: i10,
      distance: s10,
      outside: o10
    } = this;
    return {
      width: o10 ? Math.max(t11.scrollWidth, e10.scrollWidth, t11.offsetWidth, e10.offsetWidth, e10.clientWidth) - 2 * s10 - 2 : i10.chartWidth,
      height: o10 ? Math.max(t11.scrollHeight, e10.scrollHeight, t11.offsetHeight, e10.offsetHeight, e10.clientHeight) : i10.chartHeight
    };
  }
  getPosition(t11, e10, i10) {
    let {
      distance: s10,
      chart: o10,
      outside: r10,
      pointer: a10
    } = this, {
      inverted: n10,
      plotLeft: h10,
      plotTop: l2,
      polar: d2
    } = o10, {
      plotX: c2 = 0,
      plotY: p2 = 0
    } = i10, g2 = {}, u2 = n10 && i10.h || 0, {
      height: f2,
      width: m2
    } = this.getPlayingField(), x2 = a10.getChartPosition(), y2 = (i11) => {
      let a11 = "x" === i11;
      return [i11, a11 ? m2 : f2, a11 ? t11 : e10].concat(r10 ? [a11 ? t11 * x2.scaleX : e10 * x2.scaleY, a11 ? x2.left - s10 + (c2 + h10) * x2.scaleX : x2.top - s10 + (p2 + l2) * x2.scaleY, 0, a11 ? m2 : f2] : [a11 ? t11 : e10, a11 ? c2 + h10 : p2 + l2, a11 ? h10 : l2, a11 ? h10 + o10.plotWidth : l2 + o10.plotHeight]);
    }, b2 = y2("y"), v2 = y2("x"), k2, M2 = !!i10.negative;
    !d2 && o10.hoverSeries?.yAxis?.reversed && (M2 = !M2);
    let w2 = !this.followPointer && oW(i10.ttBelow, !d2 && !n10 === M2), S2 = function(t12, e11, i11, o11, a11, n11, h11) {
      let l3 = r10 ? "y" === t12 ? s10 * x2.scaleY : s10 * x2.scaleX : s10, d3 = (i11 - o11) / 2, c3 = o11 < a11 - s10, p3 = a11 + s10 + o11 < e11, f3 = a11 - l3 - i11 + d3, m3 = a11 + l3 - d3;
      if (w2 && p3) g2[t12] = m3;
      else if (!w2 && c3) g2[t12] = f3;
      else if (c3) g2[t12] = Math.min(h11 - o11, f3 - u2 < 0 ? f3 : f3 - u2);
      else {
        if (!p3) return g2[t12] = 0, false;
        g2[t12] = Math.max(n11, m3 + u2 + i11 > e11 ? m3 : m3 + u2);
      }
    }, T2 = function(t12, e11, i11, o11, r11) {
      if (r11 < s10 || r11 > e11 - s10) return false;
      r11 < i11 / 2 ? g2[t12] = 1 : r11 > e11 - o11 / 2 ? g2[t12] = e11 - o11 - 2 : g2[t12] = r11 - i11 / 2;
    }, C2 = function(t12) {
      [b2, v2] = [v2, b2], k2 = t12;
    }, A2 = () => {
      false !== S2.apply(0, b2) ? false !== T2.apply(0, v2) || k2 || (C2(true), A2()) : k2 ? g2.x = g2.y = 0 : (C2(true), A2());
    };
    return (n10 && !d2 || this.len > 1) && C2(), A2(), g2;
  }
  getFixedPosition(t11, e10, i10) {
    let s10 = i10.series, {
      chart: o10,
      options: r10,
      split: a10
    } = this, n10 = r10.position, h10 = n10.relativeTo, l2 = r10.shared || s10?.yAxis?.isRadial && ("pane" === h10 || !h10) ? "plotBox" : h10, d2 = "chart" === l2 ? o10.renderer : o10[l2] || o10.getClipBox(s10, true);
    return {
      x: d2.x + (d2.width - t11) * oI(n10.align) + n10.x,
      y: d2.y + (d2.height - e10) * oI(n10.verticalAlign) + (!a10 && n10.y || 0)
    };
  }
  hide(t11) {
    let e10 = this;
    oP(this.hideTimer), t11 = oW(t11, this.options.hideDelay), this.isHidden || (this.hideTimer = oG(function() {
      let i10 = e10.getLabel();
      e10.getLabel().animate({
        opacity: 0
      }, {
        duration: t11 ? 150 : t11,
        complete: () => {
          i10.hide(), e10.container && e10.container.remove();
        }
      }), e10.isHidden = true;
    }, t11));
  }
  init(t11, e10) {
    this.chart = t11, this.options = e10, this.crosshairs = [], this.isHidden = true, this.split = e10.split && !t11.inverted && !t11.polar, this.shared = e10.shared || this.split, this.outside = oW(e10.outside, !!(t11.scrollablePixelsX || t11.scrollablePixelsY));
  }
  shouldStickOnContact(t11) {
    return !!(!this.followPointer && this.options.stickOnContact && (!t11 || this.pointer.inClass(t11.target, "highcharts-tooltip")));
  }
  move(t11, e10, i10, s10) {
    let {
      followPointer: o10,
      options: r10
    } = this, a10 = oy(!o10 && !this.isHidden && !r10.fixed && r10.animation), n10 = o10 || (this.len || 0) > 1, h10 = {
      x: t11,
      y: e10
    };
    n10 ? h10.anchorX = h10.anchorY = NaN : (h10.anchorX = i10, h10.anchorY = s10), a10.step = () => this.drawTracker(), this.getLabel().animate(h10, a10);
  }
  refresh(t11, e10) {
    let {
      chart: i10,
      options: s10,
      pointer: o10,
      shared: r10
    } = this, a10 = oF(t11), n10 = a10[0], h10 = s10.format, l2 = s10.formatter || this.defaultFormatter, d2 = i10.styledMode, c2 = this.allowShared;
    if (!s10.enabled || !n10.series) return;
    oP(this.hideTimer), this.allowShared = !(!oD(t11) && t11.series && t11.series.noSharedTooltip), c2 = c2 && !this.allowShared, this.followPointer = !this.split && n10.series.tooltipOptions.followPointer;
    let p2 = this.getAnchor(t11, e10), g2 = p2[0], u2 = p2[1];
    r10 && this.allowShared && (o10.applyInactiveState(a10), a10.forEach((t12) => t12.setState("hover")), n10.points = a10), this.len = a10.length;
    let f2 = oz(h10) ? ob(h10, n10, i10) : l2.call(n10, this);
    n10.points = void 0;
    let m2 = n10.series;
    if (this.distance = oW(m2.tooltipOptions.distance, 16), false === f2) this.hide();
    else {
      if (this.split && this.allowShared) this.renderSplit(f2, a10);
      else {
        let t12 = g2, r11 = u2;
        if (e10 && o10.isDirectTouch && (t12 = e10.chartX - i10.plotLeft, r11 = e10.chartY - i10.plotTop), !(i10.polar || false === m2.options.clip || a10.some((e11) => o10.isDirectTouch || e11.series.shouldShowTooltip(t12, r11)))) return void this.hide();
        {
          let t13 = this.getLabel(c2 && this.tt || {});
          (!s10.style.width || d2) && t13.css({
            width: (this.outside ? this.getPlayingField() : i10.spacingBox).width + "px"
          }), t13.attr({
            class: this.getClassName(n10),
            text: f2 && f2.join ? f2.join("") : f2
          }), this.outside && t13.attr({
            x: oC(t13.x || 0, 0, this.getPlayingField().width - (t13.width || 0) - 1)
          }), d2 || t13.attr({
            stroke: s10.borderColor || n10.color || m2.color || "#666666"
          }), this.updatePosition({
            plotX: g2,
            plotY: u2,
            negative: n10.negative,
            ttBelow: n10.ttBelow,
            series: m2,
            h: p2[2] || 0
          });
        }
      }
      this.isHidden && this.label && this.label.attr({
        opacity: 1
      }).show(), this.isHidden = false;
    }
    oE(this, "refresh");
  }
  renderSplit(t11, e10) {
    let i10 = this, {
      chart: s10,
      chart: {
        chartWidth: o10,
        chartHeight: r10,
        plotHeight: a10,
        plotLeft: n10,
        plotTop: h10,
        scrollablePixelsY: l2 = 0,
        scrollablePixelsX: d2,
        styledMode: c2
      },
      distance: p2,
      options: g2,
      options: {
        fixed: u2,
        position: f2,
        positioner: m2
      },
      pointer: x2
    } = i10, {
      scrollLeft: y2 = 0,
      scrollTop: b2 = 0
    } = s10.scrollablePlotArea?.scrollingContainer || {}, v2 = i10.outside && "number" != typeof d2 ? oM.documentElement.getBoundingClientRect() : {
      left: y2,
      right: y2 + o10,
      top: b2,
      bottom: b2 + r10
    }, k2 = i10.getLabel(), M2 = this.renderer || s10.renderer, w2 = !!s10.xAxis[0]?.opposite, {
      left: S2,
      top: T2
    } = x2.getChartPosition(), C2 = m2 || u2, A2 = h10 + b2, P2 = 0, L2 = a10 - l2, O2 = function(t12, e11, s11, o11 = [0, 0], r11 = true) {
      let a11, n11;
      if (s11.isHeader) n11 = w2 ? 0 : L2, a11 = oC(o11[0] - t12 / 2, v2.left, v2.right - t12 - (i10.outside ? S2 : 0));
      else if (u2 && s11) {
        let o12 = i10.getFixedPosition(t12, e11, s11);
        a11 = o12.x, n11 = o12.y - A2;
      } else n11 = o11[1] - A2, a11 = oC(a11 = r11 ? o11[0] - t12 - p2 : o11[0] + p2, r11 ? a11 : v2.left, v2.right);
      return {
        x: a11,
        y: n11
      };
    };
    oz(t11) && (t11 = [false, t11]);
    let E2 = t11.slice(0, e10.length + 1).reduce(function(t12, s11, o11) {
      if (false !== s11 && "" !== s11) {
        let r11 = e10[o11 - 1] || {
          isHeader: true,
          plotX: e10[0].plotX,
          plotY: a10,
          series: {}
        }, l3 = r11.isHeader, d3 = l3 ? i10 : r11.series, f3 = d3.tt = function(t13, e11, s12) {
          let o12 = t13, {
            isHeader: r12,
            series: a11
          } = e11, n11 = a11.tooltipOptions || g2;
          if (!o12) {
            let t14 = {
              padding: n11.padding,
              r: n11.borderRadius
            };
            c2 || (t14.fill = n11.backgroundColor, t14["stroke-width"] = n11.borderWidth ?? (u2 && !r12 ? 0 : 1)), o12 = M2.label("", 0, 0, n11[r12 ? "headerShape" : "shape"] || (u2 && !r12 ? "rect" : "callout"), void 0, void 0, n11.useHTML).addClass(i10.getClassName(e11, true, r12)).attr(t14).add(k2);
          }
          return o12.isActive = true, o12.attr({
            text: s12
          }), c2 || o12.css(n11.style).attr({
            stroke: n11.borderColor || e11.color || a11.color || "#333333"
          }), o12;
        }(d3.tt, r11, s11.toString()), x3 = f3.getBBox(), y3 = x3.width + f3.strokeWidth();
        l3 && (P2 = x3.height, L2 += P2, w2 && (A2 -= P2));
        let {
          anchorX: b3,
          anchorY: S3
        } = function(t13) {
          let e11, i11, {
            isHeader: s12,
            plotX: o12 = 0,
            plotY: r12 = 0,
            series: l4
          } = t13;
          if (s12) e11 = Math.max(n10 + o12, n10), i11 = h10 + a10 / 2;
          else {
            let {
              xAxis: t14,
              yAxis: s13
            } = l4;
            e11 = t14.pos + oC(o12, -p2, t14.len + p2), l4.shouldShowTooltip(0, s13.pos - h10 + r12, {
              ignoreX: true
            }) && (i11 = s13.pos + r12);
          }
          return {
            anchorX: e11 = oC(e11, v2.left - p2, v2.right + p2),
            anchorY: i11
          };
        }(r11);
        if ("number" == typeof S3) {
          let e11 = x3.height + 1, s12 = (m2 || O2).call(i10, y3, e11, r11, [b3, S3]);
          t12.push({
            align: C2 ? 0 : void 0,
            anchorX: b3,
            anchorY: S3,
            boxWidth: y3,
            point: r11,
            rank: oW(s12.rank, +!!l3),
            size: e11,
            target: s12.y,
            tt: f3,
            x: s12.x
          });
        } else f3.isActive = false;
      }
      return t12;
    }, []);
    !C2 && E2.some((t12) => {
      let {
        outside: e11
      } = i10, s11 = (e11 ? S2 : 0) + t12.anchorX;
      return s11 < v2.left && s11 + t12.boxWidth < v2.right || s11 < S2 - v2.left + t12.boxWidth && v2.right - s11 > s11;
    }) && (E2 = E2.map((t12) => {
      let {
        x: e11,
        y: i11
      } = O2.call(this, t12.boxWidth, t12.size, t12.point, [t12.anchorX, t12.anchorY], false);
      return oO(t12, {
        target: i11,
        x: e11
      });
    })), i10.cleanSplit(), oS(E2, L2);
    let I2 = {
      left: S2,
      right: S2
    };
    E2.forEach(function(t12) {
      let {
        x: e11,
        boxWidth: s11,
        isHeader: o11
      } = t12;
      !o11 && (i10.outside && S2 + e11 < I2.left && (I2.left = S2 + e11), !o11 && i10.outside && I2.left + s11 > I2.right && (I2.right = S2 + e11));
    }), E2.forEach(function(t12) {
      let {
        x: e11,
        anchorX: s11,
        anchorY: o11,
        pos: r11,
        point: {
          isHeader: a11
        }
      } = t12, n11 = {
        visibility: void 0 === r11 ? "hidden" : "inherit",
        x: e11,
        y: (r11 || 0) + A2 + (u2 && f2.y || 0),
        anchorX: s11,
        anchorY: o11
      };
      if (i10.outside && e11 < s11) {
        let t13 = S2 - I2.left;
        t13 > 0 && (a11 || (n11.x = e11 + t13, n11.anchorX = s11 + t13), a11 && (n11.x = (I2.right - I2.left) / 2, n11.anchorX = s11 + t13));
      }
      t12.tt.attr(n11);
    });
    let {
      container: D2,
      outside: B2,
      renderer: N2
    } = i10;
    if (B2 && D2 && N2) {
      let {
        width: t12,
        height: e11,
        x: i11,
        y: s11
      } = k2.getBBox();
      N2.setSize(t12 + i11, e11 + s11, false), D2.style.left = I2.left + "px", D2.style.top = T2 + "px";
    }
    ow && k2.attr({
      opacity: 1 === k2.opacity ? 0.999 : 1
    });
  }
  drawTracker() {
    let t11 = this;
    if (!this.shouldStickOnContact()) {
      t11.tracker && (t11.tracker = t11.tracker.destroy());
      return;
    }
    let e10 = t11.chart, i10 = t11.label, s10 = t11.shared ? e10.hoverPoints : e10.hoverPoint;
    if (!i10 || !s10) return;
    let o10 = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }, r10 = this.getAnchor(s10), a10 = i10.getBBox();
    r10[0] += e10.plotLeft - (i10.translateX || 0), r10[1] += e10.plotTop - (i10.translateY || 0), o10.x = Math.min(0, r10[0]), o10.y = Math.min(0, r10[1]), o10.width = r10[0] < 0 ? Math.max(Math.abs(r10[0]), a10.width - r10[0]) : Math.max(Math.abs(r10[0]), a10.width), o10.height = r10[1] < 0 ? Math.max(Math.abs(r10[1]), a10.height - Math.abs(r10[1])) : Math.max(Math.abs(r10[1]), a10.height), t11.tracker ? t11.tracker.attr(o10) : (t11.tracker = i10.renderer.rect(o10).addClass("highcharts-tracker").add(i10), oT(t11.tracker.element, "mouseenter", () => {
      oP(t11.hideTimer);
    }), e10.styledMode || t11.tracker.attr({
      fill: "rgba(0,0,0,0)"
    }));
  }
  styledModeFormat(t11) {
    return t11.replace('style="font-size: 0.8em"', 'class="highcharts-header"').replace(/style="color:{(point|series)\.color}"/g, 'class="highcharts-color-{$1.colorIndex} {series.options.className} {point.options.className}"');
  }
  headerFooterFormatter(t11, e10) {
    let i10 = t11.series, s10 = i10.tooltipOptions, o10 = i10.xAxis, r10 = o10?.dateTime, a10 = {
      isFooter: e10,
      point: t11
    }, n10 = s10.xDateFormat || "", h10 = s10[e10 ? "footerFormat" : "headerFormat"];
    return oE(this, "headerFormatter", a10, function(e11) {
      if (r10 && !n10 && oB(t11.key) && (n10 = r10.getXDateFormat(t11.key, s10.dateTimeLabelFormats)), r10 && n10) {
        if (oN(n10)) {
          let t12 = n10;
          ok[0] = (e12) => i10.chart.time.dateFormat(t12, e12), n10 = "%0";
        }
        (t11.tooltipDateKeys || ["key"]).forEach((t12) => {
          h10 = h10.replace(RegExp("point\\." + t12 + "([ \\)}])"), `(point.${t12}:${n10})$1`);
        });
      }
      i10.chart.styledMode && (h10 = this.styledModeFormat(h10)), e11.text = ob(h10, t11, this.chart);
    }), a10.text || "";
  }
  update(t11) {
    this.destroy(), this.init(this.chart, oR(true, this.options, t11));
  }
  updatePosition(t11) {
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
      fixed: l2,
      positioner: d2
    } = o10, {
      left: c2,
      top: p2,
      scaleX: g2,
      scaleY: u2
    } = r10.getChartPosition(), f2 = (d2 || l2 && this.getFixedPosition || this.getPosition).call(this, h10, n10, t11), m2 = N.doc, x2 = (t11.plotX || 0) + e10.plotLeft, y2 = (t11.plotY || 0) + e10.plotTop, b2;
    if (a10 && i10) {
      if (d2 || l2) {
        let {
          scrollLeft: t12 = 0,
          scrollTop: i11 = 0
        } = e10.scrollablePlotArea?.scrollingContainer || {};
        f2.x += t12 + c2 - s10, f2.y += i11 + p2 - s10;
      }
      b2 = (o10.borderWidth || 0) + 2 * s10 + 2, a10.setSize(oC(h10 + b2, 0, m2.documentElement.clientWidth) - 1, n10 + b2, false), (1 !== g2 || 1 !== u2) && (oA(i10, {
        transform: `scale(${g2}, ${u2})`
      }), x2 *= g2, y2 *= u2), x2 += c2 - f2.x, y2 += p2 - f2.y;
    }
    this.move(Math.round(f2.x), Math.round(f2.y || 0), x2, y2);
  }
};
(l = oH || (oH = {})).compose = function(t11) {
  oX(ov, "Core.Tooltip") && oT(t11, "afterInit", function() {
    let t12 = this.chart;
    t12.options.tooltip && (t12.tooltip = new l(t12, t12.options.tooltip, this));
  });
};
var oY = oH;
var {
  animObject: oj
} = t3;
var {
  defaultOptions: oU
} = tI;
var {
  format: o$
} = ew;
var {
  addEvent: oV,
  crisp: oZ,
  erase: oq,
  extend: o_,
  fireEvent: oK,
  getNestedProperty: oJ,
  isArray: oQ,
  isFunction: o0,
  isNumber: o1,
  isObject: o2,
  merge: o3,
  pick: o5,
  syncTimeout: o6,
  removeEvent: o9,
  uniqueKey: o4
} = ta;
var o8 = class _o8 {
  constructor(t11, e10, i10) {
    this.formatPrefix = "point", this.visible = true, this.point = this, this.series = t11, this.applyOptions(e10, i10), this.id ?? (this.id = o4()), this.resolveColor(), this.dataLabelOnNull ?? (this.dataLabelOnNull = t11.options.nullInteraction), t11.chart.pointCount++, this.category = t11.xAxis?.categories?.[this.x] ?? this.x, this.key = this.name ?? this.category, oK(this, "afterInit");
  }
  animateBeforeDestroy() {
    let t11 = this, e10 = {
      x: t11.startXPos,
      opacity: 0
    }, i10 = t11.getGraphicalProps();
    i10.singular.forEach(function(i11) {
      t11[i11] = t11[i11].animate("dataLabel" === i11 ? {
        x: t11[i11].startXPos,
        y: t11[i11].startYPos,
        opacity: 0
      } : e10);
    }), i10.plural.forEach(function(e11) {
      t11[e11].forEach(function(e12) {
        e12.element && e12.animate(o_({
          x: t11.startXPos
        }, e12.startYPos ? {
          x: e12.startXPos,
          y: e12.startYPos
        } : {}));
      });
    });
  }
  applyOptions(t11, e10) {
    let i10 = this.series, s10 = i10.options.pointValKey || i10.pointValKey;
    return o_(this, t11 = _o8.prototype.optionsToObject.call(this, t11)), this.options = this.options ? o_(this.options, t11) : t11, t11.group && delete this.group, t11.dataLabels && delete this.dataLabels, s10 && (this.y = _o8.prototype.getNestedProperty.call(this, s10)), this.selected && (this.state = "select"), "name" in this && void 0 === e10 && i10.xAxis && i10.xAxis.hasNames && (this.x = i10.xAxis.nameToX(this)), void 0 === this.x && i10 ? this.x = e10 ?? i10.autoIncrement() : o1(t11.x) && i10.options.relativeXValue ? this.x = i10.autoIncrement(t11.x) : "string" == typeof this.x && (e10 ?? (e10 = i10.chart.time.parse(this.x)), o1(e10) && (this.x = e10)), this.isNull = this.isValid && !this.isValid(), this.formatPrefix = this.isNull ? "null" : "point", this;
  }
  destroy() {
    if (!this.destroyed) {
      let t11 = this, e10 = t11.series, i10 = e10.chart, s10 = e10.options.dataSorting, o10 = i10.hoverPoints, r10 = oj(t11.series.chart.renderer.globalAnimation), a10 = () => {
        for (let e11 in (t11.graphic || t11.graphics || t11.dataLabel || t11.dataLabels) && (o9(t11), t11.destroyElements()), t11) delete t11[e11];
      };
      t11.legendItem && i10.legend.destroyItem(t11), o10 && (t11.setState(), oq(o10, t11), o10.length || (i10.hoverPoints = null)), t11 === i10.hoverPoint && t11.onMouseOut(), s10?.enabled ? (this.animateBeforeDestroy(), o6(a10, r10.duration)) : a10(), i10.pointCount--;
    }
    this.destroyed = true;
  }
  destroyElements(t11) {
    let e10 = this, i10 = e10.getGraphicalProps(t11);
    i10.singular.forEach(function(t12) {
      e10[t12] = e10[t12].destroy();
    }), i10.plural.forEach(function(t12) {
      e10[t12].forEach(function(t13) {
        t13?.element && t13.destroy();
      }), delete e10[t12];
    });
  }
  firePointEvent(t11, e10, i10) {
    let s10 = this, o10 = this.series.options;
    s10.manageEvent(t11), "click" === t11 && o10.allowPointSelect && (i10 = function(t12) {
      !s10.destroyed && s10.select && s10.select(null, t12.ctrlKey || t12.metaKey || t12.shiftKey);
    }), oK(s10, t11, e10, i10);
  }
  getClassName() {
    return "highcharts-point" + (this.selected ? " highcharts-point-select" : "") + (this.negative ? " highcharts-negative" : "") + (this.isNull ? " highcharts-null-point" : "") + (void 0 !== this.colorIndex ? " highcharts-color-" + this.colorIndex : "") + (this.options.className ? " " + this.options.className : "") + (this.zone?.className ? " " + this.zone.className.replace("highcharts-negative", "") : "");
  }
  getGraphicalProps(t11) {
    let e10, i10, s10 = this, o10 = [], r10 = {
      singular: [],
      plural: []
    };
    for ((t11 = t11 || {
      graphic: 1,
      dataLabel: 1
    }).graphic && o10.push("graphic", "connector"), t11.dataLabel && o10.push("dataLabel", "dataLabelPath", "dataLabelUpper"), i10 = o10.length; i10--; ) s10[e10 = o10[i10]] && r10.singular.push(e10);
    return ["graphic", "dataLabel"].forEach(function(e11) {
      let i11 = e11 + "s";
      t11[e11] && s10[i11] && r10.plural.push(i11);
    }), r10;
  }
  getNestedProperty(t11) {
    if (t11) return 0 === t11.indexOf("custom.") ? oJ(t11, this.options) : this[t11];
  }
  getZone() {
    let t11 = this.series, e10 = t11.zones, i10 = t11.zoneAxis || "y", s10, o10 = 0;
    for (s10 = e10[0]; this[i10] >= s10.value; ) s10 = e10[++o10];
    return this.nonZonedColor || (this.nonZonedColor = this.color), s10?.color && !this.options.color ? this.color = s10.color : this.color = this.nonZonedColor, s10;
  }
  hasNewShapeType() {
    return (this.graphic && (this.graphic.symbolName || this.graphic.element.nodeName)) !== this.shapeType;
  }
  isValid() {
    return (o1(this.x) || this.x instanceof Date) && o1(this.y);
  }
  optionsToObject(t11) {
    let e10 = this.series, i10 = e10.options.keys, s10 = i10 || e10.pointArrayMap || ["y"], o10 = s10.length, r10 = {}, a10, n10 = 0, h10 = 0;
    if (o1(t11) || null === t11) r10[s10[0]] = t11;
    else if (oQ(t11)) for (!i10 && t11.length > o10 && ("string" == (a10 = typeof t11[0]) ? e10.xAxis?.dateTime ? r10.x = e10.chart.time.parse(t11[0]) : r10.name = t11[0] : "number" === a10 && (r10.x = t11[0]), n10++); h10 < o10; ) i10 && void 0 === t11[n10] || (s10[h10].indexOf(".") > 0 ? _o8.prototype.setNestedProperty(r10, t11[n10], s10[h10]) : r10[s10[h10]] = t11[n10]), n10++, h10++;
    else "object" == typeof t11 && (r10 = t11, t11.dataLabels && (e10.hasDataLabels = () => true), t11.marker && (e10._hasPointMarkers = true));
    return r10;
  }
  pos(t11, e10 = this.plotY) {
    if (!this.destroyed) {
      let {
        plotX: i10,
        series: s10
      } = this, {
        chart: o10,
        xAxis: r10,
        yAxis: a10
      } = s10, n10 = 0, h10 = 0;
      if (o1(i10) && o1(e10)) return t11 && (n10 = r10 ? r10.pos : o10.plotLeft, h10 = a10 ? a10.pos : o10.plotTop), o10.inverted && r10 && a10 ? [a10.len - e10 + h10, r10.len - i10 + n10] : [i10 + n10, e10 + h10];
    }
  }
  resolveColor() {
    let t11 = this.series, e10 = t11.chart.options.chart, i10 = t11.chart.styledMode, s10, o10, r10 = e10.colorCount, a10;
    delete this.nonZonedColor, t11.options.colorByPoint ? (i10 || (s10 = (o10 = t11.options.colors || t11.chart.options.colors)[t11.colorCounter], r10 = o10.length), a10 = t11.colorCounter, t11.colorCounter++, t11.colorCounter === r10 && (t11.colorCounter = 0)) : (i10 || (s10 = t11.color), a10 = t11.colorIndex), this.colorIndex = o5(this.options.colorIndex, a10), this.color = o5(this.options.color, s10);
  }
  setNestedProperty(t11, e10, i10) {
    return i10.split(".").reduce(function(t12, i11, s10, o10) {
      let r10 = o10.length - 1 === s10;
      return t12[i11] = r10 ? e10 : o2(t12[i11], true) ? t12[i11] : {}, t12[i11];
    }, t11), t11;
  }
  shouldDraw() {
    return !this.isNull;
  }
  tooltipFormatter(t11) {
    let {
      chart: e10,
      pointArrayMap: i10 = ["y"],
      tooltipOptions: s10
    } = this.series, {
      valueDecimals: o10 = "",
      valuePrefix: r10 = "",
      valueSuffix: a10 = ""
    } = s10;
    return e10.styledMode && (t11 = e10.tooltip?.styledModeFormat(t11) || t11), i10.forEach((e11) => {
      e11 = "{point." + e11, (r10 || a10) && (t11 = t11.replace(RegExp(e11 + "}", "g"), r10 + e11 + "}" + a10)), t11 = t11.replace(RegExp(e11 + "}", "g"), e11 + ":,." + o10 + "f}");
    }), o$(t11, this, e10);
  }
  update(t11, e10, i10, s10) {
    let o10, r10 = this, a10 = r10.series, n10 = r10.graphic, h10 = a10.chart, l2 = a10.options;
    function d2() {
      r10.applyOptions(t11);
      let s11 = n10 && r10.hasMockGraphic, d3 = null === r10.y ? !s11 : s11;
      n10 && d3 && (r10.graphic = n10.destroy(), delete r10.hasMockGraphic), o2(t11, true) && (n10?.element && t11 && t11.marker && void 0 !== t11.marker.symbol && (r10.graphic = n10.destroy()), t11?.dataLabels && r10.dataLabel && (r10.dataLabel = r10.dataLabel.destroy())), o10 = r10.index;
      let c2 = {};
      for (let t12 of a10.dataColumnKeys()) c2[t12] = r10[t12];
      a10.dataTable.setRow(c2, o10), l2.data[o10] = o2(l2.data[o10], true) || o2(t11, true) ? r10.options : o5(t11, l2.data[o10]), a10.isDirty = a10.isDirtyData = true, !a10.fixedBox && a10.hasCartesianSeries && (h10.isDirtyBox = true), "point" === l2.legendType && (h10.isDirtyLegend = true), e10 && h10.redraw(i10);
    }
    e10 = o5(e10, true), false === s10 ? d2() : r10.firePointEvent("update", {
      options: t11
    }, d2);
  }
  remove(t11, e10) {
    this.series.removePoint(this.series.data.indexOf(this), t11, e10);
  }
  select(t11, e10) {
    let i10 = this, s10 = i10.series, o10 = s10.chart;
    t11 = o5(t11, !i10.selected), this.selectedStaging = t11, i10.firePointEvent(t11 ? "select" : "unselect", {
      accumulate: e10
    }, function() {
      i10.selected = i10.options.selected = t11, s10.options.data[s10.data.indexOf(i10)] = i10.options, i10.setState(t11 && "select"), e10 || o10.getSelectedPoints().forEach(function(t12) {
        let e11 = t12.series;
        t12.selected && t12 !== i10 && (t12.selected = t12.options.selected = false, e11.options.data[e11.data.indexOf(t12)] = t12.options, t12.setState(o10.hoverPoints && e11.options.inactiveOtherPoints ? "inactive" : ""), t12.firePointEvent("unselect"));
      });
    }), delete this.selectedStaging;
  }
  onMouseOver(t11) {
    let {
      inverted: e10,
      pointer: i10
    } = this.series.chart;
    i10 && (t11 = t11 ? i10.normalize(t11) : i10.getChartCoordinatesFromPoint(this, e10), i10.runPointActions(t11, this));
  }
  onMouseOut() {
    let t11 = this.series.chart;
    this.firePointEvent("mouseOut"), this.series.options.inactiveOtherPoints || (t11.hoverPoints || []).forEach(function(t12) {
      t12.setState();
    }), t11.hoverPoints = t11.hoverPoint = null;
  }
  manageEvent(t11) {
    let e10 = o3(this.series.options.point, this.options), i10 = e10.events?.[t11];
    o0(i10) && (!this.hcEvents?.[t11] || this.hcEvents?.[t11]?.map((t12) => t12.fn).indexOf(i10) === -1) ? (this.importedUserEvent?.(), this.importedUserEvent = oV(this, t11, i10), this.hcEvents && (this.hcEvents[t11].userEvent = true)) : this.importedUserEvent && !i10 && this.hcEvents?.[t11] && this.hcEvents?.[t11].userEvent && (o9(this, t11), delete this.hcEvents[t11], Object.keys(this.hcEvents) || delete this.importedUserEvent);
  }
  setState(t11, e10) {
    let i10 = this.series, s10 = this.state, o10 = i10.options.states[t11 || "normal"] || {}, r10 = oU.plotOptions[i10.type].marker && i10.options.marker, a10 = r10 && false === r10.enabled, n10 = r10?.states?.[t11 || "normal"] || {}, h10 = false === n10.enabled, l2 = this.marker || {}, d2 = i10.chart, c2 = r10 && i10.markerAttribs, p2 = i10.halo, g2, u2, f2, m2 = i10.stateMarkerGraphic, x2;
    if ((t11 = t11 || "") === this.state && !e10 || this.selected && "select" !== t11 || false === o10.enabled || t11 && (h10 || a10 && false === n10.enabled) || t11 && l2.states && l2.states[t11] && false === l2.states[t11].enabled) return;
    if (this.state = t11, c2 && (g2 = i10.markerAttribs(this, t11)), this.graphic && !this.hasMockGraphic) {
      if (s10 && this.graphic.removeClass("highcharts-point-" + s10), t11 && this.graphic.addClass("highcharts-point-" + t11), !d2.styledMode) {
        u2 = i10.pointAttribs(this, t11), f2 = o5(d2.options.chart.animation, o10.animation);
        let e11 = u2.opacity;
        i10.options.inactiveOtherPoints && o1(e11) && (this.dataLabels || []).forEach(function(t12) {
          t12 && !t12.hasClass("highcharts-data-label-hidden") && (t12.animate({
            opacity: e11
          }, f2), t12.connector && t12.connector.animate({
            opacity: e11
          }, f2));
        }), this.graphic.animate(u2, f2);
      }
      g2 && this.graphic.animate(g2, o5(d2.options.chart.animation, n10.animation, r10.animation)), m2 && m2.hide();
    } else t11 && n10 && (x2 = l2.symbol || i10.symbol, m2 && m2.currentSymbol !== x2 && (m2 = m2.destroy()), g2 && (m2 ? m2[e10 ? "animate" : "attr"]({
      x: g2.x,
      y: g2.y
    }) : x2 && (i10.stateMarkerGraphic = m2 = d2.renderer.symbol(x2, g2.x, g2.y, g2.width, g2.height, o3(r10, n10)).add(i10.markerGroup), m2.currentSymbol = x2)), !d2.styledMode && m2 && "inactive" !== this.state && m2.attr(i10.pointAttribs(this, t11))), m2 && (m2[t11 && this.isInside ? "show" : "hide"](), m2.element.point = this, m2.addClass(this.getClassName(), true));
    let y2 = o10.halo, b2 = this.graphic || m2, v2 = b2?.visibility || "inherit";
    y2?.size && b2 && "hidden" !== v2 && !this.isCluster ? (p2 || (i10.halo = p2 = d2.renderer.path().add(b2.parentGroup)), p2.show()[e10 ? "animate" : "attr"]({
      d: this.haloPath(y2.size)
    }), p2.attr({
      class: "highcharts-halo highcharts-color-" + o5(this.colorIndex, i10.colorIndex) + (this.className ? " " + this.className : ""),
      visibility: v2,
      zIndex: -1
    }), p2.point = this, d2.styledMode || p2.attr(o_({
      fill: this.color || i10.color,
      "fill-opacity": y2.opacity
    }, en.filterUserAttributes(y2.attributes || {})))) : p2?.point?.haloPath && !p2.point.destroyed && p2.animate({
      d: p2.point.haloPath(0)
    }, null, p2.hide), oK(this, "afterSetState", {
      state: t11
    });
  }
  haloPath(t11) {
    let e10 = this.pos();
    return e10 ? this.series.chart.renderer.symbols.circle(oZ(e10[0], 1) - t11, e10[1] - t11, 2 * t11, 2 * t11) : [];
  }
};
var o7 = o8;
var {
  parse: rt
} = tG;
var {
  charts: re,
  composed: ri,
  isTouchDevice: rs
} = N;
var {
  addEvent: ro,
  attr: rr,
  css: ra,
  extend: rn,
  find: rh,
  fireEvent: rl,
  isNumber: rd,
  isObject: rc,
  objectEach: rp,
  offset: rg,
  pick: ru,
  pushUnique: rf,
  splat: rm
} = ta;
var rx = class _rx {
  applyInactiveState(t11 = []) {
    let e10 = [];
    for (let i10 of (t11.forEach((t12) => {
      let i11 = t12.series;
      e10.push(i11), i11.linkedParent && e10.push(i11.linkedParent), i11.linkedSeries && e10.push.apply(e10, i11.linkedSeries), i11.navigatorSeries && e10.push(i11.navigatorSeries), i11.boosted && i11.markerGroup && e10.push.apply(e10, this.chart.series.filter((t13) => t13.markerGroup === i11.markerGroup));
    }), this.chart.series)) {
      let t12 = i10.options;
      t12.states?.inactive?.enabled !== false && (-1 === e10.indexOf(i10) ? i10.setState("inactive", true) : t12.inactiveOtherPoints && i10.setAllPointsToState("inactive"));
    }
  }
  destroy() {
    let t11 = this;
    this.eventsToUnbind.forEach((t12) => t12()), this.eventsToUnbind = [], !N.chartCount && (_rx.unbindDocumentMouseUp.forEach((t12) => t12.unbind()), _rx.unbindDocumentMouseUp.length = 0, _rx.unbindDocumentTouchEnd && (_rx.unbindDocumentTouchEnd = _rx.unbindDocumentTouchEnd())), rp(t11, function(e10, i10) {
      t11[i10] = void 0;
    });
  }
  getSelectionMarkerAttrs(t11, e10) {
    let i10 = {
      args: {
        chartX: t11,
        chartY: e10
      },
      attrs: {},
      shapeType: "rect"
    };
    return rl(this, "getSelectionMarkerAttrs", i10, (i11) => {
      let s10, {
        chart: o10,
        zoomHor: r10,
        zoomVert: a10
      } = this, {
        mouseDownX: n10 = 0,
        mouseDownY: h10 = 0
      } = o10, l2 = i11.attrs;
      l2.x = o10.plotLeft, l2.y = o10.plotTop, l2.width = r10 ? 1 : o10.plotWidth, l2.height = a10 ? 1 : o10.plotHeight, r10 && (l2.width = Math.max(1, Math.abs(s10 = t11 - n10)), l2.x = (s10 > 0 ? 0 : s10) + n10), a10 && (l2.height = Math.max(1, Math.abs(s10 = e10 - h10)), l2.y = (s10 > 0 ? 0 : s10) + h10);
    }), i10;
  }
  drag(t11) {
    let {
      chart: e10
    } = this, {
      mouseDownX: i10 = 0,
      mouseDownY: s10 = 0
    } = e10, {
      panning: o10,
      panKey: r10,
      selectionMarkerFill: a10
    } = e10.options.chart, n10 = e10.plotLeft, h10 = e10.plotTop, l2 = e10.plotWidth, d2 = e10.plotHeight, c2 = rc(o10) ? o10.enabled : o10, p2 = r10 && t11[`${r10}Key`], g2 = t11.chartX, u2 = t11.chartY, f2, m2 = this.selectionMarker;
    if ((!m2 || !m2.touch) && (g2 < n10 ? g2 = n10 : g2 > n10 + l2 && (g2 = n10 + l2), u2 < h10 ? u2 = h10 : u2 > h10 + d2 && (u2 = h10 + d2), this.hasDragged = Math.sqrt(Math.pow(i10 - g2, 2) + Math.pow(s10 - u2, 2)), this.hasDragged > 10)) {
      f2 = e10.isInsidePlot(i10 - n10, s10 - h10, {
        visiblePlotOnly: true
      });
      let {
        shapeType: r11,
        attrs: l3
      } = this.getSelectionMarkerAttrs(g2, u2);
      this.hasZoom && f2 && !p2 && !m2 && (this.selectionMarker = m2 = e10.renderer[r11](), m2.attr({
        class: "highcharts-selection-marker",
        zIndex: 7
      }).add(), e10.styledMode || m2.attr({
        fill: a10 || rt("#334eff").setOpacity(0.25).get()
      })), m2 && m2.attr(l3), f2 && !m2 && c2 && e10.pan(t11, o10);
    }
  }
  dragStart(t11) {
    let e10 = this.chart;
    e10.mouseIsDown = t11.type, e10.cancelClick = false, e10.mouseDownX = t11.chartX, e10.mouseDownY = t11.chartY;
  }
  getSelectionBox(t11) {
    let e10 = {
      args: {
        marker: t11
      },
      result: t11.getBBox()
    };
    return rl(this, "getSelectionBox", e10), e10.result;
  }
  drop(t11) {
    let e10, {
      chart: i10,
      selectionMarker: s10
    } = this;
    for (let t12 of i10.axes) t12.isPanning && (t12.isPanning = false, (t12.options.startOnTick || t12.options.endOnTick || t12.series.some((t13) => t13.boosted)) && (t12.forceRedraw = true, t12.setExtremes(t12.userMin, t12.userMax, false), e10 = true));
    if (e10 && i10.redraw(), s10 && t11) {
      if (this.hasDragged) {
        let e11 = this.getSelectionBox(s10);
        i10.transform({
          axes: i10.axes.filter((t12) => t12.zoomEnabled && ("xAxis" === t12.coll && this.zoomX || "yAxis" === t12.coll && this.zoomY)),
          selection: __spreadValues({
            originalEvent: t11,
            xAxis: [],
            yAxis: []
          }, e11),
          from: e11
        });
      }
      rd(i10.index) && (this.selectionMarker = s10.destroy());
    }
    i10 && rd(i10.index) && (ra(i10.container, {
      cursor: i10._cursor
    }), i10.cancelClick = this.hasDragged > 10, i10.mouseIsDown = false, this.hasDragged = 0, this.pinchDown = [], this.hasPinchMoved = false);
  }
  findNearestKDPoint(t11, e10, i10) {
    let s10;
    return t11.forEach(function(t12) {
      var o10;
      let r10, a10, n10, h10 = !(t12.noSharedTooltip && e10) && 0 > t12.options.findNearestPointBy.indexOf("y"), l2 = t12.searchPoint(i10, h10);
      rc(l2, true) && l2.series && (!rc(s10, true) || (r10 = (o10 = s10).distX - l2.distX, a10 = o10.dist - l2.dist, n10 = l2.series.group?.zIndex - o10.series.group?.zIndex, (0 !== r10 && e10 ? r10 : 0 !== a10 ? a10 : 0 !== n10 ? n10 : o10.series.index > l2.series.index ? -1 : 1) > 0)) && (s10 = l2);
    }), s10;
  }
  getChartCoordinatesFromPoint(t11, e10) {
    let {
      xAxis: i10,
      yAxis: s10
    } = t11.series, o10 = t11.shapeArgs;
    if (i10 && s10) {
      let r10 = t11.clientX ?? t11.plotX ?? 0, a10 = t11.plotY || 0;
      return t11.isNode && o10 && rd(o10.x) && rd(o10.y) && (r10 = o10.x, a10 = o10.y), e10 ? {
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
      container: t11
    } = this.chart, e10 = rg(t11);
    this.chartPosition = {
      left: e10.left,
      top: e10.top,
      scaleX: 1,
      scaleY: 1
    };
    let {
      offsetHeight: i10,
      offsetWidth: s10
    } = t11;
    return s10 > 2 && i10 > 2 && (this.chartPosition.scaleX = e10.width / s10, this.chartPosition.scaleY = e10.height / i10), this.chartPosition;
  }
  getCoordinates(t11) {
    let e10 = {
      xAxis: [],
      yAxis: []
    };
    for (let i10 of this.chart.axes) e10[i10.isXAxis ? "xAxis" : "yAxis"].push({
      axis: i10,
      value: i10.toValue(t11[i10.horiz ? "chartX" : "chartY"])
    });
    return e10;
  }
  getHoverData(t11, e10, i10, s10, o10, r10) {
    let a10 = [], n10 = function(t12) {
      return t12.visible && !(!o10 && t12.directTouch) && ru(t12.options.enableMouseTracking, true);
    }, h10 = e10, l2, d2 = {
      chartX: r10 ? r10.chartX : void 0,
      chartY: r10 ? r10.chartY : void 0,
      shared: o10
    };
    rl(this, "beforeGetHoverData", d2), l2 = h10 && !h10.stickyTracking ? [h10] : i10.filter((t12) => t12.stickyTracking && (d2.filter || n10)(t12));
    let c2 = s10 && t11 || !r10 ? t11 : this.findNearestKDPoint(l2, o10, r10);
    return h10 = c2?.series, c2 && (o10 && !h10.noSharedTooltip ? (l2 = i10.filter(function(t12) {
      return d2.filter ? d2.filter(t12) : n10(t12) && !t12.noSharedTooltip;
    })).forEach(function(t12) {
      let e11 = t12.options?.nullInteraction, i11 = rh(t12.points, function(t13) {
        return t13.x === c2.x && (!t13.isNull || !!e11);
      });
      rc(i11) && (t12.boosted && t12.boost && (i11 = t12.boost.getPoint(i11)), a10.push(i11));
    }) : a10.push(c2)), rl(this, "afterGetHoverData", d2 = {
      hoverPoint: c2
    }), {
      hoverPoint: d2.hoverPoint,
      hoverSeries: h10,
      hoverPoints: a10
    };
  }
  getPointFromEvent(t11) {
    let e10 = t11.target, i10;
    for (; e10 && !i10; ) i10 = e10.point, e10 = e10.parentNode;
    return i10;
  }
  onTrackerMouseOut(t11) {
    let e10 = this.chart, i10 = t11.relatedTarget, s10 = e10.hoverSeries;
    this.isDirectTouch = false, !s10 || !i10 || s10.stickyTracking || this.inClass(i10, "highcharts-tooltip") || this.inClass(i10, "highcharts-series-" + s10.index) && this.inClass(i10, "highcharts-tracker") || s10.onMouseOut();
  }
  inClass(t11, e10) {
    let i10 = t11, s10;
    for (; i10; ) {
      if (s10 = rr(i10, "class")) {
        if (-1 !== s10.indexOf(e10)) return true;
        if (-1 !== s10.indexOf("highcharts-container")) return false;
      }
      i10 = i10.parentElement;
    }
  }
  constructor(t11, e10) {
    this.hasDragged = 0, this.pointerCaptureEventsToUnbind = [], this.eventsToUnbind = [], this.options = e10, this.chart = t11, this.runChartClick = !!e10.chart.events?.click, this.pinchDown = [], this.setDOMEvents(), rl(this, "afterInit");
  }
  normalize(t11, e10) {
    let i10 = t11.touches, s10 = i10 ? i10.length ? i10.item(0) : ru(i10.changedTouches, t11.changedTouches)[0] : t11;
    e10 || (e10 = this.getChartPosition());
    let o10 = s10.pageX - e10.left, r10 = s10.pageY - e10.top;
    return rn(t11, {
      chartX: Math.round(o10 /= e10.scaleX),
      chartY: Math.round(r10 /= e10.scaleY)
    });
  }
  onContainerClick(t11) {
    let e10 = this.chart, i10 = e10.hoverPoint, s10 = this.normalize(t11), o10 = e10.plotLeft, r10 = e10.plotTop;
    !e10.cancelClick && (i10 && this.inClass(s10.target, "highcharts-tracker") ? (rl(i10.series, "click", rn(s10, {
      point: i10
    })), e10.hoverPoint && i10.firePointEvent("click", s10)) : (rn(s10, this.getCoordinates(s10)), e10.isInsidePlot(s10.chartX - o10, s10.chartY - r10, {
      visiblePlotOnly: true
    }) && rl(e10, "click", s10)));
  }
  onContainerMouseDown(t11) {
    let e10 = (1 & (t11.buttons || t11.button)) == 1;
    t11 = this.normalize(t11), N.isFirefox && 0 !== t11.button && this.onContainerMouseMove(t11), (void 0 === t11.button || e10) && (this.zoomOption(t11), e10 && t11.preventDefault?.(), this.dragStart(t11));
  }
  onContainerMouseLeave(t11) {
    let {
      pointer: e10
    } = re[ru(_rx.hoverChartIndex, -1)] || {};
    t11 = this.normalize(t11), this.onContainerMouseMove(t11), e10 && !this.inClass(t11.relatedTarget, "highcharts-tooltip") && (e10.reset(), e10.chartPosition = void 0);
  }
  onContainerMouseEnter() {
    delete this.chartPosition;
  }
  onContainerMouseMove(t11) {
    let e10 = this.chart, i10 = e10.tooltip, s10 = this.normalize(t11);
    this.setHoverChartIndex(t11), ("mousedown" === e10.mouseIsDown || this.touchSelect(s10)) && this.drag(s10), !e10.exporting?.openMenu && (this.inClass(s10.target, "highcharts-tracker") || e10.isInsidePlot(s10.chartX - e10.plotLeft, s10.chartY - e10.plotTop, {
      visiblePlotOnly: true
    })) && !i10?.shouldStickOnContact(s10) && (this.inClass(s10.target, "highcharts-no-tooltip") ? this.reset(false, 0) : this.runPointActions(s10));
  }
  onDocumentTouchEnd(t11) {
    this.onDocumentMouseUp(t11);
  }
  onContainerTouchMove(t11) {
    this.touchSelect(t11) ? this.onContainerMouseMove(t11) : this.touch(t11);
  }
  onContainerTouchStart(t11) {
    this.touchSelect(t11) ? this.onContainerMouseDown(t11) : (this.zoomOption(t11), this.touch(t11, true));
  }
  onDocumentMouseMove(t11) {
    let e10 = this.chart, i10 = e10.tooltip, s10 = this.chartPosition, o10 = this.normalize(t11, s10);
    !s10 || e10.isInsidePlot(o10.chartX - e10.plotLeft, o10.chartY - e10.plotTop, {
      visiblePlotOnly: true
    }) || i10?.shouldStickOnContact(o10) || o10.target !== e10.container.ownerDocument && this.inClass(o10.target, "highcharts-tracker") || this.reset();
  }
  onDocumentMouseUp(t11) {
    t11?.touches && this.hasPinchMoved && t11?.preventDefault?.(), re[ru(_rx.hoverChartIndex, -1)]?.pointer?.drop(t11);
  }
  pinch(t11) {
    let e10 = this, {
      chart: i10,
      hasZoom: s10,
      lastTouches: o10
    } = e10, r10 = [].map.call(t11.touches || [], (t12) => e10.normalize(t12)), a10 = r10.length, n10 = 1 === a10 && (e10.inClass(t11.target, "highcharts-tracker") && i10.runTrackerClick || e10.runChartClick), h10 = i10.tooltip, l2 = 1 === a10 && ru(h10?.options.followTouchMove, true);
    a10 > 1 ? e10.initiated = true : l2 && (e10.initiated = false), s10 && e10.initiated && !n10 && false !== t11.cancelable && t11.preventDefault(), "touchstart" === t11.type ? (e10.pinchDown = r10, e10.res = true, i10.mouseDownX = t11.chartX) : l2 ? this.runPointActions(e10.normalize(t11)) : o10 && (rl(i10, "touchpan", {
      originalEvent: t11,
      touches: r10
    }, () => {
      let e11 = (t12) => {
        let e12 = t12[0], i11 = t12[1] || e12;
        return {
          x: e12.chartX,
          y: e12.chartY,
          width: i11.chartX - e12.chartX,
          height: i11.chartY - e12.chartY
        };
      };
      i10.transform({
        axes: i10.axes.filter((t12) => t12.zoomEnabled && (this.zoomHor && t12.horiz || this.zoomVert && !t12.horiz)),
        to: e11(r10),
        from: e11(o10),
        trigger: t11.type
      });
    }), e10.res && (e10.res = false, this.reset(false, 0))), e10.lastTouches = r10;
  }
  reset(t11, e10) {
    let i10 = this.chart, s10 = i10.hoverSeries, o10 = i10.hoverPoint, r10 = i10.hoverPoints, a10 = i10.tooltip, n10 = a10?.shared ? r10 : o10;
    t11 && n10 && rm(n10).forEach(function(e11) {
      e11.series.isCartesian && void 0 === e11.plotX && (t11 = false);
    }), t11 ? a10 && n10 && rm(n10).length && (a10.refresh(n10), a10.shared && r10 ? r10.forEach(function(t12) {
      t12.setState(t12.state, true), t12.series.isCartesian && (t12.series.xAxis.crosshair && t12.series.xAxis.drawCrosshair(null, t12), t12.series.yAxis.crosshair && t12.series.yAxis.drawCrosshair(null, t12));
    }) : o10 && (o10.setState(o10.state, true), i10.axes.forEach(function(t12) {
      t12.crosshair && o10.series[t12.coll] === t12 && t12.drawCrosshair(null, o10);
    }))) : (o10 && o10.onMouseOut(), r10 && r10.forEach(function(t12) {
      t12.setState();
    }), s10 && s10.onMouseOut(), a10 && a10.hide(e10), this.unDocMouseMove && (this.unDocMouseMove = this.unDocMouseMove()), i10.axes.forEach(function(t12) {
      t12.hideCrosshair();
    }), i10.hoverPoints = i10.hoverPoint = void 0);
  }
  runPointActions(t11, e10, i10) {
    let s10 = this.chart, o10 = s10.series, r10 = s10.tooltip?.options.enabled ? s10.tooltip : void 0, a10 = !!r10 && r10.shared, n10 = e10 || s10.hoverPoint, h10 = n10?.series || s10.hoverSeries, l2 = (!t11 || "touchmove" !== t11.type) && (!!e10 || h10?.directTouch && this.isDirectTouch), d2 = this.getHoverData(n10, h10, o10, l2, a10, t11);
    n10 = d2.hoverPoint, h10 = d2.hoverSeries;
    let c2 = d2.hoverPoints, p2 = h10?.tooltipOptions.followPointer && !h10.tooltipOptions.split, g2 = a10 && h10 && !h10.noSharedTooltip;
    if (n10 && (i10 || n10 !== s10.hoverPoint || r10?.isHidden)) {
      if ((s10.hoverPoints || []).forEach(function(t12) {
        -1 === c2.indexOf(t12) && t12.setState();
      }), s10.hoverSeries !== h10 && h10.onMouseOver(), this.applyInactiveState(c2), (c2 || []).forEach(function(t12) {
        t12.setState("hover");
      }), s10.hoverPoint && s10.hoverPoint.firePointEvent("mouseOut"), !n10.series) return;
      s10.hoverPoints = c2, s10.hoverPoint = n10, n10.firePointEvent("mouseOver", void 0, () => {
        r10 && n10 && r10.refresh(g2 ? c2 : n10, t11);
      });
    } else if (p2 && r10 && !r10.isHidden) {
      let e11 = r10.getAnchor([{}], t11);
      s10.isInsidePlot(e11[0], e11[1], {
        visiblePlotOnly: true
      }) && r10.updatePosition({
        plotX: e11[0],
        plotY: e11[1]
      });
    }
    this.unDocMouseMove || (this.unDocMouseMove = ro(s10.container.ownerDocument, "mousemove", (t12) => re[_rx.hoverChartIndex ?? -1]?.pointer?.onDocumentMouseMove(t12)), this.eventsToUnbind.push(this.unDocMouseMove)), s10.axes.forEach(function(e11) {
      let i11, o11 = e11.crosshair?.snap ?? true;
      o11 && ((i11 = s10.hoverPoint) && i11.series[e11.coll] === e11 || (i11 = rh(c2, (t12) => t12.series?.[e11.coll] === e11))), i11 || !o11 ? e11.drawCrosshair(t11, i11) : e11.hideCrosshair();
    });
  }
  setDOMEvents() {
    let t11 = this.chart.container, e10 = t11.ownerDocument, i10 = (t12) => t12.parentElement || t12.getRootNode()?.host?.parentElement;
    t11.onmousedown = this.onContainerMouseDown.bind(this), t11.onmousemove = this.onContainerMouseMove.bind(this), t11.onclick = this.onContainerClick.bind(this), this.eventsToUnbind.push(ro(t11, "mouseenter", this.onContainerMouseEnter.bind(this)), ro(t11, "mouseleave", this.onContainerMouseLeave.bind(this))), _rx.unbindDocumentMouseUp.some((t12) => t12.doc === e10) || _rx.unbindDocumentMouseUp.push({
      doc: e10,
      unbind: ro(e10, "mouseup", this.onDocumentMouseUp.bind(this))
    });
    let s10 = i10(this.chart.renderTo);
    for (; s10 && "BODY" !== s10.tagName; ) this.eventsToUnbind.push(ro(s10, "scroll", () => {
      delete this.chartPosition;
    })), s10 = i10(s10);
    this.eventsToUnbind.push(ro(t11, "touchstart", this.onContainerTouchStart.bind(this), {
      passive: false
    }), ro(t11, "touchmove", this.onContainerTouchMove.bind(this), {
      passive: false
    })), _rx.unbindDocumentTouchEnd || (_rx.unbindDocumentTouchEnd = ro(e10, "touchend", this.onDocumentTouchEnd.bind(this), {
      passive: false
    })), this.setPointerCapture(), ro(this.chart, "redraw", this.setPointerCapture.bind(this));
  }
  setPointerCapture() {
    if (!rs) return;
    let t11 = this.pointerCaptureEventsToUnbind, e10 = this.chart, i10 = e10.container, s10 = ru(e10.options.tooltip?.followTouchMove, true) && e10.series.some((t12) => t12.options.findNearestPointBy.indexOf("y") > -1);
    !this.hasPointerCapture && s10 ? (t11.push(ro(i10, "pointerdown", (t12) => {
      t12.target?.hasPointerCapture(t12.pointerId) && t12.target?.releasePointerCapture(t12.pointerId);
    }), ro(i10, "pointermove", (t12) => {
      e10.pointer?.getPointFromEvent(t12)?.onMouseOver(t12);
    })), e10.styledMode || ra(i10, {
      "touch-action": "none"
    }), i10.className += " highcharts-no-touch-action", this.hasPointerCapture = true) : this.hasPointerCapture && !s10 && (t11.forEach((t12) => t12()), t11.length = 0, e10.styledMode || ra(i10, {
      "touch-action": ru(e10.options.chart.style?.["touch-action"], "manipulation")
    }), i10.className = i10.className.replace(" highcharts-no-touch-action", ""), this.hasPointerCapture = false);
  }
  setHoverChartIndex(t11) {
    let e10 = this.chart, i10 = N.charts[ru(_rx.hoverChartIndex, -1)];
    if (i10 && i10 !== e10) {
      let s10 = {
        relatedTarget: e10.container
      };
      t11 && !t11?.relatedTarget && Object.assign({}, t11, s10), i10.pointer?.onContainerMouseLeave(t11 || s10);
    }
    i10?.mouseIsDown || (_rx.hoverChartIndex = e10.index);
  }
  touch(t11, e10) {
    let i10, {
      chart: s10,
      pinchDown: o10 = []
    } = this;
    this.setHoverChartIndex(), 1 === (t11 = this.normalize(t11)).touches.length ? s10.isInsidePlot(t11.chartX - s10.plotLeft, t11.chartY - s10.plotTop, {
      visiblePlotOnly: true
    }) && !s10.exporting?.openMenu ? (e10 && this.runPointActions(t11), "touchmove" === t11.type && (this.hasPinchMoved = i10 = !!o10[0] && Math.pow(o10[0].chartX - t11.chartX, 2) + Math.pow(o10[0].chartY - t11.chartY, 2) >= 16), ru(i10, true) && this.pinch(t11)) : e10 && this.reset() : 2 === t11.touches.length && this.pinch(t11);
  }
  touchSelect(t11) {
    return !!(this.chart.zooming.singleTouch && t11.touches && 1 === t11.touches.length);
  }
  zoomOption(t11) {
    let e10 = this.chart, i10 = e10.inverted, s10 = e10.zooming.type || "", o10, r10;
    /touch/.test(t11.type) && (s10 = ru(e10.zooming.pinchType, s10)), this.zoomX = o10 = /x/.test(s10), this.zoomY = r10 = /y/.test(s10), this.zoomHor = o10 && !i10 || r10 && i10, this.zoomVert = r10 && !i10 || o10 && i10, this.hasZoom = o10 || r10;
  }
};
rx.unbindDocumentMouseUp = [], (d = rx || (rx = {})).compose = function(t11) {
  rf(ri, "Core.Pointer") && ro(t11, "beforeRender", function() {
    this.pointer = new d(this, this.options);
  });
};
var ry = rx;
(c = S || (S = {})).setLength = function(t11, e10, i10) {
  return Array.isArray(t11) ? (t11.length = e10, t11) : t11[i10 ? "subarray" : "slice"](0, e10);
}, c.splice = function(t11, e10, i10, s10, o10 = []) {
  if (Array.isArray(t11)) return Array.isArray(o10) || (o10 = Array.from(o10)), {
    removed: t11.splice(e10, i10, ...o10),
    array: t11
  };
  let r10 = Object.getPrototypeOf(t11).constructor, a10 = t11[s10 ? "subarray" : "slice"](e10, e10 + i10), n10 = new r10(t11.length - i10 + o10.length);
  return n10.set(t11.subarray(0, e10), 0), n10.set(o10, e10), n10.set(t11.subarray(e10 + i10), e10 + o10.length), {
    removed: a10,
    array: n10
  };
}, c.convertToNumber = function(t11, e10) {
  switch (typeof t11) {
    case "boolean":
      return +!!t11;
    case "number":
      return isNaN(t11) && !e10 ? null : t11;
    default:
      return isNaN(t11 = parseFloat(`${t11 ?? ""}`)) && !e10 ? null : t11;
  }
};
var {
  setLength: rb,
  splice: rv
} = S;
var {
  fireEvent: rk,
  objectEach: rM,
  uniqueKey: rw
} = ta;
var rS = class {
  constructor(t11 = {}) {
    this.autoId = !t11.id, this.columns = {}, this.id = t11.id || rw(), this.rowCount = 0, this.versionTag = rw();
    let e10 = 0;
    rM(t11.columns || {}, (t12, i10) => {
      this.columns[i10] = t12.slice(), e10 = Math.max(e10, t12.length);
    }), this.applyRowCount(e10);
  }
  applyRowCount(t11) {
    this.rowCount = t11, rM(this.columns, (e10, i10) => {
      e10.length !== t11 && (this.columns[i10] = rb(e10, t11));
    });
  }
  deleteRows(t11, e10 = 1) {
    if (e10 > 0 && t11 < this.rowCount) {
      let i10 = 0;
      rM(this.columns, (s10, o10) => {
        this.columns[o10] = rv(s10, t11, e10).array, i10 = s10.length;
      }), this.rowCount = i10;
    }
    rk(this, "afterDeleteRows", {
      rowIndex: t11,
      rowCount: e10
    }), this.versionTag = rw();
  }
  getColumn(t11, e10) {
    return this.columns[t11];
  }
  getColumns(t11, e10) {
    return (t11 || Object.keys(this.columns)).reduce((t12, e11) => (t12[e11] = this.columns[e11], t12), {});
  }
  getRow(t11, e10) {
    return (e10 || Object.keys(this.columns)).map((e11) => this.columns[e11]?.[t11]);
  }
  setColumn(t11, e10 = [], i10 = 0, s10) {
    this.setColumns({
      [t11]: e10
    }, i10, s10);
  }
  setColumns(t11, e10, i10) {
    let s10 = this.rowCount;
    rM(t11, (t12, e11) => {
      this.columns[e11] = t12.slice(), s10 = t12.length;
    }), this.applyRowCount(s10), i10?.silent || (rk(this, "afterSetColumns"), this.versionTag = rw());
  }
  setRow(t11, e10 = this.rowCount, i10, s10) {
    let {
      columns: o10
    } = this, r10 = i10 ? this.rowCount + 1 : e10 + 1, a10 = Object.keys(t11);
    if (s10?.addColumns !== false) for (let t12 = 0, e11 = a10.length; t12 < e11; t12++) {
      let e12 = a10[t12];
      o10[e12] || (o10[e12] = []);
    }
    rM(o10, (a11, n10) => {
      a11 || s10?.addColumns === false || (a11 = Array(r10)), a11 && (i10 ? a11 = rv(a11, e10, 0, true, [t11[n10] ?? null]).array : a11[e10] = t11[n10] ?? null, o10[n10] = a11);
    }), r10 > this.rowCount && this.applyRowCount(r10), s10?.silent || (rk(this, "afterSetRows"), this.versionTag = rw());
  }
  getModified() {
    return this.modified || this;
  }
};
var {
  extend: rT,
  merge: rC,
  pick: rA
} = ta;
var rP = T || (T = {});
function rL(t11, e10, i10) {
  let s10 = this.legendItem = this.legendItem || {}, {
    chart: o10,
    options: r10
  } = this, {
    baseline: a10 = 0,
    symbolWidth: n10,
    symbolHeight: h10
  } = t11, l2 = this.symbol || "circle", d2 = h10 / 2, c2 = o10.renderer, p2 = s10.group, g2 = a10 - Math.round((t11.fontMetrics?.b || h10) * (i10 ? 0.4 : 0.3)), u2 = {}, f2, m2 = r10.marker, x2 = 0;
  if (o10.styledMode || (u2["stroke-width"] = Math.min(r10.lineWidth || 0, 24), r10.dashStyle ? u2.dashstyle = r10.dashStyle : "square" !== r10.linecap && (u2["stroke-linecap"] = "round")), s10.line = c2.path().addClass("highcharts-graph").attr(u2).add(p2), i10 && (s10.area = c2.path().addClass("highcharts-area").add(p2)), u2["stroke-linecap"] && (x2 = Math.min(s10.line.strokeWidth(), n10) / 2), n10) {
    let t12 = [["M", x2, g2], ["L", n10 - x2, g2]];
    s10.line.attr({
      d: t12
    }), s10.area?.attr({
      d: [...t12, ["L", n10 - x2, a10], ["L", x2, a10]]
    });
  }
  if (m2 && false !== m2.enabled && n10) {
    let t12 = Math.min(rA(m2.radius, d2), d2);
    0 === l2.indexOf("url") && (m2 = rC(m2, {
      width: h10,
      height: h10
    }), t12 = 0), s10.symbol = f2 = c2.symbol(l2, n10 / 2 - t12, g2 - t12, 2 * t12, 2 * t12, rT({
      context: "legend"
    }, m2)).addClass("highcharts-point").add(p2), f2.isMarker = true;
  }
}
rP.areaMarker = function(t11, e10) {
  rL.call(this, t11, e10, true);
}, rP.lineMarker = rL, rP.rectangle = function(t11, e10) {
  let i10 = e10.legendItem || {}, s10 = t11.options, o10 = t11.symbolHeight, r10 = s10.squareSymbol, a10 = r10 ? o10 : t11.symbolWidth;
  i10.symbol = this.chart.renderer.rect(r10 ? (t11.symbolWidth - o10) / 2 : 0, t11.baseline - o10 + 1, a10, o10, rA(t11.options.symbolRadius, o10 / 2)).addClass("highcharts-point").attr({
    zIndex: 3
  }).add(i10.group);
};
var rO = T;
var {
  defaultOptions: rE
} = tI;
var {
  extend: rI,
  extendClass: rD,
  merge: rB
} = ta;
var rN = C || (C = {});
function rz(t11, e10) {
  let i10 = rE.plotOptions || {}, s10 = e10.defaultOptions, o10 = e10.prototype;
  return o10.type = t11, o10.pointClass || (o10.pointClass = o7), !rN.seriesTypes[t11] && (s10 && (i10[t11] = s10), rN.seriesTypes[t11] = e10, true);
}
rN.seriesTypes = N.seriesTypes, rN.registerSeriesType = rz, rN.seriesType = function(t11, e10, i10, s10, o10) {
  let r10 = rE.plotOptions || {};
  if (e10 = e10 || "", r10[t11] = rB(r10[e10], i10), delete rN.seriesTypes[t11], rz(t11, rD(rN.seriesTypes[e10] || N.Series, s10)), rN.seriesTypes[t11].prototype.type = t11, o10) {
    class e11 extends o7 {
    }
    rI(e11.prototype, o10), rN.seriesTypes[t11].prototype.pointClass = e11;
  }
  return rN.seriesTypes[t11];
};
var rR = C;
var {
  animObject: rW,
  setAnimation: rX
} = t3;
var {
  defaultOptions: rF
} = tI;
var {
  registerEventOptions: rG
} = sg;
var {
  svg: rH,
  win: rY
} = N;
var {
  seriesTypes: rj
} = rR;
var {
  format: rU
} = ew;
var {
  arrayMax: r$,
  arrayMin: rV,
  clamp: rZ,
  correctFloat: rq,
  crisp: r_,
  defined: rK,
  destroyObjectProperties: rJ,
  diffObjects: rQ,
  erase: r0,
  error: r1,
  extend: r2,
  find: r3,
  fireEvent: r5,
  getClosestDistance: r6,
  getNestedProperty: r9,
  insertItem: r4,
  isArray: r8,
  isNumber: r7,
  isString: at,
  merge: ae,
  objectEach: ai,
  pick: as,
  removeEvent: ao,
  syncTimeout: ar
} = ta;
var aa = class _aa {
  constructor() {
    this.zoneAxis = "y";
  }
  init(t11, e10) {
    let i10;
    r5(this, "init", {
      options: e10
    }), this.dataTable ?? (this.dataTable = new rS());
    let s10 = t11.series;
    this.eventsToUnbind = [], this.chart = t11, this.options = this.setOptions(e10);
    let o10 = this.options, r10 = false !== o10.visible;
    this.linkedSeries = [], this.bindAxes(), r2(this, {
      name: o10.name,
      state: "",
      visible: r10,
      selected: true === o10.selected
    }), rG(this, o10);
    let a10 = o10.events;
    (a10?.click || o10.point?.events?.click || o10.allowPointSelect) && (t11.runTrackerClick = true), this.getColor(), this.getSymbol(), this.isCartesian && (t11.hasCartesianSeries = true), s10.length && (i10 = s10[s10.length - 1]), this._i = as(i10?._i, -1) + 1, this.opacity = this.options.opacity, t11.orderItems("series", r4(this, s10)), o10.dataSorting?.enabled ? this.setDataSortingOptions() : this.points || this.data || this.setData(o10.data, false), r5(this, "afterInit");
  }
  is(t11) {
    return rj[t11] && this instanceof rj[t11];
  }
  bindAxes() {
    let t11, e10 = this, i10 = e10.options, s10 = e10.chart;
    r5(this, "bindAxes", null, function() {
      (e10.axisTypes || []).forEach(function(o10) {
        (s10[o10] || []).forEach(function(s11) {
          t11 = s11.options, (as(i10[o10], 0) === s11.index || void 0 !== i10[o10] && i10[o10] === t11.id) && (r4(e10, s11.series), e10[o10] = s11, s11.isDirty = true);
        }), e10[o10] || e10.optionalAxis === o10 || r1(18, true, s10);
      });
    }), r5(this, "afterBindAxes");
  }
  hasData() {
    return this.visible && void 0 !== this.dataMax && void 0 !== this.dataMin || this.visible && this.dataTable.rowCount > 0;
  }
  hasMarkerChanged(t11, e10) {
    let i10 = t11.marker, s10 = e10.marker || {};
    return i10 && (s10.enabled && !i10.enabled || s10.symbol !== i10.symbol || s10.height !== i10.height || s10.width !== i10.width);
  }
  autoIncrement(t11) {
    let e10, i10 = this.options, {
      pointIntervalUnit: s10,
      relativeXValue: o10
    } = this.options, r10 = this.chart.time, a10 = this.xIncrement ?? r10.parse(i10.pointStart) ?? 0;
    if (this.pointInterval = e10 = as(this.pointInterval, i10.pointInterval, 1), o10 && r7(t11) && (e10 *= t11), s10) {
      let t12 = r10.toParts(a10);
      "day" === s10 ? t12[2] += e10 : "month" === s10 ? t12[1] += e10 : "year" === s10 && (t12[0] += e10), e10 = r10.makeTime.apply(r10, t12) - a10;
    }
    return o10 && r7(t11) ? a10 + e10 : (this.xIncrement = a10 + e10, a10);
  }
  setDataSortingOptions() {
    let t11 = this.options;
    r2(this, {
      requireSorting: false,
      sorted: false,
      enabledDataSorting: true,
      allowDG: false
    }), rK(t11.pointRange) || (t11.pointRange = 1);
  }
  setOptions(t11) {
    let e10, i10 = this.chart, s10 = i10.options.plotOptions, o10 = i10.userOptions || {}, r10 = ae(t11), a10 = i10.styledMode, n10 = {
      plotOptions: s10,
      userOptions: r10
    };
    r5(this, "setOptions", n10);
    let h10 = n10.plotOptions[this.type], l2 = o10.plotOptions || {}, d2 = l2.series || {}, c2 = rF.plotOptions[this.type] || {}, p2 = l2[this.type] || {};
    h10.dataLabels = this.mergeArrays(c2.dataLabels, h10.dataLabels), this.userOptions = n10.userOptions;
    let g2 = ae(h10, s10.series, p2, r10);
    this.tooltipOptions = ae(rF.tooltip, rF.plotOptions.series?.tooltip, c2?.tooltip, i10.userOptions.tooltip, l2.series?.tooltip, p2.tooltip, r10.tooltip), this.stickyTracking = as(r10.stickyTracking, p2.stickyTracking, d2.stickyTracking, !!this.tooltipOptions.shared && !this.noSharedTooltip || g2.stickyTracking), null === h10.marker && delete g2.marker, this.zoneAxis = g2.zoneAxis || "y";
    let u2 = this.zones = (g2.zones || []).map((t12) => __spreadValues({}, t12));
    return (g2.negativeColor || g2.negativeFillColor) && !g2.zones && (e10 = {
      value: g2[this.zoneAxis + "Threshold"] || g2.threshold || 0,
      className: "highcharts-negative"
    }, a10 || (e10.color = g2.negativeColor, e10.fillColor = g2.negativeFillColor), u2.push(e10)), u2.length && rK(u2[u2.length - 1].value) && u2.push(a10 ? {} : {
      color: this.color,
      fillColor: this.fillColor
    }), r5(this, "afterSetOptions", {
      options: g2
    }), g2;
  }
  getName() {
    return this.options.name ?? rU(this.chart.options.lang.seriesName, this, this.chart);
  }
  getCyclic(t11, e10, i10) {
    let s10, o10, r10 = this.chart, a10 = `${t11}Index`, n10 = `${t11}Counter`, h10 = i10?.length || r10.options.chart.colorCount;
    !e10 && (rK(o10 = as("color" === t11 ? this.options.colorIndex : void 0, this[a10])) ? s10 = o10 : (r10.series.length || (r10[n10] = 0), s10 = r10[n10] % h10, r10[n10] += 1), i10 && (e10 = i10[s10])), void 0 !== s10 && (this[a10] = s10), this[t11] = e10;
  }
  getColor() {
    this.chart.styledMode ? this.getCyclic("color") : this.options.colorByPoint ? this.color = "#cccccc" : this.getCyclic("color", this.options.color || rF.plotOptions[this.type].color, this.chart.options.colors);
  }
  getPointsCollection() {
    return (this.hasGroupedData ? this.points : this.data) || [];
  }
  getSymbol() {
    let t11 = this.options.marker;
    this.getCyclic("symbol", t11.symbol, this.chart.options.symbols);
  }
  getColumn(t11, e10) {
    return (e10 ? this.dataTable.getModified() : this.dataTable).getColumn(t11, true) || [];
  }
  findPointIndex(t11, e10) {
    let i10, s10, o10, {
      id: r10,
      x: a10
    } = t11, n10 = this.points, h10 = this.options.dataSorting, l2 = this.cropStart || 0;
    if (r10) {
      let t12 = this.chart.get(r10);
      t12 instanceof o7 && (i10 = t12);
    } else if (this.linkedParent || this.enabledDataSorting || this.options.relativeXValue) {
      let e11 = (e12) => !e12.touched && e12.index === t11.index;
      if (h10?.matchByName ? e11 = (e12) => !e12.touched && e12.name === t11.name : this.options.relativeXValue && (e11 = (e12) => !e12.touched && e12.options.x === t11.x), !(i10 = r3(n10, e11))) return;
    }
    return i10 && void 0 !== (o10 = i10?.index) && (s10 = true), void 0 === o10 && r7(a10) && (o10 = this.getColumn("x").indexOf(a10, e10)), -1 !== o10 && void 0 !== o10 && this.cropped && (o10 = o10 >= l2 ? o10 - l2 : o10), !s10 && r7(o10) && n10[o10]?.touched && (o10 = void 0), o10;
  }
  updateData(t11, e10) {
    let {
      options: i10,
      requireSorting: s10
    } = this, o10 = i10.dataSorting, r10 = this.points, a10 = [], n10 = t11.length === r10.length, h10 = this.xIncrement, l2, d2, c2, p2, g2 = true;
    if (this.xIncrement = null, t11.forEach((t12, e11) => {
      let h11, d3 = rK(t12) && this.pointClass.prototype.optionsToObject.call({
        series: this
      }, t12) || {}, {
        id: c3,
        x: g3
      } = d3;
      c3 || r7(g3) ? (-1 === (h11 = this.findPointIndex(d3, p2)) || void 0 === h11 ? a10.push(t12) : r10[h11] && t12 !== i10.data?.[h11] ? (r10[h11].update(t12, false, void 0, false), r10[h11].touched = true, s10 && (p2 = h11 + 1)) : r10[h11] && (r10[h11].touched = true), (!n10 || e11 !== h11 || o10?.enabled || this.hasDerivedData) && (l2 = true)) : a10.push(t12);
    }, this), l2) for (d2 = r10.length; d2--; ) (c2 = r10[d2]) && !c2.touched && c2.remove?.(false, e10);
    else n10 && !o10?.enabled ? (t11.forEach((t12, e11) => {
      t12 === r10[e11].y || r10[e11].destroyed || r10[e11].update(t12, false, void 0, false);
    }), a10.length = 0) : g2 = false;
    if (r10.forEach((t12) => {
      t12 && (t12.touched = false);
    }), !g2) return false;
    a10.forEach((t12) => {
      this.addPoint(t12, false, void 0, void 0, false);
    }, this);
    let u2 = this.getColumn("x");
    return null !== h10 && null === this.xIncrement && u2.length && (this.xIncrement = r$(u2), this.autoIncrement()), true;
  }
  dataColumnKeys() {
    return ["x", ...this.pointArrayMap || ["y"]];
  }
  setData(t11, e10 = true, i10, s10) {
    let o10 = this.points, r10 = o10?.length || 0, a10 = this.options, n10 = this.chart, h10 = a10.dataSorting, l2 = this.xAxis, d2 = a10.turboThreshold, c2 = this.dataTable, p2 = this.dataColumnKeys(), g2 = this.pointValKey || "y", u2 = (this.pointArrayMap || []).length, f2 = a10.keys, m2, x2, y2 = 0, b2 = 1, v2;
    n10.options.chart.allowMutatingData || (a10.data && delete this.options.data, this.userOptions.data && delete this.userOptions.data, v2 = ae(true, t11));
    let k2 = (t11 = v2 || t11 || []).length;
    if (h10?.enabled && (t11 = this.sortData(t11)), n10.options.chart.allowMutatingData && false !== s10 && k2 && r10 && !this.cropped && !this.hasGroupedData && this.visible && !this.boosted && (x2 = this.updateData(t11, i10)), !x2) {
      this.xIncrement = null, this.colorCounter = 0;
      let e11 = d2 && !a10.relativeXValue && k2 > d2;
      if (e11) {
        let i11 = this.getFirstValidPoint(t11), s11 = this.getFirstValidPoint(t11, k2 - 1, -1), o11 = (t12) => !!(r8(t12) && (f2 || r7(t12[0])));
        if (r7(i11) && r7(s11)) {
          let e12 = [], i12 = [];
          for (let s12 of t11) e12.push(this.autoIncrement()), i12.push(s12);
          c2.setColumns({
            x: e12,
            [g2]: i12
          });
        } else if (o11(i11) && o11(s11)) {
          if (u2) {
            let e12 = +(i11.length === u2), s12 = Array(p2.length).fill(0).map(() => []);
            for (let i12 of t11) {
              e12 && s12[0].push(this.autoIncrement());
              for (let t12 = e12; t12 <= u2; t12++) s12[t12]?.push(i12[t12 - e12]);
            }
            c2.setColumns(p2.reduce((t12, e13, i12) => (t12[e13] = s12[i12], t12), {}));
          } else {
            f2 && (y2 = f2.indexOf("x"), b2 = f2.indexOf("y"), y2 = y2 >= 0 ? y2 : 0, b2 = b2 >= 0 ? b2 : 1), 1 === i11.length && (b2 = 0);
            let e12 = [], s12 = [];
            if (y2 === b2) for (let i12 of t11) e12.push(this.autoIncrement()), s12.push(i12[b2]);
            else for (let i12 of t11) e12.push(i12[y2]), s12.push(i12[b2]);
            c2.setColumns({
              x: e12,
              [g2]: s12
            });
          }
        } else e11 = false;
      }
      if (!e11) {
        let e12 = p2.reduce((t12, e13) => (t12[e13] = [], t12), {});
        for (m2 = 0; m2 < k2; m2++) {
          let i11 = this.pointClass.prototype.applyOptions.apply({
            series: this
          }, [t11[m2]]);
          for (let t12 of p2) e12[t12][m2] = i11[t12];
        }
        c2.setColumns(e12);
      }
      for (at(this.getColumn("y")[0]) && r1(14, true, n10), this.data = [], this.options.data = this.userOptions.data = t11, m2 = r10; m2--; ) o10[m2]?.destroy();
      l2 && (l2.minRange = l2.userMinRange), this.isDirty = n10.isDirtyBox = true, this.isDirtyData = !!o10, i10 = false;
    }
    "point" === a10.legendType && (this.processData(), this.generatePoints()), e10 && n10.redraw(i10);
  }
  sortData(t11) {
    let e10 = this, i10 = e10.options.dataSorting.sortKey || "y", s10 = function(t12, e11) {
      return rK(e11) && t12.pointClass.prototype.optionsToObject.call({
        series: t12
      }, e11) || {};
    };
    return t11.forEach(function(i11, o10) {
      t11[o10] = s10(e10, i11), t11[o10].index = o10;
    }, this), t11.concat().sort((t12, e11) => {
      let s11 = r9(i10, t12), o10 = r9(i10, e11);
      return o10 < s11 ? -1 : +(o10 > s11);
    }).forEach(function(t12, e11) {
      t12.x = e11;
    }, this), e10.linkedSeries && e10.linkedSeries.forEach(function(e11) {
      let i11 = e11.options, o10 = i11.data;
      !i11.dataSorting?.enabled && o10 && (o10.forEach(function(i12, r10) {
        o10[r10] = s10(e11, i12), t11[r10] && (o10[r10].x = t11[r10].x, o10[r10].index = r10);
      }), e11.setData(o10, false));
    }), t11;
  }
  getProcessedData(t11) {
    let e10 = this, {
      dataTable: i10,
      isCartesian: s10,
      options: o10,
      xAxis: r10
    } = e10, a10 = o10.cropThreshold, n10 = t11 || e10.getExtremesFromAll, h10 = r10?.logarithmic, l2 = i10.rowCount, d2, c2, p2 = 0, g2, u2, f2, m2 = e10.getColumn("x"), x2 = i10, y2 = false;
    return r10 && (u2 = (g2 = r10.getExtremes()).min, f2 = g2.max, y2 = !!(r10.categories && !r10.names.length), s10 && e10.sorted && !n10 && (!a10 || l2 > a10 || e10.forceCrop) && (m2[l2 - 1] < u2 || m2[0] > f2 ? x2 = new rS() : e10.getColumn(e10.pointValKey || "y").length && (m2[0] < u2 || m2[l2 - 1] > f2) && (x2 = (d2 = this.cropData(i10, u2, f2)).modified, p2 = d2.start, c2 = true))), m2 = x2.getColumn("x") || [], {
      modified: x2,
      cropped: c2,
      cropStart: p2,
      closestPointRange: r6([h10 ? m2.map(h10.log2lin) : m2], () => e10.requireSorting && !y2 && r1(15, false, e10.chart))
    };
  }
  processData(t11) {
    let e10 = this.xAxis, i10 = this.dataTable;
    if (this.isCartesian && !this.isDirty && !e10.isDirty && !this.yAxis.isDirty && !t11) return false;
    let s10 = this.getProcessedData();
    i10.modified = s10.modified, this.cropped = s10.cropped, this.cropStart = s10.cropStart, this.closestPointRange = this.basePointRange = s10.closestPointRange, r5(this, "afterProcessData");
  }
  cropData(t11, e10, i10) {
    let s10 = t11.getColumn("x", true) || [], o10 = s10.length, r10 = {}, a10, n10, h10 = 0, l2 = o10;
    for (a10 = 0; a10 < o10; a10++) if (s10[a10] >= e10) {
      h10 = Math.max(0, a10 - 1);
      break;
    }
    for (n10 = a10; n10 < o10; n10++) if (s10[n10] > i10) {
      l2 = n10 + 1;
      break;
    }
    for (let e11 of this.dataColumnKeys()) {
      let i11 = t11.getColumn(e11, true);
      i11 && (r10[e11] = i11.slice(h10, l2));
    }
    return {
      modified: new rS({
        columns: r10
      }),
      start: h10,
      end: l2
    };
  }
  generatePoints() {
    let t11 = this.options, e10 = this.processedData || t11.data, i10 = this.dataTable.getModified(), s10 = this.getColumn("x", true), o10 = this.pointClass, r10 = i10.rowCount, a10 = this.cropStart || 0, n10 = this.hasGroupedData, h10 = t11.keys, l2 = [], d2 = t11.dataGrouping?.groupAll ? a10 : 0, c2 = this.pointArrayMap || ["y"], p2 = this.dataColumnKeys(), g2, u2, f2, m2, x2 = this.data, y2;
    if (!x2 && !n10) {
      let t12 = [];
      t12.length = e10?.length || 0, x2 = this.data = t12;
    }
    for (h10 && n10 && (this.options.keys = false), m2 = 0; m2 < r10; m2++) u2 = a10 + m2, n10 ? ((f2 = new o10(this, i10.getRow(m2, p2) || [])).dataGroup = this.groupMap?.[d2 + m2], f2.dataGroup?.options && (f2.options = f2.dataGroup.options, r2(f2, f2.dataGroup.options), delete f2.dataLabels, f2.key = f2.name ?? f2.category)) : (f2 = x2[u2], y2 = e10 ? e10[u2] : i10.getRow(m2, c2), f2 || void 0 === y2 ? f2 && (f2.category = this.xAxis?.categories?.[f2.x] ?? f2.x, f2.key = f2.name ?? f2.category) : x2[u2] = f2 = new o10(this, y2, s10[m2])), f2 && (f2.index = n10 ? d2 + m2 : u2, l2[m2] = f2);
    if (this.options.keys = h10, x2 && (r10 !== (g2 = x2.length) || n10)) for (m2 = 0; m2 < g2; m2++) m2 !== a10 || n10 || (m2 += r10), x2[m2] && (x2[m2].destroyElements(), x2[m2].plotX = void 0);
    this.data = x2, this.points = l2, r5(this, "afterGeneratePoints");
  }
  getXExtremes(t11) {
    return {
      min: rV(t11),
      max: r$(t11)
    };
  }
  getExtremes(t11, e10) {
    let {
      xAxis: i10,
      yAxis: s10
    } = this, o10 = e10 || this.getExtremesFromAll || this.options.getExtremesFromAll, r10 = o10 && this.cropped ? this.dataTable : this.dataTable.getModified(), a10 = r10.rowCount, n10 = t11 || this.stackedYData, h10 = n10 ? [n10] : (this.keysAffectYAxis || this.pointArrayMap || ["y"])?.map((t12) => r10.getColumn(t12, true) || []) || [], l2 = this.getColumn("x", true), d2 = [], c2 = this.requireSorting && !this.is("column") ? 1 : 0, p2 = !!s10 && s10.positiveValuesOnly, g2 = o10 || this.cropped || !i10, u2, f2, m2, x2 = 0, y2 = 0;
    for (i10 && (x2 = (u2 = i10.getExtremes()).min, y2 = u2.max), m2 = 0; m2 < a10; m2++) if (f2 = l2[m2], g2 || (l2[m2 + c2] || f2) >= x2 && (l2[m2 - c2] || f2) <= y2) for (let t12 of h10) {
      let e11 = t12[m2];
      r7(e11) && (e11 > 0 || !p2) && d2.push(e11);
    }
    let b2 = {
      activeYData: d2,
      dataMin: rV(d2),
      dataMax: r$(d2)
    };
    return r5(this, "afterGetExtremes", {
      dataExtremes: b2
    }), b2;
  }
  applyExtremes() {
    let t11 = this.getExtremes();
    return this.dataMin = t11.dataMin, this.dataMax = t11.dataMax, t11;
  }
  getFirstValidPoint(t11, e10 = 0, i10 = 1) {
    let s10 = t11.length, o10 = e10;
    for (; o10 >= 0 && o10 < s10; ) {
      if (rK(t11[o10])) return t11[o10];
      o10 += i10;
    }
  }
  translate() {
    this.generatePoints();
    let t11 = this.options, e10 = t11.stacking, i10 = this.xAxis, s10 = this.enabledDataSorting, o10 = this.yAxis, r10 = this.points, a10 = r10.length, n10 = this.pointPlacementToXValue(), h10 = !!n10, l2 = t11.threshold, d2 = t11.startFromThreshold ? l2 : 0, c2 = t11?.nullInteraction && o10.len, p2, g2, u2, f2, m2 = Number.MAX_VALUE;
    function x2(t12) {
      return rZ(t12, -1e9, 1e9);
    }
    for (p2 = 0; p2 < a10; p2++) {
      let t12, a11 = r10[p2], y2 = a11.x, b2, v2, k2 = a11.y, M2 = a11.low, w2 = e10 && o10.stacking?.stacks[(this.negStacks && k2 < (d2 ? 0 : l2) ? "-" : "") + this.stackKey];
      a11.plotX = r7(g2 = i10.translate(y2, false, false, false, true, n10)) ? rq(x2(g2)) : void 0, e10 && this.visible && w2 && w2[y2] && (f2 = this.getStackIndicator(f2, y2, this.index), !a11.isNull && f2.key && (v2 = (b2 = w2[y2]).points[f2.key]), b2 && r8(v2) && (M2 = v2[0], k2 = v2[1], M2 === d2 && f2.key === w2[y2].base && (M2 = as(r7(l2) ? l2 : o10.min)), o10.positiveValuesOnly && rK(M2) && M2 <= 0 && (M2 = void 0), a11.total = a11.stackTotal = as(b2.total), a11.percentage = rK(a11.y) && b2.total ? a11.y / b2.total * 100 : void 0, a11.stackY = k2, this.irregularWidths || b2.setOffset(this.pointXOffset || 0, this.barW || 0, void 0, void 0, void 0, this.xAxis))), a11.yBottom = rK(M2) ? x2(o10.translate(M2, false, true, false, true)) : void 0, this.dataModify && (k2 = this.dataModify.modifyValue(k2, p2)), r7(k2) && void 0 !== a11.plotX ? t12 = r7(t12 = o10.translate(k2, false, true, false, true)) ? x2(t12) : void 0 : !r7(k2) && c2 && (t12 = c2), a11.plotY = t12, a11.isInside = this.isPointInside(a11), a11.clientX = h10 ? rq(i10.translate(y2, false, false, false, true, n10)) : g2, a11.negative = (a11.y || 0) < (l2 || 0), a11.isNull || false === a11.visible || (void 0 !== u2 && (m2 = Math.min(m2, Math.abs(g2 - u2))), u2 = g2), a11.zone = this.zones.length ? a11.getZone() : void 0, !a11.graphic && this.group && s10 && (a11.isNew = true);
    }
    this.closestPointRangePx = m2, r5(this, "afterTranslate");
  }
  getValidPoints(t11, e10, i10) {
    let s10 = this.chart;
    return (t11 || this.points || []).filter(function(t12) {
      let {
        plotX: o10,
        plotY: r10
      } = t12;
      return (!!i10 || !t12.isNull && !!r7(r10)) && (!e10 || !!s10.isInsidePlot(o10, r10, {
        inverted: s10.inverted
      })) && false !== t12.visible;
    });
  }
  getSharedClipKey() {
    return this.sharedClipKey = (this.options.xAxis || 0) + "," + (this.options.yAxis || 0), this.sharedClipKey;
  }
  setClip() {
    let {
      chart: t11,
      group: e10,
      markerGroup: i10
    } = this, s10 = t11.sharedClips, o10 = t11.renderer, r10 = t11.getClipBox(this), a10 = this.getSharedClipKey(), n10 = s10[a10];
    r5(this, "setClip", {
      clipBox: r10
    }), n10 ? n10.animate(r10) : s10[a10] = n10 = o10.clipRect(r10), e10 && e10.clip(false === this.options.clip ? void 0 : n10), i10 && i10.clip();
  }
  animate(t11) {
    let {
      chart: e10,
      group: i10,
      markerGroup: s10
    } = this, o10 = e10.inverted, r10 = rW(this.options.animation), a10 = [this.getSharedClipKey(), r10.duration, r10.easing, r10.defer].join(","), n10 = e10.sharedClips[a10], h10 = e10.sharedClips[a10 + "m"];
    if (t11 && i10) {
      let t12 = e10.getClipBox(this);
      if (n10) n10.attr("height", t12.height);
      else {
        t12.width = 0, o10 && (t12.x = e10.plotHeight), n10 = e10.renderer.clipRect(t12), e10.sharedClips[a10] = n10;
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
      let t12 = e10.getClipBox(this), i11 = r10.step;
      (s10?.element.childNodes.length || e10.series.length > 1) && (r10.step = function(t13, e11) {
        i11 && i11.apply(e11, arguments), "width" === e11.prop && h10?.element && h10.attr(o10 ? "height" : "width", t13 + 99);
      }), n10.addClass("highcharts-animating").animate(t12, r10);
    }
  }
  afterAnimate() {
    this.setClip(), ai(this.chart.sharedClips, (t11, e10, i10) => {
      t11 && !this.chart.container.querySelector(`[clip-path="url(#${t11.id})"]`) && (t11.destroy(), delete i10[e10]);
    }), this.finishedAnimating = true, r5(this, "afterAnimate");
  }
  drawPoints(t11 = this.points) {
    let e10, i10, s10, o10, r10, a10, n10, h10 = this.chart, l2 = h10.styledMode, {
      colorAxis: d2,
      options: c2
    } = this, p2 = c2.marker, g2 = c2.nullInteraction, u2 = this[this.specialGroup || "markerGroup"], f2 = this.xAxis, m2 = as(p2.enabled, !f2 || !!f2.isRadial || null, this.closestPointRangePx >= p2.enabledThreshold * p2.radius);
    if (false !== p2.enabled || this._hasPointMarkers) for (e10 = 0; e10 < t11.length; e10++) {
      o10 = (s10 = (i10 = t11[e10]).graphic) ? "animate" : "attr", r10 = i10.marker || {}, a10 = !!i10.marker;
      let c3 = i10.isNull;
      if ((m2 && !rK(r10.enabled) || r10.enabled) && (!c3 || g2) && false !== i10.visible) {
        let t12 = as(r10.symbol, this.symbol, "rect");
        n10 = this.markerAttribs(i10, i10.selected && "select"), this.enabledDataSorting && (i10.startXPos = f2.reversed ? -(n10.width || 0) : f2.width);
        let e11 = false !== i10.isInside;
        if (!s10 && e11 && ((n10.width || 0) > 0 || i10.hasImage) && (i10.graphic = s10 = h10.renderer.symbol(t12, n10.x, n10.y, n10.width, n10.height, a10 ? r10 : p2).add(u2), this.enabledDataSorting && h10.hasRendered && (s10.attr({
          x: i10.startXPos
        }), o10 = "animate")), s10 && "animate" === o10 && s10[e11 ? "show" : "hide"](e11).animate(n10), s10) {
          let t13 = this.pointAttribs(i10, l2 || !i10.selected ? void 0 : "select");
          l2 ? d2 && s10.css({
            fill: t13.fill
          }) : s10[o10](t13);
        }
        s10 && s10.addClass(i10.getClassName(), true);
      } else s10 && (i10.graphic = s10.destroy());
    }
  }
  markerAttribs(t11, e10) {
    let i10 = this.options, s10 = i10.marker, o10 = t11.marker || {}, r10 = o10.symbol || s10.symbol, a10 = {}, n10, h10, l2 = as(o10.radius, s10?.radius);
    e10 && (n10 = s10.states[e10], h10 = o10.states && o10.states[e10], l2 = as(h10?.radius, n10?.radius, l2 && l2 + (n10?.radiusPlus || 0))), t11.hasImage = r10 && 0 === r10.indexOf("url"), t11.hasImage && (l2 = 0);
    let d2 = t11.pos();
    return r7(l2) && d2 && (i10.crisp && (d2[0] = r_(d2[0], t11.hasImage ? 0 : "rect" === r10 ? s10?.lineWidth || 0 : 1)), a10.x = d2[0] - l2, a10.y = d2[1] - l2), l2 && (a10.width = a10.height = 2 * l2), a10;
  }
  pointAttribs(t11, e10) {
    let i10 = this.options, s10 = i10.marker, o10 = t11?.options, r10 = o10?.marker || {}, a10 = o10?.color, n10 = t11?.color, h10 = t11?.zone?.color, l2, d2, c2 = this.color, p2, g2, u2 = as(r10.lineWidth, s10.lineWidth), f2 = t11?.isNull && i10.nullInteraction ? 0 : 1;
    return c2 = a10 || h10 || n10 || c2, p2 = r10.fillColor || s10.fillColor || c2, g2 = r10.lineColor || s10.lineColor || c2, e10 = e10 || "normal", l2 = s10.states[e10] || {}, u2 = as((d2 = r10.states && r10.states[e10] || {}).lineWidth, l2.lineWidth, u2 + as(d2.lineWidthPlus, l2.lineWidthPlus, 0)), p2 = d2.fillColor || l2.fillColor || p2, g2 = d2.lineColor || l2.lineColor || g2, {
      stroke: g2,
      "stroke-width": u2,
      fill: p2,
      opacity: f2 = as(d2.opacity, l2.opacity, f2)
    };
  }
  destroy(t11) {
    let e10, i10, s10 = this, o10 = s10.chart, r10 = /AppleWebKit\/533/.test(rY.navigator.userAgent), a10 = s10.data || [];
    for (r5(s10, "destroy", {
      keepEventsForUpdate: t11
    }), this.removeEvents(t11), (s10.axisTypes || []).forEach(function(t12) {
      i10 = s10[t12], i10?.series && (r0(i10.series, s10), i10.isDirty = i10.forceRedraw = true);
    }), s10.legendItem && s10.chart.legend.destroyItem(s10), e10 = a10.length; e10--; ) a10[e10]?.destroy?.();
    for (let t12 of s10.zones) rJ(t12, void 0, true);
    ta.clearTimeout(s10.animationTimeout), ai(s10, function(t12, e11) {
      t12 instanceof e7 && !t12.survive && t12[r10 && "group" === e11 ? "hide" : "destroy"]();
    }), o10.hoverSeries === s10 && (o10.hoverSeries = void 0), r0(o10.series, s10), o10.orderItems("series"), ai(s10, function(e11, i11) {
      t11 && "hcEvents" === i11 || delete s10[i11];
    });
  }
  applyZones() {
    let {
      area: t11,
      chart: e10,
      graph: i10,
      zones: s10,
      points: o10,
      xAxis: r10,
      yAxis: a10,
      zoneAxis: n10
    } = this, {
      inverted: h10,
      renderer: l2
    } = e10, d2 = this[`${n10}Axis`], {
      isXAxis: c2,
      len: p2 = 0,
      minPointOffset: g2 = 0
    } = d2 || {}, u2 = (i10?.strokeWidth() || 0) / 2 + 1, f2 = (t12, e11 = 0, i11 = 0) => {
      h10 && (i11 = p2 - i11);
      let {
        translated: s11 = 0,
        lineClip: o11
      } = t12, r11 = i11 - s11;
      o11?.push(["L", e11, Math.abs(r11) < u2 ? i11 - u2 * (r11 <= 0 ? -1 : 1) : s11]);
    };
    if (s10.length && (i10 || t11) && d2 && r7(d2.min)) {
      let e11 = d2.getExtremes().max + g2, u3 = (t12) => {
        t12.forEach((e12, i11) => {
          ("M" === e12[0] || "L" === e12[0]) && (t12[i11] = [e12[0], c2 ? p2 - e12[1] : e12[1], c2 ? e12[2] : p2 - e12[2]]);
        });
      };
      if (s10.forEach((t12) => {
        t12.lineClip = [], t12.translated = rZ(d2.toPixels(as(t12.value, e11), true) || 0, 0, p2);
      }), i10 && !this.showLine && i10.hide(), t11 && t11.hide(), "y" === n10 && o10.length < r10.len) for (let t12 of o10) {
        let {
          plotX: e12,
          plotY: i11,
          zone: o11
        } = t12, r11 = o11 && s10[s10.indexOf(o11) - 1];
        o11 && f2(o11, e12, i11), r11 && f2(r11, e12, i11);
      }
      let m2 = [], x2 = d2.toPixels(d2.getExtremes().min - g2, true);
      s10.forEach((e12) => {
        let s11 = e12.lineClip || [], o11 = Math.round(e12.translated || 0);
        r10.reversed && s11.reverse();
        let {
          clip: n11,
          simpleClip: d3
        } = e12, p3 = 0, g3 = 0, f3 = r10.len, y2 = a10.len;
        c2 ? (p3 = o11, f3 = x2) : (g3 = o11, y2 = x2);
        let b2 = [["M", p3, g3], ["L", f3, g3], ["L", f3, y2], ["L", p3, y2], ["Z"]], v2 = [b2[0], ...s11, b2[1], b2[2], ...m2, b2[3], b2[4]];
        m2 = s11.reverse(), x2 = o11, h10 && (u3(v2), t11 && u3(b2)), n11 ? (n11.animate({
          d: v2
        }), d3?.animate({
          d: b2
        })) : (n11 = e12.clip = l2.path(v2), t11 && (d3 = e12.simpleClip = l2.path(b2))), i10 && e12.graph?.clip(n11), t11 && e12.area?.clip(d3);
      });
    } else this.visible && (i10 && i10.show(), t11 && t11.show());
  }
  plotGroup(t11, e10, i10, s10, o10) {
    let r10 = this[t11], a10 = !r10, n10 = {
      visibility: i10,
      zIndex: s10 || 0.1
    };
    return rK(this.opacity) && !this.chart.styledMode && "inactive" !== this.state && (n10.opacity = this.opacity), r10 || (this[t11] = r10 = this.chart.renderer.g().add(o10)), r10.addClass("highcharts-" + e10 + " highcharts-series-" + this.index + " highcharts-" + this.type + "-series " + (rK(this.colorIndex) ? "highcharts-color-" + this.colorIndex + " " : "") + (this.options.className || "") + (r10.hasClass("highcharts-tracker") ? " highcharts-tracker" : ""), true), r10.attr(n10)[a10 ? "attr" : "animate"](this.getPlotBox(e10)), r10;
  }
  getPlotBox(t11) {
    let e10 = this.xAxis, i10 = this.yAxis, s10 = this.chart, o10 = s10.inverted && !s10.polar && e10 && this.invertible && "series" === t11;
    s10.inverted && (e10 = i10, i10 = this.xAxis);
    let r10 = {
      scale: 1,
      translateX: e10 ? e10.left : s10.plotLeft,
      translateY: i10 ? i10.top : s10.plotTop,
      name: t11
    };
    r5(this, "getPlotBox", r10);
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
  removeEvents(t11) {
    let {
      eventsToUnbind: e10
    } = this;
    t11 || ao(this), e10.length && (e10.forEach((t12) => {
      t12();
    }), e10.length = 0);
  }
  render() {
    let t11 = this, {
      chart: e10,
      options: i10,
      hasRendered: s10
    } = t11, o10 = rW(i10.animation), r10 = t11.visible ? "inherit" : "hidden", a10 = i10.zIndex, n10 = e10.seriesGroup, h10 = t11.finishedAnimating ? 0 : o10.duration;
    r5(this, "render"), t11.plotGroup("group", "series", r10, a10, n10), t11.markerGroup = t11.plotGroup("markerGroup", "markers", r10, a10, n10), false !== i10.clip && t11.setClip(), h10 && t11.animate?.(true), t11.drawGraph && (t11.drawGraph(), t11.applyZones()), t11.visible && t11.drawPoints(), t11.drawDataLabels?.(), t11.redrawPoints?.(), i10.enableMouseTracking && t11.drawTracker?.(), h10 && t11.animate?.(), s10 || (h10 && o10.defer && (h10 += o10.defer), t11.animationTimeout = ar(() => {
      t11.afterAnimate();
    }, h10 || 0)), t11.isDirty = false, t11.hasRendered = true, r5(t11, "afterRender");
  }
  redraw() {
    let t11 = this.isDirty || this.isDirtyData;
    this.translate(), this.render(), t11 && delete this.kdTree;
  }
  reserveSpace() {
    return this.visible || !this.chart.options.chart.ignoreHiddenSeries;
  }
  searchPoint(t11, e10) {
    let {
      xAxis: i10,
      yAxis: s10
    } = this, o10 = this.chart.inverted;
    return this.searchKDTree({
      clientX: o10 ? i10.len - t11.chartY + i10.pos : t11.chartX - i10.pos,
      plotY: o10 ? s10.len - t11.chartX + s10.pos : t11.chartY - s10.pos
    }, e10, t11);
  }
  buildKDTree(t11) {
    this.buildingKdTree = true;
    let e10 = this, i10 = e10.options, s10 = i10.findNearestPointBy.indexOf("y") > -1 ? 2 : 1;
    delete e10.kdTree, ar(function() {
      e10.kdTree = function t12(i11, s11, o10) {
        let r10, a10, n10 = i11?.length;
        if (n10) return r10 = e10.kdAxisArray[s11 % o10], i11.sort((t13, e11) => (t13[r10] || 0) - (e11[r10] || 0)), {
          point: i11[a10 = Math.floor(n10 / 2)],
          left: t12(i11.slice(0, a10), s11 + 1, o10),
          right: t12(i11.slice(a10 + 1), s11 + 1, o10)
        };
      }(e10.getValidPoints(void 0, !e10.directTouch, i10?.nullInteraction), s10, s10), e10.buildingKdTree = false;
    }, i10.kdNow || t11?.type === "touchstart" ? 0 : 1);
  }
  searchKDTree(t11, e10, i10, s10, o10) {
    let r10 = this, [a10, n10] = this.kdAxisArray, h10 = e10 ? "distX" : "dist", l2 = (r10.options.findNearestPointBy || "").indexOf("y") > -1 ? 2 : 1, d2 = !!r10.isBubble, c2 = s10 || ((t12, e11, i11) => {
      let s11 = t12[i11] || 0, o11 = e11[i11] || 0;
      return [s11 === o11 && t12.index > e11.index || s11 < o11 ? t12 : e11, false];
    }), p2 = o10 || ((t12, e11) => t12 < e11);
    if (this.kdTree || this.buildingKdTree || this.buildKDTree(i10), this.kdTree) return function t12(e11, i11, s11, o11) {
      let l3, g2, u2, f2, m2, x2, y2, b2 = i11.point, v2 = r10.kdAxisArray[s11 % o11], k2 = b2, M2 = false;
      l3 = e11[a10], g2 = b2[a10], u2 = rK(l3) && rK(g2) ? l3 - g2 : null, f2 = e11[n10], m2 = b2[n10], x2 = rK(f2) && rK(m2) ? f2 - m2 : 0, y2 = d2 && b2.marker?.radius || 0, b2.dist = Math.sqrt((u2 && u2 * u2 || 0) + x2 * x2) - y2, b2.distX = rK(u2) ? Math.abs(u2) - y2 : Number.MAX_VALUE;
      let w2 = (e11[v2] || 0) - (b2[v2] || 0) + (d2 && b2.marker?.radius || 0), S2 = w2 < 0 ? "left" : "right", T2 = w2 < 0 ? "right" : "left";
      return i11[S2] && ([k2, M2] = c2(b2, t12(e11, i11[S2], s11 + 1, o11), h10)), i11[T2] && p2(Math.sqrt(w2 * w2), k2[h10], M2) && (k2 = c2(k2, t12(e11, i11[T2], s11 + 1, o11), h10)[0]), k2;
    }(t11, this.kdTree, l2, l2);
  }
  pointPlacementToXValue() {
    let {
      options: t11,
      xAxis: e10
    } = this, i10 = t11.pointPlacement;
    return "between" === i10 && (i10 = e10.reversed ? -0.5 : 0.5), r7(i10) ? i10 * (t11.pointRange || e10.pointRange) : 0;
  }
  isPointInside(t11) {
    let {
      chart: e10,
      xAxis: i10,
      yAxis: s10
    } = this, {
      plotX: o10 = -1,
      plotY: r10 = -1
    } = t11;
    return r10 >= 0 && r10 <= (s10 ? s10.len : e10.plotHeight) && o10 >= 0 && o10 <= (i10 ? i10.len : e10.plotWidth);
  }
  drawTracker() {
    let t11 = this, e10 = t11.options, i10 = e10.trackByArea, s10 = [].concat((i10 ? t11.areaPath : t11.graphPath) || []), o10 = t11.chart, r10 = o10.pointer, a10 = o10.renderer, n10 = o10.options.tooltip?.snap || 0, h10 = () => {
      e10.enableMouseTracking && o10.hoverSeries !== t11 && t11.onMouseOver();
    }, l2 = "rgba(192,192,192," + (rH ? 1e-4 : 2e-3) + ")", d2 = t11.tracker;
    d2 ? d2.attr({
      d: s10
    }) : t11.graph && (t11.tracker = d2 = a10.path(s10).attr({
      visibility: t11.visible ? "inherit" : "hidden",
      zIndex: 2
    }).addClass(i10 ? "highcharts-tracker-area" : "highcharts-tracker-line").add(t11.group), o10.styledMode || d2.attr({
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      stroke: l2,
      fill: i10 ? l2 : "none",
      "stroke-width": t11.graph.strokeWidth() + (i10 ? 0 : 2 * n10)
    }), [t11.tracker, t11.markerGroup, ...t11.dataLabelsGroups || []].forEach((t12) => {
      t12 && (t12.addClass("highcharts-tracker").on("mouseover", h10).on("mouseout", (t13) => {
        r10?.onTrackerMouseOut(t13);
      }), e10.cursor && !o10.styledMode && t12.css({
        cursor: e10.cursor
      }), t12.on("touchstart", h10));
    })), r5(this, "afterDrawTracker");
  }
  addPoint(t11, e10, i10, s10, o10) {
    let r10, a10, n10 = this.options, {
      chart: h10,
      data: l2,
      dataTable: d2,
      xAxis: c2
    } = this, p2 = c2?.hasNames && c2.names, g2 = n10.data, u2 = this.getColumn("x");
    e10 = as(e10, true);
    let f2 = {
      series: this
    };
    this.pointClass.prototype.applyOptions.apply(f2, [t11]);
    let m2 = f2.x;
    if (a10 = u2.length, this.requireSorting && m2 < u2[a10 - 1]) for (r10 = true; a10 && u2[a10 - 1] > m2; ) a10--;
    d2.setRow(f2, a10, true, {
      addColumns: false
    }), p2 && f2.name && (p2[m2] = f2.name), g2?.splice(a10, 0, t11), (r10 || this.processedData) && (this.data.splice(a10, 0, null), this.processData()), "point" === n10.legendType && this.generatePoints(), i10 && (l2[0] && l2[0].remove ? l2[0].remove(false) : ([l2, g2].filter(rK).forEach((t12) => {
      t12.shift();
    }), d2.deleteRows(0))), false !== o10 && r5(this, "addPoint", {
      point: f2
    }), this.isDirty = true, this.isDirtyData = true, e10 && h10.redraw(s10);
  }
  removePoint(t11, e10, i10) {
    let s10 = this, {
      chart: o10,
      data: r10,
      points: a10,
      dataTable: n10
    } = s10, h10 = r10[t11], l2 = function() {
      [a10?.length === r10.length ? a10 : void 0, r10, s10.options.data].filter(rK).forEach((e11) => {
        e11.splice(t11, 1);
      }), n10.deleteRows(t11), h10?.destroy(), s10.isDirty = true, s10.isDirtyData = true, e10 && o10.redraw();
    };
    rX(i10, o10), e10 = as(e10, true), h10 ? h10.firePointEvent("remove", null, l2) : l2();
  }
  remove(t11, e10, i10, s10) {
    let o10 = this, r10 = o10.chart;
    function a10() {
      o10.destroy(s10), r10.isDirtyLegend = r10.isDirtyBox = true, r10.linkSeries(s10), as(t11, true) && r10.redraw(e10);
    }
    false !== i10 ? r5(o10, "remove", null, a10) : a10();
  }
  update(t11, e10) {
    r5(this, "update", {
      options: t11 = rQ(t11, this.userOptions)
    });
    let i10 = this, s10 = i10.chart, o10 = i10.userOptions, r10 = i10.initialType || i10.type, a10 = s10.options.plotOptions, n10 = rj[r10].prototype, h10 = i10.finishedAnimating && {
      animation: false
    }, l2 = {}, d2, c2, p2 = _aa.keepProps.slice(), g2 = t11.type || o10.type || s10.options.chart.type, u2 = !(this.hasDerivedData || g2 && g2 !== this.type || void 0 !== t11.keys || void 0 !== t11.pointStart || void 0 !== t11.pointInterval || void 0 !== t11.relativeXValue || t11.joinBy || t11.mapData || ["dataGrouping", "pointStart", "pointInterval", "pointIntervalUnit", "keys"].some((t12) => i10.hasOptionChanged(t12)));
    g2 = g2 || r10, u2 ? (p2.push.apply(p2, _aa.keepPropsForPoints), false !== t11.visible && p2.push("area", "graph"), i10.parallelArrays.forEach(function(t12) {
      p2.push(t12 + "Data");
    }), t11.data && (t11.dataSorting && r2(i10.options.dataSorting, t11.dataSorting), this.setData(t11.data, false))) : this.dataTable.modified = this.dataTable, t11.dataLabels && o10.dataLabels && (t11.dataLabels = this.mergeArrays(o10.dataLabels, t11.dataLabels)), t11 = ae(o10, {
      index: void 0 === o10.index ? i10.index : o10.index,
      pointStart: a10?.series?.pointStart ?? o10.pointStart ?? i10.getColumn("x")[0]
    }, !u2 && {
      data: i10.options.data
    }, t11, h10), u2 && t11.data && (t11.data = i10.options.data), (p2 = ["dataLabelsGroup", "dataLabelsGroups", "dataLabelsParentGroups", "group", "markerGroup", "transformGroup"].concat(p2)).forEach(function(t12) {
      p2[t12] = i10[t12], delete i10[t12];
    });
    let f2 = false;
    if (rj[g2]) {
      if (f2 = g2 !== i10.type, i10.remove(false, false, false, true), f2) if (s10.propFromSeries(), Object.setPrototypeOf) Object.setPrototypeOf(i10, rj[g2].prototype);
      else {
        let t12 = Object.hasOwnProperty.call(i10, "hcEvents") && i10.hcEvents;
        for (c2 in n10) i10[c2] = void 0;
        r2(i10, rj[g2].prototype), t12 ? i10.hcEvents = t12 : delete i10.hcEvents;
      }
    } else r1(17, true, s10, {
      missingModuleFor: g2
    });
    if (p2.forEach(function(t12) {
      i10[t12] = p2[t12];
    }), i10.init(s10, t11), u2 && this.points) for (let t12 of (false === (d2 = i10.options).visible ? (l2.graphic = 1, l2.dataLabel = 1) : (this.hasMarkerChanged(d2, o10) && (l2.graphic = 1), i10.hasDataLabels?.() || (l2.dataLabel = 1)), this.points)) t12?.series && (t12.resolveColor(), Object.keys(l2).length && t12.destroyElements(l2), false === d2.showInLegend && t12.legendItem && s10.legend.destroyItem(t12));
    i10.initialType = r10, s10.linkSeries(), s10.setSortedData(), f2 && i10.linkedSeries.length && (i10.isDirtyData = true), r5(this, "afterUpdate"), as(e10, true) && s10.redraw(!!u2 && void 0);
  }
  setName(t11) {
    this.name = this.options.name = this.userOptions.name = t11, this.chart.isDirtyLegend = true;
  }
  hasOptionChanged(t11) {
    let e10 = this.chart, i10 = this.options[t11], s10 = e10.options.plotOptions, o10 = this.userOptions[t11], r10 = as(s10?.[this.type]?.[t11], s10?.series?.[t11]);
    return o10 && !rK(r10) ? i10 !== o10 : i10 !== as(r10, i10);
  }
  onMouseOver() {
    let t11 = this.chart, e10 = t11.hoverSeries, i10 = t11.pointer;
    i10?.setHoverChartIndex(), e10 && e10 !== this && e10.onMouseOut(), this.options.events.mouseOver && r5(this, "mouseOver"), this.setState("hover"), t11.hoverSeries = this;
  }
  onMouseOut() {
    let t11 = this.options, e10 = this.chart, i10 = e10.tooltip, s10 = e10.hoverPoint;
    e10.hoverSeries = null, s10 && s10.onMouseOut(), this && t11.events.mouseOut && r5(this, "mouseOut"), i10 && !this.stickyTracking && (!i10.shared || this.noSharedTooltip) && i10.hide(), e10.series.forEach(function(t12) {
      t12.setState("", true);
    });
  }
  setState(t11, e10) {
    let i10 = this, {
      graph: s10,
      options: o10
    } = i10, {
      inactiveOtherPoints: r10,
      states: a10
    } = o10, n10 = as(a10?.[t11 || "normal"]?.animation, i10.chart.options.chart.animation), {
      lineWidth: h10,
      opacity: l2
    } = o10;
    if (t11 = t11 || "", i10.state !== t11 && ([i10.group, i10.markerGroup, ...i10.dataLabelsGroups || []].forEach(function(e11) {
      e11 && (i10.state && e11.removeClass("highcharts-series-" + i10.state), t11 && e11.addClass("highcharts-series-" + t11));
    }), i10.state = t11, !i10.chart.styledMode)) {
      if (a10[t11]?.enabled === false) return;
      if (t11 && (h10 = a10[t11].lineWidth || h10 + (a10[t11].lineWidthPlus || 0), l2 = as(a10[t11].opacity, l2)), s10 && !s10.dashstyle && r7(h10)) for (let t12 of [s10, ...this.zones.map((t13) => t13.graph)]) t12?.animate({
        "stroke-width": h10
      }, n10);
      r10 || [i10.group, i10.markerGroup, ...i10.dataLabelsGroups || [], i10.labelBySeries].forEach(function(t12) {
        t12?.animate({
          opacity: l2
        }, n10);
      });
    }
    e10 && r10 && i10.points && i10.setAllPointsToState(t11 || void 0);
  }
  setAllPointsToState(t11) {
    this.points.forEach(function(e10) {
      e10.setState && e10.setState(t11);
    });
  }
  setVisible(t11, e10) {
    let i10 = this, s10 = i10.chart, o10 = s10.options.chart.ignoreHiddenSeries, r10 = i10.visible;
    i10.visible = t11 = i10.options.visible = i10.userOptions.visible = void 0 === t11 ? !r10 : t11;
    let a10 = t11 ? "show" : "hide";
    ["group", "markerGroup", "tracker", "tt"].forEach((t12) => {
      i10[t12]?.[a10]();
    }), i10.dataLabelsGroups?.forEach((t12) => {
      t12?.[a10]();
    }), (s10.hoverSeries === i10 || s10.hoverPoint?.series === i10) && i10.onMouseOut(), i10.legendItem && s10.legend.colorizeItem(i10, t11), i10.isDirty = true, i10.options.stacking && s10.series.forEach((t12) => {
      t12.options.stacking && t12.visible && (t12.isDirty = true);
    }), i10.linkedSeries.forEach((e11) => {
      e11.setVisible(t11, false);
    }), o10 && (s10.isDirtyBox = true), r5(i10, a10), false !== e10 && s10.redraw();
  }
  show() {
    this.setVisible(true);
  }
  hide() {
    this.setVisible(false);
  }
  select(t11) {
    this.selected = t11 = this.options.selected = void 0 === t11 ? !this.selected : t11, this.checkbox && (this.checkbox.checked = t11), r5(this, t11 ? "select" : "unselect");
  }
  shouldShowTooltip(t11, e10, i10 = {}) {
    return i10.series = this, i10.visiblePlotOnly = true, this.chart.isInsidePlot(t11, e10, i10);
  }
  drawLegendSymbol(t11, e10) {
    rO[this.options.legendSymbol || "rectangle"]?.call(this, t11, e10);
  }
};
aa.defaultOptions = {
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
        numberFormatter: t11
      } = this.series.chart;
      return "number" != typeof this.y ? "" : t11(this.y, -1);
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
}, aa.types = rR.seriesTypes, aa.registerType = rR.registerSeriesType, aa.keepProps = ["colorIndex", "eventOptions", "navigatorSeries", "symbolIndex", "baseSeries"], aa.keepPropsForPoints = ["data", "isDirtyData", "isDirtyCanvas", "points", "dataTable", "processedData", "xIncrement", "cropped", "_hasPointMarkers", "hasDataLabels", "nodes", "layout", "level", "mapMap", "mapData", "minY", "maxY", "minX", "maxX", "transformGroups"], r2(aa.prototype, {
  axisTypes: ["xAxis", "yAxis"],
  coll: "series",
  colorCounter: 0,
  directTouch: false,
  invertible: true,
  isCartesian: true,
  kdAxisArray: ["clientX", "plotY"],
  parallelArrays: ["x", "y"],
  pointClass: o7,
  requireSorting: true,
  sorted: true
}), rR.series = aa;
var an = aa;
var {
  animObject: ah,
  setAnimation: al
} = t3;
var {
  registerEventOptions: ad
} = sg;
var {
  composed: ac,
  marginNames: ap
} = N;
var {
  distribute: ag
} = eL;
var {
  format: au
} = ew;
var {
  addEvent: af,
  createElement: am,
  css: ax,
  defined: ay,
  discardElement: ab,
  find: av,
  fireEvent: ak,
  isNumber: aM,
  merge: aw,
  pick: aS,
  pushUnique: aT,
  relativeLength: aC,
  stableSort: aA,
  syncTimeout: aP
} = ta;
var aL = class {
  constructor(t11, e10) {
    this.allItems = [], this.initialItemY = 0, this.itemHeight = 0, this.itemMarginBottom = 0, this.itemMarginTop = 0, this.itemX = 0, this.itemY = 0, this.lastItemY = 0, this.lastLineHeight = 0, this.legendHeight = 0, this.legendWidth = 0, this.maxItemWidth = 0, this.maxLegendWidth = 0, this.offsetWidth = 0, this.padding = 0, this.pages = [], this.symbolHeight = 0, this.symbolWidth = 0, this.titleHeight = 0, this.totalItemWidth = 0, this.widthOption = 0, this.chart = t11, this.setOptions(e10), e10.enabled && (this.render(), ad(this, e10), af(this.chart, "endResize", function() {
      this.legend.positionCheckboxes();
    })), af(this.chart, "render", () => {
      this.options.enabled && this.proximate && (this.proximatePositions(), this.positionItems());
    });
  }
  setOptions(t11) {
    let e10 = aS(t11.padding, 8);
    this.options = t11, this.chart.styledMode || (this.itemStyle = t11.itemStyle, this.itemHiddenStyle = aw(this.itemStyle, t11.itemHiddenStyle)), this.itemMarginTop = t11.itemMarginTop, this.itemMarginBottom = t11.itemMarginBottom, this.padding = e10, this.initialItemY = e10 - 5, this.symbolWidth = aS(t11.symbolWidth, 16), this.pages = [], this.proximate = "proximate" === t11.layout && !this.chart.inverted, this.baseline = void 0;
  }
  update(t11, e10) {
    let i10 = this.chart;
    this.setOptions(aw(true, this.options, t11)), "events" in this.options && ad(this, this.options), this.destroy(), i10.isDirtyLegend = i10.isDirtyBox = true, aS(e10, true) && i10.redraw(), ak(this, "afterUpdate", {
      redraw: e10
    });
  }
  colorizeItem(t11, e10) {
    let i10 = t11.color, {
      area: s10,
      group: o10,
      label: r10,
      line: a10,
      symbol: n10
    } = t11.legendItem || {};
    if ((t11 instanceof an || t11 instanceof o7) && (t11.color = t11.options?.legendSymbolColor || i10), o10?.[e10 ? "removeClass" : "addClass"]("highcharts-legend-item-hidden"), !this.chart.styledMode) {
      let {
        itemHiddenStyle: i11 = {}
      } = this, o11 = i11.color, {
        fillColor: h10,
        fillOpacity: l2,
        lineColor: d2,
        marker: c2
      } = t11.options, p2 = (t12) => (!e10 && (t12.fill && (t12.fill = o11), t12.stroke && (t12.stroke = o11)), t12);
      r10?.css(aw(e10 ? this.itemStyle : i11)), a10?.attr(p2({
        stroke: d2 || t11.color
      })), n10 && n10.attr(p2(c2 && n10.isMarker ? t11.pointAttribs() : {
        fill: t11.color
      })), s10?.attr(p2({
        fill: h10 || t11.color,
        "fill-opacity": h10 ? 1 : l2 ?? 0.75
      }));
    }
    t11.color = i10, ak(this, "afterColorizeItem", {
      item: t11,
      visible: e10
    });
  }
  positionItems() {
    this.allItems.forEach(this.positionItem, this), this.chart.isResizing || this.positionCheckboxes();
  }
  positionItem(t11) {
    let {
      group: e10,
      x: i10 = 0,
      y: s10 = 0
    } = t11.legendItem || {}, o10 = this.options, r10 = o10.symbolPadding, a10 = !o10.rtl, n10 = t11.checkbox;
    if (e10?.element) {
      let o11 = {
        translateX: a10 ? i10 : this.legendWidth - i10 - 2 * r10 - 4,
        translateY: s10
      }, n11 = () => {
        ak(this, "afterPositionItem", {
          item: t11
        });
      };
      e10[ay(e10.translateY) ? "animate" : "attr"](o11, void 0, n11);
    }
    n10 && (n10.x = i10, n10.y = s10);
  }
  destroyItem(t11) {
    let e10 = t11.legendItem || {};
    for (let t12 of ["group", "label", "line", "symbol"]) e10[t12] && (e10[t12] = e10[t12].destroy());
    t11.checkbox = ab(t11.checkbox), t11.legendItem = void 0;
  }
  destroy() {
    for (let t11 of this.getAllItems()) this.destroyItem(t11);
    for (let t11 of ["clipRect", "up", "down", "pager", "nav", "box", "title", "group"]) this[t11] && (this[t11] = this[t11].destroy());
    this.display = null;
  }
  positionCheckboxes() {
    let t11, e10 = this.group?.alignAttr, i10 = this.clipHeight || this.legendHeight, s10 = this.titleHeight;
    e10 && (t11 = e10.translateY, this.allItems.forEach(function(o10) {
      let r10, a10 = o10.checkbox;
      a10 && (r10 = t11 + s10 + a10.y + (this.scrollOffset || 0) + 3, ax(a10, {
        left: e10.translateX + o10.checkboxOffset + a10.x - 20 + "px",
        top: r10 + "px",
        display: this.proximate || r10 > t11 - 6 && r10 < t11 + i10 - 6 ? "" : "none"
      }));
    }, this));
  }
  renderTitle() {
    let t11 = this.options, e10 = this.padding, i10 = t11.title, s10, o10 = 0;
    i10.text && (this.title || (this.title = this.chart.renderer.label(i10.text, e10 - 3, e10 - 4, void 0, void 0, void 0, t11.useHTML, void 0, "legend-title").attr({
      zIndex: 1
    }), this.chart.styledMode || this.title.css(i10.style), this.title.add(this.group)), i10.width || this.title.css({
      width: this.maxLegendWidth + "px"
    }), o10 = (s10 = this.title.getBBox()).height, this.offsetWidth = s10.width, this.contentGroup.attr({
      translateY: o10
    })), this.titleHeight = o10;
  }
  setText(t11) {
    let e10 = this.options;
    t11.legendItem.label.attr({
      text: e10.labelFormat ? au(e10.labelFormat, t11, this.chart) : e10.labelFormatter.call(t11)
    });
  }
  renderItem(t11) {
    let e10 = t11.legendItem = t11.legendItem || {}, i10 = this.chart, s10 = i10.renderer, o10 = this.options, r10 = "horizontal" === o10.layout, a10 = this.symbolWidth, n10 = o10.symbolPadding || 0, h10 = this.itemStyle, l2 = this.itemHiddenStyle, d2 = r10 ? aS(o10.itemDistance, 20) : 0, c2 = !o10.rtl, p2 = !t11.series, g2 = !p2 && t11.series.drawLegendSymbol ? t11.series : t11, u2 = g2.options, f2 = !!this.createCheckboxForItem && u2 && u2.showCheckbox, m2 = o10.useHTML, x2 = t11.options.className, y2 = e10.label, b2 = a10 + n10 + d2 + 20 * !!f2;
    !y2 && (e10.group = s10.g("legend-item").addClass("highcharts-" + g2.type + "-series highcharts-color-" + t11.colorIndex + (x2 ? " " + x2 : "") + (p2 ? " highcharts-series-" + t11.index : "")).attr({
      zIndex: 1
    }).add(this.scrollGroup), e10.label = y2 = s10.text("", c2 ? a10 + n10 : -n10, this.baseline || 0, m2), i10.styledMode || y2.css(aw(t11.visible ? h10 : l2)), y2.attr({
      align: c2 ? "left" : "right",
      zIndex: 2
    }).add(e10.group), !this.baseline && (this.fontMetrics = s10.fontMetrics(y2), this.baseline = this.fontMetrics.f + 3 + this.itemMarginTop, y2.attr("y", this.baseline), this.symbolHeight = aS(o10.symbolHeight, this.fontMetrics.f), o10.squareSymbol && (this.symbolWidth = aS(o10.symbolWidth, Math.max(this.symbolHeight, 16)), b2 = this.symbolWidth + n10 + d2 + 20 * !!f2, c2 && y2.attr("x", this.symbolWidth + n10))), g2.drawLegendSymbol(this, t11), this.setItemEvents && this.setItemEvents(t11, y2, m2)), f2 && !t11.checkbox && this.createCheckboxForItem && this.createCheckboxForItem(t11), this.colorizeItem(t11, t11.visible), (i10.styledMode || !h10.width) && y2.css({
      width: Math.min(o10.itemWidth || this.widthOption || i10.spacingBox.width, o10.maxWidth ? aC(o10.maxWidth, i10.chartWidth) : 1 / 0) - b2 + "px"
    }), this.setText(t11);
    let v2 = y2.getBBox(), k2 = this.fontMetrics?.h || 0;
    t11.itemWidth = t11.checkboxOffset = o10.itemWidth || e10.labelWidth || v2.width + b2, this.maxItemWidth = Math.max(this.maxItemWidth, t11.itemWidth), this.totalItemWidth += t11.itemWidth, this.itemHeight = t11.itemHeight = Math.round(e10.labelHeight || (v2.height > 1.5 * k2 ? v2.height : k2));
  }
  layoutItem(t11) {
    let e10 = this.options, i10 = this.padding, s10 = "horizontal" === e10.layout, o10 = t11.itemHeight, r10 = this.itemMarginBottom, a10 = this.itemMarginTop, n10 = s10 ? aS(e10.itemDistance, 20) : 0, h10 = this.maxLegendWidth, l2 = e10.alignColumns && this.totalItemWidth > h10 ? this.maxItemWidth : t11.itemWidth, d2 = t11.legendItem || {};
    s10 && this.itemX - i10 + l2 > h10 && (this.itemX = i10, this.lastLineHeight && (this.itemY += a10 + this.lastLineHeight + r10), this.lastLineHeight = 0), this.lastItemY = a10 + this.itemY + r10, this.lastLineHeight = Math.max(o10, this.lastLineHeight), d2.x = this.itemX, d2.y = this.itemY, s10 ? this.itemX += l2 : (this.itemY += a10 + o10 + r10, this.lastLineHeight = o10), this.offsetWidth = this.widthOption || Math.max((s10 ? this.itemX - i10 - (t11.checkbox ? 0 : n10) : l2) + i10, this.offsetWidth);
  }
  getAllItems() {
    let t11 = [];
    return this.chart.series.forEach(function(e10) {
      let i10 = e10?.options;
      e10 && aS(i10.showInLegend, !ay(i10.linkedTo) && void 0, true) && (t11 = t11.concat(e10.legendItem?.labels || ("point" === i10.legendType ? e10.data : e10)));
    }), ak(this, "afterGetAllItems", {
      allItems: t11
    }), t11;
  }
  getAlignment() {
    let t11 = this.options;
    return this.proximate ? t11.align.charAt(0) + "tv" : t11.floating ? "" : t11.align.charAt(0) + t11.verticalAlign.charAt(0) + t11.layout.charAt(0);
  }
  adjustMargins(t11, e10) {
    let i10 = this.chart, s10 = this.options, o10 = this.getAlignment();
    o10 && [/(lth|ct|rth)/, /(rtv|rm|rbv)/, /(rbh|cb|lbh)/, /(lbv|lm|ltv)/].forEach((r10, a10) => {
      r10.test(o10) && !ay(t11[a10]) && (i10[ap[a10]] = Math.max(i10[ap[a10]], i10.legend[(a10 + 1) % 2 ? "legendHeight" : "legendWidth"] + [1, -1, -1, 1][a10] * s10[a10 % 2 ? "x" : "y"] + (s10.margin ?? 12) + e10[a10] + (i10.titleOffset[a10] || 0)));
    });
  }
  proximatePositions() {
    let t11, e10 = this.chart, i10 = [], s10 = "left" === this.options.align;
    for (let o10 of (this.allItems.forEach(function(t12) {
      let o11, r10, a10 = s10, n10, h10;
      t12.yAxis && (t12.xAxis.options.reversed && (a10 = !a10), t12.points && (o11 = av(a10 ? t12.points : t12.points.slice(0).reverse(), function(t13) {
        return aM(t13.plotY);
      })), r10 = this.itemMarginTop + t12.legendItem.label.getBBox().height + this.itemMarginBottom, h10 = t12.yAxis.top - e10.plotTop, n10 = t12.visible ? (o11 ? o11.plotY : t12.yAxis.height) + (h10 - 0.3 * r10) : h10 + t12.yAxis.height, i10.push({
        target: n10,
        size: r10,
        item: t12
      }));
    }, this), ag(i10, e10.plotHeight))) t11 = o10.item.legendItem || {}, aM(o10.pos) && (t11.y = e10.plotTop - e10.spacing[0] + o10.pos);
  }
  render() {
    let t11 = this.chart, e10 = t11.spacingBox.width, i10 = t11.renderer, s10 = this.options, o10 = this.padding, r10 = this.getAllItems(), a10, n10, h10, l2 = this.group, d2, c2 = this.box;
    this.itemX = o10, this.itemY = this.initialItemY, this.offsetWidth = 0, this.lastItemY = 0, this.widthOption = aC(s10.width, e10 - o10), d2 = e10 - 2 * o10 - s10.x, ["rm", "lm"].indexOf(this.getAlignment().substring(0, 2)) > -1 && (d2 /= 2), this.maxLegendWidth = this.widthOption || d2, l2 || (this.group = l2 = i10.g("legend").addClass(s10.className || "").attr({
      zIndex: 7
    }).add(), this.contentGroup = i10.g().attr({
      zIndex: 1
    }).add(l2), this.scrollGroup = i10.g().add(this.contentGroup)), this.renderTitle(), aA(r10, (t12, e11) => (t12.options?.legendIndex || 0) - (e11.options?.legendIndex || 0)), s10.reversed && r10.reverse(), this.allItems = r10, this.display = a10 = !!r10.length, this.lastLineHeight = 0, this.maxItemWidth = 0, this.totalItemWidth = 0, this.itemHeight = 0, r10.forEach(this.renderItem, this), r10.forEach(this.layoutItem, this), n10 = (s10.maxWidth ? Math.min(this.widthOption || this.offsetWidth, d2, aC(s10.maxWidth, t11.chartWidth) || 1 / 0) : this.widthOption || this.offsetWidth) + o10, h10 = this.lastItemY + this.lastLineHeight + this.titleHeight, h10 = this.handleOverflow(h10) + o10, c2 || (this.box = c2 = i10.rect().addClass("highcharts-legend-box").attr({
      r: s10.borderRadius
    }).add(l2)), t11.styledMode || c2.attr({
      stroke: s10.borderColor,
      "stroke-width": s10.borderWidth || 0,
      fill: s10.backgroundColor || "none"
    }).shadow(s10.shadow), n10 > 0 && h10 > 0 && c2[c2.placed ? "animate" : "attr"](c2.crisp.call({}, {
      x: 0,
      y: 0,
      width: n10,
      height: h10
    }, c2.strokeWidth())), l2[a10 ? "show" : "hide"](), t11.styledMode && "none" === l2.getStyle("display") && (n10 = h10 = 0), this.legendWidth = n10, this.legendHeight = h10, a10 && this.align(), this.proximate || this.positionItems(), ak(this, "afterRender");
  }
  align(t11 = this.chart.spacingBox) {
    let e10 = this.chart, i10 = this.options, s10 = t11.y;
    /(lth|ct|rth)/.test(this.getAlignment()) && e10.titleOffset[0] > 0 ? s10 += e10.titleOffset[0] : /(lbh|cb|rbh)/.test(this.getAlignment()) && e10.titleOffset[2] > 0 && (s10 -= e10.titleOffset[2]), s10 !== t11.y && (t11 = aw(t11, {
      y: s10
    })), e10.hasRendered || (this.group.placed = false), this.group.align(aw(i10, {
      width: this.legendWidth,
      height: this.legendHeight,
      verticalAlign: this.proximate ? "top" : i10.verticalAlign
    }), true, t11);
  }
  handleOverflow(t11) {
    let e10 = this, i10 = this.chart, s10 = i10.renderer, o10 = this.options, r10 = o10.y, a10 = "top" === o10.verticalAlign, n10 = this.padding, h10 = o10.maxHeight, l2 = o10.navigation, d2 = aS(l2.animation, true), c2 = l2.arrowSize || 12, p2 = this.pages, g2 = this.allItems, u2 = function(t12) {
      "number" == typeof t12 ? M2.attr({
        height: t12
      }) : M2 && (e10.clipRect = M2.destroy(), e10.contentGroup.clip()), e10.contentGroup.div && (e10.contentGroup.div.style.clip = t12 ? "rect(" + n10 + "px,9999px," + (n10 + t12) + "px,0)" : "auto");
    }, f2 = function(t12) {
      return e10[t12] = s10.circle(0, 0, 1.3 * c2).translate(c2 / 2, c2 / 2).add(k2), i10.styledMode || e10[t12].attr("fill", "rgba(0,0,0,0.0001)"), e10[t12];
    }, m2, x2, y2, b2, v2 = i10.spacingBox.height + (a10 ? -r10 : r10) - n10, k2 = this.nav, M2 = this.clipRect;
    return "horizontal" !== o10.layout || "middle" === o10.verticalAlign || o10.floating || (v2 /= 2), h10 && (v2 = Math.min(v2, h10)), p2.length = 0, t11 && v2 > 0 && t11 > v2 && false !== l2.enabled ? (this.clipHeight = m2 = Math.max(v2 - 20 - this.titleHeight - n10, 0), this.currentPage = aS(this.currentPage, 1), this.fullHeight = t11, g2.forEach((t12, e11) => {
      let i11 = (y2 = t12.legendItem || {}).y || 0, s11 = Math.round(y2.label.getBBox().height), o11 = p2.length;
      (!o11 || i11 - p2[o11 - 1] > m2 && (x2 || i11) !== p2[o11 - 1]) && (p2.push(x2 || i11), o11++), y2.pageIx = o11 - 1, x2 && b2 && (b2.pageIx = o11 - 1), e11 === g2.length - 1 && i11 + s11 - p2[o11 - 1] > m2 && i11 > p2[o11 - 1] && (p2.push(i11), y2.pageIx = o11), i11 !== x2 && (x2 = i11), b2 = y2;
    }), M2 || (M2 = e10.clipRect = s10.clipRect(0, n10 - 2, 9999, 0), e10.contentGroup.clip(M2)), u2(m2), k2 || (this.nav = k2 = s10.g().attr({
      zIndex: 1
    }).add(this.group), this.up = s10.symbol("triangle", 0, 0, c2, c2).add(k2), f2("upTracker").on("click", function() {
      e10.scroll(-1, d2);
    }), this.pager = s10.text("", 15, 10).addClass("highcharts-legend-navigation"), !i10.styledMode && l2.style && this.pager.css(l2.style), this.pager.add(k2), this.down = s10.symbol("triangle-down", 0, 0, c2, c2).add(k2), f2("downTracker").on("click", function() {
      e10.scroll(1, d2);
    })), e10.scroll(0), t11 = v2) : k2 && (u2(), this.nav = k2.destroy(), this.scrollGroup.attr({
      translateY: 1
    }), this.clipHeight = 0), t11;
  }
  scroll(t11, e10) {
    let i10 = this.chart, s10 = this.pages, o10 = s10.length, r10 = this.clipHeight, a10 = this.options.navigation, n10 = this.pager, h10 = this.padding, l2 = this.currentPage + t11;
    l2 > o10 && (l2 = o10), l2 > 0 && (void 0 !== e10 && al(e10, i10), this.nav.attr({
      translateX: h10,
      translateY: r10 + this.padding + 7 + this.titleHeight,
      visibility: "inherit"
    }), [this.up, this.upTracker].forEach(function(t12) {
      t12.attr({
        class: 1 === l2 ? "highcharts-legend-nav-inactive" : "highcharts-legend-nav-active"
      });
    }), n10.attr({
      text: l2 + "/" + o10
    }), [this.down, this.downTracker].forEach(function(t12) {
      t12.attr({
        x: 18 + this.pager.getBBox().width,
        class: l2 === o10 ? "highcharts-legend-nav-inactive" : "highcharts-legend-nav-active"
      });
    }, this), i10.styledMode || (this.up.attr({
      fill: 1 === l2 ? a10.inactiveColor : a10.activeColor
    }), this.upTracker.css({
      cursor: 1 === l2 ? "default" : "pointer"
    }), this.down.attr({
      fill: l2 === o10 ? a10.inactiveColor : a10.activeColor
    }), this.downTracker.css({
      cursor: l2 === o10 ? "default" : "pointer"
    })), this.scrollOffset = -s10[l2 - 1] + this.initialItemY, this.scrollGroup.animate({
      translateY: this.scrollOffset
    }), this.currentPage = l2, this.positionCheckboxes(), aP(() => {
      ak(this, "afterScroll", {
        currentPage: l2
      });
    }, ah(aS(e10, i10.renderer.globalAnimation, true)).duration));
  }
  setItemEvents(t11, e10, i10) {
    let s10 = this, o10 = t11.legendItem || {}, r10 = s10.chart.renderer.boxWrapper, a10 = t11 instanceof o7, n10 = t11 instanceof an, h10 = "highcharts-legend-" + (a10 ? "point" : "series") + "-active", l2 = s10.chart.styledMode, d2 = i10 ? [e10, o10.symbol] : [o10.group], c2 = (e11) => {
      s10.allItems.forEach((i11) => {
        t11 !== i11 && [i11].concat(i11.linkedSeries || []).forEach((t12) => {
          t12.setState(e11, !a10);
        });
      });
    };
    for (let i11 of d2) i11 && i11.on("mouseover", function() {
      t11.visible && c2("inactive"), t11.setState("hover"), t11.visible && r10.addClass(h10), l2 || e10.css(s10.options.itemHoverStyle);
    }).on("mouseout", function() {
      s10.chart.styledMode || e10.css(aw(t11.visible ? s10.itemStyle : s10.itemHiddenStyle)), c2(""), r10.removeClass(h10), t11.setState();
    }).on("click", function(e11) {
      let i12 = function() {
        t11.setVisible && t11.setVisible(), c2(t11.visible ? "inactive" : "");
      };
      r10.removeClass(h10), ak(s10, "itemClick", {
        browserEvent: e11,
        legendItem: t11
      }, i12), a10 ? t11.firePointEvent("legendItemClick", {
        browserEvent: e11
      }) : n10 && ak(t11, "legendItemClick", {
        browserEvent: e11
      });
    });
  }
  createCheckboxForItem(t11) {
    t11.checkbox = am("input", {
      type: "checkbox",
      className: "highcharts-legend-checkbox",
      checked: t11.selected,
      defaultChecked: t11.selected
    }, this.options.itemCheckboxStyle, this.chart.container), af(t11.checkbox, "click", function(e10) {
      let i10 = e10.target;
      ak(t11.series || t11, "checkboxClick", {
        checked: i10.checked,
        item: t11
      }, function() {
        t11.select();
      });
    });
  }
};
(p = aL || (aL = {})).compose = function(t11) {
  aT(ac, "Core.Legend") && af(t11, "beforeMargins", function() {
    this.legend = new p(this, this.options.legend);
  });
};
var aO = aL;
var {
  animate: aE,
  animObject: aI,
  setAnimation: aD
} = t3;
var {
  defaultOptions: aB
} = tI;
var {
  numberFormat: aN
} = ew;
var {
  registerEventOptions: az
} = sg;
var {
  charts: aR,
  doc: aW,
  marginNames: aX,
  svg: aF,
  win: aG
} = N;
var {
  seriesTypes: aH
} = rR;
var {
  addEvent: aY,
  attr: aj,
  createElement: aU,
  css: a$,
  defined: aV,
  diffObjects: aZ,
  discardElement: aq,
  erase: a_,
  error: aK,
  extend: aJ,
  find: aQ,
  fireEvent: a0,
  getAlignFactor: a1,
  getStyle: a2,
  isArray: a3,
  isNumber: a5,
  isObject: a6,
  isString: a9,
  merge: a4,
  objectEach: a8,
  pick: a7,
  pInt: nt,
  relativeLength: ne,
  removeEvent: ni,
  splat: ns,
  syncTimeout: no,
  uniqueKey: nr
} = ta;
var na = class _na {
  static chart(t11, e10, i10) {
    return new _na(t11, e10, i10);
  }
  constructor(t11, e10, i10) {
    this.sharedClips = {};
    let s10 = [...arguments];
    (a9(t11) || t11.nodeName) && (this.renderTo = s10.shift()), this.init(s10[0], s10[1]);
  }
  setZoomOptions() {
    let t11 = this.options.chart, e10 = t11.zooming;
    this.zooming = __spreadProps(__spreadValues({}, e10), {
      type: a7(t11.zoomType, e10.type),
      key: a7(t11.zoomKey, e10.key),
      pinchType: a7(t11.pinchType, e10.pinchType),
      singleTouch: a7(t11.zoomBySingleTouch, e10.singleTouch, false),
      resetButton: a4(e10.resetButton, t11.resetZoomButton)
    });
  }
  init(t11, e10) {
    a0(this, "init", {
      args: arguments
    }, function() {
      let i10 = a4(aB, t11), s10 = i10.chart, o10 = this.renderTo || s10.renderTo;
      this.userOptions = aJ({}, t11), (this.renderTo = a9(o10) ? aW.getElementById(o10) : o10) || aK(13, true, this), this.margin = [], this.spacing = [], this.labelCollectors = [], this.callback = e10, this.isResizing = 0, this.options = i10, this.axes = [], this.series = [], this.locale = i10.lang.locale ?? this.renderTo.closest("[lang]")?.lang, this.time = new tC(aJ(i10.time || {}, {
        locale: this.locale
      }), i10.lang), i10.time = this.time.options, this.numberFormatter = (s10.numberFormatter || aN).bind(this), this.styledMode = s10.styledMode, this.hasCartesianSeries = s10.showAxes, this.index = aR.length, aR.push(this), N.chartCount++, az(this, s10), this.xAxis = [], this.yAxis = [], this.pointCount = this.colorCounter = this.symbolCounter = 0, this.setZoomOptions(), a0(this, "afterInit"), this.firstRender();
    });
  }
  initSeries(t11) {
    let e10 = this.options.chart, i10 = t11.type || e10.type, s10 = aH[i10];
    s10 || aK(17, true, this, {
      missingModuleFor: i10
    });
    let o10 = new s10();
    return "function" == typeof o10.init && o10.init(this, t11), o10;
  }
  setSortedData() {
    this.getSeriesOrderByLinks().forEach(function(t11) {
      t11.points || t11.data || !t11.enabledDataSorting || t11.setData(t11.options.data, false);
    });
  }
  getSeriesOrderByLinks() {
    return this.series.concat().sort(function(t11, e10) {
      return t11.linkedSeries.length || e10.linkedSeries.length ? e10.linkedSeries.length - t11.linkedSeries.length : 0;
    });
  }
  orderItems(t11, e10 = 0) {
    let i10 = this[t11], s10 = this.options[t11] = ns(this.options[t11]).slice(), o10 = this.userOptions[t11] = this.userOptions[t11] ? ns(this.userOptions[t11]).slice() : [];
    if (this.hasRendered && (s10.splice(e10), o10.splice(e10)), i10) for (let t12 = e10, r10 = i10.length; t12 < r10; ++t12) {
      let e11 = i10[t12];
      e11 && (e11.index = t12, e11 instanceof an && (e11.name = e11.getName()), e11.options.isInternal || (s10[t12] = e11.options, o10[t12] = e11.userOptions));
    }
  }
  getClipBox(t11, e10) {
    let i10 = this.inverted, {
      xAxis: s10,
      yAxis: o10
    } = t11 || {}, {
      x: r10,
      y: a10,
      width: n10,
      height: h10
    } = a4(this.clipBox);
    return t11 && (s10 && s10.len !== this.plotSizeX && (n10 = s10.len), o10 && o10.len !== this.plotSizeY && (h10 = o10.len), i10 && !t11.invertible && ([n10, h10] = [h10, n10])), e10 && (r10 += (i10 ? o10 : s10)?.pos ?? this.plotLeft, a10 += (i10 ? s10 : o10)?.pos ?? this.plotTop), {
      x: r10,
      y: a10,
      width: n10,
      height: h10
    };
  }
  isInsidePlot(t11, e10, i10 = {}) {
    let {
      inverted: s10,
      plotBox: o10,
      plotLeft: r10,
      plotTop: a10,
      scrollablePlotBox: n10
    } = this, {
      scrollLeft: h10 = 0,
      scrollTop: l2 = 0
    } = i10.visiblePlotOnly && this.scrollablePlotArea?.scrollingContainer || {}, d2 = i10.series, c2 = i10.visiblePlotOnly && n10 || o10, p2 = i10.inverted ? e10 : t11, g2 = i10.inverted ? t11 : e10, u2 = {
      x: p2,
      y: g2,
      isInsidePlot: true,
      options: i10
    };
    if (!i10.ignoreX) {
      let t12 = d2 && (s10 && !this.polar ? d2.yAxis : d2.xAxis) || {
        pos: r10,
        len: 1 / 0
      }, e11 = i10.paneCoordinates ? t12.pos + p2 : r10 + p2;
      e11 >= Math.max(h10 + r10, t12.pos) && e11 <= Math.min(h10 + r10 + c2.width, t12.pos + t12.len) || (u2.isInsidePlot = false);
    }
    if (!i10.ignoreY && u2.isInsidePlot) {
      let t12 = !s10 && i10.axis && !i10.axis.isXAxis && i10.axis || d2 && (s10 ? d2.xAxis : d2.yAxis) || {
        pos: a10,
        len: 1 / 0
      }, e11 = i10.paneCoordinates ? t12.pos + g2 : a10 + g2;
      e11 >= Math.max(l2 + a10, t12.pos) && e11 <= Math.min(l2 + a10 + c2.height, t12.pos + t12.len) || (u2.isInsidePlot = false);
    }
    return a0(this, "afterIsInsidePlot", u2), u2.isInsidePlot;
  }
  redraw(t11) {
    a0(this, "beforeRedraw");
    let e10 = this.hasCartesianSeries ? this.axes : this.colorAxis || [], i10 = this.series, s10 = this.pointer, o10 = this.legend, r10 = this.userOptions.legend, a10 = this.renderer, n10 = a10.isHidden(), h10 = [], l2, d2, c2, p2 = this.isDirtyBox, g2 = this.isDirtyLegend, u2;
    for (a10.rootFontSize = a10.boxWrapper.getStyle("font-size"), this.setResponsive && this.setResponsive(false), aD(!!this.hasRendered && t11, this), n10 && this.temporaryDisplay(), this.layOutTitles(false), c2 = i10.length; c2--; ) if (((u2 = i10[c2]).options.stacking || u2.options.centerInCategory) && (d2 = true, u2.isDirty)) {
      l2 = true;
      break;
    }
    if (l2) for (c2 = i10.length; c2--; ) (u2 = i10[c2]).options.stacking && (u2.isDirty = true);
    i10.forEach(function(t12) {
      t12.isDirty && ("point" === t12.options.legendType ? ("function" == typeof t12.updateTotals && t12.updateTotals(), g2 = true) : r10 && (r10.labelFormatter || r10.labelFormat) && (g2 = true)), t12.isDirtyData && a0(t12, "updatedData");
    }), g2 && o10 && o10.options.enabled && (o10.render(), this.isDirtyLegend = false), d2 && this.getStacks(), e10.forEach(function(t12) {
      t12.updateNames(), t12.setScale();
    }), this.getMargins(), e10.forEach(function(t12) {
      t12.isDirty && (p2 = true);
    }), e10.forEach(function(t12) {
      let e11 = t12.min + "," + t12.max;
      t12.extKey !== e11 && (t12.extKey = e11, h10.push(function() {
        a0(t12, "afterSetExtremes", aJ(t12.eventArgs, t12.getExtremes())), delete t12.eventArgs;
      })), (p2 || d2) && t12.redraw();
    }), p2 && this.drawChartBox(), a0(this, "predraw"), i10.forEach(function(t12) {
      (p2 || t12.isDirty) && t12.visible && t12.redraw(), t12.isDirtyData = false;
    }), s10 && s10.reset(true), a10.draw(), a0(this, "redraw"), a0(this, "render"), n10 && this.temporaryDisplay(true), h10.forEach(function(t12) {
      t12.call();
    });
  }
  get(t11) {
    let e10 = this.series;
    function i10(e11) {
      return e11.id === t11 || e11.options && e11.options.id === t11;
    }
    let s10 = aQ(this.axes, i10) || aQ(this.series, i10);
    for (let t12 = 0; !s10 && t12 < e10.length; t12++) s10 = aQ(e10[t12].points || [], i10);
    return s10;
  }
  createAxes() {
    let t11 = this.userOptions;
    for (let e10 of (a0(this, "createAxes"), ["xAxis", "yAxis"])) for (let i10 of t11[e10] = ns(t11[e10] || {})) new s3(this, i10, e10);
    a0(this, "afterCreateAxes");
  }
  getSelectedPoints() {
    return this.series.reduce((t11, e10) => (e10.getPointsCollection().forEach((e11) => {
      a7(e11.selectedStaging, e11.selected) && t11.push(e11);
    }), t11), []);
  }
  getSelectedSeries() {
    return this.series.filter((t11) => t11.selected);
  }
  setTitle(t11, e10, i10) {
    this.applyDescription("title", t11), this.applyDescription("subtitle", e10), this.applyDescription("caption", void 0), this.layOutTitles(i10);
  }
  applyDescription(t11, e10) {
    let i10 = this, s10 = this.options[t11] = a4(this.options[t11], e10), o10 = this[t11];
    o10 && e10 && (this[t11] = o10 = o10.destroy()), s10 && !o10 && ((o10 = this.renderer.text(s10.text, 0, 0, s10.useHTML).attr({
      align: s10.align,
      class: "highcharts-" + t11,
      zIndex: s10.zIndex || 4
    }).css({
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }).add()).update = function(e11, s11) {
      i10.applyDescription(t11, e11), i10.layOutTitles(s11);
    }, this.styledMode || o10.css(aJ("title" === t11 ? {
      fontSize: this.options.isStock ? "1em" : "1.2em"
    } : {}, s10.style)), o10.textPxLength = o10.getBBox().width, o10.css({
      whiteSpace: s10.style?.whiteSpace
    }), this[t11] = o10);
  }
  layOutTitles(t11 = true) {
    let e10 = [0, 0, 0], {
      options: i10,
      renderer: s10,
      spacingBox: o10
    } = this;
    ["title", "subtitle", "caption"].forEach((t12) => {
      let i11 = this[t12], r11 = this.options[t12], a10 = a4(o10), n10 = i11?.textPxLength || 0;
      if (i11 && r11) {
        a0(this, "layOutTitle", {
          alignTo: a10,
          key: t12,
          textPxLength: n10
        });
        let o11 = s10.fontMetrics(i11), h10 = o11.b, l2 = o11.h, d2 = r11.verticalAlign || "top", c2 = "top" === d2, p2 = c2 && r11.minScale || 1, g2 = "title" === t12 ? c2 ? -3 : 0 : c2 ? e10[0] + 2 : 0, u2 = Math.min(a10.width / n10, 1), f2 = Math.max(p2, u2), m2 = a4({
          y: "bottom" === d2 ? h10 : g2 + h10
        }, {
          align: "title" === t12 ? u2 < p2 ? "left" : "center" : this.title?.alignValue
        }, r11), x2 = (r11.width || (u2 > p2 ? this.chartWidth : a10.width) / f2) + "px";
        i11.alignValue !== m2.align && (i11.placed = false);
        let y2 = Math.round(i11.css({
          width: x2
        }).getBBox(r11.useHTML).height);
        if (m2.height = y2, i11.align(m2, false, a10).attr({
          align: m2.align,
          scaleX: f2,
          scaleY: f2,
          "transform-origin": `${a10.x + n10 * f2 * a1(m2.align)} ${l2}`
        }), !r11.floating) {
          let t13 = y2 * (y2 < 1.2 * l2 ? 1 : f2);
          "top" === d2 ? e10[0] = Math.ceil(e10[0] + t13) : "bottom" === d2 && (e10[2] = Math.ceil(e10[2] + t13));
        }
      }
    }, this), e10[0] && "top" === (i10.title?.verticalAlign || "top") && (e10[0] += i10.title?.margin || 0), e10[2] && i10.caption?.verticalAlign === "bottom" && (e10[2] += i10.caption?.margin || 0);
    let r10 = !this.titleOffset || this.titleOffset.join(",") !== e10.join(",");
    this.titleOffset = e10, a0(this, "afterLayOutTitles"), !this.isDirtyBox && r10 && (this.isDirtyBox = this.isDirtyLegend = r10, this.hasRendered && t11 && this.isDirtyBox && this.redraw());
  }
  getContainerBox() {
    let t11 = [].map.call(this.renderTo.children, (t12) => {
      if (t12 !== this.container) {
        let e11 = t12.style.display;
        return t12.style.display = "none", [t12, e11];
      }
    }), e10 = {
      width: a2(this.renderTo, "width", true) || 0,
      height: a2(this.renderTo, "height", true) || 0
    };
    return t11.filter(Boolean).forEach(([t12, e11]) => {
      t12.style.display = e11;
    }), e10;
  }
  getChartSize() {
    let t11 = this.options.chart, e10 = t11.width, i10 = t11.height, s10 = this.getContainerBox(), o10 = s10.height <= 1 || !this.renderTo.parentElement?.style.height && "100%" === this.renderTo.style.height;
    this.chartWidth = Math.max(0, e10 || s10.width || 600), this.chartHeight = Math.max(0, ne(i10, this.chartWidth) || (o10 ? 400 : s10.height)), this.containerBox = s10;
  }
  temporaryDisplay(t11) {
    let e10 = this.renderTo, i10;
    if (t11) for (; e10?.style; ) e10.hcOrigStyle && (a$(e10, e10.hcOrigStyle), delete e10.hcOrigStyle), e10.hcOrigDetached && (aW.body.removeChild(e10), e10.hcOrigDetached = false), e10 = e10.parentNode;
    else for (; e10?.style && (aW.body.contains(e10) || e10.parentNode || (e10.hcOrigDetached = true, aW.body.appendChild(e10)), ("none" === a2(e10, "display", false) || e10.hcOricDetached) && (e10.hcOrigStyle = {
      display: e10.style.display,
      height: e10.style.height,
      overflow: e10.style.overflow
    }, i10 = {
      display: "block",
      overflow: "hidden"
    }, e10 !== this.renderTo && (i10.height = 0), a$(e10, i10), e10.offsetWidth || e10.style.setProperty("display", "block", "important")), (e10 = e10.parentNode) !== aW.body); ) ;
  }
  setClassName(t11) {
    this.container.className = "highcharts-container " + (t11 || "");
  }
  getContainer() {
    let t11, e10 = this.options, i10 = e10.chart, s10 = "data-highcharts-chart", o10 = nr(), r10 = this.renderTo, a10 = nt(aj(r10, s10));
    a5(a10) && aR[a10] && aR[a10].hasRendered && aR[a10].destroy(), aj(r10, s10, this.index), r10.innerHTML = en.emptyHTML, i10.skipClone || r10.offsetWidth || this.temporaryDisplay(), this.getChartSize();
    let n10 = this.chartHeight, h10 = this.chartWidth;
    a$(r10, {
      overflow: "hidden"
    }), this.styledMode || (t11 = aJ({
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
    let l2 = aU("div", {
      id: o10
    }, t11, r10);
    this.container = l2, this.getChartSize(), h10 !== this.chartWidth && (h10 = this.chartWidth, this.styledMode || a$(l2, {
      width: a7(i10.style?.width, h10 + "px")
    })), this.containerBox = this.getContainerBox(), this._cursor = l2.style.cursor;
    let d2 = i10.renderer || !aF ? eS.getRendererType(i10.renderer) : i2;
    if (this.renderer = new d2(l2, h10, n10, void 0, i10.forExport, e10.exporting?.allowHTML, this.styledMode), aD(void 0, this), this.setClassName(i10.className), this.styledMode) for (let t12 in e10.defs) this.renderer.definition(e10.defs[t12]);
    else this.renderer.setStyle(i10.style);
    this.renderer.chartIndex = this.index, a0(this, "afterGetContainer");
  }
  getMargins(t11) {
    let {
      spacing: e10,
      margin: i10,
      titleOffset: s10
    } = this;
    this.resetMargins(), s10[0] && !aV(i10[0]) && (this.plotTop = Math.max(this.plotTop, s10[0] + e10[0])), s10[2] && !aV(i10[2]) && (this.marginBottom = Math.max(this.marginBottom, s10[2] + e10[2])), this.legend?.display && this.legend.adjustMargins(i10, e10), a0(this, "getMargins"), t11 || this.getAxisMargins();
  }
  getAxisMargins() {
    let t11 = this, e10 = t11.axisOffset = [0, 0, 0, 0], i10 = t11.colorAxis, s10 = t11.margin, o10 = (t12) => {
      t12.forEach((t13) => {
        t13.visible && t13.getOffset();
      });
    };
    t11.hasCartesianSeries ? o10(t11.axes) : i10?.length && o10(i10), aX.forEach((i11, o11) => {
      aV(s10[o11]) || (t11[i11] += e10[o11]);
    }), t11.setChartSize();
  }
  getOptions() {
    return aZ(this.userOptions, aB);
  }
  reflow(t11) {
    let e10 = this, i10 = e10.containerBox, s10 = e10.getContainerBox();
    delete e10.pointer?.chartPosition, !e10.exporting?.isPrinting && !e10.isResizing && i10 && s10.width && ((s10.width !== i10.width || s10.height !== i10.height) && (ta.clearTimeout(e10.reflowTimeout), e10.reflowTimeout = no(function() {
      e10.container && e10.setSize(void 0, void 0, false);
    }, 100 * !!t11)), e10.containerBox = s10);
  }
  setReflow() {
    let t11 = this, e10 = (e11) => {
      t11.options?.chart.reflow && t11.hasLoaded && t11.reflow(e11);
    };
    if ("function" == typeof ResizeObserver) new ResizeObserver(e10).observe(t11.renderTo);
    else {
      let t12 = aY(aG, "resize", e10);
      aY(this, "destroy", t12);
    }
  }
  setSize(t11, e10, i10) {
    let s10 = this, o10 = s10.renderer;
    s10.isResizing += 1, aD(i10, s10);
    let r10 = o10.globalAnimation;
    s10.oldChartHeight = s10.chartHeight, s10.oldChartWidth = s10.chartWidth, void 0 !== t11 && (s10.options.chart.width = t11), void 0 !== e10 && (s10.options.chart.height = e10), s10.getChartSize();
    let {
      chartWidth: a10,
      chartHeight: n10,
      scrollablePixelsX: h10 = 0,
      scrollablePixelsY: l2 = 0
    } = s10;
    (s10.isDirtyBox || a10 !== s10.oldChartWidth || n10 !== s10.oldChartHeight) && (s10.styledMode || (r10 ? aE : a$)(s10.container, {
      width: `${a10 + h10}px`,
      height: `${n10 + l2}px`
    }, r10), s10.setChartSize(true), o10.setSize(a10, n10, r10), s10.axes.forEach(function(t12) {
      t12.isDirty = true, t12.setScale();
    }), s10.isDirtyLegend = true, s10.isDirtyBox = true, s10.layOutTitles(), s10.getMargins(), s10.redraw(r10), s10.oldChartHeight = void 0, a0(s10, "resize"), setTimeout(() => {
      s10 && a0(s10, "endResize");
    }, aI(r10).duration)), s10.isResizing -= 1;
  }
  setChartSize(t11) {
    let e10, i10, s10, o10, {
      chartHeight: r10,
      chartWidth: a10,
      inverted: n10,
      spacing: h10,
      renderer: l2
    } = this, d2 = this.clipOffset, c2 = Math[n10 ? "floor" : "round"];
    this.plotLeft = e10 = Math.round(this.plotLeft), this.plotTop = i10 = Math.round(this.plotTop), this.plotWidth = s10 = Math.max(0, Math.round(a10 - e10 - (this.marginRight ?? 0))), this.plotHeight = o10 = Math.max(0, Math.round(r10 - i10 - (this.marginBottom ?? 0))), this.plotSizeX = n10 ? o10 : s10, this.plotSizeY = n10 ? s10 : o10, this.spacingBox = l2.spacingBox = {
      x: h10[3],
      y: h10[0],
      width: a10 - h10[3] - h10[1],
      height: r10 - h10[0] - h10[2]
    }, this.plotBox = l2.plotBox = {
      x: e10,
      y: i10,
      width: s10,
      height: o10
    }, d2 && (this.clipBox = {
      x: c2(d2[3]),
      y: c2(d2[0]),
      width: c2(this.plotSizeX - d2[1] - d2[3]),
      height: c2(this.plotSizeY - d2[0] - d2[2])
    }), t11 || (this.axes.forEach(function(t12) {
      t12.setAxisSize(), t12.setAxisTranslation();
    }), l2.alignElements()), a0(this, "afterSetChartSize", {
      skipAxes: t11
    });
  }
  resetMargins() {
    a0(this, "resetMargins");
    let t11 = this, e10 = t11.options.chart, i10 = e10.plotBorderWidth || 0, s10 = Math.round(i10) / 2;
    ["margin", "spacing"].forEach((i11) => {
      let s11 = e10[i11], o10 = a6(s11) ? s11 : [s11, s11, s11, s11];
      ["Top", "Right", "Bottom", "Left"].forEach((s12, r10) => {
        t11[i11][r10] = e10[`${i11}${s12}`] ?? o10[r10];
      });
    }), aX.forEach((e11, i11) => {
      t11[e11] = t11.margin[i11] ?? t11.spacing[i11];
    }), t11.axisOffset = [0, 0, 0, 0], t11.clipOffset = [s10, s10, s10, s10], t11.plotBorderWidth = i10;
  }
  drawChartBox() {
    let t11 = this.options.chart, e10 = this.renderer, i10 = this.chartWidth, s10 = this.chartHeight, o10 = this.styledMode, r10 = this.plotBGImage, a10 = t11.backgroundColor, n10 = t11.plotBackgroundColor, h10 = t11.plotBackgroundImage, l2 = this.plotLeft, d2 = this.plotTop, c2 = this.plotWidth, p2 = this.plotHeight, g2 = this.plotBox, u2 = this.clipRect, f2 = this.clipBox, m2 = this.chartBackground, x2 = this.plotBackground, y2 = this.plotBorder, b2, v2, k2, M2 = "animate";
    m2 || (this.chartBackground = m2 = e10.rect().addClass("highcharts-background").add(), M2 = "attr"), o10 ? b2 = v2 = m2.strokeWidth() : (v2 = (b2 = t11.borderWidth || 0) + 8 * !!t11.shadow, k2 = {
      fill: a10 || "none"
    }, (b2 || m2["stroke-width"]) && (k2.stroke = t11.borderColor, k2["stroke-width"] = b2), m2.attr(k2).shadow(t11.shadow)), m2[M2]({
      x: v2 / 2,
      y: v2 / 2,
      width: i10 - v2 - b2 % 2,
      height: s10 - v2 - b2 % 2,
      r: t11.borderRadius
    }), M2 = "animate", x2 || (M2 = "attr", this.plotBackground = x2 = e10.rect().addClass("highcharts-plot-background").add()), x2[M2](g2), !o10 && (x2.attr({
      fill: n10 || "none"
    }).shadow(t11.plotShadow), h10 && (r10 ? (h10 !== r10.attr("href") && r10.attr("href", h10), r10.animate(g2)) : this.plotBGImage = e10.image(h10, l2, d2, c2, p2).add())), u2 ? u2.animate({
      width: f2.width,
      height: f2.height
    }) : this.clipRect = e10.clipRect(f2), M2 = "animate", y2 || (M2 = "attr", this.plotBorder = y2 = e10.rect().addClass("highcharts-plot-border").attr({
      zIndex: 1
    }).add()), o10 || y2.attr({
      stroke: t11.plotBorderColor,
      "stroke-width": t11.plotBorderWidth || 0,
      fill: "none"
    }), y2[M2](y2.crisp(g2, -y2.strokeWidth())), this.isDirtyBox = false, a0(this, "afterDrawChartBox");
  }
  propFromSeries() {
    let t11, e10, i10, s10 = this, o10 = s10.options.chart, r10 = s10.options.series;
    ["inverted", "angular", "polar"].forEach(function(a10) {
      for (e10 = aH[o10.type], i10 = o10[a10] || e10 && e10.prototype[a10], t11 = r10?.length; !i10 && t11--; ) (e10 = aH[r10[t11].type]) && e10.prototype[a10] && (i10 = true);
      s10[a10] = i10;
    });
  }
  linkSeries(t11) {
    let e10 = this, i10 = e10.series;
    i10.forEach(function(t12) {
      t12.linkedSeries.length = 0;
    }), i10.forEach(function(t12) {
      let {
        linkedTo: s10
      } = t12.options, o10 = a9(s10) && (":previous" === s10 ? i10[t12.index - 1] : e10.get(s10));
      o10 && o10.linkedParent !== t12 && (o10.linkedSeries.push(t12), t12.linkedParent = o10, o10.enabledDataSorting && t12.setDataSortingOptions(), t12.visible = t12.options.visible ?? o10.options.visible ?? t12.visible);
    }), a0(this, "afterLinkSeries", {
      isUpdating: t11
    });
  }
  renderSeries() {
    this.series.forEach(function(t11) {
      t11.translate(), t11.render();
    });
  }
  render() {
    let t11 = this.axes, e10 = this.colorAxis, i10 = this.renderer, s10 = this.options.chart.axisLayoutRuns || 2, o10 = (t12) => {
      t12.forEach((t13) => {
        t13.visible && t13.render();
      });
    }, r10 = 0, a10 = true, n10, h10 = 0;
    for (let e11 of (this.setTitle(), a0(this, "beforeMargins"), this.getStacks?.(), this.getMargins(true), this.setChartSize(), t11)) {
      let {
        options: t12
      } = e11, {
        labels: i11
      } = t12;
      if (this.hasCartesianSeries && e11.horiz && e11.visible && i11.enabled && e11.series.length && "colorAxis" !== e11.coll && !this.polar) {
        r10 = t12.tickLength, e11.createGroups();
        let s11 = new sC(e11, 0, "", true), o11 = s11.createLabel("x", i11);
        if (s11.destroy(), o11 && a7(i11.reserveSpace, !a5(t12.crossing)) && (r10 = o11.getBBox().height + i11.distance + Math.max(t12.offset || 0, 0)), r10) {
          o11?.destroy();
          break;
        }
      }
    }
    for (this.plotHeight = Math.max(this.plotHeight - r10, 0); (a10 || n10 || s10 > 1) && h10 < s10; ) {
      let e11 = this.plotWidth, i11 = this.plotHeight;
      for (let e12 of t11) 0 === h10 ? e12.setScale() : (e12.horiz && a10 || !e12.horiz && n10) && e12.setTickInterval(true);
      0 === h10 ? this.getAxisMargins() : this.getMargins(), a10 = e11 / this.plotWidth > (h10 ? 1 : 1.1), n10 = i11 / this.plotHeight > (h10 ? 1 : 1.05), h10++;
    }
    this.drawChartBox(), this.hasCartesianSeries ? o10(t11) : e10?.length && o10(e10), this.seriesGroup || (this.seriesGroup = i10.g("series-group").attr({
      zIndex: 3
    }).shadow(this.options.chart.seriesGroupShadow).add()), this.renderSeries(), this.addCredits(), this.setResponsive && this.setResponsive(), this.hasRendered = true;
  }
  addCredits(t11) {
    let e10 = this, i10 = a4(true, this.options.credits, t11);
    i10.enabled && !this.credits && (this.credits = this.renderer.text(i10.text + (this.mapCredits || ""), 0, 0).addClass("highcharts-credits").on("click", function() {
      i10.href && (aG.location.href = i10.href);
    }).attr({
      align: i10.position.align,
      zIndex: 8
    }), e10.styledMode || this.credits.css(i10.style), this.credits.add().align(i10.position), this.credits.update = function(t12) {
      e10.credits = e10.credits.destroy(), e10.addCredits(t12);
    });
  }
  destroy() {
    let t11, e10 = this, i10 = e10.axes, s10 = e10.series, o10 = e10.container, r10 = o10?.parentNode;
    for (a0(e10, "destroy"), e10.renderer.forExport ? a_(aR, e10) : aR[e10.index] = void 0, N.chartCount--, e10.renderTo.removeAttribute("data-highcharts-chart"), ni(e10), t11 = i10.length; t11--; ) i10[t11] = i10[t11].destroy();
    for (this.scroller?.destroy?.(), t11 = s10.length; t11--; ) s10[t11] = s10[t11].destroy();
    ["title", "subtitle", "chartBackground", "plotBackground", "plotBGImage", "plotBorder", "seriesGroup", "clipRect", "credits", "pointer", "rangeSelector", "legend", "resetZoomButton", "tooltip", "renderer"].forEach((t12) => {
      e10[t12] = e10[t12]?.destroy?.();
    }), o10 && (o10.innerHTML = en.emptyHTML, ni(o10), r10 && aq(o10)), a8(e10, function(t12, i11) {
      delete e10[i11];
    });
  }
  firstRender() {
    let t11 = this, e10 = t11.options;
    t11.getContainer(), t11.resetMargins(), t11.setChartSize(), t11.propFromSeries(), t11.createAxes();
    let i10 = a3(e10.series) ? e10.series : [];
    e10.series = [], i10.forEach(function(e11) {
      t11.initSeries(e11);
    }), t11.linkSeries(), t11.setSortedData(), a0(t11, "beforeRender"), t11.render(), t11.pointer?.getChartPosition(), t11.renderer.imgCount || t11.hasLoaded || t11.onload(), t11.temporaryDisplay(true);
  }
  onload() {
    this.callbacks.concat([this.callback]).forEach(function(t11) {
      t11 && void 0 !== this.index && t11.apply(this, [this]);
    }, this), a0(this, "load"), a0(this, "render"), aV(this.index) && this.setReflow(), this.warnIfA11yModuleNotLoaded(), this.warnIfCSSNotLoaded(), this.hasLoaded = true;
  }
  warnIfA11yModuleNotLoaded() {
    let {
      options: t11,
      title: e10
    } = this;
    t11 && !this.accessibility && (this.renderer.boxWrapper.attr({
      role: "img",
      "aria-label": (e10?.element.textContent || "").replace(/</g, "&lt;")
    }), t11.accessibility && false === t11.accessibility.enabled || aK('Highcharts warning: Consider including the "accessibility.js" module to make your chart more usable for people with disabilities. Set the "accessibility.enabled" option to false to remove this warning. See https://www.highcharts.com/docs/accessibility/accessibility-module.', false, this));
  }
  warnIfCSSNotLoaded() {
    this.styledMode && "0" !== aG.getComputedStyle(this.container).zIndex && aK(35, false, this);
  }
  addSeries(t11, e10, i10) {
    let s10, o10 = this;
    return t11 && (e10 = a7(e10, true), a0(o10, "addSeries", {
      options: t11
    }, function() {
      s10 = o10.initSeries(t11), o10.isDirtyLegend = true, o10.linkSeries(), s10.enabledDataSorting && s10.setData(t11.data, false), a0(o10, "afterAddSeries", {
        series: s10
      }), e10 && o10.redraw(i10);
    })), s10;
  }
  addAxis(t11, e10, i10, s10) {
    return this.createAxis(e10 ? "xAxis" : "yAxis", {
      axis: t11,
      redraw: i10,
      animation: s10
    });
  }
  addColorAxis(t11, e10, i10) {
    return this.createAxis("colorAxis", {
      axis: t11,
      redraw: e10,
      animation: i10
    });
  }
  createAxis(t11, e10) {
    let i10 = new s3(this, e10.axis, t11);
    return a7(e10.redraw, true) && this.redraw(e10.animation), i10;
  }
  showLoading(t11) {
    let e10 = this, i10 = e10.options, s10 = i10.loading, o10 = function() {
      r10 && a$(r10, {
        left: e10.plotLeft + "px",
        top: e10.plotTop + "px",
        width: e10.plotWidth + "px",
        height: e10.plotHeight + "px"
      });
    }, r10 = e10.loadingDiv, a10 = e10.loadingSpan;
    r10 || (e10.loadingDiv = r10 = aU("div", {
      className: "highcharts-loading highcharts-loading-hidden"
    }, null, e10.container)), a10 || (e10.loadingSpan = a10 = aU("span", {
      className: "highcharts-loading-inner"
    }, null, r10), aY(e10, "redraw", o10)), r10.className = "highcharts-loading", en.setElementHTML(a10, a7(t11, i10.lang.loading, "")), !e10.styledMode && (a$(r10, aJ(s10.style, {
      zIndex: 10
    })), a$(a10, s10.labelStyle), e10.loadingShown || (a$(r10, {
      opacity: 0,
      display: ""
    }), aE(r10, {
      opacity: s10.style.opacity || 0.5
    }, {
      duration: s10.showDuration || 0
    }))), e10.loadingShown = true, o10();
  }
  hideLoading() {
    let t11 = this.options, e10 = this.loadingDiv;
    e10 && (e10.className = "highcharts-loading highcharts-loading-hidden", this.styledMode || aE(e10, {
      opacity: 0
    }, {
      duration: t11.loading.hideDuration || 100,
      complete: function() {
        a$(e10, {
          display: "none"
        });
      }
    })), this.loadingShown = false;
  }
  update(t11, e10, i10, s10) {
    let o10, r10, a10, n10 = this, h10 = {
      credits: "addCredits",
      title: "setTitle",
      subtitle: "setSubtitle",
      caption: "setCaption"
    }, l2 = t11.isResponsiveOptions, d2 = [];
    a0(n10, "update", {
      options: t11
    }), l2 || n10.setResponsive(false, true), t11 = aZ(t11, n10.options), n10.userOptions = a4(n10.userOptions, t11);
    let c2 = t11.chart;
    c2 && (a4(true, n10.options.chart, c2), this.setZoomOptions(), "className" in c2 && n10.setClassName(c2.className), ("inverted" in c2 || "polar" in c2 || "type" in c2) && (n10.propFromSeries(), o10 = true), "alignTicks" in c2 && (o10 = true), "events" in c2 && az(this, c2), a8(c2, function(t12, e11) {
      -1 !== n10.propsRequireUpdateSeries.indexOf("chart." + e11) && (r10 = true), -1 !== n10.propsRequireDirtyBox.indexOf(e11) && (n10.isDirtyBox = true), -1 !== n10.propsRequireReflow.indexOf(e11) && (n10.isDirtyBox = true, l2 || (a10 = true));
    }), !n10.styledMode && c2.style && n10.renderer.setStyle(n10.options.chart.style || {})), !n10.styledMode && t11.colors && (this.options.colors = t11.colors), a8(t11, function(e11, i11) {
      n10[i11] && "function" == typeof n10[i11].update ? n10[i11].update(e11, false) : "function" == typeof n10[h10[i11]] ? n10[h10[i11]](e11) : "colors" !== i11 && -1 === n10.collectionsWithUpdate.indexOf(i11) && a4(true, n10.options[i11], t11[i11]), "chart" !== i11 && -1 !== n10.propsRequireUpdateSeries.indexOf(i11) && (r10 = true);
    }), this.collectionsWithUpdate.forEach(function(e11) {
      t11[e11] && (ns(t11[e11]).forEach(function(t12, s11) {
        let o11, r11 = aV(t12.id);
        r11 && (o11 = n10.get(t12.id)), !o11 && n10[e11] && (o11 = n10[e11][a7(t12.index, s11)]) && (r11 && aV(o11.options.id) || o11.options.isInternal) && (o11 = void 0), o11 && o11.coll === e11 && (o11.update(t12, false), i10 && (o11.touched = true)), !o11 && i10 && n10.collectionsWithInit[e11] && (n10.collectionsWithInit[e11][0].apply(n10, [t12].concat(n10.collectionsWithInit[e11][1] || []).concat([false])).touched = true);
      }), i10 && n10[e11].forEach(function(t12) {
        t12.touched || t12.options.isInternal ? delete t12.touched : d2.push(t12);
      }));
    }), d2.forEach(function(t12) {
      t12.chart && t12.remove && t12.remove(false);
    }), o10 && n10.axes.forEach(function(t12) {
      t12.update({}, false);
    }), r10 && n10.getSeriesOrderByLinks().forEach(function(t12) {
      t12.chart && t12.update({}, false);
    }, this);
    let p2 = c2?.width, g2 = c2 && (a9(c2.height) ? ne(c2.height, p2 || n10.chartWidth) : c2.height);
    a10 || a5(p2) && p2 !== n10.chartWidth || a5(g2) && g2 !== n10.chartHeight ? n10.setSize(p2, g2, s10) : a7(e10, true) && n10.redraw(s10), a0(n10, "afterUpdate", {
      options: t11,
      redraw: e10,
      animation: s10
    });
  }
  setSubtitle(t11, e10) {
    this.applyDescription("subtitle", t11), this.layOutTitles(e10);
  }
  setCaption(t11, e10) {
    this.applyDescription("caption", t11), this.layOutTitles(e10);
  }
  showResetZoom() {
    let t11 = this, e10 = aB.lang, i10 = t11.zooming.resetButton, s10 = i10.theme, o10 = "chart" === i10.relativeTo || "spacingBox" === i10.relativeTo ? null : "plotBox";
    function r10() {
      t11.zoomOut();
    }
    a0(this, "beforeShowResetZoom", null, function() {
      t11.resetZoomButton = t11.renderer.button(e10.resetZoom, null, null, r10, s10).attr({
        align: i10.position.align,
        title: e10.resetZoomTitle
      }).addClass("highcharts-reset-zoom").add().align(i10.position, false, o10);
    }), a0(this, "afterShowResetZoom");
  }
  zoomOut() {
    a0(this, "selection", {
      resetSelection: true
    }, () => this.transform({
      reset: true,
      trigger: "zoom"
    }));
  }
  pan(t11, e10) {
    let i10 = this, s10 = "object" == typeof e10 ? e10 : {
      enabled: e10,
      type: "x"
    }, o10 = s10.type, r10 = o10 && i10[{
      x: "xAxis",
      xy: "axes",
      y: "yAxis"
    }[o10]].filter((t12) => t12.options.panningEnabled && !t12.options.isInternal), a10 = i10.options.chart;
    a10?.panning && (a10.panning = s10), a0(this, "pan", {
      originalEvent: t11
    }, () => {
      i10.transform({
        axes: r10,
        event: t11,
        to: {
          x: t11.chartX - (i10.mouseDownX || 0),
          y: t11.chartY - (i10.mouseDownY || 0)
        },
        trigger: "pan"
      }), a$(i10.container, {
        cursor: "move"
      });
    });
  }
  transform(t11) {
    let {
      axes: e10 = this.axes,
      event: i10,
      from: s10 = {},
      reset: o10,
      selection: r10,
      to: a10 = {},
      trigger: n10,
      allowResetButton: h10 = true
    } = t11, {
      inverted: l2,
      time: d2
    } = this;
    this.hoverPoints?.forEach((t12) => t12.setState()), a0(this, "transform", t11);
    let c2 = t11.hasZoomed || false, p2, g2;
    for (let t12 of e10) {
      let {
        horiz: e11,
        len: u2,
        minPointOffset: f2 = 0,
        options: m2,
        reversed: x2
      } = t12, y2 = e11 ? "width" : "height", b2 = e11 ? "x" : "y", v2 = a7(a10[y2], t12.len), k2 = a7(s10[y2], t12.len), M2 = 10 > Math.abs(v2) ? 1 : v2 / k2, w2 = (s10[b2] || 0) + k2 / 2 - t12.pos, S2 = w2 - ((a10[b2] ?? t12.pos) + v2 / 2 - t12.pos) / M2, T2 = x2 && !l2 || !x2 && l2 ? -1 : 1;
      if (!o10 && (w2 < 0 || w2 > t12.len)) continue;
      let C2 = t12.chart.polar || t12.isOrdinal ? 0 : f2 * T2 || 0, A2 = t12.toValue(S2, true), P2 = t12.toValue(S2 + u2 / M2, true), L2 = A2 + C2, O2 = P2 - C2, E2 = t12.allExtremes;
      if (r10 && r10[t12.coll].push({
        axis: t12,
        min: Math.min(A2, P2),
        max: Math.max(A2, P2)
      }), L2 > O2 && ([L2, O2] = [O2, L2]), 1 === M2 && !o10 && "yAxis" === t12.coll && !E2) {
        for (let e12 of t12.series) {
          let t13 = e12.getExtremes(e12.getProcessedData(true).modified.getColumn(e12.pointValKey || "y") || [], true);
          E2 ?? (E2 = {
            dataMin: Number.MAX_VALUE,
            dataMax: -Number.MAX_VALUE
          }), a5(t13.dataMin) && a5(t13.dataMax) && (E2.dataMin = Math.min(t13.dataMin, E2.dataMin), E2.dataMax = Math.max(t13.dataMax, E2.dataMax));
        }
        t12.allExtremes = E2;
      }
      let {
        dataMin: I2,
        dataMax: D2,
        min: B2,
        max: N2
      } = aJ(t12.getExtremes(), E2 || {}), z2 = d2.parse(m2.min), R2 = d2.parse(m2.max), W2 = I2 ?? z2, X2 = D2 ?? R2, F2 = O2 - L2, G2 = t12.categories ? 0 : Math.min(F2, X2 - W2), H2 = W2 - G2 * (aV(z2) ? 0 : m2.minPadding), Y2 = X2 + G2 * (aV(R2) ? 0 : m2.maxPadding), j2 = t12.allowZoomOutside || 1 === M2 || "zoom" !== n10 && M2 > 1, U2 = Math.min(z2 ?? H2, H2, j2 ? B2 : H2), $2 = Math.max(R2 ?? Y2, Y2, j2 ? N2 : Y2);
      (!t12.isOrdinal || 1 !== M2 || o10) && (L2 < U2 && (L2 = U2, M2 >= 1 && (O2 = L2 + F2)), O2 > $2 && (O2 = $2, M2 >= 1 && (L2 = O2 - F2)), (o10 || t12.series.length && (L2 !== B2 || O2 !== N2) && L2 >= U2 && O2 <= $2) && (r10 ? r10[t12.coll].push({
        axis: t12,
        min: L2,
        max: O2
      }) : (t12.isPanning = "zoom" !== n10, t12.isPanning && "mousewheel" !== n10 && (g2 = true), t12.setExtremes(o10 ? void 0 : L2, o10 ? void 0 : O2, false, false, {
        move: S2,
        trigger: n10,
        scale: M2
      }), !o10 && (L2 > U2 || O2 < $2) && (p2 = h10)), c2 = true), this.hasCartesianSeries || o10 || (p2 = h10), i10 && (this[e11 ? "mouseDownX" : "mouseDownY"] = i10[e11 ? "chartX" : "chartY"]));
    }
    return c2 && (r10 ? a0(this, "selection", r10, () => {
      delete t11.selection, t11.trigger = "zoom", this.transform(t11);
    }) : (!p2 || g2 || this.resetZoomButton ? !p2 && this.resetZoomButton && (this.resetZoomButton = this.resetZoomButton.destroy()) : this.showResetZoom(), this.redraw("zoom" === n10 && (this.options.chart.animation ?? this.pointCount < 100)))), c2;
  }
};
aJ(na.prototype, {
  callbacks: [],
  collectionsWithInit: {
    xAxis: [na.prototype.addAxis, [true]],
    yAxis: [na.prototype.addAxis, [false]],
    series: [na.prototype.addSeries]
  },
  collectionsWithUpdate: ["xAxis", "yAxis", "series"],
  propsRequireDirtyBox: ["backgroundColor", "borderColor", "borderWidth", "borderRadius", "plotBackgroundColor", "plotBackgroundImage", "plotBorderColor", "plotBorderWidth", "plotShadow", "shadow"],
  propsRequireReflow: ["margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "spacing", "spacingTop", "spacingRight", "spacingBottom", "spacingLeft"],
  propsRequireUpdateSeries: ["chart.inverted", "chart.polar", "chart.ignoreHiddenSeries", "chart.type", "colors", "plotOptions", "time", "tooltip"]
});
var {
  stop: nn
} = t3;
var {
  composed: nh
} = N;
var {
  addEvent: nl,
  createElement: nd,
  css: nc,
  defined: np,
  erase: ng,
  merge: nu,
  pushUnique: nf
} = ta;
function nm() {
  let t11 = this.scrollablePlotArea;
  (this.scrollablePixelsX || this.scrollablePixelsY) && !t11 && (this.scrollablePlotArea = t11 = new ny(this)), t11?.applyFixed();
}
function nx() {
  this.chart.scrollablePlotArea && (this.chart.scrollablePlotArea.isDirty = true);
}
var ny = class _ny {
  static compose(t11, e10, i10) {
    nf(nh, this.compose) && (nl(t11, "afterInit", nx), nl(e10, "afterSetChartSize", (t12) => this.afterSetSize(t12.target, t12)), nl(e10, "render", nm), nl(i10, "show", nx));
  }
  static afterSetSize(t11, e10) {
    let i10, s10, o10, {
      minWidth: r10,
      minHeight: a10
    } = t11.options.chart.scrollablePlotArea || {}, {
      clipBox: n10,
      plotBox: h10,
      inverted: l2,
      renderer: d2
    } = t11;
    if (!d2.forExport) if (r10 ? (t11.scrollablePixelsX = i10 = Math.max(0, r10 - t11.chartWidth), i10 && (t11.scrollablePlotBox = nu(t11.plotBox), h10.width = t11.plotWidth += i10, n10[l2 ? "height" : "width"] += i10, o10 = true)) : a10 && (t11.scrollablePixelsY = s10 = Math.max(0, a10 - t11.chartHeight), np(s10) && (t11.scrollablePlotBox = nu(t11.plotBox), h10.height = t11.plotHeight += s10, n10[l2 ? "width" : "height"] += s10, o10 = false)), np(o10)) {
      if (!e10.skipAxes) for (let e11 of t11.axes) (e11.horiz === o10 || t11.hasParallelCoordinates && "yAxis" === e11.coll) && (e11.setAxisSize(), e11.setAxisTranslation());
    } else delete t11.scrollablePlotBox;
  }
  constructor(t11) {
    let e10, i10 = t11.options.chart, s10 = eS.getRendererType(), o10 = i10.scrollablePlotArea || {}, r10 = this.moveFixedElements.bind(this), a10 = {
      WebkitOverflowScrolling: "touch",
      overflowX: "hidden",
      overflowY: "hidden"
    };
    t11.scrollablePixelsX && (a10.overflowX = "auto"), t11.scrollablePixelsY && (a10.overflowY = "auto"), this.chart = t11;
    let n10 = this.parentDiv = nd("div", {
      className: "highcharts-scrolling-parent"
    }, {
      position: "relative"
    }, t11.renderTo), h10 = this.scrollingContainer = nd("div", {
      className: "highcharts-scrolling"
    }, a10, n10), l2 = this.innerContainer = nd("div", {
      className: "highcharts-inner-container"
    }, void 0, h10), d2 = this.fixedDiv = nd("div", {
      className: "highcharts-fixed"
    }, {
      position: "absolute",
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: (i10.style?.zIndex || 0) + 2,
      top: 0
    }, void 0, true), c2 = this.fixedRenderer = new s10(d2, t11.chartWidth, t11.chartHeight, i10.style);
    this.mask = c2.path().attr({
      fill: i10.backgroundColor || "#fff",
      "fill-opacity": o10.opacity ?? 0.85,
      zIndex: -1
    }).addClass("highcharts-scrollable-mask").add(), h10.parentNode.insertBefore(d2, h10), nc(t11.renderTo, {
      overflow: "visible"
    }), nl(t11, "afterShowResetZoom", r10), nl(t11, "afterApplyDrilldown", r10), nl(t11, "afterLayOutTitles", r10), nl(h10, "scroll", () => {
      let {
        pointer: i11,
        hoverPoint: s11
      } = t11;
      i11 && (delete i11.chartPosition, s11 && (e10 = s11), i11.runPointActions(void 0, e10, true));
    }), l2.appendChild(t11.container);
  }
  applyFixed() {
    let {
      chart: t11,
      fixedRenderer: e10,
      isDirty: i10,
      scrollingContainer: s10
    } = this, {
      axisOffset: o10,
      chartWidth: r10,
      chartHeight: a10,
      container: n10,
      plotHeight: h10,
      plotLeft: l2,
      plotTop: d2,
      plotWidth: c2,
      scrollablePixelsX: p2 = 0,
      scrollablePixelsY: g2 = 0
    } = t11, {
      scrollPositionX: u2 = 0,
      scrollPositionY: f2 = 0
    } = t11.options.chart.scrollablePlotArea || {}, m2 = r10 + p2, x2 = a10 + g2;
    e10.setSize(r10, a10), (i10 ?? true) && (this.isDirty = false, this.moveFixedElements()), nn(t11.container), nc(n10, {
      width: `${m2}px`,
      height: `${x2}px`
    }), t11.renderer.boxWrapper.attr({
      width: m2,
      height: x2,
      viewBox: ["0 0", m2, x2].join(" ")
    }), t11.chartBackground?.attr({
      width: m2,
      height: x2
    }), nc(s10, {
      width: `${r10}px`,
      height: `${a10}px`
    }), np(i10) || (s10.scrollLeft = p2 * u2, s10.scrollTop = g2 * f2);
    let y2 = d2 - o10[0] - 1, b2 = l2 - o10[3] - 1, v2 = d2 + h10 + o10[2] + 1, k2 = l2 + c2 + o10[1] + 1, M2 = l2 + c2 - p2, w2 = d2 + h10 - g2, S2 = [["M", 0, 0]];
    p2 ? S2 = [["M", 0, y2], ["L", l2 - 1, y2], ["L", l2 - 1, v2], ["L", 0, v2], ["Z"], ["M", M2, y2], ["L", r10, y2], ["L", r10, v2], ["L", M2, v2], ["Z"]] : g2 && (S2 = [["M", b2, 0], ["L", b2, d2 - 1], ["L", k2, d2 - 1], ["L", k2, 0], ["Z"], ["M", b2, w2], ["L", b2, a10], ["L", k2, a10], ["L", k2, w2], ["Z"]]), "adjustHeight" !== t11.redrawTrigger && this.mask.attr({
      d: S2
    });
  }
  moveFixedElements() {
    let t11, {
      container: e10,
      inverted: i10,
      scrollablePixelsX: s10,
      scrollablePixelsY: o10
    } = this.chart, r10 = this.fixedRenderer, a10 = _ny.fixedSelectors;
    if (s10 && !i10 ? t11 = ".highcharts-yaxis" : s10 && i10 || o10 && !i10 ? t11 = ".highcharts-xaxis" : o10 && i10 && (t11 = ".highcharts-yaxis"), t11 && !(this.chart.hasParallelCoordinates && ".highcharts-yaxis" === t11)) for (let e11 of [`${t11}:not(.highcharts-radial-axis)`, `${t11}-labels:not(.highcharts-radial-axis-labels)`]) nf(a10, e11);
    else for (let t12 of [".highcharts-xaxis", ".highcharts-yaxis"]) for (let e11 of [`${t12}:not(.highcharts-radial-axis)`, `${t12}-labels:not(.highcharts-radial-axis-labels)`]) ng(a10, e11);
    for (let t12 of a10) [].forEach.call(e10.querySelectorAll(t12), (t13) => {
      (t13.namespaceURI === r10.SVG_NS ? r10.box : r10.box.parentNode).appendChild(t13), t13.style.pointerEvents = "auto";
    });
  }
};
ny.fixedSelectors = [".highcharts-breadcrumbs-group", ".highcharts-contextbutton", ".highcharts-caption", ".highcharts-credits", ".highcharts-drillup-button", ".highcharts-legend", ".highcharts-legend-checkbox", ".highcharts-navigator-series", ".highcharts-navigator-xaxis", ".highcharts-navigator-yaxis", ".highcharts-navigator", ".highcharts-range-selector-group", ".highcharts-reset-zoom", ".highcharts-scrollbar", ".highcharts-subtitle", ".highcharts-title"];
var {
  format: nb
} = ew;
var {
  series: nv
} = rR;
var {
  destroyObjectProperties: nk,
  fireEvent: nM,
  getAlignFactor: nw,
  isNumber: nS,
  pick: nT
} = ta;
var nC = class {
  constructor(t11, e10, i10, s10, o10) {
    let r10 = t11.chart.inverted, a10 = t11.reversed;
    this.axis = t11;
    let n10 = this.isNegative = !!i10 != !!a10;
    this.options = e10 = e10 || {}, this.x = s10, this.total = null, this.cumulative = null, this.points = {}, this.hasValidPoints = false, this.stack = o10, this.leftCliff = 0, this.rightCliff = 0, this.alignOptions = {
      align: e10.align || (r10 ? n10 ? "left" : "right" : "center"),
      verticalAlign: e10.verticalAlign || (r10 ? "middle" : n10 ? "bottom" : "top"),
      y: e10.y,
      x: e10.x
    }, this.textAlign = e10.textAlign || (r10 ? n10 ? "right" : "left" : "center");
  }
  destroy() {
    nk(this, this.axis);
  }
  render(t11) {
    let e10 = this.axis.chart, i10 = this.options, s10 = i10.format, o10 = s10 ? nb(s10, this, e10) : i10.formatter.call(this);
    if (this.label) this.label.attr({
      text: o10,
      visibility: "hidden"
    });
    else {
      this.label = e10.renderer.label(o10, null, void 0, i10.shape, void 0, void 0, i10.useHTML, false, "stack-labels");
      let s11 = {
        r: i10.borderRadius || 0,
        text: o10,
        padding: nT(i10.padding, 5),
        visibility: "hidden"
      };
      e10.styledMode || (s11.fill = i10.backgroundColor, s11.stroke = i10.borderColor, s11["stroke-width"] = i10.borderWidth, this.label.css(i10.style || {})), this.label.attr(s11), this.label.added || this.label.add(t11);
    }
    this.label.labelrank = e10.plotSizeY, nM(this, "afterRender");
  }
  setOffset(t11, e10, i10, s10, o10, r10) {
    let {
      alignOptions: a10,
      axis: n10,
      label: h10,
      options: l2,
      textAlign: d2
    } = this, c2 = n10.chart, p2 = this.getStackBox({
      xOffset: t11,
      width: e10,
      boxBottom: i10,
      boxTop: s10,
      defaultX: o10,
      xAxis: r10
    }), {
      verticalAlign: g2
    } = a10;
    if (h10 && p2) {
      let t12 = h10.getBBox(void 0, 0), e11 = h10.padding, i11 = "justify" === nT(l2.overflow, "justify"), s11;
      a10.x = l2.x || 0, a10.y = l2.y || 0;
      let {
        x: o11,
        y: r11
      } = this.adjustStackPosition({
        labelBox: t12,
        verticalAlign: g2,
        textAlign: d2
      });
      p2.x -= o11, p2.y -= r11, h10.align(a10, false, p2), (s11 = c2.isInsidePlot(h10.alignAttr.x + a10.x + o11, h10.alignAttr.y + a10.y + r11)) || (i11 = false), i11 && nv.prototype.justifyDataLabel.call(n10, h10, a10, h10.alignAttr, t12, p2), h10.attr({
        x: h10.alignAttr.x,
        y: h10.alignAttr.y,
        rotation: l2.rotation,
        rotationOriginX: t12.width * nw(l2.textAlign || "center"),
        rotationOriginY: t12.height / 2
      }), nT(!i11 && l2.crop, true) && (s11 = nS(h10.x) && nS(h10.y) && c2.isInsidePlot(h10.x - e11 + (h10.width || 0), h10.y) && c2.isInsidePlot(h10.x + e11, h10.y)), h10[s11 ? "show" : "hide"]();
    }
    nM(this, "afterSetOffset", {
      xOffset: t11,
      width: e10
    });
  }
  adjustStackPosition({
    labelBox: t11,
    verticalAlign: e10,
    textAlign: i10
  }) {
    return {
      x: t11.width / 2 + t11.width / 2 * (2 * nw(i10) - 1),
      y: t11.height / 2 * 2 * (1 - nw(e10))
    };
  }
  getStackBox(t11) {
    let e10 = this.axis, i10 = e10.chart, {
      boxTop: s10,
      defaultX: o10,
      xOffset: r10,
      width: a10,
      boxBottom: n10
    } = t11, h10 = e10.stacking.usePercentage ? 100 : nT(s10, this.total, 0), l2 = e10.toPixels(h10), d2 = t11.xAxis || i10.xAxis[0], c2 = nT(o10, d2.translate(this.x)) + r10, p2 = Math.abs(l2 - e10.toPixels(n10 || nS(e10.min) && e10.logarithmic && e10.logarithmic.lin2log(e10.min) || 0)), g2 = i10.inverted, u2 = this.isNegative;
    return g2 ? {
      x: (u2 ? l2 : l2 - p2) - i10.plotLeft,
      y: d2.height - c2 - a10 + d2.top - i10.plotTop,
      width: p2,
      height: a10
    } : {
      x: c2 + d2.transB - i10.plotLeft,
      y: (u2 ? l2 - p2 : l2) - i10.plotTop,
      width: a10,
      height: p2
    };
  }
};
var {
  getDeferredAnimation: nA
} = t3;
var {
  series: {
    prototype: nP
  }
} = rR;
var {
  addEvent: nL,
  correctFloat: nO,
  defined: nE,
  destroyObjectProperties: nI,
  fireEvent: nD,
  isNumber: nB,
  objectEach: nN,
  pick: nz
} = ta;
function nR() {
  let t11 = this.inverted;
  this.axes.forEach((t12) => {
    t12.stacking?.stacks && t12.hasVisibleSeries && (t12.stacking.oldStacks = t12.stacking.stacks);
  }), this.series.forEach((e10) => {
    let i10 = e10.xAxis?.options || {};
    e10.options.stacking && e10.reserveSpace() && (e10.stackKey = [e10.type, nz(e10.options.stack, ""), t11 ? i10.top : i10.left, t11 ? i10.height : i10.width].join(","));
  });
}
function nW() {
  let t11 = this.stacking;
  if (t11) {
    let e10 = t11.stacks;
    nN(e10, (t12, i10) => {
      nI(t12), delete e10[i10];
    }), t11.stackTotalGroup?.destroy();
  }
}
function nX() {
  this.stacking || (this.stacking = new nU(this));
}
function nF(t11, e10, i10, s10) {
  return !nE(t11) || t11.x !== e10 || s10 && t11.stackKey !== s10 ? t11 = {
    x: e10,
    index: 0,
    key: s10,
    stackKey: s10
  } : t11.index++, t11.key = [i10, e10, t11.index].join(","), t11;
}
function nG() {
  let t11, e10 = this, i10 = e10.yAxis, s10 = e10.stackKey || "", o10 = i10.stacking.stacks, r10 = e10.getColumn("x", true), a10 = e10.options.stacking, n10 = e10[a10 + "Stacker"];
  n10 && [s10, "-" + s10].forEach((i11) => {
    let s11 = r10.length, a11, h10, l2;
    for (; s11--; ) a11 = r10[s11], t11 = e10.getStackIndicator(t11, a11, e10.index, i11), h10 = o10[i11]?.[a11], (l2 = h10?.points[t11.key || ""]) && n10.call(e10, l2, h10, s11);
  });
}
function nH(t11, e10, i10) {
  let s10 = e10.total ? 100 / e10.total : 0;
  t11[0] = nO(t11[0] * s10), t11[1] = nO(t11[1] * s10), this.stackedYData[i10] = t11[1];
}
function nY(t11) {
  (this.is("column") || this.is("columnrange")) && (this.options.centerInCategory && this.chart.series.length > 1 ? nP.setStackedPoints.call(this, t11, "group") : t11.stacking.resetStacks());
}
function nj(t11, e10) {
  let i10, s10, o10, r10, a10, n10, h10, l2 = e10 || this.options.stacking;
  if (!l2 || !this.reserveSpace() || ({
    group: "xAxis"
  }[l2] || "yAxis") !== t11.coll) return;
  let d2 = this.getColumn("x", true), c2 = this.getColumn(this.pointValKey || "y", true), p2 = [], g2 = c2.length, u2 = this.options, f2 = u2.threshold || 0, m2 = u2.startFromThreshold ? f2 : 0, x2 = u2.stack, y2 = e10 ? `${this.type},${l2}` : this.stackKey || "", b2 = "-" + y2, v2 = this.negStacks, k2 = t11.stacking, M2 = k2.stacks, w2 = k2.oldStacks;
  for (k2.stacksTouched += 1, h10 = 0; h10 < g2; h10++) {
    let e11 = d2[h10] || 0, g3 = c2[h10], u3 = nB(g3) && g3 || 0;
    n10 = (i10 = this.getStackIndicator(i10, e11, this.index)).key || "", M2[a10 = (s10 = v2 && u3 < (m2 ? 0 : f2)) ? b2 : y2] || (M2[a10] = {}), M2[a10][e11] || (w2[a10]?.[e11] ? (M2[a10][e11] = w2[a10][e11], M2[a10][e11].total = null) : M2[a10][e11] = new nC(t11, t11.options.stackLabels, !!s10, e11, x2)), o10 = M2[a10][e11], null !== g3 ? (o10.points[n10] = o10.points[this.index] = [nz(o10.cumulative, m2)], nE(o10.cumulative) || (o10.base = n10), o10.touched = k2.stacksTouched, i10.index > 0 && false === this.singleStacks && (o10.points[n10][0] = o10.points[this.index + "," + e11 + ",0"][0])) : (delete o10.points[n10], delete o10.points[this.index]);
    let S2 = o10.total || 0;
    "percent" === l2 ? (r10 = s10 ? y2 : b2, S2 = v2 && M2[r10]?.[e11] ? (r10 = M2[r10][e11]).total = Math.max(r10.total || 0, S2) + Math.abs(u3) : nO(S2 + Math.abs(u3))) : "group" === l2 ? nB(g3) && S2++ : S2 = nO(S2 + u3), "group" === l2 ? o10.cumulative = (S2 || 1) - 1 : o10.cumulative = nO(nz(o10.cumulative, m2) + u3), o10.total = S2, null !== g3 && (o10.points[n10].push(o10.cumulative), p2[h10] = o10.cumulative, o10.hasValidPoints = true);
  }
  "percent" === l2 && (k2.usePercentage = true), "group" !== l2 && (this.stackedYData = p2), k2.oldStacks = {};
}
var nU = class {
  constructor(t11) {
    this.oldStacks = {}, this.stacks = {}, this.stacksTouched = 0, this.axis = t11;
  }
  buildStacks() {
    let t11, e10, i10 = this.axis, s10 = i10.series, o10 = "xAxis" === i10.coll, r10 = i10.options.reversedStacks, a10 = s10.length;
    for (this.resetStacks(), this.usePercentage = false, e10 = a10; e10--; ) t11 = s10[r10 ? e10 : a10 - e10 - 1], o10 && t11.setGroupedPoints(i10), t11.setStackedPoints(i10);
    if (!o10) for (e10 = 0; e10 < a10; e10++) s10[e10].modifyStacks();
    nD(i10, "afterBuildStacks");
  }
  cleanStacks() {
    this.oldStacks && (this.stacks = this.oldStacks, nN(this.stacks, (t11) => {
      nN(t11, (t12) => {
        t12.cumulative = t12.total;
      });
    }));
  }
  resetStacks() {
    nN(this.stacks, (t11) => {
      nN(t11, (e10, i10) => {
        nB(e10.touched) && e10.touched < this.stacksTouched ? (e10.destroy(), delete t11[i10]) : (e10.total = null, e10.cumulative = null);
      });
    });
  }
  renderStackTotals() {
    let t11 = this.axis, e10 = t11.chart, i10 = e10.renderer, s10 = this.stacks, o10 = nA(e10, t11.options.stackLabels?.animation || false), r10 = this.stackTotalGroup = this.stackTotalGroup || i10.g("stack-labels").attr({
      zIndex: 6,
      opacity: 0
    }).add();
    r10.translate(e10.plotLeft, e10.plotTop), nN(s10, (t12) => {
      nN(t12, (t13) => {
        t13.render(r10);
      });
    }), r10.animate({
      opacity: 1
    }, o10);
  }
};
(A || (A = {})).compose = function(t11, e10, i10) {
  let s10 = e10.prototype, o10 = i10.prototype;
  s10.getStacks || (nL(t11, "init", nX), nL(t11, "destroy", nW), s10.getStacks = nR, o10.getStackIndicator = nF, o10.modifyStacks = nG, o10.percentStacker = nH, o10.setGroupedPoints = nY, o10.setStackedPoints = nj);
};
var n$ = A;
var {
  defined: nV,
  merge: nZ,
  isObject: nq
} = ta;
var n_ = class extends an {
  drawGraph() {
    let t11 = this.options, e10 = (this.gappedPath || this.getGraphPath).call(this), i10 = this.chart.styledMode;
    [this, ...this.zones].forEach((s10, o10) => {
      let r10, a10 = s10.graph, n10 = a10 ? "animate" : "attr", h10 = s10.dashStyle || t11.dashStyle;
      a10 ? (a10.endX = this.preventGraphAnimation ? null : e10.xMap, a10.animate({
        d: e10
      })) : e10.length && (s10.graph = a10 = this.chart.renderer.path(e10).addClass("highcharts-graph" + (o10 ? ` highcharts-zone-graph-${o10 - 1} ` : " ") + (o10 && s10.className || "")).attr({
        zIndex: 1
      }).add(this.group)), a10 && !i10 && (r10 = {
        stroke: !o10 && t11.lineColor || s10.color || this.color || "#cccccc",
        "stroke-width": t11.lineWidth || 0,
        fill: this.fillGraph && this.color || "none"
      }, h10 ? r10.dashstyle = h10 : "square" !== t11.linecap && (r10["stroke-linecap"] = r10["stroke-linejoin"] = "round"), a10[n10](r10).shadow(t11.shadow && nZ({
        filterUnits: "userSpaceOnUse"
      }, nq(t11.shadow) ? t11.shadow : {}))), a10 && (a10.startX = e10.xMap, a10.isArea = e10.isArea);
    });
  }
  getGraphPath(t11, e10, i10) {
    let s10 = this, o10 = s10.options, r10 = [], a10 = [], n10, h10 = o10.step, l2 = (t11 = t11 || s10.points).reversed;
    return l2 && t11.reverse(), (h10 = {
      right: 1,
      center: 2
    }[h10] || h10 && 3) && l2 && (h10 = 4 - h10), (t11 = this.getValidPoints(t11, false, o10.nullInteraction || !(o10.connectNulls && !e10 && !i10))).forEach(function(l3, d2) {
      let c2, p2 = l3.plotX, g2 = l3.plotY, u2 = t11[d2 - 1], f2 = l3.isNull || "number" != typeof g2;
      (l3.leftCliff || u2?.rightCliff) && !i10 && (n10 = true), f2 && !nV(e10) && d2 > 0 ? n10 = !o10.connectNulls : f2 && !e10 ? n10 = true : (0 === d2 || n10 ? c2 = [["M", l3.plotX, l3.plotY]] : s10.getPointSpline ? c2 = [s10.getPointSpline(t11, l3, d2)] : h10 ? (c2 = 1 === h10 ? [["L", u2.plotX, g2]] : 2 === h10 ? [["L", (u2.plotX + p2) / 2, u2.plotY], ["L", (u2.plotX + p2) / 2, g2]] : [["L", p2, u2.plotY]]).push(["L", p2, g2]) : c2 = [["L", p2, g2]], a10.push(l3.x), h10 && (a10.push(l3.x), 2 === h10 && a10.push(l3.x)), r10.push.apply(r10, c2), n10 = false);
    }), r10.xMap = a10, s10.graphPath = r10, r10;
  }
};
n_.defaultOptions = nZ(an.defaultOptions, {
  legendSymbol: "lineMarker"
}), rR.registerSeriesType("line", n_);
var {
  seriesTypes: {
    line: nK
  }
} = rR;
var {
  extend: nJ,
  merge: nQ,
  objectEach: n0,
  pick: n1
} = ta;
var n2 = class extends nK {
  drawGraph() {
    this.areaPath = [], super.drawGraph.apply(this);
    let {
      areaPath: t11,
      options: e10
    } = this;
    [this, ...this.zones].forEach((i10, s10) => {
      let o10 = {}, r10 = i10.fillColor || e10.fillColor, a10 = i10.area, n10 = a10 ? "animate" : "attr";
      a10 ? (a10.endX = this.preventGraphAnimation ? null : t11.xMap, a10.animate({
        d: t11
      })) : (o10.zIndex = 0, (a10 = i10.area = this.chart.renderer.path(t11).addClass("highcharts-area" + (s10 ? ` highcharts-zone-area-${s10 - 1} ` : " ") + (s10 && i10.className || "")).add(this.group)).isArea = true), this.chart.styledMode || (o10.fill = r10 || i10.color || this.color, o10["fill-opacity"] = r10 ? 1 : e10.fillOpacity ?? 0.75, a10.css({
        pointerEvents: this.stickyTracking ? "none" : "auto"
      })), a10[n10](o10), a10.startX = t11.xMap, a10.shiftUnit = e10.step ? 2 : 1;
    });
  }
  getGraphPath(t11) {
    let e10, i10, s10, o10 = nK.prototype.getGraphPath, r10 = this.options, a10 = r10.stacking, n10 = this.yAxis, h10 = [], l2 = [], d2 = this.index, c2 = n10.stacking.stacks[this.stackKey], p2 = r10.threshold, g2 = Math.round(n10.getThreshold(r10.threshold)), u2 = n1(r10.connectNulls, "percent" === a10), f2 = function(i11, s11, o11) {
      let r11 = t11[i11], u3 = a10 && c2[r11.x].points[d2], f3 = r11[o11 + "Null"] || 0, m3 = r11[o11 + "Cliff"] || 0, x3, y3, b3 = true;
      m3 || f3 ? (x3 = (f3 ? u3[0] : u3[1]) + m3, y3 = u3[0] + m3, b3 = !!f3) : !a10 && t11[s11] && t11[s11].isNull && (x3 = y3 = p2), void 0 !== x3 && (l2.push({
        plotX: e10,
        plotY: null === x3 ? g2 : n10.getThreshold(x3),
        isNull: b3,
        isCliff: true
      }), h10.push({
        plotX: e10,
        plotY: null === y3 ? g2 : n10.getThreshold(y3),
        doCurve: false
      }));
    };
    t11 = t11 || this.points, a10 && (t11 = this.getStackPoints(t11));
    for (let o11 = 0, r11 = t11.length; o11 < r11; ++o11) a10 || (t11[o11].leftCliff = t11[o11].rightCliff = t11[o11].leftNull = t11[o11].rightNull = void 0), i10 = t11[o11].isNull, e10 = n1(t11[o11].rectPlotX, t11[o11].plotX), s10 = a10 ? n1(t11[o11].yBottom, g2) : g2, (!i10 || u2) && (u2 || f2(o11, o11 - 1, "left"), i10 && !a10 && u2 || (l2.push(t11[o11]), h10.push({
      x: o11,
      plotX: e10,
      plotY: s10
    })), u2 || f2(o11, o11 + 1, "right"));
    let m2 = o10.call(this, l2, true, true);
    h10.reversed = true;
    let x2 = o10.call(this, h10, true, true), y2 = x2[0];
    y2 && "M" === y2[0] && (x2[0] = ["L", y2[1], y2[2]]);
    let b2 = m2.concat(x2);
    b2.length && b2.push(["Z"]);
    let v2 = o10.call(this, l2, false, u2);
    return this.chart.series.length > 1 && a10 && l2.some((t12) => t12.isCliff) && (b2.hasStackedCliffs = v2.hasStackedCliffs = true), b2.xMap = m2.xMap, this.areaPath = b2, v2;
  }
  getStackPoints(t11) {
    let e10 = this, i10 = [], s10 = [], o10 = this.xAxis, r10 = this.yAxis, a10 = r10.stacking.stacks[this.stackKey], n10 = {}, h10 = r10.series, l2 = h10.length, d2 = r10.options.reversedStacks ? 1 : -1, c2 = h10.indexOf(e10);
    if (t11 = t11 || this.points, this.options.stacking) {
      for (let e11 = 0; e11 < t11.length; e11++) t11[e11].leftNull = t11[e11].rightNull = void 0, n10[t11[e11].x] = t11[e11];
      n0(a10, function(t12, e11) {
        null !== t12.total && s10.push(e11);
      }), s10.sort(function(t12, e11) {
        return t12 - e11;
      });
      let p2 = h10.map((t12) => t12.visible);
      s10.forEach(function(t12, g2) {
        let u2 = 0, f2, m2;
        if (n10[t12] && !n10[t12].isNull) i10.push(n10[t12]), [-1, 1].forEach(function(i11) {
          let o11 = 1 === i11 ? "rightNull" : "leftNull", r11 = a10[s10[g2 + i11]], u3 = 0;
          if (r11) {
            let i12 = c2;
            for (; i12 >= 0 && i12 < l2; ) {
              let s11 = h10[i12].index;
              !(f2 = r11.points[s11]) && (s11 === e10.index ? n10[t12][o11] = true : p2[i12] && (m2 = a10[t12].points[s11]) && (u3 -= m2[1] - m2[0])), i12 += d2;
            }
          }
          n10[t12][1 === i11 ? "rightCliff" : "leftCliff"] = u3;
        });
        else {
          let e11 = c2;
          for (; e11 >= 0 && e11 < l2; ) {
            let i11 = h10[e11].index;
            if (f2 = a10[t12].points[i11]) {
              u2 = f2[1];
              break;
            }
            e11 += d2;
          }
          u2 = n1(u2, 0), u2 = r10.translate(u2, 0, 1, 0, 1), i10.push({
            isNull: true,
            plotX: o10.translate(t12, 0, 0, 0, 1),
            x: t12,
            plotY: u2,
            yBottom: u2
          });
        }
      });
    }
    return i10;
  }
};
n2.defaultOptions = nQ(nK.defaultOptions, {
  threshold: 0,
  legendSymbol: "areaMarker"
}), nJ(n2.prototype, {
  singleStacks: false
}), rR.registerSeriesType("area", n2);
var {
  line: n3
} = rR.seriesTypes;
var {
  merge: n5,
  pick: n6
} = ta;
var n9 = class extends n3 {
  getPointSpline(t11, e10, i10) {
    let s10, o10, r10, a10, n10 = e10.plotX || 0, h10 = e10.plotY || 0, l2 = t11[i10 - 1], d2 = t11[i10 + 1];
    function c2(t12) {
      return t12 && !t12.isNull && false !== t12.doCurve && !e10.isCliff;
    }
    if (c2(l2) && c2(d2)) {
      let t12 = l2.plotX || 0, i11 = l2.plotY || 0, c3 = d2.plotX || 0, p3 = d2.plotY || 0, g2 = 0;
      s10 = (1.5 * n10 + t12) / 2.5, o10 = (1.5 * h10 + i11) / 2.5, r10 = (1.5 * n10 + c3) / 2.5, a10 = (1.5 * h10 + p3) / 2.5, r10 !== s10 && (g2 = (a10 - o10) * (r10 - n10) / (r10 - s10) + h10 - a10), o10 += g2, a10 += g2, o10 > i11 && o10 > h10 ? (o10 = Math.max(i11, h10), a10 = 2 * h10 - o10) : o10 < i11 && o10 < h10 && (o10 = Math.min(i11, h10), a10 = 2 * h10 - o10), a10 > p3 && a10 > h10 ? (a10 = Math.max(p3, h10), o10 = 2 * h10 - a10) : a10 < p3 && a10 < h10 && (a10 = Math.min(p3, h10), o10 = 2 * h10 - a10), e10.rightContX = r10, e10.rightContY = a10, e10.controlPoints = {
        low: [s10, o10],
        high: [r10, a10]
      };
    }
    let p2 = ["C", n6(l2.rightContX, l2.plotX, 0), n6(l2.rightContY, l2.plotY, 0), n6(s10, n10, 0), n6(o10, h10, 0), n10, h10];
    return l2.rightContX = l2.rightContY = void 0, p2;
  }
};
n9.defaultOptions = n5(n3.defaultOptions), rR.registerSeriesType("spline", n9);
var n4 = n9;
var {
  area: n8,
  area: {
    prototype: n7
  }
} = rR.seriesTypes;
var {
  extend: ht,
  merge: he
} = ta;
var hi = class extends n4 {
};
hi.defaultOptions = he(n4.defaultOptions, n8.defaultOptions), ht(hi.prototype, {
  getGraphPath: n7.getGraphPath,
  getStackPoints: n7.getStackPoints,
  drawGraph: n7.drawGraph
}), rR.registerSeriesType("areaspline", hi);
var {
  animObject: hs
} = t3;
var {
  parse: ho
} = tG;
var {
  noop: hr
} = N;
var {
  clamp: ha,
  crisp: hn,
  defined: hh,
  extend: hl,
  fireEvent: hd,
  isArray: hc,
  isNumber: hp,
  merge: hg,
  pick: hu,
  objectEach: hf
} = ta;
var hm = class extends an {
  animate(t11) {
    let e10, i10, s10 = this, o10 = this.yAxis, r10 = o10.pos, a10 = o10.reversed, n10 = s10.options, {
      clipOffset: h10,
      inverted: l2
    } = this.chart, d2 = {}, c2 = l2 ? "translateX" : "translateY";
    t11 && h10 ? (d2.scaleY = 1e-3, i10 = ha(o10.toPixels(n10.threshold || 0), r10, r10 + o10.len), l2 ? d2.translateX = (i10 += a10 ? -Math.floor(h10[0]) : Math.ceil(h10[2])) - o10.len : d2.translateY = i10 += a10 ? Math.ceil(h10[0]) : -Math.floor(h10[2]), s10.clipBox && s10.setClip(), s10.group.attr(d2)) : (e10 = Number(s10.group.attr(c2)), s10.group.animate({
      scaleY: 1
    }, hl(hs(s10.options.animation), {
      step: function(t12, i11) {
        s10.group && (d2[c2] = e10 + i11.pos * (r10 - e10), s10.group.attr(d2));
      }
    })));
  }
  init(t11, e10) {
    super.init.apply(this, arguments);
    let i10 = this;
    (t11 = i10.chart).hasRendered && t11.series.forEach(function(t12) {
      t12.type === i10.type && (t12.isDirty = true);
    });
  }
  getColumnMetrics() {
    let t11 = this, e10 = t11.options, i10 = t11.xAxis, s10 = t11.yAxis, o10 = i10.options.reversedStacks, r10 = i10.reversed && !o10 || !i10.reversed && o10, a10 = {}, n10, h10 = 0;
    false === e10.grouping ? h10 = 1 : t11.chart.series.forEach(function(e11) {
      let i11, o11 = e11.yAxis, r11 = e11.options;
      e11.type === t11.type && e11.reserveSpace() && s10.len === o11.len && s10.pos === o11.pos && (r11.stacking && "group" !== r11.stacking ? (void 0 === a10[n10 = e11.stackKey] && (a10[n10] = h10++), i11 = a10[n10]) : false !== r11.grouping && (i11 = h10++), e11.columnIndex = i11);
    });
    let l2 = Math.min(Math.abs(i10.transA) * (!i10.brokenAxis?.hasBreaks && i10.ordinal?.slope || e10.pointRange || i10.closestPointRange || i10.tickInterval || 1), i10.len), d2 = l2 * e10.groupPadding, c2 = (l2 - 2 * d2) / (h10 || 1), p2 = Math.min(e10.maxPointWidth || i10.len, hu(e10.pointWidth, c2 * (1 - 2 * e10.pointPadding))), g2 = (t11.columnIndex || 0) + +!!r10;
    return t11.columnMetrics = {
      width: p2,
      offset: (c2 - p2) / 2 + (d2 + g2 * c2 - l2 / 2) * (r10 ? -1 : 1),
      paddedWidth: c2,
      columnCount: h10
    }, t11.columnMetrics;
  }
  crispCol(t11, e10, i10, s10) {
    let o10 = this.borderWidth, r10 = this.chart.inverted;
    return s10 = hn(e10 + s10, o10, r10) - (e10 = hn(e10, o10, r10)), this.options.crisp && (i10 = hn(t11 + i10, o10) - (t11 = hn(t11, o10))), {
      x: t11,
      y: e10,
      width: i10,
      height: s10
    };
  }
  adjustForMissingColumns(t11, e10, i10, s10) {
    if (!i10.isNull && s10.columnCount > 1) {
      let o10 = this.xAxis.series.filter((t12) => t12.visible).map((t12) => t12.index), r10 = 0, a10 = 0;
      hf(this.xAxis.stacking?.stacks, (t12) => {
        let e11 = "number" == typeof i10.x ? t12[i10.x.toString()]?.points : void 0, s11 = e11?.[this.index], n11 = {};
        if (e11 && hc(s11)) {
          let t13 = this.index, i11 = Object.keys(e11).filter((t14) => !t14.match(",") && e11[t14] && e11[t14].length > 1).map(parseFloat).filter((t14) => -1 !== o10.indexOf(t14)).filter((e12) => {
            let i12 = this.chart.series[e12].options, s12 = i12.stacking && i12.stack;
            if (hh(s12)) {
              if (hp(n11[s12])) return t13 === e12 && (t13 = n11[s12]), false;
              n11[s12] = e12;
            }
            return true;
          }).sort((t14, e12) => e12 - t14);
          r10 = i11.indexOf(t13), a10 = i11.length;
        }
      }), r10 = this.xAxis.reversed ? a10 - 1 - r10 : r10;
      let n10 = (a10 - 1) * s10.paddedWidth + e10;
      t11 = (i10.plotX || 0) + n10 / 2 - e10 - r10 * s10.paddedWidth;
    }
    return t11;
  }
  translate() {
    let t11 = this, e10 = t11.chart, i10 = t11.options, s10 = t11.dense = t11.closestPointRange * t11.xAxis.transA < 2, o10 = t11.borderWidth = hu(i10.borderWidth, +!s10), r10 = t11.xAxis, a10 = t11.yAxis, n10 = i10.threshold, h10 = hu(i10.minPointLength, 5), l2 = t11.getColumnMetrics(), d2 = l2.width, c2 = t11.pointXOffset = l2.offset, p2 = t11.dataMin, g2 = t11.dataMax, u2 = t11.translatedThreshold = a10.getThreshold(n10), f2 = t11.barW = Math.max(d2, 1 + 2 * o10);
    i10.pointPadding && i10.crisp && (f2 = Math.ceil(f2)), an.prototype.translate.apply(t11), t11.points.forEach(function(s11) {
      let o11 = hu(s11.yBottom, u2), m2 = 999 + Math.abs(o11), x2 = s11.plotX || 0, y2 = ha(s11.plotY, -m2, a10.len + m2), b2, v2 = Math.min(y2, o11), k2 = Math.max(y2, o11) - v2, M2 = d2, w2 = x2 + c2, S2 = f2;
      h10 && Math.abs(k2) < h10 && (k2 = h10, b2 = !a10.reversed && !s11.negative || a10.reversed && s11.negative, hp(n10) && hp(g2) && s11.y === n10 && g2 <= n10 && (a10.min || 0) < n10 && (p2 !== g2 || (a10.max || 0) <= n10) && (b2 = !b2, s11.negative = !s11.negative), v2 = Math.abs(v2 - u2) > h10 ? o11 - h10 : u2 - (b2 ? h10 : 0)), hh(s11.options.pointWidth) && (w2 -= Math.round(((M2 = S2 = Math.ceil(s11.options.pointWidth)) - d2) / 2)), i10.centerInCategory && (w2 = t11.adjustForMissingColumns(w2, M2, s11, l2)), s11.barX = w2, s11.pointWidth = M2, s11.tooltipPos = e10.inverted ? [ha(a10.len + a10.pos - e10.plotLeft - y2, a10.pos - e10.plotLeft, a10.len + a10.pos - e10.plotLeft), r10.len + r10.pos - e10.plotTop - w2 - S2 / 2, k2] : [r10.left - e10.plotLeft + w2 + S2 / 2, ha(y2 + a10.pos - e10.plotTop, a10.pos - e10.plotTop, a10.len + a10.pos - e10.plotTop), k2], s11.shapeType = t11.pointClass.prototype.shapeType || "roundedRect", s11.shapeArgs = t11.crispCol(w2, v2, S2, s11.isNull ? 0 : k2);
    }), hd(this, "afterColumnTranslate");
  }
  drawGraph() {
    this.group[this.dense ? "addClass" : "removeClass"]("highcharts-dense-data");
  }
  pointAttribs(t11, e10) {
    let i10 = this.options, s10 = this.pointAttrToOptions || {}, o10 = s10.stroke || "borderColor", r10 = s10["stroke-width"] || "borderWidth", a10, n10, h10, l2 = t11 && t11.color || this.color, d2 = t11 && t11[o10] || i10[o10] || l2, c2 = t11 && t11.options.dashStyle || i10.dashStyle, p2 = t11 && t11[r10] || i10[r10] || this[r10] || 0, g2 = t11?.isNull && i10.nullInteraction ? 0 : t11?.opacity ?? i10.opacity ?? 1;
    t11 && this.zones.length && (n10 = t11.getZone(), l2 = t11.options.color || n10 && (n10.color || t11.nonZonedColor) || this.color, n10 && (d2 = n10.borderColor || d2, c2 = n10.dashStyle || c2, p2 = n10.borderWidth || p2)), e10 && t11 && (h10 = (a10 = hg(i10.states[e10], t11.options.states?.[e10] || {})).brightness, l2 = a10.color || void 0 !== h10 && ho(l2).brighten(a10.brightness).get() || l2, d2 = a10[o10] || d2, p2 = a10[r10] || p2, c2 = a10.dashStyle || c2, g2 = hu(a10.opacity, g2));
    let u2 = {
      fill: l2,
      stroke: d2,
      "stroke-width": p2,
      opacity: g2
    };
    return c2 && (u2.dashstyle = c2), u2;
  }
  drawPoints(t11 = this.points) {
    let e10, i10 = this, s10 = this.chart, o10 = i10.options, r10 = o10.nullInteraction, a10 = s10.renderer, n10 = o10.animationLimit || 250;
    t11.forEach(function(t12) {
      let h10 = t12.plotY, l2 = t12.graphic, d2 = !!l2, c2 = l2 && s10.pointCount < n10 ? "animate" : "attr";
      hp(h10) && (null !== t12.y || r10) ? (e10 = t12.shapeArgs, l2 && t12.hasNewShapeType() && (l2 = l2.destroy()), i10.enabledDataSorting && (t12.startXPos = i10.xAxis.reversed ? -(e10 && e10.width || 0) : i10.xAxis.width), !l2 && (t12.graphic = l2 = a10[t12.shapeType](e10).add(t12.group || i10.group), l2 && i10.enabledDataSorting && s10.hasRendered && s10.pointCount < n10 && (l2.attr({
        x: t12.startXPos
      }), d2 = true, c2 = "animate")), l2 && d2 && l2[c2](hg(e10)), s10.styledMode || l2[c2](i10.pointAttribs(t12, t12.selected && "select")).shadow(false !== t12.allowShadow && o10.shadow), l2 && (l2.addClass(t12.getClassName(), true), l2.attr({
        visibility: t12.visible ? "inherit" : "hidden"
      }))) : l2 && (t12.graphic = l2.destroy());
    });
  }
  drawTracker(t11 = this.points) {
    let e10, i10 = this, s10 = i10.chart, o10 = s10.pointer, r10 = function(t12) {
      o10?.normalize(t12);
      let e11 = o10?.getPointFromEvent(t12);
      o10 && e11 && i10.options.enableMouseTracking && (s10.isInsidePlot(t12.chartX - s10.plotLeft, t12.chartY - s10.plotTop, {
        visiblePlotOnly: true
      }) || o10?.inClass(t12.target, "highcharts-data-label")) && (o10.isDirectTouch = true, e11.onMouseOver(t12));
    };
    t11.forEach(function(t12) {
      e10 = hc(t12.dataLabels) ? t12.dataLabels : t12.dataLabel ? [t12.dataLabel] : [], t12.graphic && (t12.graphic.element.point = t12), e10.forEach(function(e11) {
        (e11.div || e11.element).point = t12;
      });
    }), i10._hasTracking || (i10.trackerGroups?.reduce((t12, e11) => ("dataLabelsGroup" === e11 ? t12.push(...i10.dataLabelsGroups || []) : t12.push(i10[e11]), t12), []).forEach((t12) => {
      t12 && (t12.addClass("highcharts-tracker").on("mouseover", r10).on("mouseout", function(t13) {
        o10?.onTrackerMouseOut(t13);
      }).on("touchstart", r10), !s10.styledMode && i10.options.cursor && t12.css({
        cursor: i10.options.cursor
      }));
    }), i10._hasTracking = true), hd(this, "afterDrawTracker");
  }
  remove() {
    let t11 = this, e10 = t11.chart;
    e10.hasRendered && e10.series.forEach(function(e11) {
      e11.type === t11.type && (e11.isDirty = true);
    }), an.prototype.remove.apply(t11, arguments);
  }
};
hm.defaultOptions = hg(an.defaultOptions, {
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
}), hl(hm.prototype, {
  directTouch: true,
  getSymbol: hr,
  negStacks: true,
  trackerGroups: ["group", "dataLabelsGroup"]
}), rR.registerSeriesType("column", hm);
var hx = hm;
var {
  getDeferredAnimation: hy
} = t3;
var {
  format: hb
} = ew;
var {
  defined: hv,
  extend: hk,
  fireEvent: hM,
  getAlignFactor: hw,
  isArray: hS,
  isString: hT,
  merge: hC,
  objectEach: hA,
  pick: hP,
  pInt: hL,
  splat: hO
} = ta;
!function(t11) {
  function e10() {
    return h10(this).some((t12) => t12?.enabled);
  }
  function i10(t12, e11, i11, s11, o11) {
    let {
      chart: r11,
      enabledDataSorting: a11
    } = this, n11 = this.isCartesian && r11.inverted, h11 = t12.plotX, l3 = t12.plotY, d2 = i11.rotation || 0, c2 = hv(h11) && hv(l3) && r11.isInsidePlot(h11, Math.round(l3), {
      inverted: n11,
      paneCoordinates: true,
      series: this
    }), p2 = 0 === d2 && "justify" === hP(i11.overflow, a11 ? "none" : "justify"), g2 = this.visible && false !== t12.visible && hv(h11) && (t12.series.forceDL || a11 && !p2 || c2 || hP(i11.inside, !!this.options.stacking) && s11 && r11.isInsidePlot(h11, n11 ? s11.x + 1 : s11.y + s11.height - 1, {
      inverted: n11,
      paneCoordinates: true,
      series: this
    })), u2 = t12.pos();
    if (g2 && u2) {
      var f2;
      let h12 = e11.getBBox(), l4 = e11.getBBox(void 0, 0);
      if (s11 = hk({
        x: u2[0],
        y: Math.round(u2[1]),
        width: 0,
        height: 0
      }, s11 || {}), "plotEdges" === i11.alignTo && this.isCartesian && (s11[n11 ? "x" : "y"] = 0, s11[n11 ? "width" : "height"] = this.yAxis?.len || 0), hk(i11, {
        width: h12.width,
        height: h12.height
      }), f2 = s11, a11 && this.xAxis && !p2 && this.setDataLabelStartPos(t12, e11, o11, c2, f2), e11.align(hC(i11, {
        width: l4.width,
        height: l4.height
      }), false, s11, false), e11.alignAttr.x += hw(i11.align) * (l4.width - h12.width), e11.alignAttr.y += hw(i11.verticalAlign) * (l4.height - h12.height), e11[e11.placed ? "animate" : "attr"]({
        "text-align": e11.alignAttr["text-align"] || "center",
        x: e11.alignAttr.x + (h12.width - l4.width) / 2,
        y: e11.alignAttr.y + (h12.height - l4.height) / 2,
        rotationOriginX: (e11.width || 0) / 2,
        rotationOriginY: (e11.height || 0) / 2
      }), p2 && s11.height >= 0) this.justifyDataLabel(e11, i11, e11.alignAttr, h12, s11, o11);
      else if (hP(i11.crop, true)) {
        let {
          x: t13,
          y: i12
        } = e11.alignAttr;
        g2 = r11.isInsidePlot(t13, i12, {
          paneCoordinates: true,
          series: this
        }) && r11.isInsidePlot(t13 + h12.width - 1, i12 + h12.height - 1, {
          paneCoordinates: true,
          series: this
        });
      }
      i11.shape && !d2 && e11[o11 ? "attr" : "animate"]({
        anchorX: u2[0],
        anchorY: u2[1]
      });
    }
    o11 && a11 && (e11.placed = false), g2 || a11 && !p2 ? (e11.show(), e11.placed = true) : (e11.hide(), e11.placed = false);
  }
  function s10(t12, e11) {
    hM(this, "initDataLabelsGroup", {
      index: t12,
      zIndex: e11?.zIndex ?? 6
    }), this.dataLabelsGroup = this.dataLabelsGroups?.[t12];
    let i11 = this.plotGroup("dataLabelsGroup", "data-labels", this.hasRendered ? "inherit" : "hidden", e11?.zIndex ?? 6, this.dataLabelsParentGroups?.[t12]);
    return this.dataLabelsGroups || (this.dataLabelsGroups = []), this.dataLabelsGroups[t12] = i11, this.dataLabelsGroup = this.dataLabelsGroups[0], i11;
  }
  function o10(t12, e11, i11) {
    let s11 = !!this.hasRendered, o11 = this.initDataLabelsGroup(t12, i11).attr({
      opacity: +s11
    });
    return !s11 && o11 && (this.visible && o11.show(), this.options.animation ? o11.animate({
      opacity: 1
    }, e11) : o11.attr({
      opacity: 1
    })), o11;
  }
  function r10(t12) {
    let e11;
    t12 = t12 || this.points;
    let i11 = this, s11 = i11.chart, o11 = i11.options, r11 = s11.renderer, {
      backgroundColor: a11,
      plotBackgroundColor: l3
    } = s11.options.chart, d2 = r11.getContrast(hT(l3) && l3 || hT(a11) && a11 || "#000000"), c2 = h10(i11), {
      animation: p2,
      defer: g2
    } = c2[0], u2 = g2 ? hy(s11, p2, i11) : {
      defer: 0,
      duration: 0
    };
    hM(this, "drawDataLabels"), i11.hasDataLabels?.() && t12.forEach((t13) => {
      let a12 = t13.dataLabels || [], h11 = t13.color || i11.color;
      hO(n10(c2, t13.dlOptions || t13.options?.dataLabels)).forEach((n11, l5) => {
        e11 = this.initDataLabels(l5, u2, n11);
        let c3 = n11.enabled && (t13.visible || t13.dataLabelOnHidden) && (!t13.isNull || t13.dataLabelOnNull) && function(t14, e12) {
          let i12 = e12.filter;
          if (i12) {
            let e13 = i12.operator, s12 = t14[i12.property], o12 = i12.value;
            return ">" === e13 && s12 > o12 || "<" === e13 && s12 < o12 || ">=" === e13 && s12 >= o12 || "<=" === e13 && s12 <= o12 || "==" === e13 && s12 == o12 || "===" === e13 && s12 === o12 || "!=" === e13 && s12 != o12 || "!==" === e13 && s12 !== o12 || false;
          }
          return true;
        }(t13, n11), {
          backgroundColor: p3,
          borderColor: g3,
          distance: f2,
          style: m2 = {}
        } = n11, x2, y2, b2, v2 = {}, k2 = a12[l5], M2 = !k2, w2;
        c3 && (y2 = hv(x2 = hP(n11[t13.formatPrefix + "Format"], n11.format)) ? hb(x2, t13, s11) : (n11[t13.formatPrefix + "Formatter"] || n11.formatter).call(t13, n11), b2 = n11.rotation, !s11.styledMode && (m2.color = hP(n11.color, m2.color, hT(i11.color) ? i11.color : void 0, "#000000"), "contrast" === m2.color ? ("none" !== p3 && (w2 = p3), t13.contrastColor = r11.getContrast("auto" !== w2 && hT(w2) && w2 || (hT(h11) ? h11 : "")), m2.color = w2 || !hv(f2) && n11.inside || 0 > hL(f2 || 0) || o11.stacking ? t13.contrastColor : d2) : delete t13.contrastColor, o11.cursor && (m2.cursor = o11.cursor)), v2 = {
          r: n11.borderRadius || 0,
          rotation: b2,
          padding: n11.padding,
          zIndex: 1
        }, s11.styledMode || (v2.fill = "auto" === p3 ? t13.color : p3, v2.stroke = "auto" === g3 ? t13.color : g3, v2["stroke-width"] = n11.borderWidth), hA(v2, (t14, e12) => {
          void 0 === t14 && delete v2[e12];
        })), !k2 || c3 && hv(y2) && !!(k2.div || k2.text?.foreignObject) == !!n11.useHTML && (k2.rotation && n11.rotation || k2.rotation === n11.rotation) || (k2 = void 0, M2 = true), c3 && hv(y2) && "" !== y2 && (k2 ? v2.text = y2 : (k2 = r11.label(y2, 0, 0, n11.shape, void 0, void 0, n11.useHTML, void 0, "data-label")).addClass(" highcharts-data-label-color-" + t13.colorIndex + " " + (n11.className || "") + (n11.useHTML ? " highcharts-tracker" : "")), k2 && (k2.options = n11, k2.attr(v2), s11.styledMode ? m2.width && k2.css({
          width: m2.width,
          textOverflow: m2.textOverflow,
          whiteSpace: m2.whiteSpace
        }) : k2.css(m2).shadow(n11.shadow), hM(k2, "beforeAddingDataLabel", {
          labelOptions: n11,
          point: t13
        }), k2.added || k2.add(e11), i11.alignDataLabel(t13, k2, n11, void 0, M2), k2.isActive = true, a12[l5] && a12[l5] !== k2 && a12[l5].destroy(), a12[l5] = k2));
      });
      let l4 = a12.length;
      for (; l4--; ) a12[l4]?.isActive ? a12[l4].isActive = false : (a12[l4]?.destroy(), a12.splice(l4, 1));
      t13.dataLabel = a12[0], t13.dataLabels = a12;
    }), hM(this, "afterDrawDataLabels");
  }
  function a10(t12, e11, i11, s11, o11, r11) {
    let a11 = this.chart, n11 = e11.align, h11 = e11.verticalAlign, l3 = t12.box ? 0 : t12.padding || 0, d2 = a11.inverted ? this.yAxis : this.xAxis, c2 = d2 ? d2.left - a11.plotLeft : 0, p2 = a11.inverted ? this.xAxis : this.yAxis, g2 = p2 ? p2.top - a11.plotTop : 0, {
      x: u2 = 0,
      y: f2 = 0
    } = e11, m2, x2;
    return (m2 = (i11.x || 0) + l3 + c2) < 0 && ("right" === n11 && u2 >= 0 ? (e11.align = "left", e11.inside = true) : u2 -= m2, x2 = true), (m2 = (i11.x || 0) + s11.width - l3 + c2) > a11.plotWidth && ("left" === n11 && u2 <= 0 ? (e11.align = "right", e11.inside = true) : u2 += a11.plotWidth - m2, x2 = true), (m2 = i11.y + l3 + g2) < 0 && ("bottom" === h11 && f2 >= 0 ? (e11.verticalAlign = "top", e11.inside = true) : f2 -= m2, x2 = true), (m2 = (i11.y || 0) + s11.height - l3 + g2) > a11.plotHeight && ("top" === h11 && f2 <= 0 ? (e11.verticalAlign = "bottom", e11.inside = true) : f2 += a11.plotHeight - m2, x2 = true), x2 && (e11.x = u2, e11.y = f2, t12.placed = !r11, t12.align(e11, void 0, o11)), x2;
  }
  function n10(t12, e11) {
    let i11 = [], s11;
    if (hS(t12) && !hS(e11)) i11 = t12.map(function(t13) {
      return hC(t13, e11);
    });
    else if (hS(e11) && !hS(t12)) i11 = e11.map(function(e12) {
      return hC(t12, e12);
    });
    else if (hS(t12) || hS(e11)) {
      if (hS(t12) && hS(e11)) for (s11 = Math.max(t12.length, e11.length); s11--; ) i11[s11] = hC(t12[s11], e11[s11]);
    } else i11 = hC(t12, e11);
    return i11;
  }
  function h10(t12) {
    let e11 = t12.chart.options.plotOptions;
    return hO(n10(n10(e11?.series?.dataLabels, e11?.[t12.type]?.dataLabels), t12.options.dataLabels));
  }
  function l2(t12, e11, i11, s11, o11) {
    let r11 = this.chart, a11 = r11.inverted, n11 = this.xAxis, h11 = n11.reversed, l3 = ((a11 ? e11.height : e11.width) || 0) / 2, d2 = t12.pointWidth, c2 = d2 ? d2 / 2 : 0;
    e11.startXPos = a11 ? o11.x : h11 ? -l3 - c2 : n11.width - l3 + c2, e11.startYPos = a11 ? h11 ? this.yAxis.height - l3 + c2 : -l3 - c2 : o11.y, s11 ? "hidden" === e11.visibility && (e11.show(), e11.attr({
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
  t11.compose = function(t12) {
    let h11 = t12.prototype;
    h11.initDataLabels || (h11.initDataLabels = o10, h11.initDataLabelsGroup = s10, h11.alignDataLabel = i10, h11.drawDataLabels = r10, h11.justifyDataLabel = a10, h11.mergeArrays = n10, h11.setDataLabelStartPos = l2, h11.hasDataLabels = e10);
  };
}(P || (P = {}));
var hE = P;
var {
  composed: hI
} = N;
var {
  series: hD
} = rR;
var {
  merge: hB,
  pushUnique: hN
} = ta;
function hz(t11, e10, i10, s10, o10) {
  let {
    chart: r10,
    options: a10
  } = this, n10 = r10.inverted, h10 = this.xAxis?.len || r10.plotSizeX || 0, l2 = this.yAxis?.len || r10.plotSizeY || 0, d2 = t11.dlBox || t11.shapeArgs, c2 = t11.below ?? (t11.plotY || 0) > (this.translatedThreshold ?? l2), p2 = i10.inside ?? !!a10.stacking;
  if (d2) {
    if (s10 = hB(d2), "allow" !== i10.overflow || false !== i10.crop || false !== a10.clip) {
      s10.y < 0 && (s10.height += s10.y, s10.y = 0);
      let t12 = s10.y + s10.height - l2;
      t12 > 0 && t12 < s10.height - 1 && (s10.height -= t12);
    }
    n10 && (s10 = {
      x: l2 - s10.y - s10.height,
      y: h10 - s10.x - s10.width,
      width: s10.height,
      height: s10.width
    }), p2 || (n10 ? (s10.x += c2 ? 0 : s10.width, s10.width = 0) : (s10.y += c2 ? s10.height : 0, s10.height = 0));
  }
  i10.align ?? (i10.align = !n10 || p2 ? "center" : c2 ? "right" : "left"), i10.verticalAlign ?? (i10.verticalAlign = n10 || p2 ? "middle" : c2 ? "top" : "bottom"), hD.prototype.alignDataLabel.call(this, t11, e10, i10, s10, o10), i10.inside && t11.contrastColor && e10.css({
    color: t11.contrastColor
  });
}
(L || (L = {})).compose = function(t11) {
  hE.compose(hD), hN(hI, "ColumnDataLabel") && (t11.prototype.alignDataLabel = hz);
};
var hR = L;
var {
  extend: hW,
  merge: hX
} = ta;
var hF = class extends hx {
};
hF.defaultOptions = hX(hx.defaultOptions, {}), hW(hF.prototype, {
  inverted: true
}), rR.registerSeriesType("bar", hF);
var {
  column: hG,
  line: hH
} = rR.seriesTypes;
var {
  addEvent: hY,
  extend: hj,
  merge: hU
} = ta;
var h$ = class extends hH {
  applyJitter() {
    let t11 = this, e10 = this.options.jitter, i10 = this.points.length;
    e10 && this.points.forEach(function(s10, o10) {
      ["x", "y"].forEach(function(r10, a10) {
        if (e10[r10] && !s10.isNull) {
          let n10 = `plot${r10.toUpperCase()}`, h10 = t11[`${r10}Axis`], l2 = e10[r10] * h10.transA;
          if (h10 && !h10.logarithmic) {
            let t12, e11 = Math.max(0, (s10[n10] || 0) - l2), d2 = Math.min(h10.len, (s10[n10] || 0) + l2);
            s10[n10] = e11 + (d2 - e11) * ((t12 = 1e4 * Math.sin(o10 + a10 * i10)) - Math.floor(t12)), "x" === r10 && (s10.clientX = s10.plotX);
          }
        }
      });
    });
  }
  drawGraph() {
    this.options.lineWidth ? super.drawGraph() : this.graph && (this.graph = this.graph.destroy());
  }
};
h$.defaultOptions = hU(hH.defaultOptions, {
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
}), hj(h$.prototype, {
  drawTracker: hG.prototype.drawTracker,
  sorted: false,
  requireSorting: false,
  noSharedTooltip: true,
  trackerGroups: ["group", "markerGroup", "dataLabelsGroup"]
}), hY(h$, "afterTranslate", function() {
  this.applyJitter();
}), rR.registerSeriesType("scatter", h$);
var {
  deg2rad: hV
} = N;
var {
  fireEvent: hZ,
  isNumber: hq,
  pick: h_,
  relativeLength: hK
} = ta;
(g = O || (O = {})).getCenter = function() {
  let t11 = this.options, e10 = this.chart, i10 = 2 * (t11.slicedOffset || 0), s10 = e10.plotWidth - 2 * i10, o10 = e10.plotHeight - 2 * i10, r10 = t11.center, a10 = Math.min(s10, o10), n10 = t11.thickness, h10, l2 = t11.size, d2 = t11.innerSize || 0, c2, p2;
  "string" == typeof l2 && (l2 = parseFloat(l2)), "string" == typeof d2 && (d2 = parseFloat(d2));
  let g2 = [h_(r10?.[0], "50%"), h_(r10?.[1], "50%"), h_(l2 && l2 < 0 ? void 0 : t11.size, "100%"), h_(d2 && d2 < 0 ? void 0 : t11.innerSize || 0, "0%")];
  for (!e10.angular || this instanceof an || (g2[3] = 0), c2 = 0; c2 < 4; ++c2) p2 = g2[c2], h10 = c2 < 2 || 2 === c2 && /%$/.test(p2), g2[c2] = hK(p2, [s10, o10, a10, g2[2]][c2]) + (h10 ? i10 : 0);
  return g2[3] > g2[2] && (g2[3] = g2[2]), hq(n10) && 2 * n10 < g2[2] && n10 > 0 && (g2[3] = g2[2] - 2 * n10), hZ(this, "afterGetCenter", {
    positions: g2
  }), g2;
}, g.getStartAndEndRadians = function(t11, e10) {
  let i10 = hq(t11) ? t11 : 0, s10 = hq(e10) && e10 > i10 && e10 - i10 < 360 ? e10 : i10 + 360;
  return {
    start: hV * (i10 + -90),
    end: hV * (s10 + -90)
  };
};
var hJ = O;
var {
  setAnimation: hQ
} = t3;
var {
  addEvent: h0,
  defined: h1,
  extend: h2,
  isNumber: h3,
  pick: h5,
  relativeLength: h6
} = ta;
var h9 = class extends o7 {
  getConnectorPath(t11) {
    let e10 = t11.dataLabelPosition, i10 = t11.options || {}, s10 = i10.connectorShape, o10 = this.connectorShapes[s10] || s10;
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
  haloPath(t11) {
    let e10 = this.shapeArgs;
    return this.sliced || !this.visible ? [] : this.series.chart.renderer.symbols.arc(e10.x, e10.y, e10.r + t11, e10.r + t11, {
      innerR: e10.r - 1,
      start: e10.start,
      end: e10.end,
      borderRadius: e10.borderRadius
    });
  }
  constructor(t11, e10, i10) {
    super(t11, e10, i10), this.half = 0, this.name ?? (this.name = t11.chart.options.lang.pieSliceName);
    let s10 = (t12) => {
      this.slice("select" === t12.type);
    };
    h0(this, "select", s10), h0(this, "unselect", s10);
  }
  isValid() {
    return h3(this.y) && this.y >= 0;
  }
  setVisible(t11, e10 = true) {
    t11 !== this.visible && this.update({
      visible: t11 ?? !this.visible
    }, e10, void 0, false);
  }
  slice(t11, e10, i10) {
    let s10 = this.series;
    hQ(i10, s10.chart), e10 = h5(e10, true), this.sliced = this.options.sliced = t11 = h1(t11) ? t11 : !this.sliced, s10.options.data[s10.data.indexOf(this)] = this.options, this.graphic && this.graphic.animate(this.getTranslate());
  }
};
h2(h9.prototype, {
  connectorShapes: {
    fixedOffset: function(t11, e10, i10) {
      let s10 = e10.breakAt, o10 = e10.touchingSliceAt, r10 = i10.softConnector ? ["C", t11.x + ("left" === t11.alignment ? -5 : 5), t11.y, 2 * s10.x - o10.x, 2 * s10.y - o10.y, s10.x, s10.y] : ["L", s10.x, s10.y];
      return [["M", t11.x, t11.y], r10, ["L", o10.x, o10.y]];
    },
    straight: function(t11, e10) {
      let i10 = e10.touchingSliceAt;
      return [["M", t11.x, t11.y], ["L", i10.x, i10.y]];
    },
    crookedLine: function(t11, e10, i10) {
      let {
        angle: s10 = this.angle || 0,
        breakAt: o10,
        touchingSliceAt: r10
      } = e10, {
        series: a10
      } = this, [n10, h10, l2] = a10.center, d2 = l2 / 2, {
        plotLeft: c2,
        plotWidth: p2
      } = a10.chart, g2 = "left" === t11.alignment, {
        x: u2,
        y: f2
      } = t11, m2 = o10.x;
      if (i10.crookDistance) {
        let t12 = h6(i10.crookDistance, 1);
        m2 = g2 ? n10 + d2 + (p2 + c2 - n10 - d2) * (1 - t12) : c2 + (n10 - d2) * t12;
      } else m2 = n10 + (h10 - f2) * Math.tan(s10 - Math.PI / 2);
      let x2 = [["M", u2, f2]];
      return (g2 ? m2 <= u2 && m2 >= o10.x : m2 >= u2 && m2 <= o10.x) && x2.push(["L", m2, f2]), x2.push(["L", o10.x, o10.y], ["L", r10.x, r10.y]), x2;
    }
  }
});
var {
  getStartAndEndRadians: h4
} = hJ;
var {
  noop: h8
} = N;
var {
  clamp: h7,
  extend: lt,
  fireEvent: le,
  merge: li,
  pick: ls
} = ta;
var lo = class extends an {
  animate(t11) {
    let e10 = this, i10 = e10.points, s10 = e10.startAngleRad;
    t11 || i10.forEach(function(t12) {
      let i11 = t12.graphic, o10 = t12.shapeArgs;
      i11 && o10 && (i11.attr({
        r: ls(t12.startR, e10.center && e10.center[3] / 2),
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
    let t11, e10, i10 = this.startAngleRad, s10 = this.endAngleRad, o10 = this.options;
    0 === this.total && this.center ? (t11 = this.center[0], e10 = this.center[1], this.graph || (this.graph = this.chart.renderer.arc(t11, e10, this.center[1] / 2, 0, i10, s10).addClass("highcharts-empty-series").add(this.group)), this.graph.attr({
      d: im.arc(t11, e10, this.center[2] / 2, 0, {
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
    let t11 = this.chart.renderer;
    this.points.forEach(function(e10) {
      e10.graphic && e10.hasNewShapeType() && (e10.graphic = e10.graphic.destroy()), e10.graphic || (e10.graphic = t11[e10.shapeType](e10.shapeArgs).add(e10.series.group), e10.delayedRendering = true);
    });
  }
  generatePoints() {
    super.generatePoints(), this.updateTotals();
  }
  getX(t11, e10, i10, s10) {
    let o10 = this.center, r10 = this.radii ? this.radii[i10.index] || 0 : o10[2] / 2, a10 = s10.dataLabelPosition, n10 = a10?.distance || 0, h10 = Math.asin(h7((t11 - o10[1]) / (r10 + n10), -1, 1));
    return o10[0] + Math.cos(h10) * (r10 + n10) * (e10 ? -1 : 1) + (n10 > 0 ? (e10 ? -1 : 1) * (s10.padding || 0) : 0);
  }
  hasData() {
    return this.points.some((t11) => t11.visible);
  }
  redrawPoints() {
    let t11, e10, i10, s10, o10 = this, r10 = o10.chart;
    this.drawEmpty(), o10.group && !r10.styledMode && o10.group.shadow(o10.options.shadow), o10.points.forEach(function(a10) {
      let n10 = {};
      e10 = a10.graphic, !a10.isNull && e10 ? (s10 = a10.shapeArgs, t11 = a10.getTranslate(), r10.styledMode || (i10 = o10.pointAttribs(a10, a10.selected && "select")), a10.delayedRendering ? (e10.setRadialReference(o10.center).attr(s10).attr(t11), r10.styledMode || e10.attr(i10).attr({
        "stroke-linejoin": "round"
      }), a10.delayedRendering = false) : (e10.setRadialReference(o10.center), r10.styledMode || li(true, n10, i10), li(true, n10, s10, t11), e10.animate(n10)), e10.attr({
        visibility: a10.visible ? "inherit" : "hidden"
      }), e10.addClass(a10.getClassName(), true)) : e10 && (a10.graphic = e10.destroy());
    });
  }
  sortByAngle(t11, e10) {
    t11.sort(function(t12, i10) {
      return void 0 !== t12.angle && (i10.angle - t12.angle) * e10;
    });
  }
  translate(t11) {
    le(this, "translate"), this.generatePoints();
    let e10 = this.options, i10 = e10.slicedOffset, s10 = h4(e10.startAngle, e10.endAngle), o10 = this.startAngleRad = s10.start, r10 = (this.endAngleRad = s10.end) - o10, a10 = this.points, n10 = e10.ignoreHiddenPoint, h10 = a10.length, l2, d2, c2, p2, g2, u2, f2, m2 = 0;
    for (t11 || (this.center = t11 = this.getCenter()), u2 = 0; u2 < h10; u2++) {
      f2 = a10[u2], l2 = o10 + m2 * r10, f2.isValid() && (!n10 || f2.visible) && (m2 += f2.percentage / 100), d2 = o10 + m2 * r10;
      let e11 = {
        x: t11[0],
        y: t11[1],
        r: t11[2] / 2,
        innerR: t11[3] / 2,
        start: Math.round(1e3 * l2) / 1e3,
        end: Math.round(1e3 * d2) / 1e3
      };
      f2.shapeType = "arc", f2.shapeArgs = e11, (c2 = (d2 + l2) / 2) > 1.5 * Math.PI ? c2 -= 2 * Math.PI : c2 < -Math.PI / 2 && (c2 += 2 * Math.PI), f2.slicedTranslation = {
        translateX: Math.round(Math.cos(c2) * i10),
        translateY: Math.round(Math.sin(c2) * i10)
      }, p2 = Math.cos(c2) * t11[2] / 2, g2 = Math.sin(c2) * t11[2] / 2, f2.tooltipPos = [t11[0] + 0.7 * p2, t11[1] + 0.7 * g2], f2.half = +(c2 < -Math.PI / 2 || c2 > Math.PI / 2), f2.angle = c2;
    }
    le(this, "afterTranslate");
  }
  updateTotals() {
    let t11 = this.points, e10 = t11.length, i10 = this.options.ignoreHiddenPoint, s10, o10, r10 = 0;
    for (s10 = 0; s10 < e10; s10++) (o10 = t11[s10]).isValid() && (!i10 || o10.visible) && (r10 += o10.y);
    for (s10 = 0, this.total = r10; s10 < e10; s10++) (o10 = t11[s10]).percentage = r10 > 0 && (o10.visible || !i10) ? o10.y / r10 * 100 : 0, o10.total = r10;
  }
};
lo.defaultOptions = li(an.defaultOptions, {
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
}), lt(lo.prototype, {
  axisTypes: [],
  directTouch: true,
  drawGraph: void 0,
  drawTracker: hx.prototype.drawTracker,
  getCenter: hJ.getCenter,
  getSymbol: h8,
  invertible: false,
  isCartesian: false,
  noSharedTooltip: true,
  pointAttribs: hx.prototype.pointAttribs,
  pointClass: h9,
  requireSorting: false,
  searchPoint: h8,
  trackerGroups: ["group", "dataLabelsGroup"]
}), rR.registerSeriesType("pie", lo);
var {
  composed: lr,
  noop: la
} = N;
var {
  distribute: ln
} = eL;
var {
  series: lh
} = rR;
var {
  arrayMax: ll,
  clamp: ld,
  defined: lc,
  isNumber: lp,
  pick: lg,
  pushUnique: lu,
  relativeLength: lf
} = ta;
!function(t11) {
  let e10 = {
    radialDistributionY: function(t12, e11) {
      return (e11.dataLabelPosition?.top || 0) + t12.distributeBox.pos;
    },
    radialDistributionX: function(t12, e11, i11, s11, o11) {
      let r11 = o11.dataLabelPosition;
      return t12.getX(i11 < (r11?.top || 0) + 2 || i11 > (r11?.bottom || 0) - 2 ? s11 : i11, e11.half, e11, o11);
    },
    justify: function(t12, e11, i11, s11) {
      return s11[0] + (t12.half ? -1 : 1) * (i11 + (e11.dataLabelPosition?.distance || 0));
    },
    alignToPlotEdges: function(t12, e11, i11, s11) {
      let o11 = t12.getBBox().width;
      return e11 ? o11 + s11 : i11 - o11 - s11;
    },
    alignToConnectors: function(t12, e11, i11, s11) {
      let o11 = 0, r11;
      return t12.forEach(function(t13) {
        (r11 = t13.dataLabel.getBBox().width) > o11 && (o11 = r11);
      }), e11 ? o11 + s11 : i11 - o11 - s11;
    }
  };
  function i10(t12, e11) {
    let i11 = Math.PI / 2, {
      start: s11 = 0,
      end: o11 = 0
    } = t12.shapeArgs || {}, r11 = t12.angle || 0;
    e11 > 0 && s11 < i11 && o11 > i11 && r11 > i11 / 2 && r11 < 1.5 * i11 && (r11 = r11 <= i11 ? Math.max(i11 / 2, (s11 + i11) / 2) : Math.min(1.5 * i11, (i11 + o11) / 2));
    let {
      center: a10,
      options: n10
    } = this, h10 = a10[2] / 2, l2 = Math.cos(r11), d2 = Math.sin(r11), c2 = a10[0] + l2 * h10, p2 = a10[1] + d2 * h10, g2 = Math.min((n10.slicedOffset || 0) + (n10.borderWidth || 0), e11 / 5);
    return {
      natural: {
        x: c2 + l2 * e11,
        y: p2 + d2 * e11
      },
      computed: {},
      alignment: e11 < 0 ? "center" : t12.half ? "right" : "left",
      connectorPosition: {
        angle: r11,
        breakAt: {
          x: c2 + l2 * g2,
          y: p2 + d2 * g2
        },
        touchingSliceAt: {
          x: c2,
          y: p2
        }
      },
      distance: e11
    };
  }
  function s10() {
    let t12 = this, e11 = t12.points, i11 = t12.chart, s11 = i11.plotWidth, o11 = i11.plotHeight, r11 = i11.plotLeft, a10 = Math.round(i11.chartWidth / 3), n10 = t12.center, h10 = n10[2] / 2, l2 = n10[1], d2 = [[], []], c2 = [0, 0, 0, 0], p2 = t12.dataLabelPositioners, g2, u2, f2, m2 = 0;
    t12.visible && t12.hasDataLabels?.() && (e11.forEach((t13) => {
      (t13.dataLabels || []).forEach((t14) => {
        t14.shortened && (t14.attr({
          width: "auto"
        }).css({
          width: "auto",
          textOverflow: "clip"
        }), t14.shortened = false);
      });
    }), lh.prototype.drawDataLabels.apply(t12), e11.forEach((t13) => {
      (t13.dataLabels || []).forEach((e12, i12) => {
        let s12 = n10[2] / 2, o12 = e12.options, r12 = lf(o12?.distance || 0, s12);
        0 === i12 && d2[t13.half].push(t13), !lc(o12?.style?.width) && e12.getBBox().width > a10 && (e12.css({
          width: Math.round(0.7 * a10) + "px"
        }), e12.shortened = true), e12.dataLabelPosition = this.getDataLabelPosition(t13, r12), m2 = Math.max(m2, r12);
      });
    }), d2.forEach((e12, a11) => {
      let d3 = e12.length, g3 = [], x2, y2, b2 = 0, v2;
      d3 && (t12.sortByAngle(e12, a11 - 0.5), m2 > 0 && (x2 = Math.max(0, l2 - h10 - m2), y2 = Math.min(l2 + h10 + m2, i11.plotHeight), e12.forEach((t13) => {
        (t13.dataLabels || []).forEach((e13) => {
          let s12 = e13.dataLabelPosition;
          s12 && s12.distance > 0 && (s12.top = Math.max(0, l2 - h10 - s12.distance), s12.bottom = Math.min(l2 + h10 + s12.distance, i11.plotHeight), b2 = e13.getBBox().height || 21, e13.lineHeight = i11.renderer.fontMetrics(e13.text || e13).h + 2 * e13.padding, t13.distributeBox = {
            target: (e13.dataLabelPosition?.natural.y || 0) - s12.top + e13.lineHeight / 2,
            size: b2,
            rank: t13.y
          }, g3.push(t13.distributeBox));
        });
      }), ln(g3, v2 = y2 + b2 - x2, v2 / 5)), e12.forEach((i12) => {
        (i12.dataLabels || []).forEach((l3) => {
          let d4 = l3.options || {}, m3 = i12.distributeBox, x3 = l3.dataLabelPosition, y3 = x3?.natural.y || 0, b3 = d4.connectorPadding || 0, v3 = l3.lineHeight || 21, k2 = (v3 - l3.getBBox().height) / 2, M2 = 0, w2 = y3, S2 = "inherit";
          if (x3) {
            if (g3 && lc(m3) && x3.distance > 0 && (void 0 === m3.pos ? S2 = "hidden" : (f2 = m3.size, w2 = p2.radialDistributionY(i12, l3))), d4.justify) M2 = p2.justify(i12, l3, h10, n10);
            else switch (d4.alignTo) {
              case "connectors":
                M2 = p2.alignToConnectors(e12, a11, s11, r11);
                break;
              case "plotEdges":
                M2 = p2.alignToPlotEdges(l3, a11, s11, r11);
                break;
              default:
                M2 = p2.radialDistributionX(t12, i12, w2 - k2, y3, l3);
            }
            if (x3.attribs = {
              visibility: S2,
              align: x3.alignment
            }, x3.posAttribs = {
              x: M2 + (d4.x || 0) + ({
                left: b3,
                right: -b3
              }[x3.alignment] || 0),
              y: w2 + (d4.y || 0) - v3 / 2
            }, x3.computed.x = M2, x3.computed.y = w2 - k2, lg(d4.crop, true)) {
              let t13;
              M2 - (u2 = l3.getBBox().width) < b3 && 1 === a11 ? (t13 = Math.round(u2 - M2 + b3), c2[3] = Math.max(t13, c2[3])) : M2 + u2 > s11 - b3 && 0 === a11 && (t13 = Math.round(M2 + u2 - s11 + b3), c2[1] = Math.max(t13, c2[1])), w2 - f2 / 2 < 0 ? c2[0] = Math.max(Math.round(-w2 + f2 / 2), c2[0]) : w2 + f2 / 2 > o11 && (c2[2] = Math.max(Math.round(w2 + f2 / 2 - o11), c2[2])), x3.sideOverflow = t13;
            }
          }
        });
      }));
    }), (0 === ll(c2) || this.verifyDataLabelOverflow(c2)) && (this.placeDataLabels(), this.points.forEach((e12) => {
      e12.dataLabels?.forEach((s12, o12) => {
        let {
          connectorColor: r12,
          connectorWidth: a11 = 1
        } = s12.options || {}, n11 = s12.dataLabelPosition;
        if (lp(a11)) {
          let h11;
          g2 = s12.connector, n11 && n11.distance > 0 ? (h11 = !g2, g2 || (s12.connector = g2 = i11.renderer.path().addClass("highcharts-data-label-connector  highcharts-color-" + e12.colorIndex + (e12.className ? " " + e12.className : "")).add(t12.dataLabelsGroups?.[o12])), i11.styledMode || g2.attr({
            "stroke-width": a11,
            stroke: r12 || e12.color || "#666666"
          }), g2[h11 ? "attr" : "animate"]({
            d: e12.getConnectorPath(s12)
          }), g2.attr({
            visibility: n11.attribs?.visibility
          })) : g2 && (s12.connector = g2.destroy());
        }
      });
    })));
  }
  function o10() {
    this.points.forEach((t12) => {
      (t12.dataLabels || []).forEach((t13) => {
        let e11 = t13.dataLabelPosition;
        e11 ? (e11.sideOverflow && (t13.css({
          width: Math.max(t13.getBBox().width - e11.sideOverflow, 0) + "px",
          textOverflow: t13.options?.style?.textOverflow || "ellipsis"
        }), t13.shortened = true), t13.attr(e11.attribs), t13[t13.moved ? "animate" : "attr"](e11.posAttribs), t13.moved = true) : t13 && t13.attr({
          y: -9999
        });
      }), delete t12.distributeBox;
    }, this);
  }
  function r10(t12) {
    let e11 = this.center, i11 = this.options, s11 = i11.center, o11 = i11.minSize || 80, r11 = o11, a10 = null !== i11.size;
    return !a10 && (null !== s11[0] ? r11 = Math.max(e11[2] - Math.max(t12[1], t12[3]), o11) : (r11 = Math.max(e11[2] - t12[1] - t12[3], o11), e11[0] += (t12[3] - t12[1]) / 2), null !== s11[1] ? r11 = ld(r11, o11, e11[2] - Math.max(t12[0], t12[2])) : (r11 = ld(r11, o11, e11[2] - t12[0] - t12[2]), e11[1] += (t12[0] - t12[2]) / 2), r11 < e11[2] ? (e11[2] = r11, e11[3] = Math.min(i11.thickness ? Math.max(0, r11 - 2 * i11.thickness) : Math.max(0, lf(i11.innerSize || 0, r11)), r11), this.translate(e11), this.drawDataLabels && this.drawDataLabels()) : a10 = true), a10;
  }
  t11.compose = function(t12) {
    if (hE.compose(lh), lu(lr, "PieDataLabel")) {
      let a10 = t12.prototype;
      a10.dataLabelPositioners = e10, a10.alignDataLabel = la, a10.drawDataLabels = s10, a10.getDataLabelPosition = i10, a10.placeDataLabels = o10, a10.verifyDataLabelOverflow = r10;
    }
  };
}(E || (E = {}));
var lm = E;
(u = I || (I = {})).getCenterOfPoints = function(t11) {
  let e10 = t11.reduce((t12, e11) => (t12.x += e11.x, t12.y += e11.y, t12), {
    x: 0,
    y: 0
  });
  return {
    x: e10.x / t11.length,
    y: e10.y / t11.length
  };
}, u.getDistanceBetweenPoints = function(t11, e10) {
  return Math.sqrt(Math.pow(e10.x - t11.x, 2) + Math.pow(e10.y - t11.y, 2));
}, u.getAngleBetweenPoints = function(t11, e10) {
  return Math.atan2(e10.x - t11.x, e10.y - t11.y);
}, u.pointInPolygon = function({
  x: t11,
  y: e10
}, i10) {
  let s10 = i10.length, o10, r10, a10 = false;
  for (o10 = 0, r10 = s10 - 1; o10 < s10; r10 = o10++) {
    let [s11, n10] = i10[o10], [h10, l2] = i10[r10];
    n10 > e10 != l2 > e10 && t11 < (h10 - s11) * (e10 - n10) / (l2 - n10) + s11 && (a10 = !a10);
  }
  return a10;
};
var {
  pointInPolygon: lx
} = I;
var {
  addEvent: ly,
  getAlignFactor: lb,
  fireEvent: lv,
  objectEach: lk,
  pick: lM
} = ta;
function lw(t11, e10) {
  let i10, s10 = false;
  return t11 && (i10 = t11.newOpacity, t11.oldOpacity !== i10 && (t11.hasClass("highcharts-data-label") ? (t11[i10 ? "removeClass" : "addClass"]("highcharts-data-label-hidden"), s10 = true, t11[t11.isOld ? "animate" : "attr"]({
    opacity: i10
  }, void 0, function() {
    e10.styledMode || t11.css({
      pointerEvents: i10 ? "auto" : "none"
    });
  }), lv(e10, "afterHideOverlappingLabel")) : t11.attr({
    opacity: i10
  })), t11.isOld = true), s10;
}
var {
  defaultOptions: lS
} = tI;
var {
  noop: lT
} = N;
var {
  addEvent: lC,
  extend: lA,
  isObject: lP,
  merge: lL,
  relativeLength: lO
} = ta;
var lE = {
  radius: 0,
  scope: "stack",
  where: void 0
};
var lI = lT;
var lD = lT;
function lB(t11, e10, i10, s10, o10 = {}) {
  let r10 = lI(t11, e10, i10, s10, o10), {
    brStart: a10 = true,
    brEnd: n10 = true,
    innerR: h10 = 0,
    r: l2 = i10,
    start: d2 = 0,
    end: c2 = 0
  } = o10;
  if (o10.open || !o10.borderRadius) return r10;
  let p2 = c2 - d2, g2 = Math.sin(p2 / 2), u2 = Math.max(Math.min(lO(o10.borderRadius || 0, l2 - h10), (l2 - h10) / 2, l2 * g2 / (1 + g2)), 0), f2 = Math.min(u2, p2 / Math.PI * 2 * h10), m2 = r10.length - 1;
  for (; m2--; ) (a10 || 0 !== m2 && 3 !== m2) && (n10 || 1 !== m2 && 2 !== m2) && !function(t12, e11, i11) {
    let s11, o11, r11, a11 = t12[e11], n11 = t12[e11 + 1];
    if ("Z" === n11[0] && (n11 = t12[0]), ("M" === a11[0] || "L" === a11[0]) && "A" === n11[0] ? (s11 = a11, o11 = n11, r11 = true) : "A" === a11[0] && ("M" === n11[0] || "L" === n11[0]) && (s11 = n11, o11 = a11), s11 && o11 && o11.params) {
      let a12 = o11[1], n12 = o11[5], h11 = o11.params, {
        start: l3,
        end: d3,
        cx: c3,
        cy: p3
      } = h11, g3 = n12 ? a12 - i11 : a12 + i11, u3 = g3 ? Math.asin(i11 / g3) : 0, f3 = n12 ? u3 : -u3, m3 = Math.cos(u3) * g3;
      r11 ? (h11.start = l3 + f3, s11[1] = c3 + m3 * Math.cos(l3), s11[2] = p3 + m3 * Math.sin(l3), t12.splice(e11 + 1, 0, ["A", i11, i11, 0, 0, 1, c3 + a12 * Math.cos(h11.start), p3 + a12 * Math.sin(h11.start)])) : (h11.end = d3 - f3, o11[6] = c3 + a12 * Math.cos(h11.end), o11[7] = p3 + a12 * Math.sin(h11.end), t12.splice(e11 + 1, 0, ["A", i11, i11, 0, 0, 1, c3 + m3 * Math.cos(d3), p3 + m3 * Math.sin(d3)])), o11[4] = Math.abs(h11.end - h11.start) < Math.PI ? 0 : 1;
    }
  }(r10, m2, m2 > 1 ? f2 : u2);
  return r10;
}
function lN() {
  if (this.options.borderRadius && !(this.chart.is3d && this.chart.is3d())) {
    let {
      options: t11,
      yAxis: e10
    } = this, i10 = "percent" === t11.stacking, s10 = lS.plotOptions?.[this.type]?.borderRadius, o10 = lz(t11.borderRadius, lP(s10) ? s10 : {}), r10 = e10.options.reversed;
    for (let s11 of this.points) {
      let {
        shapeArgs: a10
      } = s11;
      if ("roundedRect" === s11.shapeType && a10) {
        let {
          width: n10 = 0,
          height: h10 = 0,
          y: l2 = 0
        } = a10, d2 = l2, c2 = h10;
        if ("stack" === o10.scope && s11.stackTotal) {
          let o11 = e10.translate(i10 ? 100 : s11.stackTotal, false, true, false, true), r11 = e10.translate(t11.threshold || 0, false, true, false, true), a11 = this.crispCol(0, Math.min(o11, r11), 0, Math.abs(o11 - r11));
          d2 = a11.y, c2 = a11.height;
        }
        let p2 = (s11.negative ? -1 : 1) * (r10 ? -1 : 1) == -1, g2 = o10.where;
        !g2 && this.is("waterfall") && Math.abs((s11.yBottom || 0) - (this.translatedThreshold || 0)) > this.borderWidth && (g2 = "all"), g2 || (g2 = "end");
        let u2 = Math.min(lO(o10.radius, n10), n10 / 2, "all" === g2 ? h10 / 2 : 1 / 0) || 0;
        "end" === g2 && (p2 && (d2 -= u2), c2 += u2), lA(a10, {
          brBoxHeight: c2,
          brBoxY: d2,
          r: u2
        });
      }
    }
  }
}
function lz(t11, e10) {
  return lP(t11) || (t11 = {
    radius: t11 || 0
  }), lL(lE, e10, t11);
}
function lR() {
  let t11 = lz(this.options.borderRadius);
  for (let e10 of this.points) {
    let i10 = e10.shapeArgs;
    i10 && (i10.borderRadius = lO(t11.radius, (i10.r || 0) - (i10.innerR || 0)));
  }
}
function lW(t11, e10, i10, s10, o10 = {}) {
  let r10 = lD(t11, e10, i10, s10, o10), {
    r: a10 = 0,
    brBoxHeight: n10 = s10,
    brBoxY: h10 = e10
  } = o10, l2 = e10 - h10, d2 = h10 + n10 - (e10 + s10), c2 = l2 - a10 > -0.1 ? 0 : a10, p2 = d2 - a10 > -0.1 ? 0 : a10, g2 = Math.max(c2 && l2, 0), u2 = Math.max(p2 && d2, 0), f2 = [t11 + c2, e10], m2 = [t11 + i10 - c2, e10], x2 = [t11 + i10, e10 + c2], y2 = [t11 + i10, e10 + s10 - p2], b2 = [t11 + i10 - p2, e10 + s10], v2 = [t11 + p2, e10 + s10], k2 = [t11, e10 + s10 - p2], M2 = [t11, e10 + c2], w2 = (t12, e11) => Math.sqrt(Math.pow(t12, 2) - Math.pow(e11, 2));
  if (g2) {
    let t12 = w2(c2, c2 - g2);
    f2[0] -= t12, m2[0] += t12, x2[1] = M2[1] = e10 + c2 - g2;
  }
  if (s10 < c2 - g2) {
    let o11 = w2(c2, c2 - g2 - s10);
    x2[0] = y2[0] = t11 + i10 - c2 + o11, b2[0] = Math.min(x2[0], b2[0]), v2[0] = Math.max(y2[0], v2[0]), k2[0] = M2[0] = t11 + c2 - o11, x2[1] = M2[1] = e10 + s10;
  }
  if (u2) {
    let t12 = w2(p2, p2 - u2);
    b2[0] += t12, v2[0] -= t12, y2[1] = k2[1] = e10 + s10 - p2 + u2;
  }
  if (s10 < p2 - u2) {
    let o11 = w2(p2, p2 - u2 - s10);
    x2[0] = y2[0] = t11 + i10 - p2 + o11, m2[0] = Math.min(x2[0], m2[0]), f2[0] = Math.max(y2[0], f2[0]), k2[0] = M2[0] = t11 + p2 - o11, y2[1] = k2[1] = e10;
  }
  return r10.length = 0, r10.push(["M", ...f2], ["L", ...m2], ["A", c2, c2, 0, 0, 1, ...x2], ["L", ...y2], ["A", p2, p2, 0, 0, 1, ...b2], ["L", ...v2], ["A", p2, p2, 0, 0, 1, ...k2], ["L", ...M2], ["A", c2, c2, 0, 0, 1, ...f2], ["Z"]), r10;
}
var {
  diffObjects: lX,
  extend: lF,
  find: lG,
  merge: lH,
  pick: lY,
  uniqueKey: lj
} = ta;
function lU(t11, e10) {
  let i10 = t11.condition;
  (i10.callback || function() {
    return this.chartWidth <= lY(i10.maxWidth, Number.MAX_VALUE) && this.chartHeight <= lY(i10.maxHeight, Number.MAX_VALUE) && this.chartWidth >= lY(i10.minWidth, 0) && this.chartHeight >= lY(i10.minHeight, 0);
  }).call(this) && e10.push(t11._id);
}
function l$(t11, e10) {
  let i10 = this.options.responsive, s10 = this.currentResponsive, o10 = [], r10;
  !e10 && i10 && i10.rules && i10.rules.forEach((t12) => {
    void 0 === t12._id && (t12._id = lj()), this.matchResponsiveRule(t12, o10);
  }, this);
  let a10 = lH(...o10.map((t12) => lG(i10?.rules || [], (e11) => e11._id === t12)).map((t12) => t12?.chartOptions));
  a10.isResponsiveOptions = true, o10 = o10.toString() || void 0;
  let n10 = s10?.ruleIds;
  o10 !== n10 && (s10 && (this.currentResponsive = void 0, this.updatingResponsive = true, this.update(s10.undoOptions, t11, true), this.updatingResponsive = false), o10 ? ((r10 = lX(a10, this.options, true, this.collectionsWithUpdate)).isResponsiveOptions = true, this.currentResponsive = {
    ruleIds: o10,
    mergedOptions: a10,
    undoOptions: r10
  }, this.updatingResponsive || this.update(a10, t11, true)) : this.currentResponsive = void 0);
}
(D || (D = {})).compose = function(t11) {
  let e10 = t11.prototype;
  return e10.matchResponsiveRule || lF(e10, {
    matchResponsiveRule: lU,
    setResponsive: l$
  }), t11;
};
var lV = D;
N.AST = en, N.Axis = s3, N.Chart = na, N.Color = tG, N.DataLabel = hE, N.DataTableCore = rS, N.Fx = t$, N.HTMLElement = sa, N.Legend = aO, N.LegendSymbol = rO, N.PlotLineOrBand = ox, N.Point = o7, N.Pointer = ry, N.RendererRegistry = eS, N.Series = an, N.SeriesRegistry = rR, N.StackItem = nC, N.SVGElement = e7, N.SVGRenderer = i2, N.Templating = ew, N.Tick = sC, N.Time = tC, N.Tooltip = oY, N.animate = t3.animate, N.animObject = t3.animObject, N.chart = na.chart, N.color = tG.parse, N.dateFormat = ew.dateFormat, N.defaultOptions = tI.defaultOptions, N.distribute = eL.distribute, N.format = ew.format, N.getDeferredAnimation = t3.getDeferredAnimation, N.getOptions = tI.getOptions, N.numberFormat = ew.numberFormat, N.seriesType = rR.seriesType, N.setAnimation = t3.setAnimation, N.setOptions = tI.setOptions, N.stop = t3.stop, N.time = tI.defaultTime, N.timers = t$.timers, {
  compose: function(t11, e10, i10) {
    let s10 = t11.types.pie;
    if (!e10.symbolCustomAttribs.includes("borderRadius")) {
      let o10 = i10.prototype.symbols;
      lC(t11, "afterColumnTranslate", lN, {
        order: 9
      }), lC(s10, "afterTranslate", lR), e10.symbolCustomAttribs.push("borderRadius", "brBoxHeight", "brBoxY", "brEnd", "brStart"), lI = o10.arc, lD = o10.roundedRect, o10.arc = lB, o10.roundedRect = lW;
    }
  },
  optionsToObject: lz
}.compose(N.Series, N.SVGElement, N.SVGRenderer), hR.compose(N.Series.types.column), hE.compose(N.Series), s8.compose(N.Axis), sa.compose(N.SVGRenderer), aO.compose(N.Chart), oi.compose(N.Axis), (r = (f = N.Chart).prototype).hideOverlappingLabels || (r.hideOverlappingLabels = function(t11) {
  let e10 = t11.length, i10 = (t12, e11) => !(e11.x >= t12.x + t12.width || e11.x + e11.width <= t12.x || e11.y >= t12.y + t12.height || e11.y + e11.height <= t12.y), s10 = (t12, e11) => {
    for (let i11 of t12) if (lx({
      x: i11[0],
      y: i11[1]
    }, e11)) return true;
    return false;
  }, o10, r10, a10, n10, h10, l2 = false;
  for (let i11 = 0; i11 < e10; i11++) (o10 = t11[i11]) && (o10.oldOpacity = o10.opacity, o10.newOpacity = 1, o10.absoluteBox = function(t12) {
    if (t12 && (!t12.alignAttr || t12.placed)) {
      let e11 = t12.box ? 0 : t12.padding || 0, i12 = t12.alignAttr || {
        x: t12.attr("x"),
        y: t12.attr("y")
      }, {
        height: s11,
        polygon: o11,
        width: r11
      } = t12.getBBox(), a11 = lb(t12.alignValue) * r11;
      return t12.width = r11, t12.height = s11, {
        x: i12.x + (t12.parentGroup?.translateX || 0) + e11 - a11,
        y: i12.y + (t12.parentGroup?.translateY || 0) + e11,
        width: r11 - 2 * e11,
        height: s11 - 2 * e11,
        polygon: o11
      };
    }
  }(o10));
  t11.sort((t12, e11) => (e11?.labelrank || 0) - (t12?.labelrank || 0));
  for (let o11 = 0; o11 < e10; ++o11) {
    n10 = (r10 = t11[o11]) && r10.absoluteBox;
    let l3 = n10?.polygon;
    for (let d2 = o11 + 1; d2 < e10; ++d2) {
      h10 = (a10 = t11[d2]) && a10.absoluteBox;
      let e11 = false;
      if (n10 && h10 && r10 !== a10 && r10?.newOpacity !== 0 && a10?.newOpacity !== 0 && r10?.visibility !== "hidden" && a10?.visibility !== "hidden") {
        let t12 = h10.polygon;
        if (l3 && t12 && l3 !== t12 ? s10(l3, t12) && (e11 = true) : i10(n10, h10) && (e11 = true), e11) {
          let t13 = r10?.labelrank < a10?.labelrank ? r10 : a10, e12 = t13?.text;
          t13 && (t13.newOpacity = 0), e12?.element.querySelector("textPath") && e12.hide();
        }
      }
    }
  }
  for (let e11 of t11) e11 && lw(e11, this) && (l2 = true);
  l2 && lv(this, "afterHideAllOverlappingLabels");
}, ly(f, "render", function() {
  let t11 = this, e10 = [];
  for (let i10 of t11.labelCollectors || []) e10 = e10.concat(i10());
  for (let i10 of t11.yAxis || []) i10.stacking && i10.options.stackLabels && !i10.options.stackLabels.allowOverlap && lk(i10.stacking.stacks, (t12) => {
    lk(t12, (t13) => {
      t13.label && e10.push(t13.label);
    });
  });
  for (let i10 of t11.series || []) if (i10.visible && i10.hasDataLabels?.()) {
    let s10 = (i11) => {
      for (let s11 of i11) s11.visible && (s11.dataLabels || []).forEach((i12) => {
        let o10 = i12.options || {};
        i12.labelrank = lM(o10.labelrank, s11.labelrank, s11.shapeArgs?.height), o10.allowOverlap ?? Number(o10.distance) > 0 ? (i12.oldOpacity = i12.opacity, i12.newOpacity = 1, lw(i12, t11)) : e10.push(i12);
      });
    };
    s10(i10.nodes || []), s10(i10.points);
  }
  this.hideOverlappingLabels(e10);
})), lm.compose(N.Series.types.pie), ox.compose(N.Chart, N.Axis), ry.compose(N.Chart), lV.compose(N.Chart), ny.compose(N.Axis, N.Chart, N.Series), n$.compose(N.Axis, N.Chart, N.Series), oY.compose(N.Pointer), ta.extend(N, ta);
var lZ = N;
export {
  lZ as default
};
//# sourceMappingURL=highcharts-E7XJOJOJ.js.map
