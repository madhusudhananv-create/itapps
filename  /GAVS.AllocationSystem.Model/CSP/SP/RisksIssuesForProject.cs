using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class RisksIssuesForProject
    {
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public string VALUE { get; set; }
        public string TYPE { get; set; }
    }
}
