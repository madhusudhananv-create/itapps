using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class PRODUCT_TIER
    {
        public int ID { get; set; }
        public int TIER_ID { get; set; }
        public string SEVERITY_LEVEL_1 { get; set; }
        public string SEVERITY_LEVEL_2 { get; set; }
        public string SEVERITY_LEVEL_3 { get; set; }
        public decimal SYSTEM_UPTIME { get; set; }
        public string MTTR { get; set; }
        public string PROBLEM_RESOLUTION_TIME { get; set; }
    }
}
