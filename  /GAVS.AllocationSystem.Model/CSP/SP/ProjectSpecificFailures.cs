using GAVS.AllocationSystem.Model.CSP.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class ProjectSpecificFailures 
    {
        public int ID { get; set; }
        public int? FMEA_TYPE_ID { get; set; }

        public int? SERVICE_AREA_ID { get; set; }
        public int? PROCESS_ID { get; set; }
        public int? SERVICE_LEVEL_IDENTIFIER_ID { get; set; }
        public int? TASK_ID { get; set; }

        public string FUNCTION_ACTIVITIES { get; set; }
        public string POTENTIAL_FAILURE_MODE { get; set; }
        public string POTENTIAL_FAILURE_EFFECT { get; set; }
        public int? POTENTIAL_CAUSE_FACTOR { get; set; }
        public string POTENTIAL_CAUSE { get; set; }

        public int? MAPPING_ID { get; set; }
        public int? FAILURE_MODE_ID { get; set; }
        public string PROJECT_ID { get; set; }

        public int? RF_OCCURRENCE_ID { get; set; }

        public int? RF_SEVERITY_ID { get; set; }

        public int? RF_DETECTION_ID { get; set; }

        public string SEVERITY_RATING { get; set; }
        public string OCCURENCE_RATING { get; set; }
        public string DETECTION_RATING { get; set; }
        public decimal? RPN { get; set; }
        public string CURRENT_DETECTION_CONTROL { get; set; }
        public string CURRENT_PREVENTIVE_CONTROL { get; set; }

        public string RECOMMENDED_DETECTIVE_CONTROL { get; set; }

        public string RECOMMENDED_PREVENTIVE_CONTROL { get; set; }

        public int? RESPONSIBLE { get; set; }

        public DateTime? TARGET_DATE { get; set; }

        public bool? ISAPPROVED { get; set; }
        public bool? ISAPPLICABLE { get; set; }

        public bool?  APPROVED { get; set; }
    }
}
