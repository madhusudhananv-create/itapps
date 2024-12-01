using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CSAT_SURVEY_DATA
    {
        public int ID { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string CSAT_FREQUENCY { get; set; }
        public string CSAT_MONTH { get; set; }
        public int CSAT_YEAR { get; set; }
        public string CLIENT_EMAIL_ID { get; set; }
        public string CLIENT_NAME { get; set; }
        public string STATUS { get; set; }
        public DateTime? INITIATED_DATE { get; set; }
        public DateTime? SUBMISSION_DATE { get; set; }
    }

    public class CSAT_INITIATED_SUMMARY
    {
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int? PORTFOLIO_ID { get; set; }
    }
    public class CSAT_RECEIVED_SUMMARY
    {
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public string SURVEY_ID { get; set; }
        public int RATING { get; set; }
    }

    public class CSAT_SURVEY_DATA_PERIODWISE : CSAT_SURVEY_DATA
    {
        public string YEAR_QUARTER { get; set; }

    }

    public class CSAT_SURVEY_DATA_PERIODWISE_MONTHLY
    {
        public int ID { get; set; }
        public int CSAT_MONTH { get; set; }
        public int CSAT_YEAR { get; set; }
        public string CLIENT_EMAIL_ID { get; set; }
        public string CLIENT_NAME { get; set; }
        public string STATUS { get; set; }
        public DateTime? INITIATED_DATE { get; set; }
        public DateTime? SUBMISSION_DATE { get; set; }
        public string YEAR_MONTH { get; set; }
        public string YEAR_QUARTER { get; set; }
    }

}
