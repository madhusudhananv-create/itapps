using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;

namespace GAVS.AllocationSystem.Model.CSP
{
    [NotMapped]
    public class PROJECT_ISSUEEXT : PROJECT_ISSUE
    {
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }

        public int? PORTFOLIO_ID { get; set; }
        public string PORTFOLIO_NM { get; set; }
        public string PROJ_NM { get; set; }

        public string IsEscalated { get; set; }
    }
}
