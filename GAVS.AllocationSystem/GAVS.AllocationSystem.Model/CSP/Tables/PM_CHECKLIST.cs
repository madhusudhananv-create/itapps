using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PM_CHECKLIST
    {
        public int ID { get; set; }
        public decimal VERSION { get; set; }
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }
        public DateTime EFFECTIVE_FROM { get; set; }
        public bool MATURITY_LEVEL { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }

        public bool IS_WEIGHTAGE_APPLICABLE { get; set; }

        public bool CORRECTIVE_ACTION_TRACKING { get; set; }
        public int PROCESS_MODEL_ID { get; set; }

        public int STATUS_LIST_ID { get; set; }

        public bool IS_APPROVED { get; set; }

        public int? FINDINGSTYPE_ID { get; set; }
        [NotMapped]
        public string UPDATED_NAME { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}
