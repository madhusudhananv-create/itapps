using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_CONTROL_TEST_COUNT
    {
        public string PROCESS_TITLE { get; set; }
        public string OBJECTIVE_TITLE { get; set; }
        public string RISK_TITLE { get; set; }
        public string CONTROL_TITLE { get; set; }
        public string TEST_TITLE { get; set; }
        public int TEST_ID { get; set; }
        public string TEST_RESULT { get; set; }
        public string RESULT_DESCRIPTION { get; set; }
        public string AUTOMATION { get; set; }
    }
}
