using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROCESS_MODEL_QUESTIONS
    {
        public int ID { get; set; }
        public decimal VERSIONID { get; set; }
        [NotMapped]
        public int PROCESS_MODEL_ID { get; set; }
        [NotMapped]
        public int SERVICE_AREA_ID { get; set; }
        [NotMapped]
        public int PROCESS_ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set;}
        public string DESCRIPTION { get; set; }
        public DateTime EFFECTIVE_FROM { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
        public bool ISSUBMITTED { get; set; }
        [NotMapped]
        public List<AUDIT_CHECKLIST_QUESTIONS> QUESTIONS_MODEL { get; set; } = new List<AUDIT_CHECKLIST_QUESTIONS>();
    }
}
