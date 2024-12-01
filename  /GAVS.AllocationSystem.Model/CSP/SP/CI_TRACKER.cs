using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CI_TRACKER : CIBASE
    {

        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public string PORTFOLIO_NM { get; set; }
        public string PROJ_ID { get; set; }

        public string PROJ_NM { get; set; }
    }


    public class CI_TOTAL_BASE : CIBASE
    {        
        public List<CI_TRACKER_CUSTOMER_GROUPING> CTB_CUSTOMER_GROUPING;
        public CI_TOTAL_BASE()
        {            
            CTB_CUSTOMER_GROUPING = new List<CI_TRACKER_CUSTOMER_GROUPING>();
        }

    }

    public class CIBASE
    {
        public int? COMPLETED { get; set; } = 0;
        public int? INPROGRESS { get; set; } = 0;
        public decimal? QUALITY_REDUCTION_OF_ERRORS { get; set; } = 0;
        public decimal? REDUCTION_IN_LEAD_TIME { get; set; } = 0;
        public decimal? REDUCTION_IN_CYCLE_TIME { get; set; } = 0;
        public decimal? TOTAL_BEFORE_ERROR { get; set; } = 0;
        public decimal? TOTAL_AFTER_ERROR { get; set; } = 0;
        public decimal? TOTAL_AFTER_LEAD { get; set; } = 0;
        public decimal? TOTAL_BEFORE_LEAD { get; set; } = 0;

        public decimal? TOTAL_AFTER_CYCLE { get; set; } = 0;
        public decimal? TOTAL_BEFORE_CYCLE { get; set; } = 0;
        public decimal? AUTOMATION_INDEX { get; set; } = 0;

        public string AUTOMATION_SPLIT { get; set; }

        public decimal? BEFORE_EFFORT_AUTOMATION { get; set; } = 0;
        public decimal? AFTER_EFFORT_AUTOMATION { get; set; } = 0;
        public decimal? BEFORE_EFFORT { get; set; } = 0;
        public decimal? AFTER_EFFORT { get; set; } = 0;
        public decimal? SAVING_PER_YEAR_EFFORT { get; set; } = 0;
        public decimal? SAVINGS_IN_USD { get; set; } = 0;
        public decimal? HARD_BENEFITS { get; set; } = 0;
        public string SOFT_BENEFITS { get; set; }
        public decimal? REVENUE { get; set; } = 0;
        public decimal? OPERATING_COST { get; set; } = 0;
        public decimal? PROFITABILITY { get; set; } = 0;
        public decimal CALCULATION { get; set; } = 0;
        public int? POSITION { get; set; } = 0;

        public string REDUCTION_IN_LEAD_TIME_DISPLAY { get; set; }
        public string REDUCTION_IN_CYCLE_TIME_DISPLAY { get; set; }

        public string SAVING_PER_YEAR_EFFORT_DISPLAY { get; set; }

        public decimal? NET_BENEFITS { get; set; } = 0;

        public int? TOTALIDEAS { get; set; } = 0;
    }

    public class CI_TRACKER_CUSTOMER_GROUPING
    {
        public CI_TRACKER_CUSTOMER_GROUPING(string custid, string projnm)
        {
            this.CUST_ID = custid;
            this.CUST_NM = projnm;
            this.CI_TRACKER_PORTFOLIO_GOUPING = new List<CI_TRACKER_PORTFOLIO_GOUPING>();
            this.CI_TRACKER_PROJECT_GROUPING = new List<CI_TRACKER_PROJECT_GROUPING>();
            this.CI_CUST_PROPERTIES = new CIBASE();
        }
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public CIBASE CI_CUST_PROPERTIES { get; set; }


        public List<CI_TRACKER_PORTFOLIO_GOUPING> CI_TRACKER_PORTFOLIO_GOUPING { get; set; }
        public List<CI_TRACKER_PROJECT_GROUPING> CI_TRACKER_PROJECT_GROUPING { get; set; }
    }

    public class CI_TRACKER_PORTFOLIO_GOUPING
    {

        public CI_TRACKER_PORTFOLIO_GOUPING(int id, string title)
        {
            this.PORTFOLIO_ID = id;
            this.PORTFOLIO_NM = title;
            this.CI_TRACKER_PROJECT_GROUPING = new List<CI_TRACKER_PROJECT_GROUPING>();
            this.CI_PORTFOLIO_PROPERTIES = new CIBASE();
        }
        public int PORTFOLIO_ID { get; set; }
        public string PORTFOLIO_NM { get; set; }

        public CIBASE CI_PORTFOLIO_PROPERTIES { get; set; }

        public List<CI_TRACKER_PROJECT_GROUPING> CI_TRACKER_PROJECT_GROUPING { get; set; }
    }

    public class CI_TRACKER_PROJECT_GROUPING
    {
        public CI_TRACKER_PROJECT_GROUPING(string id, string title)
        {
            this.PROJ_ID = id;
            this.PROJ_NM = title;
            this.CI_PROJECT_PROPERTIES = new CIBASE();
        }

        public CI_TRACKER_PROJECT_GROUPING() { }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }

        public CIBASE CI_PROJECT_PROPERTIES { get; set; }
    }


    public class CITrackerParameterModel
    {
        public bool ALL { get; set; }

        public bool INNOVATION { get; set; }
        public bool IMPROVEMENT { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public bool AUTOMATE { get; set; }
        public bool CUSTOMER_SAVINGS { get; set; }
        public string[] PROJECTIDS { get; set; }
        public string CUST_ID { get; set; }
        public int VIEWBY { get; set; }
        public int[] IISTATUS { get; set; }
        public int BENEFICIARY { get; set; }
        public int[] CILCATEGORY { get; set; }
        public int UOM { get; set; }

    }
}
