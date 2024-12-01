using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class Failure_Mode_Master : EntityBase
    {
       
        public int FMEA_TYPE_ID { get; set; }

        public int SERVICE_AREA_ID { get; set; }
        public int PROCESS_ID { get; set; }
        public int SERVICE_LEVEL_IDENTIFIER_ID { get; set; }
        public int TASK_ID { get; set; }

        public string FUNCTION_ACTIVITIES { get; set; }
        public string POTENTIAL_FAILURE_MODE { get; set; }
        public string POTENTIAL_FAILURE_EFFECT { get; set; }
        public int POTENTIAL_CAUSE_FACTOR { get; set; }
        public string POTENTIAL_CAUSE { get; set; }
        public string RECOMMENDED_DETECTIVE_CONTROL { get; set; }
        public string RECOMMENDED_PREVENTIVE_CONTROL { get; set; }
        public string STATUS { get; set; }

    }
}
