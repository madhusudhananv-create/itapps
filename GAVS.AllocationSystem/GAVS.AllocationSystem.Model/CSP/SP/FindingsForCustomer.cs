using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class FindingsForCustomer
    {
        public int ID { get; set; }
        public string FINDING_TYPE { get; set; }

        public string FINDING_DESCRIPTION { get; set; }
        public string STAGE_DESCRIPTION { get; set; }

        public string STAGE_STATUS { get; set; }
        public string CUSTOMER_ID { get; set; }

        public string PROJECT_ID { get; set; }
        public string CUST_NM { get; set; }
        public string PROJ_NM { get; set; }

        public int? PORTFOLIO_ID { get; set; }

        public string PORTFOLIO_NAME { get; set; }

        public int? AGE_OF_FINDING { get; set; }

        public DateTime CREATED_DATE { get; set; }
        public DateTime UPDATED_DATE { get; set; }

        public Nullable<DateTime> TARGET_DATE { get; set; }

        public string RESPONSIBLE { get; set; }

        public int ASSESSMENT_ID { get; set; }
        [NotMapped]
        public string URL { get; set; }
        public string AGE_OF_FINDING_IN_DAYS { get; set; }
        public DateTime? STATUS_DATE { get; set; }
    }

    public class Findings
    {
        public int FINDING_ID { get; set; }
        public string FINDING_TYPE { get; set; }
        public string FINDING_DESCRIPTION { get; set; }
        public string STATUS { get; set; }

        public string REMARKS { get; set; }

        public int STAGE_ID { get; set; }
        public string STAGE_DESCRIPTION { get; set; }
        public string STAGE_STATUS { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CUSTOMER_ID { get; set; }

        public string PROJECT_ID { get; set; }

        public string WEEKSTATUS { get; set; }
    }

    public class FindingsByTime
    {
        public string AGEBYDAYS { get; set; }
        public string FINDING_TYPE { get; set; }

    }

    public class FindingsByTypeChartData
    {
        public List<string> COLUMNNAMES { get; set; }
        
        public List<object> VALUES { get; set; } = new List<object>();

    }
}
