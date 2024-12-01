using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    public class ASSESSMENT_FINDINGS
    {
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string CSM_ID { get; set; }
        public string CSM_NM { get; set; }
        public string FINDING_TYPE { get; set; }
        public string FINDING_STATUS { get; set; }
        public int FINDING_AGE { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public string PORTFOLIO_NM { get; set; }
        public string YEAR_QUARTER { get; set; }
        public string YEAR_MONTH { get; set; }

    }

    
}
