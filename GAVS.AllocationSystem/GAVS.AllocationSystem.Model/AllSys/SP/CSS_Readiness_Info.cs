using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys.SP
{
    public class CSS_Readiness_Info
    {
        public string CUST_NM { get; set; }
        public string PROJ_NM { get; set; }
        public int HEAD_COUNT { get; set; }
        public string START_DATE { get; set; }
        public string END_DATE { get; set; }
        public string CSS_Eligible { get; set; }
        public string Reason { get; set; }

        public string CSS_CONFIGURED { get; set; }
        public string CUSTOMER_CONTACT_VERIFICATION { get; set; }
        public string VERIFIED_BY { get; set; }
        public string APPROVAL_DATE { get; set; }
        public string RESPONDENT_NAME { get; set; }
        public string RESPONDENT_MAIL { get; set; }
        public string PROJ_STATUS { get; set; }
        public string PROJECT_TYPE { get; set; }
        public string BUSINESS_UNIT { get; set; }
        public string DEPARTMENT { get; set; }

        public string PROJECT_GROUP { get; set; }

        public string CONTRACTING_UNIT { get; set; }
        public string REVENUE_TYPE { get; set; }
        public string COUNTRY { get; set; }
        public string METHODOLOGY { get; set; }
        public string ACCOUNT_OWNER { get; set; }
        public string PM { get; set; }
        public string CSM { get; set; }
        public string PM_MAIL { get; set; }
        public string CSM_MAIL { get; set; }
        public string ACCOUNT_MANAGER { get; set; }

        public string AM_MAIL { get; set; }
        public string BU_HEAD { get; set; }
        public string BU_MAIL { get; set; }
        public string QUALITY_SPOC { get; set; }
        public string REVIEWER_MAIL { get; set; }
        public string SKIP_CSAT { get; set; }
        public string SKIP_CSAT_COMMENTS { get; set; }
        public string PROJ_ID { get; set; }
        public string CUST_ID { get; set; }

        public int? BATCH_ID { get; set; }
        public int? BATCH_MONTHLY_ID { get; set; }

        //public int? BATCH_CUSTOMER_ID { get; set; }
        //public int? BATCH_CUSTOMER_MONTHLY_ID { get; set; }


    }
}
