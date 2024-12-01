using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class PROCESS_MODEL_AUDITOR
    {
        public int ID { get; set; }
        public string EMP_ID { get; set; }
        public bool ACTIVE_STATUS { get; set; }
        public DateTime? RETIRED_ON { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
    }
}
