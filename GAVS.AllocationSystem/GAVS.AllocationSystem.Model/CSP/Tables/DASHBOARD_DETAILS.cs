using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class DASHBOARD_DETAILS
    {
        public int ID { get; set; }
        public string TITLE { get; set; }
        public string CONTENT { get; set; }
        public string COLOR { get; set; }
        public string COMMENTS { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public string CREATED_BY { get; set; } = "100365";
        public DateTime CREATED_DATE { get; set; } = DateTime.Now;
        public string UPDATED_BY { get; set; } = "100365";
        public DateTime UPDATED_DATE { get; set; } = DateTime.Now;
        public Boolean ISACTIVE { get; set; } = true;
    }

    public class IdeaAndInnovationAndImprovements
    {
        public string[] PROJECT_ID { get; set; }

        public int YEAR { get; set; }

        public string MONTH { get; set; }
    }

    public class CSMDashboardDetailsModel
    {
      public string CUST_ID { get; set; }
      public string CUST_NM { get; set; }
      public  string PROJ_ID { get; set; }
      public string PROJ_NM { get; set; }
      public int? PORTFOLIO_ID { get; set; }
      public int IMPROVEMENT_TYPE_COUNT { get; set; }
      public string IMPROVEMENT_TYPE_NAME { get; set; }
      public decimal? PERCENTAGE_SCORE { get; set; }
    }
}
