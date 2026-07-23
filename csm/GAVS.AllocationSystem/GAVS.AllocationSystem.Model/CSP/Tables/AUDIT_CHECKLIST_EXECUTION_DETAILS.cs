using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_CHECKLIST_EXECUTION_DETAILS : EntityBase
    {
        [Key]
        public int ID { get; set; }
        public int ASSESSMENT_ID { get; set; }
        //public int AUDIT_CHECKLIST_EXECUTION_SUMMARY_ID { get; set; }
        public int PM_CHECKLIST_QUESTION_ID { get; set; }
        public int STATUS_VALUE_ID { get; set; }
        public string STATUS_CATEGORY { get; set; }
        public bool ISSUBMITTED { get; set; }
        public string NOTES { get; set; }
        public int SERVICE_AREA_ID { get; set; }
        public int PROCESS_ID { get; set; }
        public int PROCESS_MODEL_ID { get; set; }
        public int PROCESS_AREA_ID { get; set; }
        public decimal SCORE { get; set; }
        public decimal UPDATED_SCORE { get; set; }
        public decimal MAX_SCORE { get; set; }
        public string STATUS { get; set; }
    }
}
