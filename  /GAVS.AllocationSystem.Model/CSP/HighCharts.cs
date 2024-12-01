using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Charts
{
    public class HighChartsCombination
    {
        public title title { get; set; } = new title();
        public xAxis xAxis { get; set; } = new xAxis();
        public yAxis_Combination yAxis { get; set; } = new yAxis_Combination();
        public labels labels { get; set; } = new labels();
        public List<object> series { get; set; } = new List<object>();

    }
    public class HighChartsAdvancedTimeline
    {
        public chart_AdvancedTimeline chart { get; set; } = new chart_AdvancedTimeline();
        public xAxis_AdvancedTimeline xAxis { get; set; } = new xAxis_AdvancedTimeline();
        public title title { get; set; } = new title();
        public tooltip tooltip { get; set; } = new tooltip();
        //public List<yAxis_AdvancedTimeline> yAxis { get; set; } = new List<yAxis_AdvancedTimeline>();
        public plotOptions_AdvancedTimeline plotOptions { get; set; } = new plotOptions_AdvancedTimeline();

        public List<series_AdvancedTimeline> series { get; set; } = new List<series_AdvancedTimeline>();
    }
    public class series_AdvancedTimeline
    {
        public string type { get; set; }
        public string name { get; set; }
        public string color { get; set; }
        public string shape { get; set; }
        public string fillColor { get; set; }
        public int y { get; set; }
        public List<data_AdvancedTimeline> data { get; set; } = new List<data_AdvancedTimeline>();
    }
    public class series_AdvancedTimeline_withTooltip : series_AdvancedTimeline
    {
        public string id { get; set; }
        public marker_AdvancedTimeline marker { get; set; } = new marker_AdvancedTimeline();
        public double fillOpacity { get; set; }
        public tooltip tooltip { get; set; } = new tooltip();
        public string dashStyle { get; set; }
        public int yAxis { get; set; }
        public string step { get; set; }
        public Boolean showInLegend { get; set; }
        public string onSeries { get; set; }
    }
    public class data_AdvancedTimeline
    {
        public double x { get; set; }
        public double y { get; set; }
        //
        public string name { get; set; }
        public string image { get; set; }
        //
        public string text { get; set; }
        public string title { get; set; }
        public string shape { get; set; }

    }
    public class marker_AdvancedTimeline
    {
        public Boolean enable { get; set; }
        public string symbol { get; set; }
        public double radius { get; set; }
    }
    public class plotOptions_AdvancedTimeline
    {
        public series_AdvancedTimeline_withTooltip series { get; set; } = new series_AdvancedTimeline_withTooltip();
        public flags flags { get; set; } = new flags();
    }
    public class flags
    {
        public tooltip tooltip { get; set; } = new tooltip();
    }
    public class yAxis_AdvancedTimeline
    {
        public int max { get; set; }
        public labels_AdvancedTimeline labels { get; set; } = new labels_AdvancedTimeline();
        public Boolean allowDecimals { get; set; }
        public Boolean oppsite { get; set; }
        public title title { get; set; }
        public string gridLineColor { get; set; }
        public int gridLineWidth { get; set; }
    }
    public class labels_AdvancedTimeline
    {
        public Boolean enabled { get; set; } = true;
        public string align { get; set; } = "left";
        public style style { get; set; } = new style();
    }
    public class chart_AdvancedTimeline
    {

    }
    public class xAxis_AdvancedTimeline
    {
        public string type { get; set; }
        public int minTickInterval { get; set; } = 365 * 24 * 365;
        public labels_AdvancedTimeline labels { get; set; } = new labels_AdvancedTimeline();
        public List<PlotBands> plotBands { get; set; } = new List<PlotBands>();
    }
    public class PlotBands
    {
        public double from { get; set; }
        public double to { get; set; }
        public string color { get; set; }
        public label_AdvancedTimeLine label { get; set; }
    }
    public class label_AdvancedTimeLine : label
    {
        public int y { get; set; }
    }
    public class tooltip
    {
        //public string width { get; set; }
        //
        public style style { get; set; } = new style();
        public string xDateFormat { get; set; }
        public string valueSuffix { get; set; }
        //
        public string headerFormat { get; set; }
        public string pointFormat { get; set; }
    }


    public class yAxis_Combination
    {
        public title title { get; set; } = new title();
        public Boolean allowDecimals { get; set; } = false;
    }

    #region "HighChartsPareto
    public class HighChartsPareto
    {
        public HighChartsParetoChart chart { get; set; } = new HighChartsParetoChart();
        public HighChartsParetoTitle title { get; set; } = new HighChartsParetoTitle();
        public HighChartsParetoTooltip tooltip { get; set; } = new HighChartsParetoTooltip();
        public HighChartsParetoxAxis xAxis { get; set; } = new HighChartsParetoxAxis();
        public List<object> yAxis { get; set; } = new List<object>();
        public List<object> series { get; set; } = new List<object>();

    }
    public class HighChartsParetoChart
    {
        public string type { get; set; } = "column";
        public string renderTo { get; set; }
    }
    public class HighChartsParetoTitle
    {
        public string text { get; set; }
    }
    public class HighChartsParetoTooltip
    {
        public Boolean shared { get; set; } = true;
    }
    public class HighChartsParetoxAxis
    {
        public List<string> categories { get; set; } = new List<string>();
        public Boolean crosshair { get; set; } = false;
    }
    public class HighChartsParetoyAxis1
    {
        public HighChartsParetoTitle title { get; set; } = new HighChartsParetoTitle();
    }
    public class HighChartsParetoyAxis2
    {
        public HighChartsParetoTitle title { get; set; } = new HighChartsParetoTitle();
        public int minPadding { get; set; } = 0;
        public int maxPadding { get; set; } = 0;
        public int max { get; set; } = 100;
        public int min { get; set; } = 0;
        public bool opposite { get; set; } = true;
        public labelsPareto labels { get; set; } = new labelsPareto();
    }
    public class HighChartsParetoySeries1
    {
        public string type { get; set; } = "";
        public string name { get; set; } = "";
        public int yAxis { get; set; } = 1;
        public int zIndex { get; set; } = 10;
        public int baseSeries { get; set; } = 1;
    }
    public class HighChartsParetoySeries2
    {
        public string type { get; set; } = "";
        public string name { get; set; } = "";
        public int zIndex { get; set; } = 2;
        public List<decimal> data { get; set; } = new List<decimal>();
    }
    #endregion
    public class labelsPareto
    {
        public string format { get; set; } = "";
    }


    public class HighChartsLine
    {
        public chart chart { get; set; } = new chart();
        public title title { get; set; } = new title();
        public title subtitle { get; set; } = new title();
        public credits credits { get; set; } = new credits();
        public List<seriesItem> series { get; set; } = new List<seriesItem>();
        public xAxis xAxis { get; set; } = new xAxis();
        public legend legend { get; set; } = new legend();
        public yAxis yAxis { get; set; }
        public responsive responsive { get; set; }
        public plotOptions plotOptions { get; set; } = new plotOptions();
        public HighChartButtonOptions buttonOptions { get; set; } = new HighChartButtonOptions();
        public exporting exporting { get; set; } = new exporting();
    }
    public class HighChartsLineForCSAT
    {
        public chartforDash chart { get; set; } = new chartforDash();
        public title title { get; set; } = new title();
        public title subtitle { get; set; } = new title();
        public credits credits { get; set; } = new credits();
        public List<seriesItemCSAT> series { get; set; } = new List<seriesItemCSAT>();
        public xAxis xAxis { get; set; } = new xAxis();
        public legend legend { get; set; } = new legend();
        public yAxis yAxis { get; set; }
        public responsive responsive { get; set; }
        public plotOptions plotOptions { get; set; } = new plotOptions();
        public HighChartButtonOptions buttonOptions { get; set; } = new HighChartButtonOptions();
        public exporting exporting { get; set; } = new exporting();
    }
    public class HighChartExporting
    {
        public HighChartButtonOptions buttonOptions { get; set; } = new HighChartButtonOptions();
    }
    public class legend
    {
        public bool enabled { get; set; } = true;
    }
    public class exporting
    {
        public bool enabled { get; set; } = true;
    }
    public class HighChartButtonOptions
    {
        public Boolean enabled { get; set; } = true;
    }
    public class HighChartsColumn
    {
        public chartString chart { get; set; } = new chartString();
        public title title { get; set; } = new title();
        public title subtitle { get; set; } = new title();
        public credits credits { get; set; } = new credits();
        public List<seriesItem> series { get; set; } = new List<seriesItem>();
        public xAxis xAxis { get; set; } = new xAxis();
        public yAxisOnlyWithTitle yAxis { get; set; }
        public responsive responsive { get; set; }
        public plotOptions plotOptions { get; set; } = new plotOptions();
    }
    public class HighChartsColumnWithDrilldown
    {
        public chartString chart { get; set; } = new chartString();
        public title title { get; set; } = new title();
        public title subtitle { get; set; } = new title();
        public credits credits { get; set; } = new credits();
        public List<seriesItemColumn> series { get; set; } = new List<seriesItemColumn>();
        public xAxis xAxis { get; set; } = new xAxis();
        public yAxisOnlyWithTitle yAxis { get; set; }
        public responsive responsive { get; set; }
        public plotOptions plotOptions { get; set; } = new plotOptions();
        public drilldown drilldown { get; set; } = new drilldown();
    }
    public class plotOptions
    {
        public series series { get; set; } = new series();
    }
    public class drilldown
    {
        public List<seriesdrill> series { get; set; } = new List<seriesdrill>();
    }
    public class seriesdrill
    {
        public string name { get; set; } = "";
        public string id { get; set; } = "";
        public List<List<object>> data { get; set; } = new List<List<object>>();

    }
    //public class drillData
    //{
    //    public string data { get; set; } = "";
    //    public int value { get; set; } = 0;
    //}
    public class series
    {
        public dataLabels dataLabels { get; set; } = new dataLabels();
        public markerLine marker { get; set; } = new markerLine();
        public string stacking { get; set; } 
    }
    public class dataLabels
    {
        public Boolean enabled { get; set; } = false;
        //public string formatter { get; set; } = "";
        public style style { get; set; } = new style();
    }
    public class markerLine
    {
        public int radius { get; set; } = 4;
        //public string formatter { get; set; } = "";
    }
    public class HighChartsRadar
    {
        public chart chart { get; set; } = new chart();
        public title title { get; set; } = new title();
        public credits credits { get; set; } = new credits();
        public List<seriesItemRadar> series { get; set; } = new List<seriesItemRadar>();
        public xAxis xAxis { get; set; } = new xAxis();
        public yAxis yAxis { get; set; }
        public responsive responsive { set; get; }
    }
    public class HighChartsHeatMap
    {
        public chartString chart { get; set; } = new chartString();
        public title title { get; set; } = new title();
        public List<seriesItemHeatMap> series { get; set; } = new List<seriesItemHeatMap>();
        public xAxis xAxis { get; set; } = new xAxis();
        public yAxisHeatMap yAxis { get; set; } = new yAxisHeatMap();
        public responsive responsive { set; get; }
    }
    //HighChartsPie
    public class HighChartsPie
    {
        public chartPie chart { get; set; } = new chartPie();
        public title title { get; set; } = new title();
        public title subtitle { get; set; } = new title();
        public credits credits { get; set; } = new credits();
        public tooltip tooltip { get; set; } = new tooltip();
        public List<seriesPie> series { get; set; } = new List<seriesPie>();
        public plotOptionsPie plotOptions { get; set; } = new plotOptionsPie();
        public exporting exporting { get; set; } = new exporting();

    }
    //HighchartsPieForPortfolio
    public class HighChartsPiePortfolio
    {
        public chartPie chart { get; set; } = new chartPie();
        public title title { get; set; } = new title();
        public title subtitle { get; set; } = new title();
        public credits credits { get; set; } = new credits();
        public tooltip tooltip { get; set; } = new tooltip();
        public List<seriesPiePortFolio> series { get; set; } = new List<seriesPiePortFolio>();
        public plotOptionsPie plotOptions { get; set; } = new plotOptionsPie();
        public exporting exporting { get; set; } = new exporting();
        //public chartEventOptions options { get; set; } = new chartEventOptions();
    }
    public class plotOptionsPie
    {
        public plotpie pie { get; set; } = new plotpie();
        public plotseries series { get; set; } = new plotseries();
    }

    public class plotpie
    {
        public Boolean allowPointSelect { get; set; } = true;
        public string cursor { get; set; } = "pointer";
        public credits dataLabels { get; set; } = new credits();
        public int size { get; set; }
    }
    public class seriesPie
    {
        public string type { get; set; } = "pie";
        public string name { get; set; } = "";
        public List<pieData> data { get; set; } = new List<pieData>();
        public List<int> center { get; set; } = new List<int>();
        public int size { get; set; }
        public Boolean showInLegend { get; set; }
        public credits dataLabels { get; set; } = new credits();
    }
    public class seriesPiePortFolio
    {
        public string type { get; set; } = "pie";
        public string name { get; set; } = "";
        public List<pieData> data { get; set; } = new List<pieData>();
    }
    public class events
    {
        public string click { get; set; }
    }
    public class seriesItemHeatMap
    {
        public string name { get; set; } = "";
        public List<heatMapData> data { get; set; } = new List<heatMapData>();
        public credits dataLabels { get; set; } = new credits();
    }

    public class pieData
    {
        public string name { get; set; } = "";
        public int y { get; set; }
        public string color { get; set; } = "";
    }
    public class heatMapData
    {
        public int x { get; set; }
        public int y { get; set; }
        public int value { get; set; }
        public string name { get; set; }
        public string color { get; set; } = "";
    }
    public class columnData
    {
        public string name { get; set; } = "";
        public int y { get; set; }
        public string drilldown { get; set; } = "";
    }
    public class chart
    {
        public enChartType type { get; set; } = enChartType.line;
        public Boolean polar { get; set; } = false;
        public string height { get; set; }
        public string width { get; set; }
    }
    public class chartPie
    {
        public string type { get; set; } = "pie";
        public string height { get; set; }
        public string width { get; set; }

    }
    //public class chartEventOptions
    //{
    //    public optionsplotOptions plotOptions { get; set; } = new optionsplotOptions();
    //}
    public class optionsplotOptions
    {
        public plotseries series { get; set; } = new plotseries();
    }
    public class plotseries
    {
        public events events { get; set; } = new events();
    }
    public class chartforDash
    {
        public enChartType type { get; set; } = enChartType.line;
        public Boolean polar { get; set; } = false;
        public string height { get; set; } = "80";
        public string width { get; set; } = "160";
    }

    public class chartString
    {
        public string type { get; set; } = "line";
        //public Boolean polar { get; set; } = false;
    }
    public class title
    {
        public string text { get; set; } = "";
        public style style { get; set; } = new style();
    }
    public class style
    {
        public string color { get; set; } = "";
        public string fontSize { get; set; } = "";
        public string fontWeight { get; set; } = "";
        public string left { get; set; } = "";
        public string top { get; set; } = "";
        //
        public string width { get; set; } = "";
    }
    public class credits
    {
        public Boolean enabled { get; set; } = false;
        public int distance { get; set; } = -30;
        public string format { get; set; } = "{point.percentage:.1f}%";
    }
    public class seriesItem
    {

        public seriesItem()
        {

        }

        public seriesItem(string nm, string clr, string typ, List<decimal> dta)
        {
            name = nm;
            color = clr;
            type = typ;
            data = dta;
        }
        public string name { get; set; } = "";
        public List<decimal> data { get; set; } = new List<decimal>();

        //public List<string> data1 { get; set; } = new List<string>();
        //public List<columnData> data { get; set; } = new List<columnData>();
        public string color { get; set; } = "";
        public int width { get; set; } = 1;
        public string type { get; set; } = "";
    }
    public class seriesItemCSAT
    {
        public string name { get; set; } = "";
        public List<lineData> data { get; set; } = new List<lineData>();
        //public List<columnData> data { get; set; } = new List<columnData>();
        public string color { get; set; } = "";
        public int width { get; set; } = 1;
        public string type { get; set; } = "";
    }
    public class lineData
    {
        public decimal y { get; set; }
        public string color { get; set; } = "";
    }

    public class seriesItemColumn
    {
        public string name { get; set; } = "";
        public List<columnData> data { get; set; } = new List<columnData>();
        public string color { get; set; } = "";
        public int width { get; set; } = 1;
        public string type { get; set; } = "";
    }
    public class seriesItemRadar
    {
        public string name { get; set; } = "";
        public List<decimal> data { get; set; } = new List<decimal>();
        public string color { get; set; } = "";
        public int width { get; set; } = 1;
        public marker marker { get; set; }
    }
    public class marker
    {
        public Boolean enabled { get; set; } = true;
        public enSymbol symbol { get; set; } = enSymbol.auto;
    }
    public class xAxis
    {
        public List<string> categories { get; set; } = new List<string>();
        public int gridLineWidth { get; set; } = 0;
        public bool visible { get; set; } = true;
    }
    public class yAxisHeatMap
    {
        public List<string> categories { get; set; } = new List<string>();
        public int gridLineWidth { get; set; } = 0;
        public bool visible { get; set; } = true;
    }
    public class xAxisWithDrill
    {
        public string type { get; set; } = "";
    }
    public class yAxisOnlyWithTitle
    {
        public title title { get; set; } = new title();
        public Boolean allowDecimals { get; set; } = false;
    }
    public class yAxis
    {
        public Boolean allowDecimals { get; set; } = false;
        public int min { get; set; }
        public int? max { get; set; }
        public title title { get; set; } = new title();
        public Boolean opposite { get; set; } = false;
        public List<plotLines> plotLines { get; set; }// = new List<plotLines>();
        public int minorGridLineWidth { get; set; }
        public int gridLineWidth { get; set; }
        public string gridLineInterpolation { get; set; }
        public string lineColor { get; set; }
        public int lineWidth { get; set; }
        public int tickInterval { get; set; }
        public string minorTickInterval { get; set; } //'auto',
        public int minorTickLength { get; set; }
        public int minorTickWidth { get; set; }
        public bool visible { get; set; } = true;
        public crosshair crosshair { get; set; }// = new crosshair();
    }
    public class plotLines
    {
        public decimal? value { get; set; }
        public string color { get; set; }
        public enDashStyle dashStyle { get; set; }
        public int width { get; set; }
        public int zIndex { get; set; }
        public label label { get; set; } = new label();
    }
    public class crosshair
    {
        public int width { get; set; }
        public string color { get; set; }
    }
    public class label
    {
        public string text { get; set; }
        public style style { get; set; }
    }
    public class labels
    {
        public List<labelsItem> items = new List<labelsItem>();
        public style style { get; set; }
    }
    public class labelsItem
    {
        public string html { get; set; }
        public style style { get; set; } = new style();

    }
    public enum enDashStyle
    {
        shortdash
    }
    public class responsive
    {
        public List<rule> rules { set; get; } = new List<rule>();
    }
    public class rule
    {
        public condition condition { get; set; } = new condition();
        public chartOptions chartOptions { get; set; } = new chartOptions();
    }
    public class condition
    {
        public int maxWidth { get; set; } = 500;
    }
    public class chartOptions
    {
        public HighChartsLegend legend { get; set; } = new HighChartsLegend();
    }
    public class HighChartsLegend
    {
        public enLayout layout { get; set; } = enLayout.vertical;
        public enAlign align { get; set; } = enAlign.center;
        public enVerticalAlign verticalAligh { get; set; } = enVerticalAlign.bottom;
    }
    public enum enChartType
    {
        line,
        area,
        column
    }
    public enum enLayout
    {
        vertical,
        horizontal,
    }
    public enum enAlign
    {
        center,
        left,
        right
    }
    public enum enVerticalAlign
    {
        top,
        middle,
        bottom
    }
    public enum enSymbol
    {
        circle,
        square,
        diamond,
        triangle,
        auto
    }
}
