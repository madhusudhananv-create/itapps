using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_FINDING_CAPA_IMPLEMENTATION : EntityBase
    {
       
        public int? FINDING_ID { get; set; }
        public string UNIQUE_ID { get; set; }
        public int? ROOT_CAUSE_ID { get; set; }
        public bool ISIMPLEMENTED { get; set; }
        public string STATUS { get; set; }
        public string REMARKS { get; set; }      
        public int? KPI_DETAILS_ID { get; set; }
        public int? CAPA_ID { get; set; }
        [NotMapped]
        public AUDIT_FINDINGS_CAPA CAPADATA { get; set; } = new AUDIT_FINDINGS_CAPA();
    }
}
