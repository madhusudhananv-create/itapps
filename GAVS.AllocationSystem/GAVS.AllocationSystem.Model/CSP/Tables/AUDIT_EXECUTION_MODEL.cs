using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_EXECUTION_MODEL
    {
        [Key]
        public int ID { get; set; }
        public int AUDIT_EXECUTION_ID  {get;set;}
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string AUDIT_TITLE { get; set; }
        public DateTime AUDIT_START_DATE { get; set; }
        public DateTime AUDIT_END_DATE { get; set; }
        public string AUDIT_PLAN_REFERENCE { get; set; }
        public int AUDITOR_NAME { get; set; }
        public int TEST_ID { get; set; }
        public string TEST_RESULT { get; set; }
        public string STATUS_OF_CONTROL { get; set; }
        public string RESULT_DESCRIPTION { get; set; }
        public string FINDING_DESCRIPTION { get; set; }
        public string FINDING_TYPE { get; set; }
        public int IMPACTING_ATTRIBUTES_ID { get; set; }
        public string SEVERITY { get; set; }
        public string STATUS_OF_AUDIT { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
        [NotMapped]
        public bool ISEVALUATED { get; set; }
        [NotMapped]
        public List<string> IMPACTING_ATTRIBUTES { get; set; } = new List<string>();
        public List<string> AUDITEE_NAME { get; set; } = new List<string>();

    }
}
