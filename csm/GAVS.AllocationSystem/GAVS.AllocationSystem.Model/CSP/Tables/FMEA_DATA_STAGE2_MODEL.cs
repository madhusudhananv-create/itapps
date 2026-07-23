using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class FMEA_DATA_STAGE2_MODEL
    {
        public int ID { get; set; }
        public int FMEA_DATA_ID { get; set; }

        public int RF_OCCURRENCE_ID { get; set; }

        public int RF_SEVERITY_ID { get; set; }

        public int RF_DETECTION_ID { get; set; }

        public decimal RPN { get; set; }

        public string CURRENT_DETECTION_CONTROL { get; set; }

        public string CURRENT_PREVENTIVE_CONTROL { get; set; }

        public int RESPONSIBLE { get; set; }

        public DateTime TARGET_DATE { get; set; }

        public bool ISAPPLICABLE { get; set; }
        public bool ISAPPROVE { get; set; }
        public bool ISREJECT { get; set; }

        public string RECOMMENDED_DETECTIVE_CONTROL_STAGE2 { get; set; }

        public string RECOMMENDED_PREVENTIVE_CONTROL_STAGE2 { get; set; }

        public int? FMEA_STATUS_STAGE2 { get; set; }

        public string REJECT_COMMENTS_STAGE2 { get; set; }

        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }

    }

    public class FMEA_DATA_STAGE3_MODEL
    {
        public int ID { get; set; }
        public int FMEA_DATA_ID { get; set; }

        public int? FUTURE_RF_OCCURRENCE_ID { get; set; }

        public int? FUTURE_RF_SEVERITY_ID { get; set; }

        public int? FUTURE_RF_DETECTION_ID { get; set; }

        public decimal? FUTURE_RPN { get; set; }

        public int? FUTURE_FAILURE_CATEGORY_ID { get; set; }

        public string FUTURE_ACTION_TAKEN { get; set; }        

        public int? FUTURE_ACTION_TAKEN_BY { get; set; }

        public DateTime? FUTURE_ACTION_TAKEN_ON { get; set; }

        public int? FMEA_STATUS_STAGE3 { get; set; }

        public string REJECT_COMMENTS_STAGE3 { get; set; }


        
    }
}
