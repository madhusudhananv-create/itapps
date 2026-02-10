using GAVS.AllocationSystem.Model.Base;
using System;
using System.Activities.Expressions;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CSS_QUESTION_REPLIES : EntityBase
    {
       
        public int BATCH_CUSTOMER_ID { get; set; }
        public int BATCH_CUSTOMER_MONTHLY_ID { get; set; }
        public string SURVEY_ID { get; set; }
        public int QUESTION_ID { get; set; }
        public string QUESTION_CATEGORY { get; set; }
        public string QUESTION { get; set; }
        [NotMapped]
        public string QUESTION_DETAIL { get; set; }
        public int RATING { get; set; }
        public int? RATING_SCALE { get; set; }
        public string RATING_DESCRIPTION { get; set; } = string.Empty;
        public string COMMENTS { get; set; }
 

        [NotMapped]
        public bool canskip { get; set; }

        [NotMapped]
        public int SEQUENCE { get; set; }
        
        [NotMapped]
        public string  RATING_PARAM{ get; set; }

        
        public string PERSPECTIVE { get; set; }

        public string QUALITATIVE_CATEGORY { get; set; }

        public string QUALITATIVE_STATUS { get; set; }
        public string QUALITATIVE_REMARKS { get; set; }

    }
}
