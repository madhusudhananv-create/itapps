using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_CHECKLIST_STATUS_MAPPING
    {
        public int ID { get; set; }
        public int AUDIT_ID { get; set; }
        public int? FINDINGS_ID { get; set; }
        public string FINDING_STATUS { get; set; }
        public int RESPONSIBLE { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }
        public int? KPI_DETAILS_ID { get; set; }

    }
}
