using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CSS_QUESTION_MASTER: EntityBase
    {
         
        public int MODEL_ID { get; set; }
        public string QUESTION_CATEGORY { get; set; }
        public string QUESTION { get; set; }
        public DateTime EFFECTIVE_FROM { get; set; }
         
        public string QUESTION_DETAIL { get; set; }

        public int? RATING_SCALE { get; set; }
        public string RATING_PARAM { get; set; }

        public string PARAM_CATEGORY { get; set; }

        public bool? TRIGGER_RCA { get; set; }
    }
}
