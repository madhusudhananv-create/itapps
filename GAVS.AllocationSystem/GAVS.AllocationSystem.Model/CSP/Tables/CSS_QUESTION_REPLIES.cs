using System;
using System.Activities.Expressions;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CSS_QUESTION_REPLIES
    {
        public int ID { get; set; }
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
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }

        [NotMapped]
        public bool canskip { get; set; }

        [NotMapped]
        public int SEQUENCE { get; set; }
        [NotMapped]
        public string   RATING_PARAM{ get; set; }
    }
}
