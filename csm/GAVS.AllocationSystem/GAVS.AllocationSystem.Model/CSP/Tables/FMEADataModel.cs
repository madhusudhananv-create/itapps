using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class FMEADataModel
    {
        public int ID { get; set; }
        public int FMEA_TYPE_ID { get; set; }
        public int SERVICE_AREA_ID { get; set; }

        public string SERVICE_TOWER { get; set; }
        public int PROCESS_ID { get; set; }

        public string PROCESS { get; set; }

        public int SERVICE_LEVEL_IDENTIFIER_ID { get; set; }

        public string SERVICE_LEVEL { get; set; }
        public int TASK_ID { get; set; }

        public string TASK { get; set; }

        public string TASK_CATEGORY { get; set; }

        public string FUNCTION_ACTIVITIES { get; set; }
        public string POTENTIAL_FAILURE_MODE { get; set; }
        public string POTENTIAL_FAILURE_EFFECT { get; set; }
        public int POTENTIAL_CAUSE_FACTOR { get; set; }
        public string POTENTIAL_CAUSE_FACTOR_OPTIONS { get; set; }
        public string POTENTIAL_CAUSE { get; set; }
        public string RECOMMENDED_DETECTIVE_CONTROL { get; set; }
        public string RECOMMENDED_PREVENTIVE_CONTROL { get; set; }
        public int FMEA_STATUS { get; set; }

        public string STATUS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean isactive { get; set; }

    }
}
