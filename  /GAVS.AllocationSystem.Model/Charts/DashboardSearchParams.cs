using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.Charts
{ 
    public class DashboardSearchParams
    {
        public bool ALL_PROJECTS { get; set; }
        public List<string> PROJ_IDS { get; set; }
        public List<string> CUST_ID { get; set; }
        public DateTime? START_DATE { get; set; }
        public DateTime? END_DATE { get; set; }
        public int? GOAL_ID { get; set; }
    }
    public class ProjectByCustomerIdsParams
    { 
        public bool ALL_PROJECTS { get; set; } 
        public List<string> CUST_ID { get; set; }

    }

}
