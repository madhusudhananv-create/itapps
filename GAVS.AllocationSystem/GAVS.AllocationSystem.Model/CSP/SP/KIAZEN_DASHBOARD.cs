using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class KAIZEN_DASHBOARD
    {
        public int IDEAS_COUNT { get; set; }
        public int AUTOMATION_COMPLETED { get; set; }
        public int AUTOMATION_INPROGRESS { get; set; }
        public int INNOVATION_COMPLETED { get; set; }
        public int INNOVATION_INPROGRESS { get; set; }
        public int IMPROVEMENTS_COMPLETED { get; set; }
        public int IMPROVEMENTS_INPROGRESS { get; set; }
        public int? QUALITY { get; set; }
        public int? CYCLE_TIME { get; set; }
        public int? EFFORT { get; set; }
        public int? CUSTOMER_SAVINGS { get; set; }

    }
}
