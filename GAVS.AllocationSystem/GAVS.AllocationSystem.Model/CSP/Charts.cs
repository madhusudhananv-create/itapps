using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Charts
{
    public class Charts
    {
        public List<structGoals> TableChart { get; set; } = new List<structGoals>();
        public RadarChart RadarChart { get; set; }
        public HighChartsRadar RadarHighChart { get; set; }
        public HighChartsCombination IssueChartHighChart { get; set; }
        public PieChart IssueChart { get; set; }
        public RiskChart RiskChart { get; set; }
        public List<LineChart> TrendChart { get; set; }
        public List<HighChartsLineGroup> TrendHighChartGroup { get; set; } = new List<HighChartsLineGroup>();
        public string Month { get; set; } = DateTime.Now.ToString("MMM");
        public int Year { get; set; } = DateTime.Now.Year;
    }

    public struct tableCell
    {
        public object text;
        public string color;
        public int colSpan;
        public int rowSpan;
        public string toolTip;
        public object data;
        public Boolean noWrap;
        public string celltype;
    }
    public struct structGoals
    {
        public string Goal;
        public List<List<tableCell>> Details;
    }
    public struct structKPIAreas
    {
        public string kpiArea;
        public string goal;
        public List<List<tableCell>> details;
    }

    public class HighChartsLineGroup
    {
        public string GoalName { get; set; } = string.Empty;
        public List<HighChartsLineWithArea> TrendHighChart { get; set; } = new List<HighChartsLineWithArea>();
    }
    public class HighChartsLineWithArea
    {
        public int KPIId { get; set; }
        public string AreaName { get; set; } = string.Empty;
        public HighChartsLine TrendHighChart { get; set; }
    }

    public class LineChart
    {
        public LineChart()
        {
            options.curveType = "function";
            options.legend.position = "bottom";
        }
        public string chartType { get; set; } = "Line";
        public options options { get; set; } = new options();
        public List<List<object>> dataTable { get; set; } = new List<List<object>>();
    }
    public class RiskChart
    {
        public List<int[]> Data { get; set; } = new List<int[]>() { new int[5], new int[5], new int[5], new int[5], new int[5] };
    }
    public class CSATChart
    {
        public List<int[]> Data { get; set; } = new List<int[]>() { new int[3], new int[3], new int[3],new int[3]};
    }
    public class PieChart
    {
        public string chartType { get; set; } = "PieChart";
        public options options { get; set; } = new options();
        public List<List<object>> dataTable { get; set; } = new List<List<object>>();
    }
    public class Legend
    {
        public string position { get; set; }
    }
    public class options
    {
        public string title { get; set; }
        public string pieSliceText { get; set; } = "value";
        public List<colors> slices { get; set; } = new List<colors>() { new colors() { color = "#ffc4c4" }, new colors() { color = "#f7eb87" }, new colors() { color = "#b6dcb6" } };
        public string curveType { get; set; } //: 'function',
        public Legend legend { get; set; } = new Legend(); // : { position: 'bottom' }
    }
    public class colors
    {
        public string color { get; set; } = "red";
    }
    public class RadarChart
    {
        public string radarChartType { get; set; }
        public List<string> radarChartLabels { get; set; } = new List<string>();
        public List<RadarChartData> radarChartData { get; set; } = new List<RadarChartData>();

    }
    public class RadarChartData
    {
        List<decimal> _data = new List<decimal>();
        public List<decimal> data
        {
            get
            {
                return _data;
            }
            set
            {
                _data = value;
            }
        }
        public string label { get; set; }
        public Boolean fill { get; set; } = true;
    }
}
