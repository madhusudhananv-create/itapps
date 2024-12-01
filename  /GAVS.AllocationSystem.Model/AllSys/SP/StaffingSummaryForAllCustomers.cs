using GAVS.AllocationSystem.Model.CSP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class StaffingSummaryForAllCustomers
    {
        public string CUST_ID { get; set; }
        public int? PORTFOLIO_ID { get; set; }

        public string PROJ_ID { get; set; }

        public string PARENT_PROJ_ID { get; set; }

        public bool BILL_FLG { get; set; }
        public int BILLED { get; set; }

        public int  UNBILLED { get; set; }

        public string NAME { get; set; }

    }
}
