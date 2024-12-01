using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED
    {
        public int ID { get; set; }
        public int AUDIT_ID { get; set; }
        public int APPLICABLE_QUESTIONS { get; set; }
        public string EMP_ID { get; set; }
        public int TOTAL_SAMPLES_AUDITED { get; set; }
        public int SAMPLES_COMPLIED { get; set; }
        public int SAMPLES_NOTCOMPLIED { get; set; }
        public int PERCENTAGE { get; set; }
        public string COMMENTS { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
        public int SERVICE_AREA_ID { get; set; }

        public int PROCESS_ID { get; set; }

        public int PROCESS_MODEL_ID { get; set; }

        public int PROCESS_AREA_ID { get; set; }
    }
}
