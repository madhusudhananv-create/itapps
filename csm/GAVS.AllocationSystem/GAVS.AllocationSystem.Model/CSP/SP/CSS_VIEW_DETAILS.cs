using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    public class CSS_VIEW_DETAILS
    {
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string CONTACT_NAME { get; set; }
        public string YEAR_QUARTER { get; set; }
        public string RATING_QUARTER { get; set; }      
        public string SURVEY_STATUS { get; set; }
        public int? BATCH_CUSTOMER_ID { get; set; }
        public int? BATCH_CUSTOMER_MONTHLIY_ID { get; set; }
        public string DISPLAY_TEXT { get; set; }
        public string URL { get; set; }
        public string SURVEY_FEEDBACK_URL_FOR_CUSTOMER { get; set; }
        
    }

    public class CSS_VIEW_DETAILS_MONTHLY : CSS_VIEW_DETAILS
    {
        public string YEAR_MONTH { get; set; }
    }

    public class CSS_QUESTION_RATINGS
    {
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string CONTACT_NAME { get; set; }
        public string YEAR_QUARTER { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string QUESTION { get; set; }
        public int? RATING { get; set; }
    }

    public class CSS_QUESTION_RATINGS_MONTHLY : CSS_QUESTION_RATINGS
    {
        public string YEAR_MONTH { get; set; }

        public int QUESTION_MODEL_ID { get; set; }
    }
}
