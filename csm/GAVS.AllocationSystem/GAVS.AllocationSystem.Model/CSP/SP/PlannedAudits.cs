using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PlannedAudits
    {
        public int ID { get; set; }
        public string DESCRIPTION { get; set; }
        public string PRIORITY { get; set; }
        public DateTime? SCHEDULED_START_DATE { get; set; }

        public DateTime? DUE_DATE { get; set; }

        public DateTime? ACTUAL_START_DATE { get; set; }
        public DateTime? ACTUAL_END_DATE { get; set; }

        public int SCHEDULED_DURATION { get; set; }

        public int? ACTUAL_DURATION { get; set; }
        public string STATUS { get; set; }

        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public string AUDITOR_EMP_ID { get; set; }

        public string KEY { get; set; }

        public string VALUE { get; set; }
        public DateTime? ACTUAL_AUDIT_START_DATE { get; set; }
    }

    public class PlannedAuditsConsolidated
    {
        public int ID { get; set; }
        public string DESCRIPTION { get; set; }
        public string PRIORITY { get; set; }
        public DateTime? SCHEDULED_START_DATE { get; set; }

        public DateTime? DUE_DATE { get; set; }

        public DateTime? ACTUAL_START_DATE  { get; set; }
        public DateTime? ACTUAL_END_DATE { get; set; }
        public int SCHEDULED_DURATION { get; set; }

        public int ACTUAL_DURATION { get; set; }
        public string STATUS { get; set; }

        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }

        public string AUDITOR_ID { get; set; }
        
        public List<string> AUDITESS_ID { get; set; }
        public List<string> SERVICE_AREA_ID { get; set; }

        public DateTime? ACTUAL_AUDIT_START_DATE { get; set; }
    }
}
