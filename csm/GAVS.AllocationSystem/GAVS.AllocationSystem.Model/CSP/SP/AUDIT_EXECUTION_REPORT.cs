using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_EXECUTION_REPORT
    {
        public string MODEL_DESC { get; set; }
        public string OBJECTIVE_DESC { get; set; }
        public string RISK_DESC { get; set; }
        public string CONT_DESC { get; set; }
        public string TEST_DESC { get; set; }
        public string RESULT { get; set; }
        public string RESULT_DESC { get; set; }
    }

    public class PROCESS_MODEL_SUMMARY
    {
        public string PROCESS_MODEL_TITLE { get; set; }
        public int TEST_ID { get;  set;}
        public string TEST_DESCRIPTION { get; set; }
        public string PROCESS_TITLE { get; set; }
        public string OBJECTIVE_TITLE { get; set; }
        public string RISK_TITLE { get; set; }
        public string CONTROL_TITLE { get; set; }
        public string TEST_TITLE { get; set; }
        public string TEST_RESULT { get; set; }
        public string RESULT_DESCRIPTION { get; set; }
        public string AUTOMATION { get; set; }
    }

    public class TEST_REPORT_SUMMARY
    {
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }
        public string TEST_RESULT { get; set; }

        public string OBJECTIVE_TITLE { get; set; }
        public string RISK_TITLE { get; set; }
        public string CONTROL_TITLE { get; set; }
    }

}
