using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_FINDING_CAPA_REVIEW : EntityBase
    {       
        public int? FINDING_ID { get; set; }
        public string UNIQUE_ID { get; set; }
        public int? ROOT_CAUSE_ID { get; set; }
        public bool? ISAPPROVED { get; set; }
        public bool? ISREJECTED { get; set; }
        public string STATUS { get; set; }
        public string REMARKS { get; set; }      
        public bool ISSUBMITTED { get; set; }
        public int? KPI_DETAILS_ID { get; set; }
        public int? CAPA_ID { get; set; }
    }
}
