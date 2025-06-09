using GAVS.AllocationSystem.Model.Base;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_ACTIONITEM : EntityBase
    {
      
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string RAG { get; set; }

        public string DESCRIPTION { get; set; }
        public string SOURCE { get; set; }

        public string SOURCE_DESCRIPTION { get; set; }
        public string OWNER { get; set; }
        public string PRIORITY { get; set; }
        public DateTime IDENTIFIED_DATE { get; set; }
        public DateTime? TARGET_DATE { get; set; }
        public string STATUS { get; set; }
        public DateTime? COMPLETION_DATE { get; set; }
        public string COMMENTS { get; set; }
        public int? BATCH_CUSTOMER_ID { get; set; }
        public int? BATCH_CUSTOMER_MONTHLY_ID { get; set; }
        public int? RISK_ID { get; set; }
        public string ORIGINAL_DESCRIPTION { get; set; }
        public DateTime? PLANNED_TARGET_DATE { get; set; }
        public DateTime? PLANNED_ACTUAL_DATE { get; set; }     
        public string ACTION_TYPE { get; set; }
        public string PORTFOLIO { get; set; }
        public string ACTION_PLAN { get; set; }
        public string ROOT_CAUSE { get; set; }
        [NotMapped]
        public string CSS_REFERENCE { get; set; }
        [NotMapped]
        public string CUSTOMER_REMARKS { get; set; }
        [NotMapped]
        public int? SCORE { get; set; }
    }
}
