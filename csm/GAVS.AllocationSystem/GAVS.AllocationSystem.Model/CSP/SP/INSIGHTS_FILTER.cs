using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class INSIGHTS_FILTER
    {
       // public ANALYSIS_TOTAL TOTAL_COUNT { get; set; }
        public string CRITERIA_FILTER_VALUE { get; set; }
        public string CRITERIA_FILTER_CONDITION { get; set; }
        public int CRITERIA_LENGTH { get; set; }
    }
    public class ANALYSIS_TOTAL
    {
        public int COMPLIANCE_TOTAL { get; set; }
        public int COMPLIANCE { get; set; }
        public int NON_COMPLIANCE { get; set; }
    }
}
