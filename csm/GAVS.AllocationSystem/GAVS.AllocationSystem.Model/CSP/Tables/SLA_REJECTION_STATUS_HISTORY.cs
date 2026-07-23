using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class SLA_REJECTION_STATUS_HISTORY : EntityBase
    {
        public int REJECTION_ID { get; set; }      
        public int STATUS_ID { get; set; }
        public string COMMENT { get; set; }
        public string USER_ID { get; set; }

        public DateTime STATUS_DATE { get; set; }
    }
}
