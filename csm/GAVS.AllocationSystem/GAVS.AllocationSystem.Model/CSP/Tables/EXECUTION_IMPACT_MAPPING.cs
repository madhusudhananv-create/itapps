using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class EXECUTION_IMPACT_MAPPING
    {
        public int ID { get; set; }
        public int AUDIT_ID { get; set; }
        public int TEST_ID { get; set; }
        public string IMPACTING_ATTRIBUTES { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
    }
}
