using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class CUSTOMER_CAPA_APPROVAL : EntityBase
    {
		public int CAPA_ID { get; set; }
		public int? STATUS_ID { get; set; }
		public string REMARKS { get; set; }
        
        [NotMapped]
        public AUDIT_FINDINGS_CAPA CAPADATA { get; set; } = new AUDIT_FINDINGS_CAPA();
    }
}
