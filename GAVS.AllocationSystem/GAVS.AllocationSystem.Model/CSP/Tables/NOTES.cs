using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class NOTES
    {
        public int ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        
        public string PROJECT_ID { get; set; }

        public int PORTFOLIO_ID { get; set; }
        public string SERVICE_AREA { get; set; }
        public string CATEGORY { get; set; }
        public string DESCRIPTION { get; set; }

        public DateTime PUBLISH_DATE { get; set; }

        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
}
