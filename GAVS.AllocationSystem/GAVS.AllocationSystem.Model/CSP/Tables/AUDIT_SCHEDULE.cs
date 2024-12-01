using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_SCHEDULE: EntityBase
    { 
        public string TITLE { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        [NotMapped]
        public List<int> SERVICE_AREA_ID { get; set; }
        public DateTime? SCHEDULED_DATE { get; set; }
        public int? SCHEDULED_DURATION { get; set; }
        public DateTime? ACTUAL_DATE { get; set; }
        //public int? ACTUAL_DURATION { get; set; }
        public string AUDITOR_EMP_ID { get; set; }
        [NotMapped]
        public List<string> AUDITEE_EMP_ID { get; set; }
        public string STATUS { get; set; }
        public string COMMENTS { get; set; } 
        public int? TASK_ID { get; set; }
    }
}
