using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class FAILURE_ASSESSMENT : EntityBase
    {
        public string PROJECT_ID { get; set; }
        public int PROJECT_FAILURES_MAPPING_ID { get; set; }

        public int? FUTURE_RF_OCCURRENCE_ID { get; set; }

        public int? FUTURE_RF_SEVERITY_ID { get; set; }

        public int? FUTURE_RF_DETECTION_ID { get; set; }
        public decimal? FUTURE_RPN { get; set; }

        public DateTime? TARGET_DATE { get; set; }

        public String ACTION_TAKEN { get; set; }

        public String ACTION_TAKEN_BY { get; set; }
        public DateTime? ACTION_TAKEN_ON { get; set; }
    }
}
