using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class IdeasDetailsForViewDetails
    {
        public int ID { get; set; }
        public string CUST_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string RAG { get; set; }
        public string PROJ_NM { get; set; }
        public int? PORTFOLIO_ID { get; set; }

        public string PORTFOLIO_NM { get; set; }
        public string DESCRIPTION { get; set; }
        public string STATUS { get; set; }
        public Nullable<DateTime> TARGET_DATE { get; set; }
        public Nullable<DateTime> ACTUAL_DATE { get; set; }

        public DateTime IDENTIFIED_DATE { get; set; }
        public string PROCESS_IMPROVEMENT_DESCRIPTION { get; set; }
        public string AREA { get; set; }
        public bool AUTOMATIONS { get; set; }
        public bool INNOVATIONS { get; set; }
        public bool IMPROVEMENTS { get; set; }

        public string RESPONSIBLE { get; set; }
    }
}

