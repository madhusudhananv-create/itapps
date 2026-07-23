using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROCESS_MODEL_AUDITOR_DATA
    {
        public int ID { get; set; }
        public string EMP_ID { get; set; }
        public string QUALIFICATION_STATUS { get; set; }
        public DateTime EFFECTIVE_FROM { get; set; }
        public string QUALIFIED_STANDARDS { get; set; }
        public bool ACTIVE_STATUS { get; set; }
        public DateTime? INACTIVE_FROM { get; set; }
        public DateTime? RETIRED_ON { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
    }
}
