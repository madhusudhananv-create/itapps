using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class SUBPROJECT_TASK : EntityBase
    {
       
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public int SUBPROJECT_ID { get; set; }
        public Boolean ISMILESTONE { get; set; }
        public Boolean SHOW_IN_CHART { get; set; }
        public string DESCRIPTION { get; set; }
        public DateTime? EXPECTED_START_DATE { get; set; }
        public DateTime? EXPECTED_END_DATE { get; set; }
        public DateTime? ACTUAL_START_DATE { get; set; }
        public DateTime? ACTUAL_END_DATE { get; set; }
        public string STATUS { get; set; }
        public int COMPLETION_PERCENT { get; set; }
        public string COMMENTS { get; set; }

        public string RESPONSIBILITY{ get; set; }

    }
}
