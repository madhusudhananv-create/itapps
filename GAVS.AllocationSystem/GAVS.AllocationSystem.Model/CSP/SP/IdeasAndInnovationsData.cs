using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{ 
    public  class IdeasAndInnovationsData
    {
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public bool AUTOMATIONS { get; set; }
        public bool INNOVATIONS { get; set; }
        public bool IMPROVEMENTS { get; set; }
        public decimal? EFFORTS_SAVED_PERSON_HOUR { get; set; }
        public decimal? DOLLARS { get; set; }
        public string STATUS { get; set; }
    }
}
