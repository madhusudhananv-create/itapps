using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class PRODUCT_SERVICE_LEVEL_METRICS
    {
        public int ID { get; set; }
        public int REFERENCE_ID { get; set; }
        public int SERVICE_AREA_TYPE_ID { get; set; }
        public int SLA_CATEGORY_ID { get; set; }
        public int SERVICE_LEVEL_TYPE_ID { get; set; }
        public string SERVICE_LEVEL_METRIC_DESCRIPTION { get; set; }
        public string RISK_POOL_ALLOCATION { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
}
