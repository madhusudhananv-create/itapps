using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_CHECKLIST_EXECUTION_SUMMARY : EntityBase
    {
        
        [Key]
        public int ID { get; set; }
        public int ASSESSMENT_ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }

        public int CHECKLIST_ID { get; set; }
        public DateTime? PLANNED_AUDIT_START_DATE { get; set; }
        public DateTime? PLANNED_AUDIT_END_DATE { get; set; }
        public DateTime? ACTUAL_AUDIT_START_DATE { get; set; }
        public DateTime? ACTUAL_AUDIT_END_DATE { get; set; }
        public int? AUDIT_PLANNED_HOURS { get; set; }
        public int? AUDIT_ACTUAL_HOURS { get; set; }
        public string AUDIT_TITLE { get; set; }
        public string AUDITOR_ID { get; set; }
        public decimal VERSION_ID { get; set; }
        public decimal? SCORE { get; set; }
        public decimal? PERCENTAGE_SCORE { get; set; }
        public bool? MAIL_SENT { get; set; }
        public int? MATURITY_LEVEL_ID { get; set; }
        public bool ISSUBMITTED { get; set; }
        public object LEVEL_TITLE { get; set; }
        public decimal TOTAL_SCORE;
        public decimal? UPDATED_SCORE { get; set; }
        public decimal? UPDATED_PERCENTAGE_SCORE { get; set; }


        [NotMapped]
        public List<string> AUDITEE_LIST { get; set; }
        [NotMapped]
        public List<string> CC_LIST { get; set; }
        [NotMapped]
        public List<string> TO_LIST { get; set; }
        

    }
}
