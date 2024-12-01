using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PM_PROCESS_QUESTIONS_MAPPING : EntityBase
    {
       
        public int QUESTION_ID { get; set; }
        public int PROCESS_ID { get; set; }
       
        public int CHECKLIST_ID { get; set; }

        public int SERVICE_AREA_ID { get; set; }

        public int PROCESS_AREA_ID { get; set; }
        public decimal? DISPLAY_ORDER { get; set; }
    }

    [NotMapped]
    public class PM_PROCESS_QUESTIONS_MAPPING_EXT : PM_PROCESS_QUESTIONS_MAPPING
    {
        public int SERVICE_AREA_ID { get; set; }
        public int PROCESS_AREA_ID { get; set; }
        public string SERVICE_AREA_NAME { get; set; }
        public string PROCESS_AREA_NAME { get; set; }

        public string PROCESS_NAME { get; set; }
        public string QUESTION { get; set; }
        public bool? IS_WEIGHTAGE_APPLICABLE { get; set; }

        public bool? IS_MATURITY_APPLICABLE { get; set; }

        public string WEIGHTAGE { get; set; }
        public decimal? WEIGHTAGE_SCORE { get; set; }
        public string CATEGORY { get; set; }
        public string MATURITY_LEVEL { get; set; }
    }
}
