using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{

    public class PROJECT_CUSTOMER_NPS_DATA : PROJECT_CSAT_DATA
    {
        public string PROJECT_NAME { get; set; }
        public string CUSTOMER_NAME { get; set; }
        public string CSAT_QUESTION_1 { get; set; }
        public string CSAT_QUESTION_2 { get; set; }
        public string CSAT_QUESTION_3 { get; set; }
        public string NPS_QUESTION { get; set; }
    }


    public class PROJECT_CSAT_DATA : iYearQuarter
    {

        public int? ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string CSM_EMP_ID { get; set; }
        public string DELIVERY_HEAD_EMP_ID { get; set; }
        public string RESPONDENT_NAME { get; set; }
        public DateTime? CSAT_RECIEVED_DATE { get; set; }
        public int? OVERALL_QUALITY_OF_DELIVERABLE { get; set; }
        public string OVERALL_QUALITY_OF_DELIVERABLE_REMARKS { get; set; }
        public int? ENABLING_SUCCESS { get; set; }
        public string ENABLING_SUCCESS_REMARKS { get; set; }
        public int? VALUE_ADDS { get; set; }
        public string VALUE_ADDS_REMARKS { get; set; }
        public string YEAR_QUARTER { get; set; }
        public int? MIN_SCORE { get; set; }
        public int? NPS_SCORE { get; set; }
        public string NPS_REMARKS { get; set; }
        public string FEEDBACK { get; set; }
        public string COMMENTS { get; set; }
    }

    public class CSSData
    {
        public string SURVEY_ID { get; set; }
        public string STATUS { get; set; }
        public string PROJECT_NAME { get; set; }
        public string CUSTOMER_NAME { get; set; }
        public int? ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string CSM_EMP_ID { get; set; }
        public string DELIVERY_HEAD_EMP_ID { get; set; }
        public string RESPONDENT_NAME { get; set; }
        public DateTime? CSAT_RECIEVED_DATE { get; set; }
        public string YEAR_QUARTER { get; set; }
        public string YEAR_MONTH { get; set; }
        public int? MIN_SCORE { get; set; }
        public int? NPS_SCORE { get; set; }
        public string NPS_REMARKS { get; set; }
        public string FEEDBACK { get; set; }
        public string COMMENTS { get; set; }
        public int? Q1 { get; set; }
        public int? Q2 { get; set; }
        public int? Q3 { get; set; }
        public int? Q4 { get; set; }
        public int? Q5 { get; set; }
        public int? Q6 { get; set; }
        public int? Q7 { get; set; }
        public int? Q8 { get; set; }
        public int? Q9 { get; set; }
        public int? Q10 { get; set; }
        public int? Q11 { get; set; }
        public int? Q12 { get; set; }
        public int? Q13 { get; set; }
        public int? Q14 { get; set; }
        public int? Q15 { get; set; }
    }

    public class PROJECT_CSAT_DATA_EXTENDED
    {

        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string RESPONDENT_NAME { get; set; }
        public string DISPLAY_TEXT { get; set; }
        public int? MIN_SCORE { get; set; }
        public int? NPS_SCORE { get; set; }
        public int? CSS_SCORE { get; set; }
        public int? ACTION_PLAN_SUBMITTED { get; set; }
        public int? ACTION_PLAN_NOT_SUBMITTED { get; set; }
        public string URL { get; set; }
        public string ActionplanURL { get; set; }

    }
}
