using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class KPI2PRODUCT_SERVICE_LEVEL_METRICS : EntityBase
    {
        
        public int KPI_ID { get; set; }
        public int PRODUCT_SERVICE_LEVEL_METRICS_ID { get; set; }
        public int? MASTER_ID { get; set; }
    }
}
