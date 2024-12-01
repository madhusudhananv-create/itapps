using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_FAILURES_MAPPING : EntityBase
    {
        public int FAILURE_MODE_ID { get; set; }
        public string PROJECT_ID { get; set; }

        public int? RF_OCCURRENCE_ID { get; set; }

        public int? RF_SEVERITY_ID { get; set; }

        public int? RF_DETECTION_ID { get; set; }
        public decimal? RPN { get; set; }
        public string CURRENT_DETECTION_CONTROL { get; set; }
        public string CURRENT_PREVENTIVE_CONTROL { get; set; }

        public string RECOMMENDED_DETECTIVE_CONTROL { get; set; }

        public string RECOMMENDED_PREVENTIVE_CONTROL { get; set; }

        public string POTENTIAL_CAUSE_FACTOR { get; set; }

        public string POTENTIAL_EFFECT_OF_FAILURE { get; set; }
        public string POTENTIAL_CAUSE { get; set; }

        public int? RESPONSIBLE { get; set; }


        public bool? ISAPPROVED { get; set; }
        public bool? ISAPPLICABLE { get; set; }
    }
}
