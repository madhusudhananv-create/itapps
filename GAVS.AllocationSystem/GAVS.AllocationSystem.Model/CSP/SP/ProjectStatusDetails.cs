using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class ProjectStatusDetails
    {
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int? PORTFOLIO_ID { get;  set;}
        public DateTime START_TIME { get; set; }
        public DateTime END_TIME { get; set; }

        public string PROJECT_STATUS { get; set; }

    }
}
