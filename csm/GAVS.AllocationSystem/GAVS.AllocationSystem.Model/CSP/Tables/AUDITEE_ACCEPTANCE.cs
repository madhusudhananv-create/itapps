using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDITEE_ACCEPTANCE : EntityBase
    {
        
        public int FINDING_ID { get; set; }
        public string STATUS { get; set; }
        public string REMARKS { get; set; }
         
        public string UNIQUE_ID { get; set; }

        public bool ISSUBMITTED { get; set; }
        [NotMapped]
        public int AUDIT_ID { get; set; }    
        
        [NotMapped]
        public bool IS_AUDITOR_ACCEPT { get; set; }
        [NotMapped]
        public bool DISABLE_CAPA { get; set; }


    }
}
