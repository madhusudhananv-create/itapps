using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GAVS.AllocationSystem.Model.Base;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PM_CHECKLIST : EntityBase
    {
     
        public decimal VERSION { get; set; }
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }
        public DateTime EFFECTIVE_FROM { get; set; }
        public bool MATURITY_LEVEL { get; set; }
      
        public bool IS_WEIGHTAGE_APPLICABLE { get; set; }

        public bool CORRECTIVE_ACTION_TRACKING { get; set; }
        public int PROCESS_MODEL_ID { get; set; }

        public int STATUS_LIST_ID { get; set; }

        public bool IS_APPROVED { get; set; }

        public int? FINDINGSTYPE_ID { get; set; }
        [NotMapped]
        public string UPDATED_NAME { get; set; }

        public bool IS_MERGED { get; set; }
        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}
