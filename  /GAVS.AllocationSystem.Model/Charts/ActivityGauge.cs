using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.Charts
{
    public class ActivityGauge
    {
        public ActivityGauge()
        {
            series.Add(new clsseries());
        }
        public clschart chart { get; set; } = new clschart();
        public clstitle title { get; set; } = new clstitle();
        public clscredits credits { get; set; } = new clscredits();
        public clspane pane { get; set; } = new clspane();
        public clsyAxis yAxis { get; set; } = new clsyAxis();
        public clsplotOptions plotOptions { get; set; } = new clsplotOptions();
        public List<clsseries> series { get; set; } = new List<clsseries>();

        public class clschart
        {
            public string type { get; set; } = "solidgauge";
        }
        public class clstitle
        {
            public string text { get; set; } = "Overall Health Index";
            public clsstyle style { get; set; } = new clsstyle();
            public class clsstyle
            {
                public string fontSize { get; set; } = "15px";
            }
        }
        public class clscredits
        {
            public Boolean enabled { get; set; } = false;
        }
        public class clspane
        {
            public clspane()
            {
                background.Add(new clsbackground());
            }
            public int startAngle { get; set; } = 0;
            public int endAngle { get; set; } = 360;
            public List<clsbackground> background { get; set; } = new List<clsbackground>();
            public class clsbackground
            {
                public string outerRadius { get; set; } = "112%";
                public string innerRadius { get; set; } = "88%";
                public string backgroundColor { get; set; } = "#CDE2F8";
                public int borderWidth { get; set; } = 0;
            }
        }
        public class clsyAxis
        {
            public int min { get; set; } = 0;
            public int max { get; set; } = 100;
            public int lineWidth { get; set; } = 0;
            public List<int> tickPositions { get; set; } = new List<int>();
        }
        public class clsplotOptions
        {
            public clspie pie { get; set; } = new clspie();
            public clssolidgauge solidgauge { get; set; } = new clssolidgauge();
            public class clspie
            {
                public int size { get; set; } = 80;
            }
            public class clssolidgauge
            {
                public string linecap { get; set; } = "round";
                public Boolean stickyTracking { get; set; } = false;
                public Boolean rounded { get; set; } = true;
            }
        }
        public class clsseries
        {
            public clsseries()
            {
                data.Add(new clsdata());
            }
            public string name { get; set; } = string.Empty;
            public List<clsdata> data { get; set; } = new List<clsdata>();
            public clsdataLabels dataLabels { get; set; } = new clsdataLabels();
            public class clsdata
            {
                public string color { get; set; } = "#7CB5EC";
                public string radius { get; set; } = "112%";
                public string innerRadius { get; set; } = "88%";
                public decimal y { get; set; } = 50;
            }
            public class clsdataLabels
            {
                public Boolean enabled { get; set; } = true;
                public int borderWidth { get; set; } = 0;
                public string valueSuffix { get; set; } = " % ";
                public int y { get; set; } = -15;
                public clsstyle style { get; set; } = new clsstyle();
                public string format { get; set; } = "{point.y}%";
                public class clsstyle
                {
                    public string background { get; set; } = "red";
                    public string color { get; set; } = "black";
                    public string fontSize { get; set; } = "200%";
                    public string fontWeight { get; set; } = "bold";
                    public string textOutline { get; set; } = "1px contrast";
                }

            }
        }
    }
}
