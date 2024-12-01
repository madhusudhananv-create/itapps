using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
   public class PRODUCTS_SLA_CATEGORY
    {
        public int ID { get; set; }
        public int SERVICE_AREA_TYPE_ID { get; set; }
        public string SLA_CATEGORY { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
}
