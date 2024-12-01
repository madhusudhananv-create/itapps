using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys.SP
{
    public class AuditorQualityStandardSummary
    {
        public string EMP_ID { get; set; }

        public string FRST_NM { get; set; }

        public string PROCESS_MODEL_ID { get; set; }

        public string PROCESS_MODEL { get; set; }

        public DateTime? EFFECTIVE_FROM { get; set; }
    }
}
