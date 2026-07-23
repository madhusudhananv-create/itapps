using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_MANAGEMENT_ROOTCAUSES
    {
        public int ID { get; set; }
        public int CAUSE_ID { get; set; }
        public string ROOT_CAUSE { get; set; }
        public bool ISACTIVE { get; set; }
    }
}
