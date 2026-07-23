using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_CHECKLIST_PROJECT_EXECUTION
    {
        [Key]
        public int ID { get; set; }
        public int AUDIT_ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public DateTime? PLANNED_AUDIT_START_DATE { get; set; }
        public DateTime? PLANNED_AUDIT_END_DATE { get; set; }
        public DateTime? ACTUAL_AUDIT_START_DATE { get; set; }
        public DateTime? ACTUAL_AUDIT_END_DATE { get; set; }
        public int? AUDIT_PLANNED_HOURS { get; set; }
        public string AUDIT_SCOPE { get; set; }
        public int? AUDIT_ACTUAL_HOURS { get; set; }
        public string AUDIT_TITLE { get; set; }
        public string AUDITOR_NAME { get; set; }
        public int APPLICABLE_QUESTIONS { get; set; }
        public string STATUS { get; set; }
        public bool ISSUBMITTED { get; set; }
        public decimal VERSIONID { get; set; }
        public string NOTES { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }

        public int SERVICE_AREA_ID { get; set; }
        public int PROCESS_ID { get; set; }

        public int PROCESS_MODEL_ID { get; set; }

        public decimal SCORE { get; set; }
        public decimal UPDATED_SCORE { get; set; }

        public decimal? MAX_SCORE { get; set; }
        public string CURRENT_STATUS { get; set; }

        //   public int CHECKLIST_ID { get; set; }
        public int PROCESS_AREA_ID { get; set; }

    }
}
