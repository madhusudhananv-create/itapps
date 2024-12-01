using GAVS.AllocationSystem.Model.AllSys;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    [NotMapped]
    public class AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED :AUDIT_CHECKLIST_PROJECT_EXECUTION
    {   
        public string PROCESS_MODEL_DESCRIPTION { get; set; }
        public string PROCESS_AREA_DESCRIPTION { get; set; }
        public string PROCESS_DESCRIPTION { get; set; }
        public string SERVICE_AREA_NAME { get; set; }
        
        public int? WEIGHTAGE_ID { get; set; }

        public decimal? WEIGHTAGE_SCORE { get; set; }
        public string WEIGHTAGE_TITLE { get; set; }
        public List<string> AUDITEE_NAME { get; set; }
        public string LOOK_FOR { get; set; }

        public int CHECKLIST_STATUS_LIST_ID { get; set; }
        public string CHECKLIST_NAME { get; set; }

        public int CHECKLIST_ID { get; set; }

        public bool CORRECTIVE_ACTION_TRACKING { get; set; }
        public string STATUS_CATEGORY { get; set; }
        public bool IS_WEIGHTAGE_APPLICABLE { get; set; }
        public int? FINDINGSTYPE_ID { get; set; }

        public decimal MULTIPLIER { get; set; }

        public bool MAPPED_CHECKLIST { get; set; }

        public bool MATURITY_LEVEL { get; set; }

        public int MAPPED_PROCESS_MODEL { get; set; }
       

        public string MONTH_NM { get; set; }
        public int YEAR { get; set; }
        public List<AUDIT_CHECKLIST_STATUS_LIST_VALUES> CHECKLIST_STATUS_LIST_VALUES { get; set; }
        public List<AUDIT_CHECKLIST_PROJECT_FINDINGS> FINDINGS { get; set; } 
        public List<CHECKLIST_SAMPLE_AUDITED> CHECKLIST_SAMPLE_AUDITED { get; set; } = new List<CHECKLIST_SAMPLE_AUDITED>();
        public List<int> CC_EMP_LIST { get; set; }
        public List<int> TO_EMP_LIST { get; set; }
    }

    [NotMapped]
    public class AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED : AUDIT_CHECKLIST_EXECUTION_DETAILS
    {
        public string CUSTOMER_ID { get; set; }

        public string PROJECT_ID { get; set; }
        public string PROCESS_MODEL_DESCRIPTION { get; set; }
        public string PROCESS_AREA_DESCRIPTION { get; set; }
        public string PROCESS_DESCRIPTION { get; set; }
        public string SERVICE_AREA_NAME { get; set; }

        public int? WEIGHTAGE_ID { get; set; }

        public decimal? WEIGHTAGE_SCORE { get; set; }
        public string WEIGHTAGE_TITLE { get; set; }

        public decimal VERSION_ID { get; set; }
        public List<int> AUDITEE_NAME { get; set; }
        public string LOOK_FOR { get; set; }
        public string CHECKLIST_NAME { get; set; }

        public int CHECKLIST_ID { get; set; }

        public int STATUS_LIST_ID { get; set; }

        public bool CORRECTIVE_ACTION_TRACKING { get; set; }
        public bool IS_WEIGHTAGE_APPLICABLE { get; set; }
        public int? FINDINGSTYPE_ID { get; set; }

        public List<FINDINGSTYPE_VALUES> FINDINGSTYPE_VALUES { get; set; }

        public decimal MULTIPLIER { get; set; }

        public bool MAPPED_CHECKLIST { get; set; }

        public bool MATURITY_LEVEL { get; set; }

        public int MAPPED_PROCESS_MODEL { get; set; }
        public string MONTH_NM { get; set; }
        public int YEAR { get; set; }
        public List<AUDIT_CHECKLIST_PROJECT_FINDINGS> FINDINGS { get; set; }
        public List<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED> CHECKLIST_SAMPLE_AUDITED { get; set; } = new List<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED>();

        public DateTime CHECKLIST_EFFECTIVE_FROM { get; set; }
    }
    [NotMapped]
    public class FINDINGS
    {
        public int FINDINGS_ID { get; set; }
        public string FINDINGS_DESC { get; set; }
        public string FINDINGS_TYPE { get; set; }
        public string OFI_DESCRIPTION { get; set; }
        public string BEST_PRACTICE_DESCRIPTION { get; set; }
    }
    [NotMapped]
    public class CHECKLIST_SAMPLE_AUDITED
    { 
        public string EMP_ID { get; set; }
        public int TOTAL_SAMPLES_AUDITED { get; set; }
        public int SAMPLES_COMPLIED { get; set; }
        public int SAMPLES_NOTCOMPLIED { get; set; }
        public int PERCENTAGE { get; set; }
        public string COMMENTS { get; set; }
    }
}
