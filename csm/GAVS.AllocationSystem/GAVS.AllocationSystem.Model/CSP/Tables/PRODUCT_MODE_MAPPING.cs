using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GAVS.AllocationSystem.Model.Base;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PRODUCT_MODE_MAPPING : EntityBase
    {
        //public int ID { get; set; }
        public int PRODUCT_ID { get; set; }
        public int MODE_ID { get; set; }
        public int SERVICE_AREA_TYPE_ID { get; set; }
       // public Boolean ISACTIVE { get; set; }
    }

    public class MODE_KPI_MAPPING
    {
        public int ID { get; set; }

        public int MODE_ID { get; set; }

        public int KPI_ID { get; set; }

        public Boolean ISACTIVE { get; set; }
    }
        

    public class TIER_LEVEL_MATRIX
    {
        public int ID { get; set; }
        public string TIER_LEVEL { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
        
    
}
