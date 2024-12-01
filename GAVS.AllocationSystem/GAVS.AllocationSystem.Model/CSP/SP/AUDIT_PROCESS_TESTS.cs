using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_PROCESS_TESTS
    {
        public string PROCESS_NAME { get; set; }
        public string OBJECTIVE_NAME { get; set; }
        public string RISK { get; set; }
        public string CONTROL_NAME { get; set; }
        public int TEST_ID { get; set; }
        public string TEST_NAME { get; set; }
        public string TEST_DESCRIPTION { get; set; }
    }

   public class TESTS_VIEW_MODEL
    {
        public int ID { get; set; }
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }

        public string STATUS { get; set; }

        public string SERVICE_AREA { get; set; }
        public string PROCESS_MODEL { get; set; }
         public string PROCESS_AREA { get; set; }
        public string PROCESS { get; set; }
    }
}
