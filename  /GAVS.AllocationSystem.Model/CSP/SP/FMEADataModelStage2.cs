using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    public class GET_FMEA_DATA_STAGE2
    {
        public int ID { get; set; }
        public int FMEA_DATA_ID { get; set; }

        public string FUNCTION_ACTIVITIES { get; set; }

        public int? RF_OCCURRENCE_ID { get; set; }

        public string OCCURRENCE_CRITERIA { get; set; }

        public int? OCCURRENCE_RATING { get; set; }

        public string OCCURRENCE_RATING_DEFINITION { get; set; }

        public string OCCURRENCE_DEFINITION { get; set; }

        public int? RF_SEVERITY_ID { get; set; }

        public string SEVERITY_CRITERIA { get; set; }

        public int? SEVERITY_RATING { get; set; }

        public string SEVERITY_RATING_DEFINITION { get; set; }

        public string SEVERITY_DEFINITION { get; set; }

        public int? RF_DETECTION_ID { get; set; }

        public string DETECTION_CRITERIA { get; set; }

        public int? DETECTION_RATING { get; set; }

        public string DETECTION_RATING_DEFINITION { get; set; }

        public string DETECTION_DEFINITION { get; set; }

        public decimal? RPN { get; set; }

        public string CURRENT_DETECTION_CONTROL { get; set; }

        public string CURRENT_PREVENTIVE_CONTROL { get; set; }

        public int RESPONSIBLE { get; set; }

        public DateTime TARGET_DATE { get; set; }

        public bool ISAPPLICABLE { get; set; }

        public string POTENTIAL_FAILURE_MODE { get; set; }
        public string POTENTIAL_FAILURE_EFFECT { get; set; }
        public string POTENTIAL_CAUSE_FACTOR { get; set; }        
        public string POTENTIAL_CAUSE { get; set; }

        public string RECOMMENDED_DETECTIVE_CONTROL { get; set; }
        public string RECOMMENDED_PREVENTIVE_CONTROL { get; set; }
        public string RECOMMENDED_DETECTIVE_CONTROL_STAGE2 { get; set; }
        public string RECOMMENDED_PREVENTIVE_CONTROL_STAGE2 { get; set; }
        public int? FMEA_STATUS_STAGE2 { get; set; }
        public string REJECT_COMMENTS_STAGE2 { get; set; }

        public bool? ISAPPROVE { get; set; }

        public bool? ISREJECT { get; set; }

    }

    public class GET_FMEA_DATA_STAGE3
    {
        public int ID { get; set; }
        public int FMEA_DATA_ID { get; set; }

        public string FUNCTION_ACTIVITIES { get; set; }

        public int? FUTURE_RF_OCCURRENCE_ID { get; set; }

        public string FUTURE_OCCURRENCE_CRITERIA { get; set; }

        public int? FUTURE_OCCURRENCE_RATING { get; set; }

        public string FUTURE_OCCURRENCE_RATING_DEFINITION { get; set; }

        public string FUTURE_OCCURRENCE_DEFINITION { get; set; }

        public int? FUTURE_RF_SEVERITY_ID { get; set; }

        public string FUTURE_SEVERITY_CRITERIA { get; set; }

        public int? FUTURE_SEVERITY_RATING { get; set; }

        public string FUTURE_SEVERITY_RATING_DEFINITION { get; set; }

        public string FUTURE_SEVERITY_DEFINITION { get; set; }

        public int? FUTURE_RF_DETECTION_ID { get; set; }

        public string FUTURE_DETECTION_CRITERIA { get; set; }

        public int? FUTURE_DETECTION_RATING { get; set; }

        public string FUTURE_DETECTION_RATING_DEFINITION { get; set; }

        public string FUTURE_DETECTION_DEFINITION { get; set; }

        public decimal? FUTURE_RPN { get; set; }
        public string FUTURE_ACTION_TAKEN { get; set; }
        public int? FUTURE_ACTION_TAKEN_BY { get; set; }
        public DateTime? FUTURE_ACTION_TAKEN_ON { get; set; }        
        public int? FUTURE_FAILURE_CATEGORY_ID { get; set; }

        public string POTENTIAL_FAILURE_MODE { get; set; }
        public string POTENTIAL_FAILURE_EFFECT { get; set; }
        public string POTENTIAL_CAUSE_FACTOR { get; set; }
        public string POTENTIAL_CAUSE { get; set; }

        public string RECOMMENDED_DETECTIVE_CONTROL { get; set; }
        public string RECOMMENDED_PREVENTIVE_CONTROL { get; set; }
        public string RECOMMENDED_DETECTIVE_CONTROL_STAGE2 { get; set; }
        public string RECOMMENDED_PREVENTIVE_CONTROL_STAGE2 { get; set; }

        public int? FMEA_STATUS_STAGE3 { get; set; }
        public string REJECT_COMMENTS_STAGE3 { get; set; }

        public int? RF_OCCURRENCE_ID { get; set; }
        public int? RF_SEVERITY_ID { get; set; }
        public int? RF_DETECTION_ID { get; set; }




    }
}
