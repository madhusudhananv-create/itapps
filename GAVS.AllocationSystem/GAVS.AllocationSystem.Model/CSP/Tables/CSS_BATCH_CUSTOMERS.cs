using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CSS_BATCH_CUSTOMERS : EntityBase, iBatchCustomer
    {
        [Key]
        public int ID { get; set; }
        public int BATCH_ID { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int QUESTION_MODEL_ID { get; set; }
        public string EMAIL_ID { get; set; }
        public string DISPLAY_NAME { get; set; }
        public bool PROCESS_STOP { get; set; }
        public string PROCESS_ENABLED_BY { get; set; }
        public DateTime? PROCESS_ENABLED_DATE { get; set; }
        public string PROCESS_DISABLED_BY { get; set; }
        public DateTime? PROCESS_DISABLED_DATE { get; set; }
        public int? SURVEY_ID { get; set; }
        public int? PROD_ID { get; set; }
        public DateTime? SURVEY_SENT_DATE { get; set; }
        public DateTime? SURVEY_RECEIVED_DATE { get; set; }
        public string STATUS { get; set; }
        public bool ISACTIVE { get; set; }
        public bool IS_VERIFIED { get; set; }
        public string COMMENTS { get; set; }
        public string ENTERED_BY { get; set; }
        public DateTime? MEETING_DATE { get; set; }
        public bool? CSM_NOTIFIED { get; set; }

        public string SPOC { get; set; }
        [NotMapped]
        public decimal? PREDICTED_SCORE { get; set; }
        [NotMapped]
        public string PREDICTED_REASON { get; set; }
        [NotMapped]
        public string REMARKS { get; set; }

        [NotMapped]
        public int BATCH_MONTHLY_ID { get; set; }

        [NotMapped]
        public string CONTACT_ROLE { get; set; }

    }
    [NotMapped]
    public class CSS_BATCH_CUSTOMERS_EXTENDED : CSS_BATCH_CUSTOMERS
    {
        public string CUST_NM { get; set; }
        public string PROJ_NM { get; set; }
        public string PROJ_STATUS { get; set; }
        public string csm { get; set; }
        public string URL { get; set; }
        public string APPROVER { get; set; }
        public string CONTRACTING_UNIT { get; set; }
        public string CONTACT_ROLE { get; set; }
        public string REVENUE_TYPE { get; set; }

        public string BUSINESS_UNIT { get; set; }

    }

}
