using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_FINDING_STAGES_MAPPING : EntityBase
    {
        public int? FINDING_ID { get; set; }
        public int STAGE_ID { get; set; }
        public string STAGE_STATUS { get; set; }
        public DateTime STATUS_DATE { get; set; }
        public bool ISCOMPLETE { get; set; }
        public int? KPI_DETAILS_ID { get; set; }
    }
}
