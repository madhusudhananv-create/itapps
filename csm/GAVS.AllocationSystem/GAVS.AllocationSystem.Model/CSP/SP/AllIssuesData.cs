using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class OverAllData
    {
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public string DESCRIPTION { get; set; }
        public DateTime IDENTIFIED_DATE { get; set; }
        public string STATUS { get; set; }
        public string SEVERITY { get; set; }
        public string STATUS_TYPE { get; set; }
    }
}
