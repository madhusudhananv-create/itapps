using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDITEE_ACCEPTANCE
    {
        public int ID { get; set; }
        public int FINDING_ID { get; set; }
        public string STATUS { get; set; }
        public string REMARKS { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
        public string UNIQUE_ID { get; set; }

        public bool ISSUBMITTED { get; set; }
        [NotMapped]
        public int AUDIT_ID { get; set; }


    }
}
