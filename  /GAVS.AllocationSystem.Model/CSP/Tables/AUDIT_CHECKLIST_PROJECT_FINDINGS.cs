using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_CHECKLIST_PROJECT_FINDINGS : EntityBase
    {
        public int ID { get; set; }
        public int AUDIT_ID { get; set; }
        public int APPLICABLE_QUESTIONS { get; set; }
        public string FINDING_TYPE { get; set; }
        public string FINDING_DESCRIPTION { get; set; }
        public string BEST_PRACTICE_DESCRIPTION { get; set; }
        public string OFI_DESCRIPTION { get; set; }
        public int SERVICE_AREA_ID { get; set; }
        public int PROCESS_ID { get; set; }

        public int PROCESS_MODEL_ID { get; set; }
        public int PROCESS_AREA_ID { get; set; }

        public bool ISSUBMITTED { get; set; }
        [NotMapped]
        public List<string> STAGE_COLORS { get; set; }
        [NotMapped]
        public string FINDING_CATEGORY { get; set; }

        [NotMapped]
        public string CURRENT_STATUS { get; set; }

        [NotMapped]

        public string GO_CATEGORY { get; set; }
    }

    public class AUDIT_CHECKLIST_PROJECT_FINDINGS_VM
    {
        public int ID { get; set; }
        public int AUDIT_ID { get; set; }
        public int APPLICABLE_QUESTIONS { get; set; }
        public string FINDING_TYPE { get; set; }
        public string FINDING_DESCRIPTION { get; set; }
        public string BEST_PRACTICE_DESCRIPTION { get; set; }
        public string OFI_DESCRIPTION { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }

        public int SERVICE_AREA_ID { get; set; }
        public int PROCESS_ID { get; set; }

        public int PROCESS_MODEL_ID { get; set; }
        public int PROCESS_AREA_ID { get; set; }

        public bool ISSUBMITTED { get; set; }
        
        public string CURRENT_STATUS { get; set; }
        public string FINDINGTYPE_CATEGORY { get; set; }
        public string STATUS { get; set; }
        public bool? ISCOMPLETE { get; set; }
    }
}
