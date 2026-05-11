import {
  __commonJS
} from "./chunk-WOR4A3D2.js";

// node_modules/highcharts/modules/export-data.js
var require_export_data = __commonJS({
  "node_modules/highcharts/modules/export-data.js"(exports, module) {
    !/**
    * Highcharts JS v12.5.0 (2026-01-12)
    * @module highcharts/modules/export-data
    * @requires highcharts
    * @requires highcharts/modules/exporting
    *
    * Export data module
    *
    * (c) 2010-2026 Highsoft AS
    * Author: Torstein Honsi
    *
    * A commercial license may be required depending on use.
    * See www.highcharts.com/license
    */
    function(t, e) {
      "object" == typeof exports && "object" == typeof module ? module.exports = e(t._Highcharts, t._Highcharts.AST, t._Highcharts.Chart) : "function" == typeof define && define.amd ? define("highcharts/modules/export-data", ["highcharts/highcharts"], function(t2) {
        return e(t2, t2.AST, t2.Chart);
      }) : "object" == typeof exports ? exports["highcharts/modules/export-data"] = e(t._Highcharts, t._Highcharts.AST, t._Highcharts.Chart) : t.Highcharts = e(t.Highcharts, t.Highcharts.AST, t.Highcharts.Chart);
    }("u" < typeof window ? exports : window, (t, e, a) => (() => {
      "use strict";
      var o, n = {
        660: (t2) => {
          t2.exports = e;
        },
        944: (e2) => {
          e2.exports = t;
        },
        960: (t2) => {
          t2.exports = a;
        }
      }, i = {};
      function r(t2) {
        var e2 = i[t2];
        if (void 0 !== e2) return e2.exports;
        var a2 = i[t2] = {
          exports: {}
        };
        return n[t2](a2, a2.exports, r), a2.exports;
      }
      r.n = (t2) => {
        var e2 = t2 && t2.__esModule ? () => t2.default : () => t2;
        return r.d(e2, {
          a: e2
        }), e2;
      }, r.d = (t2, e2) => {
        for (var a2 in e2) r.o(e2, a2) && !r.o(t2, a2) && Object.defineProperty(t2, a2, {
          enumerable: true,
          get: e2[a2]
        });
      }, r.o = (t2, e2) => Object.prototype.hasOwnProperty.call(t2, e2);
      var l = {};
      r.d(l, {
        default: () => M
      });
      var s = r(944), h = r.n(s);
      let {
        isSafari: c,
        win: d,
        win: {
          document: p
        }
      } = h(), {
        error: u
      } = h(), g = d.URL || d.webkitURL || d;
      function f(t2) {
        let e2 = t2.replace(/filename=.*;/, "").match(/data:([^;]*)(;base64)?,([A-Z+\d\/]+)/i);
        if (e2 && e2.length > 3 && d.atob && d.ArrayBuffer && d.Uint8Array && d.Blob && g.createObjectURL) {
          let t3 = d.atob(e2[3]), a2 = new d.ArrayBuffer(t3.length), o2 = new d.Uint8Array(a2);
          for (let e3 = 0; e3 < o2.length; ++e3) o2[e3] = t3.charCodeAt(e3);
          return g.createObjectURL(new d.Blob([o2], {
            type: e2[1]
          }));
        }
      }
      function m(t2, e2) {
        let a2 = d.navigator, o2 = p.createElement("a");
        if ("string" != typeof t2 && !(t2 instanceof String) && a2.msSaveOrOpenBlob) return void a2.msSaveOrOpenBlob(t2, e2);
        if (t2 = "" + t2, a2.userAgent.length > 1e3) throw Error("Input too long");
        let n2 = /Edge\/\d+/.test(a2.userAgent);
        if ((c && "string" == typeof t2 && 0 === t2.indexOf("data:application/pdf") || n2 || t2.length > 2e6) && !(t2 = f(t2) || "")) throw Error("Failed to convert to blob");
        if (void 0 !== o2.download) o2.href = t2, o2.download = e2, p.body.appendChild(o2), o2.click(), p.body.removeChild(o2);
        else try {
          if (!d.open(t2, "chart")) throw Error("Failed to open window");
        } catch {
          d.location.href = t2;
        }
      }
      function x(t2, e2) {
        let a2 = d.navigator, o2 = d.URL || d.webkitURL || d;
        try {
          if (a2.msSaveOrOpenBlob && d.MSBlobBuilder) {
            let e3 = new d.MSBlobBuilder();
            return e3.append(t2), e3.getBlob("image/svg+xml");
          }
          return o2.createObjectURL(new d.Blob(["\uFEFF" + t2], {
            type: e2
          }));
        } catch (t3) {
        }
      }
      var b = r(660), y = r.n(b), w = r(960), T = r.n(w);
      let D = {
        exporting: {
          csv: {
            annotations: {
              itemDelimiter: "; ",
              join: false
            },
            columnHeaderFormatter: null,
            dateFormat: "%Y-%m-%d %H:%M:%S",
            decimalPoint: null,
            itemDelimiter: null,
            lineDelimiter: "\n"
          },
          menuItemDefinitions: {
            downloadCSV: {
              textKey: "downloadCSV",
              onclick: function() {
                this.exporting?.downloadCSV();
              }
            },
            downloadXLS: {
              textKey: "downloadXLS",
              onclick: function() {
                this.exporting?.downloadXLS();
              }
            },
            viewData: {
              textKey: "viewData",
              onclick: function() {
                this.exporting?.wrapLoading(this.exporting.toggleDataTable);
              }
            }
          },
          showExportInProgress: true,
          showTable: false,
          useMultiLevelHeaders: true,
          useRowspanHeaders: true
        },
        lang: {
          downloadCSV: "Download CSV",
          downloadXLS: "Download XLS",
          exportData: {
            annotationHeader: "Annotations",
            categoryHeader: "Category",
            categoryDatetimeHeader: "DateTime"
          },
          viewData: "View data table",
          hideData: "Hide data table",
          exportInProgress: "Exporting..."
        }
      }, {
        getOptions: v,
        setOptions: S
      } = h(), {
        composed: L,
        doc: C,
        win: E
      } = h(), {
        addEvent: A,
        defined: H,
        extend: V,
        find: k,
        fireEvent: O,
        isNumber: N,
        pick: R,
        pushUnique: F
      } = h();
      !function(t2) {
        function e2() {
          this.wrapLoading(() => {
            let t3 = this.getCSV(true);
            m(x(t3, "text/csv") || "data:text/csv,\uFEFF" + encodeURIComponent(t3), this.getFilename() + ".csv");
          });
        }
        function a2() {
          this.wrapLoading(() => {
            let t3 = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Ark1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>td{border:none;font-family: Calibri, sans-serif;} .number{mso-number-format:"0.00";} .text{ mso-number-format:"@";}</style><meta name=ProgId content=Excel.Sheet><meta charset=UTF-8></head><body>' + this.getTable(true) + "</body></html>";
            m(x(t3, "application/vnd.ms-excel") || "data:application/vnd.ms-excel;base64," + E.btoa(unescape(encodeURIComponent(t3))), this.getFilename() + ".xls");
          });
        }
        function o2(t3) {
          let e3 = "", a3 = this.getDataRows(), o3 = this.options?.csv, n3 = R(o3?.decimalPoint, o3?.itemDelimiter !== "," && t3 ? 1.1.toLocaleString()[1] : "."), i3 = R(o3?.itemDelimiter, "," === n3 ? ";" : ","), r3 = o3?.lineDelimiter;
          return a3.forEach((t4, o4) => {
            let l3 = "", s3 = t4.length;
            for (; s3--; ) "string" == typeof (l3 = t4[s3]) && (l3 = `"${l3}"`), "number" == typeof l3 && "." !== n3 && (l3 = l3.toString().replace(".", n3)), t4[s3] = l3;
            t4.length = a3.length ? a3[0].length : 0, e3 += t4.join(i3), o4 < a3.length - 1 && (e3 += r3);
          }), e3;
        }
        function n2(t3) {
          let e3, a3, o3 = this.chart, n3 = o3.hasParallelCoordinates, i3 = o3.time, r3 = this.options?.csv || {}, l3 = o3.xAxis, s3 = {}, h3 = [], c3 = [], d3 = [], p3 = o3.options.lang.exportData, u3 = p3?.categoryHeader, g2 = p3?.categoryDatetimeHeader, f2 = function(e4, a4, o4) {
            if (r3.columnHeaderFormatter) {
              let t4 = r3.columnHeaderFormatter(e4, a4, o4);
              if (false !== t4) return t4;
            }
            return !e4 && u3 ? u3 : !e4.bindAxes && g2 && u3 ? e4.options.title && e4.options.title.text || (e4.dateTime ? g2 : u3) : t3 ? {
              columnTitle: ((o4 || 0) > 1 ? a4 : e4.name) || "",
              topLevelColumnTitle: e4.name
            } : e4.name + ((o4 || 0) > 1 ? " (" + a4 + ")" : "");
          }, m2 = function(t4, e4, a4) {
            let o4 = {}, n4 = {};
            return e4.forEach(function(e5) {
              let i4 = (t4.keyToAxis && t4.keyToAxis[e5] || e5) + "Axis", r4 = N(a4) ? t4.chart[i4][a4] : t4[i4];
              o4[e5] = r4 && r4.categories || [], n4[e5] = r4 && r4.dateTime;
            }), {
              categoryMap: o4,
              dateTimeValueAxisMap: n4
            };
          }, x2 = function(t4, e4) {
            let a4 = t4.pointArrayMap || ["y"];
            return t4.data.some((t5) => void 0 !== t5.y && t5.name) && e4 && !e4.categories && "name" !== t4.exportKey ? ["x", ...a4] : a4;
          }, b2 = [], y2, w2, T2, D2 = 0, v2, S2;
          for (v2 in o3.series.forEach(function(e4) {
            let a4 = e4.options.keys, o4 = e4.xAxis, h4 = a4 || x2(e4, o4), p4 = h4.length, u4 = !e4.requireSorting && {}, g3 = l3.indexOf(o4), y3 = m2(e4, h4), w3, v3;
            if (false !== e4.options.includeInDataExport && !e4.options.isInternal && false !== e4.visible) {
              for (k(b2, function(t4) {
                return t4[0] === g3;
              }) || b2.push([g3, D2]), v3 = 0; v3 < p4; ) T2 = f2(e4, h4[v3], h4.length), d3.push(T2.columnTitle || T2), t3 && c3.push(T2.topLevelColumnTitle || T2), v3++;
              w3 = {
                chart: e4.chart,
                autoIncrement: e4.autoIncrement,
                options: e4.options,
                pointArrayMap: e4.pointArrayMap,
                index: e4.index
              }, e4.options.data?.forEach(function(t4, a5) {
                let l4, c4, d4, f3 = {
                  series: w3
                };
                n3 && (y3 = m2(e4, h4, a5)), e4.pointClass.prototype.applyOptions.apply(f3, [t4]);
                let x3 = e4.data[a5] && e4.data[a5].name;
                if (l4 = (f3.x ?? "") + "," + x3, v3 = 0, (!o4 || "name" === e4.exportKey || !n3 && o4 && o4.hasNames && x3) && (l4 = x3), u4 && (u4[l4] && (l4 += "|" + a5), u4[l4] = true), s3[l4]) {
                  let t5 = `${l4},${s3[l4].pointers[e4.index]}`, a6 = l4;
                  s3[l4].pointers[e4.index] && (s3[t5] || (s3[t5] = [], s3[t5].xValues = [], s3[t5].pointers = []), l4 = t5), s3[a6].pointers[e4.index] += 1;
                } else {
                  s3[l4] = [], s3[l4].xValues = [];
                  let t5 = [];
                  for (let a6 = 0; a6 < e4.chart.series.length; a6++) t5[a6] = 0;
                  s3[l4].pointers = t5, s3[l4].pointers[e4.index] = 1;
                }
                for (s3[l4].x = f3.x, s3[l4].name = x3, s3[l4].xValues[g3] = f3.x; v3 < p4; ) c4 = h4[v3], d4 = e4.pointClass.prototype.getNestedProperty.apply(f3, [c4]), s3[l4][D2 + v3] = R(y3.categoryMap[c4][d4], y3.dateTimeValueAxisMap[c4] ? i3.dateFormat(r3.dateFormat, d4) : null, d4), v3++;
              }), D2 += v3;
            }
          }), s3) Object.hasOwnProperty.call(s3, v2) && h3.push(s3[v2]);
          for (w2 = t3 ? [c3, d3] : [d3], D2 = b2.length; D2--; ) e3 = b2[D2][0], a3 = b2[D2][1], y2 = l3[e3], h3.sort(function(t4, a4) {
            return t4.xValues[e3] - a4.xValues[e3];
          }), S2 = f2(y2), w2[0].splice(a3, 0, S2), t3 && w2[1] && w2[1].splice(a3, 0, S2), h3.forEach(function(t4) {
            let e4 = t4.name;
            y2 && !H(e4) && (y2.dateTime ? (t4.x instanceof Date && (t4.x = t4.x.getTime()), e4 = i3.dateFormat(r3.dateFormat, t4.x)) : e4 = y2.categories ? R(y2.names[t4.x], y2.categories[t4.x], t4.x) : t4.x), t4.splice(a3, 0, e4);
          });
          return O(o3, "exportData", {
            dataRows: w2 = w2.concat(h3)
          }), w2;
        }
        function i2(t3) {
          let e3 = (t4) => {
            if (!t4.tagName || "#text" === t4.tagName) return t4.textContent || "";
            let a3 = t4.attributes, o3 = `<${t4.tagName}`;
            return a3 && Object.keys(a3).forEach((t5) => {
              let e4 = a3[t5];
              o3 += ` ${t5}="${e4}"`;
            }), o3 += ">", o3 += t4.textContent || "", (t4.children || []).forEach((t5) => {
              o3 += e3(t5);
            }), o3 += `</${t4.tagName}>`;
          };
          return e3(this.getTableAST(t3));
        }
        function r2(t3) {
          let e3 = 0, a3 = [], o3 = this, n3 = o3.chart, i3 = n3.options, r3 = t3 ? 1.1.toLocaleString()[1] : ".", l3 = R(o3.options.useMultiLevelHeaders, true), s3 = o3.getDataRows(l3), h3 = l3 ? s3.shift() : null, c3 = s3.shift(), d3 = function(t4, e4) {
            let a4 = t4.length;
            if (e4.length !== a4) return false;
            for (; a4--; ) if (t4[a4] !== e4[a4]) return false;
            return true;
          }, p3 = function(t4, e4, a4, o4) {
            let i4 = R(o4, ""), l4 = "highcharts-text" + (e4 ? " " + e4 : "");
            return "number" == typeof i4 ? (i4 = n3.numberFormatter(i4, -1, r3, "th" === t4 ? "" : void 0), l4 = "highcharts-number") : o4 || (l4 = "highcharts-empty"), {
              tagName: t4,
              attributes: a4 = V({
                class: l4
              }, a4),
              textContent: i4
            };
          }, {
            tableCaption: u3
          } = o3.options || {};
          false !== u3 && a3.push({
            tagName: "caption",
            attributes: {
              class: "highcharts-table-caption"
            },
            textContent: "string" == typeof u3 ? u3 : i3.title?.text || i3.lang.chartTitle
          });
          for (let t4 = 0, a4 = s3.length; t4 < a4; ++t4) s3[t4].length > e3 && (e3 = s3[t4].length);
          a3.push(function(t4, e4, a4) {
            let n4 = [], i4 = 0, r4 = a4 || e4 && e4.length, s4, h4 = 0, c4;
            if (l3 && t4 && e4 && !d3(t4, e4)) {
              let a5 = [];
              for (; i4 < r4; ++i4) if ((s4 = t4[i4]) === t4[i4 + 1]) ++h4;
              else if (h4) a5.push(p3("th", "highcharts-table-topheading", {
                scope: "col",
                colspan: h4 + 1
              }, s4)), h4 = 0;
              else {
                s4 === e4[i4] ? o3.options.useRowspanHeaders ? (c4 = 2, delete e4[i4]) : (c4 = 1, e4[i4] = "") : c4 = 1;
                let t5 = p3("th", "highcharts-table-topheading", {
                  scope: "col"
                }, s4);
                c4 > 1 && t5.attributes && (t5.attributes.valign = "top", t5.attributes.rowspan = c4), a5.push(t5);
              }
              n4.push({
                tagName: "tr",
                children: a5
              });
            }
            if (e4) {
              let t5 = [];
              for (i4 = 0, r4 = e4.length; i4 < r4; ++i4) void 0 !== e4[i4] && t5.push(p3("th", null, {
                scope: "col"
              }, e4[i4]));
              n4.push({
                tagName: "tr",
                children: t5
              });
            }
            return {
              tagName: "thead",
              children: n4
            };
          }(h3, c3 || [], Math.max(e3, c3?.length || 0)));
          let g2 = [];
          s3.forEach(function(t4) {
            let a4 = [];
            for (let o4 = 0; o4 < e3; o4++) a4.push(p3(o4 ? "td" : "th", null, o4 ? {} : {
              scope: "row"
            }, t4[o4]));
            g2.push({
              tagName: "tr",
              children: a4
            });
          }), a3.push({
            tagName: "tbody",
            children: g2
          });
          let f2 = {
            tree: {
              tagName: "table",
              id: `highcharts-data-table-${n3.index}`,
              children: a3
            }
          };
          return O(n3, "afterGetTableAST", f2), f2.tree;
        }
        function l2() {
          this.toggleDataTable(false);
        }
        function s2(t3) {
          let e3 = this.chart, a3 = (t3 = R(t3, !this.isDataTableVisible)) && !this.dataTableDiv;
          if (a3 && (this.dataTableDiv = C.createElement("div"), this.dataTableDiv.className = "highcharts-data-table", e3.renderTo.parentNode.insertBefore(this.dataTableDiv, e3.renderTo.nextSibling)), this.dataTableDiv) {
            let o4 = this.dataTableDiv.style, n4 = o4.display;
            o4.display = t3 ? "block" : "none", t3 ? (this.dataTableDiv.innerHTML = y().emptyHTML, new (y())([this.getTableAST()]).addToDOM(this.dataTableDiv), O(e3, "afterViewData", {
              element: this.dataTableDiv,
              wasHidden: a3 || n4 !== o4.display
            })) : O(e3, "afterHideData");
          }
          this.isDataTableVisible = t3;
          let o3 = this.divElements, n3 = this.options, i3 = n3.buttons?.contextButton.menuItems, r3 = e3.options.lang;
          if (n3 && n3.menuItemDefinitions && r3 && r3.viewData && r3.hideData && i3 && o3) {
            let t4 = o3[i3.indexOf("viewData")];
            t4 && y().setElementHTML(t4, this.isDataTableVisible ? r3.hideData : r3.viewData);
          }
        }
        function h2() {
          this.toggleDataTable(true);
        }
        function c2(t3) {
          let e3 = this.chart, a3 = !!this.options.showExportInProgress, o3 = E.requestAnimationFrame || setTimeout;
          o3(() => {
            a3 && e3.showLoading(e3.options.lang.exportInProgress), o3(() => {
              try {
                t3.call(this);
              } finally {
                a3 && e3.hideLoading();
              }
            });
          });
        }
        function d2() {
          let t3 = this.exporting, e3 = t3?.dataTableDiv, a3 = (t4, e4) => t4.children[e4].textContent;
          if (e3 && t3.options.allowTableSorting) {
            let o3 = e3.querySelector("thead tr");
            o3 && o3.childNodes.forEach((o4) => {
              let n3 = e3.querySelector("tbody");
              o4.addEventListener("click", function() {
                let i3 = [...e3.querySelectorAll("tr:not(thead tr)")], r3 = [...o4.parentNode.children];
                if (t3) {
                  let e4, l3;
                  i3.sort((e4 = r3.indexOf(o4), l3 = t3.ascendingOrderInTable = !t3.ascendingOrderInTable, (t4, o5) => {
                    let n4, i4;
                    return n4 = a3(l3 ? t4 : o5, e4), i4 = a3(l3 ? o5 : t4, e4), "" === n4 || "" === i4 || isNaN(n4) || isNaN(i4) ? n4.toString().localeCompare(i4) : n4 - i4;
                  })).forEach((t4) => {
                    n3?.appendChild(t4);
                  }), r3.forEach((t4) => {
                    ["highcharts-sort-ascending", "highcharts-sort-descending"].forEach((e5) => {
                      t4.classList.contains(e5) && t4.classList.remove(e5);
                    });
                  }), o4.classList.add(t3.ascendingOrderInTable ? "highcharts-sort-ascending" : "highcharts-sort-descending");
                }
              });
            });
          }
        }
        function p2() {
          this.options?.exporting?.showTable && !this.options.chart.forExport && this.exporting?.viewData();
        }
        function u2() {
          this.exporting?.dataTableDiv?.remove();
        }
        t2.compose = function(t3, g2, f2) {
          if (!F(L, "ExportData")) return;
          V(T().prototype, {
            downloadCSV: function() {
              return this.exporting?.downloadCSV();
            },
            downloadXLS: function() {
              return this.exporting?.downloadXLS();
            },
            getCSV: function(t4) {
              return this.exporting?.getCSV(t4);
            },
            getDataRows: function(t4) {
              return this.exporting?.getDataRows(t4);
            },
            getTable: function(t4) {
              return this.exporting?.getTable(t4);
            },
            getTableAST: function(t4) {
              return this.exporting?.getTableAST(t4);
            },
            hideData: function() {
              return this.exporting?.hideData();
            },
            toggleDataTable: function(t4) {
              return this.exporting?.toggleDataTable(t4);
            },
            viewData: function() {
              return this.exporting?.viewData();
            }
          });
          let m2 = g2.prototype;
          if (!m2.downloadCSV) {
            A(t3, "afterViewData", d2), A(t3, "render", p2), A(t3, "destroy", u2), m2.downloadCSV = e2, m2.downloadXLS = a2, m2.getCSV = o2, m2.getDataRows = n2, m2.getTable = i2, m2.getTableAST = r2, m2.hideData = l2, m2.toggleDataTable = s2, m2.wrapLoading = c2, m2.viewData = h2, S(D);
            let g3 = v().exporting?.buttons?.contextButton?.menuItems;
            g3 && g3.push("separator", "downloadCSV", "downloadXLS", "viewData");
            let {
              arearange: x2,
              gantt: b2,
              map: y2,
              mapbubble: w2,
              treemap: T2,
              xrange: L2
            } = f2.types;
            x2 && (x2.prototype.keyToAxis = {
              low: "y",
              high: "y"
            }), b2 && (b2.prototype.exportKey = "name", b2.prototype.keyToAxis = {
              start: "x",
              end: "x"
            }), y2 && (y2.prototype.exportKey = "name"), w2 && (w2.prototype.exportKey = "name"), T2 && (T2.prototype.exportKey = "name"), L2 && (L2.prototype.keyToAxis = {
              x2: "x"
            });
          }
        };
      }(o || (o = {}));
      let I = o, B = h();
      B.dataURLtoBlob = B.dataURLtoBlob || f, B.downloadURL = B.downloadURL || m, I.compose(B.Chart, B.Exporting, B.Series);
      let M = h();
      return l.default;
    })());
  }
});
export default require_export_data();
//# sourceMappingURL=highcharts_modules_export-data.js.map
