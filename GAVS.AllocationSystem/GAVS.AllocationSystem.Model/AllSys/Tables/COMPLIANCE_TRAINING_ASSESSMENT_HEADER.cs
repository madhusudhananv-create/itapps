using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class COMPLIANCE_TRAINING_ASSESSMENT_HEADER
    {
        public int ID { get; set; }
        public string COMPLIANCE_TRAINING_TITLE { get; set; }
        public int TOTAL_QUESTIONS { get; set; }
        public int TOTAL_MARKS { get; set; }
        public int PASS_PERCENTAGE { get; set; }
        public DateTime COMPLIANCE_PERIOD_START_DATE { get; set; }
        public DateTime COMPLIANCE_PERIOD_END_DATE { get; set; }
    }
}
