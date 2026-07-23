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
    public class AUDIT_FINDINGS_CAPA : EntityBase
    {
        public int? FINDING_ID { get; set; }
        public int? ROOT_CAUSE_ID { get; set; }
        public string UNIQUE_ID { get; set; }
        public bool ISROOTCAUSE { get; set; }
        public string CORRECTION { get; set; }
        public string CORRECTIVE_ACTION_PLAN { get; set; }
        public DateTime? CAP_TARGET_DATE { get; set; }
        public string RESPONSIBLE { get; set; }
        public string PLAN_FOR_EFFECTIVE_CAP { get; set; }
        public DateTime? PLAN_TARGET_DATE { get; set; }
        public string NOTES { get; set; }
        public string STATUS { get; set; }      
        public bool ISSUBMITTED { get; set; }
        public bool ISSAVED { get; set; }     
        public int? KPI_DETAILS_ID { get; set; }

        public int? ACTION_ITEM_ID { get; set; }

        [NotMapped]
        public string CAUSE { get; set; }
        [NotMapped]
        public string ROOT_CAUSE { get; set; }
        public int?  CAUSE_ID { get; set; }
        public string ROOTCAUSE { get; set; }

        public string ROOTCAUSE_OTHER { get; set; }

    }

}
