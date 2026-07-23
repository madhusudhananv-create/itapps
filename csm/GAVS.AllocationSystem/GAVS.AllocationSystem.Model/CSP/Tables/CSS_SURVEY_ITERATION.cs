using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CSS_SURVEY_ITERATION : EntityBase
    {
      
        public int BATCH_CUSTOMERS_ID { get; set; }
        public int BATCH_CUSTOMER_MONTHLY_ID { get; set; }
        public string SURVEY_ID { get; set; }
        public DateTime SURVEY_SENT_DATE { get; set; }
        public DateTime? SURVEY_RECEIVED_DATE { get; set; }
        public string STATUS { get; set; }

        public int? VALIDITY_DAYS { get; set; }
     
        
    }
}
